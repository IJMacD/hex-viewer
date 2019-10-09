import React from 'react';

import './TXT.css'
import { getAnnotation, getAnnotationStyle } from '../annotate/util';

/**
 *
 * @param {{ buffer: ArrayBuffer, annotations: import('../annotate').Annotation[] }} props
 */
export default function TXT ({ buffer, annotations }) {
    if (!buffer) {
        return null;
    }

    const lines = [];
    for (let i = 0; i < buffer.byteLength; i += 16) {
        const view = new DataView(buffer, i, Math.min(16, buffer.byteLength - i));
        const line = [];
        for (let j = 0; j < view.byteLength; j++) {
            line.push(String.fromCharCode(view.getUint8(j)));
        }
        lines.push(line);
    }

    const asciiAnnotations = annotations.filter(a => a.type === "ASCII" || a.type === "UTF-8");

    return (
        <table className="TXTPreview">
            <tbody>
            {
                lines.map((l,i) => <tr key={i*16}>{l.map((x,j) => {
                    const offset = i * 16 + j;
                    const a = getAnnotation(asciiAnnotations, offset);
                    const style = getAnnotationStyle(asciiAnnotations, offset);
                    return <td key={j} style={style} title={a && a.label}>{x}</td>;
                })}</tr>)
            }
            </tbody>
        </table>
    );
}
