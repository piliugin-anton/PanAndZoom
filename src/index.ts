export interface IPanAndZoom {
	panX?: number | string;
	panY?: number | string;
	minPanX?: number | string;
	minPanY?: number | string;
	maxPanX?: number | string;
	maxPanY?: number | string;

	zoom?: number | string;
	minZoom?: number | string;
	maxZoom?: number | string;

	originX?: number | string;
	originY?: number | string;
	minOriginX?: number | string;
	minOriginY?: number | string;
	maxOriginX?: number | string;
	maxOriginY?: number | string;

	update?: Function;
	updatePan?: Function;
	updateZoom?: Function;
	updateOrigin?: Function;
	updateDelay?: number;
	updateEarly?: boolean;
}

export interface IDebounced {
	update: Function | null;
	updatePan: Function | null;
	updateZoom: Function | null;
	updateOrigin: Function | null;
}

export type Matrix = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number
];

/**
 * Controller for asynchronously applying pan and zoom transformations.
 * @class
 */
export class PanAndZoom implements Iterable<number> {
	private _panX: number;
	private _panY: number;
	private _minPanX: number;
	private _minPanY: number;
	private _maxPanX: number;
	private _maxPanY: number;
	private _zoom: number;
	private _minZoom: number;
	private _maxZoom: number;
	private _originX: number;
	private _originY: number;
	private _minOriginX: number;
	private _minOriginY: number;
	private _maxOriginX: number;
	private _maxOriginY: number;
	private _updateDelay: number;
	private _updateEarly: boolean;
	private _update: Function;
	private _updatePan: Function;
	private _updateZoom: Function;
	private _updateOrigin: Function;

	private debounced: IDebounced = {
		update: null,
		updatePan: null,
		updateZoom: null,
		updateOrigin: null,
	};

	private readonly NO_MIN = Number.NEGATIVE_INFINITY;
	private readonly NO_MAX = Number.POSITIVE_INFINITY;

	/**
	 * Initialise a new pan/zoom controller.
	 *
	 * @param {IPanAndZoom | Function} [args={}] - Initial property values
	 * @constructor
	 */
	constructor(args: IPanAndZoom | Function = {}) {
		if("function" === typeof args) args = { update: args };

		let {
			panX = 0,
			panY = 0,
			minPanX = this.NO_MIN,
			minPanY = this.NO_MIN,
			maxPanX = this.NO_MAX,
			maxPanY = this.NO_MAX,

			zoom = 1,
			minZoom = 0,
			maxZoom = this.NO_MAX,

			originX = 0,
			originY = 0,
			minOriginX = this.NO_MIN,
			minOriginY = this.NO_MIN,
			maxOriginX = this.NO_MAX,
			maxOriginY = this.NO_MAX,

			update = () => {},
			updatePan = () => {},
			updateZoom = () => {},
			updateOrigin = () => {},
			updateDelay = 0,
			updateEarly = true,
		} = args;

		minPanX = +minPanX;
		this._minPanX = Number.isNaN(minPanX) ? this.NO_MIN : minPanX;

		minPanY = +minPanY;
		this._minPanY = Number.isNaN(minPanY) ? this.NO_MIN : minPanY;

		maxPanX = +maxPanX;
		this._maxPanX = Number.isNaN(maxPanX) ? this.NO_MAX : maxPanX;

		maxPanY = +maxPanY;
		this._maxPanY = Number.isNaN(maxPanY) ? this.NO_MAX : maxPanY;


		minZoom = +minZoom;
		this._minZoom = Number.isNaN(minZoom) ? 0 : minZoom;

		maxZoom = +maxZoom;
		this._maxZoom = Number.isNaN(maxZoom) ? this.NO_MAX : maxZoom;

		minOriginX = +minOriginX;
		this._minOriginX = Number.isNaN(minOriginX) ? this.NO_MIN : minOriginX;

		minOriginY = +minOriginY;
		this._minOriginY = Number.isNaN(minOriginY) ? this.NO_MIN : minOriginY;

		maxOriginX = +maxOriginX;
		this._maxOriginX = Number.isNaN(maxOriginX) ? this.NO_MAX : maxOriginX;

		maxOriginY = +maxOriginY;
		this._maxOriginY = Number.isNaN(maxOriginY) ? this.NO_MAX : maxOriginY;

		panX = +panX;
		this._panX = this.clamp(
			Number.isFinite(panX) ? panX : 0,
			this._minPanX,
			this._maxPanX
		);

		panY = +panY;
		this._panY = this.clamp(
			Number.isFinite(panY) ? panY : 0,
			this._minPanY,
			this._maxPanY
		);

		zoom = +zoom;
		this._zoom = this.clamp(
			Number.isFinite(zoom) ? zoom : 1,
			this._minZoom,
			this._maxZoom
		);

		originX = +originX;
		this._originX = this.clamp(
			Number.isFinite(originX) ? originX : 0,
			this._minOriginX,
			this._maxOriginX
		);

		originY = +originY;
		this._originY = this.clamp(
			Number.isFinite(originY) ? originY : 0,
			this._minOriginY,
			this._maxOriginY
		);

		this._update = "function" === typeof update ? update : () => {};

		this._updatePan =
			"function" === typeof updatePan ? updatePan : () => {};

		this._updateZoom =
			"function" === typeof updateZoom ? updateZoom : () => {};

		this._updateOrigin =
			"function" === typeof updateOrigin ? updateOrigin : () => {};

		updateDelay = +updateDelay;
		this._updateDelay = Number.isInteger(updateDelay) && updateDelay > 0 ? updateDelay : 0;

		this._updateEarly =
			"boolean" === typeof updateEarly ? updateEarly : true;

		this.redebounce();
	}

