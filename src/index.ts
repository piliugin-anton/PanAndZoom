export interface IPanAndZoom {
	panX?: number;
	panY?: number;
	minPanX?: number;
	minPanY?: number;
	maxPanX?: number;
	maxPanY?: number;

	zoom?: number;
	minZoom?: number;
	maxZoom?: number;

	originX?: number;
	originY?: number;
	minOriginX?: number;
	minOriginY?: number;
	maxOriginX?: number;
	maxOriginY?: number;

	update?: UpdateEmptyFunction;
	updatePan?: UpdateTupleFunction;
	updateZoom?: UpdateSingleFunction;
	updateOrigin?: UpdateTupleFunction;
	updateDelay?: number;
	updateEarly?: boolean;
}

export type UpdateEmptyFunction = () => void;
export type UpdateSingleFunction = (from: number, to: number) => void;
export type UpdateTupleFunction = (from: [number, number], to: [number, number]) => void;

export interface IDebounced {
	update: UpdateEmptyFunction | null;
	updatePan: UpdateTupleFunction | null;
	updateZoom: UpdateSingleFunction | null;
	updateOrigin: UpdateTupleFunction | null;
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
	private _update: UpdateEmptyFunction;
	private _updatePan: UpdateTupleFunction;
	private _updateZoom: UpdateSingleFunction;
	private _updateOrigin: UpdateTupleFunction;

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
	 * @param {IPanAndZoom | UpdateEmptyFunction} [args={}] - Initial property values
	 * @constructor
	 */
	constructor(args: IPanAndZoom | UpdateEmptyFunction = {}) {
		if (typeof args === 'function') args = { update: args };

		const {
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

			// eslint-disable-next-line @typescript-eslint/no-empty-function
			update = () => {},
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			updatePan = () => {},
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			updateZoom = () => {},
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			updateOrigin = () => {},
			updateDelay = 0,
			updateEarly = true,
		} = args;

		this._minPanX = typeof minPanX !== 'number' ? this.NO_MIN : minPanX;
		this._minPanY = typeof minPanY !== 'number' ? this.NO_MIN : minPanY;
		this._maxPanX = typeof maxPanX !== 'number' ? this.NO_MAX : maxPanX;
		this._maxPanY = typeof maxPanY !== 'number' ? this.NO_MAX : maxPanY;
		this._minZoom = typeof minZoom !== 'number' ? 0 : minZoom;
		this._maxZoom = typeof maxZoom !== 'number' ? this.NO_MAX : maxZoom;
		this._minOriginX = typeof minOriginX !== 'number' ? this.NO_MIN : minOriginX;
		this._minOriginY = typeof minOriginY !== 'number' ? this.NO_MIN : minOriginY;
		this._maxOriginX = typeof maxOriginX !== 'number' ? this.NO_MAX : maxOriginX;
		this._maxOriginY = typeof maxOriginY !== 'number' ? this.NO_MAX : maxOriginY;

		this._panX = this.clamp(
			typeof panX !== 'number' || !Number.isFinite(panX) ? 0 : panX,
			this._minPanX,
			this._maxPanX
		);
		this._panY = this.clamp(
			typeof panY !== 'number' || !Number.isFinite(panY) ? 0 : panY,
			this._minPanY,
			this._maxPanY
		);
		this._zoom = this.clamp(
			typeof zoom !== 'number' || !Number.isFinite(zoom) ? 1 : zoom,
			this._minZoom,
			this._maxZoom
		);
		this._originX = this.clamp(
			typeof originX !== 'number' || !Number.isFinite(originX) ? 0 : originX,
			this._minOriginX,
			this._maxOriginX
		);
		this._originY = this.clamp(
			typeof originY !== 'number' || !Number.isFinite(originY) ? 0 : originY,
			this._minOriginY,
			this._maxOriginY
		);

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		this._update = typeof update === 'function' ? update : () => {};
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		this._updatePan = typeof updatePan === 'function' ? updatePan : () => {};
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		this._updateZoom = typeof updateZoom === 'function' ? updateZoom : () => {};
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		this._updateOrigin = typeof updateOrigin === 'function' ? updateOrigin : () => {};
		this._updateDelay = Number.isInteger(updateDelay) ? updateDelay : 0;
		this._updateEarly = typeof updateEarly === 'boolean' ? updateEarly : true;

		this.redebounce();
	}

