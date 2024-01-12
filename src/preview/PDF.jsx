import React, { useEffect, useMemo, useRef } from 'react';
import { getASCIIString } from '../util/getASCIIString';
import * as fflate from 'fflate';
import { parsePDF } from '../util/parsePDF';

/**
 * @typedef {import('../util/parsePDF').PDFObject} PDFObject
 */

/**
 *
 * @param {{ buffer: ArrayBuffer }} props
 */
export default function PDF ({ buffer }) {
    const string = useMemo(() => getASCIIString(buffer), [buffer]);

    /** @type {import('../util/parsePDF').PDFParseResult|string} */
    const pdf = useMemo(() => {
        try {
            const pdf = parsePDF(string);
            return pdf;
        }
        catch (e) {
            // console.log(e.message);
            return e.message;
        }
    }, [string]);

    if (typeof pdf === "string") {
        return <pre>{pdf}</pre>;
    }

    return (
        <>
            <h1>PDF File</h1>
            <pre>
                Object Count: {pdf.trailer.size}{'\n'}
                Root Object ID: {pdf.trailer.rootObjectID}{'\n'}
                Info Object ID: {pdf.trailer.infoObjectID}{'\n'}
            </pre>
            {
                pdf.root &&
                <PDFObjectPreview object={pdf.root} />
            }
            <h2>Images</h2>
            {
                pdf.objects.filter(o => o.value['Subtype'] === "/Image").map(o =>
                    <React.Fragment key={o.id}>
                        <pre>
                            ID: {o.id}{'\n'}
                            Size: {o.value['Width']} x {o.value['Height']}{'\n'}
                            Filter: {o.value['Filter']}{'\n'}
                            { typeof o.value['ColorSpace'] === "string" && <>Colour Space: {o.value['ColorSpace']}{'\n'} </> }
                        </pre>
                        <PDFImagePreview object={o} />
                    </React.Fragment>
                )
            }
            <h2>Fonts</h2>
            {
                pdf.objects.filter(o => o.value['Type'] === "/Font").map(o => <PDFObjectPreview key={o.id} object={o} />)
            }
            {
                pdf.info &&
                <>
                    <h2>Info</h2>
                    <pre>
                    {
                        Object.entries(pdf.info.value).map(([name, value]) => <React.Fragment key={name}>{name}: {value}{'\n'}</React.Fragment>)
                    }
                    </pre>
                </>
            }
        </>
    )
}

/**
 *
 * @param {object} props
 * @param {PDFObject} props.object
 * @returns
 */
function PDFObjectPreview ({ object }) {
    if (object.value['Type'] === "/Catalog") {
        return (
            <>
                <pre>
                    ID: {object.id}{'\n'}
                    Type: {object.value['Type']}{'\n'}
                    Pages:{'\n'}
                </pre>
                {
                    object.pages &&
                    <ul>
                        <li>
                            <PDFObjectPreview object={object.pages} />
                        </li>
                    </ul>
                }
            </>
        );
    }

    if (object.value['Type'] === "/Page") {
        return (
            <>
                <pre>
                    ID: {object.id}{'\n'}
                    Type: {object.value['Type']}{'\n'}
                    { object.value['MediaBox'] &&
                        <>
                            MediaBox: {object.value['MediaBox'].join(" ")}{'\n'}
                            Size: {(+object.value['MediaBox'][2]/72).toFixed(3)} in x {(+object.value['MediaBox'][3]/72).toFixed(3)} in{'\n'}
                            Size: {(+object.value['MediaBox'][2]*25.4/72).toFixed(1)} mm x {(+object.value['MediaBox'][3]*25.4/72).toFixed(1)} mm{'\n'}
                        </>
                    }
                </pre>
                <ul>
                {
                    object.contents &&
                    <li>
                        Contents: <PDFObjectPreview object={object.contents} />
                        <textarea
                            readOnly
                            style={{width: 300,height:400}}
                            value={ typeof object.contents.stream === "string" ?
                                object.contents.stream : (
                                    object.contents.stream instanceof Uint8Array ?
                                        fflate.strFromU8(object.contents.stream, true) :
                                        'MISSING'
                                )
                            }
                        />
                    </li>
                }
                {
                    object.resources &&
                    <li>
                        Resources: <PDFObjectPreview object={object.resources} />
                    </li>
                }
                </ul>
            </>
        );
    }

    if (object.value['Type'] === "/XObject" && object.value['Subtype'] === "/Image") {
        return (
            <>
                <pre>
                    ID: {object.id}{'\n'}
                    Subtype: {object.value['Subtype']}{'\n'}
                    Size: {object.value['Width']} x {object.value['Height']}{'\n'}
                </pre>
            </>
        );
    }

    if (object.value['Type'] === "/Font") {
        return (
            <>
                <pre>
                    ID: {object.id}{'\n'}
                    Type: {object.value['Type']}{'\n'}
                    Subtype: {object.value['Subtype']}{'\n'}
                    Base Font: {object.value['BaseFont']}
                </pre>
                <ul>
                {
                    object.fontDescriptor &&
                    <li>
                        Descriptor:
                        <PDFObjectPreview object={object.fontDescriptor} />
                    </li>
                }
                </ul>
            </>
        );
    }

    return (
        <>
            <pre>
                ID: {object.id}{'\n'}
                { object.value['Type'] && <>Type: {object.value['Type']}{'\n'} </> }
                { typeof object.stream === "string" && <>Length: {object.stream.length}{'\n'} </> }
                { object.stream instanceof Uint8Array && <>Length: {object.stream.byteLength}{'\n'} </> }
                { object.value['FontName'] && <>Font Name: {object.value['FontName']}{'\n'} </> }
            </pre>
            {
                object.children &&
                <ul>
                    {
                        object.children.map(o => <li key={o.id}><PDFObjectPreview object={o} /></li>)
                    }
                </ul>
            }
            {
                typeof object.xObjects === "object" &&
                <>
                    Objects:
                    <ul>
                    {
                        Object.entries(object.xObjects).map(([id, object]) => <li key={id}>{id}: <PDFObjectPreview object={object} /></li>)
                    }
                    </ul>
                </>
            }
            {
                typeof object.fonts === "object" &&
                <>
                    Fonts:
                    <ul>
                    {
                        Object.entries(object.fonts).map(([id, object]) => <li key={id}><PDFObjectPreview object={object} /></li>)
                    }
                    </ul>
                </>
            }
        </>
    );
}

