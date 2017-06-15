export default class Overlay {
  constructor(element) {
    this.container = element;
    this.overlay = document.createElement("div");
    this.overlay.setAttribute("class", "overlay");
    this.container.appendChild(this.overlay)
  }

  setText(text) {
    this.overlay.setAttribute("class", "overlay");
    this.overlay.innerHTML = text;
  }

  hide() {
    this.overlay.setAttribute("class", "overlay hidden");
  }

}
