# OTHER

OTHER is an experimental AI musician: a continuous-performance music system that composes, remembers, evaluates, and performs rather than regenerating disconnected songs.

## Alpha goal

Press **Play** and hear a continuous evolving instrumental performance. Direct the same performance with four controls:

- **KEEP THAT** — remember the preceding musical idea and treat it as important.
- **MORE** — develop the current idea and increase intensity.
- **LESS** — strip the arrangement back without losing its identity.
- **CHANGE** — move somewhere new while preserving musical continuity.

The first alpha focuses on musical quality, continuity, MIDI output, and session memory. Vocals and the NULL artist layer come later.

## Core pipeline

`Composer -> Critic -> Memory -> Performer -> MIDI / virtual instruments`

A session has one continuous musical history. OTHER does not silently regenerate the song when something goes wrong; it must develop or recover musically from what already happened.
