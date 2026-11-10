import { fmt, onLang, t } from './i18n';

/**
 * Bağış ayarları. Adresler boş bırakılırsa o satır gösterilmez; hiçbiri dolu değilse bağış
 * alanı ve açılır pencere hiç çıkmaz.
 *
 *  - `address`: cüzdan adresi (aynen kopyalanır).
 *  - `network`: adresin ağı. Özellikle USDT için ZORUNLU bilgi (TRC20 / ERC20 / BEP20 ...);
 *    yanlış ağdan gönderilen para kaybolur.
 *  - `raisedUsd`: şimdiye kadar gelen toplam (dolar). Şimdilik elle güncellenir; ileride
 *    cüzdanlar izlenip otomatik doldurulacak.
 */
export const DONATE = {
  goalUsd: 100_000,
  raisedUsd: 0,
  wallets: [
    { id: 'btc', label: 'Bitcoin', network: 'BTC', address: '' },
    { id: 'eth', label: 'Ethereum', network: 'ERC20', address: '' },
    { id: 'usdt', label: 'USDT', network: '', address: '' },
  ],
};

const PLAYED = 'slot-dayagi-played';
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const wallets = () => DONATE.wallets.filter((w) => w.address.trim());
export const donateEnabled = () => wallets().length > 0;

export function hasPlayed(): boolean {
  try {
    return localStorage.getItem(PLAYED) === '1';
  } catch {
    return false;
  }
}

function markPlayed() {
  try {
    localStorage.setItem(PLAYED, '1');
  } catch {
    /* depolama kapalı olabilir */
  }
}

/** Adres satırları + ilerleme çubuğu. Hem ana sayfadaki alanda hem açılır pencerede kullanılır. */
function body(): string {
  const pct = Math.max(0, Math.min(100, (DONATE.raisedUsd / DONATE.goalUsd) * 100));
  const rows = wallets().map((w) =>
    `<li><span class="dn-coin">${w.label}${w.network ? `<small>${w.network}</small>` : ''}</span>` +
    `<code class="dn-addr" tabindex="0">${w.address}</code>` +
    `<button class="dn-copy" data-addr="${w.address}">${t('dn.copy')}</button></li>`).join('');
  return `<ul class="dn-list">${rows}</ul>` +
    `<div class="dn-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${DONATE.goalUsd}" aria-valuenow="${DONATE.raisedUsd}"><i style="width:${pct}%"></i></div>` +
    `<p class="dn-meta"><span>${t('dn.raised', { a: fmt(DONATE.raisedUsd) })}</span><span>${t('dn.goal', { a: fmt(DONATE.goalUsd) })}</span></p>`;
}

function wire(root: HTMLElement) {
  for (const b of root.querySelectorAll<HTMLButtonElement>('.dn-copy')) {
    b.onclick = () => {
      const done = () => {
        b.textContent = t('dn.copied');
        window.setTimeout(() => (b.textContent = t('dn.copy')), 1600);
      };
      // Pano erişimi reddedilirse adres seçilir; elle kopyalanabilir.
      const select = () => {
        const code = b.previousElementSibling!;
        const r = document.createRange();
        r.selectNodeContents(code);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(b.dataset.addr!).then(done, select);
      else select();
    };
  }
}

/** Ana sayfanın en üstündeki alan: yalnızca en az bir kez oynamış olanlara görünür. */
export function renderBanner() {
  const el = $('lp-donate');
  el.hidden = !(donateEnabled() && hasPlayed());
  if (el.hidden) return;
  el.innerHTML = `<p class="dn-kicker">${t('dn.kicker')}</p><h2>${t('dn.banner')}</h2>${body()}`;
  wire(el);
}

/** Her bosstan sonra çıkan pencere. */
export function showPopup() {
  if (!donateEnabled()) return;
  const el = $('donate');
  $('donate-body').innerHTML = `<h2>${t('dn.ask')}</h2><p class="dn-sub">${t('dn.sub')}</p>${body()}`;
  $('donate-close').textContent = t('dn.close');
  wire(el);
  el.hidden = false;
  $('donate-close').focus();
}

export function hidePopup() {
  $('donate').hidden = true;
}

/** Bir tur bitti: oynadı olarak işaretle, kısa bir süre sonra pencereyi göster. */
export function roundEnded() {
  markPlayed();
  window.setTimeout(showPopup, 1600);
}

export function initDonate() {
  $('donate-close').onclick = hidePopup;
  $('donate').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hidePopup();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hidePopup();
  });
  onLang(() => {
    renderBanner();
    if (!$('donate').hidden) showPopup();
  });
}
