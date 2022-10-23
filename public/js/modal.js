const initModal = (trigger, modal, content, cross) => {

    if (modal) {
        modal.style.transformOrigin = "left top"

        trigger.addEventListener("click", () => {
            modal.style.display = "block"

            const aRect = trigger.getBoundingClientRect(),
                mRect = modal.getBoundingClientRect(),
                ratio = {
                    x: aRect.width / mRect.width,
                    y: aRect.height / mRect.height
                }

            anime.set(content, {
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
            }).add({
                    targets: modal,
                    borderColor: "hsla(0, 0%, 100%, 0)",
                    duration: 200,
                    easing: "easeInOutQuad"
                },
                "-=200"
            ).add({
                    targets: content,
                    translateX: "0%",
                    duration: 750,
                    easing: "easeInOutQuad"
                },
                "-=650"
            ).add({
                targets: trigger,
                borderColor: ['hsla(0, 0%, 100%, 0)', 'hsla(0, 0%, 100%, 0)'],
            }, 0)
        })

        cross.addEventListener("click", () => {
            const aRect = trigger.getBoundingClientRect(),
                mRect = modal.getBoundingClientRect(),
                ratio = {
                    x: aRect.width / mRect.width,
                    y: aRect.height / mRect.height
                }

            let tl = anime.timeline({})

            tl.add({
                targets: content,
                translateX: "100%",
                duration: 750,
                easing: "easeInOutQuad"
            }).add({
                    targets: modal,
                    borderColor: "hsla(0, 0%, 100%, 1)",
                    duration: 200,
                    easing: "easeInOutQuad"
                },
                "-=200"
            ).add({
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
            ).finished.then(() => {
                modal.style.display = "none"
                trigger.style.borderColor = ''
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

export default initModal