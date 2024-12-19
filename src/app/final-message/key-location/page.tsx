"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function KeyLocationPage(): React.JSX.Element {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Start the confetti
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 25,
      spread: 360,
      ticks: 50,
      zIndex: 0,
      colors: ["#FF69B4", "#9370DB", "#FFB6C1", "#DDA0DD", "#FF1493"],
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 40 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    setTimeout(() => setShowMessage(true), 800);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-2xl mx-auto">
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-purple-100"
          >
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent"
            >
              Félicitations !
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl text-center font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              Tu as résolu l&apos;énigme finale !
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-6 md:p-8 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-2xl border border-purple-100 shadow-lg"
            >
              <p className="text-xl text-purple-700 text-center mb-4">
                Ton cadeau est caché...
              </p>
              <p className="text-2xl md:text-3xl font-bold text-center text-purple-700">
                Dérrière le Red Hot Chili Pepper du salon! 🌶️
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center space-y-2"
            >
              <p className="text-2xl font-medium text-purple-700">
                Joyeux Anniversaire my Love !
              </p>
              <p className="text-lg text-purple-600">
                J&apos;espère que cette chasse au trésor a rendu ta journée
                spéciale ! 🎁
              </p>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-2xl text-center font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent pt-4"
            >
              Avec tout mon amour ❤️
            </motion.p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
