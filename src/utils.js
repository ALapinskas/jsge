import { Vector, Vertex } from "./base/Primitives.js";

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

function countClosestTraversal2(line1, line2) {
    const x1 = line2.x1,
        y1 = line2.y1,
        x2 = line2.x2,
        y2 = line2.y2;
    const x3 = line1.x1,
        y3 = line1.y1,
        x4 = line1.x2,
        y4 = line1.y2;

    const det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    // lines are parallel, or coincident
    if (det === 0){
        return;
    }
    let x = ((x1*y2 - y1*x2) * (x3 - x4) - (x1 - x2) * (x3*y4 - y3*x4)) / det;
    let y = ((x1*y2 - y1*x2) * (y3 - y4) - (y1 - y2) * (x3*y4 - y3*x4)) / det;
    const point = {x, y};
    
    if (isPointOnTheLine(point, line1) && isPointOnTheLine(point, line2)) {
        const p = Math.sqrt(Math.pow((x - line1.x1), 2) + Math.pow((y - line1.y1), 2));
        return {x, y, p};
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

function crossProduct(a, b) {
    return (a.x * b.y - b.x * a.y);
}

function isPointOnTheLine(point, line) {
    return (((point.x >= line.x1) && (point.x <= line.x2)) || ((point.x <= line.x1) && (point.x >= line.x2))) && (((point.y >= line.y1) && (point.y <= line.y2)) || ((point.y <= line.y1) && (point.y >= line.y2)));
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

function isPolygonLineIntersect(polygon, line) {
    const len = polygon.length;
    for (let i = 0; i < len; i+=2) {
        let curr = polygon[i],
            next = polygon[i+1];
        //if next item not exist and current is not first
        if (!next) {
            // if current vertex is not the first one
            if (!(curr.x === polygon[0].x && curr.y === polygon[0].y)) {
                next = polygon[0];
            } else {
                continue;
            }
        }
        const edge = { x1: curr.x, y1: curr.y, x2: next.x, y2: next.y };
        const intersection = countClosestTraversal2(edge, line);
        if (intersection) {
            return intersection;
        }
    }
    const even = len % 2 === 0;
    if (even) {
        //check one last item
        const curr = polygon[len - 1],
            next = polygon[0];
        const edge = { x1: curr.x, y1: curr.y, x2: next.x, y2: next.y };
        const intersection = countClosestTraversal2(edge, line);
        if (intersection) {
            return intersection;
        }
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

function arrayNumbersToVerticesArray(array) {
    const len = array.length,
        vertices = [];
    for (let i = 0; i < len; i+=2) {
        const x = array[i],
            y = array[i + 1];
        vertices.push(new Vertex(x, y));
    }
    return vertices;
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
    crossProduct,
    isPointOnTheLine,
    isLineShorter,
    isPointLineIntersect,
    isPointPolygonIntersect,
    isPointRectIntersect,
    isPointCircleIntersect,
    isPolygonLineIntersect,
    generateUniqId,
    arrayNumbersToVerticesArray };