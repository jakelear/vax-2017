/*
* https://github.com/cwilso/volume-meter
*/
export default class CameraAudio {
  constructor(scene) {
    this.scene = scene;
    return this;
  }

  enable() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();

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
      }, this.streamGenerated.bind(this), this.streamGenerationFailed.bind(this));
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
  }

  disable() {
    if (this.loop) {
      window.cancelAnimationFrame(this.loop);
      this.loop = undefined;
      this.audioContext = undefined;
    }
  }

  streamGenerationFailed() {
    console.log('Audio stream generation failed');
  }

  streamGenerated(stream) {
    // Create a new volume meter and connect it.
    this.meter = this.createAudioMeter(this.audioContext);
    var mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
    mediaStreamSource.connect(this.meter);

    // kick off the visual updating
    this.drawLoop();
  }

  createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
    var processor = audioContext.createScriptProcessor(512);
    processor.onaudioprocess = this.volumeAudioProcess;
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

  volumeAudioProcess( event ) {
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

  drawLoop(time) {
    this.scene.setAmplitude(this.meter.volume * 4);
    this.loop = window.requestAnimationFrame( this.drawLoop.bind(this) );
  }
}
