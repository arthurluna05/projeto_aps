import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, Stack, Alert, AlertIcon, AlertDescription,
} from '@chakra-ui/react';
import { z } from 'zod';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';
import axios from 'axios';


const clienteSchema = z.object({
  cnpj: z.string().length(14, 'CNPJ deve ter 14 dígitos'),
  nome: z.string().min(3).max(100),
  nomeFantasia: z.string().min(3).max(100),
  cep: z.string().length(8, 'CEP deve ter 8 dígitos'),
  logradouro: z.string().min(3).max(100),
  bairro: z.string().min(3).max(100),
  cidade: z.string().min(3).max(100),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  complemento: z.string().max(100).optional(),
  email: z.string().email().max(100),
  telefone: z.string().min(10).max(15),
});

type Cliente = z.infer<typeof clienteSchema>;

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteAtual, setClienteAtual] = useState<Partial<Cliente>>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modoEdicao, setModoEdicao] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const res = await axios.get('http://localhost:3001/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClienteAtual(prev => ({ ...prev, [name]: value }));
  };

  const validarCliente = () => {
    if (!clienteAtual.cnpj || !cnpjValidator.isValid(clienteAtual.cnpj)) {
      setErros(prev => ({ ...prev, cnpj: 'CNPJ inválido (dígito verificador)' }));
      return false;
    }

    try { 
      clienteSchema.parse(clienteAtual);
      setErros({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const novosErros: Record<string, string> = {};
        error.errors.forEach(err => {
          const campo = err.path[0];
          if (campo) novosErros[campo as string] = err.message;
        });
        setErros(novosErros);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validarCliente()) return;

    const clienteValido = clienteAtual as Cliente;

    try {
      if (modoEdicao) {
        await axios.put(`http://localhost:3001/clientes/${clienteValido.cnpj}`, clienteValido);
      } else {
        await axios.post('http://localhost:3001/clientes', clienteValido);
      }
      await carregarClientes();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
    }
  };

  const handleDelete = async (cnpj: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await axios.delete(`http://localhost:3001/clientes/${cnpj}`);
        await carregarClientes();
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
      }
    }
  };

  const handleConsultaCNPJ = async () => {
    if (!clienteAtual.cnpj) return;

    try {
      const res = await axios.get(`http://localhost:3001/consulta-cnpj/${clienteAtual.cnpj}`);
      const data = res.data;
      if (data.nome) {
        setClienteAtual(prev => ({
          ...prev,
          nome: data.nome,
          nomeFantasia: data.fantasia || '',
          cep: data.cep?.replace(/\D/g, '') || '',
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.municipio || '',
          uf: data.uf || '',
          email: data.email || '',
          telefone: data.telefone || '',
        }));
      }
    } catch (err) {
      console.error('Erro ao consultar CNPJ:', err);
    }
  };

  const handleConsultaCEP = async () => {
    if (!clienteAtual.cep) return;

    try {
      const res = await axios.get(`http://localhost:3001/consulta-cep/${clienteAtual.cep}`);
      const data = res.data;
      if (!data.erro) {
        setClienteAtual(prev => ({
          ...prev,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf,
        }));
      }
    } catch (err) {
      console.error('Erro ao consultar CEP:', err);
    }
  };

  const abrirModalNovo = () => {
    setClienteAtual({});
    setModoEdicao(false);
    setErros({});
    onOpen();
  };

  const abrirModalEdicao = (cliente: Cliente) => {
    setClienteAtual(cliente);
    setModoEdicao(true);
    setErros({});
    onOpen();
  };

  return (
    <Box p={4}>
      <Button colorScheme="blue" mb={4} onClick={abrirModalNovo}>
        Novo Cliente
      </Button>

      <Table variant="simple" size="sm">
        <Thead bg="gray.100">
          <Tr>
            <Th>CNPJ</Th>
            <Th>Nome</Th>
            <Th>Nome Fantasia</Th>
            <Th>Email</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {clientes.map(cliente => (
            <Tr key={cliente.cnpj}>
              <Td>{cliente.cnpj}</Td>
              <Td>{cliente.nome}</Td>
              <Td>{cliente.nomeFantasia}</Td>
              <Td>{cliente.email}</Td>
              <Td>
                <Button size="sm" mr={2} onClick={() => abrirModalEdicao(cliente)}>
                  Editar
                </Button>
                <Button size="sm" colorScheme="red" onClick={() => handleDelete(cliente.cnpj)}>
                  Excluir
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modoEdicao ? 'Editar Cliente' : 'Novo Cliente'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4} p={4}>
              {[
                { label: 'CNPJ', name: 'cnpj', onBlur: handleConsultaCNPJ },
                { label: 'Nome', name: 'nome' },
                { label: 'Nome Fantasia', name: 'nomeFantasia' },
                { label: 'CEP', name: 'cep', onBlur: handleConsultaCEP },
                { label: 'Logradouro', name: 'logradouro' },
                { label: 'Bairro', name: 'bairro' },
                { label: 'Cidade', name: 'cidade' },
                { label: 'UF', name: 'uf' },
                { label: 'Email', name: 'email' },
                { label: 'Telefone', name: 'telefone' },
              ].map(({ label, name, onBlur }) => (
                <FormControl key={name} isInvalid={!!erros[name]}>
                  <FormLabel>{label}</FormLabel>
                  <Input
                    name={name}
                    value={(clienteAtual[name as keyof Cliente] as string) || ''}
                    onChange={handleChange}
                    onBlur={onBlur}
                  />
                  {erros[name] && (
                    <Alert status="error" mt={2}>
                      <AlertIcon />
                      <AlertDescription>{erros[name]}</AlertDescription>
                    </Alert>
                  )}
                </FormControl>
              ))}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Salvar
            </Button>
            <Button onClick={onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Clientes;
