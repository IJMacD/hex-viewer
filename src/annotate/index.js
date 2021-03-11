import { getAnnotationLength, getAnnotationColor, getAnnotationData } from "./util";

const formats = {
    "BMP": require('./formats/bmp'),
    "GIF": require('./formats/gif'),
    "PNG": require('./formats/png'),
    "TXT": require('./formats/txt'),
    "WAVE": require('./formats/wav'),
    "AR": require('./formats/ar'),
    "ELF": require('./formats/elf'),
    "ZIP": require('./formats/zip'),
    "MIDI": require('./formats/midi'),
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
 * @prop {string} [label]
 * @prop {number} start
 * @prop {number} length
 * @prop {string} color
 * @prop {boolean} [littleEndian]
 */

/**
 * @typedef AnnotationTemplate
 * @prop {string} [id]
 * @prop {string} type
 * @prop {string} [label]
 * @prop {number|object} [start]
 * @prop {number|object} [length]
 * @prop {string} [color]
 * @prop {boolean|string} [littleEndian]
 * @prop {AnnotationTemplate[]} [children]
 * @prop {{ [value: number|string]: AnnotationTemplate[] }} [cases]
 * @prop {number} [value]
 * @prop {string} [condition]
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
        const annotation = { start: 0, length: 0, color: null, ...template };

        annotation.start = (template.start ? +resolveReference(template.start, annotations, buffer, annotation) : start + groupStart);
        if (!template.length && (template.type === "ASCII" || template.type === "UTF-8")) {
            const view = new DataView(buffer, annotation.start);
            let length;
            for (length = 0; length < view.byteLength && view.getUint8(length) !== 0; length++) { }
            annotation.length = length;
        }
        else {
            annotation.length = +evaluateExpression(getAnnotationLength(template), annotations, buffer, annotation);
        }

        if (typeof template.littleEndian === "string") {
            annotation.littleEndian = Boolean(evaluateExpression(template.littleEndian, annotations, buffer, annotation));
        }

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
            let val = null;

            if (template.value) {
                val = resolveReference(template.value, annotations, buffer);
            }
            else {
                val = +getAnnotationData(annotation, buffer);
            }

            if (typeof val === "number" || typeof val === "string") {
                const sublist = template.cases[val] || template.cases['default'];
                if (sublist) {
                    processAnnotationTemplates(sublist, annotations, buffer, annotation.start);
                }
            }
        } else if (template.type === "if") {
            let isTrue = null;

            if (template.condition) {
                isTrue = evaluateExpression(template.condition, annotations, buffer);
            } else if (template.value) {
                const val = +getAnnotationData(annotation, buffer);
                isTrue = val === template.value;
            }

            if (typeof isTrue === "boolean") {
                const sublist = isTrue ? template.then : template.else;
                if (sublist) {
                    processAnnotationTemplates(sublist, annotations, buffer, annotation.start);
                }
            }
        } else if (annotation.length > 0) {
            annotation.color = getAnnotationColor(template);
            annotations.push(annotation);
        }

        const last = annotations[annotations.length - 1];
        // Set for next loop
        start = last.start + last.length - groupStart;
    }
}

/**
 *
 * @param {number|string|object} expr
 * @param {Annotation[]} annotations
 * @param {ArrayBuffer} buffer
 * @param {Annotation} [self]
 * @returns {number|string|boolean|ArrayBuffer}
 */
function evaluateExpression (expr, annotations, buffer, self=null) {
    if (typeof expr === "string") {
        const match = /[+=-]/.exec(expr);
        if (match) {
            const [ left, right ] = expr.split(match[0], 2).map(s => s.trim()).map(s => evaluateExpression(s, annotations, buffer, self));

            switch (match[0]) {
                case "=":
                    return left === right;
                case "+":
                    return +left + +right;
                case "-":
                    return +left - +right;
            }
        }
    }

    return evaluateNode(expr, annotations, buffer, self);
}

/**
 *
 * @param {number|string|object} node
 * @param {Annotation[]} annotations
 * @param {ArrayBuffer} buffer
 * @param {Annotation} [self]
 * @returns {number|string|ArrayBuffer}
 */
function evaluateNode (node, annotations, buffer, self=null) {
    if (typeof node === "string" && node[0] === "'" && node[node.length-1] === "'") {
        return node.substring(1,node.length-1);
    }

    const num = +node;
    if (!isNaN(num)) {
        return num;
    }

    return resolveReference(node, annotations, buffer, self);
}

/**
 *
 * @param {number|string|object} reference
 * @param {Annotation[]} annotations
 * @param {ArrayBuffer} buffer
 * @param {Annotation} [self]
 * @returns {number|string|ArrayBuffer}
 */
function resolveReference (reference, annotations, buffer, self=null) {
    if (typeof reference === "number") {
        return reference;
    }

    if (typeof reference === "string") {
        const id = reference.split(":", 2);
        const ref = id[0] ? findAnnotation(annotations, id[0]) : self;
        const type = id[1] || "value";

        if (!ref) {
            throw Error("Cannot resolver reference: " + reference);
        }

        if (type === "value")
            return getAnnotationData(ref, buffer);
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

        const left = +resolveReference(reference.left, annotations, buffer);
        const right = +resolveReference(reference.right, annotations, buffer);

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
