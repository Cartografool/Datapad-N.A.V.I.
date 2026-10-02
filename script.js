const clock = document.getElementById("clock");
const seconds = document.getElementById("seconds");
const batteryFill = document.getElementById("batteryFill");
const batteryText = document.getElementById("batteryText");
const notificationCount = document.getElementById("notificationCount");

const calendarDays = document.getElementById("calendarDays");
const dateStrip = document.getElementById("dateStrip");

const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const dayLabelsPt = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

function updateDateTime() {
  const now = new Date();

  clock.textContent = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  seconds.textContent = String(now.getSeconds()).padStart(2, "0");

  // Mostra a semana atual (segunda a domingo) e destaca o dia de hoje.
  const today = new Date(now);
  const monday = new Date(today);
  const day = monday.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  monday.setDate(monday.getDate() - daysFromMonday);

  calendarDays.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const button = document.createElement("button");
    if (date.toDateString() === today.toDateString()) {
      button.classList.add("active");
    }

    button.innerHTML = `${dayLabels[date.getDay()]}<small>${date.getDate()}</small>`;
    calendarDays.appendChild(button);
  }

  const dayPt = dayLabelsPt[now.getDay()];
  const time = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  dateStrip.textContent = `${dayPt} ${time}`;
}

updateDateTime();
setInterval(updateDateTime, 1000);

// Cidades brasileiras. A busca da API encontra também outras cidades do Brasil.
const cities = [
  ["São Paulo", -23.5505, -46.6333],
  ["Rio de Janeiro", -22.9068, -43.1729],
  ["Belo Horizonte", -19.9167, -43.9345],
  ["Brasília", -15.7939, -47.8828],
  ["Salvador", -12.9777, -38.5016],
  ["Recife", -8.0476, -34.877],
  ["Fortaleza", -3.7319, -38.5267],
  ["Manaus", -3.119, -60.0217],
  ["Curitiba", -25.4284, -49.2733],
  ["Porto Alegre", -30.0346, -51.2177],
  ["Belém", -1.4558, -48.4902],
  ["Goiânia", -16.6869, -49.2648],
  ["Campinas", -22.9056, -47.0608],
  ["São Luís", -2.5307, -44.3068],
  ["Natal", -5.7945, -35.211],
  ["João Pessoa", -7.1195, -34.845],
  ["Maceió", -9.6498, -35.7089],
  ["Florianópolis", -27.5954, -48.548],
  ["Vitória", -20.3155, -40.3128],
  ["Niterói", -22.8832, -43.1034],
  ["Nova Iguaçu", -22.7556, -43.4603],
];

const citySelect = document.getElementById("citySelect");
const weatherTemp = document.getElementById("weatherTemp");
const weatherCondition = document.getElementById("weatherCondition");
const weatherHumidity = document.getElementById("weatherHumidity");
const weatherRange = document.getElementById("weatherRange");
const weatherStatus = document.getElementById("weatherStatus");

cities.forEach(([name, lat, lon]) => {
  const option = document.createElement("option");
  option.value = `${lat},${lon}`;
  option.textContent = name;
  option.dataset.name = name;
  citySelect.appendChild(option);
});

const savedCity = localStorage.getItem("greenTerminalCity");
if (savedCity && [...citySelect.options].some((o) => o.value === savedCity)) {
  citySelect.value = savedCity;
} else {
  citySelect.value = "-23.5505,-46.6333";
}

function weatherDescription(code) {
  const descriptions = {
    0: "CÉU LIMPO",
    1: "PRINCIPALMENTE LIMPO",
    2: "PARCIALMENTE NUBLADO",
    3: "NUBLADO",
    45: "NEBLINA",
    48: "NEBLINA GELADA",
    51: "GAROA FRACA",
    53: "GAROA MODERADA",
    55: "GAROA FORTE",
    61: "CHUVA FRACA",
    63: "CHUVA MODERADA",
    65: "CHUVA FORTE",
    71: "NEVE FRACA",
    73: "NEVE MODERADA",
    75: "NEVE FORTE",
    80: "PANCADAS FRACAS",
    81: "PANCADAS MODERADAS",
    82: "PANCADAS FORTES",
    95: "TEMPESTADE",
    96: "TEMPESTADE COM GRANIZO",
    99: "TEMPESTADE FORTE",
  };
  return descriptions[code] || "CONDIÇÃO DESCONHECIDA";
}

