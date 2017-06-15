export default class Settings {
  constructor() {
    this.microphoneControl = false;
    this.useWebcam = false;
    this.intensity = 0.00;
    this.api_key = '';
    this.platform = 'youtube';
    this.threshold = '10';
    this.video = '';
    this.enableStreamControl = false;

    return this;
  }
}
