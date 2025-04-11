import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import cors from 'cors';
import axios from 'axios';

const app = express();
const prisma = new PrismaClient();

// PERMITIR REQUISIÇÕES DE DIFERENTES ORIGENS
app.use(cors());
app.use(express.json());

// VALIDAÇÃO ZOD
const clienteSchema = z.object({
  cnpj: z.string().length(14),
  nome: z.string().min(3).max(100),
  nomeFantasia: z.string().min(3).max(100),
  cep: z.string().length(8),
  logradouro: z.string().min(3).max(100),
  bairro: z.string().min(3).max(100),
  cidade: z.string().min(3).max(100),
  uf: z.string().length(2),
  complemento: z.string().max(100).optional(),
  email: z.string().email().max(100),
  telefone: z.string().min(10).max(15),
});

// TRATAMENTO DE ERROS
function handleError(res: express.Response, error: unknown) {
  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
  } else if (typeof error === 'string') {
    res.status(400).json({ error });
  } else {
    res.status(500).json({ error: 'Erro interno desconhecido' });
  }
}

// ROTAS 
app.get('/clientes', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/clientes/:cnpj', async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { cnpj: req.params.cnpj },
    });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/clientes', async (req, res) => {
  try {
    const data = clienteSchema.parse(req.body);
    const cliente = await prisma.cliente.create({ data });
    res.status(201).json(cliente);
  } catch (error) {
    handleError(res, error);
  }
});

app.put('/clientes/:cnpj', async (req, res) => {
  try {
    const data = clienteSchema.parse(req.body);
    const cliente = await prisma.cliente.update({
      where: { cnpj: req.params.cnpj },
      data,
    });
    res.json(cliente);
  } catch (error) {
    handleError(res, error);
  }
});

app.delete('/clientes/:cnpj', async (req, res) => {
  try {
    await prisma.cliente.delete({
      where: { cnpj: req.params.cnpj },
    });
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

// ROTAS PARA VALIDAÇÃO EXTERNA 
app.get('/consulta-cnpj/:cnpj', async (req, res) => {
  try {
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${req.params.cnpj}`);
    res.json(response.data);
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/consulta-cep/:cep', async (req, res) => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${req.params.cep}/json/`);
    res.json(response.data);
  } catch (error) {
    handleError(res, error);
  }
});

// RUN SERVER
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});