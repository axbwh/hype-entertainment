import { OBJLoader } from '../jsm/loaders/OBJLoader.js'

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

let isMobile = false;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
 isMobile = true;
}

export {map, clamp, toRad, vHeight, vWidth, setSize, initScrollbars, loadOBJ, isMobile}