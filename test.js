#!/usr/bin/env node
"use strict";

const PanAndZoom = require("./pan-and-zoom.js");
const TextGrid   = require("../Roff.js/lib/text-grid.js");

const width      = process.stdout.columns;
const height     = process.stdout.rows - 1;
const screen     = new TextGrid(width, height);
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

screen.polygon(points);

/*
screen.polygon([
	[10, 10],
	[20, 10],
	[20, 20],
	[10, 20],
]);
screen
	.drawLine(8, -8)
	.left(8)
	.drawLine(8, 8)
*/

process.stdout.write(screen.asciify());