	/**
	 * 3x3 affine transform matrix composed from the current
	 * values of the instance's pan and zoom properties.
	 *
	 * @property {Matrix} transform
	 * @readonly
	 */
	get transform(): Matrix {
		return this.mergeMatrices(
			[
				1, 0, this._panX,
				0, 1, this._panY,
				0, 0, 1,
			],
			[
				1, 0, this._originX,
				0, 1, this._originY,
				0, 0, 1,
			],
			[
				this._zoom, 0, 0,
				0, this._zoom, 0,
				0, 0, 1,
			],
			[
				1, 0, -this._originX,
				0, 1, -this._originY,
				0, 0, 1,
			]
		);
	}

	/**
	 * Iterate through a CSS/canvas-compatible subset of the current transform matrix.
	 * @example context.setTransform(...panAndZoom);
	 * @return {Number[6]}
	 */
	*[Symbol.iterator](): IterableIterator<number> {
		const [a, c, tx, b, d, ty] = this.transform;
		yield *[a, b, c, d, tx, ty];
	}

	get pan(): [number, number] {
		return [this._panX, this._panY];
	}

	set pan(to: string[] | number[]) {
		const fromX = this._panX;
		const fromY = this._panY;
		const toXNumber = +to[0];
		const toYNumber = +to[1];
		const toX = this.clamp(
			Number.isFinite(toXNumber) ? toXNumber : 0,
			this._minPanX,
			this._maxPanX
		);
		const toY = this.clamp(
			Number.isFinite(toYNumber) ? toYNumber : 0,
			this._minPanY,
			this._maxPanY
		);
		if(toX !== fromX || toY !== fromY) {
			this._panX = toX;
			this._panY = toY;
			this.updatePan([fromX, fromY], [toX, toY]);
			this.update();
		}
	}

	get panX(): number {
		return this._panX;
	}

	set panX(to: number | string) {
		const from = this._panX;
		to = +to;
		to = this.clamp(
			Number.isFinite(to) ? to : 0,
			this._minPanX,
			this._maxPanX
		);
		if(to !== from) {
			this._panX = to;
			this.updatePan([from, this._panY], [to, this._panY]);
			this.update();
		}
	}

	get panY(): number {
		return this._panY;
	}

	set panY(to: number | string) {
		const from = this._panY;
		to = +to;
		to = this.clamp(
			Number.isFinite(to) ? to : 0,
			this._minPanY,
			this._maxPanY
		);
		if(to !== from) {
			this._panY = to;
			this.updatePan([this._panX, from], [this._panX, to]);
			this.update();
		}
	}

	get minPanX(): number {
		return this._minPanX;
	}

	set minPanX(to: number | string) {
		to = +to;
		this._minPanX = Math.min(!Number.isNaN(to) ? to : 0, this._maxPanX);
		if(this._panX < this._minPanX) this.panX = this._minPanX;
	}

	get minPanY(): number {
		return this._minPanY;
	}

	set minPanY(to: number | string) {
		to = +to;
		this._minPanY = Math.min(!Number.isNaN(to) ? to : 0, this._maxPanY);
		if(this._panY < this._minPanY) this.panY = this._minPanY;
	}

