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
    "PDF": require('./formats/pdf'),
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
 * @prop {string} [enumValue]
 * @prop {number} [count]
 * @prop {number} [depth]
 * @prop {AnnotationTemplate} template
 * @prop {boolean} [unresolved]
 */

/**
 * @typedef AnnotationTemplate
 * @prop {string} [id]
 * @prop {string} type
 * @prop {string} [label]
 * @prop {number|object} [start]
 * @prop {number|object} [length]
 * @prop {string} [color]
 * @prop {boolean} [littleEndian]
 * @prop {string} [display]
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
    let annotations = processAnnotationTemplates(template, buffer);

    // Now check for unresolved annotations
    let count = Number.POSITIVE_INFINITY;
    let prev = count;
    let retry = 10;
    while (count > 0) {
        count = processUnresolved(annotations, buffer);

        if (prev === count) {
            if (retry-- < 0) {
                // throw Error(`Unable to resolve all annotations: ${count} still not resolved`);
                break;
            }
        }
        else {
            retry = 10;
        }

        prev = count;
    }

    return annotations;
}

/**
 * @param {Annotation[]} annotations
 * @param {ArrayBuffer} buffer
 */
function processUnresolved(annotations, buffer) {
    let count = 0;

    for (let i = 0; i < annotations.length; i++) {
        const annotation = annotations[i];

        if (annotation.unresolved) {
            count++;
            console.debug(`Resolving ${annotation.label} start: ${annotation.start} length: ${annotation.length}`);

            const newAnnotations = processAnnotationTemplates(
                [annotation.template],
                buffer,
                annotations,
                annotation.start,
                (annotation.depth || 0)
            );

            annotations.splice(i, 1, ...newAnnotations);

            i += newAnnotations.length;
        }
    }

    return count;
}

/**
 * @param {AnnotationTemplate[]} templates
 * @param {ArrayBuffer} buffer
 * @param {Annotation[]} [annotations]
 * @param {number} [groupOffset]
 * @param {number} [depth]
 */
function processAnnotationTemplates(templates, buffer, annotations = [], groupOffset=0, depth=0) {
    const outAnnotations = [];

    /** Running position within group */
    let relativeStart = 0;

    for (const template of templates) {
        const { id, label, type, littleEndian } = template;

        /** @type {Annotation} */
        const annotation = {
            start: 0,
            length: 0,
            depth,
            id,
            label,
            type,
            littleEndian: littleEndian ? littleEndian : void 0,
            color: getAnnotationColor(template),
            template,
        };

        // Absolute start
        try {
            annotation.start = (template.start ? +resolveReference(template.start, [...annotations,...outAnnotations], buffer, annotation) : relativeStart + groupOffset);
            if (!template.length && (template.type === "ASCII" || template.type === "UTF-8")) {
                // Find NULL terminator
                const view = new DataView(buffer, annotation.start);
                let length;
                for (length = 0; length < view.byteLength && view.getUint8(length) !== 0; length++) { }
                annotation.length = length;
            }
            else {
                annotation.length = +evaluateExpression(getAnnotationLength(template), [...annotations,...outAnnotations], buffer, annotation);
            }
        }
        catch (e) {
            annotation.unresolved = true;
            outAnnotations.push(annotation);
            continue;
        }

        if (typeof template.littleEndian === "string") {
            annotation.littleEndian = Boolean(evaluateExpression(template.littleEndian, [...annotations,...outAnnotations], buffer, annotation));
        }

        if (template.type === "repeater") {
            if (!template.children) {
                throw Error("Expected children in the annotation");
            }

            outAnnotations.push(annotation);

            let childCount = 0;
            let start = relativeStart + groupOffset;
            // Initialise to check for movement
            let absoluteEnd = start;

            let maxCount = Number.POSITIVE_INFINITY;

            // Establish the max count for this repeater, possibly resolving
            // expressions.
            // This can fail if the expression cannot be resolved due to the
            // reference referring to a later annotation which hasn't been
            // processed yet.
            // TODO: This should be more generic to handle more types of failures
            try {
                if (typeof template.count !== "undefined") {
                    maxCount = +evaluateExpression(template.count, annotations, buffer, annotation);
                }
            }
            catch (e) {
                if (typeof annotation.length === "number" && annotation.length > 0) {
                    // We can recover and it will be processed later
                    annotation.unresolved = true;

                    // Move on the relative pointer
                    relativeStart = annotation.start + annotation.length - groupOffset;

                    continue;
                }

                throw e;
            }

            while (start < buffer.byteLength && childCount < maxCount) {
                const newAnnotations = processAnnotationTemplates(template.children, buffer, [...annotations, ...outAnnotations], start, depth + 1);
                outAnnotations.push(...newAnnotations);

                const last = newAnnotations[newAnnotations.length - 1];
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
            outAnnotations.push(annotation);
            const newAnnotations = processAnnotationTemplates(template.children, buffer, [...annotations,...outAnnotations], absoluteStart, depth + 1);
            outAnnotations.push(...newAnnotations);

            const last = newAnnotations[newAnnotations.length - 1];
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
                val = resolveReference(template.value, [...annotations, ...outAnnotations], buffer);
            }
            else {
                val = +getAnnotationData(annotation, buffer);
            }

            if (typeof val === "number" || typeof val === "string") {
                const sublist = template.cases[val] || template.cases['default'];
                if (sublist) {
                    const newAnnotations = processAnnotationTemplates(sublist, buffer, [...annotations, ...outAnnotations], annotation.start, depth);
                    outAnnotations.push(...newAnnotations);
                }
            }

            const last = outAnnotations[outAnnotations.length - 1];
            // Set for next loop
            relativeStart = last.start + last.length - groupOffset;
        } else if (template.type === "if") {
            let isTrue = null;

            if (template.condition) {
                isTrue = evaluateExpression(template.condition, [...annotations, ...outAnnotations], buffer);
            } else if (template.value) {
                const val = +getAnnotationData(annotation, buffer);
                isTrue = val === template.value;
            }

            if (typeof isTrue === "boolean") {
                const sublist = isTrue ? template.then : template.else;
                if (sublist) {
                    const newAnnotations = processAnnotationTemplates(sublist, buffer, [...annotations, ...outAnnotations], annotation.start);
                    outAnnotations.push(...newAnnotations);
                }
            }

            const last = outAnnotations[outAnnotations.length - 1];
            // Set for next loop
            relativeStart = last.start + last.length - groupOffset;
        } else if (annotation.length > 0) {
            annotation.color = getAnnotationColor(template);
            outAnnotations.push(annotation);

            const last = outAnnotations[outAnnotations.length - 1];
            // Set for next loop
            relativeStart = last.start + last.length - groupOffset;
        }

        const lbl = typeof annotation.label === "string" ? `[${annotation.label}]` : `<${annotation.type}>`;
        console.debug(`Added ${lbl} start: ${annotation.start} length: ${annotation.length}`);
    }

    return outAnnotations;
}
