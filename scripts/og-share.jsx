// Static share artwork, rendered with the site's own logo, icons and design tokens.
// Reference: https://claude.ai/code/artifact/ad84c5f8-066a-4367-b971-9c234860b3ed
// The artifact's content was unavailable; layout follows the supplied screenshot.
import React from 'react';
import Logo from '../src/components/Logo.jsx';
import Icon from '../src/components/Icon.jsx';
import { LangProvider } from '../src/lib/lang.jsx';
import { CONTACT } from '../src/lib/jobs.jsx';

export default function OgShare() {
  return (
    <LangProvider>
      <main className="og-share">
        <div className="brand">
          <Logo size={40} />
          <strong className="brand__name">Vũ San <span>Careers</span></strong>
        </div>
        <section className="og-copy">
          <div className="pill-badge"><span className="diamond" />Đang tuyển · FPT Smart Cloud</div>
          <h1>Ứng tuyển cùng<br /><span className="accent">người đồng hành</span></h1>
          <p className="og-seeking">Chúng mình đang tìm</p>
          <div className="og-roles">
            {['Fullstack Developer', 'AI Engineer', 'Data Engineer'].map((role) => <span className="role-pill" key={role}>{role}</span>)}
          </div>
          <p className="og-lead">FPT Smart Cloud đang tuyển Fullstack, AI &amp; Data, Business Analyst, Product Owner, Project Manager và DevOps. Gửi CV trực tiếp cho mình để cùng trao đổi về vị trí phù hợp.</p>
        </section>
        <section className="og-media">
          <div className="hero__pattern" aria-hidden="true">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="og-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M24 4L44 24L24 44L4 24Z" fill="none" stroke="#1668DC" strokeWidth="1.5" opacity="0.4" />
                  <path d="M24 16L32 24L24 32L16 24Z" fill="#1668DC" opacity="0.85" />
                  <path d="M24 21.5L26.5 24L24 26.5L21.5 24Z" fill="#E7F0FE" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#og-pattern)" />
            </svg>
          </div>
          <figure className="hero__photo"><img src="/img/hero-portrait.jpg" alt="Vũ San" /></figure>
          <div className="recruiter-card">
            <div className="og-card-heading"><strong>Vũ San</strong><span className="status-pill"><span className="status-pill__dot" />Đang nhận CV</span></div>
            <div className="og-card-role">Talent Acquisition Business Partner ·<br />FPT Smart Cloud</div>
            <p>Chào bạn! Có câu hỏi về vị trí nào, cứ nhắn mình nhé.</p>
            <div className="og-contact"><span className="icon-btn"><Icon name="chat" size={18} /></span><span>Zalo {CONTACT.phone}</span></div>
          </div>
        </section>
      </main>
    </LangProvider>
  );
}
