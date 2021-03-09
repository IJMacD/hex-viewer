import React from 'react';
import HexView from './HexView';
import Annotations from './Annotations';
import { findFormat } from './annotate';
import BMP from './preview/BMP';
import TXT from './preview/TXT';
import './App.css';

export default class App extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            buffer: null,
            format: null,
            annotations: null,
            error: null,
            base64: "",
            loading: false,
        }
    }

    /** @this {HTMLInputElement} */
    handleFileChange (e) {
        const files = e.target.files;

        if (files.length) {
            this.setState({ buffer: null, format: null, annotation: null, loading: true });

            const reader = new FileReader();

            reader.addEventListener("load", e => {
                if (typeof e.target.result === "string") return;

                const buffer = e.target.result;
                const { format, annotations } = findFormat(buffer) || { format: null, annotations: [] };

                this.setState({ buffer, format, annotations, loading: false });
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
            const { format, annotations } = findFormat(buffer) || { format: null, annotations: [] };
            this.setState({ buffer, format, annotations });
        } catch (e) {}
    }

    componentDidCatch (error) {
        this.setState({ error });
    }

    render () {
        const { buffer, annotations, base64, loading } = this.state;
        let preview;

        if (this.state.error) {
            preview = <p>Error: { this.state.error.message }</p>;
        }
        else if (this.state.format === "BMP") {
            preview = <BMP buffer={buffer} />;
        }
        else {
            preview = <TXT buffer={buffer} annotations={annotations} />;
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
                </div>
                <div className="App-panels">
                    { loading && <p>Loading...</p> }
                    { buffer &&
                        <div style={{ flex: 1, margin: 8 }}>
                            <h1>Hex</h1>
                            <div style={{ height: "100%", maxHeight: 1000, overflowY: "auto", display: "flex", flex: 1 }}>
                                <HexView buffer={buffer} annotations={annotations} />
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
                </div>
            </div>
        )
    }
}