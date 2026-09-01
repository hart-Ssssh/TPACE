const urlAPIProdutos = "https://tpace-api.whyguiih.workers.dev/api/web/produtos";
const urlAPIUpload = "https://tpace-api.whyguiih.workers.dev/api/web/upload";
let listaProdutos = [];
let codigosBipados = []; // NOSSA VARIÁVEL GLOBAL SALVADORA!

document.addEventListener("DOMContentLoaded", function() {
    carregarProdutos();
    
    document.getElementById('form-produto').addEventListener('submit', salvarProduto);
    
    // Evita enviar o form sem querer ao dar Enter no código da edição
    const inputCodigoOriginal = document.getElementById('prod-codigo');
    if(inputCodigoOriginal) {
        inputCodigoOriginal.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') event.preventDefault(); 
        });
    }

    // O Input do Passo 2 (Bipar Vários)
    const inputBipar = document.getElementById('input-bipar');
    if (inputBipar) {
        inputBipar.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const codigo = this.value.trim();
                if (codigo && !codigosBipados.includes(codigo)) {
                    codigosBipados.push(codigo);
                    atualizarListaCodigos();
                    this.value = ''; // Limpa pra bipar o próximo
                }
            }
        });
    }
});

// ==========================================
// TRANSIÇÕES DE PASSOS E LISTA
// ==========================================
window.irParaPasso2 = function() {
    const form = document.getElementById('form-produto');
    if (!form.reportValidity()) return; // Barra se faltar campo obrigatório!
    
    document.getElementById('passo-1').style.display = 'none';
    document.getElementById('passo-2').style.display = 'block';
    setTimeout(() => document.getElementById('input-bipar').focus(), 100); 
};

window.voltarPasso1 = function() {
    document.getElementById('passo-2').style.display = 'none';
    document.getElementById('passo-1').style.display = 'block';
};

window.atualizarListaCodigos = function() {
    const divLista = document.getElementById('lista-codigos');
    divLista.innerHTML = '';
    codigosBipados.forEach((cod, index) => {
        divLista.innerHTML += `
        <div style="display: flex; justify-content: space-between; background: var(--bg-pesquisa); padding: 8px 12px; border-radius: 4px; color: var(--text-escuro);">
            <span><i class="fas fa-barcode"></i> ${cod}</span>
            <span style="color: var(--chart-rosa); cursor: pointer;" onclick="removerCodigo(${index})"><i class="fas fa-trash"></i></span>
        </div>`;
    });
};

window.removerCodigo = function(index) {
    codigosBipados.splice(index, 1);
    atualizarListaCodigos();
};

window.previewImagem = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-imagem').src = e.target.result;
            document.getElementById('preview-imagem').style.display = 'block';
            document.getElementById('icone-imagem').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
};

// ==========================================
// 1. CARREGAR E RENDERIZAR TABELA
// ==========================================
async function carregarProdutos() {
    const tbody = document.getElementById('tabela-estoque');
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Carregando produtos...</td></tr>';
    try {
        const resposta = await fetch(urlAPIProdutos);
        listaProdutos = await resposta.json();
        renderizarTabela(listaProdutos);
    } catch (erro) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Erro ao carregar o estoque.</td></tr>';
    }
}

// ==========================================
// 2. CONTROLE DO MODAL 
// ==========================================
window.abrirModalNovo = function() {
    document.getElementById('modal-titulo').innerText = "Adicionar Produto";
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').value = "";
    
    // Configura layout pra NOVO
    document.getElementById('container-codigo-barras').style.display = 'none';
    document.getElementById('btn-proximo').style.display = 'inline-block';
    document.getElementById('btn-salvar-edicao').style.display = 'none';
    
    // Reseta foto e códigos bipados
    document.getElementById('preview-imagem').src = "";
    document.getElementById('preview-imagem').style.display = "none";
    document.getElementById('icone-imagem').style.display = "block";
    document.getElementById('prod-imagem-url').value = "";
    document.getElementById('prod-imagem').value = "";
    
    codigosBipados = [];
    atualizarListaCodigos();
    voltarPasso1();
    
    document.getElementById('modal-produto').classList.add('active');
};

