import React from 'react';

/**
 * 
 * @param {{ buffer: ArrayBuffer }} props 
 */
export default function BMP ({ buffer }) {
    /** @type {React.MutableRefObject<HTMLCanvasElement>} */
    const canvas = React.useRef();

    const data = new DataView(buffer);
    
    const length = data.getUint16(2, true);
    const data_start = data.getUint32(0x0A, true);
    const header_length = data.getUint32(0x0E, true);
    const width = data.getUint32(0x12, true);
    const height = data.getUint32(0x16, true);
    const color_planes = data.getUint16(0x1A, true);
    const bits_per_pixel = data.getUint16(0x1C, true);
    const compression = data.getUint32(0x1E, true);

    const bytes_per_pixel = bits_per_pixel / 8;

    const pixelData = new DataView(buffer, data_start);

    React.useEffect(() => {
        if (!canvas.current) {
            return;
        }

        let colorMap;

        if (compression === 1) {
            colorMap = new DataView(buffer, 0x0E + header_length, 256 * 4);
        }

        const ctx = canvas.current.getContext("2d");
        const line = ctx.createImageData(width, 1);

        canvas.current.width = width;
        canvas.current.height = height;

        const padding = 4 - (bytes_per_pixel * width) %4;
        let rleOffset = 0;

        for (let y = 0; y < height; y++) {
            if (compression === 0) {
                for (let x = 0; x < width; x++) {
                    const offset = (y * height + x) * bytes_per_pixel;

                    let r, g, b;

                    if (bytes_per_pixel === 3) {
                        b = pixelData.getUint8(padding * y + offset);
                        g = pixelData.getUint8(padding * y + offset+1);
                        r = pixelData.getUint8(padding * y + offset+2);
                    } else if (bytes_per_pixel === 1) {
                        const val = pixelData.getUint8(padding * y + offset);
                        b = val;
                        g = val;
                        r = val;
                    }

                    line.data[x*4    ] = r;
                    line.data[x*4 + 1] = g;
                    line.data[x*4 + 2] = b;
                    line.data[x*4 + 3] = 255;
                }
            } else if (compression === 1) {
                let x = 0;
                while (true) {
                    const cmd = pixelData.getUint8(rleOffset);
                    const data = pixelData.getUint8(rleOffset + 1);
                    rleOffset += 2;

                    if (cmd === 0) {
                        if (data === 0) {
                            // End of line
                            break;
                        }
                        console.log(`Unsupported RLE command: ${data}`);

                    } else {

                        const b = colorMap.getUint8(data * 4);
                        const g = colorMap.getUint8(data * 4 + 1);
                        const r = colorMap.getUint8(data * 4 + 2);

                        for (let i = 0; i < cmd; i++) {
                            line.data[(x + i) * 4    ] = r;
                            line.data[(x + i) * 4 + 1] = g;
                            line.data[(x + i) * 4 + 2] = b;
                            line.data[(x + i) * 4 + 3] = 255;
                        }
                    }

                    x += cmd;
                }
            }

            ctx.putImageData(line, 0, height - y - 1);
        }
    }, [buffer]);

    return (
        <div>
            <pre id="output">
                length: {length}{"\n"}
                data_start: {data_start}{"\n"}
                header_length: {header_length}{"\n"}
                width: {width}{"\n"}
                height: {height}{"\n"}
                color_planes: {color_planes}{"\n"}
                bits_per_pixel: {bits_per_pixel}{"\n"}
                compression: {compression}{"\n"}
            </pre>
            <canvas id="canvas" ref={canvas}></canvas>
        </div>
    )
}