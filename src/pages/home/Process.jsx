import Icon from '../../components/Icon.jsx';
import { useLang } from '../../lib/lang.jsx';

// `short` is the timeline / mobile copy, `text` the desktop card copy. Each text is [vi, en].
const STEPS = [
  { title: ['Nộp CV', 'Send your CV'], mobile: ['Nộp CV', 'Send your CV'], icon: 'file', c: '#4F46E5', from: '#D9DBFA', to: '#F1F1FE', short: ['Gửi CV qua form, email hoặc Zalo.', 'Send it via the form, email or Zalo, whichever is easiest.'], text: ['Gửi CV qua form, email hoặc Zalo.', 'Send it via the form, email or Zalo, whichever is easiest.'] },
  { title: ['Sàng lọc', 'CV review'], mobile: ['Sàng lọc', 'CV review'], icon: 'search-lg', c: '#1668DC', from: '#D3E3FC', to: '#EEF4FF', short: ['Đánh giá CV theo yêu cầu của vị trí.', 'We review your CV against the role’s requirements.'], text: ['Đánh giá CV theo yêu cầu của vị trí.', 'We review your CV against the role’s requirements.'] },
  { title: ['Phỏng vấn', 'Interview'], mobile: ['Phỏng vấn', 'Interview'], icon: 'code-sm', c: '#0E7490', from: '#CDEDF5', to: '#ECF8FB', short: ['Phỏng vấn chuyên môn với quản lý trực tiếp.', 'A technical chat with your future manager.'], text: ['Phỏng vấn chuyên môn với quản lý trực tiếp.', 'A technical chat with your future manager.'], varies: true },
  { title: ['Thông báo kết quả', 'Results'], mobile: ['Kết quả', 'Results'], icon: 'mail', c: '#0F766E', from: '#CDEFE7', to: '#ECF9F5', short: ['Gửi qua email hoặc điện thoại.', 'Shared by email or phone.'], text: ['Kết quả được gửi qua email hoặc điện thoại.', 'We’ll share the results by email or phone.'] },
  { title: ['Gia nhập', 'Welcome aboard'], mobile: ['Gia nhập', 'Welcome aboard'], icon: 'check-circle', c: '#15803D', from: '#B9E8C8', to: '#E2F6E8', short: ['Nhận offer, chốt ngày bắt đầu.', 'Get your offer and pick a start date.'], text: ['Nhận offer, chốt ngày bắt đầu và nhận việc.', 'Get your offer, pick a start date and join the team.'], final: true }
];

export default function Process() {
  const { L } = useLang();
  return (
    <section className="process" id="quy-trinh">
      <div className="process__wide u-desktop">
        <span className="deco deco--process" aria-hidden="true"></span>
        <div className="container process__inner">
          <div className="process__head">
            <div className="sec-head">
              <span className="sec-num sec-num--light" aria-hidden="true">03</span>
              <h2 className="sec-title sec-title--light">{L('Quy trình tuyển dụng', 'How we hire')}</h2>
            </div>
            <a className="btn btn--white process__cta" href="#lien-he">{L('Nộp CV ngay', 'Apply now')}<Icon name="arrow-right" size={18} sw={2.2} /></a>
          </div>

          <div className="note" role="note">
            <span className="note__icon"><Icon name="info" size={28} /></span>
            <div className="note__text">
              <strong>{L('Lưu ý: Quy trình có thể thay đổi theo từng vị trí', 'Good to know: steps can vary by role')}</strong>
              <span>{L('Số vòng và hình thức phỏng vấn khác nhau tùy vị trí: có thể có bài test hoặc 2 vòng phỏng vấn.', 'Interview rounds and formats differ by role. Some include a short test or a second interview.')}</span>
            </div>
          </div>

          <div className="timeline u-below-lg">
            <span className="timeline__line" aria-hidden="true"></span>
            <ol className="timeline__steps">
              {STEPS.map((s, i) => (
                <li key={s.icon} className={s.final ? 'is-final' : undefined} style={{ '--c': s.c }}>
                  <span className="timeline__num">{i + 1}</span>
                  <strong>{L(...s.title)}</strong>
                  <span>{L(...s.short)}</span>
                  {s.varies && <span className="timeline__chip">{L('Test / 2 vòng', 'Test or 2nd round')}</span>}
                </li>
              ))}
            </ol>
          </div>

          <ol className="steps u-lg">
            {STEPS.map((s, i) => (
              <li key={s.icon} className={'step lift' + (s.final ? ' step--final' : '')} style={{ '--c': s.c, '--from': s.from, '--to': s.to }}>
                <div className="step__top">
                  <span className="step__num">{i + 1}</span>
                  <span className="step__icon"><Icon name={s.icon} size={22} /></span>
                </div>
                <div className="step__text">
                  <strong>{L(...s.title)}</strong>
                  <span>{L(...s.text)}</span>
                  {s.varies && <span className="step__chip"><strong>{L('Tùy vị trí:', 'By role:')}</strong>{L('test / 2 vòng', 'test or 2 rounds')}</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="process-m u-mobile">
        <div className="process-m__head">
          <span className="sec-num sec-num--light" aria-hidden="true">03</span>
          <h2>{L('Quy trình tuyển dụng', 'How we hire')}</h2>
          <span>{L('Số vòng có thể thay đổi tùy vị trí', 'Steps may vary by role')}</span>
        </div>
        <div className="process-m__steps">
          <span className="process-m__line" aria-hidden="true"></span>
          <ol>
            {STEPS.map((s, i) => (
              <li key={s.icon} className={s.final ? 'is-final' : undefined}><span>{i + 1}</span>{L(...s.mobile)}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
