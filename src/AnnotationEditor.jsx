import React, { useState } from "react";
import "./AnnotationEditor.css";

const types = [ "bytes", "ASCII", "UTF-8", "Uint8", "Uint16", "Uint32", "Uint64" ];

export default function AnnotationEditor ({ template = [], setTemplate }) {

    function handleRemove (index) {
        setTemplate([ ...template.slice(0, index), ...template.slice(index + 1) ]);
    }

    function handleNewAnnotation (newAnnotation) {
        setTemplate([ ...(template||[]), newAnnotation ]);
    }

    function handleExport () {
        console.log(JSON.stringify(template));
        alert("Written to console");
    }

    return (
        <div className="AnnotationEditor">
            {
                (template||[]).map((a,i) => <Annotation key={i} annotation={a} onRemove={() => handleRemove(i)} />)
            }
            <NewAnnotation addAnnotation={handleNewAnnotation} />
            <button onClick={handleExport}>Export</button>
        </div>
    );
}

function Annotation ({ annotation, onRemove }) {
    if (annotation.children) {
        return (
            <div style={{ border: "1px solid #ccc", padding: 4, position: "relative" }}>
                {annotation.label}
                <button onClick={onRemove} style={{ position: "absolute", top: 8, right: 8 }}>Remove</button>
            </div>
        );
    }

    return (
        <div style={{ border: "1px solid #ccc", padding: 4, position: "relative" }}>
            <dl>
                {
                    Object.entries(annotation).filter(ddFilter).map(([key, value]) => (
                        <>
                            <dt>{ key }</dt>
                            <dd>{ value }</dd>
                        </>
                    ))
                }
            </dl>
            <button onClick={onRemove} style={{ position: "absolute", top: 8, right: 8 }}>Remove</button>
        </div>
    );
}

function ddFilter ([key, value]) {
    return typeof value === "string"
        || typeof value === "number"
        || (typeof value === "boolean" && value);
}

function NewAnnotation ({ addAnnotation }) {
    const [ label, setLabel ] = useState("");
    const [ type, setType ] = useState("");
    const [ start, setStart ] = useState(0);
    const [ length, setLength ] = useState(0);
    const [ enableStart, setEnableStart ] = useState(false);
    const [ enableLength, setEnableLength ] = useState(false);
    const [ littleEndian, setLittleEndian ] = useState(false);

    function handleAdd () {
        addAnnotation({
            label,
            type,
            start: enableStart ? start : void 0,
            length: enableLength ? length : void 0,
            littleEndian: littleEndian || void 0,
        });
        setLabel("");
        // setStart(0);
        // setLength(0);
        // setEnableStart(false);
        // setEnableLength(false);
    }

    return (
        <div>
            <label>Label
                <input value={ label } onChange={e => setLabel(e.target.value)} />
            </label>
            <label>Type
                <select value={ type } onChange={e => setType(e.target.value)}>
                    {
                        types.map(t => <option key={t} value={t}>{t}</option>)
                    }
                </select>
            </label>
            <label>Start
                <input type="checkbox" checked={enableStart} onChange={e => setEnableStart(e.target.checked)} />
                <input value={ start } onChange={e => setStart(+e.target.value)} type="number" disabled={!enableStart} />
            </label>
            <label>Length
                <input type="checkbox" checked={enableLength} onChange={e => setEnableLength(e.target.checked)} />
                <input value={ length } onChange={e => setLength(+e.target.value)} type="number" disabled={!enableLength} />
            </label>
            <label>Little Endian
                <input type="checkbox" checked={littleEndian} onChange={e => setLittleEndian(e.target.checked)} />
            </label>
            <button onClick={handleAdd}>Add</button>
        </div>
    );
}