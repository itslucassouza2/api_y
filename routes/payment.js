const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const { latamCheckout } = require("../services/latam");
const { API_CONFIG } = require("../configs/api");
const { middlewareValidarJWT } = require("../middleware/auth");

//===============================================//
//           API para pagamento                  //
//===============================================//


router.post("/pay", middlewareValidarJWT, async (req, res, next) => {
  const { items, ...body } = req.body;

  try {
    // buscar os produtos
    // calcular o valor total * quantidade

    const paymentMethod = req.body.paymentMethod;
    const count = items.length;
    const user = req.user.userId;

    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      }

      conn.query(
        //busca ultimo id orders
        "SELECT id_order FROM orders ORDER BY orders.id_order DESC limit 1",
        async (error, resultado1, field) => {
          if (error) {
            return res.status(500).send({ error: error });
          }
          const lastID = resultado1[0].id_order;
          const newID = lastID + 1;
          const orderInitialStatus = "waiting-payment";
          const insertPromise = [];
          const productsPromise = [];

          for (var i = 0; i < count; i++) {
            const idProduct_insert = items[i].productId;
            const quantity_insert = items[i].quantity;

            const ordersInsertPromise = new Promise((resolve, reject) => {
              conn.query(
                "INSERT INTO orders(id_order, clientes_id_cliente, estoque_id_product, quantidade, metodo_pgto, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
                [
                  newID,
                  user,
                  idProduct_insert,
                  quantity_insert,
                  paymentMethod,
                  orderInitialStatus,
                ],
                (error) => {
                  if (error) {
                    reject(error);
                    return res.status(500).send({ error: error });
                  }
                  resolve();
                }
              );
            });

            const productsQueryPromise = new Promise((resolve, reject) => {
              conn.query(
                "select id_product, preco from estoque where id_product = ?",
                [idProduct_insert],
                (error, productResult) => {
                  if (error) {
                    console.error(error);
                    return reject(error);
                  }

                  resolve(productResult[0]);
                }
              );
            });

            insertPromise.push(ordersInsertPromise);
            productsPromise.push(productsQueryPromise);
          }

          await Promise.all(insertPromise);
          const productsQueryResult = await Promise.all(productsPromise);

          const totalOrderAmount = productsQueryResult.reduce((prev, curr) => {
            const { quantity } = items.find(
              (product) => product.productId === curr.id_product
            );

            return prev + curr.preco * quantity;
          }, 0);

          const requestBody = {
            order: {
              ...body,
              code: newID,
              value: totalOrderAmount.toFixed(1),
              additional_info: "Compra YIYI Games",
              notification_url: `${API_CONFIG.domain}/payments/notification`,
            },
          };

          conn.release();

          console.log(requestBody);
          const response = await latamCheckout(requestBody);
          return res.status(200).json({ ...response.data, id_order: newID });
        }
      );
    });
  } catch (error) {
    if (error.response) {
      console.error(error.response.data);
    }

    return res.status(500).json(error.message);
  }
});

router.post("/notification", async (req, res) => {
  /**
   * {
      "latam_id": "7c0b8129-f556-4357-bb6e-8189c2943024",
      "code": "88",
      "status": "paid"
    }
   */
  const { code, status } = req.body;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    if (status == 'paid') {
      const sql = `SELECT estoque_id_product, quantidade FROM orders WHERE id_order = ? `;
      conn.query(
        sql,
        [code],
        function (error, results, fields) {
          if (error) {
            return res.status(500).send({ error: error });
          }
          const count = results.length;
          if (count > 0) {
            for (var i = 0; i < count; i++) {
              const id_product = results[i].estoque_id_product;
              const qtd = results[i].quantidade;

              const sql = `UPDATE codes SET soldA = NOW(), id_order = ?, updateAt = NOW(), reserved= "yes", open_code = 0 WHERE estoque_id_product = ? AND id_order = '' LIMIT ? ORDER BY id_code ASC`;
              conn.query(
                sql,
                [code, id_product, qtd],
                function (error, results, fields) {
                  if (error) {
                    return res.status(500).send({ error: error });
                  }
                }
              );

            }
          }
        }
      );

    }

    conn.query(
      "update orders set status = ? and updateAt = NOW() where id_order = ?",
      [status, code],
      (err, results) => {
        if (err) {
          return res.status(500).send({ error: error });
        }
      }
    );

    conn.release();
  });

  return res.status(200).json();
});

router.get("/check-status/:id_order", middlewareValidarJWT, (req, res) => {
  const { id_order } = req.params;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "select id_order, status from orders where id_order = ? limit 1",
      [id_order],
      (err, results) => {
        if (err) {
          return res.status(500).send({ error: err });
        }

        return res.status(200).json(results[0])
      }
    );
  });
});

module.exports = router;
