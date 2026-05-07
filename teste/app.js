/**
 * Monitor DER-SP · Câmeras KM 110
 * app.js — Rastreamento com Filtro de Movimento e Região de Interesse (ROI).
 */

'use strict';

/* ============================================================
   CÂMERAS E CONFIGURAÇÕES
   ============================================================ */
const CAMERAS = [
  { id: 27, stream: 'https://34.104.32.249.nip.io/SP008-KM095/stream.m3u8', label: 'SP-008 KM095', info: 'Sentido Socorro' },
  { id: 48, stream: 'https://34.104.32.249.nip.io/SP123-KM026B/stream.m3u8', label: 'SP-123 KM026B', info: 'Sentido Campos do Jordão' },
  { id: 51, stream: 'https://34.104.32.249.nip.io/SP123-KM031A/stream.m3u8', label: 'SP-123 KM031A', info: 'Sentido Taubaté' },
  { id: 52, stream: 'https://34.104.32.249.nip.io/SP123-KM031B/stream.m3u8', label: 'SP-123 KM031B', info: 'Sentido Campos do Jordão' },
  { id: 74, stream: 'https://34.104.32.249.nip.io/SP055-KM110A/stream.m3u8', label: 'SP-055 KM110A', info: 'Sentido Ubatuba' },
  { id: 77, stream: 'https://34.104.32.249.nip.io/SP055-KM110B/stream.m3u8', label: 'SP-055 KM110B', info: 'Sentido São Sebastião' },
  { id: 88, stream: 'https://34.104.32.249.nip.io/SP125-KM093B/stream.m3u8', label: 'SP-125 KM093B', info: 'Sentido Taubaté' },
  { id: 115, stream: 'https://34.104.32.249.nip.io/SP125-KM093A/stream.m3u8', label: 'SP-125 KM093A', info: 'Sentido Ubatuba' }
];

const selectedCameras = new Set();

function updateActiveCountUI() {
  const activeCountEl = document.getElementById('activeCamerasCount');
  if (activeCountEl) {
    activeCountEl.innerHTML = `<strong>${selectedCameras.size}</strong> câmeras ativas`;
  }
}

function renderSelector() {
  const container = document.getElementById('cameraSelectorPills');
  if (!container) return;
  container.innerHTML = '';
  CAMERAS.forEach(cam => {
    const pill = document.createElement('label');
    pill.className = 'camera-pill';
    pill.id = `pill-${cam.id}`;
    pill.innerHTML = `
      <input type="checkbox" onchange="toggleCameraSelection(${cam.id})" />
      <svg class="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
      </svg>
      <span>Câmera ${cam.id}</span>
    `;
    container.appendChild(pill);
  });
}

