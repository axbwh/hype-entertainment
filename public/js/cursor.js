import { isMobile, lerp } from "./utils.js";

const initCursor = () => {
  if (!isMobile) {
    const cursor = document.createElement("DIV");
    cursor.classList.add("he-cursor");
    document.body.appendChild(cursor);

    let clientX = 0,
      clientY = 0,
      lastX = 0,
      lastY = 0;

    // add listener to track the current mouse position
    document.addEventListener("mousemove", (e) => {
      clientX = e.clientX;
      clientY = e.clientY;
    });

    let cursorTriggers = document.querySelectorAll(
      "a, .he-nav-link, .he-project-title,  .he-cross, .simplebar-track, .he-subnav-spacer-wrap, #hamburger, .nav-item, .he-projects-wrap"
    );

    cursorTriggers.forEach((t) => {
      t.addEventListener("mouseenter", () => {
        cursor.classList.add("hovering");
      });

      t.addEventListener("mouseleave", () => {
        cursor.classList.remove("hovering");
      });
    });

    // transform the cursor to the current mouse position
    // use requestAnimationFrame() for smooth performance
    const render = () => {
      lastX = lerp(lastX, clientX, 0.1);
      lastY = lerp(lastY, clientY, 0.1);
      cursor.style.transform = `translate(${lastX}px, ${lastY}px)`;
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }
};

export default initCursor;
