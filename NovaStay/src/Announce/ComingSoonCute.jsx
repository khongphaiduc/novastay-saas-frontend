import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import imgBall1 from '../assets/avatar0.jpg';
import imgBall2 from '../assets/z7940363373345_9a1ed08a79f5fb12e6a7f57079ec7791.jpg';
import imgBall3 from '../assets/z7940349596776_999a1d430207de86b0ebe7982553b2f0.jpg';

function BouncingBalls() {
  const ball1Ref = useRef(null);
  const ball2Ref = useRef(null);
  const ball3Ref = useRef(null);

  useEffect(() => {
    const balls = [
      { ref: ball1Ref, x: 0, y: 0, vx: 1, vy: 1, radius: 45, img: imgBall1 },
      { ref: ball2Ref, x: 0, y: 0, vx: -1.2, vy: 0.9, radius: 45, img: imgBall2 },
      { ref: ball3Ref, x: 0, y: 0, vx: 1.1, vy: -1.1, radius: 45, img: imgBall3 },
    ];

    // Initialize positions randomly within window viewport
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    balls.forEach(ball => {
      ball.x = Math.max(ball.radius, Math.random() * (width - ball.radius * 2));
      ball.y = Math.max(ball.radius, Math.random() * (height - ball.radius * 2));
      // Give random velocities
      ball.vx = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8);
      ball.vy = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8);
    });

    let animationFrameId;

    const updatePhysics = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      // Update positions & check wall collisions first
      balls.forEach(ball => {
        if (!ball.ref.current) return;

        // Move
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Collision detection with walls
        // Left & Right
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx = -ball.vx;
        } else if (ball.x + ball.radius > currentWidth) {
          ball.x = currentWidth - ball.radius;
          ball.vx = -ball.vx;
        }

        // Top & Bottom
        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy;
        } else if (ball.y + ball.radius > currentHeight) {
          ball.y = currentHeight - ball.radius;
          ball.vy = -ball.vy;
        }
      });

      // Collision detection and response between balls (elastic collision)
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist) {
            // Overlap resolution to prevent sticking
            const overlap = minDist - dist;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            // Push apart by half the overlap each
            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            // Tangent vector
            const tx = -ny;
            const ty = nx;

            // Project velocities onto normal and tangent vectors
            const dpTan1 = b1.vx * tx + b1.vy * ty;
            const dpTan2 = b2.vx * tx + b2.vy * ty;
            
            const dpNorm1 = b1.vx * nx + b1.vy * ny;
            const dpNorm2 = b2.vx * nx + b2.vy * ny;

            // Swap normal components (equal mass elastic collision)
            const nv1 = dpNorm2;
            const nv2 = dpNorm1;

            // Reconstruct velocity vectors
            b1.vx = dpTan1 * tx + nv1 * nx;
            b1.vy = dpTan1 * ty + nv1 * ny;
            b2.vx = dpTan2 * tx + nv2 * nx;
            b2.vy = dpTan2 * ty + nv2 * ny;
          }
        }
      }

      // Apply transforms
      balls.forEach(ball => {
        if (!ball.ref.current) return;
        ball.ref.current.style.transform = `translate3d(${ball.x - ball.radius}px, ${ball.y - ball.radius}px, 0)`;
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      {[ball1Ref, ball2Ref, ball3Ref].map((ref, index) => {
        const images = [imgBall1, imgBall2, imgBall3];
        return (
          <div
            key={index}
            ref={ref}
            style={{
              position: 'absolute',
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #ff8fab',
              boxShadow: '0 8px 24px rgba(255, 143, 171, 0.4)',
              pointerEvents: 'auto',
              cursor: 'grab',
              left: 0,
              top: 0,
              willChange: 'transform',
            }}
          >
            <img
              src={images[index]}
              alt="bouncing avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

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
      {/* 3 quả bóng avatar di chuyển ngẫu nhiên và va đập */}
      <BouncingBalls />

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