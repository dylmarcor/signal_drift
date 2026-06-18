export class SignalSynth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;

  async start() {
    if (this.ctx) {
      await this.ctx.resume();
      return;
    }

    this.ctx = new AudioContext();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.25;
    this.master.connect(this.ctx.destination);

    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = "sawtooth";
    this.droneOsc.frequency.value = 55;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 650;
    filter.Q.value = 0.8;

    this.droneOsc.connect(filter);
    filter.connect(this.master);

    this.droneOsc.start();
  }

  async stop() {
    if (!this.ctx) return;
    await this.ctx.suspend();
  }
}