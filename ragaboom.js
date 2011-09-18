/*
Ragaboom Framework by Chambs o.chambs@gmail.com

Copyright (C) 2011 by Willian Carvalho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var RB = {};

RB.Scene = function(canvasObj, loopTime) {
	
	if(!canvasObj){
		throw "RB.Scene(canvasObject): You must specify a canvas object";
	}
	
	if(!loopTime){
		loopTime = 24;
	}
	
	this.timeInterval = loopTime;
	var c = canvasObj;
	var d = document;
	this.ctx = c.getContext('2d');
	var objects = [];
	
	//the object that must be moved by arrow keys
	var movableObjectId = null;
	
	//the keys pressed at the present moment
	var leftP = false;
	var rightP = false;
	var topP = false;
	var downP = false;
	
	//controls if mouse is pressed or not
	var mouseIsDown = false;
	
	//the current object being dragged
	var currentObject = null;
	
	var dX=0, dY=0;

	// collidable objects
	var colObjects = [];
	
	var draggableObjects = [];

	// controls if the game loop should run or not
	var isStarted = false;

	// number of images attached to the scene
	var imgNum = 0;

	// number of loaded images which are attached to the scene
	var imgCounter = 0;
	
	var divIdCounter = 0;
	
	this.genID = function(){
		return 'RB_OBJECT' + (divIdCounter++);
	}	
	
	// attaches the object to the scene object
	this.add = function(o) {
		
		//checks if the object exists
		if(!o){
			throw "RB.Scene.add(o): the object you are trying to add to the scene doesn't exist.";
		}
		
		objects.push(o);

		// adds the object on a separate 
		// array if it is set to collision
		if (o.collidable)
			colObjects.push(o);
		
		// adds the object on a separate 
		// array if it is draggable
		if (o.draggable){
			draggableObjects.push(o);
		}
		
		return o;
	};
	
	//adds a lot of objects at a time by passing an array
	this.addLots = function(oArray){
		var theScene = this;
		for(var i=0; i < oArray.length; i++){
			theScene.add(oArray[i]);
		}
	};
	
	//removes an object from the scene
	this.remove = function(o){
		var uid = o.getId();
		var oLen = objects.length;
		var doLen = draggableObjects.length;
		var coLen = colObjects.length;
		
		for(var i=0; i < oLen; i++){
			if(uid == objects[i].getId()){
				objects.splice(i, 1);
				break;
			}
		}
		
		for(var i=0; i < coLen; i++){
			if(uid == colObjects[i].getId()){
				colObjects.splice(i, 1);
				break;
			}
		}
		
		for(var i=0; i < doLen; i++){
			if(uid == draggableObjects[i].getId()){
				draggableObjects.splice(i, 1);
				break;
			}
		}
	};
	
	//removes a lot of objects at once by passing an array
	this.removeLots = function(oArray){
		var theScene = this;
		for(var i=0; i < oArray.length; i++){
			theScene.remove(oArray[i]);
		}
	};
	
	/*
	 * Removes all objects from the scene
	 * Usually used to show a new screen
	 */
	this.removeAll = function(){
		var oLen = objects.length;
		var doLen = draggableObjects.length;
		var coLen = colObjects.length;

		objects.splice(0, oLen);
		colObjects.splice(0, coLen);
		draggableObjects.splice(0, doLen);
	};
	
	this.zIndex = function(o, index){
		var oLen = objects.length;
		var currIndex = getIdByObject(o);
		var newIndex = currIndex + index;
		
		if(newIndex < 0){
			newIndex = 0;
		}
		if(newIndex >= oLen){
			newIndex = oLen-1;
		}
		
		//saves a copy of the object
		var tmp = objects[currIndex];
		objects[currIndex] = objects[newIndex];
		objects[newIndex] = tmp;
	};
	
	//returns an object from the oject array by its id
	getObjectById = function(id){
		var oLen = objects.length;
		for(var i=0; i < oLen; i++){
			if(objects[i].getId() == id){
				return o;
			}
		}
		return null;
	};
	
	//returns an object id from the oject
	getIdByObject = function(ob){
		var oLen = objects.length;
		for(var i=0; i < oLen; i++){
			if(objects[i].getId() == ob.getId()){
				return i;
			}
		}
		return null;
	};
	
	this.setMovableObject = function(p){
		if(typeof p == 'object') {
			movableObjectId = p.getId();
		} else {
			movableObjectId = p;
		}
	};
	
	this.getMovableObject = function(){
		return getObjectById(movableObjectId);
	};
	
	//gets the keys pressed. its used on the movable object
	var getKeyDirection = function(e, b){
		var k = e.keyCode;
	
		switch(k){
			case 37:
			leftP = b;
			break;
		
			case 38:
			topP = b;
			break;
		
			case 39:
			rightP = b;
			break;
		
			case 40:
			downP = b;
			break;
		}
	};
	
	this.onmousemove = function(e){};
	this.onmousedown = function(e){};
	this.onmouseup = function(e){};
	this.onkeydown = function(e){};
	this.onkeyup = function(e){};
	
	//registers canvas events
	var theScene = this;
	c.onmousemove = function(e){mouseMove(e); theScene.onmousemove(e);};
	c.onmousedown = function(e){mousedown(e); theScene.onmousedown(e);};
	c.onmouseup = function(e){mouseIsDown = false; theScene.onmouseup(e);};
	
	d.onkeydown = function(e){
		getKeyDirection(e, true);
		theScene.onkeydown(e);
	};
	
	d.onkeyup = function(e){
		getKeyDirection(e, false);
		theScene.onkeyup(e);
	};
	
	//event methods
	var mouseMove = function(event){
		if(mouseIsDown && currentObject) {
			currentObject.x = (RB.xPos(event) - dX);
			currentObject.y = (RB.yPos(event) - dY);
			
			/* if you r trying to drag something
			 * but the scene is being animated, that should be checked first.
			 * so, if the scene is being animated, the animation itself
			 * takes care of the drag effect. otherwise the update method
			 * is called.  
			 */
			if(!isStarted){
				theScene.update();
			}
		}
	};
	
	var mousedown = function(event){
		var doLen = draggableObjects.length-1;

		for(var i=doLen; i >= 0; i--){
			var o = draggableObjects[i];

			if( o.checkRange(RB.xPos(event), RB.yPos(event)) ){
			
				//mouse events for objects go here
				o.onmousedown(event);
			
				currentObject = o;
				currentObjectIndex = i;
				
				dX = RB.xPos(event) - currentObject.x;
				dY = RB.yPos(event) - currentObject.y;
				mouseIsDown = true;
				break;
			}
		}
	};
	
	this.getObjectSize = function() {
		return objects.length;
	};

	this.getObj = function(index) {
		return objects[index];
	};

	// draws a rectangle inside a buffer canvas
	this.rect = function(w, h, fillStyle, id) {
		var theScene = this;
		id = id || theScene.genID();
		var c = RB.createCanvas(w, h, id);
		var ctx = c.getContext('2d');
		ctx.fillStyle = RB.getFS(fillStyle, ctx, h);
		ctx.fillRect(0, 0, w, h);
		
		return rectObj = new RB.Obj(c, this.ctx);
	};

	// load an image inside a buffer canvas
	//and return it in a RB.Obj
	this.image = function(url, cb, id) {
		var img = new Image();
		var theScene = this;
		var c = null;
		img.onload = function() {
			id = id || theScene.genID();
			c = RB.createCanvas(img.width, img.height, id);
			var ctx = c.getContext('2d');
			ctx.drawImage(this, 0, 0);
			imgCounter++;
			
			var obj = new RB.Obj(c, theScene.ctx);
			cb(obj);
		};
		img.src = url;
		imgNum++;
	};

	// load an image inside a buffer canvas
	//and returns the canvas DOM
	this.loadImage = function(url, id, cb) {
		var img = new Image();
		var theScene = this;
		var c = null;
		img.onload = function() {
			id = id || theScene.genID();
			c = RB.createCanvas(img.width, img.height, id);
			var ctx = c.getContext('2d');
			ctx.drawImage(this, 0, 0);
			imgCounter++;
			
			cb(c);
		};
		img.src = url;
		imgNum++;
	};

	// draws a (repeated) pattern inside a buffer canvas
	this.imagePattern = function(url, w, h, patternType, id) {
		var img = new Image();
		var theScene = this;
		img.onload = function() {
			id = id || theScene.genID();
			var c = RB.createCanvas(w, h, id);
			var ctx = c.getContext('2d');
			var fs = ctx.createPattern(img, patternType);
			ctx.fillStyle = fs;
			ctx.fillRect(0, 0, w, h);

			imgCounter++;

			if (imgCounter == imgNum) {
				theScene.doAfterLoad();
			}
		};
		img.src = url;
		imgNum++;
	};

	this.roundRect = function(w, h, arco, fillStyle, id) {
		
		if(!w || !h || !arco || !fillStyle){
			throw "All parameters must be set: roundRect(w, h, arc, fillStyle, id);";
		}
		var theScene = this;
		
		id = id || theScene.genID();
		var c = RB.createCanvas(w, h, id);
		
		var ctx = c.getContext('2d');
		var x = 0, y = 0;

		ctx.beginPath();

		ctx.moveTo(x + arco, y);
		ctx.lineTo(w + x - arco, y);
		ctx.quadraticCurveTo(w + x, y, w + x, y + arco);
		ctx.lineTo(w + x, h + y - arco);
		ctx.quadraticCurveTo(w + x, y + h, w + x - arco, y + h);
		ctx.lineTo(x + arco, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - arco);
		ctx.lineTo(x, y + arco);
		ctx.quadraticCurveTo(x, y, x + arco, y);
		ctx.closePath();
		ctx.fillStyle = RB.getFS(fillStyle, ctx, h);
		ctx.fill();
		
		return new RB.Obj(c, theScene.ctx);
	};

	// draws a text inside a buffer canvas
	this.text = function(str, fontFamily, fontSize, fillStyle, id) {
		var tb = RB.getTextBuffer();
		var theScene = this;
		id = id || theScene.genID();
		
		tb.innerHTML = str;
		tb.style.fontFamily = fontFamily;
		tb.style.fontSize = fontSize + 'px';
		
		//check if that id already exists
		//if so doesnt create a new canvas
		var c = RB.el(id);
		var ctx;
		
		if(!c){
			c = RB.createCanvas(tb.offsetWidth, tb.offsetHeight + 15, id);
			ctx = c.getContext('2d');
		} else {
			//if already existed, clear and rezise the canvas
			ctx = c.getContext('2d');
			
			c.width = tb.offsetWidth;
			c.height = tb.offsetHeight + 15;
			ctx.clearRect(0, 0, tb.offsetWidth, tb.offsetHeight + 15);
		}

		ctx.fillStyle = RB.getFS(fillStyle, ctx, tb.offsetHeight + 25);
		ctx.font = 'normal ' + fontSize + 'px ' + fontFamily;
		ctx.fillText(str, 0, tb.offsetHeight + 5);
		
		var obj = new RB.Obj(c, theScene.ctx);
		
		return obj;
	};

	this.start = function() {
		isStarted = true;
		this.animate();
	};

	this.stop = function() {
		isStarted = false;
	};

	this.toggleStart = function() {
		isStarted ? this.stop() : this.start();
	};
	
	this.onLoop = function(){};
	
	//this is all the logic when a scene starts running
	//it is separated from animate method so that it can be used in other cases
	this.runOnce = function(){
		this.ctx.restore();
		var objectLen = objects.length;
		var colObjectsLen = colObjects.length;

		for (var i = 0; i < objectLen; i++) {
			var otmp = objects[i];

			if(otmp.visible) {
				otmp.run();
			} else {
				continue;
			}
			
			if (otmp.collidable && !otmp.obstacle) {

				for (var j = 0; j < colObjectsLen; j++) {
					var o = colObjects[j];

					// object doesnt check collision with itself,
					// so if object unique ids are the same this part is skipped
					if (otmp.getId() != o.getId()) {
						var colCheck = otmp.checkCollision(o, true);
						o=null;

						if (colCheck.top || colCheck.bottom || colCheck.left || colCheck.right) {
							otmp.colliding = true;
							otmp.collidingCoords = colCheck;

							// object collided in something, so abort the loop
							break;
						} else {
							otmp.colliding = false;
							otmp.collidingCoords = null;
						}
					}
				}
			}
			
			moveOrCollide(otmp);

		}
		this.ctx.save();
	};
	
	var moveOrCollide = function(obj){
		//check if object is movable
		var anyArrowIsPressed = leftP || rightP || downP || topP;
		if(obj.getId() == movableObjectId && anyArrowIsPressed){
		
			//check coordinate collisions
			var lc=false, rc=false, tc=false, dc=false;
			var cc = obj.collidingCoords;
			if(cc){
				lc = cc.left;
				rc = cc.right;
				tc = cc.top;
				dc = cc.bottom;
			}
		
			if(leftP && !lc)obj.left();
			if(rightP && !rc)obj.right();
			if(topP && !tc) obj.up();
			if(downP && !dc) obj.down();
		}
	};

	this.animate = function() {
		this.runOnce();
		
		//global operation that is executed every loop
		this.onLoop();

		if (isStarted) {
			var theScene = this;
			setTimeout(function() {
				theScene.animate();
			}, this.timeInterval);
		}
	};
	
	//update the canvas only once
	//idk if this can cause any trouble if ran at
	//same time as .animate :/
	this.update = function() {
		var objectLen = objects.length;
		for ( var i = 0; i < objectLen; i++) {
			var otmp = objects[i];
			otmp.run();
		}
	};

	// method executed after all images are buffered and loaded
	this.doAfterLoad = function() {
	};
};

