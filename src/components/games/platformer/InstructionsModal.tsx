"use client";

import { motion, AnimatePresence } from "framer-motion";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="bg-purple-400/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border-2 border-white/30 w-[800px]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">🎮</span> Comment Jouer
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {/* Controls row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <span className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold min-w-[100px] text-center text-xl">
                    ←/→
                  </span>
                  <span className="text-white text-xl">Se déplacer</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold min-w-[100px] text-center text-xl">
                    ↑/ESPACE
                  </span>
                  <span className="text-white text-xl">Sauter</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold min-w-[100px] text-center text-xl">
                    ↑/↓
                  </span>
                  <span className="text-white text-xl">Grimper</span>
                </div>
              </div>

              {/* Items row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <span className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold min-w-[100px] text-center text-xl">
                    💎
                  </span>
                  <span className="text-white text-xl">Objets magiques</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold min-w-[100px] text-center text-xl">
                    💝
                  </span>
                  <span className="text-white text-xl">
                    Souvenirs d&apos;amour
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
