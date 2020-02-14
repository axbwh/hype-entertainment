let preloader = document.querySelector('#preload'),
    preAnimWrap = preloader.querySelector('.preload-lottie')

let preAnim = lottie.loadAnimation({
    container: preAnimWrap,
    renderer: 'svg',
    autoplay: true,  
    loop: true,
    path: '../lottie/clock.json', 
    name: 'clocked',
})

preAnim.addEventListener('DOMLoaded', () =>{
    preloader.querySelector('.preload-svg').style.display = 'none';
})