async function loadWeather() {
  const [lat, lon] = citySelect.value.split(",");
  const selected = citySelect.options[citySelect.selectedIndex];
  const cityName = selected.dataset.name || selected.textContent;

  weatherStatus.textContent = "CONSULTANDO CLIMA...";
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha na API de clima");
    const data = await response.json();

    weatherStatus.textContent = `LOC - ${cityName.toUpperCase()}`;
    weatherTemp.textContent = `TEMP - ${Math.round(data.current.temperature_2m)}°C`;
    weatherCondition.textContent = `CON - ${weatherDescription(data.current.weather_code)}`;
    weatherHumidity.textContent = `UMI - ${Math.round(data.current.relative_humidity_2m)}%`;
    weatherRange.textContent = `MÁX ${Math.round(data.daily.temperature_2m_max[0])}°C - MÍN ${Math.round(data.daily.temperature_2m_min[0])}°C`;
  } catch (error) {
    weatherStatus.textContent = `LOC - ${cityName.toUpperCase()}`;
    weatherTemp.textContent = "TEMP - INDISPONÍVEL";
    weatherCondition.textContent = "CON - SEM CONEXÃO";
    weatherHumidity.textContent = "UMI - --%";
    weatherRange.textContent = "MÁX --°C - MÍN --°C";
  }
}

citySelect.addEventListener("change", () => {
  localStorage.setItem("greenTerminalCity", citySelect.value);
  loadWeather();
});

loadWeather();
// Atualiza o clima periodicamente para manter a temperatura atualizada.
setInterval(loadWeather, 10 * 60 * 1000);

let selectedDay = 4;
const dayButtons = document.querySelectorAll(".days button");
dayButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    dayButtons[selectedDay].classList.remove("active");
    selectedDay = index;
    button.classList.add("active");
  });
});

document.querySelector(".notification-card").addEventListener("click", () => {
  const card = document.querySelector(".notification-card");
  card.animate([{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }], {
    duration: 350,
  });
  notificationCount.textContent = "0";
});

let battery = 87;
setInterval(() => {
  battery = Math.max(0, battery - 0.01);
  batteryFill.style.width = battery + "%";
  batteryText.textContent = Math.round(battery) + "%";
}, 1000);

const sectionNames = {
  missions: "MISSÕES",
  files: "ARQUIVOS CONFIDENCIAIS",
  contacts: "CONTATOS",
};

const currentSection = document.getElementById("currentSection");
const homeView = document.querySelector(".calendar")?.parentElement;
const appView = document.getElementById("appView");
const originalDashboard = document.querySelectorAll(
  ".calendar, .clock-panel, .charge, .notifications",
);

function showDashboard() {
  originalDashboard.forEach((el) => (el.hidden = false));
  appView.hidden = true;
  currentSection.textContent = "INÍCIO";
}

function setSection(section) {
  document.querySelectorAll(".dock-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === section);
  });
  currentSection.textContent = sectionNames[section];

  // A navegação inferior passa a funcionar como uma tela interna.
  originalDashboard.forEach((el) => (el.hidden = true));
  appView.hidden = false;

  if (section === "missions") renderMissionList();
  if (section === "files") renderFileList();
  if (section === "contacts") renderContacts();
}

function viewHeader(kicker, title, showBack = true) {
  return `
    <div class="view-header">
      <div>
        <div class="view-kicker">${kicker}</div>
        <h2 class="view-title">${title}</h2>
      </div>
      ${showBack ? '<button class="back-button" data-back="true">← VOLTAR</button>' : ""}
    </div>
  `;
}