window.toggleCameraSelection = function (id) {
  const cam = CAMERAS.find(c => c.id === id);
  if (!cam) return;

  const isSelected = selectedCameras.has(id);
  const pill = document.getElementById(`pill-${id}`);
  const grid = document.getElementById('camerasGrid');

  if (isSelected) {
    // DESATIVAR (Unselect)
    selectedCameras.delete(id);
    if (pill) pill.classList.remove('selected');

    // Para detecção se estiver ativa
    if (state.detectIntervals.has(id)) {
      clearInterval(state.detectIntervals.get(id));
      state.detectIntervals.delete(id);
    }
    state.detecting.set(id, false);
    state.trackers.set(id, []);

    // Destrói HLS
    if (state.hlsInstances.has(id)) {
      state.hlsInstances.get(id).destroy();
      state.hlsInstances.delete(id);
    }

    // Remove DOM Node
    const card = document.getElementById(`card-${id}`);
    if (card) card.remove();

  } else {
    // ATIVAR (Select)
    selectedCameras.add(id);
    if (pill) pill.classList.add('selected');

    // Renderiza Card
    const card = document.createElement('div');
    card.className = 'camera-card';
    card.id = `card-${cam.id}`;

    // Resgata o valor atual do contador (se já existir)
    const currentCount = typeof cameraCount !== 'undefined' ? (cameraCount.get(cam.id) || 0) : 0;

    card.innerHTML = `
        <div class="camera-header">
          <div class="camera-info">
            <span class="camera-badge">CAM ${cam.id}</span>
            <div>
              <p class="camera-title">${cam.label}</p>
              <p class="camera-meta">${cam.info}</p>
            </div>
          </div>
          <div class="camera-controls">
            <button class="btn-ctrl" id="delay-${cam.id}" title="Remover delay" onclick="toggleLowLatency(${cam.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Baixo Delay</span>
            </button>
            <button class="btn-ctrl" id="detect-${cam.id}" title="Ativar detecção" onclick="toggleDetection(${cam.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Detecção I.A.</span>
            </button>
          </div>
        </div>
        <div class="camera-player-wrap">
          <video id="video-${cam.id}" class="camera-video" muted autoplay playsinline></video>
          <canvas id="canvas-${cam.id}" class="camera-canvas"></canvas>
          <div class="camera-overlay">
            <div class="overlay-badge live">● AO VIVO</div>
          </div>
          <div class="player-loading" id="loading-${cam.id}">
            <div class="loading-ring"></div>
            <span>Conectando ao stream…</span>
          </div>
        </div>
        <div class="camera-footer">
          <div class="counter-display">
            <div class="counter-icon">🚗</div>
            <div class="counter-info">
              <span class="counter-label">Câmera #${cam.id}</span>
              <div class="counter-nums">
                <span class="counter-value" id="count-${cam.id}">${currentCount}</span>
                <span class="counter-unit">veíc.</span>
              </div>
            </div>
            <div class="camera-avg" id="avg-${cam.id}">Média: -- / 5min</div>
            ${cam.id === 52 ? `<div class="camera-eta" id="eta-52" style="font-size:12px; color:#fb923c; background: rgba(0,0,0,0.4); padding: 4px 6px; border-radius: 4px; margin-top: 6px; margin-bottom: -4px; line-height: 1.3; width: 100%; text-align: center;">📊 Câm 48 a 4.5km<br><i>Aguardando 30s...</i></div>` : ''}
            <button class="btn-reset-cam" onclick="resetCount(${cam.id})" title="Zerar esta câmera">↺</button>
          </div>
        </div>
    `;
    grid.appendChild(card);

    // Recupera estado de Low Latency previamnente salvo
    const isLowLatency = typeof state !== 'undefined' && state.lowLatency && state.lowLatency.get(id) || false;
    if (isLowLatency) {
      document.getElementById(`delay-${cam.id}`).classList.add('active');
    }

    // Inicia HLS do zero
    initCamera(cam, isLowLatency);
  }

  updateActiveCountUI();
};

// Apenas classes confiáveis do COCO-SSD para veículos reais em rodovias
const VEHICLE_CLASSES = new Set(['car', 'truck', 'bus']);

/**
 * Confiança mínima. 0.15 captura veículos parcialmente oclusos ou distantes
 * sem aceitar ruído de fundo. O filtro de direção cuida do resto.
 */
const CONFIDENCE_THRESHOLD = 0.15;

/** Distância máxima para associar detecção a tracker existente (40% da tela). */
const MAX_MATCH_DIST_FRAC = 0.40;

/** 
 * Frames sem detecção antes de descartar tracker.
 * 10 frames = ~1.2s na câm 52 (120ms/frame). Cobre ocluções por outros veículos ou placas.
 */
const MAX_MISSES = 10;

/** 
 * Região de Interesse (ROI) — padrão para todas as câmeras.
 */
const ROI = { xMin: 0.02, xMax: 0.98, yMin: 0.05, yMax: 0.98 };

/**
 * ROI EXCLUSIVA DA CÂMERA 52 — pista da DIREITA (via que sobe sentido câm 48).
 * xMin: 0.30 — cobre desde 30% da tela até a borda direita, garantindo que
 * veículos próximos à divisória central também sejam detectados.
 */
const ROI_CAM52 = { xMin: 0.30, xMax: 1.00, yMin: 0.02, yMax: 0.98 };

/** Pixels mínimos de movimento para confirmar que um objeto realmente se moveu. */
const MIN_MOVE_PX = 4;

/**
 * Pixels mínimos de subida na tela (deltaY negativo) para câmera 52.
 */
const CAM52_MIN_UP_PX = 5;

