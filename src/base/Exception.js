export function Exception (code, message) {
    throw new Error(code + ": " + message);
}

export function Warning (code, message) {
    console.error(code, message);
}