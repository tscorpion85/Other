import type { NoteEvent } from "./music/types";

export class AudioPerformer {
  private ctx?: AudioContext;
  private master?: GainNode;
  private compressor?: DynamicsCompressorNode;
  private startedAt = 0;
  private beatOffset = 0;

  async start(beat: number, bpm: number) {
    this.ensure();
    await this.ctx!.resume();
    this.startedAt = this.ctx!.currentTime + 0.08;
    this.beatOffset = beat;
    this.bpm = bpm;
  }

  bpm = 104;

  stop() {
    this.ctx?.close();
    this.ctx = undefined;
    this.master = undefined;
    this.compressor = undefined;
  }

  schedule(events: NoteEvent[]) {
    if (!this.ctx) return;
    for (const event of events) {
      const when = this.startedAt + (event.beat - this.beatOffset) * 60 / this.bpm;
      if (event.channel === "drums") this.drum(event.note, when, event.velocity);
      else this.tone(event.note, when, event.duration * 60 / this.bpm, event.velocity, event.channel);
    }
  }

  private ensure() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.ratio.value = 4;
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.72;
    this.compressor.connect(this.master).connect(this.ctx.destination);
  }

  private tone(note: number, when: number, duration: number, velocity: number, channel: NoteEvent["channel"]) {
    const ctx = this.ctx!, out = this.compressor!;
    const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
    const hz = 440 * 2 ** ((note - 69) / 12);
    osc.type = channel === "bass" ? "sine" : channel === "lead" ? "triangle" : "sine";
    osc.frequency.value = hz;
    filter.type = "lowpass";
    filter.frequency.value = channel === "bass" ? 500 : 2400;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(Math.max(.02, velocity * .22), when + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, when + Math.max(.08, duration));
    osc.connect(filter).connect(gain).connect(out);
    osc.start(when); osc.stop(when + duration + .03);
  }

  private drum(note: number, when: number, velocity: number) {
    const ctx = this.ctx!, out = this.compressor!;
    if (note === 36) {
      const o=ctx.createOscillator(),g=ctx.createGain(); o.frequency.setValueAtTime(130,when);o.frequency.exponentialRampToValueAtTime(42,when+.14);
      g.gain.setValueAtTime(velocity*.55,when);g.gain.exponentialRampToValueAtTime(.0001,when+.18);o.connect(g).connect(out);o.start(when);o.stop(when+.2);
    } else {
      const length=Math.floor(ctx.sampleRate*.09),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
      for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.018));
      const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=buffer;filter.type="highpass";filter.frequency.value=note===38?1200:5200;g.gain.value=velocity*.28;src.connect(filter).connect(g).connect(out);src.start(when);
    }
  }
}
