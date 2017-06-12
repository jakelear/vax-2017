require("../assets/testgl.mp4");
require("../assets/noise.png");

import RecordRTC from 'recordrtc'
import CanvasRecorder from './vendor/CanvasRecorder'
import Scene from './scene'

var container = document.getElementById("container");
var scene = Scene.start(container);

var audiocheckbox = container.querySelector('#audio-control')
audiocheckbox.addEventListener('change', onAudioCheck, false);

var startRecordBtn = container.querySelector('#start-record')
startRecordBtn.addEventListener('click', startRecord, false);

var stopRecordBtn = container.querySelector('#stop-record')
stopRecordBtn.addEventListener('click', stopRecord, false);

var canvas = document.querySelector('canvas');
var recorder = new RecordRTC.CanvasRecorder(canvas, {
    disableLogs: false
});

function startRecord() {
  recorder.record();
}

function stopRecord() {
  recorder.stop(function(blob) {
    var url = URL.createObjectURL(blob);
    window.open(url);
  });
}




/////////////////////////////
/////////////////////////////
/////////////////////////////
var audioContext = null;
var meter = null;
var WIDTH=500;
var HEIGHT=50;
var rafID = null;
let audio_control = false;

function onAudioCheck(e) {
  if (e.target.checked) {
    audio_control = true;
  } else {
    audio_control = false;
    var range = document.getElementById("heartrate");
    scene.sendAudio(range.value);
  }
};

window.onload = function() {


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
    if (audio_control) {
      scene.sendAudio(meter.volume * 4);
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

