import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const ease = [0.22, 1, 0.36, 1];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />

      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '7rem 1.25rem 4rem',
          textAlign: 'center',
        }}>
        <div style={{ maxWidth: '560px', width: '100%' }}>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#2563EB',
              marginBottom: '1.5rem',
            }}>
            Connecting dreamers with the right people
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.07, ease }}
            className="font-display"
            style={{
              fontSize: 'clamp(2.5rem, 9vw, 5rem)',
              lineHeight: 1.04,
              letterSpacing: '-0.01em',
              color: '#0A1628',
              fontStyle: 'italic',
              fontWeight: 400,
              marginBottom: '1.5rem',
            }}>
            Some Dreams Need<br />The Right Person.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease }}
            style={{
              fontSize: '1.0625rem',
              color: '#6B7A99',
              lineHeight: 1.8,
              marginBottom: '2.5rem',
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
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '1.75rem',
            }}>
            <button
              onClick={() => navigate('/submit-dream')}
              style={{
                height: '52px',
                padding: '0 28px',
                background: '#2563EB',
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                boxShadow: '0 4px 14px rgba(37,99,235,0.30)',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#1D4ED8';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 22px rgba(37,99,235,0.38)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#2563EB';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.30)';
              }}>
              Enter Your Dream
            </button>

            <button
              onClick={() => navigate('/dreams')}
              style={{
                height: '52px',
                padding: '0 28px',
                background: '#fff',
                color: '#0A1628',
                fontWeight: 700,
                fontSize: '15px',
                borderRadius: '14px',
                border: '1.5px solid #E4EAF4',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#C8D5F0';
                e.currentTarget.style.background = '#F4F7FB';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E4EAF4';
                e.currentTarget.style.background = '#fff';
              }}>
              Explore Dreams
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.38, ease }}
            style={{
              fontSize: '12px',
              color: '#9AAAC7',
              fontWeight: 500,
              letterSpacing: '0.04em',
            }}>
            Anonymous · Human moderated · Free
          </motion.p>

        </div>
      </section>

      <Footer />
    </div>
  );
}
