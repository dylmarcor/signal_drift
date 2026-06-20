"use client";

import { useRef, useState } from "react";
import { SignalEvent, SignalSynth } from "@/src/lib/audio/SignalSynth";
import { SpectrumVisualizer } from "@/src/components/SpectrumVisualizer";

function createMockSignal(): SignalEvent {
  return {
    source: Math.random() > 0.75 ? "ais" : "adsb",
    altitude: Math.floor(Math.random() * 40000),
    speed: Math.floor(80 + Math.random() * 520),
    heading: Math.floor(Math.random() * 360),
    signalStrength: Math.floor(-85 + Math.random() * 65),
  };
}

export default function Home() {
  const synthRef = useRef<SignalSynth | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [running, setRunning] = useState(false);
  const [lastSignal, setLastSignal] = useState<SignalEvent | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

async function start() {
  if (!synthRef.current) {
    synthRef.current = new SignalSynth();
  }

  await synthRef.current.start();
  setAnalyser(synthRef.current.getAnalyser());

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

  if (!wsUrl) {
    throw new Error("Missing NEXT_PUBLIC_WS_URL");
  }

  const socket = new WebSocket(wsUrl);

  socket.onmessage = (message) => {
    const signal: SignalEvent = JSON.parse(message.data);
    synthRef.current?.triggerSignal(signal);
    setLastSignal(signal);
  };

  wsRef.current = socket;
  setRunning(true);
}

  async function stop() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    await synthRef.current?.stop();
    setRunning(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">Signal Drift</h1>

        <p className="mt-4 text-neutral-400">
          Mock radio events are translated into pitch, pan, filter movement,
          and ambient delay.
        </p>
      </div>

      <button
        onClick={running ? stop : start}
        className="rounded-full border border-neutral-700 px-6 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition"
      >
        {running ? "Stop Signal Stream" : "Start Signal Stream"}
      </button>

      <SpectrumVisualizer analyser={analyser} />

      <div className="w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <h2 className="mb-3 text-sm uppercase tracking-widest text-neutral-500">
          Last Signal Event
        </h2>

        <pre className="overflow-auto text-sm text-neutral-300">
          {lastSignal ? JSON.stringify(lastSignal, null, 2) : "No signal yet."}
        </pre>
      </div>
    </main>
  );
}