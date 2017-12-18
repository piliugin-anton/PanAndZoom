#!/usr/bin/env node
"use strict";

const PanAndZoom = require("./pan-and-zoom.js");

draw([
	[0.25, 0.25],
	[0.75, 0.25],
	[0.75, 0.75],
	[0.25, 0.75],
]);

function draw(rect){
	const width  = process.stdout.columns;
	const height = process.stdout.rows - 1;

	// It ain't Curses, but hey, if it works...
	const screen = new Array(height)
		.fill(" ".repeat(width))
		.join("\n");
	
	process.stdout.write(screen);
}

