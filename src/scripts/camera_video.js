export default class CameraVideo {
  constructor(scene) {
    this.scene = scene;

    navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

    var video = document.querySelector('video');

    var errorCallback = function(e) {
      console.log('Reeeejected!', e);
    };

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio: false, video: true}, function(stream) {
        video.src = window.URL.createObjectURL(stream);
      }, errorCallback);
    } else {
      video.src = '/assets/cityscape.mp4'; // fallback.
    }

    return this;
  }
}
