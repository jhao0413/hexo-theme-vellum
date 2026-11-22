(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const icon = (shape) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${shape}</svg>`;
  const closeIcon = icon('<path d="m6 6 12 12M18 6 6 18"/>');

  /* Theme ---------------------------------------------------------------- */
  const prefersDark = matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');
  $('.theme-toggle')?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem('vellum-theme', next); } catch (e) {}
    };
    if (document.startViewTransition && !reducedMotion.matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });

  /* Mobile menu ------------------------------------------------------------ */
  const menuBtn = $('.menu-toggle');
  const links = $('#nav-links');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn?.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  document.addEventListener('click', (e) => {
    if (links?.classList.contains('open') && !e.target.closest('.nav')) setMenu(false);
  });

  /* Header state, reading progress, back to top ----------------------------- */
  const header = $('.site-header');
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
  toTop.addEventListener('click', () => {
    $('.brand', header)?.focus({ preventScroll: true });
    scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  document.body.append(toTop);

  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 8);
    header.style.setProperty('--progress', max > 0 ? Math.min(1, y / max) : 0);
    toTop.classList.toggle('show', y > innerHeight);
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* Home: show the header avatar once the hero avatar scrolls out of view */
  const heroAvatar = $('.hero-avatar');
  if (heroAvatar) {
    new IntersectionObserver(([entry]) => {
      header.classList.toggle('show-avatar', !entry.isIntersecting);
    }, { rootMargin: '-64px 0px 0px 0px' }).observe(heroAvatar);
  }

  /* TOC active heading ------------------------------------------------------ */
  const tocLinks = $$('.post-toc a');
  if (tocLinks.length) {
    const map = new Map();
    tocLinks.forEach((a) => {
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      const h = document.getElementById(id);
      if (h) map.set(h, a);
    });
    const headings = [...map.keys()];
    const update = () => {
      let active = headings[0];
      for (const h of headings) {
        if (h.getBoundingClientRect().top < 120) active = h; else break;
      }
      tocLinks.forEach((a) => a.classList.remove('active'));
      const link = map.get(active);
      if (link) {
        link.classList.add('active');
        const toc = $('.post-toc');
        const r = link.getBoundingClientRect(), t = toc.getBoundingClientRect();
        if (r.top < t.top || r.bottom > t.bottom) link.scrollIntoView({ block: 'nearest' });
      }
    };
    addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  }

  /* Code copy ------------------------------------------------------------- */
  const copyIcon = icon('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 4H6a2 2 0 0 0-2 2v10"/>');
  const copiedIcon = icon('<path d="m5 12 4 4L19 6"/>');
  $$('.prose figure.highlight').forEach((fig) => {
    const code = $('.code pre', fig) || $('pre', fig);
    if (!code) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-button';
    const feedback = (label, svg) => {
      btn.setAttribute('aria-label', label);
      btn.title = label;
      btn.innerHTML = svg;
    };
    const reset = () => feedback('Copy code', copyIcon);
    let timer;
    reset();
    btn.addEventListener('click', async () => {
      clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(code.innerText.replace(/\n$/, ''));
        feedback('Copied', copiedIcon);
      } catch (e) {
        feedback('Could not copy code', closeIcon);
      }
      clearTimeout(timer);
      timer = setTimeout(reset, 1500);
    });
    fig.append(btn);
  });

  /* Image zoom ------------------------------------------------------------ */
  const zoomableImages = $$('.prose img').filter((img) => !img.closest('a, button'));
  if (zoomableImages.length) {
    const zoom = document.createElement('dialog');
    zoom.className = 'zoom-overlay';
    zoom.setAttribute('aria-label', 'Image preview');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'icon-button zoom-close';
    close.setAttribute('aria-label', 'Close image preview');
    close.innerHTML = closeIcon;
    close.autofocus = true;
    close.addEventListener('click', () => zoom.close());
    const preview = document.createElement('img');
    zoom.append(preview, close);
    document.body.append(zoom);
    zoom.addEventListener('click', (e) => { if (e.target === zoom) zoom.close(); });

    let opener;
    zoom.addEventListener('close', () => {
      preview.removeAttribute('src');
      opener?.focus({ preventScroll: true });
    });
    zoomableImages.forEach((img) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'zoom-trigger';
      button.setAttribute('aria-label', img.alt ? `Enlarge image: ${img.alt}` : 'Enlarge image');
      button.setAttribute('aria-haspopup', 'dialog');
      // Keep any picture sources with the image when making it a button.
      const media = img.closest('picture') || img;
      media.before(button);
      button.append(media);
      button.addEventListener('click', () => {
        opener = button;
        preview.src = img.currentSrc || img.src;
        preview.alt = img.alt;
        zoom.showModal();
      });
    });
  }

  /* Search ---------------------------------------------------------------- */
  const dialog = $('.search-dialog');
  if (dialog) {
    const input = $('input', dialog);
    const list = $('.search-results', dialog);
    const status = $('.search-status', dialog);
    let indexRequest;
    let renderVersion = 0;
    let selected = -1;

    const load = () => {
      indexRequest ??= (async () => {
        const res = await fetch(dialog.dataset.src);
        if (!res.ok) throw new Error(`Search index returned ${res.status}`);
        const data = await res.json();
        return data.map((p) => ({
          title: p.title || '',
          url: p.url,
          text: (p.content || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')
        }));
      })().catch((error) => {
        indexRequest = undefined;
        throw error;
      });
      return indexRequest;
    };

    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const mark = (s, q) => esc(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), (m) => `<mark>${m}</mark>`);

    const setStatus = (state) => {
      status.textContent = state ? status.dataset[state] : '';
    };

    const render = async () => {
      const version = ++renderVersion;
      const q = input.value.trim();
      selected = -1;
      input.removeAttribute('aria-activedescendant');
      input.setAttribute('aria-expanded', 'false');
      list.hidden = true;
      list.replaceChildren();
      setStatus(q ? 'loading' : 'hint');
      if (!q) return;

      let data;
      try {
        data = await load();
      } catch (error) {
        if (version === renderVersion && dialog.open) setStatus('error');
        return;
      }
      if (version !== renderVersion || !dialog.open) return;
      const lower = q.toLowerCase();
      const hits = [];
      for (const p of data) {
        const t = p.title.toLowerCase().indexOf(lower);
        const c = p.text.toLowerCase().indexOf(lower);
        if (t < 0 && c < 0) continue;
        const start = Math.max(0, c - 20);
        hits.push({ p, score: t >= 0 ? 0 : 1, snippet: c >= 0 ? p.text.slice(start, start + 90) : p.text.slice(0, 90) });
      }
      hits.sort((a, b) => a.score - b.score);
      if (!hits.length) { setStatus('empty'); return; }
      list.innerHTML = hits.slice(0, 20).map((h, i) =>
        `<li role="presentation"><a id="search-option-${i}" href="${esc(h.p.url)}" role="option" tabindex="-1" aria-selected="false"><strong>${mark(h.p.title, q)}</strong><span>${mark(h.snippet, q)}</span></a></li>`
      ).join('');
      setStatus();
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      select(0);
    };

    const select = (n, scroll = false) => {
      const items = $$('a', list);
      if (!items.length) return;
      selected = (n + items.length) % items.length;
      items.forEach((a, i) => a.setAttribute('aria-selected', String(i === selected)));
      const option = items[selected];
      input.setAttribute('aria-activedescendant', option.id);
      if (scroll) option.scrollIntoView({ block: 'nearest' });
    };

    const open = (animate = false) => {
      if (dialog.open || $('.zoom-overlay[open]')) return;
      dialog.classList.toggle('animate-open', animate);
      dialog.showModal();
      input.select();
      render();
      if (!input.value.trim()) load().catch(() => {});
    };

    $('.search-trigger')?.addEventListener('click', (e) => open(e.detail > 0));
    $('.search-close', dialog).addEventListener('click', () => dialog.close());
    addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
      else if (e.key === '/' && !e.target.closest('input, textarea, [contenteditable]')) { e.preventDefault(); open(); }
    });
    input.addEventListener('input', render);
    input.addEventListener('keydown', (e) => {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Escape') { e.preventDefault(); dialog.close(); }
      else if (e.key === 'ArrowDown' && !list.hidden) { e.preventDefault(); select(selected + 1, true); }
      else if (e.key === 'ArrowUp' && !list.hidden) { e.preventDefault(); select(selected - 1, true); }
      else if (e.key === 'Enter') { const a = $$('a', list)[selected]; if (a) location.href = a.href; }
    });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  }

  /* Comments (Gitalk, loaded when scrolled near) -------------------------- */
  const comments = $('.comments[data-gitalk]');
  if (comments) {
    const loadGitalk = () => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdnjs.cloudflare.com/ajax/libs/gitalk/1.8.0/gitalk.min.css';
      document.head.append(css);
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gitalk/1.8.0/gitalk.min.js';
      s.onload = () => {
        // Same issue key as hexo-theme-redefine, so existing comments stay attached.
        let id = decodeURI(location.pathname);
        if (id.length > 50) id = id.substring(0, 47) + '...';
        new Gitalk({ ...JSON.parse(comments.dataset.gitalk), id }).render('gitalk-container');
      };
      document.body.append(s);
    };
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); loadGitalk(); }
    }, { rootMargin: '400px' });
    io.observe(comments);
  }
})();
