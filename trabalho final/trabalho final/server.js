import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const app = express();


app.use(cors());
app.use(express.json()); 


let usuarios = [];
let idAtual = 1;


app.post('/usuarios', (req, res) => {
  const { nome, produto, valor } = req.body;

  if (!nome || !produto|| !valor) {
    return res.status(400).json({ erro: 'Preencha todos os campos!' });
  }

  const usuarioExistente = usuarios.find(u => u.produto === produto);
  if (usuarioExistente) {
    return res.status(400).json({ erro: 'Produto já cadastrado!' });
  }

  const novoUsuario = { id: idAtual++, nome, produto, valor };
  usuarios.push(novoUsuario);

  res.status(201).json(novoUsuario);
});


app.get('/usuarios', (req, res) => {
  const { nome } = req.query;

  if (nome) {
    const filtrados = usuarios.filter(u =>
      u.nome.toLowerCase().includes(nome.toLowerCase())
    );
    return res.json(filtrados);
  }

  res.json(usuarios);
});


app.put('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, produto, valor } = req.body;

  const usuario = usuarios.find(u => u.id === parseInt(id));

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado!' });
  }

  if (nome) usuario.nome = nome;
  if (produto) usuario.produto = produto;
  if (valor) usuario.valor = valor;

  res.json(usuario);
});


app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const index = usuarios.findIndex(u => u.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ erro: 'Produto não encontrado!' });
  }

  usuarios.splice(index, 1);
  res.json({ mensagem: 'Usuário deletado com sucesso!' });
});





const PORT = process.env.PORT || 3000;

let mensagens = [];
let mensagemIdAtual = 1;


app.get('/mensagens', (req, res) => {
  res.json(mensagens);
});

app.post('/mensagens', (req, res) => {
  const { autor, texto } = req.body;
  if (!autor || !texto) return res.status(400).json({ erro: 'Campos obrigatórios!' });

  const novaMsg = {
    id: mensagemIdAtual++,
    autor,
    texto,
    criadoEm: Date.now()
  };
  mensagens.push(novaMsg);
  res.status(201).json(novaMsg);
});

app.listen(PORT, () => {
  console.log(` Servidor rodando em http://localhost:${PORT}`);
});
