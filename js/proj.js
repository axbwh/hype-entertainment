import * as THREE from '../build/three.module.js'
import { EffectComposer } from '../jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '../jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from '../jsm/postprocessing/UnrealBloomPass.js'
import { toRad, map, clamp, vWidth, vHeight, loadOBJ} from './utils.js'


let canvas, camera, scene, renderer, composer

let timeline, frameRequest, inFrame = false

let axes = {
    x: 0,
    y: 0,
    z: 800,
    offX: 10,
    offY: 10,
    i: 0,
    bmax : 1.2,
    bmin : 1.2
  }

let projects = []

let raycaster, mouse = {
    x: 0,
    y: 0
}
let bloomPass, defaultMaterial, intersects, ambientLight

//SceneManagement Componenets


function init(cvs, scrollWrap, scrollTgt) {
    canvas = cvs
    const scrollTarget = scrollTgt
    //-------------------------------SceneSetup-------------------------------// 
    renderer = new THREE.WebGLRenderer({
        antialias: true
    })

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)

    canvas.appendChild(renderer.domElement)

    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xffffff, 150, 1200)

    //-------------------------------Camera-------------------------------// 
    camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 1, 2000)
    camera.position.z = axes.z
    camera.lookAt(scene.position)
    //-------------------------------Rendercalls & Lights-------------------------------// 

    ambientLight = new THREE.AmbientLight(0xffffff)
    ambientLight.intensity = 0.12
    scene.add(ambientLight)

    var directionalLight1 = new THREE.DirectionalLight(0xffeedd, 0.5)
    directionalLight1.position.set(4, 0, 0)
    scene.add(directionalLight1)

    var directionalLight2 = new THREE.DirectionalLight(0xffeedd, 0.5)
    directionalLight2.position.set(-4, 0, 0)
    scene.add(directionalLight2)

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    var renderScene = new RenderPass(scene, camera)
    bloomPass = new UnrealBloomPass(new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight), 1.5, 0.4, 0.85)
    bloomPass.strength = axes.bmin
    bloomPass.radius = axes.bmin
    bloomPass.threshold = 0.05

    composer = new EffectComposer(renderer)
    composer.addPass(renderScene)
    composer.addPass(bloomPass)

    window.addEventListener('mousemove', onMouseMove, false)

    defaultMaterial = new THREE.MeshStandardMaterial({
        metalness: 0.1,
        roughness: 0.5
      });

    timeline = anime.timeline({
        targets: axes,
        duration: 100,
        easing: 'linear',
        autoplay: false
    }).add({
        z: 400,
        bmin: 0,
        bmax: 1,
        duration: 200
    }).add({
        i:1,
        x: 1000,
        bmax: 1.4,
        duration: 200
    }, '+=100').add({
        i:2,
        x: 2000,
        bmax: 1.2,
        duration: 200
    }, '+=200').add({
        i:3,
        x: 3000,
        bmax: 0.4,
        duration: 200
    }, '+=200').add({
        i:4,
        x: 4000,
        bmax: 1.4,
        duration: 200
    }, '+=200').add({
        i:5,
        x: 5000,
        bmax: 0.1,
        duration: 200
    }, '+=200').add({
        i:6,
        x: 6000,
        bmax: 1.2,
        duration: 200
    }, '+=200').add({
        i:7,
        x: 7000,
        duration: 200
    }, '+=200').add({
        x: 7000,
        duration: 100
    })
    
    let sPos = scrollWrap.scrollTop - scrollTarget.offsetTop
    let sEnd = scrollTarget.offsetHeight - vHeight

    let _scroll = _.throttle(
        () => {
            sPos = scrollWrap.scrollTop - scrollTarget.offsetTop;
            sEnd = scrollTarget.offsetHeight - vHeight
            let pPercent = map(clamp(sPos, 0, sEnd), 0, sEnd, 0, 100)
            timeline.seek(timeline.duration * (pPercent / 100))
            if (sPos > 0 && sPos <= sEnd) {
                inFrame = true
                start()
            } else {
                inFrame = false
                stop()
            }
        },
        1, {
            trailing: true,
            leading: true
        }
    )

    // let _mousemove = _.throttle(
    //     (e) => {
    //         if (sPos <= sEnd) {
    //             mouseAxes.x = map(e.clientX, 0, vWidth, -axes.ox, axes.ox)
    //             mouseAxes.y = map(e.clientY, 0, vHeight, -axes.oy, axes.oy)
    //         }
    //     },
    //     1, {
    //         trailing: true,
    //         leading: true
    //     }
    // )

    scrollWrap.addEventListener("scroll", _scroll)
    // scrollWrap.addEventListener("mousemove", _mousemove)

    window.addEventListener('resize', onWindowResize, false)

    let promise = setupScene()

    promise.then( () =>{
        render(true)
    })

    return promise

}

