// 初始化 Phaser，并创建一个 400x490px 的游戏
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');
var game_state = {};

var localStorageName = "crackalien";
var highScore;

// 创建一个包含游戏的新'main'状态
game_state.main = function() { };  
game_state.main.prototype = {

    // 首先调用'preload'函数以加载所有资产
    preload: function() { 
        this.game.load.image('bg','assets/bg_day.png');
        this.bg = this.game.add.sprite(0, 0, 'bg');

        var style2 = { font: "30px Noto Sans SC", fill: "#000000" };
        this.title = this.game.add.text(80, 20, " 是男人就飞100秒", style2);

        // 更改游戏背景颜色
        this.game.stage.backgroundColor = '#71c5cf';

        // 加载鸟精灵
        this.game.load.spritesheet('bird', 'assets/bird.png', 34, 24);

        // 加载管道精灵
        this.game.load.image('pipe', 'assets/pipe.png');

        this.game.load.audio('jump', 'assets/fly.wav');
        
        this.game.load.audio('hit', 'assets/crash.wav');

        this.game.load.audio('coin', 'assets/score.wav');

        this.game.load.audio('bgm','assets/BGM.m4a');
        this.bgm = this.game.add.audio('bgm',0.8,true);
        this.bgm.play();
    },

    // 'preload'后调用'create'函数来设置游戏
    create: function() { 
        // 显示鸟
        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.bird.scale.setTo(2,2); 
        this.bird.animations.add('bird');
        this.bird.animations.play('bird', 24, true);

        // 给鸟增加重力以使其坠落
        this.bird.body.gravity.y = 1000; 

         // 向左和下移动锚点
        this.bird.anchor.setTo(-0.2, 0.5); 

        // 按下空格键时调用'jump'函数
        //定义空格的热键，按下空格，则添加跳跃给鸟
       //var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
       //space_key.onDown.add(this.jump, this);


        //上面的是键盘事件，这个是触摸事件
        var t = this;
        this.game.input.touch.onTouchStart = function(){
            //alert(0);
           t.jump();
            //console.log("down");
        }

        // 创建一组 20 个管道
        this.pipes = game.add.group();
        this.pipes.createMultiple(20, 'pipe');  

        // 每 1.5 秒调用一次“add_row_of_pipes”的计时器
        this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);           

        // 在屏幕左上角添加分数标签
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ffffff" };
        this.label_score = this.game.add.text(20, 20, "0", style);
        
        this.jumpSound = this.game.add.audio('jump',0.8); 
        
        this.hitSound = this.game.add.audio('hit',0.5); 

        this.scoreSound = this.game.add.audio('coin',0.2); 
    },

    // 此函数每秒调用 60 次
    update: function() {
        // 如果小鸟飞离区域（太高或太低），调用“restart_game”函数
        if (this.bird.inWorld == false)
            this.restart_game(); 

        if (this.bird.angle < 20)
            this.bird.angle += 1; 

        // 如果鸟与任何管道触碰，请调用“hitPipe”
        this.game.physics.overlap(this.bird, this.pipes, this.hitPipe, null, this);      
    },

    // 让小鸟飞跃
    jump: function() {
        if (this.bird.alive == false)
            return;

        // 给鸟增加一个垂直速度
        this.bird.body.velocity.y = -350;

        // 创建鸟的动画
        var animation = game.add.tween(this.bird);

        // 在 100 毫秒内将鸟的角度更改为 -20°
        animation.to({angle: -20}, 100);

        // 并开始动画
        animation.start(); 

        game.add.tween(this.bird).to({angle: -20}, 100).start(); 

        this.jumpSound.play(); 
    },

    hitPipe: function() {
        // 如果鸟已经撞到管子，什么都不做
        // 这意味着小鸟已经掉下来了
        if (this.bird.alive == false)
            return;
    
        // 将小鸟的alive属性设置为false
        this.bird.alive = false;
    
        // 防止出现新管道
        game.time.events.remove(this.timer);
    
        // 穿过所有的管道，并停止它们的移动
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);

        this.hitSound.play(); 
    }, 

    // 重新开始游戏
    restart_game: function() {
        this.bgm.stop();

        // 移除计时器
        this.game.time.events.remove(this.timer);

        // 启动'main'状态，重新启动游戏
        this.game.state.start('main');
    },

    // 向游戏区添加管道
    add_one_pipe: function(x, y) {
        // 拿到我们组的第一个预置管道
        var pipe = this.pipes.getFirstDead();

        // 设置管道的新位置
        pipe.reset(x, y);

         // 向管道添加速度以使其向左移动
        pipe.body.velocity.x = -200; 
               
        // 当它不再可见时删除管道
        pipe.outOfBoundsKill = true;
    },

    // 添加一排 6 个管道，中间有一个通路
    add_row_of_pipes: function() {
        var hole = Math.floor(Math.random()*5)+1;
        
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole +1) 
                this.add_one_pipe(400, i*60+10);   
    
        this.score += 1;
        this.label_score.content = this.score; 
        
        this.scoreSound.play();
    },
};

// 添加并启动'main'状态以开始游戏
game.state.add('main', game_state.main);  
game.state.start('main'); 