import { initScrollbars, setSize } from './utils.js'
import * as Lotty from './lotty.js'

let loaded = false

const slideOut = (e, t, callback) => {
  //slide out
  anime({
    targets: e,
    translateY: '-100%',
    opacity: '0',
    easing: 'easeInOutQuad',
    duration: t,
    complete: () => {
      anime.set(e, {
        pointerEvents: 'none',
        // display: display
        // translateY: '100%'
      })

      if (callback) {
        callback()
      }
    },
  })
}

const slideIn = (e, t, d, s) => {
  anime({
    targets: e,
    translateY: ['100%', '0%'],
    opacity: '1',
    easing: 'easeInOutQuad',
    duration: t,
    delay: anime.stagger(s, {
      start: d,
    }),
    begin: () => {
      anime.set(e, {
        pointerEvents: 'auto',
        display: '',
      })
    },
  })
}

setSize()
Lotty.init()

window.addEventListener('resize', setSize)

const onReady = () => {
  initScrollbars()
  Lotty.hide()

  let wrap = document.querySelector('.he-article-modal')

  document.querySelector('.he-to-top').addEventListener('click', () => {
    document.querySelector('.simplebar-content-wrapper').scrollTo(0, 0)
  })

  anime.set(wrap, {
    translateY: '100%',
  })



  document.querySelectorAll('.nav-menu-item, .he-article-link')
    .forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        slideOut(wrap, 1000, () => {
          window.location.href = el.href
        })
      })
    })

    document.querySelector('.he-cross').addEventListener('click', (e) => {
        e.preventDefault()
        slideOut(wrap, 1000, () => {
        let path = document.querySelector('.he-cross').href
    
        if(window.sessionStorage.origin && window.location.href.includes('projects')){
            origin = window.sessionStorage.origin
            let slug = window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
            console.log(slug);
            path = origin === 'projects' ? path : `/${slug}`
        }
          window.location.href = path
        })
      })



  loaded = true
}

if (document.readyState == 'loaded' || document.readyState == 'complete') {
  onReady()
} else {
  document.addEventListener('DOMContentLoaded', onReady)
}

window.addEventListener('pageshow', (event) => {
  let wrap = document.querySelector('.he-article-modal')
  setTimeout(() => {
    document.querySelectorAll('.he-nav-link-wrap').forEach((e) => {
      e.style.opacity = 1
    })
  }, 800)
  slideIn(wrap, 1000, 700, 150)
})
