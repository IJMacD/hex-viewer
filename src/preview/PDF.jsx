import React, { useEffect, useMemo, useRef, useState } from 'react';
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

    const [ renderedPage, setRenderedPage ] = useState(/** @type {PDFObject?} */(null));

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

    if (renderedPage) {
        return (
            <>
                <button onClick={() => setRenderedPage(null)}>Back</button>
                <PDFPageRender page={renderedPage} />
            </>
        );
    }

    return (
        <>
            <h1>PDF File</h1>
            <pre>
                Object Count: {pdf.trailer.size}{'\n'}
                Root Object ID: {pdf.trailer.rootObjectID}{'\n'}
                Info Object ID: {pdf.trailer.infoObjectID}{'\n'}
            </pre>
            {/* {
                pdf.root &&
                <PDFObjectPreview object={pdf.root} />
            } */}
            <h2>Pages</h2>
            {
                pdf.objects.filter(o => o.value['Type'] === "/Page").map(o =>
                    <React.Fragment key={o.id}>
                        <PDFObjectPreview object={o} />
                        <button onClick={() => setRenderedPage(o)}>Render</button>
                    </React.Fragment>
                )
            }
            <h2>Images</h2>
            {
                pdf.objects.filter(o => o.value['Subtype'] === "/Image").map(o =>
                    <React.Fragment key={o.id}>
                        <pre>
                            ID: {o.id}{'\n'}
                            Size: {o.value['Width']} x {o.value['Height']}{'\n'}
                            <PDFPropertyPreview properties={o.value} />
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

function PDFPropertyPreview ({ properties, depth = 0 }) {
    if (typeof properties === "undefined" || properties === null) {
        return null;
    }

    if (Array.isArray(properties)) {
        return <>[ {properties.map((val, i) => <React.Fragment key={i}><PDFPropertyPreview properties={val} depth={depth + 1} />, </React.Fragment>)} ]</>
    }

    if (typeof properties === "object") {
        return (
            <>
            {'\n'}
            {
                Object.entries(properties).map(([name, value]) =>
                    <React.Fragment key={name}>
                        {" ".repeat(depth)}
                        {name}: <PDFPropertyPreview properties={value} depth={depth+1} />
                        {'\n'}
                    </React.Fragment>
                )
            }
            </>
        );
    }

    return properties;
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
                    <PDFPropertyPreview properties={object.value} />
                    { object.value['MediaBox'] &&
                        <>
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
                    Size: {object.value['Width']} x {object.value['Height']}{'\n'}
                    <PDFPropertyPreview properties={object.value} />
                </pre>
            </>
        );
    }

    if (object.value['Type'] === "/Font") {
        return (
            <>
                <pre>
                    ID: {object.id}{'\n'}
                    <PDFPropertyPreview properties={object.value} />
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
                <PDFPropertyPreview properties={object.value} />
                { typeof object.stream === "string" && <>Stream Length: {object.stream.length}{'\n'} </> }
                { object.stream instanceof Uint8Array && <>Stream Length: {object.stream.byteLength}{'\n'} </> }
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
                        Object.entries(object.fonts).map(([id, object]) => <li key={id}>{id}: <PDFObjectPreview object={object} /></li>)
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
            renderImage(canvasRef.current, object);
        }
    }, [object]);

    return <canvas ref={canvasRef} style={{maxWidth:"100%"}} />;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {import("../util/parsePDF").PDFObject} object
 */
function renderImage (canvas, object) {
    if (object && object.stream instanceof Uint8Array) {
        const ctx = canvas.getContext("2d");

        if (ctx) {
            const width = object.value['Width'];
            const height = object.value['Height'];

            canvas.width = width;
            canvas.height = height;

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
                    // Byte align
                    const y = Math.floor(i / 4 / width);
                    imgData.data[i]     = object.stream[y+Math.floor(i/4)*3];
                    imgData.data[i+1]   = object.stream[y+Math.floor(i/4)*3+1];
                    imgData.data[i+2]   = object.stream[y+Math.floor(i/4)*3+2];
                    imgData.data[i+3]   = 255;
                }
            }

            ctx.putImageData(imgData, 0, 0);
        }
    }
}

/**
 *
 * @param {object} props
 * @param {PDFObject} props.page
 */
