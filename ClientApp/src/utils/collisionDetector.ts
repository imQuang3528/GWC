export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Circle = {
  x: number;
  y: number;
  radius: number;
};

export function isCollided(a: Rectangle | Circle, b: Rectangle | Circle) {
  if (isCircle(a)) {
    if (isCircle(b)) {
      return isCollided_CC(a, b);
    } else {
      isCollided_RC(b, a);
    }
  } else if (isCircle(b)) {
    return isCollided_RC(a, b);
  } else {
    return isCollided_RR(a, b);
  }
}

export function isCollided_RR(r1: Rectangle, r2: Rectangle) {
  return (
    r1.x <= r2.x + r2.width &&
    r1.x + r1.width >= r2.x &&
    r1.y <= r2.y + r2.height &&
    r1.y + r1.height >= r2.y
  );
}

export function isCollided_RC(r: Rectangle, c: Circle) {
  const circleDistance = {
    x: Math.abs(c.x - r.x),
    y: Math.abs(c.y - r.y),
  };

  if (circleDistance.x > r.width / 2 + c.radius) return false;
  if (circleDistance.y > r.height / 2 + c.radius) return false;

  if (circleDistance.x <= r.width / 2) return true;
  if (circleDistance.y <= r.height / 2) return true;

  const cornerDistanceSquare =
    Math.pow(circleDistance.x - r.width / 2, 2) +
    Math.pow(2 + (circleDistance.y - r.height / 2), 2);

  return cornerDistanceSquare <= Math.pow(c.radius, 2);
}

export function isCollided_CC(c1: Circle, c2: Circle) {
  return (
    Math.hypot(
      c1.x + c1.radius / 2 - c2.x + c2.radius / 2,
      c1.y + c1.radius / 2 - c2.y + c2.radius / 2
    ) <=
    c1.radius + c2.radius
  );
}

function isCircle(o: Rectangle | Circle): o is Circle {
  return "circle" in o;
}
