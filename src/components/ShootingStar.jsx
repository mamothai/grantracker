import React, { useEffect, useState } from "react";
import "./ChatBot.css";

const ShootingStar = () => {
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    let timeoutIds = [];

    const createShootingStar = () => {
      // Rare occurrence - mostly 1 at a time
      const count = Math.random() > 0.8 ? 2 : 1;
      const newStars = [];

      for (let i = 0; i < count; i++) {
        // Start from right side, random upper position
        const left = Math.random() * 35 + 55; // 55vw to 90vw
        const top = Math.random() * 20 + 3; // 3vh to 23vh
        // Vary speed slightly for natural feel
        const duration = 0.7 + Math.random() * 0.4; // 0.7s to 1.1s
        
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
        }, (star.duration + 0.2) * 1000);
        timeoutIds.push(timeoutId);
      });

      // Long random pauses between occurrences (5-12 seconds)
      // This makes it feel rare and easily missable
      const nextTimeout = setTimeout(createShootingStar, 5000 + Math.random() * 7000);
      timeoutIds.push(nextTimeout);
    };

    // Start with a random delay
    const initialTimeout = setTimeout(createShootingStar, 2000 + Math.random() * 3000);
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
