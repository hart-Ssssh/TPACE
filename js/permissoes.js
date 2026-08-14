document.addEventListener("DOMContentLoaded", function() {
    // Puxa o nível e o nome salvos na hora do login
    const nivelStr = localStorage.getItem('tpace_usuario_nivel');
    const nomeUsuario = localStorage.getItem('tpace_usuario_nome');

    // 1. BARREIRA DE SEGURANÇA: Se não tem nível, não logou. Chuta pro login.
    if (nivelStr === null) {
        window.location.href = 'index.html';
        return;
    }

    const nivel = parseInt(nivelStr);

    // 2. ATUALIZA O NOME DO USUÁRIO NO TOPO (Mimo visual)
    const userSpan = document.querySelector('.user-info span');
    if (userSpan && nomeUsuario) {
        userSpan.innerText = nomeUsuario;
    }

    // ==========================================
    // 3. CONTROLE DO MENU SUPERIOR (NÍVEIS DE ACESSO)
    // ==========================================
    const linksMenu = document.querySelectorAll('.menu-link');
    
    linksMenu.forEach(link => {
        const href = link.getAttribute('href');
        
        // O botão de sair (href="#") sempre aparece para todos
        if (href === 'index.html') return;

        let temPermissao = false;

        // Regras baseadas nos níveis do banco de dados:
        if (href.includes('dashboard.html')) {
            // Admin (0), Gerente (1), Financeiro (2)
            temPermissao = [0, 1, 2].includes(nivel);
        } else if (href.includes('relatorios.html')) {
            // Admin (0), Gerente (1), Financeiro (2)
            temPermissao = [0, 1, 2].includes(nivel);
        } else if (href.includes('usuarios.html')) {
            // Admin (0), Gerente (1), RH (3)
            temPermissao = [0, 1, 3].includes(nivel);
        } else if (href.includes('estoque.html')) {
            // Admin (0), Gerente (1), Gerente Estoque (4), Repositor (5)
            temPermissao = [0, 1, 4, 5].includes(nivel);
        }

        // Se o nível da pessoa não estiver na lista acima, oculta o ícone
        if (!temPermissao) {
            link.style.display = 'none';
        }
    });

    // ==========================================
    // 4. CONTROLE ESPECÍFICO DA TELA DE ESTOQUE
    // ==========================================
    if (window.location.pathname.includes('estoque.html')) {
        
        // Se for Repositor (5), modo apenas visualização
        if (nivel === 5) {
            // Esconde os botões "Exportar Relatório" e "+ Adicionar Produto"
            const botoesToolbar = document.querySelectorAll('.toolbar .btn');
            botoesToolbar.forEach(btn => btn.style.display = 'none');

            // Esconde o título da coluna "Ações"
            const thAcoes = document.querySelector('table th:last-child');
            if (thAcoes && thAcoes.innerText.toUpperCase().includes('AÇÕES')) {
                thAcoes.style.display = 'none';
            }

            // Esconde os links "Editar / Excluir" de todas as linhas da tabela
            const tdAcoes = document.querySelectorAll('.action-links');
            tdAcoes.forEach(td => td.style.display = 'none');
        }
    }

    // ==========================================
    // 5. FUNCIONAMENTO DO BOTÃO SAIR (LOGOUT)
    // ==========================================
    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', function(e) {
            e.preventDefault();
            // Apaga quem estava logado
            localStorage.clear();
            // Volta para a tela de login
            window.location.href = 'index.html';
        });
    }
});