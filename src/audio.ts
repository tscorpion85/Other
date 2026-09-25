import { DrumMachine, Soundfont, ElectricPiano } from "smplr";
import type { NoteEvent } from "./music/types";

type SmplrInstrument={ready:Promise<void>;start:(args:any)=>unknown;output:{volume:number}};

export class AudioPerformer{
 private ctx?:AudioContext;private drums?:SmplrInstrument;private bass?:SmplrInstrument;private keys?:SmplrInstrument;private lead?:SmplrInstrument;
 private startedAt=0;private beatOffset=0;bpm=104;private loading?:Promise<void>;
 async start(beat:number,bpm:number){this.ensure();await this.ctx!.resume();await this.loading;this.startedAt=this.ctx!.currentTime+.12;this.beatOffset=beat;this.bpm=bpm}
 setTempo(bpm:number){this.bpm=bpm}
 stop(){this.ctx?.close();this.ctx=undefined;this.loading=undefined}
 schedule(events:NoteEvent[]){if(!this.ctx)return;for(const e of events){const t=this.startedAt+(e.beat-this.beatOffset)*60/this.bpm;const dur=e.duration*60/this.bpm;const vel=Math.round(Math.max(1,Math.min(127,e.velocity*127)));if(e.channel==="drums"){const name=e.note===36?"kick":e.note===38?"snare":e.note===46?"open-hat":"closed-hat";this.drums?.start({note:name,time:t,velocity:vel})}else if(e.channel==="bass")this.bass?.start({note:e.note,time:t,duration:dur,velocity:vel});else if(e.channel==="lead")this.lead?.start({note:e.note,time:t,duration:dur,velocity:vel});else this.keys?.start({note:e.note,time:t,duration:dur,velocity:Math.min(105,vel)})}}
 private ensure(){if(this.ctx)return;const c=this.ctx=new AudioContext();this.drums=new DrumMachine(c,{instrument:"TR-808",volume:105}) as unknown as SmplrInstrument;this.bass=new Soundfont(c,{instrument:"electric_bass_finger",kit:"FluidR3_GM",volume:95}) as unknown as SmplrInstrument;this.keys=new ElectricPiano(c,{instrument:"WurlitzerEP200",volume:78}) as unknown as SmplrInstrument;this.lead=new Soundfont(c,{instrument:"muted_guitar",kit:"FluidR3_GM",volume:88}) as unknown as SmplrInstrument;this.loading=Promise.all([this.drums.ready,this.bass.ready,this.keys.ready,this.lead.ready]).then(()=>undefined)}
}