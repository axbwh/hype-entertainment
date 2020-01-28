import * as THREE from '../build/three.module.js'
import { EffectComposer } from '../jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '../jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '../jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from '../jsm/postprocessing/UnrealBloomPass.js'
import { OBJLoader } from '../jsm/loaders/OBJLoader.js'
import { toRad, map, clamp, vWidth, vHeight} from './utils.js'

let camera, scene, renderer, composer

let frameRequest
let inFrame = true
let canvas

let objects = [];

let obj
let timeline

let axes = {
  x: 0,
  y: 0,
  z: 135,
  rx: 0,
  ry: -90,
  rz: 0,
  tx: 0,
  ty: 0,
  tz: 0,
  ox: 10,
  oy: 10,
  sx:0,
  sy:25,
  sz:0
}

let mouseAxes = {
  x: 0,
  y: 0
}

//SceneManagement Componenets
let SceneManager = 1
let timer = 2

function init(cvs, scrollWrap) {
    canvas = cvs
  const scrollTarget = canvas.parentElement
  camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 1, 2000)

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
  loader.load('Models/AstronautFloating.obj', function (object) {

    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = material
      }
    });

    object.position.x = axes.sx
    object.position.y = axes.sy
    object.position.z = axes.sz
    object.scale.x = 10
    object.scale.y = 10
    object.scale.z = 10
    obj = object
    objects.push(obj) //Push required for RayCasting Detect
    scene.add(obj)

    render(true)
  });

  //-------------------------------Renderer-------------------------------//
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha:true
  })

  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
  // renderer.toneMapping = THREE.ReinhardToneMapping

  let renderScene = new RenderPass(scene, camera)



  let bloomPass = new UnrealBloomPass(new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight), 1.5, 0.4, 0.85)
  bloomPass.threshold = 0.05
  bloomPass.strength = 0.4
  bloomPass.radius = 0.1



  composer = new EffectComposer( renderer );
  composer.addPass( renderScene );
  composer.addPass( bloomPass );

  canvas.appendChild(renderer.domElement)

  timeline = anime.timeline({
      targets: axes,
      duration: 100,
      easing: 'linear',
      autoplay: false
  }).add({
      ry: -65,
      z: 100,
      sy: 15,
      duration: 200
  }, 300).add({
      ry: -30,
      z: 85,
      sy: 10,
      y: 10,
      duration: 200
  }, '+=200').add({
      ry: -20,
      z: 110,
      y: 30,
      duration: 200
  }, '+=200').add({
      ry: 25,
      z: 130,
      y: 60,
      ox: 20,
      oy: 20,
      duration: 200
  }, '+=200').add({
      ry: 40,
      z: 200,
      y: 60,
      sy: 30,
      ox:30,
      oy:30,
      duration: 200
  }, '+=200').add({
      ry: 50,
      z: 400,
      y: 100,
      sy: 75,
      ox:60,
      oy:60,
      duration: 200
  }, '+=200').add({
      ry: 180,
      z: 10,
      y: 500,
      ox: 2,
      oy: 2,
      sy: 0,
      duration: 200
  }, '+=200').add({
      ry: 180,
      duration: 100
  })


  let _scroll = _.throttle(
    () => {
      sPos = scrollWrap.scrollTop - scrollTarget.offsetTop;
      sEnd = scrollTarget.offsetHeight - vHeight
      let pPercent = map(clamp(sPos, 0, sEnd), 0, sEnd, 0, 100)
        timeline.seek(timeline.duration * (pPercent / 100))
      if (sPos > -vHeight && sPos <= sEnd) { 
        inFrame = true       
        start()   
      }else{
        inFrame = false
        stop()
      } 
    },
    1, {
      trailing: true,
      leading: true
    }
  )

  let _mousemove = _.throttle(
    (e) => {
      if (sPos <= sEnd) {
        mouseAxes.x = map(e.clientX, 0, vWidth, -axes.ox, axes.ox)
        mouseAxes.y = map(e.clientY, 0, vHeight, -axes.oy, axes.oy)
      }
    },
    1, {
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
  camera.aspect = canvas.offsetWidth / canvas.offsetHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
  composer.setSize(canvas.offsetWidth, canvas.offsetHeight)
}

function animate() {
  frameRequest = requestAnimationFrame(animate)
  render()
}

function start() {
  if (!frameRequest && inFrame) {
    animate()
  }
}

function stop() {
  if (frameRequest) {
    cancelAnimationFrame(frameRequest)
    frameRequest = undefined
    render(true)
  }
}

function render(reset = false) {
//   console.log('about is render')

  if(reset){
    camera.position.x = axes.x + mouseAxes.x
    camera.position.y = axes.y + mouseAxes.y 
    camera.position.z = axes.z

    obj.position.x = axes.sx
    obj.position.y = axes.sy
    obj.position.z = axes.sz
    obj.rotation.x = toRad(axes.rx)
    obj.rotation.y = toRad(axes.ry)
    obj.rotation.z = toRad(axes.rz)

  }else{

    camera.position.x += (axes.x + mouseAxes.x - camera.position.x) * .1
    camera.position.y += (axes.y + mouseAxes.y - camera.position.y) * .1
    camera.position.z += (axes.z - camera.position.z) * .1

    obj.position.x += (axes.sx - obj.position.x) *.1
    obj.position.y += (axes.sy - obj.position.y) *.1
    obj.position.z += (axes.sz - obj.position.z) *.1
    obj.rotation.x = map(.1, 0, 1, obj.rotation.x, toRad(axes.rx))
    obj.rotation.y = map(.1, 0, 1, obj.rotation.y, toRad(axes.ry))
    obj.rotation.z = map(.1, 0, 1, obj.rotation.z, toRad(axes.rz))
  }
 
  camera.lookAt(axes.tx, axes.ty, axes.tz)
  renderer.render(scene, camera)
}

export { init, stop, start }