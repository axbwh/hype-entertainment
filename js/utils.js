import { OBJLoader } from '../jsm/loaders/OBJLoader.js'
import * as Visor from './visor.js'
import * as About from './about.js'
import * as Proj from './proj.js'

const loadOBJ = (url, onProgress) => {
    return new Promise((resolve, reject) => {
        new OBJLoader().load(url, resolve, onProgress, reject);
    })
}

const map = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const clamp = (num, min, max) => {
    return num <= min ? min : num >= max ? max : num;
}

const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
}

const lerp = (from, to, speed) => {
    return (1 - speed) * from + speed * to;
};

const initScrollbars = () => {
    Array.prototype.forEach.call(
        document.querySelectorAll(".he-scroll"),
        el => {
            new SimpleBar(el)
        }
    )
}

let vHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight

let vWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth

const setSize = () => {
    vHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    vWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    let vh = vHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

let isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;


if(typeof(DeviceOrientationEvent) !== 'undefined' && typeof(DeviceOrientationEvent.requestPermission) === 'function' && !navigator.userAgent.match('CriOS')){
        document.body.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission().then(response => {}).catch(console.error)
        }, {once : true})
}

export {map, clamp, toRad, vHeight, vWidth, setSize, initScrollbars, loadOBJ, isMobile, lerp}