class Project {
    constructor(index, id, scale, y, r = 0) {
        this.index = index
        this.id = id
        this.scale = scale
        this.y = y
        this.r = r
        this.vid = document.getElementById(`vid-${this.id}`)
        this.ready = false
        this.playing = false
    }

    init() {

        this.vid.play().then(() => {
            this.vid.pause()
            this.texture = new THREE.VideoTexture(this.vid)
            this.material = new THREE.MeshStandardMaterial({
                map: this.texture,
                roughness: 0.5
            })
            this.ready = true
        })

        // this.texture = new THREE.VideoTexture(this.vid)

        // setInterval(() => {
        //     if (this.vid.readyState >= this.vid.HAVE_CURRENT_DATA) {
        //         this.texture.needsUpdate = true;
        //     }
        // }, 1000 / 24)

        // this.material = new THREE.MeshStandardMaterial({
        //     map: this.texture,
        //     roughness: 0.5
        // })

        //--------------model--------------//
        this.promise = loadOBJ(`Models/proj/${this.id}.obj`)
        
        this.promise.then((obj) => {

            obj.traverse( (child) => {
                this.child = child
                this.child.material = defaultMaterial
            })
            obj.scale.x = this.scale
            obj.scale.y = this.scale
            obj.scale.z = this.scale
            obj.position.x = 1000 * this.index
            obj.rotation.y = this.r
            obj.position.y = this.y
            this.obj = obj
            scene.add(this.obj)
        })
        return this.promise
    }

    hoverIn() {
        if (this.ready && !this.playing) {
            this.child.material = this.material ? this.material : defaultMaterial
            this.vid.play()
            this.playing = true
        }
    }

    hoverOut() {
        this.vid.pause()
        this.child.material = defaultMaterial
        this.playing = false
    }
}

function setupScene() {
    projects[0] = new Project(0, 'sun', 20, 0, -30)
    //--------------model: https://free3d.com/3d-model/tentacle-v1--480565.html--------------//
    projects[1] = new Project(1, 'sea', 7, -40)
    //--------------female model: https://free3d.com/3d-model/genericwoman-v2--495262.html--------------//
    //--------------male model: https://free3d.com/3d-model/genericmale-v2--426934.html--------------//
    projects[2] = new Project(2, 'rave', 12, -90)
    projects[3] = new Project(3, 'shoji', 15, 0)
    projects[4] = new Project(4, 'gatsby', 12, -100)
    projects[5] = new Project(5, 'ivy', 15, -120)
    //--------------model: https://free3d.com/3d-model/icicle-v3--899600.html#--------------//
    projects[6] = new Project(6, 'ice', 12, -80)
    //--------------model: ?? --------------//
    projects[7] = new Project(7, 'space', 12, -100)

    let promises = projects.map( p => p.init())

    return Promise.all(promises)
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


function onMouseMove( event ) {    
    event.preventDefault();

    mouse.x = ( event.clientX /canvas.offsetWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / canvas.offsetHeight ) * 2 + 1;
}

function render(reset = false) {
    console.log('proj is render')

    if (reset) {
        camera.position.x = axes.x 
        camera.position.y = axes.y
        camera.position.z = axes.z
        camera.lookAt(axes.x, axes.y, 0)
    } else {
        let target = {
            x: map(.1, 0, 1, camera.position.x, axes.x + mouse.x),
            y: map(.1, 0, 1, camera.position.y, axes.y + mouse.y),
            z: map(.1, 0, 1, camera.position.z, axes.z)
        }

        camera.position.x = target.x
        camera.position.y = target.y
        camera.position.z = target.z

        camera.lookAt(target.x, target.y, 0)
    }

    renderer.render(scene, camera)

    //-----------------------Raycast-----------------------//
    raycaster.setFromCamera( mouse, camera )

    intersects = raycaster.intersectObjects( projects.map(p => p.obj) , true )
    
    let bloomTo, lightTo

    if(intersects.length >= 1 && !reset){
        projects[Math.round(axes.i)].hoverIn()
        bloomTo = axes.bmax
        lightTo = 1
    }else{
        projects.filter( p => p.playing).forEach( p => p.hoverOut())
        bloomTo = axes.bmin
        lightTo = 0.12
    }

    ambientLight.intensity = map(.5, 0, 1, ambientLight.intensity, lightTo);

    bloomPass.strength =  map(.15, 0, 1, bloomPass.strength, bloomTo);
    bloomPass.radius =  map(.15, 0, 1, bloomPass.radius, bloomTo);

    composer.render()
       
}  

function onWindowResize() {
  camera.aspect =canvas.offsetWidth / canvas.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight );
}

export { init, stop, start }