var container, stats;

var camera, scene, renderer, composer;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


var objects = [];
var MouseMovementCounter = 0;

//Visor Varibles
let obj2;
let visorTl

let visorAxes = {
  x: 0,
  y: 150,
  z: 100,
  r: 0.872665,
  tx: 0,
  ty: 55,
  tz: 0
}

//SceneManagement Componenets
var SceneManager = 1;
let timer = 2;



function visorInit(canvas, scrollWrap) {
  scrollTarget = canvas.parentElement
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);

  //-------------------------------scene-------------------------------//

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcccccc, 100, 1500);

  var ambient = new THREE.AmbientLight(0x101030);
  scene.add(ambient);

  var directionalLight1 = new THREE.DirectionalLight(0xffeedd);
  directionalLight1.position.set(4, 0, 0);
  scene.add(directionalLight1);

  var directionalLight2 = new THREE.DirectionalLight(0xffeedd);
  directionalLight2.position.set(-4, 0, 0);
  scene.add(directionalLight2);

  var material = new THREE.MeshStandardMaterial({
    metalness: 0.1,
    roughness: 0.5
  });

  //-------------------------------model 1-------------------------------//
  var manager = new THREE.LoadingManager();
  manager.onProgress = function (item, loaded, total) {

    console.log(item, loaded, total);

  };

  var loader = new THREE.OBJLoader(manager);
  loader.load('Models/SpaceManBody.obj', function (object) {

    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    object.position.y = -100;
    object.scale.x = 10;
    object.scale.y = 10;
    object.scale.z = 10;
    obj = object
    objects.push(obj); //Push required for RayCasting Detect
    scene.add(obj);

    render();
  });

  //-------------------------------model 2-------------------------------//
  var manager2 = new THREE.LoadingManager();
  manager2.onProgress = function (item, loaded, total) {

    console.log(item, loaded, total);
    //console.log( "Model 2" );

  };


  var loader2 = new THREE.OBJLoader(manager2);
  loader2.load('Models/SpaceManVisor.obj', function (object2) {

    object2.traverse(function (child) {

    });

    object2.position.y = 70;
    object2.scale.x = 10;
    object2.scale.y = 10;
    object2.scale.z = 10;
    obj2 = object2;
    objects.push(obj2); //Push required for RayCasting Detect
    scene.add(obj2);

  });

  //-------------------------------Renderer-------------------------------//
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvas.appendChild(renderer.domElement);

  visorTl = anime.timeline({
    targets: visorAxes,
    duration: 250,
    easing: 'easeOutExpo',
    autoplay: false
  }).add({
    x: 0,
    y: 150,
    z: 100
  }).add({
    x: 0,
    y: 80,
    z: 100
  }).add({
    x: 0,
    y: 70,
    z: 100,
  }).add({
    r: -0.174533,
    duration: 700
  }, '-=250').add({
    x: 0,
    y: 60,
    z: -10,
    tz: -50,
    ty: 60,
    duration: 500
  }, '-=450')

  let throttle = _.throttle(
    () => {
        let sPos = scrollWrap.scrollTop - scrollTarget.offsetTop;
        let pPercent =  map(clamp(sPos, 0, scrollTarget.offsetHeight - vHeight), 0, scrollTarget.offsetHeight-vHeight, 0, 100)
        visorTl.seek(visorTl.duration * (pPercent / 100)) 
        render()
    },
    10, {
        trailing: true,
        leading: true
    }
);

scrollWrap.addEventListener("scroll", throttle);

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {
  requestAnimationFrame(animate);
  render();
}


function render() {

  camera.position.x = visorAxes.x;
  camera.position.y = visorAxes.y;
  camera.position.z = visorAxes.z;
  obj2.rotation.x = visorAxes.r;

  camera.lookAt(visorAxes.tx, visorAxes.ty, visorAxes.tz);

  renderer.render(scene, camera);
}