function PDFPageRender ({ page }) {
    /** @type {string[]|undefined} */
    const mediaBox = page.value['MediaBox'];
    const content = typeof page.contents?.stream === "string" ?
        page.contents.stream : (
            page.contents?.stream instanceof Uint8Array ?
                fflate.strFromU8(page.contents.stream, true) :
                null
    );

    const canvasRef = useRef(/** @type {HTMLCanvasElement?} */(null));

    const isValid = mediaBox && mediaBox.length === 4 && content;

    useEffect(() => {
        if (!isValid) {
            return;
        }

        if (!canvasRef.current) {
            return;
        }

        const ctx = canvasRef.current.getContext("2d");

        if (!ctx) {
            return;
        }

        const scale = 4;

        const width = +mediaBox[2];
        const height = +mediaBox[3];

        canvasRef.current.width = width * scale;
        canvasRef.current.height = height * scale;

        // Invert HTML Canvas Y-Axis
        ctx.transform(scale, 0, 0, -scale, 0, height * scale);

        ctx.font = "72pt Sans-Serif";

        const tokens = tokenize(content);

        let textPosition = [0,0];

        const args = [];

        for (const token of tokens) {
            let isCmd = true;

            if (token === "q") {
                ctx.save();
            }
            else if (token === "Q") {
                ctx.restore();
            }
            else if (token === "cm") {
                ctx.transform(+args[0], +args[1], +args[2], +args[3], +args[4], +args[5]);
            }
            else if (token === "rg") {
                ctx.fillStyle = `rgb(${+args[0]*255}, ${+args[1]*255}, ${+args[2]*255})`;
            }
            else if (token === "RG") {
                ctx.strokeStyle = `rgb(${+args[0]*255}, ${+args[1]*255}, ${+args[2]*255})`;
            }
            else if (token === "g") {
                ctx.fillStyle = `rgb(${+args[0]*255}, ${+args[0]*255}, ${+args[0]*255})`;
            }
            else if (token === "G") {
                ctx.strokeStyle = `rgb(${+args[0]*255}, ${+args[0]*255}, ${+args[0]*255})`;
            }
            else if (token === "BT") {
                // Begin Text
            }
            else if (token === "Tf") {
                // Set Font
                const fontObject = page.resources?.fonts?.[args[0].substring(1)];
                if (fontObject) {
                    const parts = (fontObject.value['BaseFont']||"").substring(1).split(",");
                    const baseName = parts[0].split("+").at(-1);
                    ctx.font = `${parts[1] === "Bold" ? "bold" : ""} ${args[1]}px ${baseName}, sans-serif`;
                }
            }
            else if (token === "Td") {
                textPosition[0] = +args[0];
                textPosition[1] = +args[1];
            }
            else if (token === "Tj") {
                ctx.save()
                // Un-invert Y-Axis for text
                ctx.scale(1, -1);
                ctx.fillText(args[0], textPosition[0], -textPosition[1]);
                ctx.restore();
            }
            else if (token === "ET") {
                // End Text
            }
            else if (token === "Do") {
                // Draw Image
                const img = page.resources?.xObjects?.[args[0].substring(1)];
                if (img && img.value['Subtype'] === "/Image") {
                    const canvas = document.createElement("canvas");
                    renderImage(canvas, img);
                    ctx.save();
                    ctx.scale(1, -1);
                    ctx.drawImage(canvas, 0, 0, 1, -1);
                    ctx.restore();
                }
            }
            else if (token === "w") {
                ctx.lineWidth = +args[0];
            }
            else if (token === "J") {
                // Line cap style
            }
            else if (token === "m") {
                ctx.beginPath();
                ctx.moveTo(+args[0], +args[1]);
            }
            else if (token === "l") {
                ctx.lineTo(+args[0], +args[1]);
            }
            else if (token === "re") {
                ctx.rect(+args[0], +args[1], +args[2], +args[3]);
            }
            else if (token === "S") {
                ctx.stroke();
            }
            else if (token === "f" || token === "f*") {
                ctx.fill();
            }
            else {
                args.push(token);
                isCmd = false;
            }

            if (isCmd) {
                console.log({cmd: token, args});
                args.length = 0;
            }
        }

    }, [page]);

    if (!isValid) {
        return "Media Box or Content stream missing";
    }

    return <canvas ref={canvasRef} style={{maxWidth: "100%", boxShadow: "0 0 8px 1px rgba(0,0,0,0.25)"}} />;
}

/**
 * @param {string} content
 */
function tokenize(content) {
    const out = [];
    const whitespaceRe = /\s/;

    let index = 0;

    while (index < content.length) {
        const c = content[index];

        if (c === "(") {
            let val = "";
            index++;
            while (content[index] !== ")") {
                if (content[index] === "\\") {
                    index++;
                }
                val += content[index];
                index++;
            }
            index++;
            out.push(val);
        }
        else if (c === "<") {
            index++;
            const end = content.indexOf(">", index);
            const length = end - index;
            if (length % 2) {
                throw Error(`Invalid byte encoding length: ${length}`);
            }
            const hexString = content.substring(index, end);
            const numArray = [...hexString.matchAll(/\w\w/g)].map(m => parseInt(m[0], 16));
            const bytes = new Uint8Array(numArray);
            for (let i = 0; i < bytes.length; i += 2) {
                const tmp = bytes[i];
                bytes[i] = bytes[i + 1] + 0x1D;
                bytes[i + 1] = tmp;
            }
            const charCodes = new Uint16Array(bytes.buffer);
            const str = String.fromCharCode(...charCodes);
            out.push(str);
            index = end + 1;
        }
        else if (whitespaceRe.test(c)) {
            index++;
        }
        else {
            const start = index;
            while(!whitespaceRe.test(content[index++]) && index < content.length);
            const end = index - 1;
            const val = content.substring(start, end);
            out.push(val);
            index = end + 1;
        }
    }

    return out;
}
