/* ==========================================================================
   CHAVE DO BICO — LOCALIZAÇÃO, MAPA, BAIRROS E CONTATO
   --------------------------------------------------------------------------
   Lê os dados centralizados (data/site-data.js) e os imóveis já usados pelo
   carrossel (IMOVEIS_DATABASE). Não cria imóveis nem coordenadas fictícias.
   ========================================================================== */
(function () {
  'use strict';

  const DATA = window.CHAVE_DO_BICO_DATA || {};
  const CFG = DATA.config || {};
  const REGIOES = DATA.regioes || [];
  const BAIRROS_TODOS = DATA.bairros || [];
  const BAIRROS = BAIRROS_TODOS.filter(b => b.ativo !== false);
  const CENTRO = CFG.mapaCentro || { lat: -5.4686, lng: -47.8867, zoom: 14 };
  const NUMERO_OFICIAL = CFG.whatsappNumero || '5563999630980';

  /* ---------------------------------------------------------------- utils */
  function slug(txt) {
    return String(txt || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function esc(txt) {
    return String(txt == null ? '' : txt)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function waLink(mensagem, numero) {
    const n = String(numero || NUMERO_OFICIAL).replace(/\D/g, '');
    return 'https://wa.me/' + n + (mensagem ? '?text=' + encodeURIComponent(mensagem) : '');
  }

  function imoveis() {
    return (typeof IMOVEIS_DATABASE !== 'undefined' ? IMOVEIS_DATABASE : [])
      .filter(i => i.publicado !== false);
  }

  function bairroDoImovel(i) {
    const id = slug(i.bairro);
    return BAIRROS_TODOS.find(b => b.id === id || slug(b.nome) === id) || null;
  }

  function nomeRegiao(id) {
    const r = REGIOES.find(x => x.id === id);
    return r ? r.nome : '';
  }

  function temCoordenadas(i) {
    const lat = Number(i.latitude), lng = Number(i.longitude);
    return i.latitude !== null && i.latitude !== '' && i.longitude !== null && i.longitude !== '' &&
      Number.isFinite(lat) && Number.isFinite(lng) &&
      Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
  }

  function temPrecoNumerico(i) {
    return i.exibirPreco !== false && Number.isFinite(Number(i.precoNumero)) && Number(i.precoNumero) > 0 && i.precoNumero !== null && i.precoNumero !== '';
  }

  function precoPublico(i) {
    return (i.exibirPreco !== false && i.preco) ? i.preco : '';
  }

  const TIPO_LABEL = { CASA: 'Casa', APARTAMENTO: 'Apartamento', KITNET: 'Kitnet', COMERCIAL: 'Comercial', LOTE: 'Lote / Terreno' };
  const FINALIDADE_MAP = { alugar: 'ALUGUEL', comprar: 'VENDA' };

  /* --------------------------------------------------- estado dos filtros */
  const ESTADO_INICIAL = {
    finalidade: 'todos', cidade: 'todos', regiao: 'todos', bairro: 'todos',
    tipo: 'todos', quartos: '0', precoMin: '', precoMax: ''
  };
  const state = Object.assign({}, ESTADO_INICIAL);

  function filtrosAtivos() {
    return Object.keys(ESTADO_INICIAL).some(k => String(state[k]) !== String(ESTADO_INICIAL[k]));
  }

  function corresponde(i) {
    if (state.finalidade !== 'todos' && String(i.finalidade).toUpperCase() !== FINALIDADE_MAP[state.finalidade]) return false;
    if (state.tipo !== 'todos' && String(i.tipo).toUpperCase() !== state.tipo.toUpperCase()) return false;
    if (state.cidade !== 'todos' && !slug(i.cidade).startsWith(state.cidade)) return false;
    if (state.bairro !== 'todos') {
      const b = bairroDoImovel(i);
      if ((b ? b.id : slug(i.bairro)) !== state.bairro) return false;
    }
    if (state.regiao !== 'todos') {
      const b = bairroDoImovel(i);
      if (!b || b.regiao !== state.regiao) return false;
    }
    const q = parseInt(state.quartos, 10) || 0;
    if (q > 0 && !(Number(i.quartos) >= q)) return false;
    const pMin = parseFloat(state.precoMin), pMax = parseFloat(state.precoMax);
    if (Number.isFinite(pMin) || Number.isFinite(pMax)) {
      if (!temPrecoNumerico(i)) return false;
      const p = Number(i.precoNumero);
      if (Number.isFinite(pMin) && p < pMin) return false;
      if (Number.isFinite(pMax) && p > pMax) return false;
    }
    return true;
  }

  function filtrados() { return imoveis().filter(corresponde); }

  /* ------------------------------------------- links oficiais de contato */
  function aplicarContatosOficiais() {
    const msgs = CFG.mensagens || {};
    document.querySelectorAll('[data-cdb-wa]').forEach(el => {
      el.href = waLink(msgs[el.getAttribute('data-cdb-wa')] || msgs.geral);
      el.target = '_blank';
      el.rel = 'noopener';
    });
    document.querySelectorAll('[data-cdb-email]').forEach(el => {
      el.href = 'mailto:' + CFG.email;
      if (el.hasAttribute('data-cdb-text')) el.textContent = CFG.email;
    });
    document.querySelectorAll('[data-cdb-whatsapp-text]').forEach(el => { el.textContent = CFG.whatsappExibicao; });
    document.querySelectorAll('[data-cdb-brand]').forEach(el => { el.textContent = CFG.nomeMarca; });
    document.querySelectorAll('[data-cdb-slogan]').forEach(el => { el.textContent = CFG.slogan; });
  }

  /* ------------------------------------------------- selects de região */
  function regioesComBairros() {
    return REGIOES.filter(r => BAIRROS.some(b => b.regiao === r.id));
  }

  function preencherRegioes(select) {
    if (!select) return;
    select.innerHTML = '<option value="todos">Todas as regiões</option>' +
      regioesComBairros().map(r => `<option value="${esc(r.id)}">${esc(r.nome)}</option>`).join('');
  }

  function preencherBairros(select, regiao) {
    if (!select) return;
    const grupos = regioesComBairros().filter(r => regiao === 'todos' || r.id === regiao);
    let html = '<option value="todos">Todos os bairros</option>';
    grupos.forEach(r => {
      const lista = BAIRROS.filter(b => b.regiao === r.id).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      html += `<optgroup label="${esc(r.nome)}">` +
        lista.map(b => `<option value="${esc(b.id)}">${esc(b.nome)}</option>`).join('') + '</optgroup>';
    });
    select.innerHTML = html;
  }

  /* ------------------------------------------- formulário de busca (hero) */
  const F = {};

  function initBusca() {
    F.form = document.getElementById('form-busca');
    F.finalidade = document.getElementById('filtro-finalidade');
    F.cidade = document.getElementById('filtro-cidade');
    F.regiao = document.getElementById('filtro-regiao');
    F.bairro = document.getElementById('filtro-bairro');
    F.tipo = document.getElementById('filtro-tipo');
    F.quartos = document.getElementById('filtro-quartos');
    F.limpar = document.getElementById('btn-limpar-filtros');
    F.resultado = document.getElementById('filtros-resultado');
    if (!F.form) return;

    if (F.cidade) {
      F.cidade.innerHTML = '<option value="todos">Todas as cidades</option>' +
        `<option value="${esc(slug(CFG.cidade))}">${esc(CFG.cidade)} – ${esc(CFG.uf)}</option>`;
    }
    preencherRegioes(F.regiao);
    preencherBairros(F.bairro, 'todos');

    F.regiao && F.regiao.addEventListener('change', () => {
      const atual = F.bairro.value;
      preencherBairros(F.bairro, F.regiao.value);
      const aindaValido = Array.from(F.bairro.options).some(o => o.value === atual);
      F.bairro.value = aindaValido ? atual : 'todos';
    });

    F.bairro && F.bairro.addEventListener('change', () => {
      const b = BAIRROS.find(x => x.id === F.bairro.value);
      if (b && F.regiao.value !== 'todos' && F.regiao.value !== b.regiao) F.regiao.value = b.regiao;
    });

    F.form.addEventListener('submit', (e) => {
      e.preventDefault();
      lerFormularioBusca();
      aplicar();
      document.getElementById('catalogo-imoveis')?.scrollIntoView({ behavior: 'smooth' });
    });

    F.limpar && F.limpar.addEventListener('click', limparFiltros);
  }

  function lerFormularioBusca() {
    state.finalidade = F.finalidade ? F.finalidade.value : 'todos';
    state.cidade = F.cidade ? F.cidade.value : 'todos';
    state.regiao = F.regiao ? F.regiao.value : 'todos';
    state.bairro = F.bairro ? F.bairro.value : 'todos';
    state.tipo = F.tipo ? F.tipo.value : 'todos';
    state.quartos = F.quartos ? F.quartos.value : '0';
  }

  function escreverFormularioBusca() {
    if (!F.form) return;
    F.finalidade.value = state.finalidade;
    if (F.cidade) F.cidade.value = state.cidade;
    F.regiao.value = state.regiao;
    preencherBairros(F.bairro, state.regiao);
    F.bairro.value = state.bairro;
    F.tipo.value = state.tipo;
    if (F.quartos) F.quartos.value = state.quartos;
  }

  function atualizarResumo(lista) {
    if (!F.resultado) return;
    if (!filtrosAtivos()) { F.resultado.innerHTML = ''; return; }
    const n = lista.length;
    F.resultado.innerHTML = n === 0
      ? 'Nenhum imóvel encontrado com esses filtros.'
      : `<strong>${n}</strong> ${n === 1 ? 'imóvel encontrado' : 'imóveis encontrados'} com os filtros selecionados.`;
  }

  /* ------------------------------------------------------------- aplicar */
  function aplicar() {
    const lista = filtrados();
    if (typeof window.definirImoveisVisiveis === 'function') window.definirImoveisVisiveis(lista);
    atualizarResumo(lista);
    escreverFormularioBusca();
    sincronizarFiltrosMapa();
    atualizarMapa();
  }

  function limparFiltros() {
    Object.assign(state, ESTADO_INICIAL);
    aplicar();
  }

  function filtrarPorBairro(bairroId) {
    const b = BAIRROS.find(x => x.id === bairroId);
    Object.assign(state, ESTADO_INICIAL, { bairro: bairroId, regiao: b ? b.regiao : 'todos' });
    aplicar();
    document.getElementById('catalogo-imoveis')?.scrollIntoView({ behavior: 'smooth' });
  }

  /* ================================================================ MAPA */
  const M = { map: null, cluster: null, circles: null, markers: {}, ok: false, ativo: null };

  function iconeMarcador(ativo) {
    return L.divIcon({
      className: 'cdb-marker-icon',
      html: `<div class="cdb-marker${ativo ? ' is-active' : ''}"><span>⌂</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 40],
      popupAnchor: [0, -36]
    });
  }

  function popupHtml(i) {
    const b = bairroDoImovel(i);
    const preco = precoPublico(i);
    const venda = String(i.finalidade).toUpperCase() === 'VENDA';
    return `
      <div class="map-popup">
        ${i.imagem ? `<img src="${esc(i.imagem)}" alt="${esc(i.titulo)}" loading="lazy">` : ''}
        <div class="map-popup-body">
          <div class="map-popup-badges">
            <span class="${venda ? 'badge-purpose-venda' : 'badge-purpose-aluguel'}">${esc(i.finalidade)}</span>
            <span class="badge-type-outline">${esc(TIPO_LABEL[String(i.tipo).toUpperCase()] || i.tipo)}</span>
          </div>
          <div class="map-popup-title">${esc(i.titulo)}</div>
          <div class="map-popup-meta">📍 ${esc(b ? b.nome : i.bairro)}${i.cidade ? ' · ' + esc(i.cidade) : ''}</div>
          ${preco ? `<div class="map-popup-price">${esc(preco)}</div>` : ''}
          <button type="button" class="btn btn-primary" data-ver-imovel="${esc(i.id)}">Ver imóvel</button>
          ${i.precisaoLocalizacao === 'exata' ? '' : '<div class="map-popup-note">Localização aproximada para preservar a privacidade do proprietário.</div>'}
        </div>
      </div>`;
  }

  function mostrarEstadoMapa(tipo) {
    const el = document.getElementById('mapa-estado');
    if (!el) return;
    const textos = {
      vazio: 'Ainda não temos imóveis disponíveis para exibir no mapa. Continue acompanhando a CHAVE DO BICO para descobrir novas oportunidades.',
      'sem-resultados': 'Nenhum imóvel encontrado nesta localização. Experimente alterar os filtros ou explorar outros bairros.',
      erro: 'Não foi possível carregar o mapa neste momento. Tente novamente.'
    };
    if (!tipo) { el.classList.remove('is-visible'); el.innerHTML = ''; return; }
    el.innerHTML = `<div class="map-state-box${tipo === 'erro' ? ' is-error' : ''}" role="status">
        <p>${textos[tipo]}</p>
        ${tipo === 'erro' ? '<button type="button" class="btn btn-primary btn-sm" id="mapa-tentar-novamente">Tentar novamente</button>' : ''}
        ${tipo === 'sem-resultados' ? '<button type="button" class="btn btn-primary btn-sm" data-limpar-filtros>Limpar filtros</button>' : ''}
      </div>`;
    el.classList.add('is-visible');
    el.querySelector('#mapa-tentar-novamente')?.addEventListener('click', tentarNovamenteMapa);
    el.querySelector('[data-limpar-filtros]')?.addEventListener('click', limparFiltros);
  }

  function carregarScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function tentarNovamenteMapa() {
    const pronto = typeof L !== 'undefined'
      ? Promise.resolve()
      : carregarScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
          .then(() => carregarScript('https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js').catch(() => {}));
    pronto.then(() => {
      if (M.map) { M.map.remove(); M.map = null; }
      M.ok = false;
      initMapa();
    }).catch(() => mostrarEstadoMapa('erro'));
  }

  function initMapa() {
    const canvas = document.getElementById('mapa-canvas');
    if (!canvas) return;
    if (typeof L === 'undefined') { mostrarEstadoMapa('erro'); renderListaMapa([], 0); return; }
    try {
      M.map = L.map(canvas, { scrollWheelZoom: false, zoomControl: true })
        .setView([CENTRO.lat, CENTRO.lng], CENTRO.zoom);
      M.map.on('focus click', () => M.map.scrollWheelZoom.enable());
      M.map.on('mouseout', () => M.map.scrollWheelZoom.disable());

      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(M.map);

      let carregou = false, falhas = 0;
      tiles.on('tileload', () => { carregou = true; });
      tiles.on('tileerror', () => { falhas++; if (!carregou && falhas >= 4) { M.ok = false; mostrarEstadoMapa('erro'); } });

      M.cluster = typeof L.markerClusterGroup === 'function'
        ? L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45 })
        : L.layerGroup();
      M.map.addLayer(M.cluster);
      M.circles = L.layerGroup().addTo(M.map);

      M.map.on('popupopen', (e) => {
        const btn = e.popup.getElement()?.querySelector('[data-ver-imovel]');
        btn && btn.addEventListener('click', () => {
          if (typeof window.mostrarImovelNoCarrossel === 'function') window.mostrarImovelNoCarrossel(btn.getAttribute('data-ver-imovel'));
        });
      });

      M.ok = true;
      mostrarEstadoMapa(null);
      atualizarMapa();
    } catch (err) {
      console.error('[CHAVE DO BICO] Falha ao iniciar o mapa:', err);
      M.ok = false;
      mostrarEstadoMapa('erro');
    }
  }

  function atualizarMapa() {
    const elegiveis = imoveis().filter(temCoordenadas);
    const lista = elegiveis.filter(corresponde);
    renderListaMapa(lista, elegiveis.length);
    atualizarFaixaPreco(elegiveis);
    if (!M.ok || !M.map) return;

    M.cluster.clearLayers();
    M.circles.clearLayers();
    M.markers = {};
    M.ativo = null;

    lista.forEach(i => {
      const pos = [Number(i.latitude), Number(i.longitude)];
      const mk = L.marker(pos, { icon: iconeMarcador(false), title: i.titulo, keyboard: true, alt: i.titulo });
      mk.bindPopup(popupHtml(i), { maxWidth: 260, minWidth: 260, autoPanPadding: [20, 20] });
      mk.on('click', () => destacarImovel(i.id, 'mapa'));
      M.cluster.addLayer(mk);
      M.markers[String(i.id)] = mk;
      if (i.precisaoLocalizacao !== 'exata') {
        M.circles.addLayer(L.circle(pos, {
          radius: 300, color: '#087B18', weight: 1.5, fillColor: '#42D900', fillOpacity: 0.1, interactive: false
        }));
      }
    });

    if (elegiveis.length === 0) mostrarEstadoMapa('vazio');
    else if (lista.length === 0) mostrarEstadoMapa('sem-resultados');
    else mostrarEstadoMapa(null);

    if (lista.length > 0) {
      const bounds = L.latLngBounds(lista.map(i => [Number(i.latitude), Number(i.longitude)]));
      M.map.fitBounds(bounds.pad(0.25), { maxZoom: 16 });
    } else {
      M.map.setView([CENTRO.lat, CENTRO.lng], CENTRO.zoom);
    }
  }

  function renderListaMapa(lista, totalElegiveis) {
    const el = document.getElementById('mapa-lista');
    if (!el) return;
    let html = `<div class="map-list-count">${lista.length} ${lista.length === 1 ? 'imóvel' : 'imóveis'} no mapa</div>`;
    if (totalElegiveis === 0) {
      html += '<div class="list-empty">Ainda não temos imóveis disponíveis para exibir no mapa. Continue acompanhando a CHAVE DO BICO para descobrir novas oportunidades.</div>';
    } else if (lista.length === 0) {
      html += '<div class="list-empty">Nenhum imóvel encontrado nesta localização. Experimente alterar os filtros ou explorar outros bairros.</div>';
    } else {
      html += lista.map(i => {
        const b = bairroDoImovel(i);
        const preco = precoPublico(i);
        return `<button type="button" class="map-list-item" data-imovel-id="${esc(i.id)}">
            ${i.imagem ? `<img src="${esc(i.imagem)}" alt="" loading="lazy">` : '<span></span>'}
            <span>
              <span class="mli-title">${esc(i.titulo)}</span>
              <span class="mli-meta">${esc(TIPO_LABEL[String(i.tipo).toUpperCase()] || i.tipo)} · ${esc(b ? b.nome : i.bairro)} · ${esc(i.finalidade)}</span><br>
              ${preco ? `<span class="mli-price">${esc(preco)}</span>` : ''}
            </span>
          </button>`;
      }).join('');
    }
    el.innerHTML = html;
    el.querySelectorAll('[data-imovel-id]').forEach(btn => {
      btn.addEventListener('click', () => destacarImovel(btn.getAttribute('data-imovel-id'), 'lista'));
    });
  }

  function destacarImovel(id, origem) {
    id = String(id);
    const lista = document.getElementById('mapa-lista');
    lista?.querySelectorAll('.map-list-item').forEach(it => {
      it.classList.toggle('is-active', it.getAttribute('data-imovel-id') === id);
    });
    if (M.ok) {
      if (M.ativo && M.markers[M.ativo]) M.markers[M.ativo].setIcon(iconeMarcador(false));
      const mk = M.markers[id];
      if (mk) {
        mk.setIcon(iconeMarcador(true));
        M.ativo = id;
        if (origem === 'lista') {
          const layout = document.getElementById('mapa-layout');
          if (layout && window.matchMedia('(max-width: 900px)').matches) definirVisao('mapa');
          if (typeof M.cluster.zoomToShowLayer === 'function') M.cluster.zoomToShowLayer(mk, () => mk.openPopup());
          else { M.map.setView(mk.getLatLng(), 16); mk.openPopup(); }
        }
      }
    }
    if (origem === 'mapa' && lista) {
      const item = lista.querySelector(`[data-imovel-id="${CSS.escape(id)}"]`);
      if (item) lista.scrollTo({ top: item.offsetTop - 8, behavior: 'smooth' });
    }
  }

  /* ---------------------------------------------- filtros do mapa (UI) */
  const MF = {};

  function initFiltrosMapa() {
    MF.root = document.getElementById('mapa-filtros');
    if (!MF.root) return;
    MF.regiao = document.getElementById('mapa-regiao');
    MF.bairro = document.getElementById('mapa-bairro');
    MF.precoBox = document.getElementById('mapa-preco');
    MF.precoMin = document.getElementById('mapa-preco-min');
    MF.precoMax = document.getElementById('mapa-preco-max');

    preencherRegioes(MF.regiao);
    preencherBairros(MF.bairro, 'todos');

    MF.root.querySelectorAll('.chip[data-filtro]').forEach(chip => {
      chip.addEventListener('click', () => {
        const campo = chip.getAttribute('data-filtro');
        const valor = chip.getAttribute('data-valor');
        state[campo] = state[campo] === valor ? 'todos' : valor;
        aplicar();
      });
    });

    MF.regiao.addEventListener('change', () => {
      state.regiao = MF.regiao.value;
      const b = BAIRROS.find(x => x.id === state.bairro);
      if (b && state.regiao !== 'todos' && b.regiao !== state.regiao) state.bairro = 'todos';
      aplicar();
    });

    MF.bairro.addEventListener('change', () => {
      state.bairro = MF.bairro.value;
      const b = BAIRROS.find(x => x.id === state.bairro);
      if (b) state.regiao = b.regiao;
      aplicar();
    });

    const aoMudarPreco = () => { state.precoMin = MF.precoMin.value; state.precoMax = MF.precoMax.value; aplicar(); };
    MF.precoMin && MF.precoMin.addEventListener('change', aoMudarPreco);
    MF.precoMax && MF.precoMax.addEventListener('change', aoMudarPreco);

    document.getElementById('mapa-limpar')?.addEventListener('click', limparFiltros);

    document.querySelectorAll('[data-mapa-visao]').forEach(btn => {
      btn.addEventListener('click', () => definirVisao(btn.getAttribute('data-mapa-visao')));
    });
  }

  function sincronizarFiltrosMapa() {
    if (!MF.root) return;
    MF.root.querySelectorAll('.chip[data-filtro]').forEach(chip => {
      chip.setAttribute('aria-pressed', String(state[chip.getAttribute('data-filtro')] === chip.getAttribute('data-valor')));
    });
    MF.regiao.value = state.regiao;
    preencherBairros(MF.bairro, state.regiao);
    MF.bairro.value = state.bairro;
    if (MF.precoMin) MF.precoMin.value = state.precoMin;
    if (MF.precoMax) MF.precoMax.value = state.precoMax;
  }

  function atualizarFaixaPreco(elegiveis) {
    if (!MF.precoBox) return;
    const valido = elegiveis.some(temPrecoNumerico);
    MF.precoBox.hidden = !valido;
    if (!valido && (state.precoMin || state.precoMax)) { state.precoMin = ''; state.precoMax = ''; }
  }

  function definirVisao(visao) {
    const layout = document.getElementById('mapa-layout');
    if (!layout) return;
    layout.setAttribute('data-view', visao);
    document.querySelectorAll('[data-mapa-visao]').forEach(b => {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-mapa-visao') === visao));
    });
    if (visao === 'mapa' && M.map) setTimeout(() => M.map.invalidateSize(), 50);
  }

  /* ============================================================= BAIRROS */
  let regiaoBairrosAtiva = 'todas';

  function renderBairros() {
    const tabs = document.getElementById('bairros-tabs');
    const grid = document.getElementById('bairros-grid');
    if (!tabs || !grid) return;

    const regs = regioesComBairros();
    tabs.innerHTML = [`<button type="button" class="chip" data-regiao="todas" aria-pressed="${regiaoBairrosAtiva === 'todas'}">Todas</button>`]
      .concat(regs.map(r => `<button type="button" class="chip" data-regiao="${esc(r.id)}" aria-pressed="${regiaoBairrosAtiva === r.id}">${esc(r.nome)}</button>`))
      .join('');
    tabs.querySelectorAll('[data-regiao]').forEach(btn => {
      btn.addEventListener('click', () => { regiaoBairrosAtiva = btn.getAttribute('data-regiao'); renderBairros(); });
    });

    const contagem = {};
    imoveis().forEach(i => {
      const b = bairroDoImovel(i);
      if (b) contagem[b.id] = (contagem[b.id] || 0) + 1;
    });

    const ordemRegiao = id => { const idx = REGIOES.findIndex(r => r.id === id); return idx < 0 ? 99 : idx; };
    const lista = BAIRROS
      .filter(b => regiaoBairrosAtiva === 'todas' || b.regiao === regiaoBairrosAtiva)
      .sort((a, b) => ordemRegiao(a.regiao) - ordemRegiao(b.regiao) || a.nome.localeCompare(b.nome, 'pt-BR'));

    grid.innerHTML = lista.map(b => {
      const n = contagem[b.id] || 0;
      const validado = b.validado !== false && b.regiao !== 'a-validar';
      return `<article class="bairro-card">
          <span class="bairro-region${validado ? '' : ' is-pending'}">${validado ? esc(nomeRegiao(b.regiao)) : 'Região a confirmar'}</span>
          <h3 class="bairro-name">${esc(b.nome)}</h3>
          ${n > 0
            ? `<span class="bairro-count">${n} ${n === 1 ? 'imóvel anunciado' : 'imóveis anunciados'}</span>
               <button type="button" class="bairro-link" data-bairro="${esc(b.id)}">Ver imóveis em ${esc(b.nome)} →</button>`
            : '<p class="bairro-empty">Ainda não temos imóveis anunciados nesta região. Continue acompanhando nossas oportunidades.</p>'}
        </article>`;
    }).join('');

    grid.querySelectorAll('[data-bairro]').forEach(btn => {
      btn.addEventListener('click', () => filtrarPorBairro(btn.getAttribute('data-bairro')));
    });
  }

  /* ============================================================= CONTATO */
  function initContato() {
    const form = document.getElementById('form-contato');
    if (!form) return;
    form.addEventListener('submit', e => e.preventDefault());

    form.querySelectorAll('[data-enviar]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!form.reportValidity()) return;
        const d = new FormData(form);
        const nome = (d.get('nome') || '').toString().trim();
        const assunto = (d.get('assunto') || '').toString().trim();
        const texto = [
          `Olá! Meu nome é ${nome}.`,
          `Assunto: ${assunto}`,
          '',
          (d.get('mensagem') || '').toString().trim(),
          '',
          `E-mail: ${(d.get('email') || '').toString().trim()}`,
          d.get('telefone') ? `Telefone: ${d.get('telefone').toString().trim()}` : ''
        ].filter((l, idx, arr) => !(l === '' && arr[idx - 1] === '')).join('\n').trim();

        if (btn.getAttribute('data-enviar') === 'whatsapp') {
          window.open(waLink(texto), '_blank', 'noopener');
        } else {
          window.location.href = 'mailto:' + CFG.email +
            '?subject=' + encodeURIComponent(`[${CFG.nomeMarca}] ${assunto}`) +
            '&body=' + encodeURIComponent(texto);
        }
      });
    });
  }

  /* ================================================================ INIT */
  /* =================================================== 3D SCENE PARALLAX */
  function initBairros3DScene() {
    const sec = document.getElementById('bairros');
    const scene = document.getElementById('bairros-3d-scene');
    if (!sec || !scene) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let mx = 0, my = 0, cx = 0, cy = 0;
    let isHovering = false;

    sec.addEventListener('mousemove', function (e) {
      isHovering = true;
      const rect = sec.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width - 0.5) * 36;
      my = ((e.clientY - rect.top) / rect.height - 0.5) * 26;
    }, { passive: true });

    sec.addEventListener('mouseleave', function () {
      isHovering = false;
      mx = 0;
      my = 0;
    });

    function loop() {
      cx += (mx - cx) * 0.05;
      cy += (my - cy) * 0.05;

      if (Math.abs(cx) > 0.01 || Math.abs(cy) > 0.01 || isHovering) {
        scene.style.setProperty('--scene-mouse-x', cx.toFixed(2) + 'px');
        scene.style.setProperty('--scene-mouse-y', cy.toFixed(2) + 'px');
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function init() {
    aplicarContatosOficiais();
    initBairros3DScene();
    initBusca();
    initFiltrosMapa();
    initMapa();
    renderBairros();
    initContato();
    definirVisao('mapa');
    aplicar();

    window.addEventListener('cdb:imoveis-atualizados', () => { aplicar(); renderBairros(); });
  }

  window.CDB = {
    aplicar, limparFiltros, filtrarPorBairro, waLink, slug,
    get filtros() { return Object.assign({}, state); },
    numeroOficial: NUMERO_OFICIAL,
    mensagens: CFG.mensagens || {}
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
