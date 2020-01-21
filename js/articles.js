const toggleExpand = el => {
    if (!el.style.height || el.style.height == "0px") {
        el.style.height =
            Array.prototype.reduce.call(
                el.childNodes,
                function(p, c) {
                    return p + (c.offsetHeight || 0)
                },
                0
            ) + "px"
    } else {
        el.style.height = "0px"
    }
}

const articleModal = a => {
    const modal = document.querySelector(
        `.he-article-modal[data-article="${a.dataset.article}"]`
    )

    if (modal) {
        const modChild = modal.querySelector(".he-scroll")
        modal.style.transformOrigin = "left top"

        a.addEventListener("click", () => {
            modal.style.display = "block"

            const aRect = a.getBoundingClientRect(),
                mRect = modal.getBoundingClientRect(),
                ratio = {
                    x: aRect.width / mRect.width,
                    y: aRect.height / mRect.height
                }

            anime.set(modChild, {
                translateX: "100%"
            })

            let tl = anime.timeline({
                easing: "easeInOutQuad"
            })

            tl.add({
                targets: modal,
                translateX: [aRect.x, 0],
                translateY: [aRect.y, 0],
                scaleX: [ratio.x, 1],
                scaleY: [ratio.y, 1],
                backgroundColor: ["hsla(0, 0%, 0%, 0)", "hsla(0, 0%, 0%, 1)"],
                duration: 750,
                easing: "easeInOutQuad"
            })
                .add(
                    {
                        targets: modal,
                        borderColor: "hsla(0, 0%, 100%, 0)",
                        duration: 200,
                        easing: "easeInOutQuad"
                    },
                    "-=200"
                )
                .add(
                    {
                        targets: modChild,
                        translateX: "0%",
                        duration: 750,
                        easing: "easeInOutQuad"
                    },
                    "-=650"
                )
                .add({
                    targets: a,
                    borderColor : ['hsla(0, 0%, 100%, 0)' , 'hsla(0, 0%, 100%, 0)'],
                }, 0)
        })

        modal.querySelector(".he-cross").addEventListener("click", () => {
            const aRect = a.getBoundingClientRect(),
                mRect = modal.getBoundingClientRect(),
                ratio = {
                    x: aRect.width / mRect.width,
                    y: aRect.height / mRect.height
                }

            let tl = anime.timeline({})

            tl.add({
                targets: modChild,
                translateX: "100%",
                duration: 750,
                easing: "easeInOutQuad"
            })
                .add(
                    {
                        targets: modal,
                        borderColor: "hsla(0, 0%, 100%, 1)",
                        duration: 200,
                        easing: "easeInOutQuad"
                    },
                    "-=200"
                )
                .add(
                    {
                        targets: modal,
                        translateX: [0, aRect.x],
                        translateY: [0, aRect.y],
                        scaleX: [1, ratio.x],
                        scaleY: [1, ratio.y],
                        backgroundColor: ["hsla(0, 0%, 0%, 1)", "hsla(0, 0%, 0%, 0)"],
                        duration: 750,
                        easing: "easeInOutQuad"
                    },
                    "-=650"
                )
                .finished.then(() => {
                    modal.style.display = "none"
                    a.style.borderColor = ''

                    anime.set(modal, {
                        translateX: 0,
                        translateY: 0,
                        scaleX: 1,
                        scaleY: 1
                    })
                })
        })
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

        articleModal(a)
    })
}

export default initArticles