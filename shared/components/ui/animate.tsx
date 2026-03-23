"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";

/* ─── Spring config ─── */
const snappySpring = { type: "spring" as const, stiffness: 400, damping: 30 };

/* ─────────────────────────────────────────────
 * FadeIn — universal entrance animation.
 * Stagger children by passing increasing `delay` values.
 * Set `trigger="scroll"` for scroll-triggered reveals.
 * ───────────────────────────────────────────── */
interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  y?: number;
  trigger?: "mount" | "scroll";
}

function FadeIn({
  delay = 0,
  duration = 0.4,
  y = 8,
  trigger = "mount",
  children,
  ...props
}: FadeInProps) {
  const transition = {
    duration,
    delay,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  if (trigger === "scroll") {
    return (
      <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={transition}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 * SlideIn — directional entrance animation.
 * Uses spring physics for natural feel.
 * ───────────────────────────────────────────── */
interface SlideInProps extends HTMLMotionProps<"div"> {
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  distance?: number;
}

function SlideIn({ direction = "up", delay = 0, distance = 16, children, ...props }: SlideInProps) {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "right" || direction === "down" ? 1 : -1;

  return (
    <motion.div
      initial={{ opacity: 0, [axis]: sign * distance }}
      animate={{ opacity: 1, [axis]: 0 }}
      transition={{ ...snappySpring, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 * AnimateList — staggered list entrance.
 * Wraps children with orchestrated variants.
 * ───────────────────────────────────────────── */
const listVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: snappySpring,
  },
};

interface AnimateListProps {
  stagger?: number;
  children: React.ReactNode;
  className?: string;
}

function AnimateList({ stagger = 0.04, children, className }: AnimateListProps) {
  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      custom={stagger}
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, i) => (
          <motion.div key={i} variants={listItemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={listItemVariants}>{children}</motion.div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
 * CountUp — animated number counter.
 * Triggers on viewport entry (once).
 * ───────────────────────────────────────────── */
interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

function CountUp({ to, from = 0, duration = 1.2, format, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, {
    stiffness: 80,
    damping: 30,
    duration: duration * 1000,
  });
  const display = useTransform(springValue, (latest) =>
    format ? format(latest) : Math.round(latest).toString(),
  );

  useEffect(() => {
    if (isInView) {
      motionValue.set(to);
    }
  }, [isInView, motionValue, to]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

/* ─────────────────────────────────────────────
 * StaggerGroup — wraps children with sequential fade-in.
 * Each direct child gets an incremental delay.
 * ───────────────────────────────────────────── */
interface StaggerGroupProps {
  stagger?: number;
  baseDelay?: number;
  y?: number;
  children: React.ReactNode;
  className?: string;
}

function StaggerGroup({
  stagger = 0.06,
  baseDelay = 0,
  y = 8,
  children,
  className,
}: StaggerGroupProps) {
  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {items.map((child, i) => (
        <FadeIn key={i} delay={baseDelay + i * stagger} y={y}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

export { FadeIn, SlideIn, AnimateList, CountUp, StaggerGroup };
