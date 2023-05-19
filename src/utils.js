import { Vector } from "./base/Primitives.js";

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) ;
}

function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function pointToCircleDistance(x, y, circle) {
    const pointToCircleCenterDistance = new Vector(x, y, circle.x, circle.y).length;
    return pointToCircleCenterDistance - circle.r;
}

function countClosestTraversal(line, sight) {
    const x1 = sight.x1,
        y1 = sight.y1,
        x2 = sight.x2,
        y2 = sight.y2;
    const x3 = line.x1,
        y3 = line.y1,
        x4 = line.x2,
        y4 = line.y2;

    const r_px = x1,
        r_py = y1,
        r_dx = x2-x1,
        r_dy = y2-y1;

    const s_px = x3,
        s_py = y3,
        s_dx = x4-x3,
        s_dy = y4-y3;

    const r_mag = Math.sqrt(r_dx*r_dx+r_dy*r_dy),
        s_mag = Math.sqrt(s_dx*s_dx+s_dy*s_dy);
    if(r_dx/r_mag==s_dx/s_mag && r_dy/r_mag==s_dy/s_mag){
        return null;
    }

    const T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx),
        T1 = (s_px+s_dx*T2-r_px)/r_dx;

    if(T1<0 || isNaN(T1)) return null;
    if(T2<0 || T2>1) return null;

    return {
        x: r_px+r_dx*T1,
        y: r_py+r_dy*T1,
        p: T1
    };
}

function countClosestTraversal2(line, sight) {
    const x1 = sight.x1,
        y1 = sight.y1,
        x2 = sight.x2,
        y2 = sight.y2;
    const x3 = line.x1,
        y3 = line.y1,
        x4 = line.x2,
        y4 = line.y2;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if(den === 0){
        return;
    }
    let x = ((x1*y2 - y1*x2) * (x3 - x4) - (x1 - x2) * (x3*y4 - y3*x4))/den;
    let y = ((x1*y2 - y1*x2) * (y3 - y4) - (y1 - y2) * (x3*y4 - y3*x4))/den;
    //check if this dot is a traversal
    let a1 = (y2-y1) / (x2-x1),
        b1 = y1 - x1*a1,
        a2 = (y4 - y3) / (x4 - x3),
        b2 = y3 - x3 * a2;
    if ((a1*x + b1) === y && (a2 * x + b2) === y) {
        return {x, y};
    } else {
        return;
    }
}

function angle_2points(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function angle_3points(a, b, c) {
    const x1 = a.x - b.x,
        x2 = c.x - b.x,
        y1 = a.y - b.y,
        y2 = c.y - b.y,
        d1 = Math.sqrt(x1 * x1 + y1 * y1),
        d2 = Math.sqrt(x2 * x2 + y2 * y2);
    //console.log("angle: ", (Math.acos((x1* x2 + y1 * y2) / (d1 * d2))* 180) / Math.PI);
    return Math.acos((x1* x2 + y1 * y2) / (d1 * d2));
}

function dotProductWithAngle(lenA, lenB, angle) {
    return lenA * lenB * Math.cos(angle);
}

function dotProduct(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
}

function isPointOnTheLine(point, line) {
    return (((point.x >= line.x1) && (point.x <= line.x2)) || ((point.x <= line.x1) && (point.x >= line.x2))) && (((point.x >= line.x1) && (point.y <= line.y2)) || ((point.y <= line.y1) && (point.y >= line.y2)));
}

function isLineShorter(line1, line2) {
    return (new Vector(line1.x1, line1.y1, line1.x2, line1.y2)).length < (new Vector(line2.x1, line2.y1, line2.x2, line2.y2)).length;
}

function isPointLineIntersect(point, line) {
    const lineL = new Vector(line.x1, line.y1, line.x2, line.y2).length,
        lengthAB = new Vector(line.x1, line.y1, point.x, point.y).length + new Vector(line.x2, line.y2, point.x, point.y).length;

    if (lengthAB <= lineL + 0.2) {
        //Logger.debug("point to line intersect. line len: " + lineL + ", line AB len: " + lengthAB);
        return true;
    }
    return false;
}

function isPointPolygonIntersect(/*x, y, polygon*/) {
    //const vertices = polygon.vertices;

    return false;
}

function isPointRectIntersect(x, y, rect) {
    if (x >= rect.x && x <= rect.width + rect.x && y >= rect.y && y <= rect.y + rect.height) {
        return true;
    } else {
        return false;
    }
}

function isPointCircleIntersect(x, y, circle) {
    const radius = circle.width,
        lineToCircleCenter = new Vector(x, y, circle.x, circle.y),
        pointCircleLineLength = lineToCircleCenter.length;
    if (pointCircleLineLength < radius)
        return true;
    else
        return false;
}

function generateUniqId() {
    return Math.round(Math.random() * 1000000); 
}

export { 
    isMobile, 
    isSafari, 
    pointToCircleDistance, 
    countClosestTraversal, 
    countClosestTraversal2,
    angle_2points,
    angle_3points,
    dotProductWithAngle,
    dotProduct,
    isPointOnTheLine,
    isLineShorter,
    isPointLineIntersect,
    isPointPolygonIntersect,
    isPointRectIntersect,
    isPointCircleIntersect,
    generateUniqId };