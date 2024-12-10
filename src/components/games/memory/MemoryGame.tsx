"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MemoryItem {
  content: string;
  memory: string;
}

interface CardState {
  memoryItem: MemoryItem;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onComplete: () => void;
}

// Original memory items (just 6 items, we'll create pairs from these)
const MEMORY_ITEMS: MemoryItem[] = [
  { content: "🎭", memory: "Notre premier rendez-vous au théâtre" },
  { content: "🌺", memory: "La fleur que tu m'as offerte" },
  { content: "🎪", memory: "Cette soirée magique à la fête foraine" },
  { content: "🌙", memory: "Notre soirée à regarder les étoiles sur la plage" },
  { content: "🎸", memory: "Ton magnifique concert" },
  { content: "🎨", memory: "Notre cours de peinture ensemble" },
];

export default function MemoryGame({
  onComplete,
}: MemoryGameProps): React.JSX.Element {
  // State for all cards
  const [cards, setCards] = useState<CardState[]>([]);
  // Track currently flipped card indices
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  // Lock the game while processing
  const [isLocked, setIsLocked] = useState(false);

  // Initialize game
  useEffect(() => {
    // Create pairs of cards and shuffle them
    const cardPairs = [...MEMORY_ITEMS, ...MEMORY_ITEMS]
      .sort(() => Math.random() - 0.5)
      .map((item) => ({
        memoryItem: item,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(cardPairs);
  }, []);

  // Handle card click
  const handleCardClick = (index: number) => {
    // Prevent clicks if game is locked or card is already flipped/matched
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    // Flip the clicked card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    // Handle the flip logic
    if (flippedIndices.length === 0) {
      // First card of the pair
      setFlippedIndices([index]);
    } else {
      // Second card of the pair
      const firstIndex = flippedIndices[0];
      const secondIndex = index;

      // Lock the game while processing
      setIsLocked(true);

      // Check if cards match
      if (
        cards[firstIndex].memoryItem.content ===
        cards[secondIndex].memoryItem.content
      ) {
        // Match found
        setTimeout(() => {
          const newCards = [...cards];
          newCards[firstIndex].isMatched = true;
          newCards[secondIndex].isMatched = true;
          setCards(newCards);
          setFlippedIndices([]);
          setIsLocked(false);

          // Check if game is complete
          if (newCards.every((card) => card.isMatched)) {
            onComplete();
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          const newCards = [...cards];
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards(newCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className="aspect-square cursor-pointer perspective-1000"
            whileHover={
              !isLocked && !card.isFlipped && !card.isMatched
                ? { scale: 1.05 }
                : {}
            }
            onClick={() => handleCardClick(index)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 transform-gpu preserve-3d ${
                card.isFlipped || card.isMatched ? "rotate-y-180" : ""
              }`}
            >
              {/* Front of card */}
              <div className="absolute w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-6xl shadow-lg backface-hidden">
                ?
              </div>
              {/* Back of card */}
              <div className="absolute w-full h-full bg-white rounded-xl flex flex-col items-center justify-center p-4 shadow-lg backface-hidden rotate-y-180">
                <span className="text-6xl mb-4">{card.memoryItem.content}</span>
                <p className="text-lg text-center text-purple-600 font-medium">
                  {card.memoryItem.memory}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
