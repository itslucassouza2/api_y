require("dotenv/config");
const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const { middlewareValidarJWT } = require("../middleware/auth");
const { loadImagesFromS3 } = require("../helpers/load-images");

//==================================================================//
//                              ROTAS                               //
//==================================================================//
//                                                                  //
// Rota /user_wishlist/ retorna todos os produtos ja favoritados    //
//                                                                  //
// Enviar via query:                                                //
//  -> id_cliente (Obrigatório)                                     //
//  -> classificar {                                                //
//          data decrescente -> ?classificar=data                   //
//          promocao decrescente -> ?classificar=promocao           //
//          marca -> ?classificar=marca                             //
//     }                                                            //
//  -> currentPage  (pagina atual)                                  //
//  -> pageSize  (qtd itens por pág.)                               //
//                                                                  //
//==================================================================//
//                                                                  //
// Rota /user_wishlist/insert/                                      //
// POST dos produtos favoritos                                      //
// req. via body :                                                  //
//      -> id_cliente (Obrigatório)                                 //
//      -> id_product (Obrigatório)                                 //
//                                                                  //
//==================================================================//
//                                                                  //
// Rota user_wishlist/remove/${id_wishlist}                         //
// Delete produto favorito                                          //
// Enviar via params:                                               //
//      -> id_wishlist (Obrigatório)                                //
//                                                                  //
//==================================================================//
//                                                                  //
// Rota /user_orders/ retorna                                       //
// orders vinculados ao cliente                                     //
// Enviar via query:                                                //
//      -> id_cliente (Obrigatório)                                 //
//                                                                  //
//==================================================================//
//                                                                  //
// Rota /user_codes/  retorna                                       //
// codes vinculados ao cliente                                      //
// Enviar via query:                                                //
//      -> id_cliente (Obrigatório)                                 //
//  -> classificar {                                                //
//          data decrescente -> ?classificar=compra                 //
//          produto crescente -> ?classificar=produto               //
//          marca crescente -> ?classificar=marca                   //
//     }                                                            //
//                                                                  //
//==================================================================//
//                                                                  //
// Rota /user_codes/update  patch                                   //
// atualizar status do resgate do codigo                            //
// Enviar via query:                                                //
//      -> id_code (Obrigatório)                                    //
//                                                                  //
//==================================================================//

// protect all routes with jwt
router.use(middlewareValidarJWT);

