// chord.js : 현(Chord) 생성 함수만 제공
export function createChord(svg, pt1, pt2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg","line");
  line.setAttribute("x1", pt1.getAttribute("cx"));
  line.setAttribute("y1", pt1.getAttribute("cy"));
  line.setAttribute("x2", pt2.getAttribute("cx"));
  line.setAttribute("y2", pt2.getAttribute("cy"));
  line.setAttribute("stroke", "black");
  line.setAttribute("stroke-width", "2");

  // 데이터: 점과 현의 양방향 연결
  if (!pt1.chords) pt1.chords = [];
  if (!pt2.chords) pt2.chords = [];
  pt1.chords.push({ other: pt2, line });
  pt2.chords.push({ other: pt1, line });

  line.points = [pt1, pt2]; // 현도 자신이 연결한 점을 기록

  svg.insertBefore(line, svg.firstChild);
  return line;
}
