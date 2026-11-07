// Schindelegger – kleine Interaktions-Inseln (Menü, Announcement, Modal, Engine-Tabs, Tracking, Cookie)
const TRACKING_LOG = true; // Demo-Panel "Tracking-Log" – vor Go-live auf false setzen

type DL = Record<string, unknown>;
const w = window as unknown as { dataLayer: DL[]; gtag?: (...a: unknown[]) => void };
w.dataLayer = w.dataLayer || [];
const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

// ---------- Tracking ----------
let logCount = 0;
const logEl = document.querySelector<HTMLElement>('.tlog');
function track(event: string, data: DL = {}) {
  w.dataLayer.push({ event, ...data });
  if (TRACKING_LOG && logEl) {
    logCount++;
    logEl.querySelector('b')!.textContent = String(logCount);
    const li = document.createElement('li');
    li.textContent = `${new Date().toLocaleTimeString('de-AT')} ${event}${Object.keys(data).length ? ' ' + JSON.stringify(data) : ''}`;
    logEl.querySelector('ol')!.prepend(li);
  }
}
if (logEl) {
  if (!TRACKING_LOG) logEl.remove();
  else logEl.querySelector('button')!.addEventListener('click', () => logEl.classList.toggle('open'));
}
document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track], a[href^="tel:"], a[href*="wa.me"]');
  if (!el) return;
  const href = el.getAttribute('href') || '';
  if (href.startsWith('tel:')) track('phone_click', { position: el.dataset.track || 'link' });
  else if (href.includes('wa.me')) track('whatsapp_click', { position: el.dataset.track || 'link' });
  else track(el.dataset.track || 'cta_click', { text: el.textContent?.trim().slice(0, 60) });
});
document.querySelectorAll('.faq details').forEach((d) => d.addEventListener('toggle', () => {
  if ((d as HTMLDetailsElement).open) track('faq_open', { q: d.querySelector('summary')?.textContent?.trim().slice(0, 60) });
}));
const depths = [25, 50, 75, 100]; const hit = new Set<number>();
addEventListener('scroll', () => {
  const h = document.documentElement; const p = ((h.scrollTop + innerHeight) / h.scrollHeight) * 100;
  depths.forEach((d) => { if (p >= d - 1 && !hit.has(d)) { hit.add(d); track('scroll_depth', { percent: d }); } });
}, { passive: true });

// ---------- Announcement ----------
const ann = document.querySelector<HTMLElement>('.announce');
if (ann) {
  const until = Number(store.get('ann-closed') || 0);
  if (until > Date.now()) ann.remove();
  else {
    const msgs = [...ann.querySelectorAll<HTMLElement>('.announce-msg')];
    let i = 0, paused = false;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (msgs.length > 1 && !reduce) {
      setInterval(() => { if (paused) return; msgs[i].classList.remove('on'); i = (i + 1) % msgs.length; msgs[i].classList.add('on'); }, 5000);
      ann.addEventListener('mouseenter', () => (paused = true));
      ann.addEventListener('mouseleave', () => (paused = false));
      ann.addEventListener('focusin', () => (paused = true));
      ann.addEventListener('focusout', () => (paused = false));
    }
    msgs.forEach((m) => m.addEventListener('click', () => track('announcement_click', { text: m.textContent?.trim() })));
    ann.querySelector('.announce-x')?.addEventListener('click', () => { store.set('ann-closed', String(Date.now() + 7 * 864e5)); ann.remove(); });
  }
}

