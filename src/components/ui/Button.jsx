export default function Button({ children, variant = 'primary', size = 'md', className = '', loading, ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5',
    secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
    ghost: 'text-blue-700 hover:bg-blue-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    white: 'bg-white text-blue-700 hover:bg-blue-50 shadow-lg',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading} {...props}>
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
