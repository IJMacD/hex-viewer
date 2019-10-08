import { getAnnotationLength, getAnnotationColor, getAnnotationData } from "./util";

const formats = {
    "BMP": require('./bmp'),
    "GIF": require('./gif'),
};

export function findFormat(buffer) {
    for (const format in formats) {
        const template = formats[format].magic(buffer);

        if (template) {
            return {
                format,
                annotations: getAnnotations(template, buffer),
            };
        }
    }
}


/**
 * @typedef Annotation
 * @prop {string} [id] 
 * @prop {string} type
 * @prop {number} start 
 * @prop {number} length 
 * @prop {string} color
 * @prop {boolean} [littleEndian]
 */

/**
 * @typedef AnnotationTemplate
 * @prop {string} [id] 
 * @prop {string} type
 * @prop {number|object} start 
 * @prop {number|object} [length] 
 * @prop {string} [color]
 */

 /**
  * @param {AnnotationTemplate[]} template
  * @param {ArrayBuffer} buffer
  */
export function getAnnotations (template, buffer) {
    /** @type {Annotation[]} */
    const annotations = [];

    for (const t of template) {
        /** @type {Annotation} */
        const annotation = { length: 0, color: null, ...t };

        annotation.color = getAnnotationColor(t);
        annotation.start = resolveReference(t.start, annotations, buffer)
        annotation.length = resolveReference(getAnnotationLength(t), annotations, buffer)

        if (annotation.length > 0) {
            annotations.push(annotation);
        }
    }

    return annotations;
}

/**
 * 
 * @param {number|string|object} reference 
 * @param {Annotation[]} annotations 
 * @param {ArrayBuffer} buffer 
 * @returns {number}
 */
function resolveReference (reference, annotations, buffer) {
    if (typeof reference === "number") {
        return reference;
    }

    if (typeof reference === "string") {
        const ref = findAnnotation(annotations, reference);
        const data = +getAnnotationData(ref, buffer);
        return data;
    }
    
    if (typeof reference === "object") {
        if (reference.operation === "relative") {
            const ref = findAnnotation(annotations, reference.to);
            return +getAnnotationData(ref, buffer) + ref.start;
        }

        const left = resolveReference(reference.left, annotations, buffer);
        const right = resolveReference(reference.right, annotations, buffer);
        
        switch (reference.operation) {
            case "add":
                return left + right;
            case "subtract":
                return left - right;
        }
    }
}

function findAnnotation(annotations, reference) {
    const ref = annotations.find(a => a.id === reference);
    if (!ref) throw Error(`Reference not found: ${reference}`);
    return ref;
}
