$(document).mousemove(function(e) {
    window.mousePosX= e.pageX;
    window.mousePosY = e.pageY;
});

$(document).ready(function(){
    board = new App();
    board.init();
});

var relativeBaseUrl = '/knight-path-finder-src/';
var board = null;
var canvas = null;
var ctx = null;

var App = function(){
    this.c_w = 50;
    this.c_h = 50;
    this.cells_x = 8;
    this.cells_y = 8;
    this.width = this.c_w * this.cells_x;
    this.height = this.c_h * this.cells_y;
    this.knight = null;
    this.images = {
        blackX : null,    
    };
    this.knightPos = {
        c_x: 1,
        c_y: 1,
        x: 0,
        y: 0,
    };
    
    this.boardState = 0;
    this.loading = 0;
    this.knightIsMobile = 1;
    this.moveList = [];
    this.obstacles = {'1':1, '3':1, '5':1, '8':1};
    this.currentAction = this.addMoveToList;
    
    this.init = function(){
        var self = this;
        
        canvas = document.getElementById('canvas-board');
        ctx = canvas.getContext('2d');
    
        canvas.width = this.width;
        canvas.height = this.height;
        $(canvas).css({
            width: canvas.width,
            height: canvas.height,
        });
        
        this.loadKnightSprite();
        this.loadImages();
        this.knight.onload = function(){
            self.main();
            $(canvas).on('click', function(){
                var mousePos = getMousePos(canvas);
                if(
                   mousePos.x > 0 && mousePos.x < self.width &&
                   mousePos.y > 0 && mousePos.y < self.height &&
                   self.boardState === 0
                ){
                    var pos = self.getCellCoords(mousePos.x, mousePos.y);
                    self.currentAction(pos.c_x, pos.c_y);
                }
            });
        };
    };
    
    this.addMoveToList = function (c_x, c_y) {
        this.moveList.push([c_x, c_y]);
    };
    
    this.addMoveSetToList = function(list){
        this.moveList = this.moveList.concat(list);
    };
    
    this.pathFind = function(c_x, c_y){
        var self = this;
        
        var data = {
            startingPoint: [this.knightPos.c_x, this.knightPos.c_y],
            destination: [c_x, c_y],
            obstacles: this.getChangedObstaclesFormat(),
            _token: token,
        };

        $.ajax({
            method: 'POST',
            data: data,
            url: knigthPathFindUrl,
            beforeSend: function(){
                self.loading = 1;
                $('.canvas-overlay').removeClass('not-displayed');
            },
        }).done(function(res){
            $('.canvas-overlay').addClass('not-displayed');
            
            if(res.status == 'OK'){
                self.addMoveSetToList(res.solution);
                self.loading = 0;
            }
        });
    };
    
    this.checkBoardState = function()
    {
        
        if(
           this.moveList.length > 0 ||
           this.loading === 1
        ){
            this.boardState = 1;
        } else {
            this.boardState = 0;
        }
    };
    
    this.getChangedObstaclesFormat = function()
    {
        self = this;
        var newFormat = {};
        
        $.each(this.obstacles, function(i){
            var pos = self.getCellsByIdx(i);

            if(typeof newFormat[pos.c_x] == 'undefined'){
                newFormat[pos.c_x] = {};
            }
            newFormat[pos.c_x][pos.c_y] = true;
        });

        return newFormat;
    };
    
    this.hoverOverCell = function(){
        var mousePos = getMousePos(canvas);
       
        var pos = self.getCellCoords(mousePos.x, mousePos.y);
        
        if(self.boardState === 0){
            self.fillCell(pos.c_x, pos.c_y);
            
            var idx = self.getIdxByCells(pos.c_x, pos.c_y);
         
            if(self.obstacles[idx] === 1){
                self.drawCellX(pos.c_x, pos.c_y);
                self.currentAction = self.removeObstacle;
            } else {
                var cellPos = this.getCellPosition(pos.c_x, pos.c_y);
                var imageSizeRatio = 0.25;
                var imageW = self.c_w * imageSizeRatio;
                var imageH = self.c_h * imageSizeRatio;
                var imagePosX = cellPos.x + (self.c_w - imageW) - 5;
                var imagePosY = cellPos.y + 5;
                
                if(mousePos.x >= imagePosX && mousePos.y <= (imagePosY + imageH)){
                    self.drawTopRightCornerX(pos.c_x, pos.c_y, imageSizeRatio + 0.10);
                    self.currentAction = self.addObstacle;
                } else {
                    self.drawTopRightCornerX(pos.c_x, pos.c_y, imageSizeRatio); 
                }
            }
        }
    };
    
    this.fillCell = function(c_x, c_y){
        var pos = this.getCellPosition(c_x, c_y);
      
        ctx.fillStyle = 'rgba(125, 125, 125, 0.5)';
        ctx.fillRect(pos.x+1, pos.y+1, this.c_w-2, this.c_h-2);
    };
    
    this.drawCellX = function(c_x, c_y){
        var blackX = this.images.blackX;
        var pos = this.getCellPosition(c_x, c_y);
        var imageW = this.c_w / 2;
        var imageH = this.c_h / 2;
        var imagePosX = pos.x + ((this.c_w - imageW) / 2);
        var imagePosY = pos.y + ((this.c_h - imageH) / 2);        
        
        ctx.drawImage(blackX, imagePosX, imagePosY, imageW, imageH);
    };
    
    this.drawTopRightCornerX = function(c_x, c_y, size){
        if(typeof size == 'undefined'){
            size = 0.25;
        }
        var pos = this.getCellPosition(c_x, c_y);
        var blackX = this.images.blackX;
        var imageW = this.c_w * size;
        var imageH = this.c_h * size;
        var imagePosX = pos.x + (this.c_w - imageW) - 5;
        var imagePosY = pos.y + 5;
        
        ctx.drawImage(blackX, imagePosX, imagePosY, imageW, imageH);
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
    
    this.getCellsByIdx = function(idx)
    {
        idx = parseInt(idx);
        
        var c_y = Math.floor(idx / this.cells_x) + 1;
        var c_x = (idx - ((c_y -1) * this.cells_x)) + 1;
        
        return {
            c_x: c_x,
            c_y: c_y,
        };
    };
    
    this.getIdxByCells = function(c_x, c_y){       
        var idx = (c_y - 1) * this.cells_x + (c_x - 1);
        
         return idx;
    };
    
    this.loadKnightSprite = function(){
        this.knight = new Image();
        this.knight.src = relativeBaseUrl + 'images/knight.png';
    };
    
    this.loadImages = function(){
        this.images.blackX = new Image();
        this.images.blackX.src = relativeBaseUrl + 'images/x-black.png';
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
    

    this.drawObstacle = function(x, y){
        ctx.fillStyle = 'rgba(175, 65, 65, 1)';
        ctx.fillRect(x+2, y+2, this.c_w-4, this.c_h-4);
        
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.moveTo(x + 2, y + 2);
        ctx.lineTo(x + this.c_w-4, y + this.c_h-4);
        ctx.stroke();
    };
    
    this.drawObstacles = function(){
        var obstacles = Object.keys(this.obstacles);
        var obstaclesLen = obstacles.length;
    
        for(var i = 0; i < obstaclesLen; i++){
            
            var cells = this.getCellsByIdx(obstacles[i]);            
            var pos = this.getCellPosition(cells.c_x, cells.c_y);
            this.drawObstacle(pos.x, pos.y);
        }
    };
    
    /**
     * Add an obstacle
     *
     */
    this.addObstacle = function(c_x, c_y){
        var idx = this.getIdxByCells(c_x, c_y);
        this.obstacles[idx] = 1;
    };
    
    /**
     * Delete the obstacle entry
     *
     */
    this.removeObstacle = function(c_x, c_y){
        var idx = this.getIdxByCells(c_x, c_y);
        
        delete this.obstacles[idx];
        
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
            self.drawObstacles();
                        
            self.currentAction = self.pathFind;
            self.hoverOverCell();
            
            if(self.knightIsMobile === 1){
                self.moveKnightTo();
            }
            self.drawKnightBase();
            
            self.checkBoardState();
            
            requestAnimationFrame(mainId);
        };
        
        requestAnimationFrame(mainId);
    };
};

function getMousePos(canvas) {
    var rect = canvas.getBoundingClientRect();
    
    return {
      x: window.mousePosX - rect.left,
      y: window.mousePosY - rect.top  - $(document).scrollTop(),
    };
}