router.get("/user_wishlist/", (req, res, next) => {
    
    const id_cliente = req.user.userId;

    if (req.query.currentPage == null) {
        var pag = 1;
    }
    if (req.query.currentPage != null) {
        var pag = req.query.currentPage;
    }
    if (req.query.pageSize == null) {
        var qtd_results_pg = 8;
    }
    if (req.query.pageSize != null) {
        var qtd_results_pg = req.query.pageSize;
    }

    var ini = 1;

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        ini = pag * qtd_results_pg - qtd_results_pg;

        if (req.query.classify == null) {
            const sql = `SELECT count(id_wishlist) as countProducts FROM wishlist WHERE wishlist.clientes_id_cliente = ?;SELECT estoque.id_product, wishlist.id_wishlist, estoque.nome, estoque.desconto, estoque.preco, estoque.mid_img_src, estoque.full_img_src, estoque.subcategorias_produtos_id_subcat, estoque.paises_produtos_id_pais, wishlist.insertAt FROM wishlist INNER JOIN estoque on wishlist.estoque_id_product = estoque.id_product WHERE wishlist.clientes_id_cliente = ?  LIMIT ?, ?;`;
            conn.query(
                sql,
                [id_cliente, id_cliente, ini, qtd_results_pg],
                function (error, results, fields) {
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        results[0][0].countProducts / qtd_results_pg
                    );

                    const itemResults = results[1].map((item) => ({
                        ...item,
                        mid_img_src: loadImagesFromS3(item.mid_img_src),
                        full_img_src: loadImagesFromS3(item.full_img_src),
                    }));

                    res.status(200).send({
                        items: itemResults,
                        paging: {
                            totalItems: results[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                    conn.release();
                }
            );
        }
        if (req.query.classify == "data") {
            const sql = `SELECT count(id_wishlist) as countProducts FROM wishlist WHERE wishlist.clientes_id_cliente = ?;SELECT estoque.id_product, wishlist.id_wishlist, estoque.nome, estoque.desconto, estoque.preco, estoque.mid_img_src, estoque.full_img_src, estoque.subcategorias_produtos_id_subcat, estoque.paises_produtos_id_pais, wishlist.insertAt FROM wishlist INNER JOIN estoque on wishlist.estoque_id_product = estoque.id_product WHERE wishlist.clientes_id_cliente = ? ORDER BY wishlist.insertAt DESC LIMIT ?, ?;`;
            conn.query(
                sql,
                [id_cliente, id_cliente, ini, qtd_results_pg],
                function (error, results, fields) {
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        results[0][0].countProducts / qtd_results_pg
                    );

                    const itemResults = results[1].map((item) => ({
                        ...item,
                        mid_img_src: loadImagesFromS3(item.mid_img_src),
                        full_img_src: loadImagesFromS3(item.full_img_src),
                    }));

                    res.status(200).send({
                        items: itemResults,
                        paging: {
                            totalItems: results[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                    conn.release();
                }
            );
        }
        if (req.query.classify == "promocao") {
            const sql = `SELECT count(id_wishlist) as countProducts FROM wishlist WHERE wishlist.clientes_id_cliente = ?;SELECT estoque.id_product, wishlist.id_wishlist, estoque.nome, estoque.desconto, estoque.preco, estoque.mid_img_src, estoque.full_img_src, estoque.subcategorias_produtos_id_subcat, estoque.paises_produtos_id_pais, wishlist.insertAt FROM wishlist INNER JOIN estoque on wishlist.estoque_id_product = estoque.id_product WHERE wishlist.clientes_id_cliente = ? ORDER BY estoque.desconto DESC LIMIT ?, ?;`;
            conn.query(
                sql,
                [id_cliente, id_cliente, ini, qtd_results_pg],
                function (error, results, fields) {
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        results[0][0].countProducts / qtd_results_pg
                    );

                    const itemResults = results[1].map((item) => ({
                        ...item,
                        mid_img_src: loadImagesFromS3(item.mid_img_src),
                        full_img_src: loadImagesFromS3(item.full_img_src),
                    }));

                    res.status(200).send({
                        items: itemResults,
                        paging: {
                            totalItems: results[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                    conn.release();
                }
            );
        }
        if (req.query.classify == "marca") {
            const sql = `SELECT count(id_wishlist) as countProducts FROM wishlist WHERE wishlist.clientes_id_cliente = ?;SELECT estoque.id_product, wishlist.id_wishlist, estoque.nome, estoque.desconto, estoque.preco, estoque.mid_img_src, estoque.full_img_src, estoque.subcategorias_produtos_id_subcat, estoque.paises_produtos_id_pais, wishlist.insertAt FROM wishlist INNER JOIN estoque on wishlist.estoque_id_product = estoque.id_product WHERE wishlist.clientes_id_cliente = ? ORDER BY estoque.subcategorias_produtos_id_subcat ASC LIMIT ?, ?;`;
            conn.query(
                sql,
                [id_cliente, id_cliente, ini, qtd_results_pg],
                function (error, results, fields) {
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        results[0][0].countProducts / qtd_results_pg
                    );

                    const itemResults = results[1].map((item) => ({
                        ...item,
                        mid_img_src: loadImagesFromS3(item.mid_img_src),
                        full_img_src: loadImagesFromS3(item.full_img_src),
                    }));

                    res.status(200).send({
                        items: itemResults,
                        paging: {
                            totalItems: results[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                    conn.release();
                }
            );
        }
    });
});

router.post("/user_wishlist/insert/", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        const id_cliente = req.user.userId;
        conn.query(
            "SELECT id_wishlist as wishProduct FROM wishlist WHERE estoque_id_product = ? AND clientes_id_cliente = ?",
            [req.body.id_product, id_cliente],
            (error, resultado1, field) => {
                if (error) {
                    return res.status(500).send({ error: error });
                }

                if (resultado1.length == 0) {
                    conn.query(
                        "INSERT INTO wishlist (estoque_id_product, clientes_id_cliente, insertAt) VALUES (?, ?, NOW())",
                        [req.body.id_product, id_cliente],
                        (error, resultado, fields) => {
                            conn.release();
                            if (error) {
                                return res.status(500).send({ error: error });
                            }
                            res.status(201).send({
                                mensagem:
                                    "Produto foi inserido na lista de desejos!",
                            });
                        }
                    );
                }
                if (resultado1.length == 1) {
                    conn.release();
                    res.status(201).send({
                        mensagem: "Produto ja está na lista de desejos!",
                    });
                }
            }
        );
    });
});

router.delete("/user_wishlist/remove/:id_wishlist", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query(
            "DELETE FROM wishlist WHERE id_wishlist = ?",
            [req.params.id_wishlist],
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error });
                }
                res.status(201).send({
                    mensagem: "Produto foi removido da lista de desejos!",
                });
            }
        );
    });
});

