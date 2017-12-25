"use strict";

const a = document.getElementById("a");
const b = document.getElementById("b");
const v = document.getElementsByClassName("v");

const paz = new PanAndZoom(() => {
	b.style.transform = paz;

	const {panX, panY, zoom} = paz;
	a.style.transformOrigin = [
		paz.originX,
		paz.originY,
	].map(a => a+"px").join(" ");
	a.style.transform = [
		`translate(${panX}px, ${panY}px)`,
		`scale(${zoom})`,
	].join(" ");

	paz.applyTransform([
		[0,   0],
		[100, 0],
		[100, 100],
		[0,   100],
	]).forEach((point, index) => {
		const {style} = v[index];
		style.left = point[0] + "px";
		style.top  = point[1] + "px";
	});
});
paz.update();

const controls = [...Array.from(document.forms[0])];
controls.map(el => {
	el.addEventListener("change", event => {
		const {target} = event;
		switch(target.id){
			case "pan-x":    paz.panX    = +target.value; break;
			case "pan-y":    paz.panY    = +target.value; break;
			case "zoom":     paz.zoom    = +target.value; break;
			case "origin-x": paz.originX = +target.value; break;
			case "origin-y": paz.originY = +target.value; break;
		}
	});
});
