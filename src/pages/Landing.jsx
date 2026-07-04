import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const ease = [0.22, 1, 0.36, 1];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#05070F', minHeight: '100vh' }}>
      <Navbar />

      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '7rem 1.25rem 4rem',
          textAlign: 'center',
          overflow: 'hidden',
        }}>

        {/* Backdrop — grid + aurora glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* perspective grid */}
          <div
            className="grid-pattern"
            style={{
              position: 'absolute',
              inset: 0,
              maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 20%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 20%, transparent 75%)',
            }}
          />
          {/* aurora glow */}
          <div style={{
            position: 'absolute',
            top: '-30%', left: '50%', transform: 'translateX(-50%)',
            width: '900px', height: '620px',
            background: 'radial-gradient(ellipse 50% 45% at 50% 50%, rgba(61,123,255,0.22) 0%, rgba(79,227,255,0.06) 45%, transparent 70%)',
            filter: 'blur(4px)',
          }} />
          {/* horizon line */}
          <div style={{
            position: 'absolute',
            top: 'calc(50% + 190px)', left: '50%', transform: 'translateX(-50%)',
            width: 'min(720px, 92vw)', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(79,227,255,0.35) 30%, rgba(91,141,255,0.45) 50%, rgba(79,227,255,0.35) 70%, transparent)',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', width: '100%' }}>

          {/* Eyebrow — telemetry style */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="font-mono"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#4FE3FF',
              marginBottom: '1.75rem',
            }}>
            {'// Connecting dreamers with the right people'}
          </motion.p>

          {/* Headline — Unbounded */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.07, ease }}
            className="font-display"
            style={{
              fontSize: 'clamp(1.875rem, 6.5vw, 3.5rem)',
              lineHeight: 1.14,
              letterSpacing: '-0.02em',
              color: '#E9EEFF',
              fontWeight: 500,
              marginBottom: '1.5rem',
              textWrap: 'balance',
            }}>
            Some dreams need{' '}
            <span className="gradient-text-blue">the right person.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease }}
            style={{
              fontSize: '1.0625rem',
              color: '#8B9AC2',
              lineHeight: 1.8,
              marginBottom: '2.75rem',
              maxWidth: '460px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
            Post your dream. Find the person who can make it real.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.23, ease }}
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '2rem',
            }}>
            <button
              onClick={() => navigate('/submit-dream')}
              style={{
                height: '52px',
                padding: '0 30px',
                background: 'linear-gradient(135deg, #3D7BFF 0%, #2E5FD9 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
                borderRadius: '14px',
                border: '1px solid rgba(127,168,255,0.4)',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                boxShadow: '0 4px 24px rgba(61,123,255,0.45), 0 0 48px rgba(61,123,255,0.15)',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(61,123,255,0.55), 0 0 64px rgba(79,227,255,0.20)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(61,123,255,0.45), 0 0 48px rgba(61,123,255,0.15)';
              }}>
              Enter Your Dream
            </button>

            <button
              onClick={() => navigate('/dreams')}
              style={{
                height: '52px',
                padding: '0 30px',
                background: 'rgba(11,18,34,0.6)',
                backdropFilter: 'blur(8px)',
                color: '#E9EEFF',
                fontWeight: 700,
                fontSize: '15px',
                borderRadius: '14px',
                border: '1px solid rgba(91,141,255,0.30)',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(79,227,255,0.55)';
                e.currentTarget.style.background = 'rgba(18,32,74,0.7)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(79,227,255,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(91,141,255,0.30)';
                e.currentTarget.style.background = 'rgba(11,18,34,0.6)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              Explore Dreams
            </button>
          </motion.div>

          {/* Trust line — telemetry readout */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.38, ease }}
            className="font-mono"
            style={{
              fontSize: '11px',
              color: '#5F6F9C',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
            Anonymous&ensp;·&ensp;Human moderated&ensp;·&ensp;Free
          </motion.p>

        </div>
      </section>

      <Footer />
    </div>
  );
}
