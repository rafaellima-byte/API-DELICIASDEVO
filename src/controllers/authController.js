const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Os campos nome, email e senha são obrigatórios.' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    if (!emailRegex.test(emailNormalizado)) {
      return res.status(400).json({ erro: 'Formato de e-mail inválido.' });
    }

    if (String(senha).length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Já existe um usuário cadastrado com este e-mail.' });
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome: String(nome).trim(),
        email: emailNormalizado,
        senha: senhaHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
      },
    });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(String(senha), usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: 'Informe o e-mail para recuperação de senha.' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado com este e-mail.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    console.log(`[RECUPERACAO DE SENHA] Email: ${usuario.email} | Token: ${resetToken} | Expira em: ${resetTokenExpires.toISOString()}`);

    return res.status(200).json({
      mensagem: 'Token de recuperação gerado com sucesso. Válido por 15 minutos.',
      resetToken,
      expiraEm: resetTokenExpires,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao solicitar recuperação de senha.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ erro: 'Os campos token e novaSenha são obrigatórios.' });
    }

    if (String(novaSenha).length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const usuario = await prisma.usuario.findFirst({
      where: { resetToken: String(token).trim() },
    });

    if (!usuario || !usuario.resetTokenExpires) {
      return res.status(400).json({ erro: 'Token de recuperação inválido.' });
    }

    if (new Date() > new Date(usuario.resetTokenExpires)) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { resetToken: null, resetTokenExpires: null },
      });
      return res.status(400).json({ erro: 'Token de recuperação expirado. Solicite um novo.' });
    }

    const novaSenhaHash = await bcrypt.hash(String(novaSenha), 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: novaSenhaHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return res.status(200).json({ mensagem: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro interno ao redefinir senha.' });
  }
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
