import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-white font-black text-base">W</span>
              </div>
              <span className="font-black text-2xl tracking-tight">WishIT</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
              Where Dreams Meet Their Fulfillers. A trusted platform connecting dreamers with people who care.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-blue-100">Platform</h4>
            <ul className="space-y-2">
              {[['Explore Dreams', '/dreams'], ['Submit a Dream', '/submit-dream'], ['How it Works', '/#how-it-works'], ['Success Stories', '/#stories']].map(([label, to]) => (
                <li key={label}><Link to={to} className="text-blue-300 text-sm hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-blue-100">Company</h4>
            <ul className="space-y-2">
              {[['About', '/about'], ['Trust & Safety', '/trust'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([label, to]) => (
                <li key={label}><Link to={to} className="text-blue-300 text-sm hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-blue-400 text-sm">© 2025 WishIT. All rights reserved.</p>
          <p className="text-blue-400 text-sm italic">Where Dreams Meet Their Fulfillers</p>
        </div>
      </div>
    </footer>
  );
}