/**
 * Velocidade mínima (pixels/frame, média móvel exponencial).
 * Veículos parados têm velocidade ~0–1px/frame (jitter de I.A.).
 * Veículos lentos em rodovia fazem >3px/frame mesmo a 5km/h.
 * Portanto qualquer veículo com velocidade EMA < MIN_VELOCITY_PX é tratado como parado.
 */
const MIN_VELOCITY_PX = 2.5;

/**
 * Raio da zona de memória de contagem (pixels).
 * Após um veículo ser contado, nenhum novo objeto surgido dentro
 * deste raio nos próximos COUNTED_ZONE_MS milissegundos será contado novamente.
 */
const COUNTED_ZONE_RADIUS = 80;
const COUNTED_ZONE_MS = 6000; // 6 segundos de memória

/**
 * Tamanho máximo de caixa como fração da área da tela.
 * Detectações que cobrem mais de 40% da tela são descartadas —
 * geralmente são o fundo da imagem, asfalto ou sky sendo classificado erroneamente.
 */
const MAX_BBOX_AREA_FRAC = 0.40;

function isInRoi(x, y, w, h, cw, ch, camId) {
  const cx = (x + w / 2) / cw;
  const cy = (y + h / 2) / ch;
  const roi = camId === 52 ? ROI_CAM52 : ROI;
  if (!(cx >= roi.xMin && cx <= roi.xMax && cy >= roi.yMin && cy <= roi.yMax)) return false;
  // Rejeita caixas gigantes (fundo de cena, asfalto, céu detectado como veículo)
  const bboxFrac = (w * h) / (cw * ch);
  return bboxFrac <= MAX_BBOX_AREA_FRAC;
}

/* ============================================================
   CONTADORES INDEPENDENTES POR CÂMERA
   ============================================================ */
const cameraCount = new Map();
CAMERAS.forEach(({ id }) => cameraCount.set(id, 0));

function addCount(camId, n) {
  cameraCount.set(camId, (cameraCount.get(camId) || 0) + n);
  renderCount(camId);
  renderTotal();
}

function renderCount(camId) {
  const el = document.getElementById(`count-${camId}`);
  if (!el) return;
  el.textContent = cameraCount.get(camId);
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 500);
}

function renderTotal() {
  let total = 0;
  cameraCount.forEach(v => { total += v; });
  const el = document.getElementById('totalVehicles');
  if (el) el.textContent = total;
}

/** Reset de uma câmera específica */
window.resetCount = function (camId) {
  cameraCount.set(camId, 0);
  renderCount(camId);
  renderTotal();
  state.trackers.set(camId, []);
  state.nextId.set(camId, 1);
};

/** Reset global */
window.resetAllCount = function () {
  CAMERAS.forEach(({ id }) => {
    cameraCount.set(id, 0);
    state.trackers.set(id, []);
    state.nextId.set(id, 1);
  });
  CAMERAS.forEach(({ id }) => renderCount(id));
  renderTotal();
};

/* ============================================================
   ESTADO GLOBAL (RASTREAMENTO)
   ============================================================ */
const state = {
  hlsInstances: new Map(),
  lowLatency: new Map(),
  detecting: new Map(),
  detectIntervals: new Map(),
  model: null,
  modelReady: false,
  trackers: new Map(),
  nextId: new Map(),
  countedZones: new Map()  // camId → [{cx,cy,expiry}]
};

CAMERAS.forEach(({ id }) => {
  state.lowLatency.set(id, false);
  state.detecting.set(id, false);
  state.trackers.set(id, []);
  state.nextId.set(id, 1);
  state.countedZones.set(id, []); // zonas espaciais anti-recontagem
});

/* ============================================================
   RELÓGIO E HLS
   ============================================================ */
function updateClock() {
  const el = document.getElementById('clockDisplay');
  if (!el) return;
  const now = new Date();
  el.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(v => String(v).padStart(2, '0')).join(':');
}
setInterval(updateClock, 1000);
updateClock();

