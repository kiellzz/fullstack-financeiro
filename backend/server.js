require("dotenv").config();  // Carregar variáveis de ambiente do .env
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Configurações de middlewares
app.use(cors()); // Habilita CORS
app.use(express.json()); // Para lidar com requisições JSON

// Conexão com MongoDB
mongoose
  .connect(process.env.MONGO_URI) // Usa a URI de conexão no .env
  .then(() => console.log("MongoDB conectado com sucesso"))
  .catch((err) => console.error("Erro ao conectar no MongoDB:", err));

// Teste simples para checar se a API está funcionando
app.get("/", (req, res) => {
  res.send("API funcionando!");
});

// Rotas de transações
app.use("/transactions", transactionRoutes);

// Inicia o servidor na porta 3000
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
