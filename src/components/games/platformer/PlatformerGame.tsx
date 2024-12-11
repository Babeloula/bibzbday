"use client";

import { useEffect, useRef } from "react";
import { Game } from "phaser";
import { gameConfig } from "@/lib/games/platformer/config";

interface PlatformerGameProps {
  onComplete: () => void;
}

export default function PlatformerGame({ onComplete }: PlatformerGameProps) {
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !gameRef.current) {
      const config = {
        ...gameConfig,
        callbacks: {
          postBoot: (game: Game) => {
            const scene = game.scene.getScene("MainScene");
            if (scene) {
              scene.data.set("onComplete", onComplete);
            }
          },
        },
      };

      gameRef.current = new Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onComplete]);

  return null;
}
