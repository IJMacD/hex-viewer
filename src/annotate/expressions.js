
/**
 * @typedef {import(".").Annotation} Annotation
 */

import { getAnnotationData } from "./util";

/**
 *
 * @param {number|string|object} expr
 * @param {Annotation[]} annotations
 * @param {ArrayBuffer} buffer
 * @param {Annotation?} [self]
 * @returns {number|string|boolean|ArrayBuffer}
 */
export function evaluateExpression (expr, annotations, buffer, self=null) {
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
export function resolveReference (reference, annotations, buffer, self=null) {
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

        if (type === "value") {
            const data = getAnnotationData(ref, buffer);
            if (data === null) {
                throw Error(`Unable to resolve reference '${reference}'`);
            }
            if (typeof data === "bigint") {
                return Number.parseInt(data.toString());
            }
            return data;
        }
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
