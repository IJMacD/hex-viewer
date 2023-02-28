import React, { useState } from "react";
import "./AnnotationEditor.css";

const types = [ "bytes", "ASCII", "UTF-8", "Uint8", "Uint16", "Uint32", "Uint64" ];

export default function AnnotationEditor ({ template = [], setTemplate }) {
    const [ editIndex, setEditIndex ] = useState(-1);

    function handleRemove (index) {
        setTemplate([ ...template.slice(0, index), ...template.slice(index + 1) ]);
    }

    function handleNewAnnotation (newAnnotation) {
        setTemplate([ ...(template||[]), newAnnotation ]);
    }

    function handleSave (annotation, index) {
        setTemplate([ ...template.slice(0, index), annotation, ...template.slice(index + 1) ]);
        setEditIndex(-1);
    }

    function handleExport () {
        console.log(JSON.stringify(template));
        alert("Written to console");
    }

    function handleSubEdit (index, children) {
        const annotation = { ...template[index], children };
        setTemplate([ ...template.slice(0, index), annotation, ...template.slice(index + 1) ]);
    }

    return (
        <div className="AnnotationEditor">
            {
                (template||[]).map((a,i) => {
                    if (i === editIndex) {
                        return <EditAnnotation key={i} annotation={a} addAnnotation={a => handleSave(a, i)} onCancel={() => setEditIndex(-1)} />;
                    }
                    return <Annotation key={i} annotation={a} onRemove={() => handleRemove(i)} onEdit={() => setEditIndex(i)} editChildren={children => handleSubEdit(i, children)} />;
                })
            }
            <EditAnnotation addAnnotation={handleNewAnnotation} />
            <button onClick={handleExport}>Export</button>
        </div>
    );
}

function Annotation ({ annotation, onRemove, onEdit, editChildren }) {
    if (annotation.children) {
        return (
            <div className="AnnotationEditor-Annotation">
                <p>{annotation.label}</p>
                <AnnotationEditor template={annotation.children} setTemplate={editChildren} />
                <button onClick={onRemove} style={{ position: "absolute", top: 8, right: 8 }}>Remove</button>
            </div>
        );
    }

    return (
        <div className="AnnotationEditor-Annotation">
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
            <button onClick={onEdit} style={{ position: "absolute", top: 32, right: 8 }}>Edit</button>
            <button onClick={onRemove} style={{ position: "absolute", top: 8, right: 8 }}>Remove</button>
        </div>
    );
}

function ddFilter ([key, value]) {
    return typeof value === "string"
        || typeof value === "number"
        || (typeof value === "boolean" && value);
}

/**
 *
 * @param {object} props
 * @param {(object) => void} props.addAnnotation
 * @param {import("./annotate").Annotation} [props.annotation]
 * @param {() => void} [props.onCancel]
 * @returns
 */
function EditAnnotation ({ addAnnotation, annotation, onCancel }) {
    const [ label, setLabel ] = useState(annotation?.label || "");
    const [ id, setID ] = useState(annotation?.id || "");
    const [ type, setType ] = useState(annotation?.type || "");
    const [ start, setStart ] = useState(annotation?.start || 0);
    const [ length, setLength ] = useState(annotation?.length || 0);
    const [ enableStart, setEnableStart ] = useState(typeof annotation?.start === "number");
    const [ enableLength, setEnableLength ] = useState(typeof annotation?.length === "number");
    const [ littleEndian, setLittleEndian ] = useState(typeof annotation?.littleEndian === "boolean");

    function handleAdd () {
        addAnnotation({
            label,
            id: id || void 0,
            type,
            start: enableStart ? start : void 0,
            length: enableLength ? length : void 0,
            littleEndian: littleEndian || void 0,
        });
        setLabel("");
        setID("");
    }

    return (
        <div className="AnnotationEditor-EditAnnotation">
            <label><span>Label</span>
                <input value={ label } onChange={e => setLabel(e.target.value)} />
            </label>
            <label><span>Type</span>
                <select value={ type } onChange={e => setType(e.target.value)}>
                    {
                        types.map(t => <option key={t} value={t}>{t}</option>)
                    }
                </select>
            </label>
            <label><span>ID</span>
                <input value={ id } onChange={e => setID(e.target.value)} />
            </label>
            <label><span>Start</span>
                <input type="checkbox" checked={enableStart} onChange={e => setEnableStart(e.target.checked)} />
                <input value={ start } onChange={e => setStart(+e.target.value)} type="number" disabled={!enableStart} />
            </label>
            <label><span>Length</span>
                <input type="checkbox" checked={enableLength} onChange={e => setEnableLength(e.target.checked)} />
                <input value={ length } onChange={e => setLength(+e.target.value)} type="number" disabled={!enableLength} />
            </label>
            <label><span>Little Endian</span>
                <input type="checkbox" checked={littleEndian} onChange={e => setLittleEndian(e.target.checked)} />
            </label>
            <div style={{textAlign:"right"}}>
                { onCancel && <button onClick={onCancel}>Cancel</button> }
                <button onClick={handleAdd}>{annotation?"Save":"Add"}</button>
            </div>
        </div>
    );
}