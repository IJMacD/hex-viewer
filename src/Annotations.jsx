import React from 'react';
import './Annotations.css';
import { getAnnotationData, getAnnotationLength } from './annotate/util';
import { opacity } from './util';
import { ByteSize } from './ByteSize';

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
                    /** @type {import('react').ReactElement|string|number|BigInt|ArrayBuffer|null} */
                    let data = getAnnotationData(a, buffer);

                    let enumValue;

                    if ((typeof data === "number" || typeof data === "bigint") && a.enum) {
                        enumValue = a.enum[data.toString()];
                    }

                    if (typeof data === "number" || typeof data === "bigint") {
                        if (a.display === "hex") {
                            data = `0x${data.toString(16)}`;
                        }
                        else if (a.display === "byteSize") {
                            data = <ByteSize bytes={data} />;
                        }
                        else if (a.display === "binary") {
                            const len = getAnnotationLength(a) * 8;
                            data = "0b" + data?.toString(2).padStart(len, "0");
                        }
                    }
                    else if (data instanceof ArrayBuffer) {
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
                    }

                    const { label = "" } = a;

                    let title = label;

                    if (typeof data === "string" || typeof data === "number" || typeof data === "bigint") {
                        title = `${label}: ${data}`;
                    }
                    else if (React.isValidElement(data)) {
                        title = <>{label}: {data}</>;
                    }
                    else if (a.count > 0) {
                        title = `${label} (count: ${a.count})`;
                    }
                    else if (a.length > 0) {
                        title = `${label} (length: ${a.length})`;
                    }

                    if (enumValue) {
                        title = <>{title} <code style={{color: "#333"}}>{enumValue}</code></>;
                    }

                    return (
                        <li key={i} style={{ borderColor: a.color, backgroundColor: opacity(a.color, 0.5), marginLeft: a.depth*16 }}>
                            { title }
                        </li>
                    );
                })
            }
        </ul>
    );
}
