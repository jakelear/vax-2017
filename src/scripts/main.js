// Assets
require("../assets/cityscape.mp4");
require("../assets/noise.png");

// Vendor Libs
import * as dat from './vendor/dat.gui';

// Classes
import Scene from './scene';
import SceneManager from './scene_manager';
import CameraAudio from './camera_audio';

var container = document.getElementById("container");
var scene = Scene.start(container);
var settings;

window.onload = function() {
  // GUI Setup
  settings = new SceneManager();
  var gui = new dat.GUI();
  var audio_control = gui.add(settings, 'microphoneControl');
  var intensity_control = gui.add(settings, 'intensity', 0, 2).step(0.02);
  // End GUI Setup

  // Audio Control Setup
  var audio = new CameraAudio(scene);
  audio_control.onChange(function(value) {
    if (settings.microphoneControl) {
      audio.enable();
    } else {
      scene.setAmplitude(settings.intensity);
      audio.disable();
    }
  });

  intensity_control.onChange(function(value) {
    if (!settings.microphoneControl) {
      scene.setAmplitude(settings.intensity);
    }

  });

}
