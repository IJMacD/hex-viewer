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
        }
    }

    /** @this {HTMLInputElement} */
    handleChange (e) {
        const files = e.target.files;

        if (files.length) {
            const reader = new FileReader();
            reader.addEventListener("load", e => {
                if (typeof e.target.result === "string") return;

                const buffer = e.target.result;
                let { format, annotations } = findFormat(buffer) || { format: null, annotations: [] };

                this.setState({ buffer, format, annotations });
            });
            reader.readAsArrayBuffer(files[0]);
        }
    }

    componentDidCatch (error) {
        this.setState({ error });
    }

    render () {
        const { buffer, annotations } = this.state;
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
                <input type="file" id="file-input" onChange={this.handleChange.bind(this)} />
                <div className="App-panels">
                    <div style={{ flex: 1, margin: 8 }}>
                        <h1>Hex</h1>
                        <div style={{ height: "100%", overflowY: "auto", display: "flex" }}>
                            <HexView buffer={buffer} annotations={annotations} />
                            {preview}
                        </div>
                    </div>
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