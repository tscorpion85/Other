import type { Direction, Motif, NoteEvent, SessionState } from "./types";

const clamp=(n:number,lo=0,hi=1)=>Math.max(lo,Math.min(hi,n));
const patterns=[
  {kick:[0,3,7,10,12],hat:[0,2,4,6,8,10,12,14]},
  {kick:[0,6,9,11,14],hat:[0,2,4,6,8,11,12,14]},
  {kick:[0,3,6,10,13],hat:[0,2,5,6,8,10,12,15]}
];

export function createSession():SessionState{return{
 bpm:104,beat:0,section:"intro",phraseIndex:0,energy:.35,tension:.25,rootMidi:50,
 scale:[0,2,3,5,7,9,10],motif:{id:"A",degrees:[0,2,4,3,2],rhythm:[.5,.5,1,.5,1.5],weight:1},
 kept:[],events:[]
}};

export function direct(state:SessionState,direction:Direction):SessionState{
 const n=structuredClone(state);
 if(direction==="keep"){n.kept.push({...n.motif,id:`kept-${n.kept.length+1}`,weight:3});n.motif.weight=Math.min(4,n.motif.weight+1)}
 if(direction==="more"){n.energy=clamp(n.energy+.18);n.tension=clamp(n.tension+.07);n.bpm=Math.min(126,n.bpm+4)}
 if(direction==="less"){n.energy=clamp(n.energy-.20);n.tension=clamp(n.tension-.06);n.bpm=Math.max(84,n.bpm-4)}
 if(direction==="change"){n.section=n.section==="b"?"a":"b";n.tension=clamp(n.tension+.16);n.bpm=n.section==="b"?Math.max(92,n.bpm-6):Math.min(122,n.bpm+6);n.motif=variation(n.motif,3+n.kept.length%2)}
 return n;
}

function variation(m:Motif,amount=1):Motif{
 const d=[...m.degrees];const pivot=Math.max(2,d.length-2);
 for(let i=pivot;i<d.length;i++)d[i]+=i%2?amount:-1;
 return {...m,id:m.id+"′",degrees:d,weight:Math.max(1,m.weight-.15)};
}
function midi(s:SessionState,d:number){const z=s.scale.length,o=Math.floor(d/z),i=((d%z)+z)%z;return s.rootMidi+s.scale[i]+12*o}
function score(candidate:Motif,current:Motif){
 const unique=new Set(candidate.degrees).size;
 const contour=candidate.degrees.slice(1).reduce((a,d,i)=>a+Math.min(3,Math.abs(d-candidate.degrees[i])),0);
 const identity=candidate.degrees.filter((d,i)=>d===current.degrees[i]).length/current.degrees.length;
 return unique*.55+contour*.18+identity*2-Math.abs(candidate.degrees.at(-1)!-candidate.degrees[0])*.08;
}
function chooseMotif(s:SessionState):Motif{
 if(s.kept.length&&s.phraseIndex%8===6)return {...s.kept[s.kept.length-1],id:"RETURN"};
 if(s.phraseIndex%8<3)return s.motif;
 const candidates=[variation(s.motif,1),variation(s.motif,2),{...s.motif,id:"A-rhythm",rhythm:[.5,1,.5,.5,1.5]}];
 return candidates.sort((a,b)=>score(b,s.motif)-score(a,s.motif))[0];
}

export function composePhrase(s:SessionState,bars=2):{events:NoteEvent[],motif:Motif}{
 const ev:NoteEvent[]=[];const motif=chooseMotif(s);const pat=patterns[Math.floor(s.phraseIndex/2)%patterns.length];
 const steps=bars*16;
 for(let x=0;x<steps;x++){
  const local=x%16,bar=Math.floor(x/16),at=s.beat+bar*4+local*.25;
  if(pat.kick.includes(local))ev.push({beat:at,duration:.08,note:36,velocity:(local===0?.9:.7)+s.energy*.08,channel:"drums"});
  if(local===4||local===12)ev.push({beat:at,duration:.08,note:38,velocity:.78+s.energy*.1,channel:"drums"});
  if(pat.hat.includes(local)&&s.energy>.2)ev.push({beat:at,duration:.05,note:42,velocity:.32+(local%4?-.05:.05)+s.energy*.12,channel:"drums"});
  if(s.energy>.68&&[7,15].includes(local))ev.push({beat:at,duration:.05,note:46,velocity:.38,channel:"drums"});
 }
 const roots=s.section==="b"?[3,0,4,2]:[0,3,4,2];
 roots.forEach((d,i)=>{
  const at=s.beat+i*2;
  ev.push({beat:at,duration:1.35,note:midi(s,d-7),velocity:.62+s.energy*.16,channel:"bass"});
  if(s.energy>.48)ev.push({beat:at+.75,duration:.55,note:midi(s,d),velocity:.38+s.energy*.12,channel:"bass"});
  if(s.energy>.58)for(const h of [d,d+2,d+4])ev.push({beat:at,duration:1.75,note:midi(s,h),velocity:.18+s.energy*.08,channel:"harmony"});
 });
 let cursor=s.beat+(s.phraseIndex%2?.5:0);
 motif.degrees.forEach((d,i)=>{const dur=motif.rhythm[i]??.5;ev.push({beat:cursor,duration:Math.max(.18,dur*.72),note:midi(s,d+7),velocity:.52+s.energy*.22+(i===0?.06:0),channel:"lead"});cursor+=dur});
 if(s.phraseIndex%4===3)ev.push({beat:s.beat+7.5,duration:.16,note:midi(s,motif.degrees[0]+9),velocity:.62,channel:"lead"});
 return {events:ev,motif};
}
export function advance(s:SessionState,events:NoteEvent[],motif:Motif,bars=2):SessionState{
 const phraseIndex=s.phraseIndex+1;let section=s.section;
 if(phraseIndex===2)section="a"; if(phraseIndex>0&&phraseIndex%8===4)section="b"; if(phraseIndex%8===6)section="a";
 return {...s,beat:s.beat+bars*4,phraseIndex,section,motif,events:[...s.events,...events].slice(-1024)};
}