window.abrirModalEditar = function(id) {
    const produto = listaProdutos.find(p => p.id === id);
    if (!produto) return;
    document.getElementById('modal-titulo').innerText = "Editar Produto";
    
    // Configura layout pra EDIÇÃO
    document.getElementById('container-codigo-barras').style.display = 'flex';
    document.getElementById('btn-proximo').style.display = 'none';
    document.getElementById('btn-salvar-edicao').style.display = 'inline-block';
    voltarPasso1(); 
    
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
    document.getElementById('prod-validade').value = produto.validade ? produto.validade.split('T')[0] : "";
    
    document.getElementById('prod-imagem-url').value = produto.foto || "";
    if (produto.foto) {
        document.getElementById('preview-imagem').src = produto.foto;
        document.getElementById('preview-imagem').style.display = "block";
        document.getElementById('icone-imagem').style.display = "none";
    } else {
        document.getElementById('preview-imagem').src = "";
        document.getElementById('preview-imagem').style.display = "none";
        document.getElementById('icone-imagem').style.display = "block";
    }
    
    document.getElementById('modal-produto').classList.add('active');
};

window.fecharModal = function() {
    document.getElementById('modal-produto').classList.remove('active');
};

// ==========================================
// 3. SALVAR PRODUTO(S) NA API
// ==========================================
async function salvarProduto(event) {
    event.preventDefault();
    const btn = event.submitter;
    const textoOriginal = btn.innerText;
    btn.innerText = "Salvando...";
    btn.disabled = true;

    try {
        let imagemUrl = document.getElementById('prod-imagem-url').value;
        const fileInput = document.getElementById('prod-imagem');
        
        // --- UPLOAD DA FOTO ---
        if (fileInput.files.length > 0) {
            btn.innerText = "Enviando Imagem...";
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            const resUpload = await fetch(urlAPIUpload, { method: 'POST', body: formData });
            const dataUpload = await resUpload.json();
            
            if (dataUpload.sucesso && dataUpload.url) {
                imagemUrl = dataUpload.url;
            } else {
                throw new Error("Falha no upload da imagem");
            }
        }
        
        btn.innerText = "Salvando Banco...";
        const id = document.getElementById('prod-id').value;
        const isNovo = (id === "");
        
        // TRATAMENTO CONTRA O "ERRO 500" DO BANCO
        const parseNum = (val) => (!val || val.trim() === "") ? null : Number(val);
        const parseText = (val) => (!val || val.trim() === "") ? null : val.trim();

        // Dados base (sem o código de barras, que vai depender de qual modo estamos)
        const dadosBase = {
            nome: parseText(document.getElementById('prod-nome').value),
            preco_venda: parseNum(document.getElementById('prod-preco').value),
            quantidade: parseNum(document.getElementById('prod-qtd').value),
            quantidade_minima: parseNum(document.getElementById('prod-minimo').value),
            unidade_venda: document.getElementById('prod-unidade').value,
            custo: parseNum(document.getElementById('prod-custo').value),
            cest: parseText(document.getElementById('prod-cest').value),
            aliquotas_imposto: parseNum(document.getElementById('prod-imposto').value),
            ncm: parseText(document.getElementById('prod-ncm').value),
            valor_promocional: parseNum(document.getElementById('prod-promocional').value),
            em_promocao: parseNum(document.getElementById('prod-em-promocao').value),
            lote: parseText(document.getElementById('prod-lote').value),
            validade: parseText(document.getElementById('prod-validade').value),
            foto: imagemUrl
        };

        if (isNovo) {
            // == MODO LOTE (VARIOS PRODUTOS) ==
            if (codigosBipados.length === 0) codigosBipados.push(""); // Se não bipou nada, salva um sem código
            
            for (let codigo of codigosBipados) {
                const dadosLote = { ...dadosBase, codigo_barras: parseText(codigo) };
                await fetch(urlAPIProdutos, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosLote)
                });
            }
        } else {
            // == MODO EDIÇÃO (UM PRODUTO SÓ) ==
            const dadosUnico = { ...dadosBase, codigo_barras: parseText(document.getElementById('prod-codigo').value) };
            await fetch(`${urlAPIProdutos}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosUnico)
            });
        }

        fecharModal();
        carregarProdutos();
        
    } catch (erro) {
        alert("Erro no processamento: " + erro.message);
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}

// ==========================================
// 4. RESTANTE DAS FUNÇÕES ORIGINAIS
// ==========================================
window.excluirProduto = async function(id, nomeProduto) {
    const confirmacao = confirm(`Tem certeza que deseja excluir o produto "${nomeProduto}"?`);
    if (confirmacao) {
        try {
            const resposta = await fetch(`${urlAPIProdutos}/${id}`, { method: 'DELETE' });
            if (resposta.ok) carregarProdutos();
            else alert("Erro ao excluir produto.");
        } catch (erro) {
            alert("Erro de conexão com a API.");
        }
    }
};

function ocultarBotoesSeRepositor() {
    const nivel = parseInt(localStorage.getItem('tpace_usuario_nivel'));
    if (nivel === 5) {
        document.querySelectorAll('.action-links, .action-links-mobile').forEach(td => td.style.display = 'none');
    }
}

const inputPesquisa = document.getElementById('inputPesquisa');
let debounceTimer;
if (inputPesquisa) {
    inputPesquisa.addEventListener('input', (evento) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => filtrarTabela(evento.target.value.trim().toLowerCase()), 300);
    });
}

function filtrarTabela(termo) {
    if (!termo) return renderizarTabela(listaProdutos);
    const filtrados = listaProdutos.filter(prod => {
        const nome = (prod.nome || "").toLowerCase();
        const codigo = (prod.codigo_barras || "").toLowerCase();
        return nome.includes(termo) || codigo.includes(termo);
    });
    renderizarTabela(filtrados);
}

function renderizarTabela(produtos) {
    const tbody = document.getElementById('tabela-estoque');
    tbody.innerHTML = '';
    if (!produtos || produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum produto encontrado.</td></tr>';
        return;
    }
    produtos.forEach(prod => {
        let classeBadge = '', textoStatus = '';
        const qtd = parseFloat(prod.quantidade) || 0;
        const min = parseFloat(prod.quantidade_minima) || 1;
        
        if (qtd < min) { classeBadge = 'status-critical'; textoStatus = 'Crítico'; } 
        else if (qtd === min) { classeBadge = 'status-warning'; textoStatus = 'Alerta'; } 
        else if (qtd <= (min * 2)) { classeBadge = 'status-low'; textoStatus = 'Baixo'; } 
        else if (qtd <= (min * 4)) { classeBadge = 'status-medium'; textoStatus = 'Médio'; } 
        else { classeBadge = 'status-good'; textoStatus = 'Bom'; }

        let precoFinal = parseFloat(prod.preco_venda) || 0;
        let isPromocao = (prod.em_promocao == 1 || prod.em_promocao === '1' || prod.em_promocao === true);
        if (isPromocao && prod.valor_promocional && parseFloat(prod.valor_promocional) > 0) precoFinal = parseFloat(prod.valor_promocional);
        const precoFormatado = precoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let conteudoPreco = isPromocao ? `<span class="promo-badge">${precoFormatado}</span>` : precoFormatado;

        const trPrincipal = document.createElement('tr');
        trPrincipal.className = "linha-produto";
        trPrincipal.onclick = () => toggleDetalhesEstoque(prod.id); 
        trPrincipal.innerHTML = `
            <td>${prod.codigo_barras || 'N/A'}</td>
            <td>${prod.nome}</td>
            <td class="col-desktop">Geral</td>
            <td class="col-desktop">${qtd} ${prod.unidade_venda}</td>
            <td class="col-desktop">${conteudoPreco}</td>
            <td class="col-desktop"><span class="status-badge ${classeBadge}">${textoStatus}</span></td>
            <td class="col-desktop action-links">
                <button class="btn-action btn-edit" onclick="event.stopPropagation(); abrirModalEditar(${prod.id})">Editar</button>
                <button class="btn-action btn-delete" onclick="event.stopPropagation(); excluirProduto(${prod.id}, '${prod.nome}')">Excluir</button>
            </td>
            <td class="td-seta"><i class="fas fa-chevron-down seta-tabela" id="seta-${prod.id}"></i></td>
        `;
        tbody.appendChild(trPrincipal);

        const trDetalhes = document.createElement('tr');
        trDetalhes.id = `detalhes-${prod.id}`;
        trDetalhes.className = 'detalhes-row';
        trDetalhes.innerHTML = `
            <td colspan="3">
                <div class="detalhes-content">
                    <div class="detalhe-item"><b>Quantidade:</b> <span>${qtd} ${prod.unidade_venda}</span></div>
                    <div class="detalhe-item"><b>Preço:</b> <span>${conteudoPreco}</span></div>
                    <div class="detalhe-item"><b>Status:</b> <span class="status-badge ${classeBadge}">${textoStatus}</span></div>
                    <div class="detalhes-acoes action-links-mobile">
                        <button class="btn-action btn-edit" onclick="abrirModalEditar(${prod.id})">Editar</button>
                        <button class="btn-action btn-delete" onclick="excluirProduto(${prod.id}, '${prod.nome}')">Excluir</button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(trDetalhes);
    });
    ocultarBotoesSeRepositor();
}

window.toggleDetalhesEstoque = function(id) {
    const linha = document.getElementById(`detalhes-${id}`);
    const seta = document.getElementById(`seta-${id}`);
    if (linha && seta) {
        linha.classList.toggle('open');
        seta.classList.toggle('ativa');
    }
};