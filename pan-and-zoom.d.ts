/**
 * Instance properties which can be initialised by the constructor argument.
 */
declare interface IPanAndZoom {
	panX?:number;
	panY?:number;
	minPanX?:number;
	minPanY?:number;
	maxPanX?:number;
	maxPanY?:number;
	
	zoom?:number;
	minZoom?:number;
	maxZoom?:number;
	
	originX?:number;
	originY?:number;
	minOriginX?:number;
	minOriginY?:number;
	maxOriginX?:number;
	maxOriginY?:number;
	
	update?:function;
	updatePan?:function;
	updateZoom?:function;
	updateOrigin?:function;
	updateDelay?:number;
	updateEarly?:boolean;
}


const NO_MIN:number = Number.NEGATIVE_INFINITY;
const NO_MAX:number = Number.POSITIVE_INFINITY;

declare type Matrix = [
	number, number, number,
	number, number, number,
	number, number, number,
];

declare type Point = [number, number];

declare class PanAndZoom implements IPanAndZoom {
	constructor(args?: IPanAndZoom | Function);
	
	readonly transform: Matrix;
	applyTransform (points: Point[]): Point[];
	mergeMatrices  (matrices: Matrices[]): Matrix;
	debounce       (fn: Function): Function;
	
	pan:          Point;
	panX:         0;
	panY:         0;
	minPanX:      NO_MIN;
	minPanY:      NO_MIN;
	maxPanX:      NO_MAX;
	maxPanY:      NO_MAX;
	
	zoom:         1;
	minZoom:      0;
	maxZoom:      NO_MAX;
	
	origin:       Point;
	originX:      0;
	originY:      0;
	minOriginX:   NO_MIN;
	minOriginY:   NO_MIN;
	maxOriginX:   NO_MAX;
	maxOriginY:   NO_MAX;
	
	update        (): void;
	updatePan     (from: Point,  to: Point): void;
	updateZoom    (from: number, to: number): void;
	updateOrigin  (from: Point,  to: Point): void;
	updateDelay:  0;
	updateEarly:  true;
}

export = PanAndZoom;
