const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const { loadImagesFromS3 } = require("../helpers/load-images");

//==================================================================//
//                              ROTAS                               //
//==================================================================//
//                                                                  //
// Rota 'search/'                                                   //
// Enviar via query quando existir:                                 //
//  -> marca                                                        //
//  -> tipo                                                         //
//  -> plataforma                                                   //
//  -> pais                                                         //
//  -> classificar {                                                //
//          Preço crescente -> ?classificar=precocrescente          //
//          Preço decrescente -> ?classificar=precodecrescente      //
//          Marca -> ?classificar=marca                             //
//          Promoções -> ?classificar=promocoes                     //
//     }                                                            //
//  -> currentPage  (pagina atual)                                  //
//  -> pageSize  (qtd itens por pág.)                               //
//                                                                  //
//==================================================================//

router.get("/", (req, res, next) => {
    const marca = req.query.marca;
    const tipo_n = req.query.tipo;
    const plataforma = req.query.plataforma;
    const pais = req.query.pais;
    const classificar = req.query.classificar;
    const sh = req.query.sh;

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

    if ( tipo_n == 1){
        tipo = 'Crédito';
    }
    if ( tipo_n == 2){
        tipo = 'Assinatura';
    }
    if ( tipo_n == null){
        tipo = null;
    }

    var ini = 1;

    function applyImagesFromS3(results) {
        return results.map((result) => ({
            ...result,
            mid_img_src: loadImagesFromS3(result.mid_img_src),
            full_img_src: loadImagesFromS3(result.full_img_src)
        }));
    }

    mysql.getConnection((error, conn) => {
        if (error) {
            try {
                conn.release();
            } catch (e) {
                console.error(e.message);
            }
            return res.status(500).send({ error: error });
        }

        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == null)&
            (sh == null)
        ) {
            res.status(200).send({});
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? ORDER BY id_product ASC LIMIT ?, ?",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }

        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? ORDER BY id_product ASC LIMIT ?, ?",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }

        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(*) as countProducts FROM estoque WHERE categorias_produtos_id_cat = ? ORDER BY id_product ASC ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? ORDER BY id_product ASC LIMIT ?, ?",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT ?, ?",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY id_product ASC LIMIT ?, ?",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC LIMIT ?, ?",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT ?, ?",
                [
                    tipo,
                    plataforma,
                    pais,
                    tipo,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT ?, ?",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC LIMIT ?, ?",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT ?, ?",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT ?, ?",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == null)&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT ?, ?",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }

        /// precocrescente
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? ORDER BY preco ASC LIMIT ?, ?",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? ORDER BY preco ASC LIMIT ?, ?",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? ORDER BY preco ASC LIMIT ?, ?",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT ?, ?",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY preco ASC LIMIT ?, ?",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY preco ASC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY preco ASC LIMIT ?, ?",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT ?, ?",
                [
                    tipo,
                    plataforma,
                    pais,
                    tipo,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT ?, ?",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY preco ASC LIMIT ?, ?",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT ?, ?",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT ?, ?",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT ?, ?",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }

        // precodecrescente

        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? ORDER BY preco DESC LIMIT ?, ?",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? ORDER BY preco DESC LIMIT ?, ?",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE categorias_produtos_id_cat = ? ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? ORDER BY preco DESC LIMIT ?, ?",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque paises_produtos_id_pais = ? ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT ?, ?",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY preco DESC LIMIT ?, ?",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY preco DESC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY preco DESC LIMIT ?, ?",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT ?, ?",
                [
                    tipo,
                    plataforma,
                    pais,
                    tipo,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT ?, ?",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY preco DESC LIMIT ?, ?",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT ?, ?",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT ?, ?",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT ?, ?",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }

        //marca

        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [
                    tipo,
                    plataforma,
                    pais,
                    tipo,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "marca")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT ?, ?",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        //promocoes

        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? ORDER BY desconto ASC LIMIT ?, ?",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? ORDER BY desconto ASC LIMIT ?, ?",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque estoque WHERE categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? ORDER BY desconto ASC LIMIT ?, ?",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT ?, ?",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY desconto ASC LIMIT ?, ?",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY desconto ASC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT ?, ?",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY desconto ASC LIMIT ?, ?",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT ?, ?",
                [tipo, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT ?, ?",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY desconto ASC LIMIT ?, ?",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT ?, ?",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT ?, ?",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh == null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM estoque WHERE categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT ?, ?",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }

                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );

                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }

        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }

        

        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(*) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? ORDER BY id_product ASC ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC LIMIT ?, ?",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    plataforma,
                    pais,
                    tipo,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT ?, ?",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == null)&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY id_product ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        
        /// precocrescente
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? ORDER BY preco ASC LIMIT ?, ?",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    plataforma,
                    pais,
                    tipo,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precocrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        
        // precodecrescente
        
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ? ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY preco DESCLIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY preco DESC LIMIT ?, ?",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    plataforma,
                    pais,
                    tipo,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "precodecrescente")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY preco DESC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        
        //marca
        
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    plataforma,
                    pais,
                    tipo,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "marca")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY subcategorias_produtos_id_subcat ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        //promocoes
        
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, tipo, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [pais, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma == null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, marca, tipo, marca, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    tipo,
                    marca,
                    plataforma,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND  subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    tipo,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, plataforma, tipo, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo != null) &
            (marca == null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND tipo_produto = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [tipo, pais, tipo, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais == null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, plataforma, marca, plataforma, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [
                    marca,
                    plataforma,
                    pais,
                    marca,
                    plataforma,
                    pais,
                    ini,
                    qtd_results_pg,
                ],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca != null) &
            (plataforma == null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND subcategorias_produtos_id_subcat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [marca, pais, marca, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }
        if (
            (tipo == null) &
            (marca == null) &
            (plataforma != null) &
            (pais != null) &
            (classificar == "promocoes")&
            (sh != null)
        ) {
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
        
            if ( tipo_n == 1){
                tipo = 'Crédito';
            }
            if ( tipo_n == 2){
                tipo = 'Assinatura';
            }
            if ( tipo_n == null){
                tipo = null;
            }
        
            var ini = 1;
            ini = pag * qtd_results_pg - qtd_results_pg;
            conn.query(
                "SELECT count(id_product) as countProducts FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ?;SELECT id_product, nome, paises_produtos_id_pais, categorias_produtos_id_cat, preco, mid_img_src, full_img_src FROM  estoque WHERE nome LIKE '%"+ sh +"%' AND categorias_produtos_id_cat = ? AND paises_produtos_id_pais = ? ORDER BY desconto ASC LIMIT " + ini + ", " + qtd_results_pg + ";",
                [plataforma, pais, plataforma, pais, ini, qtd_results_pg],
                (error, resultado, fields) => {
                    try {
                        conn.release();
                    } catch (e) {
                        console.error(e.message);
                    }
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
        
                    const pageCount = Math.ceil(
                        resultado[0][0].countProducts / qtd_results_pg
                    );
        
                    res.status(200).send({
                        items: applyImagesFromS3(resultado[1]),
                        paging: {
                            totalItems: resultado[0][0].countProducts,
                            currentPage: pag,
                            pageSize: qtd_results_pg,
                            pageCount: pageCount,
                        },
                    });
                }
            );
        }

        try {
            try {
                conn.release();
            } catch (e) {
                console.error(e.message);
            }
        } catch (e) {
            console.error(e.message);
        }
    });
});

router.get("/header/:busca", (req, res, next) => {
    const query_sql =
        "SELECT nome, id_product FROM estoque WHERE nome LIKE '%" +
        req.params.busca +
        "%';";

    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        conn.query(query_sql, (error, resultado, fields) => {
            try {
                conn.release();
            } catch (e) {
                console.error(e.message);
            }
            if (error) {
                return res.status(500).send({ error: error });
            }
            res.status(200).send([resultado]);
        });
    });
});

module.exports = router;
