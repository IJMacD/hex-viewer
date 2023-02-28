import React, { useEffect, useState } from 'react';
import HexView from './HexView';
import Annotations from './Annotations';
import { findFormatTemplate, getAnnotations } from './annotate';
import BMP from './preview/BMP';
import TXT from './preview/TXT';
import './App.css';
import AnnotationEditor from './AnnotationEditor';

export default function App () {
    const [ buffer, setBuffer ] = useState(null);
    const [ format, setFormat ] = useState(null);
    const [ annotations, setAnnotations ] = useState([]);
    const [ base64, setBase64 ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ annotationEditMode, setAnnotationEditMode ] = useState(false);
    const [ template, setTemplate ] = useState(null);
    const [ offsetText, setOffsetText ] = useState("0");

    /** @param {import('react').SyntheticEvent<HTMLInputElement>} e */
    function handleFileChange (e) {
        const files = e.currentTarget.files;

        if (files.length) {
            setBuffer(null);
            setFormat(null);
            setAnnotations(null);
            setLoading(true);

            const reader = new FileReader();

            reader.addEventListener("load", e => {
                if (typeof e.target.result === "string") return;

                const buffer = e.target.result;

                setBuffer(buffer);
                setLoading(false);
            });

            reader.readAsArrayBuffer(files[0]);
        }
    }

    function handleBase64Change (e) {
        const base64 = e.target.value;
        setBase64(base64);
        try {
            const decoded = atob(base64);
            const buffer = new ArrayBuffer(decoded.length);
            const view = new DataView(buffer);
            for (let i = 0; i < decoded.length; i++) {
                view.setUint8(i, decoded.charCodeAt(i));
            }
            setBuffer(buffer);
        } catch (e) {}
    }

    useEffect(() => {
        if (buffer) {
            const template = findFormatTemplate(buffer);
            setTemplate(template);
        }

        if (buffer && template) {
            const annotations = getAnnotations(template, buffer);
            setAnnotations(annotations);
        }

    }, [buffer, template]);

    const byteLimit = 1024;
    const offset = parseInt(offsetText, 16) || 0;
    let preview;

    if (format === "BMP") {
        preview = <BMP buffer={buffer} />;
    }
    else {
        preview = <TXT buffer={buffer} offset={offset} byteLimit={byteLimit} annotations={annotations} />;
    }

    return (
        <div className="App">
            <div className="input">
                <label>File Input<br/>
                    <input type="file" id="file-input" onChange={handleFileChange} />
                </label>
                <label>Base64 Input<br/>
                    <textarea value={base64} onChange={handleBase64Change} />
                </label>
                <div>
                    <button onClick={() => setAnnotationEditMode(m => !m)}>
                        Edit Annotations
                    </button>
                </div>
            </div>
            <div className="App-panels">
                { loading && <p>Loading...</p> }
                { buffer &&
                    <div style={{ flex: 1 }}>
                        <h1>Hex</h1>
                        <div>
                            <button onClick={() => setOffsetText((offset - byteLimit).toString(16))} disabled={offset < byteLimit}>&lt;</button>
                            0x<input value={offset.toString(16)} onChange={e => setOffsetText(e.target.value)} />
                            <button onClick={() => setOffsetText((offset + byteLimit).toString(16))}>&gt;</button>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <HexView buffer={buffer} offset={offset} byteLimit={byteLimit} annotations={annotations} />
                            {preview}
                        </div>
                    </div>
                }
                { annotations && annotations.length > 0 &&
                    <div style={{  }}>
                        <h1>Annotations</h1>
                        <Annotations buffer={buffer} annotations={annotations} setOffset={offset => setOffsetText(offset.toString(16))} />
                    </div>
                }
                {
                    annotationEditMode &&
                    <div style={{  }}>
                        <h1>Template Editor</h1>
                        <AnnotationEditor template={template} setTemplate={template => { setTemplate(template); setAnnotations(getAnnotations(template, buffer)); }} />
                    </div>
                }
            </div>
        </div>
    );
}