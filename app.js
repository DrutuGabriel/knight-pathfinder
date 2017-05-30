$(document).mousemove(function(e) {
    window.mousePosX= e.pageX;
    window.mousePosY = e.pageY;
});

$(document).ready(function(){
    board = new App();
    board.init();
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
        x: 0,
        y: 0,
    };
    
    this.boardState = 0;
    this.knightIsMobile = 1;
    this.moveList = [[2, 3],[4, 2]];
    
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
            self.main();
            $(canvas).on('click', function(){
                var pos = self.getCellCoords(window.mousePosX, window.mousePosY);
                self.moveList.push([pos.c_x, pos.c_y]);
            });
        };
    };
    
    this.hoverOverCell = function(){
        var mousePos = getMousePos(canvas);
       
        var pos = self.getCellCoords(mousePos.x, mousePos.y);
        
        if(self.boardState === 0){
            self.fillCell(pos.c_x, pos.c_y);
        }
    };
    
    this.fillCell = function(c_x, c_y){
        var pos = this.getCellPosition(c_x, c_y);
      
        ctx.fillStyle = 'rgba(125, 125, 125, 0.5)';
        ctx.fillRect(pos.x+1, pos.y+1, this.c_w-2, this.c_h-2);
    };
    
    
    this.updateKnightPos = function(x, y, cells) {
        if(typeof cells == 'undefined'){
            cells = false;
        }
        
        var pos;
        if(cells){
            pos = this.getCellPosition(x, y);
            this.knightPos.c_x = x;
            this.knightPos.c_y = y;
            this.knightPos.x = pos.x;
            this.knightPos.y = pos.y;

        } else {
            pos = this.getCellCoords(x, y);
            this.knightPos.c_x = pos.c_x;
            this.knightPos.c_y = pos.c_y;
            this.knightPos.x = x;
            this.knightPos.y = y;
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
              c_x: Math.floor((x + this.c_w)/ this.c_w),
              c_y: Math.floor((y + this.c_h)/ this.c_h),
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
    
    this.moveKnightTo = function(){
        var self = this;
        if(this.moveList.length === 0){
            return;
        }
        
        var move = this.moveList[0];
        
        var c_x = move[0];
        var c_y = move[1];
        
        var knightPos = {
            x: this.knightPos.x,
            y: this.knightPos.y,
        };
        
        var targetPos = this.getCellPosition(c_x, c_y);
        
        var speedX = 2;
        var speedY = 2;
        
        if(knightPos.x > targetPos.x){
            speedX = - speedX;
        }
        if(knightPos.y > targetPos.y){
            speedY = - speedY;
        }
        
 
        if(knightPos.x != targetPos.x){
            knightPos.x += speedX;
        }
        else if ( knightPos.y != targetPos.y){
            knightPos.y += speedY;
        }
        else {
            this.knightIsMobile = 0;
            self.moveList.shift();
            setTimeout(function(){
                self.knightIsMobile = 1;
            }, 250);
            
        }
        
        self.updateKnightPos(knightPos.x, knightPos.y);
    };

    this.drawKnightBase = function(){
        this.drawKnight(this.knightPos.x, this.knightPos.y);
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
    
    this.drawAll = function(){
        this.drawBoard();
        this.drawKnightBase();
    };
    
    this.main = function(){
        self = this;
        var mainId = function(){
            self.drawBoard();
            self.hoverOverCell();
            if(self.knightIsMobile === 1){
                self.moveKnightTo();
            }
            self.drawKnightBase();
            requestAnimationFrame(mainId);
        };
        
        requestAnimationFrame(mainId);
    };
};

function getMousePos(canvas) {
    var rect = canvas.getBoundingClientRect();
    
    return {
      x: window.mousePosX - rect.left - 1,
      y: window.mousePosY - rect.top - 1,
    };
}

