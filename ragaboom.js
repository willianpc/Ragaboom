/*
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

/*
 * ragaboom framework by chambs o.chambs@gmail.com
 */

//namespace
var RB = {};

// instantiates the RB.scene object
RB.Scene = function(canvasObj) {
	
	if(!canvasObj){
		throw "RB.Scene(canvasObject): You must specify a canvas object";
	}
	
	var c = canvasObj;
	var w = c.width;
	var h = c.height;
	this.ctx = c.getContext('2d');
	var objects = [];
	
	//controls if mouse is pressed or not
	var mouseIsDown = false;
	
	//the current object being dragged
	var currentObject = null;
	//var currentObjectIndex = -1;
	
	//dunno why i need em
	var dX=0, dY=0;

	// objects with collision properties
	var colObjects = [];
	
	var draggableObjects = [];

	// controls if the game loop should run or not
	var isStarted = false;

	// number of images attached to the scene
	var imgNum = 0;

	// number of loaded images which are attached to the scene
	var imgCounter = 0;

	// attaches the object to the scene object
	this.add = function(o) {
		
		//checks if the object exists
		if(!o){
			throw "RB.Scene.add(o): the object you are trying to add to the scene doesn't exist.";
		}
		
		objects.push(o);

		// adds the object on a separate 
		// array if it is set to collision
		if (o.isCollidable())
			colObjects.push(o);
		
		// adds the object on a separate 
		// array if it is draggable
		if (o.isDraggable()){
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
		var uid = o.getUniqueId();
		var oLen = objects.length;
		var doLen = draggableObjects.length;
		var coLen = colObjects.length;
		
		for(var i=0; i < oLen; i++){
			if(uid == objects[i].getUniqueId()){
				objects.splice(i, 1);
				break;
			}
		}
		
		for(var i=0; i < coLen; i++){
			if(uid == colObjects[i].getUniqueId()){
				colObjects.splice(i, 1);
				break;
			}
		}
		
		for(var i=0; i < doLen; i++){
			if(uid == draggableObjects[i].getUniqueId()){
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
	
	//registers canvas events
	var theScene = this;
	c.onmousemove = function(e){theScene.mouseMove(e); theScene.onmousemove(e);};
	c.onmousedown = function(e){theScene.canvasOnmousedown(e);};
	c.onmouseup = function(e){mouseIsDown = false;};
	
	document.onkeydown = function(e){
		//theScene.runOnce();
		theScene.onkeydown(e);
	};
	
	document.onkeyup = function(e){
		//theScene.runOnce();
		theScene.onkeyup(e);
	};
	
	this.onmousemove = function(e){};
	
	//event methods
	this.mouseMove = function(event, fn){
		if(mouseIsDown && currentObject) {
			currentObject.setX(RB.xPos(event) - dX);
			currentObject.setY(RB.yPos(event) - dY);
			
			/* if you r trying to drag something
			 * but the scene is being animated, that should be checked first.
			 * so, if the scene is being animated, the animation itself
			 * takes care of the drag effect. otherwise the update method
			 * is called.  
			 */
			if(!isStarted){
				this.update();
				//this.runOnce() ???
			}
		}
		
		if(fn)fn();
	};
	
	this.canvasOnmousedown = function(event, fn){
		var doLen = draggableObjects.length;

		for(var i=0; i < doLen; i++){
			var o = draggableObjects[i];

			if( o.checkRange(RB.xPos(event), RB.yPos(event)) ){
				currentObject = o;
				currentObjectIndex = i;
				
				dX = RB.xPos(event) - currentObject.getX();
				dY = RB.yPos(event) - currentObject.getY();
				mouseIsDown = true;
				break;
			}
		}
		if(fn)fn();
	};
	
	this.onkeydown = function(event){};
	this.onkeyup = function(event){};

	this.getObjectSize = function() {
		return objects.length;
	};

	this.getObj = function(index) {
		return objects[index];
	};

	// draws a rectangle inside a buffer canvas
	this.rect = function(w, h, fillStyle, id) {
		var c = RB.createCanvas(w, h, id);
		var ctx = c.getContext('2d');
		ctx.fillStyle = RB.getFS(fillStyle, ctx, h);
		ctx.fillRect(0, 0, w, h);
	};

	// load an image inside a buffer canvas
	this.image = function(url, id) {
		var img = new Image();
		var theScene = this;
		img.onload = function() {
			var c = RB.createCanvas(img.width, img.height, id);
			var ctx = c.getContext('2d');
			ctx.drawImage(this, 0, 0);

			imgCounter++;

			if (imgCounter == imgNum) {
				theScene.doAfterLoad();
			}
		};
		img.src = url;
		imgNum++;
	};

	// draws a (repeated) pattern inside a buffer canvas
	this.imagePattern = function(url, w, h, patternType, id) {
		var img = new Image();
		var theScene = this;
		img.onload = function() {
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
		
		if(!w || !h || !arco || !fillStyle || !id){
			throw "All parameters must be set: roundRect(w, h, arc, fillStyle, id);";
		}
		
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
	};

	// draws a text inside a buffer canvas
	this.text = function(str, fontFamily, fontSize, fillStyle, id) {
		var tb = RB.getTextBuffer();
		tb.innerHTML = str;
		tb.style.fontFamily = fontFamily;
		tb.style.fontSize = fontSize + 'px';
		
		//check if that id already exists
		//if so doesnt create a new canvas
		var c = RB.el(id);
		if(!c){
			c = RB.createCanvas(tb.offsetWidth, tb.offsetHeight + 15, id);
		} else {
			//if already existed, clear and rezise the canvas
			c.getContext('2d').clearRect(0, 0, tb.offsetWidth, tb.offsetHeight + 15);
			c.width = tb.offsetWidth;
			c.height = tb.offsetHeight + 15;
		}

		var ctx = c.getContext('2d');
		ctx.fillStyle = RB.getFS(fillStyle, ctx, tb.offsetHeight + 25);
		ctx.font = 'normal ' + fontSize + 'px ' + fontFamily;
		ctx.fillText(str, 0, tb.offsetHeight + 5);
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
		var objectLen = objects.length;

		for (var i = 0; i < objectLen; i++) {
			var otmp = objects[i];
			
			if(otmp.isVisible()){
				otmp.run();
			}else{
				continue;
			}

			if (otmp.isCollidable() && !otmp.isObstacle()) {
				var colObjectsLen = colObjects.length;

				for (var j = 0; j < colObjectsLen; j++) {
					var o = colObjects[j];

					// object doesnt check collision with itself,
					// so if object unique ids are the same this part is skipped
					if (otmp.getUniqueId() != o.getUniqueId()) {
						//var colCheck = o.checkCollision(otmp);
						var colCheck = otmp.checkCollision(o);

						if (colCheck.top || colCheck.bottom || colCheck.left || colCheck.right) {
							otmp.setIsColliding(true);
							otmp.setCollidingCoords(colCheck);

							// object collided in something, so abort the loop
							break;
						} else {
							otmp.setIsColliding(false);
							otmp.setCollidingCoords(null);
						}
					}
				}
			}
		}
	};

	this.animate = function() {

		this.runOnce();
		
		//global operation that is executed
		//every loop
		this.onLoop();

		if (isStarted) {
			var theScene = this;
			setTimeout(function() {
				theScene.animate();
			}, 24);
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

	/* setters and getters */
	this.getW = function() {
		return w;
	};
	this.getH = function() {
		return h;
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

	var uniqueId = Math.random();
	var name = "";
	var sCtx = sceneContext;
	var ctx = null;
	var canvas = null;
	var x = 0;
	var y = 0;
	var w = 0;
	var h = 0;
	
	if(_x) x = _x;
	if(_y) y = _y;
	
	//tells the scene if the object should be read or not
	//which means, if the object is visible for the scene
	//if set to true, the scene will ignore the object and will not
	//run it
	var visible = true;

	// sets if this object should respect collision system
	var collidable = false;

	// sets if this object is an obstacle
	// obstacles collide but they dont check anything
	// only non obstacles should check for collisions
	var obstacle = false;
	var colliding = false;
	var collidingCoords = null;
	
	/*
	used by collision system
	it tells the collision system which direction should I check
	indicates which way the object is moving to.
	for instance, if lastDirection is north, this means that I should
	check for colisions in the top of my object
	*/
	var lastDirection = null;
	
	var draggable = false;

	/*
	 * x and y end position from objeto. 
	 * The objects starts in x, y and ends at x2, y2
	 */
	var x2 = 0, y2 = 0;

	var speedX = 1;
	var speedY = 1;

	var counter = 0;

	// array containing list of sprites for object animation
	var sprites = null;

	// number of loops before to change sprite image
	var spriteChangeInterval = 1;
	this.setSpriteInterval = function(p) {
		spriteChangeInterval = p;
	};
	this.getSpriteInterval = function() {
		return spriteChangeInterval;
	};

	// counts if spriteChangeInterval reached its goal
	var spriteCounter = 0;

	// sprites array pointer to navigate through the array
	var spritePointer = 0;

	/* setters and getters */
	this.setCanvas = function(p) {
		canvas = (typeof p == 'object' ? p : RB.el(p));

		w = canvas.width;
		h = canvas.height;
		x2 = x + w;
		y2 = y + h;
	};
	
	this.setCoords = function(_x, _y){
		x = _x; y = _y;
	};
	
	this.setDimension = function(_w, _h){
		w = _w; h = _h;
	};
	
	this.setCanvas(c);

	this.getCanvas = function() {
		return canvas;
	};

	this.getUniqueId = function() {
		return uniqueId;
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

	this.setX = function(p) {
		x = p;
	};
	this.getX = function() {
		return x;
	};

	this.setY = function(p) {
		y = p;
	};
	this.getY = function() {
		return y;
	};
	
	this.setXY = function(p, q){
		x=p; y=q;
	};

	this.setW = function(p) {
		w = p;
	};
	this.getW = function() {
		return w;
	};

	this.setH = function(p) {
		h = p;
	};
	this.getH = function() {
		return h;
	};

	this.setCounter = function(p) {
		counter = p;
	};
	this.getCounter = function() {
		return counter;
	};

	this.setSpeedX = function(p) {
		speedX = p;
	};
	this.getSpeedX = function() {
		return speedX;
	};

	this.setSpeedY = function(p) {
		speedY = p;
	};
	
	this.getSpeedY = function() {
		return speedY;
	};
	
	this.setSpeed = function(p){
		speedX = p;
		speedY = p;
	};
	
	this.setCollidable = function(p) {
		collidable = p;
	};
	this.isCollidable = function() {
		return collidable;
	};

	this.setObstacle = function(p) {
		obstacle = p;
	};
	this.isObstacle = function() {
		return obstacle;
	};

	this.setDraggable = function(p) {
		draggable = p;
	};
	this.isDraggable = function() {
		return draggable;
	};
	
	this.setName = function(p) {
		name = p;
	};
	this.getName = function() {
		return name;
	};

	this.setIsColliding = function(p) {
		colliding = p;
	};
	this.isColliding = function() {
		return colliding;
	};
	
	this.setCollidingCoords = function(cc){
		collidingCoords = cc;
	};
	
	this.getCollidingCoords = function(){
		return collidingCoords;
	};

	this.getX2 = function() {
		return x2;
	};
	
	this.getY2 = function() {
		return y2;
	};
	
	this.setVisible = function(p){visible=p;};
	this.isVisible = function(){return visible;};

	this.ds = function() {
		return name + ': x=' + x + ', y=' + y + ', w=' + w + ', h=' + h;
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
		o.setX(x);
		o.setY(y);
		o.setW(w);
		o.setH(h);
		o.setCollidable(collidable);
		o.setObstacle(obstacle);
		o.setCounter(counter);
		o.fn = this.fn;
		o.setSpeedX(speedX);
		o.setSpeedY(speedY);
		o.setSprites(sprites, this.getSpriteInterval());
		o.setDraggable(draggable);
		o.setVisible(visible);

		return o;
	};

	// facade for ctx.drawImage
	this.draw = function(w, h) {
		if (w && h) {
			sCtx.drawImage(canvas, x, y, w, h);
		} else {
			sCtx.drawImage(canvas, x, y);
		}
	};

	// moves the object up
	this.up = function() {
		y -= speedY;
		lastDirection = 'up';
	};

	// moves the object down
	this.down = function() {
		y += speedY;
		lastDirection = 'down';
	};

	// moves the object to left
	this.left = function() {
		x -= speedX;
		lastDirection = 'left';
	};

	// moves the object to right
	this.right = function() {
		x += speedX;
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

	/*
	 * This method checks if the object is being hit by another object above it.
	 * baseY is the base of the object whos checking for collisions.
	 * initPt and endPt are the the width of the object whos checking for collisions.
	 */
	this.checkCollision = function(otherObj) {
		var x1 = otherObj.getX();
		var y1 = otherObj.getY();
		var x2 = otherObj.getX() + otherObj.getW();
		var y2 = otherObj.getY() + otherObj.getH();
		
		var collisions = {
			top: false,
			bottom: false,
			left: false,
			right: false
		};
		
		//checks which way I should look for collisions
		
		if(lastDirection=='up'){
			//means i must check if i hit something above me
			var yCase = y < y2 && (y+h) > y2;
			var xCase = x < x2 && (x+w) > x1;
			if( yCase && xCase ){
				collisions['top'] = true;
			}
		}
		
		if(lastDirection=='down'){
			//means i must check if i hit something below me
			var yCase = (y+h) > y1 && (y+h) < y2;
			var xCase = x < x2 && (x+w) > x1;
			if( yCase && xCase ){
				collisions['bottom'] = true;
			}
		}
		
		if(lastDirection=='left'){
			//means i must check if i hit something on my left side
			var yCase = y < y2 && (y+h) > y1;
			var xCase = x < x2 && (x+w) > x2;
			if( yCase && xCase ){
				collisions['left'] = true;
			}
		}
		
		if(lastDirection=='right'){
			//means i must check if i hit something on my right side
			var yCase = y < y2 && (y+h) > y1;
			var xCase = (x+w) > x1 && (x+w) < x2;
			if( yCase && xCase ){
				collisions['right'] = true;
			}
		}
		
		return collisions;
	};
	
	//returns true if rx and ry are inside the objects area
	this.checkRange = function(rx, ry){
		var xRange = rx >= x && rx <= (x + w);
		var yRange = ry >= y && ry <= (y + h);
		
		return xRange && yRange;
	};

	// the event fired when a colision is detected
	// you do whatever you want here
	this.onCollide = function() {
	};
	
	this.onNonCollide = function() {
	};

	// fires the onColide function
	this.boom = function() {
		this.onCollide();
	};
};

// this is the div responsible to calculate canvas dimensions
// for a text painted
RB.createTextBuffer = function() {
	var txtBuffer = document.createElement("div");

	txtBuffer.id = 'txtBuffer';
	txtBuffer.style.position = 'absolute';
	txtBuffer.style.width = 'auto';
	txtBuffer.style.height = 'auto';
	txtBuffer.style.padding = '0px';
	txtBuffer.style.visibility = 'hidden';

	document.body.appendChild(txtBuffer);
};

// returns the div txtBuffer.
// If it doesnt exist, instantiate it (singleton!)
RB.getTextBuffer = function() {
	if (!RB.el('txtBuffer')) {
		RB.createTextBuffer();
	}
	return RB.el('txtBuffer');
};

// creates a new buffer canvas
RB.createCanvas = function(w, h, id) {
	var c = document.createElement("canvas");
	c.width = w;
	c.height = h;
	c.id = id;
	c.style.display = "none";
	document.body.appendChild(c);
	return c;
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
			fn();
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
