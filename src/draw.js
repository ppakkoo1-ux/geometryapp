// draw.js
let ctx = null;
let canvas = null;

export function initBoard() {
  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  // 캔버스를 창 크기에 맞춤
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // 테스트용 기본 도형
  drawCircle(300, 200, 100, "blue");
  drawPoint(300, 100, "red");
  drawLine(250, 200, 350, 200, "green");
}

// 캔버스 크기 자동 조절
function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}

// 원
export function drawCircle(x, y, radius, color="black") {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 점
export function drawPoint(x, y, color="black") {
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// 선
export function drawLine(x1, y1, x2, y2, color="black") {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}
