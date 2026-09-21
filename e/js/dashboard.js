const URL_BASE = "https://codecream.larissagazoli45.workers.dev";

document.addEventListener("DOMContentLoaded", async function() {
    const cardVendas = document.getElementById('card-vendas');
    const cardAtendimentos = document.getElementById('card-atendimentos');
    const cardAlertas = document.getElementById('card-alertas');

    cardVendas.innerText = "Em breve"; // Requer nova rota na API
    cardAtendimentos.innerText = "...";
    cardAlertas.innerText = "...";

    try {
        // Puxa os pedidos pendentes (substituindo o card de atendimentos)
        const resPedidos = await fetch(`${URL_BASE}/pedidos/pendentes`);
        const pedidos = await resPedidos.json();
        cardAtendimentos.innerText = `${pedidos.length} Pendentes`;

        // Puxa os produtos que estão zerados para o alerta
        const resAlertas = await fetch(`${URL_BASE}/produtos/zero`);
        const produtosZero = await resAlertas.json();
        cardAlertas.innerText = `${produtosZero.length} itens`;

        // Puxa os itens mais vendidos para o Gráfico
        const resGrafico = await fetch(`${URL_BASE}/produtos/mais-vendidos`);
        const topProdutos = await resGrafico.json();
        
        renderizarGraficoProdutos(topProdutos);

    } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);
        cardAtendimentos.innerText = "Erro";
        cardAlertas.innerText = "Erro";
    }
});

function renderizarGraficoProdutos(dados) {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.map(d => d.nome_produto),
            datasets: [{
                label: 'Unidades Vendidas',
                data: dados.map(d => d.total_vendido || 0),
                backgroundColor: '#68BBBA',
                borderRadius: 6
            }]
        },
        options: { 
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false
        }
    });
}