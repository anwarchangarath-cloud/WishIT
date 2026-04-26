import { Link } from 'react-router-dom';

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-[10px] bg-blue-600 flex items-center justify-center">
      <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L9.6 5.3 13.3 5.8 10.6 8.4 11.3 12 8 10.3 4.7 12 5.4 8.4 2.7 5.8 6.4 5.3Z" fill="currentColor"/>
      </svg>
    </div>
    <span className="font-extrabold text-[18px] text-white" style={{letterSpacing:'-0.03em'}}>WishIT</span>
  </div>
);

const LINKS = [
  {
    heading: 'Platform',
    items: [
      ['Explore Dreams', '/dreams'],
      ['Post a Dream', '/submit-dream'],
      ['Become a Fulfiller', '/register?mode=fulfiller'],
      ['Success Stories', '/stories'],
    ],
  },
  {
    heading: 'Trust & Safety',
    items: [
      ['Moderation Policy', '/trust'],
      ['Privacy Policy', '/privacy'],
      ['Terms of Service', '/terms'],
      ['Report an Issue', '/report'],
    ],
  },
  {
    heading: 'Company',
    items: [
      ['About WishIT', '/about'],
      ['Contact Us', '/contact'],
      ['Careers', '/careers'],
      ['How It Works', '/#how-it-works'],
    ],
  },
];

const SOCIAL = [
  {
    label: 'X / Twitter',
    href: '#',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    label: 'LinkedIn',
    href: '#',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)' }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 py-14 border-b border-white/[0.06]">

          {/* Brand — spans 2 cols */}
          <div className="col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-4 text-[#6B7A99] text-[13.5px] leading-[1.75] max-w-[240px]">
              Where Dreams Meet Their Fulfillers — a safe, moderated platform built on human trust.
            </p>

            <div className="flex items-center gap-2 mt-5 w-fit px-3 py-1.5 rounded-full border border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11.5px] text-[#6B7A99] font-medium">Platform Online</span>
            </div>

            <div className="flex items-center gap-2 mt-5">
              {SOCIAL.map(({ label, href, path }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-white/[0.07] text-[#6B7A99] hover:text-white hover:border-white/20 transition-all no-min-h"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d={path}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#3D4F72] mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.items.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to}
                      className="text-[13px] text-[#6B7A99] hover:text-white transition-colors no-min-h">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6">
          <p className="text-[12px] text-[#3D4F72]">© {new Date().getFullYear()} WishIT. All rights reserved.</p>
          <p className="text-[12px] text-[#3D4F72] font-display italic">Where Dreams Meet Their Fulfillers</p>
        </div>
      </div>
    </footer>
  );
}
