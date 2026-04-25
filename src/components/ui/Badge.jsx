const styles = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  published: 'bg-blue-100 text-blue-700 border-blue-200',
  fulfilled: 'bg-purple-100 text-purple-700 border-purple-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  admin: 'bg-blue-900 text-white border-blue-900',
  moderator: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  user: 'bg-gray-100 text-gray-600 border-gray-200',
  verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function Badge({ label, type = 'user', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles[type] || 'bg-gray-100 text-gray-600 border-gray-200'} ${className}`}>
      {label}
    </span>
  );
}
