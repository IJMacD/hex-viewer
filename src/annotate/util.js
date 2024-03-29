import { opacity } from '../util';

export function getAnnotationLength (annotation) {
    if (annotation.length) {
        return annotation.length;
    }

    switch (annotation.type) {
        case "Uint8":
        case "Int8":
            return 1;
        case "Uint16":
        case "Int16":
            return 2;
        case "Uint32":
        case "Int32":
            return 4;
        case "Uint64":
        case "Int64":
            return 8;
        default:
            return 0;
    }
}

export function getAnnotationColor (template) {
    if (!template.color) {
        template.color = deterministicColorB();
    }

    return template.color;
}

let theta = 240;
let hue = 0;
function deterministicColorA() {
    const rgb = hslToRgb(hue / 360, 1, 0.5);

    hue += Math.min(120, theta);

    if (hue >= 360) {
        theta /= 2;
        hue = theta / 2;
    }

    return "#" + rgb.map(c => c.toString(16).padStart(2, "0")).join("");
}

let colourIndex = 0;
const thetaDelta = 57;
function deterministicColorB () {
    const hue = (colourIndex++ * thetaDelta) % 360;
    return `hsl(${hue}deg, 100%, 50%)`;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 *
 * @param {import(".").Annotation} annotation
 * @param {ArrayBuffer} buffer
 * @returns {string|number|ArrayBuffer|BigInt|null}
 */
export function getAnnotationData (annotation, buffer) {
    if (annotation.length === 0) return null;
    if (typeof annotation.children !== "undefined") return null;

    const view = new DataView(buffer);
    let data;
    try {
        switch (annotation.type) {
            case "ASCII":
            case "UTF-8":
                data = [...Array(annotation.length)].map((_, i) => String.fromCharCode(view.getUint8(annotation.start + i))).join("");
                if (data[data.length-1] === "\0") data = data.substring(0,data.length - 1);
                break;
            case "UTF-16":
                data = String.fromCharCode(...new Uint16Array(view.buffer.slice(view.byteOffset + annotation.start, view.byteOffset + annotation.start + annotation.length)));
                if (data[data.length-1] === "\0") data = data.substring(0,data.length - 1);
                break;
            case "Uint8":
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
            case "Uint64":
                data = view.getBigUint64(annotation.start, annotation.littleEndian);
                break;
            case "Int64":
                data = view.getBigInt64(annotation.start, annotation.littleEndian);
                break;
            case "bytes":
                data = buffer.slice(annotation.start, annotation.start + annotation.length);
                break;
        }
    }
    catch (e) {
        console.log("Unable to get data for: " + annotation.label);
        throw e;
    }

    return data;
}

export function getAnnotationStyle(annotations, offset) {
    const style = {};
    const a = getAnnotation(annotations, offset);
    if (a) {
        let backgroundColor = a.color;
        if (backgroundColor.startsWith("#")) {
            backgroundColor = opacity(backgroundColor, 0.5);
        }
        else if (backgroundColor.startsWith("hsl(")) {
            const match = /hsl\((\d+)deg, (\d+)%, (\d+)%\)/.exec(backgroundColor);
            if (match) {
                backgroundColor = `hsl(${match[1]}deg, ${match[2]}%, ${+match[3] + 25}%)`;
            }
        }

        const end = a.start + a.length - 1;
        style.borderStyle = "solid";
        style.borderWidth = 1;
        style.backgroundColor = backgroundColor;
        style.borderLeftColor = (offset === a.start || offset % 16 === 0) ? a.color : "transparent";
        style.borderRightColor = (offset === end || offset % 16 === 15) ? a.color : "transparent";
        style.borderTopColor = (Math.floor(offset / 16) == Math.floor(a.start / 16)) ? a.color : "transparent";
        style.borderBottomColor = (Math.floor(offset / 16) == Math.floor(end / 16)) ? a.color : "transparent";
    }
    return style;
}

export function getAnnotation(annotations, offset) {
    if (!annotations) return undefined;
    const leafMatch = annotations.find(a => offset >= a.start && offset < a.start + a.length && typeof a.template.children === "undefined");
    if (leafMatch) return leafMatch;
    return annotations.find(a => offset >= a.start && offset < a.start + a.length);
}

/**
 *
 * @param {ArrayBuffer} buffer
 * @param {string|number[]} match
 * @param {number} [offset]
 */
export function markerMatch (buffer, match, offset = 0) {
    const view = new DataView(buffer, offset);
    const len = match.length;

    for (let i = 0; i < len; i++) {
        const byte = (typeof match === "string") ? match.charCodeAt(i) : match[i];
        if (view.getUint8(i) !== byte) return false;
    }

    return true;
}