// principal.js - carrega favores na página Início
// Este script lê os favores do localStorage e renderiza os cards
const STORAGE_KEY = 'trocaí_favores_v1';
const ADMIN_KEY = 'trocaí_isAdmin';

// Lê favores do storage (fallback: array vazio)
function getStoredFavores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    console.error('Erro ao ler favores do storage', e);
    return [];
  }
}

function saveStoredFavores(favores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favores));
}

// Renderiza os favores como .post-card na página Inicial
function renderFavoresOnInicio() {
  const gridPosts = document.querySelector('.grid-posts');
  if (!gridPosts) return;

  // Limpar cards estáticos e manter apenas os dinâmicos
  gridPosts.innerHTML = '';
  
  const favores = getStoredFavores();
  const isAdmin = localStorage.getItem(ADMIN_KEY) === 'true';

  if (!favores || favores.length === 0) {
    // mostrar cards de exemplo se não houver favores
    const exemploCard = document.createElement('div');
    exemploCard.className = 'post-card';
    exemploCard.innerHTML = `
      <h3>Nenhum favor postado ainda</h3>
      <p>Acesse a página "Postar" para criar seus primeiros favores!</p>
      <small>Comunidade Trocaí</small>
    `;
    gridPosts.appendChild(exemploCard);
    return;
  }

  // Renderizar favores (mais recentes primeiro)
  favores.slice().reverse().forEach((f, idx) => {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.dataset.favorId = f.id;

    const h3 = document.createElement('h3');
    h3.textContent = f.titulo;

    const p = document.createElement('p');
    p.textContent = f.descricao;

    // cria o elemento <small> com "Publicado por <strong>@usuario</strong>"
    const small = document.createElement('small');
    const strong = document.createElement('strong');
    strong.textContent = f.autor || '@anonimo';
    small.textContent = 'Publicado por ';
    small.appendChild(strong);

    const btn = document.createElement('button');
    // Admin vê "Pagar", usuários normais veem "Quero trocar"
    btn.textContent = isAdmin ? 'Apagar' : 'Quero trocar';
    
    if (isAdmin) {
      // Botão Pagar para admin: remove o favor e atualiza
      btn.addEventListener('click', () => {
        if (!confirm(`Tem certeza que quer pagar este favor de ${f.autor}?`)) return;
        const lista = getStoredFavores();
        const filtrada = lista.filter(fav => fav.id !== f.id);
        saveStoredFavores(filtrada);
        alert('Favor pago com sucesso!');
        renderFavoresOnInicio();
      });
    } else {
      // Botão normal: pode adicionar lógica de troca ou mensagem
      btn.addEventListener('click', () => {
        alert(`Você quer trocar com ${f.autor}`);
      });
    }

    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(small);
    card.appendChild(btn);

    gridPosts.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderFavoresOnInicio();

  // escuta mudanças no localStorage para atualizar automaticamente
  window.addEventListener('storage', (evt) => {
    if (evt.key === STORAGE_KEY) {
      renderFavoresOnInicio();
    }
  });
});
