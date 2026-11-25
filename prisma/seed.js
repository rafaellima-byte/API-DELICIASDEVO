const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('123456', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@deliciasdevo.com' },
    update: {},
    create: {
      nome: 'Administrador Delícias de Vó',
      email: 'admin@deliciasdevo.com',
      senha: senhaHash,
    },
  });

  const categoriaFritos = await prisma.categoria.upsert({
    where: { nome: 'Salgados Fritos' },
    update: {},
    create: {
      nome: 'Salgados Fritos',
      descricao: 'Salgados artesanais fritos na hora com massa caseira',
    },
  });

  const categoriaAssados = await prisma.categoria.upsert({
    where: { nome: 'Salgados Assados' },
    update: {},
    create: {
      nome: 'Salgados Assados',
      descricao: 'Empadas e esfihas assadas no forno',
    },
  });

  const produtosExistentes = await prisma.produto.count();
  if (produtosExistentes === 0) {
    await prisma.produto.createMany({
      data: [
        {
          nome: 'Coxinha de Frango com Catupiry',
          descricao: 'Massa artesanal de batata com recheio cremoso',
          preco: 7.5,
          disponivel: true,
          categoriaId: categoriaFritos.id,
        },
        {
          nome: 'Empada de Palmito',
          descricao: 'Massa podre caseira com recheio de palmito temperado',
          preco: 8.0,
          disponivel: true,
          categoriaId: categoriaAssados.id,
        },
      ],
    });
  }

  await prisma.cliente.upsert({
    where: { telefone: '63999990001' },
    update: {},
    create: {
      nome: 'Maria Silva',
      telefone: '63999990001',
      endereco: 'Rua Principal, 120 - Centro, Sítio Novo - TO',
    },
  });

  console.log('Seed executado com sucesso!');
  console.log('Usuario de teste: admin@deliciasdevo.com | Senha: 123456');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
