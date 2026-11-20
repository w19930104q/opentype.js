import assert from 'assert';
import { Font, Path, Glyph, parse } from '../src/opentype.mjs';
import { readFileSync } from 'fs';
const loadSync = (url, opt) => parse(readFileSync(url), opt);

describe('opentype.mjs', function() {
    it('can load a TrueType font', function() {
        const font = loadSync('./test/fonts/Roboto-Black.ttf');
        assert.deepEqual(font.names.macintosh.fontFamily, {en: 'Roboto Black'});
        assert.deepEqual(font.names.windows.fontFamily, {en: 'Roboto Black'});
        assert.equal(font.unitsPerEm, 2048);
        assert.equal(font.glyphs.length, 1294);
        const aGlyph = font.charToGlyph('A');
        assert.equal(aGlyph.unicode, 65);
        assert.equal(aGlyph.path.commands.length, 15);
    });


    it('can load a OpenType/CFF font', function() {
        const font = loadSync('./test/fonts/FiraSansOT-Medium.otf');
        assert.deepEqual(font.names.macintosh.fontFamily, {en: 'Fira Sans OT Medium'});
        assert.deepEqual(font.names.windows.fontFamily, {en: 'Fira Sans OT Medium'});
        assert.equal(font.unitsPerEm, 1000);
        assert.equal(font.glyphs.length, 1151);
        const aGlyph = font.charToGlyph('A');
        assert.equal(aGlyph.name, 'A');
        assert.equal(aGlyph.unicode, 65);
        assert.equal(aGlyph.path.commands.length, 14);
    });

    it('can load a CID-keyed font', function() {
        const font = loadSync('./test/fonts/FDArrayTest257.otf');
        assert.deepEqual(font.names.windows.fontFamily, {en: 'FDArray Test 257'});
        assert.deepEqual(font.tables.cff.topDict.ros, ['Adobe', 'Identity', 0]);
        assert.equal(font.tables.cff.topDict._fdArray.length, 256);
        assert.equal(font.tables.cff.topDict._fdSelect[0], 0);
        assert.equal(font.tables.cff.topDict._fdSelect[42], 41);
        assert.equal(font.tables.cff.topDict._fdSelect[256], 255);
        assert.equal(font.unitsPerEm, 1000);
        assert.equal(font.glyphs.length, 257);
        const aGlyph = font.glyphs.get(2);
        assert.equal(aGlyph.name, 'cid00002');
        assert.equal(aGlyph.unicode, 1);
        assert.equal(aGlyph.path.commands.length, 24);
        assert.deepEqual(font.stringToGlyphIndexes('🌺'), [59]);
    });

    it('can load a WOFF/CFF font', function() {
        const font = loadSync('./test/fonts/FiraSansMedium.woff');
        assert.deepEqual(font.names.macintosh.fontFamily, {en: 'Fira Sans OT'});
        assert.deepEqual(font.names.windows.fontFamily, {en: 'Fira Sans OT'});
        assert.equal(font.unitsPerEm, 1000);
        assert.equal(font.glyphs.length, 1147);
        const aGlyph = font.charToGlyph('A');
        assert.equal(aGlyph.name, 'A');
        assert.equal(aGlyph.unicode, 65);
        assert.equal(aGlyph.path.commands.length, 14);
    });

    it('throws an error when advanceWidth is not set', function() {
        const notdefGlyph = new Glyph({
            name: '.notdef',
            unicode: 0,
            path: new Path()
        });
        const font = new Font({
            familyName: 'MyFont',
            styleName: 'Medium',
            unitsPerEm: 1000,
            ascender: 800,
            descender: -200,
            glyphs: [notdefGlyph]
        });
        assert.throws(function() { font.toArrayBuffer(); }, /advanceWidth is not a number/);
    });
});

