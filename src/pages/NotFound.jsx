import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';

const ease = [0.22, 1, 0.36, 1];

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}
          className="text-center max-w-sm">

          {/* Big 404 */}
          <div className="relative mb-8 select-none">
            <div className="font-extrabold leading-none" style={{ fontSize: 'clamp(6rem, 18vw, 10rem)', color: 'var(--border)', letterSpacing: '-0.06em' }}>
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-[18px] flex items-center justify-center text-3xl"
                style={{ background: 'var(--blue-light)', border: '1.5px solid var(--blue-border)' }}>
                ✦
              </div>
            </div>
          </div>

          <h1 className="font-extrabold mb-3" style={{ fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>
            Page not found
          </h1>
          <p className="leading-relaxed mb-8 text-[14px]" style={{ color: 'var(--text-3)' }}>
            This page doesn't exist or has been moved.<br/>Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Go Home
            </Link>
            <Link to="/dreams" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              Browse Dreams
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