	get maxPanX(): number {
		return this._maxPanX;
	}

	set maxPanX(to: number | string) {
		to = +to;
		this._maxPanX = Math.max(!Number.isNaN(to) ? to : 0, this._minPanX);
		if(this._panX > this._maxPanX) this.panX = this._maxPanX;
	}

	get maxPanY(): number {
		return this._maxPanY;
	}

	set maxPanY(to: number | string) {
		to = +to;
		this._maxPanY = Math.max(!Number.isNaN(to) ? to : 0, this._minPanY);
		if(this._panY > this._maxPanY) this.panY = this._maxPanY;
	}

	get origin(): [number, number] {
		return [this._originX, this._originY];
	}

	set origin(to: string[] | number[]) {
		const fromX = this._originX;
		const fromY = this._originY;
		const toXNumber = +to[0];
		const toYNumber = +to[1];
		const toX = this.clamp(
			Number.isFinite(toXNumber) ? toXNumber : 0,
			this._minOriginX,
			this._maxOriginX
		);
		const toY = this.clamp(
			Number.isFinite(toYNumber) ? toYNumber : 0,
			this._minOriginY,
			this._maxOriginY
		);
		if(toX !== fromX || toY !== fromY) {
			this._originX = toX;
			this._originY = toY;
			this.updateOrigin([fromX, fromY], [toX, toY]);
			this.update();
		}
	}

	get originX(): number {
		return this._originX;
	}

	set originX(to: number | string) {
		const from = this._originX;
		to = +to;
		to = this.clamp(
			!Number.isNaN(to) ? to : 0,
			this._minOriginX,
			this._maxOriginX
		);
		if(to !== from) {
			this._originX = to;
			this.updateOrigin([from, this._originY], [to, this._originY]);
			this.update();
		}
	}

	get originY(): number {
		return this._originY;
	}

	set originY(to: number | string) {
		const from = this._originY;
		to = +to;
		to = this.clamp(
			!Number.isNaN(to) ? to : 0,
			this._minOriginY,
			this._maxOriginY
		);
		if(to !== from) {
			this._originY = to;
			this.updateOrigin([this._originX, from], [this._originX, to]);
			this.update();
		}
	}

	get minOriginX(): number {
		return this._minOriginX;
	}

	set minOriginX(to: number | string) {
		to = +to;
		this._minOriginX = Math.min(
			!Number.isNaN(to) ? to : 0,
			this._maxOriginX
		);
		if(this._originX < this._minOriginX) this.originX = this._minOriginX;
	}

	get minOriginY(): number {
		return this._minOriginY;
	}

	set minOriginY(to: number | string) {
		to = +to;
		this._minOriginY = Math.min(
			!Number.isNaN(to) ? to : 0,
			this._maxOriginY
		);
		if(this._originY < this._minOriginY) this.originY = this._minOriginY;
	}

	get maxOriginX(): number {
		return this._maxOriginX;
	}

	set maxOriginX(to: number | string) {
		to = +to;
		this._maxOriginX = Math.max(
			!Number.isNaN(to) ? to : 0,
			this._minOriginX
		);
		if(this._originX > this._maxOriginX) this.originX = this._maxOriginX;
	}

	get maxOriginY(): number {
		return this._maxOriginY;
	}

	set maxOriginY(to: number | string) {
		to = +to;
		this._maxOriginY = Math.max(
			!Number.isNaN(to) ? to : 0,
			this._minOriginY
		);
		if(this._originY > this._maxOriginY) this.originY = this._maxOriginY;
	}

	get zoom(): number {
		return this._zoom;
	}

	set zoom(to: number | string) {
		to = +to;
		const from = this._zoom;
		to = this.clamp(
			Number.isFinite(to) ? to : 0,
			this._minZoom,
			this._maxZoom
		);
		if(to !== from) {
			this._zoom = to;
			this.updateZoom(from, to);
			this.update();
		}
	}

	get minZoom(): number {
		return this._minZoom;
	}

	set minZoom(to: number | string) {
		to = +to;
		this._minZoom = Math.min(!Number.isNaN(to) ? to : 0, this._maxZoom);
		if(this._zoom < this._minZoom) this.zoom = this._minZoom;
	}

	get maxZoom(): number {
		return this._maxZoom;
	}

	set maxZoom(to: number | string) {
		to = +to;
		this._maxZoom = Math.max(!Number.isNaN(to) ? to : 0, this._minZoom);
		if(this._zoom > this._maxZoom) this.zoom = this._maxZoom;
	}

