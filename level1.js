const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");
const scoreEl = document.getElementById("score");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let score = 0;
let lives=3;

const brickRowCount = 7;
const brickColumnCount = 3;
const scoreList = [];


// sound sections
const backgroundsound =new Audio('main.wav');
backgroundsound.play();
const strikesound = new Audio('strike.wav');
const losesound = new Audio('lost.wav');
// Create ball props
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
  visible: true,
};

// Create paddle props
const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 80,
  h: 35,
  speed: 8,
  dx: 0,
  visible: true,
};

// Create brick props
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

let count=0;
// Create bricks
let bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) 
  {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
    count++;
    console.log("ABishek",count);
  }
}

// console.log(bricks);

// Draw ball on canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = ball.visible ? "red" : "transparent";
  ctx.fill();
  ctx.closePath();
}

// Draw paddle on canvas
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();
}

// Draw score on canvas
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 40);
  
}
// Draw lives on canvas
function drawlives() {
  ctx.font = "20px Arial";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 15);
  
}


// Draw bricks on canvas
function drawBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? "red" : "transparent";
      ctx.fill();
      ctx.closePath();
    });
  });
}

update();

// Keydown event
function keyDown(e) {
  // console.log(e.key);
  if (e.key === "Right" || e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  }
}

// Keyup event
function keyUp(e) {
  if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "Left" ||
    e.key === "ArrowLeft"
  ) {
    paddle.dx = 0;
  }
}

// Keyboard event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Rules and close event handlers
rulesBtn.addEventListener("click", () => rules.classList.add("show"));

closeBtn.addEventListener("click", () => rules.classList.remove("show"));

// Move paddle on canvas
function movePaddle() {
  paddle.x += paddle.dx;

  // Wall detection
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }

  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

// Move ball on canvas
function moveBall() 
{
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision (right/left)
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
  }

  // Wall collision (top/bottom)
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    ball.dy *= -1;
  }

  // console.log(ball.x, ball.y);

  // Paddle collision
  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  )
   {
    ball.dy = -ball.speed;
  }

  //   Brick collision
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x && // left brick side check
          ball.x + ball.size < brick.x + brick.w && // right brick side check
          ball.y + ball.size > brick.y && // top brick side check
          ball.y - ball.size < brick.y + brick.h // bottom brick side check
        ) {
          strikesound.play();
          ball.dy *= -1;
          brick.visible = false;
          count--;
          if(count==0)
            {
              win();
              // console.log("entered");
             }
            
          // console.log("Decreasing",count);

          increaseScore();
          //   console.log(score);
        }
      }
    });
  });
  //   console.log(score);

  //   Hit bottom wall - lose
  if (ball.y + ball.size > canvas.height) {
    
    let s = score;
    showHighscore(s);
    // score = 0;
    lives--;
    if(lives==0){
    // losesound.play();
    lost();
    showAllBricks();
  }
  }
}

 



// Show high score
function showHighscore(s) {
  scoreList.push(s);
  localStorage.setItem("score", scoreList);
  let highScore = Math.max(...scoreList);
  scoreEl.innerHTML = `High Score: ${highScore}`;
  scoreEl.style.width = "135px";
}

// Increase score
function increaseScore() {
  score++;

  if (score % (brickRowCount * brickRowCount) === 0) {
      showAllBricks();
  }
}

// Make all bricks appear
function showAllBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => (brick.visible = true));
  });
}

// Draw everything
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawlives();
  drawScore();
  drawBricks();
}

// Update canvas drawing and animations
function update() {
  movePaddle();
  moveBall();

  // Draw everything
  draw();

  requestAnimationFrame(update);
}
function lost()
{
  losesound.play();
  window.location.href="lost1.html";
}
function win()
{
  window.location.href="win1.html";
}

