const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;


//===============================================//
//           API para área admin                 //
//===============================================//


router.get('/view/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error })
        }
        conn.query(
            'SELECT * FROM estoque ORDER BY nome ASC',
            (error, resultado, fields) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error })
                }
                res.status(200).send({ response: resultado });
            }
        )
    });
});


router.post('/insert/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error })
        }
        conn.query(
            'INSERT INTO estoque (nome, sku, categorias_produtos_id_cat, subcategorias_produtos_id_subcat, paises_produtos_id_pais, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
            [
                req.body.nome,
                req.body.sku,
                req.body.categorias_produtos_id_cat,
                req.body.subcategorias_produtos_id_subcat,
                req.body.paises_produtos_id_pais
            ],
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error })
                }
                res.status(201).send({
                    mensagem: 'Produto foi inserido no estoque!',
                    id_product: resultado.insertId
                });
            }
        )
    });
});

router.patch('/update/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error })
        }
        conn.query(
            `UPDATE estoque
                SET qtd_estoque     = ? 
                WHERE id_product    = '?'
            ` ,
            [
                req.body.qtd_estoque,
                req.body.id_product
            ],
            (error, resultado, field) => {
                conn.release();
                if (error) {
                    return res.status(500).send({ error: error })
                }
                res.status(202).send({
                    mensagem: 'Produto foi alterado no estoque!'
                });
            }
        )
    });
});

module.exports = router;