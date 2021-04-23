let radius = 250,
    halfway = radius / 2,
    twoPI = 2 * Math.PI,
    angStep = twoPI / 360,
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    middleNote = [9, 4, 440], // A4
    topNote = [0, 5, 523.25], // C5
    freqScale = 1 + Math.log(2) / 12, // about 1.05776
    numOctaves = 5, // both above and below
    spiralScale = halfway / numOctaves,
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
    originX = canvas.width / 2,
    originY = canvas.height / 2;

function angToCoords(ang) {
  let rad = halfway + spiralScale * ang / twoPI,
      x = rad * Math.cos(ang + twoPI / 4),
      y = rad * Math.sin(ang + twoPI / 4);
  return [x, y];
}

// draw spiral
let coords = [[originX, originY - halfway]];

for (let ang = 0; ang < numOctaves * twoPI; ang += angStep) {
  let [upX, upY] = angToCoords(-ang),
      [downX, downY] = angToCoords(ang);

  coords.unshift([originX + downX, originY - downY]);
  coords.push([originX + upX, originY - upY]);
}

function drawSpiral() {
  ctx.beginPath();
  ctx.moveTo(coords[0][0], coords[0][1]);
  for (let index = 1; index < coords.length; index += 1) {
    ctx.lineTo(coords[index][0], coords[index][1]);
  }
  ctx.stroke();
}

// tick marks and letters
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

function drawTicks() {
  for (let tick = -numOctaves * notes.length; tick <= numOctaves * notes.length; tick += 1) {
    let ang = tick * twoPI / 12;
    let [centerX, centerY] = angToCoords(-ang),
        mag = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    let startX = (centerX / mag) * (mag - 3),
        startY = (centerY / mag) * (mag - 3),
        endX = (centerX / mag) * (mag + 3),
        endY = (centerY / mag) * (mag + 3),
        textX = (centerX / mag) * (mag - 10),
        textY = (centerY / mag) * (mag - 10);

    ctx.beginPath();
    ctx.moveTo(originX + startX, originY - startY);
    ctx.lineTo(originX + endX, originY - endY);
    ctx.stroke();

    // text
    if (tick >= -notes.length && tick <= notes.length) {
      // Fine, I'll do it myself.
      let shift = Math.abs(~~(tick / 12)) + 1,
          fake = tick + 12 * shift;

      let letter = notes[(topNote[0] + fake) % 12],
          octave = topNote[1] + ~~(fake / 12.0) - shift;

      ctx.beginPath();
      ctx.fillText(letter + octave, originX + textX, originY - textY);
    }
  }
}

ctx.strokeStyle = '#FFA';
ctx.fillStyle = '#FFA';
drawSpiral();
drawTicks();

// audio analyzation
// cribbed from here https://codepen.io/zapplebee/pen/gbNbZE

var stopLoop = false;

function soundAllowed(stream) {
  //Audio stops listening in FF without // window.persistAudioStream = stream;
  //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
  //https://support.mozilla.org/en-US/questions/984179
  window.persistAudioStream = stream;
  let audioContext = new AudioContext(),
      audioStream = audioContext.createMediaStreamSource(stream),
      analyser = audioContext.createAnalyser();
  audioStream.connect(analyser);

  analyser.fftSize = 1024 * 8;
  analyser.minDecibels = -150;
  analyser.smoothingTimeConstant = 0.2;
  let sampleRate = audioContext.sampleRate, // e.g. 48000 -> 48 kHz
      freqMul = sampleRate / analyser.fftSize * 2; // last item of array corresponds to the sample rate / 2
  console.log('freqMul', freqMul);

  let frequencyArray = new Uint8Array(analyser.frequencyBinCount),
      maxIndex = frequencyArray.length; //Math.min(frequencyArray.length, 12 * numOctaves * 2);
  function doDraw() {
    if (stopLoop)
      return
    requestAnimationFrame(doDraw);

    //ctx.globalAlpha = 1;
    ctx.strokeStyle = '#FFA';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSpiral();
    drawTicks();
    //ctx.globalAlpha = 0.3;

    let coords = [];

    analyser.getByteFrequencyData(frequencyArray);
    for (let index = 0; index < maxIndex; index += 1) {
      // draw stuff
      let ang = -twoPI * (Math.log(index * freqMul / topNote[2]) / Math.log(2) - 1);
      let [centerX, centerY] = angToCoords(ang),
          radius = frequencyArray[index] / 10,
          opacity = 0.7 * Math.log(index / maxIndex) / Math.log(1 / sampleRate);

      let mag = Math.sqrt(centerX ** 2 + centerY ** 2),
          normX = centerX / mag,
          normY = centerY / mag;

      coords.push({
        x1: originX + centerX - normX * radius / 2,
        y1: originY - centerY + normY * radius / 2,
        x2: originX + centerX + normX * radius / 2,
        y2: originY - centerY - normY * radius / 2,
        mag: frequencyArray[index],
        opa: opacity,
      });
    }

    //ctx.strokeStyle = `rgba(1, 1, 1, ${opacity})`;
    let skip = 10;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(coords[skip].x1, coords[skip].y1);

    coords.slice(skip).forEach(coord => {
      ctx.lineTo(coord.x1, coord.y1);
    });
    coords.slice(skip).reverse().forEach(coord => {
      ctx.lineTo(coord.x2, coord.y2);
    });

    ctx.lineTo(coords[skip].x2, coords[skip].y2);
    ctx.fill();
  }

  doDraw();
}

function soundNotAllowed(error) {
  console.log(error);
}

let hasPermission = false;

document.getElementById('start').addEventListener('click', () => {
  if (!hasPermission) {
    hasPermission = true;
    navigator.getUserMedia({audio: true}, soundAllowed, soundNotAllowed);
  }

  stopLoop = false;
})

document.getElementById('stop').addEventListener('click', () => {
  stopLoop = true;
})

