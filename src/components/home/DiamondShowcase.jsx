import React, { useState, useEffect } from "react";
import Die from "@/components/game/Die";

// Continuously rolling row of 6 Diamond dice for the Home screen.
export default function DiamondShowcase() {
  const [dice, setDice] = useState([1, 2, 3, 4, 5, 6]);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRolling(true);
      setTimeout(() => {
        setDice(Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1));
        setRolling(false);
      }, 900);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center gap-1.5 mb-4">
      {dice.map((value, i) => (
        <Die
          key={i}
          value={value}
          rolling={rolling}
          size={40}
          skinId="leather"
          pipsId="classic_dots"
        />
      ))}
    </div>
  );
}