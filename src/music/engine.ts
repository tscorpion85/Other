import type { Direction, Motif, NoteEvent, SessionState } from "./types";

const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));

export function createSession(): SessionState {
  return {
    bpm: 104,
    beat: 0,
    section: "intro",
    energy: 0.35,
    tension: 0.25,
    rootMidi: 50,
    scale: [0, 2, 3, 5, 7, 9, 10],
    motif: { id: "motif-a", degrees: [0, 2, 4, 3], rhythm: [1, 0.5, 0.5, 2], weight: 1 },
    kept: [],
    events: [],
  };
}

export function direct(state: SessionState, direction: Direction): SessionState {
  const next = structuredClone(state);

  if (direction === "keep") {
    const remembered: Motif = { ...next.motif, id: `kept-${next.kept.length + 1}`, weight: 2 };
    next.kept.push(remembered);
  }

  if (direction === "more") {
    next.energy = clamp(next.energy + 0.15);
    next.tension = clamp(next.tension + 0.08);
  }

  if (direction === "less") {
    next.energy = clamp(next.energy - 0.18);
    next.tension = clamp(next.tension - 0.05);
  }

  if (direction === "change") {
    next.section = next.section === "intro" ? "a" : next.section === "a" ? "b" : "a";
    next.tension = clamp(next.tension + 0.12);
    next.motif = {
      ...next.motif,
      id: `variation-${next.beat}`,
      degrees: next.motif.degrees.map((d, i) => i < 2 ? d : d + (i % 2 ? 1 : 2)),
    };
  }

  return next;
}

function degreeToMidi(state: SessionState, degree: number): number {
  const size = state.scale.length;
  const octave = Math.floor(degree / size);
  const index = ((degree % size) + size) % size;
  return state.rootMidi + state.scale[index] + octave * 12;
}

export function composePhrase(state: SessionState, bars = 2): NoteEvent[] {
  const events: NoteEvent[] = [];
  const beats = bars * 4;

  for (let b = 0; b < beats; b++) {
    if (b % 2 === 0 || state.energy > 0.65) {
      events.push({ beat: state.beat + b, duration: 0.1, note: b % 4 === 0 ? 36 : 42, velocity: 0.6 + state.energy * 0.25, channel: "drums" });
    }
    if (b % 4 === 2) {
      events.push({ beat: state.beat + b, duration: 0.1, note: 38, velocity: 0.72, channel: "drums" });
    }
  }

  let cursor = state.beat;
  state.motif.degrees.forEach((degree, i) => {
    const duration = state.motif.rhythm[i] ?? 1;
    events.push({ beat: cursor, duration: Math.max(0.2, duration * 0.8), note: degreeToMidi(state, degree + 7), velocity: 0.55 + state.energy * 0.25, channel: "lead" });
    cursor += duration;
  });

  [0, 3, 4, 2].forEach((degree, i) => {
    events.push({ beat: state.beat + i * 2, duration: 1.5, note: degreeToMidi(state, degree - 7), velocity: 0.58 + state.energy * 0.2, channel: "bass" });
  });

  return events;
}

export function advance(state: SessionState, events: NoteEvent[], bars = 2): SessionState {
  return { ...state, beat: state.beat + bars * 4, events: [...state.events, ...events].slice(-512) };
}
