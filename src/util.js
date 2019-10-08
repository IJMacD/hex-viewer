
export function opacity (c, o) {
    const color = parseColor(c);
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${o})`;
}

export function parseColor (c) {
    return [
        parseInt(c.substr(1,2), 16),
        parseInt(c.substr(3,2), 16),
        parseInt(c.substr(5,2), 16)
    ];
}