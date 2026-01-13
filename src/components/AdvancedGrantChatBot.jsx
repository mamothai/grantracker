import React, { useEffect, useRef, useState } from 'react';
import './AdvancedGrantChatBot.css';

const SNOWFLAKE_EMOJIS = ['❄️', '❅', '❆'];
const SNOWFLAKE_COUNT = 40;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

const AdvancedGrantChatBot = () => {
  const [snowflakes, setSnowflakes] = useState([]);
  const snowflakeRefs = useRef([]);

  useEffect(() => {
    // Generate snowflakes with random properties
    const flakes = Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(16, 32),
      duration: randomBetween(6, 14),
      delay: randomBetween(0, 10),
      drift: randomBetween(-30, 30),
      emoji: SNOWFLAKE_EMOJIS[Math.floor(Math.random() * SNOWFLAKE_EMOJIS.length)]
    }));
    setSnowflakes(flakes);
  }, []);

  // Optionally, re-randomize snowflake position after animation ends
  useEffect(() => {
    snowflakeRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.addEventListener('animationiteration', () => {
          setSnowflakes(flakes => {
            const newFlakes = [...flakes];
            newFlakes[i] = {
              ...newFlakes[i],
              left: randomBetween(0, 100),
              size: randomBetween(16, 32),
              duration: randomBetween(6, 14),
              delay: randomBetween(0, 10),
              drift: randomBetween(-30, 30),
              emoji: SNOWFLAKE_EMOJIS[Math.floor(Math.random() * SNOWFLAKE_EMOJIS.length)]
            };
            return newFlakes;
          });
        });
      }
    });
  }, [snowflakes]);

  return (
    <div className="advanced-chatbot-container">
      {/* ...your chatbot UI here... */}
      <div className="snow-animation">
        <div className="snow-layer-1">
          {snowflakes.map((flake, i) => (
            <span
              key={flake.id}
              ref={el => (snowflakeRefs.current[i] = el)}
              className="snowflake"
              style={{
                left: `${flake.left}%`,
                fontSize: `${flake.size}px`,
                animationDuration: `${flake.duration}s`,
                animationDelay: `${flake.delay}s`,
                filter: `blur(${randomBetween(0, 1.5)}px)`,
                '--drift': `${flake.drift}px`
              }}
            >
              {flake.emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedGrantChatBot;
