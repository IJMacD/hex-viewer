import React, { useState } from "react";
import { CryptPermute } from "./pst/permute";

/**
 * @param {object} props
 * @param {ArrayBuffer} props.buffer
 */
export function SearchWidget ({ buffer }) {
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ searchMode, setSearchMode ] = useState("hex");
    const [ isPermute, setIsPermute ] = useState(false);
    const [ isSearching, setIsSearching ] = useState(false);
    const [ results, setResults ] = useState(/** @type {number[]} */([]));

    const searchBuffer = new ArrayBuffer(4);
    const uint8Array = new Uint8Array(searchBuffer);
    let searchBytes;

    if (searchMode === "hex") {
        searchBytes = searchTerm.trim().split(/\s+/).map(s => parseInt(s, 16)).filter(n => !isNaN(n));
    }
    else {
        searchBytes = searchTerm.split("").map(c => c.charCodeAt(0));
    }

    uint8Array.set(searchBytes.slice(0, 4));

    if (isPermute) {
        CryptPermute(searchBuffer, 4, true);
    }

    const uint32 = new DataView(searchBuffer).getUint32(0, true);

    async function handleSearch () {
        setIsSearching(true);
        setResults([]);

        await searchValue(buffer, uint32, searchBytes, setResults);

        setIsSearching(false);
    }

    return (
        <div style={{border:"1px solid black",padding:"1em",margin:"1em",width:500,minHeight:200,maxHeight:500,overflowY:"auto"}}>
            <h2>Search</h2>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search" disabled={isSearching} /><br />
            <label><input type="radio" checked={searchMode === "chars"} onChange={e => e.target.checked && setSearchMode("chars")} disabled={isSearching} /> Chars</label>
            <label><input type="radio" checked={searchMode === "hex"} onChange={e => e.target.checked && setSearchMode("hex")} disabled={isSearching} /> Hex</label>
            <label><input type="checkbox" checked={isPermute} onChange={e => setIsPermute(e.target.checked)} disabled={isSearching} /> Permute</label>
            <p>
                <BytePreview bytes={searchBytes} /><br/>
                <BytePreview bytes={uint8Array} />
            </p>
            <p>Uint32 (Little Endian): {uint32}</p>
            <ul style={{display:"block"}}>
                {
                    results.map((offset,i) => <li key={i}>0x{h(offset)}</li>)
                }
            </ul>
            <button onClick={handleSearch} disabled={isSearching}>Search</button>
        </div>
    );
}

/**
 * @param {ArrayBuffer } buffer
 * @param {number} uint32
 * @param {number[]} fullSearch
 * @param {(update: (results: number[]) => number[]) => void} setResults
 */
function searchValue(buffer, uint32, fullSearch, setResults) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (buffer.byteLength % 4) {
                buffer = buffer.slice(0, buffer.byteLength - (buffer.byteLength % 4));
            }

            const uint32Array = new Uint32Array(buffer);

            for (let i = 0; i < uint32Array.length; i++) {
                if (uint32Array[i] === uint32) {
                    let found = true;

                    const dv = new DataView(buffer, i * 4);
                    for (let j = 4; j < fullSearch.length; j++) {
                        if (dv.getUint8(j) !== fullSearch[j]) {
                            found = false;
                            break;
                        }
                    }

                    if (found) {
                        setResults(results => [...results, i * 4]);
                    }
                }
            }

            resolve(true);
        }, 0);
    });
}

/**
 * @param {object} props
 * @param {ArrayLike} props.bytes
 */
function BytePreview ({ bytes }) {
    if (bytes.length === 0) return null;

    const l = bytes.length;

    return (
        <div style={{border:"1px solid black",display:"inline-block"}}>
            {
                [...bytes].map((b, i) => (
                    <span
                        key={i}
                        style={{
                            borderRight: i < l - 1 ? "1px dashed grey" : "",
                            padding: 2,
                        }}
                    >
                        {h(b)}
                    </span>
                ))
            }
        </div>
    );
}

function h(b) {
    return b.toString(16).toUpperCase().padStart(2, "0");
}
