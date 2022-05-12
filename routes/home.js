const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const { loadImagesFromS3 } = require("../helpers/load-images");

//==========================================================================================================//
//                  Na tela inicial exibir na categoria os produtos mais vendidos                           //
//     e quando o usuario estiver logado vai exibir o produto que ele mais comprou ou colocou na wishlist   //
//      OBS! nas categorias só podem exibir categorias que possuirem mais de 5 produtos                     //
//             API DO USUÁRIO LOGADO AINDA ESTOU DESENVOLVENDO, AJUSTANDO COM A AUTENTICAÇÃO                //
//==========================================================================================================//

/*

+++++++++++++
SUBCATEGORIAS
+++++++++++++

1 => PlayStation
2 => Nintendo
3 => Microsoft
5 => Steam
6 => Riot Games
7 => ITunes
8 => Google Play
9 => Free Fire
10 => Netflix
11 => Roblox
12 => IMVU
13 => Spotify
14 => Deezer
15 => DAZN
16 => Ifood
17 => Uber
18 => MineCraft

*/

//=============================================//
//       ROTAS /categoria e /maisvendidos      //
//=============================================//

router.get("/", (req, res, next) => {
    const id_product = req.params.id_product;

    try {
        mysql.getConnection((error, conn) => {
            if (error) {
                return res.status(500).send({ error: error });
            }
            conn.query(
                `SELECT subcategorias_produtos_id_subcat, titulo, bannerUrl FROM home_categorias ORDER BY id_categoria ASC`,
                (error, resultado1, fields) => {
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const titulo_categoria = [
                        resultado1[0].titulo,
                        resultado1[1].titulo,
                        resultado1[2].titulo,
                        resultado1[3].titulo,
                    ];
                    const descricao_categoria = [
                        resultado1[0].descricao,
                        resultado1[1].descricao,
                        resultado1[2].descricao,
                        resultado1[3].descricao,
                    ];
                    const subcategorias_produtos_id_subcat_categoria = [
                        resultado1[0].subcategorias_produtos_id_subcat,
                        resultado1[1].subcategorias_produtos_id_subcat,
                        resultado1[2].subcategorias_produtos_id_subcat,
                        resultado1[3].subcategorias_produtos_id_subcat,
                    ];
                    const bannerUrl_categoria = [
                        resultado1[0].bannerUrl,
                        resultado1[1].bannerUrl,
                        resultado1[2].bannerUrl,
                        resultado1[3].bannerUrl,
                    ];

                    var sql =
                        "SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, desconto, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? limit 4;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, desconto, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? limit 4;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, desconto, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? limit 4;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, desconto, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? limit 4;";
                    conn.query(
                        sql,
                        [
                            subcategorias_produtos_id_subcat_categoria[0],
                            subcategorias_produtos_id_subcat_categoria[1],
                            subcategorias_produtos_id_subcat_categoria[2],
                            subcategorias_produtos_id_subcat_categoria[3],
                        ],
                        function (error, results, fields) {
                            if (error) {
                                return res.status(500).send({ error: error });
                            }

                            function applyImagesFromS3(results) {
                                return results.map((result) => ({
                                    ...result,
                                    mid_img_src: loadImagesFromS3(
                                        result.mid_img_src
                                    ),
                                    full_img_src: loadImagesFromS3(
                                        result.full_img_src
                                    ),
                                }));
                            }

                            const result0 = applyImagesFromS3(results[0]);
                            const result1 = applyImagesFromS3(results[1]);
                            const result2 = applyImagesFromS3(results[2]);
                            const result3 = applyImagesFromS3(results[3]);

                            res.status(200).send([
                                {
                                    title: titulo_categoria[0],
                                    descricao: descricao_categoria[0],
                                    categoria:
                                        subcategorias_produtos_id_subcat_categoria[0],
                                    bannerUrl: loadImagesFromS3(
                                        bannerUrl_categoria[0]
                                    ),
                                    items: result0,
                                },
                                {
                                    title: titulo_categoria[1],
                                    descricao: descricao_categoria[1],
                                    categoria:
                                        subcategorias_produtos_id_subcat_categoria[1],
                                    bannerUrl: loadImagesFromS3(
                                        bannerUrl_categoria[1]
                                    ),
                                    items: result1,
                                },
                                {
                                    title: titulo_categoria[2],
                                    descricao: descricao_categoria[2],
                                    categoria:
                                        subcategorias_produtos_id_subcat_categoria[2],
                                    bannerUrl: loadImagesFromS3(
                                        bannerUrl_categoria[2]
                                    ),
                                    items: []
                                },
                                {
                                    title: titulo_categoria[3],
                                    descricao: descricao_categoria[3],
                                    categoria:
                                        subcategorias_produtos_id_subcat_categoria[3],
                                    bannerUrl: loadImagesFromS3(
                                        bannerUrl_categoria[3]
                                    ),
                                    items: result3,
                                },
                            ]);
                            conn.release();
                        }
                    );
                }
            );
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send({ error: e });
    }
});

router.get("/maisvendidos", (req, res, next) => {
    const id_product = req.params.id_product;

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query(
            "SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, full_img_src FROM estoque WHERE qtd_vendido != '0' order by qtd_vendido DESC, updateAt DESC limit 12",
            (error, resultado, fields) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error });
                }
                res.status(200).send([
                    {
                        title: "Mais Vendidos",
                        items: resultado.map((data) => {
                            data.full_img_src = loadImagesFromS3(
                                data.full_img_src
                            );
                            return data;
                        }),
                    },
                ]);
            }
        );
    });
});

router.get("/bannermkt", (req, res, next) => {
    const id_product = req.params.id_product;

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query(
            "SELECT bannerSequence, bannerUrl, backgroundUrl FROM banner_mkt ORDER BY bannerSequence ASC;",
            (error, resultado, fields) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error });
                }
                res.status(200).send([
                    {
                        title: "Banner MKT",
                        items: resultado.map((result) => ({
                            ...result,
                            bannerUrl: loadImagesFromS3(result.bannerUrl),
                            backgroundUrl: loadImagesFromS3(result.backgroundUrl),
                        })),
                    },
                ]);
            }
        );
    });
});

module.exports = router;
