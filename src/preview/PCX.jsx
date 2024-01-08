import React from 'react';

/**
 *
 * @param {{ buffer: ArrayBuffer }} props
 */
export default function PCX ({ buffer }) {
    const canvas = React.useRef(/** @type {HTMLCanvasElement?} */(null));

    const data = new DataView(buffer);

    const version = data.getUint8(0x01);
    const encoding = data.getUint8(0x02);
    const bits_per_plane = data.getUint8(0x03);
    const minX = data.getUint16(0x04, true);
    const minY = data.getUint16(0x06, true);
    const maxX = data.getUint16(0x08, true);
    const maxY = data.getUint16(0x0A, true);
    const hDPI = data.getUint16(0x0C, true);
    const vDPI = data.getUint16(0x0E, true);
    const palette = new Uint8Array(data.buffer.slice(0x10, 0x40));
    const num_colour_planes = data.getUint8(0x41);
    const bytes_per_colour_plane = data.getUint16(0x42, true);
    const palette_mode = data.getUint16(0x44, true);

    const bits_per_pixel = bits_per_plane * num_colour_planes;

    const pixelData = new Uint8Array(buffer.slice(0x80));

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    React.useEffect(() => {
        if (!canvas.current) {
            return;
        }

        const ctx = canvas.current.getContext("2d");

        if (!ctx) {
            return;
        }

        canvas.current.width = width;
        canvas.current.height = height;

        let offset = 0;

        const data_size = width * height * bits_per_pixel / 8;

        const decompressed = new Uint8Array(data_size);

        for (let i = 0; i < data_size; i++) {
            if (pixelData[offset] >= 192) {
                let count = pixelData[offset++] - 192;
                while (count--) {
                    decompressed[i++] = pixelData[offset];
                }
                // one extra
                i--;
            }
            else {
                decompressed[i] = pixelData[offset];
            }
            offset++;
        }

        if (num_colour_planes == 4 && bits_per_plane == 1) {
            const line = ctx.createImageData(width, 1);
            for (let y = 0; y < height; y++) {

                const r_plane_offset = y * num_colour_planes * bytes_per_colour_plane;
                const g_plane_offset = (y * num_colour_planes + 1) * bytes_per_colour_plane;
                const b_plane_offset = (y * num_colour_planes + 2) * bytes_per_colour_plane;
                const i_plane_offset = (y * num_colour_planes + 3) * bytes_per_colour_plane;

                for (let x = 0; x < width; x++) {
                    const byte = Math.floor(x / 8);
                    const bit = x % 8;
                    const mask = 1 << (7 - bit);

                    let r = (decompressed[r_plane_offset + byte] & mask) ? 1 : 0;
                    let g = (decompressed[g_plane_offset + byte] & mask) ? 1 : 0;
                    let b = (decompressed[b_plane_offset + byte] & mask) ? 1 : 0;
                    let i = (decompressed[i_plane_offset + byte] & mask) ? 1 : 0;

                    const index = (i << 3) | (b << 2) | (g << 1) | r;

                    r = palette[index * 3];
                    g = palette[index * 3 + 1];
                    b = palette[index * 3 + 2];
                    i = 255;

                    line.data[x * 4] = r;
                    line.data[x * 4 + 1] = g;
                    line.data[x * 4 + 2] = b;
                    line.data[x * 4 + 3] = i;

                }
                ctx.putImageData(line, 0, y);
            }
        }
        else if (num_colour_planes == 3 && bits_per_plane == 8) {
            const line = ctx.createImageData(width, 1);
            for (let y = 0; y < height; y++) {

                const r_plane_offset = y * num_colour_planes * bytes_per_colour_plane;
                const g_plane_offset = (y * num_colour_planes + 1) * bytes_per_colour_plane;
                const b_plane_offset = (y * num_colour_planes + 2) * bytes_per_colour_plane;

                for (let x = 0; x < width; x++) {
                    let r = decompressed[r_plane_offset + x];
                    let g = decompressed[g_plane_offset + x];
                    let b = decompressed[b_plane_offset + x];

                    line.data[x * 4] = r;
                    line.data[x * 4 + 1] = g;
                    line.data[x * 4 + 2] = b;
                    line.data[x * 4 + 3] = 255;

                }

                ctx.putImageData(line, 0, y);
            }

            return;
        }
        else {
            ctx.fillText(`Unable to draw ${num_colour_planes} planes x ${bits_per_plane} bits`, 5, 20);
        }
    }, [buffer]);

    return (
        <>
            <h1>PCX image</h1>
            <pre id="output">
                width: {width}{"\n"}
                height: {height}{"\n"}
                color_planes: {num_colour_planes}{"\n"}
                bits_per_pixel: {bits_per_pixel}{"\n"}
                bytes_per_colour_plane: {bytes_per_colour_plane}{"\n"}
                compressed: {encoding?"yes":"no"}{"\n"}
            </pre>
            <div style={{overflow:"auto",maxWidth:600,maxHeight:6400}}>
                <canvas id="canvas" ref={canvas}></canvas>
            </div>
        </>
    )
}