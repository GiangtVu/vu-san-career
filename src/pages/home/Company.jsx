import { useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { useInView, useTween } from '../../lib/hooks.js';
import { useLang } from '../../lib/lang.jsx';

const PRODUCTS = [
  { icon: 'cloud', name: 'FPT Cloud', url: 'https://fptcloud.com/', desc: ['Nền tảng điện toán đám mây quy mô lớn tại Việt Nam, xây dựng trên OpenStack.', 'A large-scale cloud platform built on OpenStack, right here in Vietnam.'] },
  { icon: 'chip', name: 'FPT AI Factory', url: 'https://factory.fpt.ai/', desc: ['Hạ tầng GPU NVIDIA cùng AI Studio, AI Inference và AI Agents để huấn luyện, triển khai AI.', 'NVIDIA GPU infrastructure plus AI Studio, AI Inference and AI Agents for training and deploying AI.'] },
  { icon: 'sparkles', name: 'FPT.AI', url: 'https://fpt.ai/vi', desc: ['Nền tảng giải pháp AI cho doanh nghiệp: FPT AI Agents, AI Chat, AI Engage, AI Read, AI eKYC.', 'Our enterprise AI suite: FPT AI Agents, AI Chat, AI Engage, AI Read and AI eKYC.'] }
];

function Tags({ className }) {
  const { L } = useLang();
  return (
    <div className={'tag-row ' + className}>
      <span className="outline-tag"><Icon name="pin" size={14} />{L('Hà Nội · TP. Hồ Chí Minh · Nhật Bản', 'Hanoi · Ho Chi Minh City · Japan')}</span>
      <a className="outline-tag" href="https://fptsmartcloud.com/" target="_blank" rel="noopener noreferrer">
        <Icon name="home" size={14} />FPT Smart Cloud<Icon name="arrow-up-right" size={14} />
      </a>
    </div>
  );
}

export default function Company() {
  const { L, locale } = useLang();
  const ref = useRef(null);
  const seen = useInView(ref, 0.3);
  const p = useTween(seen, 1300);

  return (
    <section className="company" id="cong-ty" ref={ref}>
      <svg className="company__pattern" aria-hidden="true" width="220" height="160">
        <defs>
          <pattern id="tc-co" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M22 4L40 22L22 40L4 22Z" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M22 15L29 22L22 29L15 22Z" fill="#FFFFFF" />
          </pattern>
        </defs>
        <rect width="220" height="160" fill="url(#tc-co)" />
      </svg>
      <div className="container company__inner">
        <div className="company__about">
          <span className="sec-num sec-num--light" aria-hidden="true">01</span>
          <span className="eyebrow eyebrow--light">{L('Về công ty', 'About us')}</span>
          <h2 className="company__title">FPT Smart Cloud</h2>
          <p className="company__lead">{L('Thành viên Tập đoàn FPT, cung cấp giải pháp Trí tuệ nhân tạo (AI) và Điện toán đám mây (Cloud) cho doanh nghiệp tại Việt Nam và quốc tế.', 'Part of FPT Corporation, we build AI and cloud solutions for businesses in Vietnam and around the world.')}</p>
          <p className="company__mission u-desktop">{L('Sứ mệnh: xây dựng nền tảng ứng dụng AI và hệ sinh thái dịch vụ đám mây đẳng cấp thế giới.', 'Our mission: to build a world-class AI platform and cloud ecosystem.')}</p>
          <div className="stat-card lift">
            <div className="stat">
              <span className="stat__icon"><Icon name="team" size={22} /></span>
              <span className="stat__text">
                <strong className="stat__num">{Math.round(3000 * p).toLocaleString(locale)}+</strong>
                <span className="stat__label">{L('đối tác & khách hàng', 'partners & clients')}</span>
              </span>
            </div>
            <span className="stat-card__divider" aria-hidden="true"></span>
            <div className="stat">
              <span className="stat__icon"><Icon name="layers" size={22} /></span>
              <span className="stat__text">
                <strong className="stat__num">{Math.round(100 * p)}+</strong>
                <span className="stat__label">{L('dịch vụ & giải pháp', 'services & solutions')}</span>
              </span>
            </div>
          </div>
          <Tags className="u-not-tabp" />
        </div>

        <div className="company__products">
          <span className="eyebrow eyebrow--light">{L('Sản phẩm chính', 'What we build')}</span>
          <div className="products">
            {PRODUCTS.map((pr) => (
              <a key={pr.name} className="product lift" href={pr.url} target="_blank" rel="noopener noreferrer">
                <span className="product__icon"><Icon name={pr.icon} size={22} /></span>
                <span className="product__text">
                  <strong>{pr.name}</strong>
                  <span className="product__desc u-desktop">{L(...pr.desc)}</span>
                </span>
              </a>
            ))}
          </div>
          <Tags className="u-tabp" />
        </div>
      </div>
    </section>
  );
}
