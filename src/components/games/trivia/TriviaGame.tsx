"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  message: string;
  image: string;
}

interface TriviaGameProps {
  onComplete: () => void;
}

const QUESTIONS: Question[] = [
  {
    question: "Quelle est notre chanson préférée ?",
    options: [
      "Perfect - Ed Sheeran",
      "All of Me - John Legend",
      "At Last - Etta James",
      "Thinking Out Loud - Ed Sheeran",
    ],
    correctIndex: 0,
    message: "Perfect - Notre chanson parfaite ! 💃",
    image: "/assets/games/trivia/trivia1.jpg",
  },
  {
    question: "Où était notre premier rendez-vous ?",
    options: ["Au café", "Au théâtre", "Au restaurant", "Au parc"],
    correctIndex: 1,
    message: "Cette magnifique pièce qu'on a vue ensemble ! 🎭",
    image: "/assets/games/trivia/trivia2.jpg",
  },
  {
    question: "Quel a été mon premier cadeau pour toi ?",
    options: ["Un livre", "Un collier", "Une fleur", "Une boîte de chocolats"],
    correctIndex: 2,
    message: "Une belle fleur que tu as gardée pendant des semaines ! 🌺",
    image: "/assets/games/trivia/trivia3.jpg",
  },
  {
    question: "Où était notre premier baiser ?",
    options: [
      "Sous les étoiles",
      "Sous la pluie",
      "Devant chez toi",
      "À la plage",
    ],
    correctIndex: 0,
    message: "Cette nuit magique sous les étoiles ! ✨",
    image: "/assets/games/trivia/trivia4.jpg",
  },
  {
    question: "Qu'avons-nous cuisiné ensemble la première fois ?",
    options: ["Une pizza", "Des pâtes", "Des sushis", "Des tacos"],
    correctIndex: 1,
    message: "Ces délicieuses pâtes faites maison ! 🍝",
    image: "/assets/games/trivia/trivia5.jpg",
  },
];

export default function TriviaGame({
  onComplete,
}: TriviaGameProps): React.JSX.Element {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === QUESTIONS[currentQuestion].correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

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
      <div className="w-full h-2 bg-rose-100 rounded-full mb-8">
        <div
          className="h-full bg-rose-500 rounded-full transition-all duration-500"
          style={{
            width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
          }}
        />
      </div>

      <div className="text-right mb-4 text-rose-600 font-medium">
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
          <h2 className="text-2xl font-bold text-rose-800 text-center">
            {question.question}
          </h2>

          <div className="w-[300px] h-[300px] relative rounded-lg overflow-hidden flex items-center justify-center mx-auto">
            <Image
              src={question.image}
              alt="Question illustration"
              layout="fill"
              objectFit="cover"
            />
          </div>
          {selectedAnswer !== null && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-center text-lg ${
                  isCorrect
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isCorrect ? "✨ Bravo ! " : "❌ Pas tout à fait. "}
                {question.message}
              </motion.div>
            </>
          )}

          <div className="grid gap-4">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                className={`p-4 rounded-xl text-left text-lg font-medium shadow transition-all
                  ${
                    selectedAnswer === null
                      ? "bg-white hover:bg-rose-50"
                      : selectedAnswer === index
                      ? isCorrect
                        ? "bg-green-100 border-2 border-green-500"
                        : "bg-red-100 border-2 border-red-500"
                      : index === question.correctIndex &&
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
