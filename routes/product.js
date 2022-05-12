const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const { loadImagesFromS3 } = require("../helpers/load-images");

//================================================//
//           ROTAS /full e /recomendado           //
//================================================//
//                                                //
// Rota /full obrigatório enviar                  //
//  -> ?idP=${id_product}&idC=${id_cliente}       //
//                                                //
// se productOnWishlit: 1                         //
// existe o produto na wishlist                   //
//                                                //
// se productOnWishlit: 1                         //
// não existe o produto na wishlist               //
//                                                //
//================================================//

// var whitelist = ['http://localhost:3000', 'http://localhost:3311']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// app.use(cors(corsOptions));

//ROTA PARA PRODUTO FULL
router.get("/full", (req, res, next) => {
    const id_product = req.query.idP;
    const id_cliente = req.query.idC;

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query(
            `SELECT id_wishlist FROM wishlist WHERE clientes_id_cliente = ? AND estoque_id_product = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, descricao_produto, resgatar_produto, preco, desconto, promocao_expira, full_img_src, bg_product FROM estoque WHERE id_product = ? limit 1; SELECT NOW() AS now`,
            [id_cliente, id_product, id_product],
            (error, resultado, fields) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error });
                }
                if (resultado[0] == 0) {
                    id_wishlist = null;
                }
                if (resultado[0] != 0) {
                    id_wishlist = resultado[0][0].id_wishlist;
                }

                const productFull = resultado[1].map((result) => ({
                    ...result,
                    bg_product: loadImagesFromS3(result.bg_product),
                    full_img_src: loadImagesFromS3(result.full_img_src),
                }));

                res.status(200).send({
                    id_wishlist: id_wishlist,
                    serverTime: resultado[2][0].now,
                    produto_full: productFull,
                });
            }
        );
    });
});

//ROTA PARA PRODUTOS RECOMENDADOS MID
router.get("/recomendados/:id_product", (req, res, next) => {
    const id_product = req.params.id_product;

    let subcategorias_produtos_id_subcat = "";

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query(
            `SELECT subcategorias_produtos_id_subcat FROM estoque WHERE id_product = ? limit 1`,
            [id_product],
            (error, resultado1, fields) => {
                if (error) {
                    return res.status(500).send({ error: error });
                }
                subcategorias_produtos_id_subcat =
                    resultado1[0].subcategorias_produtos_id_subcat;
                conn.query(
                    `SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? and id_product != ? order by qtd_vendido DESC, updateAt DESC limit 4`,
                    [subcategorias_produtos_id_subcat, id_product],
                    (error, resultado, fields) => {
                        conn.release();
                        if (error) {
                            return res.status(500).send({ error: error });
                        }

                        const result = resultado.map((result) => ({
                            ...result,
                            mid_img_src: loadImagesFromS3(result.mid_img_src),
                            full_img_src: loadImagesFromS3(result.full_img_src),
                        }));

                        res.status(200).send({ recomendados: result });
                    }
                );
            }
        );
    });
});

router.get("/:id_product", (req, res, next) => {
    const id_product = req.params.id_product;
    let subcategorias_produtos_id_subcat = "";

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }

        conn.query(
            `SELECT subcategorias_produtos_id_subcat FROM estoque WHERE id_product = ? limit 1`,
            [id_product],
            (error, resultado1, fields) => {
                if (error) {
                    return res.status(500).send({ error: error });
                }
                subcategorias_produtos_id_subcat =
                    resultado1[0].subcategorias_produtos_id_subcat;

                var sql =
                    "SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, descricao_produto, resgatar_produto, preco, desconto, promocao_expira, full_img_src, bg_product FROM estoque WHERE id_product = ? limit 1;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? and id_product != ? order by qtd_vendido DESC, updateAt DESC limit 4";

                conn.query(
                    sql,
                    [id_product, subcategorias_produtos_id_subcat, id_product],
                    function (error, results, fields) {
                        if (error) {
                            return res.status(500).send({ error: error });
                        }
                        res.status(200).send([
                            {
                                produto_full: results[0],
                                recomendados: results[1],
                            },
                        ]);
                        conn.release();
                    }
                );
            }
        );
    });
});

module.exports = router;
