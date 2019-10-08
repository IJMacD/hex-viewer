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
 * @prop {AnnotationTemplate[]} [children]
 * @prop {{ [byte: number]: AnnotationTemplate[] }} [cases]
 * @prop {number} [value]
 * @prop {AnnotationTemplate[]} [then]
 * @prop {AnnotationTemplate[]} [else]
 */

 /**
  * @param {AnnotationTemplate[]} template
  * @param {ArrayBuffer} buffer
  */
export function getAnnotations (template, buffer) {
    /** @type {Annotation[]} */
    const annotations = [];

    processAnnotationTemplates(template, annotations, buffer);

    return annotations;
}

/**
 * @param {AnnotationTemplate[]} templates
 * @param {Annotation[]} annotations
 * @param {ArrayBuffer} buffer
 * @param {number} groupStart
 */
function processAnnotationTemplates(templates, annotations, buffer, groupStart=0) {
    let start = 0;

    for (const template of templates) {
        /** @type {Annotation} */
        const annotation = { length: 0, color: null, ...template };

        annotation.color = getAnnotationColor(template);
        annotation.start = (template.start ? resolveReference(template.start, annotations, buffer) : start + groupStart);
        annotation.length = resolveReference(getAnnotationLength(template), annotations, buffer);

        if (template.type === "repeater") {
            let absoluteStart = start + groupStart;
            while (absoluteStart < buffer.byteLength) {
                processAnnotationTemplates(template.children, annotations, buffer, absoluteStart);

                const last = annotations[annotations.length - 1];
                const end = last.start + last.length;

                if (end === absoluteStart) {
                    break;
                }

                start = end - absoluteStart;
                absoluteStart = end;
            }
        } else if (template.type === "switch") {
            const val = +getAnnotationData(annotation, buffer);
            const sublist = template.cases[val];
            if (sublist) {
                processAnnotationTemplates(sublist, annotations, buffer, annotation.start);
                const last = annotations[annotations.length - 1];

                // Set for next loop
                start = last.start + last.length;
            }
        } else if (template.type === "if") {
            const val = +getAnnotationData(annotation, buffer);
            const sublist = val === template.value ? template.then : template.else;
            if (sublist) {
                processAnnotationTemplates(sublist, annotations, buffer, annotation.start);
                const last = annotations[annotations.length - 1];

                // Set for next loop
                start = last.start + last.length;
            }
        } else  if (annotation.length > 0) {
            annotations.push(annotation);
            // Start for next template
            start += annotation.length;
        }
    }
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
        const id = reference.split(":", 2);
        const ref = findAnnotation(annotations, id[0]);
        const type = id[1] || "value";
        if (type === "value")
            return +getAnnotationData(ref, buffer);
        if (type === "start")
            return ref.start;
        if (type === "length")
            return ref.length;
        if (type === "end")
            return ref.start + ref.length;
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
    // Go backwards to find most recent annotation with specific id
    for (let i = annotations.length - 1; i >= 0; i--) {
        if (annotations[i].id === reference) {
            return annotations[i];
        }
    }
    throw Error(`Reference not found: ${reference}`);
}
