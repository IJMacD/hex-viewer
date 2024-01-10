import React from 'react';

import './TXT.css'
import { getAnnotation, getAnnotationStyle } from '../annotate/util';

/**
 *
 * @param {{ buffer: ArrayBuffer, annotations?: import('../annotate').Annotation[], offset?: number, byteLimit?: number }} props
 */
export default function TXT ({ buffer, annotations = [], offset = 0, byteLimit = 1024 }) {
    if (!buffer) {
        return null;
    }

    const lines = [];
    for (let i = 0; i + offset < buffer.byteLength && i < byteLimit; i += 16) {
        const view = new DataView(buffer, offset + i, Math.min(16, buffer.byteLength - offset - i));
        const line = [];
        for (let j = 0; j < view.byteLength; j++) {
            line.push(String.fromCharCode(view.getUint8(j)));
        }
        lines.push(line);
    }

    const asciiAnnotations = annotations ?
        annotations.filter(a => a.type === "ASCII" || a.type === "UTF-8")
        : [];

    return (
        <table className="TXTPreview">
            <tbody>
            {
                lines.map((l,i) => <tr key={i*16}>{l.map((x,j) => {
                    const o = i * 16 + j;
                    const a = getAnnotation(asciiAnnotations, offset + o);
                    const style = getAnnotationStyle(asciiAnnotations, offset + o);
                    return <td key={j} style={style} title={a && a.label}>{x}</td>;
                })}</tr>)
            }
            </tbody>
        </table>
    );
}
