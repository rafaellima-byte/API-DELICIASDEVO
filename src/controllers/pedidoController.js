const prisma = require('../lib/prisma');

const STATUS_VALIDOS = ['PENDENTE', 'EM_PREPARO', 'PRONTO', 'CANCELADO'];

async function criar(req, res) {
  try {
    const { clienteId, status, observacoes } = req.body;

    if (!clienteId) {
      return res.status(400).json({ erro: 'O campo clienteId é obrigatório.' });
    }

    const cliId = Number(clienteId);
    if (Number.isNaN(cliId)) {
      return res.status(400).json({ erro: 'clienteId inválido.' });
    }

    const cliente = await prisma.cliente.findUnique({ where: { id: cliId } });
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente informado não encontrado.' });
    }

    const statusFinal = status ? String(status).toUpperCase() : 'PENDENTE';
    if (!STATUS_VALIDOS.includes(statusFinal)) {
      return res.status(400).json({
        erro: `Status inválido. Valores permitidos: ${STATUS_VALIDOS.join(', ')}.`,
      });
    }

    const pedido = await prisma.pedido.create({
      data: {
        clienteId: cliId,
        status: statusFinal,
        valorTotal: 0,
        observacoes: observacoes ? String(observacoes).trim() : null,
      },
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    });

    return res.status(201).json(pedido);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao criar pedido.' });
  }
}

async function listarTodos(req, res) {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
      orderBy: { id: 'desc' },
    });
    return res.status(200).json(pedidos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao listar pedidos.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    });

    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado.' });
    }

    return res.status(200).json(pedido);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao buscar pedido.' });
  }
}

async function atualizar(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const existente = await prisma.pedido.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Pedido não encontrado.' });
    }

    const { status, observacoes } = req.body;
    let statusFinal = existente.status;

    if (status !== undefined) {
      statusFinal = String(status).toUpperCase();
      if (!STATUS_VALIDOS.includes(statusFinal)) {
        return res.status(400).json({
          erro: `Status inválido. Valores permitidos: ${STATUS_VALIDOS.join(', ')}.`,
        });
      }
    }

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        status: statusFinal,
        observacoes: observacoes !== undefined ? (observacoes ? String(observacoes).trim() : null) : existente.observacoes,
      },
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    });

    return res.status(200).json(pedido);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao atualizar pedido.' });
  }
}

async function excluir(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const existente = await prisma.pedido.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Pedido não encontrado.' });
    }

    await prisma.pedido.delete({ where: { id } });
    return res.status(200).json({ mensagem: 'Pedido excluído com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao excluir pedido.' });
  }
}

module.exports = { criar, listarTodos, buscarPorId, atualizar, excluir };
