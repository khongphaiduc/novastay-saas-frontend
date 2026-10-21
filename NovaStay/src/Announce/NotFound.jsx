import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import errorImage from '../assets/404-error-purple-3840x2160-18308.jpg';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // Auto-redirect to home after countdown reaches 0
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/', { replace: true });
    }
  }, [countdown, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.container}>
      {/* Dynamic Background Gradients */}
      <div style={styles.bgGradient1} />
      <div style={styles.bgGradient2} />

      {/* Decorative stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-20"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `pulse ${2 + Math.random() * 3}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Glow behind the image */}
        <div style={styles.imageGlow} />

        {/* 404 Image Container */}
        <motion.div
          style={styles.imageContainer}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <img
            src={errorImage}
            alt="404 Error - Page Not Found"
            style={styles.image}
          />
        </motion.div>

        {/* Text Section */}
        <div style={styles.textSection}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={styles.badge}
          >
            <AlertCircle size={14} style={{ marginRight: '6px' }} />
            Lỗi 404 - Không Tìm Thấy Trang
          </motion.div>

          <motion.h1
            style={styles.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Đường Dẫn Không Tồn Tại
          </motion.h1>

          <motion.p
            style={styles.description}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Trang bạn đang tìm kiếm có thể đã bị di chuyển, đổi tên hoặc tạm thời không khả dụng. 
            Hệ thống sẽ tự động chuyển hướng bạn về trang chủ sau{' '}
            <strong style={styles.countdownHighlight}>{countdown}</strong> giây.
          </motion.p>
        </div>

        {/* Interactive Buttons */}
        <motion.div
          style={styles.buttonGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => navigate(-1)}
            style={styles.secondaryButton}
            type="button"
          >
            <ArrowLeft size={16} />
            <span>Quay Lại</span>
          </button>
          
          <button
            onClick={() => navigate('/', { replace: true })}
            style={styles.primaryButton}
            type="button"
          >
            <Home size={16} />
            <span>Về Trang Chủ</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Advanced glassmorphism styles matching NovaStay design aesthetic
const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#030014',
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
    padding: '24px',
    boxSizing: 'border-box',
    color: '#ffffff',
  },
  bgGradient1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
    top: '-10%',
    left: '10%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  bgGradient2: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
    bottom: '-15%',
    right: '5%',
    filter: 'blur(100px)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(10, 7, 24, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '32px',
    padding: '48px 40px',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
    maxWidth: '640px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  imageGlow: {
    position: 'absolute',
    width: '80%',
    height: '240px',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(0, 0, 0, 0) 65%)',
    top: '30px',
    zIndex: -1,
    filter: 'blur(20px)',
  },
  imageContainer: {
    width: '100%',
    maxWidth: '460px',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
    marginBottom: '36px',
    cursor: 'pointer',
    backgroundColor: '#0a0718',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'cover',
  },
  textSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '520px',
    marginBottom: '36px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    color: '#c084fc',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '8px 0 0 0',
    background: 'linear-gradient(135deg, #ffffff 30%, #c084fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  description: {
    fontSize: '1rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: '0',
  },
  countdownHighlight: {
    color: '#a855f7',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '16px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '14px 28px',
    borderRadius: '16px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
};

export default NotFound;
