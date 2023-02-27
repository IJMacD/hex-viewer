import React from 'react';
import './Annotations.css';
import { getAnnotationData, getAnnotationLength } from './annotate/util';
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
                    } else if (data instanceof ArrayBuffer) {
                        if (a.display === "binary") {
                            const out = [];
                            const view = new DataView(data);
                            for (let i = 0; i < data.byteLength; i++) {
                                out.push(view.getUint8(i).toString(2).padStart(8,"0"));
                            }
                            data = `0b${out.join("")}`;
                        }
                        else if (data.byteLength < 10) {
                            const out = [];
                            const view = new DataView(data);
                            for (let i = 0; i < data.byteLength; i++) {
                                out.push(view.getUint8(i).toString(16).padStart(2,"0"));
                            }
                            data = `0x${out.join("")}`;
                        }
                        else {
                            data = null;
                        }
                    } else if (a.display === "binary") {
                        const len = getAnnotationLength(a) * 8;
                        data = "0b" + data?.toString(2).padStart(len, "0");
                    }

                    const { label = "" } = a;

                    return (
                        <li key={i} style={{ borderColor: a.color, backgroundColor: opacity(a.color, 0.5), marginLeft: a.depth*16 }}>
                            { data !== null ? `${label}: ${data}` : (
                                a.length > 0 ? `${label} (length: ${a.length})` : label
                            ) }
                        </li>
                    );
                })
            }
        </ul>
    );
}