describe('opentype.js on low memory mode', function() {
    const opt = { lowMemory: true };

    it('can load a TrueType font', function() {
        const font = loadSync('./test/fonts/Roboto-Black.ttf', opt);
        assert.deepEqual(font.names.macintosh.fontFamily, {en: 'Roboto Black'});
        assert.deepEqual(font.names.windows.fontFamily, {en: 'Roboto Black'});
        assert.equal(font.unitsPerEm, 2048);
        assert.equal(font.glyphs.length, 0);
        const aGlyph = font.charToGlyph('A');
        assert.equal(aGlyph.unicode, 65);
        assert.equal(aGlyph.path.commands.length, 15);
    });

    it('can load a OpenType/CFF font', function() {
        const font = loadSync('./test/fonts/FiraSansOT-Medium.otf', opt);
        assert.deepEqual(font.names.macintosh.fontFamily, {en: 'Fira Sans OT Medium'});
        assert.deepEqual(font.names.windows.fontFamily, {en: 'Fira Sans OT Medium'});
        assert.equal(font.unitsPerEm, 1000);
        assert.equal(font.glyphs.length, 0);
        const aGlyph = font.charToGlyph('A');
        assert.equal(aGlyph.name, 'A');
        assert.equal(aGlyph.unicode, 65);
        assert.equal(aGlyph.path.commands.length, 14);
    });

    it('can load a CID-keyed font', function() {
        const font = loadSync('./test/fonts/FDArrayTest257.otf', opt);
        assert.deepEqual(font.names.windows.fontFamily, {en: 'FDArray Test 257'});
        assert.deepEqual(font.tables.cff.topDict.ros, ['Adobe', 'Identity', 0]);
        assert.equal(font.tables.cff.topDict._fdArray.length, 256);
        assert.equal(font.tables.cff.topDict._fdSelect[0], 0);
        assert.equal(font.tables.cff.topDict._fdSelect[42], 41);
        assert.equal(font.tables.cff.topDict._fdSelect[256], 255);
        assert.equal(font.unitsPerEm, 1000);
        assert.equal(font.glyphs.length, 0);
        const aGlyph = font.glyphs.get(2);
        assert.equal(aGlyph.name, 'cid00002');
        assert.equal(aGlyph.unicode, 1);
        assert.equal(aGlyph.path.commands.length, 24);
        assert.deepEqual(font.stringToGlyphIndexes('🌺'), [59]);
    });

    it('can load a WOFF/CFF font', function() {
        const font = loadSync('./test/fonts/FiraSansMedium.woff', opt);
        assert.deepEqual(font.names.macintosh.fontFamily, {en: 'Fira Sans OT'});
        assert.deepEqual(font.names.windows.fontFamily, {en: 'Fira Sans OT'});
        assert.equal(font.unitsPerEm, 1000);
        assert.equal(font.glyphs.length, 0);
        const aGlyph = font.charToGlyph('A');
        assert.equal(aGlyph.name, 'A');
        assert.equal(aGlyph.unicode, 65);
        assert.equal(aGlyph.path.commands.length, 14);
    });

    // The head table's `modified` field is stamped with the current time on
    // every write, so freeze it to be able to compare two writes byte for byte.
    function withFrozenTime(fn) {
        const RealDate = global.Date;
        const fixedNow = 1700000000000;
        global.Date = class extends RealDate {
            constructor(...args) {
                super(...(args.length ? args : [fixedNow]));
            }
            static now() {
                return fixedNow;
            }
        };
        try {
            return fn();
        } finally {
            global.Date = RealDate;
        }
    }

    it('writes back all glyphs after a low memory load, modify and write round-trip', function() {
        const buffer = readFileSync('./test/fonts/Roboto-Black.ttf');

        const modifyGlyphA = function(font) {
            const glyph = font.charToGlyph('A');
            const path = glyph.getPath();
            path.commands[0].x += 10;
            glyph.path = path;
        };

        let expected;
        let actual;
        withFrozenTime(function() {
            // Reference: full load, modify one glyph, write back.
            const fullFont = parse(buffer, {});
            modifyGlyphA(fullFont);
            expected = new Uint8Array(fullFont.toArrayBuffer());

            // Low memory load, same modification, write back.
            const lowFont = parse(buffer, opt);
            assert.equal(lowFont.glyphs.length, 0);
            modifyGlyphA(lowFont);
            actual = new Uint8Array(lowFont.toArrayBuffer());
        });

        // All glyphs must be written, and unmodified glyph data must be
        // byte-identical to the full-load write.
        assert.deepEqual([...actual], [...expected]);

        // Re-read the low memory output and compare against the re-read
        // full-load output: glyph count and key glyph paths must match.
        const reLow = parse(actual);
        const reFull = parse(expected);
        assert.equal(reLow.glyphs.length, reFull.glyphs.length);
        assert.equal(reLow.glyphs.length, 1294);
        for (const c of ['A', 'g', 'ﬁ']) {
            const lowCommands = reLow.charToGlyph(c).getPath().commands;
            const fullCommands = reFull.charToGlyph(c).getPath().commands;
            assert.deepEqual(lowCommands, fullCommands);
        }
    });

    it('writes back all glyphs after a low memory CFF load and write round-trip', function() {
        const buffer = readFileSync('./test/fonts/FiraSansOT-Medium.otf');

        let expected;
        let actual;
        withFrozenTime(function() {
            const fullFont = parse(buffer, {});
            expected = new Uint8Array(fullFont.toArrayBuffer());

            const lowFont = parse(buffer, opt);
            assert.equal(lowFont.glyphs.length, 0);
            actual = new Uint8Array(lowFont.toArrayBuffer());
        });

        assert.deepEqual([...actual], [...expected]);

        const reLow = parse(actual);
        assert.equal(reLow.glyphs.length, 1151);
        const lowCommands = reLow.charToGlyph('A').getPath().commands;
        const fullCommands = parse(expected).charToGlyph('A').getPath().commands;
        assert.deepEqual(lowCommands, fullCommands);
    });

    it('handles a parseBuffer error', function(done, fail) {
        try{
            const font = loadSync('./test/fonts/badfont.otf', opt);
            fail();
        } catch(e) {
            done();
        }
    }, opt);

    it('throws an error when advanceWidth is not set', function() {
        const notdefGlyph = new Glyph({
            name: '.notdef',
            unicode: 0,
            path: new Path()
        });
        const font = new Font({
            familyName: 'MyFont',
            styleName: 'Medium',
            unitsPerEm: 1000,
            ascender: 800,
            descender: -200,
            glyphs: [notdefGlyph]
        });
        assert.throws(function() { font.toArrayBuffer(); }, /advanceWidth is not a number/);
    });

    it('should force unicode undefined for .notdef glyph', function() {
        const nullGlyph = new Glyph({
            name: '.notdef',
            path: new Path()
        });
        const font = new Font({
            familyName: 'TestFont',
            styleName: 'Medium',
            unitsPerEm: 1000,
            ascender: 800,
            descender: -200,
            glyphs: [nullGlyph]
        });
        const ndGlyph = font.glyphs.get(0);
        assert.equal(ndGlyph.name, '.notdef');
        assert.equal(ndGlyph.unicode, undefined);
    });

    it('should correctly set unicode 0 for .null glyph', function() {
        const nullGlyph = new Glyph({
            name: '.null',
            unicode: 0,
            path: new Path()
        });
        const font = new Font({
            familyName: 'TestFont',
            styleName: 'Medium',
            unitsPerEm: 1000,
            ascender: 800,
            descender: -200,
            glyphs: [nullGlyph]
        });
        const ndGlyph = font.glyphs.get(0);
        assert.equal(ndGlyph.name, '.null');
        assert.equal(ndGlyph.unicode, 0);
    });

    it('should force unicode 0 for .null glyph', function() {
        const nullGlyph = new Glyph({
            name: '.null',
            path: new Path()
        });
        const font = new Font({
            familyName: 'TestFont',
            styleName: 'Medium',
            unitsPerEm: 1000,
            ascender: 800,
            descender: -200,
            glyphs: [nullGlyph]
        });
        const ndGlyph = font.glyphs.get(0);
        assert.equal(ndGlyph.name, '.null');
        assert.equal(ndGlyph.unicode, 0);
    });

    it('should not allow unicode 0 for any other glyph', function() {
        assert.throws(() => {
            new Glyph({
                name: 'space',
                unicode: 0,
                path: new Path()
            });
        }, /The unicode value "0" is reserved for the glyph name ".null" and cannot be used by any other glyph./);
    });
});
