//router.paths.[PAGE PATH].load = () => {}

const background = "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)), url(https://real2two.github.io/hidodie-maps/beta_vibes/blurred.png)";

router.paths.index.load = () => {
    if (document.body.style.backgroundImage !== background) document.body.style.backgroundImage = background;
}

router.paths.index.unload = path => {
    if (path !== "play") document.body.style.backgroundImage = "none";
}