"use strict";

module.exports =

class PanAndZoom {
	constructor(){
		let panX    = 0;
		let panY    = 0;
		let zoom    = 1;
		let originX = 0;
		let originY = 0;

		Object.defineProperties(this, {
			transform: {
				get: () => {
					const matrix = [
						1, 0, 0,
						0, 1, 0,
						0, 0, 1,
					];
					this.applyTransform(matrix, [
						zoom, 0,    0,
						0,    zoom, 0,
						0,    0,    1,
					]);
				}
			},

			origin: {
				get: () => [originX, originY],
				set: to => {
					const fromX = originX;
					const fromY = originY;
					const toX   = +to[0] || 0;
					const toY   = +to[1] || 0;
					if(toX !== fromX || toY !== fromY){
						originX = toX;
						originY = toY;
						this.update();
					}
				},
			},

			originX: {
				get: () => originX,
				set: to => {
					const from = originX;
					to = +to || 0;
					if(to !== from){
						originX = to;
						this.update();
					}
				},
			},

			originY: {
				get: () => originY,
				set: to => {
					const from = originY;
					to = +to || 0;
					if(to !== from){
						originY = to;
						this.update();
					}
				},
			},

			pan: {
				get: () => [panX, panY],
				set: to => {
					const fromX = panX;
					const fromY = panY;
					const toX   = +to[0] || 0;
					const toY   = +to[1] || 0;
					if(toX !== fromX || toY !== fromY){
						panX = toX;
						panY = toY;
						this.update();
					}
				},
			},

			panX: {
				get: () => panX,
				set: to => {
					const from = panX;
					to = +to || 0;
					if(to !== from){
						panX = to;
						this.update();
					}
				},
			},

			panY: {
				get: () => panY,
				set: to => {
					const from = panY;
					to = +to || 0;
					if(to !== from){
						panY = to;
						this.update();
					}
				},
			},

			zoom: {
				get: () => zoom,
				set: to => {
					const from = zoom;
					to = Math.max(0, +to || 1);
					if(to !== from){
						zoom = to;
						this.update();
					}
				},
			},
		});
	}


	/**
	 * Concatenate two affine transformation matrices.
	 * @param  {Number[]} A
	 * @param  {Number[]} B
	 * @return {Number[]}
	 */
	applyTransform(A, B){
		return [
			
		];
	}
}
