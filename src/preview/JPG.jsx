import React, { useEffect, useState } from 'react';
import TXT from './HexTXT';
import { getASCIIString } from '../util/getASCIIString';

const MARKER_EXIF = 0xFFE1;

const TAG_WIDTH             = 0x0100;
const TAG_HEIGHT            = 0x0101;
const TAG_MAKE              = 0x010F;
const TAG_MODEL             = 0x0110;
const TAG_ORIENTATION       = 0x0112;
const TAG_X_RESOLUTION      = 0x011A;
const TAG_Y_RESOLUTION      = 0x011B;
const TAG_RESOLUTION_UNIT   = 0x0128;
const TAG_DATE_TIME         = 0x0132;

/**
 *
 * @param {{ buffer: ArrayBuffer }} props
 */
export default function JPG ({ buffer }) {
    const [blobURL, setBlobURL] = useState(/** @type {string?} */(null));

    useEffect(() => {
        const url = URL.createObjectURL(new Blob([buffer]));
        setBlobURL(url);

        return () => {
            setBlobURL(null);
            URL.revokeObjectURL(url);
        };
    }, [buffer]);

    const entries = [];

    const data = new DataView(buffer);
    let tiffData;

    let offset = 2;

    while (offset < buffer.byteLength) {
        const marker = data.getUint16(offset, false);
        const size = data.getUint16(offset + 2, false);

        if (marker === MARKER_EXIF) {
            const str = getASCIIString(buffer, offset + 4, 4);

            if (str !== "Exif") {
                // return <pre>Expected 'Exif' got '{str}'</pre>;
                return <TXT buffer={buffer} offset={offset} />;
            }

            tiffData = new DataView(buffer.slice(offset + 0x0A, offset + size));

            const littleEndianIndicator = getASCIIString(tiffData.buffer, 0, 2);

            if (littleEndianIndicator !== "MM") {
                return <pre>I hadn't planned for that. Little Endian: {littleEndianIndicator}</pre>;
            }

            const ifdOffset = tiffData.getUint32(4);

            entries.push(...getIDFEntries(tiffData.buffer, ifdOffset));

            break;
        }

        offset += size + 2;
    }

    let tiffProperties = {
        exif: {},
        gps: {},
    };

    if (tiffData) {
        tiffProperties = parseTiffData(entries, tiffData?.buffer);
    }

    let {
        width,
        height,
        make,
        model,
        orientation,
        xResolution,
        yResolution,
        resolutionUnit,
        dateTime,
        exif: exifProperties,
        gps: gpsProperties,
    } = tiffProperties;

    const exifEntry = entries.find(e => e.tag === 0x8769);
    const exifOffset = exifEntry ? getIDFOffset(exifEntry) : undefined;
    const exifEntries = tiffData && exifOffset ? getIDFEntries(tiffData.buffer, exifOffset) : [];

    const gpsEntry = entries.find(e => e.tag === 0x8825);
    const gpsOffset = gpsEntry ? getIDFOffset(gpsEntry) : undefined;
    const gpsEntries = tiffData && gpsOffset ? getIDFEntries(tiffData.buffer, gpsOffset) : [];

    return (
        <>
            <h1>JPG preview</h1>
            {
                entries.length > 0 &&
                <pre id="output">
                    TIFF IDF tags: {entries.length} {'\n' }
                    {
                        entries.map(e => `0x${e.tag.toString(16).padStart(4, "0")}: Format: ${e.format} Components: ${e.components} [${getIDFValue(e, tiffData.buffer)}]\n`)
                    }
                    Width: {width} {'\n'}
                    Height: {height} {'\n'}
                    Make: {make} {'\n'}
                    Model: {model} {'\n'}
                    Orientation: {orientation} {'\n'}
                    XResolution: {xResolution} {'\n'}
                    YResolution: {yResolution} {'\n'}
                    Resolution Unit: {[,"None","Inch","cm"][resolutionUnit]} {'\n'}
                    Date Time: {dateTime} {'\n'}
                </pre>
            }
            {
                exifEntries.length > 0 &&
                <pre id="output">
                    Exif tags: {exifEntries.length} {'\n'}
                    {
                        exifEntries.map(e => {
                            if (EXIF_TAGS[e.tag]) {
                                return `${EXIF_TAGS[e.tag]}: ${getIDFValue(e, tiffData.buffer)}\n`;
                            }
                            return `0x${e.tag.toString(16).padStart(4, "0")}: Format: ${e.format} Components: ${e.components}\n`;
                        })
                    }
                </pre>
            }
            {
                gpsEntries.length > 0 &&
                <pre id="output">
                    GPS tags: {gpsEntries.length} {'\n'}
                    {
                        gpsEntries.map(e => `0x${e.tag.toString(16).padStart(4, "0")}: Format: ${e.format} Components: ${e.components}\n`)
                    }
                    Latitude: {gpsProperties.latitude} {gpsProperties.latitudeRef} {'\n'}
                    Longitude: {gpsProperties.longitude} {gpsProperties.longitudeRef} {'\n'}
                    Altitude: {gpsProperties.altitude} m ({gpsProperties.altitudeRef} m) {'\n'}
                    Time: {gpsProperties.timestamp} {'\n'}
                    Fix Method: {gpsProperties.fixMethod} {'\n'}
                    Date: {gpsProperties.dateTime} {'\n'}
                </pre>
            }
            { blobURL && <img src={blobURL}  style={{maxWidth:200,maxHeight:200}} /> }
        </>
    )
}