const missions = [
  {
    code: "MIS-001",
    title: "OPERAÇÃO: O TAL ÍDOLO DE PEDRA",
    status: "PENDENTE",
    location: "SERRA BRANCA — SP",
    briefing:
      "A Agência recebeu o alerta de uma manifestação paranormal em um porão localizado em uma área residencial da cidade. Após interrogar os sobreviventes expostos ao paranormal e enviar uma equipe para varredura inicial, o N.A.V.I. (Núcleo de Análise e Vigilância do Incomum) identificou padrões que se encaixam em cinco possíveis manifestações catalogadas nos arquivos da Agência. Elas foram registradas em um compêndio, que será o guia para essa investigação. Vocês são a equipe de identificação e reconhecimento. O seu trabalho é ir até o local e investigá-lo da melhor forma possível — incluindo com o uso das ferramentas. Então, devem comparar as informações adquiridas com o compêndio em busca de respostas para as seguintes perguntas:",
    objectives: [
      "Em qual das categorias do compêndio a manifestação se encaixa?",
      "O que aconteceu no porão e como os expostos foram parar na situação em que estavam?",
      "Caso tenha havido sobreviventes, o que a Agência deve fazer com cada um deles?",
    ],
  },
  {
    code: "MIS-002",
    title: "ARQUIVO: PONTO CEGO",
    status: "AGUARDANDO",
    location: "SETOR 07",
    briefing:
      "A Agência recebeu um alerta referente a uma ocorrência paranormal em uma residência localizada em uma área residencial do estado de São Paulo. Uma equipe de reconhecimento foi enviada ao local após a identificação de uma alteração considerada de baixo risco pelo N.A.V.I.. A análise preliminar indicava uma região classificada como N1, com a membrana aparentemente intacta e sem registros de manifestações de grande intensidade. A situação, entretanto, evoluiu de maneira incompatível com a classificação inicial. Uma comunicação interna registrada posteriormente ao incidente relata a presença de cinco a seis vítimas fatais no interior da residência. Entre elas encontram-se membros da própria Agência. O local permanece isolado. A equipe enviada deverá realizar uma varredura completa do local, levantando informações sobre:",
    objectives: ["."],
  },
];

const files = [
  {
    id: "OP-017",
    alias: "F4-NN1",
    name: "SUJEITO F4-NN1",
    affiliate: "AGÊNCIA",
    profile:
      "Operador de campo. Especialização em reconhecimento e coleta de informações.",
    dossier:
      "Registro parcial. Histórico operacional mantido sob classificação restrita.",
    image: "assets/painel-fanny.png",
  },
  {
    id: "OP-024",
    alias: "V.CENT",
    name: "SUJEITO V.CENT",
    affiliate: "AGÊNCIA",
    profile:
      "Operador designado para infiltração e extração. Dados pessoais indisponíveis.",
    dossier:
      "Dossiê atualizado após a última operação. Algumas ocorrências permanecem classificadas.",
    image: "assets/painel-vcent.png",
  },
  {
    id: "OP-026",
    alias: "R.",
    name: "SUJEITO 026",
    affiliate: "CASA DE SANTA CECÍLIA",
    profile: "3674",
    dossier: "3674",
    image: "assets/painel-r.png",
  },
  {
    id: "OP-031",
    alias: "T3MPUS",
    name: "SUJEITO 031",
    affiliate: "INDEPENDENTE",
    profile:
      "Operador com perfil predominantemente médico e investigativo, apresentando capacidade de raciocínio lógico, pensamento rápido e análise dedutiva. Demonstra domínio teórico e prático na área médica.",
    dossier:
      "O operador demonstra tendência a priorizar decisões baseadas na utilidade operacional e na preservação dos recursos considerados relevantes para o cumprimento da missão. Em situações de escolha crítica, apresenta disposição para sacrificar indivíduos considerados menos úteis à operação em favor daqueles com maior capacidade de contribuição.",
    image: "assets/painel-t3mpus.png",
  },
  {
    id: "OP-042",
    alias: "M.C.",
    name: "SUJEITO 042",
    affiliate: "AGÊNCIA",
    profile:
      "O relato apresenta uma operadora de comportamento gentil e colaborativo, com forte curiosidade intelectual e tendência a apresentar soluções e ideias pouco convencionais. Demonstra dedicação significativa às investigações, buscando compreender os casos de maneira abrangente.",
    dossier:
      "Apresenta interesse acentuado por recursos tecnológicos, investigação e análise de casos, demonstrando tendência a aprofundar-se extensivamente nas informações disponíveis antes de formular conclusões.",
    image: "assets/painel-mc.png",
  },
];

