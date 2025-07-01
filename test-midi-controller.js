//test-midi-controller.js
const times = 32;//const delay = 375; // milliseconds between notes
const pitchArray = createRandomPitchArray(6, 32, 85);
const rhythmPattern = [205, 136, 222, 136, 205, 410];

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
  for(let i = 0; i < times; i++) {
      const delay = rhythmPattern[Math.floor(Math.random() * rhythmPattern.length)];//setTimeout(() => {
      const pitch = pitchArray[i % pitchArray.length]; // cycle through array

      setTimeout(() => {
      sendNote(0, pitch, 36);//channel 0, velocity 36
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
  }, 500);
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