function buildHlsConfig(lowLatency) {
  const baseConfig = {
    enableWorker: true,
    manifestLoadingMaxRetry: 5,
    manifestLoadingRetryDelay: 2000,
    levelLoadingMaxRetry: 5,
    levelLoadingRetryDelay: 2000,
    fragLoadingMaxRetry: 5,
    fragLoadingRetryDelay: 1000,
  };

  return lowLatency ? {
    ...baseConfig,
    lowLatencyMode: true,
    backBufferLength: 0, liveSyncDurationCount: 2,
    liveMaxLatencyDurationCount: 4, liveDurationInfinity: true,
    maxBufferLength: 6, maxMaxBufferLength: 10,
    maxBufferSize: 20e6, maxBufferHole: 0.5,
    highBufferWatchdogPeriod: 1,
  } : {
    ...baseConfig,
    lowLatencyMode: false,
    maxBufferLength: 30, maxMaxBufferLength: 60,
    maxBufferHole: 0.5,
  };
}

function initCamera(camera, lowLatency = false) {
  const { id, stream } = camera;
  const video = document.getElementById(`video-${id}`);
  const loading = document.getElementById(`loading-${id}`);
  const statusDot = document.getElementById('globalStatus');
  const statusTxt = document.getElementById('globalStatusText');

  if (state.hlsInstances.has(id)) {
    state.hlsInstances.get(id).destroy();
    state.hlsInstances.delete(id);
  }

  if (!Hls.isSupported() && video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = stream;
    video.addEventListener('loadedmetadata', () => loading.classList.add('hidden'), { once: true });
    return;
  }
  if (!Hls.isSupported()) {
    loading.innerHTML = '<span style="color:#ef4444">Navegador não suporta HLS.</span>';
    return;
  }

  const hls = new Hls(buildHlsConfig(lowLatency));
  state.hlsInstances.set(id, hls);
  hls.loadSource(stream);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => { }); loading.classList.add('hidden'); });
  hls.on(Hls.Events.LEVEL_LOADED, () => {
    if (statusDot) statusDot.className = 'status-dot online';
    if (statusTxt) statusTxt.textContent = 'Streams conectados';
  });

  hls.on(Hls.Events.ERROR, (_, data) => {
    if (!data.fatal) return;
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        // Tenta recuperar de quedas de rede tentando carregar novamente
        hls.startLoad();
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        // Tenta recuperar de engasgos/problemas na decodificação do vídeo
        hls.recoverMediaError();
        break;
      default:
        // Erro fatal irrecuperável, destrói a instância e recria do zero
        hls.destroy();
        setTimeout(() => initCamera(camera, lowLatency), 3000);
        break;
    }
  });
}

window.toggleLowLatency = function (id) {
  const next = !state.lowLatency.get(id);
  state.lowLatency.set(id, next);
  document.getElementById(`delay-${id}`).classList.toggle('active', next);
  const cam = CAMERAS.find(c => c.id === id);
  if (cam) initCamera(cam, next);
};

/* ============================================================
   COCO-SSD
   ============================================================ */
async function loadModel() {
  const banner = document.getElementById('aiBanner');
  const aiText = document.getElementById('aiStatus');
  const spinner = banner.querySelector('.ai-spinner');
  try {
    aiText.textContent = 'Carregando modelo COCO-SSD V2 (Alta Precisão)…';
    state.model = await cocoSsd.load({ base: 'mobilenet_v2' });
    state.modelReady = true;
    banner.classList.add('ready');
    Object.assign(spinner.style, { background: 'var(--green)', borderRadius: '50%', animation: 'none' });
    aiText.textContent = '✓ Modelo carregado · Detectando via principal';
    setTimeout(() => banner.classList.add('hidden'), 4000);
  } catch (err) {
    console.error('[AI]', err);
    aiText.textContent = '⚠ Falha ao carregar modelo de I.A.';
  }
}

/* ============================================================
   DETECÇÃO Matemática de Distância e Tracker Sujeira
   ============================================================ */
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getIoU(box1, box2) {
  const [x1, y1, w1, h1] = box1;
  const [x2, y2, w2, h2] = box2;
  const nx1 = Math.max(x1, x2);
  const ny1 = Math.max(y1, y2);
  const nx2 = Math.min(x1 + w1, x2 + w2);
  const ny2 = Math.min(y1 + h1, y2 + h2);
  const intersection = Math.max(0, nx2 - nx1) * Math.max(0, ny2 - ny1);
  const union = (w1 * h1) + (w2 * h2) - intersection;
  return union > 0 ? intersection / union : 0;
}

