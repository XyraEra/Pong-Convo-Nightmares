let game; 
let dialogue = [];
let dialogueIndex = 0;
let bgImage;
let leftPaddleImage;
let rightPaddleImage;
let replayButton;
let particles = [];

// *** HORROR DIALOGUE INDICES (Red Flash) ***
const horrorIndices = [16, 18, 20]; 

function preload() {
    bgImage = loadImage('https://i.ibb.co/99MhB7ny/Pong.jpg');
    leftPaddleImage = loadImage('https://i.ibb.co/GfkXR1bn/20-left.png');
    rightPaddleImage = loadImage('https://i.ibb.co/21ty6gyW/30-Right.png');

    dialogue = [
        "Welp! Mom died.", "Yeah, she's still dead.", "Damn.",
        "Death doesn't bargain. \nIt closes a door and keeps it closed.",
        "I was such a teenage brat,\nI never got to KNOW her properly.",
        "Most truths arrive too late.", "I see her in \nmy nightmares.",
        "I see her in my dreams too.", "She keeps dying in mine,\nsometimes horrifically.",
        "That changes. Now she is \nhappy in our dreams.",
        "Really? The nightmares \nare BRUTAL!!", "I know. It'll pass.",
        "How are the dreams now?", "She's mostly just...there \nwith us, chilling.",
        "Like, she's part of the family?", "Yes!", "Alive? Not a skeleton?",     
        "Yup, a happy, healthy human.", "Not a phantom? \nNot a rotted zombie?", "Nope.",
        "She is not chopped up \ninto pieces?", "...Yeah, that was a bad one.",
        "I HATE it here.", "I'm sorry, healing \ncan be cruel",
        "It should've been ME, \nNOT HER!!", "That can't be changed.",
        "I hate these nightmares. \nI want them to STOP!", "They will. One day.",
        "Why can't they just \ngo away NOW?", "The universe mends us in whispers,\nnever in an instant.",
        "I hate this place my \nmind drags me to.", "Healing has sharp edges.\nIt cuts on its way in.",
        "IT'S AN ORDEAL!", "You're right but that can't change \nwhat has happened though.",
        "I JUST WANT HER BACK!", "She is watching over us.", "What does that even mean?",
        "Bodies vanish. But love \nrefuses to die.",
        "Really?", "Yes!", "Do the nightmares really stop?",
        "Every storm in your life fades.", "And the pain gets easier?",
        "It becomes love.", "Yeah?", "She becomes a place you visit, \nnot a wound you fall into.",
        "…That sounds beautiful.", "You'll heal, and \nwe'll be all right.", ":)", ":) <3",
    ];
}

function setup() {
    createCanvas(800, 600);
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    game = new Game();
    replayButton = createButton('Replay Conversation');
    replayButton.position(width / 2 - 100, height / 2 + 70);
    replayButton.size(200, 40);
    replayButton.style('background-color', '#FCB5C8');
    replayButton.style('color', '#000000');
    replayButton.style('border', 'none');
    replayButton.style('border-radius', '10px');
    replayButton.style('font-size', '18px');
    replayButton.mousePressed(() => window.location.reload());
    replayButton.hide();
}

class Particle {
    constructor() {
        this.x = random(width); this.y = random(height);
        this.vx = random(-0.5, 0.5); this.vy = random(-0.5, 0.5);
        this.size = random(2, 6); this.life = random(100, 300);
        this.maxLife = this.life; this.hue = random(200, 280);
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0) this.x = width; if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height; if (this.y > height) this.y = 0;
        if (random() < 0.01) { this.vx = random(-0.5, 0.5); this.vy = random(-0.5, 0.5); }
        this.life--;
        if (this.life <= 0) { this.life = this.maxLife; this.x = random(width); this.y = random(height); }
    }
    display() {
        const alpha = map(this.life, 0, this.maxLife, 0, 60);
        push(); noStroke(); fill(this.hue, 80, 100, alpha); ellipse(this.x, this.y, this.size);
        fill(this.hue, 80, 100, alpha * 0.3); ellipse(this.x, this.y, this.size * 2); pop();
    }
}

