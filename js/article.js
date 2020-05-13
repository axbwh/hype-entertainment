import { initScrollbars, setSize } from './utils.js'
import * as Lotty from './lotty.js'

setSize();
Lotty.init()

window.addEventListener("resize", setSize);

document.addEventListener("DOMContentLoaded", () => {
    initScrollbars()
    Lotty.hide()

    document.querySelector('.he-to-top').addEventListener('click', () => {
            document.querySelector('.simplebar-content-wrapper').scrollTo(0, 0)
    })

})