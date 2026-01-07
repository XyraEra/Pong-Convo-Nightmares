let synth;

function setup() {
  createCanvas(400, 400);
  background(220);
  textAlign(CENTER, CENTER);
  textSize(16);
  text('Click to start audio and play a note', width/2, height/2);

  // 1. Create a Tone.js instrument
  synth = new Tone.Synth().toDestination();
}

function draw() {
  // Your p5 graphics code goes here
}

function mousePressed() {
  // 2. Start the Tone.js AudioContext (required in modern browsers)
  // This must be triggered by a user action like a mouse click.
  if (Tone.context.state !== 'running') {
    Tone.start();
    console.log('Audio Context Started:', Tone.context.state);
    background(0, 200, 100); // Change background on start
    text('Audio Started. Playing C4.', width/2, height/2);
  }

  // 3. Play a note!
  synth.triggerAttackRelease("C4", "8n");
}