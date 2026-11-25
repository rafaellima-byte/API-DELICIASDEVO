const prisma = require('../lib/prisma');

async function criar(req, res) {
  try {
    const { nome, descricao } = req.body;

    if (!nome || String(nome).trim() === '') {
      return res.status(400).json({ erro: 'O campo nome é obrigatório.' });
    }

    const nomeLimpo = String(nome).trim();
    const existente = await prisma.categoria.findUnique({ where: { nome: nomeLimpo } });

    if (existente) {
      return res.status(400).json({ erro: 'Já existe uma categoria com este nome.' });
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome: nomeLimpo,
        descricao: descricao ? String(descricao).trim() : null,
      },
    });

    return res.status(201).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao criar categoria.' });
  }
}

async function listarTodos(req, res) {
  try {
    const categorias = await prisma.categoria.findMany({
      include: { produtos: true },
      orderBy: { id: 'asc' },
    });
    return res.status(200).json(categorias);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao listar categorias.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: { produtos: true },
    });

    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao buscar categoria.' });
  }
}

async function atualizar(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const { nome, descricao } = req.body;
    if (!nome || String(nome).trim() === '') {
      return res.status(400).json({ erro: 'O campo nome é obrigatório.' });
    }

    const existente = await prisma.categoria.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    const nomeLimpo = String(nome).trim();
    const duplicada = await prisma.categoria.findFirst({
      where: {
        nome: nomeLimpo,
        NOT: { id },
      },
    });

    if (duplicada) {
      return res.status(400).json({ erro: 'Já existe outra categoria com este nome.' });
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nome: nomeLimpo,
        descricao: descricao !== undefined ? (descricao ? String(descricao).trim() : null) : existente.descricao,
      },
    });

    return res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao atualizar categoria.' });
  }
}

async function excluir(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const existente = await prisma.categoria.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    await prisma.categoria.delete({ where: { id } });
    return res.status(200).json({ mensagem: 'Categoria excluída com sucesso.' });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ erro: 'Não é possível excluir uma categoria que possui produtos vinculados.' });
    }
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao excluir categoria.' });
  }
}

module.exports = { criar, listarTodos, buscarPorId, atualizar, excluir };
