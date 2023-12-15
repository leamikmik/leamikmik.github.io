function exit(){
    window.location.href = "https://google.com";
}

document.addEventListener("DOMContentLoaded", function () {
const canvas = document.getElementById("tetrisCanvas");
const nextBlockCanvas = document.getElementById("nextBlockCanvas");
const btn = document.getElementById("play");
const levelDiv = document.getElementById("level");
const levelBar = document.getElementById("levelBar");
const levelText = document.getElementById("levelText");
const music = document.getElementById("music");
const musicVolumeDiv = document.getElementById("volumeControl");
const musicVolume = document.getElementById("volumeSlider");
const gameOverScreen = document.getElementById("gameOver");
const endScore = document.getElementById("endScore");
const endHighScore = document.getElementById("endHighScore");

document.getElementById("restart").addEventListener("click", play);
btn.addEventListener("click", play);
musicVolume.onchange = function(){
    music.volume = musicVolume.value/100;
    localStorage.setItem("musicVolume", musicVolume.value);
}
musicVolume.value =  localStorage.getItem("musicVolume") || 50;
music.loop = true;
music.volume = localStorage.getItem("musicVolume")==null ? 0.5 : localStorage.getItem("musicVolume");

const ctx = canvas.getContext("2d");
const nextBlockCtx = nextBlockCanvas.getContext("2d");
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
let level = 2;
let board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]
let currentPiece;
let currentPieceColor;
let nextPiece;
let nextPieceColor;
let lastMoveFail = 0;
let score = 0;
let highScore = localStorage.getItem("tetrisHighScore") || 0;
let updates;

function play(){
    gameOverScreen.style.display = "none";
    btn.style.display = "none";
    canvas.style.display = "";
    nextBlockCanvas.style.display = "";
    levelDiv.style.display = "";
    musicVolumeDiv.style.display = "";
    music.play();
    startGame();
    drawNextBlock();
}

function saveHighScore() {
	localStorage.setItem("tetrisHighScore", highScore);
}

function drawSquare(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
	ctx.strokeStyle = "#15191d";
	ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function getUpdateSpeed(level){
    return Math.pow(0.8-((level-1)*0.007), level-1)*1000;
}

function drawNextBlock() {
	nextBlockCtx.clearRect(0, 0, nextBlockCanvas.width, nextBlockCanvas.height);
    nextBlockCtx.fillStyle = "#212529";
    nextBlockCtx.fillRect(0, 0, nextBlockCanvas.width, nextBlockCanvas.height);
	const centerX = (Math.max(...nextPiece.map((block) => block[0])) + Math.min(...nextPiece.map((block) => block[0]))) / 2;
	const centerY = (Math.max(...nextPiece.map((block) => block[1])) + Math.min(...nextPiece.map((block) => block[1]))) / 2;
	const offsetX = Math.floor((nextBlockCanvas.width - 5 * 25) / 2);
	const offsetY = Math.floor((nextBlockCanvas.height - 5 * 25) / 2);
	nextPiece.forEach((block) => {
		nextBlockCtx.fillStyle = nextPieceColor;
		const x = (block[0] - centerX + 2) * 25 + offsetX; 
		const y = (block[1] - centerY + 2) * 25 + offsetY;
		nextBlockCtx.fillRect(x, y, 25, 25);
        nextBlockCtx.strokeStyle = "#000";
        nextBlockCtx.strokeRect(x, y, 25, 25);
	});
    nextBlockCtx.fillStyle = "#fff";
    nextBlockCtx.font = "20px Arial";
    nextBlockCtx.fillText("Next:", 10, 20);
}	

function spawnNewPiece() {
    currentPiece = nextPiece;
    currentPieceColor = nextPieceColor;
    nextPiece = generatePiece();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#212529";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] !== 0) {
            drawSquare(col, row, board[row][col]);
        }else{
            ctx.strokeStyle="#6f6f6f"
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, 30, 30);
        }
      }
    }
    if (currentPiece) {
        for(let y = ROWS; y > 0; y--) lastMoveFail = !canMove(0, y)? y: lastMoveFail;
        currentPiece.forEach((block) => {
            ctx.strokeStyle=currentPieceColor;
            ctx.strokeRect(block[0] * BLOCK_SIZE + 5, (block[1] + lastMoveFail-1) * BLOCK_SIZE + 5, 20, 20);
            drawSquare(block[0], block[1], currentPieceColor);
            });
        }

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

function update() {
    moveDown(1);
    checkForLines();
    checkForGameOver();
    if (score > highScore) {
      highScore = score;
      saveHighScore();
    }
    draw();
}

