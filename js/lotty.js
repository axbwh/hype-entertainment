let logoI = 0
let started = false
let played = false
let logoWrap = document.querySelector('#logo')


let animWrap = Array.from(logoWrap.querySelectorAll('.he-lottie-wrap'))


let anim = []

const init = () => {

    anim[0] = lottie.loadAnimation({
        container: animWrap[0],
        path: '../lottie/clock.json',
        renderer: 'svg',
        name: "clock",
        autoplay: false,
        loop: false,
    })

    anim[1] = lottie.loadAnimation({
        container: animWrap[1],
        path: '../lottie/glitch.json',
        renderer: 'svg',
        name: "glitch",
        autoplay: false,
        loop: false,
    })

    anim[2] = lottie.loadAnimation({
        container: animWrap[2],
        path: '../lottie/snake.json',
        renderer: 'svg',
        name: "snake",
        autoplay: false,
        loop: false,
    })

    animWrap[0].style.opacity = 1;

    anim.forEach( a => {
        a.addEventListener('complete', e => {
            if(played){
                logoI = logoI >= anim.length - 1 ? 0 : logoI + 1
                played = false
                animWrap.forEach( (a, i) => {
                    if(i == logoI){
                        a.style.opacity = 1
                    }else{
                        a.style.opacity = 0
                    }
                })
            }
        })
    })

    logoWrap.addEventListener("mouseenter", () => {
        anim[logoI].setDirection(1)
        anim[logoI].play()
        played = false
    })

    logoWrap.addEventListener("mouseleave", () => {
        anim[logoI].setDirection(-1)
        anim[logoI].play()
        played = true    
    })
}

const hide = () => {
    
    return new Promise((resolve) => {
        setTimeout(() => {
            preAnim.stop()
            anime({
                targets: preloader.querySelector('.preload-wrap'),
                delay: 500,
                translateY: '-20%',
                duration: 800,
                easing: 'easeInOutQuad'
            })

            anime({
                targets: preloader,
                delay: 500,
                opacity: 0,
                duration: 800,
                easing: 'easeInOutQuad'
            }).finished.then(() => {
                preAnim.destroy()
                preloader.style.display = 'none'
                resolve()
            })
        }, 500)
    })
}

export {init, hide}