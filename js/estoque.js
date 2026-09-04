const urlAPIProdutos = "https://tpace-api.whyguiih.workers.dev/api/web/produtos";
const urlAPIUpload = "https://tpace-api.whyguiih.workers.dev/api/web/upload";
let listaProdutos = [];
let codigosBipados = []; 

document.addEventListener("DOMContentLoaded", function() {
    carregarProdutos();
    
    document.getElementById('form-produto').addEventListener('submit', salvarProduto);
    
    const inputCodigoOriginal = document.getElementById('prod-codigo');
    if(inputCodigoOriginal) {
        inputCodigoOriginal.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') event.preventDefault(); 
        });
    }

    const inputBipar = document.getElementById('input-bipar');
    if (inputBipar) {
        inputBipar.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const codigo = this.value.trim();
                if (codigo && !codigosBipados.includes(codigo)) {
                    codigosBipados.push(codigo);
                    atualizarListaCodigos();
                    this.value = ''; 
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
    if (!form.reportValidity()) return; 
    
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

function gerarCodigoGeral() {
    let codigo = '';
    for (let i = 0; i < 13; i++) {
        codigo += Math.floor(Math.random() * 10);
    }
    return codigo;
}

// ==========================================
// 1. CARREGAR E RENDERIZAR TABELA (AGRUPADA)
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
    
    // GERA O CÓDIGO GERAL PARA O NOVO LOTE
    document.getElementById('prod-codigo-geral').value = gerarCodigoGeral();
    
    document.getElementById('container-codigo-barras').style.display = 'none';
    document.getElementById('btn-proximo').style.display = 'inline-block';
    document.getElementById('btn-salvar-edicao').style.display = 'none';
    
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

// Agora a função recebe a CHAVE do grupo em vez de um único ID
window.abrirModalEditar = function(chave_grupo) {
    // Filtra todos os itens que pertencem a este grupo (mesmo codigo_geral ou mesmo id se for solto)
    const itensDoGrupo = listaProdutos.filter(p => {
        const c = p.codigo_geral ? `geral_${p.codigo_geral}` : `id_${p.id}`;
        return c === chave_grupo;
    });
    
    if (itensDoGrupo.length === 0) return;
    const produtoBase = itensDoGrupo[0]; // Usamos o primeiro item como base para preencher o formulário
    
    document.getElementById('modal-titulo').innerText = "Editar Produto";
    
    // Se tiver mais de 1 item no grupo, escondemos o input de código de barras para não sobrescrever
    if (itensDoGrupo.length > 1) {
        document.getElementById('container-codigo-barras').style.display = 'none';
    } else {
        document.getElementById('container-codigo-barras').style.display = 'flex';
    }
    
    document.getElementById('btn-proximo').style.display = 'none';
    document.getElementById('btn-salvar-edicao').style.display = 'inline-block';
    voltarPasso1(); 
    
    // Salvamos a lista de IDs como um Array (texto JSON) no input oculto
    document.getElementById('prod-id').value = JSON.stringify(itensDoGrupo.map(i => i.id));
    
    document.getElementById('prod-codigo-geral').value = produtoBase.codigo_geral || "";
    document.getElementById('prod-nome').value = produtoBase.nome;
    document.getElementById('prod-codigo').value = produtoBase.codigo_barras || "";
    document.getElementById('prod-preco').value = produtoBase.preco_venda;
    document.getElementById('prod-qtd').value = produtoBase.quantidade;
    document.getElementById('prod-minimo').value = produtoBase.quantidade_minima;
    document.getElementById('prod-unidade').value = produtoBase.unidade_venda;
    document.getElementById('prod-custo').value = produtoBase.custo || "";
    document.getElementById('prod-cest').value = produtoBase.cest || "";
    document.getElementById('prod-imposto').value = produtoBase.aliquotas_imposto || "";
    document.getElementById('prod-ncm').value = produtoBase.ncm || "";
    document.getElementById('prod-promocional').value = produtoBase.valor_promocional || "";
    document.getElementById('prod-em-promocao').value = produtoBase.em_promocao || 0;
    document.getElementById('prod-lote').value = produtoBase.lote || "";
    document.getElementById('prod-validade').value = produtoBase.validade ? produtoBase.validade.split('T')[0] : "";
    
    document.getElementById('prod-imagem-url').value = produtoBase.foto || "";
    if (produtoBase.foto) {
        document.getElementById('preview-imagem').src = produtoBase.foto;
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
// 3. SALVAR (CRIAÇÃO OU ATUALIZAÇÃO EM LOTE)
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
        const idValue = document.getElementById('prod-id').value;
        const isNovo = (idValue === "");
        
        const parseNum = (val) => (!val || val.trim() === "") ? null : Number(val);
        const parseText = (val) => (!val || val.trim() === "") ? null : val.trim();

        const dadosBase = {
            nome: parseText(document.getElementById('prod-nome').value),
            codigo_geral: parseText(document.getElementById('prod-codigo-geral').value),
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
            // == MODO LOTE NOVO ==
            if (codigosBipados.length === 0) codigosBipados.push(""); 
            
            // Promise.all executa todos os envios juntos de uma vez, muito mais rápido!
            const promessas = codigosBipados.map(codigo => {
                const dadosLote = { ...dadosBase, codigo_barras: parseText(codigo) };
                return fetch(urlAPIProdutos, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosLote)
                });
            });
            await Promise.all(promessas);

        } else {
            // == MODO EDIÇÃO (ÚNICO OU LOTE) ==
            const idsArray = JSON.parse(idValue); // Transforma o texto de volta num array de IDs
            
            const promessas = idsArray.map(id => {
                const original = listaProdutos.find(p => p.id === id);
                // Mantém o código de barras original do item, apenas atualiza o resto
                const dadosAtualizados = { 
                    ...dadosBase, 
                    codigo_barras: original ? original.codigo_barras : null 
                };
                return fetch(`${urlAPIProdutos}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizados)
                });
            });
            await Promise.all(promessas);
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
// 4. EXCLUIR PRODUTO(S) AGRUPADO(S)
// ==========================================
window.excluirProduto = async function(chave_grupo, nomeProduto) {
    const confirmacao = confirm(`Tem certeza que deseja excluir "${nomeProduto}"? Isso apagará todas as unidades vinculadas.`);
    if (confirmacao) {
        try {
            // Encontra todos os IDs vinculados a essa chave
            const itens = listaProdutos.filter(p => {
                const c = p.codigo_geral ? `geral_${p.codigo_geral}` : `id_${p.id}`;
                return c === chave_grupo;
            });
            
            // Deleta todos juntos
            const promessas = itens.map(item => fetch(`${urlAPIProdutos}/${item.id}`, { method: 'DELETE' }));
            await Promise.all(promessas);
            
            carregarProdutos();
        } catch (erro) {
            alert("Erro de conexão ao excluir produtos.");
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
            // O segredo: Converter explicitamente para String() antes do toLowerCase()
            const nome = String(prod.nome || "").toLowerCase();
            const codigo = String(prod.codigo_barras || "").toLowerCase();
            const geral = String(prod.codigo_geral || "").toLowerCase();
            
            return nome.includes(termo) || codigo.includes(termo) || geral.includes(termo);
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

    // A MÁGICA DO AGRUPAMENTO (SEM SOMAR QUANTIDADES)
    const grupos = {};
    produtos.forEach(prod => {
        const chave = prod.codigo_geral ? `geral_${prod.codigo_geral}` : `id_${prod.id}`;
        if (!grupos[chave]) {
            // Guarda o produto como base (molde) para o grupo inteiro
            grupos[chave] = { 
                ...prod, 
                chave_grupo: chave,
                ids: [prod.id]
            };
        } else {
            // Apenas adiciona o ID novo na lista, mas mantém as informações do molde intactas
            grupos[chave].ids.push(prod.id);
        }
    });

    const produtosAgrupados = Object.values(grupos);

    produtosAgrupados.forEach(grupo => {
        let classeBadge = '', textoStatus = '';
        
        // Agora pegamos a quantidade exata do molde, sem multiplicar nada!
        const qtd = parseFloat(grupo.quantidade) || 0; 
        const min = parseFloat(grupo.quantidade_minima) || 1; 
        
        if (qtd < min) { classeBadge = 'status-critical'; textoStatus = 'Crítico'; } 
        else if (qtd === min) { classeBadge = 'status-warning'; textoStatus = 'Alerta'; } 
        else if (qtd <= (min * 2)) { classeBadge = 'status-low'; textoStatus = 'Baixo'; } 
        else if (qtd <= (min * 4)) { classeBadge = 'status-medium'; textoStatus = 'Médio'; } 
        else { classeBadge = 'status-good'; textoStatus = 'Bom'; }

        let precoFinal = parseFloat(grupo.preco_venda) || 0;
        let isPromocao = (grupo.em_promocao == 1 || grupo.em_promocao === '1' || grupo.em_promocao === true);
        
        if (isPromocao && grupo.valor_promocional && parseFloat(grupo.valor_promocional) > 0) {
            precoFinal = parseFloat(grupo.valor_promocional);
        }
        
        const precoFormatado = precoFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let conteudoPreco = isPromocao ? `<span class="promo-badge">${precoFormatado}</span>` : precoFormatado;

        // Se for lote, mostra "Múltiplos", senão mostra o código normal
        let textoCodigo = grupo.codigo_barras || 'N/A';
        if (grupo.ids.length > 1) {
            textoCodigo = `<i class="fas fa-layer-group" style="color: var(--text-secundario); margin-right: 5px;"></i>Múltiplos (${grupo.ids.length})`;
        }

        const trPrincipal = document.createElement('tr');
        trPrincipal.className = "linha-produto";
        trPrincipal.onclick = () => toggleDetalhesEstoque(grupo.chave_grupo); 
        trPrincipal.innerHTML = `
            <td>${textoCodigo}</td>
            <td>${grupo.nome}</td>
            <td class="col-desktop">Geral</td>
            <td class="col-desktop">${qtd} ${grupo.unidade_venda}</td>
            <td class="col-desktop">${conteudoPreco}</td>
            <td class="col-desktop"><span class="status-badge ${classeBadge}">${textoStatus}</span></td>
            <td class="col-desktop action-links">
                <button class="btn-action btn-edit" onclick="event.stopPropagation(); abrirModalEditar('${grupo.chave_grupo}')">Editar</button>
                <button class="btn-action btn-delete" onclick="event.stopPropagation(); excluirProduto('${grupo.chave_grupo}', '${grupo.nome}')">Excluir</button>
            </td>
            <td class="td-seta"><i class="fas fa-chevron-down seta-tabela" id="seta-${grupo.chave_grupo}"></i></td>
        `;
        tbody.appendChild(trPrincipal);

        const trDetalhes = document.createElement('tr');
        trDetalhes.id = `detalhes-${grupo.chave_grupo}`;
        trDetalhes.className = 'detalhes-row';
        trDetalhes.innerHTML = `
            <td colspan="3">
                <div class="detalhes-content">
                    <div class="detalhe-item"><b>Quantidade:</b> <span>${qtd} ${grupo.unidade_venda}</span></div>
                    <div class="detalhe-item"><b>Preço:</b> <span>${conteudoPreco}</span></div>
                    <div class="detalhe-item"><b>Status:</b> <span class="status-badge ${classeBadge}">${textoStatus}</span></div>
                    <div class="detalhes-acoes action-links-mobile">
                        <button class="btn-action btn-edit" onclick="abrirModalEditar('${grupo.chave_grupo}')">Editar</button>
                        <button class="btn-action btn-delete" onclick="excluirProduto('${grupo.chave_grupo}', '${grupo.nome}')">Excluir</button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(trDetalhes);
    });
    
    ocultarBotoesSeRepositor();
}

window.toggleDetalhesEstoque = function(chave) {
    const linha = document.getElementById(`detalhes-${chave}`);
    const seta = document.getElementById(`seta-${chave}`);
    if (linha && seta) {
        linha.classList.toggle('open');
        seta.classList.toggle('ativa');
    }
};

// Gera um código de 5 dígitos para uso interno e adiciona na lista
window.gerarCodigoInterno5Digitos = function() {
    let codigo = '';
    for (let i = 0; i < 5; i++) {
        codigo += Math.floor(Math.random() * 10);
    }
    
    // 1. Verifica se já está na listinha de agora que estamos bipando
    const existeNaTela = codigosBipados.includes(codigo);
    
    // 2. Verifica se JÁ EXISTE NO BANCO DE DADOS (olhando a lista carregada)
    const existeNoBanco = listaProdutos.some(produto => produto.codigo_barras === codigo);

    // Se estiver totalmente livre de duplicidade, adiciona!
    if (!existeNaTela && !existeNoBanco) {
        codigosBipados.push(codigo);
        atualizarListaCodigos();
    } else {
        // Se bater com a tela ou com o banco, ele "gira a roleta" de novo automaticamente!
        window.gerarCodigoInterno5Digitos();
    }
};