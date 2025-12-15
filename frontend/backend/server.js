require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Conexão
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado com sucesso"))
  .catch((err) => console.error("Erro ao conectar no MongoDB:", err));

app.get("/", (req, res) => {
  res.send("API funcionando!");
});

// Rotas
app.use("/transactions", transactionRoutes);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
