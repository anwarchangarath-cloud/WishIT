const MAP = {
  /* status */
  draft:     'bg-slate-100 text-slate-600 border-slate-200',
  pending:   'bg-amber-50  text-amber-700  border-amber-200',
  approved:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  published: 'bg-blue-50   text-blue-700   border-blue-200',
  fulfilled: 'bg-violet-50 text-violet-700  border-violet-200',
  rejected:  'bg-red-50    text-red-600     border-red-200',
  matched:   'bg-sky-50    text-sky-700     border-sky-200',
  /* roles */
  admin:     'bg-slate-900 text-white        border-slate-900',
  moderator: 'bg-indigo-50 text-indigo-700  border-indigo-200',
  user:      'bg-slate-100 text-slate-600   border-slate-200',
  /* misc */
  verified:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  anonymous: 'bg-blue-50   text-blue-700   border-blue-200',
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