class Paddle {
    constructor(ball) {
        this.ball = ball; this.w = 20; this.h = 100; this.x = 20;
        this.y = (height - this.h) / 2; this.glowTimer = 0; this.maxGlowTime = 30;
    }
    reset() { this.y = (height - this.h) / 2; this.glowTimer = 0; }
    triggerGlow() { this.glowTimer = this.maxGlowTime; }
    getGlowAlpha() { return map(this.glowTimer, 0, this.maxGlowTime, 0, 255); }
    display() {
        push();
        const imgWidth = 80; const imgHeight = 200;
        const drawX = this.x - (imgWidth - this.w) / 2;
        const drawY = this.y - (imgHeight - this.h) / 2;
        if (this.getGlowAlpha() > 0) {
            drawingContext.shadowBlur = 25; drawingContext.shadowColor = 'rgba(255, 255, 255, 0.6)';
            image(this.image, drawX, drawY, imgWidth + 10, imgHeight + 10);
        }
        drawingContext.shadowBlur = 0;
        if (this.image && this.image.width > 0) {
            image(this.image, drawX, drawY, imgWidth, imgHeight);
        } else {
            noStroke();
            const isLeft = this instanceof LeftPaddle;
            fill(isLeft ? color(100, 150, 255) : color(46, 204, 113));
            rect(drawX, drawY, imgWidth, imgHeight, 10);
        }
        pop();
    }
    update() {
        if (keyIsDown(this.upKey) && this.y > 0) this.y -= 10;
        else if (keyIsDown(this.downKey) && this.y < height - this.h) this.y += 10;
        if (this.glowTimer > 0) this.glowTimer--;
        this.checkHit();
    }
    checkHit() {
        if (!this.ball.canHit) return;
        if (checkCircleRectCollision(this.ball.x, this.ball.y, this.ball.r, this.x, this.y, this.w, this.h)) {
            this.triggerGlow(); this.ball.canHit = false;
            if (this.ball.dx < 0) this.ball.x = this.x + this.w + this.ball.r / 2 + 1;
            else this.ball.x = this.x - this.ball.r / 2 - 1;
            if (dialogueIndex < dialogue.length) this.ball.fadeOutBubble();
            dialogueIndex++;
            
            // Trigger red flash sequence for specific emotional points
            const distressIndices = [10, 22, 24, 26, 32, 34];
            if (distressIndices.includes(dialogueIndex)) { 
                game.triggerFlashSequence(); 
            }
            
            if (horrorIndices.includes(dialogueIndex)) game.triggerHorrorFlash();
            this.ball.launchBall(this.ball.dx * -1);
        }
    }
}

class LeftPaddle extends Paddle { constructor(ball) { super(ball); this.x = 20; this.upKey = 87; this.downKey = 83; this.image = leftPaddleImage; } }
class RightPaddle extends Paddle { constructor(ball) { super(ball); this.x = width - this.w - 20; this.upKey = UP_ARROW; this.downKey = DOWN_ARROW; this.image = rightPaddleImage; } }

class Ball {
    constructor() {
        this.x = width/2; this.y = height/2; this.r = 30; this.dx = 1; this.dy = 1;
        this.speed = 4; this.friction = 0.01; this.canHit = true; this.inMotion = false;
        this.alpha = 255; this.fadeIn = false; this.trail = []; 
        this.maxTrailLength = 1; 
    }
    reset() { this.inMotion = false; this.x = width/2; this.y = height/2; this.canHit = true; this.alpha = 255; this.trail = []; }
    updateTrail() { 
        if (this.alpha > 0) { 
            this.trail.push({x: this.x, y: this.y, alpha: this.alpha}); 
            if (this.trail.length > this.maxTrailLength) this.trail.shift(); 
        } 
    }
    
    display() {
        if (dialogueIndex >= dialogue.length || this.alpha < 1) return;
        const currentLine = dialogue[dialogueIndex];
        const isLeftSpeaker = dialogueIndex % 2 === 0;
        
        // --- NEW: FORCED SHAKING LOGIC ---
        // Indices: 10 (Brutal), 22 (Hate), 24 (Me not her), 26 (Stop), 32 (Ordeal), 34 (Want back)
        const distressIndices = [10, 22, 24, 26, 32, 34];
        let sX = 0;
        let sY = 0;
        if (distressIndices.includes(dialogueIndex)) {
            sX = random(-12, 12);
            sY = random(-12, 12);
        }

        this.updateTrail();
        for (let i = 0; i < this.trail.length; i++) {
            const tAlpha = this.alpha * 0.05;
            const tp = this.trail[i];
            push(); noStroke();
            fill(isLeftSpeaker ? color(100, 150, 255, tAlpha) : color(46, 204, 113, tAlpha));
            let lines = currentLine.split('\n'); let maxW = 0;
            for (let l of lines) maxW = max(maxW, textWidth(l));
            rect(tp.x - (maxW+40)/2 + sX*0.3, tp.y - (40*lines.length)/2 + sY*0.3, (maxW+40)*0.85, (40*lines.length)*0.85, 8);
            pop();
        }

        push(); textAlign(CENTER, CENTER); noStroke();
        fill(isLeftSpeaker ? color(100, 150, 255, this.alpha) : color(46, 204, 113, this.alpha));
        textSize(20); let lines = currentLine.split('\n'); let maxW = 0;
        for (let l of lines) maxW = max(maxW, textWidth(l));
        let tW = maxW + 40; let tH = 40 * lines.length; this.r = max(30, tW/2);
        rect(this.x - tW/2 + sX, this.y - tH/2 + 2 + sY, tW, tH, 10);
        fill(255, this.alpha); text(currentLine, this.x + sX, this.y + 2 + sY); pop();
    }

