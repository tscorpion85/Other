import { advance, composePhrase, createSession, direct } from "./music/engine";
import type { Direction, SessionState } from "./music/types";
import { AudioPerformer } from "./audio";

let state: SessionState = createSession();
let running = false;
let timer: number | undefined;
const audio = new AudioPerformer();
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function render(message?: string) {
  $("section").textContent = state.section;
  $("bar").textContent = String(Math.floor(state.beat / 4) + 1);
  $("motif").textContent = state.motif.degrees.join(" · ");
  $("kept").textContent = String(state.kept.length);
  ($("energy") as HTMLProgressElement).value = state.energy;
  ($("tension") as HTMLProgressElement).value = state.tension;
  if (message) $("message").textContent = message;
}

function scheduleNext() {
  if (!running) return;
  const events = composePhrase(state, 2);
  audio.schedule(events);
  state = advance(state, events, 2);
  render();
  timer = window.setTimeout(scheduleNext, (8 * 60 / state.bpm) * 1000 - 120);
}

async function play() {
  if (running) return;
  running = true;
  $("play").setAttribute("disabled", "");
  $("stop").removeAttribute("disabled");
  $("status").textContent = "PERFORMING";
  await audio.start(state.beat, state.bpm);
  scheduleNext();
  render("OTHER is performing. Direct the same musical timeline.");
}

function stop() {
  running = false;
  if (timer) clearTimeout(timer);
  audio.stop();
  $("play").removeAttribute("disabled");
  $("stop").setAttribute("disabled", "");
  $("status").textContent = "PAUSED";
  render("Paused. Press Play to continue from the current musical state.");
}

function command(direction: Direction) {
  state = direct(state, direction);
  const messages: Record<Direction,string> = {
    keep: "★ OTHER remembered the current motif.",
    more: "MORE: developing the idea and raising intensity.",
    less: "LESS: stripping the arrangement back without abandoning it.",
    change: "CHANGE: moving into a related but contrasting section."
  };
  render(messages[direction]);
}

$("play").addEventListener("click", play);
$("stop").addEventListener("click", stop);
$("keep").addEventListener("click", () => command("keep"));
$("more").addEventListener("click", () => command("more"));
$("less").addEventListener("click", () => command("less"));
$("change").addEventListener("click", () => command("change"));
render();
