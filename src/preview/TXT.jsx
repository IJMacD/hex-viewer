import React, { useEffect, useState } from 'react';

/**
 *
 * @param {{ buffer: ArrayBuffer, annotations?: import('../annotate').Annotation[], offset?: number, byteLimit?: number }} props
 */
export default function TXT ({ buffer }) {
    const [string, setString] = useState("Loading...");
    useEffect(() => setString(new TextDecoder().decode(buffer)), [buffer]);
    return <pre>{string}</pre>;
}
