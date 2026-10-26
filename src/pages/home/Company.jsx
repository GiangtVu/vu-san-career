import { useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import { useInView, useTween } from '../../lib/hooks.js';

const PRODUCTS = [
  { icon: 'cloud', name: 'FPT Cloud', desc: 'Nền tảng điện toán đám mây quy mô lớn tại Việt Nam, xây dựng trên OpenStack.' },
  { icon: 'chip', name: 'FPT AI Factory', desc: 'Hạ tầng GPU NVIDIA cùng AI Studio, AI Inference và AI Agents để huấn luyện, triển khai AI.' },
  { icon: 'sparkles', name: 'FPT.AI', desc: 'Nền tảng giải pháp AI cho doanh nghiệp: FPT AI Agents, AI Chat, AI Engage, AI Read, AI eKYC.' }
];

function Tags({ className }) {
  return (
    <div className={'tag-row ' + className}>
      <span className="outline-tag"><Icon name="pin" size={14} />Hà Nội · TP. Hồ Chí Minh · Nhật Bản</span>
      <a className="outline-tag" href="https://fptcloud.com/" target="_blank" rel="noopener noreferrer">
        <Icon name="home" size={14} />FPT Smart Cloud<Icon name="arrow-up-right" size={14} />
      </a>
    </div>
  );
}

export default function Company() {
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
          <span className="eyebrow eyebrow--light">Về công ty</span>
          <h2 className="company__title">FPT Smart Cloud</h2>
          <p className="company__lead">Thành viên Tập đoàn FPT, cung cấp giải pháp Trí tuệ nhân tạo (AI) và Điện toán đám mây (Cloud) cho doanh nghiệp tại Việt Nam và quốc tế.</p>
          <p className="company__mission u-desktop">Sứ mệnh: xây dựng nền tảng ứng dụng AI và hệ sinh thái dịch vụ đám mây đẳng cấp thế giới.</p>
          <div className="stat-card lift">
            <div className="stat">
              <span className="stat__icon"><Icon name="team" size={22} /></span>
              <span className="stat__text">
                <strong className="stat__num">{Math.round(3000 * p).toLocaleString('vi-VN')}+</strong>
                <span className="stat__label">đối tác &amp; khách hàng</span>
              </span>
            </div>
            <span className="stat-card__divider" aria-hidden="true"></span>
            <div className="stat">
              <span className="stat__icon"><Icon name="layers" size={22} /></span>
              <span className="stat__text">
                <strong className="stat__num">{Math.round(100 * p)}+</strong>
                <span className="stat__label">dịch vụ &amp; giải pháp</span>
              </span>
            </div>
          </div>
          <Tags className="u-not-tabp" />
        </div>

        <div className="company__products">
          <span className="eyebrow eyebrow--light">Sản phẩm chính</span>
          <div className="products">
            {PRODUCTS.map((pr) => (
              <div key={pr.name} className="product lift">
                <span className="product__icon"><Icon name={pr.icon} size={22} /></span>
                <span className="product__text">
                  <strong>{pr.name}</strong>
                  <span className="product__desc u-desktop">{pr.desc}</span>
                </span>
              </div>
            ))}
          </div>
          <Tags className="u-tabp" />
        </div>
      </div>
    </section>
  );
}
