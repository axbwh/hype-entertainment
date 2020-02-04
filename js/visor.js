import * as THREE from '../build/three.module.js'
import { RenderPass } from '../jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from '../jsm/postprocessing/UnrealBloomPass.js'
import { toRad, map, clamp, vWidth, vHeight, loadOBJ} from './utils.js'

let camera, scene, renderer, ambientLight, fov = 45

let frameRequest, inFrame = true
let scrollWrap, scrollTarget

let astro, visor, logo
let visorTl

let logoAxes = {
  x: 0,
  y: 250,
  z: 20
}


let axes = {
  x: 0,
  y: logoAxes.y,
  z: logoAxes.z + 300,
  r: 0,
  tx: 0,
  ty: logoAxes.y,
  tz: 0,
  ox: 10,
  oy: 10,
  intensity: 0.75
}

let targetAxes= {
  x: axes.tx,
  y: axes.ty,
  z: axes.tz
}

let mouse = {
  x: 0,
  y: 0
}

//SceneManagement Componenets
let SceneManager = 1
let timer = 2

function init(canvas, scrollWrap) {
  const scrollTarget = canvas.parentElement
  camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 2000)

  //-------------------------------scene-------------------------------//

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xcccccc, 100, 1500)

  ambientLight = new THREE.AmbientLight(0xffffff)
  ambientLight.intensity = axes.intensity
  scene.add(ambientLight)

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

  //-------------------------------Astronaut-------------------------------//


  let astroPromise = loadOBJ('Models/astro.obj')

  astroPromise.then(obj => {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = material
      }
    })

    obj.position.y = -145
    obj.position.x = 2
    obj.scale.x = 10
    obj.scale.y = 10
    obj.scale.z = 10
    astro = obj
    scene.add(astro)
  })

  //-------------------------------Visor-------------------------------//

  let visorPromise = loadOBJ('Models/visor.obj')

  visorPromise.then(obj => {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = material
      }
    })
    obj.position.y = 70
    obj.position.x = 0
    obj.scale.x = 10
    obj.scale.y = 10
    obj.scale.z = 10
    visor = obj
    scene.add(visor)
  })

  //-------------------------------Logo-------------------------------//

  let logoPromise = loadOBJ('Models/logo.obj')

  logoPromise.then(obj => {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = material
      }
    })
    obj.position.y = logoAxes.y - 50
    obj.position.z = logoAxes.z
    obj.scale.x = 10
    obj.scale.y = 10
    obj.scale.z = 10
    logo = obj
    scene.add(logo)
  })

  //-------------------------------Renderer-------------------------------//
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha:true
  })

  // renderer.setSize(window.innerWidth, window.innerHeight)
  // renderer.toneMapping = THREE.ReinhardToneMapping

  let renderScene = new RenderPass(scene, camera)

  let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
  bloomPass.threshold = 0.05
  bloomPass.strength = 0.4
  bloomPass.radius = 0.1

  canvas.appendChild(renderer.domElement)

  

  visorTl = anime.timeline({
    targets: axes,
    duration: 250,
    easing: 'linear',
    autoplay: false
  }).add({
    z: 100,
    duration: 200
  }, 0).add({
    y: 120,
    z: 65,
    ty: 60,
    tz: 0,
    ox: 10,
    oy: 10,
    intensity: 0.12,
    duration: 225
  }, 175).add({
    y: 70,
    ty: 70,
    tz: -65,
    ox: 1,
    oy: 1,
    duration: 750
  }, 0 + 400).add({
    r:-100,
    duration:350
  }, 250 + 400).add({
    z:-10,
    duration:250
  },600 + 400).add({
    targets: '#canvas-projects',
    opacity: 1,
    duration: 50
  }, 1000).add({
    targets: '#canvas-projects',
    scale: [0.05, 1],
    duration: 250
  }, 1000)


  let _scroll = _.throttle(
    () => {
      sPos = scrollWrap.scrollTop - scrollTarget.offsetTop;
      sEnd = scrollTarget.offsetHeight - vHeight
      let pPercent = map(clamp(sPos, 0, sEnd), 0, sEnd, 0, 100)
        visorTl.seek(visorTl.duration * (pPercent / 100))
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
        mouse.x = map(e.clientX, 0, vWidth, -axes.ox, axes.ox)
        mouse.y = map(e.clientY, 0, vHeight, -axes.oy, axes.oy)
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

  let promises = Promise.all([astroPromise, visorPromise, logoPromise])

  promises.then( () => {
    onWindowResize()
    render(true)
  })

  return promises
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight

  const viewAspect = 1920 / 1080

  const ratio = camera.aspect / viewAspect

  logo.scale.x = 10 * ratio
  logo.scale.y = 10 * ratio
  logo.scale.z = 10 * ratio
  logo.position.y = logoAxes.y - (50 * ratio)

  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
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

  if (reset) {
    camera.position.x = axes.x + mouse.x
    camera.position.y = axes.y + mouse.y 
    camera.position.z = axes.z
    camera.lookAt(axes.tx, axes.ty, axes.tz)
    visor.rotation.x = toRad(axes.r)
    ambientLight.intensity = axes.intensity
    
} else {

    camera.position.x += (axes.x + mouse.x - camera.position.x) * .1
    camera.position.y += (axes.y + mouse.y - camera.position.y) * .1
    camera.position.z += (axes.z - camera.position.z) * .1

    visor.rotation.x = map(.1, 0, 1, visor.rotation.x, toRad(axes.r))

    let rotate = {
      x: toRad(mouse.y*1.5),
      y: toRad(mouse.x*1.5),
    }

    logo.rotation.y = map(.1, 0, 1, logo.rotation.y, rotate.y)
    logo.rotation.x = map(.1, 0, 1, logo.rotation.x, rotate.x)

    let target = {
      x: map(.1, 0, 1, targetAxes.x, axes.tx),
      y: map(.1, 0, 1, targetAxes.y, axes.ty),
      z: map(.1, 0, 1, targetAxes.z, axes.tz)
  }

  targetAxes = target

    camera.lookAt(target.x, target.y, target.z)
    ambientLight.intensity = map(.1, 0, 1, ambientLight.intensity, axes.intensity)
}

  renderer.render(scene, camera)
}

export { init, stop, start }