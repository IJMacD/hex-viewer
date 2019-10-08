import React from 'react';
import './Annotations.css';
import { getAnnotationData } from './annotate/util';
import { opacity } from './util';

/**
 * 
 * @param {{ buffer: ArrayBuffer, annotations: object[] }} props 
 */
export default function Annotations ({ buffer, annotations }) {
    if (!buffer || !annotations) {
        return null;
    }
    
    return (
        <ul className="Annotations">
            {
                annotations.map((a,i) => {
                    let data = getAnnotationData(a, buffer);
                    if (a.display === "hex") {
                        data = `0x${data.toString(16)}`;
                    } else if (a.display === "binary" && data instanceof ArrayBuffer) {
                        const out = [];
                        const view = new DataView(data);
                        for (let i = 0; i < data.byteLength; i++) {
                            out.push(view.getUint8(i).toString(2).padStart(8,"0"));
                        }
                        data = `0b${out.join("")}`;
                    }
                    return (
                        <li key={i} style={{ borderColor: a.color, backgroundColor: opacity(a.color, 0.5) }}>
                            { typeof data !== "undefined" ? `${a.label}: ${data}` : `${a.label} (length: ${a.length})` }
                        </li>
                    );
                })
            }
        </ul>
    );
}
