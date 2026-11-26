'use strict';
window.I18n = (() => {
  const language = 'en';
  function t(key, values = {}) {
    let text = window.EvavindLocales.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
  }
  function translate(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    for (const attr of ['aria-label', 'title', 'placeholder']) {
      root.querySelectorAll(`[data-i18n-${attr}]`).forEach(el => {
        el.setAttribute(attr, t(el.getAttribute(`data-i18n-${attr}`)));
      });
    }
  }
  const text = (key, tag = 'span', cls = '') => `<${tag} class="${cls}" data-i18n="${key}">${t(key)}</${tag}>`;
  return { t, text, translate, language };
})();