// Filtra predições redundantes da I.A. (Não Máxima Supressão)
function applyNMS(predictions, iouThreshold = 0.40) {
  predictions.sort((a, b) => b.score - a.score);
  const keep = [];
  predictions.forEach(pred => {
    let duplicate = false;
    for (let k of keep) {
      if (getIoU(pred.bbox, k.bbox) > iouThreshold) { duplicate = true; break; }
    }
    if (!duplicate) keep.push(pred);
  });
  return keep;
}

/* ============================================================
   DETECÇÃO — LOOP PRINCIPAL
   ============================================================ */
function runDetection(id) {
  const video = document.getElementById(`video-${id}`);
  const canvas = document.getElementById(`canvas-${id}`);
  const ctx = canvas.getContext('2d');

  if (!state.modelReady || video.paused || video.ended || video.readyState < 2) return;
  if (video.isDetecting) return; // Trava contra engarrafamento de I.A na CPU
  video.isDetecting = true;

  const cw = video.videoWidth || video.clientWidth || 640;
  const ch = video.videoHeight || video.clientHeight || 360;
  canvas.width = cw;
  canvas.height = ch;

  state.model.detect(video).then(predictions => {
    video.isDetecting = false;
    ctx.clearRect(0, 0, cw, ch);

    let trackers = state.trackers.get(id);
    let newCountThisFrame = 0;

    // Zera flags
    trackers.forEach(t => t.updated = false);

    // Limpa zonas de contagem expiradas
    const now = Date.now();
    const zones = (state.countedZones.get(id) || []).filter(z => z.expiry > now);
    state.countedZones.set(id, zones);

    // Filtra: classes válidas + confiança + ROI + tamanho
    let validPreds = predictions.filter(pred =>
      VEHICLE_CLASSES.has(pred.class) &&
      pred.score >= CONFIDENCE_THRESHOLD &&
      isInRoi(pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3], cw, ch, id)
    );

    // NMS: remove detecções duplas do mesmo veículo
    validPreds = applyNMS(validPreds, 0.50);

    const matchThreshold = cw * MAX_MATCH_DIST_FRAC;

    validPreds.forEach(pred => {
      const [x, y, w, h] = pred.bbox;
      const cx = x + w / 2;
      const cy = y + h / 2;

      let bestMatch = null;
      let minDistance = Infinity;
      let maxScore = -Infinity;

      trackers.forEach(track => {
        if (track.updated) return;
        const dist = getDistance(cx, cy, track.cx, track.cy);
        const iou = getIoU(pred.bbox, track.bbox);
        // Combinação IoU + Distância para encontrar o melhor tracker
        if (iou > 0.20 || dist < matchThreshold) {
          const score = (iou * 100) - (dist * 0.5);
          if (score > maxScore) {
            maxScore = score;
            minDistance = dist;
            bestMatch = track;
          }
        }
      });

      if (bestMatch) {
        // Tracker existente: atualiza posição
        bestMatch.cx = cx;
        bestMatch.cy = cy;
        bestMatch.bbox = pred.bbox;
        bestMatch.misses = 0;
        bestMatch.updated = true;
        bestMatch.class = pred.class;
        bestMatch.score = pred.score;
        bestMatch.framesSeen = (bestMatch.framesSeen || 1) + 1;

        // Velocidade EMA: média exponencial da distância frame a frame
        // Veículos parados têm velocidade ~0–1px/frame (jitter). Veículos em movimento têm >>MIN_VELOCITY_PX
        const frameDist = getDistance(cx, cy, bestMatch.lastCx ?? cx, bestMatch.lastCy ?? cy);
        bestMatch.velocity = ((bestMatch.velocity ?? 0) * 0.6) + (frameDist * 0.4);
        bestMatch.lastCx = cx;
        bestMatch.lastCy = cy;

        if (!bestMatch.counted && bestMatch.framesSeen >= 2) {
          const netDeltaX = cx - bestMatch.startX;
          const netDeltaY = cy - bestMatch.startY;
          const movedDist = Math.sqrt(netDeltaX * netDeltaX + netDeltaY * netDeltaY);
          const isMoving = bestMatch.velocity >= MIN_VELOCITY_PX;

          // Só processa se o veículo está efetivamente em movimento
          if (isMoving && movedDist >= MIN_MOVE_PX) {
            if (id === 52) {
              if (netDeltaY <= -CAM52_MIN_UP_PX) {
                bestMatch.counted = true;
                bestMatch.justCounted = true;
                newCountThisFrame++;
                // Registra zona de memória para evitar recontagem
                zones.push({ cx, cy, expiry: Date.now() + COUNTED_ZONE_MS });
              } else if (netDeltaY >= CAM52_MIN_UP_PX) {
                bestMatch.counted = true;
                bestMatch.justCounted = false;
              }
            } else {
              bestMatch.counted = true;
              bestMatch.justCounted = true;
              newCountThisFrame++;
              zones.push({ cx, cy, expiry: Date.now() + COUNTED_ZONE_MS });
            }
          }
        }

      } else {
        // Veículo novo: verifica se já está na zona de memória (foi contado antes)
        const nearCounted = zones.some(z => getDistance(cx, cy, z.cx, z.cy) < COUNTED_ZONE_RADIUS);
        const newId = state.nextId.get(id);
        state.nextId.set(id, newId + 1);
        trackers.push({
          id: newId,
          cx, cy,
          startX: cx, startY: cy,
          lastCx: cx, lastCy: cy,
          bbox: pred.bbox,
          class: pred.class,
          score: pred.score,
          misses: 0,
          updated: true,
          velocity: 0,
          // Se surgiu dentro de uma zona já contada: nasce pré-contado (invisivel, não incrementa)
          counted: nearCounted,
          justCounted: false,
          framesSeen: 1
        });
      }
    });

    if (newCountThisFrame > 0) {
      addCount(id, newCountThisFrame);
    }

    const nextTrackers = [];

    trackers.forEach(t => {
      if (!t.updated) { t.misses += 1; }
      if (t.misses > MAX_MISSES) return; // descarta tracker expirado
      nextTrackers.push(t);

      // Não renderiza se não foi detectado neste frame
      if (!t.updated) return;
      // Não renderiza se já foi contado e não está no flash verde
      if (t.counted && !t.justCounted) return;

      const [x, y, w, h] = t.bbox;

      if (t.justCounted) {
        // Flash verde: renderiza UMA VEZ e reseta flag
        ctx.strokeStyle = 'rgba(16,185,129,0.95)';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        const lbl = `${t.class} ✔`;
        ctx.font = 'bold 13px Inter, sans-serif';
        const tw2 = ctx.measureText(lbl).width;
        ctx.fillStyle = 'rgba(16,185,129,0.95)';
        ctx.fillRect(x, y > 20 ? y - 20 : y, tw2 + 8, 20);
        ctx.fillStyle = '#fff';
        ctx.fillText(lbl, x + 4, y > 20 ? y - 4 : y + 14);
        t.justCounted = false; // após 1 frame verde, desaparece completamente
      } else {
        // Laranja: 1ª detecção, aguardando confirmação no próximo frame
        ctx.strokeStyle = 'rgba(251,146,60,0.80)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      }
    });


    // Salva o novo mapa de vigia para o próximo loop
    state.trackers.set(id, nextTrackers);

  }).catch(err => {
    video.isDetecting = false;
    console.warn(`[AI cam${id}]`, err);
  });
}

