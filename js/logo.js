import * as THREE from '../build/three.module.js'
import { OBJLoader } from '../jsm/loaders/OBJLoader.js'

var clock = new THREE.Clock();
var delta = clock.getDelta(); // seconds.
var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
var container, stats;

var camera, scene, renderer, LogoObject;
var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
let lights = []

function init(container) {

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.z = 1100;

  //-------------------------------scene-------------------------------//

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xcccccc, 100, 1500 );

  var ambient = new THREE.AmbientLight( 0x101030 );
  scene.add( ambient );

  var directionalLight1 = new THREE.DirectionalLight( 0xffeedd );
  directionalLight1.position.set( 2, 0, 0 );
  scene.add( directionalLight1 );

  var directionalLight2 = new THREE.DirectionalLight( 0xffeedd );
  directionalLight2.position.set( -2, 0, 0 );
  scene.add( directionalLight2 );

  var directionalLight3 = new THREE.DirectionalLight( 0xffffff );
  directionalLight3.position.set( 0, -1, 1 );
  scene.add( directionalLight3 );

  var material = new THREE.MeshStandardMaterial({metalness: 0.1, roughness: 0.5});
  //-------------------------------Lights-------------------------------//

  var intensity = 5;  //old value 2.5
  var distance = 400; //old value 200
  var decay = 4.0;

  var c1 = 0xff0040, c2 = 0xff0040, c3 = 0xff0040, c4 = 0xff0040, c5 = 0xff0040, c6 = 0xff0040, c7 = 0xffffff;

  var sphere = new THREE.SphereBufferGeometry( 0.25, 16, 8 );

  lights[0] = new THREE.PointLight( c1, intensity, distance, decay );
  lights[0].add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: c1 } ) ) );
  scene.add( lights[0] );

  lights[1] = new THREE.PointLight( c2, intensity, distance, decay );
  lights[1].add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: c2 } ) ) );
  scene.add( lights[1] );

  lights[2] = new THREE.PointLight( c3, intensity, distance, decay );
  lights[2].add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: c3 } ) ) );
  scene.add( lights[2] );

  lights[3] = new THREE.PointLight( c4, intensity, distance, decay );
  lights[3].add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: c4 } ) ) );
  scene.add( lights[3] );

  lights[4] = new THREE.PointLight( c5, intensity, distance, decay );
  lights[4].add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: c5 } ) ) );
  scene.add( lights[4] );

  lights[5] = new THREE.PointLight( c6, intensity, distance, decay );
  lights[5].add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: c6 } ) ) );
  scene.add( lights[5] );

  lights[6] = new THREE.PointLight( c7, intensity*2, distance*2, decay );
  lights[6].add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: c7 } ) ) );
  scene.add( lights[6] );
  //-------------------------------Loader-------------------------------//

  var manager = new THREE.LoadingManager();
  manager.onProgress = function ( item, loaded, total ) {

    console.log( item, loaded, total );

  };

  //-------------------------------model-------------------------------//
  var loader = new OBJLoader( manager );
  loader.load( 'Models/Logo.obj', function ( LogoObject ) {

    LogoObject.traverse( function ( child ) {

      if ( child instanceof THREE.Mesh ) {

        child.material = material;

      }

    } );

    LogoObject.position.y = - 100;
    LogoObject.scale.x = 30;
    LogoObject.scale.y = 30;
    LogoObject.scale.z = 30;

    scene.add( LogoObject );

    animate()

  } );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  //renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  window.addEventListener( 'mousemove', onDocumentMouseMove, false );

  window.addEventListener( 'resize', onWindowResize, false );
  
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
  mouseX = ( event.clientX - windowHalfX ) / 2;
  mouseY = ( event.clientY - windowHalfY ) / 2;
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  //obj.rotation.x += (0.2*(Math.PI / 180));
  //obj.rotation.x %=360;
  camera.position.x += ( mouseX - camera.position.x ) * .03;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;

  var time = Date.now() * 0.00025;
  var d = 150;

  lights[0].position.x = Math.sin( time * 0.7 ) * d;
  lights[0].position.z = Math.cos( time * 0.3 ) * d;
  lights[0].position.z = 40;

  lights[1].position.x = Math.cos( time * 0.3 ) * d;
  lights[1].position.z = Math.sin( time * 0.6 ) * d;
  lights[1].position.z = 40;

  lights[2].position.x = Math.sin( time * 0.3 ) * d;
  lights[2].position.z = Math.sin( time * 0.5 ) * d;
  lights[2].position.z = 40;

  lights[3].position.x = Math.sin( time * 0.3 ) * d;
  lights[3].position.z = Math.sin( time * 0.8 ) * d;
  lights[3].position.z = 40;

  lights[4].position.x = Math.cos( time * 0.3 ) * d;
  lights[4].position.z = Math.sin( time * 0.1 ) * d;
  lights[4].position.z = 40;

  lights[5].position.x = Math.cos( time * 0.3 ) * d;
  lights[5].position.z = Math.cos( time * 0.5 ) * d;
  lights[5].position.z = 40;

  lights[6].position.x = mouseX;
  lights[6].position.y = mouseY;
  lights[6].position.z = 40;

  camera.lookAt( scene.position );

  renderer.render( scene, camera );
}

export default init
