import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { useLang } from '../../lib/lang.jsx';

// Each text is [vi, en].
const BENEFITS = [
  { title: ['Thu nhập cạnh tranh', 'Competitive pay'], short: ['Thu nhập', 'Pay'], icon: 'wallet', c: '#1668DC', soft: '#EEF4FF', text: ['Lương trả theo năng lực, thỏa thuận khi phỏng vấn.', 'Pay that reflects your skills, agreed during the interview.'] },
  { title: ['Bảo hiểm & sức khỏe', 'Health & insurance'], short: ['Bảo hiểm', 'Insurance'], icon: 'shield', c: '#0E7490', soft: '#ECF8FB', items: [['Bảo hiểm xã hội, bảo hiểm y tế theo Luật Lao động', 'Social and health insurance as required by Vietnamese labor law'], ['Gói chăm sóc sức khỏe FPT Premium Care', 'FPT Premium Care health package']] },
  { title: ['Đào tạo & phát triển', 'Learning & growth'], short: ['Đào tạo', 'Learning'], icon: 'book', c: '#4F46E5', soft: '#F1F1FE', text: ['Tài trợ các khóa học và chứng chỉ liên quan đến công việc.', 'Courses and certifications related to your work, sponsored by us.'] },
  { title: ['Thời gian làm việc', 'Working hours'], short: ['Thời gian', 'Hours'], icon: 'clock', c: '#1668DC', soft: '#EEF4FF', time: [['Thứ 2 – Thứ 6', 'Monday – Friday'], '8:30 – 17:30'] },
  { title: ['Môi trường làm việc', 'Work environment'], short: ['Môi trường', 'Environment'], icon: 'sparkle', c: '#0F766E', soft: '#ECF9F5', text: ['Sáng tạo, cởi mở và tôn trọng sự khác biệt của mỗi cá nhân.', 'Creative and open, where everyone’s differences are respected.'] },
  { title: ['Văn hóa & gia đình', 'Culture & family'], short: ['Văn hóa', 'Culture'], icon: 'heart', c: '#15803D', soft: '#EEF9F1', items: [['Hoạt động văn hóa, gắn kết cùng FCI và Tập đoàn FPT', 'Team and culture activities with FCI and FPT Corporation'], ['Hỗ trợ học tập cho con CBNV là đoàn viên công đoàn FCI', 'Study support for the children of FCI union members']] }
];

function BenefitContent({ b }) {
  const { L } = useLang();
  if (b.items) return <ul className="dot-list">{b.items.map((t) => <li key={t[0]}>{L(...t)}</li>)}</ul>;
  if (b.time) {
    return (
      <span className="ben-time">
        <span className="ben-time__days">{L(...b.time[0])}</span>
        <span className="ben-time__hours">{b.time[1]}</span>
      </span>
    );
  }
  return <p>{L(...b.text)}</p>;
}

const colorVars = (b) => ({ '--c': b.c, '--soft': b.soft });

export default function Benefits() {
  const { L } = useLang();
  // Mobile: a tile shows its details while pressed (or hovered / focused).
  const [hold, setHold] = useState(null);
  // The last tile held: its details stay in the popup while it fades out after release. The
  // popup is always in the page (hidden), so even the first press animates it in.
  const [last, setLast] = useState(0);
  const press = (i) => { setHold(i); setLast(i); };
  const release = () => setHold(null);
  const active = BENEFITS[last];

  return (
    <section className="section benefits" id="phuc-loi">
      <span className="deco deco--benefits" aria-hidden="true"></span>
      <div className="container section__inner">
        <div className="sec-head">
          <span className="sec-num" aria-hidden="true">04</span>
          <span className="eyebrow">{L('Phúc lợi', 'Benefits')}</span>
          <h2 className="sec-title">{L('Bạn nhận được gì khi tham gia', 'What you’ll get with us')}</h2>
        </div>

        <div className="benefit-grid u-desktop">
          {BENEFITS.map((b) => (
            <div key={b.icon} className="benefit lift" style={colorVars(b)}>
              <span className="benefit__icon"><Icon name={b.icon} size={22} /></span>
              <div className="benefit__body">
                <strong className="benefit__title">{L(...b.title)}</strong>
                <div className="benefit__text"><BenefitContent b={b} /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="ben-m u-mobile">
          <div className="ben-m__grid" role="group" aria-label={L('Phúc lợi', 'Benefits')}>
            {BENEFITS.map((b, i) => (
              <button
                key={b.icon}
                type="button"
                className="ben-btn"
                style={colorVars(b)}
                aria-label={L(...b.title)}
                aria-expanded={hold === i}
                aria-describedby={hold === i ? 'ben-pop' : undefined}
                onPointerDown={() => press(i)}
                onPointerUp={release}
                onPointerLeave={release}
                onPointerCancel={release}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') press(i); }}
                onFocus={() => press(i)}
                onBlur={release}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className="ben-btn__icon"><Icon name={b.icon} size={20} /></span>
                <span>{L(...b.short)}</span>
              </button>
            ))}
            {/* Covers the other row of tiles: below for the top row, above for the bottom row,
                so it never runs into the next section. */}
            <div id="ben-pop" className={'ben-pop' + (last > 2 ? ' is-up' : '') + (hold !== null ? ' is-shown' : '')} role="tooltip" aria-hidden={hold === null} style={colorVars(active)}>
              <span className="ben-pop__icon"><Icon name={active.icon} size={18} /></span>
              <div className="ben-pop__body">
                <strong>{L(...active.title)}</strong>
                <div className="ben-pop__text"><BenefitContent b={active} /></div>
              </div>
            </div>
          </div>
          <span className="ben-m__hint">{L('Nhấn giữ vào từng mục để xem chi tiết', 'Tap and hold any item for details')}</span>
        </div>
      </div>
    </section>
  );
}
