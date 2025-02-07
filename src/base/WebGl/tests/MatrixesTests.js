import { mat3Multiply, mat3MultiplyVector } from "../../../utils.js";

/**
 * [ 5, 4, 2,
 *   5, 4, 2,
 *   4, 5, 6] *
 * [ 2, 88, 4, 
 *   6, 64, 3, 
 *   7, 5, 5] = 
 * [ 48, 706, 42,
 *   48, 706, 42,
 *   80, 702, 61 ]
 */
const resultMat = mat3Multiply([ 5, 4, 2, 5, 4, 2, 4, 5, 6], [ 2, 88, 4, 6, 64, 3, 7, 5, 5] );
//console.log(resultMat);
/*
{{3, 3, 24}, {54, 54, 80}, {40, 40, 168}})
*/
const resultMat2 = mat3Multiply( [ 0, 0, 3, 4, 4, 6, 0, 8, 16], [9, 9, 3, 3, 3, 5, 1, 1, 8] );
//console.log(resultMat2);

/**
 * 
 */
const resMat3 = mat3MultiplyVector( [ 5, 4, 2, 5, 4, 2, 4, 5, 6], [3, 2, 1] );

/**
 * [3, 2, 1]
 */
const resMat4 = mat3MultiplyVector( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], [3, 2, 1]);

/**
 * 
 */
const resMat5 = mat3MultiplyVector( [1, 0, 0, 0, 1, 0, 455, 390, 1], [-8, -8, 1]);

console.log(resMat5);