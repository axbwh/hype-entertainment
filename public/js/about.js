import * as THREE from "../build/three.module.js";
import { RenderPass } from "../jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../jsm/postprocessing/UnrealBloomPass.js";
import {
  toRad,
  map,
  clamp,
  vWidth,
  vHeight,
  loadOBJ,
  isMobile,
} from "./utils.js";

let canvas, camera, scene, renderer, ambientLight;

let timeline,
  frameRequest,
  inFrame = true;

let astro,
  rocks = [];

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
  sx: 0,
  sy: 25,
  sz: 0,
};

let mouse = {
  x: 0,
  y: 0,
};

//SceneManagement Componenets
let SceneManager = 1;
let timer = 2;

class Rock {
  constructor(index, scale, y, r = 0, radius = 100, material) {
    this.index = index;
    this.scale = scale;
    this.r = r;
    this.y = y;
    this.radius = radius;
    this.material = material;
  }

  init() {
    //--------------model--------------//
    this.promise = loadOBJ(`Models/rock0${this.index}.obj`);

    this.promise.then((obj) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          this.child = child;
          this.child.material = this.material;
        }
      });

      obj.scale.x = this.scale;
      obj.scale.y = this.scale;
      obj.scale.z = this.scale;

      obj.rotation.y = toRad(this.r);
      obj.position.y = this.y;

      this.obj = obj;
      scene.add(this.obj);

      this.rotate();
    });

    return this.promise;
  }

  rotate(speed = 0) {
    this.r += speed;
    this.obj.rotation.y = toRad(this.r);
    this.obj.rotation.z = toRad(this.r);
    this.obj.position.x = Math.sin(toRad(this.r)) * this.radius;
    this.obj.position.z = Math.cos(toRad(this.r)) * this.radius;
  }
}

function init(cvs, scrollWrap) {
  canvas = cvs;
  const scrollTarget = canvas.parentElement.parentElement;
  camera = new THREE.PerspectiveCamera(
    45,
    canvas.offsetWidth / canvas.offsetHeight,
    1,
    2000
  );

  //-------------------------------scene-------------------------------//

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcccccc, 100, 1500);

  ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.intensity = 0.12;
  scene.add(ambientLight);

  let directionalLight1 = new THREE.DirectionalLight(0xffeedd);
  directionalLight1.position.set(4, 0, 0);
  scene.add(directionalLight1);

  let directionalLight2 = new THREE.DirectionalLight(0xffeedd);
  directionalLight2.position.set(-4, 0, 0);
  scene.add(directionalLight2);

  let material = new THREE.MeshStandardMaterial({
    metalness: 0.1,
    roughness: 0.5,
  });

  //-------------------------------Astronaut-------------------------------//
  // https://sketchfab.com/3d-models/astronaut-287589e324b942b8be57dbd6c539b2ab

  let astroPromise = loadOBJ("Models/astrofloat.obj");

  astroPromise.then((object) => {
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    object.position.x = axes.sx;
    object.position.y = axes.sy;
    object.position.z = axes.sz;
    object.scale.x = 10;
    object.scale.y = 10;
    object.scale.z = 10;
    astro = object;
    scene.add(astro);
  });

  rocks[0] = new Rock(0, 3, -50, 0, 120, material);
  rocks[1] = new Rock(1, 4, -75, 45, 160, material);
  rocks[2] = new Rock(2, 2, -100, 130, 190, material);
  rocks[3] = new Rock(3, 6, -25, 270, 210, material);

  let promises = rocks.map((r) => r.init());

  promises.push(astroPromise);

  let promise = Promise.all(promises);
  promise.then(() => {
    window.addEventListener("resize", onWindowResize, false);
    onWindowResize();
  });

  //-------------------------------Renderer-------------------------------//
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  let renderScene = new RenderPass(scene, camera);

  let bloomPass = new UnrealBloomPass(
    new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0.05;
  bloomPass.strength = 0.4;
  bloomPass.radius = 0.1;

  canvas.appendChild(renderer.domElement);

  let chevWrap = document.querySelector("#about-wrap .he-chevron-wrap a");

  chevWrap.addEventListener("click", () => {
    const rect = scrollWrap
      .querySelector('[data-slug = "process" ')
      .getBoundingClientRect();
    const toScroll = rect.top + scrollWrap.scrollTop + vHeight * 0.5;
    scrollWrap.scrollTo(0, toScroll);
  });

  timeline = anime
    .timeline({
      targets: axes,
      duration: 100,
      easing: "linear",
      autoplay: false,
      update: (anim) => {
        if (anim.currentTime > 500) {
          chevWrap.style.display = "none";
        } else {
          chevWrap.style.display = "";
        }
      },
    })
    .add(
      {
        ry: -65,
        z: 100,
        sy: 15,
        duration: 500,
      },
      0
    )
    .add(
      {
        ry: -30,
        z: 85,
        sy: 10,
        y: 10,
        duration: 200,
      },
      "+=200"
    )
    .add(
      {
        ry: -20,
        z: 110,
        y: 30,
        duration: 200,
      },
      "+=200"
    )
    .add(
      {
        ry: 25,
        z: 130,
        y: 60,
        duration: 200,
      },
      "+=200"
    )
    .add(
      {
        ry: 40,
        z: 200,
        y: 60,
        sy: 30,
        duration: 200,
      },
      "+=200"
    )
    .add(
      {
        ry: 50,
        z: 400,
        y: 100,
        sy: 75,
        duration: 200,
      },
      "+=200"
    )
    .add(
      {
        ry: 180,
        z: 10,
        y: 500,
        sy: 0,
        duration: 200,
      },
      "+=200"
    )
    .add({
      ry: 180,
      duration: 100,
    })
    .add(
      {
        targets: "#about-wrap .he-chevron-wrap",
        opacity: [1, 0],
        duration: 100,
      },
      400
    );

  let _scroll = _.throttle(
    () => {
      sPos = scrollWrap.scrollTop - scrollTarget.offsetTop;
      sEnd = scrollTarget.offsetHeight - vHeight;
      let pPercent = map(clamp(sPos, 0, sEnd), 0, sEnd, 0, 100);
      timeline.seek(timeline.duration * (pPercent / 100));
      if (sPos > -vHeight && sPos <= sEnd) {
        //console.log("Starting");
        inFrame = true;
        start();
      } else {
        inFrame = false;
        stop();
      }
    },
    10,
    {
      trailing: true,
      leading: true,
    }
  );

  let _mousemove = _.throttle(
    (e) => {
      if (sPos <= sEnd) {
        mouse.x = map(e.clientX, 0, vWidth, -axes.ox, axes.ox);
        mouse.y = map(e.clientY, 0, vHeight, -axes.oy, axes.oy);
      }
    },
    10,
    {
      trailing: true,
      leading: true,
    }
  );

  let _orient = _.throttle(
    (e) => {
      e.stopPropagation();
      e = e || window.event;
      if (sPos <= sEnd) {
        let beta = clamp(e.beta, -30, 30);
        let gamma = clamp(e.gamma, -30, 30);
        mouse.x = map(gamma, -30, 30, -axes.ox, axes.ox);
        mouse.y = map(beta, -30, 30, -axes.oy, axes.oy);
      }
    },
    10,
    {
      trailing: true,
      leading: true,
    }
  );

  let sPos = scrollWrap.scrollTop - scrollTarget.offsetTop;
  let sEnd = scrollTarget.offsetHeight - vHeight;

  scrollWrap.addEventListener("scroll", _scroll);

  if (isMobile) {
    window.addEventListener("deviceorientation", _orient);
  } else {
    scrollWrap.addEventListener("mousemove", _mousemove);
  }

  return promise;
}

