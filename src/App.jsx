import React from 'react';
import HexView from './HexView';
import Annotations from './Annotations';
import { findFormatTemplate, getAnnotations } from './annotate';
import BMP from './preview/BMP';
import TXT from './preview/TXT';
import './App.css';
import AnnotationEditor from './AnnotationEditor';

export default class App extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            buffer: null,
            format: null,
            annotations: [],
            error: null,
            base64: "",
            loading: false,
            annotationEditMode: false,
            template: null,
            offsetText: "0",
        }
    }

    /** @param {import('react').SyntheticEvent<HTMLInputElement>} e */
    handleFileChange (e) {
        const files = e.currentTarget.files;

        if (files.length) {
            this.setState({ buffer: null, format: null, annotation: null, loading: true });

            const reader = new FileReader();

            reader.addEventListener("load", e => {
                if (typeof e.target.result === "string") return;

                const buffer = e.target.result;

                this.setState({ buffer, loading: false });
            });

            reader.readAsArrayBuffer(files[0]);
        }
    }

    handleBase64Change (e) {
        const base64 = e.target.value;
        this.setState({ base64 });
        try {
            const decoded = atob(base64);
            const buffer = new ArrayBuffer(decoded.length);
            const view = new DataView(buffer);
            for (let i = 0; i < decoded.length; i++) {
                view.setUint8(i, decoded.charCodeAt(i));
            }
            this.setState({ buffer });
        } catch (e) {}
    }

    componentDidUpdate (oldProps, oldState) {
        if (oldState.buffer !== this.state.buffer && this.state.buffer) {
            const template = findFormatTemplate(this.state.buffer);
            this.setState({ template });
        }

        if (oldState.buffer !== this.state.buffer || oldState.template !== this.state.template) {

            if (this.state.buffer && this.state.template) {
                const annotations = getAnnotations(this.state.template, this.state.buffer);
                this.setState({ annotations });
            }

        }
    }

    componentDidCatch (error) {
        this.setState({ error });
    }

    render () {
        const { buffer, annotations, base64, loading, annotationEditMode, template, offsetText } = this.state;
        const byteLimit = 1024;
        const offset = parseInt(offsetText) || 0;
        let preview;

        const setOffsetText = (offsetText) => {
            this.setState({ offsetText });
        };

        if (this.state.error) {
            preview = <p>Error: { this.state.error.message }</p>;
        }
        else if (this.state.format === "BMP") {
            preview = <BMP buffer={buffer} />;
        }
        else {
            preview = <TXT buffer={buffer} offset={offset} byteLimit={byteLimit} annotations={annotations} />;
        }

        return (
            <div className="App">
                <div className="input">
                    <label>File Input<br/>
                        <input type="file" id="file-input" onChange={this.handleFileChange.bind(this)} />
                    </label>
                    <label>Base64 Input<br/>
                        <textarea value={base64} onChange={this.handleBase64Change.bind(this)} />
                    </label>
                    <div>
                        <button onClick={() => this.setState({ annotationEditMode: !annotationEditMode })}>
                            Edit Annotations
                        </button>
                    </div>
                </div>
                <div className="App-panels">
                    { loading && <p>Loading...</p> }
                    { buffer &&
                        <div style={{ flex: 1, margin: 8 }}>
                            <h1>Hex</h1>
                            <div>
                                <button onClick={() => setOffsetText((offset - byteLimit).toString())} disabled={offset < byteLimit}>&lt;</button>
                                <input value={offset} onChange={e => setOffsetText(e.target.value)} />
                                <button onClick={() => setOffsetText((offset + byteLimit).toString())}>&gt;</button>
                            </div>
                            <div style={{ height: "100%", maxHeight: 1000, overflowY: "auto", display: "flex", flex: 1 }}>
                                <HexView buffer={buffer} offset={offset} byteLimit={byteLimit} annotations={annotations} />
                                {preview}
                            </div>
                        </div>
                    }
                    { annotations && annotations.length > 0 &&
                        <div style={{ flex: 1, margin: 8 }}>
                            <h1>Annotations</h1>
                            <Annotations buffer={buffer} annotations={annotations} />
                        </div>
                    }
                    {
                        annotationEditMode &&
                        <div style={{ flex: 1, margin: 8, overflowY: "auto" }}>
                            <h1>Annotation Editor</h1>
                            <AnnotationEditor template={template} setTemplate={template => this.setState({ template, annotations: getAnnotations(template, buffer) })} />
                        </div>
                    }
                </div>
            </div>
        )
    }
}