/**
 * @param {ArrayBuffer} buffer
 * @param {number} ifdOffset
 */
function getIDFEntries(buffer, ifdOffset) {
    const entries = [];

    const dataView = new DataView(buffer);

    const entryCount = dataView.getUint16(ifdOffset);

    for (let i = 0; i < entryCount; i++) {
        const entryStart = ifdOffset + 2 + i * 12;

        entries.push({
            tag: dataView.getUint16(entryStart),
            format: dataView.getUint16(entryStart + 2),
            components: dataView.getUint32(entryStart + 4),
            data: dataView.buffer.slice(entryStart + 8, entryStart + 12),
        });
    }

    return entries;
}

/**
 * @param {IDFEntry[]} entries
 * @param {ArrayBuffer} dataBuffer
 */
function parseTiffData(entries, dataBuffer) {
    const width = getIDFValueByTag(entries, TAG_WIDTH, dataBuffer, 0);

    const height = getIDFValueByTag(entries, TAG_HEIGHT, dataBuffer, 0);

    const make = getIDFValueByTag(entries, TAG_MAKE, dataBuffer, "");

    const model = getIDFValueByTag(entries, TAG_MODEL, dataBuffer, "");

    const orientation = getIDFValueByTag(entries, TAG_ORIENTATION, dataBuffer, 0);

    const xResolution = getIDFValueByTag(entries, TAG_X_RESOLUTION, dataBuffer, 0);

    const yResolution = getIDFValueByTag(entries, TAG_Y_RESOLUTION, dataBuffer, 0);

    const resolutionUnit = getIDFValueByTag(entries, TAG_RESOLUTION_UNIT, dataBuffer, 0);

    const exifEntry = entries.find(e => e.tag === 0x8769);
    const exifOffset = exifEntry ? getIDFOffset(exifEntry) : undefined;

    const gpsEntry = entries.find(e => e.tag === 0x8825);
    const gpsOffset = gpsEntry ? getIDFOffset(gpsEntry) : undefined;

    return {
        width,
        height,
        make,
        model,
        orientation,
        xResolution,
        yResolution,
        resolutionUnit,
        dateTime: getIDFValueByTag(entries, TAG_DATE_TIME, dataBuffer, ""),
        exif: exifOffset ? parseExifData(dataBuffer, exifOffset) : {},
        gps: gpsOffset ? parseGpsData(dataBuffer, gpsOffset) : {},
    };
}

/**
 * @param {ArrayBuffer} buffer
 * @param {number} offset
 */
function parseExifData (buffer, offset) {
    const entries = getIDFEntries(buffer, offset);
    return {
        count: entries.length,
    };
}

