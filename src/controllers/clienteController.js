const prisma = require('../lib/prisma');

function validarTelefone(telefone) {
  const apenasDigitos = String(telefone).replace(/\D/g, '');
  return apenasDigitos.length >= 10 && apenasDigitos.length <= 11 ? apenasDigitos : null;
}

async function criar(req, res) {
  try {
    const { nome, telefone, endereco } = req.body;

    if (!nome || !telefone || !endereco) {
      return res.status(400).json({ erro: 'Os campos nome, telefone e endereco são obrigatórios.' });
    }

    const telefoneLimpo = validarTelefone(telefone);
    if (!telefoneLimpo) {
      return res.status(400).json({ erro: 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos).' });
    }

    const existente = await prisma.cliente.findUnique({ where: { telefone: telefoneLimpo } });
    if (existente) {
      return res.status(400).json({ erro: 'Já existe um cliente cadastrado com este telefone.' });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome: String(nome).trim(),
        telefone: telefoneLimpo,
        endereco: String(endereco).trim(),
      },
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao criar cliente.' });
  }
}

async function listarTodos(req, res) {
  try {
    const clientes = await prisma.cliente.findMany({
      include: { pedidos: true },
      orderBy: { id: 'asc' },
    });
    return res.status(200).json(clientes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao listar clientes.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: { pedidos: true },
    });

    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    return res.status(200).json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao buscar cliente.' });
  }
}

async function atualizar(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const existente = await prisma.cliente.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    const { nome, telefone, endereco } = req.body;
    let telefoneFinal = existente.telefone;

    if (telefone !== undefined) {
      const telefoneLimpo = validarTelefone(telefone);
      if (!telefoneLimpo) {
        return res.status(400).json({ erro: 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos).' });
      }
      const duplicado = await prisma.cliente.findFirst({
        where: { telefone: telefoneLimpo, NOT: { id } },
      });
      if (duplicado) {
        return res.status(400).json({ erro: 'Já existe outro cliente com este telefone.' });
      }
      telefoneFinal = telefoneLimpo;
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: nome !== undefined ? String(nome).trim() : existente.nome,
        telefone: telefoneFinal,
        endereco: endereco !== undefined ? String(endereco).trim() : existente.endereco,
      },
    });

    return res.status(200).json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao atualizar cliente.' });
  }
}

async function excluir(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const existente = await prisma.cliente.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    await prisma.cliente.delete({ where: { id } });
    return res.status(200).json({ mensagem: 'Cliente excluído com sucesso.' });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ erro: 'Não é possível excluir um cliente que possui pedidos vinculados.' });
    }
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao excluir cliente.' });
  }
}

module.exports = { criar, listarTodos, buscarPorId, atualizar, excluir };
