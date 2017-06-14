// Assets
require("../assets/cityscape.mp4");
require("../assets/noise.png");

// Vendor Libs
import * as dat from './vendor/dat.gui';

// Classes
import Scene from './scene';
import CameraAudio from './camera_audio';

// Shaders
import rgbShift from './shaders/rgb_shift.glsl'
import cellShading from './shaders/cell_shading.glsl'

var container = document.getElementById("container");
var settings;

window.onload = function() {
  // GUI Setup
  class Settings {
    constructor() {
      this.microphoneControl = false;
      this.intensity = 0.00;
      this.shader = rgbShift;
    }
  }
  settings = new Settings();
  var gui = new dat.GUI();

  var audio_control     = gui.add(settings, 'microphoneControl');
  var intensity_control = gui.add(settings, 'intensity', 0, 2).step(0.02);
  var shader_selector   = gui.add(settings, 'shader', { 'RGB Shift': rgbShift, 'Cell Shading': cellShading } );
  // End GUI Setup

  // Setup Scene
  var scene = Scene.start(container, settings.shader);

  // Shader Selector
  // When shader selector is changed, instanciate a new scene using that shader
  shader_selector.onChange(function(shader) {
    //scene.destroy();
    scene.fragmentShader = shader;
    scene.setupMaterial();
    scene.updateGeometry();
  });

  // Audio Control Setup
  var audio = new CameraAudio(scene);
  audio_control.onChange(function(value) {
    if (settings.microphoneControl) {
      scene.setAmplitude(0);
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
