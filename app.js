const express = require("express");
const app = express();
const bodyParser = require("body-parser"); //
var cors = require("cors");

const rotaSearch = require("./routes/search");
const rotaInventory = require("./routes/inventory");
const rotaProduct = require("./routes/product");
const rotaMyPage = require("./routes/my_page"); // ROTA EM MANUTENÇÃO
//const rotaMyTastes = require('./routes/my_tastes'); // ROTA EM MANUTENÇÃO
const rotaHome = require("./routes/home");
const rotaPayment = require("./routes/payment");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.get("/", (req, res) => {
    res.json(["YiYi Games - 2022"]);
});

app.use("/search", rotaSearch);
app.use("/product", rotaProduct);
app.use("/inventory", rotaInventory);
app.use("/my_page", rotaMyPage);
app.use("/home", rotaHome);
app.use("/payments", rotaPayment);

module.exports = app;
