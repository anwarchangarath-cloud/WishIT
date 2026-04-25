export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, icon, ...props
}) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue rounded-2xl',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl',
    ghost:     'text-slate-600 hover:bg-slate-100 rounded-xl',
    navy:      'bg-slate-950 text-white hover:bg-slate-900 rounded-2xl shadow-float',
    outline:   'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl',
    danger:    'bg-red-500 text-white hover:bg-red-600 rounded-2xl',
    'ghost-white': 'text-white/80 hover:text-white hover:bg-white/10 rounded-xl',
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1.5',
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5',
    xl: 'px-10 py-4 text-lg gap-3',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
