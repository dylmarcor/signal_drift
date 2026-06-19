"use client";

import { useEffect, useRef } from "react";

type Props = {
  analyser: AnalyserNode | null;
};

export function SpectrumVisualizer({ analyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let animationId: number;

    function draw() {
      if (!canvasContext) return;

      analyser.getByteFrequencyData(data);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / data.length;

      for (let i = 0; i < data.length; i++) {
        const value = data[i];
        const height = (value / 255) * canvas.height;

        canvasContext.fillStyle = "rgb(220, 220, 220)";
        canvasContext.fillRect(
          i * barWidth,
          canvas.height - height,
          Math.max(1, barWidth),
          height
        );
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={240}
      className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-950"
    />
  );
}