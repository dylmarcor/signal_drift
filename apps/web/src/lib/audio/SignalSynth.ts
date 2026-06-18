export type SignalEvent = {
  source: "adsb" | "ais" | "mock";
  altitude: number;
  speed: number;
  heading: number;
  signalStrength: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function midiToHz(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export class SignalSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private droneOsc: OscillatorNode | null = null;

  async start() {
    if (this.ctx) {
      await this.ctx.resume();
      return;
    }

    this.ctx = new AudioContext();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 750;
    this.filter.Q.value = 0.8;

    const delay = this.ctx.createDelay(3);
    delay.delayTime.value = 0.45;

    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.28;

    delay.connect(feedback);
    feedback.connect(delay);

    this.filter.connect(delay);
    this.filter.connect(this.master);
    delay.connect(this.master);

    this.master.connect(this.ctx.destination);

    this.createDrone();
  }

  async stop() {
    if (!this.ctx) return;
    await this.ctx.suspend();
  }

  triggerSignal(event: SignalEvent) {
    if (!this.ctx || !this.filter) return;

    const now = this.ctx.currentTime;

    const baseMidi = clamp(36 + event.altitude / 3000, 36, 62);
    const headingOffset = (event.heading / 360) * 12 - 6;
    const frequency = midiToHz(baseMidi + headingOffset);

    const volume = clamp((event.signalStrength + 90) / 120, 0.03, 0.35);
    const duration = clamp(1.5 + event.speed / 160, 1.5, 6);

    const osc = this.ctx.createOscillator();
    osc.type = event.source === "ais" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(frequency, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const pan = this.ctx.createStereoPanner();
    pan.pan.value = clamp((event.heading - 180) / 180, -1, 1);

    osc.connect(gain);
    gain.connect(pan);
    pan.connect(this.filter);

    osc.start(now);
    osc.stop(now + duration + 0.1);

    const cutoff = clamp(500 + event.speed * 4, 500, 2800);
    this.filter.frequency.linearRampToValueAtTime(cutoff, now + 0.5);
    this.filter.frequency.linearRampToValueAtTime(750, now + duration);
  }

  private createDrone() {
    if (!this.ctx || !this.filter) return;

    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = "sawtooth";
    this.droneOsc.frequency.value = 55;

    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.13;

    this.droneOsc.connect(droneGain);
    droneGain.connect(this.filter);

    this.droneOsc.start();
  }
}