import { markerMatch } from "../util";

export function magic (buffer) {
    if (markerMatch(buffer, "MZ")) {
        return template;
    }
}

const template = [
    {
      "label": "DOS MZ Header",
      "type": "group",
      "children": [
        {
          "label": "DOS Marker",
          "type": "ASCII",
          "length": "2",
          "color": "hsl(24deg, 100%, 50%)"
        },
        {
          "label": "Extra Bytes",
          "id": "stub_size",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(171deg, 100%, 50%)"
        },
        {
          "label": "Pages",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(0deg, 100%, 50%)"
        },
        {
          "label": "Relocation Items",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(57deg, 100%, 50%)"
        },
        {
          "label": "Header Size",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(114deg, 100%, 50%)"
        },
        {
          "label": "Min Allocation",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(171deg, 100%, 50%)"
        },
        {
          "label": "Max Allocation",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(228deg, 100%, 50%)"
        },
        {
          "label": "Initial SS",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(285deg, 100%, 50%)"
        },
        {
          "label": "Initial SP",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(39deg, 100%, 50%)"
        },
        {
          "label": "Checksum ",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(96deg, 100%, 50%)"
        },
        {
          "label": "Initial IP",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(153deg, 100%, 50%)"
        },
        {
          "label": "Initial CS",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(210deg, 100%, 50%)"
        },
        {
          "label": "Relocation Table",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(60deg, 100%, 50%)"
        },
        {
          "label": "Overlay",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(324deg, 100%, 50%)"
        },
        {
          "label": "Reserved",
          "type": "Uint64",
          "start": "28",
          "littleEndian": true,
          "color": "hsl(3deg, 100%, 50%)"
        },
        {
          "label": "OEM Identifier",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(135deg, 100%, 50%)"
        },
        {
          "label": "OEM Info",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(192deg, 100%, 50%)"
        },
        {
          "label": "Reserved",
          "type": "bytes",
          "length": "20",
          "littleEndian": true,
          "color": "hsl(249deg, 100%, 50%)"
        },
        {
          "label": "PE offset",
          "id": "pe_offset",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(306deg, 100%, 50%)"
        }
      ],
      "color": "hsl(114deg, 100%, 50%)"
    },
    {
      "label": "DOS Stub",
      "type": "bytes",
      "length": "pe_offset - pe_offset:end",
      "color": "hsl(324deg, 100%, 50%)"
    },
    {
      "label": "PE Marker",
      "type": "ASCII",
      "start": "pe_offset",
      "length": "4",
      "color": "hsl(348deg, 100%, 50%)"
    },
    {
      "label": "Machine",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(45deg, 100%, 50%)"
    },
    {
      "label": "# of Sections",
      "id": "num_sections",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(357deg, 100%, 50%)"
    },
    {
      "label": "Timestamp",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(159deg, 100%, 50%)"
    },
    {
      "label": "Symbol Table",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(216deg, 100%, 50%)"
    },
    {
      "label": "# of Symbol Tables",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(273deg, 100%, 50%)"
    },
    {
      "label": "Size of Optional Header",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(330deg, 100%, 50%)"
    },
    {
      "label": "Characteristics",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(27deg, 100%, 50%)"
    },
    {
      "label": "Magic",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(84deg, 100%, 50%)"
    },
    {
      "label": "Linker Major Version",
      "type": "Uint8",
      "color": "hsl(198deg, 100%, 50%)"
    },
    {
      "label": "Linker Minor Version",
      "type": "Uint8",
      "color": "hsl(255deg, 100%, 50%)"
    },
    {
      "label": "Size of Code",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(123deg, 100%, 50%)"
    },
    {
      "label": "Size of Initialized Data",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(180deg, 100%, 50%)"
    },
    {
      "label": "Size of Uninitialized Data",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(237deg, 100%, 50%)"
    },
    {
      "label": "Address of Entry Point",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(294deg, 100%, 50%)"
    },
    {
      "label": "Base of Code",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(351deg, 100%, 50%)"
    },
    {
      "label": "Base of Data",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(48deg, 100%, 50%)"
    },
    {
      "label": "Image Base",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(105deg, 100%, 50%)"
    },
    {
      "label": "Section Alignment",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(162deg, 100%, 50%)"
    },
    {
      "label": "File Alignment",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(219deg, 100%, 50%)"
    },
    {
      "label": "Major OS version",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(276deg, 100%, 50%)"
    },
    {
      "label": "Minor OS version",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(333deg, 100%, 50%)"
    },
    {
      "label": "Major Image version",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(30deg, 100%, 50%)"
    },
    {
      "label": "Minor Image version",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(87deg, 100%, 50%)"
    },
    {
      "label": "Major subsystem version",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(144deg, 100%, 50%)"
    },
    {
      "label": "Minor subsystem version",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(201deg, 100%, 50%)"
    },
    {
      "label": "Win32 Version",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(258deg, 100%, 50%)"
    },
    {
      "label": "Size of Image",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(315deg, 100%, 50%)"
    },
    {
      "label": "Size of Headers",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(12deg, 100%, 50%)"
    },
    {
      "label": "Checksum ",
      "type": "bytes",
      "length": "4",
      "color": "hsl(69deg, 100%, 50%)"
    },
    {
      "label": "Subsystem",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(126deg, 100%, 50%)"
    },
    {
      "label": "DLL Characteristics",
      "type": "Uint16",
      "littleEndian": true,
      "color": "hsl(183deg, 100%, 50%)"
    },
    {
      "label": "Size of Stack Reserve",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(240deg, 100%, 50%)"
    },
    {
      "label": "Size of Stack Commit",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(297deg, 100%, 50%)"
    },
    {
      "label": "Size of Heap Reserve",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(354deg, 100%, 50%)"
    },
    {
      "label": "Size of Heap Commit",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(51deg, 100%, 50%)"
    },
    {
      "label": "Loader Flags",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(108deg, 100%, 50%)"
    },
    {
      "label": "# of RVA and Sizes",
      "id": "rva_count",
      "type": "Uint32",
      "littleEndian": true,
      "color": "hsl(165deg, 100%, 50%)"
    },
    {
      "type": "repeater",
      "count": "rva_count",
      "children": [
        {
          "label": "RVA",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(33deg, 100%, 50%)"
        },
        {
          "label": "Size",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(90deg, 100%, 50%)"
        }
      ],
      "color": "hsl(222deg, 100%, 50%)"
    },
    {
      "label": "Sections",
      "type": "repeater",
      "count": "num_sections",
      "children": [
        {
          "label": "Name",
          "type": "ASCII",
          "length": "8",
          "color": "hsl(147deg, 100%, 50%)"
        },
        {
          "label": "Virtual Size",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(204deg, 100%, 50%)"
        },
        {
          "label": "Virtual Address",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(261deg, 100%, 50%)"
        },
        {
          "label": "Size of Raw Data",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(318deg, 100%, 50%)"
        },
        {
          "label": "Pointer to Raw data",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(15deg, 100%, 50%)"
        },
        {
          "label": "Pointer to Relocations",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(72deg, 100%, 50%)"
        },
        {
          "label": "Pointer to Line numbers",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(129deg, 100%, 50%)"
        },
        {
          "label": "Number of Relocations",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(186deg, 100%, 50%)"
        },
        {
          "label": "Number of Line numbers",
          "type": "Uint16",
          "littleEndian": true,
          "color": "hsl(243deg, 100%, 50%)"
        },
        {
          "label": "Characteristics",
          "type": "Uint32",
          "littleEndian": true,
          "color": "hsl(300deg, 100%, 50%)"
        }
      ],
      "color": "hsl(54deg, 100%, 50%)"
    }
];

export default template;
