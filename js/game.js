
//Loads flock sets speed and win when all aliens destroyed
var AlienFlock = function AlienFlock() {
  this.invulnrable = true;
  this.dx = 10; this.dy = 0;
  this.hit = 1; this.lastHit = 0;
  //aliens speed
  this.speed = 25;

  this.draw = function() {};

  this.die = function() {
    if(Game.board.nextLevel()) {
      Game.loadBoard(new GameBoard(Game.board.nextLevel())); 
    } else {
      Game.callbacks['win']();
    }
  }

  this.step = function(dt) { 
    if(this.hit && this.hit != this.lastHit) {
      this.lastHit = this.hit;
      this.dy = this.speed;
    } else {
      this.dy=0;
    }
    this.dx = this.speed * this.hit;

    var max = {}, cnt = 0;
    this.board.iterate(function() {
      if(this instanceof Alien)  {
        if(!max[this.x] || this.y > max[this.x]) {
          max[this.x] = this.y; 
        }
        cnt++;
      } 
    });

    if(cnt == 0) { this.die(); } 

    this.max_y = max;
    return true;
  };

}



var Alien = function Alien(opts) {
  this.flock = opts['flock'];
  this.frame = 0;
  this.mx = 0;
}

Alien.prototype.draw = function(canvas) {
  Sprites.draw(canvas,this.name,this.x,this.y,this.frame);
}

//alien die
Alien.prototype.die = function() {
  GameAudio.play('die');
  this.flock.speed += 1; //increase flock speed when one alien is killed
  this.board.remove(this);
  this.board.score++; //increase score
}
//move alien
Alien.prototype.step = function(dt) {
  this.mx += dt * this.flock.dx;
  this.y += this.flock.dy;
  if(Math.abs(this.mx) > 70) {
    if(this.y == this.flock.max_y[this.x]) {
      this.fireSometimes();
    }
    this.x += this.mx;
    this.mx = 0;
    if(this.x > Game.width - Sprites.map.alien1.w * 2) this.flock.hit = -1;
    if(this.x < Sprites.map.alien1.w) this.flock.hit = 1;
	//this.frame = (this.frame+1) % 2; //alien frames
	GameAudio.play('hover');
	
  }
  
  return true;
}
//alien fire frequency
Alien.prototype.fireSometimes = function() {
      if(Math.random()*100 < 4) {
        this.board.addSprite('almissile',this.x + this.w/2 - Sprites.map.almissile.w/2,
                                      this.y + this.h, 
                                     { dy: 100 });
      }
}

var Player = function Player(opts) { 
  this.reloading = 0;
}

//draw player to canvas
Player.prototype.draw = function(canvas) { 
   Sprites.draw(canvas,'player',this.x,this.y);
}


Player.prototype.die = function() {
  GameAudio.play('die'); //play explosion when player dies
  Game.callbacks['die'](); //display game over screen
}

//spaceship control system
Player.prototype.step = function(dt) {
  if(Game.keys['left']) { this.x -= 120 * dt; }
  if(Game.keys['right']) { this.x += 120 * dt; }


  if(this.x < 0) this.x = 0;
  if(this.x > Game.width-this.w) this.x = Game.width-this.w;

  this.reloading--;
 
  
//max number of missiles, missile speed, reload time
  if(Game.keys['fire'] && this.reloading <= 0 && this.board.missiles < 4) {
    GameAudio.play('fire');
    this.board.addSprite('missile',
                          this.x + this.w/2 - Sprites.map.missile.w/2,
                          this.y-this.h,
                          { dy: -100, player: true });
    this.board.missiles++;
    this.reloading = 20;
  }
  return true;
}


//Player missile function

var Missile = function Missile(opts) {
   this.dy = opts.dy;
   this.player = opts.player;
}

//draw missile
Missile.prototype.draw = function(canvas) {
   Sprites.draw(canvas,'missile',this.x,this.y);
}



Missile.prototype.step = function(dt) {
   this.y += this.dy * dt; //player missile speed

   var enemy = this.board.collide(this); //collision detector
   if(enemy) { 
     enemy.die();
     return false;
   }
   return (this.y < 0 || this.y > Game.height) ? false : true;
}

Missile.prototype.die = function() {
  if(this.player) this.board.missiles--;
  if(this.board.missiles < 0) this.board.missiles=0;
   this.board.remove(this);
} 

//The function for the alien missile
var Almissile = function Almissile(opts) {
   this.dy = opts.dy;
   this.player = opts.player;
   this.frame = 0;
}

Almissile.prototype.draw = function(canvas) {
   Sprites.draw(canvas,'almissile',this.x,this.y,this.frame);
}

Almissile.prototype.step = function(dt) {
   this.y += this.dy * dt;

   var enemy = this.board.collide(this);
   if(enemy) { 
     enemy.die();
     return false;
   }
   return (this.y < 0 || this.y > Game.height) ? false : true;
}

Almissile.prototype.die = function() {
  if(this.player) this.board.Almissiles--;
  if(this.board.Almissiles < 0) this.board.Almissiles=0;
   this.board.remove(this);
}

//Boss variable
var Boss = function Boss(opts) {
  this.dx = opts.dx;
  this.frame = 0;
}

Boss.prototype.draw = function(canvas) {
  Sprites.draw(canvas,'boss',this.x,this.y,this.frame);
}

Boss.prototype.step = function(dt) {
  this.x += this.dx;
  if (this.x < 600) { //stop playing when boss moves out of screen
      GameAudio.play('boss');
  }
  return true;
}

Boss.prototype.die = function() {
  this.board.score += 20;; //Killing boss gives 20 points
  GameAudio.play('die');
  this.board.remove(this);
}




