// ATENÇÃO: Verifique se essa URL base é a mesma do seu Worker!
const urlAPIBase = "https://tpace-api.whyguiih.workers.dev/api/web";

document.addEventListener("DOMContentLoaded", async function() {
    
    // ==========================================
    // 1. CARREGAR OS CARDS DO TOPO
    // ==========================================
    const cardVendas = document.getElementById('card-vendas');
    const cardAtendimentos = document.getElementById('card-atendimentos');
    const cardAlertas = document.getElementById('card-alertas');

    cardVendas.innerText = "...";
    cardAtendimentos.innerText = "...";
    cardAlertas.innerText = "...";

    try {
        const resDash = await fetch(`${urlAPIBase}/dashboard`);
        const dadosDash = await resDash.json();

        cardVendas.innerText = parseFloat(dadosDash.vendasHoje || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        cardAtendimentos.innerText = dadosDash.atendimentosHoje || 0;
        cardAlertas.innerText = `${dadosDash.alertasEstoque || 0} ${dadosDash.alertasEstoque === 1 ? 'item' : 'itens'}`;
    } catch (erro) {
        cardVendas.innerText = "Erro";
        cardAtendimentos.innerText = "Erro";
        cardAlertas.innerText = "Erro";
    }

    // ==========================================
    // 2. LÓGICA DO GRÁFICO DINÂMICO (CHART.JS)
    // ==========================================
    let meuGraficoInstancia = null; 
    let dadosGraficos = null;       

    const ctx = document.getElementById('meuGrafico').getContext('2d');
    const selector = document.getElementById('chart-selector');

    // Suas cores oficiais para os gráficos
    const cores = {
        roxo: '#A45FCE',
        turquesa: '#68BBBA',
        verde: '#6A8B8A',
        lilas: '#C0B9DD',
        chumbo: '#242A2A',
        fundoRoxo: 'rgba(164, 95, 206, 0.2)'
    };

    function renderizarGrafico(tipo) {
        if (meuGraficoInstancia) {
            meuGraficoInstancia.destroy();
        }

        let config = {};

        if (tipo === 'faturamento') {
            const dados = [...(dadosGraficos.faturamento || [])].reverse();
            config = {
                type: 'line',
                data: {
                    labels: dados.map(d => d.data.split('-').reverse().join('/')), 
                    datasets: [{
                        label: 'Faturamento Diário (R$)',
                        data: dados.map(d => d.valor),
                        borderColor: cores.roxo,
                        backgroundColor: cores.fundoRoxo,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                }
            };
        } 
        else if (tipo === 'pagamentos') {
            const dados = dadosGraficos.pagamentos || [];
            config = {
                type: 'doughnut', 
                data: {
                    labels: dados.map(d => d.metodo.toUpperCase()),
                    datasets: [{
                        data: dados.map(d => d.total),
                        backgroundColor: [cores.roxo, cores.turquesa, cores.verde, cores.lilas, cores.chumbo],
                        borderWidth: 0
                    }]
                }
            };
        }
        else if (tipo === 'produtos') {
            const dados = dadosGraficos.produtos || [];
            config = {
                type: 'bar',
                data: {
                    // REDUZIDO PARA 8 LETRAS: Mais espaço e respiro entre as colunas!
                    labels: dados.map(d => d.nome.length > 15 ? d.nome.substring(0, 15) + '...' : d.nome),
                    datasets: [{
                        label: 'Unidades Vendidas',
                        data: dados.map(d => d.qtd),
                        backgroundColor: cores.turquesa,
                        borderRadius: 6
                    }]
                },
                options: {
                    scales: {
                        x: {
                            ticks: {
                                maxRotation: 0, // Impede a inclinação máxima
                                minRotation: 0  // Força o texto a ficar 100% horizontal
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false } // Tira a legenda extra
                    }
                }
            };
        }
        else if (tipo === 'filiais') {
            const dados = dadosGraficos.filiais || [];
            config = {
                type: 'bar',
                data: {
                    // Mesmo truque para as filiais
                    labels: dados.map(d => d.nome.length > 15 ? d.nome.substring(0, 25) + '...' : d.nome),
                    datasets: [{
                        label: 'Faturamento (R$)',
                        data: dados.map(d => d.valor),
                        backgroundColor: cores.lilas,
                        borderRadius: 6
                    }]
                },
                options: { indexAxis: 'y' } 
            };
        }

        config.options = {
            ...config.options,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: cores.chumbo, font: { family: 'Segoe UI' } } }
            }
        };

        meuGraficoInstancia = new Chart(ctx, config);
    }

    async function carregarDadosGraficos() {
        try {
            const resposta = await fetch(`${urlAPIBase}/graficos`);
            dadosGraficos = await resposta.json();
            renderizarGrafico('faturamento'); // Começa mostrando o faturamento
        } catch (erro) {
            console.error("Erro ao puxar dados dos gráficos:", erro);
        }
    }

    // Refaz o gráfico se o usuário mudar a opção no menu
    selector.addEventListener('change', function(e) {
        if(dadosGraficos) {
            renderizarGrafico(e.target.value);
        }
    });

    carregarDadosGraficos();
});