router.get("/user_orders/", (req, res, next) => {
    const id_cliente = req.user.userId;
    

    if (req.query.currentPage == null) {
        var pag = 1;
    }
    if (req.query.currentPage != null) {
        var pag = req.query.currentPage;
    }
    if (req.query.pageSize == null) {
        var qtd_results_pg = 8;
    }
    if (req.query.pageSize != null) {
        var qtd_results_pg = req.query.pageSize;
    }

    var ini = 1;

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        ini = pag * qtd_results_pg - qtd_results_pg;

        const sql = `SELECT count(orders.id_order) as countProducts FROM orders where clientes_id_cliente = ?;SELECT orders.id_order , orders.createdAt, estoque.nome, orders.valor, orders.metodo_pgto, orders.status FROM orders INNER JOIN estoque ON orders.estoque_id_product = estoque.id_product where clientes_id_cliente = ? ORDER BY orders.createdAt DESC LIMIT ?, ?`;
        conn.query(
            sql,
            [id_cliente, id_cliente, ini, qtd_results_pg],
            function (error, results, fields) {
                if (error) {
                    return res.status(500).send({ error: error });
                }
                const pageCount = Math.ceil(
                    results[0][0].countProducts / qtd_results_pg
                );
                res.status(200).send({
                    items: results[1],
                    paging: {
                        totalItems: results[0][0].countProducts,
                        currentPage: pag,
                        pageSize: qtd_results_pg,
                        pageCount: pageCount,
                    },
                });
                conn.release();
            }
        );
    });
});

