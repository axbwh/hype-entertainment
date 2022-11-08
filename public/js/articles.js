import initModal from './modal.js'
import { sections } from './main.js'
import { slideOut } from './section.js'
const toggleExpand = el => {
    if (!el.style.height || el.style.height == "0px") {
        el.style.height =
            Array.prototype.reduce.call(
                el.childNodes,
                function (p, c) {
                    return p + (c.offsetHeight || 0)
                },
                0
            ) + "px"
    } else {
        el.style.height = "0px"
    }
}

const initArticles = () => {
    Array.from(document.querySelectorAll(".he-article")).forEach(a => {
        const collapse = a.querySelector(".he-collapse")

        a.addEventListener("mouseenter", () => {
            toggleExpand(collapse)
        })

        a.addEventListener("mouseleave", () => {
            toggleExpand(collapse)
        })

        const modal = document.querySelector(`.he-article-modal[data-article="${a.dataset.article}"]`)
        if(modal){
            initModal(a, modal, modal.querySelector(".he-scroll"), modal.querySelector('.he-cross'))
        }
    })

    Array.from(document.querySelectorAll(".he-projects-wrap")).forEach(a => {
        a.addEventListener("click", (e) =>{
            e.preventDefault()
            window.sessionStorage.origin = "projects"
            slideOut(sections.projects.wrap, 1000, 0, 150, () =>{
                window.location.href = a.href
            })

        })
    })
}

export default initArticles