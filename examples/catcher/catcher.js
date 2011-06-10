/**
 * CATcher 
 */
var c = RB.el('c');
var ctx = c.getContext('2d');

//checks if browser has HTML5 Canvas support
function cs(){
	if(!RB.canvasSupport(document.getElementById('c'))){
		document.location.href = "support.htm";
	}
}


