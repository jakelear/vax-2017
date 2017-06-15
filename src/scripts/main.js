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
var stream_poll;

window.onload = function() {
  // GUI Setup

  // Add hide functionality for dat gui
  dat.GUI.prototype.toggleHide = function() {
    if(this.domElement.hasAttribute("hidden")) {
      this.domElement.removeAttribute("hidden");
    } else {
      this.domElement.setAttribute("hidden", true);
    }
  };


  class Settings {
    constructor() {
      this.microphoneControl = false;
      this.useWebcam = false;
      this.intensity = 0.00;
      this.shader = distortion;
      this.api_key = '';
      this.platform = 'youtube';
      this.threshold = '10';
      this.video = 'Zn9Pn1qtYpc';
      this.enableStreamControl = false;
    }
  }
  settings = new Settings();
  var gui = new dat.GUI({  width: 300 });
  var webcam_control    = gui.add(settings, 'useWebcam');
  var audio_control     = gui.add(settings, 'microphoneControl');
  var intensity_control = gui.add(settings, 'intensity', 0, 2).step(0.02).listen();
  var shader_selector   = gui.add(settings, 'shader',
    {
      'Distortion': distortion,
      'RGB Shift': rgbShift,
      'Cell Shading': cellShading,
      'Video Intensity Visualization': videoIntensity
    }
  );

  var stream_settings = gui.addFolder('Stream Settings');
  stream_settings.add(settings, 'platform', {
    'Facebook': 'facebook',
    'YouTube': 'youtube'
  });
  stream_settings.add(settings, 'api_key');
  stream_settings.add(settings, 'threshold');
  stream_settings.add(settings, 'video');
  var stream_toggle = stream_settings.add(settings, 'enableStreamControl');

  // Add g hotkey to toggle controls
  window.addEventListener('keydown', function(k) {
    switch(k.keyCode) {
        case 71:
          gui.toggleHide(gui);
      }
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

  stream_toggle.onChange(function(streamControl) {
    if (streamControl) {
      enableStreamControl();
    } else {
      disableStreamControl();
    }
  });

  var enableStreamControl = function() {
    var url;
    var success;
    switch (settings.platform) {
    case 'youtube':
      url = `https://www.googleapis.com/youtube/v3/videos?key=${settings.api_key}&id=${settings.video}&part=statistics`;
      success = function(results) {
        return getYouTubeLikes(results);
      };
      break;
    case 'facebook':
      url = `https://graph.facebook.com/v2.8/${settings.video}?fields=reactions.type(LIKE).limit(0).summary(true).as(like)&access_token=${settings.api_key}`;
      success = function(results){
        return getFacebookLikes(results);
      };
      break;
    }

    var getYouTubeLikes = function(results) {
      return results.items[0].statistics.likeCount;
    };

    var getFacebookLikes = function(results) {
      return results.like.summary.total_count;
    };

    var intensity_per_like;

    var updateLikes = function () {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = function() {
        if (xhr.status === 200) {
          var results = JSON.parse(xhr.responseText);
          console.log(intensity);
          var intensity = 2 - (intensity_per_like * success(results);
          if (intensity < 0) {
            intensity = 0;
          }
          scene.setAmplitude(intensity);
          stream_poll = setTimeout(updateLikes, 1000);
        }
        else {
            //alert('Request failed.  Returned status of ' + xhr.status);
        }
      };
      xhr.send();
    }

    if (settings.api_key && settings.video && settings.threshold) {
      intensity_per_like = (2.0 / settings.threshold); //TODO: This should use the max intensity
      updateLikes();
    }
  }

  var disableStreamControl = function() {
    scene.setAmplitude(settings.intensity);
    clearTimeout(stream_poll);
  }

}
