const URL_BASE = "https://codecream.larissagazoli45.workers.dev";
let listaProdutos = [];

document.addEventListener("DOMContentLoaded", function() {
    carregarProdutos();
    document.getElementById('form-produto').addEventListener('submit', salvarProduto);
});

async function carregarProdutos() {
    const tbody = document.getElementById('tabela-estoque');
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Carregando produtos...</td></tr>';
    
    try {
        const resposta = await fetch(`${URL_BASE}/produtos`);
        listaProdutos = await resposta.json();
        renderizarTabela(listaProdutos);
    } catch (erro) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Erro ao carregar o estoque.</td></tr>';
    }
}

async function salvarProduto(event) {
    event.preventDefault();
    const btn = event.submitter;
    btn.innerText = "Salvando...";
    btn.disabled = true;

    const idValue = document.getElementById('prod-id').value;
    const isNovo = (idValue === "");

    const dadosFormulario = {
        nome: document.getElementById('prod-nome').value,
        codigo: document.getElementById('prod-codigo').value,
        preco: parseFloat(document.getElementById('prod-preco').value) || 0,
        quantidade: parseFloat(document.getElementById('prod-qtd').value) || 0,
        estoque_minimo: parseFloat(document.getElementById('prod-minimo').value) || 0,
        // Como a sua API não tem rota de upload de foto nativa, enviamos a URL ou nulo
        foto: document.getElementById('prod-imagem-url').value || null 
    };

    try {
        if (isNovo) {
            await fetch(`${URL_BASE}/produto/cadastrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosFormulario)
            });
        } else {
            // Sua API atualiza uma coluna por vez na rota /produto/atualizar
            // Fazemos um loop pelos campos alterados
            const campos = ['nome_produto', 'codigo_barras', 'preco', 'quantidade', 'quantidade_minima'];
            const valores = [dadosFormulario.nome, dadosFormulario.codigo, dadosFormulario.preco, dadosFormulario.quantidade, dadosFormulario.estoque_minimo];
            
            for(let i = 0; i < campos.length; i++) {
                await fetch(`${URL_BASE}/produto/atualizar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: idValue, coluna: campos[i], valor: valores[i] })
                });
            }
        }
        fecharModal();
        carregarProdutos();
    } catch (erro) {
        alert("Erro no processamento: " + erro.message);
    } finally {
        btn.innerText = "Salvar";
        btn.disabled = false;
    }
}

window.excluirProduto = async function(codigo_barras, nomeProduto) {
    if (confirm(`Tem certeza que deseja excluir "${nomeProduto}"?`)) {
        try {
            await fetch(`${URL_BASE}/produto/deletar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo: codigo_barras })
            });
            carregarProdutos();
        } catch (erro) {
            alert("Erro de conexão ao excluir.");
        }
    }
}

// Adaptação rápida da renderização para os nomes de colunas da sua API (id_cardapio, nome_produto)
function renderizarTabela(produtos) {
    const tbody = document.getElementById('tabela-estoque');
    tbody.innerHTML = '';
    
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum produto.</td></tr>';
        return;
    }

    produtos.forEach(prod => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prod.codigo_barras || 'N/A'}</td>
            <td>${prod.nome_produto}</td>
            <td class="col-desktop">${prod.tipo || '-'}</td>
            <td class="col-desktop">${prod.quantidade || 0}</td>
            <td class="col-desktop">R$ ${prod.preco || '0,00'}</td>
            <td class="col-desktop"><span class="status-badge status-good">Estoque</span></td>
            <td class="col-desktop action-links">
                <button class="btn-action btn-delete" onclick="excluirProduto('${prod.codigo_barras}', '${prod.nome_produto}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}