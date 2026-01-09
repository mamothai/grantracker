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

      // Remove stars after animation completes (1.5s duration)
      newStars.forEach(star => {
        const timeoutId = setTimeout(() => {
          setShootingStars(prev => prev.filter(s => s.id !== star.id));
        }, 1600);
        timeoutIds.push(timeoutId);
      });

      // Schedule next batch of shooting stars
      // Random interval between 2s and 5s for more variety
      const nextTimeout = setTimeout(createShootingStar, 2000 + Math.random() * 3000);
      timeoutIds.push(nextTimeout);
    };

    // Start the shooting stars after a short delay
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
