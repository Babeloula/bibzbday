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
    question: "Heyyy Mamacita ! Cómo se llaman estas damas?",
    options: [
      "Las Palenqueras",
      "Las Mariposas",
      "Las Sirenas",
      "Las Estrellas",
    ],
    correctIndex: 0,
    message: "Bravo Bibouche, eres muy fuerte",
    image: "/assets/games/trivia/trivia1.jpg",
  },
  {
    question: "Que se passe-t-il ici ?",
    options: ["Jlida", "Kbida", "Kircha", "Habiba"],
    correctIndex: 1,
    message: "AAAAAaaaaaaaannnnwww",
    image: "/assets/games/trivia/trivia2.jpg",
  },
  {
    question: "Bibouche, Je t'aime ❤️ Mais où étions-nous ?",
    options: [
      "We Love Green",
      "Peacock Society",
      "Concert de Toto",
      "Madame Loyale",
    ],
    correctIndex: 1,
    message: "Des ambiances comme on les aime",
    image: "/assets/games/trivia/trivia3.jpg",
  },
  {
    question:
      "Notre premier mariage ! Mais du coup on est marié dans quelle tribu ?",
    options: ["Arhuaco", "Wiwas", "Wayuu", "Guambianos"],
    correctIndex: 2,
    message: "Ma chérie, ma femme d'amour, je pourrais te marier 1000 fois",
    image: "/assets/games/trivia/trivia4.jpg",
  },
  {
    question: "Que demander de plus dans la vie ? Mais quel est cet endroit ?",
    options: ["Agios Georgios", "Agios Nikolaos", "Kerkyra", "Agios Bibaos"],
    correctIndex: 0,
    message: "Corfou Life",
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