// object
RB.Obj = function(c, sceneContext, _x, _y) {
	
	if(!sceneContext){
		throw "RB.Obj(c, sceneContext, _x, _y): You must specify a scene context";
	}

	var id = Math.random();
	var sCtx = sceneContext;
	var ctx = null;
	var canvas = null;
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	
	if(_x) this.x = _x;
	if(_y) this.y = _y;
	
	this.onmousedown = function(e){};
	
	//tells the scene if the object should be read or not
	//which means, if the object is visible for the scene
	//if set to true, the scene will ignore the object and will not
	//run it
	this.visible = true;

	// sets if this object should respect collision system
	this.collidable = false;

	// sets if this object is an obstacle
	// obstacles collide but they dont check anything
	// only non obstacles should check for collisions
	this.obstacle = false;
	this.colliding = false;
	this.collidingCoords = null;
	
	/*
	used by collision system
	it tells the collision system which direction should I check
	indicates which way the object is moving to.
	for instance, if lastDirection is north, this means that I should
	check for colisions in the top of my object
	*/
	var lastDirection = null;
	
	this.draggable = false;

	this.speedX = 1;
	this.speedY = 1;

	// array containing list of sprites for object animation
	var sprites = null;

	// number of loops before changing sprite image
	this.spriteChangeInterval = 1;

	// counts if spriteChangeInterval reached its goal
	var spriteCounter = 0;

	// sprites array pointer to navigate through the array
	var spritePointer = 0;

	/* setters and getters */
	this.setCanvas = function(p) {
		canvas = (typeof p == 'object' ? p : RB.el(p));

		this.w = canvas.width;
		this.h = canvas.height;
	};
	
	this.setCoords = function(_x, _y){
		this.x = _x; this.y = _y;
	};
	
	this.setDimension = function(_w, _h){
		this.w = _w; this.h = _h;
	};
	
	this.setCanvas(c);

	this.getCanvas = function() {
		return canvas;
	};

	this.getId = function() {
		return id;
	};

	this.setSCtx = function(p) {
		sCtx = p;
	};
	this.getSCtx = function() {
		return sCtx;
	};

	this.setCtx = function(p) {
		ctx = p;
	};
	this.getCtx = function() {
		return ctx;
	};

	this.setXY = function(p, q){
		this.x=p; this.y=q;
	};

	this.setSpeed = function(p){
		this.speedX = p;
		this.speedY = p;
	};
	
	this.getX2 = function() {
		return this.x + this.w;
	};
	
	this.getY2 = function() {
		return this.y + this.h;
	};
	
	this.fn = function() {
		this.draw();
	};

	this.run = function() {
		this.fn();
	};

	// clones the object and returns a new instance of it
	this.clone = function() {
		var o = new RB.Obj(c, sCtx);
		o.x = this.x;
		o.y = this.y;
		o.w = this.w;
		o.h = this.h;
		o.collidable = this.collidable;
		o.obstacle = this.obstacle;
		o.fn = this.fn;
		o.speedX = this.speedX;
		o.speedY = this.speedY;
		o.setSprites(sprites, this.spriteChangeInterval);
		o.draggable = this.draggable;
		o.visible = this.visible;

		return o;
	};
	
	//state is used to determine if the object changed since the last time
	//it was drawn on canvas. If state changed, that means the object must be
	//repainted in the screen. If it didnt change the context.restore will
	//take care of the job.
	function updateState(){

		return this.x + ', ' + this.y + ', ' + this.w + ', ' + this.h + ', ' + 
		this.visible + ', ' + this.collidable + ', ' + this.obstacle + ', ' + 
		this.colliding + ', ' + this.collidingCoords + ', ' + this.speedX + 
		', ' + this.speedY + ', ' + this.spriteChangeInterval;
	}

	// facade for ctx.drawImage
	this.draw = function(w, h) {
	
		try{
			if (w && h) {
				sCtx.drawImage(canvas, this.x, this.y, w, h);
			} else {
				sCtx.drawImage(canvas, this.x, this.y);
			}
		} catch(e){
			throw e;
		}
		
	};

	// moves the object up
	this.up = function(p) {
		this.y -= p || this.speedY;
		lastDirection = 'up';
	};

	// moves the object down
	this.down = function(p) {
		this.y += p || this.speedY;
		lastDirection = 'down';
	};

	// moves the object to left
	this.left = function(p) {
		this.x -= p || this.speedX;
		lastDirection = 'left';
	};

	// moves the object to right
	this.right = function(p) {
		this.x += p || this.speedX;
		lastDirection = 'right';
	};

	/*
	 * it sets an sprite array. Every 'interval' loops the next image from array is displayed.
	 * After the last image is shown, it points to the first image again and restart the process.
	 */
	this.setSprites = function(canvasList, interval) {
		sprites = canvasList;
		spriteChangeInterval = interval;
	};

	/*
	 * Animates the object using the sprite array
	 */
	this.animateSprite = function() {
		if (spriteCounter == spriteChangeInterval) {
			canvas = sprites[++spritePointer] ? sprites[spritePointer]
					: sprites[spritePointer = 0];
			spriteCounter = 0;
		} else {
			spriteCounter++;
		}
	};

	this.checkCollision = function(otherObj, predict) {
		var x1 = otherObj.x;
		var y1 = otherObj.y;
		var x2 = otherObj.getX2();
		var y2 = otherObj.getY2();
		
		if(predict){
			x1 -= this.speedX;
			y1 -= this.speedY;
			x2 += this.speedX;
			y2 += this.speedY;
		}
		
		var collisions = {
			top: false,
			bottom: false,
			left: false,
			right: false
		};
		
		//checks which way I should look for collisions
		if(lastDirection=='up'){
			collisions['top'] = upCheck(x1, y1, x2, y2);
			collisions['left'] = leftCheck(x1, y1, x2, y2);
			collisions['right'] = rightCheck(x1, y1, x2, y2);
		}
		
		if(lastDirection=='down'){
			collisions['bottom'] = bottomCheck(x1, y1, x2, y2);
			collisions['left'] = leftCheck(x1, y1, x2, y2);
			collisions['right'] = rightCheck(x1, y1, x2, y2);
		}
		
		if(lastDirection=='right'){
			collisions['right'] = rightCheck(x1, y1, x2, y2);
			collisions['top'] = upCheck(x1, y1, x2, y2);
			collisions['bottom'] = bottomCheck(x1, y1, x2, y2);
		}
		
		if(lastDirection=='left'){
			collisions['left'] = leftCheck(x1, y1, x2, y2);
			collisions['top'] = upCheck(x1, y1, x2, y2);
			collisions['bottom'] = bottomCheck(x1, y1, x2, y2);
		}
		
		return collisions;
	};
	
	var theObject = this;
	var leftCheck = function(x1, y1, x2, y2){
		//means i must check if I hit something on my left side
		var yCase = theObject.y < y2 && theObject.getY2() > y1;
		var xCase = theObject.x < x2 && theObject.getX2() > x2;
		return yCase && xCase;
	};
	
	var rightCheck = function(x1, y1, x2, y2){
		//means i must check if i hit something on my right side
		var yCase = theObject.y < y2 && theObject.getY2() > y1;
		var xCase = theObject.getX2() > x1 && theObject.getX2() < x2;
		return yCase && xCase;
	};

	var upCheck = function(x1, y1, x2, y2){
		//means i must check if i hit something above me
		var yCase = theObject.y < y2 && theObject.getY2() > y2;
		var xCase = theObject.x < x2 && theObject.getX2() > x1;
		return yCase && xCase;
	};

	var bottomCheck = function(x1, y1, x2, y2){
		//means i must check if i hit something below me
		var yCase = theObject.getY2() > y1 && theObject.getY2() < y2;
		var xCase = theObject.x < x2 && theObject.getX2() > x1;
		return yCase && xCase;
	};

	//returns true if rx and ry are inside the objects area
	this.checkRange = function(rx, ry){
		var xRange = rx >= this.x && rx <= this.getX2();
		var yRange = ry >= this.y && ry <= this.getY2();
		
		return xRange && yRange;
	};

};

