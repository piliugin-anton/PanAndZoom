Pan and Zoom
============

Low-level interface for calculating pan and zoom transformations.
Ideal for CSS and HTML5 `<canvas>` transforms, or anywhere where
low overhead resize effects are needed.

Note this component won't make elements interactive for you. You
must configure this behaviour yourself (using your UI library of
choice). It does, however, simplify the task of calculating zoom
and pan effects in an efficient, object-oriented manner. Because
the component is environment agnostic, it can be used anywhere a
JavaScript module can be loaded.


Usage
-----

~~~shell
npm install --save pan-and-zoom
~~~

In your project's JavaScript:

~~~js
import { PanAndZoom } from "pan-and-zoom";

const paz = new PanAndZoom({

	// Callback fired after changing a `PanAndZoom' object's properties
	update(){
		const el = document.getElementById("some-huge-thing");
		el.style.transform = paz; // Calls paz.toString() implicitly
	},
});

paz.zoom = 1.5; // +150% scale
paz.panX = 300; // Move horizontally 300 units
~~~

Or in Node.js:

~~~js
const { PanAndZoom } = require("pan-and-zoom");

const paz = new PanAndZoom({
	update(){
		console.log(paz.toCanvasMatrix())
	},
});

paz.zoom = 1.5; // +150% scale
paz.panX = 300; // Move horizontally 300 units
~~~


Properties
----------
Changing any one of these properties causes a call to `update()` to be queued,
which is fired asynchronously. This allows multiple properties to be changed
with only one invocation fired, reducing overhead and potentially expensive
DOM transactions.

<!-- TODO: Use a real documentation language instead of Markdown -->

### Panning

#### `pan`
**Default:**         `[0, 0]`  
**Type:**            [`Array`][]  
**Fires callbacks:** [`updatePan`][], [`update`][]

An array containing the values of [`panX`][] and [`panY`][].


#### `panX`
**Default:**         `0`  
**Type:**            [`Number`][]  
**Fires callbacks:** [`updatePan`][], [`update`][]

Horizontal pan offset.


#### `panY`
**Default:**         `0`  
**Type:**            [`Number`][]  
**Fires callbacks:** [`updatePan`][], [`update`][]

Vertical pan offset.


#### `minPanX`
**Default:**         [`Number.NEGATIVE_INFINITY`][]  
**Type:**            [`Number`][]

Minimum possible [`panX`][] value.


#### `minPanY`
**Default:**         [`Number.NEGATIVE_INFINITY`][]  
**Type:**            [`Number`][]

Minimum possible [`panY`][] value.


#### `maxPanX`
**Default:**         [`Number.POSITIVE_INFINITY`][]  
**Type:**            [`Number`][]

Maximum possible [`panX`][] value.


#### `maxPanY`
**Default:**         [`Number.POSITIVE_INFINITY`][]  
**Type:**            [`Number`][]

Maximum possible [`panY`][] value.


### Transform origin

#### `origin`
**Default:**         `[0, 0]`  
**Type:**            [`Array`][]  
**Fires callbacks:** [`updateOrigin`][], [`update`][]

An array containing the values of [`originX`][] and [`originY`][].


#### `originX`
**Default:**         `0`  
**Type:**            [`Number`][]  
**Fires callbacks:** [`updateOrigin`][], [`update`][]

Horizontal ordinate of transformation centre.


#### `originY`
**Default:**         `0`  
**Type:**            [`Number`][]  
**Fires callbacks:** [`updateOrigin`][], [`update`][]

Vertical ordinate of transformation centre.


#### `minOriginX`
**Default:**        [`Number.NEGATIVE_INFINITY`][]  
**Type:**           [`Number`][]

Minimum possible [`originX`][] value.


#### `minOriginY`
**Default:**        [`Number.NEGATIVE_INFINITY`][]  
**Type:**           [`Number`][]

Minimum possible [`originY`][] value.


#### `maxOriginX`
**Default:**        [`Number.POSITIVE_INFINITY`][]  
**Type:**           [`Number`][]

Maximum possible [`originX`][] value.


#### `maxOriginY`
**Default:**        [`Number.POSITIVE_INFINITY`][]  
**Type:**           [`Number`][]

Maximum possible [`originY`][] value.


### Zooming

#### `zoom`
**Default:**         `1.0`  
**Type:**            [`Number`][]  
**Fires callbacks:** [`updateZoom`][], [`update`][]

Magnification amount, expressed as a positive multiplier.


#### `minZoom`
**Default:**         `0`  
**Type:**            [`Number`][]

Minimum possible [`zoom`][] value.


#### `maxZoom`
**Default:**         [`Number.POSITIVE_INFINITY`][]  
**Type:**            [`Number`][]

Maximum possible [`zoom`][] value.


### Callbacks

#### `update`
**Default:**         `() => {}` (noop)  
**Type:**            [`Function`][]  
**Arguments:**       None

Callback to trigger each time a property is modified.


