// Assets
require("../assets/cityscape.mp4");
require("../assets/noise.png");

// Vendor Libs
import * as dat from './vendor/dat.gui';

// Classes
import Scene from './scene';
import CameraAudio from './camera_audio';
import CameraVideo from './camera_video';

// Shaders
import rgbShift from './shaders/rgb_shift.glsl'
import cellShading from './shaders/cell_shading.glsl'
import videoIntensity from './shaders/video_intensity.glsl'
import distortion from './shaders/distortion.glsl'

var container = document.getElementById("container");
var settings;

window.onload = function() {
  // GUI Setup
  class Settings {
    constructor() {
      this.microphoneControl = false;
      this.useWebcam = false;
      this.intensity = 0.00;
      this.shader = distortion;
    }
  }
  settings = new Settings();
  var gui = new dat.GUI();
  var webcam_control    = gui.add(settings, 'useWebcam');
  var audio_control = gui.add(settings, 'microphoneControl');
  var intensity_control = gui.add(settings, 'intensity', 0, 2).step(0.02);
  var shader_selector   = gui.add(settings, 'shader',
    {
      'Distortion': distortion,
      'RGB Shift': rgbShift,
      'Cell Shading': cellShading,
      'Video Intensity Visualization': videoIntensity
    }
  );
  // End GUI Setup

  // Setup Scene
  var scene = Scene.start(container, settings.shader);

  // Shader Selector
  // When shader selector is changed, instanciate a new scene using that shader
  shader_selector.onChange(function(shader) {
    // Set the new shader as the fragmentShader for the scene
    scene.fragmentShader = shader;

    // Then refresh the material and geometry
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

  webcam_control.onChange(function(useWebcam) {
    if (useWebcam) {
      var camera = new CameraVideo(scene);
    } else {
      var video = document.querySelector('video');
      video.src = '/assets/cityscape.mp4';
    }
  });

  intensity_control.onChange(function(value) {
    if (!settings.microphoneControl) {
      scene.setAmplitude(settings.intensity);
    }
  });

}
