import React, { useEffect, useState } from "react";
import "./ChatBot.css";

const ShootingStar = () => {
  const [shootingStar, setShootingStar] = useState({
    key: 0,
    active: false,
    left: 0,
    top: 0,
    angle: 0
  });

  useEffect(() => {
    let timeoutId;
    function launchShootingStar() {
      const left = Math.random() * 60 + 20; // 20vw to 80vw
      const top = Math.random() * 20 + 5; // 5vh to 25vh
      const angle = Math.random() * 30 - 15; // -15deg to +15deg
      setShootingStar({
        key: Date.now(),
        active: true,
        left,
        top,
        angle
      });
      setTimeout(() => setShootingStar(s => ({ ...s, active: false })), 1800);
      timeoutId = setTimeout(launchShootingStar, 3500 + Math.random() * 4000);
    }
    launchShootingStar();
    return () => clearTimeout(timeoutId);
  }, []);

  return shootingStar.active ? (
    <div
      key={shootingStar.key}
      className="shooting-star-real"
      style={{
        left: `${shootingStar.left}vw`,
        top: `${shootingStar.top}vh`,
        '--angle': `${shootingStar.angle}deg`
      }}
    />
  ) : null;
};

export default ShootingStar;
