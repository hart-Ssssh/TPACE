// ATENÇÃO: Verifique se essa é a URL correta do seu Worker
const urlAPIProdutos = "https://tpace-api.whyguiih.workers.dev/api/web/produtos";

// Variável global para guardar a lista de produtos na memória e facilitar a edição
let listaProdutos = [];

document.addEventListener("DOMContentLoaded", function() {
    carregarProdutos();

    // Quando o usuário clicar em "Salvar" no formulário do Modal
    document.getElementById('form-produto').addEventListener('submit', salvarProduto);
});

// ==========================================
// 1. LISTAR PRODUTOS NA TABELA
// ==========================================
async function carregarProdutos() {
    const tbody = document.getElementById('tabela-estoque');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Carregando produtos...</td></tr>';

    try {
        const resposta = await fetch(urlAPIProdutos);
        listaProdutos = await resposta.json();
        
        tbody.innerHTML = '';

        if(listaProdutos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        listaProdutos.forEach(prod => {
            // Lógica Inteligente de Cores de Estoque
            let classeBadge = '';
            let textoStatus = '';
            const qtd = parseFloat(prod.quantidade) || 0;
            const min = parseFloat(prod.quantidade_minima) || 1;
            
            if (qtd < min) { classeBadge = 'status-critical'; textoStatus = 'Crítico'; } 
            else if (qtd === min) { classeBadge = 'status-warning'; textoStatus = 'Alerta'; } 
            else if (qtd <= (min * 2)) { classeBadge = 'status-low'; textoStatus = 'Baixo'; } 
            else if (qtd <= (min * 4)) { classeBadge = 'status-medium'; textoStatus = 'Médio'; } 
            else { classeBadge = 'status-good'; textoStatus = 'Bom'; }

            const precoFormatado = parseFloat(prod.preco_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prod.codigo_barras || 'N/A'}</td>
                <td>${prod.nome}</td>
                <td>Geral</td>
                <td>${qtd} ${prod.unidade_venda}</td>
                <td>${precoFormatado}</td>
                <td><span class="status-badge ${classeBadge}">${textoStatus}</span></td>
                <td class="action-links">
                    <button class="btn-action btn-edit" onclick="abrirModalEditar(${prod.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="excluirProduto(${prod.id}, '${prod.nome}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Dispara o evento de permissões para ocultar os botões se o usuário for "Repositor"
        ocultarBotoesSeRepositor();

    } catch (erro) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar o estoque.</td></tr>';
    }
}

// ==========================================
// 2. CONTROLE DA JANELA MODAL
// ==========================================
function abrirModalNovo() {
    document.getElementById('modal-titulo').innerText = "Adicionar Produto";
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').value = ""; // Limpa o ID (indica que é novo)
    document.getElementById('modal-produto').classList.add('active');
}

function abrirModalEditar(id) {
    // Busca o produto na nossa memória pelo ID
    const produto = listaProdutos.find(p => p.id === id);
    if (!produto) return;

    document.getElementById('modal-titulo').innerText = "Editar Produto";
    
    // Preenche o formulário
    document.getElementById('prod-id').value = produto.id;
    document.getElementById('prod-nome').value = produto.nome;
    document.getElementById('prod-codigo').value = produto.codigo_barras;
    document.getElementById('prod-preco').value = produto.preco_venda;
    document.getElementById('prod-qtd').value = produto.quantidade;
    document.getElementById('prod-minimo').value = produto.quantidade_minima;
    document.getElementById('prod-unidade').value = produto.unidade_venda;

    // Mostra a janela
    document.getElementById('modal-produto').classList.add('active');
}

function fecharModal() {
    document.getElementById('modal-produto').classList.remove('active');
}

// ==========================================
// 3. SALVAR / ATUALIZAR PRODUTO
// ==========================================
async function salvarProduto(event) {
    event.preventDefault(); // Evita que a página recarregue

    const id = document.getElementById('prod-id').value;
    const isNovo = (id === ""); // Se não tem ID, estamos criando um novo

    const dados = {
        nome: document.getElementById('prod-nome').value,
        codigo_barras: document.getElementById('prod-codigo').value,
        preco_venda: document.getElementById('prod-preco').value,
        quantidade: document.getElementById('prod-qtd').value,
        quantidade_minima: document.getElementById('prod-minimo').value,
        unidade_venda: document.getElementById('prod-unidade').value
    };

    try {
        const url = isNovo ? urlAPIProdutos : `${urlAPIProdutos}/${id}`;
        const metodo = isNovo ? 'POST' : 'PUT';

        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            fecharModal();
            carregarProdutos(); // Recarrega a tabela para mostrar o novo produto
        } else {
            alert("Erro ao salvar produto no banco de dados.");
        }
    } catch (erro) {
        alert("Erro de conexão com a API.");
    }
}

// ==========================================
// 4. EXCLUIR PRODUTO
// ==========================================
async function excluirProduto(id, nomeProduto) {
    // Estilo "JOptionPane": Pergunta antes de deletar!
    const confirmacao = confirm(`Tem certeza que deseja excluir o produto "${nomeProduto}"? Essa ação não pode ser desfeita.`);
    
    if (confirmacao) {
        try {
            const resposta = await fetch(`${urlAPIProdutos}/${id}`, { method: 'DELETE' });
            if (resposta.ok) {
                carregarProdutos(); // Atualiza a tabela após sumir com ele
            } else {
                alert("Erro ao excluir produto.");
            }
        } catch (erro) {
            alert("Erro de conexão com a API.");
        }
    }
}

// ==========================================
// 5. PROTEÇÃO DE PERMISSÕES RE-APLICADA
// ==========================================
function ocultarBotoesSeRepositor() {
    const nivel = parseInt(localStorage.getItem('tpace_usuario_nivel'));
    if (nivel === 5) {
        const tdAcoes = document.querySelectorAll('.action-links');
        tdAcoes.forEach(td => td.style.display = 'none');
    }
}