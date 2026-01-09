import React, { useEffect, useState } from "react";
import "./ChatBot.css";

const ShootingStar = () => {
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    let timeoutIds = [];

    const createShootingStar = () => {
      // Random number of shooting stars (1-2) for natural look
      const count = Math.floor(Math.random() * 2) + 1;
      const newStars = [];

      for (let i = 0; i < count; i++) {
        // Start from the right side, upper portion of the sky
        const left = Math.random() * 40 + 50; // 50vw to 90vw
        const top = Math.random() * 25 + 5; // 5vh to 30vh
        
        newStars.push({
          id: Date.now() + i,
          left,
          top
        });
      }

      // Add new stars to state
      setShootingStars(prev => [...prev, ...newStars]);

      // Remove stars after animation completes (0.8s duration)
      newStars.forEach(star => {
        const timeoutId = setTimeout(() => {
          setShootingStars(prev => prev.filter(s => s.id !== star.id));
        }, 900);
        timeoutIds.push(timeoutId);
      });

      // Schedule next shooting star - random interval for natural feel
      const nextTimeout = setTimeout(createShootingStar, 2000 + Math.random() * 4000);
      timeoutIds.push(nextTimeout);
    };

    // Start the shooting stars
    const initialTimeout = setTimeout(createShootingStar, 1000);
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
            top: `${star.top}vh`
          }}
        />
      ))}
    </>
  );
};

export default ShootingStar;
