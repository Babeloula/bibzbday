"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "HBBibouche<3") {
      router.push("/home");
    } else {
      setError("Mot de passe incorrect");
      setPassword("");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-purple-800"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          Helloooo you !
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-lg overflow-hidden"
        >
          <Image
            src="/assets/photos/password.jpg"
            alt="Photo de bienvenue"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.p className="text-xl md:text-2xl text-purple-600">
            Mot de passe svp
          </motion.p>

          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none"
              placeholder="Ton mot de passe..."
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <motion.button
            type="submit"
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Entrer →
          </motion.button>
        </motion.form>
      </motion.div>
    </main>
  );
}