// this is the div responsible to calculate canvas dimensions
// for a text painted
RB.createTextBuffer = function() {
	var d = document;
	var txtBuffer = d.createElement("div");

	txtBuffer.id = 'txtBuffer';
	txtBuffer.style.position = 'absolute';
	txtBuffer.style.width = 'auto';
	txtBuffer.style.height = 'auto';
	txtBuffer.style.padding = '0px';
	txtBuffer.style.visibility = 'hidden';

	d.body.appendChild(txtBuffer);
};

// returns the div txtBuffer.
// If it doesnt exist, instantiate it (singleton!)
RB.getTextBuffer = function() {
	if (!RB.el('txtBuffer')) {
		RB.createTextBuffer();
	}
	return RB.el('txtBuffer');
};

/*
specifies a dom element where all canvas objects
will be stored.
if this parameter is not set, all objects will be stored
in the document.body 
 */
RB.createCanvasLocation = null;

//creates a new buffer canvas
RB.createCanvas = function(w, h, id) {
	var d = document;
	var c = d.createElement("canvas");
	c.width = w;
	c.height = h;
	c.id = id;
	c.style.display = "none";
	
	if(RB.createCanvasLocation){
		RB.createCanvasLocation.appendChild(c);
	} else {
		d.body.appendChild(c);
	}
	
	return c;
};

