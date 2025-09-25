import { setupChord } from './chord.js';

export const svg = document.getElementById("board");
const btn = document.getElementById("drawCircleBtn");

let circle = null;
let centerHandle = null;
let dragging = false;
let dragMode = null;
let offsetX = 0, offsetY = 0;
let pointIndex = 0;
let draggingPoint = null;
let didDrag = false;

const LABEL_RADIUS = 15;

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

// === 마우스 이벤트 ===
svg.addEventListener("mousedown", (e) => {
  if (!circle) return;

  if (e.target.tagName === "circle" && e.target.dataset.label) {
    e.preventDefault();
    draggingPoint = e.target;
    draggingPoint.style.cursor = "move";
    return;
  }

  const cx = parseFloat(circle.getAttribute("cx"));
  const cy = parseFloat(circle.getAttribute("cy"));
  const r  = parseFloat(circle.getAttribute("r"));
  const dx = e.offsetX - cx;
  const dy = e.offsetY - cy;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (e.target === centerHandle && e.shiftKey) {
    dragMode = "move";
    dragging = true;
    offsetX = dx;
    offsetY = dy;
  } else if (Math.abs(dist - r) <= 5) {
    dragMode = "resize";
    dragging = true;
  }
});

svg.addEventListener("mousemove", (e) => {
  if (!circle) return;
  if (dragging) didDrag = true;

  const cx = parseFloat(circle.getAttribute("cx"));
  const cy = parseFloat(circle.getAttribute("cy"));
  const r  = parseFloat(circle.getAttribute("r"));
  const dx = e.offsetX - cx;
  const dy = e.offsetY - cy;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (Math.abs(dist - r) <= 5) {
    circle.setAttribute("stroke", "orange");
    circle.setAttribute("stroke-width", "3");
  } else {
    circle.setAttribute("stroke", "blue");
    circle.setAttribute("stroke-width", "2");
  }

  if (draggingPoint && draggingPoint.dataset.type === "circle") {
    const angle = Math.atan2(dy, dx);
    draggingPoint.dataset.angle = angle;
    updatePoints();
    return;
  }

  if (dragging) {
    if (dragMode === "move") {
      const newCx = e.offsetX - offsetX;
      const newCy = e.offsetY - offsetY;
      circle.setAttribute("cx", newCx);
      circle.setAttribute("cy", newCy);
      centerHandle.setAttribute("cx", newCx);
      centerHandle.setAttribute("cy", newCy);
      updatePoints();
    } else if (dragMode === "resize") {
      circle.setAttribute("r", dist);
      updatePoints();
    }
  }
});

svg.addEventListener("mouseup", () => {
  if (draggingPoint) draggingPoint.style.cursor = "pointer";
  dragging = false;
  dragMode = null;
  draggingPoint = null;
});

// === 점 생성 ===
svg.addEventListener("click", (e) => {
  if (didDrag) { didDrag = false; return; }
  if (!circle || e.target === centerHandle || e.target.tagName === "text") return;

  const cx = parseFloat(circle.getAttribute("cx"));
  const cy = parseFloat(circle.getAttribute("cy"));
  const r  = parseFloat(circle.getAttribute("r"));

  const dx = e.offsetX - cx;
  const dy = e.offsetY - cy;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (Math.abs(dist - r) <= 5) {
    const angle = Math.atan2(dy, dx);
    const labelChar = String.fromCharCode(65 + pointIndex);
    pointIndex++;

    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);

    const pt = document.createElementNS("http://www.w3.org/2000/svg","circle");
    pt.setAttribute("cx", px);
    pt.setAttribute("cy", py);
    pt.setAttribute("r", 4);
    pt.setAttribute("fill", "black");
    pt.dataset.label = labelChar;
    pt.dataset.type = "circle";
    pt.dataset.angle = angle;
    svg.appendChild(pt);

    const text = document.createElementNS("http://www.w3.org/2000/svg","text");
    const lx = px + LABEL_RADIUS * Math.cos(angle);
    const ly = py + LABEL_RADIUS * Math.sin(angle);
    text.setAttribute("x", lx);
    text.setAttribute("y", ly);
    text.setAttribute("font-size", "14");
    text.textContent = labelChar;

    pt.labelElement = text;
    text.pointRef = pt;
    svg.appendChild(text);
  }
});

// === 현 기능 불러오기 ===
setupChord(svg, updatePoints);
