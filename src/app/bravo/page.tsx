"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

interface MemorySlide {
  imageUrl: string;
  description: string;
}

const memories: MemorySlide[] = [
  {
    imageUrl: "/assets/photos/transitionbravo1.jpg",
    description: "J'espère que tu passes un bon moment :)",
  },
  {
    imageUrl: "/assets/photos/transitionbravo2.jpg",
    description: "Mais c'est pas fini hehe",
  },
  {
    imageUrl: "/assets/photos/transitionbravo3.jpg",
    description: "Encore une dernière petite énigme pour terminer !",
  },
];

export default function MemoriesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const isLastSlide = currentSlide === memories.length - 1;

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
        >
          Bravo ma chérie !
        </motion.h1>

        <div className="relative py-8">
          <Carousel onSelect={setCurrentSlide}>
            {memories.map((memory, index) => (
              <CarouselItem key={index}>
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src={memory.imageUrl}
                      alt={`Souvenir ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl md:text-2xl text-center text-purple-700 font-medium max-w-lg"
                  >
                    {memory.description}
                  </motion.p>
                </div>
              </CarouselItem>
            ))}
          </Carousel>
        </div>

        <AnimatePresence>
          {isLastSlide && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex justify-center mt-12"
            >
              <Button
                onClick={() => router.push("/final-message")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6 text-lg rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Découvre ton énigme finale
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
