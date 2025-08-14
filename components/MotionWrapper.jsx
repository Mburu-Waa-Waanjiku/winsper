'use client';

import { motion } from 'framer-motion';

const MotionWrapper = ({
  children,
  effect = 'fadeIn',
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  className = '',
  viewport = { once: true, amount: 0.1 },
  ...props
}) => {
  // Define animation variants
  const variants = {
    // Fade effects
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    
    // Slide effects
    slideIn: {
      hidden: {
        opacity: 0,
        x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
        y: direction === 'up' ? distance : direction === 'down' ? -distance : 0
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0
      }
    },

    // Scale effects
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },

    scaleUp: {
      hidden: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1 }
    },

    // Bounce effect
    bounceIn: {
      hidden: { opacity: 0, scale: 0.3 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      }
    },

    // Flip effect
    flipIn: {
      hidden: { opacity: 0, rotateY: -90 },
      visible: { opacity: 1, rotateY: 0 }
    },

    // Rotate effect
    rotateIn: {
      hidden: { opacity: 0, rotate: -180 },
      visible: { opacity: 1, rotate: 0 }
    },

    // Blur effect
    blurIn: {
      hidden: { opacity: 0, filter: 'blur(10px)' },
      visible: { opacity: 1, filter: 'blur(0px)' }
    },

    // Zoom effect
    zoomIn: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 }
    },

    // Elastic effect
    elasticIn: {
      hidden: { opacity: 0, scale: 0 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }
    },

    // Stagger children effect (for containers)
    staggerContainer: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.1
        }
      }
    },

    // Stagger item (for children of stagger container)
    staggerItem: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }
  };

  // Get the selected variant
  const selectedVariant = variants[effect] || variants.fadeIn;

  // Create transition configuration
  const transition = {
    duration,
    delay,
    ease: "easeOut",
    ...(selectedVariant.visible?.transition || {})
  };

  return (
    <motion.div
      className={className}
      variants={selectedVariant}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MotionWrapper;