/* ============================================================
   TOGGLE DETECÇÃO E ETA
   ============================================================ */
const aiStartTime = new Map();
const aiStartCount = new Map();
const avgIntervals = new Map();

// --- LÓGICA DE ETA CAMERA 52 -> CAMERA 48 ---
const etaState = {
  lastCount: 0,
  intervalId: null
};

function startEtaCheck52() {
  if (etaState.intervalId) return;
  etaState.lastCount = typeof cameraCount !== 'undefined' ? (cameraCount.get(52) || 0) : 0;

  const etaEl = document.getElementById('eta-52');
  if (etaEl) etaEl.innerHTML = '📊 Câm 48 a 4.5km<br><i>Analisando fluxo (30s)...</i>';

  etaState.intervalId = setInterval(() => {
    if (!state.detecting.get(52)) return;

    const currentCount = typeof cameraCount !== 'undefined' ? (cameraCount.get(52) || 0) : 0;
    let passed = currentCount - etaState.lastCount;
    if (passed < 0) passed = currentCount; // Caso usuário clique em "zerar"
    etaState.lastCount = currentCount;

    // Distância da Câmera 52 (km 31) para a Câmera 48 (km 26.5) = 4.5 km
    const distance = 4.5;
    let speedKmh = 80;

    // Ajuste de velocidade baseado na quantidade de carros avistados em 30s
    if (passed >= 15) speedKmh = 40; // Muito congestionado
    else if (passed >= 5) speedKmh = 60; // Trânsito moderado
    else speedKmh = 80; // Livre

    const timeMin = (distance / speedKmh) * 60;

    const el = document.getElementById('eta-52');
    if (el) {
      el.innerHTML = `🏁 <b>Tempo inc. Câm 48: ~${timeMin.toFixed(1)} min</b><br><span style="color:#e4e4e7; font-size:10px;">Fluxo: ${passed} veíc/30s | Vel. estim.: ${speedKmh} km/h</span>`;
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 500);
    }
  }, 30000);
}

