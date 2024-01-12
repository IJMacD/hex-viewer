/**
 * @param {ArrayBuffer} buffer
 * @param {number} [start]
 * @param {number} [length]
 */
export function getASCIIString(buffer, start = 0, length = buffer.byteLength - start) {
    const bytes = new Uint8Array(
        start === 0 && length === buffer.byteLength ?
            buffer :
            buffer.slice(start, start + length)
    );

    // Avoid stack overflow due to too many function parameters
    const parts = [];
    const blockSize = 4096;

    for (let i = 0; i < length; i += blockSize) {
        parts.push(String.fromCharCode(...bytes.slice(i, i + blockSize)));
    }

    return parts.join("");
}