	/**
	 * 3x3 affine transform matrix composed from the current
	 * values of the instance's pan and zoom properties.
	 *
	 * @property {Matrix} transform
	 * @readonly
	 */
	get transform (): Matrix {
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
	*[Symbol.iterator] (): IterableIterator<number> {
		const [a, c, tx, b, d, ty] = this.transform;

		yield *[a, b, c, d, tx, ty];
	}

	get pan (): [number, number] {
		return [this._panX, this._panY];
	}

	set pan (to: [number, number]) {
		const fromX = this._panX;
		const fromY = this._panY;
		const toX = this.clamp(
			Number.isFinite(to[0]) ? to[0] : 0,
			this._minPanX,
			this._maxPanX
		);
		const toY = this.clamp(
			Number.isFinite(to[1]) ? to[1] : 0,
			this._minPanY,
			this._maxPanY
		);

		if (toX !== fromX || toY !== fromY) {
			this._panX = toX;
			this._panY = toY;
			this.updatePan([fromX, fromY], [toX, toY]);
			this.update();
		}
	}

	get panX (): number {
		return this._panX;
	}

	set panX (to: number) {
		const from = this._panX;
		to = this.clamp(
			Number.isFinite(to) ? to : 0,
			this._minPanX,
			this._maxPanX
		);

		if (to !== from) {
			this._panX = to;
			this.updatePan([from, this._panY], [to, this._panY]);
			this.update();
		}
	}

	get panY (): number {
		return this._panY;
	}

	set panY (to: number) {
		const from = this._panY;
		to = this.clamp(
			Number.isFinite(to) ? to : 0,
			this._minPanY,
			this._maxPanY
		);
		if (to !== from) {
			this._panY = to;
			this.updatePan([this._panX, from], [this._panX, to]);
			this.update();
		}
	}

	get minPanX (): number {
		return this._minPanX;
	}

	set minPanX (to: number) {
		this._minPanX = Math.min(typeof to === 'number' && !Number.isNaN(to) ? to : 0, this._maxPanX);
		if (this._panX < this._minPanX) this.panX = this._minPanX;
	}

	get minPanY (): number {
		return this._minPanY;
	}

	set minPanY (to: number) {
		this._minPanY = Math.min(typeof to === 'number' && !Number.isNaN(to) ? to : 0, this._maxPanY);
		if (this._panY < this._minPanY) this.panY = this._minPanY;
	}

	get maxPanX (): number {
		return this._maxPanX;
	}

	set maxPanX (to: number) {
		this._maxPanX = Math.max(typeof to === 'number' && !Number.isNaN(to) ? to : 0, this._minPanX);
		if (this._panX > this._maxPanX) this.panX = this._maxPanX;
	}

	get maxPanY (): number {
		return this._maxPanY;
	}

	set maxPanY (to: number) {
		this._maxPanY = Math.max(typeof to === 'number' && !Number.isNaN(to) ? to : 0, this._minPanY);
		if (this._panY > this._maxPanY) this.panY = this._maxPanY;
	}

	get origin (): [number, number] {
		return [this._originX, this._originY];
	}

	set origin (to: number[]) {
		const fromX = this._originX;
		const fromY = this._originY;
		const toX = this.clamp(
			Number.isFinite(to[0]) ? to[0] : 0,
			this._minOriginX,
			this._maxOriginX
		);
		const toY = this.clamp(
			Number.isFinite(to[1]) ? to[1] : 0,
			this._minOriginY,
			this._maxOriginY
		);
		if (toX !== fromX || toY !== fromY) {
			this._originX = toX;
			this._originY = toY;
			this.updateOrigin([fromX, fromY], [toX, toY]);
			this.update();
		}
	}

	get originX (): number {
		return this._originX;
	}

	set originX (to: number) {
		const from = this._originX;
		to = this.clamp(
			typeof to === 'number' && Number.isFinite(to) ? to : 0,
			this._minOriginX,
			this._maxOriginX
		);
		if (to !== from) {
			this._originX = to;
			this.updateOrigin([from, this._originY], [to, this._originY]);
			this.update();
		}
	}

	get originY (): number {
		return this._originY;
	}

	set originY (to: number) {
		const from = this._originY;
		to = this.clamp(
			typeof to === 'number' && Number.isFinite(to) ? to : 0,
			this._minOriginY,
			this._maxOriginY
		);
		if (to !== from) {
			this._originY = to;
			this.updateOrigin([this._originX, from], [this._originX, to]);
			this.update();
		}
	}

	get minOriginX (): number {
		return this._minOriginX;
	}

	set minOriginX (to: number) {
		this._minOriginX = Math.min(
			typeof to === 'number' && !Number.isNaN(to) ? to : 0,
			this._maxOriginX
		);
		if (this._originX < this._minOriginX) this.originX = this._minOriginX;
	}

	get minOriginY (): number {
		return this._minOriginY;
	}

	set minOriginY (to: number) {
		this._minOriginY = Math.min(
			typeof to === 'number' && !Number.isNaN(to) ? to : 0,
			this._maxOriginY
		);
		if (this._originY < this._minOriginY) this.originY = this._minOriginY;
	}

	get maxOriginX (): number {
		return this._maxOriginX;
	}

	set maxOriginX (to: number) {
		this._maxOriginX = Math.max(
			typeof to === 'number' && !Number.isNaN(to) ? to : 0,
			this._minOriginX
		);
		if (this._originX > this._maxOriginX) this.originX = this._maxOriginX;
	}

	get maxOriginY (): number {
		return this._maxOriginY;
	}

	set maxOriginY (to: number) {
		this._maxOriginY = Math.max(
			typeof to === 'number' && !Number.isNaN(to) ? to : 0,
			this._minOriginY
		);
		if (this._originY > this._maxOriginY) this.originY = this._maxOriginY;
	}

	get zoom (): number {
		return this._zoom;
	}

	set zoom (to: number) {
		const from = this._zoom;
		to = this.clamp(
			Number.isFinite(to) ? to : 0,
			this._minZoom,
			this._maxZoom
		);
		if (to !== from) {
			this._zoom = to;
			this.updateZoom(from, to);
			this.update();
		}
	}

	get minZoom (): number {
		return this._minZoom;
	}

	set minZoom (to: number) {
		this._minZoom = Math.min(typeof to === 'number' && !Number.isNaN(to) ? to : 0, this._maxZoom);
		if (this._zoom < this._minZoom) this.zoom = this._minZoom;
	}

	get maxZoom (): number {
		return this._maxZoom;
	}

	set maxZoom (to: number) {
		this._maxZoom = Math.max(typeof to === 'number' && !Number.isNaN(to) ? to : 0, this._minZoom);
		if (this._zoom > this._maxZoom) this.zoom = this._maxZoom;
	}

	get update (): UpdateEmptyFunction {
		return typeof this.debounced.update === 'function'
			? this.debounced.update
			: this._update;
	}

	set update (to: UpdateEmptyFunction) {
		if (typeof to !== 'function') return;
		this._update = to;
		this.debounced.update = this.debounce(to) as UpdateEmptyFunction;
	}

	get updateOrigin (): UpdateTupleFunction {
		return typeof this.debounced.updateOrigin === 'function'
			? this.debounced.updateOrigin
			: this._updateOrigin;
	}

	set updateOrigin (to: UpdateTupleFunction) {
		if(typeof to !== 'function') return;
		this._updateOrigin = to;
		this.debounced.updateOrigin = this.debounce(to) as UpdateTupleFunction;
	}

	get updatePan (): UpdateTupleFunction {
		return typeof this.debounced.updatePan === 'function'
			? this.debounced.updatePan
			: this._updatePan;
	}

	set updatePan (to: UpdateTupleFunction) {
		if (typeof to !== 'function') return;
		this._updatePan = to;
		this.debounced.updatePan = this.debounce(to) as UpdateTupleFunction;
	}

	get updateZoom (): UpdateSingleFunction {
		return typeof this.debounced.updateZoom === 'function'
			? this.debounced.updateZoom
			: this._updateZoom;
	}

	set updateZoom (to: UpdateSingleFunction) {
		if (typeof to !== 'function') return;
		this._updateZoom = to;
		this.debounced.updateZoom = this.debounce(to) as UpdateSingleFunction;
	}

	get updateDelay (): number {
		return this._updateDelay;
	}

	set updateDelay (to: number) {
		const from = this._updateDelay;
		to = Math.max(-1, Number.isFinite(to) ? to : 0);
		if (to !== from) {
			this._updateDelay = from;
			this.redebounce();
		}
	}

	get updateEarly (): boolean {
		return this._updateEarly;
	}

	set updateEarly (to: boolean) {
		const from = this._updateEarly;
		if (typeof to === 'boolean' && to !== from) {
			this._updateEarly = from;
			this.redebounce();
		}
	}

	private redebounce (): void {
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
	applyTransform (points: number[][]): number[][] {
		const results: number[][] = [];
		const { length } = points;
		for (let i = 0; i < length; i++) {
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
	mergeMatrices (...matrices: Matrix[]): Matrix {
		let result =
			(Array.isArray(matrices[0]) && 9 === matrices[0].length)
				? matrices[0]
				: ([1, 0, 0, 0, 1, 0, 0, 0, 1] as Matrix);

		if (matrices.length < 2) return result;

		const { length } = matrices;
		for (let i = 1; i < length; ++i) {
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

	private clamp (n: number, min: number, max: number): number {
		return Math.min(Math.max(n, min), max);
	}

	/**
	 * Stop a callback from firing too quickly.
	 *
	 * @param  {Function} fn
	 * @return {Function}
	 */
	private debounce<T extends (...args: Parameters<T>) => void> (fn: T): UpdateEmptyFunction | UpdateSingleFunction | UpdateTupleFunction {
		const limit = this._updateDelay;
		const asap = this._updateEarly;

		if (limit < 0) return fn;

		let started: number, inputArgs: Parameters<T> | null, timing: ReturnType<typeof setTimeout> | null;

		const delayed = (): void => {
			const timeSince = Date.now() - started;
			if (timeSince >= limit) {
				if (!asap) fn.apply(this, inputArgs as Parameters<T>);
				if (timing !== null) clearTimeout(timing);
				timing = inputArgs = null;
			} else timing = setTimeout(delayed, limit - timeSince);
		}

		return (...args: Parameters<T>): void => {
			inputArgs = args
			if (limit === 0) return fn.apply(this, args);
			started = Date.now();
			if (timing === null || timing === undefined) {
				if (asap) fn.apply(this, args);
				timing = setTimeout(delayed, limit);
			}
		}
	}

	/**
	 * Generate a CSS-compatible rendition of the current transform matrix.
	 * @example el.style.transform = panAndZoom;
	 * @return {String}
	 */
	toString (): string {
		return `matrix(${[...this].join()})`;
	}
}
