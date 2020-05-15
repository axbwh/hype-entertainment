import * as THREE from '../build/three.module.js'
import { EffectComposer } from '../jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '../jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from '../jsm/postprocessing/UnrealBloomPass.js'
import { toRad, map, clamp, vWidth, vHeight, loadOBJ, isMobile} from './utils.js'


let canvas, camera, scene, renderer, composer

let timeline, frameRequest, inFrame = false

let titles = Array.from(document.querySelectorAll('.he-project-title')), hovered = false

let axes = {
    x: 0,
    y: 0,
    z: 800,
    sclZoom: 0.5, //sun scale multiply
    offX: 10,
    offY: 10,
    i: 0,
    bmax : 1,
    bmin : 1
  }

let projects = []

let raycaster, mouse = {
    x: 0,
    y: 0
}
let bloomPass, defaultMaterial, ambientLight, intersects = []

//SceneManagement Componenets


function init(cvs, scrollWrap, scrollTgt) {
    canvas = cvs
    const scrollTarget = scrollTgt
    //-------------------------------SceneSetup-------------------------------// 
    renderer = new THREE.WebGLRenderer({
        antialias: true
    })

    renderer.setPixelRatio( window.devicePixelRatio );
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
        sclZoom: 1,
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
            if (sPos > 0 && sPos <= sEnd + vHeight) {
                inFrame = true
                start()
            } else {
                inFrame = false
                stop()
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
                mouse.x = map(e.clientX, 0, vWidth, -1, 1)
                mouse.y = map(e.clientY, 0, vHeight, 1, -1)
            }
        },
        10, {
            trailing: true,
            leading: true
        }
    )

    let _orient = _.throttle(
        (e) => {
            e.stopPropagation()
            e = e || window.event
            if (sPos <= sEnd) {
                let beta = clamp(e.beta, -30, 30)
                let gamma = clamp(e.gamma, -30, 30)
                mouse.x = map(gamma, -30, 30, -1, 1)
                mouse.y = map(beta, -30, 30, 1, -1)
            }
        },
        10, {
            trailing: true,
            leading: true
        }
    )


    scrollWrap.addEventListener("scroll", _scroll)
    
    if(isMobile){
        window.addEventListener('deviceorientation', _orient);
    }else{
        scrollWrap.addEventListener("mousemove", _mousemove)
    }

    

    titles.forEach( t => {
        t.addEventListener("mouseenter", () => {
            document.querySelector('.he-video-caption.desk').classList.add('hovering')
            hovered = true
        })
    }) 

    titles.forEach( t => {
        t.addEventListener("mouseleave", () => {
            document.querySelector('.he-video-caption.desk').classList.remove('hovering')
            hovered = false
        })
    }) 

    let promise = setupScene()

    promise.then( () =>{
        onWindowResize()
        window.addEventListener('resize', onWindowResize, false)
    })

    return promise

}

class Project {
    constructor(index, id, scale, y, r = 0) {
        this.index = index
        this.id = id
        this.scale = scale
        this.sclmult = 1
        this.zoom = 1
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

        //--------------model--------------//
        this.promise = this.id === 'space' ? loadOBJ(`Models/astrofloat.obj`) : loadOBJ(`Models/proj/${this.id}.obj`)
        
        this.promise.then((obj) => {

            obj.traverse( (child) => {
                this.child = child
                this.child.material = defaultMaterial
            })
            obj.scale.x = this.scale
            obj.scale.y = this.scale
            obj.scale.z = this.scale
            obj.position.x = 1000 * this.index
            obj.rotation.y = toRad(this.r)
            obj.position.y = this.y
            this.obj = obj
            scene.add(this.obj)
        })
        return this.promise
    }

    setScale(){
        this.obj.scale.x = this.scale * this.sclmult * this.zoom
        this.obj.scale.y = this.scale * this.sclmult * this.zoom
        this.obj.scale.z = this.scale * this.sclmult * this.zoom
        this.obj.position.y = this.y * this.sclmult * this.zoom
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
    projects[0] = new Project(0, 'sun', 20, 0, 90)
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
    //--------------model: https://nasa3d.arc.nasa.gov/detail/aces --------------//
    projects[7] = new Project(7, 'space', 10, 100)

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




function render(reset = false) {

    if (reset) {
        camera.position.x = axes.x 
        camera.position.y = axes.y
        camera.position.z = axes.z
        camera.lookAt(axes.x, axes.y, 0)

        projects[0].zoom = axes.sclZoom
        projects[0].setScale()

    } else {
        let target = {
            x: map(.1, 0, 1, camera.position.x, axes.x),
            y: map(.1, 0, 1, camera.position.y, axes.y),
            z: map(.1, 0, 1, camera.position.z, axes.z)
        }

        camera.position.x = target.x
        camera.position.y = target.y
        camera.position.z = target.z

        camera.lookAt(target.x, target.y, 0)
        
        let rotate = {  
            x: -toRad(mouse.y * 7.5),
            y: toRad(projects[Math.round(axes.i)].r + mouse.x * 10),
        }

        projects[Math.round(axes.i)].obj.rotation.y =  map(.1, 0, 1, projects[Math.round(axes.i)].obj.rotation.y, rotate.y)
        projects[Math.round(axes.i)].obj.rotation.x =  map(.1, 0, 1, projects[Math.round(axes.i)].obj.rotation.x, rotate.x)

        projects[0].zoom = map(.1, 0 , 1, projects[0].zoom, axes.sclZoom)
        projects[0].setScale()

    }
    
    let bloomTo, lightTo

    if( (intersects.length >= 1 || hovered || isMobile)  && !reset){
        projects[Math.round(axes.i)].hoverIn()
        bloomTo = isMobile ? axes.bmax * 0.8 : axes.bmax
        lightTo = isMobile ? 0.8 : 1
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
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    composer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;

    const viewAspect = 1920 / 1080

    const ratio = canvas.offsetWidth < 786 ? 0.5 : 1

    projects.forEach(p => {
        if (p.id !== 'ivy' && p.id !== 'space') {
            p.sclmult = ratio
            p.setScale()
        }
    })

    camera.updateProjectionMatrix();

    render(true)

}

export { init, stop, start }