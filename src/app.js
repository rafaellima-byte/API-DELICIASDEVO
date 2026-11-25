const express = require('express');

const authRoutes = require('./routes/authRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
// const produtoRoutes = require('./routes/produtoRoutes');
// const clienteRoutes = require('./routes/clienteRoutes');
// const pedidoRoutes = require('./routes/pedidoRoutes');
// const itemPedidoRoutes = require('./routes/itemPedidoRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).json({
    projeto: 'API REST - Delícias de Vó',
    status: 'Online',
    rotasPrincipais: ['/auth', '/categorias', '/produtos', '/clientes', '/pedidos', '/itens-pedido'],
  });
});

app.use('/auth', authRoutes);
app.use('/categorias', categoriaRoutes);
// app.use('/produtos', produtoRoutes);
// app.use('/clientes', clienteRoutes);
// app.use('/pedidos', pedidoRoutes);
// app.use('/itens-pedido', itemPedidoRoutes);

app.use((req, res) => {
  return res.status(404).json({ erro: 'Rota não encontrada.' });
});

module.exports = app;