# OTHER Alpha Architecture

## Product rule

OTHER is a musician, not a song generator.

A performance is a single timeline. Every musical event becomes history and future decisions must account for it.

## Runtime state

The session state tracks:

- tempo and meter
- tonal center / mode
- section and phrase position
- energy and tension
- active groove
- harmonic progression
- bass motif
- lead motif
- arrangement layers
- recent events
- kept moments
- user direction

## Pipeline

### Composer
Proposes the next phrase as symbolic musical events. It works a few bars ahead of playback.

### Critic
Scores proposals for repetition, coherence, playability, groove, melodic identity, contrast, and continuity. Weak proposals are revised before performance.

### Memory
Stores short-term context plus moments explicitly marked KEEP THAT. Kept material becomes reusable musical vocabulary rather than a frozen audio clip.

### Performer
Schedules accepted events with stable timing and expressive velocity, duration, articulation, and automation. Alpha output is MIDI-like symbolic events so sound engines can be replaced independently.

## Direction controls

- KEEP THAT: promote recent phrase characteristics into memory.
- MORE: increase density/intensity and develop current material.
- LESS: remove layers and simplify while preserving identity.
- CHANGE: transition to a contrasting section derived from existing material.

## Alpha success criterion

A 60–120 second uninterrupted instrumental performance that remains coherent and interesting enough that the listener wants it to continue.
