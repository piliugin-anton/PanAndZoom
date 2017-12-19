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
				get: () => this.mergeMatrices([
					1, 0, 0,        // Identity matrix
					0, 1, 0,
					0, 0, 1,
				],[
					1, 0, panX,     // Translation (Pan)
					0, 1, panY,
					0, 0, 1,
				],[
					zoom, 0,    0,  // Scale (Zoom)
					0,    zoom, 0,
					0,    0,    1,
				]),
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
						this.onUpdateOrigin({
							from: [fromX, fromY],
							to:   [toX,   toY],
						});
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
						this.onUpdateOrigin({
							from: [from, originY],
							to:   [to,   originY],
						});
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
						this.onUpdateOrigin({
							from: [originX, from],
							to:   [originX, to],
						});
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
						this.onUpdatePan({
							from: [fromX, fromY],
							to:   [toX,   toY],
						});
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
						this.onUpdatePan({
							from: [from, panY],
							to:   [to,   panY],
						});
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
						this.onUpdatePan({
							from: [panX, from],
							to:   [panX, to],
						});
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
						this.onUpdateZoom({from, to});
					}
				},
			},
		});
	}


	/**
	 * Apply the current transformation matrix to an array of points.
	 *
	 * @param  {Number[]} points
	 * @return {Number[]}
	 */
	applyTransform(points){
		const results = [];
		for(const point of points){
			const m = this.mergeMatrices([
				1, 0, point[0],
				0, 1, point[1],
				0, 0, 1,
			], this.transform);
			results.push([m[2], m[5]]);
		}
		return results;
	}


	/**
	 * Concatenate two affine transformation matrices.
	 * @param  {Number[][]} matrices
	 * @return {Number[]}
	 */
	mergeMatrices(...matrices){
		let result = matrices[0] || [1,0,0,0,1,0,0,0,1];

		if(matrices.length < 2)
			return result;

		const {length} = matrices;
		for(let i = 1; i < length; ++i){
			const [
				a, b, c,
				p, q, r,
				u, v, w,
			] = result;

			const [
				A, B, C,
				P, Q, R,
				U, V, W,
			] = matrices[i];
			
			result = [
				(a*A)+(b*P)+(c*U), (a*B)+(b*Q)+(c*V), (a*C)+(b*R)+(c*W),
				(p*A)+(q*P)+(r*U), (p*B)+(q*Q)+(r*V), (p*C)+(q*R)+(r*W),
				(u*A)+(v*P)+(w*U), (u*B)+(v*Q)+(w*V), (u*C)+(v*R)+(w*W),
			];
		}
		return result;
	}

	onUpdate       (matrix)     { }
	onUpdateOrigin ({from, to}) { this.onUpdate(); }
	onUpdatePan    ({from, to}) { this.onUpdate(); }
	onUpdateZoom   ({from, to}) { this.onUpdate(); }
}