function renderMissionList() {
  appView.innerHTML = `
    ${viewHeader("CENTRAL DE OPERAÇÕES", "MISSÕES", false)}
    <div class="mission-list">
      ${missions
        .map(
          (mission, index) => `
        <button class="mission-card" data-mission="${index}">
          <span class="card-code">${mission.code}</span>
          <span class="card-title">${mission.title}</span>
          <span class="card-meta"><span>${mission.status}</span><span>${mission.location}</span></span>
        </button>
      `,
        )
        .join("")}
    </div>
  `;

  appView.querySelectorAll("[data-mission]").forEach((button) => {
    button.addEventListener("click", () =>
      renderMissionDetail(Number(button.dataset.mission)),
    );
  });
}

function renderMissionDetail(index) {
  const mission = missions[index];
  appView.innerHTML = `
    ${viewHeader(mission.code, mission.title)}
    <div class="briefing-block">
      <div class="briefing-label">BRIEFING</div>
      <p class="briefing-text">${mission.briefing}</p>
    </div>
    <div class="briefing-block">
      <div class="briefing-label">OBJETIVOS DA MISSÃO</div>
      <ul class="objectives">
        ${mission.objectives.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
    <div class="data-card" style="padding:9px;font-size:10px;line-height:1.7;">
      STATUS: ${mission.status}<br>
      LOCALIZAÇÃO: ${mission.location}<br>
      CLASSIFICAÇÃO: RESTRITO
    </div>
  `;
  appView
    .querySelector("[data-back]")
    .addEventListener("click", renderMissionList);
}

function renderFileList() {
  appView.innerHTML = `
    ${viewHeader("BANCO DE DADOS", "ARQUIVOS CONFIDENCIAIS", false)}
    <div class="file-grid">
      ${files
        .map(
          (file, index) => `
        <button class="file-card" data-file="${index}">
          <div class="file-photo">${file.image ? `<img src="${file.image}" alt="${file.alias}">` : `<span class="photo-mark">◉</span>`}</div>
          <div>
            <span class="card-code">${file.id}</span>
            <span class="card-title">${file.alias}</span>
            <span class="card-meta"><span>${file.name}</span></span>
          </div>
        </button>
      `,
        )
        .join("")}
    </div>
  `;

  appView.querySelectorAll("[data-file]").forEach((button) => {
    button.addEventListener("click", () =>
      renderFileDetail(Number(button.dataset.file)),
    );
  });
}

function renderFileDetail(index) {
  const file = files[index];
  appView.innerHTML = `
    ${viewHeader("DOSSIÊ DE OPERADOR", file.id)}
    ${file.image ? `<div class="dossier-panel-image"><img src="${file.image}" alt="Painel confidencial de ${file.alias}"></div>` : ""}
    <div class="dossier-head">
      <div class="dossier-info">
        <div class="dossier-name">${file.alias}</div>
        <div class="info-row"><strong>ALCUNHO</strong><span>${file.alias}</span></div>
        <div class="info-row"><strong>AFILIADO</strong><span>${file.affiliate}</span></div>
        <div class="info-row"><strong>STATUS</strong><span>ATIVO</span></div>
        <div class="info-row"><strong>ID</strong><span>${file.id}</span></div>
      </div>
    </div>
    <div class="briefing-block">
      <div class="briefing-label">DOSSIÊ DO OPERADOR</div>
      <p class="briefing-text">${file.dossier}</p>
    </div>
    <div class="briefing-block">
      <div class="briefing-label">PERFIL</div>
      <p class="briefing-text">${file.profile}</p>
    </div>
    <div class="briefing-block">
      <div class="briefing-label">AFILIADO</div>
      <p class="briefing-text">${file.affiliate}</p>
    </div>
  `;
  appView
    .querySelector("[data-back]")
    .addEventListener("click", renderFileList);
}

function renderContacts() {
  appView.innerHTML = `
    ${viewHeader("COMUNICAÇÕES", "CONTATOS", false)}
    <div class="empty-state">
      <div>
        <span class="empty-symbol">◎</span>
        NENHUM CONTATO DISPONÍVEL.<br>
        O BANCO DE COMUNICAÇÕES AINDA NÃO FOI CONFIGURADO.
      </div>
    </div>
  `;
}

document.querySelectorAll(".dock-item").forEach((item) => {
  item.addEventListener("click", () => setSection(item.dataset.section));
});

// A tela inicial continua sendo exibida ao carregar o terminal.
showDashboard();
