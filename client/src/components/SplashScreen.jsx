import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const duration = 2000; // 2 seconds
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 400); // Wait a bit before completing after 100%
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        backgroundImage: `
          linear-gradient(135deg, 
            rgba(248,250,252,1) 0%, 
            rgba(219,234,254,0.7) 30%, 
            rgba(165,180,252,0.5) 60%, 
            rgba(129,140,248,0.6) 100%
          ),
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.6) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(199,210,254,0.4) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(224,231,255,0.3) 0%, transparent 60%)
        `,
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Logo Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1.5
          }}
          style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, var(--primary) 0%, #A29BFE 100%)',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 20px 40px rgba(108, 92, 231, 0.4)',
            marginBottom: 24
          }}
        >
          <Layers size={40} />
        </motion.div>

        {/* Text Reveal */}
        <div style={{ overflow: 'hidden' }}>
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#1e293b',
              margin: 0,
              letterSpacing: '-0.03em'
            }}
          >
            SaaSHub
          </motion.h1>
        </div>

        <div style={{ overflow: 'hidden', marginTop: 8 }}>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            style={{
              color: '#64748b',
              margin: 0,
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '0.875rem'
            }}
          >
            Project Management
          </motion.p>
        </div>

        {/* Progress Line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{
            width: 200,
            height: 2,
            background: 'rgba(108, 92, 231, 0.2)',
            marginTop: 40,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary), #A29BFE)',
              width: `${progress}%`
            }}
          />
        </motion.div>
      </div>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            y: Math.random() * 100 + 50,
            x: (Math.random() - 0.5) * 200
          }}
          animate={{ 
            opacity: [0, 0.5, 0],
            y: -200,
            x: (Math.random() - 0.5) * 200
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(1px)',
            bottom: '20%'
          }}
        />
      ))}
    </motion.div>
  );
};

export default SplashScreen;
