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

/**
 * 
 * @param {{x1:number, y1:number, x2:number, y2:number}} line1 
 * @param {{x1:number, y1:number, x2:number, y2:number}} line2 
 * @returns {{x:number, y:number, p:number} | undefined}
 * @ignore
 */
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
    
    if (isPointOnTheLine(point, line1, 0.0000000000001) && isPointOnTheLine(point, line2, 0.0000000000001)) {
        const p = Math.sqrt(Math.pow((x - x1), 2) + Math.pow((y - y1), 2));
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

function isPointOnTheLine(point, line, m_error = 0) {
    return  (
        ((point.x >= (line.x1 - m_error)) && (point.x <= (line.x2 + m_error))) || 
                ((point.x <= (line.x1 + m_error)) && (point.x >= (line.x2 - m_error)))
    ) && (
        ((point.y >= (line.y1 - m_error)) && (point.y <= (line.y2 + m_error))) || 
                ((point.y <= (line.y1 + m_error)) && (point.y >= (line.y2 - m_error)))
    );
}

function countDistance(obj1, obj2) {
    return new Vector(obj1.x, obj1.y, obj2.x, obj2.y).length;
}

function isLineShorter(line1, line2) {
    return (new Vector(line1.x1, line1.y1, line1.x2, line1.y2)).length < (new Vector(line2.x1, line2.y1, line2.x2, line2.y2)).length;
}

function isPointLineIntersect(point, line) {
    const lineL = new Vector(line.x1, line.y1, line.x2, line.y2).length,
        lengthAB = new Vector(line.x1, line.y1, point.x, point.y).length + new Vector(line.x2, line.y2, point.x, point.y).length;

    if (lengthAB <= lineL + 0.2) {
        //console.log("point to line intersect. line len: " + lineL + ", line AB len: " + lengthAB);
        return true;
    }
    return false;
}

/**
 * 
 * @param {Array<Array<number>>} polygon 
 * @param {{x1:number, y1:number, x2:number, y2:number}} line 
 * @returns {{x:number, y:number, p:number} | null}
 * @ignore
 */
function isPolygonLineIntersect(polygon, line) {
    const len = polygon.length;
    for (let i = 0; i < len; i+=1) {
        let curr = polygon[i],
            next = polygon[i+1];
        //if next item not exist and current is not first
        if (!next) {
            // if current vertex is not the first one
            if (!(curr[0] === polygon[0][0] && curr[1] === polygon[0][1])) {
                next = polygon[0];
            } else {
                continue;
            }
        }
        const edge = { x1: curr[0], y1: curr[1], x2: next[0], y2: next[1] };
        const intersection = countClosestTraversal2(edge, line);
        if (intersection) {
            return intersection;
        }
    }
    if (polygon[len-1][0] !== polygon[0][0] && polygon[len-1][1] !== polygon[0][1]) {
        //check one last item
        const curr = polygon[len - 1],
            next = polygon[0];
        const edge = { x1: curr[0], y1: curr[1], x2: next[0], y2: next[1] };
        const intersection = countClosestTraversal2(edge, line);
        if (intersection) {
            return intersection;
        }
    }
    return null;
}

function isPointPolygonIntersect(x, y, polygon) {
    const len = polygon.length;
    
    for (let i = 0; i < len; i+=1) {
        let vertex1 = polygon[i],
            vertex2 = polygon[i + 1];

        // if last vertex, set vertex2 as the first
        if (!vertex2) {
            vertex2 = polygon[0];
        }

        if (isPointLineIntersect({x,y}, {x1: vertex1[0], y1: vertex1[1], x2: vertex2[0], y2: vertex2[1]})) {
            return true;
        }
    }
    return false;
}

function isPointRectIntersect(x, y, rect) {
    if (x >= rect.x && x <= rect.width + rect.x && y >= rect.y && y <= rect.y + rect.height) {
        return true;
    } else {
        return false;
    }
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {{x:number, y:number, r:number}} circle 
 * @returns {boolean}
 */
function isPointCircleIntersect(x, y, circle) {
    const radius = circle.r,
        lineToCircleCenter = new Vector(x, y, circle.x, circle.y),
        pointCircleLineLength = lineToCircleCenter.length;
        
    if (pointCircleLineLength < radius)
        return true;
    else
        return false;
}

function isCircleLineIntersect(x, y, r, line) {
    const x1 = line.x1,
        y1 = line.y1,
        x2 = line.x2,
        y2 = line.y2,
        vec1 = {x: x1 - x, y: y1-y}, //new Vector(x, y, x1, y1),
        vec2 = {x: x2 - x, y: y2-y}, //new Vector(x, y, x2, y2),
        vec3 = {x: x2 - x1, y: y2-y1}, //new Vector(x1 ,y1, x2, y2),
        vec4 = {x: x1 - x2, y: y1-y2}, //new Vector(x2, y2, x1, y1),
        vec3Len = Math.sqrt(Math.pow(vec3.x, 2) + Math.pow(vec3.y, 2)),//vec3.length,
        dotP1 = dotProduct(vec1, vec4),
        dotP2 = dotProduct(vec2, vec3);
        // checks if the line is inside the circle,
        // max_dist = Math.max(vec1Len, vec2Len);
    let min_dist;
    
    if (dotP1 > 0 && dotP2 > 0) {
        min_dist = crossProduct(vec1,vec2)/vec3Len;
        if (min_dist < 0) {
            min_dist *= -1;
        }
    } else {
        min_dist = Math.min(vec1.length, vec2.length);
    }
    
    if (min_dist <= r) { // && max_dist >= r) {
        return true;
    } else {
        return false;
    } 
}

/**
 * 
 * @param {Array<number>} ellipse - x,y,radX,radY
 * @param {Array<Array<number>>} line [x1,y1],[x2,y2]
 */
function isEllipseLineIntersect(ellipse, line) {
    const x = ellipse[0],
        y = ellipse[1],
        radX = ellipse[2],
        radY = ellipse[3],
        x1 = line[0][0],
        y1 = line[0][1],
        x2 = line[1][0],
        y2 = line[1][1],
        lineAToElCenter = { x: x - x1, y: y - y1 }, //new Vector(x, y, x1, y1),
        lineBToElCenter = { x: x - x2, y: y - y2 }, //new Vector(x, y, x2, y2),
        lineAToElCenterLen = Math.sqrt(Math.pow(lineAToElCenter.x, 2) + Math.pow(lineAToElCenter.y, 2)),
        lineBToElCenterLen = Math.sqrt(Math.pow(lineBToElCenter.x, 2) + Math.pow(lineBToElCenter.y, 2)),
        lineToCenterLenMin = Math.min(lineAToElCenterLen, lineBToElCenterLen),
        ellipseMax = Math.max(radX, radY);
        
    if (lineToCenterLenMin > ellipseMax) {
        return false;
    }
    
    const traversalLine = lineToCenterLenMin === lineAToElCenterLen ? lineAToElCenter : lineBToElCenter,
        angleToAxisX = Math.atan2(traversalLine.y, traversalLine.x);
    
    const intersectX = Math.cos(angleToAxisX) * radX,
        intersectY = Math.sin(angleToAxisX) * radY,
        lineToCenter = { x: 0 - intersectX, y: 0 - intersectY },
        intersectLineLen = Math.sqrt(Math.pow(lineToCenter.x, 2) + Math.pow(lineToCenter.y, 2));
    //console.log("lenToCheck: ", lenToCheck);
    //console.log("x: ", intersectX);
    if (lineToCenterLenMin > intersectLineLen) {
        return false;
    }
    return true;
}

/**
 * 
 * @param {Array<number>} ellipse - x,y,radX,radY
 * @param {{x:number, y:number, r:number}} circle
 * @returns {{x:number, y:number, p:number} | boolean}
 */
function isEllipseCircleIntersect(ellipse, circle) {
    const ellipseX = ellipse[0],
        ellipseY = ellipse[1],
        ellipseToCircleLine = { x: ellipseX - circle.x, y: ellipseY - circle.y },
        len = Math.sqrt(Math.pow(ellipseToCircleLine.x, 2) + Math.pow(ellipseToCircleLine.y, 2)),
        maxRad = Math.max(ellipse[2], ellipse[3]);
    // no collisions for sure
    if (len > (maxRad + circle.r)) {
        return false;
    } else {
        // check possible collision
        const angle = angle_2points(ellipseX, ellipseY, circle.x, circle.y),
            traversalX = ellipseX + (ellipse[2] * Math.cos(angle)),
            traversalY =  ellipseY + (ellipse[3] * Math.sin(angle)),
            vecTrX = ellipseX - traversalX,
            vecTrY = ellipseY - traversalY,
            traversalLen = Math.sqrt(Math.pow(vecTrX, 2) + Math.pow(vecTrY, 2)) + circle.r;
            if (len <= traversalLen) {
                return {x: vecTrX, y: vecTrY, p:1};
            } else {
                return false;
            }
    }
    
}

/**
 * 
 * @param {Array<number>} ellipse - x,y,radX,radY
 * @param {Array<Array<number>>} polygon - x,y
 * @returns {boolean}
 */
function isEllipsePolygonIntersect(ellipse, polygon) {
    const len = polygon.length;

    for (let i = 0; i < len; i+=1) {
        let vertex1 = polygon[i],
            vertex2 = polygon[i + 1];

        // if last vertex, set vertex2 as the first
        if (!vertex2) {
            vertex2 = polygon[0];
        }

        if (isEllipseLineIntersect(ellipse, [vertex1, vertex2])) {
            return true;
        }
    }
    return false;
}

function generateUniqId() {
    return Math.round(Math.random() * 1000000); 
}

function verticesArrayToArrayNumbers(array) {
    const len = array.length,
        numbers = [];
    for (let i = 0; i < len; i++) {
        const vertex = array[i];
        numbers.push([vertex.x, vertex.y]);
    }
    return numbers;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} radiusX
 * @param {number} radiusY
 * @param {number} [angle = 2 * Math.PI]
 * @param {number} [step = Math.PI/12] 
 * @returns {Array<number>}
 */
function calculateEllipseVertices(x = 0, y = 0, radiusX, radiusY, angle = 2*Math.PI, step = Math.PI/8) {
    let ellipsePolygonCoords = [];

    for (let r = 0; r <= angle; r += step) {
        let x2 = Math.cos(r) * radiusX + x,
            y2 = Math.sin(r) * radiusY + y;

        ellipsePolygonCoords.push([x2, y2]);
    }

    return ellipsePolygonCoords;
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
    isCircleLineIntersect,
    isEllipseLineIntersect,
    isEllipseCircleIntersect,
    isEllipsePolygonIntersect,
    generateUniqId,
    verticesArrayToArrayNumbers,
    countDistance,
    calculateEllipseVertices };