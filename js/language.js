/* Static EN/JA pages work without JS. This localizes dynamic interface text. */
(() => {
  const japanese = document.documentElement.lang === 'ja';
  const dictionary = japanese ? window.TWO_D_ONE_JA || {} : {};
  const t = text => dictionary[text] || text;
  function translate(root) {
    if (!japanese || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest('script,style,textarea')) continue;
      const key = node.textContent.trim();
      if (dictionary[key]) node.textContent = dictionary[key];
    }
    root.querySelectorAll('[aria-label],[placeholder],[title],[alt]').forEach(el => {
      for (const attr of ['aria-label','placeholder','title','alt']) {
        if (el.hasAttribute(attr)) el.setAttribute(attr,t(el.getAttribute(attr)));
      }
    });
  }
  window.SiteLanguage = {t, translate, japanese};
  if (japanese) {
    document.addEventListener('invalid', event => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
      field.setCustomValidity('');
      const message = field.validity.valueMissing ? 'この項目を入力してください。' : field.validity.typeMismatch ? 'メールアドレスをご確認ください。' : field.validity.rangeUnderflow || field.validity.rangeOverflow || field.validity.badInput ? '有効な数値を入力してください。' : '';
      field.setCustomValidity(message);
    }, true);
    document.addEventListener('input', event => event.target.setCustomValidity?.(''));
  }
})();
