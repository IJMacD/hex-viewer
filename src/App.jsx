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
            base64: "GAoijAIKgAJneXZaa2wreURWRlZVWUVnKzhCNG1zREd2ODg0ZC91a09wNUN3SVlJdWVZUUlSemV2K2l0RXhwTk9rLzJHVmoyZEtMckZWSUNyazM1TmZsaC9vdW42djJiL2tUUHY0ZFdUaTZaY2RqY0Z5R1lQZTBxc0Zybm84YWFVOXNaaGZBczRSeUxWQ0lJRy84dWRnejhpZXRoVjQxRHMwQ3k2OUNOMXpQcmY1cW54WFlYWk5RK095OU43ZFB4eURNY3VaKzlHb0NESkNERXppK1pCZmhYY2FWdWptYXBWRk9zSzdTOGNHek80T0dXS2F5UVRFR2RkNk1oNkdhQUtmM3paYzg3EgcyNjkwODgwIowCCoACcDRhQWY3emxUc1JpL1FHTU9CRjBOcVVCQWlxR09zMTUxQkQ3T3pSVVJpME1Cb0o5NlhVRXEwbWZrblV6bFF1MCtWQnhpbXBLb2crdnNDSGtiUzhiZ3VwSDA0dkpaYkdLeDV2a2VDQS9zSVF4UEoyVjc2aUdHWUQzNFkzZEZvdFlOSytNR1FiTVZ1SVZ0RVJzN3g1OGtvWjVQcGJwcUJpUktvRldaZWFZbmdrY3NZeTFyenA0K2xIamZ5NDlFUWcyQnVPSDdQTWhBWm9XT2IwZDh4SXJ3TTFnZW1ZeXZVUXEwWnlBVnlhbXRoaUxBWjh2dHIvWkUwY0RqNm1lcDRyMRIHMjY5MTAyNCKMAgqAAlRpVEk4MnZLejZLTFJJUkhQc1pyL1lHZXNsQ3VkbGFmWFdNR1NnRFNHb2tSS0dWakFSRG9TUkRMMTg3S29mZm5DUzBVeUlmMnNnNHR2enB5bWNUMFdZOW9qK090TWprRGppNWt0TFhIVVNScmhxQWlsOWkvRFNqTzZzWmszUFp2b2tFbGhzbUc0UUczMjVuWEcrSlozblZRZEFNbGU4WkM5dVNrUXNXV3Jvb2liU3hIMjhsUDdBdGRhQ0E2NXpXenRuZ1prRDNQeUFLUlRvRm1TSzRGbVlKc1o1eUZnb280N25NaXBjOWs3RGhLc1dTVUlNYXh1bm14TUxlVlJ4YVASBzI2OTExNjgijAIKgAJKUGtZeU5FUllxK1E5M3pOd2F3aWVramFhZXJqYjZPUEdNUzRBWXJ5dEY5RUdYeDM4NHFiTVZkYklyaVBPRGowWGFxb3ZIM1d3c0dPemJYSnRlbGhMZmpWZkR5TGZNcm9xNnhJVGQ4SDAxeURHb0hJVnFGWmx3cllsQWtyajVZUkM5NndkRWVoY1lUZzhzWDQvVFVtSEc2TStndkhrQkZ3cHk0UllqMEY1RzlhV1RMb0lLZkZnd29mZEQyeXpuV05aSGpqb1hqL1ZwQlBVK3N5LzB2SnZtb2NkdEdudUZ3bkpFN2NqUEhwMUxwQ1lvS0dOeHhYSWEvNGc0MmVjYXptEgcyNjkxMzEyIowCCoACb0J5RXVoUDVCbUtrR0FNUTg2WG95MmFkVlE2MVdCVkpSNlg4VDd3dnY1M1FwY1VkcFdtSnBVYTJvaFRYYkNsaDdCN3JhZ1hHaFo2NnNVdFQyWjVyaUUrRFovZjJOVjhnL3I3M3JwRGRYQ3Iza1VLN3M5T0MxTi9ZdE1EOGp5eE5BenhDUjBZODV5cjZRZ081bkZXYWpaOFc2c0N5WmRucmNzRlREVnNwV045bjk4UkV1bURHOUt5VFNjbWMxd2lnZTlnT1FSRkJ2V3RxZWV2Mk85SUN4M2pnT2cyT1N3d1p4eFlHRTN1dE9DdWFLWVlNRXZiZVJwNHRyUS80UGUyYRIHMjY5MTQ1NiKMAgqAAkJEZURHRExReEFzeS91c21VdnZ3Y0lDSVIwL0RHZnUzd2w2V0xCaDVnQXlwWDRZSThKamsyQUsxUkN1czVLU1dHWEVRLzB3SjJlZFdZZTBoVGdTUE5UVlc5Sk43YlY4UktPdFNOa0FIaEdCY0E5NU9DWTZZLzJvRDhQY0xWR2d6MVQ3QlVDdHFuTUYrbFRXNGpHcExDZWQxcFNIWnVZdUZBWFovaFpNajdzN21TejBZZzkzNkZxQklMaGFCdDdUcHgxQkQ1OHlFZkI3R1kydW1Gbi8yYkw2Z2M2T3ZUcWNiS2tyYmprN1N1K0NwTlp5ajgveU93Rnh6WHc4WUdnUGsSBzI2OTE2MDAijAIKgAIrSnVlVHJ0VEY0bUxReTI4dTN0V2I2NnorZURSSjRTTDRWbkVjOW5ONDFrTC84YjBGOWpJNHJxc3F0ZWFEdUpYQ0FLWjJLNFordlpyYjVHYXVFd2hZWVdZM1R0eDNGOXBaMm5oeU5CeERJZU9UL005M3Y3SVAwdFJDYW1FYmZHemk2UWZxeHk3c01yamNOTzRqbU9UZ0FJUWxHUkdLYmZoWVhIOEd2TFBlaFR2TlBYYVd1NTRYQURzdkdHV3pzT21CMWZUTFRzZ0JyNnFPdFlPMllmNWlmNG1kQWIwZmFkSWxnQmN5YUV2TGgwZCtMWklXS2pzUkNBdUJkQStGb1lyEgcyNjkxNzQ0IowCCoACMzdHK3FrWTN2OTVzeWZKZkxUdWVydW1TbGo1NjhjQ2xrdmNSekVJT2Y4MmRqSWdOMFkwcE9hanZoS09mTlczRkxjRmFQbXQrSlJncDhkNVFSa3VaZkNqTXVCNG9GUTk1ZFlRcXFnVjdjWUE1aDdDU01kWVEyUDVBVytiRGRqOUJiM0NwYkZ5bnZWSCtUSTZXajdHb0hiS21lekJqWGlVdFRjMUo5a0NxV3NMOW5NdzdQNE4rZm4vWm5ack5hZE1zdWlKMCtJZWpycldpRjhOTWdFMWlyUHZucXBCUTd3blNGTWFnNVZqYmF0K201ZlZWYVphSWpnNXJwNFg2UVRIMxIHMjY5MTg4OCKMAgqAAkt4eXlRYXBvM3h3Q3YxSFgyem5lNWEyQ0sxSVZCODQ0cEgvMUZtVFJ2ckNkQjZKclBoaVJUbVJMK0E2QVVweTdPNjA3U3FHeGphZUhSRnBZZThDY1U2blUxM3MyVGhwK1pPSVBla1dKU09idERaN21mOStsSE9sSFZ5NVpwNmY2aWtCemhOa3hVajNSWWM0alJkUlRsZFUvZW5qSGVUQUtyMmdNa05BREpJTUR0Tk9sVTlqVEQ1bFlhVGpwUWtYaVdpNTdWdWpNZVJZeVUyN3VBaXhJVk44TnJkbDdTWjhnVUdsMjQ2L29QVkJWa1RXZmxxWWhPbm1hd1FrVUlZOWkSBzI2OTIwMzIijAIKgAJmTXBUWU5IbndWQWh4NG5XRDYzSVU0Y2NocHBHcllYR09leFMrNW1GUzBzTDNtZEg2SndibWVQUkFZMVNxazhEaXdpcjR4L08wMXMxVTgrcGZ5bnV6K1R3ZnZWL0dTMmlhWWFVZzJ4NTJ1QWw4RUppTGZtVlhIMWNxK3Z1aFRWdkp5SjNZV2J3Q2l5cnQvNjFldmxIMUhiVFBreFRoS1hoc1poYTZIU3ZyZDdkWCtMQ3d5OFZYbEhFa3owTEFUY2l0clVrS291bHBRL3dCRjU0L2VEbFpVbmt2czlscXdoaWRwOWpCdEthR1d1MDBWV0NPMWhSZk51Z2hEVXRGSGU5EgcyNjkyMTc2",
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