import {map, clamp, vHeight, vWidth} from './utils.js'
import * as Proj from './proj.js'
import initModal from './modal.js'

class Sub {
    constructor(el, index, object, elements, nav, spacer, label, array, group, scrollWrap) {
        this.section = el
        this.index = index;
        this.elements = elements;
        this.array = array;
        this.nav = nav;
        this.spacer = spacer;
        this.label = label;
        this.pStart = this.section.offsetTop;
        this.pEnd = this.pStart + this.section.offsetHeight;
        this.group = group;
        this.object = object;
        this.modal = document.querySelector(`[data-vid='${this.index}']`);
        this.modalOpen = document.querySelector(
            `.he-project-title[data-sub='${this.index}']`
        );
        this.slug = this.section.dataset.slug
        this.scrollWrap = scrollWrap
    }

    scrollPos() {
        this.pStart = this.section.offsetTop;

        if (this.index < this.array.length - 1) {
            this.pEnd = this.array[this.index + 1].pStart;
        } else {
            this.pEnd = this.pStart + this.section.offsetHeight;
        }
    }

    initModal() {
        if (this.modal && this.modalOpen) {

            this.modalOpen.addEventListener("click", () => {
                this.modal.style.display = "flex"
                Proj.stop()
                this.modal.querySelector('video').play()
                anime({
                    targets : this.modal,
                    opacity: 1,
                    duration: 800,
                    easing: 'easeInOutQuad'
                })
                history.replaceState('', '', `/${this.slug}`)
            })

            this.modal
                .querySelector(".he-cross")
                .addEventListener("click", () => {
                    anime({
                        targets : this.modal,
                        opacity: 0,
                        duration: 800,
                        easing: 'easeInOutQuad'
                    }).finished.then( () =>{
                        this.modal.style.display = "none"
                        Proj.start()
                        this.modal.querySelector('video').pause()
                    })
                    history.replaceState('', '', `/`)
                    
                })
        }
    }

    init() {
        this.initModal();
        this.scrollPos();
        this.animation = anime.timeline({
            autoplay: false
        });

        this.nav.parentElement.parentElement.addEventListener('click', () => {
            const rect = this.section.getBoundingClientRect()
            const toScroll = rect.top + this.scrollWrap.scrollTop + rect.height / 2
            this.scrollWrap.scrollTo(0, toScroll)
        })


        let distToNav =
            this.index == this.array.length - 1 ?
            0 :
            this.array[this.index + 1].nav.getBoundingClientRect().left -
            this.nav.getBoundingClientRect().left;

        let elemFrames = [{
                translateY: "100%",
                opacity: 0,
                duration: 0
            },
            {
                translateY: "0%",
                opacity: 1,
                duration: 250
            },
            {
                translateY: "0%",
                opacity: 1,
                duration: 500
            },
            {
                translateY: "-100%",
                opacity: 0,
                duration: 250
            }
        ];

        if (this.index == 0) {
            elemFrames[0] = {
                translateY: "0%",
                opacity: 1,
                duration: 0
            };
        }

        if (this.index == this.array.length - 1) {
            elemFrames[elemFrames.length - 1] = {
                translateY: "0%",
                opacity: 1,
                duration: 0
            };
        }

        this.animation.add({
            targets: this.elements,
            keyframes: elemFrames,
            easing: "easeInOutQuad",
            delay: anime.stagger(100)
        });

        let inDuration = 250;
        let outDuration = 250;

        if (this.index >= 1 && this.index <= this.array.length - 3) {
            outDuration = 1;
        }

        if (this.index >= 2 && this.index <= this.array.length - 2) {
            inDuration = 1;
        }

        if (this.group == true) {
            let labelFrames = [{
                    translateY: "100%",
                    opacity: 0,
                    duration: 0
                },
                {
                    translateY: "0%",
                    opacity: 1,
                    duration: inDuration
                },
                {
                    translateY: "0%",
                    opacity: 1,
                    duration: this.animation.duration - (inDuration + outDuration)
                },
                {
                    translateY: "-100%",
                    opacity: 0,
                    duration: outDuration
                }
            ];

            if (this.index == 0) {
                labelFrames[0] = {
                    translateY: "0%",
                    opacity: 1,
                    duration: 0
                };
            }

            if (this.index == this.array.length - 1) {
                labelFrames[labelFrames.length - 1] = {
                    translateY: "0%",
                    opacity: 1,
                    duration: 0
                };
            }

            this.animation.add({
                    targets: this.label,
                    keyframes: labelFrames,
                    easing: "easeInOutQuad"
                },
                0
            );
        }

        let navFrames = [{
                scaleY: 0,
                duration: 0
            },
            {
                scaleY: 0.1,
                duration: 1
            },
            {
                scaleY: 1,
                duration: this.animation.duration - 400,
                easing: "linear"
            },
            {
                scaleY: 1,
                duration: 100
            },
            {
                scaleY: 0.1,
                translateX: 0,
                duration: 100,
                easing: "easeInOutQuad"
            },
            {
                scaleY: 0.1,
                translateX: distToNav,
                duration: 200,
                easing: "easeOutQuad"
            },
            {
                scaleY: 0,
                duration: 1
            }
        ];

        if (this.index < this.array.length - 1) {
            this.animation.add({
                    targets: this.spacer,
                    keyframes: [{
                            transformOrigin: "0 0",
                            scaleX: 0,
                            duration: 0
                        },
                        {
                            transformOrigin: "0 0",
                            scaleX: 1,
                            duration: 200,
                            easing: "easeOutQuad"
                        }
                    ]
                },
                "-=200"
            );
        } else {
            navFrames.splice(-3);
        }

        this.animation.add({
                targets: this.nav,
                keyframes: navFrames
            },
            0
        );
    }

