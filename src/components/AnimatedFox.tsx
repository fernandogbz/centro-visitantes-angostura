import React, { useState, useEffect } from "react";
import "./AnimatedFox.css";

export const AnimatedFox: React.FC = () => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [phase, setPhase] = useState<"walk-down" | "wave" | "walk-away">(
    "walk-down"
  );
  const [position, setPosition] = useState(-10);

  useEffect(() => {
    // Animación de los sprites
    const spriteInterval = setInterval(() => {
      setCurrentFrame((prev) => (prev % 5) + 1);
    }, 150);

    return () => clearInterval(spriteInterval);
  }, [phase]);

  useEffect(() => {
    // Animación del movimiento
    const moveInterval = setInterval(() => {
      setPosition((prev) => {
        if (phase === "walk-down" && prev < 45) {
          return prev + 0.8;
        } else if (phase === "walk-down" && prev >= 45) {
          setPhase("wave");
          return prev;
        } else if (phase === "walk-away" && prev < 110) {
          return prev + 0.8;
        } else if (prev >= 110) {
          setPhase("walk-down");
          return -10;
        }
        return prev;
      });
    }, 16);

    return () => clearInterval(moveInterval);
  }, [phase, position]);

  useEffect(() => {
    // Cambiar de wave a walk-away después de 2 segundos
    if (phase === "wave") {
      const timer = setTimeout(() => {
        setPhase("walk-away");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const getCurrentImage = () => {
    if (phase === "wave") {
      return `/fox_frames/fox-idle-${currentFrame}.png`;
    }
    return `/fox_frames/fox-walk-${currentFrame}.png`;
  };

  return (
    <div
      className="animated-fox-container"
      style={{
        position: "fixed",
        right: "-17px",
        top: `${position}%`,
        transform: "rotate(-90deg)",
        zIndex: 50,
        pointerEvents: "none",
        transition: "top 0.016s linear",
      }}
    >
      <img
        src={getCurrentImage()}
        alt="Animated Fox"
        style={{
          width: "150px",
          height: "150px",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};
