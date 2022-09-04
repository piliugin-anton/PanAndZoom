/* eslint-disable no-undef */
import { PanAndZoom } from "../src/";

describe("PanAndZoom", () => {
	describe("Panning", () => {
		describe("Numeric properties", () => {
			it("initialises each ordinate to 0", () => {
				const paz = new PanAndZoom();
				expect(paz).to.have.property("panX").which.equals(0);
				expect(paz).to.have.property("panY").which.equals(0);
			});
			
			it("imposes no limits by default", () => {
				const paz = new PanAndZoom();
				expect(paz).to.have.property("minPanX").which.equals(Number.NEGATIVE_INFINITY);
				expect(paz).to.have.property("minPanY").which.equals(Number.NEGATIVE_INFINITY);
				expect(paz).to.have.property("maxPanX").which.equals(Number.POSITIVE_INFINITY);
				expect(paz).to.have.property("maxPanY").which.equals(Number.POSITIVE_INFINITY);
			});
			
			it("sets properties during initialisation", () => {
				const paz = new PanAndZoom({
					panX: 20,
					panY: 40,
					minPanX: -20,
					minPanY: -40,
					maxPanX: 120,
					maxPanY: 140,
				});
				expect(paz).to.have.property("panX").which.equals(20);
				expect(paz).to.have.property("panY").which.equals(40);
				expect(paz).to.have.property("minPanX").which.equals(-20);
				expect(paz).to.have.property("minPanY").which.equals(-40);
				expect(paz).to.have.property("maxPanX").which.equals(120);
				expect(paz).to.have.property("maxPanY").which.equals(140);
			});
			
			it("sets properties after initialisation", () => {
				const paz = new PanAndZoom();
				paz.panX = 20;
				paz.panY = 40;
				paz.minPanX = -20;
				paz.minPanY = -40;
				paz.maxPanX = 120;
				paz.maxPanY = 140;
				expect(paz).to.have.property("panX").which.equals(20);
				expect(paz).to.have.property("panY").which.equals(40);
				expect(paz).to.have.property("minPanX").which.equals(-20);
				expect(paz).to.have.property("minPanY").which.equals(-40);
				expect(paz).to.have.property("maxPanX").which.equals(120);
				expect(paz).to.have.property("maxPanY").which.equals(140);
			});
			
			it("clamps ordinates to their specified limits", () => {
				expect(new PanAndZoom({panX: -20, minPanX: 0}).panX).to.equal(0);
				expect(new PanAndZoom({panY: -20, minPanY: 0}).panY).to.equal(0);
				expect(new PanAndZoom({panX: +20, maxPanX: 5}).panX).to.equal(5);
				expect(new PanAndZoom({panY: +20, maxPanY: 5}).panY).to.equal(5);
				const paz = new PanAndZoom({
					minPanX: -100,
					maxPanX: +100,
					minPanY: -200,
					maxPanY: +200,
				});
				paz.panX =   50; expect(paz.panX).to.equal(50);
				paz.panX = +150; expect(paz.panX).to.equal(+100);
				paz.panX = -150; expect(paz.panX).to.equal(-100);
				paz.panY =   25; expect(paz.panY).to.equal(25);
				paz.panY = +250; expect(paz.panY).to.equal(+200);
				paz.panY = -250; expect(paz.panY).to.equal(-200);
			});
			
			it("clamps ordinates when limits are updated", () => {
				let paz = new PanAndZoom({panX: -100, panY: -100});
				paz.minPanX = 0; expect(paz.panX).to.equal(0);
				paz.minPanY = 0; expect(paz.panY).to.equal(0);
				
				paz = new PanAndZoom({panX: 150, panY: 150});
				paz.maxPanX = 100; expect(paz.maxPanX).to.equal(100);
				paz.maxPanY = 100; expect(paz.maxPanY).to.equal(100);
			});
			
			it("coerces values to numbers during initialisation", () => {
				const paz = new PanAndZoom({
					panX:    "10",
					panY:    "20",
					minPanX: "-100",
					minPanY: "-200",
					maxPanX: "+100",
					maxPanY: "+200",
				});
				expect(paz).to.have.property("panX").which.is.a("number").that.equals(10);
				expect(paz).to.have.property("panY").which.is.a("number").that.equals(20);
				expect(paz).to.have.property("minPanX").which.is.a("number").that.equals(-100);
				expect(paz).to.have.property("minPanY").which.is.a("number").that.equals(-200);
				expect(paz).to.have.property("maxPanX").which.is.a("number").that.equals(+100);
				expect(paz).to.have.property("maxPanY").which.is.a("number").that.equals(+200);
			});
			
			it("coerces values to numbers during assignment", () => {
				const paz   = new PanAndZoom();
				paz.panX    = "-20";
				paz.panY    = {valueOf(){ return "-40"; }} as any;
				paz.minPanX = "-200";
				paz.minPanY = "-300";
				paz.maxPanX = "2.5";
				paz.maxPanY = "-.5";
				expect(paz).to.have.property("panX").which.is.a("number").that.equals(-20);
				expect(paz).to.have.property("panY").which.is.a("number").that.equals(-40);
				expect(paz).to.have.property("minPanX").which.is.a("number").that.equals(-200);
				expect(paz).to.have.property("minPanY").which.is.a("number").that.equals(-300);
				expect(paz).to.have.property("maxPanX").which.is.a("number").that.equals(+2.5);
				expect(paz).to.have.property("maxPanY").which.is.a("number").that.equals(-0.5);
			});
			
			it("treats invalid values as zero", () => {
				const paz = new PanAndZoom({
					panX:     5,
					panY:     5,
					minPanX: -5,
					minPanY: -5,
					maxPanX: +5,
					maxPanY: +5,
				});
				paz.panX    = [] as any;        expect(paz.panX).to.be.a("number").that.equals(0);
				paz.panY    = {} as any;        expect(paz.panY).to.be.a("number").that.equals(0);
				paz.minPanX = undefined as any; expect(paz.minPanX).to.be.a("number").that.equals(0);
				paz.minPanY = null as any;      expect(paz.minPanY).to.be.a("number").that.equals(0);
				paz.maxPanX = "Nope";    		expect(paz.maxPanX).to.be.a("number").that.equals(0);
				paz.maxPanY = NaN;       		expect(paz.maxPanY).to.be.a("number").that.equals(0);
			});
		});
		
		describe("Array-type properties", () => {
			it("allows ordinates to be retrieved in pairs", () => {
				const paz = new PanAndZoom({panX: 10, panY: 30});
				expect(paz).to.have.property("pan").that.eqls([10, 30]);
				paz.panX = -20;
				paz.panY = -40;
				expect(paz.pan).to.be.an("array").that.eqls([-20, -40]);
			});
			
			it("allows ordinates to be set in pairs", () => {
				const paz = new PanAndZoom({panX: 15, panY: 35});
				paz.pan = [-25, -50];
				expect(paz.panX).to.equal(-25);
				expect(paz.panY).to.equal(-50);
			});
			
			it("creates a new array when retrieving pairs", () => {
				const paz = new PanAndZoom({panX: 40, panY: 50});
				const pan1 = paz.pan;
				const pan2 = paz.pan;
				expect(pan1).to.be.an("array").that.eqls([40, 50]);
				expect(pan2).to.be.an("array").that.eqls([40, 50]);
				expect(pan1).not.to.equal(pan2);
			});
			
			it("does not update arrays when ordinates are modified", () => {
				const paz = new PanAndZoom({panX: 40, panY: 50});
				const {pan} = paz;
				expect(pan).to.be.an("array").that.eqls([40, 50]);
				paz.panX = 80;
				paz.panY = 150;
				expect(pan).to.eql([40, 50]);
			});
			
			it("does not update ordinates when arrays are modified", () => {
				const paz = new PanAndZoom({panX: 25, panY: 75});
				const {pan} = paz;
				expect(pan).to.be.an("array").that.eqls([25, 75]);
				pan[0] = 820;
				pan[1] = 350;
				expect(pan).to.eql([820, 350]);
				expect(paz.panX).to.equal(25);
				expect(paz.panY).to.equal(75);
			});
			
			it("coerces non-numeric elements during assignment", () => {
				const paz = new PanAndZoom();
				paz.pan = ["-50", "+650"];
				expect(paz.panX).to.be.a("number").that.equals(-50);
				expect(paz.panY).to.be.a("number").that.equals(650);
				expect(paz.pan).to.eql([-50, 650]);
			});
			
			it("doesn't modify arrays when coercing values", () => {
				const paz = new PanAndZoom();
				const pan = ["-50", "+650"];
				paz.pan = pan;
				expect(pan).to.eql(["-50", "+650"]);
				expect(paz.pan).to.eql([-50, 650]);
			});
			
			it("treats invalid elements as zero", () => {
				const paz = new PanAndZoom({panX: 5, panY: 5});
				paz.pan = [[] as any, "Invalid"];
				expect(paz.panX).to.equal(0);
				expect(paz.panY).to.equal(0);
				expect(paz.pan).to.eql([0, 0]);
			});
		});
	});

	describe("Zooming", () => {
		it("initialises values to 1.0", () => {
			const paz = new PanAndZoom();
			expect(paz).to.have.property("zoom").that.equals(1);
		});
		
		it("imposes a minimum of 0.0 by default", () => {
			const paz = new PanAndZoom();
			expect(paz).to.have.property("minZoom").that.equals(0);
		});
		
		it("imposes no maximum by default", () => {
			const paz = new PanAndZoom();
			expect(paz).to.have.property("maxZoom").that.equals(Number.POSITIVE_INFINITY);
		});
		
		it("sets properties during initialisation", () => {
			const paz = new PanAndZoom({
				zoom:    1.5,
				minZoom: -0.5,
				maxZoom: +2.5,
			});
			expect(paz).to.have.property("zoom").that.equals(1.5);
			expect(paz).to.have.property("minZoom").that.equals(-0.5);
			expect(paz).to.have.property("maxZoom").that.equals(+2.5);
		});
		
		it("sets properties after initialisation", () => {
			const paz   = new PanAndZoom();
			paz.zoom    = 5.25;
			paz.minZoom = 0.65;
			paz.maxZoom = 75.0;
			expect(paz).to.have.property("zoom").that.equals(5.25);
			expect(paz).to.have.property("minZoom").that.equals(0.65);
			expect(paz).to.have.property("maxZoom").that.equals(75.0);
		});
		
		it("clamps values to their specified limits", () => {
			expect(new PanAndZoom({zoom: -1.0}).zoom).to.equal(0);
			expect(new PanAndZoom({zoom: -1.0, minZoom: -0.5}).zoom).to.equal(-0.5);
			expect(new PanAndZoom({zoom: +4.5, maxZoom: +1.4}).zoom).to.equal(+1.4);
			const paz = new PanAndZoom({
				minZoom: -4.7,
				maxZoom: +5.6,
			});
			paz.zoom = -2.5; expect(paz.zoom).to.equal(-2.5);
			paz.zoom = +2.5; expect(paz.zoom).to.equal(+2.5);
			paz.zoom = +8.0; expect(paz.zoom).to.equal(+5.6);
			paz.zoom = -8.0; expect(paz.zoom).to.equal(-4.7);
		});
		
		it("clamps values when limits are updated", () => {
			let paz = new PanAndZoom({zoom: 0.35});
			expect(paz.zoom).to.equal(0.35);
			paz.minZoom = 1.5;
			expect(paz.zoom).to.equal(1.5);
			
			paz = new PanAndZoom({zoom: 1.5});
			expect(paz.zoom).to.equal(1.5);
			paz.maxZoom = 0.5;
			expect(paz.zoom).to.equal(0.5);
		});
		
		it("coerces values to numbers during initialisation", () => {
			const paz = new PanAndZoom({
				zoom:    "0.75",
				minZoom: "-1.45",
				maxZoom: "+2.35",
			});
			expect(paz).to.have.property("zoom").which.is.a("number").that.equals(0.75);
			expect(paz).to.have.property("minZoom").which.is.a("number").that.equals(-1.45);
			expect(paz).to.have.property("maxZoom").which.is.a("number").that.equals(+2.35);
		});
		
		it("coerces values to numbers during assignment", () => {
			const paz   = new PanAndZoom();
			paz.zoom    = "2.5";
			paz.minZoom = {valueOf(){ return "-2.3"; }} as any;
			paz.maxZoom = "+5.03";
			expect(paz).to.have.property("zoom").which.is.a("number").that.equals(2.5);
			expect(paz).to.have.property("minZoom").which.is.a("number").that.equals(-2.3);
			expect(paz).to.have.property("maxZoom").which.is.a("number").that.equals(+5.03);
		});
		
		it("treats invalid values as zero", () => {
			const paz = new PanAndZoom({
				zoom:    1.5,
				minZoom: -2,
				maxZoom: +4,
			});
			paz.zoom    = [] as any;    expect(paz.zoom).to.be.a("number").that.equals(0);
			paz.minZoom = {} as any;    expect(paz.minZoom).to.be.a("number").that.equals(0);
			paz.maxZoom = "Invalid"; 	expect(paz.maxZoom).to.be.a("number").that.equals(0);
		});
		
		it("truncates out-of-range values when correcting invalid values", () => {
			let paz     = new PanAndZoom();
			paz.zoom    = 1.5;
			paz.maxZoom = [] as any;
			expect(paz.zoom).to.equal(0);
			
			paz = new PanAndZoom();
			paz.minZoom = -5;
			paz.zoom    = -0.5;
			paz.minZoom = {} as any;
			expect(paz.zoom).to.equal(0);
		});
	});

	describe("Transform origin", () => {
		describe("Numeric properties", () => {
			it("initialises each ordinate to 0", () => {
				const paz = new PanAndZoom();
				expect(paz).to.have.property("originX").that.equals(0);
				expect(paz).to.have.property("originY").that.equals(0);
			});
			
			it("imposes no limits by default", () => {
				const paz = new PanAndZoom();
				expect(paz).to.have.property("minOriginX").which.equals(Number.NEGATIVE_INFINITY);
				expect(paz).to.have.property("minOriginY").which.equals(Number.NEGATIVE_INFINITY);
				expect(paz).to.have.property("maxOriginX").which.equals(Number.POSITIVE_INFINITY);
				expect(paz).to.have.property("maxOriginY").which.equals(Number.POSITIVE_INFINITY);
			});
			
			it("sets properties during initialisation", () => {
				const paz = new PanAndZoom({
					originX: 20,
					originY: 40,
					minOriginX: -20,
					minOriginY: -40,
					maxOriginX: 120,
					maxOriginY: 140,
				});
				expect(paz).to.have.property("originX").which.equals(20);
				expect(paz).to.have.property("originY").which.equals(40);
				expect(paz).to.have.property("minOriginX").which.equals(-20);
				expect(paz).to.have.property("minOriginY").which.equals(-40);
				expect(paz).to.have.property("maxOriginX").which.equals(120);
				expect(paz).to.have.property("maxOriginY").which.equals(140);
			});
			
			it("sets properties after initialisation", () => {
				const paz = new PanAndZoom();
				paz.originX = 20;
				paz.originY = 40;
				paz.minOriginX = -20;
				paz.minOriginY = -40;
				paz.maxOriginX = 120;
				paz.maxOriginY = 140;
				expect(paz).to.have.property("originX").which.equals(20);
				expect(paz).to.have.property("originY").which.equals(40);
				expect(paz).to.have.property("minOriginX").which.equals(-20);
				expect(paz).to.have.property("minOriginY").which.equals(-40);
				expect(paz).to.have.property("maxOriginX").which.equals(120);
				expect(paz).to.have.property("maxOriginY").which.equals(140);
			});
			
			it("clamps ordinates to their specified limits", () => {
				expect(new PanAndZoom({originX: -20, minOriginX: 0}).originX).to.equal(0);
				expect(new PanAndZoom({originY: -20, minOriginY: 0}).originY).to.equal(0);
				expect(new PanAndZoom({originX: +20, maxOriginX: 5}).originX).to.equal(5);
				expect(new PanAndZoom({originY: +20, maxOriginY: 5}).originY).to.equal(5);
				const paz = new PanAndZoom({
					minOriginX: -100,
					maxOriginX: +100,
					minOriginY: -200,
					maxOriginY: +200,
				});
				paz.originX =   50; expect(paz.originX).to.equal(50);
				paz.originX = +150; expect(paz.originX).to.equal(+100);
				paz.originX = -150; expect(paz.originX).to.equal(-100);
				paz.originY =   25; expect(paz.originY).to.equal(25);
				paz.originY = +250; expect(paz.originY).to.equal(+200);
				paz.originY = -250; expect(paz.originY).to.equal(-200);
			});
			
			it("clamps ordinates when limits are updated", () => {
				let paz = new PanAndZoom({originX: -100, originY: -100});
				paz.minOriginX = 0; expect(paz.originX).to.equal(0);
				paz.minOriginY = 0; expect(paz.originY).to.equal(0);
				
				paz = new PanAndZoom({originX: 150, originY: 150});
				paz.maxOriginX = 100; expect(paz.maxOriginX).to.equal(100);
				paz.maxOriginY = 100; expect(paz.maxOriginY).to.equal(100);
			});
			
			it("coerces values to numbers during initialisation", () => {
				const paz = new PanAndZoom({
					originX:    "10",
					originY:    "20",
					minOriginX: "-100",
					minOriginY: "-200",
					maxOriginX: "+100",
					maxOriginY: "+200",
				});
				expect(paz).to.have.property("originX").which.is.a("number").that.equals(10);
				expect(paz).to.have.property("originY").which.is.a("number").that.equals(20);
				expect(paz).to.have.property("minOriginX").which.is.a("number").that.equals(-100);
				expect(paz).to.have.property("minOriginY").which.is.a("number").that.equals(-200);
				expect(paz).to.have.property("maxOriginX").which.is.a("number").that.equals(+100);
				expect(paz).to.have.property("maxOriginY").which.is.a("number").that.equals(+200);
			});
			
			it("coerces values to numbers during assignment", () => {
				const paz      = new PanAndZoom();
				paz.originX    = "-20";
				paz.originY    = {valueOf(){ return "-40"; }} as any;
				paz.minOriginX = "-200";
				paz.minOriginY = "-300";
				paz.maxOriginX = "2.5";
				paz.maxOriginY = "-.5";
				expect(paz).to.have.property("originX").which.is.a("number").that.equals(-20);
				expect(paz).to.have.property("originY").which.is.a("number").that.equals(-40);
				expect(paz).to.have.property("minOriginX").which.is.a("number").that.equals(-200);
				expect(paz).to.have.property("minOriginY").which.is.a("number").that.equals(-300);
				expect(paz).to.have.property("maxOriginX").which.is.a("number").that.equals(+2.5);
				expect(paz).to.have.property("maxOriginY").which.is.a("number").that.equals(-0.5);
			});
			
			it("treats invalid values as zero", () => {
				const paz = new PanAndZoom({
					originX:     5,
					originY:     5,
					minOriginX: -5,
					minOriginY: -5,
					maxOriginX: +5,
					maxOriginY: +5,
				});
				paz.originX    = [] as any;        expect(paz.originX).to.be.a("number").that.equals(0);
				paz.originY    = {} as any;        expect(paz.originY).to.be.a("number").that.equals(0);
				paz.minOriginX = undefined as any; expect(paz.minOriginX).to.be.a("number").that.equals(0);
				paz.minOriginY = null as any;      expect(paz.minOriginY).to.be.a("number").that.equals(0);
				paz.maxOriginX = "Nope";           expect(paz.maxOriginX).to.be.a("number").that.equals(0);
				paz.maxOriginY = NaN;              expect(paz.maxOriginY).to.be.a("number").that.equals(0);
			});
		});

		describe("Array-type properties", () => {
			it("allows ordinates to be retrieved in pairs", () => {
				const paz = new PanAndZoom({originX: 10, originY: 30});
				expect(paz).to.have.property("origin").that.eqls([10, 30]);
				paz.originX = -20;
				paz.originY = -40;
				expect(paz.origin).to.be.an("array").that.eqls([-20, -40]);
			});
			
			it("allows ordinates to be set in pairs", () => {
				const paz = new PanAndZoom({originX: 15, originY: 35});
				paz.origin = [-25, -50];
				expect(paz.originX).to.equal(-25);
				expect(paz.originY).to.equal(-50);
			});
			
			it("creates a new array when retrieving pairs", () => {
				const paz = new PanAndZoom({originX: 40, originY: 50});
				const origin1 = paz.origin;
				const origin2 = paz.origin;
				expect(origin1).to.be.an("array").that.eqls([40, 50]);
				expect(origin2).to.be.an("array").that.eqls([40, 50]);
				expect(origin1).not.to.equal(origin2);
			});
			
			it("does not update arrays when ordinates are modified", () => {
				const paz = new PanAndZoom({originX: 40, originY: 50});
				const {origin} = paz;
				expect(origin).to.be.an("array").that.eqls([40, 50]);
				paz.originX = 80;
				paz.originY = 150;
				expect(origin).to.eql([40, 50]);
			});
			
			it("does not update ordinates when arrays are modified", () => {
				const paz = new PanAndZoom({originX: 25, originY: 75});
				const {origin} = paz;
				expect(origin).to.be.an("array").that.eqls([25, 75]);
				origin[0] = 820;
				origin[1] = 350;
				expect(origin).to.eql([820, 350]);
				expect(paz.originX).to.equal(25);
				expect(paz.originY).to.equal(75);
			});
			
			it("coerces non-numeric elements during assignment", () => {
				const paz = new PanAndZoom();
				paz.origin = ["-50", "+650"];
				expect(paz.originX).to.be.a("number").that.equals(-50);
				expect(paz.originY).to.be.a("number").that.equals(650);
				expect(paz.origin).to.eql([-50, 650]);
			});
			
			it("doesn't modify arrays when coercing values", () => {
				const paz = new PanAndZoom();
				const origin = ["-50", "+650"];
				paz.origin = origin;
				expect(origin).to.eql(["-50", "+650"]);
				expect(paz.origin).to.eql([-50, 650]);
			});
			
			it("treats invalid elements as zero", () => {
				const paz = new PanAndZoom({originX: 5, originY: 5});
				paz.origin = [[] as any, "Invalid"];
				expect(paz.originX).to.equal(0);
				expect(paz.originY).to.equal(0);
				expect(paz.origin).to.eql([0, 0]);
			});
		});
	});
});
