import Icon from './Icon.jsx';
import { useLang } from '../lib/lang.jsx';

// VI / EN segmented switch for the full-width headers; the thumb slides to the current language.
export function LangSwitch({ className = '' }) {
  const { lang, setLang } = useLang();
  return (
    <div className={'lang-seg ' + className} data-lang={lang} role="group" aria-label="Ngôn ngữ / Language">
      <span className="lang-seg__thumb" aria-hidden="true"></span>
      <button type="button" className="lang-seg__btn" aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button>
      <button type="button" className="lang-seg__btn" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
    </div>
  );
}

// Compact headers: one button that switches to the other language, labelled with it.
export function LangButton({ className = '' }) {
  const { lang, setLang, L } = useLang();
  const other = lang === 'en' ? 'vi' : 'en';
  return (
    <button type="button" className={'lang-btn ' + className} data-lang={lang} aria-label={L('Switch to English', 'Chuyển sang tiếng Việt')} onClick={() => setLang(other)}>
      <Icon name="globe" size={16} />{other.toUpperCase()}
    </button>
  );
}

// Text that keeps the width of its longer translation, so a button doesn't resize on a switch.
export function SameWidth({ vi, en }) {
  const { lang } = useLang();
  return (
    <span className="same-width">
      <span>{lang === 'en' ? en : vi}</span>
      <span aria-hidden="true">{lang === 'en' ? vi : en}</span>
    </span>
  );
}
