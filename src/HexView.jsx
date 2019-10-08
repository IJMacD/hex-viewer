import React from 'react';
import './HexView.css';
import { opacity } from './util';

/**
 * 
 * @param {{ buffer: ArrayBuffer, annotations: object[] }} props 
 */
export default function HexView ({ buffer, annotations }) {
    if (!buffer) {
        return null;
    }

    const lines = [];
    for (let i = 0; i < buffer.byteLength; i += 16) {
        const view = new DataView(buffer, i, Math.min(16, buffer.byteLength - i));
        const line = [];
        for (let j = 0; j < view.byteLength; j++) {
            line.push(view.getUint8(j));
        }
        lines.push(line);
    }

    return (
        <table className="HexView">
            <tbody>
            {
                lines.map((l,i) => <tr key={i*16}>{l.map((x,j) => {
                    const style = {};
                    const offset = i * 16 + j;
                    const a = getAnnotation(annotations, offset)
                    if (a) {
                        const end = a.start + a.length - 1;
                        style.borderStyle = "solid";
                        style.borderColor = a.color;
                        style.backgroundColor = opacity(a.color, 0.5);
                        style.borderLeftWidth = (offset === a.start || offset % 16 === 0) ? 1 : 0;
                        style.borderRightWidth = (offset === end || offset % 16 === 15) ? 1 : 0;
                        style.borderTopWidth = (Math.floor(offset / 16) == Math.floor(a.start / 16)) ? 1 : 0;
                        style.borderBottomWidth = (Math.floor(offset / 16) == Math.floor(end / 16)) ? 1 : 0;;
                    }
                    return <td key={j} style={style} title={a && a.label}>{x.toString(16).padStart(2, "0")}</td>;
                })}</tr>)
            }
            </tbody>
        </table>
    );
}

function getAnnotation (annotations, offset) {
    return annotations && annotations.find(a => offset >= a.start && offset < a.start + a.length);
}