function onWindowResize() {
  camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  render(true);
}

function animate() {
  frameRequest = requestAnimationFrame(animate);
  render();
}

function start() {
  if (!frameRequest && inFrame) {
    animate();
  }
}

function stop() {
  if (frameRequest) {
    cancelAnimationFrame(frameRequest);
    frameRequest = undefined;
    render(true);
  }
}

function render(reset = false) {
  //   console.log('about is render')

  if (reset) {
    camera.position.x = axes.x + mouse.x;
    camera.position.y = axes.y + mouse.y;
    camera.position.z = axes.z;

    astro.position.x = axes.sx;
    astro.position.y = axes.sy;
    astro.position.z = axes.sz;

    astro.rotation.x = toRad(axes.rx + mouse.x * 1.5);
    astro.rotation.y = toRad(axes.ry + mouse.y * 1.5);
    astro.rotation.z = toRad(axes.rz);
  } else {
    camera.position.x += (axes.x - camera.position.x) * 0.1;
    camera.position.y += (axes.y - camera.position.y) * 0.1;
    camera.position.z += (axes.z - camera.position.z) * 0.1;

    astro.position.x += (axes.sx - astro.position.x) * 0.1;
    astro.position.y += (axes.sy - astro.position.y) * 0.1;
    astro.position.z += (axes.sz - astro.position.z) * 0.1;

    let rotate = {
      x: toRad(axes.rx + mouse.y * 1.5),
      y: toRad(axes.ry + mouse.x * 1.5),
    };

    astro.rotation.x = map(0.1, 0, 1, astro.rotation.x, rotate.x);
    astro.rotation.y = map(0.1, 0, 1, astro.rotation.y, rotate.y);
    astro.rotation.z = map(0.1, 0, 1, astro.rotation.z, toRad(axes.rz));

    rocks[0].rotate(0.25);
    rocks[1].rotate(0.3);
    rocks[2].rotate(0.5);
    rocks[3].rotate(0.45);
  }

  camera.lookAt(axes.tx, axes.ty, axes.tz);
  renderer.render(scene, camera);
}

export { init, stop, start };
