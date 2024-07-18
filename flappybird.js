let board;
let boardWidth = 1400;
let boardHeight = 640;
let context;

// Bird
let birdWidth = 54; 
let birdHeight = 44;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;
let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Pipes
let pipeArray = [];
let pipeWidth = 64; 
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;

// Coins
let coinArray = [];
let coinWidth = 32;
let coinHeight = 32;
let coinImages = [];

// Physics
let velocityX = -5; // Initial speed
let velocityY = 0;
let gravity = 0.4;

// Game state
let gameOver = false;
let score = 0;
let firstPipePlaced = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load bird image
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    // Load pipe images
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Load coin images
    for (let i = 1; i <= 3; i++) {
        let img = new Image();
        img.src = `./coin${i}.png`;
        coinImages.push(img);
    }

    // Start game update loop
    requestAnimationFrame(update);

    // Set intervals for placing pipes and coins
    
    setInterval(placeCoins, 2000);
    setInterval(placePipes, 1500);

    // Event listener for bird movement
    document.addEventListener("keydown", moveBird);
};

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Update bird position
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Check if bird hits ground
    if (bird.y > board.height) {
        gameOver = true;
    }

    // Update and draw pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Check if bird hits pipes
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Update and draw coins
    for (let i = 0; i < coinArray.length; i++) {
        let coin = coinArray[i];
        coin.x += velocityX;
        context.drawImage(coin.img, coin.x, coin.y, coin.width, coin.height);

        // Check if bird collects coin
        if (detectCollision(bird, coin)) {
            score += coin.reward;
            adjustSpeed(coin.speedAdjustment); // Adjust speed based on coin type
            coinArray.splice(i, 1);
            i--;
        }
    }

    // Clear off-screen pipes and coins
    clearOffscreenObjects(pipeArray, pipeWidth);
    clearOffscreenObjects(coinArray, coinWidth);

    // Draw score and game over message
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 600);

    if (gameOver) {
        context.fillStyle = "white";
        context.font = "60px sans-serif";
        let gameOverText = "GAME OVER";
        let textWidth = context.measureText(gameOverText).width;
        let textX = (board.width - textWidth) / 2;
        let textY = board.height / 2;
        context.fillText(gameOverText, textX, textY);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);

    // Set the flag when the first pipe is placed
    if (!firstPipePlaced) {
        firstPipePlaced = true;
    }
}

function placeCoins() {
    if (gameOver || !firstPipePlaced) {
        return;
    }

    // Define the middle part of the screen as the middle third
    let middleStartY = boardHeight / 3;
    let middleEndY = boardHeight * 2 / 3;

    // Define a minimum distance from pipes
    let minDistanceFromPipes = 100;

    let randomCoinY;
    let validPosition = false;

    // Try placing the coin, up to 10 times to find a valid position
    for (let attempts = 0; attempts < 10 && !validPosition; attempts++) {
        randomCoinY = middleStartY + Math.random() * (middleEndY - middleStartY - coinHeight);
        validPosition = true;

        // Check if the generated position is far enough from all pipes
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            if (Math.abs(pipe.x - boardWidth) < minDistanceFromPipes && Math.abs(pipe.y - randomCoinY) < minDistanceFromPipes) {
                validPosition = false;
                break;
            }
        }
    }

    // Only place the coin if a valid position was found
    if (validPosition) {
        // Select a random coin image from the array
        let coinImg = coinImages[Math.floor(Math.random() * coinImages.length)];
        let reward=0;
        // Select reward and speed adjustment based on coin type
        let speedAdjustment = 0;

        if (coinImg.src.includes("coin1.png")) {
            speedAdjustment = -6; 
            reward=20// Increase speed for red coin
        } else if (coinImg.src.includes("coin2.png")) {
            speedAdjustment = -10;
            reward=50 // Decrease speed for green coin
        } else if (coinImg.src.includes("coin3.png")) {
            speedAdjustment =  -3;
            reward=10 // Slightly decrease speed for yellow coin
        }

        let coin = {
            img: coinImg,
            x: boardWidth,
            y: randomCoinY,
            width: coinWidth,
            height: coinHeight,
            reward: reward, // Adjust reward as needed
            speedAdjustment: speedAdjustment
        };
        coinArray.push(coin);
    }
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Jump
        velocityY = -6;

        // Reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            coinArray = [];
            score = 0;
            gameOver = false;
            firstPipePlaced = false;
            velocityX = -5; // Reset speed
        }
    }
}

function detectCollision(a, b) {
    // Check collision between two objects a and b
    if (a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y) {
        
        // Adjust speed based on the type of coin
        if (b.speedAdjustment) {
            adjustSpeed(b.speedAdjustment);
        }

        return true;
    }
    return false;
}

function clearOffscreenObjects(array, objectWidth) {
    // Clear objects from array that are off-screen
    while (array.length > 0 && array[0].x < -objectWidth) {
        array.shift();
    }
}

function adjustSpeed(speedAdjustment) {
    // Adjust game speed based on the provided adjustment
    velocityX = speedAdjustment;
}
