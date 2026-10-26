import { useState } from 'react';
import Icon from '../../components/Icon.jsx';

const BENEFITS = [
  { title: 'Thu nhập cạnh tranh', short: 'Thu nhập', icon: 'wallet', c: '#1668DC', soft: '#EEF4FF', text: 'Lương trả theo năng lực, thỏa thuận khi phỏng vấn.' },
  { title: 'Bảo hiểm & sức khỏe', short: 'Bảo hiểm', icon: 'shield', c: '#0E7490', soft: '#ECF8FB', items: ['Bảo hiểm xã hội, bảo hiểm y tế theo Luật Lao động', 'Gói chăm sóc sức khỏe FPT Premium Care'] },
  { title: 'Đào tạo & phát triển', short: 'Đào tạo', icon: 'book', c: '#4F46E5', soft: '#F1F1FE', text: 'Tài trợ các khóa học và chứng chỉ liên quan đến công việc.' },
  { title: 'Thời gian làm việc', short: 'Thời gian', icon: 'clock', c: '#1668DC', soft: '#EEF4FF', time: ['Thứ 2 – Thứ 6', '8:30 – 17:30'] },
  { title: 'Môi trường làm việc', short: 'Môi trường', icon: 'sparkle', c: '#0F766E', soft: '#ECF9F5', text: 'Sáng tạo, cởi mở và tôn trọng sự khác biệt của mỗi cá nhân.' },
  { title: 'Văn hóa & gia đình', short: 'Văn hóa', icon: 'heart', c: '#15803D', soft: '#EEF9F1', items: ['Hoạt động văn hóa, gắn kết cùng FCI và Tập đoàn FPT', 'Hỗ trợ học tập cho con CBNV là đoàn viên công đoàn FCI'] }
];

function BenefitContent({ b }) {
  if (b.items) return <ul className="dot-list">{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
  if (b.time) {
    return (
      <span className="ben-time">
        <span className="ben-time__days">{b.time[0]}</span>
        <span className="ben-time__hours">{b.time[1]}</span>
      </span>
    );
  }
  return <p>{b.text}</p>;
}

const colorVars = (b) => ({ '--c': b.c, '--soft': b.soft });

export default function Benefits() {
  // Mobile: a tile shows its details while pressed (or hovered / focused).
  const [hold, setHold] = useState(null);
  const release = () => setHold(null);
  const active = hold === null ? null : BENEFITS[hold];

  return (
    <section className="section benefits" id="phuc-loi">
      <span className="deco deco--benefits" aria-hidden="true"></span>
      <div className="container section__inner">
        <div className="sec-head">
          <span className="sec-num" aria-hidden="true">04</span>
          <span className="eyebrow">Phúc lợi</span>
          <h2 className="sec-title">Bạn nhận được gì khi tham gia</h2>
        </div>

        <div className="benefit-grid u-desktop">
          {BENEFITS.map((b) => (
            <div key={b.title} className="benefit lift" style={colorVars(b)}>
              <span className="benefit__icon"><Icon name={b.icon} size={22} /></span>
              <div className="benefit__body">
                <strong className="benefit__title">{b.title}</strong>
                <div className="benefit__text"><BenefitContent b={b} /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="ben-m u-mobile">
          <div className="ben-m__grid" role="group" aria-label="Phúc lợi">
            {BENEFITS.map((b, i) => (
              <button
                key={b.title}
                type="button"
                className="ben-btn"
                style={colorVars(b)}
                aria-label={b.title}
                aria-expanded={hold === i}
                aria-describedby={hold === i ? 'ben-pop' : undefined}
                onPointerDown={() => setHold(i)}
                onPointerUp={release}
                onPointerLeave={release}
                onPointerCancel={release}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHold(i); }}
                onFocus={() => setHold(i)}
                onBlur={release}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className="ben-btn__icon"><Icon name={b.icon} size={20} /></span>
                <span>{b.short}</span>
              </button>
            ))}
            {/* Covers the other row of tiles: below for the top row, above for the bottom row,
                so it never runs into the next section. */}
            {active && (
              <div id="ben-pop" className={'ben-pop' + (hold > 2 ? ' is-up' : '')} role="tooltip" style={colorVars(active)}>
                <span className="ben-pop__icon"><Icon name={active.icon} size={18} /></span>
                <div className="ben-pop__body">
                  <strong>{active.title}</strong>
                  <div className="ben-pop__text"><BenefitContent b={active} /></div>
                </div>
              </div>
            )}
          </div>
          <span className="ben-m__hint">Nhấn giữ vào từng mục để xem chi tiết</span>
        </div>
      </div>
    </section>
  );
}
