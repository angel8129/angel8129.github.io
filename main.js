// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');
var game_state = {};

// Creates a new 'main' state that will contain the game
game_state.main = function() { };  
game_state.main.prototype = {

    // Function called first to load all the assets
    preload: function() { 
        // Change the background color of the game
        this.game.stage.backgroundColor = '#71c5cf';

        // Load the bird sprite
        this.game.load.spritesheet('bird', 'assets/bird.png', 34, 24);

        // Load the pipe sprite
        this.game.load.image('pipe', 'assets/pipe.png');

        this.game.load.audio('jump', 'assets/jump.mp3'); 

        //this.game.load.audio('bgm','assets/BGM.m4a');
        //this.bgm = this.game.add.audio('bgm',0.8,true);
        //this.bgm.play();
    },

    // Fuction called after 'preload' to setup the game 
    create: function() { 
        // Display the bird on the screen
        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.bird.scale.setTo(2,2); 
        this.bird.animations.add('wing');
        this.bird.animations.play('wing', 24, true);

        // Add gravity to the bird to make it fall
        this.bird.body.gravity.y = 1000; 

         // Move the anchor to the left and downward
        this.bird.anchor.setTo(-0.2, 0.5); 

        // Call the 'jump' function when the spacekey is hit
        //定义空格的热键，按下空格，则添加跳跃给鸟
       //var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
       //space_key.onDown.add(this.jump, this);


        //上面的是键盘事件，这个是触摸事件
        var t = this
        this.game.input.touch.onTouchStart = function(){
            //alert(0);
            t.jump();
            //console.log("down");
        }

        // Create a group of 20 pipes
        this.pipes = game.add.group();
        this.pipes.createMultiple(20, 'pipe');  

        // Timer that calls 'add_row_of_pipes' ever 1.5 seconds
        this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);           

        // Add a score label on the top left of the screen
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ffffff" };
        this.label_score = this.game.add.text(20, 20, "0", style);
        
        this.jumpSound = this.game.add.audio('jump'); 
    },

    // This function is called 60 times per second
    update: function() {
        // If the bird is out of the world (too high or too low), call the 'restart_game' function
        if (this.bird.inWorld == false)
            this.restart_game(); 

        if (this.bird.angle < 20)
            this.bird.angle += 1; 

        // If the bird overlap any pipes, call 'hitPipe'
        this.game.physics.overlap(this.bird, this.pipes, this.hitPipe, null, this);      
    },

    // Make the bird jump 
    jump: function() {
        if (this.bird.alive == false)
            return;

        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;

        // Create an animation on the bird
        var animation = game.add.tween(this.bird);

        // Change the angle of the bird to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);

        // And start the animation
        animation.start(); 

        game.add.tween(this.bird).to({angle: -20}, 100).start(); 

        this.jumpSound.play(); 
    },

    hitPipe: function() {
        // If the bird has already hit a pipe, do nothing
        // It means the bird is already falling off the screen
        if (this.bird.alive == false)
            return;
    
        // Set the alive property of the bird to false
        this.bird.alive = false;
    
        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);
    
        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
    }, 

    // Restart the game
    restart_game: function() {
        // Remove the timer
        this.game.time.events.remove(this.timer);

        // Start the 'main' state, which restarts the game
        this.game.state.start('main');
    },

    // Add a pipe on the screen
    add_one_pipe: function(x, y) {
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();

        // Set the new position of the pipe
        pipe.reset(x, y);

         // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 
               
        // Kill the pipe when it's no longer visible 
        pipe.outOfBoundsKill = true;
    },

    // Add a row of 6 pipes with a hole somewhere in the middle
    add_row_of_pipes: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole +1) 
                this.add_one_pipe(400, i*60+10);   
    
        this.score += 1;
        this.label_score.content = this.score;  
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 