/**
 * @param {ArrayBuffer} buffer
 * @param {number} offset
 */
function parseGpsData (buffer, offset) {
    const entries = getIDFEntries(buffer, offset);

    let latitude = "";

    const latitudeEntry = entries.find(e => e.tag === 0x0002);
    if (latitudeEntry) {
        const values = getIDFURationalArray(latitudeEntry, buffer);
        latitude = values.join(" ");
    }

    let longitude = "";

    const longitudeEntry = entries.find(e => e.tag === 0x0004);
    if (longitudeEntry) {
        const values = getIDFURationalArray(longitudeEntry, buffer);
        longitude = values.join(" ");
    }

    let timestamp = "";

    const timestampEntry = entries.find(e => e.tag === 0x0007);
    if (timestampEntry) {
        const values = getIDFURationalArray(timestampEntry, buffer);
        timestamp = values.join(" ");
    }

    const fixValue = getIDFValueByTag(entries, 0x001B, buffer, 0);

    return {
        latitudeRef:    getIDFValueByTag(entries, 0x0001, buffer, ""),
        latitude,
        longitudeRef:   getIDFValueByTag(entries, 0x0003, buffer, ""),
        longitude,
        altitudeRef:    getIDFValueByTag(entries, 0x0005, buffer, 0),
        altitude:       getIDFValueByTag(entries, 0x0006, buffer, 0),
        timestamp,
        fixMethod:      fixValue instanceof ArrayBuffer ? getASCIIString(fixValue, 0, 100) : fixValue,
        dateTime:       getIDFValueByTag(entries, 0x001D, buffer, 0),
    };
}

/**
 * @typedef {{tag: number;format: number;components: number;data: ArrayBuffer;}} IDFEntry
 */

/**
 * @param {IDFEntry[]} entries
 * @param {number} tag
 * @param {ArrayBuffer} buffer
 * @param {string|number} defaultValue
 */
function getIDFValueByTag (entries, tag, buffer, defaultValue) {
    const foundEntry = entries.find(e => e.tag === tag);
    if (foundEntry) {
        return getIDFValue(foundEntry, buffer);
    }
    return defaultValue;
}

/**
 * @param {IDFEntry} entry
 * @param {ArrayBuffer} buffer
 */
function getIDFValue (entry, buffer) {
    switch (entry.format) {
        case 1: return new Uint8Array(entry.data)[0]; // [3] ?
        case 2: return getIDFASCIIString(entry, buffer);
        case 3: return new DataView(entry.data).getUint16(0, false); // (1, false) ?
        case 4: return getIDFUint32(entry);
        case 5: return getIDFURational(entry, buffer);
        case 6: return new Int8Array(entry.data)[0]; // [3] ?
        case 7: return getIDFBytes(entry, buffer);
        case 8: return new DataView(entry.data).getInt16(0, false);
        case 9: return getIDFInt32(entry);
        case 10: return getIDFRational(entry, buffer);
        case 11: return new DataView(entry.data).getFloat32(0);
        case 12: return getIDFDouble(entry, buffer);
    }
    throw Error(`Unknown format: ${entry.format}`);
}

/**
 * @param {IDFEntry} entry
 */
function getIDFOffset (entry) {
    const bytes = new DataView(entry.data);
    return bytes.getUint32(0, false);
}

/**
 * @param {IDFEntry} entry
 */
function getIDFUint32 (entry) {
    const bytes = new Uint8Array(entry.data);
    return (bytes[2] << 24) | (bytes[3] << 16) | (bytes[0] << 8) | bytes[1];
}

/**
 * @param {IDFEntry} entry
 */
function getIDFInt32 (entry) {
    const bytes = new Int8Array(entry.data);
    return (bytes[2] << 24) | (bytes[3] << 16) | (bytes[0] << 8) | bytes[1];
}

/**
 * @param {IDFEntry} entry
 * @param {ArrayBuffer} buffer
 */
function getIDFASCIIString (entry, buffer) {
    const size = entry.components;
    if (size <= 4) return getASCIIString(entry.data, 0, size);
    const offset = getIDFOffset(entry);
    return getASCIIString(buffer, offset, size);
}

