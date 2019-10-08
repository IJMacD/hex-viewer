
export function getAnnotationLength (annotation) {
    if (annotation.length) {
        return annotation.length;
    }

    switch (annotation.type) {
        case "Uint16":
        case "Int16":
            return 2;
        case "Uint32":
        case "Int32":
            return 4;
        case "Uint64":
        case "Int64":
            return 4;
        default:
            return 1;
    }
}

let i = 0;
const palette = ["#FF0000","#00FF00","#0000FF","#FFFF00","#FF00FF","#00FFFF","#FF8800","#FF0088","#88FF00","#00FF88"];
export function getAnnotationColor (annotation) {
    if (annotation.color) {
        return annotation.color;
    }

    return palette[i++ % palette.length];
}

/**
 *
 * @param {import(".").Annotation} annotation
 * @param {ArrayBuffer} buffer
 * @returns {string|number|ArrayBuffer}
 */
export function getAnnotationData (annotation, buffer) {
    const view = new DataView(buffer);
    let data;
    switch (annotation.type) {
        case "ASCII":
            data = [...Array(annotation.length)].map((_, i) => String.fromCharCode(view.getUint8(annotation.start + i))).join("");
            break;
        case "Uint8":
        default:
            data = view.getUint8(annotation.start);
            break;
        case "Int8":
            data = view.getInt8(annotation.start);
            break;
        case "Uint16":
            data = view.getUint16(annotation.start, annotation.littleEndian);
            break;
        case "Int16":
            data = view.getInt16(annotation.start, annotation.littleEndian);
            break;
        case "Uint32":
            data = view.getUint32(annotation.start, annotation.littleEndian);
            break;
        case "Int32":
            data = view.getInt32(annotation.start, annotation.littleEndian);
            break;
        case "bytes":
            data = buffer.slice(annotation.start, annotation.start + annotation.length);
            break;
    }
    return data;
}
