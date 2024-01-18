import * as fflate from 'fflate';

/**
 * @typedef PDFObject
 * @property {string} id
 * @property {object|array} value
 * @property {string|Uint8Array} [stream]
 * @property {PDFObject} [pages]
 * @property {PDFObject} [contents]
 * @property {PDFObject} [resources]
 * @property {PDFObject} [fontDescriptor]
 * @property {{[id: string]: PDFObject}} [xObjects]
 * @property {{[name: string]: PDFObject}} [fonts]
 * @property {PDFObject[]} [children]
 */

/**
 * @typedef PDFParseResult
 * @property {PDFObject[]} objects
 * @property {{id,offset,generation,free}[]} xRefTable
 * @property {{size,rootObjectID,infoObjectID}} trailer
 * @property {PDFObject|undefined} root
 * @property {PDFObject|undefined} info
 */

/**
 * @param {string} string
 * @returns {PDFParseResult}
 */
export function parsePDF(string) {
    const strim = string.trim();

    if (!strim.endsWith("%%EOF")) {
        throw Error(`Incorrect Trailer [${strim.substring(strim.length - 10)}]`);
    }

    const lastLine = strim.lastIndexOf("\n") + 1;
    const penultimateLine = strim.lastIndexOf("\n", lastLine - 2) + 1;

    const xRefTableOffset = +getLine(string, penultimateLine);

    const xRefTable = parserXRefTable(string, xRefTableOffset);

    const trailerOffset = strim.indexOf("trailer", xRefTableOffset);

    const trailer = parseTrailer(strim, { index: trailerOffset });

    const objects = [];

    for (const xRef of xRefTable) {
        if (!xRef.free) {
            const object = parseObject(strim, { index: xRef.offset });
            // console.log(object);
            objects.push(object);
        }
    }

    const root = objects.find(o => +o.id === trailer.rootObjectID);

    if (root) {
        const pagesObject = resolveObject(root.value['Pages'], objects);
        root.pages = pagesObject;
        if (pagesObject) {
            populateChildren(pagesObject, objects);
        }
    }

    const info = objects.find(o => +o.id === trailer.infoObjectID);

    return {
        objects,
        xRefTable,
        trailer,
        root,
        info,
    };
}
/**
 * @param {string} xRef
 * @param {PDFObject[]} objects
 */
function resolveObject(xRef, objects) {
    const parts = xRef.split(" ");
    const pagesObject = objects.find(o => o.id === parts[0]);
    pagesObject;
    return pagesObject;
}
/**
 * @param {PDFObject} object
 * @param {PDFObject[]} objects
 */
function populateChildren(object, objects) {
    if (Array.isArray(object.value['Kids'])) {
        object.children = object.value['Kids'].map((/** @type {string} */ xRef) => {
            const object = resolveObject(xRef, objects);
            if (object) {
                populateChildren(object, objects);
            }
            return object;
        });
    }

    if (typeof object.value['Contents'] === "string") {
        object.contents = resolveObject(object.value['Contents'], objects);
    }

    if (typeof object.value['Resources'] === "string") {
        object.resources = resolveObject(object.value['Resources'], objects);
        if (object.resources) {
            populateChildren(object.resources, objects);
        }
    }
    else if (typeof object.value['Resources'] === "object") {
        object.resources = { value: object.value['Resources'] };
        if (object.resources) {
            populateChildren(object.resources, objects);
        }
    }

    if (typeof object.value['XObject'] === "object") {
        /** @type {{[id: string]: PDFObject}} */
        const xObjs = {};
        for (const [id, xRef] of Object.entries(object.value['XObject'])) {
            xObjs[id] = resolveObject(xRef, objects);
        }
        object.xObjects = xObjs;
    }

    if (typeof object.value['Font'] === "object") {
        /** @type {{[name: string]: PDFObject}} */
        const fonts = {};
        for (const [id, xRef] of Object.entries(object.value['Font'])) {
            fonts[id] = resolveObject(xRef, objects);
            if (fonts[id]) {
                populateChildren(fonts[id], objects);
            }
        }
        object.fonts = fonts;
    }

    if (typeof object.value['FontDescriptor'] === "string") {
        object.fontDescriptor = resolveObject(object.value['FontDescriptor'], objects);
    }
}
/**
 * @param {string} string
 * @param {number} start
 */
function parserXRefTable(string, start) {
    const end = string.indexOf("trailer", start);

    const lines = string.substring(start, end).split("\n");

    const out = [];
    let id = 0;

    for (const line of lines) {
        if (line.trim() === "xref") continue;

        const parts = line.trim().split(" ");

        if (parts.length === 2) {
            id = +parts[0];
            continue;
        }

        if (parts.length === 3) {
            out.push({
                id: id++,
                offset: +parts[0],
                generation: +parts[1],
                free: parts[2] === "f" || +parts[0] === 0,
            });
        }
    }

    return out;
}
/**
 * @param {string} string
 * @param {{index: number}} context
 */
function parseTrailer(string, context) {
    if (!string.substring(context.index).startsWith("trailer")) {
        throw new ParseError(`Cannot find trailer.`, string, context, "trailer");
    }

    context.index += 7;

    const properties = parseObjectProperties(string, context);

    return {
        size: +properties['Size'],
        rootObjectID: +properties['Root'].split(" ")[0],
        infoObjectID: +properties['Info'].split(" ")[0],
    };
}
/**
 * @param {string} string
 * @param {{index: number}} context
 */
