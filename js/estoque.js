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

        // Usa a nova função renderizarTabela para desenhar
        renderizarTabela(listaProdutos);

        

        // Dispara o evento de permissões para ocultar os botões se o usuário for "Repositor"
        

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
    document.getElementById('prod-custo').value = produto.custo || "";
    document.getElementById('prod-cest').value = produto.cest || "";
    document.getElementById('prod-imposto').value = produto.aliquotas_imposto || "";
    document.getElementById('prod-ncm').value = produto.ncm || "";
    document.getElementById('prod-promocional').value = produto.valor_promocional || "";
    document.getElementById('prod-em-promocao').value = produto.em_promocao || 0;
    document.getElementById('prod-lote').value = produto.lote || "";
    // Validade vem do banco, garantir que corte a hora se houver
    document.getElementById('prod-validade').value = produto.validade ? produto.validade.split('T')[0] : "";

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
        unidade_venda: document.getElementById('prod-unidade').value,
        custo: document.getElementById('prod-custo').value,
        cest: document.getElementById('prod-cest').value,
        aliquotas_imposto: document.getElementById('prod-imposto').value,
        ncm: document.getElementById('prod-ncm').value,
        valor_promocional: document.getElementById('prod-promocional').value,
        em_promocao: document.getElementById('prod-em-promocao').value,
        lote: document.getElementById('prod-lote').value,
        validade: document.getElementById('prod-validade').value
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

// ==========================================
// 6. PESQUISA EM TEMPO REAL (DEBOUNCE)
// ==========================================
const inputPesquisa = document.getElementById('inputPesquisa');
let debounceTimer;

if (inputPesquisa) {
    inputPesquisa.addEventListener('input', (evento) => {
        clearTimeout(debounceTimer);
        const termo = evento.target.value.trim().toLowerCase();

        // Aguarda 300ms após o usuário parar de digitar
        debounceTimer = setTimeout(() => {
            // Se você já tem a rota no backend configurada (ex: /api/web/produtos/buscar?q=termo)
            // você pode fazer o fetch aqui. 
            // Porém, como já temos os produtos na memória em 'listaProdutos', 
            // podemos fazer a filtragem local incrivelmente rápida:
            
            filtrarTabela(termo);
            
            // NOTA: Se o seu banco for muito grande (+10.000 produtos) e não vierem todos de uma vez, 
            // ative a chamada ao backend descomentando o código abaixo e ajustando a sua API:
            /*
            if (termo.length > 0) {
                buscarNoBackend(termo);
            } else {
                carregarProdutos(); // recarrega todos
            }
            */
            
        }, 300);
    });
}

// Filtro Local Rápido (Recomendado se todos os produtos já são carregados)
function filtrarTabela(termo) {
    const tbody = document.getElementById('tabela-estoque');
    
    // Se o termo estiver vazio, renderiza todos da memória
    if (!termo) {
        renderizarTabela(listaProdutos);
        return;
    }

    // Filtra pelo nome ou código de barras
    const produtosFiltrados = listaProdutos.filter(prod => {
        const nome = (prod.nome || "").toLowerCase();
        const codigo = (prod.codigo_barras || "").toLowerCase();
        return nome.includes(termo) || codigo.includes(termo);
    });

    renderizarTabela(produtosFiltrados);
}

// Função auxiliar para renderizar a tabela, separada do fetch original
function renderizarTabela(produtos) {
    const tbody = document.getElementById('tabela-estoque');
    tbody.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum produto encontrado.</td></tr>';
        return;
    }

    produtos.forEach(prod => {
        let classeBadge = '';
        let textoStatus = '';
        const qtd = parseFloat(prod.quantidade) || 0;
        const min = parseFloat(prod.quantidade_minima) || 1;
        
        if (qtd < min) { classeBadge = 'status-critical'; textoStatus = 'Crítico'; } 
        else if (qtd === min) { classeBadge = 'status-warning'; textoStatus = 'Alerta'; } 
        else if (qtd <= (min * 2)) { classeBadge = 'status-low'; textoStatus = 'Baixo'; } 
        else if (qtd <= (min * 4)) { classeBadge = 'status-medium'; textoStatus = 'Médio'; } 
        else { classeBadge = 'status-good'; textoStatus = 'Bom'; }

        let precoFinal = parseFloat(prod.preco_venda) || 0;
        let isPromocao = (prod.em_promocao == 1 || prod.em_promocao === '1' || prod.em_promocao === true);
        
        if (isPromocao && prod.valor_promocional && parseFloat(prod.valor_promocional) > 0) {
            precoFinal = parseFloat(prod.valor_promocional);
        }

        const precoFormatado = precoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        let tdPrecoHtml = `<td>${precoFormatado}</td>`;
        if (isPromocao) {
            tdPrecoHtml = `<td><span class="promo-badge" title="Preço Promocional">${precoFormatado}</span></td>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prod.codigo_barras || 'N/A'}</td>
            <td>${prod.nome}</td>
            <td>Geral</td>
            <td>${qtd} ${prod.unidade_venda}</td>
            ${tdPrecoHtml}
            <td><span class="status-badge ${classeBadge}">${textoStatus}</span></td>
            <td class="action-links">
                <button class="btn-action btn-edit" onclick="abrirModalEditar(${prod.id})">Editar</button>
                <button class="btn-action btn-delete" onclick="excluirProduto(${prod.id}, '${prod.nome}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    ocultarBotoesSeRepositor();
}

// Opcional: Se precisar buscar no backend de verdade
async function buscarNoBackend(termo) {
    const tbody = document.getElementById('tabela-estoque');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Buscando...</td></tr>';
    
    try {
        // Exemplo: rota que recebe ?q=termo
        const resposta = await fetch(`${urlAPIProdutos}/buscar?q=${encodeURIComponent(termo)}`);
        if (!resposta.ok) throw new Error('Erro ao buscar');
        
        const produtos = await resposta.json();
        listaProdutos = produtos; // Atualiza a memória
        renderizarTabela(produtos);
    } catch (erro) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Erro na pesquisa.</td></tr>';
    }
}