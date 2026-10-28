import { useId } from 'react';
import { useLang } from '../lib/lang.jsx';

export default function Logo({ size = 36 }) {
  const { L } = useLang();
  const gid = 'vs-g' + useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={L('Logo Vũ San Careers', 'Vũ San Careers logo')}>
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#0F4FA8" />
          <stop offset="1" stopColor="#3B8BF0" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14.6" fill="#FFFFFF" stroke="#1668DC" strokeWidth="1.8" />
      <path d="M16 23.5V17" fill="none" stroke="#0F4FA8" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 19.2C11 19.2 7.6 16.2 7.6 11.4C12.6 11.4 16 14.4 16 19.2Z" fill={`url(#${gid})`} />
      <path d="M16 17C16 11.6 19.3 8.2 24.5 8.2C24.5 13.6 21.2 17 16 17Z" fill={`url(#${gid})`} />
    </svg>
  );
}
