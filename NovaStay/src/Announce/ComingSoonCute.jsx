import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const navigate = useNavigate();

  // Định nghĩa các kiểu bay nhảy cho các icon trang trí
  const floatingVariants = (delay = 0) => ({
    animate: {
      y: [0, -15, 0],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay
      }
    }
  });

  return (
    <div className="coming-soon-container" style={styles.container}>
      {/* Các hạt bong bóng/ngôi sao bay cute ở nền */}
      <motion.div className="dot" style={{ ...styles.dot, top: '20%', left: '15%' }} variants={floatingVariants(0)} animate="animate">⭐</motion.div>
      <motion.div className="dot" style={{ ...styles.dot, top: '25%', right: '18%' }} variants={floatingVariants(0.5)} animate="animate">✨</motion.div>
      <motion.div className="dot" style={{ ...styles.dot, bottom: '30%', left: '20%' }} variants={floatingVariants(0.8)} animate="animate">🌸</motion.div>
      <motion.div className="dot" style={{ ...styles.dot, bottom: '25%', right: '15%' }} variants={floatingVariants(0.3)} animate="animate">🎈</motion.div>

      {/* Box nội dung chính */}
      <motion.div
        className="card"
        style={styles.card}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        {/* Khu vực Animation Nhân vật / Icon chính */}
        <div style={styles.animationZone}>
          {/* Bánh răng xoay cute */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={styles.gearIcon}
          >
            <Settings size={48} color="#ff8fab" />
          </motion.div>

          {/* Bé mèo đang chạy */}
          <motion.div
            style={styles.runningCat}
            animate={{
              x: [-100, 100],
              scaleX: [1, 1, -1, -1, 1]
            }}
            transition={{
              x: {
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              },
              scaleX: {
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "steps(1)"
              }
            }}
          >
            <img
              src="https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif"
              alt="Mèo đang chạy"
              style={{ width: '80px', height: 'auto', display: 'block' }}
            />
          </motion.div>
        </div>

        {/* Tiêu đề & Nội dung */}
        <motion.h1
          style={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Tính Năng Đang Phát Triển!
        </motion.h1>

        <motion.p
          style={styles.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Đội ngũ chúng mình đang làm việc hết công suất (và ăn rất nhiều bánh ngọt 🍰) để sớm ra mắt tính năng siêu cấp xịn sò này. Cậu chờ chút xíu nhé!
        </motion.p>

        {/* Thanh phần trăm tiến trình giả lập siêu cute */}
        <div style={styles.progressContainer}>
          <motion.div
            style={styles.progressBar}
            initial={{ width: "0%" }}
            animate={{ width: "75%" }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.6 }}
          />
          <span style={styles.progressText}>Đang hoàn thành 75%...</span>
        </div>

        {/* Nút quay lại */}
        <motion.button
          style={styles.button}
          whileHover={{ scale: 1.05, backgroundColor: "#ffc2d1" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
        >
          Quay lại Trang Chủ ✨
        </motion.button>
      </motion.div>
    </div>
  );
};

// CSS-in-JS để bạn dễ copy vào chạy luôn không cần cấu hình CSS bên ngoài
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffe5ec 0%, #ffc2d1 100%)',
    fontFamily: '"Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px'
  },
  dot: {
    position: 'absolute',
    fontSize: '2rem',
    pointerEvents: 'none',
  },
  card: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '40px 30px',
    boxShadow: '0 10px 30px rgba(255, 143, 171, 0.3)',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center',
    zIndex: 10,
  },
  animationZone: {
    position: 'relative',
    height: '100px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  runningCat: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    height: '60px',
  },
  gearIcon: {
    position: 'absolute',
    top: '-10px',
    right: '35%',
    opacity: 0.7
  },
  title: {
    color: '#fb6f92',
    fontSize: '1.8rem',
    margin: '10px 0',
  },
  description: {
    color: '#6c757d',
    fontSize: '1rem',
    lineHeight: '1.6',
    margin: '0 0 25px 0',
  },
  progressContainer: {
    background: '#fff0f3',
    borderRadius: '20px',
    height: '24px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '30px',
    border: '2px solid #ffb3c6'
  },
  progressBar: {
    background: 'linear-gradient(90deg, #ff8fab, #fb6f92)',
    height: '100%',
    borderRadius: '20px',
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#fb6f92',
  },
  button: {
    background: '#ff8fab',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(255, 143, 171, 0.4)',
    transition: 'background 0.3s',
  }
};

export default ComingSoon;