/**
 * @param {IDFEntry} entry
 * @param {ArrayBuffer} buffer
 */
function getIDFURational (entry, buffer) {
    const offset = getIDFOffset(entry);
    const dv = new DataView(buffer);
    return dv.getUint32(offset) / dv.getUint32(offset + 4);
}

/**
 * @param {IDFEntry} entry
 * @param {ArrayBuffer} buffer
 */
function getIDFRational (entry, buffer) {
    const offset = getIDFOffset(entry);
    const dv = new DataView(buffer);
    return dv.getInt32(offset) / dv.getInt32(offset + 4);
}

/**
 * @param {IDFEntry} entry
 * @param {ArrayBuffer} buffer
 */
function getIDFURationalArray (entry, buffer) {
    const offset = getIDFOffset(entry);
    const out = [];
    const dv = new DataView(buffer);
    for (let i = 0; i < entry.components; i++) {
        out.push(dv.getUint32(offset + (i * 8)) / dv.getUint32(offset + (i * 8) + 4));
    }
    return out;
}

/**
 * @param {IDFEntry} entry
 * @param {ArrayBuffer} buffer
 */
function getIDFDouble (entry, buffer) {
    const offset = getIDFOffset(entry);
    return new DataView(buffer).getFloat64(offset);
}

/**
 * @param {IDFEntry} entry
 * @param {ArrayBuffer} buffer
 */
function getIDFBytes (entry, buffer) {
    const size = entry.components;
    if (size <= 4) return entry.data.slice(0, size);
    const offset = getIDFOffset(entry);
    return buffer.slice(offset, offset + size);
}

const EXIF_TAGS = {
    0x829A: "ExposureTime",
    0x829D: "FNumber",
    0x8822: "ExposureProgram",
    0x8824: "SpectralSensitivity",
    0x8827: "ISOSpeedRatings",
    0x8828: "OECF",
    0x9000: "ExifVersion",
    0x9003: "DateTimeOriginal",
    0x9004: "DateTimeDigitized",
    0x9101: "ComponentsConfiguration",
    0x9102: "CompressedBitsPerPixel",
    0x9201: "ShutterSpeedValue",
    0x9202: "ApertureValue",
    0x9203: "BrightnessValue",
    0x9204: "ExposureBiasValue",
    0x9205: "MaxApertureValue",
    0x9206: "SubjectDistance",
    0x9207: "MeteringMode",
    0x9208: "LightSource",
    0x9209: "Flash",
    0x920A: "FocalLength",
    0x9214: "SubjectArea",
    0x927C: "MakerNote",
    0x9286: "UserComment",
    0x9290: "SubsecTime",
    0x9291: "SubsecTimeOriginal",
    0x9292: "SubsecTimeDigitized",
    0xA000: "FlashpixVersion",
    0xA001: "ColorSpace",
    0xA002: "PixelXDimension",
    0xA003: "PixelYDimension",
    0xA004: "RelatedSoundFile",
    0xA20B: "FlashEnergy",
    0xA20C: "SpatialFrequencyResponse",
    0xA20E: "FocalPlaneXResolution",
    0xA20F: "FocalPlaneYResolution",
    0xA210: "FocalPlaneResolutionUnit",
    0xA214: "SubjectLocation",
    0xA215: "ExposureIndex",
    0xA217: "SensingMethod",
    0xA300: "FileSource",
    0xA301: "SceneType",
    0xA302: "CFAPattern",
    0xA401: "CustomRendered",
    0xA402: "ExposureMode",
    0xA403: "WhiteBalance",
    0xA404: "DigitalZoomRatio",
    0xA405: "FocalLengthIn35mmFilm",
    0xA406: "SceneCaptureType",
    0xA407: "GainControl",
    0xA408: "Contrast",
    0xA409: "Saturation",
    0xA40A: "Sharpness",
    0xA40B: "DeviceSettingDescription",
    0xA40C: "SubjectDistanceRange",
    0xA420: "ImageUniqueID",
}