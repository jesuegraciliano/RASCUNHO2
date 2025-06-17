// Configuração de eventos
document.getElementById('btnCalcular').addEventListener('click', calculaCargaTermica);
document.getElementById('btnGrafico').addEventListener('click', gerarGrafico);
document.getElementById('btnPdf').addEventListener('click', gerarPDF);

let ultimoResultado = {};

function calculaCargaTermica() {
  // Leitura dos dados (substituindo vírgula por ponto)
  const cliente    = document.getElementById('cliente').value;
  const dataCalc   = document.getElementById('dataCalculo').value;
  const L          = parseFloat(document.getElementById('largura').value.replace(',', '.'));
  const C          = parseFloat(document.getElementById('comprimento').value.replace(',', '.'));
  const H          = parseFloat(document.getElementById('altura').value.replace(',', '.'));
  const m          = parseFloat(document.getElementById('movimento').value.replace(',', '.'));
  const Te         = parseFloat(document.getElementById('tempExterna').value.replace(',', '.'));
  const Ti         = parseFloat(document.getElementById('tempInterna').value.replace(',', '.'));
  const Tp         = parseFloat(document.getElementById('tempProduto').value.replace(',', '.'));

  // Cálculos básicos
  const areaPiso   = L * C;
  const volume     = L * C * H;
  const areaTotal  = 2 * (L * C + L * H + C * H);

  // Cada parcela
  const U          = 0.03 / 0.1;
  const conducao   = U * areaTotal * (Te - Ti);
  const produto    = 1000 * (m * 3.6 * (Ti - Tp)) / (16 * 3600);
  const motores    = 5.6 * L * C * H;
  const pessoas    = 273;
  const iluminacao = 10 * areaPiso;
  const fatorInf   = 1.146 * volume ** -0.584;
  const infiltracao= 1000 * fatorInf * volume * 91;

  // Soma, segurança e conversão
  const cargaBruta     = conducao + produto + motores + pessoas + iluminacao + infiltracao;
  const cargaSeguraW   = cargaBruta * 1.2;
  const cargaSeguraKcal= cargaSeguraW / 1.16;

  // Armazenar para gráfico/PDF
  ultimoResultado = { conducao, produto, motores, pessoas, iluminacao, infiltracao, cargaSeguraW, cargaSeguraKcal, cliente, dataCalc };

  // Exibição de texto
  const out = document.getElementById('resultado');
  out.innerHTML = `
    <p><strong>Cliente:</strong> ${cliente}</p>
    <p><strong>Data:</strong> ${dataCalc}</p>
    <p><strong>Condução:</strong> ${conducao.toFixed(0)} W</p>
    <p><strong>Produto:</strong> ${produto.toFixed(0)} W</p>
    <p><strong>Motores:</strong> ${motores.toFixed(0)} W</p>
    <p><strong>Pessoas:</strong> ${pessoas} W</p>
    <p><strong>Iluminação:</strong> ${iluminacao.toFixed(0)} W</p>
    <p><strong>Infiltração:</strong> ${infiltracao.toFixed(0)} W</p>
    <p><strong>Carga com 20% de segurança:</strong> ${cargaSeguraW.toFixed(0)} W</p>
    <p><strong>Carga em kcal/h:</strong> ${cargaSeguraKcal.toFixed(0)} kcal/h</p>
  `;
}

function gerarGrafico() {
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Condução','Produto','Motores','Pessoas','Iluminação','Infiltração','Segurança'],
      datasets: [{
        label: 'Potência (W)',
        data: [
          ultimoResultado.conducao.toFixed(0),
          ultimoResultado.produto.toFixed(0),
          ultimoResultado.motores.toFixed(0),
          ultimoResultado.pessoas,
          ultimoResultado.iluminacao.toFixed(0),
          ultimoResultado.infiltracao.toFixed(0),
          ultimoResultado.cargaSeguraW.toFixed(0)
        ],
        backgroundColor: 'rgba(0,123,255,0.5)',
        borderColor: 'rgba(0,123,255,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

async function gerarPDF() {
  const {{ jsPDF }} = window.jspdf;
  const doc = new jsPDF();
  await doc.html(document.getElementById('resultado'), {
    callback: function (pdf) {
      pdf.save(`Relatorio_${ultimoResultado.cliente}_${ultimoResultado.dataCalc}.pdf`);
    }
  });
}
