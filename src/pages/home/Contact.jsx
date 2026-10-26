import Icon from '../../components/Icon.jsx';
import { CONTACT } from '../../lib/jobs.jsx';

export function ContactFooter() {
  return (
    <footer className="site-footer" id="lien-he">
      <div className="container footer__inner">
        <div className="footer-main">
          <div className="footer-main__cta">
            <span className="eyebrow eyebrow--light">Liên hệ</span>
            <h2 className="sec-title sec-title--light">FPT Smart Cloud đang chào đón bạn, hãy liên hệ với mình nhé!</h2>
            <div className="footer-main__actions">
              <a className="btn btn--white btn--lg" href={'mailto:' + CONTACT.email}><Icon name="mail" size={18} />Gửi CV qua email</a>
            </div>
          </div>
          <ul className="contact-list u-desktop">
            <li>
              <a href={'mailto:' + CONTACT.email}>
                <Icon name="mail" />
                <span className="contact-list__text"><span>Email</span><strong>{CONTACT.email}</strong></span>
              </a>
            </li>
            <li>
              <a href={CONTACT.zalo} target="_blank" rel="noopener noreferrer">
                <Icon name="chat" />
                <span className="contact-list__text"><span>Zalo / Điện thoại</span><strong>{CONTACT.phone}</strong></span>
              </a>
            </li>
            <li>
              <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
                <Icon name="link" /><strong>LinkedIn</strong>
                <Icon name="arrow-up-right" size={16} sw={2.2} className="contact-list__ext" />
              </a>
            </li>
            <li>
              <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">
                <Icon name="people" /><strong>Facebook</strong>
                <Icon name="arrow-up-right" size={16} sw={2.2} className="contact-list__ext" />
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-bottom footer-bottom--ruled">
          <span>Vũ San · Talent Acquisition Business Partner tại FPT Smart Cloud</span>
          <a href="#top"><Icon name="arrow-up" size={16} />Về đầu trang</a>
        </div>
      </div>
    </footer>
  );
}

const GREETING = 'Chào bạn! Cần tư vấn vị trí nào, nhắn mình nhé.';

// Desktop (≥1280px): floating bubble in the corner.
export function Greeting({ shown, onClose }) {
  return (
    <div className={'greet u-lg' + (shown ? ' is-shown' : '')} aria-live="polite">
      <span className="greet__avatar">
        <img src="/img/avatar.jpg" alt="" width="44" height="44" />
        <span className="greet__online" aria-hidden="true"></span>
      </span>
      <span className="greet__text">
        <strong>Vũ San · Talent Acquisition Business Partner</strong>
        <span>{GREETING}</span>
        <a className="greet__cta" href={CONTACT.zalo} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={15} />Nhắn Zalo</a>
      </span>
      <button type="button" className="greet__close" aria-label="Đóng lời chào" onClick={onClose}><Icon name="close" size={18} /></button>
    </div>
  );
}

// Mobile (<720px): sticky action bar with the greeting above it.
export function ActionBar({ shown, onClose }) {
  return (
    <div className="action-bar u-mobile">
      <div className={'greet greet--mobile' + (shown ? ' is-shown' : '')} aria-live="polite">
        <img src="/img/avatar.jpg" alt="" width="40" height="40" />
        <span className="greet__text">
          <strong>Vũ San · Talent Acquisition Business Partner</strong>
          <span>{GREETING}</span>
        </span>
        <button type="button" className="greet__close" aria-label="Đóng lời chào" onClick={onClose}><Icon name="close" size={18} /></button>
      </div>
      <a className="btn btn--soft action-bar__zalo" href={CONTACT.zalo} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={18} />Nhắn Zalo</a>
      <a className="btn btn--primary" href="#lien-he"><Icon name="upload" size={18} />Gửi CV</a>
    </div>
  );
}
