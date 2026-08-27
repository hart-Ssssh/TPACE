document.addEventListener("DOMContentLoaded", function() {
    // 1. Puxa o nível e o nome salvos na hora do login
    const nivelStr = localStorage.getItem('tpace_usuario_nivel');
    const nomeUsuario = localStorage.getItem('tpace_usuario_nome');

    // BARREIRA DE SEGURANÇA: Se não tem nível, não logou. Chuta pro login.
    if (nivelStr === null) {
        window.location.href = 'index.html';
        return;
    }

    const nivel = parseInt(nivelStr);

    // 2. ATUALIZA O NOME DO USUÁRIO NO TOPO
    const userSpan = document.querySelector('.user-info span');
    if (userSpan && nomeUsuario) {
        userSpan.innerText = nomeUsuario;
    }

    // 3. CONTROLE DO MENU SUPERIOR (NÍVEIS DE ACESSO)
    const linksMenu = document.querySelectorAll('.menu-link');
    
    linksMenu.forEach(link => {
        const href = link.getAttribute('href');
        
        // O botão de sair (index.html) sempre aparece para todos
        if (href === 'index.html') return;

        let temPermissao = false;

        // Regras baseadas nos níveis do banco de dados:
        if (href.includes('dashboard.html')) {
            temPermissao = [0, 1, 2].includes(nivel);
        } else if (href.includes('relatorios.html')) {
            temPermissao = [0, 1, 2].includes(nivel);
        } else if (href.includes('usuarios.html')) {
            temPermissao = [0, 1, 3].includes(nivel);
        } else if (href.includes('estoque.html')) {
            temPermissao = [0, 1, 4, 5].includes(nivel);
        }

        // Se não tiver permissão, esconde o ícone
        if (!temPermissao) {
            link.style.display = 'none';
        }
    });

    // 4. CONTROLE ESPECÍFICO DA TELA DE ESTOQUE
    if (window.location.pathname.includes('estoque.html')) {
        if (nivel === 5) { // Repositor
            const botoesToolbar = document.querySelectorAll('.toolbar .btn');
            botoesToolbar.forEach(btn => btn.style.display = 'none');

            const thAcoes = document.querySelector('table th:last-child');
            if (thAcoes && thAcoes.innerText.toUpperCase().includes('AÇÕES')) {
                thAcoes.style.display = 'none';
            }
        }
    }

    // 5. FUNCIONAMENTO DO BOTÃO SAIR (LOGOUT)
    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.clear(); // Apaga quem estava logado
            window.location.href = 'index.html'; // Volta pro login
        });
    }

    // ==========================================
    // 6. O BENDITO MENU SANDUÍCHE (MOBILE)
    // ==========================================
    const btnMenu = document.querySelector('.mobile-menu-btn');
    const menuNav = document.querySelector('.topbar-menu');

    if (btnMenu && menuNav) {
        // Escuta o clique no botão
        btnMenu.addEventListener('click', function(event) {
            event.preventDefault(); // Evita qualquer comportamento de "pulo" na tela
            menuNav.classList.toggle('open'); // Aciona a animação do CSS que fizemos
        });
    }
});