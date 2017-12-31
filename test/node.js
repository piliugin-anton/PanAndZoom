#!/usr/bin/env node
"use strict";

const PanAndZoom = require("../pan-and-zoom.js");
const TextGrid   = require("../../Roff.js/lib/text-grid.js");

const clear      = "\x1B[2J\x1B[1;1H";
const width      = process.stdout.columns;
const height     = process.stdout.rows - 1;
const boxWidth   = 20;
const boxHeight  = 10;
const radiusX    = boxWidth  / 2;
const radiusY    = boxHeight / 2;

const points = [
	[width / 2 - radiusX, height / 2 - radiusY],
	[width / 2 + radiusX, height / 2 - radiusY],
	[width / 2 + radiusX, height / 2 + radiusY],
	[width / 2 - radiusX, height / 2 + radiusY],
];

const viewState = new PanAndZoom({
	updateDelay: 25,
	updateFirst: true,
	update: () => {
		const screen = new TextGrid(width, height);
		screen.polygon(viewState.applyTransform(points));
		process.stdout.write(clear + screen.asciify() + "\n");
	},
});

viewState.update();


// REPL
process.stdin.on("readable", () => {
	const input = process.stdin.read();
	if(null !== input){
		const [cmd, ...args] = input.toString().trim().split(/\s+/);
		switch(cmd.toLowerCase()){
			case "pan":
				viewState.panX = +args[0] || 0;
				viewState.panY = +args[1] || 0;
				break;
			case "zoom":
				viewState.zoom = +args[0] || 0;
				break;
		}
	}
});
