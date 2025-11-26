
// Chaves usadas no localStorage
const STORAGE_KEY = 'trocaí_favores_v1';       // lista de favores (array)
const STORAGE_ID_KEY = 'trocaí_favores_nextId'; // próximo id sequencial
const PROFILE_KEY = 'trocaí_perfil_v1';        // perfil do usuário logado

// Lê a lista de favores do localStorage (fallback para array vazio)
function getStoredFavores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    console.error('Erro ao ler favores do storage', e);
    return [];
  }
}

// Retorna o objeto de perfil salvo no localStorage (nome, username, bio)
function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

// Persiste a lista de favores no localStorage
function saveStoredFavores(favores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favores));
}

// Gera um id sequencial e atualiza o contador no localStorage
function getNextId() {
  let id = parseInt(localStorage.getItem(STORAGE_ID_KEY) || '1', 10);
  localStorage.setItem(STORAGE_ID_KEY, String(id + 1));
  return id;
}

// Renderiza os cards pertencentes ao usuário logado na página 'Postar'
// Recebe o container DOM e cria elementos .post-card para cada favor
function renderCards(container) {
  container.innerHTML = '';
  const favores = getStoredFavores();
  const currentUser = localStorage.getItem('trocaí_currentUser');

  // Filtrar apenas os favores do usuário atual (apenas ele pode ver/editar/excluir aqui)
  const meusFavores = currentUser ? favores.filter(f => f.autor === currentUser) : [];
  const lista = meusFavores;

  if (lista.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Você ainda não postou favores.';
    container.appendChild(empty);
    return;
  }

  // Mostrar do mais recente para o mais antigo
  lista.slice().reverse().forEach(f => {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.dataset.id = f.id;

    const h3 = document.createElement('h3');
    h3.textContent = f.titulo;

    const p = document.createElement('p');
    p.textContent = f.descricao;

    // data de criação
    const small = document.createElement('small');
    small.textContent = new Date(f.criadoEm).toLocaleString();

    // container de ações (Editar / Excluir) — visível apenas para o dono
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '10px';
    actions.style.marginTop = '12px';

    // Botão Editar — preenche o formulário com os dados do favor
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => startEditFavor(f.id));

    // Botão Excluir — confirma e remove
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Excluir';
    delBtn.style.background = '#e53935';
    delBtn.style.color = '#fff';
    delBtn.addEventListener('click', () => deleteFavor(f.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(small);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

function createFavor(titulo, descricao) {
  const favores = getStoredFavores();
  const profile = getProfile();
  const novo = {
    id: getNextId(),
    titulo,
    descricao,
    autor: profile.username || localStorage.getItem('trocaí_currentUser') || '@anonimo',
    criadoEm: Date.now()
  };
  favores.push(novo);
  saveStoredFavores(favores);
  return novo;
}

function updateFavor(id, titulo, descricao) {
  const favores = getStoredFavores();
  const idx = favores.findIndex(f => f.id === id);
  if (idx === -1) return null;
  favores[idx].titulo = titulo;
  favores[idx].descricao = descricao;
  saveStoredFavores(favores);
  return favores[idx];
}

function deleteFavor(id) {
  if (!confirm('Tem certeza que deseja excluir este favor?')) return;
  const favores = getStoredFavores();
  const idx = favores.findIndex(f => f.id === id);
  if (idx === -1) return;
  favores.splice(idx, 1);
  saveStoredFavores(favores);
  const container = document.getElementById('user-cards-container');
  renderCards(container);
}

function startEditFavor(id) {
  const favores = getStoredFavores();
  const f = favores.find(x => x.id === id);
  if (!f) return;
  document.getElementById('favorId').value = f.id;
  document.getElementById('titulo').value = f.titulo;
  document.getElementById('descricao').value = f.descricao;
  document.getElementById('submitBtn').textContent = 'Salvar Alterações';
  document.getElementById('cancelEdit').style.display = 'inline-block';
}

function cancelEdit() {
  document.getElementById('favorId').value = '';
  document.getElementById('titulo').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('submitBtn').textContent = 'Postar Favor';
  document.getElementById('cancelEdit').style.display = 'none';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // se não estiver logado, redireciona para login
  const currentUser = localStorage.getItem('trocaí_currentUser');
  if (!currentUser) {
    // redireciona para login
    window.location.href = '../Loginn/login.html';
    return;
  }
  const form = document.getElementById('favorForm');
  const container = document.getElementById('user-cards-container');
  const cancelBtn = document.getElementById('cancelEdit');

  // Se não houver favores no storage, adiciona um exemplo (somente na primeira vez)
  if (getStoredFavores().length === 0) {
    createFavor('Ajustar luminária', 'Preciso de ajuda para instalar uma luminária na sala.');
  }

  renderCards(container);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const idVal = document.getElementById('favorId').value;
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    if (!titulo || !descricao) return;

    if (idVal) {
      // editar
      const id = parseInt(idVal, 10);
      updateFavor(id, titulo, descricao);
    } else {
      // criar
      createFavor(titulo, descricao);
    }

    cancelEdit();
    renderCards(container);
  });

  cancelBtn.addEventListener('click', () => {
    cancelEdit();
  });
});
