import React, { useEffect, useState } from 'react';
import HexView from './HexView';
import Annotations from './Annotations';
import { findFormat, findFormatTemplate, getAnnotations } from './annotate';
import BMP from './preview/BMP';
import HexTXT from './preview/HexTXT';
import './App.css';
import AnnotationEditor from './AnnotationEditor';
import PCX from './preview/PCX';
import JPG from './preview/JPG';
import PDF from './preview/PDF';
import ErrorBoundary from './ErrorBoundary';
import TXT from './preview/TXT';

export default function App () {
    const [ buffer, setBuffer ] = useState(/** @type {ArrayBuffer?} */(null));
    const [ format, setFormat ] = useState(/** @type {string?} */(null));
    const [ annotations, setAnnotations ] = useState(/** @type {import('./annotate').Annotation[]} */([]));
    const [ base64, setBase64 ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ annotationEditMode, setAnnotationEditMode ] = useState(false);
    const [ template, setTemplate ] = useState(/** @type {import('./annotate').AnnotationTemplate[]?} */(null));
    const [ offsetText, setOffsetText ] = useState("0");
    const [ selectedPreview, setSelectedPreview ] = useState("None");

    /** @param {import('react').SyntheticEvent<HTMLInputElement>} e */
    function handleFileChange (e) {
        const files = e.currentTarget.files;

        if (files && files.length) {
            setBuffer(null);
            setFormat(null);
            setAnnotations([]);
            setLoading(true);

            const reader = new FileReader();

            reader.addEventListener("load", e => {
                if (e.target) {
                    if (typeof e.target.result === "string") return;

                    const buffer = e.target.result;

                    setBuffer(buffer);
                    setLoading(false);
                }
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

    // Automatic template matching
    useEffect(() => {
        if (buffer) {
            const template = findFormatTemplate(buffer);
            if (template) {
                setTemplate(template);
            }

            const format = findFormat(buffer);
            if (format) {
                setFormat(format);
            }
        }
        else {
            setTemplate(null);
            setFormat(null);
            setSelectedPreview("None");
        }
    }, [buffer]);

    // Use template to get annotations
    useEffect(() => {
        if (buffer && template) {
            const annotations = getAnnotations(template, buffer);
            setAnnotations(annotations);
        }
        else {
            setAnnotations([]);
        }

    }, [buffer, template]);

    const byteLimit = 1024;
    const offset = parseInt(offsetText, 16) || 0;
    let preview;
    let wideHexPanel = false;

    const availablePreviews = ["None","TXT","BMP","PCX","JPG","PDF"].filter(f => f === "None" || f === "TXT" || f === format);

    if (buffer) {
        if (selectedPreview === "BMP") {
            preview = <BMP buffer={buffer} />;
        }
        else if (selectedPreview === "PCX") {
            preview = <PCX buffer={buffer} />;
        }
        else if (selectedPreview === "JPG") {
            preview = <JPG buffer={buffer} />;
        }
        else if (selectedPreview === "PDF") {
            preview = <PDF buffer={buffer} />;
        }
        else if (selectedPreview === "TXT") {
            preview = <TXT buffer={buffer} />;
        }
        else {
            wideHexPanel = true;
        }
    }

    // wideHexPanel = preview?.type == TXT;

    return (
        <div className="App">
            { !buffer && !loading &&
                <div className="input">
                    <h1>HexViewer</h1>
                    <label>File Input<br/>
                        <input type="file" id="file-input" onChange={handleFileChange} />
                    </label>
                    <label>Base64 Input<br/>
                        <textarea value={base64} onChange={handleBase64Change} />
                    </label>
                </div>
            }
            { buffer &&
                <div style={{margin: "0 1em"}}>
                    <b>File</b>
                    <dl style={{display: 'inline-block', marginBlock: 0, fontFamily: "monospace"}}>
                        <dt style={{display: 'inline', fontWeight: "bold", marginInline: "1em"}}>Size:</dt>
                        <dd style={{display: 'inline'}}>{buffer.byteLength} bytes</dd>
                        { format && <>
                            <dt style={{display: 'inline', fontWeight: "bold", marginInline: "1em"}}>Matched Format:</dt>
                            <dd style={{display: 'inline'}}>{format}</dd>
                        </>
                        }
                    </dl>
                    <div style={{display: 'inline-block', marginInlineStart: "1em"}}>
                        <button onClick={() => setBuffer(null)}>Close</button>
                        <button onClick={() => setAnnotationEditMode(m => !m)}>
                            Edit Annotations
                        </button>{' '}
                        {
                            availablePreviews.length > 0 &&
                            <>
                                Preview:{' '}
                                {
                                    availablePreviews.map((label, i) => <button key={i} onClick={() => setSelectedPreview(label)} disabled={label === selectedPreview}>{label}</button>)
                                }
                            </>
                        }
                    </div>
                </div>
            }
            <div className="App-panels">
                { loading && <p>Loading...</p> }
                { buffer &&
                    <div className="panel" style={{ padding:"0 1em", flex: wideHexPanel ? "0 0 35em" : "0 0 22em" }}>
                        <h1>Hex</h1>
                        <div>
                            <button onClick={() => setOffsetText("0")} disabled={offset == 0}>&lt;&lt;</button>
                            <button onClick={() => setOffsetText((offset - byteLimit).toString(16))} disabled={offset < byteLimit}>&lt;</button>
                            0x<input value={offset.toString(16)} onChange={e => setOffsetText(e.target.value)} />
                            <button onClick={() => setOffsetText((offset + byteLimit).toString(16))} disabled={offset + byteLimit > buffer.byteLength}>&gt;</button>
                            <button onClick={() => setOffsetText((Math.floor(buffer.byteLength / byteLimit) * byteLimit).toString(16))} disabled={offset + byteLimit > buffer.byteLength}>&gt;&gt;</button>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <HexView buffer={buffer} offset={offset} byteLimit={byteLimit} annotations={annotations} />
                            { selectedPreview === "None" &&
                                <ErrorBoundary>
                                    <HexTXT buffer={buffer} offset={offset} byteLimit={byteLimit} annotations={annotations} />;
                                </ErrorBoundary>
                            }
                        </div>
                    </div>
                }
                { annotations && annotations.length > 0 && buffer &&
                    <div className="panel" style={{padding:"0 1em"}}>
                        <h1>Annotations</h1>
                        <Annotations buffer={buffer} annotations={annotations} setOffset={offset => setOffsetText((Math.floor(offset/16)*16).toString(16))} />
                    </div>
                }
                {
                    annotationEditMode && buffer &&
                    <div className="panel" style={{padding:"0 1em"}}>
                        <h1>Template Editor</h1>
                        <AnnotationEditor template={template} setTemplate={setTemplate} />
                    </div>
                }
                { buffer && preview &&
                    <div className="panel" style={{padding:"0 1em"}}>
                        <ErrorBoundary>
                            {preview}
                        </ErrorBoundary>
                    </div>
                }
            </div>
        </div>
    );
}