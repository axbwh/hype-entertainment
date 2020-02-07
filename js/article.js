import { initScrollbars, setSize } from './utils.js'
import * as Lotty from './lotty.js'

setSize();
Lotty.init()

window.addEventListener("resize", setSize);

document.addEventListener("DOMContentLoaded", () => {
    initScrollbars()
    Lotty.hide()
})