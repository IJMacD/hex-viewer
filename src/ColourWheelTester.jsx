import React, { useEffect, useRef, useState } from "react";

export function ColourWheelTester () {
    const width = 800;
    const height = 800;

    const canvasWidth = width * devicePixelRatio;
    const canvasHeight = height * devicePixelRatio;

    const [ theta, setTheta ] = useState(57);
    const [ pointCount, setPointCount ] = useState(5);
    const ref = useRef(/** @type {HTMLCanvasElement?} */(null));

    const colours = Array.from({length:pointCount}).map((_,i) => (i * theta) % 360);

    useEffect(() => {
        if (ref.current) {
            const ctx = ref.current.getContext("2d");

            if (ctx) {
                ctx.canvas.width = canvasWidth;
                ctx.canvas.height = canvasHeight;

                const r = canvasWidth / 3;
                const cx = canvasWidth / 2;
                const cy = canvasHeight / 2;

                for (let i = 0; i < 360; i++) {
                    const a = i / 180 * Math.PI;
                    ctx.beginPath();
                    ctx.arc(cx + Math.sin(a) * r, cy - Math.cos(a) * r, 5 * devicePixelRatio, 0, Math.PI * 2);
                    ctx.fillStyle = `hsl(${i}deg, 100%, 50%)`;
                    ctx.fill();
                }

                ctx.beginPath();
                for (let i = 0; i < pointCount; i++) {
                    const c = colours[i];
                    const a = c / 180 * Math.PI;
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx + Math.sin(a) * r * 1.1, cy - Math.cos(a) * r * 1.1);
                }
                ctx.stroke();
            }
        }
    });

    return (
        <div>
            <p>
                <input type="range" min={0} max={100} value={pointCount} onChange={e => setPointCount(e.target.valueAsNumber)} />
                {pointCount} points.
                <br/>
                <input type="number" min={0} max={360} value={theta} onChange={e => setTheta(e.target.valueAsNumber)} /> deg
            </p>
            <canvas
                ref={ref}
                width={canvasWidth}
                height={canvasHeight}
                style={{width, height}}
            /><br/>
            {
                colours.map(c => <div key={c} style={{display:"inline-block", margin: 2, width: 40, height: 40, background: `hsl(${c}deg, 100%, 50%)` }} />)
            }
        </div>
    );
}