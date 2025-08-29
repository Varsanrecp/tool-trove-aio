// src/components/Motion.tsx
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

// Page transition wrapper (use this to wrap each page)
export const PageTransition: React.FC<Props> = ({ children, className }) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggeredContainer
 * - Wrap a set of direct children (e.g. list of cards).
 * - It will reveal them one-by-one (stagger) when they enter the viewport.
 * - Respects prefers-reduced-motion and disables on small screens for performance.
 *
 * Usage:
 * <StaggeredContainer className="grid ...">
 *   {items.map(i => <Card key={i.id} {...} />)}
 * </StaggeredContainer>
 */
export const StaggeredContainer: React.FC<{
  children?: React.ReactNode;
  className?: string;
  stagger?: number; // seconds between items
  once?: boolean; // animate once only
}> = ({ children, className, stagger = 0.06, once = true }) => {
  const reduce = useReducedMotion();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const shouldAnimate = !reduce && !isMobile;

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldAnimate ? stagger : 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldAnimate ? 0 : 1, y: shouldAnimate ? -12 : 0 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldAnimate ? 0.45 : 0 },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.12 }}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={(child as any)?.key ?? i} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PageTransition;
