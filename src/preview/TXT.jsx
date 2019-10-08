import React from 'react';

/**
 *
 * @param {{ buffer: ArrayBuffer }} props
 */
export default function TXT ({ buffer }) {
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

    return (
        <table style={{ fontFamily: "monospace", borderSpacing: 0 }}>
            <tbody>
            {
                lines.map((l,i) => <tr key={i*16}>{l.map((x,j) => {
                    return <td key={j}>{x}</td>;
                })}</tr>)
            }
            </tbody>
        </table>
    );
}

function getAnnotation (annotations, offset) {
    return annotations && annotations.find(a => offset >= a.start && offset < a.start + a.length);
}
