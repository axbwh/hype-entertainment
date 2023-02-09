document.getElementById("hamburger").addEventListener("click", () => {
  toggleClasses();
});

let navItem = document.getElementsByClassName("nav-menu-item");

for (var i = 0; i < navItem.length; i++) {
  navItem[i].addEventListener("click", () => {
    toggleClasses();
  });
}

function toggleClasses() {
  document.getElementById("he-nav-wrapper").classList.toggle("nav-show");
  document.querySelector("#hamburger .hamburger-wrapper").classList.toggle("hamburger-clicked");
  //document.getElementById("nav-left-items").classList.toggle("z-index-0");
}

document.getElementById("logo").addEventListener("click", () => {
  if (
    document.querySelector("#hamburger .hamburger-wrapper").classList.contains("hamburger-clicked")
  )
    toggleClasses();
});
