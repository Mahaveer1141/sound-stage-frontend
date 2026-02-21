import { motion } from "framer-motion";

interface AudioWaveProps {
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

const AudioWave = ({ isActive = false, size = "md" }: AudioWaveProps) => {
  const barCount = 5;
  const heights = {
    sm: { min: 8, max: 16 },
    md: { min: 12, max: 24 },
    lg: { min: 16, max: 32 }
  };

  const barWidth = {
    sm: 2,
    md: 3,
    lg: 4
  };

  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full bg-gradient-to-t from-primary to-secondary"
          style={{ width: barWidth[size] }}
          initial={{ height: heights[size].min }}
          animate={
            isActive
              ? {
                  height: [
                    heights[size].min,
                    heights[size].max,
                    heights[size].min
                  ]
                }
              : { height: heights[size].min }
          }
          transition={
            isActive
              ? {
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }
              : {}
          }
        />
      ))}
    </div>
  );
};

export default AudioWave;
