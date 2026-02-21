//test-midi-controller.js 11:25 editing high notes iteration
const delay = 344; // milliseconds between notes
let midiOutput = null;

navigator.requestMIDIAccess().then((access) => { // navigator.requestMIDIAccess().then(access => {
  const outputs = access.outputs.values();
  midiOutput = outputs.next().value; //or access.outputs.values(); //per mdn web midi api

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


function sendArp() { //removed pitchArray and baseDelay from args //previously instructed to  = [205, 136, 222, 136, 205, 342]
  let currentTime = 0;
  let transposition = 0;
  const times = 32;
  const pitchArray = createRandomPitchArray(6, 24, 37);
  const rhythmPattern = [205, 136, 222, 136, 205, 342];
  const transpositions = Array.from({ length: 6 }, () => //changed from length: 5
    pitchArray[Math.floor(Math.random() * pitchArray.length)]
  );

    // Send program change before verse
  sendProgramChange();

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

document.getElementById("noteArp").addEventListener("click", () => sendArp()); //() => {const pitchArray = createRandomPitchArray(6, 24, 37); //sendArp(times, pitchArray);});//removed delay as an argument


function randSong() {
  const delayPerNote = 250;

  const verseNotes = 32;
  const chorusNotes = 32;
  const bridgeNotes = 32;

  const versePitches = createRandomPitchArray(6, 40, 60);    // Mid range
  const chorusPitches = createRandomPitchArray(6, 60, 80);   // Higher range
  const bridgePitches = createRandomPitchArray(6, 32, 50);   // Lower range

  const verseDuration = verseNotes * delayPerNote;
  const chorusDuration = chorusNotes * delayPerNote;

  // Fixed rhythmic pattern of 1/8 notes
  const rhythmPattern = [delayPerNote];

  // Send program change before verse, currently used in sendArp instead
  //sendProgramChange();
  
  // Reuse sendArp but with rhythmPattern override
  sendArp(verseNotes, versePitches, rhythmPattern);

  setTimeout(() => {
    sendArp(chorusNotes, chorusPitches, rhythmPattern);
  }, verseDuration);

  setTimeout(() => {
    sendArp(bridgeNotes, bridgePitches, rhythmPattern);
  }, verseDuration + chorusDuration);
}

document.getElementById("randSong").addEventListener("click", randSong);

function sendNote(channel = 0, pitch = randRange(32, 85), velocity = randRange(32, 73)) {
  if (!midiOutput) return;
  if (pitch < 0 || pitch > 127) return;
  midiOutput.send([0x90 + channel, pitch, velocity]);
  setTimeout(() => {
    midiOutput.send([0x80 + channel, pitch, 0]);
  }, 344);
}
document.getElementById("sendNote").addEventListener("click", () => sendNote());

function sendCC(channel = 0, ccNum = 74, ccValue = Math.floor(Math.random() * 128)) {
  if (!midiOutput) return;
  midiOutput.send([0xB0 + channel, ccNum, ccValue]);
}
document.getElementById("sendCC").addEventListener("click", () => sendCC());

function sendBankSelect(channel = 0, bankNum = Math.floor(Math.random() * 5)) {
  if (!midiOutput) return;
  midiOutput.send([0xB0 + channel, 0, 0]);
  midiOutput.send([0xB0 + channel, 32, bankNum]);
}
document.getElementById("sendBankSelect").addEventListener("click", () =>sendBankSelect());

function sendProgramChange(channel = 0, bankNum = Math.floor(Math.random() * 5), programNum = Math.floor(Math.random() * 128)) {
  if (!midiOutput) return;
  midiOutput.send([0xB0 + channel, 0, 0]);
  midiOutput.send([0xB0 + channel, 32, bankNum]);
  midiOutput.send([0xC0 + channel, programNum]);
}
document.getElementById("sendProgramChange").addEventListener("click", () => sendProgramChange());


function sendChordWithSustain() {
  if (!midiOutput) {
    console.warn("No MIDI output available.");
    return;
  }

  const pitchArray = createRandomPitchArray(6, 24, 37);
  const basePitch = pitchArray[Math.floor(Math.random() * pitchArray.length)]; //old pitchArray[Math.floor(Math.random() * pitchArray.length)];
  const chordType = Math.random() < 0.5 ? 2 : 3;
  const intervals = pitchArray;//[0, 4, 7, 8, 10]; changed from cheap house to pitchArray eu de cologne
  const selected = [];

  while (selected.length < chordType) {
    const interval = intervals[Math.floor(Math.random() * intervals.length)];
    const note = basePitch + interval;
    if (note <= 127 && !selected.includes(note)) selected.push(note);
  }

  const sustainValue = randRange(108, 126);
  midiOutput.send([0xB0, 64, sustainValue]);

  selected.forEach(pitch => {
    midiOutput.send([0x90, pitch, 73]);
  });

  setTimeout(() => {
    selected.forEach(pitch => {
      midiOutput.send([0x80, pitch, 0]);
    });
    midiOutput.send([0xB0, 64, 0]);
  }, 4000);
}

document.getElementById("sendChordWithSustain").addEventListener("click", () => sendChordWithSustain());


  // NASA data sonification
// Mars data that lends itself to rhythmic character

function normalizeToPitchRange(values, minPitch = 36, maxPitch = 84) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map(v =>
    Math.round(minPitch + ((v - min) / (max - min)) * (maxPitch - minPitch))
  );
}

 // Mars orbital speed data (km/s approximations)
// Sampled every 14 days: Jan 2020 - Jan 2021 (COVID pandemic period)
const MARS_26 = [
  24.1, 23.8, 23.4, 23.0, 22.6, 22.3, 22.1, 22.0,
  22.0, 22.1, 22.3, 22.6, 23.0, 23.4, 23.8, 24.1,
  24.5, 24.9, 25.2, 25.5, 25.7, 25.9, 26.1, 26.3,
  26.4, 26.5
];

// Same period sampled every 28 days: 13 points — one bar of 13/8
const MARS_13 = [
  24.1, 23.4, 22.6, 22.1, 22.0, 22.3, 23.0,
  23.8, 24.5, 25.2, 25.7, 26.1, 26.4
];

function playNasaTrack() {
  if (!midiOutput) {
    console.warn("No MIDI output available.");
    return;
  }

  // Pick one of the two arrays at random
  const dataset = Math.random() < 0.5 ? MARS_26 : MARS_13;
  const label = dataset.length === 26 ? "Mars 26-step" : "Mars 13-step";
  console.log(`Playing: ${label} (COVID period Jan 2020 - Jan 2021)`);

  const pitches = normalizeToPitchRange(dataset, 36, 84);
  const noteDuration = 350;

  console.log("Pitches:", pitches);

  pitches.forEach((pitch, i) => {
    setTimeout(() => {
      sendNote(0, pitch, randRange(48, 80));
    }, i * noteDuration);
  });
}

document.getElementById("playNasa").addEventListener("click", playNasaTrack);