    scroll(sPos) {
        this.pPercent = map(sPos, this.pStart, this.pEnd, 0, 100);
        let ssPos = sPos + vHeight;

        this.animation.seek(this.animation.duration * (this.pPercent / 100));

        if (this.pPercent >= 0 && this.pPercent < 100) {
            this.object.index = this.index;
            anime.set(this.elements, {
                pointerEvents: "auto"
            });
        } else {
            anime.set(this.elements, {
                pointerEvents: "none"
            });
        }
    }
}

const addSub = (wrap, group, object) => {
    let dummy = Array.from(wrap.querySelectorAll(".he-anim-dummy"));
    let sectionEl = wrap.querySelector(".he-section")
    let navProgress = Array.from(wrap.querySelectorAll(".he-subnav-progress"));
    let navSpacer = Array.from(wrap.querySelectorAll(".he-subnav-spacer"));
    let navLabel = Array.from(wrap.querySelectorAll(".he-subnav-label"));
    let subs = [],
        autoscroll = false;

    let scrollWrap = wrap.querySelector('.simplebar-content-wrapper')




    dummy.forEach((e, i) => {
        let elems = wrap.querySelectorAll(`[data-sub='${i}']`);
        subs[i] = new Sub(
            e,
            i,
            object,
            elems,
            navProgress[i],
            navSpacer[i],
            navLabel[i],
            subs,
            group,
            scrollWrap
        );
    });

    subs.forEach(e => {
        e.init();
    });

    let bat = {
        charged: 0
    };

    let percentAnim = anime({
        targets: bat,
        charged: 100,
        easing: "linear",
        round: 10, // Will round the animated value to 1 decimal
        update: function () {
            wrap.querySelector(".he-subnav-percent").innerHTML =
                bat.charged
                .toFixed(1)
                .toString()
                .padStart(4, "0") + "%";
        }
    });

    let throttle = _.throttle(
        () => {
            let currentPos = scrollWrap.scrollTop - sectionEl.offsetTop;
            let pPercent = map(currentPos, 0, scrollWrap.scrollHeight - sectionEl.offsetTop - vHeight, 0, 100);
            percentAnim.seek(percentAnim.duration * (pPercent / 100));

            subs.forEach(e => {
                e.scroll(currentPos);
            });
        },
        10, {
            trailing: true,
            leading: true
        }
    );

    const resizeNav = () => {
        let currentPos = scrollWrap.scrollTop;
        let pPercent = map(currentPos, 0, scrollWrap.scrollHeight - vHeight, 0, 100);
        percentAnim.seek(percentAnim.duration * (pPercent / 100));

        subs
            .slice()
            .reverse()
            .forEach(e => {
                e.scrollPos();
                e.scroll(currentPos);
            });
    };

    scrollWrap.addEventListener("scroll", throttle);
    window.addEventListener("resize", resizeNav);
};

export default addSub


