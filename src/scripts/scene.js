import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'

export default class Scene {
  constructor(container, shader) {
    this.container = container
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock();
    this.fragmentShader = shader;

    this.setupRenderer()
    this.setupCamera()
    this.setupVideoTexture()
    this.setupMaterial()
    this.setupGeometry()
    this.animate()
    window.addEventListener('resize', this.onWindowResize.bind(this), false)
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.container.appendChild(this.renderer.domElement)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  getSizes() {
    let aspect = 9/16
    let width = window.innerWidth
    let height = window.innerHeight
    return {
      left: aspect * width / -2,
      right: aspect * width / 2,
      top: height / 2,
      bottom: height / -2
    }
  }

  setupCamera() {
    let sizes = this.getSizes()
    this.camera = new THREE.OrthographicCamera(sizes.left, sizes.right, sizes.top, sizes.bottom, 0, 10)
    this.camera.position.x = 0
    this.camera.position.y = 0
    this.camera.position.z = 1
  }

  setupVideoTexture() {
    this.video = this.container.querySelector('#video')
    this.videoTexture = new THREE.Texture(this.video)
    this.videoTexture.minFilter = THREE.LinearFilter
    this.videoTexture.magFilter = THREE.LinearFilter
  }

  resetImages() {
    this.showVideo(1)
  }

  setupMaterial() {
    var textureLoader = new THREE.TextureLoader();
    let fragmentShader = this.fragmentShader;
    this.uniforms = {
      video: {
        type: 't',
        value: this.videoTexture
      },
      amplitude: {
        type: 'f',
        value: 0.0
      },

      underlay: {
        type: 't',
        value: textureLoader.load("assets/noise.png")
      },

      iGlobalTime:    { type: 'f', value: 0.1 }
    }
    this.uniforms.video.value.wrapS = this.uniforms.video.value.wrapS = THREE.ClampToEdgeWrapping;
    this.uniforms.underlay.value.wrapS = this.uniforms.underlay.value.wrapS = THREE.RepeatWrapping;
    this.material = new THREE.ShaderMaterial({vertexShader, fragmentShader, uniforms: this.uniforms})
  }

  getGeometrySize() {
    let width = window.innerWidth
    let height = window.innerHeight
    if(height >= width) {
      return Math.max(width, height)
    } else {
      return Math.min(width, height)
    }
  }

  setupGeometry() {
    let size = this.getGeometrySize()
    this.geometry = new THREE.PlaneGeometry(size, size, 1, 1)
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  updateGeometry() {
    this.scene.remove(this.mesh)
    let size = this.getGeometrySize()
    this.geometry = new THREE.PlaneGeometry(size, size, 1, 1)
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  onWindowResize() {
    this.updateGeometry()
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    let sizes = this.getSizes()
    this.camera.left = sizes.left
    this.camera.right = sizes.right
    this.camera.top = sizes.top
    this.camera.bottom = sizes.bottom
    this.camera.updateProjectionMatrix()
  }

  animate() {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      if (this.videoTexture) this.videoTexture.needsUpdate = true
      this.uniforms.iGlobalTime.value += this.clock.getDelta();
    }

    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.animate.bind(this))
  }

  setAmplitude(amplitude) {
    this.uniforms.amplitude.value = amplitude;
  }

  // destroy() {
  //   cancelAnimationFrame(this.raf);
  //   this.scene.remove(this.mesh)
  //   this.scene = null;
  //   this.video = null;
  //   this.camera = null;
  //   while (this.container.querySelector('canvas')) this.container.removeChild(this.container.querySelector('canvas'));
  // }

  static start(view, shader) {
    Scene.instance = new Scene(view, shader)
    return Scene.instance;
  }
}
