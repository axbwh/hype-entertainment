import * as Section from './section.js'
import initSub from './subsection.js'
import initArticles from './articles.js'
import * as Logo from './logo.js'
import * as Visor from './visor.js'
import * as About from './about.js'
import * as Proj from './proj.js'
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
    canvasVisor = document.getElementById('canvas-visor'),
    canvasLogo = document.getElementById('canvas-logo'),
    canvasProjects = document.getElementById('canvas-projects'),
    canvasAbout = document.getElementById('canvas-about')

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

    initScrollbars()

    Visor.init(canvasVisor, homeWrap.querySelector('.simplebar-content-wrapper'))
    // Logo.init(canvasLogo, homeWrap.querySelector('.simplebar-content-wrapper'))
    Proj.init(canvasProjects, homeWrap.querySelector('.simplebar-content-wrapper'), homeWrap.querySelector('.he-section'))
    About.init(canvasAbout, aboutWrap.querySelector('.simplebar-content-wrapper'))

    window.addEventListener('popstate', (event) => {
        Section.navigateTo(window.location.pathname.split('/').pop(), false)
    });

    Section.navigateTo(window.location.pathname.split('/').pop(), true)

    Section.init()

    initSub(aboutWrap, true, curInd.about)
    initSub(homeWrap, false, curInd.home)
    initArticles()

    

})

export {sections, icons}