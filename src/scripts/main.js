require("../assets/cityscape.mp4");
require("../assets/noise.png");

import * as dat from './vendor/dat.gui';
import Scene from './scene'

var container = document.getElementById("container");
var scene = Scene.start(container);
var settings;

/////////////////////////////
/////////////////////////////
/////////////////////////////
var audioContext = null;
var meter = null;
var WIDTH=500;
var HEIGHT=50;
var rafID = null;

window.onload = function() {
    // Setup DAT.GUI
    var Controls = function() {
      this.microphoneControl = false;
      this.intensity = 0.00;
      //this.play = function() { };
    };

    settings = new Controls();
    var gui = new dat.GUI();
    gui.add(settings, 'microphoneControl');
    //gui.add(settings, 'play');
    gui.add(settings, 'intensity', 0, 2).step(0.02);


    // Eend DAT.GUI Setup

    // Begin Web Audio Stuff
    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // grab an audio context
    audioContext = new AudioContext();

    // Attempt to get audio input
    try {
        // monkeypatch getUserMedia
        navigator.getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, didntGetStream);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }

}


function didntGetStream() {
    alert('Stream generation failed.');
}

var mediaStreamSource = null;

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // kick off the visual updating
    drawLoop();
}

function drawLoop( time ) {
    //console.log(meter.volume);
    if (settings.microphoneControl) {
      scene.sendAudio(meter.volume * 4);
    } else {
      scene.sendIntensity(settings.intensity);
    }

    // set up the next visual callback
    rafID = window.requestAnimationFrame( drawLoop );
}


function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
  var processor = audioContext.createScriptProcessor(512);
  processor.onaudioprocess = volumeAudioProcess;
  processor.clipping = false;
  processor.lastClip = 0;
  processor.volume = 0;
  processor.clipLevel = clipLevel || 0.98;
  processor.averaging = averaging || 0.95;
  processor.clipLag = clipLag || 750;

  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  processor.connect(audioContext.destination);

  processor.checkClipping =
    function(){
      if (!this.clipping)
        return false;
      if ((this.lastClip + this.clipLag) < window.performance.now())
        this.clipping = false;
      return this.clipping;
    };

  processor.shutdown =
    function(){
      this.disconnect();
      this.onaudioprocess = null;
    };

  return processor;
}

function volumeAudioProcess( event ) {
  var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
  var sum = 0;
    var x;

  // Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
      x = buf[i];
      if (Math.abs(x)>=this.clipLevel) {
        this.clipping = true;
        this.lastClip = window.performance.now();
      }
      sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
  }

