import Icon from '../../components/Icon.jsx';

// `short` is the timeline / mobile copy, `text` the desktop card copy.
const STEPS = [
  { title: 'Nộp CV', mobile: 'Nộp CV', icon: 'file', c: '#4F46E5', from: '#D9DBFA', to: '#F1F1FE', short: 'Gửi CV qua form, email hoặc Zalo.', text: 'Gửi CV qua form, email hoặc Zalo.' },
  { title: 'Sàng lọc', mobile: 'Sàng lọc', icon: 'search-lg', c: '#1668DC', from: '#D3E3FC', to: '#EEF4FF', short: 'Đánh giá CV theo yêu cầu của vị trí.', text: 'Đánh giá CV theo yêu cầu của vị trí.' },
  { title: 'Phỏng vấn', mobile: 'Phỏng vấn', icon: 'code-sm', c: '#0E7490', from: '#CDEDF5', to: '#ECF8FB', short: 'Phỏng vấn chuyên môn với quản lý trực tiếp.', text: 'Phỏng vấn chuyên môn với quản lý trực tiếp.', varies: true },
  { title: 'Thông báo kết quả', mobile: 'Kết quả', icon: 'mail', c: '#0F766E', from: '#CDEFE7', to: '#ECF9F5', short: 'Gửi qua email hoặc điện thoại.', text: 'Kết quả được gửi qua email hoặc điện thoại.' },
  { title: 'Gia nhập', mobile: 'Gia nhập', icon: 'check-circle', c: '#15803D', from: '#B9E8C8', to: '#E2F6E8', short: 'Nhận offer, chốt ngày bắt đầu.', text: 'Nhận offer, chốt ngày bắt đầu và nhận việc.', final: true }
];

export default function Process() {
  return (
    <section className="process" id="quy-trinh">
      <div className="process__wide u-desktop">
        <span className="deco deco--process" aria-hidden="true"></span>
        <div className="container process__inner">
          <div className="process__head">
            <div className="sec-head">
              <span className="sec-num sec-num--light" aria-hidden="true">03</span>
              <h2 className="sec-title sec-title--light">Quy trình tuyển dụng</h2>
            </div>
            <a className="btn btn--white process__cta" href="#lien-he">Nộp CV ngay<Icon name="arrow-right" size={18} sw={2.2} /></a>
          </div>

          <div className="note" role="note">
            <span className="note__icon"><Icon name="info" size={28} /></span>
            <div className="note__text">
              <strong>Lưu ý: Quy trình có thể thay đổi theo từng vị trí</strong>
              <span>Số vòng và hình thức phỏng vấn khác nhau tùy vị trí: có thể có bài test hoặc 2 vòng phỏng vấn.</span>
            </div>
          </div>

          <div className="timeline u-below-lg">
            <span className="timeline__line" aria-hidden="true"></span>
            <ol className="timeline__steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className={s.final ? 'is-final' : undefined} style={{ '--c': s.c }}>
                  <span className="timeline__num">{i + 1}</span>
                  <strong>{s.title}</strong>
                  <span>{s.short}</span>
                  {s.varies && <span className="timeline__chip">Test / 2 vòng</span>}
                </li>
              ))}
            </ol>
          </div>

          <ol className="steps u-lg">
            {STEPS.map((s, i) => (
              <li key={s.title} className={'step lift' + (s.final ? ' step--final' : '')} style={{ '--c': s.c, '--from': s.from, '--to': s.to }}>
                <div className="step__top">
                  <span className="step__num">{i + 1}</span>
                  <span className="step__icon"><Icon name={s.icon} size={22} /></span>
                </div>
                <div className="step__text">
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                  {s.varies && <span className="step__chip"><strong>Tùy vị trí:</strong>test / 2 vòng</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="process-m u-mobile">
        <div className="process-m__head">
          <span className="sec-num sec-num--light" aria-hidden="true">03</span>
          <h2>Quy trình tuyển dụng</h2>
          <span>Số vòng có thể thay đổi tùy vị trí</span>
        </div>
        <div className="process-m__steps">
          <span className="process-m__line" aria-hidden="true"></span>
          <ol>
            {STEPS.map((s, i) => (
              <li key={s.title} className={s.final ? 'is-final' : undefined}><span>{i + 1}</span>{s.mobile}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
