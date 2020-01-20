let aboutLink = document.getElementById('about-link'),
    articlesLink = document.getElementById('articles-link'),
    homeLinkL = document.getElementById('home-link-left'),
    homeLinkR = document.getElementById('home-link-right'),
    icons = document.querySelectorAll('.he-social-wrap'),
    subEL = document.querySelectorAll('[data-sub]')

let aboutWrap = document.getElementById('about-wrap'),
    articlesWrap = document.getElementById('articles-wrap'),
    homeWrap = document.getElementById('home-wrap')
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
    navigateTo(window.location.pathname.split('/').pop())
    addScroll()
    addListen()
    addSub(aboutWrap, true, curInd.about)
    addSub(homeWrap, false, curInd.home)
    addCollapse()
    visorInit(visorCanvas, homeWrap.querySelector('.simplebar-content-wrapper'))
})