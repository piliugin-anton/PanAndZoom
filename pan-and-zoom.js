"use strict";

class PanAndZoom {
	constructor(args = {}){
		if("function" === typeof args)
			args = {update: args};
		let {
			panX         = 0,
			panY         = 0,
			zoom         = 1,
			originX      = 0,
			originY      = 0,
			update       = () => {},
			updatePan    = () => {},
			updateZoom   = () => {},
			updateOrigin = () => {},
			updateDelay  = 0,
			updateFirst  = true,
		} = args;

		const debounced = {
			update:       null,
			updatePan:    null,
			updateZoom:   null,
			updateOrigin: null,
		};

		Object.defineProperties(this, {
			transform: {
				get: () => this.mergeMatrices([
					1, 0, panX,
					0, 1, panY,
					0, 0, 1,
				],[
					1, 0, originX,
					0, 1, originY,
					0, 0, 1,
				],[
					zoom, 0,    0,
					0,    zoom, 0,
					0,    0,    1,
				],[
					1, 0, -originX,
					0, 1, -originY,
					0, 0, 1,
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
						this.updateOrigin([fromX, fromY], [toX, toY]);
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
						this.updateOrigin([from, originY], [to, originY]);
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
						this.updateOrigin([originX, from], [originX, to]);
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
						this.updatePan([fromX, fromY], [toX, toY]);
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
						this.updatePan([from, panY], [to, panY]);
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
						this.updatePan([panX, from], [panX, to]);
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
						this.updateZoom(from, to);
						this.update();
					}
				},
			},

			update: {
				get: () => debounced.update || update,
				set: to => {
					if("function" !== typeof to)
						return;
					update = to;
					debounced.update = this.debounce(to);
				},
			},

			updateOrigin: {
				get: () => debounced.updateOrigin || updateOrigin,
				set: to => {
					if("function" !== typeof to)
						return;
					update = to;
					debounced.updateOrigin = this.debounce(to);
				},
			},

			updatePan: {
				get: () => debounced.updatePan || updatePan,
				set: to => {
					if("function" !== typeof to)
						return;
					update = to;
					debounced.updatePan = this.debounce(to);
				},
			},

			updateZoom: {
				get: () => debounced.updateZoom || updateZoom,
				set: to => {
					if("function" !== typeof to)
						return;
					update = to;
					debounced.updateZoom = this.debounce(to);
				},
			},

			updateDelay: {
				get: () => updateDelay,
				set: to => {
					const from = updateDelay;
					to = Math.max(-1, +to || 0);
					if(to !== from){
						to = from;
						redebounce();
					}
				},
			},

			updateFirst: {
				get: () => updateFirst,
				set: to => {
					const from = updateFirst;
					if((to = !!to) !== from){
						to = from;
						redebounce();
					}
				},
			},
		});

		// Force regeneration of debounced callbacks
		const redebounce = () => {
			this.update       = update;
			this.updateOrigin = updateOrigin;
			this.updatePan    = updatePan;
			this.updateZoom   = updateZoom;
		};
		redebounce();
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
	 *
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


	/**
	 * Stop a callback from firing too quickly.
	 *
	 * @param  {Function} fn
	 * @return {Function}
	 */
	debounce(fn){
		const limit = this.updateDelay;
		const asap  = this.updateFirst;
		if(limit < 0)
			return;
		let started, context, args, timing;
		const delayed = function(){
			const timeSince = Date.now() - started;
			if(timeSince >= limit){
				if(!asap) fn.apply(context, args);
				if(timing) clearTimeout(timing);
				timing = context = args = null;
			}
			else timing = setTimeout(delayed, limit - timeSince);
		};
		return function(){
			context = this,
			args    = arguments;
			if(!limit)
				return fn.apply(context, args);
			started = Date.now();
			if(!timing){
				if(asap) fn.apply(context, args);
				timing = setTimeout(delayed, limit);
			}
		};
	}


	/**
	 * Generate a CSS-compatible rendition of the current transform matrix.
	 * @example el.style.transform = panAndZoom;
	 * @return {String}
	 */
	toString(){
		const [a, c, tx, b, d, ty] = this.transform;
		return `matrix(${[a, b, c, d, tx, ty].join()})`;
	}
}


if("object" === typeof module)
	module.exports = PanAndZoom;

else if("object" === typeof window)
	Object.assign(window, {PanAndZoom});