    update() {
        if (dialogueIndex >= dialogue.length) return;
        if (this.inMotion) {
            if (this.fadeIn) { this.alpha += 30; if (this.alpha >= 255) { this.alpha = 255; this.fadeIn = false; } }
            this.speed -= this.friction; if (this.speed < 0) this.speed = 0;
            this.x += this.dx * this.speed; this.y = this.slope * (this.x - this.x1) + this.y1;
            if (!this.canHit && this.x > width * 0.4 && this.x < width * 0.6) this.canHit = true;
            if (this.y < this.r/2 || this.y > height - this.r/2) {
                if (this.y < this.r/2) this.y = this.r/2; else this.y = height - this.r/2;
                this.y2 = height - this.y2; this.pickSlope();
            }
        } else {
            this.x = width/2; this.y = height/2; this.alpha = 255;
            if (keyIsDown(32)) { this.launchBall(dialogueIndex % 2 === 0 ? 1 : -1); this.inMotion = true; }
        }
    }
    launchBall(dx) { 
        this.dx = dx; this.pickSlope(); this.speed = 4; this.alpha = 0; this.fadeIn = true; 
    }
    pickSlope() {
        this.x1 = this.x; this.y1 = this.y; this.x2 = this.dx > 0 ? width : 0;
        this.y2 = random(height * 0.25, height * 0.75);
        this.slope = (this.y2 - this.y1) / (this.x2 - this.x1 || 1);
    }
    fadeOutBubble() { this.alpha = max(0, this.alpha - 50); }
}

class Game {
    constructor() {
        this.ball = new Ball(); this.leftPaddle = new LeftPaddle(this.ball); this.rightPaddle = new RightPaddle(this.ball);
        this.leftPoints = 0; this.rightPoints = 0; this.flashAlpha = 0; this.isFlashing = false; this.horrorFlashTimer = 0;
    }
    triggerFlashSequence() { if (!this.isFlashing) { this.flashCounter = 6; this.isFlashing = true; this.flashTimer = 0; } }
    triggerHorrorFlash() { this.horrorFlashTimer = 15; }
    display() {
        push(); if (bgImage) image(bgImage, 0, 0, width, height); else background(30);
        for (let p of particles) p.display();
        if (this.horrorFlashTimer > 0) { noStroke(); fill(255, 0, 0, 204); rect(0,0,width,height); }
        if (this.flashAlpha > 0) { noStroke(); fill(255, 0, 0, this.flashAlpha); rect(0,0,width,height); }
        
        stroke(255); strokeWeight(6); noFill(); rect(2, 2, width-4, height-4);
        
        // Scoreboard (Black Text)
        textSize(48); noStroke(); fill(0); 
        text(this.leftPoints, width*0.4, height*0.9); text(this.rightPoints, width*0.6, height*0.9);

        if (!this.ball.inMotion && dialogueIndex < dialogue.length) {
            noStroke(); fill(50, 50, 50, 200); rect(width/2-200, height/2+70, 400, 70, 10);
            fill(255); textAlign(CENTER); textSize(18); text("Press SPACE to send love!", width/2, height/2+90);
            text("20 yr old (W/S) vs 30 yr old (Up/Down)", width/2, height/2 + 120);
        } else if (dialogueIndex >= dialogue.length) {
            noStroke(); 
            fill(252, 165, 188); rect(width/2-250, height/2-50, 500, 100, 15);
            fill(0); textSize(22); textAlign(CENTER); text("Love has been sent to younger Arzoo!", width/2, height/2+5);
        }
        this.leftPaddle.display(); this.rightPaddle.display(); this.ball.display(); pop();
    }
    update() {
        this.leftPaddle.update(); this.rightPaddle.update(); for (let p of particles) p.update();
        if (this.horrorFlashTimer > 0) this.horrorFlashTimer--;
        if (this.isFlashing) {
            this.flashTimer++;
            if (this.flashCounter % 2 === 0) {
                this.flashAlpha = 204; if (this.flashTimer > 15) { this.flashCounter--; this.flashTimer = 0; }
            } else {
                this.flashAlpha = 0; if (this.flashTimer > 25) { this.flashCounter--; this.flashTimer = 0; }
            }
            if (this.flashCounter <= 0) this.isFlashing = false;
        }
        if (dialogueIndex < dialogue.length) this.ball.update();
        if (this.ball.x < 0) { this.rightPoints++; this.reset(); }
        else if (this.ball.x > width) { this.leftPoints++; this.reset(); }
    }
    reset() { this.leftPaddle.reset(); this.rightPaddle.reset(); this.ball.reset(); this.isFlashing = false; this.horrorFlashTimer = 0; }
}

function checkCircleRectCollision(cx, cy, r, rx, ry, rw, rh) {
    let closestX = constrain(cx, rx, rx + rw); let closestY = constrain(cy, ry, ry + rh);
    return dist(cx, cy, closestX, closestY) <= r;
}

function draw() { if (game) { game.update(); game.display(); updateButtonState(); } }
function updateButtonState() { if (dialogueIndex >= dialogue.length) replayButton.show(); else replayButton.hide(); }