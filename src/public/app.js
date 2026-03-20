(function () {
  const app = document.getElementById('app');
  const state = {
    page: 'analyze',
    result: null,
    history: [],
    loading: false,
    error: ''
  };

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

  async function loadHistory() {
    try {
      const response = await fetch('/api/v1/analyses');
      if (!response.ok) throw new Error('Failed to load history');
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
      if (!response.ok) throw new Error('Failed to load analysis');
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
    const jobDescription = form.querySelector('[name="job_description"]').value.trim();
    const targetRole = form.querySelector('[name="target_role"]').value.trim();
    const fileInput = form.querySelector('[name="resume_pdf"]');
    const file = fileInput.files[0];

    try {
      let response;
      if (file) {
        const payload = new FormData();
        payload.append('resume_pdf', file);
        payload.append('job_description', jobDescription);
        payload.append('target_role', targetRole);
        response = await fetch('/api/v1/analyze-pdf', { method: 'POST', body: payload });
      } else {
        response = await fetch('/api/v1/analyze-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_text: resumeText,
            job_description: jobDescription,
            target_role: targetRole
          })
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze');

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
          <h1 class="text-[2.75rem] font-bold tracking-tight leading-tight">
            Check if your resume is <span class="text-primary italic">ATS-friendly</span>
          </h1>
          <p class="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Deterministic ATS scoring with optional AI assistance. No overpromises, only practical improvements.
          </p>
        </header>

        ${state.error ? `<div class="bg-error-container text-on-error-container rounded-xl p-4 font-medium">${state.error}</div>` : ''}

        <form id="analyze-form" class="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div class="md:col-span-7 space-y-6">
            <label class="bg-surface-container-lowest rounded-xl p-8 shadow-sm border-2 border-dashed border-outline-variant/20 hover:border-primary/40 transition-all flex flex-col items-center justify-center cursor-pointer text-center aspect-[16/6]">
              <input type="file" name="resume_pdf" accept=".pdf" class="hidden" />
              <div class="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4">
                <span class="material-symbols-outlined text-3xl">upload_file</span>
              </div>
              <h3 class="text-lg font-semibold">Upload Resume PDF (optional)</h3>
              <p class="text-sm text-on-surface-variant mt-1">If omitted, text input below will be used</p>
            </label>

            <div class="space-y-3">
              <label class="block text-[0.75rem] font-semibold text-on-surface-variant tracking-wider uppercase">Target Role</label>
              <input name="target_role" class="w-full h-14 px-6 bg-surface-container-lowest rounded-lg border-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Senior Software Engineer" />
            </div>

            <div class="space-y-3">
              <label class="block text-[0.75rem] font-semibold text-on-surface-variant tracking-wider uppercase">Resume Text</label>
              <textarea name="resume_text" class="w-full h-56 p-6 bg-surface-container-lowest rounded-lg border-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Paste your resume content here..."></textarea>
            </div>
          </div>

          <div class="md:col-span-5 space-y-3 h-full flex flex-col">
            <label class="block text-[0.75rem] font-semibold text-on-surface-variant tracking-wider uppercase">Job Description</label>
            <textarea name="job_description" class="flex-1 w-full min-h-[360px] p-6 bg-surface-container-lowest rounded-lg border-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Paste the job description..."></textarea>
            <div class="mt-3 p-5 bg-tertiary-container/10 rounded-xl border-l-4 border-tertiary-container">
              <p class="text-sm font-semibold text-tertiary">Pro tip</p>
              <p class="text-xs text-on-tertiary-fixed-variant mt-1">Detailed job descriptions improve keyword matching and structure guidance.</p>
            </div>
          </div>

          <div class="md:col-span-12 flex flex-col items-center pt-2">
            <button ${state.loading ? 'disabled' : ''} class="px-12 py-5 rounded-xl text-lg font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-xl shadow-primary/20 disabled:opacity-50">
              ${state.loading ? 'Analyzing...' : 'Analyze Resume'}
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
          <h2 class="text-2xl font-bold mb-2">No result yet</h2>
          <p class="text-on-surface-variant mb-6">Run an analysis first.</p>
          <button id="go-analyze" class="px-6 py-3 bg-primary text-white rounded-lg font-semibold">Go to Analyze</button>
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
              <h3 class="text-xl font-bold">ATS Score</h3>
              <p class="text-sm text-on-surface-variant mt-1">Provider: ${(r.llm && r.llm.provider) || 'none'}</p>
            </div>
            <a href="/api/v1/analyses/${r.analysisId}/report" target="_blank" class="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-lg shadow-lg text-center">Download Markdown Report</a>
          </div>

          <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="sm:col-span-2 bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-primary/10">
              <h4 class="font-bold text-on-surface mb-2">Final Summary</h4>
              <p class="text-on-surface-variant text-sm leading-relaxed">${r.shortFinalSummary || 'No summary provided.'}</p>
            </div>
            ${scoreRow('Keyword Match', r.keywordMatchScore || 0)}
            ${scoreRow('Structure', r.structureScore || 0)}
            ${scoreRow('Readability', r.readabilityScore || 0)}
            ${scoreRow('Content Strength', r.contentStrengthScore || 0)}
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            ${chipCard('Keywords Found', r.keywordsFound || [], 'primary')}
            ${chipCard('Keywords Missing', r.keywordsMissing || [], 'tertiary')}
          </div>
          <div class="space-y-6">
            ${listCard('Detected Issues', r.detectedIssues || [], 'report', 'error')}
            ${orderedCard('Actionable Suggestions', r.improvementSuggestions || [])}
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
          ${items.length ? items.map((i) => `<span class="px-3 py-1 ${cls} text-xs font-semibold rounded-full border">${i}</span>`).join('') : '<span class="text-on-surface-variant text-sm">None</span>'}
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
            </li>`).join('') : '<li class="text-sm text-on-surface-variant">None</li>'}
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
            </li>`).join('') : '<li class="text-sm text-on-surface-variant">None</li>'}
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
                <p class="font-bold tracking-tight">${item.targetRole || 'Untitled Analysis'}</p>
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
          <h2 class="text-4xl font-bold tracking-tight mb-2">Analysis History</h2>
          <p class="text-on-surface-variant text-lg">Open any saved ATS analysis report.</p>
        </div>

        ${state.error ? `<div class="bg-error-container text-on-error-container rounded-xl p-4 font-medium">${state.error}</div>` : ''}

        <div class="bg-surface-container-low/50 rounded-2xl overflow-hidden p-1">
          <div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div class="grid grid-cols-12 px-6 py-4 bg-surface-container-low text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">
              <div class="col-span-7 md:col-span-5">Target Role & ID</div>
              <div class="col-span-3 md:col-span-3 text-center">Source</div>
              <div class="col-span-2 md:col-span-3 text-right md:text-left">Date</div>
              <div class="hidden md:block md:col-span-1 text-right">Action</div>
            </div>
            <div class="divide-y divide-surface-container-low">
              ${rows || '<div class="px-6 py-10 text-on-surface-variant">No analyses yet.</div>'}
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
    }

    document.querySelectorAll('[data-open]').forEach((node) => {
      node.addEventListener('click', () => openAnalysis(node.getAttribute('data-open')));
    });

    const newAnalysis = document.getElementById('new-analysis');
    if (newAnalysis) {
      newAnalysis.addEventListener('click', () => setPage('analyze'));
    }

    const goAnalyze = document.getElementById('go-analyze');
    if (goAnalyze) {
      goAnalyze.addEventListener('click', () => setPage('analyze'));
    }

    const translateBtn = document.getElementById('translate-btn');
    if (translateBtn && !translateBtn.dataset.bound) {
      translateBtn.dataset.bound = '1';
      translateBtn.addEventListener('click', () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://translate.google.com/translate?sl=auto&tl=en&u=${url}`, '_blank');
      });
    }
  }

  function render() {
    if (state.page === 'analyze') app.innerHTML = analyzePage();
    if (state.page === 'result') app.innerHTML = resultPage();
    if (state.page === 'history') app.innerHTML = historyPage();
    bindActions();
  }

  render();
})();
