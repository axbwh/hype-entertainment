let pathName = window.location.hash.substr(1) == 'home' ? '' : window.location.hash.substr(1)
history.replaceState('', '', `./${pathName}`)

const map = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
const clamp = (num, min, max) => {
    return num <= min ? min : num >= max ? max : num;
}