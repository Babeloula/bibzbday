"use client";

import { useState } from "react";
import { InstructionsModal } from "./InstructionsModal";

export function InstructionsButton() {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsInstructionsOpen(true)}
        className="bg-purple-600/90 hover:bg-purple-500/90 text-white p-3 rounded-lg transition-colors"
        aria-label="Instructions"
      >
        <span className="text-white text-lg font-bold">Comment jouer ?</span>
      </button>

      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </>
  );
}