RB.destroyCanvas = function(id){
	var d = document;
	var o = d.getElementById(id);
	d.body.removeChild(o);
};

// returns a div element
RB.el = function(id) {
	return document.getElementById(id);
};

/*
 * colorSettings should be like this:
 * var colorSettings = { h: 0, colors:[ {stopPoint: 0, name: 'rgb(240, 240,
 * 240)'}, {stopPoint: 1, name: 'gray'} ] };
 */
RB.linearGradient = function(colorSettings, ctx) {
	var lingrad = ctx.createLinearGradient(0, 5, 0, colorSettings.h);
	csLen = colorSettings.colors.length;

	for ( var i = 0; i < csLen; i++) {
		var color = colorSettings.colors[i];
		lingrad.addColorStop(color.stopPoint, color.name);
	}

	return lingrad;
};

RB.getFS = function(fillStyle, ctx, h) {
	if (typeof fillStyle == 'object') {
		fillStyle.h = h;
		var fs = RB.linearGradient(fillStyle, ctx);
		return fs;
	}
	return fillStyle;
};

// load an image in real time
RB.rtImage = function(url, id, fn) {
	var img = new Image();
	img.onload = function() {
		var c = RB.createCanvas(img.width, img.height, id);
		var ctx = c.getContext('2d');
		ctx.drawImage(this, 0, 0);

		if (fn)
			fn(c);
	};
	img.src = url;
};

//returns true if browser has canvas support
RB.canvasSupport = function(c) {
	if (c) {
		try {
			c.getContext('2d');
			return true;
		} catch (e) {
			return false;
		}
	} else {
		return false;
	}
};

RB.xPos = function(e){
	return e.pageX - e.target.offsetLeft;
};

RB.yPos = function(e){
	return e.pageY - e.target.offsetTop;
};
