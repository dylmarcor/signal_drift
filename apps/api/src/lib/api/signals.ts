import { SignalEvent } from "@/lib/audio/SignalSynth";

export async function fetchMockSignal(): Promise<SignalEvent> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_URL");
  }

  const response = await fetch(`${apiUrl}/signals/mock`);

  if (!response.ok) {
    throw new Error(`Failed to fetch mock signal: ${response.status}`);
  }

  return response.json();
}
