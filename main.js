const svg = document.getElementById("board");
const btn = document.getElementById("drawCircleBtn");

let circle = null;
let centerHandle = null;
let dragging = false;
let dragMode = null;
let offsetX = 0, offsetY = 0;
let pointIndex = 0; // A부터 시작
let contextMenu = null;
let targetPoint = null;
let draggingPoint = null;
let didDrag = false; // 🚩 드래그 여부 플래그
let draggingLabel = null; // 🚩 라벨 드래그 상태
const LABEL_RADIUS = 15;       // 라벨 기본 거리 (초기 위치)
const MAX_LABEL_RADIUS = 40;   // 라벨 이동 최대 반지름

// 보드 크기 조정
function resizeBoard() {
  svg.setAttribute("width", window.innerWidth - 150 - 200);
  svg.setAttribute("height", window.innerHeight);
}
window.addEventListener("resize", resizeBoard);
resizeBoard();

// 원 그리기 함수
function drawCircle() {
  const w = svg.clientWidth;
  const h = svg.clientHeight;
  const r = Math.min(w, h) * 0.4;  
  const cx = w / 2;
  const cy = h / 2;

  if (circle) circle.remove();
  if (centerHandle) centerHandle.remove();

  // 원
  circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", r);
  circle.setAttribute("stroke","blue");
  circle.setAttribute("stroke-width","2");
  circle.setAttribute("fill","none");
  svg.appendChild(circle);

  // 중심점
  centerHandle = document.createElementNS("http://www.w3.org/2000/svg","circle");
  centerHandle.setAttribute("cx", cx);
  centerHandle.setAttribute("cy", cy);
  centerHandle.setAttribute("r", 4);
  centerHandle.setAttribute("fill","black");
  svg.appendChild(centerHandle);

  // 중심점 라벨 O
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", cx + LABEL_RADIUS);
  label.setAttribute("y", cy);
  label.setAttribute("font-size", "14");
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("dominant-baseline", "middle");
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
  });
}

// === 마우스 다운 ===
svg.addEventListener("mousedown", (e) => {
  if (!circle) return;

  // 라벨 드래그 시작
  if (e.target.tagName === "text" && e.target.pointRef) {
    draggingLabel = e.target;
    return;
  }

  // 점 드래그
  if (e.target.tagName === "circle" && e.target.dataset.label) {
    e.preventDefault();
    draggingPoint = e.target;
    draggingPoint.style.cursor = "move";
    return;
  }

  // 원 이동/크기조절
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

// === 마우스 무브 ===
svg.addEventListener("mousemove", (e) => {
  if (!circle) return;

  if (dragging) didDrag = true;

  const cx = parseFloat(circle.getAttribute("cx"));
  const cy = parseFloat(circle.getAttribute("cy"));
  const r  = parseFloat(circle.getAttribute("r"));
  const dx = e.offsetX - cx;
  const dy = e.offsetY - cy;
  const dist = Math.sqrt(dx*dx + dy*dy);

  // 하이라이트
  if (Math.abs(dist - r) <= 5) {
    circle.setAttribute("stroke", "orange");
    circle.setAttribute("stroke-width", "3");
  } else {
    circle.setAttribute("stroke", "blue");
    circle.setAttribute("stroke-width", "2");
  }

  // 점 드래그 (원 위 제약)
  if (draggingPoint && draggingPoint.dataset.type === "circle") {
    const angle = Math.atan2(dy, dx);
    draggingPoint.dataset.angle = angle;
    updatePoints();
    return;
  }

  // 라벨 드래그 (점 중심 반경 MAX_LABEL_RADIUS 내부 제한)
  if (draggingLabel) {
    const pt = draggingLabel.pointRef;
    const px = parseFloat(pt.getAttribute("cx"));
    const py = parseFloat(pt.getAttribute("cy"));
    let ddx = e.offsetX - px;
    let ddy = e.offsetY - py;
    let d = Math.sqrt(ddx*ddx + ddy*ddy);

    if (d > MAX_LABEL_RADIUS) {
      ddx *= (MAX_LABEL_RADIUS / d);
      ddy *= (MAX_LABEL_RADIUS / d);
    }

    const lx = px + ddx;
    const ly = py + ddy;
    draggingLabel.setAttribute("x", lx);
    draggingLabel.setAttribute("y", ly);
    return;
  }

  // 원 이동/크기조절
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

// === 마우스 업 ===
svg.addEventListener("mouseup", () => {
  if (draggingPoint) draggingPoint.style.cursor = "pointer";
  dragging = false;
  dragMode = null;
  draggingPoint = null;
  draggingLabel = null;
});

// === 점 생성 ===
svg.addEventListener("click", (e) => {
  if (didDrag) { 
    didDrag = false;
    return;
  }

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
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = labelChar;

    pt.labelElement = text;
    text.pointRef = pt;
    svg.appendChild(text);

    // 우클릭 레이블 변경
    pt.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      targetPoint = pt;
      showContextMenu(ev.pageX, ev.pageY);
    });
  }
});

// === 커스텀 컨텍스트 메뉴 ===
function showContextMenu(x, y) {
  if (contextMenu) contextMenu.remove();

  contextMenu = document.createElement("div");
  contextMenu.style.position = "absolute";
  contextMenu.style.left = x + "px";
  contextMenu.style.top = y + "px";
  contextMenu.style.background = "#fff";
  contextMenu.style.border = "1px solid #aaa";
  contextMenu.style.padding = "5px";
  contextMenu.style.cursor = "pointer";
  contextMenu.innerText = "레이블 변경";

  contextMenu.addEventListener("click", () => {
    if (targetPoint) {
      const newLabel = prompt("새 레이블:", targetPoint.dataset.label);
      if (newLabel) {
        targetPoint.dataset.label = newLabel;
        targetPoint.labelElement.textContent = newLabel;
      }
    }
    contextMenu.remove();
    contextMenu = null;
  });

  document.body.appendChild(contextMenu);
}

// 클릭 시 메뉴 닫기
document.addEventListener("click", () => {
  if (contextMenu) {
    contextMenu.remove();
    contextMenu = null;
  }
});
