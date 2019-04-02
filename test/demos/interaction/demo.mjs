import PanAndZoom from "../../../pan-and-zoom.mjs";

const map    = document.getElementById("map");
const viewer = document.getElementById("viewer");
const svg    = map.firstElementChild;

const paz = new PanAndZoom({
	update: () => {
		svg.style.transform = paz;
	},
});
paz.zoom = 2;
map.addEventListener("transitionend", event => {
	if("transform" === event.propertyName){
		viewer.classList.remove("zooming");
	}
});

map.addEventListener("wheel", event => {
	paz.panX -= event.deltaX;
	paz.panY -= event.deltaY;
}, {passive: true});

map.addEventListener("dblclick", event => {
	const {offsetX, offsetY} = event;
	map.classList.add("zooming");
	paz.originX = offsetX;
	paz.originY = offsetY;
	paz.zoom += event.metaKey ? -1 : 1;
});
