import React from 'react';
import './Annotations.css';
import { getAnnotationData, getAnnotationLength } from './annotate/util';
import { opacity } from './util';
import { ByteSize } from './ByteSize';
import { CryptPermute } from './pst/permute';

/**
 *
 * @param {object} props
 * @param {ArrayBuffer} props.buffer
 * @param {import('./annotate').Annotation[]} props.annotations
 * @param {(offset: number) => void} props.setOffset
 */
export default function Annotations ({ buffer, annotations, setOffset }) {
    if (!buffer || !annotations) {
        return null;
    }

    return (
        <ul className="Annotations">
            {
                annotations.map((a,i) => {
                    try {
                        /** @type {import('react').ReactElement|string|number|BigInt|ArrayBuffer|null} */
                        let data = getAnnotationData(a, buffer);

                        let enumValue;

                        if ((typeof data === "number" || typeof data === "bigint") && a.template.enum) {
                            enumValue = a.template.enum[data.toString()];
                        }

                        if (typeof data === "number" || typeof data === "bigint") {
                            if (a.template.display === "hex") {
                                data = `0x${data.toString(16)}`;
                            }
                            else if (a.template.display === "byteSize") {
                                data = <ByteSize bytes={data} />;
                            }
                            else if (a.template.display === "binary") {
                                const len = getAnnotationLength(a) * 8;
                                data = "0b" + data?.toString(2).padStart(len, "0");
                            }
                            else if (a.template.display === "fileOffset") {
                                const offset = typeof data === "number" ? data : JSON.parse(data.toString());
                                data = <span style={{cursor:"pointer",color:"blue",textDecoration:"underline"}} onClick={e => {e.stopPropagation();setOffset(offset);}}>0x{data.toString(16)}</span>
                            }
                        }
                        else if (data instanceof ArrayBuffer) {
                            if (a.template.display === "binary") {
                                const out = [];
                                const view = new DataView(data);
                                for (let i = 0; i < data.byteLength; i++) {
                                    out.push(view.getUint8(i).toString(2).padStart(8,"0"));
                                }
                                data = `0b${out.join("")}`;
                            }
                            else if (a.template.display === "permute") {
                                CryptPermute(data, data.byteLength, false);

                                const out = [];
                                const view = new DataView(data);
                                for (let i = 0; i < data.byteLength; i++) {
                                    out.push(view.getUint8(i).toString(16).padStart(2,"0"));
                                }
                                data = <><code style={{display:"block"}}>{out.join(" ")}</code>{String.fromCharCode(...new Uint16Array(data))}</>;
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

                        const colour = a.color||"transparent";

                        let backgroundColor = colour;
                        if (backgroundColor.startsWith("#")) {
                            backgroundColor = opacity(backgroundColor, 0.5);
                        }
                        else if (backgroundColor.startsWith("hsl(")) {
                            const match = /hsl\((\d+)deg, (\d+)%, (\d+)%\)/.exec(backgroundColor);
                            if (match) {
                                backgroundColor = `hsl(${match[1]}deg, ${match[2]}%, ${+match[3] + 25}%)`;
                            }
                        }

                        return (
                            <li
                                key={i}
                                style={{
                                    borderColor: colour,
                                    backgroundColor,
                                    marginLeft: (a.depth||0)*16
                                }}
                                onClick={() => setOffset(a.start)}
                                title={a.id}
                            >
                                { title }
                            </li>
                        );
                    }
                    catch (e) {
                        return (
                            <li
                                key={i}
                                style={{
                                    borderColor: "red",
                                    marginLeft: (a.depth||0)*16
                                }}
                                title={a.id}
                            >
                                Error: Unable to get annotation data
                            </li>
                        );
                    }
                })
            }
        </ul>
    );
}
