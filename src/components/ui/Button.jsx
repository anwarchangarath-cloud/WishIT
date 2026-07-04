export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, icon, ...props
}) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

  const variants = {
    primary:   'bg-[#3D7BFF] text-white hover:bg-[#5B8DFF] active:scale-[0.98] shadow-blue rounded-2xl',
    secondary: 'bg-[#0B1222] text-[#D6DEF5] border border-[#1B2745] hover:border-[#2C3D6E] hover:bg-[#0E1730] rounded-2xl',
    ghost:     'text-[#8B9AC2] hover:bg-[#101A33] rounded-xl',
    navy:      'bg-[#03040A] text-white hover:bg-[#101A33] rounded-2xl shadow-float',
    outline:   'border-2 border-[#3D7BFF] text-[#6495FF] hover:bg-[#3D7BFF] hover:text-white rounded-2xl',
    danger:    'bg-[#FF5C5C] text-white hover:bg-[#FF5C5C] rounded-2xl',
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
