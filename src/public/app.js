(function () {
  const app = document.getElementById('app');
  const state = {
    page: 'analyze',
    result: null,
    history: [],
    loading: false,
    error: '',
    helpOpen: false,
    feedbackOpen: false,
    feedbackText: ''
  };

  const UI_TEXT = {
    navOther: 'Confira nosso outro app:',
    navOtherLink: 'RAGFlow Engine',
    navAnalyze: 'Analisar',
    navResult: 'Resultado',
    navHistory: 'Histórico',
    navAbout: 'Sobre',
    newAnalysis: 'Nova Análise',
    title: 'Veja se seu currículo é compatível com ATS',
    subtitle:
      'Score ATS determinístico com assistência opcional de IA. Sem promessas exageradas, apenas melhorias práticas.',
    uploadTitle: 'Enviar currículo em PDF (opcional)',
    uploadNoFile: 'Nenhum arquivo selecionado ainda.',
    uploadSelectedPrefix: 'PDF selecionado:',
    resumeText: 'Texto do currículo',
    resumePlaceholder:
      'Se preferir, cole o texto do currículo aqui. Se você já enviou PDF, pode deixar em branco.',
    analyzeBtn: 'Analisar currículo',
    analyzing: 'Analisando...',
    noResult: 'Sem resultado ainda',
    runFirst: 'Rode uma análise primeiro.',
    goAnalyze: 'Ir para Análise',
    atsScore: 'Score ATS',
    provider: 'Provedor',
    downloadReport: 'Baixar relatório em Markdown',
    finalSummary: 'Resumo final',
    keywordMatch: 'Aderência de palavras-chave',
    structure: 'Estrutura',
    readability: 'Legibilidade',
    contentStrength: 'Força de conteúdo',
    keywordsFound: 'Palavras-chave encontradas',
    keywordsMissing: 'Palavras-chave ausentes',
    detectedIssues: 'Problemas detectados',
    suggestions: 'Sugestões práticas',
    none: 'Nenhum',
    historyTitle: 'Histórico de análises',
    historySub: 'Abra qualquer análise ATS salva.',
    tableRole: 'ID da análise',
    tableSource: 'Fonte',
    tableDate: 'Data',
    tableAction: 'Ação',
    noAnalyses: 'Nenhuma análise ainda.',
    aboutTitle: 'Sobre o ATSFlow Engine',
    aboutSubtitle:
      'Entenda como o ATSFlow ajuda você a otimizar seu currículo para processos seletivos modernos e aumentar suas chances de entrevista.',
    aboutWhatIsTitle: 'O que este app faz',
    aboutWhatIsBody:
      'O ATSFlow analisa seu currículo com foco em compatibilidade com sistemas de recrutamento (ATS), avaliando estrutura, clareza do conteúdo e aderência às competências exigidas na vaga. O resultado é um diagnóstico prático com sugestões objetivas para melhorar sua performance em processos seletivos.',
    aboutHowTitle: 'Como a análise é calculada',
    aboutHowBody:
      'A pontuação combina diferentes fatores relevantes para recrutadores e sistemas automatizados, como correspondência de palavras-chave, organização das seções, legibilidade e impacto das descrições profissionais. Isso gera um score transparente e fácil de interpretar.',
    aboutLimitsTitle: 'Limites importantes',
    aboutLimitsBody:
      'O ATSFlow não substitui avaliação humana nem garante aprovação em vagas. A ferramenta existe para apoiar decisões mais estratégicas, ajudando candidatos a priorizar melhorias com base em critérios reais do mercado.',
    aboutTechTitle: 'Base técnica',
    aboutTechBody:
      'Construído com arquitetura moderna em Node.js e processamento inteligente de documentos, o ATSFlow integra heurísticas determinísticas e análise assistida por IA para entregar feedback consistente, rápido e resiliente.'
  };

  const t = (key) => UI_TEXT[key] || key;

  function SidebarSupportSection() {
    return `
      <div class="space-y-1.5">
        <button id="open-help" class="w-full text-left px-2 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm font-medium flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">help</span><span>Ajuda</span>
        </button>
        <button id="open-feedback" class="w-full text-left px-2 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm font-medium flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">chat</span><span>Feedback</span>
        </button>
      </div>
    `;
  }

  function HelpModal() {
    return `
      <div class="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" data-close-modal="help">
        <div class="w-full max-w-3xl max-h-[86vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div class="flex items-start justify-between gap-4 mb-8">
            <h2 class="text-3xl font-bold tracking-tight">Como usar este app</h2>
            <button id="close-help" class="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-slate-200">Fechar</button>
          </div>

          <ol class="space-y-3 text-[15px] leading-relaxed list-decimal pl-5 mb-10">
            <li>Envie seu currículo em PDF ou cole o texto.</li>
            <li>Adicione a descrição da vaga que você quer atingir.</li>
            <li>Opcionalmente, defina seu cargo alvo.</li>
            <li>Rode a análise.</li>
            <li>Revise os scores, insights e sugestões de melhoria.</li>
            <li>Baixe ou revise sua análise depois no Histórico.</li>
          </ol>

          <section class="mb-10">
            <h3 class="text-xl font-bold mb-4">Perguntas Frequentes</h3>
            <div class="space-y-4 text-[15px] leading-relaxed">
              <div><p class="font-semibold">Esta análise é 100% precisa?</p><p class="text-slate-600">Não. Esta ferramenta combina análise determinística e assistência de IA para orientar, sem garantias absolutas.</p></div>
              <div><p class="font-semibold">Você armazena meu currículo?</p><p class="text-slate-600">As análises podem ser armazenadas localmente para melhorar sua experiência e manter histórico.</p></div>
              <div><p class="font-semibold">Posso usar isso em candidaturas reais?</p><p class="text-slate-600">Sim. A ferramenta ajuda a otimizar estrutura e posicionamento, mas ajustes finais sempre são recomendados.</p></div>
              <div><p class="font-semibold">Por que os scores diferem de outras ferramentas?</p><p class="text-slate-600">Cada plataforma usa heurísticas e modelos diferentes. Este app prioriza clareza, transparência e insights acionáveis.</p></div>
              <div><p class="font-semibold">Qual a diferença entre ATSFlow e RAGFlow?</p><p class="text-slate-600">ATSFlow foca em otimização técnica para ATS. RAGFlow foca em match semântico e estratégia de carreira.</p></div>
            </div>
          </section>

          <section>
            <h3 class="text-xl font-bold mb-4">Dicas para melhores resultados</h3>
            <ul class="space-y-2 text-[15px] leading-relaxed list-disc pl-5 text-slate-700">
              <li>Use descrições de vaga completas.</li>
              <li>Evite currículos extremamente curtos.</li>
              <li>Foque em conquistas mensuráveis.</li>
              <li>Mantenha a formatação simples e amigável para ATS.</li>
            </ul>
          </section>
        </div>
      </div>
    `;
  }

  function FeedbackModal() {
    return `
      <div class="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" data-close-modal="feedback">
        <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
          <div class="flex items-start justify-between gap-4 mb-6">
            <h2 class="text-2xl font-bold tracking-tight">Feedback</h2>
            <button id="close-feedback" class="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-slate-200">Fechar</button>
          </div>
          <label for="feedback-input" class="block text-sm font-semibold mb-3">Compartilhe sua sugestão ou reporte um problema</label>
          <textarea id="feedback-input" class="w-full h-44 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none" placeholder="Digite seu feedback aqui...">${state.feedbackText || ''}</textarea>
          <div class="mt-5 flex justify-end">
            <button id="send-feedback" class="px-5 py-2.5 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-500 transition-colors">Enviar Feedback</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSupportUi() {
    const sidebarSupport = document.getElementById('sidebar-support');
    if (sidebarSupport) sidebarSupport.innerHTML = SidebarSupportSection();

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return;
    modalRoot.innerHTML = `${state.helpOpen ? HelpModal() : ''}${state.feedbackOpen ? FeedbackModal() : ''}`;
  }

  function syncTopNavText() {
    const map = {
      'nav-other-text': t('navOther'),
      'nav-other-link': t('navOtherLink'),
      'side-nav-analyze': t('navAnalyze'),
      'side-nav-result': t('navResult'),
      'side-nav-history': t('navHistory'),
      'side-nav-about': t('navAbout'),
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
      if (!response.ok) throw new Error('Não foi possível carregar o histórico.');
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
      if (!response.ok) throw new Error('Não foi possível carregar a análise.');
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
      if (!response.ok) throw new Error(data.error || 'Não foi possível analisar o currículo.');

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

  function aboutPage() {
    return `
      <div class="space-y-8">
        <header class="space-y-3">
          <h2 class="text-4xl font-bold tracking-tight">${t('aboutTitle')}</h2>
          <p class="text-on-surface-variant text-lg max-w-3xl">${t('aboutSubtitle')}</p>
        </header>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article class="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-3">
            <h3 class="text-xl font-bold">${t('aboutWhatIsTitle')}</h3>
            <p class="text-on-surface-variant leading-relaxed">${t('aboutWhatIsBody')}</p>
          </article>
          <article class="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-3">
            <h3 class="text-xl font-bold">${t('aboutHowTitle')}</h3>
            <p class="text-on-surface-variant leading-relaxed">${t('aboutHowBody')}</p>
          </article>
          <article class="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-3">
            <h3 class="text-xl font-bold">${t('aboutLimitsTitle')}</h3>
            <p class="text-on-surface-variant leading-relaxed">${t('aboutLimitsBody')}</p>
          </article>
          <article class="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-3">
            <h3 class="text-xl font-bold">${t('aboutTechTitle')}</h3>
            <p class="text-on-surface-variant leading-relaxed">${t('aboutTechBody')}</p>
          </article>
        </section>
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

    const openHelp = document.getElementById('open-help');
    if (openHelp) {
      openHelp.addEventListener('click', () => {
        state.helpOpen = true;
        render();
      });
    }

    const openFeedback = document.getElementById('open-feedback');
    if (openFeedback) {
      openFeedback.addEventListener('click', () => {
        state.feedbackOpen = true;
        render();
      });
    }

    const closeHelp = document.getElementById('close-help');
    if (closeHelp) {
      closeHelp.addEventListener('click', () => {
        state.helpOpen = false;
        render();
      });
    }

    const closeFeedback = document.getElementById('close-feedback');
    if (closeFeedback) {
      closeFeedback.addEventListener('click', () => {
        state.feedbackOpen = false;
        render();
      });
    }

    document.querySelectorAll('[data-close-modal]').forEach((node) => {
      node.addEventListener('click', (event) => {
        if (event.target !== node) return;
        if (node.getAttribute('data-close-modal') === 'help') state.helpOpen = false;
        if (node.getAttribute('data-close-modal') === 'feedback') state.feedbackOpen = false;
        render();
      });
    });

    const feedbackInput = document.getElementById('feedback-input');
    if (feedbackInput) {
      feedbackInput.addEventListener('input', (event) => {
        state.feedbackText = event.target.value;
      });
    }

    const sendFeedback = document.getElementById('send-feedback');
    if (sendFeedback) {
      sendFeedback.addEventListener('click', async () => {
        const feedback = (state.feedbackText || '').trim();
        if (!feedback) return;
        try {
          sendFeedback.disabled = true;
          sendFeedback.textContent = 'Enviando...';
          const response = await fetch('/api/v1/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: feedback })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Não foi possível enviar feedback.');
          state.feedbackText = '';
          state.feedbackOpen = false;
          render();
        } catch (error) {
          console.error('[ATSFlow Feedback Error]', error.message);
        } finally {
          sendFeedback.disabled = false;
          sendFeedback.textContent = 'Enviar Feedback';
        }
      });
    }
  }

  function render() {
    if (state.page === 'analyze') app.innerHTML = analyzePage();
    if (state.page === 'result') app.innerHTML = resultPage();
    if (state.page === 'history') app.innerHTML = historyPage();
    if (state.page === 'about') app.innerHTML = aboutPage();
    syncTopNavText();
    renderSupportUi();
    bindActions();
  }

  render();
})();
