// Generates test/fonts/TestTTC.ttc, a TrueType Collection containing
// Roboto-Black.ttf (TrueType outlines) and FiraSansOT-Medium.otf (CFF outlines).
// Each member's tables are copied verbatim from the source fonts, so parsing
// a member of the collection must yield the same result as parsing the
// standalone font file.
// Run with: node test/generate-ttc.mjs

import { readFileSync, writeFileSync } from 'fs';

const inputs = [
    './test/fonts/Roboto-Black.ttf',
    './test/fonts/FiraSansOT-Medium.otf'
];
const output = './test/fonts/TestTTC.ttc';

function readFont(path) {
    const buf = readFileSync(path);
    const numTables = buf.readUInt16BE(4);
    const tables = [];
    for (let i = 0; i < numTables; i++) {
        const p = 12 + i * 16;
        tables.push({
            tag: buf.toString('latin1', p, p + 4),
            checksum: buf.readUInt32BE(p + 4),
            offset: buf.readUInt32BE(p + 8),
            length: buf.readUInt32BE(p + 12)
        });
    }
    return { header: buf.subarray(0, 12), tables, buf };
}

const fonts = inputs.map(readFont);

// Layout: TTC header, then per-font offset table + directory, then table data.
const headerLength = 12 + fonts.length * 4;
let cursor = headerLength;
const parts = [];
const fontOffsets = [];

for (const font of fonts) {
    fontOffsets.push(cursor);
    cursor += 12 + font.tables.length * 16;
    for (const table of font.tables) {
        cursor = (cursor + 3) & ~3;
        table.newOffset = cursor;
        cursor += table.length;
    }
}

const out = Buffer.alloc(cursor);

// TTC header: tag, version 1.0, numFonts, offset table.
out.write('ttcf', 0, 'latin1');
out.writeUInt32BE(0x00010000, 4);
out.writeUInt32BE(fonts.length, 8);
fonts.forEach((font, i) => out.writeUInt32BE(fontOffsets[i], 12 + i * 4));

fonts.forEach((font, i) => {
    const base = fontOffsets[i];
    font.header.copy(out, base);
    font.tables.forEach((table, j) => {
        const p = base + 12 + j * 16;
        out.write(table.tag, p, 'latin1');
        out.writeUInt32BE(table.checksum, p + 4);
        out.writeUInt32BE(table.newOffset, p + 8);
        out.writeUInt32BE(table.length, p + 12);
        font.buf.copy(out, table.newOffset, table.offset, table.offset + table.length);
    });
});

writeFileSync(output, out);
console.log(`Wrote ${output} (${out.length} bytes, ${fonts.length} fonts)`);