/**
 *
 * @param {object} props
 * @param {PDFObject} props.object
 * @returns
 */
function PDFImagePreview ({ object }) {
    const canvasRef = useRef(/** @type {HTMLCanvasElement?} */(null));

    useEffect(() => {
        if (canvasRef.current) {
            if (object && object.stream instanceof Uint8Array) {
                const ctx = canvasRef.current.getContext("2d");

                if (ctx) {
                    const width = object.value['Width'];
                    const height = object.value['Height'];

                    canvasRef.current.width = width;
                    canvasRef.current.height = height;

                    if (object.value['Filter'] === "/DCTDecode") {
                        ctx.fillText(`Cannot decode ${object.value['Filter']}`, 5, 25);
                        return;
                    }

                    const imgData = ctx.getImageData(0, 0, width, height);

                    for (let i = 0; i < imgData.data.byteLength; i += 4) {
                        if (object.value['ColorSpace'] === "/DeviceCMYK") {
                            let c = object.stream[i];
                            let m = object.stream[i+1];
                            let y = object.stream[i+2];
                            let k = object.stream[i+3];

                            c = (c / 255);
                            m = (m / 255);
                            y = (y / 255);
                            k = (k / 255);

                            c = c * (1 - k) + k;
                            m = m * (1 - k) + k;
                            y = y * (1 - k) + k;

                            let r = 1 - c;
                            let g = 1 - m;
                            let b = 1 - y;

                            r = Math.round(255 * r);
                            g = Math.round(255 * g);
                            b = Math.round(255 * b);

                            imgData.data[i]     = r;
                            imgData.data[i+1]   = g;
                            imgData.data[i+2]   = b;
                            imgData.data[i+3]   = 255;
                        }
                        else if (object.value['ColorSpace'] === "/DeviceGray") {
                            imgData.data[i]     = object.stream[Math.floor(i/4)];
                            imgData.data[i+1]   = object.stream[Math.floor(i/4)];
                            imgData.data[i+2]   = object.stream[Math.floor(i/4)];
                            imgData.data[i+3]   = 255;
                        }
                        else {
                            imgData.data[i]     = object.stream[Math.floor(i/4)*3];
                            imgData.data[i+1]   = object.stream[Math.floor(i/4)*3+1];
                            imgData.data[i+2]   = object.stream[Math.floor(i/4)*3+2];
                            imgData.data[i+3]   = 255;
                        }
                    }

                    ctx.putImageData(imgData, 0, 0);
                }
            }
        }
    }, [object]);

    return <canvas ref={canvasRef} style={{maxWidth:"100%"}} />;
}

