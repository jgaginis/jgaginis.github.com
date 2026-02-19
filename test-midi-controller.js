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


  // NASA Horizons data sonification
// Picks a random body, fetches velocity data, maps to pitch, plays as a sequence

const HORIZONS_BODIES = [
  { name: "Mars", id: "499" },
  { name: "Jupiter", id: "599" },
  { name: "Saturn", id: "699" },
  { name: "Venus", id: "299" },
  { name: "Mercury", id: "199" },
  { name: "Titan", id: "606" },
  { name: "Europa", id: "502" },
  { name: "Io", id: "501" },
];

async function fetchHorizonsVelocity(bodyId) {
  const startDate = "2024-01-01";
  const stopDate  = "2024-04-01";
  const stepSize  = "1d"; // one data point per day (~90 points)

  const params = new URLSearchParams({
    format: "text",
    COMMAND: bodyId,
    EPHEM_TYPE: "VECTORS",
    CENTER: "500@10",
    START_TIME: "2024-01-01",
    STOP_TIME: "2024-02-01",
    STEP_SIZE: "7d",
  });
  
  const horizonsUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?${params}`;
  const response = await fetch(horizonsUrl);
  const text = await response.text();
  console.log("Raw Horizons response:", text.substring(0, 500)); // first 500 chars
  return parseHorizonsVelocities(text);
}

function parseHorizonsVelocities(text) {
  // CSV vector table columns: JDTDB, ...., VX, VY, VZ
  // We want the speed magnitude: sqrt(VX^2 + VY^2 + VZ^2)
  const lines = text.split("\n");
  const dataStart = lines.findIndex(l => l.includes("$$SOE"));
  const dataEnd   = lines.findIndex(l => l.includes("$$EOE"));

  if (dataStart === -1 || dataEnd === -1) {
    console.error("Could not find data block in Horizons response");
    console.log("Full response:", text); // log full response to inspect format
    return [];
  }

    // Log the raw data lines so we can see exact format
  console.log("Data lines:", lines.slice(dataStart, dataStart + 6));

  const speeds = [];
  // Data comes in pairs of lines in vector format; CSV rows alternate
  for (let i = dataStart + 1; i < dataEnd; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(/\s+/);
    // VECT_TABLE=1 CSV: JDTDB, Cal Date, X, Y, Z, VX, VY, VZ, ...
    if (cols.length >= 3) {
      const vx = parseFloat(cols[0]);
      const vy = parseFloat(cols[1]);
      const vz = parseFloat(cols[2]);
      if (!isNaN(vx)) {
        speeds.push(Math.sqrt(vx * vx + vy * vy + vz * vz));
      }
    }
  }
  return speeds;
}

function normalizeToPitchRange(values, minPitch = 36, maxPitch = 84) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map(v =>
    Math.round(minPitch + ((v - min) / (max - min)) * (maxPitch - minPitch))
  );
}

async function playNasaTrack() {
  if (!midiOutput) {
    console.warn("No MIDI output available.");
    return;
  }

  // Pick a random body
  const body = HORIZONS_BODIES[Math.floor(Math.random() * HORIZONS_BODIES.length)];
  console.log(`Fetching data for: ${body.name}`);

  // Optional: show which body was chosen in the UI
  const label = document.getElementById("nasaBodyLabel");
  if (label) label.textContent = `Playing: ${body.name}`;

  let speeds;
  try {
    speeds = await fetchHorizonsVelocity(body.id);
  } catch (e) {
    console.error("Horizons fetch failed:", e);
    return;
  }

  if (speeds.length === 0) {
    console.error("No speed data parsed.");
    return;
  }

  const pitches = normalizeToPitchRange(speeds, 36, 84);
  const noteDuration = 500; // slightly longer gap so 3 notes are clearly audible
  
  // Just take the first 3 pitches to confirm data is working  
    const testPitches = pitches.slice(0, 3);
  console.log("Test pitches:", testPitches); // <-- this will tell us if data is arriving
  
  testPitches.forEach((pitch, i) => {
    setTimeout(() => {
      console.log(`Sending note ${i + 1}: pitch ${pitch}`);
      sendNote(0, pitch, randRange(48, 80));
    }, i * noteDuration);
  });
}

document.getElementById("playNasa").addEventListener("click", playNasaTrack);
