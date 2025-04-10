# 🛠️ Backend - API REST com Express, Prisma e MySQL

API RESTful para gerenciamento de clientes, com suporte a:

- Cadastro, edição, listagem e exclusão de clientes
- Consulta automática de CNPJ e CEP
- Validação com Zod
- ORM com Prisma + MySQL

---

## 📦 Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [MySQL](https://www.mysql.com/)
- [Zod](https://zod.dev/)
- [Axios](https://axios-http.com/)

---


## Como rodar o backend

1 - Criar o arquivo .env com base no .env.example.

2 - Edite o conteúdo de acordo com o seu banco MySQL local:

DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"

3 - Instale as dependências

cd server   
npm install

4 - Gere os arquivos do Prisma:

npx prisma generate

5 - Crie o banco de dados e aplique as migrações:

npx prisma migrate dev --name init

6 - Inicie o servidor

npm run dev ou npm start
