import * as THREE from '../build/three.module.js'
import { EffectComposer } from '../jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '../jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '../jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from '../jsm/postprocessing/UnrealBloomPass.js'
import { alphaVertex, alphaFragment } from './alpha.js'
import { OBJLoader } from '../jsm/loaders/OBJLoader.js'
import { toRad, map, clamp, vWidth, vHeight } from './utils.js'

let camera, scene, renderer, bloomComposer, composer

let objects = [];

let obj, obj2
let visorTl

let visorAxes = {
  x: 0,
  y: 200,
  z: 100,
  r: 0,
  tx: 0,
  ty: 55,
  tz: 0,
  ox: 10,
  oy: 10,
}

let mouseAxes = {
  x: 0,
  y: 0
}

//SceneManagement Componenets
let SceneManager = 1
let timer = 2

function init(canvas, scrollWrap) {
  const scrollTarget = canvas.parentElement
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)

  //-------------------------------scene-------------------------------//

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xcccccc, 100, 1500)

  let ambient = new THREE.AmbientLight(0x101030)
  scene.add(ambient)

  let directionalLight1 = new THREE.DirectionalLight(0xffeedd)
  directionalLight1.position.set(4, 0, 0)
  scene.add(directionalLight1)

  let directionalLight2 = new THREE.DirectionalLight(0xffeedd)
  directionalLight2.position.set(-4, 0, 0)
  scene.add(directionalLight2)

  let material = new THREE.MeshStandardMaterial({
    metalness: 0.1,
    roughness: 0.5
  });

  //-------------------------------model 1-------------------------------//
  let manager = new THREE.LoadingManager()
  manager.onProgress = function (item, loaded, total) {

  };

  let loader = new OBJLoader(manager);
  loader.load('Models/AstronautIntro.obj', function (object) {

    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = material
      }
    });

    object.position.y = -145
    object.scale.x = 10
    object.scale.y = 10
    object.scale.z = 10
    obj = object
    objects.push(obj) //Push required for RayCasting Detect
    scene.add(obj)

    render()
  });

  //-------------------------------model 2-------------------------------//
  let manager2 = new THREE.LoadingManager()


  let loader2 = new OBJLoader(manager2)
  loader2.load('Models/AstronautIntroVisor.obj', function (object2) {
    object2.position.y = 70
    object2.position.x = -2
    object2.scale.x = 10
    object2.scale.y = 10
    object2.scale.z = 10
    obj2 = object2
    objects.push(obj2) //Push required for RayCasting Detect
    scene.add(obj2)
  });

  //-------------------------------Renderer-------------------------------//
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })

  renderer.setSize(window.innerWidth, window.innerHeight)
  // renderer.setClearColor( 0xffffff, 0.5 );
  renderer.toneMapping = THREE.ReinhardToneMapping

  let renderScene = new RenderPass(scene, camera)
  // renderScene.clearColor = new THREE.Color( 0, 0, 0 );
	// renderScene.clearAlpha = 0;


  let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
  bloomPass.threshold = 0.05
  bloomPass.strength = 0.4
  bloomPass.radius = 0.1
  // bloomPass.clearColor = new THREE.Color( 0, 0, 0 );
  // bloomPass.clearAlpha = 0;


  bloomComposer = new EffectComposer(renderer)

  bloomComposer.addPass(renderScene)
  bloomComposer.addPass(bloomPass)

  let finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture }
      },
      vertexShader: alphaVertex,
      fragmentShader: alphaFragment,
      defines: {}
    } ), "baseTexture"
  )

  finalPass.needsSwap = true;

  composer = new EffectComposer( renderer );
  composer.addPass( renderScene );
  composer.addPass( finalPass );

  canvas.appendChild(renderer.domElement)

  visorTl = anime.timeline({
    targets: visorAxes,
    duration: 250,
    easing: 'easeOutExpo',
    autoplay: false
  }).add({
    x: 0,
    y: 200,
    z: 100
  }).add({
    x: 0,
    y: 100,
    z: 100
  }).add({
    x: 0,
    y: 90,
    z: 100,
    ox: 5,
    oy: 5,
  }).add({
    r: -100,
    duration: 750
  }, '-=250').add({
    x: 0,
    y: 60,
    z: -10,
    tz: -50,
    ty: 65,
    duration: 500
  }, '-=500')


  let _scroll = _.throttle(
    () => {
      sPos = scrollWrap.scrollTop - scrollTarget.offsetTop;
      sEnd = scrollTarget.offsetHeight - vHeight
      if (sPos <= sEnd) {
        let pPercent = map(clamp(sPos, 0, sEnd), 0, sEnd, 0, 100)
        visorTl.seek(visorTl.duration * (pPercent / 100))
        render()
      }
    },
    10, {
      trailing: true,
      leading: true
    }
  )

  let _mousemove = _.throttle(
    (e) => {
      if (sPos <= sEnd) {
        mouseAxes.x = map(e.clientX, 0, vWidth, -visorAxes.ox, visorAxes.ox)
        mouseAxes.y = map(e.clientY, 0, vHeight, -visorAxes.oy, visorAxes.oy)
        render()
      }
    },
    50, {
      trailing: true,
      leading: true
    }
  )
  let sPos = scrollWrap.scrollTop - scrollTarget.offsetTop
  let sEnd = scrollTarget.offsetHeight - vHeight

  scrollWrap.addEventListener("scroll", _scroll)
  scrollWrap.addEventListener("mousemove", _mousemove)

  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  bloomComposer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}

function render() {
  camera.position.x = visorAxes.x + mouseAxes.x
  camera.position.y = visorAxes.y + mouseAxes.y
  camera.position.z = visorAxes.z
  obj2.rotation.x = toRad(visorAxes.r)

  camera.lookAt(visorAxes.tx, visorAxes.ty, visorAxes.tz)
  bloomComposer.render(scene, camera)
  composer.render(scene, camera)
}

export default init