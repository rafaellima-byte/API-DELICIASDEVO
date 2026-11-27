const prisma = require('../lib/prisma');

async function criar(req, res) {
  try {
    const { nome, descricao, preco, disponivel, categoriaId } = req.body;

    if (!nome || preco === undefined || !categoriaId) {
      return res.status(400).json({ erro: 'Os campos nome, preco e categoriaId são obrigatórios.' });
    }

    const precoNum = Number(preco);
    const catId = Number(categoriaId);

    if (Number.isNaN(precoNum) || precoNum <= 0) {
      return res.status(400).json({ erro: 'O preço deve ser um número maior que zero.' });
    }

    if (Number.isNaN(catId)) {
      return res.status(400).json({ erro: 'categoriaId inválido.' });
    }

    const categoria = await prisma.categoria.findUnique({ where: { id: catId } });
    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria informada não encontrada.' });
    }

    const produto = await prisma.produto.create({
      data: {
        nome: String(nome).trim(),
        descricao: descricao ? String(descricao).trim() : null,
        preco: precoNum,
        disponivel: disponivel !== undefined ? Boolean(disponivel) : true,
        categoriaId: catId,
      },
      include: { categoria: true },
    });

    return res.status(201).json(produto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao criar produto.' });
  }
}

async function listarTodos(req, res) {
  try {
    const produtos = await prisma.produto.findMany({
      include: { categoria: true },
      orderBy: { id: 'asc' },
    });
    return res.status(200).json(produtos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao listar produtos.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    return res.status(200).json(produto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao buscar produto.' });
  }
}

async function atualizar(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const existente = await prisma.produto.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    const { nome, descricao, preco, disponivel, categoriaId } = req.body;

    if (preco !== undefined && (Number.isNaN(Number(preco)) || Number(preco) <= 0)) {
      return res.status(400).json({ erro: 'O preço deve ser um número maior que zero.' });
    }

    if (categoriaId !== undefined) {
      const catId = Number(categoriaId);
      if (Number.isNaN(catId)) {
        return res.status(400).json({ erro: 'categoriaId inválido.' });
      }
      const categoria = await prisma.categoria.findUnique({ where: { id: catId } });
      if (!categoria) {
        return res.status(404).json({ erro: 'Categoria informada não encontrada.' });
      }
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: nome !== undefined ? String(nome).trim() : existente.nome,
        descricao: descricao !== undefined ? (descricao ? String(descricao).trim() : null) : existente.descricao,
        preco: preco !== undefined ? Number(preco) : existente.preco,
        disponivel: disponivel !== undefined ? Boolean(disponivel) : existente.disponivel,
        categoriaId: categoriaId !== undefined ? Number(categoriaId) : existente.categoriaId,
      },
      include: { categoria: true },
    });

    return res.status(200).json(produto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao atualizar produto.' });
  }
}

async function excluir(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const existente = await prisma.produto.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    await prisma.produto.delete({ where: { id } });
    return res.status(200).json({ mensagem: 'Produto excluído com sucesso.' });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ erro: 'Não é possível excluir um produto vinculado a itens de pedido.' });
    }
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao excluir produto.' });
  }
}

module.exports = { criar, listarTodos, buscarPorId, atualizar, excluir };
