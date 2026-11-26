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
   git clone https://github.com/rafaellima-byte/API-DELICIASDEVO.git
   cd API-DELICIASDEVO
   code .
   ```

2. **Abrir o terminal integrado do VS Code (`Ctrl + '`) e instalar as dependências:**
   ```bash
   npm install
   ```

3. **Criar o arquivo `.env` a partir do `.env.example` (no terminal do VS Code):**
   - No **Windows (PowerShell do VS Code)**:
     ```powershell
     Copy-Item .env.example .env
     ```
   - No **Linux / macOS / Git Bash**:
     ```bash
     cp .env.example .env
     ```

   Conteúdo padrão gerado no `.env`:
   ```env
   PORT=3000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="substitua_por_uma_chave_secreta_segura"
   JWT_EXPIRES_IN="1d"
   ```

4. **Executar as migrations do Prisma e popular o banco de dados (seed):**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
   *(O seed cria automaticamente um usuário de teste: `admin@deliciasdevo.com` / senha `123456`, além de categorias, produtos e cliente iniciais.)*

5. **Iniciar o servidor em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A API subirá na porta **3000** (`http://localhost:3000`). Mantenha o terminal do VS Code aberto durante os testes.

---

## 5. Lista de Rotas da API

### Autenticação (`/auth`)

| Método | URL | Descrição | Exige Token? | Exemplo de Corpo (JSON) |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/auth/register` | Cadastra novo usuário (senha criptografada) | Não | `{"nome": "Operador", "email": "op@delicias.com", "senha": "senha123"}` |
| `POST` | `/auth/login` | Autentica e retorna o token JWT | Não | `{"email": "op@delicias.com", "senha": "senha123"}` |
| `POST` | `/auth/forgot-password` | Gera token de recuperação (expira em 15 min) | Não | `{"email": "op@delicias.com"}` |
| `POST` | `/auth/reset-password` | Valida token, altera senha e invalida token | Não | `{"token": "<resetToken>", "novaSenha": "novaSenha456"}` |

### Categorias (`/categorias`) — Rafael Lima da Silva

| Método | URL | Descrição | Exige Token? | Exemplo de Corpo (JSON) |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/categorias` | Cria uma nova categoria | Sim | `{"nome": "Combos Festa", "descricao": "Centos variados"}` |
| `GET` | `/categorias` | Lista todas as categorias | Sim | — |
| `GET` | `/categorias/:id` | Busca uma categoria por ID | Sim | — |
| `PUT` | `/categorias/:id` | Atualiza uma categoria | Sim | `{"nome": "Salgados Fritos Especiais", "descricao": "Massa caseira"}` |
| `DELETE` | `/categorias/:id` | Exclui uma categoria | Sim | — |

### Produtos (`/produtos`) — João Vitor Morais Saraiva

| Método | URL | Descrição | Exige Token? | Exemplo de Corpo (JSON) |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/produtos` | Cria um novo produto no cardápio | Sim | `{"nome": "Risole", "descricao": "Presunto e queijo", "preco": 6.5, "disponivel": true, "categoriaId": 1}` |
| `GET` | `/produtos` | Lista todos os produtos | Sim | — |
| `GET` | `/produtos/:id` | Busca um produto por ID | Sim | — |
| `PUT` | `/produtos/:id` | Atualiza um produto | Sim | `{"nome": "Coxinha Grande", "preco": 8.5, "disponivel": true}` |
| `DELETE` | `/produtos/:id` | Exclui um produto | Sim | — |

### Clientes (`/clientes`) — Kaio Felipe Aviz Lima Lopes

| Método | URL | Descrição | Exige Token? | Exemplo de Corpo (JSON) |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/clientes` | Cadastra um novo cliente | Sim | `{"nome": "Carlos", "telefone": "63999887766", "endereco": "Rua das Flores, 45"}` |
| `GET` | `/clientes` | Lista todos os clientes | Sim | — |
| `GET` | `/clientes/:id` | Busca um cliente por ID | Sim | — |
| `PUT` | `/clientes/:id` | Atualiza dados de um cliente | Sim | `{"nome": "Carlos Eduardo", "endereco": "Av. Tocantins, 300"}` |
| `DELETE` | `/clientes/:id` | Exclui um cliente | Sim | — |

