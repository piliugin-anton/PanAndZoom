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

const viewState = new PanAndZoom();
viewState.onUpdate = () => {
	screen.polygon(viewState.applyTransform(points));
	process.stdout.write(screen.asciify());
};
viewState.panX = +process.argv[2] || 0;
viewState.panY = +process.argv[3] || 0;
