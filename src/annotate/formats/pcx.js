import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "\n")) {
        return template;
    }
}

const template = [
    {
        "label": "Magic",
        "type": "ASCII",
        "length": "1",
        "color": "hsl(0deg, 100%, 50%)"
    },
    {
        "label": "Version",
        "type": "Uint8",
        "color": "hsl(57deg, 100%, 50%)"
    },
    {
        "label": "Encoding",
        "type": "Uint8",
        "color": "hsl(114deg, 100%, 50%)"
    },
    {
        "label": "bits per plane",
        "type": "Uint8",
        "color": "hsl(267deg, 100%, 50%)"
    },
    {
        "label": "minX",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(210deg, 100%, 50%)"
    },
    {
        "label": "minY",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(153deg, 100%, 50%)"
    },
    {
        "label": "maxX",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(39deg, 100%, 50%)"
    },
    {
        "label": "maxY",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(96deg, 100%, 50%)"
    },
    {
        "label": "hDPI",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(324deg, 100%, 50%)"
    },
    {
        "label": "vDPI",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(21deg, 100%, 50%)"
    },
    {
        "label": "EGA Palette",
        "type": "bytes",
        "length": "48",
        "color": "hsl(78deg, 100%, 50%)"
    },
    {
        "label": "reserved",
        "type": "Uint8",
        "color": "hsl(135deg, 100%, 50%)"
    },
    {
        "label": "colour planes",
        "type": "Uint8",
        "color": "hsl(192deg, 100%, 50%)"
    },
    {
        "label": "bytes per colour plane",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(249deg, 100%, 50%)"
    },
    {
        "label": "palette mode",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(306deg, 100%, 50%)"
    },
    {
        "label": "source screen horizontal ",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(3deg, 100%, 50%)"
    },
    {
        "label": "source screen vertical",
        "type": "Uint16",
        "littleEndian": true,
        "color": "hsl(60deg, 100%, 50%)"
    },
    {
        "label": "reserved",
        "type": "bytes",
        "length": "54",
        "littleEndian": true,
        "color": "hsl(117deg, 100%, 50%)"
    }
];

export default template;
