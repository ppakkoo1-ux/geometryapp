import { setupChord } from './chord.js';

export const svg = document.getElementById("board");
const btn = document.getElementById("drawCircleBtn");

let circle = null;
let centerHandle = null;
let dragging = false;
let dragMode = null;
let offsetX = 0, offsetY = 0;
let pointIndex = 0;
let contextMenu = null;
let targetPoint = null;
let draggingPoint = null;
let didDrag = false;

const LABEL_RADIUS = 15;

// === 보드 크기 조정 ===
function resizeBoard() {
  svg.setAttribute("width", window.innerWidth - 150);
  svg.setAttribute("height", window.innerHeight);
}
window.addEventListener("resize", resizeBoard);
resizeBoard();

// === 원 그리기 ===
function drawCircle() {
  const w = svg.clientWidth;
  const h = svg.clientHeight;
  const r = Math.min(w, h) * 0.4;
  const cx = w / 2;
  const cy = h / 2;

  if (circle) circle.remove();
  if (centerHandle) centerHandle.remove();

  circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", r);
  circle.setAttribute("stroke","blue");
  circle.setAttribute("stroke-width","2");
  circle.setAttribute("fill","none");
  svg.appendChild(circle);

  centerHandle = document.createElementNS("http://www.w3.org/2000/svg","circle");
  centerHandle.setAttribute("cx", cx);
  centerHandle.setAttribute("cy", cy);
  centerHandle.setAttribute("r", 4);
  centerHandle.setAttribute("fill","black");
  svg.appendChild(centerHandle);

  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", cx + LABEL_RADIUS);
  label.setAttribute("y", cy);
  label.setAttribute("font-size", "14");
  label.textContent = "O";
  label.pointRef = centerHandle;
  svg.appendChild(label);

  pointIndex = 0;
}
btn.addEventListener("click", drawCircle);

// === 점/라벨 업데이트 ===
function updatePoints() {
  if (!circle) return;

  const cx = parseFloat(circle.getAttribute("cx"));
  const cy = parseFloat(circle.getAttribute("cy"));
  const r  = parseFloat(circle.getAttribute("r"));

  svg.querySelectorAll("circle[data-label]").forEach(pt => {
    const angle = parseFloat(pt.dataset.angle);
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);

    pt.setAttribute("cx", px);
    pt.setAttribute("cy", py);

    if (pt.labelElement) {
      const lx = px + LABEL_RADIUS * Math.cos(angle);
      const ly = py + LABEL_RADIUS * Math.sin(angle);
      pt.labelElement.setAttribute("x", lx);
      pt.labelElement.setAttribute("y", ly);
    }

    // 연결된 현도 갱신
    if (pt.chords) {
      pt.chords.forEach(ch => {
        ch.line.setAttribute("x1", pt.getAttribute("cx"));
        ch.line.setAttribute("y1", pt.getAttribute("cy"));
        ch.line.setAttribute("x2", ch.other.getAttribute("cx"));
        ch.line.setAttribute("y2", ch.other.getAttribute("cy"));
      });
    }
  });
}

// ... (mousedown, mousemove, mouseup, click → 동일, 그대로 두기)

// === 현 기능 불러오기 ===
// 이제 updatePoints를 같이 넘겨줌
setupChord(svg, updatePoints);
