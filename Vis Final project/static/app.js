var rightSlide = document.getElementById("sTw");
var targets = document.getElementById("targets");
var deleter = document.getElementById("deleter");

targets.addEventListener("click", slideOn);
deleter.addEventListener("click", slideOff);

function slideOn() {
    rightSlide.style.left = "60vw";
}

function slideOff() {
    rightSlide.style.left = "100vw";
}