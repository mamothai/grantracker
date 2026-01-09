import React, { useEffect, useState } from "react";
import "./ChatBot.css";

const ShootingStar = () => {
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    let timeoutIds = [];

    const createShootingStar = () => {
      // Very rare - mostly single occurrence
      const count = Math.random() > 0.85 ? 2 : 1;
      const newStars = [];

      for (let i = 0; i < count; i++) {
        // Start from right side, varied upper positions
        const left = Math.random() * 30 + 60; // 60vw to 90vw
        const top = Math.random() * 18 + 4; // 4vh to 22vh
        const duration = 0.7 + Math.random() * 0.25; // 0.7s to 0.95s
        
        newStars.push({
          id: Date.now() + i,
          left,
          top,
          duration
        });
      }

      // Add new stars to state
      setShootingStars(prev => [...prev, ...newStars]);

      // Remove stars after animation completes
      newStars.forEach(star => {
        const timeoutId = setTimeout(() => {
          setShootingStars(prev => prev.filter(s => s.id !== star.id));
        }, (star.duration + 0.15) * 1000);
        timeoutIds.push(timeoutId);
      });

      // Long pauses between occurrences (6-15 seconds)
      // Makes it feel rare and easy to miss
      const nextTimeout = setTimeout(createShootingStar, 6000 + Math.random() * 9000);
      timeoutIds.push(nextTimeout);
    };

    // Start with random initial delay
    const initialTimeout = setTimeout(createShootingStar, 3000 + Math.random() * 4000);
    timeoutIds.push(initialTimeout);

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      {shootingStars.map(star => (
        <div
          key={star.id}
          className="shooting-star-real"
          style={{
            left: `${star.left}vw`,
            top: `${star.top}vh`,
            animationDuration: `${star.duration}s`
          }}
        />
      ))}
    </>
  );
};

export default ShootingStar;