	get update(): Function {
		return "function" === typeof this.debounced.update
			? this.debounced.update
			: this._update;
	}

	set update(to: Function) {
		if("function" !== typeof to) return;
		this._update = to;
		this.debounced.update = this.debounce(to);
	}

	get updateOrigin(): Function {
		return "function" === typeof this.debounced.updateOrigin
			? this.debounced.updateOrigin
			: this._updateOrigin;
	}

	set updateOrigin(to: Function) {
		if("function" !== typeof to) return;
		this._updateOrigin = to;
		this.debounced.updateOrigin = this.debounce(to);
	}

	get updatePan(): Function {
		return "function" === typeof this.debounced.updatePan
			? this.debounced.updatePan
			: this._updatePan;
	}

	set updatePan(to: Function) {
		if("function" !== typeof to) return;
		this._updatePan = to;
		this.debounced.updatePan = this.debounce(to);
	}

	get updateZoom(): Function {
		return "function" === typeof this.debounced.updateZoom
			? this.debounced.updateZoom
			: this._updateZoom;
	}

	set updateZoom(to: Function) {
		if("function" !== typeof to) return;
		this._updateZoom = to;
		this.debounced.updateZoom = this.debounce(to);
	}

	get updateDelay(): number {
		return this._updateDelay;
	}

	set updateDelay(to: number) {
		const from = this._updateDelay;
		to = Math.max(-1, Number.isFinite(to) ? to : 0);
		if(to !== from) {
			this._updateDelay = from;
			this.redebounce();
		}
	}

	get updateEarly(): boolean {
		return this._updateEarly;
	}

	set updateEarly(to: boolean) {
		const from = this._updateEarly;
		if((to = !!to) !== from) {
			this._updateEarly = from;
			this.redebounce();
		}
	}

	private redebounce(): void {
		this.update = this._update;
		this.updateOrigin = this._updateOrigin;
		this.updatePan = this._updatePan;
		this.updateZoom = this._updateZoom;
	}

	/**
	 * Apply the current transformation matrix to an array of points.
	 *
	 * @param  {Number[]} points
	 * @return {Number[]}
	 */
	applyTransform(points: number[][]): number[][] {
		const results: number[][] = [];
		const { length } = points;
		for(let i = 0; i < length; i++) {
			const m = this.mergeMatrices(this.transform, [
				1, 0, points[i][0],
				0, 1, points[i][1],
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
	mergeMatrices(...matrices: Matrix[]): Matrix {
		let result =
			(Array.isArray(matrices[0]) && 9 === matrices[0].length)
				? matrices[0]
				: ([1, 0, 0, 0, 1, 0, 0, 0, 1] as Matrix);

		if(matrices.length < 2) return result;

		const { length } = matrices;
		for(let i = 1; i < length; ++i) {
			const [a, b, c, p, q, r, u, v, w] = result;

			const [A, B, C, P, Q, R, U, V, W] = matrices[i];

			result = [
				a * A + b * P + c * U,
				a * B + b * Q + c * V,
				a * C + b * R + c * W,
				p * A + q * P + r * U,
				p * B + q * Q + r * V,
				p * C + q * R + r * W,
				u * A + v * P + w * U,
				u * B + v * Q + w * V,
				u * C + v * R + w * W,
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
	private debounce(fn: Function): Function {
		const limit = this._updateDelay;
		const asap = this._updateEarly;

		if(limit < 0) return fn;

		let started: number, context: PanAndZoom | null, args: IArguments | null, timing: ReturnType<typeof setTimeout> | number | null;
		function delayed(): void {
			const timeSince = Date.now() - started;
			if(timeSince >= limit) {
				if(!asap) fn.apply(context, args);
				if(timing !== null) clearTimeout(timing);
				timing = context = args = null;
			}
			else timing = setTimeout(delayed, limit - timeSince);
		}
		// eslint-disable-next-line
		return function(this: PanAndZoom) {
			// eslint-disable-next-line
			context = this;
			// eslint-disable-next-line
			args = arguments;
			if(0 === limit) return fn.apply(context, args);
			started = Date.now();
			if(null === timing || undefined === timing) {
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
	toString(): string {
		return `matrix(${[...this].join()})`;
	}

	private clamp(n: number, min: number, max: number): number {
		return Math.min(Math.max(n, min), max);
	}
}
