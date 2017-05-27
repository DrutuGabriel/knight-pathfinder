$(document).ready(function(){
    board = new App();
    board.init();
    board.drawBoard();
});

var board = null;
var canvas = null;
var ctx = null;

var App = function(){

    this.c_w = 60;
    this.c_h = 60;
    this.cells_x = 8;
    this.cells_y = 8;
        
    this.init = function(){
        canvas = document.getElementById('canvas-board');
        ctx = canvas.getContext('2d');
    
        canvas.width = this.c_w *  this.cells_x;
        canvas.height = this.c_h * this.cells_y;
        $(canvas).css({
            width: canvas.width,
            height: canvas.height,
        });
    };
    
    this.getCellPosition = function(x, y){
        return {
            x: (x * this.c_w) - this.c_w,
            y: (y * this.c_h) - this.c_h,
            w: this.c_w,
            h: this.c_h,
        };
    };
    
    this.drawBoard  =  function(){
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#c00';
        var cell = null;
        for(var i = 1; i <= this.cells_y; i++){
            for(var j = 1; j <= this.cells_x; j++){
                cell = this.getCellPosition(j, i);
                ctx.strokeRect(cell.x, cell.y, cell.w, cell.h);
                if(Math.floor(Math.random()*2) == 1){
                    ctx.fillRect(cell.x + 5, cell.y + 5, cell.w - 10, cell.h - 10);
                }
            }
        }
        
    };
};


