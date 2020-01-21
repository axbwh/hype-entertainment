import {addListen, navigateTo} from './section.js'
import initSub from './subsection.js'
import initArticles from './articles.js'
import initVisor from './visor.js'
import {initScrollbars} from './utils.js'

let aboutLink = document.getElementById('about-link'),
    articlesLink = document.getElementById('articles-link'),
    homeLinkL = document.getElementById('home-link-left'),
    homeLinkR = document.getElementById('home-link-right'),
    icons = document.querySelectorAll('.he-social-wrap'),
    subEL = document.querySelectorAll('[data-sub]')

let aboutWrap = document.getElementById('about-wrap'),
    articlesWrap = document.getElementById('articles-wrap'),
    homeWrap = document.getElementById('home-wrap'),
    visorCanvas = document.getElementById('canvas-visor')

let sections = {
    about: {
        left: homeLinkL,
        right: articlesLink,
        wrap: aboutWrap,
    },
    home: {
        left: aboutLink,
        right: articlesLink,
        wrap: homeWrap,
    },
    articles: {
        left: aboutLink,
        right: homeLinkR,
        wrap: articlesWrap
    }
}

let curInd = {
    about: {
        index: 0
    },
    home: {
        index: 0
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let hidearray = [icons]
    let noneArray = []

    Object.keys(sections).forEach((s) => {
        hidearray.push(sections[s].wrap, sections[s].left, sections[s].right);
        noneArray.push(sections[s].wrap)
    })

    anime.set(hidearray, {
        translateY: '100%',
        opacity: '0',
        pointerEvents: 'none'
    })

    anime.set(document.body, {
        opacity: '1'
    })

    window.addEventListener('popstate', (event) => {
        navigateTo(window.location.pathname.split('/').pop(), false)
    });
    navigateTo(window.location.pathname.split('/').pop(), true)
    initScrollbars()

    addListen()

    initSub(aboutWrap, true, curInd.about)
    initSub(homeWrap, false, curInd.home)
    initArticles()
    initVisor(visorCanvas, homeWrap.querySelector('.simplebar-content-wrapper'))
})

export {sections, icons}