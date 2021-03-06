import React from 'react';
import './HexView.css';
import { getAnnotationStyle, getAnnotation } from './annotate/util';

/**
 *
 * @param {{ buffer: ArrayBuffer, annotations: object[], offset?: number, byteLimit?: number }} props
 */
export default function HexView ({ buffer, annotations, offset = 0, byteLimit = 1024 }) {

    if (!buffer) {
        return null;
    }

    const lines = [];
    for (let i = 0; i < buffer.byteLength && i < byteLimit; i += 16) {
        const view = new DataView(buffer, offset + i, Math.min(16, buffer.byteLength - i));
        const line = [];
        for (let j = 0; j < view.byteLength; j++) {
            line.push(view.getUint8(j));
        }
        lines.push(line);
    }

    return (
        <div className="HexView">
            <table >
                <tbody>
                {
                    lines.map((l,i) => <tr key={i*16}>{l.map((x,j) => {
                        const o = i * 16 + j;
                        const a = getAnnotation(annotations, offset + o);
                        const style = getAnnotationStyle(annotations, offset + o);
                        return <td key={j} style={style} title={a && a.label}>{x.toString(16).padStart(2, "0")}</td>;
                    })}</tr>)
                }
                </tbody>
            </table>
        </div>
    );
}