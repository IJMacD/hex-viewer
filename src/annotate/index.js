import { evaluateExpression, resolveReference } from "./expressions";
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
    "SQLITE": require('./formats/sqlite'),
    "PST": require('./formats/pst'),
};

/**
 * @param {ArrayBuffer} buffer
 */
export function findFormatTemplate(buffer) {
    for (const format in formats) {
        const template = formats[format].magic(buffer);

        if (template) {
            return template;
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
 * @prop {{ [value: number]: string }} [enum]
 * @prop {number} [count]
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
 * @prop {{ [value: number]: string }} [enum]
 * @prop {AnnotationTemplate[]} [children]
 * @prop {number} [count]
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
 * @param {number} groupOffset
 */
function processAnnotationTemplates(templates, annotations, buffer, groupOffset=0, depth=0) {
    /** Running position within group */
    let relativeStart = 0;

    for (const template of templates) {
        /** @type {Annotation} */
        const annotation = { start: 0, length: 0, color: null, depth, ...template };

        // Absolute start
        annotation.start = (template.start ? +resolveReference(template.start, annotations, buffer, annotation) : relativeStart + groupOffset);
        if (!template.length && (template.type === "ASCII" || template.type === "UTF-8")) {
            // Find NULL terminator
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
            if (!template.children) {
                throw Error("Expected children in the annotation");
            }
            annotation.color = getAnnotationColor(template);
            annotations.push(annotation);
            let childCount = 0;
            let start = relativeStart + groupOffset;
            // Initialise to check for movement
            let absoluteEnd = start;

            while (start < buffer.byteLength && (typeof template.count === "undefined" || childCount < template.count)) {
                processAnnotationTemplates(template.children, annotations, buffer, start, depth + 1);

                const last = annotations[annotations.length - 1];
                absoluteEnd = last.start + last.length;

                // If we haven't moved then bail
                if (absoluteEnd === start) {
                    break;
                }

                // Relative
                relativeStart = absoluteEnd - start;
                // Absolute
                start = absoluteEnd;

                childCount++;
            }

            // Calculated actual length of this repeater
            const length = absoluteEnd - annotation.start;

            // Check if there was an explicit fixed length
            // If we had less than the fixed length then we'll use the explicit
            // length. Otherwise fill in the calculated value.
            if (typeof annotation.length === "number" && annotation.length > length) {
                // NO op
            }
            else {
                annotation.length = length;
            }

            // Move on the relative pointer
            relativeStart = annotation.start + annotation.length - groupOffset;

            annotation.count = childCount;
        }
        else if (template.type === "group") {
            if (!template.children) {
                throw Error("Expected children in the annotation");
            }
            let absoluteStart = annotation.start; // start + groupStart;
            annotation.color = getAnnotationColor(template);
            annotations.push(annotation);
            processAnnotationTemplates(template.children, annotations, buffer, absoluteStart, depth + 1);

            const last = annotations[annotations.length - 1];
            const end = last.start + last.length;

            if (typeof annotation.length !== "number" || annotation.length <= 0) {
                annotation.length = end - annotation.start;
            }

            relativeStart = annotation.start + annotation.length - groupOffset;

            if (end === absoluteStart) {
                break;
            }
        }
        else if (template.type === "switch") {
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

            const last = annotations[annotations.length - 1];
            // Set for next loop
            relativeStart = last.start + last.length - groupOffset;
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

            const last = annotations[annotations.length - 1];
            // Set for next loop
            relativeStart = last.start + last.length - groupOffset;
        } else if (annotation.length > 0) {
            annotation.color = getAnnotationColor(template);
            annotations.push(annotation);

            const last = annotations[annotations.length - 1];
            // Set for next loop
            relativeStart = last.start + last.length - groupOffset;
        }
    }
}
