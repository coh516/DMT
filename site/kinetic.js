/**
 * KineticJS JavaScript Library v3.9.4
 * http://www.kineticjs.com/
 * Copyright 2012, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Apr 28 2012
 *
 * Copyright (C) 2011 - 2012 by Eric Rowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var Kinetic = {};
Kinetic.GlobalObject = {
    stages: [],
    idCounter: 0,
    tempNodes: [],
    animations: [],
    animIdCounter: 0,
    dragTimeInterval: 0,
    maxDragTimeInterval: 20,
    frame: {
        time: 0,
        timeDiff: 0,
        lastTime: 0
    },
    drag: {
        moving: !1,
        node: undefined,
        offset: {
            x: 0,
            y: 0
        },
        lastDrawTime: 0
    },
    extend: function (a, b) {
        for (var c in b.prototype) b.prototype.hasOwnProperty(c) && a.prototype[c] === undefined && (a.prototype[c] = b.prototype[c])
    },
    _pullNodes: function (a) {
        var b = this.tempNodes;
        for (var c = 0; c < b.length; c++) {
            var d = b[c];
            d.getStage() !== undefined && d.getStage()._id === a._id && (a._addId(d), a._addName(d), this.tempNodes.splice(c, 1), c -= 1)
        }
    },
    _addAnimation: function (a) {
        a.id = this.animIdCounter++, this.animations.push(a)
    },
    _removeAnimation: function (a) {
        var b = a.id,
            c = this.animations;
        for (var d = 0; d < c.length; d++) if (c[d].id === b) return this.animations.splice(d, 1), !1
    },
    _runFrames: function () {
        var a = {};
        for (var b = 0; b < this.animations.length; b++) {
            var c = this.animations[b];
            c.node && c.node._id !== undefined && (a[c.node._id] = c.node), c.func(this.frame)
        }
        for (var d in a) a[d].draw()
    },
    _updateFrameObject: function () {
        var a = new Date,
            b = a.getTime();
        this.frame.lastTime === 0 ? this.frame.lastTime = b : (this.frame.timeDiff = b - this.frame.lastTime, this.frame.lastTime = b, this.frame.time += this.frame.timeDiff)
    },
    _animationLoop: function () {
        if (this.animations.length > 0) {
            this._updateFrameObject(), this._runFrames();
            var a = this;
            requestAnimFrame(function () {
                a._animationLoop()
            })
        } else this.frame.lastTime = 0
    },
    _handleAnimation: function () {
        var a = this;
        this.animations.length > 0 ? a._animationLoop() : this.frame.lastTime = 0
    },
    _isElement: function (a) {
        return !!a && a.nodeType == 1
    },
    _isFunction: function (a) {
        return !!(a && a.constructor && a.call && a.apply)
    },
    _getPoint: function (a) {
        return a.length === 1 ? a[0] : {
            x: a[0],
            y: a[1]
        }
    }
}, window.requestAnimFrame = function (a) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (a) {
        window.setTimeout(a, 1e3 / 60)
    }
}(), Kinetic.Node = function (a) {
    this.setDefaultAttrs({
        visible: !0,
        listening: !0,
        name: undefined,
        alpha: 1,
        x: 0,
        y: 0,
        scale: {
            x: 1,
            y: 1
        },
        rotation: 0,
        centerOffset: {
            x: 0,
            y: 0
        },
        dragConstraint: "none",
        dragBounds: {},
        draggable: !1
    }), this.eventListeners = {}, this.setAttrs(a)
}, Kinetic.Node.prototype = {
    on: function (a, b) {
	return;
        var c = a.split(" ");
        for (var d = 0; d < c.length; d++) {
            var e = c[d],
                f = e.indexOf("touch") === -1 ? "on" + e : e,
                g = f.split("."),
                h = g[0],
                i = g.length > 1 ? g[1] : "";
            this.eventListeners[h] || (this.eventListeners[h] = []), this.eventListeners[h].push({
                name: i,
                handler: b
            })
        }
    },
    off: function (a) {
        var b = a.split(" ");
        for (var c = 0; c < b.length; c++) {
            var d = b[c],
                e = d.indexOf("touch") === -1 ? "on" + d : d,
                f = e.split("."),
                g = f[0];
            if (this.eventListeners[g] && f.length > 1) {
                var h = f[1];
                for (var i = 0; i < this.eventListeners[g].length; i++) if (this.eventListeners[g][i].name === h) {
                    this.eventListeners[g].splice(i, 1), this.eventListeners[g].length === 0 && (this.eventListeners[g] = undefined);
                    break
                }
            } else this.eventListeners[g] = undefined
        }
    },
    getAttrs: function () {
        return this.attrs
    },
    setDefaultAttrs: function (a) {
        this.attrs === undefined && (this.attrs = {});
        if (a) for (var b in a) {
            var c = a[b];
            this.attrs[b] = a[b]
        }
    },
    setAttrs: function (a) {
        var b = Kinetic.GlobalObject;
        if (a) for (var c in a) {
            var d = a[c];
            if (b._isFunction(d) || b._isElement(d)) this[c] = d;
            else switch (c) {
            case "draggable":
                this.draggable(a[c]);
                break;
            case "listening":
                this.listen(a[c]);
                break;
            case "rotationDeg":
                this.attrs.rotation = a[c] * Math.PI / 180;
                break;
            case "centerOffset":
                d.x !== undefined && (this.attrs[c].x = d.x), d.y !== undefined && (this.attrs[c].y = d.y);
                break;
            case "scale":
                d.x !== undefined && (this.attrs[c].x = d.x), d.y !== undefined && (this.attrs[c].y = d.y);
                break;
            case "crop":
                d.x !== undefined && (this.attrs[c].x = d.x), d.y !== undefined && (this.attrs[c].y = d.y), d.width !== undefined && (this.attrs[c].width = d.width), d.height !== undefined && (this.attrs[c].height = d.height);
                break;
            default:
                this.attrs[c] = a[c]
            }
        }
    },
    isVisible: function () {
        return this.attrs.visible
    },
    show: function () {
        this.attrs.visible = !0
    },
    hide: function () {
        this.attrs.visible = !1
    },
    getZIndex: function () {
        return this.index
    },
    getAbsoluteZIndex: function () {
        function e(b) {
            var f = [];
            for (var g = 0; g < b.length; g++) {
                var h = b[g];
                d++, h.nodeType !== "Shape" && (f = f.concat(h.getChildren())), h._id === c._id && (g = b.length)
            }
            f.length > 0 && f[0].getLevel() <= a && e(f)
        }
        var a = this.getLevel(),
            b = this.getStage(),
            c = this,
            d = 0;
        return c.nodeType !== "Stage" && e(c.getStage().getChildren()), d
    },
    getLevel: function () {
        var a = 0,
            b = this.parent;
        while (b) a++, b = b.parent;
        return a
    },
    setScale: function (a, b) {
        b ? (this.attrs.scale.x = a, this.attrs.scale.y = b) : (this.attrs.scale.x = a, this.attrs.scale.y = a)
    },
    getScale: function () {
        return this.attrs.scale
    },
    setPosition: function () {
        var a = Kinetic.GlobalObject._getPoint(arguments);
        this.attrs.x = a.x, this.attrs.y = a.y
    },
    setX: function (a) {
        this.attrs.x = a
    },
    setY: function (a) {
        this.attrs.y = a
    },
    getX: function () {
        return this.attrs.x
    },
    getY: function () {
        return this.attrs.y
    },
    setDetectionType: function (a) {
        this.attrs.detectionType = a
    },
    getDetectionType: function () {
        return this.attrs.detectionType
    },
    getPosition: function () {
        return {
            x: this.attrs.x,
            y: this.attrs.y
        }
    },
    getAbsolutePosition: function () {
        return this.getAbsoluteTransform().getTranslation()
    },
    setAbsolutePosition: function () {
        var a = Kinetic.GlobalObject._getPoint(arguments),
            b = this.attrs.rotation,
            c = {
                x: this.attrs.scale.x,
                y: this.attrs.scale.y
            },
            d = {
                x: this.attrs.centerOffset.x,
                y: this.attrs.centerOffset.y
            };
        this.attrs.rotation = 0, this.attrs.scale = {
            x: 1,
            y: 1
        };
        var e = this.getAbsoluteTransform();
        e.invert(), e.translate(a.x, a.y), a = {
            x: this.attrs.x + e.getTranslation().x,
            y: this.attrs.y + e.getTranslation().y
        }, this.setPosition(a.x, a.y), this.rotate(b), this.attrs.scale = {
            x: c.x,
            y: c.y
        }
    },
    move: function (a, b) {
        this.attrs.x += a, this.attrs.y += b
    },
    setRotation: function (a) {
        this.attrs.rotation = a
    },
    setRotationDeg: function (a) {
        this.attrs.rotation = a * Math.PI / 180
    },
    getRotation: function () {
        return this.attrs.rotation
    },
    getRotationDeg: function () {
        return this.attrs.rotation * 180 / Math.PI
    },
    rotate: function (a) {
        this.attrs.rotation += a
    },
    rotateDeg: function (a) {
        this.attrs.rotation += a * Math.PI / 180
    },
    listen: function (a) {
        this.attrs.listening = a
    },
    moveToTop: function () {
        var a = this.index;
        this.parent.children.splice(a, 1), this.parent.children.push(this), this.parent._setChildrenIndices()
    },
    moveUp: function () {
        var a = this.index;
        this.parent.children.splice(a, 1), this.parent.children.splice(a + 1, 0, this), this.parent._setChildrenIndices()
    },
    moveDown: function () {
        var a = this.index;
        a > 0 && (this.parent.children.splice(a, 1), this.parent.children.splice(a - 1, 0, this), this.parent._setChildrenIndices())
    },
    moveToBottom: function () {
        var a = this.index;
        this.parent.children.splice(a, 1), this.parent.children.unshift(this), this.parent._setChildrenIndices()
    },
    setZIndex: function (a) {
        var b = this.index;
        this.parent.children.splice(b, 1), this.parent.children.splice(a, 0, this), this.parent._setChildrenIndices()
    },
    setAlpha: function (a) {
        this.attrs.alpha = a
    },
    getAlpha: function () {
        return this.attrs.alpha
    },
    getAbsoluteAlpha: function () {
        var a = 1,
            b = this;
        while (b.nodeType !== "Stage") a *= b.attrs.alpha, b = b.parent;
        return a
    },
    draggable: function (a) {
        this.attrs.draggable !== a && (a ? this._initDrag() : this._dragCleanup(), this.attrs.draggable = a)
    },
    isDragging: function () {
        var a = Kinetic.GlobalObject;
        return a.drag.node !== undefined && a.drag.node._id === this._id && a.drag.moving
    },
    moveTo: function (a) {
        var b = this.parent;
        b.children.splice(this.index, 1), b._setChildrenIndices(), a.children.push(this), this.index = a.children.length - 1, this.parent = a, a._setChildrenIndices()
    },
    getParent: function () {
        return this.parent
    },
    getLayer: function () {
    //	if (!this.getParent()) //console.log ("lol");
        return this.nodeType === "Layer" ? this : this.getParent().getLayer()
    },
    getStage: function () {
        return this.nodeType === "Stage" ? this : this.getParent() === undefined ? undefined : this.getParent().getStage()
    },
    getName: function () {
        return this.attrs.name
    },
    setCenterOffset: function (a, b) {
        this.attrs.centerOffset.x = a, this.attrs.centerOffset.y = b
    },
    getCenterOffset: function () {
        return this.attrs.centerOffset
    },
    transitionTo: function (a) {
        var b = Kinetic.GlobalObject;
        this.transAnim !== undefined && (b._removeAnimation(this.transAnim), this.transAnim = undefined);
        var c = this.nodeType === "Stage" ? this : this.getLayer(),
            d = this,
            e = new Kinetic.Transition(this, a),
            f = {
                func: function () {
                    e.onEnterFrame()
                },
                node: c
            };
        return this.transAnim = f, b._addAnimation(f), e.onFinished = function () {
            b._removeAnimation(f), d.transAnim = undefined, a.callback !== undefined && a.callback(), f.node.draw()
        }, e.start(), b._handleAnimation(), e
    },
    setDragConstraint: function (a) {
        this.attrs.dragConstraint = a
    },
    
    getDragConstraint: function () {
        return this.attrs.dragConstraint
    },
    setDragBounds: function (a) {
        this.attrs.dragBounds = a
    },
    getDragBounds: function () {
        return this.attrs.dragBounds
    },
    getAbsoluteTransform: function () {
        var a = new Kinetic.Transform,
            b = [],
            c = this.parent;
        b.unshift(this);
        while (c) b.unshift(c), c = c.parent;
        for (var d = 0; d < b.length; d++) {
            var e = b[d],
                f = e.getTransform();
            a.multiply(f)
        }
        return a
    },
    getTransform: function () {
        var a = new Kinetic.Transform;
        return (this.attrs.x !== 0 || this.attrs.y !== 0) && a.translate(this.attrs.x, this.attrs.y), this.attrs.rotation !== 0 && a.rotate(this.attrs.rotation), (this.attrs.scale.x !== 1 || this.attrs.scale.y !== 1) && a.scale(this.attrs.scale.x, this.attrs.scale.y), a
    },
    _initDrag: function () {
        this._dragCleanup();
        var a = Kinetic.GlobalObject,
            b = this;
        this.on("mousedown.initdrag touchstart.initdrag", function (c) {
            var d = b.getStage(),
                e = d.getUserPosition();
            if (e) {
                var f = b.getTransform().getTranslation(),
                    g = b.getAbsoluteTransform().getTranslation();
                a.drag.node = b, a.drag.offset.x = e.x - b.getAbsoluteTransform().getTranslation().x, a.drag.offset.y = e.y - b.getAbsoluteTransform().getTranslation().y
            }
        })
    },
    _dragCleanup: function () {
        this.off("mousedown.initdrag"), this.off("touchstart.initdrag")
    },
    _handleEvents: function (a, b) {
        this.nodeType === "Shape" && (b.shape = this);
        var c = this.getStage();
        this._handleEvent(this, c.mouseoverShape, c.mouseoutShape, a, b)
    },
    _handleEvent: function (a, b, c, d, e) {
        var f = a.eventListeners,
            g = !0;
        d === "onmouseover" && c && c._id === a._id ? g = !1 : d === "onmouseout" && b && b._id === a._id && (g = !1);
        if (f[d] && g) {
            var h = f[d];
            for (var i = 0; i < h.length; i++) h[i].handler.apply(a, [e])
        }
        var j = b ? b.parent : undefined,
            k = c ? c.parent : undefined;
        !e.cancelBubble && a.parent.nodeType !== "Stage" && this._handleEvent(a.parent, j, k, d, e)
    },
    
    
    
}, Kinetic.Container = function () {
    this.children = []
}, Kinetic.Container.prototype = {
    getChildren: function () {
        return this.children
    },
    removeChildren: function () {
        while (this.children.length > 0) this.remove(this.children[0])
    },
    _remove: function (a) {
        if (a.index !== undefined && this.children[a.index]._id == a._id) {
            var b = this.getStage();
            b !== undefined && (b._removeId(a), b._removeName(a))
            var c = Kinetic.GlobalObject;
            for (var d = 0; d < c.tempNodes.length; d++) {
                var e = c.tempNodes[d];
                e._id === a._id && (c.tempNodes.splice(d, 1), d = c.tempNodes.length)
            }
           // //console.log("xx");
            this.children.splice(a.index, 1), this._setChildrenIndices(), a = undefined
        }
    },
    
    suicide: function() {
    //	//console.log("------------");
    	this.context.canvas.parentNode.removeChild(this.context.canvas);
    	this.removeChildren();
    	this.clear();
    	////console.log(this.parent);
    	var i = this.parent.children.length-1;
    	for (i; i >= 0; i--) {
		if (this.parent.children[i] == this) {
			this.parent.children.splice(i, 1);
		}
	}
	delete this;
   	////console.log(this.parent);    	    
    },
    get: function (a) {
        var b = this.getStage(),
            c, d = a.slice(1);
        if (a.charAt(0) === "#") c = b.ids[d] !== undefined ? [b.ids[d]] : [];
        else {
            if (a.charAt(0) !== ".") return a === "Shape" || a === "Group" || a === "Layer" ? this._getNodes(a) : !1;
            c = b.names[d] !== undefined ? b.names[d] : []
        }
        var e = [];
        for (var f = 0; f < c.length; f++) {
            var g = c[f];
            this.isAncestorOf(g) && e.push(g)
        }
        return e
    },
    isAncestorOf: function (a) {
        if (this.nodeType === "Stage") return !0;
        var b = a.getParent();
        while (b) {
            if (b._id === this._id) return !0;
            b = b.getParent()
        }
        return !1
    },
    _getNodes: function (a) {
        function c(d) {
            var e = d.getChildren();
            for (var f = 0; f < e.length; f++) {
                var g = e[f];
                g.nodeType === a ? b.push(g) : g.nodeType !== "Shape" && c(g)
            }
        }
        var b = [];
        return c(this), b
    },
    _drawChildren: function () {
        var a = this.getStage(),
            b = this.children;
            // ** Patched in by Seth Tenenbaum 
      	    var gp = this.getAbsolutePosition();

            if (this.clippingRect && !this.attrs.setHere) {
                this.attrs.clippingRect = this.clippingRect;
            } 
            if (this.clippingRect && this.attrs.setHere) {
            	    this.clippingRectGroupPosition = gp;
            	
            }

        for (var c = 0; c < b.length; c++) {
            var d = b[c];
          
            if (this.attrs.clippingRect) {

            	if (this.lastClipPos) {
	            	if (!d.lastClipPos) d.lastClipPos = {}
	            	d.lastClipPos.y = this.lastClipPos.y;
            		d.lastClipPos.h = this.lastClipPos.h;
            	}
	            d.clippingRect = this.attrs.clippingRect;
	            d.clippingRectGroupPosition = !this.hasOwnProperty("clippingRectGroupPosition") ? gp : this.clippingRectGroupPosition;
	            d.attrs.clippingRectGroupPosition = d.clippingRectGroupPosition;
	            
            } 

            if (d.nodeType === "Shape" && a.isVisible()) {
            	    if (d.clippingRect) {
	            	    	var p = this; //d.parent;
	            	    	var mm = false;
	            	    	var yOffset = 0;
	            	    	var hOffset = 0;
	            	    	
	            	    	while (p.nodeType !== "Stage") {
	            	    		if (p.attrs.setHere) {
	            	    			if (!mm) {
		            	    			mm = true;
		            	    			 var pcry = p.attrs.clippingRect.y + p.getAbsolutePosition().y;
		                    	    	 var pcrh = pcry + p.attrs.clippingRect.height;
		                    	    	 var ogpcry = pcry; 
		                    	    	 var ogpcrh = pcrh;
	                    	    	
	            	    			}
	            	    			else {
	            	    				 var dcry = p.attrs.clippingRect.y + p.getAbsolutePosition().y;
	                        	    	 var dcrh = dcry + p.attrs.clippingRect.height;
	                        	    	 if (dcry > pcry) { 
	                        	    		 yOffset = dcry-ogpcry;
	                        	    		// p.yOffset = yOffset; 
	                        	    		 pcry = dcry;
	                        	    	 }
	                        	    	 if (pcrh > dcrh) { 
	                        	    	     hOffset = dcrh-ogpcrh;
	                        	    		 pcrh = dcrh;
	                        	    		// p.hOffset = hOffset;
	                        	    	 }
	            	    			}
	            	    		}
	            	    		p = p.parent;
	            	    	}
	            	    	
	            	    	if (d.lastClipPos)
	            	    	////console.log(JSON.stringify(d.lastClipPos)+" <<>> "+pcrh+" "+pcrh)
            	    		
            	    	    var g = this;
                	    	var p =  d.parent;
            	    	    var ap = d.getAbsolutePosition();
               	    	    var cg = d.clippingRectGroupPosition;
            	    	    var   ogClip = {}
            	    	    ogClip.height = d.clippingRect.height;
            	    	    ogClip.x = d.clippingRect.x;
            	    	    ogClip.y = d.clippingRect.y;
            	    	    ogClip.width = d.clippingRect.width;
               	    	    d.clippingRect.x+=(cg.x-ap.x); 
               	    	    d.clippingRect.y+=(cg.y-ap.y+yOffset) ;
               	    	    d.clippingRect.height+=hOffset-yOffset;
              	    	    d._draw(d.getLayer())
              	    	    d.clippingRect.width = ogClip.width;
               	    	    d.clippingRect.height = ogClip.height; 
              	    	    d.clippingRect.x = ogClip.x; 
              	    	    d.clippingRect.y = ogClip.y; 
            	    } else
            	    	d._draw(d.getLayer());
            }
            else d._draw()
        }
        delete this.clippingRectPosition;
    },
    
    removeClippingRect: function() {
    	    delete this.attrs.clippingRect;
    },
    // ** Patched in by coh516
    setClippingRect: function(a) {
    		
    	//this.attrs.clippingRectGroupPosition = this.getAbsolutePosition();
    		//alert(JSON.stringify(this.attrs.clippingRectGroupPosition))
    	    this.attrs.setHere = true;
    	    this.attrs.clippingRect = {};
    	    this.attrs.clippingRect.x = a.x;
    	    this.attrs.clippingRect.y = a.y;
    	    this.attrs.clippingRect.width = a.width;
    	    this.attrs.clippingRect.height = a.height;
    },
    //
    
    _add: function (a) {
        a._id = Kinetic.GlobalObject.idCounter++, a.index = this.children.length, a.parent = this, this.children.push(a);
        var b = a.getStage();
        if (b === undefined) {
            var c = Kinetic.GlobalObject;
            c.tempNodes.push(a)
        } else {
            b._addId(a), b._addName(a);
            var c = Kinetic.GlobalObject;
            c._pullNodes(b)
        }
    },
    _setChildrenIndices: function () {
        if (this.nodeType === "Stage") {
            var a = this.content.children,
                b = a[0],
                c = a[1];
            this.content.innerHTML = "", this.content.appendChild(b), this.content.appendChild(c)
        }
        for (var d = 0; d < this.children.length; d++) this.children[d].index = d, this.nodeType === "Stage" && this.content.appendChild(this.children[d].canvas)
    }
}, Kinetic.Stage = function (a) {
    this.setDefaultAttrs({
        width: 400,
        height: 200
    }), this.nodeType = "Stage", typeof a.container == "string" && (a.container = document.getElementById(a.container)), Kinetic.Container.apply(this, []), Kinetic.Node.apply(this, [a]), this.container = a.container, this.content = document.createElement("div"), this.dblClickWindow = 400, this._setDefaults(), this._id = Kinetic.GlobalObject.idCounter++, this._buildDOM(), this._listen(), this._prepareDrag();
    var b = Kinetic.GlobalObject;
    b.stages.push(this), this._addId(this), this._addName(this)
}, Kinetic.Stage.prototype = {
    onFrame: function (a) {
        var b = Kinetic.GlobalObject;
        this.anim = {
            func: a
        }
    },
    start: function () {
        if (!this.animRunning) {
            var a = Kinetic.GlobalObject;
            a._addAnimation(this.anim), a._handleAnimation(), this.animRunning = !0
        }
    },
    stop: function () {
        var a = Kinetic.GlobalObject;
        a._removeAnimation(this.anim), this.animRunning = !1
    },
    draw: function () {
    	console.log("drawing...");
        this._drawChildren()
    },
    setSize: function (a, b) {
        this.attrs.width = a, this.attrs.height = b, this.content.style.width = this.attrs.width + "px", this.content.style.height = this.attrs.height + "px", this.bufferLayer.getCanvas().width = a, this.bufferLayer.getCanvas().height = b, this.pathLayer.getCanvas().width = a, this.pathLayer.getCanvas().height = b;
        var c = this.children;
        for (var d = 0; d < c.length; d++) {
            var e = c[d];
            e.getCanvas().width = a, e.getCanvas().height = b, e.draw()
        }
    },
    getSize: function () {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        }
    },
    clear: function () {
        var a = this.children;
        for (var b = 0; b < a.length; b++) a[b].clear()
    },
    toDataURL: function (a, b, c) {
        function h(g) {
            var i = f[g].getCanvas().toDataURL(),
                j = new Image;
            j.onload = function () {
                e.drawImage(this, 0, 0), g++;
                if (g < f.length) h(g);
                else try {
                    a(d.getCanvas().toDataURL(b, c))
                } catch (i) {
                    a(d.getCanvas().toDataURL())
                }
            }, j.src = i
        }
        var d = this.bufferLayer,
            e = d.getContext(),
            f = this.children,
            g = this;
        d.clear(), h(0)
    },
    toJSON: function () {
        function b(a) {
            var c = {};
            c.attrs = a.attrs, c.nodeType = a.nodeType, c.shapeType = a.shapeType;
            if (a.nodeType !== "Shape") {
                c.children = [];
                var d = a.getChildren();
                for (var e = 0; e < d.length; e++) {
                    var f = d[e];
                    c.children.push(b(f))
                }
            }
            return c
        }
        var a = Kinetic.GlobalObject;
        return JSON.stringify(b(this))
    },
    reset: function () {
        this.removeChildren(), this._setDefaults(), this.setDefaultAttrs({
            visible: !0,
            listening: !0,
            name: undefined,
            alpha: 1,
            x: 0,
            y: 0,
            scale: {
                x: 1,
                y: 1
            },
            rotation: 0,
            centerOffset: {
                x: 0,
                y: 0
            },
            dragConstraint: "none",
            dragBounds: {},
            draggable: !1
        })
    },
    load: function (a) {
        function b(a, c) {
            var d = c.children;
            if (d !== undefined) for (var e = 0; e < d.length; e++) {
                var f = d[e],
                    g;
                f.nodeType === "Shape" ? f.shapeType === undefined ? g = "Shape" : g = f.shapeType : g = f.nodeType;
                var h = new Kinetic[g](f.attrs);
                a.add(h), b(h, f)
            }
        }
        this.reset();
        var c = JSON.parse(a);
        this.attrs = c.attrs, b(this, c), this.draw()
    },
    remove: function (a) {
        try {
            this.content.removeChild(a.canvas)
        } catch (b) {}
        this._remove(a)
    },
    add: function (a) {
        a.canvas.width = this.attrs.width, a.canvas.height = this.attrs.height, this._add(a), a.draw(), this.content.appendChild(a.canvas)
    },
    getMousePosition: function (a) {
        return this.mousePos
    },
    getTouchPosition: function (a) {
        return this.touchPos
    },
    getUserPosition: function (a) {
        return this.getTouchPosition() || this.getMousePosition()
    },
    getContainer: function () {
        return this.container
    },
    getContent: function () {
        return this.content
    },
    getStage: function () {
        return this
    },
    getWidth: function () {
        return this.attrs.width
    },
    getHeight: function () {
        return this.attrs.height
    },
    getIntersections: function () {
        var a = Kinetic.GlobalObject._getPoint(arguments),
            b = [],
            c = this.get("Shape");
        for (var d = 0; d < c.length; d++) {
            var e = c[d];
            e.intersects(a) && b.push(e)
        }
        return b
    },
    getDOM: function () {
        return this.content
    },
    _detectEvent: function (a, b) {
        var c = Kinetic.GlobalObject.drag.moving,
            d = Kinetic.GlobalObject,
            e = this.getUserPosition(),
            f = a.eventListeners;
        this.targetShape && a._id === this.targetShape._id && (this.targetFound = !0);
	
        if (a.attrs.visible && e !== undefined && a.intersects(e)) {
        	//alert(JSON.stringify(a.getAbsolutePosition()))
            if (!c && this.mouseDown) return this.mouseDown = !1, this.clickStart = !0, a._handleEvents("onmousedown", b), !0;
            if (this.mouseUp) return this.mouseUp = !1, a._handleEvents("onmouseup", b), this.clickStart && (!d.drag.moving || !d.drag.node) && (a._handleEvents("onclick", b), a.inDoubleClickWindow && a._handleEvents("ondblclick", b), a.inDoubleClickWindow = !0, setTimeout(function () {
                a.inDoubleClickWindow = !1
            }, this.dblClickWindow)), !0;
            if (this.touchStart) {
                this.touchStart = !1, a._handleEvents("touchstart", b);
                if (f.ondbltap && a.inDoubleClickWindow) {
                    var g = f.ondbltap;
                    for (var h = 0; h < g.length; h++) g[h].handler.apply(a, [b])
                }
                return a.inDoubleClickWindow = !0, setTimeout(function () {
                    a.inDoubleClickWindow = !1
                }, this.dblClickWindow), !0
            }
            if (this.touchEnd) return this.touchEnd = !1, a._handleEvents("touchend", b), !0;
            if (!c && this._isNewTarget(a, b)) return this.mouseoutShape && (this.mouseoverShape = a, this.mouseoutShape._handleEvents("onmouseout", b), this.mouseoverShape = undefined), a._handleEvents("onmouseover", b), this._setTarget(a), !0;
            if (!c) return a._handleEvents("onmousemove", b), a._handleEvents("touchmove", b), !0
        } else if (!c && this.targetShape && this.targetShape._id === a._id) return this._setTarget(undefined), this.mouseoutShape = a, !0;
        return !1
    },
    _setTarget: function (a) {
        this.targetShape = a, this.targetFound = !0
    },
    _isNewTarget: function (a, b) {
        if (!this.targetShape || !this.targetFound && a._id !== this.targetShape._id) {
            if (this.targetShape) {
                var c = this.targetShape.eventListeners;
                c && (this.mouseoutShape = this.targetShape)
            }
            return !0
        }
        return !1
    },
    _traverseChildren: function (a, b) {
        var c = a.children;
        for (var d = c.length - 1; d >= 0; d--) {
            var e = c[d];
            if (e.attrs.listening) if (e.nodeType === "Shape") {
                var f = this._detectEvent(e, b);
                if (f) return !0
            } else {
                var f = this._traverseChildren(e, b);
                if (f) return !0
            }
        }
        return !1
    },
    _handleStageEvent: function (a) {
	//return;
        var b = Kinetic.GlobalObject;
        a || (a = window.event), this._setMousePosition(a), this._setTouchPosition(a), this.pathLayer.clear(), this.targetFound = !1;
        var c = !1;
	return;
        //console.log(this.children.length);
        for (var d = this.children.length - 1; d >= 0; d--) {
            var e = this.children[d];
            e.attrs.visible && d >= 0 && e.attrs.listening && this._traverseChildren(e, a) && (d = -1, c = !0)
        }!c && this.mouseoutShape && (this.mouseoutShape._handleEvents("onmouseout", a), this.mouseoutShape = undefined)
    },
    _listen: function () {
        var a = this;
        this.content.addEventListener("mousedown", function (b) {
            a.mouseDown = !0, a._handleStageEvent(b)
        }, !1), this.content.addEventListener("mousemove", function (b) {
            a.mouseUp = !1, a.mouseDown = !1, a._handleStageEvent(b)
        }, !1), this.content.addEventListener("mouseup", function (b) {
            a.mouseUp = !0, a.mouseDown = !1, a._handleStageEvent(b), a.clickStart = !1
        }, !1), this.content.addEventListener("mouseover", function (b) {
            a._handleStageEvent(b)
        }, !1), this.content.addEventListener("mouseout", function (b) {
            var c = a.targetShape;
            c && (c._handleEvents("onmouseout", b), a.targetShape = undefined), a.mousePos = undefined
        }, !1), this.content.addEventListener("touchstart", function (b) {
            b.preventDefault(), a.touchStart = !0, a._handleStageEvent(b)
        }, !1), this.content.addEventListener("touchmove", function (b) {
            b.preventDefault(), a._handleStageEvent(b)
        }, !1), this.content.addEventListener("touchend", function (b) {
            b.preventDefault(), a.touchEnd = !0, a._handleStageEvent(b)
        }, !1)
    },
    getOffset: function() {
	return {"x":this._getContentPosition().left + window.pageXOffset,
	     "y":this._getContentPosition().top + window.pageYOffset
	}
    },

    _setMousePosition: function (a) {
        var b = a.offsetX || a.clientX - this._getContentPosition().left + window.pageXOffset,
            c = a.offsetY || a.clientY - this._getContentPosition().top + window.pageYOffset;
        this.mousePos = {
            x: b,
            y: c
        }
    },
    _setTouchPosition: function (a) {
        if (a.touches !== undefined && a.touches.length === 1) {
            var b = a.touches[0],
                c = b.clientX - this._getContentPosition().left + window.pageXOffset,
                d = b.clientY - this._getContentPosition().top + window.pageYOffset;
            this.touchPos = {
                x: c,
                y: d
            }
        }
    },
    _getContentPosition: function () {
        var a = this.content,
            b = 0,
            c = 0;
        while (a && a.tagName !== "BODY") b += a.offsetTop - a.scrollTop, c += a.offsetLeft - a.scrollLeft, a = a.offsetParent;
        return {
            top: b,
            left: c
        }
    },
    _modifyPathContext: function (a) {
        a.stroke = function () {}, a.fill = function () {}, a.fillRect = function (b, c, d, e) {
            a.rect(b, c, d, e)
        }, a.strokeRect = function (b, c, d, e) {
            a.rect(b, c, d, e)
        }, a.drawImage = function () {}, a.fillText = function () {}, a.strokeText = function () {}
    },
    _endDrag: function (a) {
        var b = Kinetic.GlobalObject;
        b.drag.node && b.drag.moving && (b.drag.moving = !1, b.drag.node._handleEvents("ondragend", a)), b.drag.node = undefined
    },
    _prepareDrag: function () {
        var a = this;
        this._onContent("mousemove touchmove", function (b) {
            var c = Kinetic.GlobalObject,
                d = c.drag.node;
            if (d) {
                var e = new Date,
                    f = e.getTime();
                if (f - c.drag.lastDrawTime > c.dragTimeInterval) {
                    c.drag.lastDrawTime = f;
                    var g = a.getUserPosition(),
                        h = d.attrs.dragConstraint,
                        i = d.attrs.dragBounds,
                        j = {
                            x: d.attrs.x,
                            y: d.attrs.y
                        },
                        k = {
                            x: g.x - c.drag.offset.x,
                            y: g.y - c.drag.offset.y
                        };
                    i.left !== undefined && k.x < i.left && (k.x = i.left), i.right !== undefined && k.x > i.right && (k.x = i.right), i.top !== undefined && k.y < i.top && (k.y = i.top), i.bottom !== undefined && k.y > i.bottom && (k.y = i.bottom), d.setAbsolutePosition(k), h === "horizontal" ? d.attrs.y = j.y : h === "vertical" && (d.attrs.x = j.x), c.drag.node.getLayer().draw(), c.drag.moving || (c.drag.moving = !0, c.drag.node._handleEvents("ondragstart", b)), c.drag.node._handleEvents("ondragmove", b)
                }
            }
        }, !1), this._onContent("mouseup touchend mouseout", function (b) {
            a._endDrag(b)
        })
    },
    _buildDOM: function () {
        this.content.style.position = "relative", this.content.style.display = "inline-block", this.content.className = "kineticjs-content", this.container.appendChild(this.content), this.bufferLayer = new Kinetic.Layer({
            name: "bufferLayer"
        }), this.pathLayer = new Kinetic.Layer({
            name: "pathLayer"
        }), this.bufferLayer.parent = this, this.pathLayer.parent = this, this._modifyPathContext(this.pathLayer.context), this.bufferLayer.getCanvas().style.display = "none", this.pathLayer.getCanvas().style.display = "none", this.bufferLayer.canvas.className = "kineticjs-buffer-layer", this.content.appendChild(this.bufferLayer.canvas), this.pathLayer.canvas.className = "kineticjs-path-layer", this.content.appendChild(this.pathLayer.canvas), this.setSize(this.attrs.width, this.attrs.height)
    },
    _addId: function (a) {
        a.attrs.id !== undefined && (this.ids[a.attrs.id] = a)
    },
    _removeId: function (a) {
        a.attrs.id !== undefined && (this.ids[a.attrs.id] = undefined)
    },
    _addName: function (a) {
        var b = a.attrs.name;
        b !== undefined && (this.names[b] === undefined && (this.names[b] = []), this.names[b].push(a))
    },
    _removeName: function (a) {
        if (a.attrs.name !== undefined) {
            var b = this.names[a.attrs.name];
            if (b !== undefined) for (var c = 0; c < b.length; c++) {
                var d = b[c];
                d._id === a._id && b.splice(c, 1)
            }
        }
    },
    _onContent: function (a, b) {
        var c = a.split(" ");
        for (var d = 0; d < c.length; d++) {
            var e = c[d];
            this.content.addEventListener(e, b, !1)
        }
    },
    _setDefaults: function () {
        this.clickStart = !1, this.targetShape = undefined, this.targetFound = !1, this.mouseoverShape = undefined, this.mouseoutShape = undefined, this.mousePos = undefined, this.mouseDown = !1, this.mouseUp = !1, this.touchPos = undefined, this.touchStart = !1, this.touchEnd = !1, this.ids = {}, this.names = {}, this.anim = undefined, this.animRunning = !1
    }
}, Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Container), Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Node), Kinetic.Layer = function (a) {
    this.setDefaultAttrs({
        throttle: 12
    }), this.nodeType = "Layer", this.lastDrawTime = 0, this.beforeDrawFunc = undefined, this.afterDrawFunc = undefined, this.canvas = document.createElement("canvas"), this.context = this.canvas.getContext("2d"), this.canvas.style.position = "absolute", Kinetic.Container.apply(this, []), Kinetic.Node.apply(this, [a])
}, Kinetic.Layer.prototype = {
	
    draw: function () {
    	//console.log("cat cat cat" + Kinetic.Layer.prototype.dontDraw);
    	//if (Kinetic.Layer.prototype.dontDraw == true) return;
    	   
    	//if (!this.attrs.ldt) this.attrs.ldt = 0;
    	/*
    	var b = new Date;
    	var c = b.getTime();
    	var d = c - this.attrs.ldt
    	
    	//if (d < 20 && this.attrs.ldt) 
    	//	return;
    	
    	this.attrs.ldt = c;
    	*/
    	
    	
        var a = this.attrs.throttle,
            b = new Date,
           c = b.getTime(),
            d = c - this.lastDrawTime;
          //  if (d < a) break;
        if (d >= a) this._draw(), this.lastDrawTime = c, this.drawTimeout !== undefined && (clearTimeout(this.drawTimeout), this.drawTimeout = undefined);
        else if (this.drawTimeout === undefined) {
            var e = this;
            this.drawTimeout = setTimeout(function () {
                e.draw()
            }, a+10)
        }
    },
    setThrottle: function (a) {
        this.attrs.throttle = a
    },
    getThrottle: function () {
        return this.attrs.throttle
    },
    beforeDraw: function (a) {
        this.beforeDrawFunc = a
    },
    afterDraw: function (a) {
        this.afterDrawFunc = a
    },
    clear: function () {
        var a = this.getContext(),
            b = this.getCanvas();
        a.clearRect(0, 0, b.width, b.height)
    },
    getCanvas: function () {
        return this.canvas
    },
    getContext: function () {
        return this.context
    },
    add: function (a) {
        this._add(a)
    },
    remove: function (a) {
        this._remove(a)
    },
    _draw: function () {
        this.beforeDrawFunc !== undefined && this.beforeDrawFunc(), this.clear(), this.attrs.visible && this._drawChildren(), this.afterDrawFunc !== undefined && this.afterDrawFunc()
    }
}, Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Container), Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Node), Kinetic.Group = function (a) {
    this.nodeType = "Group", Kinetic.Container.apply(this, []), Kinetic.Node.apply(this, [a])
}, Kinetic.Group.prototype = {
    add: function (a) {
        this._add(a)
    },
    remove: function (a) {
        this._remove(a)
    },
    _draw: function () {
        this.attrs.visible && this._drawChildren()
    }
}, Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Container), Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Node), Kinetic.Shape = function (a) {
    this.setDefaultAttrs({
        fill: undefined,
        stroke: undefined,
        strokeWidth: undefined,
        lineJoin: undefined,
        detectionType: "path"
    }), this.data = [], this.nodeType = "Shape", Kinetic.Node.apply(this, [a])
}, Kinetic.Shape.prototype = {
    getContext: function () {
    	    
    	    if (!this.tempLayer) this.tempLayer = this.getLayer();
        return this.tempLayer.getContext()
    },
    getCanvas: function () {
        return this.tempLayer.getCanvas()
    },
    stroke: function () {
        var a = this.getContext();
        if ( !! this.attrs.stroke || !! this.attrs.strokeWidth) {
            var b = this.attrs.stroke ? this.attrs.stroke : "black",
                c = this.attrs.strokeWidth ? this.attrs.strokeWidth : 2;
            a.lineWidth = c, a.strokeStyle = b, a.stroke()
        }
    },
    fillStroke: function () {
        var a = this.getContext();
        !this.attrs.fill || (a.fillStyle = this.attrs.fill, a.fill()), this.stroke()
    },
    applyLineJoin: function () {
        var a = this.getContext();
        this.attrs.lineJoin !== undefined && (a.lineJoin = this.attrs.lineJoin)
    },
    setFill: function (a) {
        this.attrs.fill = a
    },
    getFill: function () {
        return this.attrs.fill
    },
    setStroke: function (a) {
        this.attrs.stroke = a
    },
    getStroke: function () {
        return this.attrs.stroke
    },
    setLineJoin: function (a) {
        this.attrs.lineJoin = a
    },
    getLineJoin: function () {
        return this.attrs.lineJoin
    },
    setStrokeWidth: function (a) {
        this.attrs.strokeWidth = a
    },
    getStrokeWidth: function () {
        return this.attrs.strokeWidth
    },
    setDrawFunc: function (a) {
        this.drawFunc = a
    },
    saveData: function () {
        var a = this.getStage(),
            b = a.attrs.width,
            c = a.attrs.height,
            d = a.bufferLayer,
            e = d.getContext();
        d.clear(), this._draw(d);
        var f = e.getImageData(0, 0, b, c);
        this.data = f.data
    },
    clearData: function () {
        this.data = []
    },
    intersects: function () {
        var a = Kinetic.GlobalObject._getPoint(arguments),
            b = this.getStage();
        if (this.attrs.detectionType === "path") {
            var c = b.pathLayer,
                d = c.getContext();
          //  alert("teeee")
           this._draw(c);
           var n =  d.isPointInPath(a.x, a.y)
            //if (n) alert(JSON.stringify(this.getAbsolutePosition()))
            return n;
        }
        var e = b.attrs.width,
            f = this.data[(e * a.y + a.x) * 4 + 3];
        return f !== undefined && f !== 0
    },
    _draw: function (a) {
        if (a !== undefined && this.drawFunc !== undefined) {
            var b = a.getStage(),
                c = a.getContext(),
                d = [],
                e = this.parent;
            d.unshift(this);
            while (e) d.unshift(e), e = e.parent;
            c.save();
            for (var f = 0; f < d.length; f++) {
                var g = d[f],
                    h = g.getTransform();
                (g.attrs.centerOffset.x !== 0 || g.attrs.centerOffset.y !== 0) && h.translate(-1 * g.attrs.centerOffset.x, -1 * g.attrs.centerOffset.y);
                var i = h.getMatrix();
                c.transform(i[0], i[1], i[2], i[3], i[4], i[5])
            }
            this.getAbsoluteAlpha() !== 1 && (c.globalAlpha = this.getAbsoluteAlpha()), this.tempLayer = a, this.drawFunc.call(this), c.restore()
        }
    }
}, Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.Node), Kinetic.Rect = function (a) {
    this.setDefaultAttrs({
        width: 0,
        height: 0,
        cornerRadius: 0
    }), this.shapeType = "Rect", a.drawFunc = function () {
        var a = this.getContext();
        
        // this should be 'clipping path obj' with a 'path' object
        // this is version 1 i guess...
        // must subtract clippingRect.y from group clippingRect from this object's y ( x too) 
        
        
        if (this.clippingRect) {
   		if (0 >= this.clippingRect.y+this.clippingRect.height || this.attrs.height <= this.clippingRect.y) {
   			this.hide();
   			return;
   		} else this.show();

        	var ap = this.getAbsolutePosition();
        	var cg = this.clippingRectGroupPosition;
        	////console.log( this.clippingRect.y+(cg.y-ap.y));
        	////console.log("MAthis.bOffset);
        	//if (this.bOffset) //console.log("Mapppyh1!!");
    		a.beginPath(), a.rect(this.clippingRect.x, this.clippingRect.y, this.clippingRect.width, this.clippingRect.height), a.clip();
    		// check to see if the object is completely clipped..
    		
    			
    		
    		
        }
	//alert('test');
        a.beginPath(), this.applyLineJoin(), this.attrs.cornerRadius === 0 ? a.rect(0, 0, this.attrs.width, this.attrs.height) : (a.moveTo(this.attrs.cornerRadius, 0), a.lineTo(this.attrs.width - this.attrs.cornerRadius, 0), a.arc(this.attrs.width - this.attrs.cornerRadius, this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI * 3 / 2, 0, !1), a.lineTo(this.attrs.width, this.attrs.height - this.attrs.cornerRadius), a.arc(this.attrs.width - this.attrs.cornerRadius, this.attrs.height - this.attrs.cornerRadius, this.attrs.cornerRadius, 0, Math.PI / 2, !1), a.lineTo(this.attrs.cornerRadius, this.attrs.height), a.arc(this.attrs.cornerRadius, this.attrs.height - this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI / 2, Math.PI, !1), a.lineTo(0, this.attrs.cornerRadius), a.arc(this.attrs.cornerRadius, this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI, Math.PI * 3 / 2, !1)), a.closePath(), this.fillStroke()
    }, Kinetic.Shape.apply(this, [a])
}, Kinetic.Rect.prototype = {
    setWidth: function (a) {
        this.attrs.width = a
    },
    getWidth: function () {
        return this.attrs.width
    },
    setHeight: function (a) {
        this.attrs.height = a
    },
    getHeight: function () {
        return this.attrs.height
    },
    setSize: function (a, b) {
        this.attrs.width = a, this.attrs.height = b
    },
    getSize: function () {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        }
    },
    setCornerRadius: function (a) {
        this.attrs.cornerRadius = a
    },
    getCornerRadius: function () {
        return this.attrs.cornerRadius
    }
}, Kinetic.GlobalObject.extend(Kinetic.Rect, Kinetic.Shape), Kinetic.Circle = function (a) {
    this.setDefaultAttrs({
        radius: 0
    }), this.shapeType = "Circle", a.drawFunc = function () {
        var a = this.getCanvas(),
            b = this.getContext();
        b.beginPath(), this.applyLineJoin(), b.arc(0, 0, this.attrs.radius, 0, Math.PI * 2, !0), b.closePath(), this.fillStroke()
    }, Kinetic.Shape.apply(this, [a])
}, Kinetic.Circle.prototype = {
    setRadius: function (a) {
        this.attrs.radius = a
    },
    getRadius: function () {
        return this.attrs.radius
    }
}, Kinetic.GlobalObject.extend(Kinetic.Circle, Kinetic.Shape), Kinetic.Image = function (a) {
    this.setDefaultAttrs({
        crop: {
            x: 0,
            y: 0,
            width: undefined,
            height: undefined
        }
    }), this.shapeType = "Image", a.drawFunc = function () {
        if (this.image !== undefined) {
            var a = this.attrs.width !== undefined ? this.attrs.width : this.image.width,
                b = this.attrs.height !== undefined ? this.attrs.height : this.image.height,
                c = this.attrs.crop.x,
                d = this.attrs.crop.y,
                e = this.attrs.crop.width,
                f = this.attrs.crop.height,
                g = this.getCanvas(),
                h = this.getContext();
            h.beginPath(), this.applyLineJoin(), h.rect(0, 0, a, b), h.closePath(), this.fillStroke(), e !== undefined && f !== undefined ? h.drawImage(this.image, c, d, e, f, 0, 0, a, b) : h.drawImage(this.image, 0, 0, a, b)
        }
    }, Kinetic.Shape.apply(this, [a])
}, Kinetic.Image.prototype = {
    setImage: function (a) {
        this.image = a
    },
    getImage: function () {
        return this.image
    },
    setWidth: function (a) {
        this.attrs.width = a
    },
    getWidth: function () {
        return this.attrs.width
    },
    setHeight: function (a) {
        this.attrs.height = a
    },
    getHeight: function () {
        return this.attrs.height
    },
    setSize: function (a, b) {
        this.attrs.width = a, this.attrs.height = b
    },
    getSize: function () {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        }
    },
    getCrop: function () {
        return this.attrs.crop
    },
    setCrop: function (a) {
        var b = {};
        b.crop = a, this.setAttrs(b)
    }
}, Kinetic.GlobalObject.extend(Kinetic.Image, Kinetic.Shape), Kinetic.Polygon = function (a) {
    this.setDefaultAttrs({
        points: {}
    }), this.shapeType = "Polygon", a.drawFunc = function () {
        var a = this.getContext();
        a.beginPath(), this.applyLineJoin(), a.moveTo(this.attrs.points[0].x, this.attrs.points[0].y);
        for (var b = 1; b < this.attrs.points.length; b++) a.lineTo(this.attrs.points[b].x, this.attrs.points[b].y);
        a.closePath(), this.fillStroke()
    }, Kinetic.Shape.apply(this, [a])
}, Kinetic.Polygon.prototype = {
    setPoints: function (a) {
        this.attrs.points = a
    },
    getPoints: function () {
        return this.attrs.points
    }
}, Kinetic.GlobalObject.extend(Kinetic.Polygon, Kinetic.Shape), Kinetic.RegularPolygon = function (a) {
    this.setDefaultAttrs({
        radius: 0,
        sides: 0
    }), this.shapeType = "RegularPolygon", a.drawFunc = function () {
        var a = this.getContext();
        a.beginPath(), this.applyLineJoin(), a.moveTo(0, 0 - this.attrs.radius);
        for (var b = 1; b < this.attrs.sides; b++) {
            var c = this.attrs.radius * Math.sin(b * 2 * Math.PI / this.attrs.sides),
                d = -1 * this.attrs.radius * Math.cos(b * 2 * Math.PI / this.attrs.sides);
            a.lineTo(c, d)
        }
        a.closePath(), this.fillStroke()
    }, Kinetic.Shape.apply(this, [a])
}, Kinetic.RegularPolygon.prototype = {
    setRadius: function (a) {
        this.attrs.radius = a
    },
    getRadius: function () {
        return this.attrs.radius
    },
    setSides: function (a) {
        this.attrs.sides = a
    },
    getSides: function () {
        return this.attrs.sides
    }
}, Kinetic.GlobalObject.extend(Kinetic.RegularPolygon, Kinetic.Shape), Kinetic.Star = function (a) {
    this.setDefaultAttrs({
        points: [],
        innerRadius: 0,
        outerRadius: 0
    }), this.shapeType = "Star", a.drawFunc = function () {
        var a = this.getContext();
        a.beginPath(), this.applyLineJoin(), a.moveTo(0, 0 - this.attrs.outerRadius);
        for (var b = 1; b < this.attrs.points * 2; b++) {
            var c = b % 2 === 0 ? this.attrs.outerRadius : this.attrs.innerRadius,
                d = c * Math.sin(b * Math.PI / this.attrs.points),
                e = -1 * c * Math.cos(b * Math.PI / this.attrs.points);
            a.lineTo(d, e)
        }
        a.closePath(), this.fillStroke()
    }, Kinetic.Shape.apply(this, [a])
}, Kinetic.Star.prototype = {
    setPoints: function (a) {
        this.attrs.points = a
    },
    getPoints: function () {
        return this.attrs.points
    },
    setOuterRadius: function (a) {
        this.attrs.outerRadius = a
    },
    getOuterRadius: function () {
        return this.attrs.outerRadius
    },
    setInnerRadius: function (a) {
        this.attrs.innerRadius = a
    },
    getInnerRadius: function () {
        return this.attrs.innerRadius
    }
}, Kinetic.GlobalObject.extend(Kinetic.Star, Kinetic.Shape), Kinetic.Text = function (a) {
	var self = this;
	this.setDefaultAttrs({
        fontFamily: "Calibri",
        text: "",
        fontSize: 12,
        fill: undefined,
        textStroke: undefined,
        textStrokeWidth: undefined,
        align: "left",
        verticalAlign: "top",
        padding: 0,
        fontStyle: "normal"
    }),self.shapeType = "Text", a.drawFunc = function () {
      var a = this.getContext();
       // a.beginPath();
      //  return;
        a.font = this.attrs.fontStyle + " " + this.attrs.fontSize + "pt " + this.attrs.fontFamily, a.textBaseline = "middle";
        var b = this.getTextHeight(),
            c = this.getTextWidth(),
            d = this.attrs.padding,
            e = 0,
            f = 0;
        switch (this.attrs.align) {
        case "center":
            e = c / -2 - d;
            break;
        case "right":
            e = -1 * c - d
        }
        switch (this.attrs.verticalAlign) {
        case "middle":
            f = b / -2 - d;
            break;
        case "bottom":
            f = -1 * b - d
        }
        //patched in by seth tenenbaum
	
        var g = 0; //d + e,
            h = b / 2 + d + f;
                  	
      if (this.clippingRect) {
      	      	if (0 >= this.clippingRect.y+this.clippingRect.height || h+b <= this.clippingRect.y) {
      	      		this.hide();
      	      		return;
   		} else this.show();   	
     // 	var ap = this.getAbsolutePosition();
    //  	var cg = this.clippingRectGroupPosition;
    		a.beginPath(), a.rect(this.clippingRect.x, this.clippingRect.y, this.clippingRect.width, this.clippingRect.height), a.clip();

      }
      
    //  self.textHeight = b;
     // self.textWidth = c;
   //   alert(this.attrs.textHeight);
  //  this.attrs.textFill !== undefined && (a.beginPath(), a.fillStyle = this.attrs.textFill, a.fillText(this.attrs.text, g, h), a.closePath());
  //  if (this.attrs.textStroke !== undefined || this.attrs.textStrokeWidth !== undefined) this.attrs.textStroke === undefined ? this.attrs.textStroke = "black" : this.attrs.textStrokeWidth === undefined && (this.attrs.textStrokeWidth = 2), a.lineWidth = this.attrs.textStrokeWidth, a.strokeStyle = this.attrs.textStroke, a.strokeText(this.attrs.text, g, h)

    //use simpler text drawing
      a.beginPath(), a.fillText(this.attrs.text, g, h), a.closePath();
    },  Kinetic.Shape.apply(this, [a])
}, Kinetic.Text.prototype = {
    setFontFamily: function (a) {
        this.attrs.fontFamily = a
    },
    getFontFamily: function () {
        return this.attrs.fontFamily
    },
    setFontSize: function (a) {
        this.attrs.fontSize = a
    },
    getFontSize: function () {
        return this.attrs.fontSize
    },
    setFontStyle: function (a) {
        this.attrs.fontStyle = a
    },
    getFontStyle: function () {
        return this.attrs.fontStyle
    },
    setTextFill: function (a) {
        this.attrs.textFill = a
    },
    getTextFill: function () {
        return this.attrs.textFill
    },
    setTextStroke: function (a) {
        this.attrs.textStroke = a
    },
    getTextStroke: function () {
        return this.attrs.textStroke
    },
    setTextStrokeWidth: function (a) {
        this.attrs.textStrokeWidth = a
    },
    getTextStrokeWidth: function () {
        return this.attrs.textStrokeWidth
    },
    setPadding: function (a) {
        this.attrs.padding = a
    },
    getPadding: function () {
        return this.attrs.padding
    },
    setAlign: function (a) {
        this.attrs.align = a
    },
    getAlign: function () {
        return this.attrs.align
    },
    setVerticalAlign: function (a) {
        this.attrs.verticalAlign = a
    },
    getVerticalAlign: function () {
        return this.attrs.verticalAlign
    },
    setText: function (a) {
        this.attrs.text = a
    },
    getText: function () {
        return this.attrs.text
    },
    getTextWidth: function () {
        return this.getTextSize().width
    },
    getTextHeight: function () {
        return this.getTextSize().height
    },
    getTextSize: function () {
    	// should create an invisible new context on the fly 
    	    
    	    
        var a = this.getContext();
        a.save(), a.font = this.attrs.fontStyle + " " + this.attrs.fontSize + "pt " + this.attrs.fontFamily;
        var b = a.measureText(this.attrs.text);
        return a.restore(), {
            width: b.width,
            height: parseInt(this.attrs.fontSize, 10)
        }
    }
}, Kinetic.GlobalObject.extend(Kinetic.Text, Kinetic.Shape), Kinetic.Line = function (a) {
    this.setDefaultAttrs({
        points: {},
        lineCap: "butt"
    }), this.shapeType = "Line", a.drawFunc = function () {
        var a = this.getContext();
        a.beginPath(), this.applyLineJoin(), a.moveTo(this.attrs.points[0].x, this.attrs.points[0].y);
        for (var b = 1; b < this.attrs.points.length; b++) a.lineTo(this.attrs.points[b].x, this.attrs.points[b].y);
        !this.attrs.lineCap || (a.lineCap = this.attrs.lineCap), this.stroke()
    }, Kinetic.Shape.apply(this, [a])
}, Kinetic.Line.prototype = {
    setPoints: function (a) {
        this.attrs.points = a
    },
    getPoints: function () {
        return this.attrs.points
    },
    setLineCap: function (a) {
        this.attrs.lineCap = a
    },
    getLineCap: function () {
        return this.attrs.lineCap
    }
}, Kinetic.GlobalObject.extend(Kinetic.Line, Kinetic.Shape), Kinetic.Transform = function () {
    this.m = [1, 0, 0, 1, 0, 0]
}, Kinetic.Transform.prototype = {
    translate: function (a, b) {
        this.m[4] += this.m[0] * a + this.m[2] * b, this.m[5] += this.m[1] * a + this.m[3] * b
    },
    scale: function (a, b) {
        this.m[0] *= a, this.m[1] *= a, this.m[2] *= b, this.m[3] *= b
    },
    rotate: function (a) {
        var b = Math.cos(a),
            c = Math.sin(a),
            d = this.m[0] * b + this.m[2] * c,
            e = this.m[1] * b + this.m[3] * c,
            f = this.m[0] * -c + this.m[2] * b,
            g = this.m[1] * -c + this.m[3] * b;
        this.m[0] = d, this.m[1] = e, this.m[2] = f, this.m[3] = g
    },
    getTranslation: function () {
        return {
            x: this.m[4],
            y: this.m[5]
        }
    },
    multiply: function (a) {
        var b = this.m[0] * a.m[0] + this.m[2] * a.m[1],
            c = this.m[1] * a.m[0] + this.m[3] * a.m[1],
            d = this.m[0] * a.m[2] + this.m[2] * a.m[3],
            e = this.m[1] * a.m[2] + this.m[3] * a.m[3],
            f = this.m[0] * a.m[4] + this.m[2] * a.m[5] + this.m[4],
            g = this.m[1] * a.m[4] + this.m[3] * a.m[5] + this.m[5];
        this.m[0] = b, this.m[1] = c, this.m[2] = d, this.m[3] = e, this.m[4] = f, this.m[5] = g
    },
    invert: function () {
        var a = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]),
            b = this.m[3] * a,
            c = -this.m[1] * a,
            d = -this.m[2] * a,
            e = this.m[0] * a,
            f = a * (this.m[2] * this.m[5] - this.m[3] * this.m[4]),
            g = a * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = b, this.m[1] = c, this.m[2] = d, this.m[3] = e, this.m[4] = f, this.m[5] = g
    },
    getMatrix: function () {
        return this.m
    }
}, Kinetic.Transition = function (a, b) {
    this.node = a, this.config = b, this.tweens = [];
    for (var c in b) c !== "duration" && c !== "easing" && c !== "callback" && (b[c].x === undefined && b[c].y === undefined && this.add(this._getTween(c, b)), b[c].x !== undefined && this.add(this._getComponentTween(c, "x", b)), b[c].y !== undefined && this.add(this._getComponentTween(c, "y", b)));
    var d = 0,
        e = this;
    for (var f = 0; f < this.tweens.length; f++) {
        var g = this.tweens[f];
        g.onFinished = function () {
            d++, d >= e.tweens.length && e.onFinished()
        }
    }
}, Kinetic.Transition.prototype = {
    add: function (a) {
        this.tweens.push(a)
    },
    start: function () {
        for (var a = 0; a < this.tweens.length; a++) this.tweens[a].start()
    },
    onEnterFrame: function () {
        for (var a = 0; a < this.tweens.length; a++) this.tweens[a].onEnterFrame()
    },
    stop: function () {
        for (var a = 0; a < this.tweens.length; a++) this.tweens[a].stop()
    },
    resume: function () {
        for (var a = 0; a < this.tweens.length; a++) this.tweens[a].resume()
    },
    _getTween: function (a) {
        var b = this.config,
            c = this.node,
            d = b.easing;
        d === undefined && (d = "linear");
        var e = new Kinetic.Tween(c, function (b) {
            c.attrs[a] = b
        }, Kinetic.Tweens[d], c.attrs[a], b[a], b.duration);
        return e
    },
    _getComponentTween: function (a, b) {
        var c = this.config,
            d = this.node,
            e = c.easing;
        e === undefined && (e = "linear");
        var f = new Kinetic.Tween(d, function (c) {
            d.attrs[a][b] = c
        }, Kinetic.Tweens[e], d.attrs[a][b], c[a][b], c.duration);
        return f
    }
}, Kinetic.Tween = function (a, b, c, d, e, f) {
    this._listeners = [], this.addListener(this), this.obj = a, this.propFunc = b, this.begin = d, this._pos = d, this.setDuration(f), this.isPlaying = !1, this._change = 0, this.prevTime = 0, this.prevPos = 0, this.looping = !1, this._time = 0, this._position = 0, this._startTime = 0, this._finish = 0, this.name = "", this.func = c, this.setFinish(e)
}, Kinetic.Tween.prototype = {
    setTime: function (a) {
        this.prevTime = this._time, a > this.getDuration() ? this.looping ? (this.rewind(a - this._duration), this.update(), this.broadcastMessage("onLooped", {
            target: this,
            type: "onLooped"
        })) : (this._time = this._duration, this.update(), this.stop(), this.broadcastMessage("onFinished", {
            target: this,
            type: "onFinished"
        })) : a < 0 ? (this.rewind(), this.update()) : (this._time = a, this.update())
    },
    getTime: function () {
        return this._time
    },
    setDuration: function (a) {
        this._duration = a === null || a <= 0 ? 1e5 : a
    },
    getDuration: function () {
        return this._duration
    },
    setPosition: function (a) {
        this.prevPos = this._pos, this.propFunc(a), this._pos = a, this.broadcastMessage("onChanged", {
            target: this,
            type: "onChanged"
        })
    },
    getPosition: function (a) {
        return a === undefined && (a = this._time), this.func(a, this.begin, this._change, this._duration)
    },
    setFinish: function (a) {
        this._change = a - this.begin
    },
    getFinish: function () {
        return this.begin + this._change
    },
    start: function () {
        this.rewind(), this.startEnterFrame(), this.broadcastMessage("onStarted", {
            target: this,
            type: "onStarted"
        })
    },
    rewind: function (a) {
        this.stop(), this._time = a === undefined ? 0 : a, this.fixTime(), this.update()
    },
    fforward: function () {
        this._time = this._duration, this.fixTime(), this.update()
    },
    update: function () {
        this.setPosition(this.getPosition(this._time))
    },
    startEnterFrame: function () {
        this.stopEnterFrame(), this.isPlaying = !0, this.onEnterFrame()
    },
    onEnterFrame: function () {
        this.isPlaying && this.nextFrame()
    },
    nextFrame: function () {
        this.setTime((this.getTimer() - this._startTime) / 1e3)
    },
    stop: function () {
        this.stopEnterFrame(), this.broadcastMessage("onStopped", {
            target: this,
            type: "onStopped"
        })
    },
    stopEnterFrame: function () {
        this.isPlaying = !1
    },
    continueTo: function (a, b) {
        this.begin = this._pos, this.setFinish(a), this._duration != undefined && this.setDuration(b), this.start()
    },
    resume: function () {
        this.fixTime(), this.startEnterFrame(), this.broadcastMessage("onResumed", {
            target: this,
            type: "onResumed"
        })
    },
    yoyo: function () {
        this.continueTo(this.begin, this._time)
    },
    addListener: function (a) {
        return this.removeListener(a), this._listeners.push(a)
    },
    removeListener: function (a) {
        var b = this._listeners,
            c = b.length;
        while (c--) if (b[c] == a) return b.splice(c, 1), !0;
        return !1
    },
    broadcastMessage: function () {
        var a = [];
        for (var b = 0; b < arguments.length; b++) a.push(arguments[b]);
        var c = a.shift(),
            d = this._listeners,
            e = d.length;
        for (var b = 0; b < e; b++) d[b][c] && d[b][c].apply(d[b], a)
    },
    fixTime: function () {
        this._startTime = this.getTimer() - this._time * 1e3
    },
    getTimer: function () {
        return (new Date).getTime() - this._time
    }
}, Kinetic.Tweens = {
    "back-ease-in": function (a, b, c, d, e, f) {
        var g = 1.70158;
        return c * (a /= d) * a * ((g + 1) * a - g) + b
    },
    "back-ease-out": function (a, b, c, d, e, f) {
        var g = 1.70158;
        return c * ((a = a / d - 1) * a * ((g + 1) * a + g) + 1) + b
    },
    "back-ease-in-out": function (a, b, c, d, e, f) {
        var g = 1.70158;
        return (a /= d / 2) < 1 ? c / 2 * a * a * (((g *= 1.525) + 1) * a - g) + b : c / 2 * ((a -= 2) * a * (((g *= 1.525) + 1) * a + g) + 2) + b
    },
    "elastic-ease-in": function (a, b, c, d, e, f) {
        var g = 0;
        return a === 0 ? b : (a /= d) == 1 ? b + c : (f || (f = d * .3), !e || e < Math.abs(c) ? (e = c, g = f / 4) : g = f / (2 * Math.PI) * Math.asin(c / e), -(e * Math.pow(2, 10 * (a -= 1)) * Math.sin((a * d - g) * 2 * Math.PI / f)) + b)
    },
    "elastic-ease-out": function (a, b, c, d, e, f) {
        var g = 0;
        return a === 0 ? b : (a /= d) == 1 ? b + c : (f || (f = d * .3), !e || e < Math.abs(c) ? (e = c, g = f / 4) : g = f / (2 * Math.PI) * Math.asin(c / e), e * Math.pow(2, -10 * a) * Math.sin((a * d - g) * 2 * Math.PI / f) + c + b)
    },
    "elastic-ease-in-out": function (a, b, c, d, e, f) {
        var g = 0;
        return a === 0 ? b : (a /= d / 2) == 2 ? b + c : (f || (f = d * .3 * 1.5), !e || e < Math.abs(c) ? (e = c, g = f / 4) : g = f / (2 * Math.PI) * Math.asin(c / e), a < 1 ? -0.5 * e * Math.pow(2, 10 * (a -= 1)) * Math.sin((a * d - g) * 2 * Math.PI / f) + b : e * Math.pow(2, -10 * (a -= 1)) * Math.sin((a * d - g) * 2 * Math.PI / f) * .5 + c + b)
    },
    "bounce-ease-out": function (a, b, c, d) {
        return (a /= d) < 1 / 2.75 ? c * 7.5625 * a * a + b : a < 2 / 2.75 ? c * (7.5625 * (a -= 1.5 / 2.75) * a + .75) + b : a < 2.5 / 2.75 ? c * (7.5625 * (a -= 2.25 / 2.75) * a + .9375) + b : c * (7.5625 * (a -= 2.625 / 2.75) * a + .984375) + b
    },
    "bounce-ease-in": function (a, b, c, d) {
        return c - Kinetic.Tweens["bounce-ease-out"](d - a, 0, c, d) + b
    },
    "bounce-ease-in-out": function (a, b, c, d) {
        return a < d / 2 ? Kinetic.Tweens["bounce-ease-in"](a * 2, 0, c, d) * .5 + b : Kinetic.Tweens["bounce-ease-out"](a * 2 - d, 0, c, d) * .5 + c * .5 + b
    },
    "ease-in": function (a, b, c, d) {
        return c * (a /= d) * a + b
    },
    "ease-out": function (a, b, c, d) {
        return -c * (a /= d) * (a - 2) + b
    },
    "ease-in-out": function (a, b, c, d) {
        return (a /= d / 2) < 1 ? c / 2 * a * a + b : -c / 2 * (--a * (a - 2) - 1) + b
    },
    "strong-ease-in": function (a, b, c, d) {
        return c * (a /= d) * a * a * a * a + b
    },
    "strong-ease-out": function (a, b, c, d) {
        return c * ((a = a / d - 1) * a * a * a * a + 1) + b
    },
    "strong-ease-in-out": function (a, b, c, d) {
        return (a /= d / 2) < 1 ? c / 2 * a * a * a * a * a + b : c / 2 * ((a -= 2) * a * a * a * a + 2) + b
    },
    linear: function (a, b, c, d) {
        return c * a / d + b
    }
};
