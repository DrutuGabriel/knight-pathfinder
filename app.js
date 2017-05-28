$(document).ready(function(){
    board = new App();
    board.init();
    var coordList = [[2, 3],[4, 4], [5, 6]];
    board.moveKnightTo(coordList);
});

var board = null;
var canvas = null;
var ctx = null;

var App = function(){

    this.c_w = 50;
    this.c_h = 50;
    this.cells_x = 8;
    this.cells_y = 8;
    this.knight = null;
    this.knightPos = {
        c_x: 1,
        c_y: 1,
    };
        
    
    this.init = function(){
        var self = this;
        
        canvas = document.getElementById('canvas-board');
        ctx = canvas.getContext('2d');
    
        canvas.width = this.c_w *  this.cells_x;
        canvas.height = this.c_h * this.cells_y;
        $(canvas).css({
            width: canvas.width,
            height: canvas.height,
        });
        
        this.loadKnightSprite();
        this.knight.onload = function(){
            self.drawBoard();
            self.drawKnightToCell(self.knightPos.c_x, self.knightPos.c_y);
        };
    };
    
    this.updateKnightPos = function(x, y, cells) {
        if(typeof cells == 'undefined'){
            cells = false;
        }
        
        if(cells){
            this.knightPos.c_x = x;
            this.knightPos.c_y = y;
        } else {
            var pos = this.getCellCoords(x, y);
            this.knightPos.c_x = pos.c_x;
            this.knightPos.c_y = pos.c_y;
        }
    };
    
    
    this.getCellPosition = function(c_x, c_y){
        return {
            x: (c_x * this.c_w) - this.c_w,
            y: (c_y * this.c_h) - this.c_h,
        };
    };
    
    this.getCellCoords = function(x, y){
        return {
              c_x: Math.floor((x + this.c_w )/ this.c_w),
              c_y: Math.floor((y + this.c_h )/ this.c_h),
        };
    };
    
    this.loadKnightSprite = function(){
        this.knight = new Image();
        this.knight.src = 'images/knight.png';
    };
    
    this.drawKnightToCell = function(c_x, c_y){
        pos = this.getCellPosition(c_x, c_y);
        this.drawKnight(pos.x, pos.y);
    };
    
    this.drawKnight = function(x, y){
        ctx.drawImage(this.knight, x + 10, y + 10, this.c_w - 20, this.c_h - 20);
    };
    
    this.moveKnightTo = function(moveList){
        var move;
        if(moveList.length > 0){
            move = moveList.shift();
        } else {
            return;
        }
        
        var c_x = move[0];
        var c_y = move[1];
        
        var self = this;
        var knightPos = this.getCellPosition(this.knightPos.c_x, this.knightPos.c_y);
        var targetPos = this.getCellPosition(c_x, c_y);
        
        var speedX = 1;
        var speedY = 1;
        
        if(knightPos.x > targetPos.x){
            speedX = - speedX;
        }
        if(knightPos.y > targetPos.y){
            speedY = - speedY;
        }
        
        var moveId = setInterval(function(){
            if(knightPos.x != targetPos.x){
                knightPos.x += speedX;
            }
            else if ( knightPos.y != targetPos.y){
                knightPos.y += speedY;
            }
            else {
                clearInterval(moveId);
                setTimeout(function(){
                    self.moveKnightTo(moveList);
                }, 250);
                return;
            }
            
            self.drawBoard();
            self.drawKnight(knightPos.x, knightPos.y);
            self.updateKnightPos(knightPos.x, knightPos.y);
        }, 15);
    };
        
    this.drawBoard  =  function(){
        canvas.width = canvas.width;
        ctx.strokeStyle = '#000';

        var pos = null;
        for(var i = 1; i <= this.cells_y; i++){
            for(var j = 1; j <= this.cells_x; j++){
                pos = this.getCellPosition(j, i);
                ctx.strokeRect(pos.x, pos.y, this.c_w, this.c_h);
            }
        }
    };
    
    this.main = function(){
        
    };
};