function checkForGameOver() {
    if (currentPiece.some((block) => block[1] >= ROWS || board[block[1]][block[0]] !== 0)) {
        clearInterval(updates);
        gameOverScreen.style.display = "";
        endScore.innerText = "Score: "+score;
        endHighScore.innerText = "Highscore: "+highScore;
  }
}

function checkForLines() {
    let linesToClear = []
    for (let row = 0; row < ROWS; row++) 
        if (board[row].every((block) => block !== 0)) linesToClear.push(row);

    linesToClear.forEach((row)=>{
        board.splice(row, 1);
        board.unshift(Array(COLS).fill(0));
    });
    switch(linesToClear.length){
        case 1: score+=1; break;
        case 2: score+=3; break;
        case 3: score+=5; break;
        case 4: score+=8; break;
        default: score+=linesToClear.length; break;
    }
    if((level-1)*5<=score){
        level=Math.floor(score/5)+2;
        clearInterval(updates);
        updates = setInterval(update, getUpdateSpeed(level));
        levelText.innerText = "Level: "+(level-1);
    }
    levelBar.value = score%5;
}

function moveDown(y) {
    if (canMove(0, y)) {
        currentPiece.forEach((block) => (block[1] += y));
    } else {
        currentPiece.forEach((block) => {
            board[block[1]][block[0]] = currentPieceColor;
        });
        spawnNewPiece();
        drawNextBlock();
    }
}

function canMove(dx, dy) {
    return currentPiece.every(
        (block) =>
            block[0] + dx >= 0 &&
            block[0] + dx < COLS &&
            block[1] + dy < ROWS &&
            (board[block[1] + dy] === undefined || board[block[1] + dy][block[0] + dx] === 0)
  );
}

function rotate() {
    const rotatedPiece = JSON.parse(JSON.stringify(currentPiece));
    for (let i = 0; i < rotatedPiece.length; i++) {
        const x = rotatedPiece[i][0];
        const y = rotatedPiece[i][1];
        rotatedPiece[i][0] = currentPiece[0][0] + (y - currentPiece[0][1]);
        rotatedPiece[i][1] = currentPiece[0][1] - (x - currentPiece[0][0]);
    }
    if (isValidMove(rotatedPiece)) {
        currentPiece = rotatedPiece;
    }
}

function isValidMove(piece) {
    return piece.every(block =>
        block[0] >= 0 &&
        block[0] < COLS &&
        block[1] >= 0 &&
        block[1] < ROWS &&
        (board[block[1]] === undefined || board[block[1]][block[0]] === 0)
    );
}
function handleKeyPress(event) {
    switch (event.key) {
        case "ArrowLeft":
            if (canMove(-1, 0)) currentPiece.forEach((block) => (block[0] -= 1));
        break;

        case "ArrowRight":
            if (canMove(1, 0)) currentPiece.forEach((block) => (block[0] += 1));
        break;

        case "ArrowDown":
            moveDown(1);
        break;

        case "ArrowUp":
            rotate();
        break;

        case "Control":
            moveDown(lastMoveFail-1);
            moveDown(1);
        break;
    }
    draw();
}

function generatePiece() {
    const colors = [
        "cyan",
        "blue",
        "orange",
        "yellow",
        "green",
        "purple",
        "red"
    ]
    const pieces = [
        [[0, 0], [1, 0], [2, 0], [3, 0]], // I
        [[0, 0], [0, 1], [0, 2], [1, 2]], // J
        [[0, 0], [1, 0], [2, 0], [2, 1]], // L
        [[0, 0], [0, 1], [1, 0], [1, 1]], // O
        [[1, 0], [2, 0], [0, 1], [1, 1]], // S
        [[0, 1], [1, 0], [1, 1], [2, 1]], // T
        [[0, 0], [1, 0], [1, 1], [2, 1]]  // Z
    ];
    const randomIndex = Math.floor(Math.random() * pieces.length);
    const selectedPiece = pieces[randomIndex];  
    const initialX = Math.floor((COLS - 4) / 2);
    const initialY = 0;
    nextPieceColor = colors[randomIndex];
    return selectedPiece.map(block => [block[0] + initialX, block[1] + initialY]);
}

function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPiece = generatePiece();
    currentPieceColor = nextPieceColor;
    nextPiece = generatePiece();
    score = 0;
    level = 0;
    updates = setInterval(update, getUpdateSpeed(2));
    document.addEventListener("keydown", handleKeyPress);
    levelText.value = "Level: 1";
}
});