// ---------- Header / Menü ----------
const header = document.querySelector<HTMLElement>('.site-header');
const burger = document.querySelector<HTMLButtonElement>('.burger');
const menu = document.querySelector<HTMLElement>('.mobile-menu');
addEventListener('scroll', () => header?.classList.toggle('compact', scrollY > 40), { passive: true });
function setMenu(open: boolean) {
  if (!burger || !menu) return;
  const top = header!.getBoundingClientRect().bottom;
  menu.style.setProperty('--menu-top', `${top}px`);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  menu.classList.toggle('open', open);
  header?.classList.toggle('menue-offen', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a,button').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); } });
matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

// ---------- Mobile Sticky-Bar ----------
const mbar = document.querySelector<HTMLElement>('.mbar');
const heroEnd = document.querySelector('[data-hero]');
if (mbar) {
  if (heroEnd && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => mbar.classList.toggle('show', !e.isIntersecting)).observe(heroEnd);
  } else mbar.classList.add('show');
}

// ---------- Modal ----------
const modal = document.querySelector<HTMLElement>('#beratung');
if (modal) {
  const form = modal.querySelector<HTMLFormElement>('[data-modal-form]')!;
  const steps = [...modal.querySelectorAll<HTMLElement>('.modal-step')];
  const next = modal.querySelector<HTMLButtonElement>('[data-next]')!;
  const back = modal.querySelector<HTMLButtonElement>('[data-back]')!;
  const foot = modal.querySelector<HTMLElement>('[data-foot]')!;
  const prog = modal.querySelector<HTMLElement>('[data-progress]')!;
  let cur = 0; let lastFocus: HTMLElement | null = null;

  const valid = () => {
    const s = steps[cur];
    if (cur === 0) return !!s.querySelector('input:checked');
    if (cur === 1) return !!s.querySelector('input:checked');
    if (cur === 2) return !!s.querySelector('input[name=budget]:checked');
    if (cur === 4) return [...s.querySelectorAll<HTMLInputElement>('[required]')].every((i) => i.checkValidity());
    return true;
  };
  const render = () => {
    steps.forEach((s, i) => (s.hidden = i !== cur));
    const isDone = steps[cur].dataset.step === 'done';
    prog.hidden = isDone; foot.hidden = isDone;
    if (!isDone) {
      prog.querySelector('[data-step-num]')!.textContent = String(cur + 1);
      prog.querySelector('[data-step-name]')!.textContent = steps[cur].dataset.name || '';
      (prog.querySelector('.progress-bar span') as HTMLElement).style.width = `${((cur + 1) / 5) * 100}%`;
      back.hidden = cur === 0;
      next.querySelector('[data-next-label]')!.textContent = cur === 4 ? 'Anfrage senden' : 'Weiter';
      next.disabled = !valid();
    }
    track('modal_step', { step: cur + 1, name: steps[cur].dataset.name || 'danke' });
  };
  const open = (opts: { theme?: string; source?: string } = {}) => {
    lastFocus = document.activeElement as HTMLElement;
    if (opts.theme) form.querySelectorAll<HTMLInputElement>('[data-theme]').forEach((i) => { if (i.value.toLowerCase().includes(opts.theme!.toLowerCase())) i.checked = true; });
    (form.querySelector('[data-source]') as HTMLInputElement).value = opts.source || location.pathname;
    modal.hidden = false; modal.classList.add('open'); document.body.classList.add('modal-open');
    render();
    setTimeout(() => modal.querySelector<HTMLElement>('.modal-x')?.focus(), 30);
    track('modal_open', { source: opts.source || location.pathname });
  };
  const close = () => { modal.classList.remove('open'); modal.hidden = true; document.body.classList.remove('modal-open'); lastFocus?.focus(); };

  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-modal], a[href="#beratung"]');
    if (!t) return;
    e.preventDefault();
    open({ theme: t.dataset.theme, source: t.dataset.track || location.pathname });
  });
  modal.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = [...modal.querySelectorAll<HTMLElement>('button:not([hidden]):not([disabled]), input, select, textarea, a[href]')].filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && cur < 4) { e.preventDefault(); if (valid()) go(1); }
  });
  form.addEventListener('change', (e) => {
    next.disabled = !valid();
    const t = e.target as HTMLInputElement;
    if ((t.dataset.auto !== undefined || t.name === 'budget') && t.checked) setTimeout(() => go(1), 220);
  });
  form.addEventListener('input', () => (next.disabled = !valid()));
  async function submit() {
    const err = modal!.querySelector('[data-error]')!;
    err.textContent = '';
    next.disabled = true;
    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!r.ok && location.hostname !== 'localhost') throw new Error(String(r.status));
      track('generate_lead', { form: 'beratung' });
      cur = steps.length - 1; render();
    } catch {
      err.textContent = 'Das hat leider nicht funktioniert. Bitte erneut versuchen oder direkt per E-Mail melden.';
      next.disabled = false;
    }
  }
  function go(d: number) {
    if (d > 0 && !valid()) return;
    if (d > 0 && cur === 4) return void submit();
    cur = Math.max(0, Math.min(4, cur + d)); render();
    steps[cur].querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true });
  }
  next.addEventListener('click', () => go(1));
  back.addEventListener('click', () => go(-1));
  if (location.hash === '#beratung') open();
}

// ---------- Kontaktformular (Seite) ----------
document.querySelectorAll<HTMLFormElement>('form[data-ajax]').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = f.querySelector<HTMLButtonElement>('button[type=submit]');
  if (btn) btn.disabled = true;
  try {
    const body = new URLSearchParams(new FormData(f) as unknown as Record<string, string>).toString();
    await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    track('generate_lead', { form: f.getAttribute('name') });
    location.href = '/danke/';
  } catch { if (btn) btn.disabled = false; }
}));

// ---------- Engine-Tabs ----------
document.querySelectorAll<HTMLElement>('[data-engine]').forEach((root) => {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role=tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[role=tabpanel]')];
  const sel = (i: number) => {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    panels.forEach((p, j) => (p.hidden = i !== j));
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { sel(i); track('engine_tab', { modul: t.textContent?.trim() }); });
    t.addEventListener('keydown', (e) => {
      const k = e.key; if (k !== 'ArrowDown' && k !== 'ArrowUp' && k !== 'ArrowRight' && k !== 'ArrowLeft') return;
      e.preventDefault(); const n = (i + (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; sel(n); tabs[n].focus();
    });
  });
});

// ---------- Reveal ----------
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
} else document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));

// ---------- Cookie-Banner (Opt-in, Consent Mode v2 vorbereitet) ----------
const cookie = document.querySelector<HTMLElement>('.cookie');
function consent(all: boolean) {
  store.set('consent', all ? 'all' : 'necessary');
  w.dataLayer.push({ event: 'consent_update', analytics_storage: all ? 'granted' : 'denied', ad_storage: all ? 'granted' : 'denied' });
  cookie?.classList.remove('show');
}
if (cookie) {
  if (!store.get('consent')) cookie.classList.add('show');
  cookie.querySelector('[data-accept]')?.addEventListener('click', () => consent(true));
  cookie.querySelector('[data-reject]')?.addEventListener('click', () => consent(false));
}
document.querySelectorAll('[data-cookie-settings]').forEach((b) => b.addEventListener('click', () => cookie?.classList.add('show')));


// ---------- Hero-Video erst laden, wenn sichtbar (spart Daten, v. a. mobil) ----------
document.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]').forEach((v) => {
  const sparen = (navigator as any).connection?.saveData || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sparen || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e], io) => {
    if (!e.isIntersecting) return;
    v.src = (innerWidth < 861 && v.dataset.srcMobil) || v.dataset.src || '';
    v.play().catch(() => {});
    io.disconnect();
  }, { rootMargin: '200px' }).observe(v);
});
