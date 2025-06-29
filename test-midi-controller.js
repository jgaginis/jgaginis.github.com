//test-midi-controller.js
let midiOutput = null;

navigator.requestMIDIAccess().then(access => {
  const outputs = access.outputs.values();
  midiOutput = outputs.next().value;

  if (!midiOutput) {
    console.error("No MIDI output devices found.");
  }
});

function sendNote(channel = 0, pitch = Math.floor(Math.random() * (((84 - 36) + 1) + 36)), velocity = Math.floor(Math.random() * (((72 - 32) + 1) + 32) {
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
