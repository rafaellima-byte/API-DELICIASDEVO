# Otimização e Estruturação do Fluxo de Pedidos — Delícias de Vó

## 1. Sobre o Projeto e Instituição Parceira
- **Projeto:** Otimização e Estruturação do Fluxo de Pedidos
- **Instituição Parceira:** Delícias de Vó (Sítio Novo do Tocantins/TO)
- **Disciplina:** Programação para Web II (2026/2) — TADS / UNITINS

Esta API REST implementa o back-end da plataforma web de pedidos da **Delícias de Vó**, substituindo o atendimento manual via WhatsApp e comandas de papel por um fluxo digital estruturado. O sistema gerencia categorias do cardápio, produtos, clientes, pedidos e itens de pedido, além de autenticação via JWT e recuperação de senha com expiração de token.

---

## 2. Integrantes da Equipe e Divisão dos CRUDs

| Integrante | CRUD Responsável | Rota Base |
| :--- | :--- | :--- |
| **Rafael Lima da Silva** | CRUD de Categorias | `/categorias` |
| **João Vitor Morais Saraiva** | CRUD de Produtos | `/produtos` |
| **Kaio Felipe Aviz Lima Lopes** | CRUD de Clientes | `/clientes` |
| **Jerdeson Ferreira Sousa** | CRUD de Pedidos | `/pedidos` |
| **Carla Grasiela Alves Lima** | CRUD de Itens de Pedido | `/itens-pedido` |

*(O módulo de autenticação e recuperação de senha `/auth` é compartilhado pela equipe e não conta como CRUD individual.)*

---

## 3. Tecnologias Utilizadas
- **Node.js:** v20 LTS (compatível com v18+)
- **Express:** v4.21.1
- **Prisma ORM:** v5.22.0
- **Banco de Dados:** SQLite
- **Autenticação e Segurança:** `jsonwebtoken` (JWT) e `bcryptjs`
- **Variáveis de Ambiente:** `dotenv`

---

## 4. Passo a Passo de Instalação e Execução (pelo Terminal do VS Code)

> **Recomendação:** Execute todos os comandos abaixo diretamente no **terminal integrado do Visual Studio Code** (`Ctrl + '` ou menu **Terminal → Novo Terminal**) com a pasta raiz do projeto aberta no VS Code.

1. **Clonar o repositório e abrir a pasta no VS Code:**
   ```bash
   git clone [https://github.com/rafaellima-byte/API-DELICIASDEVO.git](https://github.com/rafaellima-byte/API-DELICIASDEVO.git)
   cd API-DELICIASDEVO
   code .

1. **Clonar o repositório e abrir a pasta no VS Code:**
   ```bash
   git clone [https://github.com/rafaellima-byte/API-DELICIASDEVO.git](https://github.com/rafaellima-byte/API-DELICIASDEVO.git)
   cd API-DELICIASDEVO
   code .
