const MAP = {
  /* status */
  draft:     'bg-[#101A33] text-[#8B9AC2] border-[#1B2745]',
  pending:   'bg-[#2B2110]  text-[#FFB648]  border-[#6E5620]',
  approved:  'bg-[#0A2B22] text-[#2CE5A7] border-[#1D5C48]',
  published: 'bg-[#12204A]   text-[#7FA8FF]   border-[#24345E]',
  fulfilled: 'bg-[#1D1640] text-[#B79CFF]  border-[#453775]',
  rejected:  'bg-[#2B1218]    text-[#FF6E6E]     border-[#6E2833]',
  matched:   'bg-[#0C2337]    text-[#4FC7FF]     border-[#1D4A66]',
  /* roles */
  admin:     'bg-[#0B1222] text-white        border-[#0B1222]',
  moderator: 'bg-[#171B45] text-[#A5B0FF]  border-[#37407E]',
  user:      'bg-[#101A33] text-[#8B9AC2]   border-[#1B2745]',
  /* misc */
  verified:  'bg-[#0A2B22] text-[#2CE5A7] border-[#1D5C48]',
  anonymous: 'bg-[#12204A]   text-[#7FA8FF]   border-[#24345E]',
};

export default function Badge({ label, type = 'user', dot = false, className = '' }) {
  const style = MAP[type] || MAP.user;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${style} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {label}
    </span>
  );
}
