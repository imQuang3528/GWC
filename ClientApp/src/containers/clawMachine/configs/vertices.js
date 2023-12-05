export const FINGER_LOWER_VERTICES = [
  { x: 0, y: 83 },
  { x: 1, y: 66 },
  { x: 132, y: 118 },
  { x: 147, y: 101 },
  { x: 164, y: 65 },
  { x: 171, y: 11 },
  { x: 179, y: 2 },
  { x: 198, y: 0 },
  { x: 208, y: 7 },
  { x: 245, y: 53 },
  { x: 293, y: 136 },
  { x: 319, y: 208 },
  { x: 334, y: 285 },
  { x: 334, y: 337 },
  { x: 328, y: 380 },
  { x: 315, y: 427 },
  { x: 276, y: 506 },
  { x: 241, y: 553 },
  { x: 204, y: 592 },
  { x: 170, y: 622 },
  { x: 159, y: 622 },
  { x: 151, y: 613 },
  { x: 150, y: 602 },
  { x: 219, y: 529 },
  { x: 259, y: 466 },
  { x: 276, y: 427 },
  { x: 289, y: 371 },
  { x: 293, y: 289 },
  { x: 15, y: 97 },
];

export function scaleVertices(vertices, scale = 1) {
  return vertices.map(vertex => {
    return { x: vertex.x * scale, y: vertex.y * scale };
  });
}
