document.addEventListener("DOMContentLoaded", function () {
const canvas = document.getElementById("tetrisCanvas");
const nextBlockCanvas = document.getElementById("nextBlockCanvas");
const btn = document.getElementById("play");

canvas.style.display = "none";
nextBlockCanvas.style.display = "none";
btn.addEventListener("click", play);

function play(){
const ctx = canvas.getContext("2d");
const nextBlockCtx = nextBlockCanvas.getContext("2d");
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const GAME_SPEED = 500; // ms
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
let music = document.getElementById("music");
btn.style.display = "none";
canvas.style.display = "";
nextBlockCanvas.style.display = "";
music.loop = true;
music.volume = 0.5;
music.play();

function saveHighScore() {
	localStorage.setItem("tetrisHighScore", highScore);
}

function drawSquare(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
	ctx.strokeStyle = "#15191d";
	ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawNextBlock() {
	// Clear the next block canvas
	nextBlockCtx.clearRect(0, 0, nextBlockCanvas.width, nextBlockCanvas.height);
    // Barva ozadja
    nextBlockCtx.fillStyle = "#212529";
    nextBlockCtx.fillRect(0, 0, nextBlockCanvas.width, nextBlockCanvas.height);
	// Find the center of the next piece
	const centerX = (Math.max(...nextPiece.map((block) => block[0])) + Math.min(...nextPiece.map((block) => block[0]))) / 2;
	const centerY = (Math.max(...nextPiece.map((block) => block[1])) + Math.min(...nextPiece.map((block) => block[1]))) / 2;
	// Calculate the offset to center the piece in the canvas
	const offsetX = Math.floor((nextBlockCanvas.width - 5 * 25) / 2); // Assuming max width of a piece is 5
	const offsetY = Math.floor((nextBlockCanvas.height - 5 * 25) / 2); // Assuming max height of a piece is 5
	// Draw the next block preview
	nextPiece.forEach((block) => {
		nextBlockCtx.fillStyle = nextPieceColor;
		const x = (block[0] - centerX + 2) * 25 + offsetX; // Adjust the +2 based on the piece size and center
		const y = (block[1] - centerY + 2) * 25 + offsetY; // Adjust the +2 based on the piece size and center
		nextBlockCtx.fillRect(x, y, 25, 25);
        nextBlockCtx.strokeStyle = "#000";
        nextBlockCtx.strokeRect(x, y, 25, 25);
	});
    nextBlockCtx.fillStyle = "#fff";
    nextBlockCtx.font = "20px Arial";
    nextBlockCtx.fillText("Next:", 10, 20);
}	

function spawnNewPiece() {
    // Use the same piece generated for the preview
    currentPiece = nextPiece;
    currentPieceColor = nextPieceColor;
    // Generate a new piece for the next preview
    nextPiece = generatePiece();
}

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Barva ozadja
    ctx.fillStyle = "#212529";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw the board
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
    // Draw the current piece
    if (currentPiece) {
        for(let y = ROWS; y > 0; y--) lastMoveFail = !canMove(0, y)? y: lastMoveFail;
        currentPiece.forEach((block) => {
            ctx.strokeStyle=currentPieceColor;
            ctx.strokeRect(block[0] * BLOCK_SIZE + 5, (block[1] + lastMoveFail-1) * BLOCK_SIZE + 5, 20, 20);
            drawSquare(block[0], block[1], currentPieceColor);
            });
        }

    // Draw score and high score
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("High Score: " + highScore, 10, 60);
}

function update() {
    // Code to update the game state (e.g., move the current piece, check for collisions, clear lines, etc.)
    moveDown(1);
    checkForLines();
    checkForGameOver();
    // Code to update the score and high score
    if (score > highScore) {
      highScore = score;
      saveHighScore();
    }
    draw();
}

function gameOver() {
    alert("Game Over!");
    startGame();
}

function checkForGameOver() {
    // Check if any part of the current piece is outside the game boundaries or collides with existing blocks
    if (currentPiece.some((block) => block[1] >= ROWS || board[block[1]][block[0]] !== 0)) {
        gameOver();
  }
}

function checkForLines() {
    // Check and clear completed lines
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every((block) => block !== 0)) {
        // Clear the line
        board.splice(row, 1);
        board.unshift(Array(COLS).fill(0));
        // Increase the score
        score += 10;
    }
  }
}

function moveDown(y) {
  // Move the current piece down one row
    if (canMove(0, y)) {
        currentPiece.forEach((block) => (block[1] += y));
    } else {
        // Lock the piece in place and generate a new piece
        currentPiece.forEach((block) => {
            board[block[1]][block[0]] = currentPieceColor;
        });
        spawnNewPiece();
        drawNextBlock();
    }
}

function canMove(dx, dy) {
    // Check if the current piece can be moved by (dx, dy) units
    return currentPiece.every(
        (block) =>
            block[0] + dx >= 0 &&
            block[0] + dx < COLS &&
            block[1] + dy < ROWS &&
            (board[block[1] + dy] === undefined || board[block[1] + dy][block[0] + dx] === 0)
  );
}

function rotate() {
    // Clone the current piece
    const rotatedPiece = JSON.parse(JSON.stringify(currentPiece));
    // Rotate the cloned piece
    for (let i = 0; i < rotatedPiece.length; i++) {
        const x = rotatedPiece[i][0];
        const y = rotatedPiece[i][1];
        // Perform a 90-degree rotation around the piece's center
        rotatedPiece[i][0] = currentPiece[0][0] + (y - currentPiece[0][1]);
        rotatedPiece[i][1] = currentPiece[0][1] - (x - currentPiece[0][0]);
    }
    // Check if the rotated piece is valid, then apply the rotation
    if (isValidMove(rotatedPiece)) {
        currentPiece = rotatedPiece;
    }
}

function isValidMove(piece) {
    // Check if the rotated piece is within the game boundaries and does not collide with existing blocks
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
            // Code to rotate the current piece
            rotate();
        break;

        case "Control":
            moveDown(lastMoveFail-1);
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
    // Randomly select a piece
    const randomIndex = Math.floor(Math.random() * pieces.length);
    const selectedPiece = pieces[randomIndex];  
    // Initial position for the piece
    const initialX = Math.floor((COLS - 4) / 2); // Center the piece horizontally
    const initialY = 0; // Start at the top 
    // Adjust the piece blocks based on the initial position
    nextPieceColor = colors[randomIndex];
    return selectedPiece.map(block => [block[0] + initialX, block[1] + initialY]);
}
function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPiece = generatePiece();
    currentPieceColor = nextPieceColor;
    nextPiece = generatePiece();
    score = 0;
    // Set up game loop using setInterval
    setInterval(update, GAME_SPEED);
    // Set up keyboard event listener
    document.addEventListener("keydown", handleKeyPress);
}

startGame();
drawNextBlock();

}});