import { PanAndZoom } from "pan-and-zoom";

const a = document.getElementById("a");
const b = document.getElementById("b");

const paz = window.paz = new PanAndZoom({
	update: () => {
		fixOrigin(b, a);
		b.style.transform = paz;
	},
});

function fixOrigin(zoomLayer, scrollLayer){
	const scrollRect = scrollLayer.getBoundingClientRect();
	let x = (scrollRect.width  * 0.5) + scrollRect.x;
	let y = (scrollRect.height * 0.5) + scrollRect.y;
	
	const zoomRect = zoomLayer.getBoundingClientRect();
	x = (x - zoomRect.x) / zoomRect.width;
	y = (y - zoomRect.y) / zoomRect.height;
	zoomLayer.style.transformOrigin = `${x * 100}% ${y * 100}%`;
	return [x, y];
}


function fixScroll(zoomLayer, scrollLayer){
	const zoomRect   = zoomLayer.getBoundingClientRect();
	const scrollRect = scrollLayer.getBoundingClientRect();
	const x = Math.abs(Math.min(0, zoomRect.x - scrollRect.x));
	const y = Math.abs(Math.min(0, zoomRect.y - scrollRect.y));
	if(x || y){
		window.requestAnimationFrame(() => {
			scrollLayer.scrollLeft += x;
			scrollLayer.scrollTop  += y;
			zoomLayer.style.transformOrigin = "0% 0%";
		});
	}
}

a.addEventListener("click", event => {
	paz.zoom += event.altKey
		? -0.5
		: +0.5;
	event.preventDefault();
});

b.addEventListener("transitionend", event => {
	if("transform" === event.propertyName)
		fixScroll(b, a);
});
