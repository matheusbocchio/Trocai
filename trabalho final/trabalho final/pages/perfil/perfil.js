// Chaves usadas no localStorage
const STORAGE_KEY = 'trocaí_favores_v1'; // favores
const PROFILE_KEY = 'trocaí_perfil_v1';   // perfil do usuário

// Lê favores do storage (fallback: array vazio)
function getStoredFavores() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
        console.error('Erro ao ler favores do storage', e);
        return [];
    }
}

// Renderiza os favores na página Perfil (apenas leitura)
function renderProfileCards(container) {
    container.innerHTML = '';
    const favores = getStoredFavores();
    if (!favores || favores.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'Nenhum favor disponível.';
        container.appendChild(empty);
        return;
    }

    // Mostra do mais recente para o mais antigo
    favores.slice().reverse().forEach(f => {
        const card = document.createElement('div');
        card.className = 'post-card';

        const h3 = document.createElement('h3');
        h3.textContent = f.titulo;

        const p = document.createElement('p');
        p.textContent = f.descricao;

        const small = document.createElement('small');
        small.textContent = new Date(f.criadoEm).toLocaleString();

        card.appendChild(h3);
        card.appendChild(p);
        card.appendChild(small);

        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('meusFavores');
    if (!container) return;
    container.classList.add('grid-posts');
    renderProfileCards(container);

    // opcional: escuta mudanças no localStorage para atualizar automaticamente
    window.addEventListener('storage', (evt) => {
        if (evt.key === STORAGE_KEY) {
            renderProfileCards(container);
        }
    });
    // --- Perfil: editar e salvar ---
    const perfilNome = document.getElementById('perfilNome');
    const perfilUsername = document.getElementById('perfilUsername');
    const perfilBio = document.getElementById('perfilBio');
    const btnEditar = document.getElementById('btnEditar');
    const btnSair = document.getElementById('btnSair');
    const perfilForm = document.getElementById('perfilForm');
    const inputNome = document.getElementById('inputNome');
    const inputUsername = document.getElementById('inputUsername');
    const inputBio = document.getElementById('inputBio');
    const btnSalvarPerfil = document.getElementById('btnSalvarPerfil');
    const btnCancelarPerfil = document.getElementById('btnCancelarPerfil');
    const btnExcluir = document.getElementById('btnExcluir');

    // Se o usuário NÃO estiver logado, substitui os botões de ação por Entrar / Cadastre-se
    const currentUser = localStorage.getItem('trocaí_currentUser');
    const actionsContainer = document.querySelector('.perfil-acoes');
    if (!currentUser) {
        // esconder botões de gerenciamento
        btnEditar && (btnEditar.style.display = 'none');
        btnSair && (btnSair.style.display = 'none');
        btnExcluir && (btnExcluir.style.display = 'none');

        // criar botões Entrar e Cadastre-se
        const entrarBtn = document.createElement('button');
        entrarBtn.textContent = 'Entrar';
        entrarBtn.className = 'btn-entrar';
        entrarBtn.addEventListener('click', () => { window.location.href = '../Loginn/login.html'; });

        const cadBtn = document.createElement('button');
        cadBtn.textContent = 'Cadastre-se';
        cadBtn.className = 'btn-cadastrar';
        cadBtn.addEventListener('click', () => { window.location.href = '../Loginn/cadastro.html'; });

        // limpar e inserir os botões
        if (actionsContainer) {
            actionsContainer.appendChild(entrarBtn);
            actionsContainer.appendChild(cadBtn);
        }

        // ajustar apresentação do perfil para convidado
        perfilNome.textContent = 'Convidado';
        perfilUsername.textContent = '@convidado';
        perfilBio.textContent = 'Faça login para ver e gerenciar seus favores.';

        // informar que precisa logar para ver favores
        const meusFavores = document.getElementById('meusFavores');
        if (meusFavores) {
            meusFavores.innerHTML = '<p>Faça login para ver seus favores.</p>';
            meusFavores.classList.remove('grid-posts');
        }

        // interrompe inicialização de edição/remoção
        return;
    }

    // Lê o objeto de perfil salvo (nome, username, bio)
    function getProfile() {
        try {
            return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
        } catch (e) {
            return {};
        }
    }

    // Persiste perfil no localStorage
    function saveProfile(p) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    }

    // Atualiza a seção de perfil com os valores salvos
    function renderProfileDisplay() {
        const p = getProfile();
        perfilNome.textContent = p.nome || 'Seu Nome';
        perfilUsername.textContent = p.username || '@usuario';
        perfilBio.textContent = p.bio || 'Escreva algo sobre você...';
    }

    // carregar profile ao abrir
    renderProfileDisplay();

    // Abre o formulário de edição e preenche com os dados atuais
    function openEdit() {
        const p = getProfile();
        inputNome.value = p.nome || '';
        inputUsername.value = p.username || '';
        inputBio.value = p.bio || '';
        perfilForm.style.display = 'block';
        perfilNome.style.display = 'none';
        perfilUsername.style.display = 'none';
        perfilBio.style.display = 'none';
        btnEditar.style.display = 'none';
    }

    // Fecha o formulário de edição
    function closeEdit() {
        perfilForm.style.display = 'none';
        perfilNome.style.display = '';
        perfilUsername.style.display = '';
        perfilBio.style.display = '';
        btnEditar.style.display = '';
    }

    btnEditar.addEventListener('click', (e) => {
        e.preventDefault();
        openEdit();
    });

    btnCancelarPerfil.addEventListener('click', (e) => {
        e.preventDefault();
        closeEdit();
    });

    perfilForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // garantir que o username comece com '@'
        let usernameVal = inputUsername.value.trim();
        if (usernameVal && !usernameVal.startsWith('@')) usernameVal = '@' + usernameVal;
        const novo = {
            nome: inputNome.value.trim(),
            username: usernameVal,
            bio: inputBio.value.trim()
        };
        saveProfile(novo);
        renderProfileDisplay();
        closeEdit();
    });

    // botão sair: fazer logout real — remover currentUser e perfil, redirecionar
    btnSair && btnSair.addEventListener('click', () => {
        if (!confirm('Deseja sair de sua conta?')) return;
        // remover dados de sessão
        localStorage.removeItem('trocaí_currentUser');
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem('trocaí_isAdmin'); // remover flag de admin também
        // redirecionar para página inicial
        alert('Logout realizado! Redirecionando...');
        window.location.href = '../pagePrincipal/principal.html';
    });

    // botão Excluir Perfil: remove usuário, perfil, currentUser e seus favores
    btnExcluir && btnExcluir.addEventListener('click', () => {
        if (!confirm('Tem certeza que deseja excluir seu perfil? Esta ação é permanente e removerá seus favores.')) return;

        const p = getProfile();
        const username = p.username || localStorage.getItem('trocaí_currentUser');

        // remover usuário da lista de usuários
        try {
            const users = JSON.parse(localStorage.getItem('trocaí_users_v1') || '[]');
            const filtered = users.filter(u => u.username !== username);
            localStorage.setItem('trocaí_users_v1', JSON.stringify(filtered));
        } catch (e) {
            console.warn('Erro ao atualizar lista de usuários', e);
        }

        // remover favores do usuário
        try {
            const favores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const restantes = favores.filter(f => f.autor !== username);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(restantes));
        } catch (e) {
            console.warn('Erro ao remover favores do usuário', e);
        }

        // remover perfil e currentUser
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem('trocaí_currentUser');

        alert('Perfil excluído com sucesso. Você será redirecionado à página inicial.');
        window.location.href = '../pagePrincipal/principal.html';
    });
});
