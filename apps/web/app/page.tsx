"use client";

import { useRef, useState } from "react";
import { SignalSynth } from "@/src/lib/audio/SignalSynth";

export default function Home() {
  const synthRef = useRef<SignalSynth | null>(null);
  const [running, setRunning] = useState(false);

  async function toggleAudio() {
    if (!synthRef.current) {
      synthRef.current = new SignalSynth();
    }

    if (running) {
      await synthRef.current.stop();
      setRunning(false);
    } else {
      await synthRef.current.start();
      setRunning(true);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">Signal Drift</h1>

        <p className="mt-4 text-neutral-400">
          A browser-based ambient instrument for radio signal data.
        </p>
      </div>

      <button
        onClick={toggleAudio}
        className="rounded-full border border-neutral-700 px-6 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition"
      >
        {running ? "Stop Drone" : "Start Drone"}
      </button>
    </main>
  );
}