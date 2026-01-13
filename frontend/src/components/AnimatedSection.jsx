import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function AnimatedSection({ 
  children, 
  className = '',
  delay = 0,
  duration = 0.8,
  y = 40
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
    >
      {children}
    </motion.div>
  );
}
