const urlAPIProdutos = "https://tpace-api.whyguiih.workers.dev/api/web/produtos";

document.addEventListener("DOMContentLoaded", async function() {
    const tbody = document.getElementById('tabela-estoque');
    
    // Mostra que está carregando
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Carregando produtos...</td></tr>';

    try {
        const resposta = await fetch(urlAPIProdutos);
        const produtos = await resposta.json();

        // Limpa a mensagem de carregando
        tbody.innerHTML = '';

        if(produtos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        // Para cada produto recebido do banco, cria uma linha na tabela
        produtos.forEach(prod => {
            
            // Lógica para o status baseado na quantidade
            let classeBadge = 'status-ok';
            let textoStatus = 'Adequado';
            
            if (prod.quantidade <= 0) {
                classeBadge = 'status-low';
                textoStatus = 'Esgotado';
            } else if (prod.quantidade <= 10) {
                classeBadge = 'status-low';
                textoStatus = 'Baixo Estoque';
            }

            // Formata o preço (Ex: 50 -> R$ 50,00)
            const precoFormatado = parseFloat(prod.preco_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // Monta o HTML da linha (<tr>)
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prod.codigo_barras || 'N/A'}</td>
                <td>${prod.nome}</td>
                <td>Geral</td> <!-- O BD não tem tabela de categorias, então fixei como Geral por enquanto -->
                <td>${prod.quantidade} ${prod.unidade_venda}</td>
                <td>${precoFormatado}</td>
                <td><span class="status-badge ${classeBadge}">${textoStatus}</span></td>
                <td class="action-links"><a href="#">Editar</a> <a href="#">Excluir</a></td>
            `;

            tbody.appendChild(tr);
        });

    } catch (erro) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar o estoque.</td></tr>';
        console.error("Erro no fetch de produtos:", erro);
    }
});