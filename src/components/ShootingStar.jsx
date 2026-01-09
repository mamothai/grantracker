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
        const left = Math.random() * 70 + 15; // 15vw to 85vw
        const top = Math.random() * 30 + 5; // 5vh to 35vh
        const angle = Math.random() * 25 - 12; // -12deg to +12deg
        const duration = 1.5 + Math.random() * 1; // 1.5s to 2.5s
        const delay = Math.random() * 0.5; // 0 to 0.5s delay

        newStars.push({
          id: Date.now() + i,
          left,
          top,
          angle,
          duration,
          delay
        });
      }

      // Add new stars to state
      setShootingStars(prev => [...prev, ...newStars]);

      // Remove stars after animation completes
      newStars.forEach((star, index) => {
        const timeoutId = setTimeout(() => {
          setShootingStars(prev => prev.filter(s => s.id !== star.id));
        }, (star.duration + star.delay) * 1000);
        timeoutIds.push(timeoutId);
      });

      // Schedule next batch of shooting stars
      // Random interval between 1.5s and 4s for more variety
      const nextTimeout = setTimeout(createShootingStar, 1500 + Math.random() * 2500);
      timeoutIds.push(nextTimeout);
    };

    // Start the shooting stars
    const initialTimeout = setTimeout(createShootingStar, 500);
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
            '--angle': `${star.angle}deg`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
    </>
  );
};

export default ShootingStar;
