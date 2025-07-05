//test-midi-controller.js 11:25 latest iteration
const times = 36;
const delay = 350; // milliseconds between notes
let midiOutput = null;

navigator.requestMIDIAccess().then(access => {
  const outputs = access.outputs.values();
  midiOutput = outputs.next().value;

  if (!midiOutput) {
    console.error("No MIDI output devices found.");
  }
});

function createRandomPitchArray(count, min, max) {
  return Array.from({ length: count }, () => randRange(min, max));
}

function randRange(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function sendArp(times, pitchArray) { //removed baseDelay from args
  let currentTime = 0;
  let transposition = 0;
  const rhythmPattern = [205, 136, 222, 136, 205, 342];
  const transpositions = Array.from({ length: pitchArray.length }, () => //changed from length: 5
    pitchArray[Math.floor(Math.random() * pitchArray.length)]
  );

  for (let i = 0; i < times; i++) {
    const delayVal = rhythmPattern[Math.floor(Math.random() * rhythmPattern.length)];

    if (i % 8 === 0 && i / 8 < transpositions.length) {
      transposition = transpositions[Math.floor(i / 8)];
    }

    const basePitch = pitchArray[i % pitchArray.length];
    const shiftedPitch = basePitch + transposition;

    setTimeout(() => {
      sendNote(0, shiftedPitch, 64);
    }, currentTime);

    currentTime += delayVal;
  }
}

document.getElementById("noteArp").addEventListener("click", () => {
  //const pitchArray = createRandomPitchArray(6, 32, 85);
  sendArp(times, pitchArray);//removed delay as an argument
});

function sendNote(channel = 0, pitch = randRange(32, 85), velocity = randRange(32, 73)) {
  if (!midiOutput) return;
  if (pitch < 0 || pitch > 127) return;
  midiOutput.send([0x90 + channel, pitch, velocity]);
  setTimeout(() => {
    midiOutput.send([0x80 + channel, pitch, 0]);
  }, 350);
}

function sendCC(channel = 0, ccNum = 74, ccValue = Math.floor(Math.random() * 128)) {
  if (!midiOutput) return;
  midiOutput.send([0xB0 + channel, ccNum, ccValue]);
}

function sendBankSelect(channel = 0, bankNum = Math.floor(Math.random() * 5)) {
  if (!midiOutput) return;
  midiOutput.send([0xB0 + channel, 0, 0]);
  midiOutput.send([0xB0 + channel, 32, bankNum]);
}

function sendProgramChange(channel = 0, programNum = Math.floor(Math.random() * 128)) {
  if (!midiOutput) return;
  midiOutput.send([0xC0 + channel, programNum]);
}

function sendChordWithSustain() {
  if (!midiOutput) {
    console.warn("No MIDI output available.");
    return;
  }

  const pitchArray = createRandomPitchArray(6, 32, 85);
  const basePitch = pitchArray[Math.floor(Math.random() * pitchArray.length)];
  const chordType = Math.random() < 0.5 ? 2 : 3;
  const intervals = pitchArray;//[0, 4, 7, 8, 10]; changed from cheap house to pitchArray eu de cologne
  const selected = [];

  while (selected.length < chordType) {
    const interval = intervals[Math.floor(Math.random() * intervals.length)];
    const note = basePitch + interval;
    if (note <= 127 && !selected.includes(note)) selected.push(note);
  }

  const sustainValue = randRange(108, 128);
  midiOutput.send([0xB0, 64, sustainValue]);

  selected.forEach(pitch => {
    midiOutput.send([0x90, pitch, 84]);
  });

  setTimeout(() => {
    selected.forEach(pitch => {
      midiOutput.send([0x80, pitch, 0]);
    });
    midiOutput.send([0xB0, 64, 0]);
  }, 4000);
}

document.getElementById("sendChord").addEventListener("click", sendChordWithSustain);
