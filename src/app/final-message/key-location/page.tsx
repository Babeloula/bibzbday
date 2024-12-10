"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function KeyLocationPage(): React.JSX.Element {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Start the confetti
    const duration = 20 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ["#FF69B4", "#9370DB", "#FFB6C1", "#DDA0DD"],
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Since particles fall down, start a bit higher than random
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

    // Show message after a short delay
    const messageTimer = setTimeout(() => setShowMessage(true), 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(messageTimer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl"
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-purple-800 mb-6"
            >
              🎉 Congratulations! 🎉
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-6 text-lg text-purple-700"
            >
              <p className="text-2xl font-medium">
                You&apos;ve solved the final riddle! 🌟
              </p>

              <div className="p-6 bg-purple-50 rounded-xl">
                <p className="text-xl">
                  The key to your special box is hidden...
                </p>
                <p className="text-2xl font-bold mt-4 text-purple-900">
                  In the pocket of your favorite jacket! 🧥
                </p>
              </div>

              <p className="text-xl mt-6">
                Happy Birthday! 🎂
                <br />I hope this treasure hunt made your day special! 🎁
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-purple-600 mt-8 italic"
            >
              With all my love ❤️
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
