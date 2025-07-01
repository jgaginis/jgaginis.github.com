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




