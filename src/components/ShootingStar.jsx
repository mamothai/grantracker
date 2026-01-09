import React, { useEffect, useState } from "react";
import "./ChatBot.css";

const ShootingStar = () => {
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    let timeoutIds = [];

    const createShootingStar = () => {
      // Random number of shooting stars (1-3) for more dynamic effect
      const count = Math.floor(Math.random() * 3) + 1;
      const newStars = [];

      for (let i = 0; i < count; i++) {
        // Start from the right side, upper portion of the sky
        const left = Math.random() * 50 + 40; // 40vw to 90vw
        const top = Math.random() * 30 + 5; // 5vh to 35vh
        const duration = 1 + Math.random() * 0.8; // 1s to 1.8s
        
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

      // Schedule next batch of shooting stars
      const nextTimeout = setTimeout(createShootingStar, 2500 + Math.random() * 3500);
      timeoutIds.push(nextTimeout);
    };

    // Start the shooting stars after a short delay
    const initialTimeout = setTimeout(createShootingStar, 1500);
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
