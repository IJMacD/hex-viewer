import React from 'react';
import BMP from './preview/BMP';
import HexView from './HexView';
import Annotations from './Annotations';
import { findFormat } from './annotate';
import TXT from './preview/TXT';

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
        let output;

        if (this.state.error) {
            output = <p>Error: { this.state.error.message }</p>;
        }
        else if (this.state.format === "BMP") {
            output = <BMP buffer={buffer} />;
        }
        else if (this.state.format === "TXT") {
            output = <TXT buffer={buffer} />;
        }

        return (
            <div>
                <input type="file" id="file-input" onChange={this.handleChange.bind(this)} />
                <div style={{ display: "flex" }}>
                    <div style={{ flex: 1, margin: 8 }}>
                        <h1>Hex</h1>
                        <HexView buffer={buffer} annotations={annotations} />
                    </div>
                    <div style={{ flex: 1, margin: 8 }}>
                        <h1>Annotations</h1>
                        <Annotations buffer={buffer} annotations={annotations} />
                    </div>
                    <div style={{ flex: 1, margin: 8 }}>
                        <h1>Preview</h1>
                        {output}
                    </div>
                </div>
            </div>
        )
    }
}