router.get("/user_codes/", (req, res, next) => {
    const id_cliente = req.user.userId;

    if (req.query.currentPage == null) {
        var pag = 1;
    }
    if (req.query.currentPage != null) {
        var pag = req.query.currentPage;
    }
    if (req.query.pageSize == null) {
        var qtd_results_pg = 8;
    }
    if (req.query.pageSize != null) {
        var qtd_results_pg = req.query.pageSize;
    }

    var ini = 1;

    function bUpdate(results) {
        return results.map((result) => ({
            ...result,
            isRedeemed: Boolean(result.isRedeemed),
        }));
    }

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }

        ini = pag * qtd_results_pg - qtd_results_pg;

        if (req.query.classificar == null) {
            const sql = `SELECT count(codes.id_order) as countProducts FROM codes where codes.id_cliente = ?;SELECT codes.id_code, codes.estoque_id_product as productId, estoque.nome as productName, estoque.mid_img_src as image, codes.open_code as isRedeemed, codes.id_order as orderId, codes.soldAt as soldAt, codes.license_code1 as licenseCode, estoque.categorias_produtos_id_cat as plataform, estoque.paises_produtos_id_pais as country FROM codes INNER JOIN estoque ON codes.estoque_id_product = estoque.id_product where codes.id_cliente = ? ORDER BY codes.updateAt DESC LIMIT ?, ?`;
            conn.query(
                sql,
                [id_cliente, id_cliente, ini, qtd_results_pg],
                function (error, results, fields) {
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        results[0][0].countProducts / qtd_results_pg
                    );

                    const result1 = bUpdate(results[1]);

                    res.status(200).send({
                        items: result1,
                        paging: {
                            totalItems: results[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                    conn.release();
                }
            );
        }
        if (req.query.classificar == "compra") {
            const sql = `SELECT count(codes.id_order) as countProducts FROM codes where codes.id_cliente = ?;SELECT codes.id_code, codes.estoque_id_product as productId, estoque.nome as productName, estoque.mid_img_src as image, codes.open_code as isRedeemed, codes.id_order as orderId, codes.soldAt as soldAt, codes.license_code1 as licenseCode, estoque.categorias_produtos_id_cat as plataform, estoque.paises_produtos_id_pais as country FROM codes INNER JOIN estoque ON codes.estoque_id_product = estoque.id_product where codes.id_cliente = ? ORDER BY codes.updateAt DESC LIMIT ?, ?`;
            conn.query(
                sql,
                [id_cliente, id_cliente, ini, qtd_results_pg],
                function (error, results, fields) {
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        results[0][0].countProducts / qtd_results_pg
                    );

                    const result1 = bUpdate(results[1]);

                    res.status(200).send({
                        items: result1,
                        paging: {
                            totalItems: results[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                    conn.release();
                }
            );
        }
        if (req.query.classificar == "produto") {
            const sql = `SELECT count(codes.id_order) as countProducts FROM codes where codes.id_cliente = ?;SELECT codes.id_code, codes.estoque_id_product as productId, estoque.nome as productName, estoque.mid_img_src as image, codes.open_code as isRedeemed, codes.id_order as orderId, codes.soldAt as soldAt, codes.license_code1 as licenseCode, estoque.categorias_produtos_id_cat as plataform, estoque.paises_produtos_id_pais as country FROM codes INNER JOIN estoque ON codes.estoque_id_product = estoque.id_product where codes.id_cliente = ? ORDER BY estoque.nome ASC LIMIT ?, ?`;
            conn.query(
                sql,
                [id_cliente, id_cliente, ini, qtd_results_pg],
                function (error, results, fields) {
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        results[0][0].countProducts / qtd_results_pg
                    );

                    const result1 = bUpdate(results[1]);

                    res.status(200).send({
                        items: result1,
                        paging: {
                            totalItems: results[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                    conn.release();
                }
            );
        }
        if (req.query.classificar == "marca") {
            const sql = `SELECT count(codes.id_order) as countProducts FROM codes where codes.id_cliente = ?;SELECT codes.id_code, codes.estoque_id_product as productId, estoque.nome as productName, estoque.mid_img_src as image, codes.open_code as isRedeemed, codes.id_order as orderId, codes.soldAt as soldAt, codes.license_code1 as licenseCode, estoque.categorias_produtos_id_cat as plataform, estoque.paises_produtos_id_pais as country FROM codes INNER JOIN estoque ON codes.estoque_id_product = estoque.id_product where codes.id_cliente = ? ORDER BY estoque.subcategorias_produtos_id_subcat ASC LIMIT ?, ?`;
            conn.query(
                sql,
                [id_cliente, id_cliente, ini, qtd_results_pg],
                function (error, results, fields) {
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        results[0][0].countProducts / qtd_results_pg
                    );

                    const result1 = bUpdate(results[1]);

                    res.status(200).send({
                        items: result1,
                        paging: {
                            totalItems: results[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                    conn.release();
                }
            );
        }
    });
});

router.patch("/user_codes/update", (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query(
            `UPDATE codes SET open_code = 1 WHERE id_code = ?`,
            [req.query.id_code],
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error });
                }
                res.status(202).send({
                    mensagem: "Status do código atualizado!",
                });
            }
        );
    });
});

module.exports = router;