### Pedidos (`/pedidos`) — Jerdeson Ferreira Sousa

| Método | URL | Descrição | Exige Token? | Exemplo de Corpo (JSON) |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/pedidos` | Cria um novo pedido | Sim | `{"clienteId": 1, "status": "PENDENTE", "observacoes": "Sem pimenta"}` |
| `GET` | `/pedidos` | Lista todos os pedidos com itens | Sim | — |
| `GET` | `/pedidos/:id` | Busca um pedido por ID | Sim | — |
| `PUT` | `/pedidos/:id` | Atualiza status/observações do pedido | Sim | `{"status": "EM_PREPARO", "observacoes": "Em fritura"}` |
| `DELETE` | `/pedidos/:id` | Exclui um pedido (e seus itens em cascata) | Sim | — |

### Itens de Pedido (`/itens-pedido`) — Carla Grasiela Alves Lima

| Método | URL | Descrição | Exige Token? | Exemplo de Corpo (JSON) |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/itens-pedido` | Adiciona item ao pedido e recalcula total | Sim | `{"pedidoId": 1, "produtoId": 1, "quantidade": 3, "observacoes": "Bem frito"}` |
| `GET` | `/itens-pedido` | Lista todos os itens de pedido | Sim | — |
| `GET` | `/itens-pedido/:id` | Busca um item de pedido por ID | Sim | — |
| `PUT` | `/itens-pedido/:id` | Atualiza quantidade/observação do item | Sim | `{"quantidade": 5, "observacoes": "Ketchup extra"}` |
| `DELETE` | `/itens-pedido/:id` | Exclui um item e recalcula total do pedido | Sim | — |

---

## 6. Roteiro de Testes

1. **Importar a coleção de testes:**
   - O arquivo JSON está localizado em: **`docs/delicias-de-vo.postman_collection.json`**.
   - Importe o arquivo no **Postman**, **Insomnia** ou na extensão **Thunder Client** do VS Code.
   - A coleção utiliza as variáveis `{{baseUrl}}` (`http://localhost:3000`) e `{{token}}`.
   - *Atenção no Thunder Client:* Crie um ambiente na aba **Env** com `baseUrl = http://localhost:3000` e `token` (a ser preenchido após o login), salve e clique em **Set Active** para ativar o ambiente.

2. **Ordem recomendada de execução:**
   1. **Testar bloqueio sem token:** Tente executar `GET /categorias` sem o token configurado e confirme o retorno `401 Unauthorized`.
   2. **Cadastrar Usuário:** Execute `POST /auth/register` (ou utilize o usuário do seed: `admin@deliciasdevo.com` / `123456`).
   3. **Fazer Login:** Execute `POST /auth/login`. Copie o valor do campo `token` retornado no JSON.
   4. **Configurar o Token:** Cole o JWT na variável `token` da coleção/ambiente (enviado automaticamente no cabeçalho `Authorization: Bearer {{token}}`).
   5. **Testar os 5 CRUDs (POST, GET, GET /:id, PUT, DELETE):**
      - Siga a ordem: **Categorias** → **Produtos** → **Clientes** → **Pedidos** → **Itens de Pedido** (respeitando os relacionamentos de chaves estrangeiras; deixe o `DELETE /pedidos/1` para depois de testar os itens do pedido).
   6. **Testar a Recuperação de Senha:**
      - Execute `POST /auth/forgot-password` com o e-mail cadastrado.
      - **Onde encontrar o token de recuperação:** o campo `resetToken` é retornado diretamente no **JSON da resposta da API** e também impresso no **terminal do VS Code** onde o servidor está rodando.
      - Copie o `resetToken` e envie em `POST /auth/reset-password` junto com a `novaSenha`.
      - Envie a mesma requisição novamente para confirmar que o token foi invalidado após o uso (`400 Bad Request`).
      - Faça login novamente em `POST /auth/login` utilizando a nova senha.
