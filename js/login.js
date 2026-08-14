document.getElementById('form-login').addEventListener('submit', async function(event) {
    // Evita que a página recarregue ao clicar em "Entrar"
    event.preventDefault();

    const usuarioInput = document.getElementById('usuario').value;
    const senhaInput = document.getElementById('senha').value;
    const mensagemErro = document.getElementById('mensagem-erro');
    const botaoEntrar = document.querySelector('button[type="submit"]');

    // Limpa erro e mostra que está carregando
    mensagemErro.innerText = "";
    botaoEntrar.innerText = "CARREGANDO...";
    botaoEntrar.disabled = true;

    try {
        // ================================================================
        // ATENÇÃO: Substitua o link abaixo pela URL real do seu Worker!
        // ================================================================
        const urlDaSuaAPI = "https://tpace-api.whyguiih.workers.dev/api/web/login";

        // Faz o POST para a API mandando o nome e a senha
        const resposta = await fetch(urlDaSuaAPI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: usuarioInput,
                senha: senhaInput
            })
        });

        // Converte a resposta da API para ler os dados
        const dados = await resposta.json();

        // Verifica se a API retornou sucesso
        if (dados.sucesso === true) {
            
            // Salva as informações puxadas do banco no navegador
            localStorage.setItem('tpace_usuario_nivel', dados.usuario.nivel_acesso);
            localStorage.setItem('tpace_usuario_nome', dados.usuario.nome);

            // REDIRECIONAMENTO INTELIGENTE
            // Se for Estoque (4) ou Repositor (5), vai direto pro Estoque. Senão, Dash.
            if (dados.usuario.nivel_acesso === 4 || dados.usuario.nivel_acesso === 5) {
                window.location.href = 'estoque.html';
            } else {
                window.location.href = 'dashboard.html';
            }

        } else {
            // Se a API disse que a senha tá errada, mostra o erro na tela
            mensagemErro.innerText = dados.erro;
            botaoEntrar.innerText = "ENTRAR";
            botaoEntrar.disabled = false;
        }

    } catch (erro) {
        // Se a internet cair ou o link da API estiver errado
        mensagemErro.innerText = "Erro ao conectar com o banco de dados.";
        botaoEntrar.innerText = "ENTRAR";
        botaoEntrar.disabled = false;
    }
});