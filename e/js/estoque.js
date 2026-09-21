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
        estoque_minimo: parseFloat(document.getElementById('prod-minimo').value) || 0
    };

    try {
        if (isNovo) {
            await fetch(`${URL_BASE}/produto/cadastrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosFormulario)
            });
        } else {
            // Edição em lote usando a nova rota segura enviando o ID real do produto
            await fetch(`${URL_BASE}/produto/editar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: idValue, ...dadosFormulario })
            });
        }
        
        if(typeof fecharModal === 'function') fecharModal();
        carregarProdutos();
    } catch (erro) {
        alert("Erro no processamento: " + erro.message);
    } finally {
        btn.innerText = "Salvar";
        btn.disabled = false;
    }
}

window.excluirProduto = async function(id_cardapio, nomeProduto) {
    if (confirm(`Tem certeza que deseja excluir "${nomeProduto}"?`)) {
        try {
            await fetch(`${URL_BASE}/produto/excluir`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id_cardapio })
            });
            carregarProdutos();
        } catch (erro) {
            alert("Erro de conexão ao excluir.");
        }
    }
}

window.abrirModalEditar = function(id_cardapio) {
    const produto = listaProdutos.find(p => p.id_cardapio == id_cardapio);
    if (!produto) return;
    
    document.getElementById('modal-titulo').innerText = "Editar Produto";
    document.getElementById('prod-id').value = produto.id_cardapio;
    
    document.getElementById('prod-nome').value = produto.nome_produto || "";
    document.getElementById('prod-codigo').value = produto.codigo_barras || "";
    document.getElementById('prod-preco').value = produto.preco || "";
    document.getElementById('prod-qtd').value = produto.quantidade || 0;
    document.getElementById('prod-minimo').value = produto.quantidade_minima || 0;
    
    document.getElementById('btn-salvar-edicao').style.display = 'inline-block';
    
    // Mostra o formulário visualmente
    if (typeof voltarPasso1 === 'function') voltarPasso1();
    document.getElementById('modal-produto').classList.add('active');
}

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
                <button class="btn-action btn-edit" onclick="abrirModalEditar('${prod.id_cardapio}')">Editar</button>
                <button class="btn-action btn-delete" onclick="excluirProduto('${prod.id_cardapio}', '${prod.nome_produto}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}