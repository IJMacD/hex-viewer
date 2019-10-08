const fileInput = document.getElementById('file-input');
const output = document.getElementById('output');
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');

fileInput.addEventListener("change", handleChange);

/** @this {HTMLInputElement} */
function handleChange () {
    const files = this.files;
    const out = [];

    if (files.length) {
        const reader = new FileReader();
        reader.addEventListener("load", e => {
            if (typeof e.target.result === "string") return;

            const data = new DataView(e.target.result);

            if (data.getUint8(0) === 0x42 && data.getUint8(1) === 0x4D) {
                out.push("We have a BMP image");

                const length = data.getUint16(2, true);
                const data_start = data.getUint32(0x0A, true);
                const header_length = data.getUint32(0x0E, true);
                const width = data.getUint32(0x12, true);
                const height = data.getUint32(0x16, true);
                const color_planes = data.getUint16(0x1A, true);
                const bits_per_pixel = data.getUint16(0x1C, true);
                const compression = data.getUint32(0x1E, true);

                out.push(`length: ${length}`);
                out.push(`data_start: ${data_start}`);
                out.push(`header_length: ${header_length}`);
                out.push(`width: ${width}`);
                out.push(`height: ${height}`);
                out.push(`color_planes: ${color_planes}`);
                out.push(`bits_per_pixel: ${bits_per_pixel}`);
                out.push(`compression: ${compression}`);

                drawImage(new DataView(e.target.result, data_start), width, height);
            } else {
                out.push("Unknown file");
            }

            output.innerHTML = out.join("\n");
        });
        reader.readAsArrayBuffer(files[0]);
    }
}

/**
 * @param {DataView} data
 * @param {number} width
 * @param {number} height
 */
function drawImage (data, width, height) {
    const ctx = canvas.getContext("2d");
    const line = ctx.createImageData(width, 1);

    canvas.width = width;
    canvas.height = height;

    const padding = 4 - (3 * width) %4;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const offset = (y * height + x) * 3;
            const b = data.getUint8(padding * y + offset);
            const g = data.getUint8(padding * y + offset+1);
            const r = data.getUint8(padding * y + offset+2);

            line.data[x*4    ] = r;
            line.data[x*4 + 1] = g;
            line.data[x*4 + 2] = b;
            line.data[x*4 + 3] = 255;
        }

        ctx.putImageData(line, 0, height - y - 1);
    }
}