import { createT } from '../i18n.js';
import { state } from '../state.js';
import { bindPress } from '../ui/press.js';

export function render(lang, onNavigate) {
  const t = createT(lang);
  const el = document.getElementById('home-view');

  const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>`;
  const arrowSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`;
  const chevSvg  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>`;

  el.innerHTML = `
    <!-- ── Hero: Editorial Split ── -->
    <section class="hero" role="banner">
      <div>
        <div class="hero-eyebrow">${t('home_eyebrow')}</div>
        <h1 class="hero-title">${t('home_h1_a')}<br><em>${t('home_h1_b')}</em></h1>
        <p class="hero-lead">${t('home_lead')}</p>
        <div class="hero-cta-row">
          <button class="hero-cta primary" data-scroll="sports">
            ${t('home_cta')}
            ${arrowSvg}
          </button>
          <button class="hero-cta ghost" data-scroll="eli5">${t('home_cta_ghost')}</button>
        </div>
        <div class="proof-row">
          <span class="proof">${checkSvg}${t('home_proof_1')}</span>
          <span class="proof">${checkSvg}${t('home_proof_2')}</span>
          <span class="proof">${checkSvg}${t('home_proof_3')}</span>
        </div>
      </div>

      <div class="readout" role="figure" aria-label="${t('home_readout_label')}">
        <div class="readout-head">
          <span class="corner"></span>
          <span>${t('home_readout_label')}</span>
          <span>${t('home_readout_id')}</span>
        </div>
        <div class="readout-pace">4:30<span class="unit">/km</span></div>
        <div class="readout-sub">${t('home_readout_sub')}</div>
        <div class="readout-divider"></div>
        <div class="readout-grid">
          <div class="readout-stat"><div class="rsk">5K</div><div class="rsv">22:30</div></div>
          <div class="readout-stat"><div class="rsk">10K</div><div class="rsv">45:00</div></div>
          <div class="readout-stat"><div class="rsk">Halb</div><div class="rsv">1:34:56</div></div>
        </div>
        <div class="readout-foot">
          <span><strong>●</strong> ${t('home_readout_live')}</span>
          <span>min · sek · km</span>
        </div>
      </div>
    </section>

    <!-- ── Sport grid ── -->
    <section class="home-sports" id="sports">
      <div class="section-head">
        <h2>${t('home_sec_title')}</h2>
        <span class="sub">${t('home_sec_sub')}</span>
      </div>
      <div class="sport-grid">
        <button class="sport-card" data-sport="running" data-nav="running">
          <div class="sport-arrow">${chevSvg}</div>
          <div class="sport-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0M6 20l4-8 2 2 3-6"/></svg></div>
          <h3>${t('running')}</h3>
          <p>${t('home_run_p')}</p>
          <div class="sport-feat"><span>${t('home_run_f1')}</span><span>${t('home_run_f2')}</span><span>${t('home_run_f3')}</span></div>
        </button>
        <button class="sport-card" data-sport="cycling" data-nav="cycling">
          <div class="sport-arrow">${chevSvg}</div>
          <div class="sport-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M10 13l1.5-4 2 3 1.5-3.5"/></svg></div>
          <h3>Zwift</h3>
          <p>${t('home_cyc_p')}</p>
          <div class="sport-feat"><span>${t('home_cyc_f1')}</span><span>${t('home_cyc_f2')}</span><span>${t('home_cyc_f3')}</span></div>
        </button>
        <button class="sport-card" data-sport="outdoor" data-nav="outdoor">
          <div class="sport-arrow">${chevSvg}</div>
          <div class="sport-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2M5.5 17.5 10 8l2 4 2-3h2"/></svg></div>
          <h3>${t('home_out_h')}</h3>
          <p>${t('home_out_p')}</p>
          <div class="sport-feat"><span>${t('home_out_f1')}</span><span>${t('home_out_f2')}</span><span>${t('home_out_f3')}</span></div>
        </button>
        <button class="sport-card" data-sport="swim" data-nav="swim">
          <div class="sport-arrow">${chevSvg}</div>
          <div class="sport-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 8l-4 8-3-4-3 4"/></svg></div>
          <h3>${t('swim')}</h3>
          <p>${t('home_swim_p')}</p>
          <div class="sport-feat"><span>${t('home_swim_f1')}</span><span>${t('home_swim_f2')}</span><span>${t('home_swim_f3')}</span></div>
        </button>
        <button class="sport-card" data-sport="street" data-nav="street">
          <div class="sport-arrow">${chevSvg}</div>
          <div class="sport-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="1.5"/><path d="M9 8.5h6M10 8.5l-2 7M14 8.5l2 7M8 21l2-5.5M16 21l-2-5.5"/></svg></div>
          <h3>${t('home_str_h')}</h3>
          <p>${t('home_str_p')}</p>
          <div class="sport-feat"><span>${t('home_str_f1')}</span><span>${t('home_str_f2')}</span><span>${t('home_str_f3')}</span></div>
        </button>
      </div>
    </section>

    <!-- ── Features ── -->
    <section class="home-features">
      <div class="feat-grid">
        <div class="feat-item"><div class="num">${t('home_feat1_num')}</div><h4>${t('home_feat1_h')}</h4><p>${t('home_feat1_p')}</p></div>
        <div class="feat-item"><div class="num">${t('home_feat2_num')}</div><h4>${t('home_feat2_h')}</h4><p>${t('home_feat2_p')}</p></div>
        <div class="feat-item"><div class="num">${t('home_feat3_num')}</div><h4>${t('home_feat3_h')}</h4><p>${t('home_feat3_p')}</p></div>
      </div>
    </section>

    <!-- ── ELI5 ── -->
    <section class="home-eli5" id="eli5">
      <div class="eli5-eyebrow">${t('home_eli5_eyebrow')}</div>
      <h2 class="eli5-title">${t('home_eli5_title')}</h2>
      <div class="eli5-grid">
        <div class="eli5-card">
          <div class="eli5-icon eli5-icon--run">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0M6 20l4-8 2 2 3-6"/></svg>
          </div>
          <div><h4>${t('home_eli5_1_h')}</h4><p>${t('home_eli5_1_p')}</p></div>
        </div>
        <div class="eli5-card">
          <div class="eli5-icon eli5-icon--cyc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M10 13l1.5-4 2 3 1.5-3.5"/></svg>
          </div>
          <div><h4>${t('home_eli5_2_h')}</h4><p>${t('home_eli5_2_p')}</p></div>
        </div>
        <div class="eli5-card">
          <div class="eli5-icon eli5-icon--out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2M5.5 17.5 10 8l2 4 2-3h2"/></svg>
          </div>
          <div><h4>${t('home_eli5_3_h')}</h4><p>${t('home_eli5_3_p')}</p></div>
        </div>
        <div class="eli5-card">
          <div class="eli5-icon eli5-icon--swim">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 8l-4 8-3-4-3 4"/></svg>
          </div>
          <div><h4>${t('home_eli5_4_h')}</h4><p>${t('home_eli5_4_p')}</p></div>
        </div>
      </div>
      <p class="eli5-footer">${t('home_eli5_footer')}</p>
    </section>
  `;

  el.querySelectorAll('[data-nav]').forEach(btn => {
    bindPress(btn, () => onNavigate(btn.dataset.nav));
  });

  el.querySelectorAll('[data-scroll]').forEach(btn => {
    bindPress(btn, () => {
      const target = document.getElementById(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