function parseObject(string, context) {
    const splitOffset = string.indexOf(" ", context.index);
    const id = string.substring(context.index, splitOffset);

    const objStartOffset = string.indexOf("obj", context.index) + 3;

    const endObjOffset = string.indexOf("endobj", context.index);

    const streamOffset = string.indexOf("stream", context.index);

    context.index = objStartOffset;

    /**
     * @type {PDFObject}
     */
    const out = {
        id,
        value: parseValue(string, context),
    };

    if (streamOffset > -1 && streamOffset < endObjOffset && out.value["Length"]) {
        const streamStart = string.indexOf("\n", streamOffset) + 1;

        out.stream = fflate.strToU8(string.substring(streamStart, streamStart + +out.value["Length"]), true);

        if (out.value['Filter'] === "/FlateDecode") {
            try {
                out.stream = fflate.decompressSync(out.stream);
            }
            catch (e) {
                console.log(`Deflate Error: ${e.message}`);
            }
        }
    }

    context.index = endObjOffset + 6;

    return out;
}

/**
 * Expects to start before '<<'
 * @param {string} string
 * @param {{index: number}} context
 */
function parseObjectProperties(string, context) {
    skipWhitespace(string, context);

    if (!string.substring(context.index).startsWith("<<")) {
        throw new ParseError(`Cannot find object.`, string, context, "<<");
    }

    context.index += 2;

    const out = {};

    skipWhitespace(string, context);

    while (string[context.index] !== ">" && string[context.index + 1] !== ">") {

        if (string[context.index] !== "/") {
            throw new ParseError(`Object property parsing error.`, string, context, "/");
        }

        context.index++;

        const nameStart = context.index;
        skipToken(string, context);
        const name = string.substring(nameStart, context.index);

        skipWhitespace(string, context);

        const value = parseValue(string, context);

        out[name] = value;

        skipWhitespace(string, context);
    }

    context.index += 2;

    return out;
}

/**
 * @param {string} string
 * @param {{ index: number; }} context
 */
function parseValue (string, context) {
    let value;

    skipWhitespace(string, context);

    if (string[context.index] === "[") {
        // Array
        context.index++;

        skipWhitespace(string, context);

        value = [];

        while (string[context.index] != "]") {
            const val = parseValue(string, context);

            value.push(val);

            skipWhitespace(string, context);
        }

        context.index++;

        return value;
    }

    if (string[context.index] === "<" && string[context.index + 1] === "<") {
        // Object
        return parseObjectProperties(string, context);
    }

    if (string[context.index] === "<") {
        // Hex String
        const start = context.index + 1;
        context.index = string.indexOf(">", context.index) + 1;
        return string.substring(start, context.index - 1);
    }

    if (string[context.index] === "(") {
        context.index++;
        // String
        const start = context.index;
        let depth = 0;
        while (string[context.index]) {
            if (string[context.index] === "(") {
                depth++;
            }
            else if (string[context.index] === ")"){
                if (depth === 0) {
                    context.index++;
                    break;
                }
                depth++;
            }
            else if (string[context.index] === "\\") {
                context.index++;
            }
            context.index++;
        }
        return string.substring(start, context.index - 1);
    }

    const match = /^\d+ \d+ R/.exec(string.substring(context.index));

    if (match) {
        // Object Reference
        value = match[0];

        context.index += value.length;
        return value;
    }

    // Other Value
    const start = context.index;
    skipValueToken(string, context);
    if (start === context.index) {
        throw new ParseError("Unable to get value.", string, context, "<Value Token>");
    }
    return string.substring(start, context.index);
}

/**
 * @param {string} string
 * @param {{index: number}} context
 */
function skipWhitespace(string, context) {
    const match = string.substring(context.index).match(/^\s+/);
    context.index += (match ? match[0].length : 0);
}

/**
 * @param {string} string
 * @param {{index: number}} context
 */
function skipToken(string, context) {
    const match = string.substring(context.index).match(/^\w+/);
    context.index += (match ? match[0].length : 0);
}
/**
 * @param {string} string
 * @param {{index: number}} context
 */
function skipValueToken(string, context) {
    const match = string.substring(context.index).match(/^\/?[^\s[\]>/]+/);
    context.index += (match ? match[0].length : 0);
}
/**
 * @param {string} string
 */
function getLine(string, start = 0) {
    const end = string.indexOf("\n", start);
    return string.substring(start, end === -1 ? undefined : end).trim();
}
/**
 * @param {string} string
 * @param {number} start
 * @param {number} length
 */
function getHex(string, start, length) {
    return [...string.substring(start, start + length)].map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
}

class ParseError extends Error {
    /**
     * @param {string} message
     * @param {string} string
     * @param {{index: number}} context
     * @param {string} expected
     */
    constructor (message, string, context, expected) {
        super(`${message}\nExpected '${expected}'\nFound '...${string.substring(context.index - 10, context.index)}[${string[context.index]}]${string.substring(context.index + 1, context.index + 10)}...'`);
    }
}