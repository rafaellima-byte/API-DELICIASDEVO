const prisma = require('../lib/prisma');

async function recalcularValorTotalPedido(pedidoId) {
  const itens = await prisma.itemPedido.findMany({ where: { pedidoId } });
  const valorTotal = itens.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0);

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { valorTotal: Number(valorTotal.toFixed(2)) },
  });
}

async function criar(req, res) {
  try {
    const { pedidoId, produtoId, quantidade, observacoes } = req.body;

    if (!pedidoId || !produtoId || !quantidade) {
      return res.status(400).json({ erro: 'Os campos pedidoId, produtoId e quantidade são obrigatórios.' });
    }

    const pedId = Number(pedidoId);
    const prodId = Number(produtoId);
    const qtd = Number(quantidade);

    if (Number.isNaN(pedId) || Number.isNaN(prodId) || Number.isNaN(qtd) || qtd <= 0) {
      return res.status(400).json({ erro: 'pedidoId e produtoId devem ser válidos e quantidade maior que zero.' });
    }

    const pedido = await prisma.pedido.findUnique({ where: { id: pedId } });
    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido informado não encontrado.' });
    }

    const produto = await prisma.produto.findUnique({ where: { id: prodId } });
    if (!produto) {
      return res.status(404).json({ erro: 'Produto informado não encontrado.' });
    }

    const item = await prisma.itemPedido.create({
      data: {
        pedidoId: pedId,
        produtoId: prodId,
        quantidade: qtd,
        precoUnitario: produto.preco,
        observacoes: observacoes ? String(observacoes).trim() : null,
      },
      include: {
        produto: true,
        pedido: true,
      },
    });

    await recalcularValorTotalPedido(pedId);

    return res.status(201).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao criar item do pedido.' });
  }
}

async function listarTodos(req, res) {
  try {
    const itens = await prisma.itemPedido.findMany({
      include: {
        produto: true,
        pedido: true,
      },
      orderBy: { id: 'asc' },
    });
    return res.status(200).json(itens);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao listar itens de pedido.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const item = await prisma.itemPedido.findUnique({
      where: { id },
      include: {
        produto: true,
        pedido: true,
      },
    });

    if (!item) {
      return res.status(404).json({ erro: 'Item do pedido não encontrado.' });
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao buscar item do pedido.' });
  }
}

async function atualizar(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const existente = await prisma.itemPedido.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Item do pedido não encontrado.' });
    }

    const { quantidade, observacoes } = req.body;

    if (quantidade !== undefined && (Number.isNaN(Number(quantidade)) || Number(quantidade) <= 0)) {
      return res.status(400).json({ erro: 'A quantidade deve ser um número maior que zero.' });
    }

    const item = await prisma.itemPedido.update({
      where: { id },
      data: {
        quantidade: quantidade !== undefined ? Number(quantidade) : existente.quantidade,
        observacoes: observacoes !== undefined ? (observacoes ? String(observacoes).trim() : null) : existente.observacoes,
      },
      include: {
        produto: true,
        pedido: true,
      },
    });

    await recalcularValorTotalPedido(existente.pedidoId);

    return res.status(200).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao atualizar item do pedido.' });
  }
}

async function excluir(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const existente = await prisma.itemPedido.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Item do pedido não encontrado.' });
    }

    await prisma.itemPedido.delete({ where: { id } });
    await recalcularValorTotalPedido(existente.pedidoId);

    return res.status(200).json({ mensagem: 'Item do pedido excluído com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao excluir item do pedido.' });
  }
}

module.exports = { criar, listarTodos, buscarPorId, atualizar, excluir };
