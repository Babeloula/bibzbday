"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TriviaGameProps {
  onComplete: () => void;
}

const QUESTIONS: TriviaQuestion[] = [
  {
    question: "Where did we have our first date?",
    options: [
      "At a coffee shop",
      "At the theater",
      "In a restaurant",
      "In the park",
    ],
    correctAnswer: 1,
    explanation: "We watched that amazing play together at the theater! 🎭",
  },
  {
    question: "What was the first gift I gave you?",
    options: ["A book", "A necklace", "A flower", "A chocolate box"],
    correctAnswer: 2,
    explanation: "A beautiful flower that you kept for weeks! 🌺",
  },
  {
    question: "What was playing during our first dance?",
    options: [
      "Perfect by Ed Sheeran",
      "All of Me by John Legend",
      "At Last by Etta James",
      "Thinking Out Loud by Ed Sheeran",
    ],
    correctAnswer: 0,
    explanation: 'Ed Sheeran\'s "Perfect" - our perfect moment! 💃',
  },
  {
    question: "Where did we have our first kiss?",
    options: [
      "Under the stars",
      "In the rain",
      "At your doorstep",
      "By the beach",
    ],
    correctAnswer: 0,
    explanation: "That magical night under the starlit sky! ✨",
  },
  {
    question: "What did we cook together on our first dinner date at home?",
    options: ["Pizza", "Pasta", "Sushi", "Tacos"],
    correctAnswer: 1,
    explanation: "That delicious homemade pasta we made together! 🍝",
  },
];

export function TriviaGame({ onComplete }: TriviaGameProps): React.JSX.Element {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple answers

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === QUESTIONS[currentQuestion].correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        onComplete();
      }
    }, 2000);
  };

  const question = QUESTIONS[currentQuestion];

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Progress bar */}
      <div className="w-full h-2 bg-purple-100 rounded-full mb-8">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-500"
          style={{
            width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
          }}
        />
      </div>

      {/* Score */}
      <div className="text-right mb-4 text-purple-600 font-medium">
        Score: {score}/{QUESTIONS.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="space-y-6"
        >
          {/* Question */}
          <h2 className="text-2xl font-bold text-purple-800 text-center">
            {question.question}
          </h2>

          {/* Options */}
          <div className="grid gap-4">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                className={`p-4 rounded-xl text-left text-lg font-medium shadow transition-all
                  ${
                    selectedAnswer === null
                      ? "bg-white hover:bg-purple-50"
                      : selectedAnswer === index
                      ? isCorrect
                        ? "bg-green-100 border-2 border-green-500"
                        : "bg-red-100 border-2 border-red-500"
                      : index === question.correctAnswer &&
                        selectedAnswer !== null
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-white opacity-50"
                  }
                `}
                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                onClick={() => handleAnswer(index)}
              >
                {option}
              </motion.button>
            ))}
          </div>

          {/* Explanation */}
          {selectedAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-center text-lg ${
                isCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isCorrect ? "✨ Correct! " : "❌ Not quite. "}
              {question.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
