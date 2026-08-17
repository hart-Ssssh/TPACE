const urlAPIDashboard = "https://tpace-api.whyguiih.workers.dev/api/web/dashboard";

document.addEventListener("DOMContentLoaded", async function() {
    const cardVendas = document.getElementById('card-vendas');
    const cardAtendimentos = document.getElementById('card-atendimentos');
    const cardAlertas = document.getElementById('card-alertas');

    // Mensagem inicial de carregamento
    cardVendas.innerText = "...";
    cardAtendimentos.innerText = "...";
    cardAlertas.innerText = "...";

    try {
        const resposta = await fetch(urlAPIDashboard);
        const dados = await resposta.json();

        // 1. Formata o valor das vendas em Reais
        const totalVendasFormatado = parseFloat(dados.vendasHoje || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        cardVendas.innerText = totalVendasFormatado;

        // 2. Quantidade de atendimentos
        cardAtendimentos.innerText = dados.atendimentosHoje || 0;

        // 3. Itens em alerta
        const qtdAlertas = dados.alertasEstoque || 0;
        cardAlertas.innerText = `${qtdAlertas} ${qtdAlertas === 1 ? 'item' : 'itens'}`;

    } catch (erro) {
        console.error("Erro ao carregar dados do dashboard:", erro);
        cardVendas.innerText = "Erro";
        cardAtendimentos.innerText = "Erro";
        cardAlertas.innerText = "Erro";
    }
});