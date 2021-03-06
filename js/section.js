import {sections, icons} from './main.js'
import * as Visor from './visor.js'
import * as About from './about.js'
import * as Proj from './proj.js'

let current

const slideIn = (e, t, d, s) => {
    anime({
        targets: e,
        translateY: ['100%', '0%'],
        opacity: '1',
        easing: 'easeInOutQuad',
        duration: t,
        delay: anime.stagger(s, {
            start: d
        }),
        begin: () => {
            anime.set(e, {
                pointerEvents: 'auto',
                display: ''
            })
        }
    })
}

const slideOut = (e, t, d, s, callback) => {
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
        }
    })

}

const navigateTo = (ky, push) => {

    let key = ky in sections ? ky : 'home'

    let pathName = key == 'home' ? '' : key
    
    try {
      if (sections.home.wrap.querySelector(`[data-slug = ${ky}]`)) {
        let subSection = sections.home.wrap.querySelector(`[data-slug = ${ky}]`)
        pathName = ky

        let scrollWrap = sections.home.wrap.querySelector(
          '.simplebar-content-wrapper'
        )

        const rect = subSection.getBoundingClientRect()
        const toScroll = rect.top + scrollWrap.scrollTop
        scrollWrap.scrollTo(0, toScroll)
      }
    }catch (e) {}

    if (push !== false) {
        history.pushState('', '', `./${pathName}`)
    } else {
        history.replaceState('', '', `./${pathName}`)
    }

    if(key !== current){
        if(current === 'home'){
            Visor.stop()
            Proj.stop()
        }

        if(current === 'about'){
            About.stop()
        }

        if(key === 'home'){
            Visor.start()
            Proj.start()
        }

        if(key === 'about'){
            About.start()           
        }
        
    }


    if (typeof current !== "string") {
        let inList = Object.values(sections[key])
        inList.push(icons)
        slideIn(inList, 1000, 0, 150)
    } else if (key != current) {

        let outList = [sections[current].wrap]
        let inList = [sections[key].wrap]

        if (sections[current].left != sections[key].left) {
            outList.push(sections[current].left)
            inList.push(sections[key].left)
        }

        //check if right nav is same, if not animate new one into place
        if (sections[current].right != sections[key].right) {
            outList.push(sections[current].right)
            inList.push(sections[key].right)
        }

        slideOut(outList, 1000, 0, 150, () => {
            sections[current].wrap.display = 'none'
        })
        slideIn(inList, 1000, 500, 150)

    }else if( key === current){
        sections[current].wrap.querySelector('.simplebar-content-wrapper').scrollTo(0, 0)
    }
    
    current = key

}

const init = () => {
    let navLinks = Array.from(document.querySelectorAll('[data-section]'));


    document.querySelector('.he-to-top').addEventListener('click', () => {
        if(current){
            sections[current].wrap.querySelector('.simplebar-content-wrapper').scrollTo(0, 0)
        }
    })

    navLinks.forEach(nl => {
        nl.addEventListener('click', e => {
            navigateTo(nl.dataset.section)
        })
    })
}

export {init, navigateTo}