#### `updateOrigin`
**Default:**         `() => {}` (noop)  
**Type:**            [`Function`][]  
**Arguments:**       `[fromX, fromY]`, `[toX, toY]`

Callback to trigger each time [`originX`][] or [`originY`][] are modified.


#### `updatePan`
**Default:**         `() => {}` (noop)  
**Type:**            [`Function`][]  
**Arguments:**       `[fromX, fromY]`, `[toX, toY]`

Callback to trigger each time [`panX`][] or [`panY`][] are modified.


#### `updateZoom`
**Default:**         `() => {}` (noop)  
**Type:**            [`Function`][]  
**Arguments:**       `from`, `to`

Callback to trigger each time [`zoom`][] is modified.


#### `updateDelay`
**Default:**         `0`  
**Type:**            [`Number`][]

Milliseconds to delay callbacks by whenever properties change.
Used by the class's [`debounce`][] method when throttling callback functions.


#### `updateEarly`
**Default:**        `true`  
**Type:**           [`Boolean`][]

Whether to fire callbacks before or after waiting for [`updateDelay`][]
milliseconds to elapse. This property only makes sense when `updateDelay`
is assigned a value greater than zero, and when multiple successive updates
are expected (such as during a click-and-drag operation).


### Misc

#### `transform`
**Type:** [`Array`][]  
**Read-only**

A 3x3 affine transform matrix composed from the current values of the
instance's [`pan`][] and [`zoom`][] properties.




Methods
-------
The majority of methods described below are used internally, but exposed for
general-purpose usage.


### Constructor
Initialise a new pan/zoom controller.

*	`args` **(Optional)**  
	Initial property values, which may be any of the items
	described under [Properties](#properties).


<a name="applytransform"></a>
### `applyTransform(points)`
Apply the current transformation matrix to an array of points:

*	`points`  
	An array of points, each expressed as a pair of [`Number`][] values.

Returns a new array of points with modified values.

__Example:__
~~~js
paz.zoom = 2.0; // 200% scale
paz.applyTransform([
	[0,   0],
	[100, 0],   // Coordinates representing
	[100, 100], // a 100px-sized square.
	[0,   100],
]) == [
	[0,   0],
	[200, 0],   // Returns new coordinates for
	[200, 200], // a 200px-sized square.
	[0,   200],
];
~~~


<a name="mergematrices"></a>
### `mergeMatrices(...matrices)`
Concatenate two or more affine transformation matrices.

*	`...matrices`  
	Two or more 3x3-sized matrices (each expressed as an
	array of nine [`Number`][] values).

Returns the concatenation of the given matrices as a new array.

__Example:__
~~~js
paz.mergeMatrices(
	[1, 0, 100, // Pan X: 100
	 0, 1, 400, // Pan Y: 400
	 0, 0, 1],
	
	[2, 0, 0,   // 200% scale
	 0, 2, 0,
	 0, 0, 1],
) == [
	2, 0, 100,
	0, 2, 400,
	0, 0, 1,
];
~~~

<a name="tocanvasmatrix"></a>
### `toCanvasMatrix()`
Get canvas compatible transformation matrix (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform)

Returns numeric array with 6 elements.

__Example:__
~~~js
const canvasRenderingContext2D = canvas.getContext("2d");
canvasRenderingContext2D.setTransfrom(...paz.toCanvasMatrix());
~~~


<a name="debounce"></a>
### `debounce(fn)`
Stop a callback function from firing too quickly.

*	`fn`  
	A function with which to throttle, using the instance's
	[`updateDelay`][] and [`updateEarly`][] properties.

Returns a throttled version of the supplied function.


[Referenced links]:_____________________________________________
[`transform`]:    #transform
[`pan`]:          #pan
[`panX`]:         #panx
[`panY`]:         #pany
[`minPanX`]:      #minpanx
[`minPanY`]:      #minpany
[`maxPanX`]:      #maxpanx
[`maxPanY`]:      #maxpany
[`origin`]:       #origin
[`originX`]:      #originx
[`originY`]:      #originy
[`minOriginX`]:   #minoriginx
[`minOriginY`]:   #minoriginy
[`maxOriginX`]:   #maxoriginx
[`maxOriginY`]:   #maxoriginy
[`zoom`]:         #zoom
[`minZoom`]:      #minzoom
[`maxZoom`]:      #maxzoom
[`update`]:       #update
[`updateOrigin`]: #updateorigin
[`updatePan`]:    #updatepan
[`updateZoom`]:   #updatezoom
[`updateDelay`]:  #updatedelay
[`updateEarly`]:  #updateearly
[`debounce`]:     #debounce

[`Array`]:        http://mdn.io/Array
[`Boolean`]:      http://mdn.io/Boolean
[`Function`]:     http://mdn.io/Function
[`Number`]:       http://mdn.io/Number
[`Number.NEGATIVE_INFINITY`]: http://mdn.io/Number.NEGATIVE_INFINITY
[`Number.POSITIVE_INFINITY`]: http://mdn.io/Number.POSITIVE_INFINITY
