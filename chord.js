// chord.js : 현(Chord) 관련 기능
import { updatePoints } from './main.js';

export function setupChord(svg) {
  let chordMode = false;
  let chordSelectedPoints = [];
  let deleteChordMode = false;
  let chords = [];

  // "현 그리기" 버튼
  document.getElementById("drawChordBtn").addEventListener("click", () => {
    chordMode = true;
    chordSelectedPoints = [];
    deleteChordMode = false;
    alert("원 위의 두 점을 선택하세요.");
  });

  // "현 삭제" 버튼
  document.getElementById("deleteChordBtn").addEventListener("click", () => {
    deleteChordMode = true;
    chordMode = false;
    chordSelectedPoints = [];
    alert("삭제할 현을 클릭하세요.");
  });

  // SVG 클릭
  svg.addEventListener("click", (e) => {
    if (deleteChordMode && e.target.tagName === "line") {
      const line = e.target;
      line.remove();
      chords = chords.filter(ch => ch !== line);

      svg.querySelectorAll("circle[data-label]").forEach(pt => {
        if (pt.chords) {
          pt.chords = pt.chords.filter(ch => ch.line !== line);
        }
      });

      deleteChordMode = false;
      return;
    }

    if (chordMode && e.target.tagName === "circle" && e.target.dataset.label) {
      chordSelectedPoints.push(e.target);

      if (chordSelectedPoints.length === 2) {
        createChord(chordSelectedPoints[0], chordSelectedPoints[1]);
        chordSelectedPoints = [];
        chordMode = false;
      }
    }
  });

  function createChord(pt1, pt2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", pt1.getAttribute("cx"));
    line.setAttribute("y1", pt1.getAttribute("cy"));
    line.setAttribute("x2", pt2.getAttribute("cx"));
    line.setAttribute("y2", pt2.getAttribute("cy"));
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "2");

    if (!pt1.chords) pt1.chords = [];
    if (!pt2.chords) pt2.chords = [];
    pt1.chords.push({ other: pt2, line });
    pt2.chords.push({ other: pt1, line });

    chords.push(line);
    svg.insertBefore(line, svg.firstChild);

    updatePoints(); // 연결 상태 갱신
  }
}
