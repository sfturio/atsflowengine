(function () {
  const app = document.getElementById('app');
  const state = {
    page: 'analyze',
    result: null,
    history: [],
    loading: false,
    error: ''
  };

  const UI_TEXT = {
    navOther: 'Confira nosso outro app:',
    navOtherLink: 'RAGFlow Engine',
    navAnalyze: 'Analisar',
    navResult: 'Resultado',
    navHistory: 'Historico',
    newAnalysis: 'Nova Analise',
    title: 'Veja se seu curriculo e compativel com ATS',
    subtitle:
      'Score ATS deterministico com assistencia opcional de IA. Sem promessas exageradas, apenas melhorias praticas.',
    uploadTitle: 'Enviar curriculo em PDF (opcional)',
    uploadHint: 'Se voce enviar PDF, nao precisa preencher "Texto do curriculo".',
    uploadNoFile: 'Nenhum arquivo selecionado ainda.',
    uploadSelectedPrefix: 'PDF selecionado:',
    resumeText: 'Texto do curriculo',
    resumePlaceholder:
      'Se preferir, cole o texto do curriculo aqui. Se voce ja enviou PDF, pode deixar em branco.',
    analyzeBtn: 'Analisar curriculo',
    analyzing: 'Analisando...',
    noResult: 'Sem resultado ainda',
    runFirst: 'Rode uma analise primeiro.',
    goAnalyze: 'Ir para Analise',
    atsScore: 'Score ATS',
    provider: 'Provedor',
    downloadReport: 'Baixar relatorio em Markdown',
    finalSummary: 'Resumo final',
    keywordMatch: 'Aderencia de palavras-chave',
    structure: 'Estrutura',
    readability: 'Legibilidade',
    contentStrength: 'Forca de conteudo',
    keywordsFound: 'Palavras-chave encontradas',
    keywordsMissing: 'Palavras-chave ausentes',
    detectedIssues: 'Problemas detectados',
    suggestions: 'Sugestoes praticas',
    none: 'Nenhum',
    historyTitle: 'Historico de analises',
    historySub: 'Abra qualquer analise ATS salva.',
    tableRole: 'ID da analise',
    tableSource: 'Fonte',
    tableDate: 'Data',
    tableAction: 'Acao',
    noAnalyses: 'Nenhuma analise ainda.'
  };

  const t = (key) => UI_TEXT[key] || key;

  function syncTopNavText() {
    const map = {
      'nav-other-text': t('navOther'),
      'nav-other-link': t('navOtherLink'),
      'side-nav-analyze': t('navAnalyze'),
      'side-nav-result': t('navResult'),
      'side-nav-history': t('navHistory'),
      'new-analysis': t('newAnalysis')
    };

    Object.entries(map).forEach(([id, text]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = text;
    });

    document.documentElement.lang = 'pt-BR';
  }

  function scoreColor(score) {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-tertiary';
    return 'text-error';
  }

  function progressColor(score) {
    if (score >= 80) return 'bg-primary';
    if (score >= 60) return 'bg-tertiary-container';
    return 'bg-error';
  }

  function setPage(page) {
    state.page = page;
    render();
  }

  function updateUploadStatus(file) {
    const zone = document.getElementById('resume-upload-zone');
    const status = document.getElementById('resume-upload-status');
    if (!zone || !status) return;

    if (!file) {
      zone.classList.remove('border-primary', 'bg-primary-fixed/40');
      zone.classList.add('border-outline-variant/20');
      status.textContent = t('uploadNoFile');
      return;
    }

    zone.classList.remove('border-outline-variant/20');
    zone.classList.add('border-primary', 'bg-primary-fixed/40');
    status.textContent = `${t('uploadSelectedPrefix')} ${file.name}`;
  }

  async function loadHistory() {
    try {
      const response = await fetch('/api/v1/analyses');
      if (!response.ok) throw new Error('Nao foi possivel carregar o historico.');
      state.history = await response.json();
      render();
    } catch (error) {
      state.error = error.message;
      render();
    }
  }

  async function openAnalysis(id) {
    try {
      const response = await fetch('/api/v1/analyses/' + id);
      if (!response.ok) throw new Error('Nao foi possivel carregar a analise.');
      state.result = await response.json();
      state.page = 'result';
      render();
    } catch (error) {
      state.error = error.message;
      render();
    }
  }

  async function submitAnalysis(form) {
    state.loading = true;
    state.error = '';
    render();

    const resumeText = form.querySelector('[name="resume_text"]').value.trim();
    const fileInput = form.querySelector('[name="resume_pdf"]');
    const file = fileInput.files[0];

    try {
      let response;
      if (file) {
        const payload = new FormData();
        payload.append('resume_pdf', file);
        response = await fetch('/api/v1/analyze-pdf', { method: 'POST', body: payload });
      } else {
        response = await fetch('/api/v1/analyze-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume_text: resumeText })
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Nao foi possivel analisar o curriculo.');

      state.result = data;
      state.page = 'result';
      state.loading = false;
      render();
    } catch (error) {
      state.error = error.message;
      state.loading = false;
      render();
    }
  }

  function analyzePage() {
    return `
      <div class="space-y-10">
        <header class="text-center space-y-4">
          <h1 class="text-[2.75rem] font-bold tracking-tight leading-tight">${t('title')}</h1>
          <p class="text-on-surface-variant text-lg max-w-2xl mx-auto">${t('subtitle')}</p>
        </header>

        ${state.error ? `<div class="bg-error-container text-on-error-container rounded-xl p-4 font-medium">${state.error}</div>` : ''}

        <form id="analyze-form" class="max-w-3xl mx-auto space-y-6">
          <div class="space-y-6">
            <label id="resume-upload-zone" class="bg-surface-container-lowest rounded-xl p-8 shadow-sm border-2 border-dashed border-outline-variant/20 hover:border-primary/40 transition-all flex flex-col items-center justify-center cursor-pointer text-center aspect-[16/6]">
              <input type="file" name="resume_pdf" accept=".pdf" class="hidden" />
              <div class="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4">
                <span class="material-symbols-outlined text-3xl">upload_file</span>
              </div>
              <h3 class="text-lg font-semibold">${t('uploadTitle')}</h3>
              <p class="text-sm text-on-surface-variant mt-1">${t('uploadHint')}</p>
              <p id="resume-upload-status" class="text-xs font-semibold text-on-surface-variant mt-3">${t('uploadNoFile')}</p>
            </label>

            <div class="space-y-3">
              <label class="block text-[0.75rem] font-semibold text-on-surface-variant tracking-wider uppercase">${t('resumeText')}</label>
              <textarea name="resume_text" class="w-full h-56 p-6 bg-surface-container-lowest rounded-lg border-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="${t('resumePlaceholder')}"></textarea>
            </div>
          </div>
          <div class="flex flex-col items-center pt-2">
            <button ${state.loading ? 'disabled' : ''} class="px-12 py-5 rounded-xl text-lg font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-xl shadow-primary/20 disabled:opacity-50">
              ${state.loading ? t('analyzing') : t('analyzeBtn')}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  function resultPage() {
    if (!state.result) {
      return `
        <div class="bg-surface-container-lowest rounded-xl p-10 text-center">
          <h2 class="text-2xl font-bold mb-2">${t('noResult')}</h2>
          <p class="text-on-surface-variant mb-6">${t('runFirst')}</p>
          <button id="go-analyze" class="px-6 py-3 bg-primary text-white rounded-lg font-semibold">${t('goAnalyze')}</button>
        </div>
      `;
    }

    const r = state.result;
    const circ = Math.round(553 - (Math.max(0, Math.min(100, r.atsScore || 0)) / 100) * 553);

    return `
      <div class="space-y-8">
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div class="lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col items-center justify-center space-y-6 text-center">
            <div class="relative w-48 h-48 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90">
                <circle class="text-surface-container-highest/20" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" stroke-width="12"></circle>
                <circle class="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" stroke-dasharray="553" stroke-dashoffset="${circ}" stroke-linecap="round" stroke-width="12"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-5xl font-extrabold tracking-tight">${r.atsScore ?? 0}</span>
                <span class="text-sm font-medium text-on-surface-variant uppercase tracking-widest">/ 100</span>
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold">${t('atsScore')}</h3>
              <p class="text-sm text-on-surface-variant mt-1">${t('provider')}: ${(r.llm && r.llm.provider) || 'nenhum'}</p>
            </div>
            <a href="/api/v1/analyses/${r.analysisId}/report" target="_blank" class="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-lg shadow-lg text-center">${t('downloadReport')}</a>
          </div>

          <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="sm:col-span-2 bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-primary/10">
              <h4 class="font-bold text-on-surface mb-2">${t('finalSummary')}</h4>
              <p class="text-on-surface-variant text-sm leading-relaxed">${r.shortFinalSummary || t('none')}</p>
            </div>
            ${scoreRow(t('keywordMatch'), r.keywordMatchScore || 0)}
            ${scoreRow(t('structure'), r.structureScore || 0)}
            ${scoreRow(t('readability'), r.readabilityScore || 0)}
            ${scoreRow(t('contentStrength'), r.contentStrengthScore || 0)}
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            ${chipCard(t('keywordsFound'), r.keywordsFound || [], 'primary')}
            ${chipCard(t('keywordsMissing'), r.keywordsMissing || [], 'tertiary')}
          </div>
          <div class="space-y-6">
            ${listCard(t('detectedIssues'), r.detectedIssues || [], 'report', 'error')}
            ${orderedCard(t('suggestions'), r.improvementSuggestions || [])}
          </div>
        </section>
      </div>
    `;
  }

  function scoreRow(label, value) {
    return `
      <div class="bg-surface-container-low p-5 rounded-xl flex flex-col justify-between">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-semibold text-on-surface-variant">${label}</span>
          <span class="text-sm font-bold ${scoreColor(value)}">${value}%</span>
        </div>
        <div class="w-full bg-surface-container-highest/40 h-2 rounded-full overflow-hidden">
          <div class="${progressColor(value)} h-full rounded-full" style="width:${value}%"></div>
        </div>
      </div>
    `;
  }

  function chipCard(title, items, tone) {
    const cls = tone === 'primary'
      ? 'bg-primary/10 text-primary border-primary/5'
      : 'bg-tertiary-container/10 text-tertiary-container border-tertiary-container/5';

    return `
      <div class="bg-surface-container-low/50 p-6 rounded-xl border-l-4 ${tone === 'primary' ? 'border-primary' : 'border-tertiary-container'}">
        <h4 class="text-base font-bold mb-4">${title}</h4>
        <div class="flex flex-wrap gap-2">
          ${items.length ? items.map((i) => `<span class="px-3 py-1 ${cls} text-xs font-semibold rounded-full border">${i}</span>`).join('') : `<span class="text-on-surface-variant text-sm">${t('none')}</span>`}
        </div>
      </div>
    `;
  }

  function listCard(title, items, icon, tone) {
    return `
      <div class="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <h4 class="text-base font-bold mb-4">${title}</h4>
        <ul class="space-y-3">
          ${items.length ? items.map((item) => `
            <li class="flex gap-3 items-start">
              <span class="material-symbols-outlined text-sm ${tone === 'error' ? 'text-error' : 'text-primary'}">${icon}</span>
              <p class="text-sm text-on-surface-variant">${item}</p>
            </li>`).join('') : `<li class="text-sm text-on-surface-variant">${t('none')}</li>`}
        </ul>
      </div>
    `;
  }

  function orderedCard(title, items) {
    return `
      <div class="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <h4 class="text-base font-bold mb-4">${title}</h4>
        <ol class="space-y-3">
          ${items.length ? items.map((item, idx) => `
            <li class="flex gap-3 items-start">
              <span class="w-6 h-6 rounded-full bg-slate-100 text-primary text-xs font-bold flex items-center justify-center">${idx + 1}</span>
              <p class="text-sm text-on-surface-variant">${item}</p>
            </li>`).join('') : `<li class="text-sm text-on-surface-variant">${t('none')}</li>`}
        </ol>
      </div>
    `;
  }

  function historyPage() {
    const rows = state.history
      .map((item) => {
        const date = new Date(item.createdAt).toLocaleDateString();
        return `
          <button data-open="${item.analysisId}" class="w-full grid grid-cols-12 px-6 py-5 items-center hover:bg-surface-container-low/30 transition-colors group text-left">
            <div class="col-span-7 md:col-span-5 flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span class="material-symbols-outlined">analytics</span>
              </div>
              <div>
                <p class="font-bold tracking-tight">${item.targetRole || t('tableRole')}</p>
                <p class="text-xs text-on-surface-variant">${item.analysisId}</p>
              </div>
            </div>
            <div class="col-span-3 md:col-span-3 text-center">
              <span class="text-xs uppercase tracking-widest text-on-surface-variant">${item.sourceType || 'text'}</span>
            </div>
            <div class="col-span-2 md:col-span-3 text-sm text-on-surface-variant font-medium text-right md:text-left">${date}</div>
            <div class="hidden md:block md:col-span-1 text-right"><span class="material-symbols-outlined text-outline-variant">chevron_right</span></div>
          </button>
        `;
      })
      .join('');

    return `
      <div class="space-y-8">
        <div>
          <h2 class="text-4xl font-bold tracking-tight mb-2">${t('historyTitle')}</h2>
          <p class="text-on-surface-variant text-lg">${t('historySub')}</p>
        </div>

        ${state.error ? `<div class="bg-error-container text-on-error-container rounded-xl p-4 font-medium">${state.error}</div>` : ''}

        <div class="bg-surface-container-low/50 rounded-2xl overflow-hidden p-1">
          <div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div class="grid grid-cols-12 px-6 py-4 bg-surface-container-low text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">
              <div class="col-span-7 md:col-span-5">${t('tableRole')}</div>
              <div class="col-span-3 md:col-span-3 text-center">${t('tableSource')}</div>
              <div class="col-span-2 md:col-span-3 text-right md:text-left">${t('tableDate')}</div>
              <div class="hidden md:block md:col-span-1 text-right">${t('tableAction')}</div>
            </div>
            <div class="divide-y divide-surface-container-low">
              ${rows || `<div class="px-6 py-10 text-on-surface-variant">${t('noAnalyses')}</div>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindActions() {
    document.querySelectorAll('[data-nav]').forEach((node) => {
      node.addEventListener('click', () => {
        const page = node.getAttribute('data-nav');
        if (page === 'history') loadHistory();
        setPage(page);
      });
    });

    const form = document.getElementById('analyze-form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitAnalysis(form);
      });

      const fileInput = form.querySelector('[name="resume_pdf"]');
      if (fileInput) {
        fileInput.addEventListener('change', () => {
          const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
          updateUploadStatus(file);
        });
        updateUploadStatus(fileInput.files && fileInput.files[0] ? fileInput.files[0] : null);
      }
    }

    document.querySelectorAll('[data-open]').forEach((node) => {
      node.addEventListener('click', () => openAnalysis(node.getAttribute('data-open')));
    });

    const newAnalysis = document.getElementById('new-analysis');
    if (newAnalysis) newAnalysis.addEventListener('click', () => setPage('analyze'));

    const goAnalyze = document.getElementById('go-analyze');
    if (goAnalyze) goAnalyze.addEventListener('click', () => setPage('analyze'));

  }

  function render() {
    if (state.page === 'analyze') app.innerHTML = analyzePage();
    if (state.page === 'result') app.innerHTML = resultPage();
    if (state.page === 'history') app.innerHTML = historyPage();
    syncTopNavText();
    bindActions();
  }

  render();
})();
