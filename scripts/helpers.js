/* global hexo */
'use strict';

const stripHTML = (html) => html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');

const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿ｦ-ﾟ]/g;

function countWords(html) {
  const text = stripHTML(html || '');
  const cjk = (text.match(CJK) || []).length;
  const latin = (text.replace(CJK, ' ').match(/[A-Za-z0-9_'-]+/g) || []).length;
  return cjk + latin;
}

hexo.extend.helper.register('jiu_wordcount', function (content) {
  return countWords(content);
});

// ~400 CJK characters or ~200 English words per minute, blended.
hexo.extend.helper.register('jiu_readtime', function (content) {
  return Math.max(1, Math.round(countWords(content) / 350));
});

hexo.extend.helper.register('jiu_total_words', function () {
  return this.site.posts.reduce((sum, post) => sum + countWords(post.content), 0);
});

hexo.extend.helper.register('jiu_format_k', function (n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);
});

hexo.extend.helper.register('jiu_pad', function (n) {
  return String(n).padStart(2, '0');
});

hexo.extend.helper.register('jiu_essays', function () {
  const essays = (this.site.data && this.site.data.essays) || [];
  return essays
    .filter((e) => e && e.content)
    .map((e) => ({ content: String(e.content), date: e.date ? new Date(String(e.date).replace(/-(\d)(?!\d)/g, '-0$1')) : null }))
    .sort((a, b) => (b.date || 0) - (a.date || 0));
});

hexo.extend.helper.register('jiu_icon', function (name) {
  const paths = {
    github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    twitter: '<path d="M4 4l16 16M20 4 4 20"/>',
    rss: '<path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"/><circle cx="6" cy="18" r="1"/>',
    link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.link}</svg>`;
});

// Lazy-load images and make wide tables scroll inside the article.
hexo.extend.filter.register('after_post_render', function (data) {
  if (hexo.config.theme !== 'jiu') return data;
  data.content = data.content
    .replace(/<img(?![^>]*\sloading=)/g, '<img loading="lazy" decoding="async"')
    // Code blocks render as <table><tr><td class="gutter">; leave those alone.
    .replace(/<table>(?!<tr><td class="gutter">)([\s\S]*?)<\/table>/g, '<div class="table-wrap"><table>$1</table></div>');
  return data;
});
