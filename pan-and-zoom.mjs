const NO_MIN = Number.NEGATIVE_INFINITY;
const NO_MAX = Number.POSITIVE_INFINITY;
const clamp  = (n, min, max) => Math.min(Math.max(n, min), max);


/**
 * Controller for asynchronously applying pan and zoom transformations.
 * @class
 */
export default class PanAndZoom {

	/**
	 * Initialise a new pan/zoom controller.
	 *
	 * @param {Object} [args={}] - Initial property values
	 * @constructor
	 */
	constructor(args = {}){
		if("function" === typeof args)
			args = {update: args};
		let {
			panX         = 0,
			panY         = 0,
			minPanX      = NO_MIN,
			minPanY      = NO_MIN,
			maxPanX      = NO_MAX,
			maxPanY      = NO_MAX,
			
			zoom         = 1,
			minZoom      = 0,
			maxZoom      = NO_MAX,
			
			originX      = 0,
			originY      = 0,
			minOriginX   = NO_MIN,
			minOriginY   = NO_MIN,
			maxOriginX   = NO_MAX,
			maxOriginY   = NO_MAX,
			
			update       = () => {},
			updatePan    = () => {},
			updateZoom   = () => {},
			updateOrigin = () => {},
			updateDelay  = 0,
			updateEarly  = true,
		} = args;

		const debounced = {
			update:       null,
			updatePan:    null,
			updateZoom:   null,
			updateOrigin: null,
		};

		Object.defineProperties(this, {

			/**
			 * 3x3 affine transform matrix composed from the current
			 * values of the instance's pan and zoom properties.
			 *
			 * @property {Number[]} transform
			 * @readonly
			 */
			transform: {
				get: () => this.mergeMatrices([
					1, 0, panX,
					0, 1, panY,
					0, 0, 1,
				], [
					1, 0, originX,
					0, 1, originY,
					0, 0, 1,
				], [
					zoom, 0,    0,
					0,    zoom, 0,
					0,    0,    1,
				], [
					1, 0, -originX,
					0, 1, -originY,
					0, 0, 1,
				]),
			},


			/* Section: Panning */

			/**
			 * An array containing the values of `panX` and `panY`.
			 * @property {Number[]} pan
			 * @default [0,0]
			 */
			pan: {
				get: () => [panX, panY],
				set: to => {
					const fromX = panX;
					const fromY = panY;
					const toX   = clamp(+to[0] || 0, minPanX, maxPanX);
					const toY   = clamp(+to[1] || 0, minPanY, maxPanY);
					if(toX !== fromX || toY !== fromY){
						panX = toX;
						panY = toY;
						this.updatePan([fromX, fromY], [toX, toY]);
						this.update();
					}
				},
			},

			/**
			 * Horizontal pan offset.
			 * @property {Number} panX
			 * @default 0
			 */
			panX: {
				get: () => panX,
				set: to => {
					const from = panX;
					to = clamp(+to || 0, minPanX, maxPanX);
					if(to !== from){
						panX = to;
						this.updatePan([from, panY], [to, panY]);
						this.update();
					}
				},
			},

			/**
			 * Vertical pan offset.
			 * @property {Number} panY
			 * @default 0
			 */
			panY: {
				get: () => panY,
				set: to => {
					const from = panY;
					to = clamp(+to || 0, minPanY, maxPanY);
					if(to !== from){
						panY = to;
						this.updatePan([panX, from], [panX, to]);
						this.update();
					}
				},
			},
			
			/**
			 * Minimum possible `panX` value.
			 * @property {Number} minPanX
			 * @default Number.NEGATIVE_INFINITY
			 */
			minPanX: {
				get: () => minPanX,
				set: to => {
					minPanX = Math.min(+to || 0, maxPanX);
					if(panX < minPanX)
						this.panX = minPanX;
				},
			},
			
			/**
			 * Minimum possible `panY` value.
			 * @property {Number} minPanY
			 * @default Number.NEGATIVE_INFINITY
			 */
			minPanY: {
				get: () => minPanY,
				set: to => {
					minPanY = Math.min(+to || 0, maxPanY);
					if(panY < minPanY)
						this.panY = minPanY;
				},
			},
			
			/**
			 * Maximum possible `panX` value.
			 * @property {Number} maxPanX
			 * @default Number.POSITIVE_INFINITY
			 */
			maxPanX: {
				get: () => maxPanX,
				set: to => {
					maxPanX = Math.max(+to || 0, minPanX);
					if(panX > maxPanX)
						this.panX = maxPanX;
				},
			},
			
			/**
			 * Maximum possible `panY` value.
			 * @property {Number} maxPanY
			 * @default Number.POSITIVE_INFINITY
			 */
			maxPanY: {
				get: () => maxPanY,
				set: to => {
					maxPanY = Math.max(+to || 0, minPanY);
					if(panY > maxPanY)
						this.panY = maxPanY;
				},
			},


			/* Section: Origin */
			
			/**
			 * An array containing the values of `originX` and `originY`.
			 * @property {Number[]} origin
			 * @default [0,0]
			 */
			origin: {
				get: () => [originX, originY],
				set: to => {
					const fromX = originX;
					const fromY = originY;
					const toX   = clamp(+to[0] || 0, minOriginX, maxOriginX);
					const toY   = clamp(+to[1] || 0, minOriginY, maxOriginY);
					if(toX !== fromX || toY !== fromY){
						originX = toX;
						originY = toY;
						this.updateOrigin([fromX, fromY], [toX, toY]);
						this.update();
					}
				},
			},

			/**
			 * Horizontal offset of transformation centre.
			 * @property {Number} originX
			 * @default 0
			 */
			originX: {
				get: () => originX,
				set: to => {
					const from = originX;
					to = clamp(+to || 0, minOriginX, maxOriginX);
					if(to !== from){
						originX = to;
						this.updateOrigin([from, originY], [to, originY]);
						this.update();
					}
				},
			},

			/**
			 * Vertical offset of transformation centre.
			 * @property {Number} originY
			 * @default 0
			 */
			originY: {
				get: () => originY,
				set: to => {
					const from = originY;
					to = clamp(+to || 0, minOriginY, maxOriginY);
					if(to !== from){
						originY = to;
						this.updateOrigin([originX, from], [originX, to]);
						this.update();
					}
				},
			},

			/**
			 * Minimum possible `originX` value.
			 * @property {Number} minOriginX
			 * @default Number.NEGATIVE_INFINITY
			 */
			minOriginX: {
				get: () => minOriginX,
				set: to => {
					minOriginX = Math.min(+to || 0, maxOriginX);
					if(originX < minOriginX)
						this.originX = minOriginX;
				},
			},

			/**
			 * Minimum possible `originY` value.
			 * @property {Number} minOriginY
			 * @default Number.NEGATIVE_INFINITY
			 */
			minOriginY: {
				get: () => minOriginY,
				set: to => {
					minOriginY = Math.min(+to || 0, maxOriginY);
					if(originY < minOriginY)
						this.originY = minOriginY;
				},
			},

			/**
			 * Maximum possible `originX` value.
			 * @property {Number} maxOriginX
			 * @default Number.POSITIVE_INFINITY 
			 */
			maxOriginX: {
				get: () => maxOriginX,
				set: to => {
					maxOriginX = Math.max(+to || 0, minOriginX);
					if(originX > maxOriginX)
						this.originX = maxOriginX;
				},
			},

			/**
			 * Maximum possible `originY` value.
			 * @property {Number} maxOriginY
			 * @default Number.POSITIVE_INFINITY
			 */
			maxOriginY: {
				get: () => maxOriginY,
				set: to => {
					maxOriginY = Math.max(+to || 0, minOriginY);
					if(originY > maxOriginY)
						this.originY = maxOriginY;
				},
			},


			/* Section: Zooming */

			/**
			 * Magnification amount, expressed as a multiplier.
			 * @property {Number} zoom
			 * @default 1.0
			 */
			zoom: {
				get: () => zoom,
				set: to => {
					const from = zoom;
					to = clamp(+to || 0, minZoom, maxZoom);
					if(to !== from){
						zoom = to;
						this.updateZoom(from, to);
						this.update();
					}
				},
			},
			
			/**
			 * Minimum possible `zoom` value.
			 * @property {Number} minZoom
			 * @default 0
			 */
			minZoom: {
				get: () => minZoom,
				set: to => {
					minZoom = Math.min(+to || 0, maxZoom);
					if(zoom < minZoom)
						this.zoom = minZoom;
				},
			},

			/**
			 * Maximum possible `zoom` value.
			 * @property {Number} maxZoom
			 * @default Number.POSITIVE_INFINITY
			 */
			maxZoom: {
				get: () => maxZoom,
				set: to => {
					maxZoom = Math.max(+to || 0, minZoom);
					if(zoom > maxZoom)
						this.zoom = maxZoom;
				},
			},


			/* Section: Callbacks */

			/**
			 * Callback to trigger each time a property is modified.
			 * @property {Function} update
			 * @default ()=>{}
			 */
			update: {
				get: () => debounced.update || update,
				set: to => {
					if("function" !== typeof to)
						return;
					update = to;
					debounced.update = this.debounce(to);
				},
			},

			/**
			 * Callback to trigger each time `originX` or `originY` are modified.
			 * @property {XYChangeCallback} updateOrigin
			 * @default ()=>{}
			 */
			updateOrigin: {
				get: () => debounced.updateOrigin || updateOrigin,
				set: to => {
					if("function" !== typeof to)
						return;
					update = to;
					debounced.updateOrigin = this.debounce(to);
				},
			},

			/**
			 * Callback to trigger each time `panX` or `panY` are modified.
			 * @property {XYChangeCallback} updatePan
			 * @default ()=>{}
			 */
			updatePan: {
				get: () => debounced.updatePan || updatePan,
				set: to => {
					if("function" !== typeof to)
						return;
					update = to;
					debounced.updatePan = this.debounce(to);
				},
			},

			/**
			 * Callback to trigger each time `zoom` is modified.
			 * @property {NumChangeCallback} updateZoom
			 * @default ()=>{}
			 */
			updateZoom: {
				get: () => debounced.updateZoom || updateZoom,
				set: to => {
					if("function" !== typeof to)
						return;
					update = to;
					debounced.updateZoom = this.debounce(to);
				},
			},

			/**
			 * Milliseconds to delay callbacks by when properties change.
			 * @property {Number} updateDelay
			 * @default 0
			 */
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

			/**
			 * Whether to fire callbacks before or after waiting
			 * for `updateDelay` milliseconds to elapse.
			 * @property {Boolean} updateEarly
			 * @default true
			 */
			updateEarly: {
				get: () => updateEarly,
				set: to => {
					const from = updateEarly;
					if((to = !!to) !== from){
						to = from;
						redebounce();
					}
				},
			},
		});
		
		// Sanitise initial values
		minPanX    = +minPanX       || 0;
		minPanY    = +minPanY       || 0;
		maxPanX    = +maxPanX       || 0;
		maxPanY    = +maxPanY       || 0;
		minZoom    = +minZoom       || 0;
		maxZoom    = +maxZoom       || 0;
		minOriginX = +minOriginX    || 0;
		maxOriginX = +maxOriginX    || 0;
		minOriginY = +minOriginY    || 0;
		maxOriginY = +maxOriginY    || 0;
		panX       = clamp(+panX    || 0, minPanX,    maxPanX);
		panY       = clamp(+panY    || 0, minPanY,    maxPanY);
		zoom       = clamp(+zoom    || 0, minZoom,    maxZoom);
		originX    = clamp(+originX || 0, minOriginX, maxOriginX);
		originY    = clamp(+originY || 0, minOriginY, maxOriginY);

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
			const m = this.mergeMatrices(this.transform, [
				1, 0, point[0],
				0, 1, point[1],
				0, 0, 1,
			]);
			results.push([m[2], m[5]]);
		}
		return results;
	}


	/**
	 * Concatenate two or more affine transformation matrices.
	 *
	 * @param  {Number[][]} matrices
	 * @return {Number[]}
	 */
	mergeMatrices(...matrices){
		let result = matrices[0] || [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1,
		];

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
		const asap  = this.updateEarly;
		if(limit < 0)
			return fn;
		let started, context, args, timing;
		function delayed(){
			const timeSince = Date.now() - started;
			if(timeSince >= limit){
				if(!asap) fn.apply(context, args);
				if(timing) clearTimeout(timing);
				timing = context = args = null;
			}
			else timing = setTimeout(delayed, limit - timeSince);
		}
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
	 * Iterate through a CSS/canvas-compatible subset of the current transform matrix.
	 * @example context.setTransform(...panAndZoom);
	 * @return {Number[6]}
	 */
	*[Symbol.iterator](){
		const [a, c, tx, b, d, ty] = this.transform;
		yield *[a, c, tx, b, d, ty];
	}


	/**
	 * Generate a CSS-compatible rendition of the current transform matrix.
	 * @example el.style.transform = panAndZoom;
	 * @return {String}
	 */
	toString(){
		return `matrix(${[...this].join()})`;
	}
}


/**
 * Callbacks triggered when modifying the X and/or Y ordinates of a property.
 * @callback {XYChangeCallback}
 * @param {Number[]} from - Array holding the previous X and Y values
 * @param {Number[]} to   - Array holding the updated X and Y values
 */

/**
 * Callback triggered when changing the value of a numeric property.
 * @callback {NumChangeCallback}
 * @param {Number} from - Former property value
 * @param {Number} to   - Updated property value
 */
