'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br from-gray-950 via-purple-950 to-indigo-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.3),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.3),transparent_40%)]" />

      <motion.div
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-purple-700 blur-[140px] opacity-30"
        animate={{ y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-700 blur-[140px] opacity-30"
        animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="z-10 flex flex-col items-center text-center space-y-8 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-extrabold tracking-tight bg-linear-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
            ONYX
          </h1>
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
            Welcome to <span className="text-violet-400">Onyx</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            Explore decentralized markets, swaps, and analytics — built for the next era of Web3 trading.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            className="rounded-full bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg"
          >
            Launch DEX
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-violet-400 text-violet-300 hover:bg-violet-900/30 px-8 py-6 text-lg"
          >
            View Portfolio
          </Button>
        </motion.div>
      </main>

      <footer className="absolute bottom-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Onyx — A Web3 Portfolio Experience
      </footer>
    </section>
  );
}
