import React, { useEffect, useRef, useState } from 'react';
import './FallingSnowballs.css';

const SNOWBALL_COUNT = 50;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

const FallingSnowballs = () => {
  const [snowballs, setSnowballs] = useState([]);
  const snowballRefs = useRef([]);

  useEffect(() => {
    // Generate snowballs with random properties
    const balls = Array.from({ length: SNOWBALL_COUNT }).map((_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(8, 24),
      duration: randomBetween(8, 16),
      delay: randomBetween(0, 5),
      swingDistance: randomBetween(-60, 60)
    }));
    setSnowballs(balls);
  }, []);

  // Re-randomize snowball after animation ends
  useEffect(() => {
    snowballRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.addEventListener('animationend', () => {
          setSnowballs(balls => {
            const newBalls = [...balls];
            newBalls[i] = {
              ...newBalls[i],
              left: randomBetween(0, 100),
              size: randomBetween(8, 24),
              duration: randomBetween(8, 16),
              delay: randomBetween(0, 5),
              swingDistance: randomBetween(-60, 60)
            };
            return newBalls;
          });
        });
      }
    });
  }, [snowballs]);

  return (
    <div className="falling-snowballs-container">
      {snowballs.map((ball, i) => (
        <div
          key={ball.id}
          ref={el => (snowballRefs.current[i] = el)}
          className="snowball"
          style={{
            left: `${ball.left}%`,
            width: `${ball.size}px`,
            height: `${ball.size}px`,
            animationDuration: `${ball.duration}s`,
            animationDelay: `${ball.delay}s`,
            '--swing-distance': `${ball.swingDistance}px`
          }}
        />
      ))}
    </div>
  );
};

export default FallingSnowballs;
