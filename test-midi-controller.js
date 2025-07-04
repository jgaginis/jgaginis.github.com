//test-midi-controller.js
const times = 32;//
const delay = 375; // milliseconds between notes
const pitchArray = createRandomPitchArray(6, 32, 85);
const rhythmPattern = [205, 136, 222, 136, 205, 342];//also liked 375, and 410 for the last value

let midiOutput = null;

navigator.requestMIDIAccess().then(access => {
  const outputs = access.outputs.values();
  midiOutput = outputs.next().value;

  if (!midiOutput) {
    console.error("No MIDI output devices found.");
  }
});

function createRandomPitchArray(count, min, max) {
  return Array.from({ length: count }, () => randRange(32, 85));
}

function randRange(min, max) {
   const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function sendArp(times, delay, pitchArray) {
  let currentTime = 0;
  let transposition = 0;
  const transpositions = Array.from({ length: 4 }, () => // Choose 4 random transpositions from pitchArray
        pitchArray[Math.floor(Math.random() * pitchArray.length)]
      );
  
  for(let i = 0; i < times; i++) {
      const delay = rhythmPattern[Math.floor(Math.random() * rhythmPattern.length)];//setTimeout(() => {
      const pitch = pitchArray[i % pitchArray.length]; // cycle through array 
      
         // Update transposition every 8 notes
    if (i % 8 === 0 && i / 8 < transpositions.length) {
      transposition = transpositions[Math.floor(i / 8)];
    }

    // Get the pitch with transposition
    const basePitch = pitchArray[i % pitchArray.length];
    const shiftedPitch = basePitch + transposition;
    
      setTimeout(() => {
      sendNote(0, shiftedPitch, 36);//previously channel 0, *pitch is now shiftedPitch velocity 36
    }, currentTime); //previously i * currentTime in this line 

    currentTime += delay;
  }
}

document.getElementById("noteArp").addEventListener("click", () => {
  const pitchArray = createRandomPitchArray(6, 32, 85);
  sendArp(times, delay, pitchArray);
});



function sendNote(channel = 0, pitch = randRange(32, 85), velocity = randRange(32, 73)) {
  if (!midiOutput) return;
  midiOutput.send([0x90 + channel, pitch, velocity]); // Note On
  setTimeout(() => {
    midiOutput.send([0x80 + channel, pitch, 0]); // Note Off after 500ms
  }, 375);
}

function sendCC(channel = 0, ccNum = 74, ccValue = Math.floor(Math.random() * 128)) {
  if (!midiOutput) return;
  midiOutput.send([0xB0 + channel, ccNum, ccValue]); // CC message
}

function sendBankSelect(channel = 0, bankNum = Math.floor(Math.random() * 5)) {
  if (!midiOutput) return;
  midiOutput.send([0xB0 + channel, 0, 0]); // Bank Select MSB = 0
  midiOutput.send([0xB0 + channel, 32, bankNum]); // Bank Select LSB
}

function sendProgramChange(channel = 0, programNum = Math.floor(Math.random() * 128)) {
  if (!midiOutput) return;
  midiOutput.send([0xC0 + channel, programNum]);
}

//this automatically generates a thirty bar arpeggio but it needs to be a function that is triggered by a button.  maybe it should be an array that also only generates four notes? work on this tomorrow? 

function sendChordWithSustain() {
  if (!output) {
    console.warn("No MIDI output available.");
    return;
  }
  const basePitch = pitchArray[Math.floor(Math.random() * pitchArray.length)];

  // Choose dyad or triad
  const chordType = Math.random() < 0.5 ? 2 : 3;

  // Harmony intervals: could be 3rd, 5th, 7th
  const intervals = [0, 4, 7, 8, 10]; // major 3rd, perfect 5th, minor 7th
  const selected = [];

  while (selected.length < chordType) {
    const interval = intervals[Math.floor(Math.random() * intervals.length)];
    const note = basePitch + interval; //subbing pitch for note and testing
    if (!selected.includes(note)) selected.push(note);
  }

  // Sustain CC (64), value from 108 to 127
  const sustainValue = randRange(108, 128);
  output.send([0xB0, 64, sustainValue]); // 0xB0 = CC on channel 1

  // Send chord notes
  selected.forEach(pitch => {
    output.send([0x90, pitch, 84]); // Note On
  });

  // Release chord after long hold
  setTimeout(() => {
    selected.forEach(pitch => {
      output.send([0x80, pitch, 0]); // Note Off
    });
    output.send([0xB0, 64, 0]); // Turn sustain pedal off
  }, 4000); // 4 seconds
document.getElementById("send-chord").addEventListener("click", sendChordWithSustain);
}

