import { motion } from "framer-motion";

const FloatingOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, hsl(270 80% 60%) 0%, transparent 70%)",
          top: "10%",
          left: "10%"
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, hsl(320 70% 55%) 0%, transparent 70%)",
          top: "50%",
          right: "5%"
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, hsl(280 100% 70%) 0%, transparent 70%)",
          bottom: "10%",
          left: "30%"
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default FloatingOrbs;
