const API = 'http://localhost:3000'; // seu backend
const chatForm = document.getElementById('chatForm');
const mensagensDiv = document.getElementById('mensagens');

// Pegando o usuário logado do seu sistema
const currentUser = localStorage.getItem('trocaí_currentUser');
if (!currentUser) {
  alert('Faça login para acessar o chat!');
  window.location.href = '../Loginn/login.html';
}

// Função para buscar e renderizar mensagens
async function carregarMensagens() {
  try {
    const res = await fetch(`${API}/mensagens`);
    const data = await res.json();
    mensagensDiv.innerHTML = '';
    data.forEach(m => {
      const div = document.createElement('div');
      div.className = 'mensagem';
      
      // Diferenciar mensagens do usuário logado
      if (m.autor === currentUser) {
        div.classList.add('minha-mensagem');
      }

      div.innerHTML = `<strong>${m.autor}:</strong> ${m.texto} <small>${new Date(m.criadoEm).toLocaleTimeString()}</small>`;
      mensagensDiv.appendChild(div);
    });
    mensagensDiv.scrollTop = mensagensDiv.scrollHeight;
  } catch (e) {
    console.error('Erro ao carregar mensagens', e);
  }
}

// Enviar mensagem
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = document.getElementById('mensagemInput').value.trim();
  if (!texto) return;

  await fetch(`${API}/mensagens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autor: currentUser, texto })
  });

  document.getElementById('mensagemInput').value = '';
  carregarMensagens();
});

// Atualizar mensagens a cada 2 segundos
setInterval(carregarMensagens, 2000);
carregarMensagens();