function stopEtaCheck52() {
  if (etaState.intervalId) {
    clearInterval(etaState.intervalId);
    etaState.intervalId = null;
  }
  const el = document.getElementById('eta-52');
  if (el) el.innerHTML = '📊 Câm 48 a 4.5km<br><i>Análise pausada.</i>';
}
// ------------------------------------------

function updateAverageUI(id) {
  const el = document.getElementById(`avg-${id}`);
  if (!el) return;
  if (!state.detecting.get(id)) {
    el.textContent = 'Média: -- / 5min';
    return;
  }
  const startT = aiStartTime.get(id);
  if (!startT) return;

  const elapsedMins = (Date.now() - startT) / 60000;
  if (elapsedMins < 0.15) { // Aguarda uns ~9 segundos de buffer
    el.textContent = 'Calculando...';
    return;
  }

  const startCount = aiStartCount.get(id) || 0;
  const currentCount = typeof cameraCount !== 'undefined' ? (cameraCount.get(id) || 0) : 0;
  const carsPassed = currentCount - startCount;

  const avg = Math.round((carsPassed / elapsedMins) * 5);
  el.textContent = `Média: ${avg} / 5min`;
}

window.toggleDetection = function (id) {
  if (!state.modelReady) { alert('Aguarde o modelo de I.A. ser carregado.'); return; }

  const next = !state.detecting.get(id);
  state.detecting.set(id, next);

  const btn = document.getElementById(`detect-${id}`);
  const canvas = document.getElementById(`canvas-${id}`);
  const card = document.getElementById(`card-${id}`);

  btn.classList.toggle('active', next);
  canvas.classList.toggle('visible', next);
  card.classList.toggle('detecting', next);

  if (next) {
    state.trackers.set(id, []);
    // Câmera 52: 120ms (~8fps) para rastrear melhor veículos rápidos em rodovia
    // Demais câmeras: 250ms (4fps) — suficiente para fluxo normal
    const interval = id === 52 ? 120 : 250;
    state.detectIntervals.set(id, setInterval(() => runDetection(id), interval));

    // Inicia cronômetros e captura do ponto zero da IA
    aiStartTime.set(id, Date.now());
    aiStartCount.set(id, typeof cameraCount !== 'undefined' ? (cameraCount.get(id) || 0) : 0);
    updateAverageUI(id);
    avgIntervals.set(id, setInterval(() => updateAverageUI(id), 2000));

    if (id === 52) startEtaCheck52();
  } else {
    clearInterval(state.detectIntervals.get(id));
    state.detectIntervals.delete(id);

    if (avgIntervals.has(id)) {
      clearInterval(avgIntervals.get(id));
      avgIntervals.delete(id);
    }
    updateAverageUI(id); // volta p/ traços default

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    state.trackers.set(id, []);

    if (id === 52) stopEtaCheck52();
  }
};

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderSelector();
  updateActiveCountUI();
  loadModel();
  renderTotal();
});
