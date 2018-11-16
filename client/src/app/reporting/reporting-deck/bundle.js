(function() {
    function r(e, n, t) {
        function o(i, f) { if (!n[i]) { if (!e[i]) { var c = "function" == typeof require && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = "MODULE_NOT_FOUND", a } var p = n[i] = { exports: {} };
                e[i][0].call(p.exports, function(r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]); return o } return r })()({
    1: [function(require, module, exports) {
        (function(process, __filename) {

            /**
             * Module dependencies.
             */

            var fs = require('fs'),
                path = require('path'),
                join = path.join,
                dirname = path.dirname,
                exists = ((fs.accessSync && function(path) { try { fs.accessSync(path); } catch (e) { return false; } return true; }) ||
                    fs.existsSync || path.existsSync),
                defaults = {
                    arrow: process.env.NODE_BINDINGS_ARROW || ' → ',
                    compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled',
                    platform: process.platform,
                    arch: process.arch,
                    version: process.versions.node,
                    bindings: 'bindings.node',
                    try: [
                        // node-gyp's linked version in the "build" dir
                        ['module_root', 'build', 'bindings']
                        // node-waf and gyp_addon (a.k.a node-gyp)
                        ,
                        ['module_root', 'build', 'Debug', 'bindings'],
                        ['module_root', 'build', 'Release', 'bindings']
                        // Debug files, for development (legacy behavior, remove for node v0.9)
                        ,
                        ['module_root', 'out', 'Debug', 'bindings'],
                        ['module_root', 'Debug', 'bindings']
                        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
                        ,
                        ['module_root', 'out', 'Release', 'bindings'],
                        ['module_root', 'Release', 'bindings']
                        // Legacy from node-waf, node <= 0.4.x
                        ,
                        ['module_root', 'build', 'default', 'bindings']
                        // Production "Release" buildtype binary (meh...)
                        ,
                        ['module_root', 'compiled', 'version', 'platform', 'arch', 'bindings']
                    ]
                }

            /**
             * The main `bindings()` function loads the compiled bindings for a given module.
             * It uses V8's Error API to determine the parent filename that this function is
             * being invoked from, which is then used to find the root directory.
             */

            function bindings(opts) {

                // Argument surgery
                if (typeof opts == 'string') {
                    opts = { bindings: opts }
                } else if (!opts) {
                    opts = {}
                }

                // maps `defaults` onto `opts` object
                Object.keys(defaults).map(function(i) {
                    if (!(i in opts)) opts[i] = defaults[i];
                });

                // Get the module root
                if (!opts.module_root) {
                    opts.module_root = exports.getRoot(exports.getFileName())
                }

                // Ensure the given bindings name ends with .node
                if (path.extname(opts.bindings) != '.node') {
                    opts.bindings += '.node'
                }

                var tries = [],
                    i = 0,
                    l = opts.try.length,
                    n, b, err

                for (; i < l; i++) {
                    n = join.apply(null, opts.try[i].map(function(p) {
                        return opts[p] || p
                    }))
                    tries.push(n)
                    try {
                        b = opts.path ? require.resolve(n) : require(n)
                        if (!opts.path) {
                            b.path = n
                        }
                        return b
                    } catch (e) {
                        if (!/not find/i.test(e.message)) {
                            throw e
                        }
                    }
                }

                err = new Error('Could not locate the bindings file. Tried:\n' +
                    tries.map(function(a) { return opts.arrow + a }).join('\n'))
                err.tries = tries
                throw err
            }
            module.exports = exports = bindings


            /**
             * Gets the filename of the JavaScript file that invokes this function.
             * Used to help find the root directory of a module.
             * Optionally accepts an filename argument to skip when searching for the invoking filename
             */

            exports.getFileName = function getFileName(calling_file) {
                var origPST = Error.prepareStackTrace,
                    origSTL = Error.stackTraceLimit,
                    dummy = {},
                    fileName

                Error.stackTraceLimit = 10

                Error.prepareStackTrace = function(e, st) {
                    for (var i = 0, l = st.length; i < l; i++) {
                        fileName = st[i].getFileName()
                        if (fileName !== __filename) {
                            if (calling_file) {
                                if (fileName !== calling_file) {
                                    return
                                }
                            } else {
                                return
                            }
                        }
                    }
                }

                // run the 'prepareStackTrace' function above
                Error.captureStackTrace(dummy)
                dummy.stack

                // cleanup
                Error.prepareStackTrace = origPST
                Error.stackTraceLimit = origSTL

                return fileName
            }

            /**
             * Gets the root directory of a module, given an arbitrary filename
             * somewhere in the module tree. The "root directory" is the directory
             * containing the `package.json` file.
             *
             *   In:  /home/nate/node-native-module/lib/index.js
             *   Out: /home/nate/node-native-module
             */

            exports.getRoot = function getRoot(file) {
                var dir = dirname(file),
                    prev
                while (true) {
                    if (dir === '.') {
                        // Avoids an infinite loop in rare cases, like the REPL
                        dir = process.cwd()
                    }
                    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
                        // Found the 'package.json' file or 'node_modules' dir; we're done
                        return dir
                    }
                    if (prev === dir) {
                        // Got to the top
                        throw new Error('Could not find module root given file: "' + file +
                            '". Do you have a `package.json` file? ')
                    }
                    // Try the parent dir next
                    prev = dir
                    dir = join(dir, '..')
                }
            }

        }).call(this, require('_process'), "/../node_modules/bindings/bindings.js")
    }, { "_process": 81, "fs": 52, "path": 79 }],
    2: [function(require, module, exports) {
        'use strict';

        function preserveCamelCase(str) {
            var isLastCharLower = false;

            for (var i = 0; i < str.length; i++) {
                var c = str.charAt(i);

                if (isLastCharLower && (/[a-zA-Z]/).test(c) && c.toUpperCase() === c) {
                    str = str.substr(0, i) + '-' + str.substr(i);
                    isLastCharLower = false;
                    i++;
                } else {
                    isLastCharLower = (c.toLowerCase() === c);
                }
            }

            return str;
        }

        module.exports = function() {
            var str = [].map.call(arguments, function(str) {
                return str.trim();
            }).filter(function(str) {
                return str.length;
            }).join('-');

            if (!str.length) {
                return '';
            }

            if (str.length === 1) {
                return str;
            }

            if (!(/[_.\- ]+/).test(str)) {
                if (str === str.toUpperCase()) {
                    return str.toLowerCase();
                }

                if (str[0] !== str[0].toLowerCase()) {
                    return str[0].toLowerCase() + str.slice(1);
                }

                return str;
            }

            str = preserveCamelCase(str);

            return str
                .replace(/^[_.\- ]+/, '')
                .toLowerCase()
                .replace(/[_.\- ]+(\w|$)/g, function(m, p1) {
                    return p1.toUpperCase();
                });
        };

    }, {}],
    3: [function(require, module, exports) {
        var stringWidth = require('string-width')
        var stripAnsi = require('strip-ansi')
        var wrap = require('wrap-ansi')
        var align = {
            right: alignRight,
            center: alignCenter
        }
        var top = 0
        var right = 1
        var bottom = 2
        var left = 3

        function UI(opts) {
            this.width = opts.width
            this.wrap = opts.wrap
            this.rows = []
        }

        UI.prototype.span = function() {
            var cols = this.div.apply(this, arguments)
            cols.span = true
        }

        UI.prototype.div = function() {
            if (arguments.length === 0) this.div('')
            if (this.wrap && this._shouldApplyLayoutDSL.apply(this, arguments)) {
                return this._applyLayoutDSL(arguments[0])
            }

            var cols = []

            for (var i = 0, arg;
                (arg = arguments[i]) !== undefined; i++) {
                if (typeof arg === 'string') cols.push(this._colFromString(arg))
                else cols.push(arg)
            }

            this.rows.push(cols)
            return cols
        }

        UI.prototype._shouldApplyLayoutDSL = function() {
            return arguments.length === 1 && typeof arguments[0] === 'string' &&
                /[\t\n]/.test(arguments[0])
        }

        UI.prototype._applyLayoutDSL = function(str) {
            var _this = this
            var rows = str.split('\n')
            var leftColumnWidth = 0

            // simple heuristic for layout, make sure the
            // second column lines up along the left-hand.
            // don't allow the first column to take up more
            // than 50% of the screen.
            rows.forEach(function(row) {
                var columns = row.split('\t')
                if (columns.length > 1 && stringWidth(columns[0]) > leftColumnWidth) {
                    leftColumnWidth = Math.min(
                        Math.floor(_this.width * 0.5),
                        stringWidth(columns[0])
                    )
                }
            })

            // generate a table:
            //  replacing ' ' with padding calculations.
            //  using the algorithmically generated width.
            rows.forEach(function(row) {
                var columns = row.split('\t')
                _this.div.apply(_this, columns.map(function(r, i) {
                    return {
                        text: r.trim(),
                        padding: _this._measurePadding(r),
                        width: (i === 0 && columns.length > 1) ? leftColumnWidth : undefined
                    }
                }))
            })

            return this.rows[this.rows.length - 1]
        }

        UI.prototype._colFromString = function(str) {
            return {
                text: str,
                padding: this._measurePadding(str)
            }
        }

        UI.prototype._measurePadding = function(str) {
            // measure padding without ansi escape codes
            var noAnsi = stripAnsi(str)
            return [0, noAnsi.match(/\s*$/)[0].length, 0, noAnsi.match(/^\s*/)[0].length]
        }

        UI.prototype.toString = function() {
            var _this = this
            var lines = []

            _this.rows.forEach(function(row, i) {
                _this.rowToString(row, lines)
            })

            // don't display any lines with the
            // hidden flag set.
            lines = lines.filter(function(line) {
                return !line.hidden
            })

            return lines.map(function(line) {
                return line.text
            }).join('\n')
        }

        UI.prototype.rowToString = function(row, lines) {
            var _this = this
            var padding
            var rrows = this._rasterize(row)
            var str = ''
            var ts
            var width
            var wrapWidth

            rrows.forEach(function(rrow, r) {
                str = ''
                rrow.forEach(function(col, c) {
                    ts = '' // temporary string used during alignment/padding.
                    width = row[c].width // the width with padding.
                    wrapWidth = _this._negatePadding(row[c]) // the width without padding.

                    ts += col

                    for (var i = 0; i < wrapWidth - stringWidth(col); i++) {
                        ts += ' '
                    }

                    // align the string within its column.
                    if (row[c].align && row[c].align !== 'left' && _this.wrap) {
                        ts = align[row[c].align](ts, wrapWidth)
                        if (stringWidth(ts) < wrapWidth) ts += new Array(width - stringWidth(ts)).join(' ')
                    }

                    // apply border and padding to string.
                    padding = row[c].padding || [0, 0, 0, 0]
                    if (padding[left]) str += new Array(padding[left] + 1).join(' ')
                    str += addBorder(row[c], ts, '| ')
                    str += ts
                    str += addBorder(row[c], ts, ' |')
                    if (padding[right]) str += new Array(padding[right] + 1).join(' ')

                    // if prior row is span, try to render the
                    // current row on the prior line.
                    if (r === 0 && lines.length > 0) {
                        str = _this._renderInline(str, lines[lines.length - 1])
                    }
                })

                // remove trailing whitespace.
                lines.push({
                    text: str.replace(/ +$/, ''),
                    span: row.span
                })
            })

            return lines
        }

        function addBorder(col, ts, style) {
            if (col.border) {
                if (/[.']-+[.']/.test(ts)) return ''
                else if (ts.trim().length) return style
                else return '  '
            }
            return ''
        }

        // if the full 'source' can render in
        // the target line, do so.
        UI.prototype._renderInline = function(source, previousLine) {
            var leadingWhitespace = source.match(/^ */)[0].length
            var target = previousLine.text
            var targetTextWidth = stringWidth(target.trimRight())

            if (!previousLine.span) return source

            // if we're not applying wrapping logic,
            // just always append to the span.
            if (!this.wrap) {
                previousLine.hidden = true
                return target + source
            }

            if (leadingWhitespace < targetTextWidth) return source

            previousLine.hidden = true

            return target.trimRight() + new Array(leadingWhitespace - targetTextWidth + 1).join(' ') + source.trimLeft()
        }

        UI.prototype._rasterize = function(row) {
            var _this = this
            var i
            var rrow
            var rrows = []
            var widths = this._columnWidths(row)
            var wrapped

            // word wrap all columns, and create
            // a data-structure that is easy to rasterize.
            row.forEach(function(col, c) {
                // leave room for left and right padding.
                col.width = widths[c]
                if (_this.wrap) wrapped = wrap(col.text, _this._negatePadding(col), { hard: true }).split('\n')
                else wrapped = col.text.split('\n')

                if (col.border) {
                    wrapped.unshift('.' + new Array(_this._negatePadding(col) + 3).join('-') + '.')
                    wrapped.push("'" + new Array(_this._negatePadding(col) + 3).join('-') + "'")
                }

                // add top and bottom padding.
                if (col.padding) {
                    for (i = 0; i < (col.padding[top] || 0); i++) wrapped.unshift('')
                    for (i = 0; i < (col.padding[bottom] || 0); i++) wrapped.push('')
                }

                wrapped.forEach(function(str, r) {
                    if (!rrows[r]) rrows.push([])

                    rrow = rrows[r]

                    for (var i = 0; i < c; i++) {
                        if (rrow[i] === undefined) rrow.push('')
                    }
                    rrow.push(str)
                })
            })

            return rrows
        }

        UI.prototype._negatePadding = function(col) {
            var wrapWidth = col.width
            if (col.padding) wrapWidth -= (col.padding[left] || 0) + (col.padding[right] || 0)
            if (col.border) wrapWidth -= 4
            return wrapWidth
        }

        UI.prototype._columnWidths = function(row) {
            var _this = this
            var widths = []
            var unset = row.length
            var unsetWidth
            var remainingWidth = this.width

            // column widths can be set in config.
            row.forEach(function(col, i) {
                if (col.width) {
                    unset--
                    widths[i] = col.width
                    remainingWidth -= col.width
                } else {
                    widths[i] = undefined
                }
            })

            // any unset widths should be calculated.
            if (unset) unsetWidth = Math.floor(remainingWidth / unset)
            widths.forEach(function(w, i) {
                if (!_this.wrap) widths[i] = row[i].width || stringWidth(row[i].text)
                else if (w === undefined) widths[i] = Math.max(unsetWidth, _minWidth(row[i]))
            })

            return widths
        }

        // calculates the minimum width of
        // a column, based on padding preferences.
        function _minWidth(col) {
            var padding = col.padding || []
            var minWidth = 1 + (padding[left] || 0) + (padding[right] || 0)
            if (col.border) minWidth += 4
            return minWidth
        }

        function alignRight(str, width) {
            str = str.trim()
            var padding = ''
            var strWidth = stringWidth(str)

            if (strWidth < width) {
                padding = new Array(width - strWidth + 1).join(' ')
            }

            return padding + str
        }

        function alignCenter(str, width) {
            str = str.trim()
            var padding = ''
            var strWidth = stringWidth(str.trim())

            if (strWidth < width) {
                padding = new Array(parseInt((width - strWidth) / 2, 10) + 1).join(' ')
            }

            return padding + str
        }

        module.exports = function(opts) {
            opts = opts || {}

            return new UI({
                width: (opts || {}).width || 80,
                wrap: typeof opts.wrap === 'boolean' ? opts.wrap : true
            })
        }

    }, { "string-width": 6, "strip-ansi": 7, "wrap-ansi": 45 }],
    4: [function(require, module, exports) {
        'use strict';
        module.exports = function() {
            return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nqry=><]/g;
        };

    }, {}],
    5: [function(require, module, exports) {
        'use strict';
        var numberIsNan = require('number-is-nan');

        module.exports = function(x) {
            if (numberIsNan(x)) {
                return false;
            }

            // https://github.com/nodejs/io.js/blob/cff7300a578be1b10001f2d967aaedc88aee6402/lib/readline.js#L1369

            // code points are derived from:
            // http://www.unix.org/Public/UNIDATA/EastAsianWidth.txt
            if (x >= 0x1100 && (
                    x <= 0x115f || // Hangul Jamo
                    0x2329 === x || // LEFT-POINTING ANGLE BRACKET
                    0x232a === x || // RIGHT-POINTING ANGLE BRACKET
                    // CJK Radicals Supplement .. Enclosed CJK Letters and Months
                    (0x2e80 <= x && x <= 0x3247 && x !== 0x303f) ||
                    // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
                    0x3250 <= x && x <= 0x4dbf ||
                    // CJK Unified Ideographs .. Yi Radicals
                    0x4e00 <= x && x <= 0xa4c6 ||
                    // Hangul Jamo Extended-A
                    0xa960 <= x && x <= 0xa97c ||
                    // Hangul Syllables
                    0xac00 <= x && x <= 0xd7a3 ||
                    // CJK Compatibility Ideographs
                    0xf900 <= x && x <= 0xfaff ||
                    // Vertical Forms
                    0xfe10 <= x && x <= 0xfe19 ||
                    // CJK Compatibility Forms .. Small Form Variants
                    0xfe30 <= x && x <= 0xfe6b ||
                    // Halfwidth and Fullwidth Forms
                    0xff01 <= x && x <= 0xff60 ||
                    0xffe0 <= x && x <= 0xffe6 ||
                    // Kana Supplement
                    0x1b000 <= x && x <= 0x1b001 ||
                    // Enclosed Ideographic Supplement
                    0x1f200 <= x && x <= 0x1f251 ||
                    // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
                    0x20000 <= x && x <= 0x3fffd)) {
                return true;
            }

            return false;
        }

    }, { "number-is-nan": 32 }],
    6: [function(require, module, exports) {
        'use strict';
        var stripAnsi = require('strip-ansi');
        var codePointAt = require('code-point-at');
        var isFullwidthCodePoint = require('is-fullwidth-code-point');

        // https://github.com/nodejs/io.js/blob/cff7300a578be1b10001f2d967aaedc88aee6402/lib/readline.js#L1345
        module.exports = function(str) {
            if (typeof str !== 'string' || str.length === 0) {
                return 0;
            }

            var width = 0;

            str = stripAnsi(str);

            for (var i = 0; i < str.length; i++) {
                var code = codePointAt(str, i);

                // ignore control characters
                if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
                    continue;
                }

                // surrogates
                if (code >= 0x10000) {
                    i++;
                }

                if (isFullwidthCodePoint(code)) {
                    width += 2;
                } else {
                    width++;
                }
            }

            return width;
        };

    }, { "code-point-at": 8, "is-fullwidth-code-point": 5, "strip-ansi": 7 }],
    7: [function(require, module, exports) {
        'use strict';
        var ansiRegex = require('ansi-regex')();

        module.exports = function(str) {
            return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
        };

    }, { "ansi-regex": 4 }],
    8: [function(require, module, exports) {
        /* eslint-disable babel/new-cap, xo/throw-new-error */
        'use strict';
        module.exports = function(str, pos) {
            if (str === null || str === undefined) {
                throw TypeError();
            }

            str = String(str);

            var size = str.length;
            var i = pos ? Number(pos) : 0;

            if (Number.isNaN(i)) {
                i = 0;
            }

            if (i < 0 || i >= size) {
                return undefined;
            }

            var first = str.charCodeAt(i);

            if (first >= 0xD800 && first <= 0xDBFF && size > i + 1) {
                var second = str.charCodeAt(i + 1);

                if (second >= 0xDC00 && second <= 0xDFFF) {
                    return ((first - 0xD800) * 0x400) + second - 0xDC00 + 0x10000;
                }
            }

            return first;
        };

    }, {}],
    9: [function(require, module, exports) {
        'use strict';
        module.exports = function(str, sep) {
            if (typeof str !== 'string') {
                throw new TypeError('Expected a string');
            }

            sep = typeof sep === 'undefined' ? '_' : sep;

            return str
                .replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
                .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
                .toLowerCase();
        };

    }, {}],
    10: [function(require, module, exports) {
        (function(process, Buffer) {

            /* mpyq.js is a Javascript port of the mpyq Python library for reading MPQ (MoPaQ) archives. */

            const path = require('path');
            const fs = require('fs');
            const bzip = require('seek-bzip');
            const zlib = require('zlib');
            const Long = require('long');

            exports.version = require('./package.json').version;


            const MPQ_FILE_IMPLODE = 0x00000100;
            const MPQ_FILE_COMPRESS = 0x00000200;
            const MPQ_FILE_ENCRYPTED = 0x00010000;
            const MPQ_FILE_FIX_KEY = 0x00020000;
            const MPQ_FILE_SINGLE_UNIT = 0x01000000;
            const MPQ_FILE_DELETE_MARKER = 0x02000000;
            const MPQ_FILE_SECTOR_CRC = 0x04000000;
            const MPQ_FILE_EXISTS = 0x80000000;

            function MPQFileHeader(data) {
                this.magic = data.toString('utf8', 0, 4);
                this.headerSize = data.readUInt32LE(4);
                this.archiveSize = data.readUInt32LE(8);
                this.formatVersion = data.readUInt16LE(12);
                this.sectorSizeShift = data.readUInt16LE(14);
                this.hashTableOffset = data.readUInt32LE(16);
                this.blockTableOffset = data.readUInt32LE(20);
                this.hashTableEntries = data.readUInt32LE(24);
                this.blockTableEntries = data.readUInt32LE(28);
            }

            function MPQFileHeaderExt(data) {
                this.extendedBlockTableOffset = data.readIntLE(0, 8);
                this.hashTableOffsetHigh = data.readInt8(8);
                this.blockTableOffsetHigh = data.readInt8(10);
            }

            function MPQUserDataHeader(data) {
                this.magic = data.toString('utf8', 0, 4);
                this.userDataSize = data.readUInt32LE(4);
                this.mpqHeaderOffset = data.readUInt32LE(8);
                this.userDataHeaderSize = data.readUInt32LE(12);
            }

            function MPQHashTableEntry(data) {
                this.hashA = data.readUInt32BE(0);
                this.hashB = data.readUInt32BE(4);
                this.locale = data.readUInt16BE(8);
                this.platform = data.readUInt16BE(10);
                this.blockTableIndex = data.readUInt32BE(12);
            }

            function MPQBlockTableEntry(data) {
                this.offset = data.readUInt32BE(0);
                this.archivedSize = data.readUInt32BE(4);
                this.size = data.readUInt32BE(8);
                this.flags = data.readUInt32BE(12);
            }


            const MPQArchive = function(filename, listfile) {
                /*
                  Create a MPQArchive object.
                  
                  You can skip reading the listfile if you pass listfile=false
                  to the constructor. The 'files' attribute will be unavailable
                  if you do this.
                */
                if (typeof listfile === 'undefined') listfile = true;

                if (filename instanceof Buffer) {
                    this.file = filename;
                } else {
                    this.filename = filename;
                    this.file = fs.readFileSync(filename);
                }

                this.header = this.readHeader();
                this.hashTable = this.readTable('hash');
                this.blockTable = this.readTable('block');

                if (listfile) {
                    this.files = this.readFile('(listfile)').toString().trim().split('\r\n');
                } else {
                    this.files = null;
                }
            };

            MPQArchive.prototype.readHeader = function() {
                // Read the header of a MPQ archive.
                var magic = this.file.toString('utf8', 0, 4),
                    header;

                if (magic === 'MPQ\x1a') {
                    header = this.readMPQHeader();
                    header.offset = 0;
                } else if (magic === 'MPQ\x1b') {
                    var userDataHeader = this.readMPQUserDataHeader();
                    header = this.readMPQHeader(userDataHeader.mpqHeaderOffset);
                    header.offset = userDataHeader.mpqHeaderOffset;
                    header.userDataHeader = userDataHeader;
                } else {
                    throw new Error('Invalid file header');
                }

                return header;
            };

            MPQArchive.prototype.readMPQHeader = function(offset) {
                offset = offset || 0;

                var data = this.file.slice(offset, offset + 32);
                var header = new MPQFileHeader(data);

                if (header.formatVersion === 1) {
                    data = this.file.slice(offset + 32, offset + 32 + 12);
                    Object.assign(header, new MPQFileHeaderExt(data));
                }

                return header;
            };

            MPQArchive.prototype.readMPQUserDataHeader = function() {
                var data = this.file.slice(0, 16);
                var header = new MPQUserDataHeader(data);
                header.content = this.file.slice(16, 16 + header.userDataHeaderSize);
                return header;
            };

            MPQArchive.prototype.readTable = function(tableType) {
                // Read either the hash or block table of a MPQ archive.
                var Type;
                if (tableType === 'hash') {
                    Type = MPQHashTableEntry;
                } else if (tableType === 'block') {
                    Type = MPQBlockTableEntry;
                } else {
                    throw new Error('Invalid table type.');
                }

                var tableOffset = this.header[tableType + 'TableOffset'];
                var tableEntries = this.header[tableType + 'TableEntries'];

                var key = this._hash('(' + tableType + ' table)', 'TABLE');

                var data = this.file.slice(tableOffset + this.header.offset, tableOffset + this.header.offset + tableEntries * 16);
                data = this._decrypt(data, key);

                var entries = [];

                for (var i = 0; i < tableEntries; i += 1) {
                    entries[i] = new Type(data.slice(i * 16, i * 16 + 16));
                }

                return entries;
            }

            MPQArchive.prototype.getHashTableEntry = function(filename) {
                // Get the hash table entry corresponding to a given filename.
                var hashA = this._hash(filename, 'HASH_A');
                var hashB = this._hash(filename, 'HASH_B');

                for (var entry of this.hashTable) {
                    if (entry.hashA === hashA && entry.hashB === hashB) return entry;
                }
            };

            MPQArchive.prototype.readFile = function(filename, forceDecompress) {
                // Read a file from the MPQ archive.
                function decompress(data) {
                    // Read the compression type and decompress file data.
                    var compressionType = data.readUInt8(0);

                    if (compressionType === 0) return data;
                    else if (compressionType === 2) return zlib.unzipSync(data.slice(1));
                    else if (compressionType === 16) return bzip.decode(data.slice(1));
                    else throw new Error('Unsupported compression type.');
                }

                var hashEntry = this.getHashTableEntry(filename);
                if (!hashEntry) return null;
                var blockEntry = this.blockTable[hashEntry.blockTableIndex];

                // Read the block.
                if (blockEntry.flags & MPQ_FILE_EXISTS) {
                    if (blockEntry.archivedSize === 0) return null;

                    var offset = blockEntry.offset + this.header.offset;
                    var fileData = this.file.slice(offset, offset + blockEntry.archivedSize);

                    if (blockEntry.flags & MPQ_FILE_ENCRYPTED) {
                        throw new Error('Encryption is not yupported yet');
                    }

                    if (!(blockEntry.flags & MPQ_FILE_SINGLE_UNIT)) {
                        // File consists of many sectors. They all need to be
                        // decompressed separately and united.

                        var sectorSize = 512 << this.header.sectorSizeShift;
                        var sectors = Math.trunc(blockEntry.size / sectorSize) + 1;
                        var crc;

                        if (blockEntry.flags & MPQ_FILE_SECTOR_CRC) {
                            crc = true;
                            sectors += 1;
                        } else {
                            crc = false;
                        }

                        var positions = [],
                            i;
                        for (i = 0; i < (sectors + 1); i += 1) {
                            positions[i] = fileData.readUInt32LE(4 * i);
                        }

                        var ln = positions.length - (crc ? 2 : 1);
                        var result = new Buffer(0);
                        var sectorBytesLeft = blockEntry.size;
                        for (i = 0; i < ln; i += 1) {
                            var sector = fileData.slice(positions[i], positions[i + 1]);
                            if ((blockEntry.flags & MPQ_FILE_COMPRESS) && (forceDecompress || (sectorBytesLeft > sector.length))) {
                                sector = decompress(sector);
                            }
                            sectorBytesLeft -= sector.length;
                            result = new Buffer.concat([result, sector]);
                        }
                        fileData = result;
                    } else {
                        // Single unit files only need to be decompressed, but
                        // compression only happens when at least one byte is gained.
                        if ((blockEntry.flags & MPQ_FILE_COMPRESS) && (forceDecompress || (blockEntry.size > blockEntry.archivedSize))) {
                            fileData = decompress(fileData);
                        }
                    }

                    return fileData;
                }
            };

            MPQArchive.prototype.extract = function() {
                // Extract all the files inside the MPQ archive in memory.
                if (this.files) {
                    return this.files.map(filename => {
                        return [filename, this.readFile(filename)];
                    });
                } else {
                    throw new Error('Can\'t extract whole archive without listfile.');
                }
            };

            MPQArchive.prototype.extractToDisk = function() {
                // Extract all files and write them to disk.
                var extension = path.extname(this.filename);
                var archiveName = path.basename(this.filename, extension);
                var dirName = path.join(process.cwd(), archiveName);

                try {
                    fs.statSync(dirName)
                } catch (err) {
                    fs.mkdirSync(dirName);
                }

                process.chdir(archiveName);

                this.extract().forEach(pair => {
                    fs.writeFileSync(pair[0], pair[1] || '');
                });
            };

            MPQArchive.prototype.extractFiles = function(filenames) {
                // Extract given files from the archive to disk.
                for (filename of filenames) {
                    fs.mriteFileSync(filename, this.readFile(filename));
                }
            };

            MPQArchive.prototype.printHeaders = function() {
                console.log('MPQ archive header');
                console.log('------------------');
                for (var key in this.header) {
                    if (key === 'userDataHeader') continue;
                    console.log(key + ' - ' + this.header[key]);
                }

                if (this.header.userDataHeader) {
                    console.log();
                    console.log('MPQ user data header');
                    console.log('--------------------');
                    console.log();
                    for (var key in this.header.userDataHeader) {
                        console.log(key + ' - ' + this.header.userDataHeader[key]);
                    }
                }
                console.log();
            };

            function leadingChar(str, ch, ln, after) {
                str = '' + str;
                while (str.length < ln) {
                    str = after ? str + ch : ch + str;
                }
                return str;
            }

            function formatWord(data, ln) {
                return leadingChar(data.toString(16).toUpperCase(), '0', ln);
            }

            MPQArchive.prototype.printHashTable = function() {
                console.log('MPQ archive hash table');
                console.log('----------------------');
                console.log('Hash A\t\tHash B\t\tLocl\tPlat\tBlockIdx');
                var format = [8, 8, 4, 4, 8];
                this.hashTable.forEach(entry => {
                    console.log(Object.keys(entry).map((key, i) => {
                        return formatWord(entry[key], format[i]);
                    }).join('\t'));
                });
                console.log();
            };

            MPQArchive.prototype.printBlockTable = function() {
                console.log('MPQ archive block table');
                console.log('-----------------------');
                console.log('Offset\t\tArchSize\tRealSize\tFlags');
                this.blockTable.forEach(entry => {
                    console.log([
                        formatWord(entry.offset, 8),
                        leadingChar(entry.archivedSize, ' ', 8),
                        leadingChar(entry.size, ' ', 8),
                        formatWord(entry.flags, 8)
                    ].join('\t'));
                });
                console.log();
            };

            MPQArchive.prototype.printFiles = function() {
                var width = this.files.reduce((top, filename) => Math.max(top, filename.length), 0),
                    hashEntry, blockEntry;

                console.log('Files');
                console.log('-----');
                for (var filename of this.files) {
                    hashEntry = this.getHashTableEntry(filename);
                    blockEntry = this.blockTable[hashEntry.blockTableIndex];

                    console.log(leadingChar(filename, ' ', width, true) + ' ' + leadingChar(blockEntry.size, ' ', 8) + ' bytes');
                }
            };


            const hashTypes = {
                'TABLE_OFFSET': 0,
                'HASH_A': 1,
                'HASH_B': 2,
                'TABLE': 3
            };
            MPQArchive.prototype._hash = function(string, hashType) {
                // Hash a string using MPQ's hash function.
                var seed1, seed2, ch, value;

                seed1 = new Long.fromValue(0x7FED7FED, true);
                seed2 = new Long.fromValue(0xEEEEEEEE, true);

                for (ch of string.toUpperCase()) {
                    if (isNaN(parseInt(ch, 10))) ch = ch.codePointAt(0);

                    value = new Long.fromValue(this.encryptionTable[(hashTypes[hashType] << 8) + ch], true);
                    seed1 = value.xor(seed1.add(seed2)).and(0xFFFFFFFF);
                    seed2 = seed1.add(seed2).add(ch).add(seed2.shiftLeft(5)).add(3).and(0xFFFFFFFF);
                }

                return seed1.toNumber();
            };

            MPQArchive.prototype._decrypt = function(data, key) {
                // Decrypt hash or block table or a sector.
                var seed1, seed2, result = new Buffer(data.length);
                var i, ln = data.length / 4,
                    value;

                seed1  = new Long.fromValue(key, true);
                seed2 = new Long.fromValue(0xEEEEEEEE, true);

                for (i = 0; i < ln; i += 1) {
                    seed2 = seed2.add(this.encryptionTable[0x400 + (seed1 & 0xFF)]);
                    seed2 = seed2.and(0xFFFFFFFF);
                    value = new Long.fromValue(data.readUInt32LE(i * 4), true);
                    value = value.xor(seed1.add(seed2)).and(0xFFFFFFFF);

                    seed1 = seed1.xor(-1).shiftLeft(0x15).add(0x11111111).or(seed1.shiftRight(0x0B));
                    seed1 = seed1.and(0xFFFFFFFF);
                    seed2 = value.add(seed2).add(seed2.shiftLeft(5)).add(3).and(0xFFFFFFFF);

                    result.writeUInt32BE(value.toNumber(), i * 4);
                }

                return result;
            };

            MPQArchive.prototype.encryptionTable = (function() {
                // Prepare encryption table for MPQ hash function.
                var seed, index, t1, t2, i, j;
                var table = {};

                seed = new Long.fromValue(0x00100001, true);

                for (i = 0; i < 256; i += 1) {
                    index = i;
                    for (j = 0; j < 5; j += 1) {
                        seed = seed.mul(125).add(3).mod(0x2AAAAB);
                        t1 = seed.and(0xFFFF).shiftLeft(0x10);

                        seed = seed.mul(125).add(3).mod(0x2AAAAB);
                        t2 = seed.and(0xFFFF);

                        table[index] = t1.or(t2).toNumber();
                        index += 0x100;
                    }
                }

                return table;
            })();

            exports.MPQArchive = MPQArchive;

            if (require.main === module) {
                (function() {
                    const yargs = require('yargs')
                        .usage('usage: mpq.js [-h] [-I] [-H] [-b] [-s] [-t] [-x] file\n\nmpq.js reads and extracts MPQ archives')
                        .demand(1)
                        .alias('h', 'help').boolean('h').describe('h', 'show this help message and exit')
                        .alias('I', 'headers').boolean('I').describe('I', 'print header information from the archive')
                        .alias('H', 'hash-table').boolean('H').describe('H', 'print hash table')
                        .alias('b', 'block-table').boolean('b').describe('b', 'print block table')
                        .alias('s', 'skip-listfile').boolean('s').describe('s', 'skip reading(listfile)')
                        .alias('t', 'list-file').boolean('t').describe('t', 'list files inside the archive')
                        .alias('x', 'extract').boolean('x').describe('x', 'extract files from the archive');

                    const args = yargs.argv,
                        filename = process.cwd() + path.sep + args._[0];

                    var archive = null;

                    if (!args.skipListfile) archive = new MPQArchive(filename);
                    else archive = new MPQArchive(filename, false);

                    if (args.help) {
                        yargs.showHelp();
                        process.exit();
                    }
                    if (args.headers) archive.printHeaders();
                    if (args.hashTable) archive.printHashTable();
                    if (args.blockTable) archive.printBlockTable();
                    if (args.listFile) archive.printFiles();
                    if (args.extract) archive.extractToDisk();

                })();
            }
        }).call(this, require('_process'), require("buffer").Buffer)
    }, { "./package.json": 21, "_process": 81, "buffer": 61, "fs": 52, "long": 31, "path": 79, "seek-bzip": 38, "yargs": 15, "zlib": 60 }],
    11: [function(require, module, exports) {
        arguments[4][4][0].apply(exports, arguments)
    }, { "dup": 4 }],
    12: [function(require, module, exports) {
        arguments[4][5][0].apply(exports, arguments)
    }, { "dup": 5, "number-is-nan": 32 }],
    13: [function(require, module, exports) {
        arguments[4][6][0].apply(exports, arguments)
    }, { "code-point-at": 8, "dup": 6, "is-fullwidth-code-point": 12, "strip-ansi": 14 }],
    14: [function(require, module, exports) {
        arguments[4][7][0].apply(exports, arguments)
    }, { "ansi-regex": 11, "dup": 7 }],
    15: [function(require, module, exports) {
        (function(process, __dirname) {
            var assert = require('assert')
            var Completion = require('./lib/completion')
            var Parser = require('./lib/parser')
            var path = require('path')
            var tokenizeArgString = require('./lib/tokenize-arg-string')
            var Usage = require('./lib/usage')
            var Validation = require('./lib/validation')
            var Y18n = require('y18n')

            Argv(process.argv.slice(2))

            var exports = module.exports = Argv

            function Argv(processArgs, cwd) {
                processArgs = processArgs || [] // handle calling yargs().

                var self = {}
                var completion = null
                var usage = null
                var validation = null
                var y18n = Y18n({
                    directory: path.resolve(__dirname, './locales'),
                    updateFiles: false
                })

                if (!cwd) cwd = process.cwd()

                self.$0 = process.argv
                    .slice(0, 2)
                    .map(function(x, i) {
                        // ignore the node bin, specify this in your
                        // bin file with #!/usr/bin/env node
                        if (i === 0 && /\b(node|iojs)$/.test(x)) return
                        var b = rebase(cwd, x)
                        return x.match(/^\//) && b.length < x.length ? b : x
                    })
                    .join(' ').trim()

                if (process.env._ !== undefined && process.argv[1] === process.env._) {
                    self.$0 = process.env._.replace(
                        path.dirname(process.execPath) + '/', ''
                    )
                }

                var options
                self.resetOptions = self.reset = function() {
                    // put yargs back into its initial
                    // state, this is useful for creating a
                    // nested CLI.
                    options = {
                        array: [],
                        boolean: [],
                        string: [],
                        narg: {},
                        key: {},
                        alias: {},
                        default: {},
                        defaultDescription: {},
                        choices: {},
                        requiresArg: [],
                        count: [],
                        normalize: [],
                        config: {},
                        envPrefix: undefined
                    }

                    usage = Usage(self, y18n) // handle usage output.
                    validation = Validation(self, usage, y18n) // handle arg validation.
                    completion = Completion(self, usage)

                    demanded = {}
                    groups = {}

                    exitProcess = true
                    strict = false
                    helpOpt = null
                    versionOpt = null
                    commandHandlers = {}
                    self.parsed = false

                    return self
                }
                self.resetOptions()

                self.boolean = function(bools) {
                    options.boolean.push.apply(options.boolean, [].concat(bools))
                    return self
                }

                self.array = function(arrays) {
                    options.array.push.apply(options.array, [].concat(arrays))
                    return self
                }

                self.nargs = function(key, n) {
                    if (typeof key === 'object') {
                        Object.keys(key).forEach(function(k) {
                            self.nargs(k, key[k])
                        })
                    } else {
                        options.narg[key] = n
                    }
                    return self
                }

                self.choices = function(key, values) {
                    if (typeof key === 'object') {
                        Object.keys(key).forEach(function(k) {
                            self.choices(k, key[k])
                        })
                    } else {
                        options.choices[key] = (options.choices[key] || []).concat(values)
                    }
                    return self
                }

                self.normalize = function(strings) {
                    options.normalize.push.apply(options.normalize, [].concat(strings))
                    return self
                }

                self.config = function(key, msg, parseFn) {
                    if (typeof msg === 'function') {
                        parseFn = msg
                        msg = null
                    }
                    self.describe(key, msg || usage.deferY18nLookup('Path to JSON config file'));
                    (Array.isArray(key) ? key : [key]).forEach(function(k) {
                        options.config[k] = parseFn || true
                    })
                    return self
                }

                self.example = function(cmd, description) {
                    usage.example(cmd, description)
                    return self
                }

                self.command = function(cmd, description, fn) {
                    if (description !== false) {
                        usage.command(cmd, description)
                    }
                    if (fn) commandHandlers[cmd] = fn
                    return self
                }

                var commandHandlers = {}
                self.getCommandHandlers = function() {
                    return commandHandlers
                }

                self.string = function(strings) {
                    options.string.push.apply(options.string, [].concat(strings))
                    return self
                }

                self.default = function(key, value, defaultDescription) {
                    if (typeof key === 'object') {
                        Object.keys(key).forEach(function(k) {
                            self.default(k, key[k])
                        })
                    } else {
                        if (defaultDescription) options.defaultDescription[key] = defaultDescription
                        if (typeof value === 'function') {
                            if (!options.defaultDescription[key]) options.defaultDescription[key] = usage.functionDescription(value)
                            value = value.call()
                        }
                        options.default[key] = value
                    }
                    return self
                }

                self.alias = function(x, y) {
                    if (typeof x === 'object') {
                        Object.keys(x).forEach(function(key) {
                            self.alias(key, x[key])
                        })
                    } else {
                        // perhaps 'x' is already an alias in another list?
                        // if so we should append to x's list.
                        var aliases = null
                        Object.keys(options.alias).forEach(function(key) {
                            if (~options.alias[key].indexOf(x)) aliases = options.alias[key]
                        })

                        if (aliases) { // x was an alias itself.
                            aliases.push(y)
                        } else { // x is a new alias key.
                            options.alias[x] = (options.alias[x] || []).concat(y)
                        }

                        // wait! perhaps we've created two lists of aliases
                        // that reference each other?
                        if (options.alias[y]) {
                            Array.prototype.push.apply((options.alias[x] || aliases), options.alias[y])
                            delete options.alias[y]
                        }
                    }
                    return self
                }

                self.count = function(counts) {
                    options.count.push.apply(options.count, [].concat(counts))
                    return self
                }

                var demanded = {}
                self.demand = self.required = self.require = function(keys, max, msg) {
                    // you can optionally provide a 'max' key,
                    // which will raise an exception if too many '_'
                    // options are provided.
                    if (typeof max !== 'number') {
                        msg = max
                        max = Infinity
                    }

                    if (typeof keys === 'number') {
                        if (!demanded._) demanded._ = { count: 0, msg: null, max: max }
                        demanded._.count = keys
                        demanded._.msg = msg
                    } else if (Array.isArray(keys)) {
                        keys.forEach(function(key) {
                            self.demand(key, msg)
                        })
                    } else {
                        if (typeof msg === 'string') {
                            demanded[keys] = { msg: msg }
                        } else if (msg === true || typeof msg === 'undefined') {
                            demanded[keys] = { msg: undefined }
                        }
                    }

                    return self
                }
                self.getDemanded = function() {
                    return demanded
                }

                self.requiresArg = function(requiresArgs) {
                    options.requiresArg.push.apply(options.requiresArg, [].concat(requiresArgs))
                    return self
                }

                self.implies = function(key, value) {
                    validation.implies(key, value)
                    return self
                }

                self.usage = function(msg, opts) {
                    if (!opts && typeof msg === 'object') {
                        opts = msg
                        msg = null
                    }

                    usage.usage(msg)

                    if (opts) self.options(opts)

                    return self
                }

                self.epilogue = self.epilog = function(msg) {
                    usage.epilog(msg)
                    return self
                }

                self.fail = function(f) {
                    usage.failFn(f)
                    return self
                }

                self.check = function(f) {
                    validation.check(f)
                    return self
                }

                self.defaults = self.default

                self.describe = function(key, desc) {
                    options.key[key] = true
                    usage.describe(key, desc)
                    return self
                }

                self.parse = function(args) {
                    return parseArgs(args)
                }

                self.option = self.options = function(key, opt) {
                    if (typeof key === 'object') {
                        Object.keys(key).forEach(function(k) {
                            self.options(k, key[k])
                        })
                    } else {
                        assert(typeof opt === 'object', 'second argument to option must be an object')

                        options.key[key] = true // track manually set keys.

                        if (opt.alias) self.alias(key, opt.alias)

                        var demand = opt.demand || opt.required || opt.require

                        if (demand) {
                            self.demand(key, demand)
                        }
                        if ('config' in opt) {
                            self.config(key, opt.configParser)
                        }
                        if ('default' in opt) {
                            self.default(key, opt.default)
                        }
                        if ('nargs' in opt) {
                            self.nargs(key, opt.nargs)
                        }
                        if ('choices' in opt) {
                            self.choices(key, opt.choices)
                        }
                        if ('group' in opt) {
                            self.group(key, opt.group)
                        }
                        if (opt.boolean || opt.type === 'boolean') {
                            self.boolean(key)
                            if (opt.alias) self.boolean(opt.alias)
                        }
                        if (opt.array || opt.type === 'array') {
                            self.array(key)
                            if (opt.alias) self.array(opt.alias)
                        }
                        if (opt.string || opt.type === 'string') {
                            self.string(key)
                            if (opt.alias) self.string(opt.alias)
                        }
                        if (opt.count || opt.type === 'count') {
                            self.count(key)
                        }
                        if (opt.defaultDescription) {
                            options.defaultDescription[key] = opt.defaultDescription
                        }

                        var desc = opt.describe || opt.description || opt.desc
                        if (desc) {
                            self.describe(key, desc)
                        }

                        if (opt.requiresArg) {
                            self.requiresArg(key)
                        }
                    }

                    return self
                }
                self.getOptions = function() {
                    return options
                }

                var groups = {}
                self.group = function(opts, groupName) {
                    var seen = {}
                    groups[groupName] = (groups[groupName] || []).concat(opts).filter(function(key) {
                        if (seen[key]) return false
                        return (seen[key] = true)
                    })
                    return self
                }
                self.getGroups = function() {
                    return groups
                }

                // as long as options.envPrefix is not undefined,
                // parser will apply env vars matching prefix to argv
                self.env = function(prefix) {
                    if (prefix === false) options.envPrefix = undefined
                    else options.envPrefix = prefix || ''
                    return self
                }

                self.wrap = function(cols) {
                    usage.wrap(cols)
                    return self
                }

                var strict = false
                self.strict = function() {
                    strict = true
                    return self
                }
                self.getStrict = function() {
                    return strict
                }

                self.showHelp = function(level) {
                    if (!self.parsed) parseArgs(processArgs) // run parser, if it has not already been executed.
                    usage.showHelp(level)
                    return self
                }

                var versionOpt = null
                self.version = function(ver, opt, msg) {
                    versionOpt = opt || 'version'
                    usage.version(ver)
                    self.boolean(versionOpt)
                    self.describe(versionOpt, msg || usage.deferY18nLookup('Show version number'))
                    return self
                }

                var helpOpt = null
                self.addHelpOpt = function(opt, msg) {
                    helpOpt = opt
                    self.boolean(opt)
                    self.describe(opt, msg || usage.deferY18nLookup('Show help'))
                    return self
                }

                self.showHelpOnFail = function(enabled, message) {
                    usage.showHelpOnFail(enabled, message)
                    return self
                }

                var exitProcess = true
                self.exitProcess = function(enabled) {
                    if (typeof enabled !== 'boolean') {
                        enabled = true
                    }
                    exitProcess = enabled
                    return self
                }
                self.getExitProcess = function() {
                    return exitProcess
                }

                self.help = function() {
                    if (arguments.length > 0) return self.addHelpOpt.apply(self, arguments)

                    if (!self.parsed) parseArgs(processArgs) // run parser, if it has not already been executed.

                    return usage.help()
                }

                var completionCommand = null
                self.completion = function(cmd, desc, fn) {
                    // a function to execute when generating
                    // completions can be provided as the second
                    // or third argument to completion.
                    if (typeof desc === 'function') {
                        fn = desc
                        desc = null
                    }

                    // register the completion command.
                    completionCommand = cmd || 'completion'
                    if (!desc && desc !== false) {
                        desc = 'generate bash completion script'
                    }
                    self.command(completionCommand, desc)

                    // a function can be provided
                    if (fn) completion.registerFunction(fn)

                    return self
                }

                self.showCompletionScript = function($0) {
                    $0 = $0 || self.$0
                    console.log(completion.generateCompletionScript($0))
                    return self
                }

                self.locale = function(locale) {
                    if (arguments.length === 0) {
                        guessLocale()
                        return y18n.getLocale()
                    }
                    detectLocale = false
                    y18n.setLocale(locale)
                    return self
                }

                self.updateStrings = self.updateLocale = function(obj) {
                    detectLocale = false
                    y18n.updateLocale(obj)
                    return self
                }

                var detectLocale = true
                self.detectLocale = function(detect) {
                    detectLocale = detect
                    return self
                }
                self.getDetectLocale = function() {
                    return detectLocale
                }

                self.getUsageInstance = function() {
                    return usage
                }

                self.getValidationInstance = function() {
                    return validation
                }

                self.terminalWidth = function() {
                    return require('window-size').width
                }

                Object.defineProperty(self, 'argv', {
                    get: function() {
                        var args = null

                        try {
                            args = parseArgs(processArgs)
                        } catch (err) {
                            usage.fail(err.message)
                        }

                        return args
                    },
                    enumerable: true
                })

                function parseArgs(args) {
                    args = normalizeArgs(args)

                    var parsed = Parser(args, options, y18n)
                    var argv = parsed.argv
                    var aliases = parsed.aliases

                    argv.$0 = self.$0

                    self.parsed = parsed

                    guessLocale() // guess locale lazily, so that it can be turned off in chain.

                    // while building up the argv object, there
                    // are two passes through the parser. If completion
                    // is being performed short-circuit on the first pass.
                    if (completionCommand &&
                        (process.argv.join(' ')).indexOf(completion.completionKey) !== -1 &&
                        !argv[completion.completionKey]) {
                        return argv
                    }

                    // if there's a handler associated with a
                    // command defer processing to it.
                    var handlerKeys = Object.keys(self.getCommandHandlers())
                    for (var i = 0, command;
                        (command = handlerKeys[i]) !== undefined; i++) {
                        if (~argv._.indexOf(command)) {
                            runCommand(command, self, argv)
                            return self.argv
                        }
                    }

                    // generate a completion script for adding to ~/.bashrc.
                    if (completionCommand && ~argv._.indexOf(completionCommand) && !argv[completion.completionKey]) {
                        self.showCompletionScript()
                        if (exitProcess) {
                            process.exit(0)
                        }
                    }

                    // we must run completions first, a user might
                    // want to complete the --help or --version option.
                    if (completion.completionKey in argv) {
                        // we allow for asynchronous completions,
                        // e.g., loading in a list of commands from an API.
                        completion.getCompletion(function(completions) {;
                            (completions || []).forEach(function(completion) {
                                console.log(completion)
                            })

                            if (exitProcess) {
                                process.exit(0)
                            }
                        })
                        return
                    }

                    var helpOrVersion = false
                    Object.keys(argv).forEach(function(key) {
                        if (key === helpOpt && argv[key]) {
                            helpOrVersion = true
                            self.showHelp('log')
                            if (exitProcess) {
                                process.exit(0)
                            }
                        } else if (key === versionOpt && argv[key]) {
                            helpOrVersion = true
                            usage.showVersion()
                            if (exitProcess) {
                                process.exit(0)
                            }
                        }
                    })

                    // If the help or version options where used and exitProcess is false,
                    // we won't run validations
                    if (!helpOrVersion) {
                        if (parsed.error) throw parsed.error

                        // if we're executed via bash completion, don't
                        // bother with validation.
                        if (!argv[completion.completionKey]) {
                            validation.nonOptionCount(argv)
                            validation.missingArgumentValue(argv)
                            validation.requiredArguments(argv)
                            if (strict) validation.unknownArguments(argv, aliases)
                            validation.customChecks(argv, aliases)
                            validation.limitedChoices(argv)
                            validation.implications(argv)
                        }
                    }

                    setPlaceholderKeys(argv)

                    return argv
                }

                function guessLocale() {
                    if (!detectLocale) return

                    try {
                        var osLocale = require('os-locale')
                        self.locale(osLocale.sync({ spawn: false }))
                    } catch (err) {
                        // if we explode looking up locale just noop
                        // we'll keep using the default language 'en'.
                    }
                }

                function runCommand(command, yargs, argv) {
                    setPlaceholderKeys(argv)
                    yargs.getCommandHandlers()[command](yargs.reset(), argv)
                }

                function setPlaceholderKeys(argv) {
                    Object.keys(options.key).forEach(function(key) {
                        // don't set placeholder keys for dot
                        // notation options 'foo.bar'.
                        if (~key.indexOf('.')) return
                        if (typeof argv[key] === 'undefined') argv[key] = undefined
                    })
                }

                function normalizeArgs(args) {
                    if (typeof args === 'string') {
                        return tokenizeArgString(args)
                    }
                    return args
                }

                singletonify(self)
                return self
            }

            // rebase an absolute path to a relative one with respect to a base directory
            // exported for tests
            exports.rebase = rebase

            function rebase(base, dir) {
                return path.relative(base, dir)
            }

            /*  Hack an instance of Argv with process.argv into Argv
                so people can do
                require('yargs')(['--beeble=1','-z','zizzle']).argv
                to parse a list of args and
                require('yargs').argv
                to get a parsed version of process.argv.
            */
            function singletonify(inst) {
                Object.keys(inst).forEach(function(key) {
                    if (key === 'argv') {
                        Argv.__defineGetter__(key, inst.__lookupGetter__(key))
                    } else {
                        Argv[key] = typeof inst[key] === 'function' ? inst[key].bind(inst) : inst[key]
                    }
                })
            }

        }).call(this, require('_process'), "/../node_modules/empeeku/node_modules/yargs")
    }, { "./lib/completion": 16, "./lib/parser": 17, "./lib/tokenize-arg-string": 18, "./lib/usage": 19, "./lib/validation": 20, "_process": 81, "assert": 53, "os-locale": 33, "path": 79, "window-size": 44, "y18n": 50 }],
    16: [function(require, module, exports) {
        (function(process, __dirname) {
            var fs = require('fs')
            var path = require('path')

            // add bash completions to your
            //  yargs-powered applications.
            module.exports = function(yargs, usage) {
                var self = {
                    completionKey: 'get-yargs-completions'
                }

                // get a list of completion commands.
                self.getCompletion = function(done) {
                    var completions = []
                    var current = process.argv[process.argv.length - 1]
                    var previous = process.argv.slice(process.argv.indexOf('--' + self.completionKey) + 1)
                    var argv = yargs.parse(previous)

                    // a custom completion function can be provided
                    // to completion().
                    if (completionFunction) {
                        if (completionFunction.length < 3) {
                            var result = completionFunction(current, argv)

                            // promise based completion function.
                            if (typeof result.then === 'function') {
                                return result.then(function(list) {
                                    process.nextTick(function() { done(list) })
                                }).catch(function(err) {
                                    process.nextTick(function() { throw err })
                                })
                            }

                            // synchronous completion function.
                            return done(result)
                        } else {
                            // asynchronous completion function
                            return completionFunction(current, argv, function(completions) {
                                done(completions)
                            })
                        }
                    }

                    var handlers = yargs.getCommandHandlers()
                    for (var i = 0, ii = previous.length; i < ii; ++i) {
                        if (handlers[previous[i]]) {
                            return handlers[previous[i]](yargs.reset())
                        }
                    }

                    if (!current.match(/^-/)) {
                        usage.getCommands().forEach(function(command) {
                            if (previous.indexOf(command[0]) === -1) {
                                completions.push(command[0])
                            }
                        })
                    }

                    if (current.match(/^-/)) {
                        Object.keys(yargs.getOptions().key).forEach(function(key) {
                            completions.push('--' + key)
                        })
                    }

                    done(completions)
                }

                // generate the completion script to add to your .bashrc.
                self.generateCompletionScript = function($0) {
                    var script = fs.readFileSync(
                        path.resolve(__dirname, '../completion.sh.hbs'),
                        'utf-8'
                    )
                    var name = path.basename($0)

                    // add ./to applications not yet installed as bin.
                    if ($0.match(/\.js$/)) $0 = './' + $0

                    script = script.replace(/{{app_name}}/g, name)
                    return script.replace(/{{app_path}}/g, $0)
                }

                // register a function to perform your own custom
                // completions., this function can be either
                // synchrnous or asynchronous.
                var completionFunction = null
                self.registerFunction = function(fn) {
                    completionFunction = fn
                }

                return self
            }

        }).call(this, require('_process'), "/../node_modules/empeeku/node_modules/yargs/lib")
    }, { "_process": 81, "fs": 52, "path": 79 }],
    17: [function(require, module, exports) {
        (function(process) {
            // fancy-pants parsing of argv, originally forked
            // from minimist: https://www.npmjs.com/package/minimist
            var camelCase = require('camelcase')
            var path = require('path')

            function increment(orig) {
                return orig !== undefined ? orig + 1 : 0
            }

            module.exports = function(args, opts, y18n) {
                if (!opts) opts = {}

                var __ = y18n.__
                var error = null
                var flags = { arrays: {}, bools: {}, strings: {}, counts: {}, normalize: {}, configs: {}, defaulted: {} }

                ;
                [].concat(opts['array']).filter(Boolean).forEach(function(key) {
                    flags.arrays[key] = true
                })

                ;
                [].concat(opts['boolean']).filter(Boolean).forEach(function(key) {
                    flags.bools[key] = true
                })

                ;
                [].concat(opts.string).filter(Boolean).forEach(function(key) {
                    flags.strings[key] = true
                })

                ;
                [].concat(opts.count).filter(Boolean).forEach(function(key) {
                    flags.counts[key] = true
                })

                ;
                [].concat(opts.normalize).filter(Boolean).forEach(function(key) {
                    flags.normalize[key] = true
                })

                Object.keys(opts.config).forEach(function(k) {
                    flags.configs[k] = opts.config[k]
                })

                var aliases = {}
                var newAliases = {}

                extendAliases(opts.key)
                extendAliases(opts.alias)
                extendAliases(opts.default)

                var defaults = opts['default'] || {}
                Object.keys(defaults).forEach(function(key) {
                    if (/-/.test(key) && !opts.alias[key]) {
                        aliases[key] = aliases[key] || []
                    }
                    (aliases[key] || []).forEach(function(alias) {
                        defaults[alias] = defaults[key]
                    })
                })

                var argv = { _: [] }

                Object.keys(flags.bools).forEach(function(key) {
                    setArg(key, !(key in defaults) ? false : defaults[key])
                    setDefaulted(key)
                })

                var notFlags = []
                if (args.indexOf('--') !== -1) {
                    notFlags = args.slice(args.indexOf('--') + 1)
                    args = args.slice(0, args.indexOf('--'))
                }

                for (var i = 0; i < args.length; i++) {
                    var arg = args[i]
                    var broken
                    var key
                    var letters
                    var m
                    var next
                    var value

                    // -- seperated by =
                    if (arg.match(/^--.+=/)) {
                        // Using [\s\S] instead of . because js doesn't support the
                        // 'dotall' regex modifier. See:
                        // http://stackoverflow.com/a/1068308/13216
                        m = arg.match(/^--([^=]+)=([\s\S]*)$/)

                        // nargs format = '--f=monkey washing cat'
                        if (checkAllAliases(m[1], opts.narg)) {
                            args.splice(i + 1, m[1], m[2])
                            i = eatNargs(i, m[1], args)
                                // arrays format = '--f=a b c'
                        } else if (checkAllAliases(m[1], flags.arrays) && args.length > i + 1) {
                            args.splice(i + 1, m[1], m[2])
                            i = eatArray(i, m[1], args)
                        } else {
                            setArg(m[1], m[2])
                        }
                    } else if (arg.match(/^--no-.+/)) {
                        key = arg.match(/^--no-(.+)/)[1]
                        setArg(key, false)

                        // -- seperated by space.
                    } else if (arg.match(/^--.+/)) {
                        key = arg.match(/^--(.+)/)[1]

                        // nargs format = '--foo a b c'
                        if (checkAllAliases(key, opts.narg)) {
                            i = eatNargs(i, key, args)
                                // array format = '--foo a b c'
                        } else if (checkAllAliases(key, flags.arrays) && args.length > i + 1) {
                            i = eatArray(i, key, args)
                        } else {
                            next = args[i + 1]

                            if (next !== undefined && !next.match(/^-/) &&
                                !checkAllAliases(key, flags.bools) &&
                                !checkAllAliases(key, flags.counts)) {
                                setArg(key, next)
                                i++
                            } else if (/^(true|false)$/.test(next)) {
                                setArg(key, next)
                                i++
                            } else {
                                setArg(key, defaultForType(guessType(key, flags)))
                            }
                        }

                        // dot-notation flag seperated by '='.
                    } else if (arg.match(/^-.\..+=/)) {
                        m = arg.match(/^-([^=]+)=([\s\S]*)$/)
                        setArg(m[1], m[2])

                        // dot-notation flag seperated by space.
                    } else if (arg.match(/^-.\..+/)) {
                        next = args[i + 1]
                        key = arg.match(/^-(.\..+)/)[1]

                        if (next !== undefined && !next.match(/^-/) &&
                            !checkAllAliases(key, flags.bools) &&
                            !checkAllAliases(key, flags.counts)) {
                            setArg(key, next)
                            i++
                        } else {
                            setArg(key, defaultForType(guessType(key, flags)))
                        }
                    } else if (arg.match(/^-[^-]+/)) {
                        letters = arg.slice(1, -1).split('')
                        broken = false

                        for (var j = 0; j < letters.length; j++) {
                            next = arg.slice(j + 2)

                            if (letters[j + 1] && letters[j + 1] === '=') {
                                value = arg.slice(j + 3)
                                key = letters[j]

                                // nargs format = '-f=monkey washing cat'
                                if (checkAllAliases(letters[j], opts.narg)) {
                                    args.splice(i + 1, 0, value)
                                    i = eatNargs(i, key, args)
                                        // array format = '-f=a b c'
                                } else if (checkAllAliases(key, flags.arrays) && args.length > i + 1) {
                                    args.splice(i + 1, 0, value)
                                    i = eatArray(i, key, args)
                                } else {
                                    setArg(key, value)
                                }

                                broken = true
                                break
                            }

                            if (next === '-') {
                                setArg(letters[j], next)
                                continue
                            }

                            if (/[A-Za-z]/.test(letters[j]) &&
                                /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                                setArg(letters[j], next)
                                broken = true
                                break
                            }

                            if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                                setArg(letters[j], arg.slice(j + 2))
                                broken = true
                                break
                            } else {
                                setArg(letters[j], defaultForType(guessType(letters[j], flags)))
                            }
                        }

                        key = arg.slice(-1)[0]

                        if (!broken && key !== '-') {
                            // nargs format = '-f a b c'
                            if (checkAllAliases(key, opts.narg)) {
                                i = eatNargs(i, key, args)
                                    // array format = '-f a b c'
                            } else if (checkAllAliases(key, flags.arrays) && args.length > i + 1) {
                                i = eatArray(i, key, args)
                            } else {
                                if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1]) &&
                                    !checkAllAliases(key, flags.bools) &&
                                    !checkAllAliases(key, flags.counts)) {
                                    setArg(key, args[i + 1])
                                    i++
                                } else if (args[i + 1] && /true|false/.test(args[i + 1])) {
                                    setArg(key, args[i + 1])
                                    i++
                                } else {
                                    setArg(key, defaultForType(guessType(key, flags)))
                                }
                            }
                        }
                    } else {
                        argv._.push(
                            flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
                        )
                    }
                }

                // order of precedence:
                // 1. command line arg
                // 2. value from config file
                // 3. value from env var
                // 4. configured default value
                applyEnvVars(opts, argv, true) // special case: check env vars that point to config file
                setConfig(argv)
                applyEnvVars(opts, argv, false)
                applyDefaultsAndAliases(argv, aliases, defaults)

                Object.keys(flags.counts).forEach(function(key) {
                    setArg(key, defaults[key])
                })

                notFlags.forEach(function(key) {
                    argv._.push(key)
                })

                // how many arguments should we consume, based
                // on the nargs option?
                function eatNargs(i, key, args) {
                    var toEat = checkAllAliases(key, opts.narg)

                    if (args.length - (i + 1) < toEat) error = Error(__('Not enough arguments following: %s', key))

                    for (var ii = i + 1; ii < (toEat + i + 1); ii++) {
                        setArg(key, args[ii])
                    }

                    return (i + toEat)
                }

                // if an option is an array, eat all non-hyphenated arguments
                // following it... YUM!
                // e.g., --foo apple banana cat becomes ["apple", "banana", "cat"]
                function eatArray(i, key, args) {
                    for (var ii = i + 1; ii < args.length; ii++) {
                        if (/^-/.test(args[ii])) break
                        i = ii
                        setArg(key, args[ii])
                    }

                    return i
                }

                function setArg(key, val) {
                    unsetDefaulted(key)

                    // handle parsing boolean arguments --foo=true --bar false.
                    if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
                        if (typeof val === 'string') val = val === 'true'
                    }

                    if (/-/.test(key) && !(aliases[key] && aliases[key].length)) {
                        var c = camelCase(key)
                        aliases[key] = [c]
                        newAliases[c] = true
                    }

                    var value = !checkAllAliases(key, flags.strings) && isNumber(val) ? Number(val) : val

                    if (checkAllAliases(key, flags.counts)) {
                        value = increment
                    }

                    var splitKey = key.split('.')
                    setKey(argv, splitKey, value)

                    // alias references an inner-value within
                    // a dot-notation object. see #279.
                    if (~key.indexOf('.') && aliases[key]) {
                        aliases[key].forEach(function(x) {
                            x = x.split('.')
                            setKey(argv, x, value)
                        })
                    }

                    ;
                    (aliases[splitKey[0]] || []).forEach(function(x) {
                        x = x.split('.')

                        // handle populating dot notation for both
                        // the key and its aliases.
                        if (splitKey.length > 1) {
                            var a = [].concat(splitKey)
                            a.shift() // nuke the old key.
                            x = x.concat(a)
                        }

                        setKey(argv, x, value)
                    })

                    var keys = [key].concat(aliases[key] || [])
                    for (var i = 0, l = keys.length; i < l; i++) {
                        if (flags.normalize[keys[i]]) {
                            keys.forEach(function(key) {
                                argv.__defineSetter__(key, function(v) {
                                    val = path.normalize(v)
                                })

                                argv.__defineGetter__(key, function() {
                                    return typeof val === 'string' ? path.normalize(val) : val
                                })
                            })
                            break
                        }
                    }
                }

                // set args from config.json file, this should be
                // applied last so that defaults can be applied.
                function setConfig(argv) {
                    var configLookup = {}

                    // expand defaults/aliases, in-case any happen to reference
                    // the config.json file.
                    applyDefaultsAndAliases(configLookup, aliases, defaults)

                    Object.keys(flags.configs).forEach(function(configKey) {
                        var configPath = argv[configKey] || configLookup[configKey]
                        if (configPath) {
                            try {
                                var config = null
                                var resolvedConfigPath = path.resolve(process.cwd(), configPath)

                                if (typeof flags.configs[configKey] === 'function') {
                                    try {
                                        config = flags.configs[configKey](resolvedConfigPath)
                                    } catch (e) {
                                        config = e
                                    }
                                    if (config instanceof Error) {
                                        error = config
                                        return
                                    }
                                } else {
                                    config = require(resolvedConfigPath)
                                }

                                Object.keys(config).forEach(function(key) {
                                    // setting arguments via CLI takes precedence over
                                    // values within the config file.
                                    if (argv[key] === undefined || (flags.defaulted[key])) {
                                        delete argv[key]
                                        setArg(key, config[key])
                                    }
                                })
                            } catch (ex) {
                                if (argv[configKey]) error = Error(__('Invalid JSON config file: %s', configPath))
                            }
                        }
                    })
                }

                function applyEnvVars(opts, argv, configOnly) {
                    if (typeof opts.envPrefix === 'undefined') return

                    var prefix = typeof opts.envPrefix === 'string' ? opts.envPrefix : ''
                    Object.keys(process.env).forEach(function(envVar) {
                        if (prefix === '' || envVar.lastIndexOf(prefix, 0) === 0) {
                            var key = camelCase(envVar.substring(prefix.length))
                            if (((configOnly && flags.configs[key]) || !configOnly) && (!(key in argv) || flags.defaulted[key])) {
                                setArg(key, process.env[envVar])
                            }
                        }
                    })
                }

                function applyDefaultsAndAliases(obj, aliases, defaults) {
                    Object.keys(defaults).forEach(function(key) {
                        if (!hasKey(obj, key.split('.'))) {
                            setKey(obj, key.split('.'), defaults[key])

                            ;
                            (aliases[key] || []).forEach(function(x) {
                                if (hasKey(obj, x.split('.'))) return
                                setKey(obj, x.split('.'), defaults[key])
                            })
                        }
                    })
                }

                function hasKey(obj, keys) {
                    var o = obj
                    keys.slice(0, -1).forEach(function(key) {
                        o = (o[key] || {})
                    })

                    var key = keys[keys.length - 1]

                    if (typeof o !== 'object') return false
                    else return key in o
                }

                function setKey(obj, keys, value) {
                    var o = obj
                    keys.slice(0, -1).forEach(function(key) {
                        if (o[key] === undefined) o[key] = {}
                        o = o[key]
                    })

                    var key = keys[keys.length - 1]
                    if (value === increment) {
                        o[key] = increment(o[key])
                    } else if (o[key] === undefined && checkAllAliases(key, flags.arrays)) {
                        o[key] = Array.isArray(value) ? value : [value]
                    } else if (o[key] === undefined || typeof o[key] === 'boolean') {
                        o[key] = value
                    } else if (Array.isArray(o[key])) {
                        o[key].push(value)
                    } else {
                        o[key] = [o[key], value]
                    }
                }

                // extend the aliases list with inferred aliases.
                function extendAliases(obj) {
                    Object.keys(obj || {}).forEach(function(key) {
                        // short-circuit if we've already added a key
                        // to the aliases array, for example it might
                        // exist in both 'opts.default' and 'opts.key'.
                        if (aliases[key]) return

                        aliases[key] = [].concat(opts.alias[key] || [])
                            // For "--option-name", also set argv.optionName
                        aliases[key].concat(key).forEach(function(x) {
                            if (/-/.test(x)) {
                                var c = camelCase(x)
                                aliases[key].push(c)
                                newAliases[c] = true
                            }
                        })
                        aliases[key].forEach(function(x) {
                            aliases[x] = [key].concat(aliases[key].filter(function(y) {
                                return x !== y
                            }))
                        })
                    })
                }

                // check if a flag is set for any of a key's aliases.
                function checkAllAliases(key, flag) {
                    var isSet = false
                    var toCheck = [].concat(aliases[key] || [], key)

                    toCheck.forEach(function(key) {
                        if (flag[key]) isSet = flag[key]
                    })

                    return isSet
                }

                function setDefaulted(key) {
                    [].concat(aliases[key] || [], key).forEach(function(k) {
                        flags.defaulted[k] = true
                    })
                }

                function unsetDefaulted(key) {
                    [].concat(aliases[key] || [], key).forEach(function(k) {
                        delete flags.defaulted[k]
                    })
                }

                // return a default value, given the type of a flag.,
                // e.g., key of type 'string' will default to '', rather than 'true'.
                function defaultForType(type) {
                    var def = {
                        boolean: true,
                        string: '',
                        array: []
                    }

                    return def[type]
                }

                // given a flag, enforce a default type.
                function guessType(key, flags) {
                    var type = 'boolean'

                    if (flags.strings && flags.strings[key]) type = 'string'
                    else if (flags.arrays && flags.arrays[key]) type = 'array'

                    return type
                }

                function isNumber(x) {
                    if (typeof x === 'number') return true
                    if (/^0x[0-9a-f]+$/i.test(x)) return true
                    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x)
                }

                return {
                    argv: argv,
                    aliases: aliases,
                    error: error,
                    newAliases: newAliases
                }
            }

        }).call(this, require('_process'))
    }, { "_process": 81, "camelcase": 2, "path": 79 }],
    18: [function(require, module, exports) {
        // take an un-split argv string and tokenize it.
        module.exports = function(argString) {
            var i = 0
            var c = null
            var opening = null
            var args = []

            for (var ii = 0; ii < argString.length; ii++) {
                c = argString.charAt(ii)

                // split on spaces unless we're in quotes.
                if (c === ' ' && !opening) {
                    i++
                    continue
                }

                // don't split the string if we're in matching
                // opening or closing single and double quotes.
                if (c === opening) {
                    opening = null
                    continue
                } else if ((c === "'" || c === '"') && !opening) {
                    opening = c
                    continue
                }

                if (!args[i]) args[i] = ''
                args[i] += c
            }

            return args
        }

    }, {}],
    19: [function(require, module, exports) {
        (function(process) {
            // this file handles outputting usage instructions,
            // failures, etc. keeps logging in one place.
            var cliui = require('cliui')
            var decamelize = require('decamelize')
            var stringWidth = require('string-width')
            var wsize = require('window-size')

            module.exports = function(yargs, y18n) {
                var __ = y18n.__
                var self = {}

                // methods for ouputting/building failure message.
                var fails = []
                self.failFn = function(f) {
                    fails.push(f)
                }

                var failMessage = null
                var showHelpOnFail = true
                self.showHelpOnFail = function(enabled, message) {
                    if (typeof enabled === 'string') {
                        message = enabled
                        enabled = true
                    } else if (typeof enabled === 'undefined') {
                        enabled = true
                    }
                    failMessage = message
                    showHelpOnFail = enabled
                    return self
                }

                var failureOutput = false
                self.fail = function(msg) {
                    if (fails.length) {
                        fails.forEach(function(f) {
                            f(msg)
                        })
                    } else {
                        // don't output failure message more than once
                        if (!failureOutput) {
                            failureOutput = true
                            if (showHelpOnFail) yargs.showHelp('error')
                            if (msg) console.error(msg)
                            if (failMessage) {
                                if (msg) console.error('')
                                console.error(failMessage)
                            }
                        }
                        if (yargs.getExitProcess()) {
                            process.exit(1)
                        } else {
                            throw new Error(msg)
                        }
                    }
                }

                // methods for ouputting/building help (usage) message.
                var usage
                self.usage = function(msg) {
                    usage = msg
                }

                var examples = []
                self.example = function(cmd, description) {
                    examples.push([cmd, description || ''])
                }

                var commands = []
                self.command = function(cmd, description) {
                    commands.push([cmd, description || ''])
                }
                self.getCommands = function() {
                    return commands
                }

                var descriptions = {}
                self.describe = function(key, desc) {
                    if (typeof key === 'object') {
                        Object.keys(key).forEach(function(k) {
                            self.describe(k, key[k])
                        })
                    } else {
                        descriptions[key] = desc
                    }
                }
                self.getDescriptions = function() {
                    return descriptions
                }

                var epilog
                self.epilog = function(msg) {
                    epilog = msg
                }

                var wrap = windowWidth()
                self.wrap = function(cols) {
                    wrap = cols
                }

                var deferY18nLookupPrefix = '__yargsString__:'
                self.deferY18nLookup = function(str) {
                    return deferY18nLookupPrefix + str
                }

                var defaultGroup = 'Options:'
                self.help = function() {
                    normalizeAliases()

                    var demanded = yargs.getDemanded()
                    var groups = yargs.getGroups()
                    var options = yargs.getOptions()
                    var keys = Object.keys(
                        Object.keys(descriptions)
                        .concat(Object.keys(demanded))
                        .concat(Object.keys(options.default))
                        .reduce(function(acc, key) {
                            if (key !== '_') acc[key] = true
                            return acc
                        }, {})
                    )
                    var ui = cliui({
                        width: wrap,
                        wrap: !!wrap
                    })

                    // the usage string.
                    if (usage) {
                        var u = usage.replace(/\$0/g, yargs.$0)
                        ui.div(u + '\n')
                    }

                    // your application's commands, i.e., non-option
                    // arguments populated in '_'.
                    if (commands.length) {
                        ui.div(__('Commands:'))

                        commands.forEach(function(command) {
                            ui.div({ text: command[0], padding: [0, 2, 0, 2], width: maxWidth(commands) + 4 }, { text: command[1] })
                        })

                        ui.div()
                    }

                    // perform some cleanup on the keys array, making it
                    // only include top-level keys not their aliases.
                    var aliasKeys = (Object.keys(options.alias) || [])
                        .concat(Object.keys(yargs.parsed.newAliases) || [])

                    keys = keys.filter(function(key) {
                        return !yargs.parsed.newAliases[key] && aliasKeys.every(function(alias) {
                            return (options.alias[alias] || []).indexOf(key) === -1
                        })
                    })

                    // populate 'Options:' group with any keys that have not
                    // explicitly had a group set.
                    if (!groups[defaultGroup]) groups[defaultGroup] = []
                    addUngroupedKeys(keys, options.alias, groups)

                    // display 'Options:' table along with any custom tables:
                    Object.keys(groups).forEach(function(groupName) {
                        if (!groups[groupName].length) return

                        ui.div(__(groupName))

                        // if we've grouped the key 'f', but 'f' aliases 'foobar',
                        // normalizedKeys should contain only 'foobar'.
                        var normalizedKeys = groups[groupName].map(function(key) {
                            if (~aliasKeys.indexOf(key)) return key
                            for (var i = 0, aliasKey;
                                (aliasKey = aliasKeys[i]) !== undefined; i++) {
                                if (~(options.alias[aliasKey] || []).indexOf(key)) return aliasKey
                            }
                            return key
                        })

                        // actually generate the switches string --foo, -f, --bar.
                        var switches = normalizedKeys.reduce(function(acc, key) {
                            acc[key] = [key].concat(options.alias[key] || [])
                                .map(function(sw) {
                                    return (sw.length > 1 ? '--' : '-') + sw
                                })
                                .join(', ')

                            return acc
                        }, {})

                        normalizedKeys.forEach(function(key) {
                            var kswitch = switches[key]
                            var desc = descriptions[key] || ''
                            var type = null

                            if (~desc.lastIndexOf(deferY18nLookupPrefix)) desc = __(desc.substring(deferY18nLookupPrefix.length))

                            if (~options.boolean.indexOf(key)) type = '[' + __('boolean') + ']'
                            if (~options.count.indexOf(key)) type = '[' + __('count') + ']'
                            if (~options.string.indexOf(key)) type = '[' + __('string') + ']'
                            if (~options.normalize.indexOf(key)) type = '[' + __('string') + ']'
                            if (~options.array.indexOf(key)) type = '[' + __('array') + ']'

                            var extra = [
                                type,
                                demanded[key] ? '[' + __('required') + ']' : null,
                                options.choices && options.choices[key] ? '[' + __('choices:') + ' ' +
                                self.stringifiedValues(options.choices[key]) + ']' : null,
                                defaultString(options.default[key], options.defaultDescription[key])
                            ].filter(Boolean).join(' ')

                            ui.span({ text: kswitch, padding: [0, 2, 0, 2], width: maxWidth(switches) + 4 },
                                desc
                            )

                            if (extra) ui.div({ text: extra, padding: [0, 0, 0, 2], align: 'right' })
                            else ui.div()
                        })

                        ui.div()
                    })

                    // describe some common use-cases for your application.
                    if (examples.length) {
                        ui.div(__('Examples:'))

                        examples.forEach(function(example) {
                            example[0] = example[0].replace(/\$0/g, yargs.$0)
                        })

                        examples.forEach(function(example) {
                            ui.div({ text: example[0], padding: [0, 2, 0, 2], width: maxWidth(examples) + 4 },
                                example[1]
                            )
                        })

                        ui.div()
                    }

                    // the usage string.
                    if (epilog) {
                        var e = epilog.replace(/\$0/g, yargs.$0)
                        ui.div(e + '\n')
                    }

                    return ui.toString()
                }

                // return the maximum width of a string
                // in the left-hand column of a table.
                function maxWidth(table) {
                    var width = 0

                    // table might be of the form [leftColumn],
                    // or {key: leftColumn}}
                    if (!Array.isArray(table)) {
                        table = Object.keys(table).map(function(key) {
                            return [table[key]]
                        })
                    }

                    table.forEach(function(v) {
                        width = Math.max(stringWidth(v[0]), width)
                    })

                    // if we've enabled 'wrap' we should limit
                    // the max-width of the left-column.
                    if (wrap) width = Math.min(width, parseInt(wrap * 0.5, 10))

                    return width
                }

                // make sure any options set for aliases,
                // are copied to the keys being aliased.
                function normalizeAliases() {
                    var demanded = yargs.getDemanded()
                    var options = yargs.getOptions()

                    ;
                    (Object.keys(options.alias) || []).forEach(function(key) {
                        options.alias[key].forEach(function(alias) {
                            // copy descriptions.
                            if (descriptions[alias]) self.describe(key, descriptions[alias])
                                // copy demanded.
                            if (demanded[alias]) yargs.demand(key, demanded[alias].msg)
                                // type messages.
                            if (~options.boolean.indexOf(alias)) yargs.boolean(key)
                            if (~options.count.indexOf(alias)) yargs.count(key)
                            if (~options.string.indexOf(alias)) yargs.string(key)
                            if (~options.normalize.indexOf(alias)) yargs.normalize(key)
                            if (~options.array.indexOf(alias)) yargs.array(key)
                        })
                    })
                }

                // given a set of keys, place any keys that are
                // ungrouped under the 'Options:' grouping.
                function addUngroupedKeys(keys, aliases, groups) {
                    var groupedKeys = []
                    var toCheck = null
                    Object.keys(groups).forEach(function(group) {
                        groupedKeys = groupedKeys.concat(groups[group])
                    })

                    keys.forEach(function(key) {
                        toCheck = [key].concat(aliases[key])
                        if (!toCheck.some(function(k) {
                                return groupedKeys.indexOf(k) !== -1
                            })) {
                            groups[defaultGroup].push(key)
                        }
                    })
                    return groupedKeys
                }

                self.showHelp = function(level) {
                    level = level || 'error'
                    console[level](self.help())
                }

                self.functionDescription = function(fn) {
                    var description = fn.name ? decamelize(fn.name, '-') : __('generated-value')
                    return ['(', description, ')'].join('')
                }

                self.stringifiedValues = function(values, separator) {
                    var string = ''
                    var sep = separator || ', '
                    var array = [].concat(values)

                    if (!values || !array.length) return string

                    array.forEach(function(value) {
                        if (string.length) string += sep
                        string += JSON.stringify(value)
                    })

                    return string
                }

                // format the default-value-string displayed in
                // the right-hand column.
                function defaultString(value, defaultDescription) {
                    var string = '[' + __('default:') + ' '

                    if (value === undefined && !defaultDescription) return null

                    if (defaultDescription) {
                        string += defaultDescription
                    } else {
                        switch (typeof value) {
                            case 'string':
                                string += JSON.stringify(value)
                                break
                            case 'object':
                                string += JSON.stringify(value)
                                break
                            default:
                                string += value
                        }
                    }

                    return string + ']'
                }

                // guess the width of the console window, max-width 80.
                function windowWidth() {
                    return wsize.width ? Math.min(80, wsize.width) : null
                }

                // logic for displaying application version.
                var version = null
                self.version = function(ver, opt, msg) {
                    version = ver
                }

                self.showVersion = function() {
                    if (typeof version === 'function') console.log(version())
                    else console.log(version)
                }

                return self
            }

        }).call(this, require('_process'))
    }, { "_process": 81, "cliui": 3, "decamelize": 9, "string-width": 13, "window-size": 44 }],
    20: [function(require, module, exports) {
        // validation-type-stuff, missing params,
        // bad implications, custom checks.
        module.exports = function(yargs, usage, y18n) {
            var __ = y18n.__
            var __n = y18n.__n
            var self = {}

            // validate appropriate # of non-option
            // arguments were provided, i.e., '_'.
            self.nonOptionCount = function(argv) {
                var demanded = yargs.getDemanded()
                var _s = argv._.length

                if (demanded._ && (_s < demanded._.count || _s > demanded._.max)) {
                    if (demanded._.msg !== undefined) {
                        usage.fail(demanded._.msg)
                    } else if (_s < demanded._.count) {
                        usage.fail(
                            __('Not enough non-option arguments: got %s, need at least %s', argv._.length, demanded._.count)
                        )
                    } else {
                        usage.fail(
                            __('Too many non-option arguments: got %s, maximum of %s', argv._.length, demanded._.max)
                        )
                    }
                }
            }

            // make sure that any args that require an
            // value (--foo=bar), have a value.
            self.missingArgumentValue = function(argv) {
                var defaultValues = [true, false, '']
                var options = yargs.getOptions()

                if (options.requiresArg.length > 0) {
                    var missingRequiredArgs = []

                    options.requiresArg.forEach(function(key) {
                        var value = argv[key]

                        // if a value is explicitly requested,
                        // flag argument as missing if it does not
                        // look like foo=bar was entered.
                        if (~defaultValues.indexOf(value) ||
                            (Array.isArray(value) && !value.length)) {
                            missingRequiredArgs.push(key)
                        }
                    })

                    if (missingRequiredArgs.length > 0) {
                        usage.fail(__n(
                            'Missing argument value: %s',
                            'Missing argument values: %s',
                            missingRequiredArgs.length,
                            missingRequiredArgs.join(', ')
                        ))
                    }
                }
            }

            // make sure all the required arguments are present.
            self.requiredArguments = function(argv) {
                var demanded = yargs.getDemanded()
                var missing = null

                Object.keys(demanded).forEach(function(key) {
                    if (!argv.hasOwnProperty(key)) {
                        missing = missing || {}
                        missing[key] = demanded[key]
                    }
                })

                if (missing) {
                    var customMsgs = []
                    Object.keys(missing).forEach(function(key) {
                        var msg = missing[key].msg
                        if (msg && customMsgs.indexOf(msg) < 0) {
                            customMsgs.push(msg)
                        }
                    })

                    var customMsg = customMsgs.length ? '\n' + customMsgs.join('\n') : ''

                    usage.fail(__n(
                        'Missing required argument: %s',
                        'Missing required arguments: %s',
                        Object.keys(missing).length,
                        Object.keys(missing).join(', ') + customMsg
                    ))
                }
            }

            // check for unknown arguments (strict-mode).
            self.unknownArguments = function(argv, aliases) {
                var aliasLookup = {}
                var descriptions = usage.getDescriptions()
                var demanded = yargs.getDemanded()
                var unknown = []

                Object.keys(aliases).forEach(function(key) {
                    aliases[key].forEach(function(alias) {
                        aliasLookup[alias] = key
                    })
                })

                Object.keys(argv).forEach(function(key) {
                    if (key !== '$0' && key !== '_' &&
                        !descriptions.hasOwnProperty(key) &&
                        !demanded.hasOwnProperty(key) &&
                        !aliasLookup.hasOwnProperty(key)) {
                        unknown.push(key)
                    }
                })

                if (unknown.length > 0) {
                    usage.fail(__n(
                        'Unknown argument: %s',
                        'Unknown arguments: %s',
                        unknown.length,
                        unknown.join(', ')
                    ))
                }
            }

            // validate arguments limited to enumerated choices
            self.limitedChoices = function(argv) {
                var options = yargs.getOptions()
                var invalid = {}

                if (!Object.keys(options.choices).length) return

                Object.keys(argv).forEach(function(key) {
                    if (key !== '$0' && key !== '_' &&
                        options.choices.hasOwnProperty(key)) {
                        [].concat(argv[key]).forEach(function(value) {
                            // TODO case-insensitive configurability
                            if (options.choices[key].indexOf(value) === -1) {
                                invalid[key] = (invalid[key] || []).concat(value)
                            }
                        })
                    }
                })

                var invalidKeys = Object.keys(invalid)

                if (!invalidKeys.length) return

                var msg = __('Invalid values:')
                invalidKeys.forEach(function(key) {
                    msg += '\n  ' + __(
                        'Argument: %s, Given: %s, Choices: %s',
                        key,
                        usage.stringifiedValues(invalid[key]),
                        usage.stringifiedValues(options.choices[key])
                    )
                })
                usage.fail(msg)
            }

            // custom checks, added using the `check` option on yargs.
            var checks = []
            self.check = function(f) {
                checks.push(f)
            }

            self.customChecks = function(argv, aliases) {
                checks.forEach(function(f) {
                    try {
                        var result = f(argv, aliases)
                        if (!result) {
                            usage.fail(__('Argument check failed: %s', f.toString()))
                        } else if (typeof result === 'string') {
                            usage.fail(result)
                        }
                    } catch (err) {
                        usage.fail(err.message ? err.message : err)
                    }
                })
            }

            // check implications, argument foo implies => argument bar.
            var implied = {}
            self.implies = function(key, value) {
                if (typeof key === 'object') {
                    Object.keys(key).forEach(function(k) {
                        self.implies(k, key[k])
                    })
                } else {
                    implied[key] = value
                }
            }
            self.getImplied = function() {
                return implied
            }

            self.implications = function(argv) {
                var implyFail = []

                Object.keys(implied).forEach(function(key) {
                    var num
                    var origKey = key
                    var value = implied[key]

                    // convert string '1' to number 1
                    num = Number(key)
                    key = isNaN(num) ? key : num

                    if (typeof key === 'number') {
                        // check length of argv._
                        key = argv._.length >= key
                    } else if (key.match(/^--no-.+/)) {
                        // check if key doesn't exist
                        key = key.match(/^--no-(.+)/)[1]
                        key = !argv[key]
                    } else {
                        // check if key exists
                        key = argv[key]
                    }

                    num = Number(value)
                    value = isNaN(num) ? value : num

                    if (typeof value === 'number') {
                        value = argv._.length >= value
                    } else if (value.match(/^--no-.+/)) {
                        value = value.match(/^--no-(.+)/)[1]
                        value = !argv[value]
                    } else {
                        value = argv[value]
                    }

                    if (key && !value) {
                        implyFail.push(origKey)
                    }
                })

                if (implyFail.length) {
                    var msg = __('Implications failed:') + '\n'

                    implyFail.forEach(function(key) {
                        msg += ('  ' + key + ' -> ' + implied[key])
                    })

                    usage.fail(msg)
                }
            }

            return self
        }

    }, {}],
    21: [function(require, module, exports) {
        module.exports = {
            "_from": "empeeku@^1.0.2",
            "_id": "empeeku@1.0.2",
            "_inBundle": false,
            "_integrity": "sha512-Q36IARL9oqeTPPmixIsL2bO1Q9qPtLZ6fw1CoYD50GXdYufSv28/yj/BVI+yqPPT/17E6dbOTiglrgCViokGTw==",
            "_location": "/empeeku",
            "_phantomChildren": {
                "camelcase": "2.1.1",
                "cliui": "3.2.0",
                "code-point-at": "1.1.0",
                "decamelize": "1.2.0",
                "number-is-nan": "1.0.1",
                "os-locale": "1.4.0",
                "window-size": "0.1.4",
                "y18n": "3.2.1"
            },
            "_requested": {
                "type": "range",
                "registry": true,
                "raw": "empeeku@^1.0.2",
                "name": "empeeku",
                "escapedName": "empeeku",
                "rawSpec": "^1.0.2",
                "saveSpec": null,
                "fetchSpec": "^1.0.2"
            },
            "_requiredBy": [
                "/heroprotocol"
            ],
            "_resolved": "https://registry.npmjs.org/empeeku/-/empeeku-1.0.2.tgz",
            "_shasum": "0fcc2004b6f81eb275b9bd8aa43ef15ac0a9776c",
            "_spec": "empeeku@^1.0.2",
            "_where": "/Users/leegrisham/Documents/workspace/leagueUp/node_modules/heroprotocol",
            "author": {
                "name": "ajbdev"
            },
            "bugs": {
                "url": "https://github.com/nexus-devtools/empeekujs/issues"
            },
            "bundleDependencies": false,
            "dependencies": {
                "long": "^3.0.3",
                "seek-bzip": "^1.0.5",
                "yargs": "^3.32.0"
            },
            "deprecated": false,
            "description": "Javascript port of mpyq python library for reading MPQ archives.",
            "homepage": "https://github.com/nexus-devtools/empeekujs",
            "keywords": [
                "mpq",
                "blizzard",
                "archive",
                "starcraft",
                "warcraft"
            ],
            "license": "ISC",
            "name": "empeeku",
            "repository": {
                "type": "git",
                "url": "git+https://github.com/nexus-devtools/empeekujs.git"
            },
            "version": "1.0.2"
        }

    }, {}],
    22: [function(require, module, exports) {
        module.exports = stringify
        stringify.default = stringify

        function stringify(obj) {
            decirc(obj, '', [], null)
            return JSON.stringify(obj)
        }

        function Circle(val, k, parent) {
            this.val = val
            this.k = k
            this.parent = parent
            this.count = 1
        }
        Circle.prototype.toJSON = function toJSON() {
            if (--this.count === 0) {
                this.parent[this.k] = this.val
            }
            return '[Circular]'
        }

        function decirc(val, k, stack, parent) {
            if (typeof val === 'object' && val !== null) {
                if (typeof val.toJSON === 'function') {
                    if (val instanceof Circle) {
                        val.count++
                            return
                    }
                    if (val.toJSON.forceDecirc === undefined) {
                        return
                    }
                }
                for (var i = 0; i < stack.length; i++) {
                    if (stack[i] === val) {
                        parent[k] = new Circle(val, k, parent)
                        return
                    }
                }
                stack.push(val)
                for (var key in val) {
                    if (Object.prototype.hasOwnProperty.call(val, key)) {
                        decirc(val[key], key, stack, val)
                    }
                }
                stack.pop()
            }
        }

    }, {}],
    23: [function(require, module, exports) {
        (function(process, Buffer) {
            "use strict";

            const log = require('./pino.js');
            const fs = require('fs');
            const path = require('path');
            const MPQArchive = exports.MPQArchive = require('empeeku/mpyq').MPQArchive;
            const protocol29406 = exports.protocol = require('./lib/protocol29406');
            const version = exports.version = require('./package.json').version;

            try {
                var optional = require('storm-replay');
            } catch (err) {
                optional = null;
                log.warn('heroprotocol.js is using Javascript extraction, which is notably slower and will be re-written in the future. See README.md for more details.');
            }
            const storm = optional;

            // parsable parts
            const HEADER = exports.HEADER = 'header';
            const DETAILS = exports.DETAILS = 'replay.details';
            const INITDATA = exports.INITDATA = 'replay.initdata';
            const GAME_EVENTS = exports.GAME_EVENTS = 'replay.game.events';
            const MESSAGE_EVENTS = exports.MESSAGE_EVENTS = 'replay.message.events';
            const TRACKER_EVENTS = exports.TRACKER_EVENTS = 'replay.tracker.events';
            const ATTRIBUTES_EVENTS = exports.ATTRIBUTES_EVENTS = 'replay.attributes.events';
            const FILES = exports.FILES = [
                HEADER,
                DETAILS,
                INITDATA,
                GAME_EVENTS,
                MESSAGE_EVENTS,
                TRACKER_EVENTS,
                ATTRIBUTES_EVENTS
            ];

            const decoderMap = {
                [HEADER]: 'decodeReplayHeader',
                [DETAILS]: 'decodeReplayDetails',
                [INITDATA]: 'decodeReplayInitdata',
                [GAME_EVENTS]: 'decodeReplayGameEvents',
                [MESSAGE_EVENTS]: 'decodeReplayMessageEvents',
                [TRACKER_EVENTS]: 'decodeReplayTrackerEvents',
                [ATTRIBUTES_EVENTS]: 'decodeReplayAttributesEvents'
            };

            const parseStrings = function parseStrings(data) {
                if (!data) return data;
                else if (data instanceof Buffer) return data.toString();
                else if (Array.isArray(data)) return data.map(item => parseStrings(item));
                else if (typeof data === 'object') {
                    for (let key in data) {
                        data[key] = parseStrings(data[key]);
                    }
                }
                return data;
            };

            let lastUsed, protocol;
            let build = 0;

            const openArchive = function(file, noCache) {
                log.trace('openArchive() : ' + file + ', ' + noCache);
                let archive, header;

                if (!lastUsed || !(lastUsed instanceof MPQArchive) || file !== lastUsed.filename || noCache) {

                    if (typeof file === 'string') {
                        try {
                            if (!path.isAbsolute(file)) {
                                file = path.join(process.cwd(), file);
                            }
                            archive = new MPQArchive(file);
                            archive.filename = file;
                        } catch (err) {
                            archive = err;
                        }
                    } else if (file instanceof MPQArchive) {
                        // TODO - need to check what happens when instanciating an MPQArchive with
                        // invalid path and setup an error accordingly
                        archive = file;
                    } else {
                        archive = new Error('Unsupported parameter: ${file}');
                    }

                    if (archive instanceof Error) return archive;
                    lastUsed = archive;

                    // parse header
                    archive.data = {};
                    header = archive.data[HEADER] = parseStrings(protocol29406.decodeReplayHeader(archive.header.userDataHeader.content));
                    // The header's baseBuild determines which protocol to use
                    archive.baseBuild = build = header.m_version.m_baseBuild;

                    try {
                        archive.protocol = require(`./lib/protocol${archive.baseBuild}`);
                    } catch (err) {
                        archive.error = err;
                    }

                    // set header to proper protocol
                    archive.data[HEADER] = parseStrings(archive.protocol.decodeReplayHeader(archive.header.userDataHeader.content));

                    archive.get = function(file) {
                        return exports.get(file, archive);
                    };

                } else {
                    // load archive from cache
                    archive = lastUsed;
                }

                return archive;
            };

            // ensure non-breaking changes
            exports.get = (file, archive) => {
                log.debug('get() : ' + file + ', ' + archive);
                if (['darwin', 'linux'].indexOf(process.platform) > -1) {
                    return exports.extractFile(file, archive)
                } else {
                    return exports.extractFileJS(file, archive)
                }
            }

            // returns the content of a file in a replay archive
            exports.extractFileJS = function(archiveFile, archive, keys) {
                log.debug('extractFileJS() : ' + archiveFile + ', ' + archive);
                let data;
                archive = openArchive(archive);

                if (archive instanceof Error) {
                    return data;
                }

                if (archive.data[archiveFile] && !keys) {
                    data = archive.data[archiveFile];
                } else {
                    if (archive.protocol) {

                        if ([DETAILS, INITDATA, ATTRIBUTES_EVENTS].indexOf(archiveFile) > -1) {
                            log.trace('extractFileJS() : ' + archiveFile + ' - parsing file');
                            data = archive.data[archiveFile] =
                                parseStrings(archive.protocol[decoderMap[archiveFile]](
                                    archive.readFile(archiveFile)
                                ));
                        } else if ([GAME_EVENTS, MESSAGE_EVENTS, TRACKER_EVENTS].indexOf(archiveFile) > -1) {
                            log.trace('extractFileJS() : ' + archiveFile + ' - parsing lines iteratively');

                            if (keys) {
                                // protocol function to call is a generator
                                data = [];
                                for (let event of archive.protocol[decoderMap[archiveFile]](archive.readFile(archiveFile))) {

                                    keyLoop:
                                    // check validity with whitelisted keys
                                        for (var key in keys) {
                                        for (var i = 0, j = keys[key].length; i < j; i++) {
                                            if (parseStrings(event)[key] === keys[key][i]) {
                                                data.push(parseStrings(event));
                                                break keyLoop;
                                            }
                                        }
                                    }

                                }

                            } else {
                                data = archive.data[archiveFile] = [];
                                for (let event of archive.protocol[decoderMap[archiveFile]](archive.readFile(archiveFile))) {
                                    data.push(parseStrings(event));
                                }
                            }

                        } else {
                            log.trace('extractFileJS() : ' + archiveFile + ' - not parsing');
                            data = archive.data[archiveFile] = archive.readFile(archiveFile);
                        }

                    }
                }

                return data;
            };

            /**
             * extract all files from archive via cpp binding
             * @function
             * @param {string} archive - Path of the MPQ archive
             * @returns {object} Object of files as buffers
             */
            exports.extractFiles = (archive) => {
                if (typeof archive === 'string') {
                    if (!path.isAbsolute(archive)) {
                        archive = path.join(process.cwd(), archive);
                    }
                }
                log.debug('extractFiles() : ' + archive);
                let header = exports.parseHeader(storm.getHeader(archive).content.data);
                let data = [];

                for (var i = FILES.length - 1; i >= 0; i--) {
                    data[FILES[i]] = exports.extractFile(FILES[i], archive);
                }
                return data;
            };

            /**
             * extract all files from archive via cpp binding
             * @function
             * @param {string} file - Filename to extract
             * @param {string} archive - Path of the MPQ archive
             * @returns {object} Object of files as buffers
             */
            exports.extractFile = (file, archive) => {
                if (typeof archive === 'string') {
                    if (!path.isAbsolute(archive)) {
                        archive = path.join(process.cwd(), archive);
                    }
                }
                let build = exports.getVersion(archive);
                log.debug('extractFile() : ' + file + ', ' + archive);

                if (file === 'header') {
                    return exports.parseHeader(storm.getHeader(archive).content.data);
                }

                let result = storm.extractFile(archive, file);
                if (result.success == false) {
                    log.warn(JSON.stringify(result));
                }

                return exports.parseFile(file, result.content.data, build);
            };

            /**
             * gets the build version of the replay, and preloads the decoding library
             * @function
             * @param {string} archive - Path of the MPQ archive
             * @returns {integer} Build number
             */
            exports.getVersion = (archive) => {
                if (typeof archive === 'string') {
                    if (!path.isAbsolute(archive)) {
                        archive = path.join(process.cwd(), archive);
                    }
                }
                let header = exports.parseHeader(storm.getHeader(archive).content.data);
                protocol = require(`./lib/protocol${header.m_dataBuildNum}`);
                build = header.m_dataBuildNum;
                return header.m_dataBuildNum;
            };

            /**
             * parses a basic MPQ header
             * @function
             * @param {buffer} buffer - Header content from MPQ archive
             * @returns {object} Header information from file
             */
            exports.parseHeader = function(buffer) {
                return parseStrings(protocol29406.decodeReplayHeader(buffer));
            };

            /**
             * parses a buffer based on a given build
             * @function
             * @param {string} filename - Name of the file to assist in parsing
             * @param {buffer} buffer - Binary file contents from MPQ archive
             * @param {string} build - Build in which to parse the contents
             * @returns {object} File contents
             */
            exports.parseFile = function(filename, buffer, build) {
                let data, protocol;

                try {
                    protocol = require(`./lib/protocol${build}`);
                } catch (err) {
                    return undefined;
                }

                if ([DETAILS, INITDATA, ATTRIBUTES_EVENTS].indexOf(filename) > -1) {
                    log.trace('parseFile() : ' + filename + " (build " + build + ") - parsing entire file");
                    data = parseStrings(protocol[decoderMap[filename]](buffer));
                } else if ([GAME_EVENTS, MESSAGE_EVENTS, TRACKER_EVENTS].indexOf(filename) > -1) {
                    log.trace('parseFile() : ' + filename + " (build " + build + ") - parsing lines iteratively");
                    data = [];
                    for (let event of protocol[decoderMap[filename]](buffer)) {
                        data.push(parseStrings(event));
                    }
                } else {
                    log.trace('parseFile() : ' + filename + " (build " + build + ") - not parsing");
                    data = buffer;
                }

                return data;
            };

            if (storm !== null) {
                exports.stormVersion = storm.version;
            } else {
                exports.stormVersion = undefined;
            }
        }).call(this, require('_process'), require("buffer").Buffer)
    }, { "./lib/protocol29406": 25, "./package.json": 26, "./pino.js": 27, "_process": 81, "buffer": 61, "empeeku/mpyq": 10, "fs": 52, "path": 79, "storm-replay": 41 }],
    24: [function(require, module, exports) {
        (function(Buffer) {
            /*
            # Copyright (c) 2015 Blizzard Entertainment
            #
            # Permission is hereby granted, free of charge, to any person obtaining a copy
            # of this software and associated documentation files (the "Software"), to deal
            # in the Software without restriction, including without limitation the rights
            # to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            # copies of the Software, and to permit persons to whom the Software is
            # furnished to do so, subject to the following conditions:
            #
            # The above copyright notice and this permission notice shall be included in
            # all copies or substantial portions of the Software.
            #
            # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            # AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
            # THE SOFTWARE.
            */
            "use strict";

            const Long = require('long');

            function TruncateError(message) {
                this.name = 'TruncateError';
                this.message = message || 'truncate error';
                Error.captureStackTrace(this);
            }
            TruncateError.prototype = Object.create(Error.prototype);
            TruncateError.prototype.constructor = TruncateError;
            exports.TruncateError = TruncateError;

            function CorruptedError(message) {
                this.name = 'CorruptedError';
                this.message = message || 'corrupted  error';
                Error.captureStackTrace(this);
            }
            CorruptedError.prototype = Object.create(Error.prototype);
            CorruptedError.prototype.constructor = CorruptedError;
            exports.CorruptedError = CorruptedError;


            function BitPackedBuffer(contents, endian) {
                if (!endian) endian = 'big';

                this._data = contents || [];
                this._used = 0;
                this._next = null;
                this._nextbits = 0;
                this._bigendian = endian === 'big';
            }
            exports.BitPackedBuffer = BitPackedBuffer;

            BitPackedBuffer.prototype.toString = function() {
                console.log(this._data);
                return 'buffer(' +
                    (this._nextbits && this._next || 0).toString(16) + '/' + this._nextbits +
                    ',[' + this._used + ']=' + ((this._used < this._data.length) ? this._data.readUInt8(this._used).toString(16) : '--') +
                    ')';
            };

            BitPackedBuffer.prototype.done = function() {
                return this._nextbits === 0 && this._used >= this._data.length;
            };

            BitPackedBuffer.prototype.usedBits = function() {
                return this._used * 8 - this._nextbits;
            };

            BitPackedBuffer.prototype.byteAlign = function() {
                this._nextbits = 0;
            };

            BitPackedBuffer.prototype.readAlignedBytes = function(bytes) {
                this.byteAlign();
                var data = this._data.slice(this._used, this._used + bytes);
                this._used += bytes;
                if (data.length !== bytes) {
                    throw new TruncateError(this.toString());
                }
                return data;
            };

            BitPackedBuffer.prototype.readBits = function(bits) {
                var result = 0;
                var resultbits = 0;

                while (resultbits !== bits) {
                    if (this._nextbits === 0) {
                        if (this.done()) throw new TruncateError(this.toString());
                        this._next = this._data.readUInt8(this._used);
                        this._used += 1;
                        this._nextbits = 8;
                    }

                    var copybits = Math.min(bits - resultbits, this._nextbits);
                    var copy = this._next & ((1 << copybits) - 1);

                    if (this._bigendian)
                        result |= copy << (bits - resultbits - copybits);
                    else
                        result |= copy << resultbits;

                    this._next >>= copybits;
                    this._nextbits -= copybits;
                    resultbits += copybits;
                }

                return result;
            };

            BitPackedBuffer.prototype.readUnalignedBytes = function(bytes) {
                // not sure, to test
                var buff = new Buffer(bytes);
                for (var i = 0; i < bytes; i += 1) {
                    buff.writeUInt8(this.readBits(8));
                }
                return buff.toString(); // should maybe return buffer instead of string?
            };


            function BitPackedDecoder(contents, typeinfos) {
                this._buffer = new BitPackedBuffer(contents);
                this._typeinfos = typeinfos;
            }
            exports.BitPackedDecoder = BitPackedDecoder;

            BitPackedDecoder.prototype.toString = function() {
                return this._buffer.toString();
            };

            BitPackedDecoder.prototype.instance = function(typeid) {
                if (typeid >= this._typeinfos.length) throw new CorruptedError(this.toString());
                var typeinfo = this._typeinfos[typeid];
                return this[typeinfo[0]].apply(this, typeinfo[1]);
            };

            BitPackedDecoder.prototype.byteAlign = function() {
                this._buffer.byteAlign();
            };

            BitPackedDecoder.prototype.done = function() {
                return this._buffer.done();
            };

            BitPackedDecoder.prototype.usedBits = function() {
                return this._buffer.usedBits();
            };

            BitPackedDecoder.prototype._array = function(bounds, typeid) {
                var length = this._int(bounds);
                var ar = [];
                for (var i = 0; i < length; i += 1) {
                    ar[i] = this.instance(typeid);
                }
                return ar;
            };

            BitPackedDecoder.prototype._bitarray = function(bounds) {
                var length = this._int(bounds);
                return [length, this._buffer.readBits(length)];
            };

            BitPackedDecoder.prototype._blob = function(bounds) {
                var length = this._int(bounds);
                return this._buffer.readAlignedBytes(length);
            };

            BitPackedDecoder.prototype._bool = function() {
                return this._int([0, 1]) !== 0;
            };

            BitPackedDecoder.prototype._choice = function(bounds, fields) {
                var tag = this._int(bounds);
                var field = fields[tag];
                if (!field) throw new CorruptedError(this.toString());
                var ret = {};
                ret[field[0]] = this.instance(field[1]);
                return ret;
            };

            BitPackedDecoder.prototype._fourcc = function() {
                return this._buffer.readUnalignedBytes(4);
            };

            BitPackedDecoder.prototype._int = function(bounds) {
                var value = bounds[0] + this._buffer.readBits(bounds[1]);
                return value;
            };

            BitPackedDecoder.prototype._null = function() {
                return null;
            };

            BitPackedDecoder.prototype._optional = function(typeid) {
                var exists = this._bool();
                return exists ? this.instance(typeid) : null;
            };

            BitPackedDecoder.prototype._real32 = function() {
                return this._buffer.readUnalignedBytes(4).readFloatBE(0);
            };

            BitPackedDecoder.prototype._real64 = function() {
                return this._buffer.readUnalignedBytes(8).readDoubleBE(0);
            };

            BitPackedDecoder.prototype._struct = function(fields) {
                var result = {};

                fields.forEach(field => {
                    if (field[0] === '__parent') {
                        var parent = this.instance(field[1]);
                        if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
                            result = Object.assign(result, parent);
                        } else if (fields.length === 0) {
                            result = parent;
                        } else {
                            result[field[0]] = parent;
                        }
                    } else {
                        result[field[0]] = this.instance(field[1]);
                    }
                });

                return result;
            };


            function VersionDecoder(contents, typeinfos) {
                this._buffer = new BitPackedBuffer(contents);
                this._typeinfos = typeinfos;
            }
            exports.VersionDecoder = VersionDecoder;

            VersionDecoder.prototype.toString = function() {
                return this._buffer.toString();
            };

            VersionDecoder.prototype.instance = function(typeid) {
                if (typeid >= this._typeinfos.length) throw new CorruptedError(this.toString());

                var typeinfo = this._typeinfos[typeid];
                return this[typeinfo[0]].apply(this, typeinfo[1]);
            };

            VersionDecoder.prototype.byteAlign = function() {
                this._buffer.byteAlign();
            };

            VersionDecoder.prototype.done = function() {
                return this._buffer.done();
            };

            VersionDecoder.prototype.usedBits = function() {
                return this._buffer.usedBits();
            };

            VersionDecoder.prototype._expectSkip = function(expected) {
                var r = this._buffer.readBits(8);
                if (r !== expected) throw new CorruptedError(this.toString());
            };

            VersionDecoder.prototype._vint = function() {
                var b = this._buffer.readBits(8);
                var negative = b & 1;
                var result = (b >> 1) & 0x3f;
                var bits = 6;

                while ((b & 0x80) !== 0) {
                    b = this._buffer.readBits(8);
                    // result |= (b & 0x7f) << bits; // Bitwise operators do not work above 32 bits
                    let myLong = new Long;
                    myLong = Long.fromString(result.toString(), false);
                    result = myLong.or((b & 0x7f) * Math.pow(2, bits)).toString();
                    bits += 7;
                }
                result = parseInt(result.toString());
                // console.log(result);
                return negative ? -result : result;
            };

            VersionDecoder.prototype._array = function(bounds, typeid) {
                this._expectSkip(0);
                var length = this._vint();
                var ar = [];
                for (var i = 0; i < length; i += 1) {
                    ar[i] = this.instance(typeid);
                }
                return ar;
            };

            VersionDecoder.prototype._bitarray = function(bounds) {
                this._expectSkip(1);
                var length = this._vint();
                return [length, this._buffer.readAlignedBytes((length + 7) / 8)];
            };

            VersionDecoder.prototype._blob = function(bounds) {
                this._expectSkip(2);
                var length = this._vint();
                return this._buffer.readAlignedBytes(length);
            };

            VersionDecoder.prototype._bool = function() {
                this._expectSkip(6);
                return this._buffer.readBits(8) !== 0;
            };

            VersionDecoder.prototype._choice = function(bounds, fields) {
                this._expectSkip(3);
                var tag = this._vint();
                var field = fields[tag];
                if (!field) {
                    this._skipInstance();
                    return {};
                }
                var ret = {};
                ret[field[0]] = this.instance(field[1]);
                return ret;
            };

            VersionDecoder.prototype._fourcc = function() {
                this._expectSkip(7);
                return this._buffer.readAlignedBytes(4);
            };

            VersionDecoder.prototype._int = function() {
                this._expectSkip(9);
                return this._vint();
            };

            VersionDecoder.prototype._null = function() {
                return null;
            };

            VersionDecoder.prototype._optional = function(typeid) {
                this._expectSkip(4);
                var exists = this._buffer.readBits(8) !== 0;
                return exists ? this.instance(typeid) : null;
            };

            VersionDecoder.prototype._real32 = function() {
                this._expectSkip(7);
                return this._buffer.readAlignedBytes(4).readFloatBE(0);
            };

            VersionDecoder.prototype._real64 = function() {
                this._expectSkip(8);
                return this._buffer.readAlignedBytes(8).readDoubleBE(0);
            };

            VersionDecoder.prototype._struct = function(fields) {
                function matchTag(tag) {
                    return function(field) {
                        return tag === field[2];
                    };
                }
                this._expectSkip(5);

                var result = {};
                var length = this._vint();

                for (var i = 0; i < length; i += 1) {
                    var tag = this._vint();
                    var field = fields.find(matchTag(tag));

                    if (field) {
                        if (field[0] === '__parent') {
                            var parent = this.instance(field[1]);
                            if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
                                result = Object.assign(result, parent);
                            } else if (fields.length === 0) {
                                result = parent;
                            } else {
                                result[field[0]] = parent;
                            }
                        } else {
                            result[field[0]] = this.instance(field[1]);
                        }
                    } else {
                        this._skipInstance();
                    }
                }

                return result;
            };

            VersionDecoder.prototype._skipInstance = function() {
                var skip = this._buffer.readBits(8),
                    length, exists, i, tag;

                if (skip === 0) { // array
                    length = this._vint();
                    for (i = 0; i < length; i += 1) {
                        this._skipInstance();
                    }
                } else if (skip === 1) { // bitblob
                    length = this._vint();
                    this._buffer.readAlignedBytes((length + 7) / 8);
                } else if (skip === 2) { // blob
                    length = this._vint();
                    this._buffer.readAlignedBytes(length);
                } else if (skip === 3) { // choice
                    tag = this._vint();
                    this._skipInstance();
                } else if (skip === 4) { // optional
                    exists = this._buffer.readBits(8) !== 0;
                    if (exists) this._skipInstance();
                } else if (skip === 5) { // struct
                    length = this._vint();
                    for (i = 0; i < length; i += 1) {
                        tag = this._vint();
                        this._skipInstance();
                    }
                } else if (skip === 6) { // u8
                    this._buffer.readAlignedBytes(1);
                } else if (skip === 7) { // u32
                    this._buffer.readAlignedBytes(4);
                } else if (skip === 8) { // u64
                    this._buffer.readAlignedBytes(8);
                } else if (skip === 9) { // vint
                    this._vint();
                }
            };

        }).call(this, require("buffer").Buffer)
    }, { "buffer": 61, "long": 31 }],
    25: [function(require, module, exports) {
        /*
        # Automatically generated at Wed, 14 Nov 2018 21:08:45 GMT
        #
        # Copyright (c) 2015 Blizzard Entertainment
        #
        # Permission is hereby granted, free of charge, to any person obtaining a copy
        # of this software and associated documentation files (the "Software"), to deal
        # in the Software without restriction, including without limitation the rights
        # to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        # copies of the Software, and to permit persons to whom the Software is
        # furnished to do so, subject to the following conditions:
        #
        # The above copyright notice and this permission notice shall be included in
        # all copies or substantial portions of the Software.
        #
        # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        # AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        # THE SOFTWARE.
        */
        "use strict";

        exports.version = 29406;

        const decoders = require('./decoders');
        const BitPackedDecoder = decoders.BitPackedDecoder;
        const VersionDecoder = decoders.VersionDecoder;


        // Decoding instructions for each protocol type.
        const typeinfos = [
            ['_int', [
                [0, 7]
            ]], //0
            ['_int', [
                [0, 4]
            ]], //1
            ['_int', [
                [0, 5]
            ]], //2
            ['_int', [
                [0, 6]
            ]], //3
            ['_int', [
                [0, 14]
            ]], //4
            ['_int', [
                [0, 22]
            ]], //5
            ['_int', [
                [0, 32]
            ]], //6
            ['_choice', [
                [0, 2], { 0: ['m_uint6', 3], 1: ['m_uint14', 4], 2: ['m_uint22', 5], 3: ['m_uint32', 6] }
            ]], //7
            ['_struct', [
                [
                    ['m_userId', 2, -1]
                ]
            ]], //8
            ['_blob', [
                [0, 8]
            ]], //9
            ['_int', [
                [0, 8]
            ]], //10
            ['_struct', [
                [
                    ['m_flags', 10, 0],
                    ['m_major', 10, 1],
                    ['m_minor', 10, 2],
                    ['m_revision', 10, 3],
                    ['m_build', 6, 4],
                    ['m_baseBuild', 6, 5]
                ]
            ]], //11
            ['_int', [
                [0, 3]
            ]], //12
            ['_bool', []], //13
            ['_array', [
                [16, 0], 10
            ]], //14
            ['_optional', [14]], //15
            ['_struct', [
                [
                    ['m_data', 15, 0]
                ]
            ]], //16
            ['_struct', [
                [
                    ['m_signature', 9, 0],
                    ['m_version', 11, 1],
                    ['m_type', 12, 2],
                    ['m_elapsedGameLoops', 6, 3],
                    ['m_useScaledTime', 13, 4],
                    ['m_ngdpRootKey', 16, 5],
                    ['m_dataBuildNum', 6, 6]
                ]
            ]], //17
            ['_fourcc', []], //18
            ['_blob', [
                [0, 7]
            ]], //19
            ['_int', [
                [0, 64]
            ]], //20
            ['_struct', [
                [
                    ['m_region', 10, 0],
                    ['m_programId', 18, 1],
                    ['m_realm', 6, 2],
                    ['m_name', 19, 3],
                    ['m_id', 20, 4]
                ]
            ]], //21
            ['_struct', [
                [
                    ['m_a', 10, 0],
                    ['m_r', 10, 1],
                    ['m_g', 10, 2],
                    ['m_b', 10, 3]
                ]
            ]], //22
            ['_int', [
                [0, 2]
            ]], //23
            ['_optional', [10]], //24
            ['_struct', [
                [
                    ['m_name', 9, 0],
                    ['m_toon', 21, 1],
                    ['m_race', 9, 2],
                    ['m_color', 22, 3],
                    ['m_control', 10, 4],
                    ['m_teamId', 1, 5],
                    ['m_handicap', 0, 6],
                    ['m_observe', 23, 7],
                    ['m_result', 23, 8],
                    ['m_workingSetSlotId', 24, 9],
                    ['m_hero', 9, 10]
                ]
            ]], //25
            ['_array', [
                [0, 5], 25
            ]], //26
            ['_optional', [26]], //27
            ['_blob', [
                [0, 10]
            ]], //28
            ['_blob', [
                [0, 11]
            ]], //29
            ['_struct', [
                [
                    ['m_file', 29, 0]
                ]
            ]], //30
            ['_optional', [13]], //31
            ['_int', [
                [-9223372036854775808, 64]
            ]], //32
            ['_blob', [
                [0, 12]
            ]], //33
            ['_blob', [
                [40, 0]
            ]], //34
            ['_array', [
                [0, 6], 34
            ]], //35
            ['_optional', [35]], //36
            ['_array', [
                [0, 6], 29
            ]], //37
            ['_optional', [37]], //38
            ['_struct', [
                [
                    ['m_playerList', 27, 0],
                    ['m_title', 28, 1],
                    ['m_difficulty', 9, 2],
                    ['m_thumbnail', 30, 3],
                    ['m_isBlizzardMap', 13, 4],
                    ['m_restartAsTransitionMap', 31, 16],
                    ['m_timeUTC', 32, 5],
                    ['m_timeLocalOffset', 32, 6],
                    ['m_description', 33, 7],
                    ['m_imageFilePath', 29, 8],
                    ['m_campaignIndex', 10, 15],
                    ['m_mapFileName', 29, 9],
                    ['m_cacheHandles', 36, 10],
                    ['m_miniSave', 13, 11],
                    ['m_gameSpeed', 12, 12],
                    ['m_defaultDifficulty', 3, 13],
                    ['m_modPaths', 38, 14]
                ]
            ]], //39
            ['_optional', [9]], //40
            ['_optional', [34]], //41
            ['_optional', [6]], //42
            ['_struct', [
                [
                    ['m_race', 24, -1]
                ]
            ]], //43
            ['_struct', [
                [
                    ['m_team', 24, -1]
                ]
            ]], //44
            ['_blob', [
                [0, 9]
            ]], //45
            ['_struct', [
                [
                    ['m_name', 9, -18],
                    ['m_clanTag', 40, -17],
                    ['m_clanLogo', 41, -16],
                    ['m_highestLeague', 24, -15],
                    ['m_combinedRaceLevels', 42, -14],
                    ['m_randomSeed', 6, -13],
                    ['m_racePreference', 43, -12],
                    ['m_teamPreference', 44, -11],
                    ['m_testMap', 13, -10],
                    ['m_testAuto', 13, -9],
                    ['m_examine', 13, -8],
                    ['m_customInterface', 13, -7],
                    ['m_testType', 6, -6],
                    ['m_observe', 23, -5],
                    ['m_hero', 45, -4],
                    ['m_skin', 45, -3],
                    ['m_mount', 45, -2],
                    ['m_toonHandle', 19, -1]
                ]
            ]], //46
            ['_array', [
                [0, 5], 46
            ]], //47
            ['_struct', [
                [
                    ['m_lockTeams', 13, -12],
                    ['m_teamsTogether', 13, -11],
                    ['m_advancedSharedControl', 13, -10],
                    ['m_randomRaces', 13, -9],
                    ['m_battleNet', 13, -8],
                    ['m_amm', 13, -7],
                    ['m_competitive', 13, -6],
                    ['m_noVictoryOrDefeat', 13, -5],
                    ['m_fog', 23, -4],
                    ['m_observers', 23, -3],
                    ['m_userDifficulty', 23, -2],
                    ['m_clientDebugFlags', 20, -1]
                ]
            ]], //48
            ['_int', [
                [1, 4]
            ]], //49
            ['_int', [
                [1, 8]
            ]], //50
            ['_bitarray', [
                [0, 6]
            ]], //51
            ['_bitarray', [
                [0, 8]
            ]], //52
            ['_bitarray', [
                [0, 2]
            ]], //53
            ['_bitarray', [
                [0, 7]
            ]], //54
            ['_struct', [
                [
                    ['m_allowedColors', 51, -6],
                    ['m_allowedRaces', 52, -5],
                    ['m_allowedDifficulty', 51, -4],
                    ['m_allowedControls', 52, -3],
                    ['m_allowedObserveTypes', 53, -2],
                    ['m_allowedAIBuilds', 54, -1]
                ]
            ]], //55
            ['_array', [
                [0, 5], 55
            ]], //56
            ['_struct', [
                [
                    ['m_randomValue', 6, -26],
                    ['m_gameCacheName', 28, -25],
                    ['m_gameOptions', 48, -24],
                    ['m_gameSpeed', 12, -23],
                    ['m_gameType', 12, -22],
                    ['m_maxUsers', 2, -21],
                    ['m_maxObservers', 2, -20],
                    ['m_maxPlayers', 2, -19],
                    ['m_maxTeams', 49, -18],
                    ['m_maxColors', 3, -17],
                    ['m_maxRaces', 50, -16],
                    ['m_maxControls', 10, -15],
                    ['m_mapSizeX', 10, -14],
                    ['m_mapSizeY', 10, -13],
                    ['m_mapFileSyncChecksum', 6, -12],
                    ['m_mapFileName', 29, -11],
                    ['m_mapAuthorName', 9, -10],
                    ['m_modFileSyncChecksum', 6, -9],
                    ['m_slotDescriptions', 56, -8],
                    ['m_defaultDifficulty', 3, -7],
                    ['m_defaultAIBuild', 0, -6],
                    ['m_cacheHandles', 35, -5],
                    ['m_hasExtensionMod', 13, -4],
                    ['m_isBlizzardMap', 13, -3],
                    ['m_isPremadeFFA', 13, -2],
                    ['m_isCoopMode', 13, -1]
                ]
            ]], //57
            ['_optional', [1]], //58
            ['_optional', [2]], //59
            ['_struct', [
                [
                    ['m_color', 59, -1]
                ]
            ]], //60
            ['_array', [
                [0, 17], 6
            ]], //61
            ['_array', [
                [0, 9], 6
            ]], //62
            ['_struct', [
                [
                    ['m_control', 10, -16],
                    ['m_userId', 58, -15],
                    ['m_teamId', 1, -14],
                    ['m_colorPref', 60, -13],
                    ['m_racePref', 43, -12],
                    ['m_difficulty', 3, -11],
                    ['m_aiBuild', 0, -10],
                    ['m_handicap', 0, -9],
                    ['m_observe', 23, -8],
                    ['m_hero', 45, -7],
                    ['m_skin', 45, -6],
                    ['m_mount', 45, -5],
                    ['m_workingSetSlotId', 24, -4],
                    ['m_rewards', 61, -3],
                    ['m_toonHandle', 19, -2],
                    ['m_licenses', 62, -1]
                ]
            ]], //63
            ['_array', [
                [0, 5], 63
            ]], //64
            ['_struct', [
                [
                    ['m_phase', 12, -10],
                    ['m_maxUsers', 2, -9],
                    ['m_maxObservers', 2, -8],
                    ['m_slots', 64, -7],
                    ['m_randomSeed', 6, -6],
                    ['m_hostUserId', 58, -5],
                    ['m_isSinglePlayer', 13, -4],
                    ['m_gameDuration', 6, -3],
                    ['m_defaultDifficulty', 3, -2],
                    ['m_defaultAIBuild', 0, -1]
                ]
            ]], //65
            ['_struct', [
                [
                    ['m_userInitialData', 47, -3],
                    ['m_gameDescription', 57, -2],
                    ['m_lobbyState', 65, -1]
                ]
            ]], //66
            ['_struct', [
                [
                    ['m_syncLobbyState', 66, -1]
                ]
            ]], //67
            ['_struct', [
                [
                    ['m_name', 19, -1]
                ]
            ]], //68
            ['_blob', [
                [0, 6]
            ]], //69
            ['_struct', [
                [
                    ['m_name', 69, -1]
                ]
            ]], //70
            ['_struct', [
                [
                    ['m_name', 69, -3],
                    ['m_type', 6, -2],
                    ['m_data', 19, -1]
                ]
            ]], //71
            ['_struct', [
                [
                    ['m_type', 6, -3],
                    ['m_name', 69, -2],
                    ['m_data', 33, -1]
                ]
            ]], //72
            ['_array', [
                [0, 5], 10
            ]], //73
            ['_struct', [
                [
                    ['m_signature', 73, -2],
                    ['m_toonHandle', 19, -1]
                ]
            ]], //74
            ['_struct', [
                [
                    ['m_gameFullyDownloaded', 13, -11],
                    ['m_developmentCheatsEnabled', 13, -10],
                    ['m_multiplayerCheatsEnabled', 13, -9],
                    ['m_syncChecksummingEnabled', 13, -8],
                    ['m_isMapToMapTransition', 13, -7],
                    ['m_startingRally', 13, -6],
                    ['m_debugPauseEnabled', 13, -5],
                    ['m_platformMac', 13, -4],
                    ['m_baseBuildNum', 6, -3],
                    ['m_buildNum', 6, -2],
                    ['m_versionFlags', 6, -1]
                ]
            ]], //75
            ['_struct', [
                []
            ]], //76
            ['_int', [
                [0, 16]
            ]], //77
            ['_struct', [
                [
                    ['x', 77, -2],
                    ['y', 77, -1]
                ]
            ]], //78
            ['_struct', [
                [
                    ['m_which', 12, -2],
                    ['m_target', 78, -1]
                ]
            ]], //79
            ['_struct', [
                [
                    ['m_fileName', 29, -5],
                    ['m_automatic', 13, -4],
                    ['m_overwrite', 13, -3],
                    ['m_name', 9, -2],
                    ['m_description', 28, -1]
                ]
            ]], //80
            ['_int', [
                [-2147483648, 32]
            ]], //81
            ['_struct', [
                [
                    ['x', 81, -2],
                    ['y', 81, -1]
                ]
            ]], //82
            ['_struct', [
                [
                    ['m_point', 82, -4],
                    ['m_time', 81, -3],
                    ['m_verb', 28, -2],
                    ['m_arguments', 28, -1]
                ]
            ]], //83
            ['_struct', [
                [
                    ['m_data', 83, -1]
                ]
            ]], //84
            ['_int', [
                [0, 21]
            ]], //85
            ['_struct', [
                [
                    ['m_abilLink', 77, -3],
                    ['m_abilCmdIndex', 2, -2],
                    ['m_abilCmdData', 24, -1]
                ]
            ]], //86
            ['_optional', [86]], //87
            ['_null', []], //88
            ['_int', [
                [0, 20]
            ]], //89
            ['_struct', [
                [
                    ['x', 89, -3],
                    ['y', 89, -2],
                    ['z', 81, -1]
                ]
            ]], //90
            ['_struct', [
                [
                    ['m_targetUnitFlags', 77, -7],
                    ['m_timer', 10, -6],
                    ['m_tag', 6, -5],
                    ['m_snapshotUnitLink', 77, -4],
                    ['m_snapshotControlPlayerId', 58, -3],
                    ['m_snapshotUpkeepPlayerId', 58, -2],
                    ['m_snapshotPoint', 90, -1]
                ]
            ]], //91
            ['_choice', [
                [0, 2], { 0: ['None', 88], 1: ['TargetPoint', 90], 2: ['TargetUnit', 91], 3: ['Data', 6] }
            ]], //92
            ['_struct', [
                [
                    ['m_cmdFlags', 85, -5],
                    ['m_abil', 87, -4],
                    ['m_data', 92, -3],
                    ['m_otherUnit', 42, -2],
                    ['m_unitGroup', 42, -1]
                ]
            ]], //93
            ['_int', [
                [0, 9]
            ]], //94
            ['_bitarray', [
                [0, 9]
            ]], //95
            ['_array', [
                [0, 9], 94
            ]], //96
            ['_choice', [
                [0, 2], { 0: ['None', 88], 1: ['Mask', 95], 2: ['OneIndices', 96], 3: ['ZeroIndices', 96] }
            ]], //97
            ['_struct', [
                [
                    ['m_unitLink', 77, -4],
                    ['m_subgroupPriority', 10, -3],
                    ['m_intraSubgroupPriority', 10, -2],
                    ['m_count', 94, -1]
                ]
            ]], //98
            ['_array', [
                [0, 9], 98
            ]], //99
            ['_struct', [
                [
                    ['m_subgroupIndex', 94, -4],
                    ['m_removeMask', 97, -3],
                    ['m_addSubgroups', 99, -2],
                    ['m_addUnitTags', 62, -1]
                ]
            ]], //100
            ['_struct', [
                [
                    ['m_controlGroupId', 1, -2],
                    ['m_delta', 100, -1]
                ]
            ]], //101
            ['_struct', [
                [
                    ['m_controlGroupIndex', 1, -3],
                    ['m_controlGroupUpdate', 23, -2],
                    ['m_mask', 97, -1]
                ]
            ]], //102
            ['_struct', [
                [
                    ['m_count', 94, -6],
                    ['m_subgroupCount', 94, -5],
                    ['m_activeSubgroupIndex', 94, -4],
                    ['m_unitTagsChecksum', 6, -3],
                    ['m_subgroupIndicesChecksum', 6, -2],
                    ['m_subgroupsChecksum', 6, -1]
                ]
            ]], //103
            ['_struct', [
                [
                    ['m_controlGroupId', 1, -2],
                    ['m_selectionSyncData', 103, -1]
                ]
            ]], //104
            ['_array', [
                [0, 3], 81
            ]], //105
            ['_struct', [
                [
                    ['m_recipientId', 1, -2],
                    ['m_resources', 105, -1]
                ]
            ]], //106
            ['_struct', [
                [
                    ['m_chatMessage', 28, -1]
                ]
            ]], //107
            ['_int', [
                [-128, 8]
            ]], //108
            ['_struct', [
                [
                    ['x', 81, -3],
                    ['y', 81, -2],
                    ['z', 81, -1]
                ]
            ]], //109
            ['_struct', [
                [
                    ['m_beacon', 108, -9],
                    ['m_ally', 108, -8],
                    ['m_flags', 108, -7],
                    ['m_build', 108, -6],
                    ['m_targetUnitTag', 6, -5],
                    ['m_targetUnitSnapshotUnitLink', 77, -4],
                    ['m_targetUnitSnapshotUpkeepPlayerId', 108, -3],
                    ['m_targetUnitSnapshotControlPlayerId', 108, -2],
                    ['m_targetPoint', 109, -1]
                ]
            ]], //110
            ['_struct', [
                [
                    ['m_speed', 12, -1]
                ]
            ]], //111
            ['_struct', [
                [
                    ['m_delta', 108, -1]
                ]
            ]], //112
            ['_struct', [
                [
                    ['m_point', 82, -4],
                    ['m_unit', 6, -3],
                    ['m_pingedMinimap', 13, -2],
                    ['m_option', 81, -1]
                ]
            ]], //113
            ['_struct', [
                [
                    ['m_verb', 28, -2],
                    ['m_arguments', 28, -1]
                ]
            ]], //114
            ['_struct', [
                [
                    ['m_alliance', 6, -2],
                    ['m_control', 6, -1]
                ]
            ]], //115
            ['_struct', [
                [
                    ['m_unitTag', 6, -1]
                ]
            ]], //116
            ['_struct', [
                [
                    ['m_unitTag', 6, -2],
                    ['m_flags', 10, -1]
                ]
            ]], //117
            ['_struct', [
                [
                    ['m_conversationId', 81, -2],
                    ['m_replyId', 81, -1]
                ]
            ]], //118
            ['_optional', [19]], //119
            ['_struct', [
                [
                    ['m_gameUserId', 1, -6],
                    ['m_observe', 23, -5],
                    ['m_name', 9, -4],
                    ['m_toonHandle', 119, -3],
                    ['m_clanTag', 40, -2],
                    ['m_clanLogo', 41, -1]
                ]
            ]], //120
            ['_array', [
                [0, 5], 120
            ]], //121
            ['_int', [
                [0, 1]
            ]], //122
            ['_struct', [
                [
                    ['m_userInfos', 121, -2],
                    ['m_method', 122, -1]
                ]
            ]], //123
            ['_struct', [
                [
                    ['m_purchaseItemId', 81, -1]
                ]
            ]], //124
            ['_struct', [
                [
                    ['m_difficultyLevel', 81, -1]
                ]
            ]], //125
            ['_choice', [
                [0, 3], { 0: ['None', 88], 1: ['Checked', 13], 2: ['ValueChanged', 6], 3: ['SelectionChanged', 81], 4: ['TextChanged', 29], 5: ['MouseButton', 6] }
            ]], //126
            ['_struct', [
                [
                    ['m_controlId', 81, -3],
                    ['m_eventType', 81, -2],
                    ['m_eventData', 126, -1]
                ]
            ]], //127
            ['_struct', [
                [
                    ['m_soundHash', 6, -2],
                    ['m_length', 6, -1]
                ]
            ]], //128
            ['_array', [
                [0, 7], 6
            ]], //129
            ['_struct', [
                [
                    ['m_soundHash', 129, -2],
                    ['m_length', 129, -1]
                ]
            ]], //130
            ['_struct', [
                [
                    ['m_syncInfo', 130, -1]
                ]
            ]], //131
            ['_struct', [
                [
                    ['m_queryId', 77, -3],
                    ['m_lengthMs', 6, -2],
                    ['m_finishGameLoop', 6, -1]
                ]
            ]], //132
            ['_struct', [
                [
                    ['m_queryId', 77, -2],
                    ['m_lengthMs', 6, -1]
                ]
            ]], //133
            ['_struct', [
                [
                    ['m_animWaitQueryId', 77, -1]
                ]
            ]], //134
            ['_struct', [
                [
                    ['m_sound', 6, -1]
                ]
            ]], //135
            ['_struct', [
                [
                    ['m_transmissionId', 81, -2],
                    ['m_thread', 6, -1]
                ]
            ]], //136
            ['_struct', [
                [
                    ['m_transmissionId', 81, -1]
                ]
            ]], //137
            ['_optional', [78]], //138
            ['_optional', [77]], //139
            ['_optional', [108]], //140
            ['_struct', [
                [
                    ['m_target', 138, -5],
                    ['m_distance', 139, -4],
                    ['m_pitch', 139, -3],
                    ['m_yaw', 139, -2],
                    ['m_reason', 140, -1]
                ]
            ]], //141
            ['_struct', [
                [
                    ['m_skipType', 122, -1]
                ]
            ]], //142
            ['_int', [
                [0, 11]
            ]], //143
            ['_struct', [
                [
                    ['x', 143, -2],
                    ['y', 143, -1]
                ]
            ]], //144
            ['_struct', [
                [
                    ['m_button', 6, -5],
                    ['m_down', 13, -4],
                    ['m_posUI', 144, -3],
                    ['m_posWorld', 90, -2],
                    ['m_flags', 108, -1]
                ]
            ]], //145
            ['_struct', [
                [
                    ['m_posUI', 144, -3],
                    ['m_posWorld', 90, -2],
                    ['m_flags', 108, -1]
                ]
            ]], //146
            ['_struct', [
                [
                    ['m_achievementLink', 77, -1]
                ]
            ]], //147
            ['_struct', [
                [
                    ['m_abilLink', 77, -3],
                    ['m_abilCmdIndex', 2, -2],
                    ['m_state', 108, -1]
                ]
            ]], //148
            ['_struct', [
                [
                    ['m_soundtrack', 6, -1]
                ]
            ]], //149
            ['_struct', [
                [
                    ['m_planetId', 81, -1]
                ]
            ]], //150
            ['_struct', [
                [
                    ['m_key', 108, -2],
                    ['m_flags', 108, -1]
                ]
            ]], //151
            ['_struct', [
                [
                    ['m_resources', 105, -1]
                ]
            ]], //152
            ['_struct', [
                [
                    ['m_fulfillRequestId', 81, -1]
                ]
            ]], //153
            ['_struct', [
                [
                    ['m_cancelRequestId', 81, -1]
                ]
            ]], //154
            ['_struct', [
                [
                    ['m_researchItemId', 81, -1]
                ]
            ]], //155
            ['_struct', [
                [
                    ['m_mercenaryId', 81, -1]
                ]
            ]], //156
            ['_struct', [
                [
                    ['m_battleReportId', 81, -2],
                    ['m_difficultyLevel', 81, -1]
                ]
            ]], //157
            ['_struct', [
                [
                    ['m_battleReportId', 81, -1]
                ]
            ]], //158
            ['_int', [
                [0, 19]
            ]], //159
            ['_struct', [
                [
                    ['m_decrementMs', 159, -1]
                ]
            ]], //160
            ['_struct', [
                [
                    ['m_portraitId', 81, -1]
                ]
            ]], //161
            ['_struct', [
                [
                    ['m_functionName', 19, -1]
                ]
            ]], //162
            ['_struct', [
                [
                    ['m_result', 81, -1]
                ]
            ]], //163
            ['_struct', [
                [
                    ['m_gameMenuItemIndex', 81, -1]
                ]
            ]], //164
            ['_struct', [
                [
                    ['m_purchaseCategoryId', 81, -1]
                ]
            ]], //165
            ['_struct', [
                [
                    ['m_button', 77, -1]
                ]
            ]], //166
            ['_struct', [
                [
                    ['m_cutsceneId', 81, -2],
                    ['m_bookmarkName', 19, -1]
                ]
            ]], //167
            ['_struct', [
                [
                    ['m_cutsceneId', 81, -1]
                ]
            ]], //168
            ['_struct', [
                [
                    ['m_cutsceneId', 81, -3],
                    ['m_conversationLine', 19, -2],
                    ['m_altConversationLine', 19, -1]
                ]
            ]], //169
            ['_struct', [
                [
                    ['m_cutsceneId', 81, -2],
                    ['m_conversationLine', 19, -1]
                ]
            ]], //170
            ['_struct', [
                [
                    ['m_observe', 23, -5],
                    ['m_name', 9, -4],
                    ['m_toonHandle', 119, -3],
                    ['m_clanTag', 40, -2],
                    ['m_clanLogo', 41, -1]
                ]
            ]], //171
            ['_struct', [
                [
                    ['m_state', 23, -1]
                ]
            ]], //172
            ['_struct', [
                [
                    ['m_target', 90, -1]
                ]
            ]], //173
            ['_struct', [
                [
                    ['m_target', 91, -1]
                ]
            ]], //174
            ['_struct', [
                [
                    ['m_catalog', 10, -4],
                    ['m_entry', 77, -3],
                    ['m_field', 9, -2],
                    ['m_value', 9, -1]
                ]
            ]], //175
            ['_struct', [
                [
                    ['m_heroLink', 77, -4],
                    ['m_talentLink', 77, -3],
                    ['m_tier', 6, -2],
                    ['m_column', 6, -1]
                ]
            ]], //176
            ['_struct', [
                [
                    ['m_talent', 176, -1]
                ]
            ]], //177
            ['_struct', [
                [
                    ['m_recipient', 12, -2],
                    ['m_string', 29, -1]
                ]
            ]], //178
            ['_struct', [
                [
                    ['m_recipient', 12, -2],
                    ['m_point', 82, -1]
                ]
            ]], //179
            ['_struct', [
                [
                    ['m_progress', 81, -1]
                ]
            ]], //180
            ['_struct', [
                [
                    ['m_status', 23, -1]
                ]
            ]], //181
            ['_struct', [
                [
                    ['m_scoreValueMineralsCurrent', 81, 0],
                    ['m_scoreValueVespeneCurrent', 81, 1],
                    ['m_scoreValueMineralsCollectionRate', 81, 2],
                    ['m_scoreValueVespeneCollectionRate', 81, 3],
                    ['m_scoreValueWorkersActiveCount', 81, 4],
                    ['m_scoreValueMineralsUsedInProgressArmy', 81, 5],
                    ['m_scoreValueMineralsUsedInProgressEconomy', 81, 6],
                    ['m_scoreValueMineralsUsedInProgressTechnology', 81, 7],
                    ['m_scoreValueVespeneUsedInProgressArmy', 81, 8],
                    ['m_scoreValueVespeneUsedInProgressEconomy', 81, 9],
                    ['m_scoreValueVespeneUsedInProgressTechnology', 81, 10],
                    ['m_scoreValueMineralsUsedCurrentArmy', 81, 11],
                    ['m_scoreValueMineralsUsedCurrentEconomy', 81, 12],
                    ['m_scoreValueMineralsUsedCurrentTechnology', 81, 13],
                    ['m_scoreValueVespeneUsedCurrentArmy', 81, 14],
                    ['m_scoreValueVespeneUsedCurrentEconomy', 81, 15],
                    ['m_scoreValueVespeneUsedCurrentTechnology', 81, 16],
                    ['m_scoreValueMineralsLostArmy', 81, 17],
                    ['m_scoreValueMineralsLostEconomy', 81, 18],
                    ['m_scoreValueMineralsLostTechnology', 81, 19],
                    ['m_scoreValueVespeneLostArmy', 81, 20],
                    ['m_scoreValueVespeneLostEconomy', 81, 21],
                    ['m_scoreValueVespeneLostTechnology', 81, 22],
                    ['m_scoreValueMineralsKilledArmy', 81, 23],
                    ['m_scoreValueMineralsKilledEconomy', 81, 24],
                    ['m_scoreValueMineralsKilledTechnology', 81, 25],
                    ['m_scoreValueVespeneKilledArmy', 81, 26],
                    ['m_scoreValueVespeneKilledEconomy', 81, 27],
                    ['m_scoreValueVespeneKilledTechnology', 81, 28],
                    ['m_scoreValueFoodUsed', 81, 29],
                    ['m_scoreValueFoodMade', 81, 30],
                    ['m_scoreValueMineralsUsedActiveForces', 81, 31],
                    ['m_scoreValueVespeneUsedActiveForces', 81, 32],
                    ['m_scoreValueMineralsFriendlyFireArmy', 81, 33],
                    ['m_scoreValueMineralsFriendlyFireEconomy', 81, 34],
                    ['m_scoreValueMineralsFriendlyFireTechnology', 81, 35],
                    ['m_scoreValueVespeneFriendlyFireArmy', 81, 36],
                    ['m_scoreValueVespeneFriendlyFireEconomy', 81, 37],
                    ['m_scoreValueVespeneFriendlyFireTechnology', 81, 38]
                ]
            ]], //182
            ['_struct', [
                [
                    ['m_playerId', 1, 0],
                    ['m_stats', 182, 1]
                ]
            ]], //183
            ['_struct', [
                [
                    ['m_unitTagIndex', 6, 0],
                    ['m_unitTagRecycle', 6, 1],
                    ['m_unitTypeName', 28, 2],
                    ['m_controlPlayerId', 1, 3],
                    ['m_upkeepPlayerId', 1, 4],
                    ['m_x', 10, 5],
                    ['m_y', 10, 6]
                ]
            ]], //184
            ['_struct', [
                [
                    ['m_unitTagIndex', 6, 0],
                    ['m_unitTagRecycle', 6, 1],
                    ['m_killerPlayerId', 58, 2],
                    ['m_x', 10, 3],
                    ['m_y', 10, 4],
                    ['m_killerUnitTagIndex', 42, 5],
                    ['m_killerUnitTagRecycle', 42, 6]
                ]
            ]], //185
            ['_struct', [
                [
                    ['m_unitTagIndex', 6, 0],
                    ['m_unitTagRecycle', 6, 1],
                    ['m_controlPlayerId', 1, 2],
                    ['m_upkeepPlayerId', 1, 3]
                ]
            ]], //186
            ['_struct', [
                [
                    ['m_unitTagIndex', 6, 0],
                    ['m_unitTagRecycle', 6, 1],
                    ['m_unitTypeName', 28, 2]
                ]
            ]], //187
            ['_struct', [
                [
                    ['m_playerId', 1, 0],
                    ['m_upgradeTypeName', 28, 1],
                    ['m_count', 81, 2]
                ]
            ]], //188
            ['_struct', [
                [
                    ['m_unitTagIndex', 6, 0],
                    ['m_unitTagRecycle', 6, 1]
                ]
            ]], //189
            ['_array', [
                [0, 10], 81
            ]], //190
            ['_struct', [
                [
                    ['m_firstUnitIndex', 6, 0],
                    ['m_items', 190, 1]
                ]
            ]], //191
            ['_struct', [
                [
                    ['m_playerId', 1, 0],
                    ['m_type', 6, 1],
                    ['m_userId', 42, 2],
                    ['m_slotId', 42, 3]
                ]
            ]] //192
        ];

        // Map from protocol NNet.Game.*Event eventid to [typeid, name]
        const game_event_types = {
            5: [76, 'NNet.Game.SUserFinishedLoadingSyncEvent'],
            7: [75, 'NNet.Game.SUserOptionsEvent'],
            9: [68, 'NNet.Game.SBankFileEvent'],
            10: [70, 'NNet.Game.SBankSectionEvent'],
            11: [71, 'NNet.Game.SBankKeyEvent'],
            12: [72, 'NNet.Game.SBankValueEvent'],
            13: [74, 'NNet.Game.SBankSignatureEvent'],
            14: [79, 'NNet.Game.SCameraSaveEvent'],
            21: [80, 'NNet.Game.SSaveGameEvent'],
            22: [76, 'NNet.Game.SSaveGameDoneEvent'],
            23: [76, 'NNet.Game.SLoadGameDoneEvent'],
            26: [84, 'NNet.Game.SGameCheatEvent'],
            27: [93, 'NNet.Game.SCmdEvent'],
            28: [101, 'NNet.Game.SSelectionDeltaEvent'],
            29: [102, 'NNet.Game.SControlGroupUpdateEvent'],
            30: [104, 'NNet.Game.SSelectionSyncCheckEvent'],
            31: [106, 'NNet.Game.SResourceTradeEvent'],
            32: [107, 'NNet.Game.STriggerChatMessageEvent'],
            33: [110, 'NNet.Game.SAICommunicateEvent'],
            34: [111, 'NNet.Game.SSetAbsoluteGameSpeedEvent'],
            35: [112, 'NNet.Game.SAddAbsoluteGameSpeedEvent'],
            36: [113, 'NNet.Game.STriggerPingEvent'],
            37: [114, 'NNet.Game.SBroadcastCheatEvent'],
            38: [115, 'NNet.Game.SAllianceEvent'],
            39: [116, 'NNet.Game.SUnitClickEvent'],
            40: [117, 'NNet.Game.SUnitHighlightEvent'],
            41: [118, 'NNet.Game.STriggerReplySelectedEvent'],
            43: [123, 'NNet.Game.SHijackReplayGameEvent'],
            44: [76, 'NNet.Game.STriggerSkippedEvent'],
            45: [128, 'NNet.Game.STriggerSoundLengthQueryEvent'],
            46: [135, 'NNet.Game.STriggerSoundOffsetEvent'],
            47: [136, 'NNet.Game.STriggerTransmissionOffsetEvent'],
            48: [137, 'NNet.Game.STriggerTransmissionCompleteEvent'],
            49: [141, 'NNet.Game.SCameraUpdateEvent'],
            50: [76, 'NNet.Game.STriggerAbortMissionEvent'],
            51: [124, 'NNet.Game.STriggerPurchaseMadeEvent'],
            52: [76, 'NNet.Game.STriggerPurchaseExitEvent'],
            53: [125, 'NNet.Game.STriggerPlanetMissionLaunchedEvent'],
            54: [76, 'NNet.Game.STriggerPlanetPanelCanceledEvent'],
            55: [127, 'NNet.Game.STriggerDialogControlEvent'],
            56: [131, 'NNet.Game.STriggerSoundLengthSyncEvent'],
            57: [142, 'NNet.Game.STriggerConversationSkippedEvent'],
            58: [145, 'NNet.Game.STriggerMouseClickedEvent'],
            59: [146, 'NNet.Game.STriggerMouseMovedEvent'],
            60: [147, 'NNet.Game.SAchievementAwardedEvent'],
            62: [148, 'NNet.Game.STriggerTargetModeUpdateEvent'],
            63: [76, 'NNet.Game.STriggerPlanetPanelReplayEvent'],
            64: [149, 'NNet.Game.STriggerSoundtrackDoneEvent'],
            65: [150, 'NNet.Game.STriggerPlanetMissionSelectedEvent'],
            66: [151, 'NNet.Game.STriggerKeyPressedEvent'],
            67: [162, 'NNet.Game.STriggerMovieFunctionEvent'],
            68: [76, 'NNet.Game.STriggerPlanetPanelBirthCompleteEvent'],
            69: [76, 'NNet.Game.STriggerPlanetPanelDeathCompleteEvent'],
            70: [152, 'NNet.Game.SResourceRequestEvent'],
            71: [153, 'NNet.Game.SResourceRequestFulfillEvent'],
            72: [154, 'NNet.Game.SResourceRequestCancelEvent'],
            73: [76, 'NNet.Game.STriggerResearchPanelExitEvent'],
            74: [76, 'NNet.Game.STriggerResearchPanelPurchaseEvent'],
            75: [155, 'NNet.Game.STriggerResearchPanelSelectionChangedEvent'],
            77: [76, 'NNet.Game.STriggerMercenaryPanelExitEvent'],
            78: [76, 'NNet.Game.STriggerMercenaryPanelPurchaseEvent'],
            79: [156, 'NNet.Game.STriggerMercenaryPanelSelectionChangedEvent'],
            80: [76, 'NNet.Game.STriggerVictoryPanelExitEvent'],
            81: [76, 'NNet.Game.STriggerBattleReportPanelExitEvent'],
            82: [157, 'NNet.Game.STriggerBattleReportPanelPlayMissionEvent'],
            83: [158, 'NNet.Game.STriggerBattleReportPanelPlaySceneEvent'],
            84: [158, 'NNet.Game.STriggerBattleReportPanelSelectionChangedEvent'],
            85: [125, 'NNet.Game.STriggerVictoryPanelPlayMissionAgainEvent'],
            86: [76, 'NNet.Game.STriggerMovieStartedEvent'],
            87: [76, 'NNet.Game.STriggerMovieFinishedEvent'],
            88: [160, 'NNet.Game.SDecrementGameTimeRemainingEvent'],
            89: [161, 'NNet.Game.STriggerPortraitLoadedEvent'],
            90: [163, 'NNet.Game.STriggerCustomDialogDismissedEvent'],
            91: [164, 'NNet.Game.STriggerGameMenuItemSelectedEvent'],
            93: [124, 'NNet.Game.STriggerPurchasePanelSelectedPurchaseItemChangedEvent'],
            94: [165, 'NNet.Game.STriggerPurchasePanelSelectedPurchaseCategoryChangedEvent'],
            95: [166, 'NNet.Game.STriggerButtonPressedEvent'],
            96: [76, 'NNet.Game.STriggerGameCreditsFinishedEvent'],
            97: [167, 'NNet.Game.STriggerCutsceneBookmarkFiredEvent'],
            98: [168, 'NNet.Game.STriggerCutsceneEndSceneFiredEvent'],
            99: [169, 'NNet.Game.STriggerCutsceneConversationLineEvent'],
            100: [170, 'NNet.Game.STriggerCutsceneConversationLineMissingEvent'],
            101: [76, 'NNet.Game.SGameUserLeaveEvent'],
            102: [171, 'NNet.Game.SGameUserJoinEvent'],
            103: [172, 'NNet.Game.SCommandManagerStateEvent'],
            104: [173, 'NNet.Game.SCommandManagerTargetPointEvent'],
            105: [174, 'NNet.Game.SCommandManagerTargetUnitEvent'],
            106: [132, 'NNet.Game.STriggerAnimLengthQueryByNameEvent'],
            107: [133, 'NNet.Game.STriggerAnimLengthQueryByPropsEvent'],
            108: [134, 'NNet.Game.STriggerAnimOffsetEvent'],
            109: [175, 'NNet.Game.SCatalogModifyEvent'],
            110: [177, 'NNet.Game.SHeroTalentSelectedEvent']
        };

        // The typeid of the NNet.Game.EEventId enum.
        const game_eventid_typeid = 0;

        // Map from protocol NNet.Game.*Message eventid to [typeid, name]
        const message_event_types = {
            0: [178, 'NNet.Game.SChatMessage'],
            1: [179, 'NNet.Game.SPingMessage'],
            2: [180, 'NNet.Game.SLoadingProgressMessage'],
            3: [76, 'NNet.Game.SServerPingMessage'],
            4: [181, 'NNet.Game.SReconnectNotifyMessage']
        };

        // The typeid of the NNet.Game.EMessageId enum.
        const message_eventid_typeid = 1;

        // Map from protocol NNet.Replay.Tracker.*Event eventid to [typeid, name]
        const tracker_event_types = {
            0: [183, 'NNet.Replay.Tracker.SPlayerStatsEvent'],
            1: [184, 'NNet.Replay.Tracker.SUnitBornEvent'],
            2: [185, 'NNet.Replay.Tracker.SUnitDiedEvent'],
            3: [186, 'NNet.Replay.Tracker.SUnitOwnerChangeEvent'],
            4: [187, 'NNet.Replay.Tracker.SUnitTypeChangeEvent'],
            5: [188, 'NNet.Replay.Tracker.SUpgradeEvent'],
            6: [184, 'NNet.Replay.Tracker.SUnitInitEvent'],
            7: [189, 'NNet.Replay.Tracker.SUnitDoneEvent'],
            8: [191, 'NNet.Replay.Tracker.SUnitPositionsEvent'],
            9: [192, 'NNet.Replay.Tracker.SPlayerSetupEvent']
        };

        // The typeid of the NNet.Replay.Tracker.EEventId enum.
        const tracker_eventid_typeid = 2;

        // The typeid of NNet.SVarUint32 (the type used to encode gameloop deltas).
        const svaruint32_typeid = 7;

        // The typeid of NNet.Replay.SGameUserId (the type used to encode player ids).
        const replay_userid_typeid = 8;

        // The typeid of NNet.Replay.SHeader (the type used to store replay game version and length).
        const replay_header_typeid = 17;

        // The typeid of NNet.Game.SDetails (the type used to store overall replay details).
        const game_details_typeid = 39;

        // The typeid of NNet.Replay.SInitData (the type used to store the inital lobby).
        const replay_initdata_typeid = 67;

        // not sure if correct port
        function _varuint32Value(value) {
            // Returns the numeric value from a SVarUint32 instance.
            return value[Object.keys(value)[0]];
        }

        function* _decode_event_stream(decoder, eventidTypeid, eventTypes, decodeUserId) {
            // Decodes events prefixed with a gameloop and possibly userid
            var gameloop = 0;
            while (!decoder.done()) {
                var startBits = decoder.usedBits();

                // decode the gameloop delta before each event
                var delta = _varuint32Value(decoder.instance(svaruint32_typeid));
                gameloop += delta;

                // decode the userid before each event
                var userid = (decodeUserId === true) ? decoder.instance(replay_userid_typeid) : undefined;

                // decode the event id
                var eventid = decoder.instance(eventidTypeid);
                var eventType = eventTypes[eventid] || [null, null];
                var typeid = eventType[0];
                var typename = eventType[1];
                if (typeid === null) throw new decoders.CorruptedError('eventid(' + eventid + ') at ' + decoder.toString());

                // decode the event struct instance
                var event = decoder.instance(typeid);
                event._event = typename;
                event._eventid = eventid;

                // insert gameloop and userid
                event._gameloop = gameloop;
                if (decodeUserId) event._userid = userid;

                // the next event is byte aligned
                decoder.byteAlign();

                // insert bits used in stream
                event._bits = decoder.usedBits() - startBits;

                yield event;
            }
        }

        exports.decodeReplayGameEvents = function*(contents) {
            // Decodes and yields each game event from the contents byte string.
            const decoder = new BitPackedDecoder(contents, typeinfos);
            for (let event of _decode_event_stream(decoder, game_eventid_typeid, game_event_types, true))
                yield event;
        };

        exports.decodeReplayMessageEvents = function*(contents) {
            // Decodes and yields each message event from the contents byte string.
            const decoder = new BitPackedDecoder(contents, typeinfos);
            for (let event of _decode_event_stream(decoder, message_eventid_typeid, message_event_types, true))
                yield event;
        };

        exports.decodeReplayTrackerEvents = function*(contents) {
            // Decodes and yields each tracker event from the contents byte string.
            const decoder = new VersionDecoder(contents, typeinfos);
            for (let event of _decode_event_stream(decoder, tracker_eventid_typeid, tracker_event_types, false))
                yield event;
        };

        exports.decodeReplayHeader = function(contents) {
            // Decodes and return the replay header from the contents byte string.
            const decoder = new VersionDecoder(contents, typeinfos);
            return decoder.instance(replay_header_typeid);
        };

        exports.decodeReplayDetails = function(contents) {
            // Decodes and returns the game details from the contents byte string.
            const decoder = new VersionDecoder(contents, typeinfos);
            return decoder.instance(game_details_typeid);
        };

        exports.decodeReplayInitdata = function(contents) {
            // Decodes and return the replay init data from the contents byte string.
            const decoder = new BitPackedDecoder(contents, typeinfos);
            return decoder.instance(replay_initdata_typeid);
        };

        exports.decodeReplayAttributesEvents = function(contents) {
            // Decodes and yields each attribute from the contents byte string.
            const buffer = new decoders.BitPackedBuffer(contents, 'little');
            const attributes = {};

            if (!buffer.done()) {
                attributes.source = buffer.readBits(8);
                attributes.mapNameSpace = buffer.readBits(32);
                var count = buffer.readBits(32);
                attributes.scopes = {};

                while (!buffer.done()) {
                    var value = {};
                    value.namespace = buffer.readBits(32);
                    var attrid = value.attrid = buffer.readBits(32);
                    var scope = buffer.readBits(8);
                    value.value = buffer.readAlignedBytes(4).reverse();
                    while (value.value[0] === 0) value.value = value.value.slice(1);
                    while (value.value[value.value.length - 1] === 0) value.value = value.value.slice(0, -1);
                    if (!attributes.scopes[scope])
                        attributes.scopes[scope] = {};
                    if (!attributes.scopes[scope][attrid])
                        attributes.scopes[scope][attrid] = [];
                    attributes.scopes[scope][attrid].push(value);
                }
            }

            return attributes;
        };

        exports.unitTag = function(unitTagIndex, unitTagRecycle) {
            return (unitTagIndex << 18) + unitTagRecycle;
        };

        exports.unitTagIndex = function(unitTag) {
            return (unitTag >> 18) & 0x00003FFF;
        };

        exports.unitTagRecycle = function(unitTag) {
            return unitTag & 0x0003FFFF;
        };

    }, { "./decoders": 24 }],
    26: [function(require, module, exports) {
        module.exports = {
            "_from": "heroprotocol",
            "_id": "heroprotocol@2.0.0",
            "_inBundle": false,
            "_integrity": "sha512-LTI/8dRHSggCV0eFhR+RKr7eLyr3xBdaPO3FP4VAx2QUbbBYeuCwx+q5ABOmIkdTyIKdBP0tBrTzENAVUbTl9w==",
            "_location": "/heroprotocol",
            "_phantomChildren": {
                "camelcase": "2.1.1",
                "cliui": "3.2.0",
                "code-point-at": "1.1.0",
                "decamelize": "1.2.0",
                "number-is-nan": "1.0.1",
                "os-locale": "1.4.0",
                "window-size": "0.1.4",
                "y18n": "3.2.1"
            },
            "_requested": {
                "type": "tag",
                "registry": true,
                "raw": "heroprotocol",
                "name": "heroprotocol",
                "escapedName": "heroprotocol",
                "rawSpec": "",
                "saveSpec": null,
                "fetchSpec": "latest"
            },
            "_requiredBy": [
                "#USER",
                "/"
            ],
            "_resolved": "https://registry.npmjs.org/heroprotocol/-/heroprotocol-2.0.0.tgz",
            "_shasum": "145a8d098e4ea8df6371f5826894e81c1c63f119",
            "_spec": "heroprotocol",
            "_where": "/Users/leegrisham/Documents/workspace/leagueUp/server",
            "author": {
                "name": "Justin J. Novack",
                "email": "jnovack@gmail.com"
            },
            "bugs": {
                "url": "https://github.com/nydus/heroprotocol/issues"
            },
            "bundleDependencies": false,
            "contributors": [{
                "name": "Mathieu Merdy",
                "email": "gfarof@gmail.com"
            }],
            "dependencies": {
                "download-github-repo": "^0.1.3",
                "empeeku": "^1.0.2",
                "fs-extra": "^0.26.7",
                "long": "^3.0.3",
                "pino": "^4.17.5",
                "storm-replay": "^0.3.0-alpha.3",
                "yargs": "^3.32.0"
            },
            "deprecated": false,
            "description": "Javascript port of the heroprotocol Python library to decode Heroes of the Storm replay protocols.",
            "devDependencies": {
                "chai": "^4.1.2",
                "grunt": "latest",
                "grunt-concurrent": "latest",
                "grunt-contrib-jshint": "latest",
                "grunt-contrib-watch": "latest",
                "grunt-simple-mocha": "latest",
                "mocha": "^5.2.0"
            },
            "engines": {
                "node": ">=4.0.0"
            },
            "homepage": "https://github.com/nydus/heroprotocol",
            "keywords": [
                "hots",
                "blizzard",
                "stormreplay",
                "mpq"
            ],
            "license": "ISC",
            "main": "index.js",
            "name": "heroprotocol",
            "optionalDependencies": {
                "storm-replay": "^0.3.0-alpha.3"
            },
            "repository": {
                "type": "git",
                "url": "git+https://github.com/nydus/heroprotocol.git"
            },
            "scripts": {
                "postinstall": "node postinstall.js",
                "postversion": "git push && git push --tags",
                "preversion": "npm test",
                "test": "node_modules/mocha/bin/mocha"
            },
            "version": "2.0.0"
        }

    }, {}],
    27: [function(require, module, exports) {
        (function(process) {
            'use strict'
            const pino = require('pino');
            // const pretty = pino.pretty({forceColor: true})
            // pretty.pipe(process.stdout);
            var loglevel = process.env.LOGLEVEL || 'warn';
            module.exports = pino({
                name: 'hots-parser',
                safe: true,
                level: loglevel
            });
        }).call(this, require('_process'))
    }, { "_process": 81, "pino": 34 }],
    28: [function(require, module, exports) {
        'use strict';
        module.exports = function(obj) {
            if (typeof obj !== 'object') {
                throw new TypeError('Expected an object');
            }

            var ret = {};

            for (var key in obj) {
                var val = obj[key];
                ret[val] = key;
            }

            return ret;
        };

    }, {}],
    29: [function(require, module, exports) {
        'use strict';
        var invertKv = require('invert-kv');
        var all = require('./lcid.json');
        var inverted = invertKv(all);

        exports.from = function(lcidCode) {
            if (typeof lcidCode !== 'number') {
                throw new TypeError('Expected a number');
            }

            return inverted[lcidCode];
        };

        exports.to = function(localeId) {
            if (typeof localeId !== 'string') {
                throw new TypeError('Expected a string');
            }

            return all[localeId];
        };

        exports.all = all;

    }, { "./lcid.json": 30, "invert-kv": 28 }],
    30: [function(require, module, exports) {
        module.exports = {
            "af_ZA": 1078,
            "am_ET": 1118,
            "ar_AE": 14337,
            "ar_BH": 15361,
            "ar_DZ": 5121,
            "ar_EG": 3073,
            "ar_IQ": 2049,
            "ar_JO": 11265,
            "ar_KW": 13313,
            "ar_LB": 12289,
            "ar_LY": 4097,
            "ar_MA": 6145,
            "ar_OM": 8193,
            "ar_QA": 16385,
            "ar_SA": 1025,
            "ar_SY": 10241,
            "ar_TN": 7169,
            "ar_YE": 9217,
            "arn_CL": 1146,
            "as_IN": 1101,
            "az_AZ": 2092,
            "ba_RU": 1133,
            "be_BY": 1059,
            "bg_BG": 1026,
            "bn_IN": 1093,
            "bo_BT": 2129,
            "bo_CN": 1105,
            "br_FR": 1150,
            "bs_BA": 8218,
            "ca_ES": 1027,
            "co_FR": 1155,
            "cs_CZ": 1029,
            "cy_GB": 1106,
            "da_DK": 1030,
            "de_AT": 3079,
            "de_CH": 2055,
            "de_DE": 1031,
            "de_LI": 5127,
            "de_LU": 4103,
            "div_MV": 1125,
            "dsb_DE": 2094,
            "el_GR": 1032,
            "en_AU": 3081,
            "en_BZ": 10249,
            "en_CA": 4105,
            "en_CB": 9225,
            "en_GB": 2057,
            "en_IE": 6153,
            "en_IN": 18441,
            "en_JA": 8201,
            "en_MY": 17417,
            "en_NZ": 5129,
            "en_PH": 13321,
            "en_TT": 11273,
            "en_US": 1033,
            "en_ZA": 7177,
            "en_ZW": 12297,
            "es_AR": 11274,
            "es_BO": 16394,
            "es_CL": 13322,
            "es_CO": 9226,
            "es_CR": 5130,
            "es_DO": 7178,
            "es_EC": 12298,
            "es_ES": 3082,
            "es_GT": 4106,
            "es_HN": 18442,
            "es_MX": 2058,
            "es_NI": 19466,
            "es_PA": 6154,
            "es_PE": 10250,
            "es_PR": 20490,
            "es_PY": 15370,
            "es_SV": 17418,
            "es_UR": 14346,
            "es_US": 21514,
            "es_VE": 8202,
            "et_EE": 1061,
            "eu_ES": 1069,
            "fa_IR": 1065,
            "fi_FI": 1035,
            "fil_PH": 1124,
            "fo_FO": 1080,
            "fr_BE": 2060,
            "fr_CA": 3084,
            "fr_CH": 4108,
            "fr_FR": 1036,
            "fr_LU": 5132,
            "fr_MC": 6156,
            "fy_NL": 1122,
            "ga_IE": 2108,
            "gbz_AF": 1164,
            "gl_ES": 1110,
            "gsw_FR": 1156,
            "gu_IN": 1095,
            "ha_NG": 1128,
            "he_IL": 1037,
            "hi_IN": 1081,
            "hr_BA": 4122,
            "hr_HR": 1050,
            "hu_HU": 1038,
            "hy_AM": 1067,
            "id_ID": 1057,
            "ii_CN": 1144,
            "is_IS": 1039,
            "it_CH": 2064,
            "it_IT": 1040,
            "iu_CA": 2141,
            "ja_JP": 1041,
            "ka_GE": 1079,
            "kh_KH": 1107,
            "kk_KZ": 1087,
            "kl_GL": 1135,
            "kn_IN": 1099,
            "ko_KR": 1042,
            "kok_IN": 1111,
            "ky_KG": 1088,
            "lb_LU": 1134,
            "lo_LA": 1108,
            "lt_LT": 1063,
            "lv_LV": 1062,
            "mi_NZ": 1153,
            "mk_MK": 1071,
            "ml_IN": 1100,
            "mn_CN": 2128,
            "mn_MN": 1104,
            "moh_CA": 1148,
            "mr_IN": 1102,
            "ms_BN": 2110,
            "ms_MY": 1086,
            "mt_MT": 1082,
            "my_MM": 1109,
            "nb_NO": 1044,
            "ne_NP": 1121,
            "nl_BE": 2067,
            "nl_NL": 1043,
            "nn_NO": 2068,
            "ns_ZA": 1132,
            "oc_FR": 1154,
            "or_IN": 1096,
            "pa_IN": 1094,
            "pl_PL": 1045,
            "ps_AF": 1123,
            "pt_BR": 1046,
            "pt_PT": 2070,
            "qut_GT": 1158,
            "quz_BO": 1131,
            "quz_EC": 2155,
            "quz_PE": 3179,
            "rm_CH": 1047,
            "ro_RO": 1048,
            "ru_RU": 1049,
            "rw_RW": 1159,
            "sa_IN": 1103,
            "sah_RU": 1157,
            "se_FI": 3131,
            "se_NO": 1083,
            "se_SE": 2107,
            "si_LK": 1115,
            "sk_SK": 1051,
            "sl_SI": 1060,
            "sma_NO": 6203,
            "sma_SE": 7227,
            "smj_NO": 4155,
            "smj_SE": 5179,
            "smn_FI": 9275,
            "sms_FI": 8251,
            "sq_AL": 1052,
            "sr_BA": 7194,
            "sr_SP": 3098,
            "sv_FI": 2077,
            "sv_SE": 1053,
            "sw_KE": 1089,
            "syr_SY": 1114,
            "ta_IN": 1097,
            "te_IN": 1098,
            "tg_TJ": 1064,
            "th_TH": 1054,
            "tk_TM": 1090,
            "tmz_DZ": 2143,
            "tn_ZA": 1074,
            "tr_TR": 1055,
            "tt_RU": 1092,
            "ug_CN": 1152,
            "uk_UA": 1058,
            "ur_IN": 2080,
            "ur_PK": 1056,
            "uz_UZ": 2115,
            "vi_VN": 1066,
            "wen_DE": 1070,
            "wo_SN": 1160,
            "xh_ZA": 1076,
            "yo_NG": 1130,
            "zh_CHS": 4,
            "zh_CHT": 31748,
            "zh_CN": 2052,
            "zh_HK": 3076,
            "zh_MO": 5124,
            "zh_SG": 4100,
            "zh_TW": 1028,
            "zu_ZA": 1077
        }

    }, {}],
    31: [function(require, module, exports) {
        /*
         Copyright 2013 Daniel Wirtz <dcode@dcode.io>
         Copyright 2009 The Closure Library Authors. All Rights Reserved.

         Licensed under the Apache License, Version 2.0 (the "License");
         you may not use this file except in compliance with the License.
         You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

         Unless required by applicable law or agreed to in writing, software
         distributed under the License is distributed on an "AS-IS" BASIS,
         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
         See the License for the specific language governing permissions and
         limitations under the License.
         */

        /**
         * @license long.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
         * Released under the Apache License, Version 2.0
         * see: https://github.com/dcodeIO/long.js for details
         */
        (function(global, factory) {

            /* AMD */
            if (typeof define === 'function' && define["amd"])
                define([], factory);
            /* CommonJS */
            else if (typeof require === 'function' && typeof module === "object" && module && module["exports"])
                module["exports"] = factory();
            /* Global */
            else
                (global["dcodeIO"] = global["dcodeIO"] || {})["Long"] = factory();

        })(this, function() {
            "use strict";

            /**
             * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
             *  See the from* functions below for more convenient ways of constructing Longs.
             * @exports Long
             * @class A Long class for representing a 64 bit two's-complement integer value.
             * @param {number} low The low (signed) 32 bits of the long
             * @param {number} high The high (signed) 32 bits of the long
             * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
             * @constructor
             */
            function Long(low, high, unsigned) {

                /**
                 * The low 32 bits as a signed value.
                 * @type {number}
                 */
                this.low = low | 0;

                /**
                 * The high 32 bits as a signed value.
                 * @type {number}
                 */
                this.high = high | 0;

                /**
                 * Whether unsigned or not.
                 * @type {boolean}
                 */
                this.unsigned = !!unsigned;
            }

            // The internal representation of a long is the two given signed, 32-bit values.
            // We use 32-bit pieces because these are the size of integers on which
            // Javascript performs bit-operations.  For operations like addition and
            // multiplication, we split each number into 16 bit pieces, which can easily be
            // multiplied within Javascript's floating-point representation without overflow
            // or change in sign.
            //
            // In the algorithms below, we frequently reduce the negative case to the
            // positive case by negating the input(s) and then post-processing the result.
            // Note that we must ALWAYS check specially whether those values are MIN_VALUE
            // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
            // a positive number, it overflows back into a negative).  Not handling this
            // case would often result in infinite recursion.
            //
            // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
            // methods on which they depend.

            /**
             * An indicator used to reliably determine if an object is a Long or not.
             * @type {boolean}
             * @const
             * @private
             */
            Long.prototype.__isLong__;

            Object.defineProperty(Long.prototype, "__isLong__", {
                value: true,
                enumerable: false,
                configurable: false
            });

            /**
             * @function
             * @param {*} obj Object
             * @returns {boolean}
             * @inner
             */
            function isLong(obj) {
                return (obj && obj["__isLong__"]) === true;
            }

            /**
             * Tests if the specified object is a Long.
             * @function
             * @param {*} obj Object
             * @returns {boolean}
             */
            Long.isLong = isLong;

            /**
             * A cache of the Long representations of small integer values.
             * @type {!Object}
             * @inner
             */
            var INT_CACHE = {};

            /**
             * A cache of the Long representations of small unsigned integer values.
             * @type {!Object}
             * @inner
             */
            var UINT_CACHE = {};

            /**
             * @param {number} value
             * @param {boolean=} unsigned
             * @returns {!Long}
             * @inner
             */
            function fromInt(value, unsigned) {
                var obj, cachedObj, cache;
                if (unsigned) {
                    value >>>= 0;
                    if (cache = (0 <= value && value < 256)) {
                        cachedObj = UINT_CACHE[value];
                        if (cachedObj)
                            return cachedObj;
                    }
                    obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true);
                    if (cache)
                        UINT_CACHE[value] = obj;
                    return obj;
                } else {
                    value |= 0;
                    if (cache = (-128 <= value && value < 128)) {
                        cachedObj = INT_CACHE[value];
                        if (cachedObj)
                            return cachedObj;
                    }
                    obj = fromBits(value, value < 0 ? -1 : 0, false);
                    if (cache)
                        INT_CACHE[value] = obj;
                    return obj;
                }
            }

            /**
             * Returns a Long representing the given 32 bit integer value.
             * @function
             * @param {number} value The 32 bit integer in question
             * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
             * @returns {!Long} The corresponding Long value
             */
            Long.fromInt = fromInt;

            /**
             * @param {number} value
             * @param {boolean=} unsigned
             * @returns {!Long}
             * @inner
             */
            function fromNumber(value, unsigned) {
                if (isNaN(value) || !isFinite(value))
                    return unsigned ? UZERO : ZERO;
                if (unsigned) {
                    if (value < 0)
                        return UZERO;
                    if (value >= TWO_PWR_64_DBL)
                        return MAX_UNSIGNED_VALUE;
                } else {
                    if (value <= -TWO_PWR_63_DBL)
                        return MIN_VALUE;
                    if (value + 1 >= TWO_PWR_63_DBL)
                        return MAX_VALUE;
                }
                if (value < 0)
                    return fromNumber(-value, unsigned).neg();
                return fromBits((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
            }

            /**
             * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
             * @function
             * @param {number} value The number in question
             * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
             * @returns {!Long} The corresponding Long value
             */
            Long.fromNumber = fromNumber;

            /**
             * @param {number} lowBits
             * @param {number} highBits
             * @param {boolean=} unsigned
             * @returns {!Long}
             * @inner
             */
            function fromBits(lowBits, highBits, unsigned) {
                return new Long(lowBits, highBits, unsigned);
            }

            /**
             * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
             *  assumed to use 32 bits.
             * @function
             * @param {number} lowBits The low 32 bits
             * @param {number} highBits The high 32 bits
             * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
             * @returns {!Long} The corresponding Long value
             */
            Long.fromBits = fromBits;

            /**
             * @function
             * @param {number} base
             * @param {number} exponent
             * @returns {number}
             * @inner
             */
            var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)

            /**
             * @param {string} str
             * @param {(boolean|number)=} unsigned
             * @param {number=} radix
             * @returns {!Long}
             * @inner
             */
            function fromString(str, unsigned, radix) {
                if (str.length === 0)
                    throw Error('empty string');
                if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
                    return ZERO;
                if (typeof unsigned === 'number') {
                    // For goog.math.long compatibility
                    radix = unsigned,
                        unsigned = false;
                } else {
                    unsigned = !!unsigned;
                }
                radix = radix || 10;
                if (radix < 2 || 36 < radix)
                    throw RangeError('radix');

                var p;
                if ((p = str.indexOf('-')) > 0)
                    throw Error('interior hyphen');
                else if (p === 0) {
                    return fromString(str.substring(1), unsigned, radix).neg();
                }

                // Do several (8) digits each time through the loop, so as to
                // minimize the calls to the very expensive emulated div.
                var radixToPower = fromNumber(pow_dbl(radix, 8));

                var result = ZERO;
                for (var i = 0; i < str.length; i += 8) {
                    var size = Math.min(8, str.length - i),
                        value = parseInt(str.substring(i, i + size), radix);
                    if (size < 8) {
                        var power = fromNumber(pow_dbl(radix, size));
                        result = result.mul(power).add(fromNumber(value));
                    } else {
                        result = result.mul(radixToPower);
                        result = result.add(fromNumber(value));
                    }
                }
                result.unsigned = unsigned;
                return result;
            }

            /**
             * Returns a Long representation of the given string, written using the specified radix.
             * @function
             * @param {string} str The textual representation of the Long
             * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to `false` for signed
             * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
             * @returns {!Long} The corresponding Long value
             */
            Long.fromString = fromString;

            /**
             * @function
             * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
             * @returns {!Long}
             * @inner
             */
            function fromValue(val) {
                if (val /* is compatible */ instanceof Long)
                    return val;
                if (typeof val === 'number')
                    return fromNumber(val);
                if (typeof val === 'string')
                    return fromString(val);
                // Throws for non-objects, converts non-instanceof Long:
                return fromBits(val.low, val.high, val.unsigned);
            }

            /**
             * Converts the specified value to a Long.
             * @function
             * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
             * @returns {!Long}
             */
            Long.fromValue = fromValue;

            // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
            // no runtime penalty for these.

            /**
             * @type {number}
             * @const
             * @inner
             */
            var TWO_PWR_16_DBL = 1 << 16;

            /**
             * @type {number}
             * @const
             * @inner
             */
            var TWO_PWR_24_DBL = 1 << 24;

            /**
             * @type {number}
             * @const
             * @inner
             */
            var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;

            /**
             * @type {number}
             * @const
             * @inner
             */
            var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;

            /**
             * @type {number}
             * @const
             * @inner
             */
            var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;

            /**
             * @type {!Long}
             * @const
             * @inner
             */
            var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);

            /**
             * @type {!Long}
             * @inner
             */
            var ZERO = fromInt(0);

            /**
             * Signed zero.
             * @type {!Long}
             */
            Long.ZERO = ZERO;

            /**
             * @type {!Long}
             * @inner
             */
            var UZERO = fromInt(0, true);

            /**
             * Unsigned zero.
             * @type {!Long}
             */
            Long.UZERO = UZERO;

            /**
             * @type {!Long}
             * @inner
             */
            var ONE = fromInt(1);

            /**
             * Signed one.
             * @type {!Long}
             */
            Long.ONE = ONE;

            /**
             * @type {!Long}
             * @inner
             */
            var UONE = fromInt(1, true);

            /**
             * Unsigned one.
             * @type {!Long}
             */
            Long.UONE = UONE;

            /**
             * @type {!Long}
             * @inner
             */
            var NEG_ONE = fromInt(-1);

            /**
             * Signed negative one.
             * @type {!Long}
             */
            Long.NEG_ONE = NEG_ONE;

            /**
             * @type {!Long}
             * @inner
             */
            var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);

            /**
             * Maximum signed value.
             * @type {!Long}
             */
            Long.MAX_VALUE = MAX_VALUE;

            /**
             * @type {!Long}
             * @inner
             */
            var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);

            /**
             * Maximum unsigned value.
             * @type {!Long}
             */
            Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;

            /**
             * @type {!Long}
             * @inner
             */
            var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);

            /**
             * Minimum signed value.
             * @type {!Long}
             */
            Long.MIN_VALUE = MIN_VALUE;

            /**
             * @alias Long.prototype
             * @inner
             */
            var LongPrototype = Long.prototype;

            /**
             * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
             * @returns {number}
             */
            LongPrototype.toInt = function toInt() {
                return this.unsigned ? this.low >>> 0 : this.low;
            };

            /**
             * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
             * @returns {number}
             */
            LongPrototype.toNumber = function toNumber() {
                if (this.unsigned)
                    return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
                return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
            };

            /**
             * Converts the Long to a string written in the specified radix.
             * @param {number=} radix Radix (2-36), defaults to 10
             * @returns {string}
             * @override
             * @throws {RangeError} If `radix` is out of range
             */
            LongPrototype.toString = function toString(radix) {
                radix = radix || 10;
                if (radix < 2 || 36 < radix)
                    throw RangeError('radix');
                if (this.isZero())
                    return '0';
                if (this.isNegative()) { // Unsigned Longs are never negative
                    if (this.eq(MIN_VALUE)) {
                        // We need to change the Long value before it can be negated, so we remove
                        // the bottom-most digit in this base and then recurse to do the rest.
                        var radixLong = fromNumber(radix),
                            div = this.div(radixLong),
                            rem1 = div.mul(radixLong).sub(this);
                        return div.toString(radix) + rem1.toInt().toString(radix);
                    } else
                        return '-' + this.neg().toString(radix);
                }

                // Do several (6) digits each time through the loop, so as to
                // minimize the calls to the very expensive emulated div.
                var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
                    rem = this;
                var result = '';
                while (true) {
                    var remDiv = rem.div(radixToPower),
                        intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
                        digits = intval.toString(radix);
                    rem = remDiv;
                    if (rem.isZero())
                        return digits + result;
                    else {
                        while (digits.length < 6)
                            digits = '0' + digits;
                        result = '' + digits + result;
                    }
                }
            };

            /**
             * Gets the high 32 bits as a signed integer.
             * @returns {number} Signed high bits
             */
            LongPrototype.getHighBits = function getHighBits() {
                return this.high;
            };

            /**
             * Gets the high 32 bits as an unsigned integer.
             * @returns {number} Unsigned high bits
             */
            LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
                return this.high >>> 0;
            };

            /**
             * Gets the low 32 bits as a signed integer.
             * @returns {number} Signed low bits
             */
            LongPrototype.getLowBits = function getLowBits() {
                return this.low;
            };

            /**
             * Gets the low 32 bits as an unsigned integer.
             * @returns {number} Unsigned low bits
             */
            LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
                return this.low >>> 0;
            };

            /**
             * Gets the number of bits needed to represent the absolute value of this Long.
             * @returns {number}
             */
            LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
                if (this.isNegative()) // Unsigned Longs are never negative
                    return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
                var val = this.high != 0 ? this.high : this.low;
                for (var bit = 31; bit > 0; bit--)
                    if ((val & (1 << bit)) != 0)
                        break;
                return this.high != 0 ? bit + 33 : bit + 1;
            };

            /**
             * Tests if this Long's value equals zero.
             * @returns {boolean}
             */
            LongPrototype.isZero = function isZero() {
                return this.high === 0 && this.low === 0;
            };

            /**
             * Tests if this Long's value is negative.
             * @returns {boolean}
             */
            LongPrototype.isNegative = function isNegative() {
                return !this.unsigned && this.high < 0;
            };

            /**
             * Tests if this Long's value is positive.
             * @returns {boolean}
             */
            LongPrototype.isPositive = function isPositive() {
                return this.unsigned || this.high >= 0;
            };

            /**
             * Tests if this Long's value is odd.
             * @returns {boolean}
             */
            LongPrototype.isOdd = function isOdd() {
                return (this.low & 1) === 1;
            };

            /**
             * Tests if this Long's value is even.
             * @returns {boolean}
             */
            LongPrototype.isEven = function isEven() {
                return (this.low & 1) === 0;
            };

            /**
             * Tests if this Long's value equals the specified's.
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.equals = function equals(other) {
                if (!isLong(other))
                    other = fromValue(other);
                if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
                    return false;
                return this.high === other.high && this.low === other.low;
            };

            /**
             * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
             * @function
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.eq = LongPrototype.equals;

            /**
             * Tests if this Long's value differs from the specified's.
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.notEquals = function notEquals(other) {
                return !this.eq( /* validates */ other);
            };

            /**
             * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
             * @function
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.neq = LongPrototype.notEquals;

            /**
             * Tests if this Long's value is less than the specified's.
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.lessThan = function lessThan(other) {
                return this.comp( /* validates */ other) < 0;
            };

            /**
             * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
             * @function
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.lt = LongPrototype.lessThan;

            /**
             * Tests if this Long's value is less than or equal the specified's.
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
                return this.comp( /* validates */ other) <= 0;
            };

            /**
             * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
             * @function
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.lte = LongPrototype.lessThanOrEqual;

            /**
             * Tests if this Long's value is greater than the specified's.
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.greaterThan = function greaterThan(other) {
                return this.comp( /* validates */ other) > 0;
            };

            /**
             * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
             * @function
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.gt = LongPrototype.greaterThan;

            /**
             * Tests if this Long's value is greater than or equal the specified's.
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
                return this.comp( /* validates */ other) >= 0;
            };

            /**
             * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
             * @function
             * @param {!Long|number|string} other Other value
             * @returns {boolean}
             */
            LongPrototype.gte = LongPrototype.greaterThanOrEqual;

            /**
             * Compares this Long's value with the specified's.
             * @param {!Long|number|string} other Other value
             * @returns {number} 0 if they are the same, 1 if the this is greater and -1
             *  if the given one is greater
             */
            LongPrototype.compare = function compare(other) {
                if (!isLong(other))
                    other = fromValue(other);
                if (this.eq(other))
                    return 0;
                var thisNeg = this.isNegative(),
                    otherNeg = other.isNegative();
                if (thisNeg && !otherNeg)
                    return -1;
                if (!thisNeg && otherNeg)
                    return 1;
                // At this point the sign bits are the same
                if (!this.unsigned)
                    return this.sub(other).isNegative() ? -1 : 1;
                // Both are positive if at least one is unsigned
                return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
            };

            /**
             * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
             * @function
             * @param {!Long|number|string} other Other value
             * @returns {number} 0 if they are the same, 1 if the this is greater and -1
             *  if the given one is greater
             */
            LongPrototype.comp = LongPrototype.compare;

            /**
             * Negates this Long's value.
             * @returns {!Long} Negated Long
             */
            LongPrototype.negate = function negate() {
                if (!this.unsigned && this.eq(MIN_VALUE))
                    return MIN_VALUE;
                return this.not().add(ONE);
            };

            /**
             * Negates this Long's value. This is an alias of {@link Long#negate}.
             * @function
             * @returns {!Long} Negated Long
             */
            LongPrototype.neg = LongPrototype.negate;

            /**
             * Returns the sum of this and the specified Long.
             * @param {!Long|number|string} addend Addend
             * @returns {!Long} Sum
             */
            LongPrototype.add = function add(addend) {
                if (!isLong(addend))
                    addend = fromValue(addend);

                // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

                var a48 = this.high >>> 16;
                var a32 = this.high & 0xFFFF;
                var a16 = this.low >>> 16;
                var a00 = this.low & 0xFFFF;

                var b48 = addend.high >>> 16;
                var b32 = addend.high & 0xFFFF;
                var b16 = addend.low >>> 16;
                var b00 = addend.low & 0xFFFF;

                var c48 = 0,
                    c32 = 0,
                    c16 = 0,
                    c00 = 0;
                c00 += a00 + b00;
                c16 += c00 >>> 16;
                c00 &= 0xFFFF;
                c16 += a16 + b16;
                c32 += c16 >>> 16;
                c16 &= 0xFFFF;
                c32 += a32 + b32;
                c48 += c32 >>> 16;
                c32 &= 0xFFFF;
                c48 += a48 + b48;
                c48 &= 0xFFFF;
                return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
            };

            /**
             * Returns the difference of this and the specified Long.
             * @param {!Long|number|string} subtrahend Subtrahend
             * @returns {!Long} Difference
             */
            LongPrototype.subtract = function subtract(subtrahend) {
                if (!isLong(subtrahend))
                    subtrahend = fromValue(subtrahend);
                return this.add(subtrahend.neg());
            };

            /**
             * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
             * @function
             * @param {!Long|number|string} subtrahend Subtrahend
             * @returns {!Long} Difference
             */
            LongPrototype.sub = LongPrototype.subtract;

            /**
             * Returns the product of this and the specified Long.
             * @param {!Long|number|string} multiplier Multiplier
             * @returns {!Long} Product
             */
            LongPrototype.multiply = function multiply(multiplier) {
                if (this.isZero())
                    return ZERO;
                if (!isLong(multiplier))
                    multiplier = fromValue(multiplier);
                if (multiplier.isZero())
                    return ZERO;
                if (this.eq(MIN_VALUE))
                    return multiplier.isOdd() ? MIN_VALUE : ZERO;
                if (multiplier.eq(MIN_VALUE))
                    return this.isOdd() ? MIN_VALUE : ZERO;

                if (this.isNegative()) {
                    if (multiplier.isNegative())
                        return this.neg().mul(multiplier.neg());
                    else
                        return this.neg().mul(multiplier).neg();
                } else if (multiplier.isNegative())
                    return this.mul(multiplier.neg()).neg();

                // If both longs are small, use float multiplication
                if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
                    return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

                // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
                // We can skip products that would overflow.

                var a48 = this.high >>> 16;
                var a32 = this.high & 0xFFFF;
                var a16 = this.low >>> 16;
                var a00 = this.low & 0xFFFF;

                var b48 = multiplier.high >>> 16;
                var b32 = multiplier.high & 0xFFFF;
                var b16 = multiplier.low >>> 16;
                var b00 = multiplier.low & 0xFFFF;

                var c48 = 0,
                    c32 = 0,
                    c16 = 0,
                    c00 = 0;
                c00 += a00 * b00;
                c16 += c00 >>> 16;
                c00 &= 0xFFFF;
                c16 += a16 * b00;
                c32 += c16 >>> 16;
                c16 &= 0xFFFF;
                c16 += a00 * b16;
                c32 += c16 >>> 16;
                c16 &= 0xFFFF;
                c32 += a32 * b00;
                c48 += c32 >>> 16;
                c32 &= 0xFFFF;
                c32 += a16 * b16;
                c48 += c32 >>> 16;
                c32 &= 0xFFFF;
                c32 += a00 * b32;
                c48 += c32 >>> 16;
                c32 &= 0xFFFF;
                c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
                c48 &= 0xFFFF;
                return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
            };

            /**
             * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
             * @function
             * @param {!Long|number|string} multiplier Multiplier
             * @returns {!Long} Product
             */
            LongPrototype.mul = LongPrototype.multiply;

            /**
             * Returns this Long divided by the specified. The result is signed if this Long is signed or
             *  unsigned if this Long is unsigned.
             * @param {!Long|number|string} divisor Divisor
             * @returns {!Long} Quotient
             */
            LongPrototype.divide = function divide(divisor) {
                if (!isLong(divisor))
                    divisor = fromValue(divisor);
                if (divisor.isZero())
                    throw Error('division by zero');
                if (this.isZero())
                    return this.unsigned ? UZERO : ZERO;
                var approx, rem, res;
                if (!this.unsigned) {
                    // This section is only relevant for signed longs and is derived from the
                    // closure library as a whole.
                    if (this.eq(MIN_VALUE)) {
                        if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
                            return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
                        else if (divisor.eq(MIN_VALUE))
                            return ONE;
                        else {
                            // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                            var halfThis = this.shr(1);
                            approx = halfThis.div(divisor).shl(1);
                            if (approx.eq(ZERO)) {
                                return divisor.isNegative() ? ONE : NEG_ONE;
                            } else {
                                rem = this.sub(divisor.mul(approx));
                                res = approx.add(rem.div(divisor));
                                return res;
                            }
                        }
                    } else if (divisor.eq(MIN_VALUE))
                        return this.unsigned ? UZERO : ZERO;
                    if (this.isNegative()) {
                        if (divisor.isNegative())
                            return this.neg().div(divisor.neg());
                        return this.neg().div(divisor).neg();
                    } else if (divisor.isNegative())
                        return this.div(divisor.neg()).neg();
                    res = ZERO;
                } else {
                    // The algorithm below has not been made for unsigned longs. It's therefore
                    // required to take special care of the MSB prior to running it.
                    if (!divisor.unsigned)
                        divisor = divisor.toUnsigned();
                    if (divisor.gt(this))
                        return UZERO;
                    if (divisor.gt(this.shru(1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
                        return UONE;
                    res = UZERO;
                }

                // Repeat the following until the remainder is less than other:  find a
                // floating-point that approximates remainder / other *from below*, add this
                // into the result, and subtract it from the remainder.  It is critical that
                // the approximate value is less than or equal to the real value so that the
                // remainder never becomes negative.
                rem = this;
                while (rem.gte(divisor)) {
                    // Approximate the result of division. This may be a little greater or
                    // smaller than the actual value.
                    approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

                    // We will tweak the approximate result by changing it in the 48-th digit or
                    // the smallest non-fractional digit, whichever is larger.
                    var log2 = Math.ceil(Math.log(approx) / Math.LN2),
                        delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48),

                        // Decrease the approximation until it is smaller than the remainder.  Note
                        // that if it is too large, the product overflows and is negative.
                        approxRes = fromNumber(approx),
                        approxRem = approxRes.mul(divisor);
                    while (approxRem.isNegative() || approxRem.gt(rem)) {
                        approx -= delta;
                        approxRes = fromNumber(approx, this.unsigned);
                        approxRem = approxRes.mul(divisor);
                    }

                    // We know the answer can't be zero... and actually, zero would cause
                    // infinite recursion since we would make no progress.
                    if (approxRes.isZero())
                        approxRes = ONE;

                    res = res.add(approxRes);
                    rem = rem.sub(approxRem);
                }
                return res;
            };

            /**
             * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
             * @function
             * @param {!Long|number|string} divisor Divisor
             * @returns {!Long} Quotient
             */
            LongPrototype.div = LongPrototype.divide;

            /**
             * Returns this Long modulo the specified.
             * @param {!Long|number|string} divisor Divisor
             * @returns {!Long} Remainder
             */
            LongPrototype.modulo = function modulo(divisor) {
                if (!isLong(divisor))
                    divisor = fromValue(divisor);
                return this.sub(this.div(divisor).mul(divisor));
            };

            /**
             * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
             * @function
             * @param {!Long|number|string} divisor Divisor
             * @returns {!Long} Remainder
             */
            LongPrototype.mod = LongPrototype.modulo;

            /**
             * Returns the bitwise NOT of this Long.
             * @returns {!Long}
             */
            LongPrototype.not = function not() {
                return fromBits(~this.low, ~this.high, this.unsigned);
            };

            /**
             * Returns the bitwise AND of this Long and the specified.
             * @param {!Long|number|string} other Other Long
             * @returns {!Long}
             */
            LongPrototype.and = function and(other) {
                if (!isLong(other))
                    other = fromValue(other);
                return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
            };

            /**
             * Returns the bitwise OR of this Long and the specified.
             * @param {!Long|number|string} other Other Long
             * @returns {!Long}
             */
            LongPrototype.or = function or(other) {
                if (!isLong(other))
                    other = fromValue(other);
                return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
            };

            /**
             * Returns the bitwise XOR of this Long and the given one.
             * @param {!Long|number|string} other Other Long
             * @returns {!Long}
             */
            LongPrototype.xor = function xor(other) {
                if (!isLong(other))
                    other = fromValue(other);
                return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
            };

            /**
             * Returns this Long with bits shifted to the left by the given amount.
             * @param {number|!Long} numBits Number of bits
             * @returns {!Long} Shifted Long
             */
            LongPrototype.shiftLeft = function shiftLeft(numBits) {
                if (isLong(numBits))
                    numBits = numBits.toInt();
                if ((numBits &= 63) === 0)
                    return this;
                else if (numBits < 32)
                    return fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
                else
                    return fromBits(0, this.low << (numBits - 32), this.unsigned);
            };

            /**
             * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
             * @function
             * @param {number|!Long} numBits Number of bits
             * @returns {!Long} Shifted Long
             */
            LongPrototype.shl = LongPrototype.shiftLeft;

            /**
             * Returns this Long with bits arithmetically shifted to the right by the given amount.
             * @param {number|!Long} numBits Number of bits
             * @returns {!Long} Shifted Long
             */
            LongPrototype.shiftRight = function shiftRight(numBits) {
                if (isLong(numBits))
                    numBits = numBits.toInt();
                if ((numBits &= 63) === 0)
                    return this;
                else if (numBits < 32)
                    return fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
                else
                    return fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
            };

            /**
             * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
             * @function
             * @param {number|!Long} numBits Number of bits
             * @returns {!Long} Shifted Long
             */
            LongPrototype.shr = LongPrototype.shiftRight;

            /**
             * Returns this Long with bits logically shifted to the right by the given amount.
             * @param {number|!Long} numBits Number of bits
             * @returns {!Long} Shifted Long
             */
            LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
                if (isLong(numBits))
                    numBits = numBits.toInt();
                numBits &= 63;
                if (numBits === 0)
                    return this;
                else {
                    var high = this.high;
                    if (numBits < 32) {
                        var low = this.low;
                        return fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
                    } else if (numBits === 32)
                        return fromBits(high, 0, this.unsigned);
                    else
                        return fromBits(high >>> (numBits - 32), 0, this.unsigned);
                }
            };

            /**
             * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
             * @function
             * @param {number|!Long} numBits Number of bits
             * @returns {!Long} Shifted Long
             */
            LongPrototype.shru = LongPrototype.shiftRightUnsigned;

            /**
             * Converts this Long to signed.
             * @returns {!Long} Signed long
             */
            LongPrototype.toSigned = function toSigned() {
                if (!this.unsigned)
                    return this;
                return fromBits(this.low, this.high, false);
            };

            /**
             * Converts this Long to unsigned.
             * @returns {!Long} Unsigned long
             */
            LongPrototype.toUnsigned = function toUnsigned() {
                if (this.unsigned)
                    return this;
                return fromBits(this.low, this.high, true);
            };

            /**
             * Converts this Long to its byte representation.
             * @param {boolean=} le Whether little or big endian, defaults to big endian
             * @returns {!Array.<number>} Byte representation
             */
            LongPrototype.toBytes = function(le) {
                return le ? this.toBytesLE() : this.toBytesBE();
            }

            /**
             * Converts this Long to its little endian byte representation.
             * @returns {!Array.<number>} Little endian byte representation
             */
            LongPrototype.toBytesLE = function() {
                var hi = this.high,
                    lo = this.low;
                return [
                    lo & 0xff,
                    (lo >>> 8) & 0xff,
                    (lo >>> 16) & 0xff,
                    (lo >>> 24) & 0xff,
                    hi & 0xff,
                    (hi >>> 8) & 0xff,
                    (hi >>> 16) & 0xff,
                    (hi >>> 24) & 0xff
                ];
            }

            /**
             * Converts this Long to its big endian byte representation.
             * @returns {!Array.<number>} Big endian byte representation
             */
            LongPrototype.toBytesBE = function() {
                var hi = this.high,
                    lo = this.low;
                return [
                    (hi >>> 24) & 0xff,
                    (hi >>> 16) & 0xff,
                    (hi >>> 8) & 0xff,
                    hi & 0xff,
                    (lo >>> 24) & 0xff,
                    (lo >>> 16) & 0xff,
                    (lo >>> 8) & 0xff,
                    lo & 0xff
                ];
            }

            return Long;
        });

    }, {}],
    32: [function(require, module, exports) {
        'use strict';
        module.exports = Number.isNaN || function(x) {
            return x !== x;
        };

    }, {}],
    33: [function(require, module, exports) {
        (function(process, setImmediate) {
            'use strict';
            var childProcess = require('child_process');
            var execFileSync = childProcess.execFileSync;
            var lcid = require('lcid');
            var defaultOpts = { spawn: true };
            var cache;

            function fallback() {
                cache = 'en_US';
                return cache;
            }

            function getEnvLocale(env) {
                env = env || process.env;
                var ret = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
                cache = getLocale(ret);
                return ret;
            }

            function parseLocale(x) {
                var env = x.split('\n').reduce(function(env, def) {
                    def = def.split('=');
                    env[def[0]] = def[1];
                    return env;
                }, {});
                return getEnvLocale(env);
            }

            function getLocale(str) {
                return (str && str.replace(/[.:].*/, '')) || fallback();
            }

            module.exports = function(opts, cb) {
                if (typeof opts === 'function') {
                    cb = opts;
                    opts = defaultOpts;
                } else {
                    opts = opts || defaultOpts;
                }

                if (cache || getEnvLocale() || opts.spawn === false) {
                    setImmediate(cb, null, cache);
                    return;
                }

                var getAppleLocale = function() {
                    childProcess.execFile('defaults', ['read', '-g', 'AppleLocale'], function(err, stdout) {
                        if (err) {
                            fallback();
                            return;
                        }

                        cache = stdout.trim() || fallback();
                        cb(null, cache);
                    });
                };

                if (process.platform === 'win32') {
                    childProcess.execFile('wmic', ['os', 'get', 'locale'], function(err, stdout) {
                        if (err) {
                            fallback();
                            return;
                        }

                        var lcidCode = parseInt(stdout.replace('Locale', ''), 16);
                        cache = lcid.from(lcidCode) || fallback();
                        cb(null, cache);
                    });
                } else {
                    childProcess.execFile('locale', function(err, stdout) {
                        if (err) {
                            fallback();
                            return;
                        }

                        var res = parseLocale(stdout);

                        if (!res && process.platform === 'darwin') {
                            getAppleLocale();
                            return;
                        }

                        cache = getLocale(res);
                        cb(null, cache);
                    });
                }
            };

            module.exports.sync = function(opts) {
                opts = opts || defaultOpts;

                if (cache || getEnvLocale() || !execFileSync || opts.spawn === false) {
                    return cache;
                }

                if (process.platform === 'win32') {
                    var stdout;

                    try {
                        stdout = execFileSync('wmic', ['os', 'get', 'locale'], { encoding: 'utf8' });
                    } catch (err) {
                        return fallback();
                    }

                    var lcidCode = parseInt(stdout.replace('Locale', ''), 16);
                    cache = lcid.from(lcidCode) || fallback();
                    return cache;
                }

                var res;

                try {
                    res = parseLocale(execFileSync('locale', { encoding: 'utf8' }));
                } catch (err) {}

                if (!res && process.platform === 'darwin') {
                    try {
                        cache = execFileSync('defaults', ['read', '-g', 'AppleLocale'], { encoding: 'utf8' }).trim() || fallback();
                        return cache;
                    } catch (err) {
                        return fallback();
                    }
                }

                cache = getLocale(res);
                return cache;
            };

        }).call(this, require('_process'), require("timers").setImmediate)
    }, { "_process": 81, "child_process": 52, "lcid": 29, "timers": 98 }],
    34: [function(require, module, exports) {
        (function(global) {
            'use strict'

            var format = require('quick-format-unescaped')

            module.exports = pino

            var _console = global.console || {}
            var stdSerializers = {
                req: mock,
                res: mock,
                err: asErrValue
            }

            function pino(opts) {
                opts = opts || {}
                opts.browser = opts.browser || {}

                var transmit = opts.browser.transmit
                if (transmit && typeof transmit.send !== 'function') { throw Error('pino: transmit option must have a send function') }

                var proto = opts.browser.write || _console
                if (opts.browser.write) opts.browser.asObject = true
                var serializers = opts.serializers || {}
                var serialize = Array.isArray(opts.browser.serialize) ?
                    opts.browser.serialize.filter(function(k) {
                        return k !== '!stdSerializers.err'
                    }) :
                    opts.browser.serialize === true ? Object.keys(serializers) : false
                var stdErrSerialize = opts.browser.serialize

                if (
                    Array.isArray(opts.browser.serialize) &&
                    opts.browser.serialize.indexOf('!stdSerializers.err') > -1
                ) stdErrSerialize = false

                var levels = ['error', 'fatal', 'warn', 'info', 'debug', 'trace']

                if (typeof proto === 'function') {
                    proto.error = proto.fatal = proto.warn =
                        proto.info = proto.debug = proto.trace = proto
                }
                if (opts.enabled === false) opts.level = 'silent'
                var level = opts.level || 'info'
                var logger = Object.create(proto)
                if (!logger.log) logger.log = noop

                Object.defineProperty(logger, 'levelVal', {
                    get: getLevelVal
                })
                Object.defineProperty(logger, 'level', {
                    get: getLevel,
                    set: setLevel
                })

                var setOpts = {
                    transmit: transmit,
                    serialize: serialize,
                    asObject: opts.browser.asObject,
                    levels: levels
                }
                logger.levels = pino.levels
                logger.level = level

                logger.setMaxListeners = logger.getMaxListeners =
                    logger.emit = logger.addListener = logger.on =
                    logger.prependListener = logger.once =
                    logger.prependOnceListener = logger.removeListener =
                    logger.removeAllListeners = logger.listeners =
                    logger.listenerCount = logger.eventNames =
                    logger.write = logger.flush = noop
                logger.serializers = serializers
                logger._serialize = serialize
                logger._stdErrSerialize = stdErrSerialize
                logger.child = child

                if (transmit) logger._logEvent = createLogEventShape()

                function getLevelVal() {
                    return this.level === 'silent' ?
                        Infinity :
                        this.levels.values[this.level]
                }

                function getLevel() {
                    return this._level
                }

                function setLevel(level) {
                    if (level !== 'silent' && !this.levels.values[level]) {
                        throw Error('unknown level ' + level)
                    }
                    this._level = level

                    set(setOpts, logger, 'error', 'log') // <-- must stay first
                    set(setOpts, logger, 'fatal', 'error')
                    set(setOpts, logger, 'warn', 'error')
                    set(setOpts, logger, 'info', 'log')
                    set(setOpts, logger, 'debug', 'log')
                    set(setOpts, logger, 'trace', 'log')
                }

                function child(bindings) {
                    if (!bindings) {
                        throw new Error('missing bindings for child Pino')
                    }
                    var bindingsSerializers = bindings.serializers
                    if (serialize && bindingsSerializers) {
                        var childSerializers = Object.assign({}, serializers, bindingsSerializers)
                        var childSerialize = opts.browser.serialize === true ?
                            Object.keys(childSerializers) :
                            serialize
                        delete bindings.serializers
                        applySerializers([bindings], childSerialize, childSerializers, this._stdErrSerialize)
                    }

                    function Child(parent) {
                        this._childLevel = (parent._childLevel | 0) + 1
                        this.error = bind(parent, bindings, 'error')
                        this.fatal = bind(parent, bindings, 'fatal')
                        this.warn = bind(parent, bindings, 'warn')
                        this.info = bind(parent, bindings, 'info')
                        this.debug = bind(parent, bindings, 'debug')
                        this.trace = bind(parent, bindings, 'trace')
                        if (childSerializers) {
                            this.serializers = childSerializers
                            this._serialize = childSerialize
                        }
                        if (transmit) this._logEvent.bindings.push(bindings)
                    }
                    Child.prototype = this
                    return new Child(this)
                }
                return logger
            }

            pino.LOG_VERSION = 1

            pino.levels = {
                values: {
                    fatal: 60,
                    error: 50,
                    warn: 40,
                    info: 30,
                    debug: 20,
                    trace: 10
                },
                labels: {
                    '10': 'trace',
                    '20': 'debug',
                    '30': 'info',
                    '40': 'warn',
                    '50': 'error',
                    '60': 'fatal'
                }
            }

            pino.stdSerializers = stdSerializers

            function set(opts, logger, level, fallback) {
                var proto = Object.getPrototypeOf(logger)
                logger[level] = logger.levelVal > logger.levels.values[level] ? noop :
                    (proto[level] ? proto[level] : (_console[level] || _console[fallback] || noop))

                wrap(opts, logger, level)
            }

            function wrap(opts, logger, level) {
                if (!opts.transmit && logger[level] === noop) return

                logger[level] = (function(write) {
                    return function LOG() {
                        var ts = Date.now()
                        var args = new Array(arguments.length)
                        var proto = (Object.getPrototypeOf && Object.getPrototypeOf(this) === _console) ? _console : this
                        for (var i = 0; i < args.length; i++) args[i] = arguments[i]

                        if (opts.serialize && !opts.asObject) {
                            applySerializers(args, this._serialize, this.serializers, this._stdErrSerialize)
                        }
                        if (opts.asObject) write.call(proto, asObject(this, level, args, ts))
                        else write.apply(proto, args)

                        if (opts.transmit) {
                            var transmitLevel = opts.transmit.level || logger.level
                            var transmitValue = pino.levels.values[transmitLevel]
                            var methodValue = pino.levels.values[level]
                            if (methodValue < transmitValue) return
                            transmit(this, {
                                ts: ts,
                                methodLevel: level,
                                methodValue: methodValue,
                                transmitLevel: transmitLevel,
                                transmitValue: pino.levels.values[opts.transmit.level || logger.level],
                                send: opts.transmit.send,
                                val: logger.levelVal
                            }, args)
                        }
                    }
                })(logger[level])
            }

            function asObject(logger, level, args, ts) {
                if (logger._serialize) applySerializers(args, logger._serialize, logger.serializers, logger._stdErrSerialize)
                var msg = args[0]
                var o = { time: ts, level: pino.levels.values[level] }
                var lvl = (logger._childLevel | 0) + 1
                if (lvl < 1) lvl = 1
                    // deliberate, catching objects, arrays
                if (msg !== null && typeof msg === 'object') {
                    args = args.slice()
                    while (lvl-- && typeof args[0] === 'object') {
                        Object.assign(o, args.shift())
                    }
                    msg = args.length ? format(args) : undefined
                } else if (typeof msg === 'string') msg = format(args)
                if (msg !== undefined) o.msg = msg
                return o
            }

            function applySerializers(args, serialize, serializers, stdErrSerialize) {
                for (var i in args) {
                    if (stdErrSerialize && args[i] instanceof Error) {
                        args[i] = pino.stdSerializers.err(args[i])
                    } else if (typeof args[i] === 'object' && !Array.isArray(args[i])) {
                        for (var k in args[i]) {
                            if (serialize && serialize.indexOf(k) > -1 && k in serializers) {
                                args[i][k] = serializers[k](args[i][k])
                            }
                        }
                    }
                }
            }

            function bind(parent, bindings, level) {
                return function() {
                    var args = new Array(1 + arguments.length)
                    args[0] = bindings
                    for (var i = 1; i < args.length; i++) {
                        args[i] = arguments[i - 1]
                    }
                    return parent[level].apply(this, args)
                }
            }

            function transmit(logger, opts, args) {
                var send = opts.send
                var ts = opts.ts
                var methodLevel = opts.methodLevel
                var methodValue = opts.methodValue
                var val = opts.val

                applySerializers(
                    args,
                    logger._serialize || Object.keys(logger.serializers),
                    logger.serializers,
                    logger._stdErrSerialize === undefined ? true : logger._stdErrSerialize
                )
                logger._logEvent.ts = ts
                logger._logEvent.messages = args.filter(function(arg) {
                    // bindings can only be objects, so reference equality check via indexOf is fine
                    return logger._logEvent.bindings.indexOf(arg) === -1
                })

                logger._logEvent.level.label = methodLevel
                logger._logEvent.level.value = methodValue

                send(methodLevel, logger._logEvent, val)

                logger._logEvent = createLogEventShape()
            }

            function createLogEventShape() {
                return {
                    ts: 0,
                    messages: [],
                    bindings: [],
                    level: { label: '', value: 0 }
                }
            }

            function asErrValue(err) {
                var obj = {
                    type: err.constructor.name,
                    msg: err.message,
                    stack: err.stack
                }
                for (var key in err) {
                    if (obj[key] === undefined) {
                        obj[key] = err[key]
                    }
                }
                return obj
            }

            function mock() { return {} }

            function noop() {}

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, { "quick-format-unescaped": 35 }],
    35: [function(require, module, exports) {
        var safeStringify = require('fast-safe-stringify')

        function tryStringify(o) {
            try { return JSON.stringify(o) } catch (e) { return '"[Circular]"' }
        }

        module.exports = function format(args, opts) {
            var ss = (opts && opts.lowres) ? tryStringify : safeStringify
            var f = args[0]
            if (typeof f !== 'string') {
                var objects = new Array(args.length)
                for (var index = 0; index < args.length; index++) {
                    objects[index] = ss(args[index])
                }
                return objects.join(' ')
            }

            var argLen = args.length

            if (argLen === 1) return f
            var x = ''
            var str = ''
            var a = 1
            var lastPos = 0
            var flen = f.length
            for (var i = 0; i < flen;) {
                if (f.charCodeAt(i) === 37 && i + 1 < flen) {
                    switch (f.charCodeAt(i + 1)) {
                        case 100: // 'd'
                            if (a >= argLen)
                                break
                            if (lastPos < i)
                                str += f.slice(lastPos, i)
                            if (args[a] == null) break
                            str += Number(args[a])
                            lastPos = i = i + 2
                            break
                        case 79: // 'O'
                        case 111: // 'o'
                        case 106: // 'j'
                            if (a >= argLen)
                                break
                            if (lastPos < i)
                                str += f.slice(lastPos, i)
                            if (args[a] === undefined) break
                            var type = typeof args[a]
                            if (type === 'string') {
                                str += '\'' + args[a] + '\''
                                lastPos = i = i + 2
                                break
                            }
                            if (type === 'function') {
                                str += args[a].name || '<anonymous>'
                                lastPos = i = i + 2
                                break
                            }
                            str += ss(args[a])
                            lastPos = i = i + 2
                            break
                        case 115: // 's'
                            if (a >= argLen)
                                break
                            if (lastPos < i)
                                str += f.slice(lastPos, i)
                            str += String(args[a])
                            lastPos = i = i + 2
                            break
                        case 37: // '%'
                            if (lastPos < i)
                                str += f.slice(lastPos, i)
                            str += '%'
                            lastPos = i = i + 2
                            break
                    }
                    ++a
                }
                ++i
            }
            if (lastPos === 0)
                str = f
            else if (lastPos < flen) {
                str += f.slice(lastPos)
            }
            while (a < argLen) {
                x = args[a++]
                if (x === null || (typeof x !== 'object')) {
                    str += ' ' + x
                } else {
                    str += ' ' + ss(x)
                }
            }

            return str
        }

    }, { "fast-safe-stringify": 22 }],
    36: [function(require, module, exports) {
        (function(Buffer) {
            /*
            node-bzip - a pure-javascript Node.JS module for decoding bzip2 data

            Copyright (C) 2012 Eli Skeggs

            This library is free software; you can redistribute it and/or
            modify it under the terms of the GNU Lesser General Public
            License as published by the Free Software Foundation; either
            version 2.1 of the License, or (at your option) any later version.

            This library is distributed in the hope that it will be useful,
            but WITHOUT ANY WARRANTY; without even the implied warranty of
            MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
            Lesser General Public License for more details.

            You should have received a copy of the GNU Lesser General Public
            License along with this library; if not, see
            http://www.gnu.org/licenses/lgpl-2.1.html

            Adapted from bzip2.js, copyright 2011 antimatter15 (antimatter15@gmail.com).

            Based on micro-bunzip by Rob Landley (rob@landley.net).

            Based on bzip2 decompression code by Julian R Seward (jseward@acm.org),
            which also acknowledges contributions by Mike Burrows, David Wheeler,
            Peter Fenwick, Alistair Moffat, Radford Neal, Ian H. Witten,
            Robert Sedgewick, and Jon L. Bentley.
            */

            var BITMASK = [0x00, 0x01, 0x03, 0x07, 0x0F, 0x1F, 0x3F, 0x7F, 0xFF];

            // offset in bytes
            var BitReader = function(stream) {
                this.stream = stream;
                this.bitOffset = 0;
                this.curByte = 0;
                this.hasByte = false;
            };

            BitReader.prototype._ensureByte = function() {
                if (!this.hasByte) {
                    this.curByte = this.stream.readByte();
                    this.hasByte = true;
                }
            };

            // reads bits from the buffer
            BitReader.prototype.read = function(bits) {
                var result = 0;
                while (bits > 0) {
                    this._ensureByte();
                    var remaining = 8 - this.bitOffset;
                    // if we're in a byte
                    if (bits >= remaining) {
                        result <<= remaining;
                        result |= BITMASK[remaining] & this.curByte;
                        this.hasByte = false;
                        this.bitOffset = 0;
                        bits -= remaining;
                    } else {
                        result <<= bits;
                        var shift = remaining - bits;
                        result |= (this.curByte & (BITMASK[bits] << shift)) >> shift;
                        this.bitOffset += bits;
                        bits = 0;
                    }
                }
                return result;
            };

            // seek to an arbitrary point in the buffer (expressed in bits)
            BitReader.prototype.seek = function(pos) {
                var n_bit = pos % 8;
                var n_byte = (pos - n_bit) / 8;
                this.bitOffset = n_bit;
                this.stream.seek(n_byte);
                this.hasByte = false;
            };

            // reads 6 bytes worth of data using the read method
            BitReader.prototype.pi = function() {
                var buf = new Buffer(6),
                    i;
                for (i = 0; i < buf.length; i++) {
                    buf[i] = this.read(8);
                }
                return buf.toString('hex');
            };

            module.exports = BitReader;

        }).call(this, require("buffer").Buffer)
    }, { "buffer": 61 }],
    37: [function(require, module, exports) {
        /* CRC32, used in Bzip2 implementation.
         * This is a port of CRC32.java from the jbzip2 implementation at
         *   https://code.google.com/p/jbzip2
         * which is:
         *   Copyright (c) 2011 Matthew Francis
         *
         *   Permission is hereby granted, free of charge, to any person
         *   obtaining a copy of this software and associated documentation
         *   files (the "Software"), to deal in the Software without
         *   restriction, including without limitation the rights to use,
         *   copy, modify, merge, publish, distribute, sublicense, and/or sell
         *   copies of the Software, and to permit persons to whom the
         *   Software is furnished to do so, subject to the following
         *   conditions:
         *
         *   The above copyright notice and this permission notice shall be
         *   included in all copies or substantial portions of the Software.
         *
         *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
         *   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
         *   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
         *   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
         *   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
         *   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
         *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
         *   OTHER DEALINGS IN THE SOFTWARE.
         * This JavaScript implementation is:
         *   Copyright (c) 2013 C. Scott Ananian
         * with the same licensing terms as Matthew Francis' original implementation.
         */
        module.exports = (function() {

            /**
             * A static CRC lookup table
             */
            var crc32Lookup = new Uint32Array([
                0x00000000, 0x04c11db7, 0x09823b6e, 0x0d4326d9, 0x130476dc, 0x17c56b6b, 0x1a864db2, 0x1e475005,
                0x2608edb8, 0x22c9f00f, 0x2f8ad6d6, 0x2b4bcb61, 0x350c9b64, 0x31cd86d3, 0x3c8ea00a, 0x384fbdbd,
                0x4c11db70, 0x48d0c6c7, 0x4593e01e, 0x4152fda9, 0x5f15adac, 0x5bd4b01b, 0x569796c2, 0x52568b75,
                0x6a1936c8, 0x6ed82b7f, 0x639b0da6, 0x675a1011, 0x791d4014, 0x7ddc5da3, 0x709f7b7a, 0x745e66cd,
                0x9823b6e0, 0x9ce2ab57, 0x91a18d8e, 0x95609039, 0x8b27c03c, 0x8fe6dd8b, 0x82a5fb52, 0x8664e6e5,
                0xbe2b5b58, 0xbaea46ef, 0xb7a96036, 0xb3687d81, 0xad2f2d84, 0xa9ee3033, 0xa4ad16ea, 0xa06c0b5d,
                0xd4326d90, 0xd0f37027, 0xddb056fe, 0xd9714b49, 0xc7361b4c, 0xc3f706fb, 0xceb42022, 0xca753d95,
                0xf23a8028, 0xf6fb9d9f, 0xfbb8bb46, 0xff79a6f1, 0xe13ef6f4, 0xe5ffeb43, 0xe8bccd9a, 0xec7dd02d,
                0x34867077, 0x30476dc0, 0x3d044b19, 0x39c556ae, 0x278206ab, 0x23431b1c, 0x2e003dc5, 0x2ac12072,
                0x128e9dcf, 0x164f8078, 0x1b0ca6a1, 0x1fcdbb16, 0x018aeb13, 0x054bf6a4, 0x0808d07d, 0x0cc9cdca,
                0x7897ab07, 0x7c56b6b0, 0x71159069, 0x75d48dde, 0x6b93dddb, 0x6f52c06c, 0x6211e6b5, 0x66d0fb02,
                0x5e9f46bf, 0x5a5e5b08, 0x571d7dd1, 0x53dc6066, 0x4d9b3063, 0x495a2dd4, 0x44190b0d, 0x40d816ba,
                0xaca5c697, 0xa864db20, 0xa527fdf9, 0xa1e6e04e, 0xbfa1b04b, 0xbb60adfc, 0xb6238b25, 0xb2e29692,
                0x8aad2b2f, 0x8e6c3698, 0x832f1041, 0x87ee0df6, 0x99a95df3, 0x9d684044, 0x902b669d, 0x94ea7b2a,
                0xe0b41de7, 0xe4750050, 0xe9362689, 0xedf73b3e, 0xf3b06b3b, 0xf771768c, 0xfa325055, 0xfef34de2,
                0xc6bcf05f, 0xc27dede8, 0xcf3ecb31, 0xcbffd686, 0xd5b88683, 0xd1799b34, 0xdc3abded, 0xd8fba05a,
                0x690ce0ee, 0x6dcdfd59, 0x608edb80, 0x644fc637, 0x7a089632, 0x7ec98b85, 0x738aad5c, 0x774bb0eb,
                0x4f040d56, 0x4bc510e1, 0x46863638, 0x42472b8f, 0x5c007b8a, 0x58c1663d, 0x558240e4, 0x51435d53,
                0x251d3b9e, 0x21dc2629, 0x2c9f00f0, 0x285e1d47, 0x36194d42, 0x32d850f5, 0x3f9b762c, 0x3b5a6b9b,
                0x0315d626, 0x07d4cb91, 0x0a97ed48, 0x0e56f0ff, 0x1011a0fa, 0x14d0bd4d, 0x19939b94, 0x1d528623,
                0xf12f560e, 0xf5ee4bb9, 0xf8ad6d60, 0xfc6c70d7, 0xe22b20d2, 0xe6ea3d65, 0xeba91bbc, 0xef68060b,
                0xd727bbb6, 0xd3e6a601, 0xdea580d8, 0xda649d6f, 0xc423cd6a, 0xc0e2d0dd, 0xcda1f604, 0xc960ebb3,
                0xbd3e8d7e, 0xb9ff90c9, 0xb4bcb610, 0xb07daba7, 0xae3afba2, 0xaafbe615, 0xa7b8c0cc, 0xa379dd7b,
                0x9b3660c6, 0x9ff77d71, 0x92b45ba8, 0x9675461f, 0x8832161a, 0x8cf30bad, 0x81b02d74, 0x857130c3,
                0x5d8a9099, 0x594b8d2e, 0x5408abf7, 0x50c9b640, 0x4e8ee645, 0x4a4ffbf2, 0x470cdd2b, 0x43cdc09c,
                0x7b827d21, 0x7f436096, 0x7200464f, 0x76c15bf8, 0x68860bfd, 0x6c47164a, 0x61043093, 0x65c52d24,
                0x119b4be9, 0x155a565e, 0x18197087, 0x1cd86d30, 0x029f3d35, 0x065e2082, 0x0b1d065b, 0x0fdc1bec,
                0x3793a651, 0x3352bbe6, 0x3e119d3f, 0x3ad08088, 0x2497d08d, 0x2056cd3a, 0x2d15ebe3, 0x29d4f654,
                0xc5a92679, 0xc1683bce, 0xcc2b1d17, 0xc8ea00a0, 0xd6ad50a5, 0xd26c4d12, 0xdf2f6bcb, 0xdbee767c,
                0xe3a1cbc1, 0xe760d676, 0xea23f0af, 0xeee2ed18, 0xf0a5bd1d, 0xf464a0aa, 0xf9278673, 0xfde69bc4,
                0x89b8fd09, 0x8d79e0be, 0x803ac667, 0x84fbdbd0, 0x9abc8bd5, 0x9e7d9662, 0x933eb0bb, 0x97ffad0c,
                0xafb010b1, 0xab710d06, 0xa6322bdf, 0xa2f33668, 0xbcb4666d, 0xb8757bda, 0xb5365d03, 0xb1f740b4
            ]);

            var CRC32 = function() {
                /**
                 * The current CRC
                 */
                var crc = 0xffffffff;

                /**
                 * @return The current CRC
                 */
                this.getCRC = function() {
                    return (~crc) >>> 0; // return an unsigned value
                };

                /**
                 * Update the CRC with a single byte
                 * @param value The value to update the CRC with
                 */
                this.updateCRC = function(value) {
                    crc = (crc << 8) ^ crc32Lookup[((crc >>> 24) ^ value) & 0xff];
                };

                /**
                 * Update the CRC with a sequence of identical bytes
                 * @param value The value to update the CRC with
                 * @param count The number of bytes
                 */
                this.updateCRCRun = function(value, count) {
                    while (count-- > 0) {
                        crc = (crc << 8) ^ crc32Lookup[((crc >>> 24) ^ value) & 0xff];
                    }
                };
            };
            return CRC32;
        })();

    }, {}],
    38: [function(require, module, exports) {
        (function(Buffer) {
            /*
            seek-bzip - a pure-javascript module for seeking within bzip2 data

            Copyright (C) 2013 C. Scott Ananian
            Copyright (C) 2012 Eli Skeggs
            Copyright (C) 2011 Kevin Kwok

            This library is free software; you can redistribute it and/or
            modify it under the terms of the GNU Lesser General Public
            License as published by the Free Software Foundation; either
            version 2.1 of the License, or (at your option) any later version.

            This library is distributed in the hope that it will be useful,
            but WITHOUT ANY WARRANTY; without even the implied warranty of
            MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
            Lesser General Public License for more details.

            You should have received a copy of the GNU Lesser General Public
            License along with this library; if not, see
            http://www.gnu.org/licenses/lgpl-2.1.html

            Adapted from node-bzip, copyright 2012 Eli Skeggs.
            Adapted from bzip2.js, copyright 2011 Kevin Kwok (antimatter15@gmail.com).

            Based on micro-bunzip by Rob Landley (rob@landley.net).

            Based on bzip2 decompression code by Julian R Seward (jseward@acm.org),
            which also acknowledges contributions by Mike Burrows, David Wheeler,
            Peter Fenwick, Alistair Moffat, Radford Neal, Ian H. Witten,
            Robert Sedgewick, and Jon L. Bentley.
            */

            var BitReader = require('./bitreader');
            var Stream = require('./stream');
            var CRC32 = require('./crc32');
            var pjson = require('../package.json');

            var MAX_HUFCODE_BITS = 20;
            var MAX_SYMBOLS = 258;
            var SYMBOL_RUNA = 0;
            var SYMBOL_RUNB = 1;
            var MIN_GROUPS = 2;
            var MAX_GROUPS = 6;
            var GROUP_SIZE = 50;

            var WHOLEPI = "314159265359";
            var SQRTPI = "177245385090";

            var mtf = function(array, index) {
                var src = array[index],
                    i;
                for (i = index; i > 0; i--) {
                    array[i] = array[i - 1];
                }
                array[0] = src;
                return src;
            };

            var Err = {
                OK: 0,
                LAST_BLOCK: -1,
                NOT_BZIP_DATA: -2,
                UNEXPECTED_INPUT_EOF: -3,
                UNEXPECTED_OUTPUT_EOF: -4,
                DATA_ERROR: -5,
                OUT_OF_MEMORY: -6,
                OBSOLETE_INPUT: -7,
                END_OF_BLOCK: -8
            };
            var ErrorMessages = {};
            ErrorMessages[Err.LAST_BLOCK] = "Bad file checksum";
            ErrorMessages[Err.NOT_BZIP_DATA] = "Not bzip data";
            ErrorMessages[Err.UNEXPECTED_INPUT_EOF] = "Unexpected input EOF";
            ErrorMessages[Err.UNEXPECTED_OUTPUT_EOF] = "Unexpected output EOF";
            ErrorMessages[Err.DATA_ERROR] = "Data error";
            ErrorMessages[Err.OUT_OF_MEMORY] = "Out of memory";
            ErrorMessages[Err.OBSOLETE_INPUT] = "Obsolete (pre 0.9.5) bzip format not supported.";

            var _throw = function(status, optDetail) {
                var msg = ErrorMessages[status] || 'unknown error';
                if (optDetail) { msg += ': ' + optDetail; }
                var e = new TypeError(msg);
                e.errorCode = status;
                throw e;
            };

            var Bunzip = function(inputStream, outputStream) {
                this.writePos = this.writeCurrent = this.writeCount = 0;

                this._start_bunzip(inputStream, outputStream);
            };
            Bunzip.prototype._init_block = function() {
                var moreBlocks = this._get_next_block();
                if (!moreBlocks) {
                    this.writeCount = -1;
                    return false; /* no more blocks */
                }
                this.blockCRC = new CRC32();
                return true;
            };
            /* XXX micro-bunzip uses (inputStream, inputBuffer, len) as arguments */
            Bunzip.prototype._start_bunzip = function(inputStream, outputStream) {
                /* Ensure that file starts with "BZh['1'-'9']." */
                var buf = new Buffer(4);
                if (inputStream.read(buf, 0, 4) !== 4 ||
                    String.fromCharCode(buf[0], buf[1], buf[2]) !== 'BZh')
                    _throw(Err.NOT_BZIP_DATA, 'bad magic');

                var level = buf[3] - 0x30;
                if (level < 1 || level > 9)
                    _throw(Err.NOT_BZIP_DATA, 'level out of range');

                this.reader = new BitReader(inputStream);

                /* Fourth byte (ascii '1'-'9'), indicates block size in units of 100k of
                   uncompressed data.  Allocate intermediate buffer for block. */
                this.dbufSize = 100000 * level;
                this.nextoutput = 0;
                this.outputStream = outputStream;
                this.streamCRC = 0;
            };
            Bunzip.prototype._get_next_block = function() {
                var i, j, k;
                var reader = this.reader;
                // this is get_next_block() function from micro-bunzip:
                /* Read in header signature and CRC, then validate signature.
                   (last block signature means CRC is for whole file, return now) */
                var h = reader.pi();
                if (h === SQRTPI) { // last block
                    return false; /* no more blocks */
                }
                if (h !== WHOLEPI)
                    _throw(Err.NOT_BZIP_DATA);
                this.targetBlockCRC = reader.read(32) >>> 0; // (convert to unsigned)
                this.streamCRC = (this.targetBlockCRC ^
                    ((this.streamCRC << 1) | (this.streamCRC >>> 31))) >>> 0;
                /* We can add support for blockRandomised if anybody complains.  There was
                   some code for this in busybox 1.0.0-pre3, but nobody ever noticed that
                   it didn't actually work. */
                if (reader.read(1))
                    _throw(Err.OBSOLETE_INPUT);
                var origPointer = reader.read(24);
                if (origPointer > this.dbufSize)
                    _throw(Err.DATA_ERROR, 'initial position out of bounds');
                /* mapping table: if some byte values are never used (encoding things
                   like ascii text), the compression code removes the gaps to have fewer
                   symbols to deal with, and writes a sparse bitfield indicating which
                   values were present.  We make a translation table to convert the symbols
                   back to the corresponding bytes. */
                var t = reader.read(16);
                var symToByte = new Buffer(256),
                    symTotal = 0;
                for (i = 0; i < 16; i++) {
                    if (t & (1 << (0xF - i))) {
                        var o = i * 16;
                        k = reader.read(16);
                        for (j = 0; j < 16; j++)
                            if (k & (1 << (0xF - j)))
                                symToByte[symTotal++] = o + j;
                    }
                }

                /* How many different huffman coding groups does this block use? */
                var groupCount = reader.read(3);
                if (groupCount < MIN_GROUPS || groupCount > MAX_GROUPS)
                    _throw(Err.DATA_ERROR);
                /* nSelectors: Every GROUP_SIZE many symbols we select a new huffman coding
                   group.  Read in the group selector list, which is stored as MTF encoded
                   bit runs.  (MTF=Move To Front, as each value is used it's moved to the
                   start of the list.) */
                var nSelectors = reader.read(15);
                if (nSelectors === 0)
                    _throw(Err.DATA_ERROR);

                var mtfSymbol = new Buffer(256);
                for (i = 0; i < groupCount; i++)
                    mtfSymbol[i] = i;

                var selectors = new Buffer(nSelectors); // was 32768...

                for (i = 0; i < nSelectors; i++) {
                    /* Get next value */
                    for (j = 0; reader.read(1); j++)
                        if (j >= groupCount) _throw(Err.DATA_ERROR);
                        /* Decode MTF to get the next selector */
                    selectors[i] = mtf(mtfSymbol, j);
                }

                /* Read the huffman coding tables for each group, which code for symTotal
                   literal symbols, plus two run symbols (RUNA, RUNB) */
                var symCount = symTotal + 2;
                var groups = [],
                    hufGroup;
                for (j = 0; j < groupCount; j++) {
                    var length = new Buffer(symCount),
                        temp = new Uint16Array(MAX_HUFCODE_BITS + 1);
                    /* Read huffman code lengths for each symbol.  They're stored in
                       a way similar to mtf; record a starting value for the first symbol,
                       and an offset from the previous value for everys symbol after that. */
                    t = reader.read(5); // lengths
                    for (i = 0; i < symCount; i++) {
                        for (;;) {
                            if (t < 1 || t > MAX_HUFCODE_BITS) _throw(Err.DATA_ERROR);
                            /* If first bit is 0, stop.  Else second bit indicates whether
                               to increment or decrement the value. */
                            if (!reader.read(1))
                                break;
                            if (!reader.read(1))
                                t++;
                            else
                                t--;
                        }
                        length[i] = t;
                    }

                    /* Find largest and smallest lengths in this group */
                    var minLen, maxLen;
                    minLen = maxLen = length[0];
                    for (i = 1; i < symCount; i++) {
                        if (length[i] > maxLen)
                            maxLen = length[i];
                        else if (length[i] < minLen)
                            minLen = length[i];
                    }

                    /* Calculate permute[], base[], and limit[] tables from length[].
                     *
                     * permute[] is the lookup table for converting huffman coded symbols
                     * into decoded symbols.  base[] is the amount to subtract from the
                     * value of a huffman symbol of a given length when using permute[].
                     *
                     * limit[] indicates the largest numerical value a symbol with a given
                     * number of bits can have.  This is how the huffman codes can vary in
                     * length: each code with a value>limit[length] needs another bit.
                     */
                    hufGroup = {};
                    groups.push(hufGroup);
                    hufGroup.permute = new Uint16Array(MAX_SYMBOLS);
                    hufGroup.limit = new Uint32Array(MAX_HUFCODE_BITS + 2);
                    hufGroup.base = new Uint32Array(MAX_HUFCODE_BITS + 1);
                    hufGroup.minLen = minLen;
                    hufGroup.maxLen = maxLen;
                    /* Calculate permute[].  Concurently, initialize temp[] and limit[]. */
                    var pp = 0;
                    for (i = minLen; i <= maxLen; i++) {
                        temp[i] = hufGroup.limit[i] = 0;
                        for (t = 0; t < symCount; t++)
                            if (length[t] === i)
                                hufGroup.permute[pp++] = t;
                    }
                    /* Count symbols coded for at each bit length */
                    for (i = 0; i < symCount; i++)
                        temp[length[i]]++;
                    /* Calculate limit[] (the largest symbol-coding value at each bit
                     * length, which is (previous limit<<1)+symbols at this level), and
                     * base[] (number of symbols to ignore at each bit length, which is
                     * limit minus the cumulative count of symbols coded for already). */
                    pp = t = 0;
                    for (i = minLen; i < maxLen; i++) {
                        pp += temp[i];
                        /* We read the largest possible symbol size and then unget bits
                           after determining how many we need, and those extra bits could
                           be set to anything.  (They're noise from future symbols.)  At
                           each level we're really only interested in the first few bits,
                           so here we set all the trailing to-be-ignored bits to 1 so they
                           don't affect the value>limit[length] comparison. */
                        hufGroup.limit[i] = pp - 1;
                        pp <<= 1;
                        t += temp[i];
                        hufGroup.base[i + 1] = pp - t;
                    }
                    hufGroup.limit[maxLen + 1] = Number.MAX_VALUE; /* Sentinal value for reading next sym. */
                    hufGroup.limit[maxLen] = pp + temp[maxLen] - 1;
                    hufGroup.base[minLen] = 0;
                }
                /* We've finished reading and digesting the block header.  Now read this
                   block's huffman coded symbols from the file and undo the huffman coding
                   and run length encoding, saving the result into dbuf[dbufCount++]=uc */

                /* Initialize symbol occurrence counters and symbol Move To Front table */
                var byteCount = new Uint32Array(256);
                for (i = 0; i < 256; i++)
                    mtfSymbol[i] = i;
                /* Loop through compressed symbols. */
                var runPos = 0,
                    dbufCount = 0,
                    selector = 0,
                    uc;
                var dbuf = this.dbuf = new Uint32Array(this.dbufSize);
                symCount = 0;
                for (;;) {
                    /* Determine which huffman coding group to use. */
                    if (!(symCount--)) {
                        symCount = GROUP_SIZE - 1;
                        if (selector >= nSelectors) { _throw(Err.DATA_ERROR); }
                        hufGroup = groups[selectors[selector++]];
                    }
                    /* Read next huffman-coded symbol. */
                    i = hufGroup.minLen;
                    j = reader.read(i);
                    for (;; i++) {
                        if (i > hufGroup.maxLen) { _throw(Err.DATA_ERROR); }
                        if (j <= hufGroup.limit[i])
                            break;
                        j = (j << 1) | reader.read(1);
                    }
                    /* Huffman decode value to get nextSym (with bounds checking) */
                    j -= hufGroup.base[i];
                    if (j < 0 || j >= MAX_SYMBOLS) { _throw(Err.DATA_ERROR); }
                    var nextSym = hufGroup.permute[j];
                    /* We have now decoded the symbol, which indicates either a new literal
                       byte, or a repeated run of the most recent literal byte.  First,
                       check if nextSym indicates a repeated run, and if so loop collecting
                       how many times to repeat the last literal. */
                    if (nextSym === SYMBOL_RUNA || nextSym === SYMBOL_RUNB) {
                        /* If this is the start of a new run, zero out counter */
                        if (!runPos) {
                            runPos = 1;
                            t = 0;
                        }
                        /* Neat trick that saves 1 symbol: instead of or-ing 0 or 1 at
                           each bit position, add 1 or 2 instead.  For example,
                           1011 is 1<<0 + 1<<1 + 2<<2.  1010 is 2<<0 + 2<<1 + 1<<2.
                           You can make any bit pattern that way using 1 less symbol than
                           the basic or 0/1 method (except all bits 0, which would use no
                           symbols, but a run of length 0 doesn't mean anything in this
                           context).  Thus space is saved. */
                        if (nextSym === SYMBOL_RUNA)
                            t += runPos;
                        else
                            t += 2 * runPos;
                        runPos <<= 1;
                        continue;
                    }
                    /* When we hit the first non-run symbol after a run, we now know
                       how many times to repeat the last literal, so append that many
                       copies to our buffer of decoded symbols (dbuf) now.  (The last
                       literal used is the one at the head of the mtfSymbol array.) */
                    if (runPos) {
                        runPos = 0;
                        if (dbufCount + t > this.dbufSize) { _throw(Err.DATA_ERROR); }
                        uc = symToByte[mtfSymbol[0]];
                        byteCount[uc] += t;
                        while (t--)
                            dbuf[dbufCount++] = uc;
                    }
                    /* Is this the terminating symbol? */
                    if (nextSym > symTotal)
                        break;
                    /* At this point, nextSym indicates a new literal character.  Subtract
                       one to get the position in the MTF array at which this literal is
                       currently to be found.  (Note that the result can't be -1 or 0,
                       because 0 and 1 are RUNA and RUNB.  But another instance of the
                       first symbol in the mtf array, position 0, would have been handled
                       as part of a run above.  Therefore 1 unused mtf position minus
                       2 non-literal nextSym values equals -1.) */
                    if (dbufCount >= this.dbufSize) { _throw(Err.DATA_ERROR); }
                    i = nextSym - 1;
                    uc = mtf(mtfSymbol, i);
                    uc = symToByte[uc];
                    /* We have our literal byte.  Save it into dbuf. */
                    byteCount[uc]++;
                    dbuf[dbufCount++] = uc;
                }
                /* At this point, we've read all the huffman-coded symbols (and repeated
                   runs) for this block from the input stream, and decoded them into the
                   intermediate buffer.  There are dbufCount many decoded bytes in dbuf[].
                   Now undo the Burrows-Wheeler transform on dbuf.
                   See http://dogma.net/markn/articles/bwt/bwt.htm
                */
                if (origPointer < 0 || origPointer >= dbufCount) { _throw(Err.DATA_ERROR); }
                /* Turn byteCount into cumulative occurrence counts of 0 to n-1. */
                j = 0;
                for (i = 0; i < 256; i++) {
                    k = j + byteCount[i];
                    byteCount[i] = j;
                    j = k;
                }
                /* Figure out what order dbuf would be in if we sorted it. */
                for (i = 0; i < dbufCount; i++) {
                    uc = dbuf[i] & 0xff;
                    dbuf[byteCount[uc]] |= (i << 8);
                    byteCount[uc]++;
                }
                /* Decode first byte by hand to initialize "previous" byte.  Note that it
                   doesn't get output, and if the first three characters are identical
                   it doesn't qualify as a run (hence writeRunCountdown=5). */
                var pos = 0,
                    current = 0,
                    run = 0;
                if (dbufCount) {
                    pos = dbuf[origPointer];
                    current = (pos & 0xff);
                    pos >>= 8;
                    run = -1;
                }
                this.writePos = pos;
                this.writeCurrent = current;
                this.writeCount = dbufCount;
                this.writeRun = run;

                return true; /* more blocks to come */
            };
            /* Undo burrows-wheeler transform on intermediate buffer to produce output.
               If start_bunzip was initialized with out_fd=-1, then up to len bytes of
               data are written to outbuf.  Return value is number of bytes written or
               error (all errors are negative numbers).  If out_fd!=-1, outbuf and len
               are ignored, data is written to out_fd and return is RETVAL_OK or error.
            */
            Bunzip.prototype._read_bunzip = function(outputBuffer, len) {
                var copies, previous, outbyte;
                /* james@jamestaylor.org: writeCount goes to -1 when the buffer is fully
                   decoded, which results in this returning RETVAL_LAST_BLOCK, also
                   equal to -1... Confusing, I'm returning 0 here to indicate no
                   bytes written into the buffer */
                if (this.writeCount < 0) { return 0; }

                var gotcount = 0;
                var dbuf = this.dbuf,
                    pos = this.writePos,
                    current = this.writeCurrent;
                var dbufCount = this.writeCount,
                    outputsize = this.outputsize;
                var run = this.writeRun;

                while (dbufCount) {
                    dbufCount--;
                    previous = current;
                    pos = dbuf[pos];
                    current = pos & 0xff;
                    pos >>= 8;
                    if (run++ === 3) {
                        copies = current;
                        outbyte = previous;
                        current = -1;
                    } else {
                        copies = 1;
                        outbyte = current;
                    }
                    this.blockCRC.updateCRCRun(outbyte, copies);
                    while (copies--) {
                        this.outputStream.writeByte(outbyte);
                        this.nextoutput++;
                    }
                    if (current != previous)
                        run = 0;
                }
                this.writeCount = dbufCount;
                // check CRC
                if (this.blockCRC.getCRC() !== this.targetBlockCRC) {
                    _throw(Err.DATA_ERROR, "Bad block CRC " +
                        "(got " + this.blockCRC.getCRC().toString(16) +
                        " expected " + this.targetBlockCRC.toString(16) + ")");
                }
                return this.nextoutput;
            };

            var coerceInputStream = function(input) {
                if ('readByte' in input) { return input; }
                var inputStream = new Stream();
                inputStream.pos = 0;
                inputStream.readByte = function() { return input[this.pos++]; };
                inputStream.seek = function(pos) { this.pos = pos; };
                inputStream.eof = function() { return this.pos >= input.length; };
                return inputStream;
            };
            var coerceOutputStream = function(output) {
                var outputStream = new Stream();
                var resizeOk = true;
                if (output) {
                    if (typeof(output) === 'number') {
                        outputStream.buffer = new Buffer(output);
                        resizeOk = false;
                    } else if ('writeByte' in output) {
                        return output;
                    } else {
                        outputStream.buffer = output;
                        resizeOk = false;
                    }
                } else {
                    outputStream.buffer = new Buffer(16384);
                }
                outputStream.pos = 0;
                outputStream.writeByte = function(_byte) {
                    if (resizeOk && this.pos >= this.buffer.length) {
                        var newBuffer = new Buffer(this.buffer.length * 2);
                        this.buffer.copy(newBuffer);
                        this.buffer = newBuffer;
                    }
                    this.buffer[this.pos++] = _byte;
                };
                outputStream.getBuffer = function() {
                    // trim buffer
                    if (this.pos !== this.buffer.length) {
                        if (!resizeOk)
                            throw new TypeError('outputsize does not match decoded input');
                        var newBuffer = new Buffer(this.pos);
                        this.buffer.copy(newBuffer, 0, 0, this.pos);
                        this.buffer = newBuffer;
                    }
                    return this.buffer;
                };
                outputStream._coerced = true;
                return outputStream;
            };

            /* Static helper functions */
            Bunzip.Err = Err;
            // 'input' can be a stream or a buffer
            // 'output' can be a stream or a buffer or a number (buffer size)
            Bunzip.decode = function(input, output, multistream) {
                // make a stream from a buffer, if necessary
                var inputStream = coerceInputStream(input);
                var outputStream = coerceOutputStream(output);

                var bz = new Bunzip(inputStream, outputStream);
                while (true) {
                    if ('eof' in inputStream && inputStream.eof()) break;
                    if (bz._init_block()) {
                        bz._read_bunzip();
                    } else {
                        var targetStreamCRC = bz.reader.read(32) >>> 0; // (convert to unsigned)
                        if (targetStreamCRC !== bz.streamCRC) {
                            _throw(Err.DATA_ERROR, "Bad stream CRC " +
                                "(got " + bz.streamCRC.toString(16) +
                                " expected " + targetStreamCRC.toString(16) + ")");
                        }
                        if (multistream &&
                            'eof' in inputStream &&
                            !inputStream.eof()) {
                            // note that start_bunzip will also resync the bit reader to next byte
                            bz._start_bunzip(inputStream, outputStream);
                        } else break;
                    }
                }
                if ('getBuffer' in outputStream)
                    return outputStream.getBuffer();
            };
            Bunzip.decodeBlock = function(input, pos, output) {
                // make a stream from a buffer, if necessary
                var inputStream = coerceInputStream(input);
                var outputStream = coerceOutputStream(output);
                var bz = new Bunzip(inputStream, outputStream);
                bz.reader.seek(pos);
                /* Fill the decode buffer for the block */
                var moreBlocks = bz._get_next_block();
                if (moreBlocks) {
                    /* Init the CRC for writing */
                    bz.blockCRC = new CRC32();

                    /* Zero this so the current byte from before the seek is not written */
                    bz.writeCopies = 0;

                    /* Decompress the block and write to stdout */
                    bz._read_bunzip();
                    // XXX keep writing?
                }
                if ('getBuffer' in outputStream)
                    return outputStream.getBuffer();
            };
            /* Reads bzip2 file from stream or buffer `input`, and invoke
             * `callback(position, size)` once for each bzip2 block,
             * where position gives the starting position (in *bits*)
             * and size gives uncompressed size of the block (in *bytes*). */
            Bunzip.table = function(input, callback, multistream) {
                // make a stream from a buffer, if necessary
                var inputStream = new Stream();
                inputStream.delegate = coerceInputStream(input);
                inputStream.pos = 0;
                inputStream.readByte = function() {
                    this.pos++;
                    return this.delegate.readByte();
                };
                if (inputStream.delegate.eof) {
                    inputStream.eof = inputStream.delegate.eof.bind(inputStream.delegate);
                }
                var outputStream = new Stream();
                outputStream.pos = 0;
                outputStream.writeByte = function() { this.pos++; };

                var bz = new Bunzip(inputStream, outputStream);
                var blockSize = bz.dbufSize;
                while (true) {
                    if ('eof' in inputStream && inputStream.eof()) break;

                    var position = inputStream.pos * 8 + bz.reader.bitOffset;
                    if (bz.reader.hasByte) { position -= 8; }

                    if (bz._init_block()) {
                        var start = outputStream.pos;
                        bz._read_bunzip();
                        callback(position, outputStream.pos - start);
                    } else {
                        var crc = bz.reader.read(32); // (but we ignore the crc)
                        if (multistream &&
                            'eof' in inputStream &&
                            !inputStream.eof()) {
                            // note that start_bunzip will also resync the bit reader to next byte
                            bz._start_bunzip(inputStream, outputStream);
                            console.assert(bz.dbufSize === blockSize,
                                "shouldn't change block size within multistream file");
                        } else break;
                    }
                }
            };

            Bunzip.Stream = Stream;

            Bunzip.version = pjson.version;
            Bunzip.license = pjson.license;

            module.exports = Bunzip;

        }).call(this, require("buffer").Buffer)
    }, { "../package.json": 40, "./bitreader": 36, "./crc32": 37, "./stream": 39, "buffer": 61 }],
    39: [function(require, module, exports) {
        /* very simple input/output stream interface */
        var Stream = function() {};

        // input streams //////////////
        /** Returns the next byte, or -1 for EOF. */
        Stream.prototype.readByte = function() {
            throw new Error("abstract method readByte() not implemented");
        };
        /** Attempts to fill the buffer; returns number of bytes read, or
         *  -1 for EOF. */
        Stream.prototype.read = function(buffer, bufOffset, length) {
            var bytesRead = 0;
            while (bytesRead < length) {
                var c = this.readByte();
                if (c < 0) { // EOF
                    return (bytesRead === 0) ? -1 : bytesRead;
                }
                buffer[bufOffset++] = c;
                bytesRead++;
            }
            return bytesRead;
        };
        Stream.prototype.seek = function(new_pos) {
            throw new Error("abstract method seek() not implemented");
        };

        // output streams ///////////
        Stream.prototype.writeByte = function(_byte) {
            throw new Error("abstract method readByte() not implemented");
        };
        Stream.prototype.write = function(buffer, bufOffset, length) {
            var i;
            for (i = 0; i < length; i++) {
                this.writeByte(buffer[bufOffset++]);
            }
            return length;
        };
        Stream.prototype.flush = function() {};

        module.exports = Stream;

    }, {}],
    40: [function(require, module, exports) {
        module.exports = {
            "_from": "seek-bzip@^1.0.3",
            "_id": "seek-bzip@1.0.5",
            "_inBundle": false,
            "_integrity": "sha1-z+kXyz0nS8/6x5J1ivUxc+sfq9w=",
            "_location": "/seek-bzip",
            "_phantomChildren": {},
            "_requested": {
                "type": "range",
                "registry": true,
                "raw": "seek-bzip@^1.0.3",
                "name": "seek-bzip",
                "escapedName": "seek-bzip",
                "rawSpec": "^1.0.3",
                "saveSpec": null,
                "fetchSpec": "^1.0.3"
            },
            "_requiredBy": [
                "/decompress-tarbz2"
            ],
            "_resolved": "https://registry.npmjs.org/seek-bzip/-/seek-bzip-1.0.5.tgz",
            "_shasum": "cfe917cb3d274bcffac792758af53173eb1fabdc",
            "_spec": "seek-bzip@^1.0.3",
            "_where": "/Users/leegrisham/Documents/workspace/teamUp/node_modules/decompress-tarbz2",
            "bin": {
                "seek-bunzip": "./bin/seek-bunzip",
                "seek-table": "./bin/seek-bzip-table"
            },
            "bugs": {
                "url": "https://github.com/cscott/seek-bzip/issues"
            },
            "bundleDependencies": false,
            "contributors": [{
                    "name": "C. Scott Ananian",
                    "url": "http://cscott.net"
                },
                {
                    "name": "Eli Skeggs"
                },
                {
                    "name": "Kevin Kwok"
                },
                {
                    "name": "Rob Landley",
                    "url": "http://landley.net"
                }
            ],
            "dependencies": {
                "commander": "~2.8.1"
            },
            "deprecated": false,
            "description": "a pure-JavaScript Node.JS module for random-access decoding bzip2 data",
            "devDependencies": {
                "fibers": "~1.0.6",
                "mocha": "~2.2.5"
            },
            "directories": {
                "test": "test"
            },
            "homepage": "https://github.com/cscott/seek-bzip#readme",
            "license": "MIT",
            "main": "./lib/index.js",
            "name": "seek-bzip",
            "repository": {
                "type": "git",
                "url": "git+https://github.com/cscott/seek-bzip.git"
            },
            "scripts": {
                "test": "mocha"
            },
            "version": "1.0.5"
        }

    }, {}],
    41: [function(require, module, exports) {
        (function(Buffer) {
            /*jshint esversion: 6 */

            const log = require('./pino.js');
            const bindings = require('bindings')('storm-replay');
            const fs = require('fs');
            const version = require('./package.json').version;

            /*
             * Buffer Helper Functions
             */
            function checkOffset(offset, ext, length) {
                if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint');
                if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
            }

            Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
                offset = offset >>> 0;
                if (!noAssert) checkOffset(offset, 4, this.length);

                return ((this[offset]) |
                        (this[offset + 1] << 8) |
                        (this[offset + 2] << 16)) +
                    (this[offset + 3] * 0x1000000);
            };

            const FILES = [
                'header',
                'replay.attributes.events',
                'replay.details',
                'replay.game.events',
                'replay.initdata',
                'replay.load.info',
                'replay.message.events',
                'replay.server.battlelobby',
                'replay.smartcam.events',
                'replay.sync.events',
                'replay.sync.history',
                'replay.tracker.events'
            ];

            /*
             * Exports
             */
            module.exports = {
                version: version,
                extractFile: function(Archive, File) {
                    log.trace("extractFile('" + Archive + "', '" + File + "')");
                    if (!fs.existsSync(Archive)) {
                        return {
                            success: false,
                            details: {
                                reason: Archive + ' not found.',
                                args: [{
                                        name: 'Archive',
                                        value: Archive
                                    },
                                    {
                                        name: 'File',
                                        value: File
                                    }
                                ],
                            }
                        };
                    }
                    if (FILES.indexOf(File) > -1) {
                        var ret = bindings.extractFile(Archive, File);
                        if (ret.length === undefined) {
                            return {
                                success: false,
                                details: {
                                    reason: 'Extraction of ' + File + ' failed.',
                                    args: [{
                                            name: 'Archive',
                                            value: Archive
                                        },
                                        {
                                            name: 'File',
                                            value: File
                                        }
                                    ],
                                }
                            };
                        }
                        return {
                            success: true,
                            content: {
                                data: ret,
                                size: ret.length
                            }
                        };
                    } else {
                        return {
                            success: false,
                            details: {
                                reason: 'Extraction of ' + File + ' not permitted.',
                                args: [{
                                        name: 'Archive',
                                        value: Archive
                                    },
                                    {
                                        name: 'File',
                                        value: File
                                    }
                                ],
                            }
                        };
                    }
                },

                getHeader: function(Archive) {
                    log.trace("getHeader('" + Archive + "')");
                    if (fs.existsSync(Archive)) {
                        var ret = bindings.getHeader(Archive);
                        if (ret.length === undefined) {
                            return {
                                success: false,
                                details: {
                                    reason: Archive + ' is not a valid MPQ archive.',
                                    args: [{
                                        name: 'Archive',
                                        value: Archive
                                    }],
                                }
                            };
                        }
                        return {
                            success: true,
                            header: {
                                data: ret,
                                size: ret.length
                            },
                            content: {
                                data: ret.slice(16, 16 + ret.readUInt32LE(12)),
                                size: ret.readUInt32LE(12)
                            }
                        };
                    } else {
                        return {
                            success: false,
                            details: {
                                reason: Archive + ' not found.',
                                args: [{
                                    name: 'Archive',
                                    value: Archive
                                }],
                            }
                        };
                    }
                },

                /**
                 * Remove replay.message.events from the archive.  As some chat messages
                 * may be toxic or taken out of context, this sanitation method provides
                 * the ability to ensure a player's actions speak louder than her words.
                 *
                 * @summary Remove replay.message.events from the MPQ archive.
                 */
                removeMessages: function(Archive) {
                    log.trace("removeMessages('" + Archive + "')");
                    var ret = bindings.removeMessages(Archive);
                    return ret;
                }
            };

        }).call(this, require("buffer").Buffer)
    }, { "./package.json": 42, "./pino.js": 43, "bindings": 1, "buffer": 61, "fs": 52 }],
    42: [function(require, module, exports) {
        module.exports = {
            "_from": "storm-replay@^0.3.0-alpha.3",
            "_id": "storm-replay@0.3.0",
            "_inBundle": false,
            "_integrity": "sha512-WvBchUlpGq2/NqjH8X11FKMqQFibPZEa6MRQFaoH2Wy+rfpNi8Cn2QxuGMMqCkVDsuwncrLB+cl3xGrZqWid1Q==",
            "_location": "/storm-replay",
            "_phantomChildren": {},
            "_requested": {
                "type": "range",
                "registry": true,
                "raw": "storm-replay@^0.3.0-alpha.3",
                "name": "storm-replay",
                "escapedName": "storm-replay",
                "rawSpec": "^0.3.0-alpha.3",
                "saveSpec": null,
                "fetchSpec": "^0.3.0-alpha.3"
            },
            "_requiredBy": [
                "/heroprotocol"
            ],
            "_resolved": "https://registry.npmjs.org/storm-replay/-/storm-replay-0.3.0.tgz",
            "_shasum": "3b2f82d3206db1976c0627b5a9b3feba090debe4",
            "_spec": "storm-replay@^0.3.0-alpha.3",
            "_where": "/Users/leegrisham/Documents/workspace/leagueUp/node_modules/heroprotocol",
            "author": {
                "name": "Justin J. Novack",
                "email": "jnovack@gmail.com"
            },
            "bugs": {
                "url": "https://github.com/jnovack/storm-replay/issues"
            },
            "bundleDependencies": false,
            "dependencies": {
                "bindings": "^1.2.1",
                "nan": "^2.10.0",
                "pino": "^4.17.5"
            },
            "deprecated": false,
            "description": "NodeJS wrapper for StormLib (https://github.com/ladislav-zezula/StormLib)",
            "devDependencies": {
                "chai": "^4.1.2",
                "grunt": "^1.0.3",
                "grunt-concurrent": "^2.1.0",
                "grunt-contrib-jshint": "^1.1.0",
                "grunt-contrib-watch": "^1.1.0",
                "grunt-simple-mocha": "^0.4.1",
                "mocha": "^5.2.0",
                "node-cpplint": "^0.4.0"
            },
            "engines": {
                "node": ">=6.0.0"
            },
            "gypfile": true,
            "homepage": "https://github.com/jnovack/storm-replay",
            "keywords": [
                "hots",
                "blizzard",
                "stormreplay",
                "mpq"
            ],
            "license": "MIT",
            "main": "index.js",
            "name": "storm-replay",
            "os": [
                "darwin",
                "linux"
            ],
            "repository": {
                "type": "git",
                "url": "git+https://github.com/jnovack/storm-replay.git"
            },
            "scripts": {
                "cpplint": "node_modules/node-cpplint/bin/cpplint --verbose 3 src/storm-replay.cpp --linelength 120",
                "install": "node-gyp rebuild",
                "jslint": "node_modules/jshint/bin/jshint *.js",
                "postversion": "git push && git push --tags",
                "predeploy": "npm test && npm run cpplint && npm run jslint && npm run rebuild && git checkout -- test/replays/example.StormReplay",
                "prepare": "git submodule init && git submodule update",
                "preversion": "npm test",
                "rebuild": "node-gyp rebuild",
                "test": "node_modules/mocha/bin/mocha"
            },
            "version": "0.3.0"
        }

    }, {}],
    43: [function(require, module, exports) {
        arguments[4][27][0].apply(exports, arguments)
    }, { "_process": 81, "dup": 27, "pino": 34 }],
    44: [function(require, module, exports) {
        (function(process) {
            'use strict';

            /*!
             * window-size <https://github.com/jonschlinkert/window-size>
             *
             * Copyright (c) 2014-2015 Jon Schlinkert
             * Licensed under the MIT license.
             */

            var tty = require('tty');

            module.exports = (function() {
                var width;
                var height;

                if (tty.isatty(1) && tty.isatty(2)) {
                    if (process.stdout.getWindowSize) {
                        width = process.stdout.getWindowSize(1)[0];
                        height = process.stdout.getWindowSize(1)[1];
                    } else if (tty.getWindowSize) {
                        width = tty.getWindowSize()[1];
                        height = tty.getWindowSize()[0];
                    } else if (process.stdout.columns && process.stdout.rows) {
                        height = process.stdout.columns;
                        width = process.stdout.rows;
                    }
                } else {
                    Error('window-size could not get size with tty or process.stdout.');
                }

                return { height: height, width: width };
            })();

        }).call(this, require('_process'))
    }, { "_process": 81, "tty": 99 }],
    45: [function(require, module, exports) {
        'use strict';
        var stringWidth = require('string-width');
        var stripAnsi = require('strip-ansi');

        var ESCAPES = [
            '\u001b',
            '\u009b'
        ];

        var END_CODE = 39;

        var ESCAPE_CODES = {
            0: 0,
            1: 22,
            2: 22,
            3: 23,
            4: 24,
            7: 27,
            8: 28,
            9: 29,
            30: 39,
            31: 39,
            32: 39,
            33: 39,
            34: 39,
            35: 39,
            36: 39,
            37: 39,
            90: 39,
            40: 49,
            41: 49,
            42: 49,
            43: 49,
            44: 49,
            45: 49,
            46: 49,
            47: 49
        };

        function wrapAnsi(code) {
            return ESCAPES[0] + '[' + code + 'm';
        }

        // calculate the length of words split on ' ', ignoring
        // the extra characters added by ansi escape codes.
        function wordLengths(str) {
            return str.split(' ').map(function(s) {
                return stringWidth(s);
            });
        }

        // wrap a long word across multiple rows.
        // ansi escape codes do not count towards length.
        function wrapWord(rows, word, cols) {
            var insideEscape = false;
            var visible = stripAnsi(rows[rows.length - 1]).length;

            for (var i = 0; i < word.length; i++) {
                var x = word[i];

                rows[rows.length - 1] += x;

                if (ESCAPES.indexOf(x) !== -1) {
                    insideEscape = true;
                } else if (insideEscape && x === 'm') {
                    insideEscape = false;
                    continue;
                }

                if (insideEscape) {
                    continue;
                }

                visible++;

                if (visible >= cols && i < word.length - 1) {
                    rows.push('');
                    visible = 0;
                }
            }

            // it's possible that the last row we copy over is only
            // ansi escape characters, handle this edge-case.
            if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
                rows[rows.length - 2] += rows.pop();
            }
        }

        // the wrap-ansi module can be invoked
        // in either 'hard' or 'soft' wrap mode.
        //
        // 'hard' will never allow a string to take up more
        // than cols characters.
        //
        // 'soft' allows long words to expand past the column length.
        function exec(str, cols, opts) {
            var options = opts || {};

            var pre = '';
            var ret = '';
            var escapeCode;

            var lengths = wordLengths(str);
            var words = str.split(' ');
            var rows = [''];

            for (var i = 0, word;
                (word = words[i]) !== undefined; i++) {
                var rowLength = stringWidth(rows[rows.length - 1]);

                if (rowLength) {
                    rows[rows.length - 1] += ' ';
                    rowLength++;
                }

                // in 'hard' wrap mode, the length of a line is
                // never allowed to extend past 'cols'.
                if (lengths[i] > cols && options.hard) {
                    if (rowLength) {
                        rows.push('');
                    }
                    wrapWord(rows, word, cols);
                    continue;
                }

                if (rowLength + lengths[i] > cols && rowLength > 0) {
                    if (options.wordWrap === false && rowLength < cols) {
                        wrapWord(rows, word, cols);
                        continue;
                    }

                    rows.push('');
                }

                rows[rows.length - 1] += word;
            }

            pre = rows.map(function(r) {
                return r.trim();
            }).join('\n');

            for (var j = 0; j < pre.length; j++) {
                var y = pre[j];

                ret += y;

                if (ESCAPES.indexOf(y) !== -1) {
                    var code = parseFloat(/[0-9][^m]*/.exec(pre.slice(j, j + 4)));
                    escapeCode = code === END_CODE ? null : code;
                }

                if (escapeCode && ESCAPE_CODES[escapeCode]) {
                    if (pre[j + 1] === '\n') {
                        ret += wrapAnsi(ESCAPE_CODES[escapeCode]);
                    } else if (y === '\n') {
                        ret += wrapAnsi(escapeCode);
                    }
                }
            }

            return ret;
        }

        // for each line break, invoke the method separately.
        module.exports = function(str, cols, opts) {
            return String(str).split('\n').map(function(substr) {
                return exec(substr, cols, opts);
            }).join('\n');
        };

    }, { "string-width": 48, "strip-ansi": 49 }],
    46: [function(require, module, exports) {
        arguments[4][4][0].apply(exports, arguments)
    }, { "dup": 4 }],
    47: [function(require, module, exports) {
        arguments[4][5][0].apply(exports, arguments)
    }, { "dup": 5, "number-is-nan": 32 }],
    48: [function(require, module, exports) {
        arguments[4][6][0].apply(exports, arguments)
    }, { "code-point-at": 8, "dup": 6, "is-fullwidth-code-point": 47, "strip-ansi": 49 }],
    49: [function(require, module, exports) {
        arguments[4][7][0].apply(exports, arguments)
    }, { "ansi-regex": 46, "dup": 7 }],
    50: [function(require, module, exports) {
        var fs = require('fs')
        var path = require('path')
        var util = require('util')

        function Y18N(opts) {
            // configurable options.
            opts = opts || {}
            this.directory = opts.directory || './locales'
            this.updateFiles = typeof opts.updateFiles === 'boolean' ? opts.updateFiles : true
            this.locale = opts.locale || 'en'
            this.fallbackToLanguage = typeof opts.fallbackToLanguage === 'boolean' ? opts.fallbackToLanguage : true

            // internal stuff.
            this.cache = {}
            this.writeQueue = []
        }

        Y18N.prototype.__ = function() {
            var args = Array.prototype.slice.call(arguments)
            var str = args.shift()
            var cb = function() {} // start with noop.

            if (typeof args[args.length - 1] === 'function') cb = args.pop()
            cb = cb || function() {} // noop.

            if (!this.cache[this.locale]) this._readLocaleFile()

            // we've observed a new string, update the language file.
            if (!this.cache[this.locale][str] && this.updateFiles) {
                this.cache[this.locale][str] = str

                // include the current directory and locale,
                // since these values could change before the
                // write is performed.
                this._enqueueWrite([this.directory, this.locale, cb])
            } else {
                cb()
            }

            return util.format.apply(util, [this.cache[this.locale][str] || str].concat(args))
        }

        Y18N.prototype._enqueueWrite = function(work) {
            this.writeQueue.push(work)
            if (this.writeQueue.length === 1) this._processWriteQueue()
        }

        Y18N.prototype._processWriteQueue = function() {
            var _this = this
            var work = this.writeQueue[0]

            // destructure the enqueued work.
            var directory = work[0]
            var locale = work[1]
            var cb = work[2]

            var languageFile = this._resolveLocaleFile(directory, locale)
            var serializedLocale = JSON.stringify(this.cache[locale], null, 2)

            fs.writeFile(languageFile, serializedLocale, 'utf-8', function(err) {
                _this.writeQueue.shift()
                if (_this.writeQueue.length > 0) _this._processWriteQueue()
                cb(err)
            })
        }

        Y18N.prototype._readLocaleFile = function() {
            var localeLookup = {}
            var languageFile = this._resolveLocaleFile(this.directory, this.locale)

            try {
                localeLookup = JSON.parse(fs.readFileSync(languageFile, 'utf-8'))
            } catch (err) {
                if (err instanceof SyntaxError) {
                    err.message = 'syntax error in ' + languageFile
                }

                if (err.code === 'ENOENT') localeLookup = {}
                else throw err
            }

            this.cache[this.locale] = localeLookup
        }

        Y18N.prototype._resolveLocaleFile = function(directory, locale) {
            var file = path.resolve(directory, './', locale + '.json')
            if (this.fallbackToLanguage && !this._fileExistsSync(file) && ~locale.lastIndexOf('_')) {
                // attempt fallback to language only
                var languageFile = path.resolve(directory, './', locale.split('_')[0] + '.json')
                if (this._fileExistsSync(languageFile)) file = languageFile
            }
            return file
        }

        // this only exists because fs.existsSync() "will be deprecated"
        // see https://nodejs.org/api/fs.html#fs_fs_existssync_path
        Y18N.prototype._fileExistsSync = function(file) {
            try {
                return fs.statSync(file).isFile()
            } catch (err) {
                return false
            }
        }

        Y18N.prototype.__n = function() {
            var args = Array.prototype.slice.call(arguments)
            var singular = args.shift()
            var plural = args.shift()
            var quantity = args.shift()

            var cb = function() {} // start with noop.
            if (typeof args[args.length - 1] === 'function') cb = args.pop()

            if (!this.cache[this.locale]) this._readLocaleFile()

            var str = quantity === 1 ? singular : plural
            if (this.cache[this.locale][singular]) {
                str = this.cache[this.locale][singular][quantity === 1 ? 'one' : 'other']
            }

            // we've observed a new string, update the language file.
            if (!this.cache[this.locale][singular] && this.updateFiles) {
                this.cache[this.locale][singular] = {
                    one: singular,
                    other: plural
                }

                // include the current directory and locale,
                // since these values could change before the
                // write is performed.
                this._enqueueWrite([this.directory, this.locale, cb])
            } else {
                cb()
            }

            // if a %d placeholder is provided, add quantity
            // to the arguments expanded by util.format.
            var values = [str]
            if (~str.indexOf('%d')) values.push(quantity)

            return util.format.apply(util, values.concat(args))
        }

        Y18N.prototype.setLocale = function(locale) {
            this.locale = locale
        }

        Y18N.prototype.getLocale = function() {
            return this.locale
        }

        Y18N.prototype.updateLocale = function(obj) {
            if (!this.cache[this.locale]) this._readLocaleFile()

            for (var key in obj) {
                this.cache[this.locale][key] = obj[key]
            }
        }

        module.exports = function(opts) {
            var y18n = new Y18N(opts)

            // bind all functions to y18n, so that
            // they can be used in isolation.
            for (var key in y18n) {
                if (typeof y18n[key] === 'function') {
                    y18n[key] = y18n[key].bind(y18n)
                }
            }

            return y18n
        }

    }, { "fs": 52, "path": 79, "util": 102 }],
    51: [function(require, module, exports) {
        const pino = require('pino')({ browser: { asObject: true } });
        const heroprotocol = require('heroprotocol');
        module.exports = {
            pino: pino,
            heroprotocol: heroprotocol
        };
    }, { "heroprotocol": 23, "pino": 34 }],
    52: [function(require, module, exports) {

    }, {}],
    53: [function(require, module, exports) {
        (function(global) {
            'use strict';

            // compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
            // original notice:

            /*!
             * The buffer module from node.js, for the browser.
             *
             * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
             * @license  MIT
             */
            function compare(a, b) {
                if (a === b) {
                    return 0;
                }

                var x = a.length;
                var y = b.length;

                for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                    if (a[i] !== b[i]) {
                        x = a[i];
                        y = b[i];
                        break;
                    }
                }

                if (x < y) {
                    return -1;
                }
                if (y < x) {
                    return 1;
                }
                return 0;
            }

            function isBuffer(b) {
                if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
                    return global.Buffer.isBuffer(b);
                }
                return !!(b != null && b._isBuffer);
            }

            // based on node assert, original notice:

            // http://wiki.commonjs.org/wiki/Unit_Testing/1.0
            //
            // THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
            //
            // Originally from narwhal.js (http://narwhaljs.org)
            // Copyright (c) 2009 Thomas Robinson <280north.com>
            //
            // Permission is hereby granted, free of charge, to any person obtaining a copy
            // of this software and associated documentation files (the 'Software'), to
            // deal in the Software without restriction, including without limitation the
            // rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
            // sell copies of the Software, and to permit persons to whom the Software is
            // furnished to do so, subject to the following conditions:
            //
            // The above copyright notice and this permission notice shall be included in
            // all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            // AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
            // ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
            // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

            var util = require('util/');
            var hasOwn = Object.prototype.hasOwnProperty;
            var pSlice = Array.prototype.slice;
            var functionsHaveNames = (function() {
                return function foo() {}.name === 'foo';
            }());

            function pToString(obj) {
                return Object.prototype.toString.call(obj);
            }

            function isView(arrbuf) {
                if (isBuffer(arrbuf)) {
                    return false;
                }
                if (typeof global.ArrayBuffer !== 'function') {
                    return false;
                }
                if (typeof ArrayBuffer.isView === 'function') {
                    return ArrayBuffer.isView(arrbuf);
                }
                if (!arrbuf) {
                    return false;
                }
                if (arrbuf instanceof DataView) {
                    return true;
                }
                if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
                    return true;
                }
                return false;
            }
            // 1. The assert module provides functions that throw
            // AssertionError's when particular conditions are not met. The
            // assert module must conform to the following interface.

            var assert = module.exports = ok;

            // 2. The AssertionError is defined in assert.
            // new assert.AssertionError({ message: message,
            //                             actual: actual,
            //                             expected: expected })

            var regex = /\s*function\s+([^\(\s]*)\s*/;
            // based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
            function getName(func) {
                if (!util.isFunction(func)) {
                    return;
                }
                if (functionsHaveNames) {
                    return func.name;
                }
                var str = func.toString();
                var match = str.match(regex);
                return match && match[1];
            }
            assert.AssertionError = function AssertionError(options) {
                this.name = 'AssertionError';
                this.actual = options.actual;
                this.expected = options.expected;
                this.operator = options.operator;
                if (options.message) {
                    this.message = options.message;
                    this.generatedMessage = false;
                } else {
                    this.message = getMessage(this);
                    this.generatedMessage = true;
                }
                var stackStartFunction = options.stackStartFunction || fail;
                if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, stackStartFunction);
                } else {
                    // non v8 browsers so we can have a stacktrace
                    var err = new Error();
                    if (err.stack) {
                        var out = err.stack;

                        // try to strip useless frames
                        var fn_name = getName(stackStartFunction);
                        var idx = out.indexOf('\n' + fn_name);
                        if (idx >= 0) {
                            // once we have located the function frame
                            // we need to strip out everything before it (and its line)
                            var next_line = out.indexOf('\n', idx + 1);
                            out = out.substring(next_line + 1);
                        }

                        this.stack = out;
                    }
                }
            };

            // assert.AssertionError instanceof Error
            util.inherits(assert.AssertionError, Error);

            function truncate(s, n) {
                if (typeof s === 'string') {
                    return s.length < n ? s : s.slice(0, n);
                } else {
                    return s;
                }
            }

            function inspect(something) {
                if (functionsHaveNames || !util.isFunction(something)) {
                    return util.inspect(something);
                }
                var rawname = getName(something);
                var name = rawname ? ': ' + rawname : '';
                return '[Function' + name + ']';
            }

            function getMessage(self) {
                return truncate(inspect(self.actual), 128) + ' ' +
                    self.operator + ' ' +
                    truncate(inspect(self.expected), 128);
            }

            // At present only the three keys mentioned above are used and
            // understood by the spec. Implementations or sub modules can pass
            // other keys to the AssertionError's constructor - they will be
            // ignored.

            // 3. All of the following functions must throw an AssertionError
            // when a corresponding condition is not met, with a message that
            // may be undefined if not provided.  All assertion methods provide
            // both the actual and expected values to the assertion error for
            // display purposes.

            function fail(actual, expected, message, operator, stackStartFunction) {
                throw new assert.AssertionError({
                    message: message,
                    actual: actual,
                    expected: expected,
                    operator: operator,
                    stackStartFunction: stackStartFunction
                });
            }

            // EXTENSION! allows for well behaved errors defined elsewhere.
            assert.fail = fail;

            // 4. Pure assertion tests whether a value is truthy, as determined
            // by !!guard.
            // assert.ok(guard, message_opt);
            // This statement is equivalent to assert.equal(true, !!guard,
            // message_opt);. To test strictly for the value true, use
            // assert.strictEqual(true, guard, message_opt);.

            function ok(value, message) {
                if (!value) fail(value, true, message, '==', assert.ok);
            }
            assert.ok = ok;

            // 5. The equality assertion tests shallow, coercive equality with
            // ==.
            // assert.equal(actual, expected, message_opt);

            assert.equal = function equal(actual, expected, message) {
                if (actual != expected) fail(actual, expected, message, '==', assert.equal);
            };

            // 6. The non-equality assertion tests for whether two objects are not equal
            // with != assert.notEqual(actual, expected, message_opt);

            assert.notEqual = function notEqual(actual, expected, message) {
                if (actual == expected) {
                    fail(actual, expected, message, '!=', assert.notEqual);
                }
            };

            // 7. The equivalence assertion tests a deep equality relation.
            // assert.deepEqual(actual, expected, message_opt);

            assert.deepEqual = function deepEqual(actual, expected, message) {
                if (!_deepEqual(actual, expected, false)) {
                    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
                }
            };

            assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
                if (!_deepEqual(actual, expected, true)) {
                    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
                }
            };

            function _deepEqual(actual, expected, strict, memos) {
                // 7.1. All identical values are equivalent, as determined by ===.
                if (actual === expected) {
                    return true;
                } else if (isBuffer(actual) && isBuffer(expected)) {
                    return compare(actual, expected) === 0;

                    // 7.2. If the expected value is a Date object, the actual value is
                    // equivalent if it is also a Date object that refers to the same time.
                } else if (util.isDate(actual) && util.isDate(expected)) {
                    return actual.getTime() === expected.getTime();

                    // 7.3 If the expected value is a RegExp object, the actual value is
                    // equivalent if it is also a RegExp object with the same source and
                    // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
                } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
                    return actual.source === expected.source &&
                        actual.global === expected.global &&
                        actual.multiline === expected.multiline &&
                        actual.lastIndex === expected.lastIndex &&
                        actual.ignoreCase === expected.ignoreCase;

                    // 7.4. Other pairs that do not both pass typeof value == 'object',
                    // equivalence is determined by ==.
                } else if ((actual === null || typeof actual !== 'object') &&
                    (expected === null || typeof expected !== 'object')) {
                    return strict ? actual === expected : actual == expected;

                    // If both values are instances of typed arrays, wrap their underlying
                    // ArrayBuffers in a Buffer each to increase performance
                    // This optimization requires the arrays to have the same type as checked by
                    // Object.prototype.toString (aka pToString). Never perform binary
                    // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
                    // bit patterns are not identical.
                } else if (isView(actual) && isView(expected) &&
                    pToString(actual) === pToString(expected) &&
                    !(actual instanceof Float32Array ||
                        actual instanceof Float64Array)) {
                    return compare(new Uint8Array(actual.buffer),
                        new Uint8Array(expected.buffer)) === 0;

                    // 7.5 For all other Object pairs, including Array objects, equivalence is
                    // determined by having the same number of owned properties (as verified
                    // with Object.prototype.hasOwnProperty.call), the same set of keys
                    // (although not necessarily the same order), equivalent values for every
                    // corresponding key, and an identical 'prototype' property. Note: this
                    // accounts for both named and indexed properties on Arrays.
                } else if (isBuffer(actual) !== isBuffer(expected)) {
                    return false;
                } else {
                    memos = memos || { actual: [], expected: [] };

                    var actualIndex = memos.actual.indexOf(actual);
                    if (actualIndex !== -1) {
                        if (actualIndex === memos.expected.indexOf(expected)) {
                            return true;
                        }
                    }

                    memos.actual.push(actual);
                    memos.expected.push(expected);

                    return objEquiv(actual, expected, strict, memos);
                }
            }

            function isArguments(object) {
                return Object.prototype.toString.call(object) == '[object Arguments]';
            }

            function objEquiv(a, b, strict, actualVisitedObjects) {
                if (a === null || a === undefined || b === null || b === undefined)
                    return false;
                // if one is a primitive, the other must be same
                if (util.isPrimitive(a) || util.isPrimitive(b))
                    return a === b;
                if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
                    return false;
                var aIsArgs = isArguments(a);
                var bIsArgs = isArguments(b);
                if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
                    return false;
                if (aIsArgs) {
                    a = pSlice.call(a);
                    b = pSlice.call(b);
                    return _deepEqual(a, b, strict);
                }
                var ka = objectKeys(a);
                var kb = objectKeys(b);
                var key, i;
                // having the same number of owned properties (keys incorporates
                // hasOwnProperty)
                if (ka.length !== kb.length)
                    return false;
                //the same set of keys (although not necessarily the same order),
                ka.sort();
                kb.sort();
                //~~~cheap key test
                for (i = ka.length - 1; i >= 0; i--) {
                    if (ka[i] !== kb[i])
                        return false;
                }
                //equivalent values for every corresponding key, and
                //~~~possibly expensive deep test
                for (i = ka.length - 1; i >= 0; i--) {
                    key = ka[i];
                    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
                        return false;
                }
                return true;
            }

            // 8. The non-equivalence assertion tests for any deep inequality.
            // assert.notDeepEqual(actual, expected, message_opt);

            assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
                if (_deepEqual(actual, expected, false)) {
                    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
                }
            };

            assert.notDeepStrictEqual = notDeepStrictEqual;

            function notDeepStrictEqual(actual, expected, message) {
                if (_deepEqual(actual, expected, true)) {
                    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
                }
            }


            // 9. The strict equality assertion tests strict equality, as determined by ===.
            // assert.strictEqual(actual, expected, message_opt);

            assert.strictEqual = function strictEqual(actual, expected, message) {
                if (actual !== expected) {
                    fail(actual, expected, message, '===', assert.strictEqual);
                }
            };

            // 10. The strict non-equality assertion tests for strict inequality, as
            // determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

            assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
                if (actual === expected) {
                    fail(actual, expected, message, '!==', assert.notStrictEqual);
                }
            };

            function expectedException(actual, expected) {
                if (!actual || !expected) {
                    return false;
                }

                if (Object.prototype.toString.call(expected) == '[object RegExp]') {
                    return expected.test(actual);
                }

                try {
                    if (actual instanceof expected) {
                        return true;
                    }
                } catch (e) {
                    // Ignore.  The instanceof check doesn't work for arrow functions.
                }

                if (Error.isPrototypeOf(expected)) {
                    return false;
                }

                return expected.call({}, actual) === true;
            }

            function _tryBlock(block) {
                var error;
                try {
                    block();
                } catch (e) {
                    error = e;
                }
                return error;
            }

            function _throws(shouldThrow, block, expected, message) {
                var actual;

                if (typeof block !== 'function') {
                    throw new TypeError('"block" argument must be a function');
                }

                if (typeof expected === 'string') {
                    message = expected;
                    expected = null;
                }

                actual = _tryBlock(block);

                message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
                    (message ? ' ' + message : '.');

                if (shouldThrow && !actual) {
                    fail(actual, expected, 'Missing expected exception' + message);
                }

                var userProvidedMessage = typeof message === 'string';
                var isUnwantedException = !shouldThrow && util.isError(actual);
                var isUnexpectedException = !shouldThrow && actual && !expected;

                if ((isUnwantedException &&
                        userProvidedMessage &&
                        expectedException(actual, expected)) ||
                    isUnexpectedException) {
                    fail(actual, expected, 'Got unwanted exception' + message);
                }

                if ((shouldThrow && actual && expected &&
                        !expectedException(actual, expected)) || (!shouldThrow && actual)) {
                    throw actual;
                }
            }

            // 11. Expected to throw an error:
            // assert.throws(block, Error_opt, message_opt);

            assert.throws = function(block, /*optional*/ error, /*optional*/ message) {
                _throws(true, block, error, message);
            };

            // EXTENSION! This is annoying to write outside this module.
            assert.doesNotThrow = function(block, /*optional*/ error, /*optional*/ message) {
                _throws(false, block, error, message);
            };

            assert.ifError = function(err) { if (err) throw err; };

            var objectKeys = Object.keys || function(obj) {
                var keys = [];
                for (var key in obj) {
                    if (hasOwn.call(obj, key)) keys.push(key);
                }
                return keys;
            };

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, { "util/": 56 }],
    54: [function(require, module, exports) {
        if (typeof Object.create === 'function') {
            // implementation from standard node.js 'util' module
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            };
        } else {
            // old school shim for old browsers
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor
                var TempCtor = function() {}
                TempCtor.prototype = superCtor.prototype
                ctor.prototype = new TempCtor()
                ctor.prototype.constructor = ctor
            }
        }

    }, {}],
    55: [function(require, module, exports) {
        module.exports = function isBuffer(arg) {
            return arg && typeof arg === 'object' &&
                typeof arg.copy === 'function' &&
                typeof arg.fill === 'function' &&
                typeof arg.readUInt8 === 'function';
        }
    }, {}],
    56: [function(require, module, exports) {
        (function(process, global) {
            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.

            var formatRegExp = /%[sdj%]/g;
            exports.format = function(f) {
                if (!isString(f)) {
                    var objects = [];
                    for (var i = 0; i < arguments.length; i++) {
                        objects.push(inspect(arguments[i]));
                    }
                    return objects.join(' ');
                }

                var i = 1;
                var args = arguments;
                var len = args.length;
                var str = String(f).replace(formatRegExp, function(x) {
                    if (x === '%%') return '%';
                    if (i >= len) return x;
                    switch (x) {
                        case '%s':
                            return String(args[i++]);
                        case '%d':
                            return Number(args[i++]);
                        case '%j':
                            try {
                                return JSON.stringify(args[i++]);
                            } catch (_) {
                                return '[Circular]';
                            }
                        default:
                            return x;
                    }
                });
                for (var x = args[i]; i < len; x = args[++i]) {
                    if (isNull(x) || !isObject(x)) {
                        str += ' ' + x;
                    } else {
                        str += ' ' + inspect(x);
                    }
                }
                return str;
            };


            // Mark that a method should not be used.
            // Returns a modified function which warns once by default.
            // If --no-deprecation is set, then it is a no-op.
            exports.deprecate = function(fn, msg) {
                // Allow for deprecating things in the process of starting up.
                if (isUndefined(global.process)) {
                    return function() {
                        return exports.deprecate(fn, msg).apply(this, arguments);
                    };
                }

                if (process.noDeprecation === true) {
                    return fn;
                }

                var warned = false;

                function deprecated() {
                    if (!warned) {
                        if (process.throwDeprecation) {
                            throw new Error(msg);
                        } else if (process.traceDeprecation) {
                            console.trace(msg);
                        } else {
                            console.error(msg);
                        }
                        warned = true;
                    }
                    return fn.apply(this, arguments);
                }

                return deprecated;
            };


            var debugs = {};
            var debugEnviron;
            exports.debuglog = function(set) {
                if (isUndefined(debugEnviron))
                    debugEnviron = process.env.NODE_DEBUG || '';
                set = set.toUpperCase();
                if (!debugs[set]) {
                    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
                        var pid = process.pid;
                        debugs[set] = function() {
                            var msg = exports.format.apply(exports, arguments);
                            console.error('%s %d: %s', set, pid, msg);
                        };
                    } else {
                        debugs[set] = function() {};
                    }
                }
                return debugs[set];
            };


            /**
             * Echos the value of a value. Trys to print the value out
             * in the best way possible given the different types.
             *
             * @param {Object} obj The object to print out.
             * @param {Object} opts Optional options object that alters the output.
             */
            /* legacy: obj, showHidden, depth, colors*/
            function inspect(obj, opts) {
                // default options
                var ctx = {
                    seen: [],
                    stylize: stylizeNoColor
                };
                // legacy...
                if (arguments.length >= 3) ctx.depth = arguments[2];
                if (arguments.length >= 4) ctx.colors = arguments[3];
                if (isBoolean(opts)) {
                    // legacy...
                    ctx.showHidden = opts;
                } else if (opts) {
                    // got an "options" object
                    exports._extend(ctx, opts);
                }
                // set default options
                if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
                if (isUndefined(ctx.depth)) ctx.depth = 2;
                if (isUndefined(ctx.colors)) ctx.colors = false;
                if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
                if (ctx.colors) ctx.stylize = stylizeWithColor;
                return formatValue(ctx, obj, ctx.depth);
            }
            exports.inspect = inspect;


            // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
            inspect.colors = {
                'bold': [1, 22],
                'italic': [3, 23],
                'underline': [4, 24],
                'inverse': [7, 27],
                'white': [37, 39],
                'grey': [90, 39],
                'black': [30, 39],
                'blue': [34, 39],
                'cyan': [36, 39],
                'green': [32, 39],
                'magenta': [35, 39],
                'red': [31, 39],
                'yellow': [33, 39]
            };

            // Don't use 'blue' not visible on cmd.exe
            inspect.styles = {
                'special': 'cyan',
                'number': 'yellow',
                'boolean': 'yellow',
                'undefined': 'grey',
                'null': 'bold',
                'string': 'green',
                'date': 'magenta',
                // "name": intentionally not styling
                'regexp': 'red'
            };


            function stylizeWithColor(str, styleType) {
                var style = inspect.styles[styleType];

                if (style) {
                    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                        '\u001b[' + inspect.colors[style][1] + 'm';
                } else {
                    return str;
                }
            }


            function stylizeNoColor(str, styleType) {
                return str;
            }


            function arrayToHash(array) {
                var hash = {};

                array.forEach(function(val, idx) {
                    hash[val] = true;
                });

                return hash;
            }


            function formatValue(ctx, value, recurseTimes) {
                // Provide a hook for user-specified inspect functions.
                // Check that value is an object with an inspect function on it
                if (ctx.customInspect &&
                    value &&
                    isFunction(value.inspect) &&
                    // Filter out the util module, it's inspect function is special
                    value.inspect !== exports.inspect &&
                    // Also filter out any prototype objects using the circular check.
                    !(value.constructor && value.constructor.prototype === value)) {
                    var ret = value.inspect(recurseTimes, ctx);
                    if (!isString(ret)) {
                        ret = formatValue(ctx, ret, recurseTimes);
                    }
                    return ret;
                }

                // Primitive types cannot have properties
                var primitive = formatPrimitive(ctx, value);
                if (primitive) {
                    return primitive;
                }

                // Look up the keys of the object.
                var keys = Object.keys(value);
                var visibleKeys = arrayToHash(keys);

                if (ctx.showHidden) {
                    keys = Object.getOwnPropertyNames(value);
                }

                // IE doesn't make error fields non-enumerable
                // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
                if (isError(value) &&
                    (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
                    return formatError(value);
                }

                // Some type of object without properties can be shortcutted.
                if (keys.length === 0) {
                    if (isFunction(value)) {
                        var name = value.name ? ': ' + value.name : '';
                        return ctx.stylize('[Function' + name + ']', 'special');
                    }
                    if (isRegExp(value)) {
                        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                    }
                    if (isDate(value)) {
                        return ctx.stylize(Date.prototype.toString.call(value), 'date');
                    }
                    if (isError(value)) {
                        return formatError(value);
                    }
                }

                var base = '',
                    array = false,
                    braces = ['{', '}'];

                // Make Array say that they are Array
                if (isArray(value)) {
                    array = true;
                    braces = ['[', ']'];
                }

                // Make functions say that they are functions
                if (isFunction(value)) {
                    var n = value.name ? ': ' + value.name : '';
                    base = ' [Function' + n + ']';
                }

                // Make RegExps say that they are RegExps
                if (isRegExp(value)) {
                    base = ' ' + RegExp.prototype.toString.call(value);
                }

                // Make dates with properties first say the date
                if (isDate(value)) {
                    base = ' ' + Date.prototype.toUTCString.call(value);
                }

                // Make error with message first say the error
                if (isError(value)) {
                    base = ' ' + formatError(value);
                }

                if (keys.length === 0 && (!array || value.length == 0)) {
                    return braces[0] + base + braces[1];
                }

                if (recurseTimes < 0) {
                    if (isRegExp(value)) {
                        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                    } else {
                        return ctx.stylize('[Object]', 'special');
                    }
                }

                ctx.seen.push(value);

                var output;
                if (array) {
                    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
                } else {
                    output = keys.map(function(key) {
                        return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                    });
                }

                ctx.seen.pop();

                return reduceToSingleString(output, base, braces);
            }


            function formatPrimitive(ctx, value) {
                if (isUndefined(value))
                    return ctx.stylize('undefined', 'undefined');
                if (isString(value)) {
                    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                        .replace(/'/g, "\\'")
                        .replace(/\\"/g, '"') + '\'';
                    return ctx.stylize(simple, 'string');
                }
                if (isNumber(value))
                    return ctx.stylize('' + value, 'number');
                if (isBoolean(value))
                    return ctx.stylize('' + value, 'boolean');
                // For some reason typeof null is "object", so special case here.
                if (isNull(value))
                    return ctx.stylize('null', 'null');
            }


            function formatError(value) {
                return '[' + Error.prototype.toString.call(value) + ']';
            }


            function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                var output = [];
                for (var i = 0, l = value.length; i < l; ++i) {
                    if (hasOwnProperty(value, String(i))) {
                        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                            String(i), true));
                    } else {
                        output.push('');
                    }
                }
                keys.forEach(function(key) {
                    if (!key.match(/^\d+$/)) {
                        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                            key, true));
                    }
                });
                return output;
            }


            function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                var name, str, desc;
                desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
                if (desc.get) {
                    if (desc.set) {
                        str = ctx.stylize('[Getter/Setter]', 'special');
                    } else {
                        str = ctx.stylize('[Getter]', 'special');
                    }
                } else {
                    if (desc.set) {
                        str = ctx.stylize('[Setter]', 'special');
                    }
                }
                if (!hasOwnProperty(visibleKeys, key)) {
                    name = '[' + key + ']';
                }
                if (!str) {
                    if (ctx.seen.indexOf(desc.value) < 0) {
                        if (isNull(recurseTimes)) {
                            str = formatValue(ctx, desc.value, null);
                        } else {
                            str = formatValue(ctx, desc.value, recurseTimes - 1);
                        }
                        if (str.indexOf('\n') > -1) {
                            if (array) {
                                str = str.split('\n').map(function(line) {
                                    return '  ' + line;
                                }).join('\n').substr(2);
                            } else {
                                str = '\n' + str.split('\n').map(function(line) {
                                    return '   ' + line;
                                }).join('\n');
                            }
                        }
                    } else {
                        str = ctx.stylize('[Circular]', 'special');
                    }
                }
                if (isUndefined(name)) {
                    if (array && key.match(/^\d+$/)) {
                        return str;
                    }
                    name = JSON.stringify('' + key);
                    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                        name = name.substr(1, name.length - 2);
                        name = ctx.stylize(name, 'name');
                    } else {
                        name = name.replace(/'/g, "\\'")
                            .replace(/\\"/g, '"')
                            .replace(/(^"|"$)/g, "'");
                        name = ctx.stylize(name, 'string');
                    }
                }

                return name + ': ' + str;
            }


            function reduceToSingleString(output, base, braces) {
                var numLinesEst = 0;
                var length = output.reduce(function(prev, cur) {
                    numLinesEst++;
                    if (cur.indexOf('\n') >= 0) numLinesEst++;
                    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
                }, 0);

                if (length > 60) {
                    return braces[0] +
                        (base === '' ? '' : base + '\n ') +
                        ' ' +
                        output.join(',\n  ') +
                        ' ' +
                        braces[1];
                }

                return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
            }


            // NOTE: These type checking functions intentionally don't use `instanceof`
            // because it is fragile and can be easily faked with `Object.create()`.
            function isArray(ar) {
                return Array.isArray(ar);
            }
            exports.isArray = isArray;

            function isBoolean(arg) {
                return typeof arg === 'boolean';
            }
            exports.isBoolean = isBoolean;

            function isNull(arg) {
                return arg === null;
            }
            exports.isNull = isNull;

            function isNullOrUndefined(arg) {
                return arg == null;
            }
            exports.isNullOrUndefined = isNullOrUndefined;

            function isNumber(arg) {
                return typeof arg === 'number';
            }
            exports.isNumber = isNumber;

            function isString(arg) {
                return typeof arg === 'string';
            }
            exports.isString = isString;

            function isSymbol(arg) {
                return typeof arg === 'symbol';
            }
            exports.isSymbol = isSymbol;

            function isUndefined(arg) {
                return arg === void 0;
            }
            exports.isUndefined = isUndefined;

            function isRegExp(re) {
                return isObject(re) && objectToString(re) === '[object RegExp]';
            }
            exports.isRegExp = isRegExp;

            function isObject(arg) {
                return typeof arg === 'object' && arg !== null;
            }
            exports.isObject = isObject;

            function isDate(d) {
                return isObject(d) && objectToString(d) === '[object Date]';
            }
            exports.isDate = isDate;

            function isError(e) {
                return isObject(e) &&
                    (objectToString(e) === '[object Error]' || e instanceof Error);
            }
            exports.isError = isError;

            function isFunction(arg) {
                return typeof arg === 'function';
            }
            exports.isFunction = isFunction;

            function isPrimitive(arg) {
                return arg === null ||
                    typeof arg === 'boolean' ||
                    typeof arg === 'number' ||
                    typeof arg === 'string' ||
                    typeof arg === 'symbol' || // ES6 symbol
                    typeof arg === 'undefined';
            }
            exports.isPrimitive = isPrimitive;

            exports.isBuffer = require('./support/isBuffer');

            function objectToString(o) {
                return Object.prototype.toString.call(o);
            }


            function pad(n) {
                return n < 10 ? '0' + n.toString(10) : n.toString(10);
            }


            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'
            ];

            // 26 Feb 16:19:34
            function timestamp() {
                var d = new Date();
                var time = [pad(d.getHours()),
                    pad(d.getMinutes()),
                    pad(d.getSeconds())
                ].join(':');
                return [d.getDate(), months[d.getMonth()], time].join(' ');
            }


            // log is just a thin wrapper to console.log that prepends a timestamp
            exports.log = function() {
                console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
            };


            /**
             * Inherit the prototype methods from one constructor into another.
             *
             * The Function.prototype.inherits from lang.js rewritten as a standalone
             * function (not on Function.prototype). NOTE: If this file is to be loaded
             * during bootstrapping this function needs to be rewritten using some native
             * functions as prototype setup using normal JavaScript does not work as
             * expected during bootstrapping (see mirror.js in r114903).
             *
             * @param {function} ctor Constructor function which needs to inherit the
             *     prototype.
             * @param {function} superCtor Constructor function to inherit prototype from.
             */
            exports.inherits = require('inherits');

            exports._extend = function(origin, add) {
                // Don't do anything if add isn't an object
                if (!add || !isObject(add)) return origin;

                var keys = Object.keys(add);
                var i = keys.length;
                while (i--) {
                    origin[keys[i]] = add[keys[i]];
                }
                return origin;
            };

            function hasOwnProperty(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop);
            }

        }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, { "./support/isBuffer": 55, "_process": 81, "inherits": 54 }],
    57: [function(require, module, exports) {
        'use strict'

        exports.byteLength = byteLength
        exports.toByteArray = toByteArray
        exports.fromByteArray = fromByteArray

        var lookup = []
        var revLookup = []
        var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

        var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        for (var i = 0, len = code.length; i < len; ++i) {
            lookup[i] = code[i]
            revLookup[code.charCodeAt(i)] = i
        }

        // Support decoding URL-safe base64 strings, as Node.js does.
        // See: https://en.wikipedia.org/wiki/Base64#URL_applications
        revLookup['-'.charCodeAt(0)] = 62
        revLookup['_'.charCodeAt(0)] = 63

        function getLens(b64) {
            var len = b64.length

            if (len % 4 > 0) {
                throw new Error('Invalid string. Length must be a multiple of 4')
            }

            // Trim off extra bytes after placeholder bytes are found
            // See: https://github.com/beatgammit/base64-js/issues/42
            var validLen = b64.indexOf('=')
            if (validLen === -1) validLen = len

            var placeHoldersLen = validLen === len ?
                0 :
                4 - (validLen % 4)

            return [validLen, placeHoldersLen]
        }

        // base64 is 4/3 + up to two characters of the original data
        function byteLength(b64) {
            var lens = getLens(b64)
            var validLen = lens[0]
            var placeHoldersLen = lens[1]
            return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
        }

        function _byteLength(b64, validLen, placeHoldersLen) {
            return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
        }

        function toByteArray(b64) {
            var tmp
            var lens = getLens(b64)
            var validLen = lens[0]
            var placeHoldersLen = lens[1]

            var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

            var curByte = 0

            // if there are placeholders, only get up to the last complete 4 chars
            var len = placeHoldersLen > 0 ?
                validLen - 4 :
                validLen

            for (var i = 0; i < len; i += 4) {
                tmp =
                    (revLookup[b64.charCodeAt(i)] << 18) |
                    (revLookup[b64.charCodeAt(i + 1)] << 12) |
                    (revLookup[b64.charCodeAt(i + 2)] << 6) |
                    revLookup[b64.charCodeAt(i + 3)]
                arr[curByte++] = (tmp >> 16) & 0xFF
                arr[curByte++] = (tmp >> 8) & 0xFF
                arr[curByte++] = tmp & 0xFF
            }

            if (placeHoldersLen === 2) {
                tmp =
                    (revLookup[b64.charCodeAt(i)] << 2) |
                    (revLookup[b64.charCodeAt(i + 1)] >> 4)
                arr[curByte++] = tmp & 0xFF
            }

            if (placeHoldersLen === 1) {
                tmp =
                    (revLookup[b64.charCodeAt(i)] << 10) |
                    (revLookup[b64.charCodeAt(i + 1)] << 4) |
                    (revLookup[b64.charCodeAt(i + 2)] >> 2)
                arr[curByte++] = (tmp >> 8) & 0xFF
                arr[curByte++] = tmp & 0xFF
            }

            return arr
        }

        function tripletToBase64(num) {
            return lookup[num >> 18 & 0x3F] +
                lookup[num >> 12 & 0x3F] +
                lookup[num >> 6 & 0x3F] +
                lookup[num & 0x3F]
        }

        function encodeChunk(uint8, start, end) {
            var tmp
            var output = []
            for (var i = start; i < end; i += 3) {
                tmp =
                    ((uint8[i] << 16) & 0xFF0000) +
                    ((uint8[i + 1] << 8) & 0xFF00) +
                    (uint8[i + 2] & 0xFF)
                output.push(tripletToBase64(tmp))
            }
            return output.join('')
        }

        function fromByteArray(uint8) {
            var tmp
            var len = uint8.length
            var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
            var parts = []
            var maxChunkLength = 16383 // must be multiple of 3

            // go through the array every three bytes, we'll deal with trailing stuff later
            for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                parts.push(encodeChunk(
                    uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
                ))
            }

            // pad the end with zeros, but make sure to not forget the extra bytes
            if (extraBytes === 1) {
                tmp = uint8[len - 1]
                parts.push(
                    lookup[tmp >> 2] +
                    lookup[(tmp << 4) & 0x3F] +
                    '=='
                )
            } else if (extraBytes === 2) {
                tmp = (uint8[len - 2] << 8) + uint8[len - 1]
                parts.push(
                    lookup[tmp >> 10] +
                    lookup[(tmp >> 4) & 0x3F] +
                    lookup[(tmp << 2) & 0x3F] +
                    '='
                )
            }

            return parts.join('')
        }

    }, {}],
    58: [function(require, module, exports) {
        arguments[4][52][0].apply(exports, arguments)
    }, { "dup": 52 }],
    59: [function(require, module, exports) {
        (function(process, Buffer) {
            'use strict';
            /* eslint camelcase: "off" */

            var assert = require('assert');

            var Zstream = require('pako/lib/zlib/zstream');
            var zlib_deflate = require('pako/lib/zlib/deflate.js');
            var zlib_inflate = require('pako/lib/zlib/inflate.js');
            var constants = require('pako/lib/zlib/constants');

            for (var key in constants) {
                exports[key] = constants[key];
            }

            // zlib modes
            exports.NONE = 0;
            exports.DEFLATE = 1;
            exports.INFLATE = 2;
            exports.GZIP = 3;
            exports.GUNZIP = 4;
            exports.DEFLATERAW = 5;
            exports.INFLATERAW = 6;
            exports.UNZIP = 7;

            var GZIP_HEADER_ID1 = 0x1f;
            var GZIP_HEADER_ID2 = 0x8b;

            /**
             * Emulate Node's zlib C++ layer for use by the JS layer in index.js
             */
            function Zlib(mode) {
                if (typeof mode !== 'number' || mode < exports.DEFLATE || mode > exports.UNZIP) {
                    throw new TypeError('Bad argument');
                }

                this.dictionary = null;
                this.err = 0;
                this.flush = 0;
                this.init_done = false;
                this.level = 0;
                this.memLevel = 0;
                this.mode = mode;
                this.strategy = 0;
                this.windowBits = 0;
                this.write_in_progress = false;
                this.pending_close = false;
                this.gzip_id_bytes_read = 0;
            }

            Zlib.prototype.close = function() {
                if (this.write_in_progress) {
                    this.pending_close = true;
                    return;
                }

                this.pending_close = false;

                assert(this.init_done, 'close before init');
                assert(this.mode <= exports.UNZIP);

                if (this.mode === exports.DEFLATE || this.mode === exports.GZIP || this.mode === exports.DEFLATERAW) {
                    zlib_deflate.deflateEnd(this.strm);
                } else if (this.mode === exports.INFLATE || this.mode === exports.GUNZIP || this.mode === exports.INFLATERAW || this.mode === exports.UNZIP) {
                    zlib_inflate.inflateEnd(this.strm);
                }

                this.mode = exports.NONE;

                this.dictionary = null;
            };

            Zlib.prototype.write = function(flush, input, in_off, in_len, out, out_off, out_len) {
                return this._write(true, flush, input, in_off, in_len, out, out_off, out_len);
            };

            Zlib.prototype.writeSync = function(flush, input, in_off, in_len, out, out_off, out_len) {
                return this._write(false, flush, input, in_off, in_len, out, out_off, out_len);
            };

            Zlib.prototype._write = function(async, flush, input, in_off, in_len, out, out_off, out_len) {
                assert.equal(arguments.length, 8);

                assert(this.init_done, 'write before init');
                assert(this.mode !== exports.NONE, 'already finalized');
                assert.equal(false, this.write_in_progress, 'write already in progress');
                assert.equal(false, this.pending_close, 'close is pending');

                this.write_in_progress = true;

                assert.equal(false, flush === undefined, 'must provide flush value');

                this.write_in_progress = true;

                if (flush !== exports.Z_NO_FLUSH && flush !== exports.Z_PARTIAL_FLUSH && flush !== exports.Z_SYNC_FLUSH && flush !== exports.Z_FULL_FLUSH && flush !== exports.Z_FINISH && flush !== exports.Z_BLOCK) {
                    throw new Error('Invalid flush value');
                }

                if (input == null) {
                    input = Buffer.alloc(0);
                    in_len = 0;
                    in_off = 0;
                }

                this.strm.avail_in = in_len;
                this.strm.input = input;
                this.strm.next_in = in_off;
                this.strm.avail_out = out_len;
                this.strm.output = out;
                this.strm.next_out = out_off;
                this.flush = flush;

                if (!async) {
                    // sync version
                    this._process();

                    if (this._checkError()) {
                        return this._afterSync();
                    }
                    return;
                }

                // async version
                var self = this;
                process.nextTick(function() {
                    self._process();
                    self._after();
                });

                return this;
            };

            Zlib.prototype._afterSync = function() {
                var avail_out = this.strm.avail_out;
                var avail_in = this.strm.avail_in;

                this.write_in_progress = false;

                return [avail_in, avail_out];
            };

            Zlib.prototype._process = function() {
                var next_expected_header_byte = null;

                // If the avail_out is left at 0, then it means that it ran out
                // of room.  If there was avail_out left over, then it means
                // that all of the input was consumed.
                switch (this.mode) {
                    case exports.DEFLATE:
                    case exports.GZIP:
                    case exports.DEFLATERAW:
                        this.err = zlib_deflate.deflate(this.strm, this.flush);
                        break;
                    case exports.UNZIP:
                        if (this.strm.avail_in > 0) {
                            next_expected_header_byte = this.strm.next_in;
                        }

                        switch (this.gzip_id_bytes_read) {
                            case 0:
                                if (next_expected_header_byte === null) {
                                    break;
                                }

                                if (this.strm.input[next_expected_header_byte] === GZIP_HEADER_ID1) {
                                    this.gzip_id_bytes_read = 1;
                                    next_expected_header_byte++;

                                    if (this.strm.avail_in === 1) {
                                        // The only available byte was already read.
                                        break;
                                    }
                                } else {
                                    this.mode = exports.INFLATE;
                                    break;
                                }

                                // fallthrough
                            case 1:
                                if (next_expected_header_byte === null) {
                                    break;
                                }

                                if (this.strm.input[next_expected_header_byte] === GZIP_HEADER_ID2) {
                                    this.gzip_id_bytes_read = 2;
                                    this.mode = exports.GUNZIP;
                                } else {
                                    // There is no actual difference between INFLATE and INFLATERAW
                                    // (after initialization).
                                    this.mode = exports.INFLATE;
                                }

                                break;
                            default:
                                throw new Error('invalid number of gzip magic number bytes read');
                        }

                        // fallthrough
                    case exports.INFLATE:
                    case exports.GUNZIP:
                    case exports.INFLATERAW:
                        this.err = zlib_inflate.inflate(this.strm, this.flush

                            // If data was encoded with dictionary
                        );
                        if (this.err === exports.Z_NEED_DICT && this.dictionary) {
                            // Load it
                            this.err = zlib_inflate.inflateSetDictionary(this.strm, this.dictionary);
                            if (this.err === exports.Z_OK) {
                                // And try to decode again
                                this.err = zlib_inflate.inflate(this.strm, this.flush);
                            } else if (this.err === exports.Z_DATA_ERROR) {
                                // Both inflateSetDictionary() and inflate() return Z_DATA_ERROR.
                                // Make it possible for After() to tell a bad dictionary from bad
                                // input.
                                this.err = exports.Z_NEED_DICT;
                            }
                        }
                        while (this.strm.avail_in > 0 && this.mode === exports.GUNZIP && this.err === exports.Z_STREAM_END && this.strm.next_in[0] !== 0x00) {
                            // Bytes remain in input buffer. Perhaps this is another compressed
                            // member in the same archive, or just trailing garbage.
                            // Trailing zero bytes are okay, though, since they are frequently
                            // used for padding.

                            this.reset();
                            this.err = zlib_inflate.inflate(this.strm, this.flush);
                        }
                        break;
                    default:
                        throw new Error('Unknown mode ' + this.mode);
                }
            };

            Zlib.prototype._checkError = function() {
                // Acceptable error states depend on the type of zlib stream.
                switch (this.err) {
                    case exports.Z_OK:
                    case exports.Z_BUF_ERROR:
                        if (this.strm.avail_out !== 0 && this.flush === exports.Z_FINISH) {
                            this._error('unexpected end of file');
                            return false;
                        }
                        break;
                    case exports.Z_STREAM_END:
                        // normal statuses, not fatal
                        break;
                    case exports.Z_NEED_DICT:
                        if (this.dictionary == null) {
                            this._error('Missing dictionary');
                        } else {
                            this._error('Bad dictionary');
                        }
                        return false;
                    default:
                        // something else.
                        this._error('Zlib error');
                        return false;
                }

                return true;
            };

            Zlib.prototype._after = function() {
                if (!this._checkError()) {
                    return;
                }

                var avail_out = this.strm.avail_out;
                var avail_in = this.strm.avail_in;

                this.write_in_progress = false;

                // call the write() cb
                this.callback(avail_in, avail_out);

                if (this.pending_close) {
                    this.close();
                }
            };

            Zlib.prototype._error = function(message) {
                if (this.strm.msg) {
                    message = this.strm.msg;
                }
                this.onerror(message, this.err

                    // no hope of rescue.
                );
                this.write_in_progress = false;
                if (this.pending_close) {
                    this.close();
                }
            };

            Zlib.prototype.init = function(windowBits, level, memLevel, strategy, dictionary) {
                assert(arguments.length === 4 || arguments.length === 5, 'init(windowBits, level, memLevel, strategy, [dictionary])');

                assert(windowBits >= 8 && windowBits <= 15, 'invalid windowBits');
                assert(level >= -1 && level <= 9, 'invalid compression level');

                assert(memLevel >= 1 && memLevel <= 9, 'invalid memlevel');

                assert(strategy === exports.Z_FILTERED || strategy === exports.Z_HUFFMAN_ONLY || strategy === exports.Z_RLE || strategy === exports.Z_FIXED || strategy === exports.Z_DEFAULT_STRATEGY, 'invalid strategy');

                this._init(level, windowBits, memLevel, strategy, dictionary);
                this._setDictionary();
            };

            Zlib.prototype.params = function() {
                throw new Error('deflateParams Not supported');
            };

            Zlib.prototype.reset = function() {
                this._reset();
                this._setDictionary();
            };

            Zlib.prototype._init = function(level, windowBits, memLevel, strategy, dictionary) {
                this.level = level;
                this.windowBits = windowBits;
                this.memLevel = memLevel;
                this.strategy = strategy;

                this.flush = exports.Z_NO_FLUSH;

                this.err = exports.Z_OK;

                if (this.mode === exports.GZIP || this.mode === exports.GUNZIP) {
                    this.windowBits += 16;
                }

                if (this.mode === exports.UNZIP) {
                    this.windowBits += 32;
                }

                if (this.mode === exports.DEFLATERAW || this.mode === exports.INFLATERAW) {
                    this.windowBits = -1 * this.windowBits;
                }

                this.strm = new Zstream();

                switch (this.mode) {
                    case exports.DEFLATE:
                    case exports.GZIP:
                    case exports.DEFLATERAW:
                        this.err = zlib_deflate.deflateInit2(this.strm, this.level, exports.Z_DEFLATED, this.windowBits, this.memLevel, this.strategy);
                        break;
                    case exports.INFLATE:
                    case exports.GUNZIP:
                    case exports.INFLATERAW:
                    case exports.UNZIP:
                        this.err = zlib_inflate.inflateInit2(this.strm, this.windowBits);
                        break;
                    default:
                        throw new Error('Unknown mode ' + this.mode);
                }

                if (this.err !== exports.Z_OK) {
                    this._error('Init error');
                }

                this.dictionary = dictionary;

                this.write_in_progress = false;
                this.init_done = true;
            };

            Zlib.prototype._setDictionary = function() {
                if (this.dictionary == null) {
                    return;
                }

                this.err = exports.Z_OK;

                switch (this.mode) {
                    case exports.DEFLATE:
                    case exports.DEFLATERAW:
                        this.err = zlib_deflate.deflateSetDictionary(this.strm, this.dictionary);
                        break;
                    default:
                        break;
                }

                if (this.err !== exports.Z_OK) {
                    this._error('Failed to set dictionary');
                }
            };

            Zlib.prototype._reset = function() {
                this.err = exports.Z_OK;

                switch (this.mode) {
                    case exports.DEFLATE:
                    case exports.DEFLATERAW:
                    case exports.GZIP:
                        this.err = zlib_deflate.deflateReset(this.strm);
                        break;
                    case exports.INFLATE:
                    case exports.INFLATERAW:
                    case exports.GUNZIP:
                        this.err = zlib_inflate.inflateReset(this.strm);
                        break;
                    default:
                        break;
                }

                if (this.err !== exports.Z_OK) {
                    this._error('Failed to reset stream');
                }
            };

            exports.Zlib = Zlib;
        }).call(this, require('_process'), require("buffer").Buffer)
    }, { "_process": 81, "assert": 53, "buffer": 61, "pako/lib/zlib/constants": 70, "pako/lib/zlib/deflate.js": 72, "pako/lib/zlib/inflate.js": 74, "pako/lib/zlib/zstream": 78 }],
    60: [function(require, module, exports) {
        (function(process) {
            'use strict';

            var Buffer = require('buffer').Buffer;
            var Transform = require('stream').Transform;
            var binding = require('./binding');
            var util = require('util');
            var assert = require('assert').ok;
            var kMaxLength = require('buffer').kMaxLength;
            var kRangeErrorMessage = 'Cannot create final Buffer. It would be larger ' + 'than 0x' + kMaxLength.toString(16) + ' bytes';

            // zlib doesn't provide these, so kludge them in following the same
            // const naming scheme zlib uses.
            binding.Z_MIN_WINDOWBITS = 8;
            binding.Z_MAX_WINDOWBITS = 15;
            binding.Z_DEFAULT_WINDOWBITS = 15;

            // fewer than 64 bytes per chunk is stupid.
            // technically it could work with as few as 8, but even 64 bytes
            // is absurdly low.  Usually a MB or more is best.
            binding.Z_MIN_CHUNK = 64;
            binding.Z_MAX_CHUNK = Infinity;
            binding.Z_DEFAULT_CHUNK = 16 * 1024;

            binding.Z_MIN_MEMLEVEL = 1;
            binding.Z_MAX_MEMLEVEL = 9;
            binding.Z_DEFAULT_MEMLEVEL = 8;

            binding.Z_MIN_LEVEL = -1;
            binding.Z_MAX_LEVEL = 9;
            binding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION;

            // expose all the zlib constants
            var bkeys = Object.keys(binding);
            for (var bk = 0; bk < bkeys.length; bk++) {
                var bkey = bkeys[bk];
                if (bkey.match(/^Z/)) {
                    Object.defineProperty(exports, bkey, {
                        enumerable: true,
                        value: binding[bkey],
                        writable: false
                    });
                }
            }

            // translation table for return codes.
            var codes = {
                Z_OK: binding.Z_OK,
                Z_STREAM_END: binding.Z_STREAM_END,
                Z_NEED_DICT: binding.Z_NEED_DICT,
                Z_ERRNO: binding.Z_ERRNO,
                Z_STREAM_ERROR: binding.Z_STREAM_ERROR,
                Z_DATA_ERROR: binding.Z_DATA_ERROR,
                Z_MEM_ERROR: binding.Z_MEM_ERROR,
                Z_BUF_ERROR: binding.Z_BUF_ERROR,
                Z_VERSION_ERROR: binding.Z_VERSION_ERROR
            };

            var ckeys = Object.keys(codes);
            for (var ck = 0; ck < ckeys.length; ck++) {
                var ckey = ckeys[ck];
                codes[codes[ckey]] = ckey;
            }

            Object.defineProperty(exports, 'codes', {
                enumerable: true,
                value: Object.freeze(codes),
                writable: false
            });

            exports.Deflate = Deflate;
            exports.Inflate = Inflate;
            exports.Gzip = Gzip;
            exports.Gunzip = Gunzip;
            exports.DeflateRaw = DeflateRaw;
            exports.InflateRaw = InflateRaw;
            exports.Unzip = Unzip;

            exports.createDeflate = function(o) {
                return new Deflate(o);
            };

            exports.createInflate = function(o) {
                return new Inflate(o);
            };

            exports.createDeflateRaw = function(o) {
                return new DeflateRaw(o);
            };

            exports.createInflateRaw = function(o) {
                return new InflateRaw(o);
            };

            exports.createGzip = function(o) {
                return new Gzip(o);
            };

            exports.createGunzip = function(o) {
                return new Gunzip(o);
            };

            exports.createUnzip = function(o) {
                return new Unzip(o);
            };

            // Convenience methods.
            // compress/decompress a string or buffer in one step.
            exports.deflate = function(buffer, opts, callback) {
                if (typeof opts === 'function') {
                    callback = opts;
                    opts = {};
                }
                return zlibBuffer(new Deflate(opts), buffer, callback);
            };

            exports.deflateSync = function(buffer, opts) {
                return zlibBufferSync(new Deflate(opts), buffer);
            };

            exports.gzip = function(buffer, opts, callback) {
                if (typeof opts === 'function') {
                    callback = opts;
                    opts = {};
                }
                return zlibBuffer(new Gzip(opts), buffer, callback);
            };

            exports.gzipSync = function(buffer, opts) {
                return zlibBufferSync(new Gzip(opts), buffer);
            };

            exports.deflateRaw = function(buffer, opts, callback) {
                if (typeof opts === 'function') {
                    callback = opts;
                    opts = {};
                }
                return zlibBuffer(new DeflateRaw(opts), buffer, callback);
            };

            exports.deflateRawSync = function(buffer, opts) {
                return zlibBufferSync(new DeflateRaw(opts), buffer);
            };

            exports.unzip = function(buffer, opts, callback) {
                if (typeof opts === 'function') {
                    callback = opts;
                    opts = {};
                }
                return zlibBuffer(new Unzip(opts), buffer, callback);
            };

            exports.unzipSync = function(buffer, opts) {
                return zlibBufferSync(new Unzip(opts), buffer);
            };

            exports.inflate = function(buffer, opts, callback) {
                if (typeof opts === 'function') {
                    callback = opts;
                    opts = {};
                }
                return zlibBuffer(new Inflate(opts), buffer, callback);
            };

            exports.inflateSync = function(buffer, opts) {
                return zlibBufferSync(new Inflate(opts), buffer);
            };

            exports.gunzip = function(buffer, opts, callback) {
                if (typeof opts === 'function') {
                    callback = opts;
                    opts = {};
                }
                return zlibBuffer(new Gunzip(opts), buffer, callback);
            };

            exports.gunzipSync = function(buffer, opts) {
                return zlibBufferSync(new Gunzip(opts), buffer);
            };

            exports.inflateRaw = function(buffer, opts, callback) {
                if (typeof opts === 'function') {
                    callback = opts;
                    opts = {};
                }
                return zlibBuffer(new InflateRaw(opts), buffer, callback);
            };

            exports.inflateRawSync = function(buffer, opts) {
                return zlibBufferSync(new InflateRaw(opts), buffer);
            };

            function zlibBuffer(engine, buffer, callback) {
                var buffers = [];
                var nread = 0;

                engine.on('error', onError);
                engine.on('end', onEnd);

                engine.end(buffer);
                flow();

                function flow() {
                    var chunk;
                    while (null !== (chunk = engine.read())) {
                        buffers.push(chunk);
                        nread += chunk.length;
                    }
                    engine.once('readable', flow);
                }

                function onError(err) {
                    engine.removeListener('end', onEnd);
                    engine.removeListener('readable', flow);
                    callback(err);
                }

                function onEnd() {
                    var buf;
                    var err = null;

                    if (nread >= kMaxLength) {
                        err = new RangeError(kRangeErrorMessage);
                    } else {
                        buf = Buffer.concat(buffers, nread);
                    }

                    buffers = [];
                    engine.close();
                    callback(err, buf);
                }
            }

            function zlibBufferSync(engine, buffer) {
                if (typeof buffer === 'string') buffer = Buffer.from(buffer);

                if (!Buffer.isBuffer(buffer)) throw new TypeError('Not a string or buffer');

                var flushFlag = engine._finishFlushFlag;

                return engine._processChunk(buffer, flushFlag);
            }

            // generic zlib
            // minimal 2-byte header
            function Deflate(opts) {
                if (!(this instanceof Deflate)) return new Deflate(opts);
                Zlib.call(this, opts, binding.DEFLATE);
            }

            function Inflate(opts) {
                if (!(this instanceof Inflate)) return new Inflate(opts);
                Zlib.call(this, opts, binding.INFLATE);
            }

            // gzip - bigger header, same deflate compression
            function Gzip(opts) {
                if (!(this instanceof Gzip)) return new Gzip(opts);
                Zlib.call(this, opts, binding.GZIP);
            }

            function Gunzip(opts) {
                if (!(this instanceof Gunzip)) return new Gunzip(opts);
                Zlib.call(this, opts, binding.GUNZIP);
            }

            // raw - no header
            function DeflateRaw(opts) {
                if (!(this instanceof DeflateRaw)) return new DeflateRaw(opts);
                Zlib.call(this, opts, binding.DEFLATERAW);
            }

            function InflateRaw(opts) {
                if (!(this instanceof InflateRaw)) return new InflateRaw(opts);
                Zlib.call(this, opts, binding.INFLATERAW);
            }

            // auto-detect header.
            function Unzip(opts) {
                if (!(this instanceof Unzip)) return new Unzip(opts);
                Zlib.call(this, opts, binding.UNZIP);
            }

            function isValidFlushFlag(flag) {
                return flag === binding.Z_NO_FLUSH || flag === binding.Z_PARTIAL_FLUSH || flag === binding.Z_SYNC_FLUSH || flag === binding.Z_FULL_FLUSH || flag === binding.Z_FINISH || flag === binding.Z_BLOCK;
            }

            // the Zlib class they all inherit from
            // This thing manages the queue of requests, and returns
            // true or false if there is anything in the queue when
            // you call the .write() method.

            function Zlib(opts, mode) {
                var _this = this;

                this._opts = opts = opts || {};
                this._chunkSize = opts.chunkSize || exports.Z_DEFAULT_CHUNK;

                Transform.call(this, opts);

                if (opts.flush && !isValidFlushFlag(opts.flush)) {
                    throw new Error('Invalid flush flag: ' + opts.flush);
                }
                if (opts.finishFlush && !isValidFlushFlag(opts.finishFlush)) {
                    throw new Error('Invalid flush flag: ' + opts.finishFlush);
                }

                this._flushFlag = opts.flush || binding.Z_NO_FLUSH;
                this._finishFlushFlag = typeof opts.finishFlush !== 'undefined' ? opts.finishFlush : binding.Z_FINISH;

                if (opts.chunkSize) {
                    if (opts.chunkSize < exports.Z_MIN_CHUNK || opts.chunkSize > exports.Z_MAX_CHUNK) {
                        throw new Error('Invalid chunk size: ' + opts.chunkSize);
                    }
                }

                if (opts.windowBits) {
                    if (opts.windowBits < exports.Z_MIN_WINDOWBITS || opts.windowBits > exports.Z_MAX_WINDOWBITS) {
                        throw new Error('Invalid windowBits: ' + opts.windowBits);
                    }
                }

                if (opts.level) {
                    if (opts.level < exports.Z_MIN_LEVEL || opts.level > exports.Z_MAX_LEVEL) {
                        throw new Error('Invalid compression level: ' + opts.level);
                    }
                }

                if (opts.memLevel) {
                    if (opts.memLevel < exports.Z_MIN_MEMLEVEL || opts.memLevel > exports.Z_MAX_MEMLEVEL) {
                        throw new Error('Invalid memLevel: ' + opts.memLevel);
                    }
                }

                if (opts.strategy) {
                    if (opts.strategy != exports.Z_FILTERED && opts.strategy != exports.Z_HUFFMAN_ONLY && opts.strategy != exports.Z_RLE && opts.strategy != exports.Z_FIXED && opts.strategy != exports.Z_DEFAULT_STRATEGY) {
                        throw new Error('Invalid strategy: ' + opts.strategy);
                    }
                }

                if (opts.dictionary) {
                    if (!Buffer.isBuffer(opts.dictionary)) {
                        throw new Error('Invalid dictionary: it should be a Buffer instance');
                    }
                }

                this._handle = new binding.Zlib(mode);

                var self = this;
                this._hadError = false;
                this._handle.onerror = function(message, errno) {
                    // there is no way to cleanly recover.
                    // continuing only obscures problems.
                    _close(self);
                    self._hadError = true;

                    var error = new Error(message);
                    error.errno = errno;
                    error.code = exports.codes[errno];
                    self.emit('error', error);
                };

                var level = exports.Z_DEFAULT_COMPRESSION;
                if (typeof opts.level === 'number') level = opts.level;

                var strategy = exports.Z_DEFAULT_STRATEGY;
                if (typeof opts.strategy === 'number') strategy = opts.strategy;

                this._handle.init(opts.windowBits || exports.Z_DEFAULT_WINDOWBITS, level, opts.memLevel || exports.Z_DEFAULT_MEMLEVEL, strategy, opts.dictionary);

                this._buffer = Buffer.allocUnsafe(this._chunkSize);
                this._offset = 0;
                this._level = level;
                this._strategy = strategy;

                this.once('end', this.close);

                Object.defineProperty(this, '_closed', {
                    get: function() {
                        return !_this._handle;
                    },
                    configurable: true,
                    enumerable: true
                });
            }

            util.inherits(Zlib, Transform);

            Zlib.prototype.params = function(level, strategy, callback) {
                if (level < exports.Z_MIN_LEVEL || level > exports.Z_MAX_LEVEL) {
                    throw new RangeError('Invalid compression level: ' + level);
                }
                if (strategy != exports.Z_FILTERED && strategy != exports.Z_HUFFMAN_ONLY && strategy != exports.Z_RLE && strategy != exports.Z_FIXED && strategy != exports.Z_DEFAULT_STRATEGY) {
                    throw new TypeError('Invalid strategy: ' + strategy);
                }

                if (this._level !== level || this._strategy !== strategy) {
                    var self = this;
                    this.flush(binding.Z_SYNC_FLUSH, function() {
                        assert(self._handle, 'zlib binding closed');
                        self._handle.params(level, strategy);
                        if (!self._hadError) {
                            self._level = level;
                            self._strategy = strategy;
                            if (callback) callback();
                        }
                    });
                } else {
                    process.nextTick(callback);
                }
            };

            Zlib.prototype.reset = function() {
                assert(this._handle, 'zlib binding closed');
                return this._handle.reset();
            };

            // This is the _flush function called by the transform class,
            // internally, when the last chunk has been written.
            Zlib.prototype._flush = function(callback) {
                this._transform(Buffer.alloc(0), '', callback);
            };

            Zlib.prototype.flush = function(kind, callback) {
                var _this2 = this;

                var ws = this._writableState;

                if (typeof kind === 'function' || kind === undefined && !callback) {
                    callback = kind;
                    kind = binding.Z_FULL_FLUSH;
                }

                if (ws.ended) {
                    if (callback) process.nextTick(callback);
                } else if (ws.ending) {
                    if (callback) this.once('end', callback);
                } else if (ws.needDrain) {
                    if (callback) {
                        this.once('drain', function() {
                            return _this2.flush(kind, callback);
                        });
                    }
                } else {
                    this._flushFlag = kind;
                    this.write(Buffer.alloc(0), '', callback);
                }
            };

            Zlib.prototype.close = function(callback) {
                _close(this, callback);
                process.nextTick(emitCloseNT, this);
            };

            function _close(engine, callback) {
                if (callback) process.nextTick(callback);

                // Caller may invoke .close after a zlib error (which will null _handle).
                if (!engine._handle) return;

                engine._handle.close();
                engine._handle = null;
            }

            function emitCloseNT(self) {
                self.emit('close');
            }

            Zlib.prototype._transform = function(chunk, encoding, cb) {
                var flushFlag;
                var ws = this._writableState;
                var ending = ws.ending || ws.ended;
                var last = ending && (!chunk || ws.length === chunk.length);

                if (chunk !== null && !Buffer.isBuffer(chunk)) return cb(new Error('invalid input'));

                if (!this._handle) return cb(new Error('zlib binding closed'));

                // If it's the last chunk, or a final flush, we use the Z_FINISH flush flag
                // (or whatever flag was provided using opts.finishFlush).
                // If it's explicitly flushing at some other time, then we use
                // Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression
                // goodness.
                if (last) flushFlag = this._finishFlushFlag;
                else {
                    flushFlag = this._flushFlag;
                    // once we've flushed the last of the queue, stop flushing and
                    // go back to the normal behavior.
                    if (chunk.length >= ws.length) {
                        this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH;
                    }
                }

                this._processChunk(chunk, flushFlag, cb);
            };

            Zlib.prototype._processChunk = function(chunk, flushFlag, cb) {
                var availInBefore = chunk && chunk.length;
                var availOutBefore = this._chunkSize - this._offset;
                var inOff = 0;

                var self = this;

                var async = typeof cb === 'function';

                if (!async) {
                    var buffers = [];
                    var nread = 0;

                    var error;
                    this.on('error', function(er) {
                        error = er;
                    });

                    assert(this._handle, 'zlib binding closed');
                    do {
                        var res = this._handle.writeSync(flushFlag, chunk, // in
                            inOff, // in_off
                            availInBefore, // in_len
                            this._buffer, // out
                            this._offset, //out_off
                            availOutBefore); // out_len
                    } while (!this._hadError && callback(res[0], res[1]));

                    if (this._hadError) {
                        throw error;
                    }

                    if (nread >= kMaxLength) {
                        _close(this);
                        throw new RangeError(kRangeErrorMessage);
                    }

                    var buf = Buffer.concat(buffers, nread);
                    _close(this);

                    return buf;
                }

                assert(this._handle, 'zlib binding closed');
                var req = this._handle.write(flushFlag, chunk, // in
                    inOff, // in_off
                    availInBefore, // in_len
                    this._buffer, // out
                    this._offset, //out_off
                    availOutBefore); // out_len

                req.buffer = chunk;
                req.callback = callback;

                function callback(availInAfter, availOutAfter) {
                    // When the callback is used in an async write, the callback's
                    // context is the `req` object that was created. The req object
                    // is === this._handle, and that's why it's important to null
                    // out the values after they are done being used. `this._handle`
                    // can stay in memory longer than the callback and buffer are needed.
                    if (this) {
                        this.buffer = null;
                        this.callback = null;
                    }

                    if (self._hadError) return;

                    var have = availOutBefore - availOutAfter;
                    assert(have >= 0, 'have should not go down');

                    if (have > 0) {
                        var out = self._buffer.slice(self._offset, self._offset + have);
                        self._offset += have;
                        // serve some output to the consumer.
                        if (async) {
                            self.push(out);
                        } else {
                            buffers.push(out);
                            nread += out.length;
                        }
                    }

                    // exhausted the output buffer, or used all the input create a new one.
                    if (availOutAfter === 0 || self._offset >= self._chunkSize) {
                        availOutBefore = self._chunkSize;
                        self._offset = 0;
                        self._buffer = Buffer.allocUnsafe(self._chunkSize);
                    }

                    if (availOutAfter === 0) {
                        // Not actually done.  Need to reprocess.
                        // Also, update the availInBefore to the availInAfter value,
                        // so that if we have to hit it a third (fourth, etc.) time,
                        // it'll have the correct byte counts.
                        inOff += availInBefore - availInAfter;
                        availInBefore = availInAfter;

                        if (!async) return true;

                        var newReq = self._handle.write(flushFlag, chunk, inOff, availInBefore, self._buffer, self._offset, self._chunkSize);
                        newReq.callback = callback; // this same function
                        newReq.buffer = chunk;
                        return;
                    }

                    if (!async) return false;

                    // finished with the chunk.
                    cb();
                }
            };

            util.inherits(Deflate, Zlib);
            util.inherits(Inflate, Zlib);
            util.inherits(Gzip, Zlib);
            util.inherits(Gunzip, Zlib);
            util.inherits(DeflateRaw, Zlib);
            util.inherits(InflateRaw, Zlib);
            util.inherits(Unzip, Zlib);
        }).call(this, require('_process'))
    }, { "./binding": 59, "_process": 81, "assert": 53, "buffer": 61, "stream": 96, "util": 102 }],
    61: [function(require, module, exports) {
        /*!
         * The buffer module from node.js, for the browser.
         *
         * @author   Feross Aboukhadijeh <https://feross.org>
         * @license  MIT
         */
        /* eslint-disable no-proto */

        'use strict'

        var base64 = require('base64-js')
        var ieee754 = require('ieee754')

        exports.Buffer = Buffer
        exports.SlowBuffer = SlowBuffer
        exports.INSPECT_MAX_BYTES = 50

        var K_MAX_LENGTH = 0x7fffffff
        exports.kMaxLength = K_MAX_LENGTH

        /**
         * If `Buffer.TYPED_ARRAY_SUPPORT`:
         *   === true    Use Uint8Array implementation (fastest)
         *   === false   Print warning and recommend using `buffer` v4.x which has an Object
         *               implementation (most compatible, even IE6)
         *
         * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
         * Opera 11.6+, iOS 4.2+.
         *
         * We report that the browser does not support typed arrays if the are not subclassable
         * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
         * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
         * for __proto__ and has a buggy typed array implementation.
         */
        Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

        if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
            typeof console.error === 'function') {
            console.error(
                'This browser lacks typed array (Uint8Array) support which is required by ' +
                '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
            )
        }

        function typedArraySupport() {
            // Can typed array instances can be augmented?
            try {
                var arr = new Uint8Array(1)
                arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function() { return 42 } }
                return arr.foo() === 42
            } catch (e) {
                return false
            }
        }

        Object.defineProperty(Buffer.prototype, 'parent', {
            enumerable: true,
            get: function() {
                if (!Buffer.isBuffer(this)) return undefined
                return this.buffer
            }
        })

        Object.defineProperty(Buffer.prototype, 'offset', {
            enumerable: true,
            get: function() {
                if (!Buffer.isBuffer(this)) return undefined
                return this.byteOffset
            }
        })

        function createBuffer(length) {
            if (length > K_MAX_LENGTH) {
                throw new RangeError('The value "' + length + '" is invalid for option "size"')
            }
            // Return an augmented `Uint8Array` instance
            var buf = new Uint8Array(length)
            buf.__proto__ = Buffer.prototype
            return buf
        }

        /**
         * The Buffer constructor returns instances of `Uint8Array` that have their
         * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
         * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
         * and the `Uint8Array` methods. Square bracket notation works as expected -- it
         * returns a single octet.
         *
         * The `Uint8Array` prototype remains unmodified.
         */

        function Buffer(arg, encodingOrOffset, length) {
            // Common case.
            if (typeof arg === 'number') {
                if (typeof encodingOrOffset === 'string') {
                    throw new TypeError(
                        'The "string" argument must be of type string. Received type number'
                    )
                }
                return allocUnsafe(arg)
            }
            return from(arg, encodingOrOffset, length)
        }

        // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
        if (typeof Symbol !== 'undefined' && Symbol.species != null &&
            Buffer[Symbol.species] === Buffer) {
            Object.defineProperty(Buffer, Symbol.species, {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false
            })
        }

        Buffer.poolSize = 8192 // not used by this implementation

        function from(value, encodingOrOffset, length) {
            if (typeof value === 'string') {
                return fromString(value, encodingOrOffset)
            }

            if (ArrayBuffer.isView(value)) {
                return fromArrayLike(value)
            }

            if (value == null) {
                throw TypeError(
                    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
                    'or Array-like Object. Received type ' + (typeof value)
                )
            }

            if (isInstance(value, ArrayBuffer) ||
                (value && isInstance(value.buffer, ArrayBuffer))) {
                return fromArrayBuffer(value, encodingOrOffset, length)
            }

            if (typeof value === 'number') {
                throw new TypeError(
                    'The "value" argument must not be of type number. Received type number'
                )
            }

            var valueOf = value.valueOf && value.valueOf()
            if (valueOf != null && valueOf !== value) {
                return Buffer.from(valueOf, encodingOrOffset, length)
            }

            var b = fromObject(value)
            if (b) return b

            if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
                typeof value[Symbol.toPrimitive] === 'function') {
                return Buffer.from(
                    value[Symbol.toPrimitive]('string'), encodingOrOffset, length
                )
            }

            throw new TypeError(
                'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
                'or Array-like Object. Received type ' + (typeof value)
            )
        }

        /**
         * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
         * if value is a number.
         * Buffer.from(str[, encoding])
         * Buffer.from(array)
         * Buffer.from(buffer)
         * Buffer.from(arrayBuffer[, byteOffset[, length]])
         **/
        Buffer.from = function(value, encodingOrOffset, length) {
            return from(value, encodingOrOffset, length)
        }

        // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
        // https://github.com/feross/buffer/pull/148
        Buffer.prototype.__proto__ = Uint8Array.prototype
        Buffer.__proto__ = Uint8Array

        function assertSize(size) {
            if (typeof size !== 'number') {
                throw new TypeError('"size" argument must be of type number')
            } else if (size < 0) {
                throw new RangeError('The value "' + size + '" is invalid for option "size"')
            }
        }

        function alloc(size, fill, encoding) {
            assertSize(size)
            if (size <= 0) {
                return createBuffer(size)
            }
            if (fill !== undefined) {
                // Only pay attention to encoding if it's a string. This
                // prevents accidentally sending in a number that would
                // be interpretted as a start offset.
                return typeof encoding === 'string' ?
                    createBuffer(size).fill(fill, encoding) :
                    createBuffer(size).fill(fill)
            }
            return createBuffer(size)
        }

        /**
         * Creates a new filled Buffer instance.
         * alloc(size[, fill[, encoding]])
         **/
        Buffer.alloc = function(size, fill, encoding) {
            return alloc(size, fill, encoding)
        }

        function allocUnsafe(size) {
            assertSize(size)
            return createBuffer(size < 0 ? 0 : checked(size) | 0)
        }

        /**
         * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
         * */
        Buffer.allocUnsafe = function(size) {
                return allocUnsafe(size)
            }
            /**
             * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
             */
        Buffer.allocUnsafeSlow = function(size) {
            return allocUnsafe(size)
        }

        function fromString(string, encoding) {
            if (typeof encoding !== 'string' || encoding === '') {
                encoding = 'utf8'
            }

            if (!Buffer.isEncoding(encoding)) {
                throw new TypeError('Unknown encoding: ' + encoding)
            }

            var length = byteLength(string, encoding) | 0
            var buf = createBuffer(length)

            var actual = buf.write(string, encoding)

            if (actual !== length) {
                // Writing a hex string, for example, that contains invalid characters will
                // cause everything after the first invalid character to be ignored. (e.g.
                // 'abxxcd' will be treated as 'ab')
                buf = buf.slice(0, actual)
            }

            return buf
        }

        function fromArrayLike(array) {
            var length = array.length < 0 ? 0 : checked(array.length) | 0
            var buf = createBuffer(length)
            for (var i = 0; i < length; i += 1) {
                buf[i] = array[i] & 255
            }
            return buf
        }

        function fromArrayBuffer(array, byteOffset, length) {
            if (byteOffset < 0 || array.byteLength < byteOffset) {
                throw new RangeError('"offset" is outside of buffer bounds')
            }

            if (array.byteLength < byteOffset + (length || 0)) {
                throw new RangeError('"length" is outside of buffer bounds')
            }

            var buf
            if (byteOffset === undefined && length === undefined) {
                buf = new Uint8Array(array)
            } else if (length === undefined) {
                buf = new Uint8Array(array, byteOffset)
            } else {
                buf = new Uint8Array(array, byteOffset, length)
            }

            // Return an augmented `Uint8Array` instance
            buf.__proto__ = Buffer.prototype
            return buf
        }

        function fromObject(obj) {
            if (Buffer.isBuffer(obj)) {
                var len = checked(obj.length) | 0
                var buf = createBuffer(len)

                if (buf.length === 0) {
                    return buf
                }

                obj.copy(buf, 0, 0, len)
                return buf
            }

            if (obj.length !== undefined) {
                if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
                    return createBuffer(0)
                }
                return fromArrayLike(obj)
            }

            if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
                return fromArrayLike(obj.data)
            }
        }

        function checked(length) {
            // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
            // length is NaN (which is otherwise coerced to zero.)
            if (length >= K_MAX_LENGTH) {
                throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                    'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
            }
            return length | 0
        }

        function SlowBuffer(length) {
            if (+length != length) { // eslint-disable-line eqeqeq
                length = 0
            }
            return Buffer.alloc(+length)
        }

        Buffer.isBuffer = function isBuffer(b) {
            return b != null && b._isBuffer === true &&
                b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
        }

        Buffer.compare = function compare(a, b) {
            if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
            if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                throw new TypeError(
                    'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
                )
            }

            if (a === b) return 0

            var x = a.length
            var y = b.length

            for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                if (a[i] !== b[i]) {
                    x = a[i]
                    y = b[i]
                    break
                }
            }

            if (x < y) return -1
            if (y < x) return 1
            return 0
        }

        Buffer.isEncoding = function isEncoding(encoding) {
            switch (String(encoding).toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'latin1':
                case 'binary':
                case 'base64':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                    return true
                default:
                    return false
            }
        }

        Buffer.concat = function concat(list, length) {
            if (!Array.isArray(list)) {
                throw new TypeError('"list" argument must be an Array of Buffers')
            }

            if (list.length === 0) {
                return Buffer.alloc(0)
            }

            var i
            if (length === undefined) {
                length = 0
                for (i = 0; i < list.length; ++i) {
                    length += list[i].length
                }
            }

            var buffer = Buffer.allocUnsafe(length)
            var pos = 0
            for (i = 0; i < list.length; ++i) {
                var buf = list[i]
                if (isInstance(buf, Uint8Array)) {
                    buf = Buffer.from(buf)
                }
                if (!Buffer.isBuffer(buf)) {
                    throw new TypeError('"list" argument must be an Array of Buffers')
                }
                buf.copy(buffer, pos)
                pos += buf.length
            }
            return buffer
        }

        function byteLength(string, encoding) {
            if (Buffer.isBuffer(string)) {
                return string.length
            }
            if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
                return string.byteLength
            }
            if (typeof string !== 'string') {
                throw new TypeError(
                    'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
                    'Received type ' + typeof string
                )
            }

            var len = string.length
            var mustMatch = (arguments.length > 2 && arguments[2] === true)
            if (!mustMatch && len === 0) return 0

            // Use a for loop to avoid recursion
            var loweredCase = false
            for (;;) {
                switch (encoding) {
                    case 'ascii':
                    case 'latin1':
                    case 'binary':
                        return len
                    case 'utf8':
                    case 'utf-8':
                        return utf8ToBytes(string).length
                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        return len * 2
                    case 'hex':
                        return len >>> 1
                    case 'base64':
                        return base64ToBytes(string).length
                    default:
                        if (loweredCase) {
                            return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
                        }
                        encoding = ('' + encoding).toLowerCase()
                        loweredCase = true
                }
            }
        }
        Buffer.byteLength = byteLength

        function slowToString(encoding, start, end) {
            var loweredCase = false

            // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
            // property of a typed array.

            // This behaves neither like String nor Uint8Array in that we set start/end
            // to their upper/lower bounds if the value passed is out of range.
            // undefined is handled specially as per ECMA-262 6th Edition,
            // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
            if (start === undefined || start < 0) {
                start = 0
            }
            // Return early if start > this.length. Done here to prevent potential uint32
            // coercion fail below.
            if (start > this.length) {
                return ''
            }

            if (end === undefined || end > this.length) {
                end = this.length
            }

            if (end <= 0) {
                return ''
            }

            // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
            end >>>= 0
            start >>>= 0

            if (end <= start) {
                return ''
            }

            if (!encoding) encoding = 'utf8'

            while (true) {
                switch (encoding) {
                    case 'hex':
                        return hexSlice(this, start, end)

                    case 'utf8':
                    case 'utf-8':
                        return utf8Slice(this, start, end)

                    case 'ascii':
                        return asciiSlice(this, start, end)

                    case 'latin1':
                    case 'binary':
                        return latin1Slice(this, start, end)

                    case 'base64':
                        return base64Slice(this, start, end)

                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        return utf16leSlice(this, start, end)

                    default:
                        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                        encoding = (encoding + '').toLowerCase()
                        loweredCase = true
                }
            }
        }

        // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
        // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
        // reliably in a browserify context because there could be multiple different
        // copies of the 'buffer' package in use. This method works even for Buffer
        // instances that were created from another copy of the `buffer` package.
        // See: https://github.com/feross/buffer/issues/154
        Buffer.prototype._isBuffer = true

        function swap(b, n, m) {
            var i = b[n]
            b[n] = b[m]
            b[m] = i
        }

        Buffer.prototype.swap16 = function swap16() {
            var len = this.length
            if (len % 2 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 16-bits')
            }
            for (var i = 0; i < len; i += 2) {
                swap(this, i, i + 1)
            }
            return this
        }

        Buffer.prototype.swap32 = function swap32() {
            var len = this.length
            if (len % 4 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 32-bits')
            }
            for (var i = 0; i < len; i += 4) {
                swap(this, i, i + 3)
                swap(this, i + 1, i + 2)
            }
            return this
        }

        Buffer.prototype.swap64 = function swap64() {
            var len = this.length
            if (len % 8 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 64-bits')
            }
            for (var i = 0; i < len; i += 8) {
                swap(this, i, i + 7)
                swap(this, i + 1, i + 6)
                swap(this, i + 2, i + 5)
                swap(this, i + 3, i + 4)
            }
            return this
        }

        Buffer.prototype.toString = function toString() {
            var length = this.length
            if (length === 0) return ''
            if (arguments.length === 0) return utf8Slice(this, 0, length)
            return slowToString.apply(this, arguments)
        }

        Buffer.prototype.toLocaleString = Buffer.prototype.toString

        Buffer.prototype.equals = function equals(b) {
            if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
            if (this === b) return true
            return Buffer.compare(this, b) === 0
        }

        Buffer.prototype.inspect = function inspect() {
            var str = ''
            var max = exports.INSPECT_MAX_BYTES
            str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
            if (this.length > max) str += ' ... '
            return '<Buffer ' + str + '>'
        }

        Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
            if (isInstance(target, Uint8Array)) {
                target = Buffer.from(target, target.offset, target.byteLength)
            }
            if (!Buffer.isBuffer(target)) {
                throw new TypeError(
                    'The "target" argument must be one of type Buffer or Uint8Array. ' +
                    'Received type ' + (typeof target)
                )
            }

            if (start === undefined) {
                start = 0
            }
            if (end === undefined) {
                end = target ? target.length : 0
            }
            if (thisStart === undefined) {
                thisStart = 0
            }
            if (thisEnd === undefined) {
                thisEnd = this.length
            }

            if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                throw new RangeError('out of range index')
            }

            if (thisStart >= thisEnd && start >= end) {
                return 0
            }
            if (thisStart >= thisEnd) {
                return -1
            }
            if (start >= end) {
                return 1
            }

            start >>>= 0
            end >>>= 0
            thisStart >>>= 0
            thisEnd >>>= 0

            if (this === target) return 0

            var x = thisEnd - thisStart
            var y = end - start
            var len = Math.min(x, y)

            var thisCopy = this.slice(thisStart, thisEnd)
            var targetCopy = target.slice(start, end)

            for (var i = 0; i < len; ++i) {
                if (thisCopy[i] !== targetCopy[i]) {
                    x = thisCopy[i]
                    y = targetCopy[i]
                    break
                }
            }

            if (x < y) return -1
            if (y < x) return 1
            return 0
        }

        // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
        // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
        //
        // Arguments:
        // - buffer - a Buffer to search
        // - val - a string, Buffer, or number
        // - byteOffset - an index into `buffer`; will be clamped to an int32
        // - encoding - an optional encoding, relevant is val is a string
        // - dir - true for indexOf, false for lastIndexOf
        function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
            // Empty buffer means no match
            if (buffer.length === 0) return -1

            // Normalize byteOffset
            if (typeof byteOffset === 'string') {
                encoding = byteOffset
                byteOffset = 0
            } else if (byteOffset > 0x7fffffff) {
                byteOffset = 0x7fffffff
            } else if (byteOffset < -0x80000000) {
                byteOffset = -0x80000000
            }
            byteOffset = +byteOffset // Coerce to Number.
            if (numberIsNaN(byteOffset)) {
                // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
                byteOffset = dir ? 0 : (buffer.length - 1)
            }

            // Normalize byteOffset: negative offsets start from the end of the buffer
            if (byteOffset < 0) byteOffset = buffer.length + byteOffset
            if (byteOffset >= buffer.length) {
                if (dir) return -1
                else byteOffset = buffer.length - 1
            } else if (byteOffset < 0) {
                if (dir) byteOffset = 0
                else return -1
            }

            // Normalize val
            if (typeof val === 'string') {
                val = Buffer.from(val, encoding)
            }

            // Finally, search either indexOf (if dir is true) or lastIndexOf
            if (Buffer.isBuffer(val)) {
                // Special case: looking for empty string/buffer always fails
                if (val.length === 0) {
                    return -1
                }
                return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
            } else if (typeof val === 'number') {
                val = val & 0xFF // Search for a byte value [0-255]
                if (typeof Uint8Array.prototype.indexOf === 'function') {
                    if (dir) {
                        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
                    } else {
                        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
                    }
                }
                return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
            }

            throw new TypeError('val must be string, number or Buffer')
        }

        function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
            var indexSize = 1
            var arrLength = arr.length
            var valLength = val.length

            if (encoding !== undefined) {
                encoding = String(encoding).toLowerCase()
                if (encoding === 'ucs2' || encoding === 'ucs-2' ||
                    encoding === 'utf16le' || encoding === 'utf-16le') {
                    if (arr.length < 2 || val.length < 2) {
                        return -1
                    }
                    indexSize = 2
                    arrLength /= 2
                    valLength /= 2
                    byteOffset /= 2
                }
            }

            function read(buf, i) {
                if (indexSize === 1) {
                    return buf[i]
                } else {
                    return buf.readUInt16BE(i * indexSize)
                }
            }

            var i
            if (dir) {
                var foundIndex = -1
                for (i = byteOffset; i < arrLength; i++) {
                    if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                        if (foundIndex === -1) foundIndex = i
                        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
                    } else {
                        if (foundIndex !== -1) i -= i - foundIndex
                        foundIndex = -1
                    }
                }
            } else {
                if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
                for (i = byteOffset; i >= 0; i--) {
                    var found = true
                    for (var j = 0; j < valLength; j++) {
                        if (read(arr, i + j) !== read(val, j)) {
                            found = false
                            break
                        }
                    }
                    if (found) return i
                }
            }

            return -1
        }

        Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
            return this.indexOf(val, byteOffset, encoding) !== -1
        }

        Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
        }

        Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
        }

        function hexWrite(buf, string, offset, length) {
            offset = Number(offset) || 0
            var remaining = buf.length - offset
            if (!length) {
                length = remaining
            } else {
                length = Number(length)
                if (length > remaining) {
                    length = remaining
                }
            }

            var strLen = string.length

            if (length > strLen / 2) {
                length = strLen / 2
            }
            for (var i = 0; i < length; ++i) {
                var parsed = parseInt(string.substr(i * 2, 2), 16)
                if (numberIsNaN(parsed)) return i
                buf[offset + i] = parsed
            }
            return i
        }

        function utf8Write(buf, string, offset, length) {
            return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
        }

        function asciiWrite(buf, string, offset, length) {
            return blitBuffer(asciiToBytes(string), buf, offset, length)
        }

        function latin1Write(buf, string, offset, length) {
            return asciiWrite(buf, string, offset, length)
        }

        function base64Write(buf, string, offset, length) {
            return blitBuffer(base64ToBytes(string), buf, offset, length)
        }

        function ucs2Write(buf, string, offset, length) {
            return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
        }

        Buffer.prototype.write = function write(string, offset, length, encoding) {
            // Buffer#write(string)
            if (offset === undefined) {
                encoding = 'utf8'
                length = this.length
                offset = 0
                    // Buffer#write(string, encoding)
            } else if (length === undefined && typeof offset === 'string') {
                encoding = offset
                length = this.length
                offset = 0
                    // Buffer#write(string, offset[, length][, encoding])
            } else if (isFinite(offset)) {
                offset = offset >>> 0
                if (isFinite(length)) {
                    length = length >>> 0
                    if (encoding === undefined) encoding = 'utf8'
                } else {
                    encoding = length
                    length = undefined
                }
            } else {
                throw new Error(
                    'Buffer.write(string, encoding, offset[, length]) is no longer supported'
                )
            }

            var remaining = this.length - offset
            if (length === undefined || length > remaining) length = remaining

            if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
                throw new RangeError('Attempt to write outside buffer bounds')
            }

            if (!encoding) encoding = 'utf8'

            var loweredCase = false
            for (;;) {
                switch (encoding) {
                    case 'hex':
                        return hexWrite(this, string, offset, length)

                    case 'utf8':
                    case 'utf-8':
                        return utf8Write(this, string, offset, length)

                    case 'ascii':
                        return asciiWrite(this, string, offset, length)

                    case 'latin1':
                    case 'binary':
                        return latin1Write(this, string, offset, length)

                    case 'base64':
                        // Warning: maxLength not taken into account in base64Write
                        return base64Write(this, string, offset, length)

                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        return ucs2Write(this, string, offset, length)

                    default:
                        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                        encoding = ('' + encoding).toLowerCase()
                        loweredCase = true
                }
            }
        }

        Buffer.prototype.toJSON = function toJSON() {
            return {
                type: 'Buffer',
                data: Array.prototype.slice.call(this._arr || this, 0)
            }
        }

        function base64Slice(buf, start, end) {
            if (start === 0 && end === buf.length) {
                return base64.fromByteArray(buf)
            } else {
                return base64.fromByteArray(buf.slice(start, end))
            }
        }

        function utf8Slice(buf, start, end) {
            end = Math.min(buf.length, end)
            var res = []

            var i = start
            while (i < end) {
                var firstByte = buf[i]
                var codePoint = null
                var bytesPerSequence = (firstByte > 0xEF) ? 4 :
                    (firstByte > 0xDF) ? 3 :
                    (firstByte > 0xBF) ? 2 :
                    1

                if (i + bytesPerSequence <= end) {
                    var secondByte, thirdByte, fourthByte, tempCodePoint

                    switch (bytesPerSequence) {
                        case 1:
                            if (firstByte < 0x80) {
                                codePoint = firstByte
                            }
                            break
                        case 2:
                            secondByte = buf[i + 1]
                            if ((secondByte & 0xC0) === 0x80) {
                                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                                if (tempCodePoint > 0x7F) {
                                    codePoint = tempCodePoint
                                }
                            }
                            break
                        case 3:
                            secondByte = buf[i + 1]
                            thirdByte = buf[i + 2]
                            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                                    codePoint = tempCodePoint
                                }
                            }
                            break
                        case 4:
                            secondByte = buf[i + 1]
                            thirdByte = buf[i + 2]
                            fourthByte = buf[i + 3]
                            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                                    codePoint = tempCodePoint
                                }
                            }
                    }
                }

                if (codePoint === null) {
                    // we did not generate a valid codePoint so insert a
                    // replacement char (U+FFFD) and advance only 1 byte
                    codePoint = 0xFFFD
                    bytesPerSequence = 1
                } else if (codePoint > 0xFFFF) {
                    // encode to utf16 (surrogate pair dance)
                    codePoint -= 0x10000
                    res.push(codePoint >>> 10 & 0x3FF | 0xD800)
                    codePoint = 0xDC00 | codePoint & 0x3FF
                }

                res.push(codePoint)
                i += bytesPerSequence
            }

            return decodeCodePointsArray(res)
        }

        // Based on http://stackoverflow.com/a/22747272/680742, the browser with
        // the lowest limit is Chrome, with 0x10000 args.
        // We go 1 magnitude less, for safety
        var MAX_ARGUMENTS_LENGTH = 0x1000

        function decodeCodePointsArray(codePoints) {
            var len = codePoints.length
            if (len <= MAX_ARGUMENTS_LENGTH) {
                return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
            }

            // Decode in chunks to avoid "call stack size exceeded".
            var res = ''
            var i = 0
            while (i < len) {
                res += String.fromCharCode.apply(
                    String,
                    codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
                )
            }
            return res
        }

        function asciiSlice(buf, start, end) {
            var ret = ''
            end = Math.min(buf.length, end)

            for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i] & 0x7F)
            }
            return ret
        }

        function latin1Slice(buf, start, end) {
            var ret = ''
            end = Math.min(buf.length, end)

            for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i])
            }
            return ret
        }

        function hexSlice(buf, start, end) {
            var len = buf.length

            if (!start || start < 0) start = 0
            if (!end || end < 0 || end > len) end = len

            var out = ''
            for (var i = start; i < end; ++i) {
                out += toHex(buf[i])
            }
            return out
        }

        function utf16leSlice(buf, start, end) {
            var bytes = buf.slice(start, end)
            var res = ''
            for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
            }
            return res
        }

        Buffer.prototype.slice = function slice(start, end) {
            var len = this.length
            start = ~~start
            end = end === undefined ? len : ~~end

            if (start < 0) {
                start += len
                if (start < 0) start = 0
            } else if (start > len) {
                start = len
            }

            if (end < 0) {
                end += len
                if (end < 0) end = 0
            } else if (end > len) {
                end = len
            }

            if (end < start) end = start

            var newBuf = this.subarray(start, end)
                // Return an augmented `Uint8Array` instance
            newBuf.__proto__ = Buffer.prototype
            return newBuf
        }

        /*
         * Need to make sure that buffer isn't trying to write out of bounds.
         */
        function checkOffset(offset, ext, length) {
            if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
            if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
        }

        Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0
            byteLength = byteLength >>> 0
            if (!noAssert) checkOffset(offset, byteLength, this.length)

            var val = this[offset]
            var mul = 1
            var i = 0
            while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul
            }

            return val
        }

        Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0
            byteLength = byteLength >>> 0
            if (!noAssert) {
                checkOffset(offset, byteLength, this.length)
            }

            var val = this[offset + --byteLength]
            var mul = 1
            while (byteLength > 0 && (mul *= 0x100)) {
                val += this[offset + --byteLength] * mul
            }

            return val
        }

        Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 1, this.length)
            return this[offset]
        }

        Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 2, this.length)
            return this[offset] | (this[offset + 1] << 8)
        }

        Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 2, this.length)
            return (this[offset] << 8) | this[offset + 1]
        }

        Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 4, this.length)

            return ((this[offset]) |
                    (this[offset + 1] << 8) |
                    (this[offset + 2] << 16)) +
                (this[offset + 3] * 0x1000000)
        }

        Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 4, this.length)

            return (this[offset] * 0x1000000) +
                ((this[offset + 1] << 16) |
                    (this[offset + 2] << 8) |
                    this[offset + 3])
        }

        Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
            offset = offset >>> 0
            byteLength = byteLength >>> 0
            if (!noAssert) checkOffset(offset, byteLength, this.length)

            var val = this[offset]
            var mul = 1
            var i = 0
            while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul
            }
            mul *= 0x80

            if (val >= mul) val -= Math.pow(2, 8 * byteLength)

            return val
        }

        Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
            offset = offset >>> 0
            byteLength = byteLength >>> 0
            if (!noAssert) checkOffset(offset, byteLength, this.length)

            var i = byteLength
            var mul = 1
            var val = this[offset + --i]
            while (i > 0 && (mul *= 0x100)) {
                val += this[offset + --i] * mul
            }
            mul *= 0x80

            if (val >= mul) val -= Math.pow(2, 8 * byteLength)

            return val
        }

        Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 1, this.length)
            if (!(this[offset] & 0x80)) return (this[offset])
            return ((0xff - this[offset] + 1) * -1)
        }

        Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 2, this.length)
            var val = this[offset] | (this[offset + 1] << 8)
            return (val & 0x8000) ? val | 0xFFFF0000 : val
        }

        Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 2, this.length)
            var val = this[offset + 1] | (this[offset] << 8)
            return (val & 0x8000) ? val | 0xFFFF0000 : val
        }

        Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 4, this.length)

            return (this[offset]) |
                (this[offset + 1] << 8) |
                (this[offset + 2] << 16) |
                (this[offset + 3] << 24)
        }

        Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 4, this.length)

            return (this[offset] << 24) |
                (this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                (this[offset + 3])
        }

        Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 4, this.length)
            return ieee754.read(this, offset, true, 23, 4)
        }

        Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 4, this.length)
            return ieee754.read(this, offset, false, 23, 4)
        }

        Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 8, this.length)
            return ieee754.read(this, offset, true, 52, 8)
        }

        Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
            offset = offset >>> 0
            if (!noAssert) checkOffset(offset, 8, this.length)
            return ieee754.read(this, offset, false, 52, 8)
        }

        function checkInt(buf, value, offset, ext, max, min) {
            if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
            if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
            if (offset + ext > buf.length) throw new RangeError('Index out of range')
        }

        Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
            value = +value
            offset = offset >>> 0
            byteLength = byteLength >>> 0
            if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1
                checkInt(this, value, offset, byteLength, maxBytes, 0)
            }

            var mul = 1
            var i = 0
            this[offset] = value & 0xFF
            while (++i < byteLength && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF
            }

            return offset + byteLength
        }

        Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
            value = +value
            offset = offset >>> 0
            byteLength = byteLength >>> 0
            if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1
                checkInt(this, value, offset, byteLength, maxBytes, 0)
            }

            var i = byteLength - 1
            var mul = 1
            this[offset + i] = value & 0xFF
            while (--i >= 0 && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF
            }

            return offset + byteLength
        }

        Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
            this[offset] = (value & 0xff)
            return offset + 1
        }

        Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
            this[offset] = (value & 0xff)
            this[offset + 1] = (value >>> 8)
            return offset + 2
        }

        Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
            this[offset] = (value >>> 8)
            this[offset + 1] = (value & 0xff)
            return offset + 2
        }

        Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
            this[offset + 3] = (value >>> 24)
            this[offset + 2] = (value >>> 16)
            this[offset + 1] = (value >>> 8)
            this[offset] = (value & 0xff)
            return offset + 4
        }

        Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
            this[offset] = (value >>> 24)
            this[offset + 1] = (value >>> 16)
            this[offset + 2] = (value >>> 8)
            this[offset + 3] = (value & 0xff)
            return offset + 4
        }

        Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) {
                var limit = Math.pow(2, (8 * byteLength) - 1)

                checkInt(this, value, offset, byteLength, limit - 1, -limit)
            }

            var i = 0
            var mul = 1
            var sub = 0
            this[offset] = value & 0xFF
            while (++i < byteLength && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                    sub = 1
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
            }

            return offset + byteLength
        }

        Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) {
                var limit = Math.pow(2, (8 * byteLength) - 1)

                checkInt(this, value, offset, byteLength, limit - 1, -limit)
            }

            var i = byteLength - 1
            var mul = 1
            var sub = 0
            this[offset + i] = value & 0xFF
            while (--i >= 0 && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                    sub = 1
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
            }

            return offset + byteLength
        }

        Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
            if (value < 0) value = 0xff + value + 1
            this[offset] = (value & 0xff)
            return offset + 1
        }

        Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
            this[offset] = (value & 0xff)
            this[offset + 1] = (value >>> 8)
            return offset + 2
        }

        Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
            this[offset] = (value >>> 8)
            this[offset + 1] = (value & 0xff)
            return offset + 2
        }

        Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
            this[offset] = (value & 0xff)
            this[offset + 1] = (value >>> 8)
            this[offset + 2] = (value >>> 16)
            this[offset + 3] = (value >>> 24)
            return offset + 4
        }

        Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
            if (value < 0) value = 0xffffffff + value + 1
            this[offset] = (value >>> 24)
            this[offset + 1] = (value >>> 16)
            this[offset + 2] = (value >>> 8)
            this[offset + 3] = (value & 0xff)
            return offset + 4
        }

        function checkIEEE754(buf, value, offset, ext, max, min) {
            if (offset + ext > buf.length) throw new RangeError('Index out of range')
            if (offset < 0) throw new RangeError('Index out of range')
        }

        function writeFloat(buf, value, offset, littleEndian, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) {
                checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
            }
            ieee754.write(buf, value, offset, littleEndian, 23, 4)
            return offset + 4
        }

        Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
            return writeFloat(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
            return writeFloat(this, value, offset, false, noAssert)
        }

        function writeDouble(buf, value, offset, littleEndian, noAssert) {
            value = +value
            offset = offset >>> 0
            if (!noAssert) {
                checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
            }
            ieee754.write(buf, value, offset, littleEndian, 52, 8)
            return offset + 8
        }

        Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
            return writeDouble(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
            return writeDouble(this, value, offset, false, noAssert)
        }

        // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
        Buffer.prototype.copy = function copy(target, targetStart, start, end) {
            if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
            if (!start) start = 0
            if (!end && end !== 0) end = this.length
            if (targetStart >= target.length) targetStart = target.length
            if (!targetStart) targetStart = 0
            if (end > 0 && end < start) end = start

            // Copy 0 bytes; we're done
            if (end === start) return 0
            if (target.length === 0 || this.length === 0) return 0

            // Fatal error conditions
            if (targetStart < 0) {
                throw new RangeError('targetStart out of bounds')
            }
            if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
            if (end < 0) throw new RangeError('sourceEnd out of bounds')

            // Are we oob?
            if (end > this.length) end = this.length
            if (target.length - targetStart < end - start) {
                end = target.length - targetStart + start
            }

            var len = end - start

            if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
                // Use built-in when available, missing from IE11
                this.copyWithin(targetStart, start, end)
            } else if (this === target && start < targetStart && targetStart < end) {
                // descending copy from end
                for (var i = len - 1; i >= 0; --i) {
                    target[i + targetStart] = this[i + start]
                }
            } else {
                Uint8Array.prototype.set.call(
                    target,
                    this.subarray(start, end),
                    targetStart
                )
            }

            return len
        }

        // Usage:
        //    buffer.fill(number[, offset[, end]])
        //    buffer.fill(buffer[, offset[, end]])
        //    buffer.fill(string[, offset[, end]][, encoding])
        Buffer.prototype.fill = function fill(val, start, end, encoding) {
            // Handle string cases:
            if (typeof val === 'string') {
                if (typeof start === 'string') {
                    encoding = start
                    start = 0
                    end = this.length
                } else if (typeof end === 'string') {
                    encoding = end
                    end = this.length
                }
                if (encoding !== undefined && typeof encoding !== 'string') {
                    throw new TypeError('encoding must be a string')
                }
                if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                    throw new TypeError('Unknown encoding: ' + encoding)
                }
                if (val.length === 1) {
                    var code = val.charCodeAt(0)
                    if ((encoding === 'utf8' && code < 128) ||
                        encoding === 'latin1') {
                        // Fast path: If `val` fits into a single byte, use that numeric value.
                        val = code
                    }
                }
            } else if (typeof val === 'number') {
                val = val & 255
            }

            // Invalid ranges are not set to a default, so can range check early.
            if (start < 0 || this.length < start || this.length < end) {
                throw new RangeError('Out of range index')
            }

            if (end <= start) {
                return this
            }

            start = start >>> 0
            end = end === undefined ? this.length : end >>> 0

            if (!val) val = 0

            var i
            if (typeof val === 'number') {
                for (i = start; i < end; ++i) {
                    this[i] = val
                }
            } else {
                var bytes = Buffer.isBuffer(val) ?
                    val :
                    Buffer.from(val, encoding)
                var len = bytes.length
                if (len === 0) {
                    throw new TypeError('The value "' + val +
                        '" is invalid for argument "value"')
                }
                for (i = 0; i < end - start; ++i) {
                    this[i + start] = bytes[i % len]
                }
            }

            return this
        }

        // HELPER FUNCTIONS
        // ================

        var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

        function base64clean(str) {
            // Node takes equal signs as end of the Base64 encoding
            str = str.split('=')[0]
                // Node strips out invalid characters like \n and \t from the string, base64-js does not
            str = str.trim().replace(INVALID_BASE64_RE, '')
                // Node converts strings with length < 2 to ''
            if (str.length < 2) return ''
                // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
            while (str.length % 4 !== 0) {
                str = str + '='
            }
            return str
        }

        function toHex(n) {
            if (n < 16) return '0' + n.toString(16)
            return n.toString(16)
        }

        function utf8ToBytes(string, units) {
            units = units || Infinity
            var codePoint
            var length = string.length
            var leadSurrogate = null
            var bytes = []

            for (var i = 0; i < length; ++i) {
                codePoint = string.charCodeAt(i)

                // is surrogate component
                if (codePoint > 0xD7FF && codePoint < 0xE000) {
                    // last char was a lead
                    if (!leadSurrogate) {
                        // no lead yet
                        if (codePoint > 0xDBFF) {
                            // unexpected trail
                            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                            continue
                        } else if (i + 1 === length) {
                            // unpaired lead
                            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                            continue
                        }

                        // valid lead
                        leadSurrogate = codePoint

                        continue
                    }

                    // 2 leads in a row
                    if (codePoint < 0xDC00) {
                        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                        leadSurrogate = codePoint
                        continue
                    }

                    // valid surrogate pair
                    codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
                } else if (leadSurrogate) {
                    // valid bmp char, but last char was a lead
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                }

                leadSurrogate = null

                // encode utf8
                if (codePoint < 0x80) {
                    if ((units -= 1) < 0) break
                    bytes.push(codePoint)
                } else if (codePoint < 0x800) {
                    if ((units -= 2) < 0) break
                    bytes.push(
                        codePoint >> 0x6 | 0xC0,
                        codePoint & 0x3F | 0x80
                    )
                } else if (codePoint < 0x10000) {
                    if ((units -= 3) < 0) break
                    bytes.push(
                        codePoint >> 0xC | 0xE0,
                        codePoint >> 0x6 & 0x3F | 0x80,
                        codePoint & 0x3F | 0x80
                    )
                } else if (codePoint < 0x110000) {
                    if ((units -= 4) < 0) break
                    bytes.push(
                        codePoint >> 0x12 | 0xF0,
                        codePoint >> 0xC & 0x3F | 0x80,
                        codePoint >> 0x6 & 0x3F | 0x80,
                        codePoint & 0x3F | 0x80
                    )
                } else {
                    throw new Error('Invalid code point')
                }
            }

            return bytes
        }

        function asciiToBytes(str) {
            var byteArray = []
            for (var i = 0; i < str.length; ++i) {
                // Node's code seems to be doing this and not & 0x7F..
                byteArray.push(str.charCodeAt(i) & 0xFF)
            }
            return byteArray
        }

        function utf16leToBytes(str, units) {
            var c, hi, lo
            var byteArray = []
            for (var i = 0; i < str.length; ++i) {
                if ((units -= 2) < 0) break

                c = str.charCodeAt(i)
                hi = c >> 8
                lo = c % 256
                byteArray.push(lo)
                byteArray.push(hi)
            }

            return byteArray
        }

        function base64ToBytes(str) {
            return base64.toByteArray(base64clean(str))
        }

        function blitBuffer(src, dst, offset, length) {
            for (var i = 0; i < length; ++i) {
                if ((i + offset >= dst.length) || (i >= src.length)) break
                dst[i + offset] = src[i]
            }
            return i
        }

        // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
        // the `instanceof` check but they should be treated as of that type.
        // See: https://github.com/feross/buffer/issues/166
        function isInstance(obj, type) {
            return obj instanceof type ||
                (obj != null && obj.constructor != null && obj.constructor.name != null &&
                    obj.constructor.name === type.name)
        }

        function numberIsNaN(obj) {
            // For IE11 support
            return obj !== obj // eslint-disable-line no-self-compare
        }

    }, { "base64-js": 57, "ieee754": 64 }],
    62: [function(require, module, exports) {
        (function(Buffer) {
            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.

            // NOTE: These type checking functions intentionally don't use `instanceof`
            // because it is fragile and can be easily faked with `Object.create()`.

            function isArray(arg) {
                if (Array.isArray) {
                    return Array.isArray(arg);
                }
                return objectToString(arg) === '[object Array]';
            }
            exports.isArray = isArray;

            function isBoolean(arg) {
                return typeof arg === 'boolean';
            }
            exports.isBoolean = isBoolean;

            function isNull(arg) {
                return arg === null;
            }
            exports.isNull = isNull;

            function isNullOrUndefined(arg) {
                return arg == null;
            }
            exports.isNullOrUndefined = isNullOrUndefined;

            function isNumber(arg) {
                return typeof arg === 'number';
            }
            exports.isNumber = isNumber;

            function isString(arg) {
                return typeof arg === 'string';
            }
            exports.isString = isString;

            function isSymbol(arg) {
                return typeof arg === 'symbol';
            }
            exports.isSymbol = isSymbol;

            function isUndefined(arg) {
                return arg === void 0;
            }
            exports.isUndefined = isUndefined;

            function isRegExp(re) {
                return objectToString(re) === '[object RegExp]';
            }
            exports.isRegExp = isRegExp;

            function isObject(arg) {
                return typeof arg === 'object' && arg !== null;
            }
            exports.isObject = isObject;

            function isDate(d) {
                return objectToString(d) === '[object Date]';
            }
            exports.isDate = isDate;

            function isError(e) {
                return (objectToString(e) === '[object Error]' || e instanceof Error);
            }
            exports.isError = isError;

            function isFunction(arg) {
                return typeof arg === 'function';
            }
            exports.isFunction = isFunction;

            function isPrimitive(arg) {
                return arg === null ||
                    typeof arg === 'boolean' ||
                    typeof arg === 'number' ||
                    typeof arg === 'string' ||
                    typeof arg === 'symbol' || // ES6 symbol
                    typeof arg === 'undefined';
            }
            exports.isPrimitive = isPrimitive;

            exports.isBuffer = Buffer.isBuffer;

            function objectToString(o) {
                return Object.prototype.toString.call(o);
            }

        }).call(this, { "isBuffer": require("../../is-buffer/index.js") })
    }, { "../../is-buffer/index.js": 66 }],
    63: [function(require, module, exports) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        var objectCreate = Object.create || objectCreatePolyfill
        var objectKeys = Object.keys || objectKeysPolyfill
        var bind = Function.prototype.bind || functionBindPolyfill

        function EventEmitter() {
            if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
                this._events = objectCreate(null);
                this._eventsCount = 0;
            }

            this._maxListeners = this._maxListeners || undefined;
        }
        module.exports = EventEmitter;

        // Backwards-compat with node 0.10.x
        EventEmitter.EventEmitter = EventEmitter;

        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._maxListeners = undefined;

        // By default EventEmitters will print a warning if more than 10 listeners are
        // added to it. This is a useful default which helps finding memory leaks.
        var defaultMaxListeners = 10;

        var hasDefineProperty;
        try {
            var o = {};
            if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
            hasDefineProperty = o.x === 0;
        } catch (err) { hasDefineProperty = false }
        if (hasDefineProperty) {
            Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
                enumerable: true,
                get: function() {
                    return defaultMaxListeners;
                },
                set: function(arg) {
                    // check whether the input is a positive number (whose value is zero or
                    // greater and not a NaN).
                    if (typeof arg !== 'number' || arg < 0 || arg !== arg)
                        throw new TypeError('"defaultMaxListeners" must be a positive number');
                    defaultMaxListeners = arg;
                }
            });
        } else {
            EventEmitter.defaultMaxListeners = defaultMaxListeners;
        }

        // Obviously not all Emitters should be limited to 10. This function allows
        // that to be increased. Set to zero for unlimited.
        EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
            if (typeof n !== 'number' || n < 0 || isNaN(n))
                throw new TypeError('"n" argument must be a positive number');
            this._maxListeners = n;
            return this;
        };

        function $getMaxListeners(that) {
            if (that._maxListeners === undefined)
                return EventEmitter.defaultMaxListeners;
            return that._maxListeners;
        }

        EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
            return $getMaxListeners(this);
        };

        // These standalone emit* functions are used to optimize calling of event
        // handlers for fast cases because emit() itself often has a variable number of
        // arguments and can be deoptimized because of that. These functions always have
        // the same number of arguments and thus do not get deoptimized, so the code
        // inside them can execute faster.
        function emitNone(handler, isFn, self) {
            if (isFn)
                handler.call(self);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self);
            }
        }

        function emitOne(handler, isFn, self, arg1) {
            if (isFn)
                handler.call(self, arg1);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self, arg1);
            }
        }

        function emitTwo(handler, isFn, self, arg1, arg2) {
            if (isFn)
                handler.call(self, arg1, arg2);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self, arg1, arg2);
            }
        }

        function emitThree(handler, isFn, self, arg1, arg2, arg3) {
            if (isFn)
                handler.call(self, arg1, arg2, arg3);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].call(self, arg1, arg2, arg3);
            }
        }

        function emitMany(handler, isFn, self, args) {
            if (isFn)
                handler.apply(self, args);
            else {
                var len = handler.length;
                var listeners = arrayClone(handler, len);
                for (var i = 0; i < len; ++i)
                    listeners[i].apply(self, args);
            }
        }

        EventEmitter.prototype.emit = function emit(type) {
            var er, handler, len, args, i, events;
            var doError = (type === 'error');

            events = this._events;
            if (events)
                doError = (doError && events.error == null);
            else if (!doError)
                return false;

            // If there is no 'error' event listener then throw.
            if (doError) {
                if (arguments.length > 1)
                    er = arguments[1];
                if (er instanceof Error) {
                    throw er; // Unhandled 'error' event
                } else {
                    // At least give some kind of context to the user
                    var err = new Error('Unhandled "error" event. (' + er + ')');
                    err.context = er;
                    throw err;
                }
                return false;
            }

            handler = events[type];

            if (!handler)
                return false;

            var isFn = typeof handler === 'function';
            len = arguments.length;
            switch (len) {
                // fast cases
                case 1:
                    emitNone(handler, isFn, this);
                    break;
                case 2:
                    emitOne(handler, isFn, this, arguments[1]);
                    break;
                case 3:
                    emitTwo(handler, isFn, this, arguments[1], arguments[2]);
                    break;
                case 4:
                    emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
                    break;
                    // slower
                default:
                    args = new Array(len - 1);
                    for (i = 1; i < len; i++)
                        args[i - 1] = arguments[i];
                    emitMany(handler, isFn, this, args);
            }

            return true;
        };

        function _addListener(target, type, listener, prepend) {
            var m;
            var events;
            var existing;

            if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');

            events = target._events;
            if (!events) {
                events = target._events = objectCreate(null);
                target._eventsCount = 0;
            } else {
                // To avoid recursion in the case that type === "newListener"! Before
                // adding it to the listeners, first emit "newListener".
                if (events.newListener) {
                    target.emit('newListener', type,
                        listener.listener ? listener.listener : listener);

                    // Re-assign `events` because a newListener handler could have caused the
                    // this._events to be assigned to a new object
                    events = target._events;
                }
                existing = events[type];
            }

            if (!existing) {
                // Optimize the case of one listener. Don't need the extra array object.
                existing = events[type] = listener;
                ++target._eventsCount;
            } else {
                if (typeof existing === 'function') {
                    // Adding the second element, need to change to array.
                    existing = events[type] =
                        prepend ? [listener, existing] : [existing, listener];
                } else {
                    // If we've already got an array, just append.
                    if (prepend) {
                        existing.unshift(listener);
                    } else {
                        existing.push(listener);
                    }
                }

                // Check for listener leak
                if (!existing.warned) {
                    m = $getMaxListeners(target);
                    if (m && m > 0 && existing.length > m) {
                        existing.warned = true;
                        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' "' + String(type) + '" listeners ' +
                            'added. Use emitter.setMaxListeners() to ' +
                            'increase limit.');
                        w.name = 'MaxListenersExceededWarning';
                        w.emitter = target;
                        w.type = type;
                        w.count = existing.length;
                        if (typeof console === 'object' && console.warn) {
                            console.warn('%s: %s', w.name, w.message);
                        }
                    }
                }
            }

            return target;
        }

        EventEmitter.prototype.addListener = function addListener(type, listener) {
            return _addListener(this, type, listener, false);
        };

        EventEmitter.prototype.on = EventEmitter.prototype.addListener;

        EventEmitter.prototype.prependListener =
            function prependListener(type, listener) {
                return _addListener(this, type, listener, true);
            };

        function onceWrapper() {
            if (!this.fired) {
                this.target.removeListener(this.type, this.wrapFn);
                this.fired = true;
                switch (arguments.length) {
                    case 0:
                        return this.listener.call(this.target);
                    case 1:
                        return this.listener.call(this.target, arguments[0]);
                    case 2:
                        return this.listener.call(this.target, arguments[0], arguments[1]);
                    case 3:
                        return this.listener.call(this.target, arguments[0], arguments[1],
                            arguments[2]);
                    default:
                        var args = new Array(arguments.length);
                        for (var i = 0; i < args.length; ++i)
                            args[i] = arguments[i];
                        this.listener.apply(this.target, args);
                }
            }
        }

        function _onceWrap(target, type, listener) {
            var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
            var wrapped = bind.call(onceWrapper, state);
            wrapped.listener = listener;
            state.wrapFn = wrapped;
            return wrapped;
        }

        EventEmitter.prototype.once = function once(type, listener) {
            if (typeof listener !== 'function')
                throw new TypeError('"listener" argument must be a function');
            this.on(type, _onceWrap(this, type, listener));
            return this;
        };

        EventEmitter.prototype.prependOnceListener =
            function prependOnceListener(type, listener) {
                if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');
                this.prependListener(type, _onceWrap(this, type, listener));
                return this;
            };

        // Emits a 'removeListener' event if and only if the listener was removed.
        EventEmitter.prototype.removeListener =
            function removeListener(type, listener) {
                var list, events, position, i, originalListener;

                if (typeof listener !== 'function')
                    throw new TypeError('"listener" argument must be a function');

                events = this._events;
                if (!events)
                    return this;

                list = events[type];
                if (!list)
                    return this;

                if (list === listener || list.listener === listener) {
                    if (--this._eventsCount === 0)
                        this._events = objectCreate(null);
                    else {
                        delete events[type];
                        if (events.removeListener)
                            this.emit('removeListener', type, list.listener || listener);
                    }
                } else if (typeof list !== 'function') {
                    position = -1;

                    for (i = list.length - 1; i >= 0; i--) {
                        if (list[i] === listener || list[i].listener === listener) {
                            originalListener = list[i].listener;
                            position = i;
                            break;
                        }
                    }

                    if (position < 0)
                        return this;

                    if (position === 0)
                        list.shift();
                    else
                        spliceOne(list, position);

                    if (list.length === 1)
                        events[type] = list[0];

                    if (events.removeListener)
                        this.emit('removeListener', type, originalListener || listener);
                }

                return this;
            };

        EventEmitter.prototype.removeAllListeners =
            function removeAllListeners(type) {
                var listeners, events, i;

                events = this._events;
                if (!events)
                    return this;

                // not listening for removeListener, no need to emit
                if (!events.removeListener) {
                    if (arguments.length === 0) {
                        this._events = objectCreate(null);
                        this._eventsCount = 0;
                    } else if (events[type]) {
                        if (--this._eventsCount === 0)
                            this._events = objectCreate(null);
                        else
                            delete events[type];
                    }
                    return this;
                }

                // emit removeListener for all listeners on all events
                if (arguments.length === 0) {
                    var keys = objectKeys(events);
                    var key;
                    for (i = 0; i < keys.length; ++i) {
                        key = keys[i];
                        if (key === 'removeListener') continue;
                        this.removeAllListeners(key);
                    }
                    this.removeAllListeners('removeListener');
                    this._events = objectCreate(null);
                    this._eventsCount = 0;
                    return this;
                }

                listeners = events[type];

                if (typeof listeners === 'function') {
                    this.removeListener(type, listeners);
                } else if (listeners) {
                    // LIFO order
                    for (i = listeners.length - 1; i >= 0; i--) {
                        this.removeListener(type, listeners[i]);
                    }
                }

                return this;
            };

        function _listeners(target, type, unwrap) {
            var events = target._events;

            if (!events)
                return [];

            var evlistener = events[type];
            if (!evlistener)
                return [];

            if (typeof evlistener === 'function')
                return unwrap ? [evlistener.listener || evlistener] : [evlistener];

            return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
        }

        EventEmitter.prototype.listeners = function listeners(type) {
            return _listeners(this, type, true);
        };

        EventEmitter.prototype.rawListeners = function rawListeners(type) {
            return _listeners(this, type, false);
        };

        EventEmitter.listenerCount = function(emitter, type) {
            if (typeof emitter.listenerCount === 'function') {
                return emitter.listenerCount(type);
            } else {
                return listenerCount.call(emitter, type);
            }
        };

        EventEmitter.prototype.listenerCount = listenerCount;

        function listenerCount(type) {
            var events = this._events;

            if (events) {
                var evlistener = events[type];

                if (typeof evlistener === 'function') {
                    return 1;
                } else if (evlistener) {
                    return evlistener.length;
                }
            }

            return 0;
        }

        EventEmitter.prototype.eventNames = function eventNames() {
            return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
        };

        // About 1.5x faster than the two-arg version of Array#splice().
        function spliceOne(list, index) {
            for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
                list[i] = list[k];
            list.pop();
        }

        function arrayClone(arr, n) {
            var copy = new Array(n);
            for (var i = 0; i < n; ++i)
                copy[i] = arr[i];
            return copy;
        }

        function unwrapListeners(arr) {
            var ret = new Array(arr.length);
            for (var i = 0; i < ret.length; ++i) {
                ret[i] = arr[i].listener || arr[i];
            }
            return ret;
        }

        function objectCreatePolyfill(proto) {
            var F = function() {};
            F.prototype = proto;
            return new F;
        }

        function objectKeysPolyfill(obj) {
            var keys = [];
            for (var k in obj)
                if (Object.prototype.hasOwnProperty.call(obj, k)) {
                    keys.push(k);
                }
            return k;
        }

        function functionBindPolyfill(context) {
            var fn = this;
            return function() {
                return fn.apply(context, arguments);
            };
        }

    }, {}],
    64: [function(require, module, exports) {
        exports.read = function(buffer, offset, isLE, mLen, nBytes) {
            var e, m
            var eLen = (nBytes * 8) - mLen - 1
            var eMax = (1 << eLen) - 1
            var eBias = eMax >> 1
            var nBits = -7
            var i = isLE ? (nBytes - 1) : 0
            var d = isLE ? -1 : 1
            var s = buffer[offset + i]

            i += d

            e = s & ((1 << (-nBits)) - 1)
            s >>= (-nBits)
            nBits += eLen
            for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

            m = e & ((1 << (-nBits)) - 1)
            e >>= (-nBits)
            nBits += mLen
            for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

            if (e === 0) {
                e = 1 - eBias
            } else if (e === eMax) {
                return m ? NaN : ((s ? -1 : 1) * Infinity)
            } else {
                m = m + Math.pow(2, mLen)
                e = e - eBias
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
        }

        exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
            var e, m, c
            var eLen = (nBytes * 8) - mLen - 1
            var eMax = (1 << eLen) - 1
            var eBias = eMax >> 1
            var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
            var i = isLE ? 0 : (nBytes - 1)
            var d = isLE ? 1 : -1
            var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

            value = Math.abs(value)

            if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0
                e = eMax
            } else {
                e = Math.floor(Math.log(value) / Math.LN2)
                if (value * (c = Math.pow(2, -e)) < 1) {
                    e--
                    c *= 2
                }
                if (e + eBias >= 1) {
                    value += rt / c
                } else {
                    value += rt * Math.pow(2, 1 - eBias)
                }
                if (value * c >= 2) {
                    e++
                    c /= 2
                }

                if (e + eBias >= eMax) {
                    m = 0
                    e = eMax
                } else if (e + eBias >= 1) {
                    m = ((value * c) - 1) * Math.pow(2, mLen)
                    e = e + eBias
                } else {
                    m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
                    e = 0
                }
            }

            for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

            e = (e << mLen) | m
            eLen += mLen
            for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

            buffer[offset + i - d] |= s * 128
        }

    }, {}],
    65: [function(require, module, exports) {
        arguments[4][54][0].apply(exports, arguments)
    }, { "dup": 54 }],
    66: [function(require, module, exports) {
        /*!
         * Determine if an object is a Buffer
         *
         * @author   Feross Aboukhadijeh <https://feross.org>
         * @license  MIT
         */

        // The _isBuffer check is for Safari 5-7 support, because it's missing
        // Object.prototype.constructor. Remove this eventually
        module.exports = function(obj) {
            return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
        }

        function isBuffer(obj) {
            return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
        }

        // For Node v0.10 support. Remove this eventually.
        function isSlowBuffer(obj) {
            return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
        }

    }, {}],
    67: [function(require, module, exports) {
        var toString = {}.toString;

        module.exports = Array.isArray || function(arr) {
            return toString.call(arr) == '[object Array]';
        };

    }, {}],
    68: [function(require, module, exports) {
        'use strict';


        var TYPED_OK = (typeof Uint8Array !== 'undefined') &&
            (typeof Uint16Array !== 'undefined') &&
            (typeof Int32Array !== 'undefined');

        function _has(obj, key) {
            return Object.prototype.hasOwnProperty.call(obj, key);
        }

        exports.assign = function(obj /*from1, from2, from3, ...*/ ) {
            var sources = Array.prototype.slice.call(arguments, 1);
            while (sources.length) {
                var source = sources.shift();
                if (!source) { continue; }

                if (typeof source !== 'object') {
                    throw new TypeError(source + 'must be non-object');
                }

                for (var p in source) {
                    if (_has(source, p)) {
                        obj[p] = source[p];
                    }
                }
            }

            return obj;
        };


        // reduce buffer size, avoiding mem copy
        exports.shrinkBuf = function(buf, size) {
            if (buf.length === size) { return buf; }
            if (buf.subarray) { return buf.subarray(0, size); }
            buf.length = size;
            return buf;
        };


        var fnTyped = {
            arraySet: function(dest, src, src_offs, len, dest_offs) {
                if (src.subarray && dest.subarray) {
                    dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
                    return;
                }
                // Fallback to ordinary array
                for (var i = 0; i < len; i++) {
                    dest[dest_offs + i] = src[src_offs + i];
                }
            },
            // Join array of chunks to single array.
            flattenChunks: function(chunks) {
                var i, l, len, pos, chunk, result;

                // calculate data length
                len = 0;
                for (i = 0, l = chunks.length; i < l; i++) {
                    len += chunks[i].length;
                }

                // join chunks
                result = new Uint8Array(len);
                pos = 0;
                for (i = 0, l = chunks.length; i < l; i++) {
                    chunk = chunks[i];
                    result.set(chunk, pos);
                    pos += chunk.length;
                }

                return result;
            }
        };

        var fnUntyped = {
            arraySet: function(dest, src, src_offs, len, dest_offs) {
                for (var i = 0; i < len; i++) {
                    dest[dest_offs + i] = src[src_offs + i];
                }
            },
            // Join array of chunks to single array.
            flattenChunks: function(chunks) {
                return [].concat.apply([], chunks);
            }
        };


        // Enable/Disable typed arrays use, for testing
        //
        exports.setTyped = function(on) {
            if (on) {
                exports.Buf8 = Uint8Array;
                exports.Buf16 = Uint16Array;
                exports.Buf32 = Int32Array;
                exports.assign(exports, fnTyped);
            } else {
                exports.Buf8 = Array;
                exports.Buf16 = Array;
                exports.Buf32 = Array;
                exports.assign(exports, fnUntyped);
            }
        };

        exports.setTyped(TYPED_OK);

    }, {}],
    69: [function(require, module, exports) {
        'use strict';

        // Note: adler32 takes 12% for level 0 and 2% for level 6.
        // It isn't worth it to make additional optimizations as in original.
        // Small size is preferable.

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        function adler32(adler, buf, len, pos) {
            var s1 = (adler & 0xffff) | 0,
                s2 = ((adler >>> 16) & 0xffff) | 0,
                n = 0;

            while (len !== 0) {
                // Set limit ~ twice less than 5552, to keep
                // s2 in 31-bits, because we force signed ints.
                // in other case %= will fail.
                n = len > 2000 ? 2000 : len;
                len -= n;

                do {
                    s1 = (s1 + buf[pos++]) | 0;
                    s2 = (s2 + s1) | 0;
                } while (--n);

                s1 %= 65521;
                s2 %= 65521;
            }

            return (s1 | (s2 << 16)) | 0;
        }


        module.exports = adler32;

    }, {}],
    70: [function(require, module, exports) {
        'use strict';

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        module.exports = {

            /* Allowed flush values; see deflate() and inflate() below for details */
            Z_NO_FLUSH: 0,
            Z_PARTIAL_FLUSH: 1,
            Z_SYNC_FLUSH: 2,
            Z_FULL_FLUSH: 3,
            Z_FINISH: 4,
            Z_BLOCK: 5,
            Z_TREES: 6,

            /* Return codes for the compression/decompression functions. Negative values
             * are errors, positive values are used for special but normal events.
             */
            Z_OK: 0,
            Z_STREAM_END: 1,
            Z_NEED_DICT: 2,
            Z_ERRNO: -1,
            Z_STREAM_ERROR: -2,
            Z_DATA_ERROR: -3,
            //Z_MEM_ERROR:     -4,
            Z_BUF_ERROR: -5,
            //Z_VERSION_ERROR: -6,

            /* compression levels */
            Z_NO_COMPRESSION: 0,
            Z_BEST_SPEED: 1,
            Z_BEST_COMPRESSION: 9,
            Z_DEFAULT_COMPRESSION: -1,


            Z_FILTERED: 1,
            Z_HUFFMAN_ONLY: 2,
            Z_RLE: 3,
            Z_FIXED: 4,
            Z_DEFAULT_STRATEGY: 0,

            /* Possible values of the data_type field (though see inflate()) */
            Z_BINARY: 0,
            Z_TEXT: 1,
            //Z_ASCII:                1, // = Z_TEXT (deprecated)
            Z_UNKNOWN: 2,

            /* The deflate compression method */
            Z_DEFLATED: 8
                //Z_NULL:                 null // Use -1 or null inline, depending on var type
        };

    }, {}],
    71: [function(require, module, exports) {
        'use strict';

        // Note: we can't get significant speed boost here.
        // So write code to minimize size - no pregenerated tables
        // and array tools dependencies.

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        // Use ordinary array, since untyped makes no boost here
        function makeTable() {
            var c, table = [];

            for (var n = 0; n < 256; n++) {
                c = n;
                for (var k = 0; k < 8; k++) {
                    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
                }
                table[n] = c;
            }

            return table;
        }

        // Create table on load. Just 255 signed longs. Not a problem.
        var crcTable = makeTable();


        function crc32(crc, buf, len, pos) {
            var t = crcTable,
                end = pos + len;

            crc ^= -1;

            for (var i = pos; i < end; i++) {
                crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
            }

            return (crc ^ (-1)); // >>> 0;
        }


        module.exports = crc32;

    }, {}],
    72: [function(require, module, exports) {
        'use strict';

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        var utils = require('../utils/common');
        var trees = require('./trees');
        var adler32 = require('./adler32');
        var crc32 = require('./crc32');
        var msg = require('./messages');

        /* Public constants ==========================================================*/
        /* ===========================================================================*/


        /* Allowed flush values; see deflate() and inflate() below for details */
        var Z_NO_FLUSH = 0;
        var Z_PARTIAL_FLUSH = 1;
        //var Z_SYNC_FLUSH    = 2;
        var Z_FULL_FLUSH = 3;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        //var Z_TREES         = 6;


        /* Return codes for the compression/decompression functions. Negative values
         * are errors, positive values are used for special but normal events.
         */
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        //var Z_NEED_DICT     = 2;
        //var Z_ERRNO         = -1;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        //var Z_MEM_ERROR     = -4;
        var Z_BUF_ERROR = -5;
        //var Z_VERSION_ERROR = -6;


        /* compression levels */
        //var Z_NO_COMPRESSION      = 0;
        //var Z_BEST_SPEED          = 1;
        //var Z_BEST_COMPRESSION    = 9;
        var Z_DEFAULT_COMPRESSION = -1;


        var Z_FILTERED = 1;
        var Z_HUFFMAN_ONLY = 2;
        var Z_RLE = 3;
        var Z_FIXED = 4;
        var Z_DEFAULT_STRATEGY = 0;

        /* Possible values of the data_type field (though see inflate()) */
        //var Z_BINARY              = 0;
        //var Z_TEXT                = 1;
        //var Z_ASCII               = 1; // = Z_TEXT
        var Z_UNKNOWN = 2;


        /* The deflate compression method */
        var Z_DEFLATED = 8;

        /*============================================================================*/


        var MAX_MEM_LEVEL = 9;
        /* Maximum value for memLevel in deflateInit2 */
        var MAX_WBITS = 15;
        /* 32K LZ77 window */
        var DEF_MEM_LEVEL = 8;


        var LENGTH_CODES = 29;
        /* number of length codes, not counting the special END_BLOCK code */
        var LITERALS = 256;
        /* number of literal bytes 0..255 */
        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        /* number of Literal or Length codes, including the END_BLOCK code */
        var D_CODES = 30;
        /* number of distance codes */
        var BL_CODES = 19;
        /* number of codes used to transfer the bit lengths */
        var HEAP_SIZE = 2 * L_CODES + 1;
        /* maximum heap size */
        var MAX_BITS = 15;
        /* All codes must not exceed MAX_BITS bits */

        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

        var PRESET_DICT = 0x20;

        var INIT_STATE = 42;
        var EXTRA_STATE = 69;
        var NAME_STATE = 73;
        var COMMENT_STATE = 91;
        var HCRC_STATE = 103;
        var BUSY_STATE = 113;
        var FINISH_STATE = 666;

        var BS_NEED_MORE = 1; /* block not completed, need more input or more output */
        var BS_BLOCK_DONE = 2; /* block flush performed */
        var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
        var BS_FINISH_DONE = 4; /* finish done, accept no more input or output */

        var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

        function err(strm, errorCode) {
            strm.msg = msg[errorCode];
            return errorCode;
        }

        function rank(f) {
            return ((f) << 1) - ((f) > 4 ? 9 : 0);
        }

        function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


        /* =========================================================================
         * Flush as much pending output as possible. All deflate() output goes
         * through this function so some applications may wish to modify it
         * to avoid allocating a large strm->output buffer and copying into it.
         * (See also read_buf()).
         */
        function flush_pending(strm) {
            var s = strm.state;

            //_tr_flush_bits(s);
            var len = s.pending;
            if (len > strm.avail_out) {
                len = strm.avail_out;
            }
            if (len === 0) { return; }

            utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
            strm.next_out += len;
            s.pending_out += len;
            strm.total_out += len;
            strm.avail_out -= len;
            s.pending -= len;
            if (s.pending === 0) {
                s.pending_out = 0;
            }
        }


        function flush_block_only(s, last) {
            trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
            s.block_start = s.strstart;
            flush_pending(s.strm);
        }


        function put_byte(s, b) {
            s.pending_buf[s.pending++] = b;
        }


        /* =========================================================================
         * Put a short in the pending buffer. The 16-bit value is put in MSB order.
         * IN assertion: the stream state is correct and there is enough room in
         * pending_buf.
         */
        function putShortMSB(s, b) {
            //  put_byte(s, (Byte)(b >> 8));
            //  put_byte(s, (Byte)(b & 0xff));
            s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
            s.pending_buf[s.pending++] = b & 0xff;
        }


        /* ===========================================================================
         * Read a new buffer from the current input stream, update the adler32
         * and total number of bytes read.  All deflate() input goes through
         * this function so some applications may wish to modify it to avoid
         * allocating a large strm->input buffer and copying from it.
         * (See also flush_pending()).
         */
        function read_buf(strm, buf, start, size) {
            var len = strm.avail_in;

            if (len > size) { len = size; }
            if (len === 0) { return 0; }

            strm.avail_in -= len;

            // zmemcpy(buf, strm->next_in, len);
            utils.arraySet(buf, strm.input, strm.next_in, len, start);
            if (strm.state.wrap === 1) {
                strm.adler = adler32(strm.adler, buf, len, start);
            } else if (strm.state.wrap === 2) {
                strm.adler = crc32(strm.adler, buf, len, start);
            }

            strm.next_in += len;
            strm.total_in += len;

            return len;
        }


        /* ===========================================================================
         * Set match_start to the longest match starting at the given string and
         * return its length. Matches shorter or equal to prev_length are discarded,
         * in which case the result is equal to prev_length and match_start is
         * garbage.
         * IN assertions: cur_match is the head of the hash chain for the current
         *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
         * OUT assertion: the match length is not greater than s->lookahead.
         */
        function longest_match(s, cur_match) {
            var chain_length = s.max_chain_length; /* max hash chain length */
            var scan = s.strstart; /* current string */
            var match; /* matched string */
            var len; /* length of current match */
            var best_len = s.prev_length; /* best match length so far */
            var nice_match = s.nice_match; /* stop if match long enough */
            var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
                s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0 /*NIL*/ ;

            var _win = s.window; // shortcut

            var wmask = s.w_mask;
            var prev = s.prev;

            /* Stop when cur_match becomes <= limit. To simplify the code,
             * we prevent matches with the string of window index 0.
             */

            var strend = s.strstart + MAX_MATCH;
            var scan_end1 = _win[scan + best_len - 1];
            var scan_end = _win[scan + best_len];

            /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
             * It is easy to get rid of this optimization if necessary.
             */
            // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

            /* Do not waste too much time if we already have a good match: */
            if (s.prev_length >= s.good_match) {
                chain_length >>= 2;
            }
            /* Do not look for matches beyond the end of the input. This is necessary
             * to make deflate deterministic.
             */
            if (nice_match > s.lookahead) { nice_match = s.lookahead; }

            // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

            do {
                // Assert(cur_match < s->strstart, "no future");
                match = cur_match;

                /* Skip to next match if the match length cannot increase
                 * or if the match length is less than 2.  Note that the checks below
                 * for insufficient lookahead only occur occasionally for performance
                 * reasons.  Therefore uninitialized memory will be accessed, and
                 * conditional jumps will be made that depend on those values.
                 * However the length of the match is limited to the lookahead, so
                 * the output of deflate is not affected by the uninitialized values.
                 */

                if (_win[match + best_len] !== scan_end ||
                    _win[match + best_len - 1] !== scan_end1 ||
                    _win[match] !== _win[scan] ||
                    _win[++match] !== _win[scan + 1]) {
                    continue;
                }

                /* The check at best_len-1 can be removed because it will be made
                 * again later. (This heuristic is not always a win.)
                 * It is not necessary to compare scan[2] and match[2] since they
                 * are always equal when the other bytes match, given that
                 * the hash keys are equal and that HASH_BITS >= 8.
                 */
                scan += 2;
                match++;
                // Assert(*scan == *match, "match[2]?");

                /* We check for insufficient lookahead only every 8th comparison;
                 * the 256th check will be made at strstart+258.
                 */
                do {
                    /*jshint noempty:false*/
                } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                    _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                    _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                    _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                    scan < strend);

                // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

                len = MAX_MATCH - (strend - scan);
                scan = strend - MAX_MATCH;

                if (len > best_len) {
                    s.match_start = cur_match;
                    best_len = len;
                    if (len >= nice_match) {
                        break;
                    }
                    scan_end1 = _win[scan + best_len - 1];
                    scan_end = _win[scan + best_len];
                }
            } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

            if (best_len <= s.lookahead) {
                return best_len;
            }
            return s.lookahead;
        }


        /* ===========================================================================
         * Fill the window when the lookahead becomes insufficient.
         * Updates strstart and lookahead.
         *
         * IN assertion: lookahead < MIN_LOOKAHEAD
         * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
         *    At least one byte has been read, or avail_in == 0; reads are
         *    performed for at least two bytes (required for the zip translate_eol
         *    option -- not supported here).
         */
        function fill_window(s) {
            var _w_size = s.w_size;
            var p, n, m, more, str;

            //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

            do {
                more = s.window_size - s.lookahead - s.strstart;

                // JS ints have 32 bit, block below not needed
                /* Deal with !@#$% 64K limit: */
                //if (sizeof(int) <= 2) {
                //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
                //        more = wsize;
                //
                //  } else if (more == (unsigned)(-1)) {
                //        /* Very unlikely, but possible on 16 bit machine if
                //         * strstart == 0 && lookahead == 1 (input done a byte at time)
                //         */
                //        more--;
                //    }
                //}


                /* If the window is almost full and there is insufficient lookahead,
                 * move the upper half to the lower one to make room in the upper half.
                 */
                if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

                    utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
                    s.match_start -= _w_size;
                    s.strstart -= _w_size;
                    /* we now have strstart >= MAX_DIST */
                    s.block_start -= _w_size;

                    /* Slide the hash table (could be avoided with 32 bit values
                     at the expense of memory usage). We slide even when level == 0
                     to keep the hash table consistent if we switch back to level > 0
                     later. (Using level 0 permanently is not an optimal usage of
                     zlib, so we don't care about this pathological case.)
                     */

                    n = s.hash_size;
                    p = n;
                    do {
                        m = s.head[--p];
                        s.head[p] = (m >= _w_size ? m - _w_size : 0);
                    } while (--n);

                    n = _w_size;
                    p = n;
                    do {
                        m = s.prev[--p];
                        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
                        /* If n is not on any hash chain, prev[n] is garbage but
                         * its value will never be used.
                         */
                    } while (--n);

                    more += _w_size;
                }
                if (s.strm.avail_in === 0) {
                    break;
                }

                /* If there was no sliding:
                 *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
                 *    more == window_size - lookahead - strstart
                 * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
                 * => more >= window_size - 2*WSIZE + 2
                 * In the BIG_MEM or MMAP case (not yet supported),
                 *   window_size == input_size + MIN_LOOKAHEAD  &&
                 *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
                 * Otherwise, window_size == 2*WSIZE so more >= 2.
                 * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
                 */
                //Assert(more >= 2, "more < 2");
                n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
                s.lookahead += n;

                /* Initialize the hash value now that we have some input: */
                if (s.lookahead + s.insert >= MIN_MATCH) {
                    str = s.strstart - s.insert;
                    s.ins_h = s.window[str];

                    /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
                    s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
                    //#if MIN_MATCH != 3
                    //        Call update_hash() MIN_MATCH-3 more times
                    //#endif
                    while (s.insert) {
                        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
                        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

                        s.prev[str & s.w_mask] = s.head[s.ins_h];
                        s.head[s.ins_h] = str;
                        str++;
                        s.insert--;
                        if (s.lookahead + s.insert < MIN_MATCH) {
                            break;
                        }
                    }
                }
                /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
                 * but this is not important since only literal bytes will be emitted.
                 */

            } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

            /* If the WIN_INIT bytes after the end of the current data have never been
             * written, then zero those bytes in order to avoid memory check reports of
             * the use of uninitialized (or uninitialised as Julian writes) bytes by
             * the longest match routines.  Update the high water mark for the next
             * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
             * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
             */
            //  if (s.high_water < s.window_size) {
            //    var curr = s.strstart + s.lookahead;
            //    var init = 0;
            //
            //    if (s.high_water < curr) {
            //      /* Previous high water mark below current data -- zero WIN_INIT
            //       * bytes or up to end of window, whichever is less.
            //       */
            //      init = s.window_size - curr;
            //      if (init > WIN_INIT)
            //        init = WIN_INIT;
            //      zmemzero(s->window + curr, (unsigned)init);
            //      s->high_water = curr + init;
            //    }
            //    else if (s->high_water < (ulg)curr + WIN_INIT) {
            //      /* High water mark at or above current data, but below current data
            //       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
            //       * to end of window, whichever is less.
            //       */
            //      init = (ulg)curr + WIN_INIT - s->high_water;
            //      if (init > s->window_size - s->high_water)
            //        init = s->window_size - s->high_water;
            //      zmemzero(s->window + s->high_water, (unsigned)init);
            //      s->high_water += init;
            //    }
            //  }
            //
            //  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
            //    "not enough room for search");
        }

        /* ===========================================================================
         * Copy without compression as much as possible from the input stream, return
         * the current block state.
         * This function does not insert new strings in the dictionary since
         * uncompressible data is probably not useful. This function is used
         * only for the level=0 compression option.
         * NOTE: this function should be optimized to avoid extra copying from
         * window to pending_buf.
         */
        function deflate_stored(s, flush) {
            /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
             * to pending_buf_size, and each stored block has a 5 byte header:
             */
            var max_block_size = 0xffff;

            if (max_block_size > s.pending_buf_size - 5) {
                max_block_size = s.pending_buf_size - 5;
            }

            /* Copy as much as possible from input to output: */
            for (;;) {
                /* Fill the window as much as possible: */
                if (s.lookahead <= 1) {

                    //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
                    //  s->block_start >= (long)s->w_size, "slide too late");
                    //      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
                    //        s.block_start >= s.w_size)) {
                    //        throw  new Error("slide too late");
                    //      }

                    fill_window(s);
                    if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
                        return BS_NEED_MORE;
                    }

                    if (s.lookahead === 0) {
                        break;
                    }
                    /* flush the current block */
                }
                //Assert(s->block_start >= 0L, "block gone");
                //    if (s.block_start < 0) throw new Error("block gone");

                s.strstart += s.lookahead;
                s.lookahead = 0;

                /* Emit a stored block if pending_buf will be full: */
                var max_start = s.block_start + max_block_size;

                if (s.strstart === 0 || s.strstart >= max_start) {
                    /* strstart == 0 is possible when wraparound on 16-bit machine */
                    s.lookahead = s.strstart - max_start;
                    s.strstart = max_start;
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/


                }
                /* Flush if we may have to slide, otherwise block_start may become
                 * negative and the data will be gone:
                 */
                if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/
                }
            }

            s.insert = 0;

            if (flush === Z_FINISH) {
                /*** FLUSH_BLOCK(s, 1); ***/
                flush_block_only(s, true);
                if (s.strm.avail_out === 0) {
                    return BS_FINISH_STARTED;
                }
                /***/
                return BS_FINISH_DONE;
            }

            if (s.strstart > s.block_start) {
                /*** FLUSH_BLOCK(s, 0); ***/
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                    return BS_NEED_MORE;
                }
                /***/
            }

            return BS_NEED_MORE;
        }

        /* ===========================================================================
         * Compress as much as possible from the input stream, return the current
         * block state.
         * This function does not perform lazy evaluation of matches and inserts
         * new strings in the dictionary only for unmatched strings or for short
         * matches. It is used only for the fast compression options.
         */
        function deflate_fast(s, flush) {
            var hash_head; /* head of the hash chain */
            var bflush; /* set if current block must be flushed */

            for (;;) {
                /* Make sure that we always have enough lookahead, except
                 * at the end of the input file. We need MAX_MATCH bytes
                 * for the next match, plus MIN_MATCH bytes to insert the
                 * string following the next match.
                 */
                if (s.lookahead < MIN_LOOKAHEAD) {
                    fill_window(s);
                    if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                        return BS_NEED_MORE;
                    }
                    if (s.lookahead === 0) {
                        break; /* flush the current block */
                    }
                }

                /* Insert the string window[strstart .. strstart+2] in the
                 * dictionary, and set hash_head to the head of the hash chain:
                 */
                hash_head = 0 /*NIL*/ ;
                if (s.lookahead >= MIN_MATCH) {
                    /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                    s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                    hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                    s.head[s.ins_h] = s.strstart;
                    /***/
                }

                /* Find the longest match, discarding those <= prev_length.
                 * At this point we have always match_length < MIN_MATCH
                 */
                if (hash_head !== 0 /*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
                    /* To simplify the code, we prevent matches with the string
                     * of window index 0 (in particular we have to avoid a match
                     * of the string with itself at the start of the input file).
                     */
                    s.match_length = longest_match(s, hash_head);
                    /* longest_match() sets match_start */
                }
                if (s.match_length >= MIN_MATCH) {
                    // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

                    /*** _tr_tally_dist(s, s.strstart - s.match_start,
                                   s.match_length - MIN_MATCH, bflush); ***/
                    bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

                    s.lookahead -= s.match_length;

                    /* Insert new strings in the hash table only if the match length
                     * is not too large. This saves time but degrades compression.
                     */
                    if (s.match_length <= s.max_lazy_match /*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
                        s.match_length--; /* string at strstart already in table */
                        do {
                            s.strstart++;
                            /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                            s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                            s.head[s.ins_h] = s.strstart;
                            /***/
                            /* strstart never exceeds WSIZE-MAX_MATCH, so there are
                             * always MIN_MATCH bytes ahead.
                             */
                        } while (--s.match_length !== 0);
                        s.strstart++;
                    } else {
                        s.strstart += s.match_length;
                        s.match_length = 0;
                        s.ins_h = s.window[s.strstart];
                        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
                        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

                        //#if MIN_MATCH != 3
                        //                Call UPDATE_HASH() MIN_MATCH-3 more times
                        //#endif
                        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
                         * matter since it will be recomputed at next deflate call.
                         */
                    }
                } else {
                    /* No match, output a literal byte */
                    //Tracevv((stderr,"%c", s.window[s.strstart]));
                    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
                    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

                    s.lookahead--;
                    s.strstart++;
                }
                if (bflush) {
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/
                }
            }
            s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
            if (flush === Z_FINISH) {
                /*** FLUSH_BLOCK(s, 1); ***/
                flush_block_only(s, true);
                if (s.strm.avail_out === 0) {
                    return BS_FINISH_STARTED;
                }
                /***/
                return BS_FINISH_DONE;
            }
            if (s.last_lit) {
                /*** FLUSH_BLOCK(s, 0); ***/
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                    return BS_NEED_MORE;
                }
                /***/
            }
            return BS_BLOCK_DONE;
        }

        /* ===========================================================================
         * Same as above, but achieves better compression. We use a lazy
         * evaluation for matches: a match is finally adopted only if there is
         * no better match at the next window position.
         */
        function deflate_slow(s, flush) {
            var hash_head; /* head of hash chain */
            var bflush; /* set if current block must be flushed */

            var max_insert;

            /* Process the input block. */
            for (;;) {
                /* Make sure that we always have enough lookahead, except
                 * at the end of the input file. We need MAX_MATCH bytes
                 * for the next match, plus MIN_MATCH bytes to insert the
                 * string following the next match.
                 */
                if (s.lookahead < MIN_LOOKAHEAD) {
                    fill_window(s);
                    if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                        return BS_NEED_MORE;
                    }
                    if (s.lookahead === 0) { break; } /* flush the current block */
                }

                /* Insert the string window[strstart .. strstart+2] in the
                 * dictionary, and set hash_head to the head of the hash chain:
                 */
                hash_head = 0 /*NIL*/ ;
                if (s.lookahead >= MIN_MATCH) {
                    /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                    s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                    hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                    s.head[s.ins_h] = s.strstart;
                    /***/
                }

                /* Find the longest match, discarding those <= prev_length.
                 */
                s.prev_length = s.match_length;
                s.prev_match = s.match_start;
                s.match_length = MIN_MATCH - 1;

                if (hash_head !== 0 /*NIL*/ && s.prev_length < s.max_lazy_match &&
                    s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD) /*MAX_DIST(s)*/ ) {
                    /* To simplify the code, we prevent matches with the string
                     * of window index 0 (in particular we have to avoid a match
                     * of the string with itself at the start of the input file).
                     */
                    s.match_length = longest_match(s, hash_head);
                    /* longest_match() sets match_start */

                    if (s.match_length <= 5 &&
                        (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096 /*TOO_FAR*/ ))) {

                        /* If prev_match is also MIN_MATCH, match_start is garbage
                         * but we will ignore the current match anyway.
                         */
                        s.match_length = MIN_MATCH - 1;
                    }
                }
                /* If there was a match at the previous step and the current
                 * match is not better, output the previous match:
                 */
                if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
                    max_insert = s.strstart + s.lookahead - MIN_MATCH;
                    /* Do not insert strings in hash table beyond this. */

                    //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

                    /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                                   s.prev_length - MIN_MATCH, bflush);***/
                    bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
                    /* Insert in hash table all strings up to the end of the match.
                     * strstart-1 and strstart are already inserted. If there is not
                     * enough lookahead, the last two strings are not inserted in
                     * the hash table.
                     */
                    s.lookahead -= s.prev_length - 1;
                    s.prev_length -= 2;
                    do {
                        if (++s.strstart <= max_insert) {
                            /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                            s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                            s.head[s.ins_h] = s.strstart;
                            /***/
                        }
                    } while (--s.prev_length !== 0);
                    s.match_available = 0;
                    s.match_length = MIN_MATCH - 1;
                    s.strstart++;

                    if (bflush) {
                        /*** FLUSH_BLOCK(s, 0); ***/
                        flush_block_only(s, false);
                        if (s.strm.avail_out === 0) {
                            return BS_NEED_MORE;
                        }
                        /***/
                    }

                } else if (s.match_available) {
                    /* If there was no match at the previous position, output a
                     * single literal. If there was a match but the current match
                     * is longer, truncate the previous match to a single literal.
                     */
                    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
                    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
                    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

                    if (bflush) {
                        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
                        flush_block_only(s, false);
                        /***/
                    }
                    s.strstart++;
                    s.lookahead--;
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                } else {
                    /* There is no previous match to compare with, wait for
                     * the next step to decide.
                     */
                    s.match_available = 1;
                    s.strstart++;
                    s.lookahead--;
                }
            }
            //Assert (flush != Z_NO_FLUSH, "no flush?");
            if (s.match_available) {
                //Tracevv((stderr,"%c", s->window[s->strstart-1]));
                /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
                bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

                s.match_available = 0;
            }
            s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
            if (flush === Z_FINISH) {
                /*** FLUSH_BLOCK(s, 1); ***/
                flush_block_only(s, true);
                if (s.strm.avail_out === 0) {
                    return BS_FINISH_STARTED;
                }
                /***/
                return BS_FINISH_DONE;
            }
            if (s.last_lit) {
                /*** FLUSH_BLOCK(s, 0); ***/
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                    return BS_NEED_MORE;
                }
                /***/
            }

            return BS_BLOCK_DONE;
        }


        /* ===========================================================================
         * For Z_RLE, simply look for runs of bytes, generate matches only of distance
         * one.  Do not maintain a hash table.  (It will be regenerated if this run of
         * deflate switches away from Z_RLE.)
         */
        function deflate_rle(s, flush) {
            var bflush; /* set if current block must be flushed */
            var prev; /* byte at distance one to match */
            var scan, strend; /* scan goes up to strend for length of run */

            var _win = s.window;

            for (;;) {
                /* Make sure that we always have enough lookahead, except
                 * at the end of the input file. We need MAX_MATCH bytes
                 * for the longest run, plus one for the unrolled loop.
                 */
                if (s.lookahead <= MAX_MATCH) {
                    fill_window(s);
                    if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
                        return BS_NEED_MORE;
                    }
                    if (s.lookahead === 0) { break; } /* flush the current block */
                }

                /* See how many times the previous byte repeats */
                s.match_length = 0;
                if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
                    scan = s.strstart - 1;
                    prev = _win[scan];
                    if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
                        strend = s.strstart + MAX_MATCH;
                        do {
                            /*jshint noempty:false*/
                        } while (prev === _win[++scan] && prev === _win[++scan] &&
                            prev === _win[++scan] && prev === _win[++scan] &&
                            prev === _win[++scan] && prev === _win[++scan] &&
                            prev === _win[++scan] && prev === _win[++scan] &&
                            scan < strend);
                        s.match_length = MAX_MATCH - (strend - scan);
                        if (s.match_length > s.lookahead) {
                            s.match_length = s.lookahead;
                        }
                    }
                    //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
                }

                /* Emit match if have run of MIN_MATCH or longer, else emit literal */
                if (s.match_length >= MIN_MATCH) {
                    //check_match(s, s.strstart, s.strstart - 1, s.match_length);

                    /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
                    bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

                    s.lookahead -= s.match_length;
                    s.strstart += s.match_length;
                    s.match_length = 0;
                } else {
                    /* No match, output a literal byte */
                    //Tracevv((stderr,"%c", s->window[s->strstart]));
                    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
                    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

                    s.lookahead--;
                    s.strstart++;
                }
                if (bflush) {
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/
                }
            }
            s.insert = 0;
            if (flush === Z_FINISH) {
                /*** FLUSH_BLOCK(s, 1); ***/
                flush_block_only(s, true);
                if (s.strm.avail_out === 0) {
                    return BS_FINISH_STARTED;
                }
                /***/
                return BS_FINISH_DONE;
            }
            if (s.last_lit) {
                /*** FLUSH_BLOCK(s, 0); ***/
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                    return BS_NEED_MORE;
                }
                /***/
            }
            return BS_BLOCK_DONE;
        }

        /* ===========================================================================
         * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
         * (It will be regenerated if this run of deflate switches away from Huffman.)
         */
        function deflate_huff(s, flush) {
            var bflush; /* set if current block must be flushed */

            for (;;) {
                /* Make sure that we have a literal to write. */
                if (s.lookahead === 0) {
                    fill_window(s);
                    if (s.lookahead === 0) {
                        if (flush === Z_NO_FLUSH) {
                            return BS_NEED_MORE;
                        }
                        break; /* flush the current block */
                    }
                }

                /* Output a literal byte */
                s.match_length = 0;
                //Tracevv((stderr,"%c", s->window[s->strstart]));
                /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
                bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
                s.lookahead--;
                s.strstart++;
                if (bflush) {
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/
                }
            }
            s.insert = 0;
            if (flush === Z_FINISH) {
                /*** FLUSH_BLOCK(s, 1); ***/
                flush_block_only(s, true);
                if (s.strm.avail_out === 0) {
                    return BS_FINISH_STARTED;
                }
                /***/
                return BS_FINISH_DONE;
            }
            if (s.last_lit) {
                /*** FLUSH_BLOCK(s, 0); ***/
                flush_block_only(s, false);
                if (s.strm.avail_out === 0) {
                    return BS_NEED_MORE;
                }
                /***/
            }
            return BS_BLOCK_DONE;
        }

        /* Values for max_lazy_match, good_match and max_chain_length, depending on
         * the desired pack level (0..9). The values given below have been tuned to
         * exclude worst case performance for pathological files. Better values may be
         * found for specific files.
         */
        function Config(good_length, max_lazy, nice_length, max_chain, func) {
            this.good_length = good_length;
            this.max_lazy = max_lazy;
            this.nice_length = nice_length;
            this.max_chain = max_chain;
            this.func = func;
        }

        var configuration_table;

        configuration_table = [
            /*      good lazy nice chain */
            new Config(0, 0, 0, 0, deflate_stored), /* 0 store only */
            new Config(4, 4, 8, 4, deflate_fast), /* 1 max speed, no lazy matches */
            new Config(4, 5, 16, 8, deflate_fast), /* 2 */
            new Config(4, 6, 32, 32, deflate_fast), /* 3 */

            new Config(4, 4, 16, 16, deflate_slow), /* 4 lazy matches */
            new Config(8, 16, 32, 32, deflate_slow), /* 5 */
            new Config(8, 16, 128, 128, deflate_slow), /* 6 */
            new Config(8, 32, 128, 256, deflate_slow), /* 7 */
            new Config(32, 128, 258, 1024, deflate_slow), /* 8 */
            new Config(32, 258, 258, 4096, deflate_slow) /* 9 max compression */
        ];


        /* ===========================================================================
         * Initialize the "longest match" routines for a new zlib stream
         */
        function lm_init(s) {
            s.window_size = 2 * s.w_size;

            /*** CLEAR_HASH(s); ***/
            zero(s.head); // Fill with NIL (= 0);

            /* Set the default configuration parameters:
             */
            s.max_lazy_match = configuration_table[s.level].max_lazy;
            s.good_match = configuration_table[s.level].good_length;
            s.nice_match = configuration_table[s.level].nice_length;
            s.max_chain_length = configuration_table[s.level].max_chain;

            s.strstart = 0;
            s.block_start = 0;
            s.lookahead = 0;
            s.insert = 0;
            s.match_length = s.prev_length = MIN_MATCH - 1;
            s.match_available = 0;
            s.ins_h = 0;
        }


        function DeflateState() {
            this.strm = null; /* pointer back to this zlib stream */
            this.status = 0; /* as the name implies */
            this.pending_buf = null; /* output still pending */
            this.pending_buf_size = 0; /* size of pending_buf */
            this.pending_out = 0; /* next pending byte to output to the stream */
            this.pending = 0; /* nb of bytes in the pending buffer */
            this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
            this.gzhead = null; /* gzip header information to write */
            this.gzindex = 0; /* where in extra, name, or comment */
            this.method = Z_DEFLATED; /* can only be DEFLATED */
            this.last_flush = -1; /* value of flush param for previous deflate call */

            this.w_size = 0; /* LZ77 window size (32K by default) */
            this.w_bits = 0; /* log2(w_size)  (8..16) */
            this.w_mask = 0; /* w_size - 1 */

            this.window = null;
            /* Sliding window. Input bytes are read into the second half of the window,
             * and move to the first half later to keep a dictionary of at least wSize
             * bytes. With this organization, matches are limited to a distance of
             * wSize-MAX_MATCH bytes, but this ensures that IO is always
             * performed with a length multiple of the block size.
             */

            this.window_size = 0;
            /* Actual size of window: 2*wSize, except when the user input buffer
             * is directly used as sliding window.
             */

            this.prev = null;
            /* Link to older string with same hash index. To limit the size of this
             * array to 64K, this link is maintained only for the last 32K strings.
             * An index in this array is thus a window index modulo 32K.
             */

            this.head = null; /* Heads of the hash chains or NIL. */

            this.ins_h = 0; /* hash index of string to be inserted */
            this.hash_size = 0; /* number of elements in hash table */
            this.hash_bits = 0; /* log2(hash_size) */
            this.hash_mask = 0; /* hash_size-1 */

            this.hash_shift = 0;
            /* Number of bits by which ins_h must be shifted at each input
             * step. It must be such that after MIN_MATCH steps, the oldest
             * byte no longer takes part in the hash key, that is:
             *   hash_shift * MIN_MATCH >= hash_bits
             */

            this.block_start = 0;
            /* Window position at the beginning of the current output block. Gets
             * negative when the window is moved backwards.
             */

            this.match_length = 0; /* length of best match */
            this.prev_match = 0; /* previous match */
            this.match_available = 0; /* set if previous match exists */
            this.strstart = 0; /* start of string to insert */
            this.match_start = 0; /* start of matching string */
            this.lookahead = 0; /* number of valid bytes ahead in window */

            this.prev_length = 0;
            /* Length of the best match at previous step. Matches not greater than this
             * are discarded. This is used in the lazy match evaluation.
             */

            this.max_chain_length = 0;
            /* To speed up deflation, hash chains are never searched beyond this
             * length.  A higher limit improves compression ratio but degrades the
             * speed.
             */

            this.max_lazy_match = 0;
            /* Attempt to find a better match only when the current match is strictly
             * smaller than this value. This mechanism is used only for compression
             * levels >= 4.
             */
            // That's alias to max_lazy_match, don't use directly
            //this.max_insert_length = 0;
            /* Insert new strings in the hash table only if the match length is not
             * greater than this length. This saves time but degrades compression.
             * max_insert_length is used only for compression levels <= 3.
             */

            this.level = 0; /* compression level (1..9) */
            this.strategy = 0; /* favor or force Huffman coding*/

            this.good_match = 0;
            /* Use a faster search when the previous match is longer than this */

            this.nice_match = 0; /* Stop searching when current match exceeds this */

            /* used by trees.c: */

            /* Didn't use ct_data typedef below to suppress compiler warning */

            // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
            // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
            // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

            // Use flat array of DOUBLE size, with interleaved fata,
            // because JS does not support effective
            this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
            this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
            this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
            zero(this.dyn_ltree);
            zero(this.dyn_dtree);
            zero(this.bl_tree);

            this.l_desc = null; /* desc. for literal tree */
            this.d_desc = null; /* desc. for distance tree */
            this.bl_desc = null; /* desc. for bit length tree */

            //ush bl_count[MAX_BITS+1];
            this.bl_count = new utils.Buf16(MAX_BITS + 1);
            /* number of codes at each bit length for an optimal tree */

            //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
            this.heap = new utils.Buf16(2 * L_CODES + 1); /* heap used to build the Huffman trees */
            zero(this.heap);

            this.heap_len = 0; /* number of elements in the heap */
            this.heap_max = 0; /* element of largest frequency */
            /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
             * The same heap array is used to build all trees.
             */

            this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
            zero(this.depth);
            /* Depth of each subtree used as tie breaker for trees of equal frequency
             */

            this.l_buf = 0; /* buffer index for literals or lengths */

            this.lit_bufsize = 0;
            /* Size of match buffer for literals/lengths.  There are 4 reasons for
             * limiting lit_bufsize to 64K:
             *   - frequencies can be kept in 16 bit counters
             *   - if compression is not successful for the first block, all input
             *     data is still in the window so we can still emit a stored block even
             *     when input comes from standard input.  (This can also be done for
             *     all blocks if lit_bufsize is not greater than 32K.)
             *   - if compression is not successful for a file smaller than 64K, we can
             *     even emit a stored file instead of a stored block (saving 5 bytes).
             *     This is applicable only for zip (not gzip or zlib).
             *   - creating new Huffman trees less frequently may not provide fast
             *     adaptation to changes in the input data statistics. (Take for
             *     example a binary file with poorly compressible code followed by
             *     a highly compressible string table.) Smaller buffer sizes give
             *     fast adaptation but have of course the overhead of transmitting
             *     trees more frequently.
             *   - I can't count above 4
             */

            this.last_lit = 0; /* running index in l_buf */

            this.d_buf = 0;
            /* Buffer index for distances. To simplify the code, d_buf and l_buf have
             * the same number of elements. To use different lengths, an extra flag
             * array would be necessary.
             */

            this.opt_len = 0; /* bit length of current block with optimal trees */
            this.static_len = 0; /* bit length of current block with static trees */
            this.matches = 0; /* number of string matches in current block */
            this.insert = 0; /* bytes at end of window left to insert */


            this.bi_buf = 0;
            /* Output buffer. bits are inserted starting at the bottom (least
             * significant bits).
             */
            this.bi_valid = 0;
            /* Number of valid bits in bi_buf.  All bits above the last valid bit
             * are always zero.
             */

            // Used for window memory init. We safely ignore it for JS. That makes
            // sense only for pointers and memory check tools.
            //this.high_water = 0;
            /* High water mark offset in window for initialized bytes -- bytes above
             * this are set to zero in order to avoid memory check warnings when
             * longest match routines access bytes past the input.  This is then
             * updated to the new high water mark.
             */
        }


        function deflateResetKeep(strm) {
            var s;

            if (!strm || !strm.state) {
                return err(strm, Z_STREAM_ERROR);
            }

            strm.total_in = strm.total_out = 0;
            strm.data_type = Z_UNKNOWN;

            s = strm.state;
            s.pending = 0;
            s.pending_out = 0;

            if (s.wrap < 0) {
                s.wrap = -s.wrap;
                /* was made negative by deflate(..., Z_FINISH); */
            }
            s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
            strm.adler = (s.wrap === 2) ?
                0 // crc32(0, Z_NULL, 0)
                :
                1; // adler32(0, Z_NULL, 0)
            s.last_flush = Z_NO_FLUSH;
            trees._tr_init(s);
            return Z_OK;
        }


        function deflateReset(strm) {
            var ret = deflateResetKeep(strm);
            if (ret === Z_OK) {
                lm_init(strm.state);
            }
            return ret;
        }


        function deflateSetHeader(strm, head) {
            if (!strm || !strm.state) { return Z_STREAM_ERROR; }
            if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
            strm.state.gzhead = head;
            return Z_OK;
        }


        function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
            if (!strm) { // === Z_NULL
                return Z_STREAM_ERROR;
            }
            var wrap = 1;

            if (level === Z_DEFAULT_COMPRESSION) {
                level = 6;
            }

            if (windowBits < 0) { /* suppress zlib wrapper */
                wrap = 0;
                windowBits = -windowBits;
            } else if (windowBits > 15) {
                wrap = 2; /* write gzip wrapper instead */
                windowBits -= 16;
            }


            if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
                windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
                strategy < 0 || strategy > Z_FIXED) {
                return err(strm, Z_STREAM_ERROR);
            }


            if (windowBits === 8) {
                windowBits = 9;
            }
            /* until 256-byte window bug fixed */

            var s = new DeflateState();

            strm.state = s;
            s.strm = strm;

            s.wrap = wrap;
            s.gzhead = null;
            s.w_bits = windowBits;
            s.w_size = 1 << s.w_bits;
            s.w_mask = s.w_size - 1;

            s.hash_bits = memLevel + 7;
            s.hash_size = 1 << s.hash_bits;
            s.hash_mask = s.hash_size - 1;
            s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

            s.window = new utils.Buf8(s.w_size * 2);
            s.head = new utils.Buf16(s.hash_size);
            s.prev = new utils.Buf16(s.w_size);

            // Don't need mem init magic for JS.
            //s.high_water = 0;  /* nothing written to s->window yet */

            s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

            s.pending_buf_size = s.lit_bufsize * 4;

            //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
            //s->pending_buf = (uchf *) overlay;
            s.pending_buf = new utils.Buf8(s.pending_buf_size);

            // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
            //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
            s.d_buf = 1 * s.lit_bufsize;

            //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
            s.l_buf = (1 + 2) * s.lit_bufsize;

            s.level = level;
            s.strategy = strategy;
            s.method = method;

            return deflateReset(strm);
        }

        function deflateInit(strm, level) {
            return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
        }


        function deflate(strm, flush) {
            var old_flush, s;
            var beg, val; // for gzip header write only

            if (!strm || !strm.state ||
                flush > Z_BLOCK || flush < 0) {
                return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
            }

            s = strm.state;

            if (!strm.output ||
                (!strm.input && strm.avail_in !== 0) ||
                (s.status === FINISH_STATE && flush !== Z_FINISH)) {
                return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
            }

            s.strm = strm; /* just in case */
            old_flush = s.last_flush;
            s.last_flush = flush;

            /* Write the header */
            if (s.status === INIT_STATE) {

                if (s.wrap === 2) { // GZIP header
                    strm.adler = 0; //crc32(0L, Z_NULL, 0);
                    put_byte(s, 31);
                    put_byte(s, 139);
                    put_byte(s, 8);
                    if (!s.gzhead) { // s->gzhead == Z_NULL
                        put_byte(s, 0);
                        put_byte(s, 0);
                        put_byte(s, 0);
                        put_byte(s, 0);
                        put_byte(s, 0);
                        put_byte(s, s.level === 9 ? 2 :
                            (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                                4 : 0));
                        put_byte(s, OS_CODE);
                        s.status = BUSY_STATE;
                    } else {
                        put_byte(s, (s.gzhead.text ? 1 : 0) +
                            (s.gzhead.hcrc ? 2 : 0) +
                            (!s.gzhead.extra ? 0 : 4) +
                            (!s.gzhead.name ? 0 : 8) +
                            (!s.gzhead.comment ? 0 : 16)
                        );
                        put_byte(s, s.gzhead.time & 0xff);
                        put_byte(s, (s.gzhead.time >> 8) & 0xff);
                        put_byte(s, (s.gzhead.time >> 16) & 0xff);
                        put_byte(s, (s.gzhead.time >> 24) & 0xff);
                        put_byte(s, s.level === 9 ? 2 :
                            (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                                4 : 0));
                        put_byte(s, s.gzhead.os & 0xff);
                        if (s.gzhead.extra && s.gzhead.extra.length) {
                            put_byte(s, s.gzhead.extra.length & 0xff);
                            put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
                        }
                        if (s.gzhead.hcrc) {
                            strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
                        }
                        s.gzindex = 0;
                        s.status = EXTRA_STATE;
                    }
                } else // DEFLATE header
                {
                    var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
                    var level_flags = -1;

                    if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
                        level_flags = 0;
                    } else if (s.level < 6) {
                        level_flags = 1;
                    } else if (s.level === 6) {
                        level_flags = 2;
                    } else {
                        level_flags = 3;
                    }
                    header |= (level_flags << 6);
                    if (s.strstart !== 0) { header |= PRESET_DICT; }
                    header += 31 - (header % 31);

                    s.status = BUSY_STATE;
                    putShortMSB(s, header);

                    /* Save the adler32 of the preset dictionary: */
                    if (s.strstart !== 0) {
                        putShortMSB(s, strm.adler >>> 16);
                        putShortMSB(s, strm.adler & 0xffff);
                    }
                    strm.adler = 1; // adler32(0L, Z_NULL, 0);
                }
            }

            //#ifdef GZIP
            if (s.status === EXTRA_STATE) {
                if (s.gzhead.extra /* != Z_NULL*/ ) {
                    beg = s.pending; /* start of bytes to update crc */

                    while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
                        if (s.pending === s.pending_buf_size) {
                            if (s.gzhead.hcrc && s.pending > beg) {
                                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                            }
                            flush_pending(strm);
                            beg = s.pending;
                            if (s.pending === s.pending_buf_size) {
                                break;
                            }
                        }
                        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
                        s.gzindex++;
                    }
                    if (s.gzhead.hcrc && s.pending > beg) {
                        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                    }
                    if (s.gzindex === s.gzhead.extra.length) {
                        s.gzindex = 0;
                        s.status = NAME_STATE;
                    }
                } else {
                    s.status = NAME_STATE;
                }
            }
            if (s.status === NAME_STATE) {
                if (s.gzhead.name /* != Z_NULL*/ ) {
                    beg = s.pending; /* start of bytes to update crc */
                    //int val;

                    do {
                        if (s.pending === s.pending_buf_size) {
                            if (s.gzhead.hcrc && s.pending > beg) {
                                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                            }
                            flush_pending(strm);
                            beg = s.pending;
                            if (s.pending === s.pending_buf_size) {
                                val = 1;
                                break;
                            }
                        }
                        // JS specific: little magic to add zero terminator to end of string
                        if (s.gzindex < s.gzhead.name.length) {
                            val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
                        } else {
                            val = 0;
                        }
                        put_byte(s, val);
                    } while (val !== 0);

                    if (s.gzhead.hcrc && s.pending > beg) {
                        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                    }
                    if (val === 0) {
                        s.gzindex = 0;
                        s.status = COMMENT_STATE;
                    }
                } else {
                    s.status = COMMENT_STATE;
                }
            }
            if (s.status === COMMENT_STATE) {
                if (s.gzhead.comment /* != Z_NULL*/ ) {
                    beg = s.pending; /* start of bytes to update crc */
                    //int val;

                    do {
                        if (s.pending === s.pending_buf_size) {
                            if (s.gzhead.hcrc && s.pending > beg) {
                                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                            }
                            flush_pending(strm);
                            beg = s.pending;
                            if (s.pending === s.pending_buf_size) {
                                val = 1;
                                break;
                            }
                        }
                        // JS specific: little magic to add zero terminator to end of string
                        if (s.gzindex < s.gzhead.comment.length) {
                            val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
                        } else {
                            val = 0;
                        }
                        put_byte(s, val);
                    } while (val !== 0);

                    if (s.gzhead.hcrc && s.pending > beg) {
                        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                    }
                    if (val === 0) {
                        s.status = HCRC_STATE;
                    }
                } else {
                    s.status = HCRC_STATE;
                }
            }
            if (s.status === HCRC_STATE) {
                if (s.gzhead.hcrc) {
                    if (s.pending + 2 > s.pending_buf_size) {
                        flush_pending(strm);
                    }
                    if (s.pending + 2 <= s.pending_buf_size) {
                        put_byte(s, strm.adler & 0xff);
                        put_byte(s, (strm.adler >> 8) & 0xff);
                        strm.adler = 0; //crc32(0L, Z_NULL, 0);
                        s.status = BUSY_STATE;
                    }
                } else {
                    s.status = BUSY_STATE;
                }
            }
            //#endif

            /* Flush as much pending output as possible */
            if (s.pending !== 0) {
                flush_pending(strm);
                if (strm.avail_out === 0) {
                    /* Since avail_out is 0, deflate will be called again with
                     * more output space, but possibly with both pending and
                     * avail_in equal to zero. There won't be anything to do,
                     * but this is not an error situation so make sure we
                     * return OK instead of BUF_ERROR at next call of deflate:
                     */
                    s.last_flush = -1;
                    return Z_OK;
                }

                /* Make sure there is something to do and avoid duplicate consecutive
                 * flushes. For repeated and useless calls with Z_FINISH, we keep
                 * returning Z_STREAM_END instead of Z_BUF_ERROR.
                 */
            } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
                flush !== Z_FINISH) {
                return err(strm, Z_BUF_ERROR);
            }

            /* User must not provide more input after the first FINISH: */
            if (s.status === FINISH_STATE && strm.avail_in !== 0) {
                return err(strm, Z_BUF_ERROR);
            }

            /* Start a new block or continue the current one.
             */
            if (strm.avail_in !== 0 || s.lookahead !== 0 ||
                (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
                var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
                    (s.strategy === Z_RLE ? deflate_rle(s, flush) :
                        configuration_table[s.level].func(s, flush));

                if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
                    s.status = FINISH_STATE;
                }
                if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
                    if (strm.avail_out === 0) {
                        s.last_flush = -1;
                        /* avoid BUF_ERROR next call, see above */
                    }
                    return Z_OK;
                    /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
                     * of deflate should use the same flush parameter to make sure
                     * that the flush is complete. So we don't have to output an
                     * empty block here, this will be done at next call. This also
                     * ensures that for a very small output buffer, we emit at most
                     * one empty block.
                     */
                }
                if (bstate === BS_BLOCK_DONE) {
                    if (flush === Z_PARTIAL_FLUSH) {
                        trees._tr_align(s);
                    } else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

                        trees._tr_stored_block(s, 0, 0, false);
                        /* For a full flush, this empty block will be recognized
                         * as a special marker by inflate_sync().
                         */
                        if (flush === Z_FULL_FLUSH) {
                            /*** CLEAR_HASH(s); ***/
                            /* forget history */
                            zero(s.head); // Fill with NIL (= 0);

                            if (s.lookahead === 0) {
                                s.strstart = 0;
                                s.block_start = 0;
                                s.insert = 0;
                            }
                        }
                    }
                    flush_pending(strm);
                    if (strm.avail_out === 0) {
                        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
                        return Z_OK;
                    }
                }
            }
            //Assert(strm->avail_out > 0, "bug2");
            //if (strm.avail_out <= 0) { throw new Error("bug2");}

            if (flush !== Z_FINISH) { return Z_OK; }
            if (s.wrap <= 0) { return Z_STREAM_END; }

            /* Write the trailer */
            if (s.wrap === 2) {
                put_byte(s, strm.adler & 0xff);
                put_byte(s, (strm.adler >> 8) & 0xff);
                put_byte(s, (strm.adler >> 16) & 0xff);
                put_byte(s, (strm.adler >> 24) & 0xff);
                put_byte(s, strm.total_in & 0xff);
                put_byte(s, (strm.total_in >> 8) & 0xff);
                put_byte(s, (strm.total_in >> 16) & 0xff);
                put_byte(s, (strm.total_in >> 24) & 0xff);
            } else {
                putShortMSB(s, strm.adler >>> 16);
                putShortMSB(s, strm.adler & 0xffff);
            }

            flush_pending(strm);
            /* If avail_out is zero, the application will call deflate again
             * to flush the rest.
             */
            if (s.wrap > 0) { s.wrap = -s.wrap; }
            /* write the trailer only once! */
            return s.pending !== 0 ? Z_OK : Z_STREAM_END;
        }

        function deflateEnd(strm) {
            var status;

            if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/ ) {
                return Z_STREAM_ERROR;
            }

            status = strm.state.status;
            if (status !== INIT_STATE &&
                status !== EXTRA_STATE &&
                status !== NAME_STATE &&
                status !== COMMENT_STATE &&
                status !== HCRC_STATE &&
                status !== BUSY_STATE &&
                status !== FINISH_STATE
            ) {
                return err(strm, Z_STREAM_ERROR);
            }

            strm.state = null;

            return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
        }


        /* =========================================================================
         * Initializes the compression dictionary from the given byte
         * sequence without producing any compressed output.
         */
        function deflateSetDictionary(strm, dictionary) {
            var dictLength = dictionary.length;

            var s;
            var str, n;
            var wrap;
            var avail;
            var next;
            var input;
            var tmpDict;

            if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/ ) {
                return Z_STREAM_ERROR;
            }

            s = strm.state;
            wrap = s.wrap;

            if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
                return Z_STREAM_ERROR;
            }

            /* when using zlib wrappers, compute Adler-32 for provided dictionary */
            if (wrap === 1) {
                /* adler32(strm->adler, dictionary, dictLength); */
                strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
            }

            s.wrap = 0; /* avoid computing Adler-32 in read_buf */

            /* if dictionary would fill window, just replace the history */
            if (dictLength >= s.w_size) {
                if (wrap === 0) { /* already empty otherwise */
                    /*** CLEAR_HASH(s); ***/
                    zero(s.head); // Fill with NIL (= 0);
                    s.strstart = 0;
                    s.block_start = 0;
                    s.insert = 0;
                }
                /* use the tail */
                // dictionary = dictionary.slice(dictLength - s.w_size);
                tmpDict = new utils.Buf8(s.w_size);
                utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
                dictionary = tmpDict;
                dictLength = s.w_size;
            }
            /* insert dictionary into window and hash */
            avail = strm.avail_in;
            next = strm.next_in;
            input = strm.input;
            strm.avail_in = dictLength;
            strm.next_in = 0;
            strm.input = dictionary;
            fill_window(s);
            while (s.lookahead >= MIN_MATCH) {
                str = s.strstart;
                n = s.lookahead - (MIN_MATCH - 1);
                do {
                    /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
                    s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

                    s.prev[str & s.w_mask] = s.head[s.ins_h];

                    s.head[s.ins_h] = str;
                    str++;
                } while (--n);
                s.strstart = str;
                s.lookahead = MIN_MATCH - 1;
                fill_window(s);
            }
            s.strstart += s.lookahead;
            s.block_start = s.strstart;
            s.insert = s.lookahead;
            s.lookahead = 0;
            s.match_length = s.prev_length = MIN_MATCH - 1;
            s.match_available = 0;
            strm.next_in = next;
            strm.input = input;
            strm.avail_in = avail;
            s.wrap = wrap;
            return Z_OK;
        }


        exports.deflateInit = deflateInit;
        exports.deflateInit2 = deflateInit2;
        exports.deflateReset = deflateReset;
        exports.deflateResetKeep = deflateResetKeep;
        exports.deflateSetHeader = deflateSetHeader;
        exports.deflate = deflate;
        exports.deflateEnd = deflateEnd;
        exports.deflateSetDictionary = deflateSetDictionary;
        exports.deflateInfo = 'pako deflate (from Nodeca project)';

        /* Not implemented
        exports.deflateBound = deflateBound;
        exports.deflateCopy = deflateCopy;
        exports.deflateParams = deflateParams;
        exports.deflatePending = deflatePending;
        exports.deflatePrime = deflatePrime;
        exports.deflateTune = deflateTune;
        */

    }, { "../utils/common": 68, "./adler32": 69, "./crc32": 71, "./messages": 76, "./trees": 77 }],
    73: [function(require, module, exports) {
        'use strict';

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        // See state defs from inflate.js
        var BAD = 30; /* got a data error -- remain here until reset */
        var TYPE = 12; /* i: waiting for type bits, including last-flag bit */

        /*
           Decode literal, length, and distance codes and write out the resulting
           literal and match bytes until either not enough input or output is
           available, an end-of-block is encountered, or a data error is encountered.
           When large enough input and output buffers are supplied to inflate(), for
           example, a 16K input buffer and a 64K output buffer, more than 95% of the
           inflate execution time is spent in this routine.

           Entry assumptions:

                state.mode === LEN
                strm.avail_in >= 6
                strm.avail_out >= 258
                start >= strm.avail_out
                state.bits < 8

           On return, state.mode is one of:

                LEN -- ran out of enough output space or enough available input
                TYPE -- reached end of block code, inflate() to interpret next block
                BAD -- error in block data

           Notes:

            - The maximum input bits used by a length/distance pair is 15 bits for the
              length code, 5 bits for the length extra, 15 bits for the distance code,
              and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
              Therefore if strm.avail_in >= 6, then there is enough input to avoid
              checking for available input while decoding.

            - The maximum bytes that a single length/distance pair can output is 258
              bytes, which is the maximum length that can be coded.  inflate_fast()
              requires strm.avail_out >= 258 for each loop to avoid checking for
              output space.
         */
        module.exports = function inflate_fast(strm, start) {
            var state;
            var _in; /* local strm.input */
            var last; /* have enough input while in < last */
            var _out; /* local strm.output */
            var beg; /* inflate()'s initial strm.output */
            var end; /* while out < end, enough space available */
            //#ifdef INFLATE_STRICT
            var dmax; /* maximum distance from zlib header */
            //#endif
            var wsize; /* window size or zero if not using window */
            var whave; /* valid bytes in the window */
            var wnext; /* window write index */
            // Use `s_window` instead `window`, avoid conflict with instrumentation tools
            var s_window; /* allocated sliding window, if wsize != 0 */
            var hold; /* local strm.hold */
            var bits; /* local strm.bits */
            var lcode; /* local strm.lencode */
            var dcode; /* local strm.distcode */
            var lmask; /* mask for first level of length codes */
            var dmask; /* mask for first level of distance codes */
            var here; /* retrieved table entry */
            var op; /* code bits, operation, extra bits, or */
            /*  window position, window bytes to copy */
            var len; /* match length, unused bytes */
            var dist; /* match distance */
            var from; /* where to copy match from */
            var from_source;


            var input, output; // JS specific, because we have no pointers

            /* copy state to local variables */
            state = strm.state;
            //here = state.here;
            _in = strm.next_in;
            input = strm.input;
            last = _in + (strm.avail_in - 5);
            _out = strm.next_out;
            output = strm.output;
            beg = _out - (start - strm.avail_out);
            end = _out + (strm.avail_out - 257);
            //#ifdef INFLATE_STRICT
            dmax = state.dmax;
            //#endif
            wsize = state.wsize;
            whave = state.whave;
            wnext = state.wnext;
            s_window = state.window;
            hold = state.hold;
            bits = state.bits;
            lcode = state.lencode;
            dcode = state.distcode;
            lmask = (1 << state.lenbits) - 1;
            dmask = (1 << state.distbits) - 1;


            /* decode literals and length/distances until end-of-block or not enough
               input data or output space */

            top:
                do {
                    if (bits < 15) {
                        hold += input[_in++] << bits;
                        bits += 8;
                        hold += input[_in++] << bits;
                        bits += 8;
                    }

                    here = lcode[hold & lmask];

                    dolen:
                        for (;;) { // Goto emulation
                            op = here >>> 24 /*here.bits*/ ;
                            hold >>>= op;
                            bits -= op;
                            op = (here >>> 16) & 0xff /*here.op*/ ;
                            if (op === 0) { /* literal */
                                //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
                                //        "inflate:         literal '%c'\n" :
                                //        "inflate:         literal 0x%02x\n", here.val));
                                output[_out++] = here & 0xffff /*here.val*/ ;
                            } else if (op & 16) { /* length base */
                                len = here & 0xffff /*here.val*/ ;
                                op &= 15; /* number of extra bits */
                                if (op) {
                                    if (bits < op) {
                                        hold += input[_in++] << bits;
                                        bits += 8;
                                    }
                                    len += hold & ((1 << op) - 1);
                                    hold >>>= op;
                                    bits -= op;
                                }
                                //Tracevv((stderr, "inflate:         length %u\n", len));
                                if (bits < 15) {
                                    hold += input[_in++] << bits;
                                    bits += 8;
                                    hold += input[_in++] << bits;
                                    bits += 8;
                                }
                                here = dcode[hold & dmask];

                                dodist:
                                    for (;;) { // goto emulation
                                        op = here >>> 24 /*here.bits*/ ;
                                        hold >>>= op;
                                        bits -= op;
                                        op = (here >>> 16) & 0xff /*here.op*/ ;

                                        if (op & 16) { /* distance base */
                                            dist = here & 0xffff /*here.val*/ ;
                                            op &= 15; /* number of extra bits */
                                            if (bits < op) {
                                                hold += input[_in++] << bits;
                                                bits += 8;
                                                if (bits < op) {
                                                    hold += input[_in++] << bits;
                                                    bits += 8;
                                                }
                                            }
                                            dist += hold & ((1 << op) - 1);
                                            //#ifdef INFLATE_STRICT
                                            if (dist > dmax) {
                                                strm.msg = 'invalid distance too far back';
                                                state.mode = BAD;
                                                break top;
                                            }
                                            //#endif
                                            hold >>>= op;
                                            bits -= op;
                                            //Tracevv((stderr, "inflate:         distance %u\n", dist));
                                            op = _out - beg; /* max distance in output */
                                            if (dist > op) { /* see if copy from window */
                                                op = dist - op; /* distance back in window */
                                                if (op > whave) {
                                                    if (state.sane) {
                                                        strm.msg = 'invalid distance too far back';
                                                        state.mode = BAD;
                                                        break top;
                                                    }

                                                    // (!) This block is disabled in zlib defaults,
                                                    // don't enable it for binary compatibility
                                                    //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
                                                    //                if (len <= op - whave) {
                                                    //                  do {
                                                    //                    output[_out++] = 0;
                                                    //                  } while (--len);
                                                    //                  continue top;
                                                    //                }
                                                    //                len -= op - whave;
                                                    //                do {
                                                    //                  output[_out++] = 0;
                                                    //                } while (--op > whave);
                                                    //                if (op === 0) {
                                                    //                  from = _out - dist;
                                                    //                  do {
                                                    //                    output[_out++] = output[from++];
                                                    //                  } while (--len);
                                                    //                  continue top;
                                                    //                }
                                                    //#endif
                                                }
                                                from = 0; // window index
                                                from_source = s_window;
                                                if (wnext === 0) { /* very common case */
                                                    from += wsize - op;
                                                    if (op < len) { /* some from window */
                                                        len -= op;
                                                        do {
                                                            output[_out++] = s_window[from++];
                                                        } while (--op);
                                                        from = _out - dist; /* rest from output */
                                                        from_source = output;
                                                    }
                                                } else if (wnext < op) { /* wrap around window */
                                                    from += wsize + wnext - op;
                                                    op -= wnext;
                                                    if (op < len) { /* some from end of window */
                                                        len -= op;
                                                        do {
                                                            output[_out++] = s_window[from++];
                                                        } while (--op);
                                                        from = 0;
                                                        if (wnext < len) { /* some from start of window */
                                                            op = wnext;
                                                            len -= op;
                                                            do {
                                                                output[_out++] = s_window[from++];
                                                            } while (--op);
                                                            from = _out - dist; /* rest from output */
                                                            from_source = output;
                                                        }
                                                    }
                                                } else { /* contiguous in window */
                                                    from += wnext - op;
                                                    if (op < len) { /* some from window */
                                                        len -= op;
                                                        do {
                                                            output[_out++] = s_window[from++];
                                                        } while (--op);
                                                        from = _out - dist; /* rest from output */
                                                        from_source = output;
                                                    }
                                                }
                                                while (len > 2) {
                                                    output[_out++] = from_source[from++];
                                                    output[_out++] = from_source[from++];
                                                    output[_out++] = from_source[from++];
                                                    len -= 3;
                                                }
                                                if (len) {
                                                    output[_out++] = from_source[from++];
                                                    if (len > 1) {
                                                        output[_out++] = from_source[from++];
                                                    }
                                                }
                                            } else {
                                                from = _out - dist; /* copy direct from output */
                                                do { /* minimum length is three */
                                                    output[_out++] = output[from++];
                                                    output[_out++] = output[from++];
                                                    output[_out++] = output[from++];
                                                    len -= 3;
                                                } while (len > 2);
                                                if (len) {
                                                    output[_out++] = output[from++];
                                                    if (len > 1) {
                                                        output[_out++] = output[from++];
                                                    }
                                                }
                                            }
                                        } else if ((op & 64) === 0) { /* 2nd level distance code */
                                            here = dcode[(here & 0xffff) /*here.val*/ + (hold & ((1 << op) - 1))];
                                            continue dodist;
                                        } else {
                                            strm.msg = 'invalid distance code';
                                            state.mode = BAD;
                                            break top;
                                        }

                                        break; // need to emulate goto via "continue"
                                    }
                            } else if ((op & 64) === 0) { /* 2nd level length code */
                                here = lcode[(here & 0xffff) /*here.val*/ + (hold & ((1 << op) - 1))];
                                continue dolen;
                            } else if (op & 32) { /* end-of-block */
                                //Tracevv((stderr, "inflate:         end of block\n"));
                                state.mode = TYPE;
                                break top;
                            } else {
                                strm.msg = 'invalid literal/length code';
                                state.mode = BAD;
                                break top;
                            }

                            break; // need to emulate goto via "continue"
                        }
                } while (_in < last && _out < end);

            /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
            len = bits >> 3;
            _in -= len;
            bits -= len << 3;
            hold &= (1 << bits) - 1;

            /* update state and return */
            strm.next_in = _in;
            strm.next_out = _out;
            strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
            strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
            state.hold = hold;
            state.bits = bits;
            return;
        };

    }, {}],
    74: [function(require, module, exports) {
        'use strict';

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        var utils = require('../utils/common');
        var adler32 = require('./adler32');
        var crc32 = require('./crc32');
        var inflate_fast = require('./inffast');
        var inflate_table = require('./inftrees');

        var CODES = 0;
        var LENS = 1;
        var DISTS = 2;

        /* Public constants ==========================================================*/
        /* ===========================================================================*/


        /* Allowed flush values; see deflate() and inflate() below for details */
        //var Z_NO_FLUSH      = 0;
        //var Z_PARTIAL_FLUSH = 1;
        //var Z_SYNC_FLUSH    = 2;
        //var Z_FULL_FLUSH    = 3;
        var Z_FINISH = 4;
        var Z_BLOCK = 5;
        var Z_TREES = 6;


        /* Return codes for the compression/decompression functions. Negative values
         * are errors, positive values are used for special but normal events.
         */
        var Z_OK = 0;
        var Z_STREAM_END = 1;
        var Z_NEED_DICT = 2;
        //var Z_ERRNO         = -1;
        var Z_STREAM_ERROR = -2;
        var Z_DATA_ERROR = -3;
        var Z_MEM_ERROR = -4;
        var Z_BUF_ERROR = -5;
        //var Z_VERSION_ERROR = -6;

        /* The deflate compression method */
        var Z_DEFLATED = 8;


        /* STATES ====================================================================*/
        /* ===========================================================================*/


        var HEAD = 1; /* i: waiting for magic header */
        var FLAGS = 2; /* i: waiting for method and flags (gzip) */
        var TIME = 3; /* i: waiting for modification time (gzip) */
        var OS = 4; /* i: waiting for extra flags and operating system (gzip) */
        var EXLEN = 5; /* i: waiting for extra length (gzip) */
        var EXTRA = 6; /* i: waiting for extra bytes (gzip) */
        var NAME = 7; /* i: waiting for end of file name (gzip) */
        var COMMENT = 8; /* i: waiting for end of comment (gzip) */
        var HCRC = 9; /* i: waiting for header crc (gzip) */
        var DICTID = 10; /* i: waiting for dictionary check value */
        var DICT = 11; /* waiting for inflateSetDictionary() call */
        var TYPE = 12; /* i: waiting for type bits, including last-flag bit */
        var TYPEDO = 13; /* i: same, but skip check to exit inflate on new block */
        var STORED = 14; /* i: waiting for stored size (length and complement) */
        var COPY_ = 15; /* i/o: same as COPY below, but only first time in */
        var COPY = 16; /* i/o: waiting for input or output to copy stored block */
        var TABLE = 17; /* i: waiting for dynamic block table lengths */
        var LENLENS = 18; /* i: waiting for code length code lengths */
        var CODELENS = 19; /* i: waiting for length/lit and distance code lengths */
        var LEN_ = 20; /* i: same as LEN below, but only first time in */
        var LEN = 21; /* i: waiting for length/lit/eob code */
        var LENEXT = 22; /* i: waiting for length extra bits */
        var DIST = 23; /* i: waiting for distance code */
        var DISTEXT = 24; /* i: waiting for distance extra bits */
        var MATCH = 25; /* o: waiting for output space to copy string */
        var LIT = 26; /* o: waiting for output space to write literal */
        var CHECK = 27; /* i: waiting for 32-bit check value */
        var LENGTH = 28; /* i: waiting for 32-bit length (gzip) */
        var DONE = 29; /* finished check, done -- remain here until reset */
        var BAD = 30; /* got a data error -- remain here until reset */
        var MEM = 31; /* got an inflate() memory error -- remain here until reset */
        var SYNC = 32; /* looking for synchronization bytes to restart inflate() */

        /* ===========================================================================*/



        var ENOUGH_LENS = 852;
        var ENOUGH_DISTS = 592;
        //var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

        var MAX_WBITS = 15;
        /* 32K LZ77 window */
        var DEF_WBITS = MAX_WBITS;


        function zswap32(q) {
            return (((q >>> 24) & 0xff) +
                ((q >>> 8) & 0xff00) +
                ((q & 0xff00) << 8) +
                ((q & 0xff) << 24));
        }


        function InflateState() {
            this.mode = 0; /* current inflate mode */
            this.last = false; /* true if processing last block */
            this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
            this.havedict = false; /* true if dictionary provided */
            this.flags = 0; /* gzip header method and flags (0 if zlib) */
            this.dmax = 0; /* zlib header max distance (INFLATE_STRICT) */
            this.check = 0; /* protected copy of check value */
            this.total = 0; /* protected copy of output count */
            // TODO: may be {}
            this.head = null; /* where to save gzip header information */

            /* sliding window */
            this.wbits = 0; /* log base 2 of requested window size */
            this.wsize = 0; /* window size or zero if not using window */
            this.whave = 0; /* valid bytes in the window */
            this.wnext = 0; /* window write index */
            this.window = null; /* allocated sliding window, if needed */

            /* bit accumulator */
            this.hold = 0; /* input bit accumulator */
            this.bits = 0; /* number of bits in "in" */

            /* for string and stored block copying */
            this.length = 0; /* literal or length of data to copy */
            this.offset = 0; /* distance back to copy string from */

            /* for table and code decoding */
            this.extra = 0; /* extra bits needed */

            /* fixed and dynamic code tables */
            this.lencode = null; /* starting table for length/literal codes */
            this.distcode = null; /* starting table for distance codes */
            this.lenbits = 0; /* index bits for lencode */
            this.distbits = 0; /* index bits for distcode */

            /* dynamic table building */
            this.ncode = 0; /* number of code length code lengths */
            this.nlen = 0; /* number of length code lengths */
            this.ndist = 0; /* number of distance code lengths */
            this.have = 0; /* number of code lengths in lens[] */
            this.next = null; /* next available space in codes[] */

            this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
            this.work = new utils.Buf16(288); /* work area for code table building */

            /*
             because we don't have pointers in js, we use lencode and distcode directly
             as buffers so we don't need codes
            */
            //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
            this.lendyn = null; /* dynamic table for length/literal codes (JS specific) */
            this.distdyn = null; /* dynamic table for distance codes (JS specific) */
            this.sane = 0; /* if false, allow invalid distance too far */
            this.back = 0; /* bits back of last unprocessed length/lit */
            this.was = 0; /* initial length of match */
        }

        function inflateResetKeep(strm) {
            var state;

            if (!strm || !strm.state) { return Z_STREAM_ERROR; }
            state = strm.state;
            strm.total_in = strm.total_out = state.total = 0;
            strm.msg = ''; /*Z_NULL*/
            if (state.wrap) { /* to support ill-conceived Java test suite */
                strm.adler = state.wrap & 1;
            }
            state.mode = HEAD;
            state.last = 0;
            state.havedict = 0;
            state.dmax = 32768;
            state.head = null /*Z_NULL*/ ;
            state.hold = 0;
            state.bits = 0;
            //state.lencode = state.distcode = state.next = state.codes;
            state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
            state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

            state.sane = 1;
            state.back = -1;
            //Tracev((stderr, "inflate: reset\n"));
            return Z_OK;
        }

        function inflateReset(strm) {
            var state;

            if (!strm || !strm.state) { return Z_STREAM_ERROR; }
            state = strm.state;
            state.wsize = 0;
            state.whave = 0;
            state.wnext = 0;
            return inflateResetKeep(strm);

        }

        function inflateReset2(strm, windowBits) {
            var wrap;
            var state;

            /* get the state */
            if (!strm || !strm.state) { return Z_STREAM_ERROR; }
            state = strm.state;

            /* extract wrap request from windowBits parameter */
            if (windowBits < 0) {
                wrap = 0;
                windowBits = -windowBits;
            } else {
                wrap = (windowBits >> 4) + 1;
                if (windowBits < 48) {
                    windowBits &= 15;
                }
            }

            /* set number of window bits, free window if different */
            if (windowBits && (windowBits < 8 || windowBits > 15)) {
                return Z_STREAM_ERROR;
            }
            if (state.window !== null && state.wbits !== windowBits) {
                state.window = null;
            }

            /* update state and reset the rest of it */
            state.wrap = wrap;
            state.wbits = windowBits;
            return inflateReset(strm);
        }

        function inflateInit2(strm, windowBits) {
            var ret;
            var state;

            if (!strm) { return Z_STREAM_ERROR; }
            //strm.msg = Z_NULL;                 /* in case we return an error */

            state = new InflateState();

            //if (state === Z_NULL) return Z_MEM_ERROR;
            //Tracev((stderr, "inflate: allocated\n"));
            strm.state = state;
            state.window = null /*Z_NULL*/ ;
            ret = inflateReset2(strm, windowBits);
            if (ret !== Z_OK) {
                strm.state = null /*Z_NULL*/ ;
            }
            return ret;
        }

        function inflateInit(strm) {
            return inflateInit2(strm, DEF_WBITS);
        }


        /*
         Return state with length and distance decoding tables and index sizes set to
         fixed code decoding.  Normally this returns fixed tables from inffixed.h.
         If BUILDFIXED is defined, then instead this routine builds the tables the
         first time it's called, and returns those tables the first time and
         thereafter.  This reduces the size of the code by about 2K bytes, in
         exchange for a little execution time.  However, BUILDFIXED should not be
         used for threaded applications, since the rewriting of the tables and virgin
         may not be thread-safe.
         */
        var virgin = true;

        var lenfix, distfix; // We have no pointers in JS, so keep tables separate

        function fixedtables(state) {
            /* build fixed huffman tables if first call (may not be thread safe) */
            if (virgin) {
                var sym;

                lenfix = new utils.Buf32(512);
                distfix = new utils.Buf32(32);

                /* literal/length table */
                sym = 0;
                while (sym < 144) { state.lens[sym++] = 8; }
                while (sym < 256) { state.lens[sym++] = 9; }
                while (sym < 280) { state.lens[sym++] = 7; }
                while (sym < 288) { state.lens[sym++] = 8; }

                inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });

                /* distance table */
                sym = 0;
                while (sym < 32) { state.lens[sym++] = 5; }

                inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });

                /* do this just once */
                virgin = false;
            }

            state.lencode = lenfix;
            state.lenbits = 9;
            state.distcode = distfix;
            state.distbits = 5;
        }


        /*
         Update the window with the last wsize (normally 32K) bytes written before
         returning.  If window does not exist yet, create it.  This is only called
         when a window is already in use, or when output has been written during this
         inflate call, but the end of the deflate stream has not been reached yet.
         It is also called to create a window for dictionary data when a dictionary
         is loaded.

         Providing output buffers larger than 32K to inflate() should provide a speed
         advantage, since only the last 32K of output is copied to the sliding window
         upon return from inflate(), and since all distances after the first 32K of
         output will fall in the output data, making match copies simpler and faster.
         The advantage may be dependent on the size of the processor's data caches.
         */
        function updatewindow(strm, src, end, copy) {
            var dist;
            var state = strm.state;

            /* if it hasn't been done already, allocate space for the window */
            if (state.window === null) {
                state.wsize = 1 << state.wbits;
                state.wnext = 0;
                state.whave = 0;

                state.window = new utils.Buf8(state.wsize);
            }

            /* copy state->wsize or less output bytes into the circular window */
            if (copy >= state.wsize) {
                utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
                state.wnext = 0;
                state.whave = state.wsize;
            } else {
                dist = state.wsize - state.wnext;
                if (dist > copy) {
                    dist = copy;
                }
                //zmemcpy(state->window + state->wnext, end - copy, dist);
                utils.arraySet(state.window, src, end - copy, dist, state.wnext);
                copy -= dist;
                if (copy) {
                    //zmemcpy(state->window, end - copy, copy);
                    utils.arraySet(state.window, src, end - copy, copy, 0);
                    state.wnext = copy;
                    state.whave = state.wsize;
                } else {
                    state.wnext += dist;
                    if (state.wnext === state.wsize) { state.wnext = 0; }
                    if (state.whave < state.wsize) { state.whave += dist; }
                }
            }
            return 0;
        }

        function inflate(strm, flush) {
            var state;
            var input, output; // input/output buffers
            var next; /* next input INDEX */
            var put; /* next output INDEX */
            var have, left; /* available input and output */
            var hold; /* bit buffer */
            var bits; /* bits in bit buffer */
            var _in, _out; /* save starting available input and output */
            var copy; /* number of stored or match bytes to copy */
            var from; /* where to copy match bytes from */
            var from_source;
            var here = 0; /* current decoding table entry */
            var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
            //var last;                   /* parent table entry */
            var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
            var len; /* length to copy for repeats, bits to drop */
            var ret; /* return code */
            var hbuf = new utils.Buf8(4); /* buffer for gzip header crc calculation */
            var opts;

            var n; // temporary var for NEED_BITS

            var order = /* permutation of code lengths */ [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];


            if (!strm || !strm.state || !strm.output ||
                (!strm.input && strm.avail_in !== 0)) {
                return Z_STREAM_ERROR;
            }

            state = strm.state;
            if (state.mode === TYPE) { state.mode = TYPEDO; } /* skip check */


            //--- LOAD() ---
            put = strm.next_out;
            output = strm.output;
            left = strm.avail_out;
            next = strm.next_in;
            input = strm.input;
            have = strm.avail_in;
            hold = state.hold;
            bits = state.bits;
            //---

            _in = have;
            _out = left;
            ret = Z_OK;

            inf_leave: // goto emulation
                for (;;) {
                    switch (state.mode) {
                        case HEAD:
                            if (state.wrap === 0) {
                                state.mode = TYPEDO;
                                break;
                            }
                            //=== NEEDBITS(16);
                            while (bits < 16) {
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                            }
                            //===//
                            if ((state.wrap & 2) && hold === 0x8b1f) { /* gzip header */
                                state.check = 0 /*crc32(0L, Z_NULL, 0)*/ ;
                                //=== CRC2(state.check, hold);
                                hbuf[0] = hold & 0xff;
                                hbuf[1] = (hold >>> 8) & 0xff;
                                state.check = crc32(state.check, hbuf, 2, 0);
                                //===//

                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                                state.mode = FLAGS;
                                break;
                            }
                            state.flags = 0; /* expect zlib header */
                            if (state.head) {
                                state.head.done = false;
                            }
                            if (!(state.wrap & 1) || /* check if zlib header allowed */
                                (((hold & 0xff) /*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
                                strm.msg = 'incorrect header check';
                                state.mode = BAD;
                                break;
                            }
                            if ((hold & 0x0f) /*BITS(4)*/ !== Z_DEFLATED) {
                                strm.msg = 'unknown compression method';
                                state.mode = BAD;
                                break;
                            }
                            //--- DROPBITS(4) ---//
                            hold >>>= 4;
                            bits -= 4;
                            //---//
                            len = (hold & 0x0f) /*BITS(4)*/ + 8;
                            if (state.wbits === 0) {
                                state.wbits = len;
                            } else if (len > state.wbits) {
                                strm.msg = 'invalid window size';
                                state.mode = BAD;
                                break;
                            }
                            state.dmax = 1 << len;
                            //Tracev((stderr, "inflate:   zlib header ok\n"));
                            strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;
                            state.mode = hold & 0x200 ? DICTID : TYPE;
                            //=== INITBITS();
                            hold = 0;
                            bits = 0;
                            //===//
                            break;
                        case FLAGS:
                            //=== NEEDBITS(16); */
                            while (bits < 16) {
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                            }
                            //===//
                            state.flags = hold;
                            if ((state.flags & 0xff) !== Z_DEFLATED) {
                                strm.msg = 'unknown compression method';
                                state.mode = BAD;
                                break;
                            }
                            if (state.flags & 0xe000) {
                                strm.msg = 'unknown header flags set';
                                state.mode = BAD;
                                break;
                            }
                            if (state.head) {
                                state.head.text = ((hold >> 8) & 1);
                            }
                            if (state.flags & 0x0200) {
                                //=== CRC2(state.check, hold);
                                hbuf[0] = hold & 0xff;
                                hbuf[1] = (hold >>> 8) & 0xff;
                                state.check = crc32(state.check, hbuf, 2, 0);
                                //===//
                            }
                            //=== INITBITS();
                            hold = 0;
                            bits = 0;
                            //===//
                            state.mode = TIME;
                            /* falls through */
                        case TIME:
                            //=== NEEDBITS(32); */
                            while (bits < 32) {
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                            }
                            //===//
                            if (state.head) {
                                state.head.time = hold;
                            }
                            if (state.flags & 0x0200) {
                                //=== CRC4(state.check, hold)
                                hbuf[0] = hold & 0xff;
                                hbuf[1] = (hold >>> 8) & 0xff;
                                hbuf[2] = (hold >>> 16) & 0xff;
                                hbuf[3] = (hold >>> 24) & 0xff;
                                state.check = crc32(state.check, hbuf, 4, 0);
                                //===
                            }
                            //=== INITBITS();
                            hold = 0;
                            bits = 0;
                            //===//
                            state.mode = OS;
                            /* falls through */
                        case OS:
                            //=== NEEDBITS(16); */
                            while (bits < 16) {
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                            }
                            //===//
                            if (state.head) {
                                state.head.xflags = (hold & 0xff);
                                state.head.os = (hold >> 8);
                            }
                            if (state.flags & 0x0200) {
                                //=== CRC2(state.check, hold);
                                hbuf[0] = hold & 0xff;
                                hbuf[1] = (hold >>> 8) & 0xff;
                                state.check = crc32(state.check, hbuf, 2, 0);
                                //===//
                            }
                            //=== INITBITS();
                            hold = 0;
                            bits = 0;
                            //===//
                            state.mode = EXLEN;
                            /* falls through */
                        case EXLEN:
                            if (state.flags & 0x0400) {
                                //=== NEEDBITS(16); */
                                while (bits < 16) {
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                state.length = hold;
                                if (state.head) {
                                    state.head.extra_len = hold;
                                }
                                if (state.flags & 0x0200) {
                                    //=== CRC2(state.check, hold);
                                    hbuf[0] = hold & 0xff;
                                    hbuf[1] = (hold >>> 8) & 0xff;
                                    state.check = crc32(state.check, hbuf, 2, 0);
                                    //===//
                                }
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                            } else if (state.head) {
                                state.head.extra = null /*Z_NULL*/ ;
                            }
                            state.mode = EXTRA;
                            /* falls through */
                        case EXTRA:
                            if (state.flags & 0x0400) {
                                copy = state.length;
                                if (copy > have) { copy = have; }
                                if (copy) {
                                    if (state.head) {
                                        len = state.head.extra_len - state.length;
                                        if (!state.head.extra) {
                                            // Use untyped array for more convenient processing later
                                            state.head.extra = new Array(state.head.extra_len);
                                        }
                                        utils.arraySet(
                                            state.head.extra,
                                            input,
                                            next,
                                            // extra field is limited to 65536 bytes
                                            // - no need for additional size check
                                            copy,
                                            /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                                            len
                                        );
                                        //zmemcpy(state.head.extra + len, next,
                                        //        len + copy > state.head.extra_max ?
                                        //        state.head.extra_max - len : copy);
                                    }
                                    if (state.flags & 0x0200) {
                                        state.check = crc32(state.check, input, copy, next);
                                    }
                                    have -= copy;
                                    next += copy;
                                    state.length -= copy;
                                }
                                if (state.length) { break inf_leave; }
                            }
                            state.length = 0;
                            state.mode = NAME;
                            /* falls through */
                        case NAME:
                            if (state.flags & 0x0800) {
                                if (have === 0) { break inf_leave; }
                                copy = 0;
                                do {
                                    // TODO: 2 or 1 bytes?
                                    len = input[next + copy++];
                                    /* use constant limit because in js we should not preallocate memory */
                                    if (state.head && len &&
                                        (state.length < 65536 /*state.head.name_max*/ )) {
                                        state.head.name += String.fromCharCode(len);
                                    }
                                } while (len && copy < have);

                                if (state.flags & 0x0200) {
                                    state.check = crc32(state.check, input, copy, next);
                                }
                                have -= copy;
                                next += copy;
                                if (len) { break inf_leave; }
                            } else if (state.head) {
                                state.head.name = null;
                            }
                            state.length = 0;
                            state.mode = COMMENT;
                            /* falls through */
                        case COMMENT:
                            if (state.flags & 0x1000) {
                                if (have === 0) { break inf_leave; }
                                copy = 0;
                                do {
                                    len = input[next + copy++];
                                    /* use constant limit because in js we should not preallocate memory */
                                    if (state.head && len &&
                                        (state.length < 65536 /*state.head.comm_max*/ )) {
                                        state.head.comment += String.fromCharCode(len);
                                    }
                                } while (len && copy < have);
                                if (state.flags & 0x0200) {
                                    state.check = crc32(state.check, input, copy, next);
                                }
                                have -= copy;
                                next += copy;
                                if (len) { break inf_leave; }
                            } else if (state.head) {
                                state.head.comment = null;
                            }
                            state.mode = HCRC;
                            /* falls through */
                        case HCRC:
                            if (state.flags & 0x0200) {
                                //=== NEEDBITS(16); */
                                while (bits < 16) {
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                if (hold !== (state.check & 0xffff)) {
                                    strm.msg = 'header crc mismatch';
                                    state.mode = BAD;
                                    break;
                                }
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                            }
                            if (state.head) {
                                state.head.hcrc = ((state.flags >> 9) & 1);
                                state.head.done = true;
                            }
                            strm.adler = state.check = 0;
                            state.mode = TYPE;
                            break;
                        case DICTID:
                            //=== NEEDBITS(32); */
                            while (bits < 32) {
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                            }
                            //===//
                            strm.adler = state.check = zswap32(hold);
                            //=== INITBITS();
                            hold = 0;
                            bits = 0;
                            //===//
                            state.mode = DICT;
                            /* falls through */
                        case DICT:
                            if (state.havedict === 0) {
                                //--- RESTORE() ---
                                strm.next_out = put;
                                strm.avail_out = left;
                                strm.next_in = next;
                                strm.avail_in = have;
                                state.hold = hold;
                                state.bits = bits;
                                //---
                                return Z_NEED_DICT;
                            }
                            strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;
                            state.mode = TYPE;
                            /* falls through */
                        case TYPE:
                            if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
                            /* falls through */
                        case TYPEDO:
                            if (state.last) {
                                //--- BYTEBITS() ---//
                                hold >>>= bits & 7;
                                bits -= bits & 7;
                                //---//
                                state.mode = CHECK;
                                break;
                            }
                            //=== NEEDBITS(3); */
                            while (bits < 3) {
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                            }
                            //===//
                            state.last = (hold & 0x01) /*BITS(1)*/ ;
                            //--- DROPBITS(1) ---//
                            hold >>>= 1;
                            bits -= 1;
                            //---//

                            switch ((hold & 0x03) /*BITS(2)*/ ) {
                                case 0:
                                    /* stored block */
                                    //Tracev((stderr, "inflate:     stored block%s\n",
                                    //        state.last ? " (last)" : ""));
                                    state.mode = STORED;
                                    break;
                                case 1:
                                    /* fixed block */
                                    fixedtables(state);
                                    //Tracev((stderr, "inflate:     fixed codes block%s\n",
                                    //        state.last ? " (last)" : ""));
                                    state.mode = LEN_; /* decode codes */
                                    if (flush === Z_TREES) {
                                        //--- DROPBITS(2) ---//
                                        hold >>>= 2;
                                        bits -= 2;
                                        //---//
                                        break inf_leave;
                                    }
                                    break;
                                case 2:
                                    /* dynamic block */
                                    //Tracev((stderr, "inflate:     dynamic codes block%s\n",
                                    //        state.last ? " (last)" : ""));
                                    state.mode = TABLE;
                                    break;
                                case 3:
                                    strm.msg = 'invalid block type';
                                    state.mode = BAD;
                            }
                            //--- DROPBITS(2) ---//
                            hold >>>= 2;
                            bits -= 2;
                            //---//
                            break;
                        case STORED:
                            //--- BYTEBITS() ---// /* go to byte boundary */
                            hold >>>= bits & 7;
                            bits -= bits & 7;
                            //---//
                            //=== NEEDBITS(32); */
                            while (bits < 32) {
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                            }
                            //===//
                            if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
                                strm.msg = 'invalid stored block lengths';
                                state.mode = BAD;
                                break;
                            }
                            state.length = hold & 0xffff;
                            //Tracev((stderr, "inflate:       stored length %u\n",
                            //        state.length));
                            //=== INITBITS();
                            hold = 0;
                            bits = 0;
                            //===//
                            state.mode = COPY_;
                            if (flush === Z_TREES) { break inf_leave; }
                            /* falls through */
                        case COPY_:
                            state.mode = COPY;
                            /* falls through */
                        case COPY:
                            copy = state.length;
                            if (copy) {
                                if (copy > have) { copy = have; }
                                if (copy > left) { copy = left; }
                                if (copy === 0) { break inf_leave; }
                                //--- zmemcpy(put, next, copy); ---
                                utils.arraySet(output, input, next, copy, put);
                                //---//
                                have -= copy;
                                next += copy;
                                left -= copy;
                                put += copy;
                                state.length -= copy;
                                break;
                            }
                            //Tracev((stderr, "inflate:       stored end\n"));
                            state.mode = TYPE;
                            break;
                        case TABLE:
                            //=== NEEDBITS(14); */
                            while (bits < 14) {
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                            }
                            //===//
                            state.nlen = (hold & 0x1f) /*BITS(5)*/ + 257;
                            //--- DROPBITS(5) ---//
                            hold >>>= 5;
                            bits -= 5;
                            //---//
                            state.ndist = (hold & 0x1f) /*BITS(5)*/ + 1;
                            //--- DROPBITS(5) ---//
                            hold >>>= 5;
                            bits -= 5;
                            //---//
                            state.ncode = (hold & 0x0f) /*BITS(4)*/ + 4;
                            //--- DROPBITS(4) ---//
                            hold >>>= 4;
                            bits -= 4;
                            //---//
                            //#ifndef PKZIP_BUG_WORKAROUND
                            if (state.nlen > 286 || state.ndist > 30) {
                                strm.msg = 'too many length or distance symbols';
                                state.mode = BAD;
                                break;
                            }
                            //#endif
                            //Tracev((stderr, "inflate:       table sizes ok\n"));
                            state.have = 0;
                            state.mode = LENLENS;
                            /* falls through */
                        case LENLENS:
                            while (state.have < state.ncode) {
                                //=== NEEDBITS(3);
                                while (bits < 3) {
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                state.lens[order[state.have++]] = (hold & 0x07); //BITS(3);
                                //--- DROPBITS(3) ---//
                                hold >>>= 3;
                                bits -= 3;
                                //---//
                            }
                            while (state.have < 19) {
                                state.lens[order[state.have++]] = 0;
                            }
                            // We have separate tables & no pointers. 2 commented lines below not needed.
                            //state.next = state.codes;
                            //state.lencode = state.next;
                            // Switch to use dynamic table
                            state.lencode = state.lendyn;
                            state.lenbits = 7;

                            opts = { bits: state.lenbits };
                            ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
                            state.lenbits = opts.bits;

                            if (ret) {
                                strm.msg = 'invalid code lengths set';
                                state.mode = BAD;
                                break;
                            }
                            //Tracev((stderr, "inflate:       code lengths ok\n"));
                            state.have = 0;
                            state.mode = CODELENS;
                            /* falls through */
                        case CODELENS:
                            while (state.have < state.nlen + state.ndist) {
                                for (;;) {
                                    here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/
                                    here_bits = here >>> 24;
                                    here_op = (here >>> 16) & 0xff;
                                    here_val = here & 0xffff;

                                    if ((here_bits) <= bits) { break; }
                                    //--- PULLBYTE() ---//
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                    //---//
                                }
                                if (here_val < 16) {
                                    //--- DROPBITS(here.bits) ---//
                                    hold >>>= here_bits;
                                    bits -= here_bits;
                                    //---//
                                    state.lens[state.have++] = here_val;
                                } else {
                                    if (here_val === 16) {
                                        //=== NEEDBITS(here.bits + 2);
                                        n = here_bits + 2;
                                        while (bits < n) {
                                            if (have === 0) { break inf_leave; }
                                            have--;
                                            hold += input[next++] << bits;
                                            bits += 8;
                                        }
                                        //===//
                                        //--- DROPBITS(here.bits) ---//
                                        hold >>>= here_bits;
                                        bits -= here_bits;
                                        //---//
                                        if (state.have === 0) {
                                            strm.msg = 'invalid bit length repeat';
                                            state.mode = BAD;
                                            break;
                                        }
                                        len = state.lens[state.have - 1];
                                        copy = 3 + (hold & 0x03); //BITS(2);
                                        //--- DROPBITS(2) ---//
                                        hold >>>= 2;
                                        bits -= 2;
                                        //---//
                                    } else if (here_val === 17) {
                                        //=== NEEDBITS(here.bits + 3);
                                        n = here_bits + 3;
                                        while (bits < n) {
                                            if (have === 0) { break inf_leave; }
                                            have--;
                                            hold += input[next++] << bits;
                                            bits += 8;
                                        }
                                        //===//
                                        //--- DROPBITS(here.bits) ---//
                                        hold >>>= here_bits;
                                        bits -= here_bits;
                                        //---//
                                        len = 0;
                                        copy = 3 + (hold & 0x07); //BITS(3);
                                        //--- DROPBITS(3) ---//
                                        hold >>>= 3;
                                        bits -= 3;
                                        //---//
                                    } else {
                                        //=== NEEDBITS(here.bits + 7);
                                        n = here_bits + 7;
                                        while (bits < n) {
                                            if (have === 0) { break inf_leave; }
                                            have--;
                                            hold += input[next++] << bits;
                                            bits += 8;
                                        }
                                        //===//
                                        //--- DROPBITS(here.bits) ---//
                                        hold >>>= here_bits;
                                        bits -= here_bits;
                                        //---//
                                        len = 0;
                                        copy = 11 + (hold & 0x7f); //BITS(7);
                                        //--- DROPBITS(7) ---//
                                        hold >>>= 7;
                                        bits -= 7;
                                        //---//
                                    }
                                    if (state.have + copy > state.nlen + state.ndist) {
                                        strm.msg = 'invalid bit length repeat';
                                        state.mode = BAD;
                                        break;
                                    }
                                    while (copy--) {
                                        state.lens[state.have++] = len;
                                    }
                                }
                            }

                            /* handle error breaks in while */
                            if (state.mode === BAD) { break; }

                            /* check for end-of-block code (better have one) */
                            if (state.lens[256] === 0) {
                                strm.msg = 'invalid code -- missing end-of-block';
                                state.mode = BAD;
                                break;
                            }

                            /* build code tables -- note: do not change the lenbits or distbits
                               values here (9 and 6) without reading the comments in inftrees.h
                               concerning the ENOUGH constants, which depend on those values */
                            state.lenbits = 9;

                            opts = { bits: state.lenbits };
                            ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
                            // We have separate tables & no pointers. 2 commented lines below not needed.
                            // state.next_index = opts.table_index;
                            state.lenbits = opts.bits;
                            // state.lencode = state.next;

                            if (ret) {
                                strm.msg = 'invalid literal/lengths set';
                                state.mode = BAD;
                                break;
                            }

                            state.distbits = 6;
                            //state.distcode.copy(state.codes);
                            // Switch to use dynamic table
                            state.distcode = state.distdyn;
                            opts = { bits: state.distbits };
                            ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
                            // We have separate tables & no pointers. 2 commented lines below not needed.
                            // state.next_index = opts.table_index;
                            state.distbits = opts.bits;
                            // state.distcode = state.next;

                            if (ret) {
                                strm.msg = 'invalid distances set';
                                state.mode = BAD;
                                break;
                            }
                            //Tracev((stderr, 'inflate:       codes ok\n'));
                            state.mode = LEN_;
                            if (flush === Z_TREES) { break inf_leave; }
                            /* falls through */
                        case LEN_:
                            state.mode = LEN;
                            /* falls through */
                        case LEN:
                            if (have >= 6 && left >= 258) {
                                //--- RESTORE() ---
                                strm.next_out = put;
                                strm.avail_out = left;
                                strm.next_in = next;
                                strm.avail_in = have;
                                state.hold = hold;
                                state.bits = bits;
                                //---
                                inflate_fast(strm, _out);
                                //--- LOAD() ---
                                put = strm.next_out;
                                output = strm.output;
                                left = strm.avail_out;
                                next = strm.next_in;
                                input = strm.input;
                                have = strm.avail_in;
                                hold = state.hold;
                                bits = state.bits;
                                //---

                                if (state.mode === TYPE) {
                                    state.back = -1;
                                }
                                break;
                            }
                            state.back = 0;
                            for (;;) {
                                here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/
                                here_bits = here >>> 24;
                                here_op = (here >>> 16) & 0xff;
                                here_val = here & 0xffff;

                                if (here_bits <= bits) { break; }
                                //--- PULLBYTE() ---//
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                                //---//
                            }
                            if (here_op && (here_op & 0xf0) === 0) {
                                last_bits = here_bits;
                                last_op = here_op;
                                last_val = here_val;
                                for (;;) {
                                    here = state.lencode[last_val +
                                        ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];
                                    here_bits = here >>> 24;
                                    here_op = (here >>> 16) & 0xff;
                                    here_val = here & 0xffff;

                                    if ((last_bits + here_bits) <= bits) { break; }
                                    //--- PULLBYTE() ---//
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                    //---//
                                }
                                //--- DROPBITS(last.bits) ---//
                                hold >>>= last_bits;
                                bits -= last_bits;
                                //---//
                                state.back += last_bits;
                            }
                            //--- DROPBITS(here.bits) ---//
                            hold >>>= here_bits;
                            bits -= here_bits;
                            //---//
                            state.back += here_bits;
                            state.length = here_val;
                            if (here_op === 0) {
                                //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
                                //        "inflate:         literal '%c'\n" :
                                //        "inflate:         literal 0x%02x\n", here.val));
                                state.mode = LIT;
                                break;
                            }
                            if (here_op & 32) {
                                //Tracevv((stderr, "inflate:         end of block\n"));
                                state.back = -1;
                                state.mode = TYPE;
                                break;
                            }
                            if (here_op & 64) {
                                strm.msg = 'invalid literal/length code';
                                state.mode = BAD;
                                break;
                            }
                            state.extra = here_op & 15;
                            state.mode = LENEXT;
                            /* falls through */
                        case LENEXT:
                            if (state.extra) {
                                //=== NEEDBITS(state.extra);
                                n = state.extra;
                                while (bits < n) {
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                state.length += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;
                                //--- DROPBITS(state.extra) ---//
                                hold >>>= state.extra;
                                bits -= state.extra;
                                //---//
                                state.back += state.extra;
                            }
                            //Tracevv((stderr, "inflate:         length %u\n", state.length));
                            state.was = state.length;
                            state.mode = DIST;
                            /* falls through */
                        case DIST:
                            for (;;) {
                                here = state.distcode[hold & ((1 << state.distbits) - 1)]; /*BITS(state.distbits)*/
                                here_bits = here >>> 24;
                                here_op = (here >>> 16) & 0xff;
                                here_val = here & 0xffff;

                                if ((here_bits) <= bits) { break; }
                                //--- PULLBYTE() ---//
                                if (have === 0) { break inf_leave; }
                                have--;
                                hold += input[next++] << bits;
                                bits += 8;
                                //---//
                            }
                            if ((here_op & 0xf0) === 0) {
                                last_bits = here_bits;
                                last_op = here_op;
                                last_val = here_val;
                                for (;;) {
                                    here = state.distcode[last_val +
                                        ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];
                                    here_bits = here >>> 24;
                                    here_op = (here >>> 16) & 0xff;
                                    here_val = here & 0xffff;

                                    if ((last_bits + here_bits) <= bits) { break; }
                                    //--- PULLBYTE() ---//
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                    //---//
                                }
                                //--- DROPBITS(last.bits) ---//
                                hold >>>= last_bits;
                                bits -= last_bits;
                                //---//
                                state.back += last_bits;
                            }
                            //--- DROPBITS(here.bits) ---//
                            hold >>>= here_bits;
                            bits -= here_bits;
                            //---//
                            state.back += here_bits;
                            if (here_op & 64) {
                                strm.msg = 'invalid distance code';
                                state.mode = BAD;
                                break;
                            }
                            state.offset = here_val;
                            state.extra = (here_op) & 15;
                            state.mode = DISTEXT;
                            /* falls through */
                        case DISTEXT:
                            if (state.extra) {
                                //=== NEEDBITS(state.extra);
                                n = state.extra;
                                while (bits < n) {
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                state.offset += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;
                                //--- DROPBITS(state.extra) ---//
                                hold >>>= state.extra;
                                bits -= state.extra;
                                //---//
                                state.back += state.extra;
                            }
                            //#ifdef INFLATE_STRICT
                            if (state.offset > state.dmax) {
                                strm.msg = 'invalid distance too far back';
                                state.mode = BAD;
                                break;
                            }
                            //#endif
                            //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
                            state.mode = MATCH;
                            /* falls through */
                        case MATCH:
                            if (left === 0) { break inf_leave; }
                            copy = _out - left;
                            if (state.offset > copy) { /* copy from window */
                                copy = state.offset - copy;
                                if (copy > state.whave) {
                                    if (state.sane) {
                                        strm.msg = 'invalid distance too far back';
                                        state.mode = BAD;
                                        break;
                                    }
                                    // (!) This block is disabled in zlib defaults,
                                    // don't enable it for binary compatibility
                                    //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
                                    //          Trace((stderr, "inflate.c too far\n"));
                                    //          copy -= state.whave;
                                    //          if (copy > state.length) { copy = state.length; }
                                    //          if (copy > left) { copy = left; }
                                    //          left -= copy;
                                    //          state.length -= copy;
                                    //          do {
                                    //            output[put++] = 0;
                                    //          } while (--copy);
                                    //          if (state.length === 0) { state.mode = LEN; }
                                    //          break;
                                    //#endif
                                }
                                if (copy > state.wnext) {
                                    copy -= state.wnext;
                                    from = state.wsize - copy;
                                } else {
                                    from = state.wnext - copy;
                                }
                                if (copy > state.length) { copy = state.length; }
                                from_source = state.window;
                            } else { /* copy from output */
                                from_source = output;
                                from = put - state.offset;
                                copy = state.length;
                            }
                            if (copy > left) { copy = left; }
                            left -= copy;
                            state.length -= copy;
                            do {
                                output[put++] = from_source[from++];
                            } while (--copy);
                            if (state.length === 0) { state.mode = LEN; }
                            break;
                        case LIT:
                            if (left === 0) { break inf_leave; }
                            output[put++] = state.length;
                            left--;
                            state.mode = LEN;
                            break;
                        case CHECK:
                            if (state.wrap) {
                                //=== NEEDBITS(32);
                                while (bits < 32) {
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    // Use '|' instead of '+' to make sure that result is signed
                                    hold |= input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                _out -= left;
                                strm.total_out += _out;
                                state.total += _out;
                                if (_out) {
                                    strm.adler = state.check =
                                        /*UPDATE(state.check, put - _out, _out);*/
                                        (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

                                }
                                _out = left;
                                // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
                                if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                                    strm.msg = 'incorrect data check';
                                    state.mode = BAD;
                                    break;
                                }
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                                //Tracev((stderr, "inflate:   check matches trailer\n"));
                            }
                            state.mode = LENGTH;
                            /* falls through */
                        case LENGTH:
                            if (state.wrap && state.flags) {
                                //=== NEEDBITS(32);
                                while (bits < 32) {
                                    if (have === 0) { break inf_leave; }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                if (hold !== (state.total & 0xffffffff)) {
                                    strm.msg = 'incorrect length check';
                                    state.mode = BAD;
                                    break;
                                }
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                                //Tracev((stderr, "inflate:   length matches trailer\n"));
                            }
                            state.mode = DONE;
                            /* falls through */
                        case DONE:
                            ret = Z_STREAM_END;
                            break inf_leave;
                        case BAD:
                            ret = Z_DATA_ERROR;
                            break inf_leave;
                        case MEM:
                            return Z_MEM_ERROR;
                        case SYNC:
                            /* falls through */
                        default:
                            return Z_STREAM_ERROR;
                    }
                }

            // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

            /*
               Return from inflate(), updating the total counts and the check value.
               If there was no progress during the inflate() call, return a buffer
               error.  Call updatewindow() to create and/or update the window state.
               Note: a memory error from inflate() is non-recoverable.
             */

            //--- RESTORE() ---
            strm.next_out = put;
            strm.avail_out = left;
            strm.next_in = next;
            strm.avail_in = have;
            state.hold = hold;
            state.bits = bits;
            //---

            if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                    (state.mode < CHECK || flush !== Z_FINISH))) {
                if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
                    state.mode = MEM;
                    return Z_MEM_ERROR;
                }
            }
            _in -= strm.avail_in;
            _out -= strm.avail_out;
            strm.total_in += _in;
            strm.total_out += _out;
            state.total += _out;
            if (state.wrap && _out) {
                strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
                    (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
            }
            strm.data_type = state.bits + (state.last ? 64 : 0) +
                (state.mode === TYPE ? 128 : 0) +
                (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
            if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
                ret = Z_BUF_ERROR;
            }
            return ret;
        }

        function inflateEnd(strm) {

            if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/ ) {
                return Z_STREAM_ERROR;
            }

            var state = strm.state;
            if (state.window) {
                state.window = null;
            }
            strm.state = null;
            return Z_OK;
        }

        function inflateGetHeader(strm, head) {
            var state;

            /* check state */
            if (!strm || !strm.state) { return Z_STREAM_ERROR; }
            state = strm.state;
            if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

            /* save header structure */
            state.head = head;
            head.done = false;
            return Z_OK;
        }

        function inflateSetDictionary(strm, dictionary) {
            var dictLength = dictionary.length;

            var state;
            var dictid;
            var ret;

            /* check state */
            if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */ ) { return Z_STREAM_ERROR; }
            state = strm.state;

            if (state.wrap !== 0 && state.mode !== DICT) {
                return Z_STREAM_ERROR;
            }

            /* check for correct dictionary identifier */
            if (state.mode === DICT) {
                dictid = 1; /* adler32(0, null, 0)*/
                /* dictid = adler32(dictid, dictionary, dictLength); */
                dictid = adler32(dictid, dictionary, dictLength, 0);
                if (dictid !== state.check) {
                    return Z_DATA_ERROR;
                }
            }
            /* copy dictionary to window using updatewindow(), which will amend the
             existing dictionary if appropriate */
            ret = updatewindow(strm, dictionary, dictLength, dictLength);
            if (ret) {
                state.mode = MEM;
                return Z_MEM_ERROR;
            }
            state.havedict = 1;
            // Tracev((stderr, "inflate:   dictionary set\n"));
            return Z_OK;
        }

        exports.inflateReset = inflateReset;
        exports.inflateReset2 = inflateReset2;
        exports.inflateResetKeep = inflateResetKeep;
        exports.inflateInit = inflateInit;
        exports.inflateInit2 = inflateInit2;
        exports.inflate = inflate;
        exports.inflateEnd = inflateEnd;
        exports.inflateGetHeader = inflateGetHeader;
        exports.inflateSetDictionary = inflateSetDictionary;
        exports.inflateInfo = 'pako inflate (from Nodeca project)';

        /* Not implemented
        exports.inflateCopy = inflateCopy;
        exports.inflateGetDictionary = inflateGetDictionary;
        exports.inflateMark = inflateMark;
        exports.inflatePrime = inflatePrime;
        exports.inflateSync = inflateSync;
        exports.inflateSyncPoint = inflateSyncPoint;
        exports.inflateUndermine = inflateUndermine;
        */

    }, { "../utils/common": 68, "./adler32": 69, "./crc32": 71, "./inffast": 73, "./inftrees": 75 }],
    75: [function(require, module, exports) {
        'use strict';

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        var utils = require('../utils/common');

        var MAXBITS = 15;
        var ENOUGH_LENS = 852;
        var ENOUGH_DISTS = 592;
        //var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

        var CODES = 0;
        var LENS = 1;
        var DISTS = 2;

        var lbase = [ /* Length codes 257..285 base */
            3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
            35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
        ];

        var lext = [ /* Length codes 257..285 extra */
            16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
            19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
        ];

        var dbase = [ /* Distance codes 0..29 base */
            1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
            257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
            8193, 12289, 16385, 24577, 0, 0
        ];

        var dext = [ /* Distance codes 0..29 extra */
            16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
            23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
            28, 28, 29, 29, 64, 64
        ];

        module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
            var bits = opts.bits;
            //here = opts.here; /* table entry for duplication */

            var len = 0; /* a code's length in bits */
            var sym = 0; /* index of code symbols */
            var min = 0,
                max = 0; /* minimum and maximum code lengths */
            var root = 0; /* number of index bits for root table */
            var curr = 0; /* number of index bits for current table */
            var drop = 0; /* code bits to drop for sub-table */
            var left = 0; /* number of prefix codes available */
            var used = 0; /* code entries in table used */
            var huff = 0; /* Huffman code */
            var incr; /* for incrementing code, index */
            var fill; /* index for replicating entries */
            var low; /* low bits for current root entry */
            var mask; /* mask for low root bits */
            var next; /* next available space in table */
            var base = null; /* base value table to use */
            var base_index = 0;
            //  var shoextra;    /* extra bits table to use */
            var end; /* use base and extra for symbol > end */
            var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
            var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
            var extra = null;
            var extra_index = 0;

            var here_bits, here_op, here_val;

            /*
             Process a set of code lengths to create a canonical Huffman code.  The
             code lengths are lens[0..codes-1].  Each length corresponds to the
             symbols 0..codes-1.  The Huffman code is generated by first sorting the
             symbols by length from short to long, and retaining the symbol order
             for codes with equal lengths.  Then the code starts with all zero bits
             for the first code of the shortest length, and the codes are integer
             increments for the same length, and zeros are appended as the length
             increases.  For the deflate format, these bits are stored backwards
             from their more natural integer increment ordering, and so when the
             decoding tables are built in the large loop below, the integer codes
             are incremented backwards.

             This routine assumes, but does not check, that all of the entries in
             lens[] are in the range 0..MAXBITS.  The caller must assure this.
             1..MAXBITS is interpreted as that code length.  zero means that that
             symbol does not occur in this code.

             The codes are sorted by computing a count of codes for each length,
             creating from that a table of starting indices for each length in the
             sorted table, and then entering the symbols in order in the sorted
             table.  The sorted table is work[], with that space being provided by
             the caller.

             The length counts are used for other purposes as well, i.e. finding
             the minimum and maximum length codes, determining if there are any
             codes at all, checking for a valid set of lengths, and looking ahead
             at length counts to determine sub-table sizes when building the
             decoding tables.
             */

            /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
            for (len = 0; len <= MAXBITS; len++) {
                count[len] = 0;
            }
            for (sym = 0; sym < codes; sym++) {
                count[lens[lens_index + sym]]++;
            }

            /* bound code lengths, force root to be within code lengths */
            root = bits;
            for (max = MAXBITS; max >= 1; max--) {
                if (count[max] !== 0) { break; }
            }
            if (root > max) {
                root = max;
            }
            if (max === 0) { /* no symbols to code at all */
                //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
                //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
                //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
                table[table_index++] = (1 << 24) | (64 << 16) | 0;


                //table.op[opts.table_index] = 64;
                //table.bits[opts.table_index] = 1;
                //table.val[opts.table_index++] = 0;
                table[table_index++] = (1 << 24) | (64 << 16) | 0;

                opts.bits = 1;
                return 0; /* no symbols, but wait for decoding to report error */
            }
            for (min = 1; min < max; min++) {
                if (count[min] !== 0) { break; }
            }
            if (root < min) {
                root = min;
            }

            /* check for an over-subscribed or incomplete set of lengths */
            left = 1;
            for (len = 1; len <= MAXBITS; len++) {
                left <<= 1;
                left -= count[len];
                if (left < 0) {
                    return -1;
                } /* over-subscribed */
            }
            if (left > 0 && (type === CODES || max !== 1)) {
                return -1; /* incomplete set */
            }

            /* generate offsets into symbol table for each length for sorting */
            offs[1] = 0;
            for (len = 1; len < MAXBITS; len++) {
                offs[len + 1] = offs[len] + count[len];
            }

            /* sort symbols by length, by symbol order within each length */
            for (sym = 0; sym < codes; sym++) {
                if (lens[lens_index + sym] !== 0) {
                    work[offs[lens[lens_index + sym]]++] = sym;
                }
            }

            /*
             Create and fill in decoding tables.  In this loop, the table being
             filled is at next and has curr index bits.  The code being used is huff
             with length len.  That code is converted to an index by dropping drop
             bits off of the bottom.  For codes where len is less than drop + curr,
             those top drop + curr - len bits are incremented through all values to
             fill the table with replicated entries.

             root is the number of index bits for the root table.  When len exceeds
             root, sub-tables are created pointed to by the root entry with an index
             of the low root bits of huff.  This is saved in low to check for when a
             new sub-table should be started.  drop is zero when the root table is
             being filled, and drop is root when sub-tables are being filled.

             When a new sub-table is needed, it is necessary to look ahead in the
             code lengths to determine what size sub-table is needed.  The length
             counts are used for this, and so count[] is decremented as codes are
             entered in the tables.

             used keeps track of how many table entries have been allocated from the
             provided *table space.  It is checked for LENS and DIST tables against
             the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
             the initial root table size constants.  See the comments in inftrees.h
             for more information.

             sym increments through all symbols, and the loop terminates when
             all codes of length max, i.e. all codes, have been processed.  This
             routine permits incomplete codes, so another loop after this one fills
             in the rest of the decoding tables with invalid code markers.
             */

            /* set up for code type */
            // poor man optimization - use if-else instead of switch,
            // to avoid deopts in old v8
            if (type === CODES) {
                base = extra = work; /* dummy value--not used */
                end = 19;

            } else if (type === LENS) {
                base = lbase;
                base_index -= 257;
                extra = lext;
                extra_index -= 257;
                end = 256;

            } else { /* DISTS */
                base = dbase;
                extra = dext;
                end = -1;
            }

            /* initialize opts for loop */
            huff = 0; /* starting code */
            sym = 0; /* starting code symbol */
            len = min; /* starting code length */
            next = table_index; /* current table to fill in */
            curr = root; /* current table index bits */
            drop = 0; /* current bits to drop from code for index */
            low = -1; /* trigger new sub-table when len > root */
            used = 1 << root; /* use root table entries */
            mask = used - 1; /* mask for comparing low */

            /* check available table space */
            if ((type === LENS && used > ENOUGH_LENS) ||
                (type === DISTS && used > ENOUGH_DISTS)) {
                return 1;
            }

            /* process all codes and make table entries */
            for (;;) {
                /* create table entry */
                here_bits = len - drop;
                if (work[sym] < end) {
                    here_op = 0;
                    here_val = work[sym];
                } else if (work[sym] > end) {
                    here_op = extra[extra_index + work[sym]];
                    here_val = base[base_index + work[sym]];
                } else {
                    here_op = 32 + 64; /* end of block */
                    here_val = 0;
                }

                /* replicate for those indices with low len bits equal to huff */
                incr = 1 << (len - drop);
                fill = 1 << curr;
                min = fill; /* save offset to next table */
                do {
                    fill -= incr;
                    table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val | 0;
                } while (fill !== 0);

                /* backwards increment the len-bit code huff */
                incr = 1 << (len - 1);
                while (huff & incr) {
                    incr >>= 1;
                }
                if (incr !== 0) {
                    huff &= incr - 1;
                    huff += incr;
                } else {
                    huff = 0;
                }

                /* go to next symbol, update count, len */
                sym++;
                if (--count[len] === 0) {
                    if (len === max) { break; }
                    len = lens[lens_index + work[sym]];
                }

                /* create new sub-table if needed */
                if (len > root && (huff & mask) !== low) {
                    /* if first time, transition to sub-tables */
                    if (drop === 0) {
                        drop = root;
                    }

                    /* increment past last table */
                    next += min; /* here min is 1 << curr */

                    /* determine length of next table */
                    curr = len - drop;
                    left = 1 << curr;
                    while (curr + drop < max) {
                        left -= count[curr + drop];
                        if (left <= 0) { break; }
                        curr++;
                        left <<= 1;
                    }

                    /* check for enough space */
                    used += 1 << curr;
                    if ((type === LENS && used > ENOUGH_LENS) ||
                        (type === DISTS && used > ENOUGH_DISTS)) {
                        return 1;
                    }

                    /* point entry in root table to sub-table */
                    low = huff & mask;
                    /*table.op[low] = curr;
                    table.bits[low] = root;
                    table.val[low] = next - opts.table_index;*/
                    table[low] = (root << 24) | (curr << 16) | (next - table_index) | 0;
                }
            }

            /* fill in remaining table entry if code is incomplete (guaranteed to have
             at most one remaining entry, since if the code is incomplete, the
             maximum code length that was allowed to get this far is one bit) */
            if (huff !== 0) {
                //table.op[next + huff] = 64;            /* invalid code marker */
                //table.bits[next + huff] = len - drop;
                //table.val[next + huff] = 0;
                table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
            }

            /* set return parameters */
            //opts.table_index += used;
            opts.bits = root;
            return 0;
        };

    }, { "../utils/common": 68 }],
    76: [function(require, module, exports) {
        'use strict';

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        module.exports = {
            2: 'need dictionary',
            /* Z_NEED_DICT       2  */
            1: 'stream end',
            /* Z_STREAM_END      1  */
            0: '',
            /* Z_OK              0  */
            '-1': 'file error',
            /* Z_ERRNO         (-1) */
            '-2': 'stream error',
            /* Z_STREAM_ERROR  (-2) */
            '-3': 'data error',
            /* Z_DATA_ERROR    (-3) */
            '-4': 'insufficient memory',
            /* Z_MEM_ERROR     (-4) */
            '-5': 'buffer error',
            /* Z_BUF_ERROR     (-5) */
            '-6': 'incompatible version' /* Z_VERSION_ERROR (-6) */
        };

    }, {}],
    77: [function(require, module, exports) {
        'use strict';

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        var utils = require('../utils/common');

        /* Public constants ==========================================================*/
        /* ===========================================================================*/


        //var Z_FILTERED          = 1;
        //var Z_HUFFMAN_ONLY      = 2;
        //var Z_RLE               = 3;
        var Z_FIXED = 4;
        //var Z_DEFAULT_STRATEGY  = 0;

        /* Possible values of the data_type field (though see inflate()) */
        var Z_BINARY = 0;
        var Z_TEXT = 1;
        //var Z_ASCII             = 1; // = Z_TEXT
        var Z_UNKNOWN = 2;

        /*============================================================================*/


        function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

        // From zutil.h

        var STORED_BLOCK = 0;
        var STATIC_TREES = 1;
        var DYN_TREES = 2;
        /* The three kinds of block type */

        var MIN_MATCH = 3;
        var MAX_MATCH = 258;
        /* The minimum and maximum match lengths */

        // From deflate.h
        /* ===========================================================================
         * Internal compression state.
         */

        var LENGTH_CODES = 29;
        /* number of length codes, not counting the special END_BLOCK code */

        var LITERALS = 256;
        /* number of literal bytes 0..255 */

        var L_CODES = LITERALS + 1 + LENGTH_CODES;
        /* number of Literal or Length codes, including the END_BLOCK code */

        var D_CODES = 30;
        /* number of distance codes */

        var BL_CODES = 19;
        /* number of codes used to transfer the bit lengths */

        var HEAP_SIZE = 2 * L_CODES + 1;
        /* maximum heap size */

        var MAX_BITS = 15;
        /* All codes must not exceed MAX_BITS bits */

        var Buf_size = 16;
        /* size of bit buffer in bi_buf */


        /* ===========================================================================
         * Constants
         */

        var MAX_BL_BITS = 7;
        /* Bit length codes must not exceed MAX_BL_BITS bits */

        var END_BLOCK = 256;
        /* end of block literal code */

        var REP_3_6 = 16;
        /* repeat previous bit length 3-6 times (2 bits of repeat count) */

        var REPZ_3_10 = 17;
        /* repeat a zero length 3-10 times  (3 bits of repeat count) */

        var REPZ_11_138 = 18;
        /* repeat a zero length 11-138 times  (7 bits of repeat count) */

        /* eslint-disable comma-spacing,array-bracket-spacing */
        var extra_lbits = /* extra bits for each length code */ [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];

        var extra_dbits = /* extra bits for each distance code */ [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

        var extra_blbits = /* extra bits for each bit length code */ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];

        var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
        /* eslint-enable comma-spacing,array-bracket-spacing */

        /* The lengths of the bit length codes are sent in order of decreasing
         * probability, to avoid transmitting the lengths for unused bit length codes.
         */

        /* ===========================================================================
         * Local data. These are initialized only once.
         */

        // We pre-fill arrays with 0 to avoid uninitialized gaps

        var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

        // !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
        var static_ltree = new Array((L_CODES + 2) * 2);
        zero(static_ltree);
        /* The static literal tree. Since the bit lengths are imposed, there is no
         * need for the L_CODES extra codes used during heap construction. However
         * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
         * below).
         */

        var static_dtree = new Array(D_CODES * 2);
        zero(static_dtree);
        /* The static distance tree. (Actually a trivial tree since all codes use
         * 5 bits.)
         */

        var _dist_code = new Array(DIST_CODE_LEN);
        zero(_dist_code);
        /* Distance codes. The first 256 values correspond to the distances
         * 3 .. 258, the last 256 values correspond to the top 8 bits of
         * the 15 bit distances.
         */

        var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
        zero(_length_code);
        /* length code for each normalized match length (0 == MIN_MATCH) */

        var base_length = new Array(LENGTH_CODES);
        zero(base_length);
        /* First normalized length for each code (0 = MIN_MATCH) */

        var base_dist = new Array(D_CODES);
        zero(base_dist);
        /* First normalized distance for each code (0 = distance of 1) */


        function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

            this.static_tree = static_tree; /* static tree or NULL */
            this.extra_bits = extra_bits; /* extra bits for each code or NULL */
            this.extra_base = extra_base; /* base index for extra_bits */
            this.elems = elems; /* max number of elements in the tree */
            this.max_length = max_length; /* max bit length for the codes */

            // show if `static_tree` has data or dummy - needed for monomorphic objects
            this.has_stree = static_tree && static_tree.length;
        }


        var static_l_desc;
        var static_d_desc;
        var static_bl_desc;


        function TreeDesc(dyn_tree, stat_desc) {
            this.dyn_tree = dyn_tree; /* the dynamic tree */
            this.max_code = 0; /* largest code with non zero frequency */
            this.stat_desc = stat_desc; /* the corresponding static tree */
        }



        function d_code(dist) {
            return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
        }


        /* ===========================================================================
         * Output a short LSB first on the stream.
         * IN assertion: there is enough room in pendingBuf.
         */
        function put_short(s, w) {
            //    put_byte(s, (uch)((w) & 0xff));
            //    put_byte(s, (uch)((ush)(w) >> 8));
            s.pending_buf[s.pending++] = (w) & 0xff;
            s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
        }


        /* ===========================================================================
         * Send a value on a given number of bits.
         * IN assertion: length <= 16 and value fits in length bits.
         */
        function send_bits(s, value, length) {
            if (s.bi_valid > (Buf_size - length)) {
                s.bi_buf |= (value << s.bi_valid) & 0xffff;
                put_short(s, s.bi_buf);
                s.bi_buf = value >> (Buf_size - s.bi_valid);
                s.bi_valid += length - Buf_size;
            } else {
                s.bi_buf |= (value << s.bi_valid) & 0xffff;
                s.bi_valid += length;
            }
        }


        function send_code(s, c, tree) {
            send_bits(s, tree[c * 2] /*.Code*/ , tree[c * 2 + 1] /*.Len*/ );
        }


        /* ===========================================================================
         * Reverse the first len bits of a code, using straightforward code (a faster
         * method would use a table)
         * IN assertion: 1 <= len <= 15
         */
        function bi_reverse(code, len) {
            var res = 0;
            do {
                res |= code & 1;
                code >>>= 1;
                res <<= 1;
            } while (--len > 0);
            return res >>> 1;
        }


        /* ===========================================================================
         * Flush the bit buffer, keeping at most 7 bits in it.
         */
        function bi_flush(s) {
            if (s.bi_valid === 16) {
                put_short(s, s.bi_buf);
                s.bi_buf = 0;
                s.bi_valid = 0;

            } else if (s.bi_valid >= 8) {
                s.pending_buf[s.pending++] = s.bi_buf & 0xff;
                s.bi_buf >>= 8;
                s.bi_valid -= 8;
            }
        }


        /* ===========================================================================
         * Compute the optimal bit lengths for a tree and update the total bit length
         * for the current block.
         * IN assertion: the fields freq and dad are set, heap[heap_max] and
         *    above are the tree nodes sorted by increasing frequency.
         * OUT assertions: the field len is set to the optimal bit length, the
         *     array bl_count contains the frequencies for each bit length.
         *     The length opt_len is updated; static_len is also updated if stree is
         *     not null.
         */
        function gen_bitlen(s, desc)
        //    deflate_state *s;
        //    tree_desc *desc;    /* the tree descriptor */
        {
            var tree = desc.dyn_tree;
            var max_code = desc.max_code;
            var stree = desc.stat_desc.static_tree;
            var has_stree = desc.stat_desc.has_stree;
            var extra = desc.stat_desc.extra_bits;
            var base = desc.stat_desc.extra_base;
            var max_length = desc.stat_desc.max_length;
            var h; /* heap index */
            var n, m; /* iterate over the tree elements */
            var bits; /* bit length */
            var xbits; /* extra bits */
            var f; /* frequency */
            var overflow = 0; /* number of elements with bit length too large */

            for (bits = 0; bits <= MAX_BITS; bits++) {
                s.bl_count[bits] = 0;
            }

            /* In a first pass, compute the optimal bit lengths (which may
             * overflow in the case of the bit length tree).
             */
            tree[s.heap[s.heap_max] * 2 + 1] /*.Len*/ = 0; /* root of the heap */

            for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
                n = s.heap[h];
                bits = tree[tree[n * 2 + 1] /*.Dad*/ * 2 + 1] /*.Len*/ + 1;
                if (bits > max_length) {
                    bits = max_length;
                    overflow++;
                }
                tree[n * 2 + 1] /*.Len*/ = bits;
                /* We overwrite tree[n].Dad which is no longer needed */

                if (n > max_code) { continue; } /* not a leaf node */

                s.bl_count[bits]++;
                xbits = 0;
                if (n >= base) {
                    xbits = extra[n - base];
                }
                f = tree[n * 2] /*.Freq*/ ;
                s.opt_len += f * (bits + xbits);
                if (has_stree) {
                    s.static_len += f * (stree[n * 2 + 1] /*.Len*/ + xbits);
                }
            }
            if (overflow === 0) { return; }

            // Trace((stderr,"\nbit length overflow\n"));
            /* This happens for example on obj2 and pic of the Calgary corpus */

            /* Find the first bit length which could increase: */
            do {
                bits = max_length - 1;
                while (s.bl_count[bits] === 0) { bits--; }
                s.bl_count[bits]--; /* move one leaf down the tree */
                s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
                s.bl_count[max_length]--;
                /* The brother of the overflow item also moves one step up,
                 * but this does not affect bl_count[max_length]
                 */
                overflow -= 2;
            } while (overflow > 0);

            /* Now recompute all bit lengths, scanning in increasing frequency.
             * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
             * lengths instead of fixing only the wrong ones. This idea is taken
             * from 'ar' written by Haruhiko Okumura.)
             */
            for (bits = max_length; bits !== 0; bits--) {
                n = s.bl_count[bits];
                while (n !== 0) {
                    m = s.heap[--h];
                    if (m > max_code) { continue; }
                    if (tree[m * 2 + 1] /*.Len*/ !== bits) {
                        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
                        s.opt_len += (bits - tree[m * 2 + 1] /*.Len*/ ) * tree[m * 2] /*.Freq*/ ;
                        tree[m * 2 + 1] /*.Len*/ = bits;
                    }
                    n--;
                }
            }
        }


        /* ===========================================================================
         * Generate the codes for a given tree and bit counts (which need not be
         * optimal).
         * IN assertion: the array bl_count contains the bit length statistics for
         * the given tree and the field len is set for all tree elements.
         * OUT assertion: the field code is set for all tree elements of non
         *     zero code length.
         */
        function gen_codes(tree, max_code, bl_count)
        //    ct_data *tree;             /* the tree to decorate */
        //    int max_code;              /* largest code with non zero frequency */
        //    ushf *bl_count;            /* number of codes at each bit length */
        {
            var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
            var code = 0; /* running code value */
            var bits; /* bit index */
            var n; /* code index */

            /* The distribution counts are first used to generate the code values
             * without bit reversal.
             */
            for (bits = 1; bits <= MAX_BITS; bits++) {
                next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
            }
            /* Check that the bit counts in bl_count are consistent. The last code
             * must be all ones.
             */
            //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
            //        "inconsistent bit counts");
            //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

            for (n = 0; n <= max_code; n++) {
                var len = tree[n * 2 + 1] /*.Len*/ ;
                if (len === 0) { continue; }
                /* Now reverse the bits */
                tree[n * 2] /*.Code*/ = bi_reverse(next_code[len]++, len);

                //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
                //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
            }
        }


        /* ===========================================================================
         * Initialize the various 'constant' tables.
         */
        function tr_static_init() {
            var n; /* iterates over tree elements */
            var bits; /* bit counter */
            var length; /* length value */
            var code; /* code value */
            var dist; /* distance index */
            var bl_count = new Array(MAX_BITS + 1);
            /* number of codes at each bit length for an optimal tree */

            // do check in _tr_init()
            //if (static_init_done) return;

            /* For some embedded targets, global variables are not initialized: */
            /*#ifdef NO_INIT_GLOBAL_POINTERS
              static_l_desc.static_tree = static_ltree;
              static_l_desc.extra_bits = extra_lbits;
              static_d_desc.static_tree = static_dtree;
              static_d_desc.extra_bits = extra_dbits;
              static_bl_desc.extra_bits = extra_blbits;
            #endif*/

            /* Initialize the mapping length (0..255) -> length code (0..28) */
            length = 0;
            for (code = 0; code < LENGTH_CODES - 1; code++) {
                base_length[code] = length;
                for (n = 0; n < (1 << extra_lbits[code]); n++) {
                    _length_code[length++] = code;
                }
            }
            //Assert (length == 256, "tr_static_init: length != 256");
            /* Note that the length 255 (match length 258) can be represented
             * in two different ways: code 284 + 5 bits or code 285, so we
             * overwrite length_code[255] to use the best encoding:
             */
            _length_code[length - 1] = code;

            /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
            dist = 0;
            for (code = 0; code < 16; code++) {
                base_dist[code] = dist;
                for (n = 0; n < (1 << extra_dbits[code]); n++) {
                    _dist_code[dist++] = code;
                }
            }
            //Assert (dist == 256, "tr_static_init: dist != 256");
            dist >>= 7; /* from now on, all distances are divided by 128 */
            for (; code < D_CODES; code++) {
                base_dist[code] = dist << 7;
                for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
                    _dist_code[256 + dist++] = code;
                }
            }
            //Assert (dist == 256, "tr_static_init: 256+dist != 512");

            /* Construct the codes of the static literal tree */
            for (bits = 0; bits <= MAX_BITS; bits++) {
                bl_count[bits] = 0;
            }

            n = 0;
            while (n <= 143) {
                static_ltree[n * 2 + 1] /*.Len*/ = 8;
                n++;
                bl_count[8]++;
            }
            while (n <= 255) {
                static_ltree[n * 2 + 1] /*.Len*/ = 9;
                n++;
                bl_count[9]++;
            }
            while (n <= 279) {
                static_ltree[n * 2 + 1] /*.Len*/ = 7;
                n++;
                bl_count[7]++;
            }
            while (n <= 287) {
                static_ltree[n * 2 + 1] /*.Len*/ = 8;
                n++;
                bl_count[8]++;
            }
            /* Codes 286 and 287 do not exist, but we must include them in the
             * tree construction to get a canonical Huffman tree (longest code
             * all ones)
             */
            gen_codes(static_ltree, L_CODES + 1, bl_count);

            /* The static distance tree is trivial: */
            for (n = 0; n < D_CODES; n++) {
                static_dtree[n * 2 + 1] /*.Len*/ = 5;
                static_dtree[n * 2] /*.Code*/ = bi_reverse(n, 5);
            }

            // Now data ready and we can init static trees
            static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
            static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
            static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);

            //static_init_done = true;
        }


        /* ===========================================================================
         * Initialize a new block.
         */
        function init_block(s) {
            var n; /* iterates over tree elements */

            /* Initialize the trees. */
            for (n = 0; n < L_CODES; n++) { s.dyn_ltree[n * 2] /*.Freq*/ = 0; }
            for (n = 0; n < D_CODES; n++) { s.dyn_dtree[n * 2] /*.Freq*/ = 0; }
            for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2] /*.Freq*/ = 0; }

            s.dyn_ltree[END_BLOCK * 2] /*.Freq*/ = 1;
            s.opt_len = s.static_len = 0;
            s.last_lit = s.matches = 0;
        }


        /* ===========================================================================
         * Flush the bit buffer and align the output on a byte boundary
         */
        function bi_windup(s) {
            if (s.bi_valid > 8) {
                put_short(s, s.bi_buf);
            } else if (s.bi_valid > 0) {
                //put_byte(s, (Byte)s->bi_buf);
                s.pending_buf[s.pending++] = s.bi_buf;
            }
            s.bi_buf = 0;
            s.bi_valid = 0;
        }

        /* ===========================================================================
         * Copy a stored block, storing first the length and its
         * one's complement if requested.
         */
        function copy_block(s, buf, len, header)
        //DeflateState *s;
        //charf    *buf;    /* the input data */
        //unsigned len;     /* its length */
        //int      header;  /* true if block header must be written */
        {
            bi_windup(s); /* align on byte boundary */

            if (header) {
                put_short(s, len);
                put_short(s, ~len);
            }
            //  while (len--) {
            //    put_byte(s, *buf++);
            //  }
            utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
            s.pending += len;
        }

        /* ===========================================================================
         * Compares to subtrees, using the tree depth as tie breaker when
         * the subtrees have equal frequency. This minimizes the worst case length.
         */
        function smaller(tree, n, m, depth) {
            var _n2 = n * 2;
            var _m2 = m * 2;
            return (tree[_n2] /*.Freq*/ < tree[_m2] /*.Freq*/ ||
                (tree[_n2] /*.Freq*/ === tree[_m2] /*.Freq*/ && depth[n] <= depth[m]));
        }

        /* ===========================================================================
         * Restore the heap property by moving down the tree starting at node k,
         * exchanging a node with the smallest of its two sons if necessary, stopping
         * when the heap property is re-established (each father smaller than its
         * two sons).
         */
        function pqdownheap(s, tree, k)
        //    deflate_state *s;
        //    ct_data *tree;  /* the tree to restore */
        //    int k;               /* node to move down */
        {
            var v = s.heap[k];
            var j = k << 1; /* left son of k */
            while (j <= s.heap_len) {
                /* Set j to the smallest of the two sons: */
                if (j < s.heap_len &&
                    smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
                    j++;
                }
                /* Exit if v is smaller than both sons */
                if (smaller(tree, v, s.heap[j], s.depth)) { break; }

                /* Exchange v with the smallest son */
                s.heap[k] = s.heap[j];
                k = j;

                /* And continue down the tree, setting j to the left son of k */
                j <<= 1;
            }
            s.heap[k] = v;
        }


        // inlined manually
        // var SMALLEST = 1;

        /* ===========================================================================
         * Send the block data compressed using the given Huffman trees
         */
        function compress_block(s, ltree, dtree)
        //    deflate_state *s;
        //    const ct_data *ltree; /* literal tree */
        //    const ct_data *dtree; /* distance tree */
        {
            var dist; /* distance of matched string */
            var lc; /* match length or unmatched char (if dist == 0) */
            var lx = 0; /* running index in l_buf */
            var code; /* the code to send */
            var extra; /* number of extra bits to send */

            if (s.last_lit !== 0) {
                do {
                    dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
                    lc = s.pending_buf[s.l_buf + lx];
                    lx++;

                    if (dist === 0) {
                        send_code(s, lc, ltree); /* send a literal byte */
                        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
                    } else {
                        /* Here, lc is the match length - MIN_MATCH */
                        code = _length_code[lc];
                        send_code(s, code + LITERALS + 1, ltree); /* send the length code */
                        extra = extra_lbits[code];
                        if (extra !== 0) {
                            lc -= base_length[code];
                            send_bits(s, lc, extra); /* send the extra length bits */
                        }
                        dist--; /* dist is now the match distance - 1 */
                        code = d_code(dist);
                        //Assert (code < D_CODES, "bad d_code");

                        send_code(s, code, dtree); /* send the distance code */
                        extra = extra_dbits[code];
                        if (extra !== 0) {
                            dist -= base_dist[code];
                            send_bits(s, dist, extra); /* send the extra distance bits */
                        }
                    } /* literal or match pair ? */

                    /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
                    //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
                    //       "pendingBuf overflow");

                } while (lx < s.last_lit);
            }

            send_code(s, END_BLOCK, ltree);
        }


        /* ===========================================================================
         * Construct one Huffman tree and assigns the code bit strings and lengths.
         * Update the total bit length for the current block.
         * IN assertion: the field freq is set for all tree elements.
         * OUT assertions: the fields len and code are set to the optimal bit length
         *     and corresponding code. The length opt_len is updated; static_len is
         *     also updated if stree is not null. The field max_code is set.
         */
        function build_tree(s, desc)
        //    deflate_state *s;
        //    tree_desc *desc; /* the tree descriptor */
        {
            var tree = desc.dyn_tree;
            var stree = desc.stat_desc.static_tree;
            var has_stree = desc.stat_desc.has_stree;
            var elems = desc.stat_desc.elems;
            var n, m; /* iterate over heap elements */
            var max_code = -1; /* largest code with non zero frequency */
            var node; /* new node being created */

            /* Construct the initial heap, with least frequent element in
             * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
             * heap[0] is not used.
             */
            s.heap_len = 0;
            s.heap_max = HEAP_SIZE;

            for (n = 0; n < elems; n++) {
                if (tree[n * 2] /*.Freq*/ !== 0) {
                    s.heap[++s.heap_len] = max_code = n;
                    s.depth[n] = 0;

                } else {
                    tree[n * 2 + 1] /*.Len*/ = 0;
                }
            }

            /* The pkzip format requires that at least one distance code exists,
             * and that at least one bit should be sent even if there is only one
             * possible code. So to avoid special checks later on we force at least
             * two codes of non zero frequency.
             */
            while (s.heap_len < 2) {
                node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
                tree[node * 2] /*.Freq*/ = 1;
                s.depth[node] = 0;
                s.opt_len--;

                if (has_stree) {
                    s.static_len -= stree[node * 2 + 1] /*.Len*/ ;
                }
                /* node is 0 or 1 so it does not have extra bits */
            }
            desc.max_code = max_code;

            /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
             * establish sub-heaps of increasing lengths:
             */
            for (n = (s.heap_len >> 1 /*int /2*/ ); n >= 1; n--) { pqdownheap(s, tree, n); }

            /* Construct the Huffman tree by repeatedly combining the least two
             * frequent nodes.
             */
            node = elems; /* next internal node of the tree */
            do {
                //pqremove(s, tree, n);  /* n = node of least frequency */
                /*** pqremove ***/
                n = s.heap[1 /*SMALLEST*/ ];
                s.heap[1 /*SMALLEST*/ ] = s.heap[s.heap_len--];
                pqdownheap(s, tree, 1 /*SMALLEST*/ );
                /***/

                m = s.heap[1 /*SMALLEST*/ ]; /* m = node of next least frequency */

                s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
                s.heap[--s.heap_max] = m;

                /* Create a new node father of n and m */
                tree[node * 2] /*.Freq*/ = tree[n * 2] /*.Freq*/ + tree[m * 2] /*.Freq*/ ;
                s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
                tree[n * 2 + 1] /*.Dad*/ = tree[m * 2 + 1] /*.Dad*/ = node;

                /* and insert the new node in the heap */
                s.heap[1 /*SMALLEST*/ ] = node++;
                pqdownheap(s, tree, 1 /*SMALLEST*/ );

            } while (s.heap_len >= 2);

            s.heap[--s.heap_max] = s.heap[1 /*SMALLEST*/ ];

            /* At this point, the fields freq and dad are set. We can now
             * generate the bit lengths.
             */
            gen_bitlen(s, desc);

            /* The field len is now set, we can generate the bit codes */
            gen_codes(tree, max_code, s.bl_count);
        }


        /* ===========================================================================
         * Scan a literal or distance tree to determine the frequencies of the codes
         * in the bit length tree.
         */
        function scan_tree(s, tree, max_code)
        //    deflate_state *s;
        //    ct_data *tree;   /* the tree to be scanned */
        //    int max_code;    /* and its largest code of non zero frequency */
        {
            var n; /* iterates over all tree elements */
            var prevlen = -1; /* last emitted length */
            var curlen; /* length of current code */

            var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */

            var count = 0; /* repeat count of the current code */
            var max_count = 7; /* max repeat count */
            var min_count = 4; /* min repeat count */

            if (nextlen === 0) {
                max_count = 138;
                min_count = 3;
            }
            tree[(max_code + 1) * 2 + 1] /*.Len*/ = 0xffff; /* guard */

            for (n = 0; n <= max_code; n++) {
                curlen = nextlen;
                nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;

                if (++count < max_count && curlen === nextlen) {
                    continue;

                } else if (count < min_count) {
                    s.bl_tree[curlen * 2] /*.Freq*/ += count;

                } else if (curlen !== 0) {

                    if (curlen !== prevlen) { s.bl_tree[curlen * 2] /*.Freq*/ ++; }
                    s.bl_tree[REP_3_6 * 2] /*.Freq*/ ++;

                } else if (count <= 10) {
                    s.bl_tree[REPZ_3_10 * 2] /*.Freq*/ ++;

                } else {
                    s.bl_tree[REPZ_11_138 * 2] /*.Freq*/ ++;
                }

                count = 0;
                prevlen = curlen;

                if (nextlen === 0) {
                    max_count = 138;
                    min_count = 3;

                } else if (curlen === nextlen) {
                    max_count = 6;
                    min_count = 3;

                } else {
                    max_count = 7;
                    min_count = 4;
                }
            }
        }


        /* ===========================================================================
         * Send a literal or distance tree in compressed form, using the codes in
         * bl_tree.
         */
        function send_tree(s, tree, max_code)
        //    deflate_state *s;
        //    ct_data *tree; /* the tree to be scanned */
        //    int max_code;       /* and its largest code of non zero frequency */
        {
            var n; /* iterates over all tree elements */
            var prevlen = -1; /* last emitted length */
            var curlen; /* length of current code */

            var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */

            var count = 0; /* repeat count of the current code */
            var max_count = 7; /* max repeat count */
            var min_count = 4; /* min repeat count */

            /* tree[max_code+1].Len = -1; */
            /* guard already set */
            if (nextlen === 0) {
                max_count = 138;
                min_count = 3;
            }

            for (n = 0; n <= max_code; n++) {
                curlen = nextlen;
                nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;

                if (++count < max_count && curlen === nextlen) {
                    continue;

                } else if (count < min_count) {
                    do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

                } else if (curlen !== 0) {
                    if (curlen !== prevlen) {
                        send_code(s, curlen, s.bl_tree);
                        count--;
                    }
                    //Assert(count >= 3 && count <= 6, " 3_6?");
                    send_code(s, REP_3_6, s.bl_tree);
                    send_bits(s, count - 3, 2);

                } else if (count <= 10) {
                    send_code(s, REPZ_3_10, s.bl_tree);
                    send_bits(s, count - 3, 3);

                } else {
                    send_code(s, REPZ_11_138, s.bl_tree);
                    send_bits(s, count - 11, 7);
                }

                count = 0;
                prevlen = curlen;
                if (nextlen === 0) {
                    max_count = 138;
                    min_count = 3;

                } else if (curlen === nextlen) {
                    max_count = 6;
                    min_count = 3;

                } else {
                    max_count = 7;
                    min_count = 4;
                }
            }
        }


        /* ===========================================================================
         * Construct the Huffman tree for the bit lengths and return the index in
         * bl_order of the last bit length code to send.
         */
        function build_bl_tree(s) {
            var max_blindex; /* index of last bit length code of non zero freq */

            /* Determine the bit length frequencies for literal and distance trees */
            scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
            scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

            /* Build the bit length tree: */
            build_tree(s, s.bl_desc);
            /* opt_len now includes the length of the tree representations, except
             * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
             */

            /* Determine the number of bit length codes to send. The pkzip format
             * requires that at least 4 bit length codes be sent. (appnote.txt says
             * 3 but the actual value used is 4.)
             */
            for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
                if (s.bl_tree[bl_order[max_blindex] * 2 + 1] /*.Len*/ !== 0) {
                    break;
                }
            }
            /* Update opt_len to include the bit length tree and counts */
            s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
            //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
            //        s->opt_len, s->static_len));

            return max_blindex;
        }


        /* ===========================================================================
         * Send the header for a block using dynamic Huffman trees: the counts, the
         * lengths of the bit length codes, the literal tree and the distance tree.
         * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
         */
        function send_all_trees(s, lcodes, dcodes, blcodes)
        //    deflate_state *s;
        //    int lcodes, dcodes, blcodes; /* number of codes for each tree */
        {
            var rank; /* index in bl_order */

            //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
            //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
            //        "too many codes");
            //Tracev((stderr, "\nbl counts: "));
            send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
            send_bits(s, dcodes - 1, 5);
            send_bits(s, blcodes - 4, 4); /* not -3 as stated in appnote.txt */
            for (rank = 0; rank < blcodes; rank++) {
                //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
                send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1] /*.Len*/ , 3);
            }
            //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

            send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
            //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

            send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
            //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
        }


        /* ===========================================================================
         * Check if the data type is TEXT or BINARY, using the following algorithm:
         * - TEXT if the two conditions below are satisfied:
         *    a) There are no non-portable control characters belonging to the
         *       "black list" (0..6, 14..25, 28..31).
         *    b) There is at least one printable character belonging to the
         *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
         * - BINARY otherwise.
         * - The following partially-portable control characters form a
         *   "gray list" that is ignored in this detection algorithm:
         *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
         * IN assertion: the fields Freq of dyn_ltree are set.
         */
        function detect_data_type(s) {
            /* black_mask is the bit mask of black-listed bytes
             * set bits 0..6, 14..25, and 28..31
             * 0xf3ffc07f = binary 11110011111111111100000001111111
             */
            var black_mask = 0xf3ffc07f;
            var n;

            /* Check for non-textual ("black-listed") bytes. */
            for (n = 0; n <= 31; n++, black_mask >>>= 1) {
                if ((black_mask & 1) && (s.dyn_ltree[n * 2] /*.Freq*/ !== 0)) {
                    return Z_BINARY;
                }
            }

            /* Check for textual ("white-listed") bytes. */
            if (s.dyn_ltree[9 * 2] /*.Freq*/ !== 0 || s.dyn_ltree[10 * 2] /*.Freq*/ !== 0 ||
                s.dyn_ltree[13 * 2] /*.Freq*/ !== 0) {
                return Z_TEXT;
            }
            for (n = 32; n < LITERALS; n++) {
                if (s.dyn_ltree[n * 2] /*.Freq*/ !== 0) {
                    return Z_TEXT;
                }
            }

            /* There are no "black-listed" or "white-listed" bytes:
             * this stream either is empty or has tolerated ("gray-listed") bytes only.
             */
            return Z_BINARY;
        }


        var static_init_done = false;

        /* ===========================================================================
         * Initialize the tree data structures for a new zlib stream.
         */
        function _tr_init(s) {

            if (!static_init_done) {
                tr_static_init();
                static_init_done = true;
            }

            s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
            s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
            s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

            s.bi_buf = 0;
            s.bi_valid = 0;

            /* Initialize the first block of the first file: */
            init_block(s);
        }


        /* ===========================================================================
         * Send a stored block
         */
        function _tr_stored_block(s, buf, stored_len, last)
        //DeflateState *s;
        //charf *buf;       /* input block */
        //ulg stored_len;   /* length of input block */
        //int last;         /* one if this is the last block for a file */
        {
            send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3); /* send block type */
            copy_block(s, buf, stored_len, true); /* with header */
        }


        /* ===========================================================================
         * Send one empty static block to give enough lookahead for inflate.
         * This takes 10 bits, of which 7 may remain in the bit buffer.
         */
        function _tr_align(s) {
            send_bits(s, STATIC_TREES << 1, 3);
            send_code(s, END_BLOCK, static_ltree);
            bi_flush(s);
        }


        /* ===========================================================================
         * Determine the best encoding for the current block: dynamic trees, static
         * trees or store, and output the encoded block to the zip file.
         */
        function _tr_flush_block(s, buf, stored_len, last)
        //DeflateState *s;
        //charf *buf;       /* input block, or NULL if too old */
        //ulg stored_len;   /* length of input block */
        //int last;         /* one if this is the last block for a file */
        {
            var opt_lenb, static_lenb; /* opt_len and static_len in bytes */
            var max_blindex = 0; /* index of last bit length code of non zero freq */

            /* Build the Huffman trees unless a stored block is forced */
            if (s.level > 0) {

                /* Check if the file is binary or text */
                if (s.strm.data_type === Z_UNKNOWN) {
                    s.strm.data_type = detect_data_type(s);
                }

                /* Construct the literal and distance trees */
                build_tree(s, s.l_desc);
                // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
                //        s->static_len));

                build_tree(s, s.d_desc);
                // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
                //        s->static_len));
                /* At this point, opt_len and static_len are the total bit lengths of
                 * the compressed block data, excluding the tree representations.
                 */

                /* Build the bit length tree for the above two trees, and get the index
                 * in bl_order of the last bit length code to send.
                 */
                max_blindex = build_bl_tree(s);

                /* Determine the best encoding. Compute the block lengths in bytes. */
                opt_lenb = (s.opt_len + 3 + 7) >>> 3;
                static_lenb = (s.static_len + 3 + 7) >>> 3;

                // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
                //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
                //        s->last_lit));

                if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

            } else {
                // Assert(buf != (char*)0, "lost buf");
                opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
            }

            if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
                /* 4: two words for the lengths */

                /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
                 * Otherwise we can't have processed more than WSIZE input bytes since
                 * the last block flush, because compression would have been
                 * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
                 * transform a block into a stored block.
                 */
                _tr_stored_block(s, buf, stored_len, last);

            } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

                send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
                compress_block(s, static_ltree, static_dtree);

            } else {
                send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
                send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
                compress_block(s, s.dyn_ltree, s.dyn_dtree);
            }
            // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
            /* The above check is made mod 2^32, for files larger than 512 MB
             * and uLong implemented on 32 bits.
             */
            init_block(s);

            if (last) {
                bi_windup(s);
            }
            // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
            //       s->compressed_len-7*last));
        }

        /* ===========================================================================
         * Save the match info and tally the frequency counts. Return true if
         * the current block must be flushed.
         */
        function _tr_tally(s, dist, lc)
        //    deflate_state *s;
        //    unsigned dist;  /* distance of matched string */
        //    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
        {
            //var out_length, in_length, dcode;

            s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 0xff;
            s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

            s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
            s.last_lit++;

            if (dist === 0) {
                /* lc is the unmatched char */
                s.dyn_ltree[lc * 2] /*.Freq*/ ++;
            } else {
                s.matches++;
                /* Here, lc is the match length - MIN_MATCH */
                dist--; /* dist = match distance - 1 */
                //Assert((ush)dist < (ush)MAX_DIST(s) &&
                //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
                //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

                s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2] /*.Freq*/ ++;
                s.dyn_dtree[d_code(dist) * 2] /*.Freq*/ ++;
            }

            // (!) This block is disabled in zlib defaults,
            // don't enable it for binary compatibility

            //#ifdef TRUNCATE_BLOCK
            //  /* Try to guess if it is profitable to stop the current block here */
            //  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
            //    /* Compute an upper bound for the compressed length */
            //    out_length = s.last_lit*8;
            //    in_length = s.strstart - s.block_start;
            //
            //    for (dcode = 0; dcode < D_CODES; dcode++) {
            //      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
            //    }
            //    out_length >>>= 3;
            //    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
            //    //       s->last_lit, in_length, out_length,
            //    //       100L - out_length*100L/in_length));
            //    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
            //      return true;
            //    }
            //  }
            //#endif

            return (s.last_lit === s.lit_bufsize - 1);
            /* We avoid equality with lit_bufsize because of wraparound at 64K
             * on 16 bit machines and because stored blocks are restricted to
             * 64K-1 bytes.
             */
        }

        exports._tr_init = _tr_init;
        exports._tr_stored_block = _tr_stored_block;
        exports._tr_flush_block = _tr_flush_block;
        exports._tr_tally = _tr_tally;
        exports._tr_align = _tr_align;

    }, { "../utils/common": 68 }],
    78: [function(require, module, exports) {
        'use strict';

        // (C) 1995-2013 Jean-loup Gailly and Mark Adler
        // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
        //
        // This software is provided 'as-is', without any express or implied
        // warranty. In no event will the authors be held liable for any damages
        // arising from the use of this software.
        //
        // Permission is granted to anyone to use this software for any purpose,
        // including commercial applications, and to alter it and redistribute it
        // freely, subject to the following restrictions:
        //
        // 1. The origin of this software must not be misrepresented; you must not
        //   claim that you wrote the original software. If you use this software
        //   in a product, an acknowledgment in the product documentation would be
        //   appreciated but is not required.
        // 2. Altered source versions must be plainly marked as such, and must not be
        //   misrepresented as being the original software.
        // 3. This notice may not be removed or altered from any source distribution.

        function ZStream() {
            /* next input byte */
            this.input = null; // JS specific, because we have no pointers
            this.next_in = 0;
            /* number of bytes available at input */
            this.avail_in = 0;
            /* total number of input bytes read so far */
            this.total_in = 0;
            /* next output byte should be put there */
            this.output = null; // JS specific, because we have no pointers
            this.next_out = 0;
            /* remaining free space at output */
            this.avail_out = 0;
            /* total number of bytes output so far */
            this.total_out = 0;
            /* last error message, NULL if no error */
            this.msg = '' /*Z_NULL*/ ;
            /* not visible by applications */
            this.state = null;
            /* best guess about the data type: binary or text */
            this.data_type = 2 /*Z_UNKNOWN*/ ;
            /* adler32 value of the uncompressed data */
            this.adler = 0;
        }

        module.exports = ZStream;

    }, {}],
    79: [function(require, module, exports) {
        (function(process) {
            // .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
            // backported and transplited with Babel, with backwards-compat fixes

            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.

            // resolves . and .. elements in a path array with directory names there
            // must be no slashes, empty elements, or device names (c:\) in the array
            // (so also no leading and trailing slashes - it does not distinguish
            // relative and absolute paths)
            function normalizeArray(parts, allowAboveRoot) {
                // if the path tries to go above the root, `up` ends up > 0
                var up = 0;
                for (var i = parts.length - 1; i >= 0; i--) {
                    var last = parts[i];
                    if (last === '.') {
                        parts.splice(i, 1);
                    } else if (last === '..') {
                        parts.splice(i, 1);
                        up++;
                    } else if (up) {
                        parts.splice(i, 1);
                        up--;
                    }
                }

                // if the path is allowed to go above the root, restore leading ..s
                if (allowAboveRoot) {
                    for (; up--; up) {
                        parts.unshift('..');
                    }
                }

                return parts;
            }

            // path.resolve([from ...], to)
            // posix version
            exports.resolve = function() {
                var resolvedPath = '',
                    resolvedAbsolute = false;

                for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                    var path = (i >= 0) ? arguments[i] : process.cwd();

                    // Skip empty and invalid entries
                    if (typeof path !== 'string') {
                        throw new TypeError('Arguments to path.resolve must be strings');
                    } else if (!path) {
                        continue;
                    }

                    resolvedPath = path + '/' + resolvedPath;
                    resolvedAbsolute = path.charAt(0) === '/';
                }

                // At this point the path should be resolved to a full absolute path, but
                // handle relative paths to be safe (might happen when process.cwd() fails)

                // Normalize the path
                resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
                    return !!p;
                }), !resolvedAbsolute).join('/');

                return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
            };

            // path.normalize(path)
            // posix version
            exports.normalize = function(path) {
                var isAbsolute = exports.isAbsolute(path),
                    trailingSlash = substr(path, -1) === '/';

                // Normalize the path
                path = normalizeArray(filter(path.split('/'), function(p) {
                    return !!p;
                }), !isAbsolute).join('/');

                if (!path && !isAbsolute) {
                    path = '.';
                }
                if (path && trailingSlash) {
                    path += '/';
                }

                return (isAbsolute ? '/' : '') + path;
            };

            // posix version
            exports.isAbsolute = function(path) {
                return path.charAt(0) === '/';
            };

            // posix version
            exports.join = function() {
                var paths = Array.prototype.slice.call(arguments, 0);
                return exports.normalize(filter(paths, function(p, index) {
                    if (typeof p !== 'string') {
                        throw new TypeError('Arguments to path.join must be strings');
                    }
                    return p;
                }).join('/'));
            };


            // path.relative(from, to)
            // posix version
            exports.relative = function(from, to) {
                from = exports.resolve(from).substr(1);
                to = exports.resolve(to).substr(1);

                function trim(arr) {
                    var start = 0;
                    for (; start < arr.length; start++) {
                        if (arr[start] !== '') break;
                    }

                    var end = arr.length - 1;
                    for (; end >= 0; end--) {
                        if (arr[end] !== '') break;
                    }

                    if (start > end) return [];
                    return arr.slice(start, end - start + 1);
                }

                var fromParts = trim(from.split('/'));
                var toParts = trim(to.split('/'));

                var length = Math.min(fromParts.length, toParts.length);
                var samePartsLength = length;
                for (var i = 0; i < length; i++) {
                    if (fromParts[i] !== toParts[i]) {
                        samePartsLength = i;
                        break;
                    }
                }

                var outputParts = [];
                for (var i = samePartsLength; i < fromParts.length; i++) {
                    outputParts.push('..');
                }

                outputParts = outputParts.concat(toParts.slice(samePartsLength));

                return outputParts.join('/');
            };

            exports.sep = '/';
            exports.delimiter = ':';

            exports.dirname = function(path) {
                if (typeof path !== 'string') path = path + '';
                if (path.length === 0) return '.';
                var code = path.charCodeAt(0);
                var hasRoot = code === 47 /*/*/ ;
                var end = -1;
                var matchedSlash = true;
                for (var i = path.length - 1; i >= 1; --i) {
                    code = path.charCodeAt(i);
                    if (code === 47 /*/*/ ) {
                        if (!matchedSlash) {
                            end = i;
                            break;
                        }
                    } else {
                        // We saw the first non-path separator
                        matchedSlash = false;
                    }
                }

                if (end === -1) return hasRoot ? '/' : '.';
                if (hasRoot && end === 1) {
                    // return '//';
                    // Backwards-compat fix:
                    return '/';
                }
                return path.slice(0, end);
            };

            function basename(path) {
                if (typeof path !== 'string') path = path + '';

                var start = 0;
                var end = -1;
                var matchedSlash = true;
                var i;

                for (i = path.length - 1; i >= 0; --i) {
                    if (path.charCodeAt(i) === 47 /*/*/ ) {
                        // If we reached a path separator that was not part of a set of path
                        // separators at the end of the string, stop now
                        if (!matchedSlash) {
                            start = i + 1;
                            break;
                        }
                    } else if (end === -1) {
                        // We saw the first non-path separator, mark this as the end of our
                        // path component
                        matchedSlash = false;
                        end = i + 1;
                    }
                }

                if (end === -1) return '';
                return path.slice(start, end);
            }

            // Uses a mixed approach for backwards-compatibility, as ext behavior changed
            // in new Node.js versions, so only basename() above is backported here
            exports.basename = function(path, ext) {
                var f = basename(path);
                if (ext && f.substr(-1 * ext.length) === ext) {
                    f = f.substr(0, f.length - ext.length);
                }
                return f;
            };

            exports.extname = function(path) {
                if (typeof path !== 'string') path = path + '';
                var startDot = -1;
                var startPart = 0;
                var end = -1;
                var matchedSlash = true;
                // Track the state of characters (if any) we see before our first dot and
                // after any path separator we find
                var preDotState = 0;
                for (var i = path.length - 1; i >= 0; --i) {
                    var code = path.charCodeAt(i);
                    if (code === 47 /*/*/ ) {
                        // If we reached a path separator that was not part of a set of path
                        // separators at the end of the string, stop now
                        if (!matchedSlash) {
                            startPart = i + 1;
                            break;
                        }
                        continue;
                    }
                    if (end === -1) {
                        // We saw the first non-path separator, mark this as the end of our
                        // extension
                        matchedSlash = false;
                        end = i + 1;
                    }
                    if (code === 46 /*.*/ ) {
                        // If this is our first dot, mark it as the start of our extension
                        if (startDot === -1)
                            startDot = i;
                        else if (preDotState !== 1)
                            preDotState = 1;
                    } else if (startDot !== -1) {
                        // We saw a non-dot and non-path separator before our dot, so we should
                        // have a good chance at having a non-empty extension
                        preDotState = -1;
                    }
                }

                if (startDot === -1 || end === -1 ||
                    // We saw a non-dot character immediately before the dot
                    preDotState === 0 ||
                    // The (right-most) trimmed path component is exactly '..'
                    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
                    return '';
                }
                return path.slice(startDot, end);
            };

            function filter(xs, f) {
                if (xs.filter) return xs.filter(f);
                var res = [];
                for (var i = 0; i < xs.length; i++) {
                    if (f(xs[i], i, xs)) res.push(xs[i]);
                }
                return res;
            }

            // String.prototype.substr - negative index don't work in IE8
            var substr = 'ab'.substr(-1) === 'b' ?

                function(str, start, len) { return str.substr(start, len) } :
                function(str, start, len) {
                    if (start < 0) start = str.length + start;
                    return str.substr(start, len);
                };

        }).call(this, require('_process'))
    }, { "_process": 81 }],
    80: [function(require, module, exports) {
        (function(process) {
            'use strict';

            if (!process.version ||
                process.version.indexOf('v0.') === 0 ||
                process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
                module.exports = { nextTick: nextTick };
            } else {
                module.exports = process
            }

            function nextTick(fn, arg1, arg2, arg3) {
                if (typeof fn !== 'function') {
                    throw new TypeError('"callback" argument must be a function');
                }
                var len = arguments.length;
                var args, i;
                switch (len) {
                    case 0:
                    case 1:
                        return process.nextTick(fn);
                    case 2:
                        return process.nextTick(function afterTickOne() {
                            fn.call(null, arg1);
                        });
                    case 3:
                        return process.nextTick(function afterTickTwo() {
                            fn.call(null, arg1, arg2);
                        });
                    case 4:
                        return process.nextTick(function afterTickThree() {
                            fn.call(null, arg1, arg2, arg3);
                        });
                    default:
                        args = new Array(len - 1);
                        i = 0;
                        while (i < args.length) {
                            args[i++] = arguments[i];
                        }
                        return process.nextTick(function afterTick() {
                            fn.apply(null, args);
                        });
                }
            }


        }).call(this, require('_process'))
    }, { "_process": 81 }],
    81: [function(require, module, exports) {
        // shim for using process in browser
        var process = module.exports = {};

        // cached from whatever global is present so that test runners that stub it
        // don't break things.  But we need to wrap it in a try catch in case it is
        // wrapped in strict mode code which doesn't define any globals.  It's inside a
        // function because try/catches deoptimize in certain engines.

        var cachedSetTimeout;
        var cachedClearTimeout;

        function defaultSetTimout() {
            throw new Error('setTimeout has not been defined');
        }

        function defaultClearTimeout() {
            throw new Error('clearTimeout has not been defined');
        }
        (function() {
            try {
                if (typeof setTimeout === 'function') {
                    cachedSetTimeout = setTimeout;
                } else {
                    cachedSetTimeout = defaultSetTimout;
                }
            } catch (e) {
                cachedSetTimeout = defaultSetTimout;
            }
            try {
                if (typeof clearTimeout === 'function') {
                    cachedClearTimeout = clearTimeout;
                } else {
                    cachedClearTimeout = defaultClearTimeout;
                }
            } catch (e) {
                cachedClearTimeout = defaultClearTimeout;
            }
        }())

        function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) {
                //normal enviroments in sane situations
                return setTimeout(fun, 0);
            }
            // if setTimeout wasn't available but was latter defined
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                cachedSetTimeout = setTimeout;
                return setTimeout(fun, 0);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedSetTimeout(fun, 0);
            } catch (e) {
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                    return cachedSetTimeout.call(null, fun, 0);
                } catch (e) {
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                    return cachedSetTimeout.call(this, fun, 0);
                }
            }


        }

        function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) {
                //normal enviroments in sane situations
                return clearTimeout(marker);
            }
            // if clearTimeout wasn't available but was latter defined
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                cachedClearTimeout = clearTimeout;
                return clearTimeout(marker);
            }
            try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedClearTimeout(marker);
            } catch (e) {
                try {
                    // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                    return cachedClearTimeout.call(null, marker);
                } catch (e) {
                    // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                    // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                    return cachedClearTimeout.call(this, marker);
                }
            }



        }
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;

        function cleanUpNextTick() {
            if (!draining || !currentQueue) {
                return;
            }
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue);
            } else {
                queueIndex = -1;
            }
            if (queue.length) {
                drainQueue();
            }
        }

        function drainQueue() {
            if (draining) {
                return;
            }
            var timeout = runTimeout(cleanUpNextTick);
            draining = true;

            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    if (currentQueue) {
                        currentQueue[queueIndex].run();
                    }
                }
                queueIndex = -1;
                len = queue.length;
            }
            currentQueue = null;
            draining = false;
            runClearTimeout(timeout);
        }

        process.nextTick = function(fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                runTimeout(drainQueue);
            }
        };

        // v8 likes predictible objects
        function Item(fun, array) {
            this.fun = fun;
            this.array = array;
        }
        Item.prototype.run = function() {
            this.fun.apply(null, this.array);
        };
        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = ''; // empty string to avoid regexp issues
        process.versions = {};

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.prependListener = noop;
        process.prependOnceListener = noop;

        process.listeners = function(name) { return [] }

        process.binding = function(name) {
            throw new Error('process.binding is not supported');
        };

        process.cwd = function() { return '/' };
        process.chdir = function(dir) {
            throw new Error('process.chdir is not supported');
        };
        process.umask = function() { return 0; };

    }, {}],
    82: [function(require, module, exports) {
        module.exports = require('./lib/_stream_duplex.js');

    }, { "./lib/_stream_duplex.js": 83 }],
    83: [function(require, module, exports) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        // a duplex stream is just a stream that is both readable and writable.
        // Since JS doesn't have multiple prototypal inheritance, this class
        // prototypally inherits from Readable, and then parasitically from
        // Writable.

        'use strict';

        /*<replacement>*/

        var pna = require('process-nextick-args');
        /*</replacement>*/

        /*<replacement>*/
        var objectKeys = Object.keys || function(obj) {
            var keys = [];
            for (var key in obj) {
                keys.push(key);
            }
            return keys;
        };
        /*</replacement>*/

        module.exports = Duplex;

        /*<replacement>*/
        var util = require('core-util-is');
        util.inherits = require('inherits');
        /*</replacement>*/

        var Readable = require('./_stream_readable');
        var Writable = require('./_stream_writable');

        util.inherits(Duplex, Readable);

        {
            // avoid scope creep, the keys array can then be collected
            var keys = objectKeys(Writable.prototype);
            for (var v = 0; v < keys.length; v++) {
                var method = keys[v];
                if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
            }
        }

        function Duplex(options) {
            if (!(this instanceof Duplex)) return new Duplex(options);

            Readable.call(this, options);
            Writable.call(this, options);

            if (options && options.readable === false) this.readable = false;

            if (options && options.writable === false) this.writable = false;

            this.allowHalfOpen = true;
            if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

            this.once('end', onend);
        }

        Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
            // making it explicit this property is not enumerable
            // because otherwise some prototype manipulation in
            // userland will fail
            enumerable: false,
            get: function() {
                return this._writableState.highWaterMark;
            }
        });

        // the no-half-open enforcer
        function onend() {
            // if we allow half-open state, or if the writable side ended,
            // then we're ok.
            if (this.allowHalfOpen || this._writableState.ended) return;

            // no more data can be written.
            // But allow more writes to happen in this tick.
            pna.nextTick(onEndNT, this);
        }

        function onEndNT(self) {
            self.end();
        }

        Object.defineProperty(Duplex.prototype, 'destroyed', {
            get: function() {
                if (this._readableState === undefined || this._writableState === undefined) {
                    return false;
                }
                return this._readableState.destroyed && this._writableState.destroyed;
            },
            set: function(value) {
                // we ignore the value if the stream
                // has not been initialized yet
                if (this._readableState === undefined || this._writableState === undefined) {
                    return;
                }

                // backward compatibility, the user is explicitly
                // managing destroyed
                this._readableState.destroyed = value;
                this._writableState.destroyed = value;
            }
        });

        Duplex.prototype._destroy = function(err, cb) {
            this.push(null);
            this.end();

            pna.nextTick(cb, err);
        };
    }, { "./_stream_readable": 85, "./_stream_writable": 87, "core-util-is": 62, "inherits": 65, "process-nextick-args": 80 }],
    84: [function(require, module, exports) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        // a passthrough stream.
        // basically just the most minimal sort of Transform stream.
        // Every written chunk gets output as-is.

        'use strict';

        module.exports = PassThrough;

        var Transform = require('./_stream_transform');

        /*<replacement>*/
        var util = require('core-util-is');
        util.inherits = require('inherits');
        /*</replacement>*/

        util.inherits(PassThrough, Transform);

        function PassThrough(options) {
            if (!(this instanceof PassThrough)) return new PassThrough(options);

            Transform.call(this, options);
        }

        PassThrough.prototype._transform = function(chunk, encoding, cb) {
            cb(null, chunk);
        };
    }, { "./_stream_transform": 86, "core-util-is": 62, "inherits": 65 }],
    85: [function(require, module, exports) {
        (function(process, global) {
            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.

            'use strict';

            /*<replacement>*/

            var pna = require('process-nextick-args');
            /*</replacement>*/

            module.exports = Readable;

            /*<replacement>*/
            var isArray = require('isarray');
            /*</replacement>*/

            /*<replacement>*/
            var Duplex;
            /*</replacement>*/

            Readable.ReadableState = ReadableState;

            /*<replacement>*/
            var EE = require('events').EventEmitter;

            var EElistenerCount = function(emitter, type) {
                return emitter.listeners(type).length;
            };
            /*</replacement>*/

            /*<replacement>*/
            var Stream = require('./internal/streams/stream');
            /*</replacement>*/

            /*<replacement>*/

            var Buffer = require('safe-buffer').Buffer;
            var OurUint8Array = global.Uint8Array || function() {};

            function _uint8ArrayToBuffer(chunk) {
                return Buffer.from(chunk);
            }

            function _isUint8Array(obj) {
                return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
            }

            /*</replacement>*/

            /*<replacement>*/
            var util = require('core-util-is');
            util.inherits = require('inherits');
            /*</replacement>*/

            /*<replacement>*/
            var debugUtil = require('util');
            var debug = void 0;
            if (debugUtil && debugUtil.debuglog) {
                debug = debugUtil.debuglog('stream');
            } else {
                debug = function() {};
            }
            /*</replacement>*/

            var BufferList = require('./internal/streams/BufferList');
            var destroyImpl = require('./internal/streams/destroy');
            var StringDecoder;

            util.inherits(Readable, Stream);

            var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

            function prependListener(emitter, event, fn) {
                // Sadly this is not cacheable as some libraries bundle their own
                // event emitter implementation with them.
                if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

                // This is a hack to make sure that our error handler is attached before any
                // userland ones.  NEVER DO THIS. This is here only because this code needs
                // to continue to work with older versions of Node.js that do not include
                // the prependListener() method. The goal is to eventually remove this hack.
                if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
                else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);
                else emitter._events[event] = [fn, emitter._events[event]];
            }

            function ReadableState(options, stream) {
                Duplex = Duplex || require('./_stream_duplex');

                options = options || {};

                // Duplex streams are both readable and writable, but share
                // the same options object.
                // However, some cases require setting options to different
                // values for the readable and the writable sides of the duplex stream.
                // These options can be provided separately as readableXXX and writableXXX.
                var isDuplex = stream instanceof Duplex;

                // object stream flag. Used to make read(n) ignore n and to
                // make all the buffer merging and length checks go away
                this.objectMode = !!options.objectMode;

                if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

                // the point at which it stops calling _read() to fill the buffer
                // Note: 0 is a valid value, means "don't call _read preemptively ever"
                var hwm = options.highWaterMark;
                var readableHwm = options.readableHighWaterMark;
                var defaultHwm = this.objectMode ? 16 : 16 * 1024;

                if (hwm || hwm === 0) this.highWaterMark = hwm;
                else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;
                else this.highWaterMark = defaultHwm;

                // cast to ints.
                this.highWaterMark = Math.floor(this.highWaterMark);

                // A linked list is used to store data chunks instead of an array because the
                // linked list can remove elements from the beginning faster than
                // array.shift()
                this.buffer = new BufferList();
                this.length = 0;
                this.pipes = null;
                this.pipesCount = 0;
                this.flowing = null;
                this.ended = false;
                this.endEmitted = false;
                this.reading = false;

                // a flag to be able to tell if the event 'readable'/'data' is emitted
                // immediately, or on a later tick.  We set this to true at first, because
                // any actions that shouldn't happen until "later" should generally also
                // not happen before the first read call.
                this.sync = true;

                // whenever we return null, then we set a flag to say
                // that we're awaiting a 'readable' event emission.
                this.needReadable = false;
                this.emittedReadable = false;
                this.readableListening = false;
                this.resumeScheduled = false;

                // has it been destroyed
                this.destroyed = false;

                // Crypto is kind of old and crusty.  Historically, its default string
                // encoding is 'binary' so we have to make this configurable.
                // Everything else in the universe uses 'utf8', though.
                this.defaultEncoding = options.defaultEncoding || 'utf8';

                // the number of writers that are awaiting a drain event in .pipe()s
                this.awaitDrain = 0;

                // if true, a maybeReadMore has been scheduled
                this.readingMore = false;

                this.decoder = null;
                this.encoding = null;
                if (options.encoding) {
                    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
                    this.decoder = new StringDecoder(options.encoding);
                    this.encoding = options.encoding;
                }
            }

            function Readable(options) {
                Duplex = Duplex || require('./_stream_duplex');

                if (!(this instanceof Readable)) return new Readable(options);

                this._readableState = new ReadableState(options, this);

                // legacy
                this.readable = true;

                if (options) {
                    if (typeof options.read === 'function') this._read = options.read;

                    if (typeof options.destroy === 'function') this._destroy = options.destroy;
                }

                Stream.call(this);
            }

            Object.defineProperty(Readable.prototype, 'destroyed', {
                get: function() {
                    if (this._readableState === undefined) {
                        return false;
                    }
                    return this._readableState.destroyed;
                },
                set: function(value) {
                    // we ignore the value if the stream
                    // has not been initialized yet
                    if (!this._readableState) {
                        return;
                    }

                    // backward compatibility, the user is explicitly
                    // managing destroyed
                    this._readableState.destroyed = value;
                }
            });

            Readable.prototype.destroy = destroyImpl.destroy;
            Readable.prototype._undestroy = destroyImpl.undestroy;
            Readable.prototype._destroy = function(err, cb) {
                this.push(null);
                cb(err);
            };

            // Manually shove something into the read() buffer.
            // This returns true if the highWaterMark has not been hit yet,
            // similar to how Writable.write() returns true if you should
            // write() some more.
            Readable.prototype.push = function(chunk, encoding) {
                var state = this._readableState;
                var skipChunkCheck;

                if (!state.objectMode) {
                    if (typeof chunk === 'string') {
                        encoding = encoding || state.defaultEncoding;
                        if (encoding !== state.encoding) {
                            chunk = Buffer.from(chunk, encoding);
                            encoding = '';
                        }
                        skipChunkCheck = true;
                    }
                } else {
                    skipChunkCheck = true;
                }

                return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
            };

            // Unshift should *always* be something directly out of read()
            Readable.prototype.unshift = function(chunk) {
                return readableAddChunk(this, chunk, null, true, false);
            };

            function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
                var state = stream._readableState;
                if (chunk === null) {
                    state.reading = false;
                    onEofChunk(stream, state);
                } else {
                    var er;
                    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
                    if (er) {
                        stream.emit('error', er);
                    } else if (state.objectMode || chunk && chunk.length > 0) {
                        if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
                            chunk = _uint8ArrayToBuffer(chunk);
                        }

                        if (addToFront) {
                            if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));
                            else addChunk(stream, state, chunk, true);
                        } else if (state.ended) {
                            stream.emit('error', new Error('stream.push() after EOF'));
                        } else {
                            state.reading = false;
                            if (state.decoder && !encoding) {
                                chunk = state.decoder.write(chunk);
                                if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
                                else maybeReadMore(stream, state);
                            } else {
                                addChunk(stream, state, chunk, false);
                            }
                        }
                    } else if (!addToFront) {
                        state.reading = false;
                    }
                }

                return needMoreData(state);
            }

            function addChunk(stream, state, chunk, addToFront) {
                if (state.flowing && state.length === 0 && !state.sync) {
                    stream.emit('data', chunk);
                    stream.read(0);
                } else {
                    // update the buffer info.
                    state.length += state.objectMode ? 1 : chunk.length;
                    if (addToFront) state.buffer.unshift(chunk);
                    else state.buffer.push(chunk);

                    if (state.needReadable) emitReadable(stream);
                }
                maybeReadMore(stream, state);
            }

            function chunkInvalid(state, chunk) {
                var er;
                if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
                    er = new TypeError('Invalid non-string/buffer chunk');
                }
                return er;
            }

            // if it's past the high water mark, we can push in some more.
            // Also, if we have no data yet, we can stand some
            // more bytes.  This is to work around cases where hwm=0,
            // such as the repl.  Also, if the push() triggered a
            // readable event, and the user called read(largeNumber) such that
            // needReadable was set, then we ought to push more, so that another
            // 'readable' event will be triggered.
            function needMoreData(state) {
                return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
            }

            Readable.prototype.isPaused = function() {
                return this._readableState.flowing === false;
            };

            // backwards compatibility.
            Readable.prototype.setEncoding = function(enc) {
                if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
                this._readableState.decoder = new StringDecoder(enc);
                this._readableState.encoding = enc;
                return this;
            };

            // Don't raise the hwm > 8MB
            var MAX_HWM = 0x800000;

            function computeNewHighWaterMark(n) {
                if (n >= MAX_HWM) {
                    n = MAX_HWM;
                } else {
                    // Get the next highest power of 2 to prevent increasing hwm excessively in
                    // tiny amounts
                    n--;
                    n |= n >>> 1;
                    n |= n >>> 2;
                    n |= n >>> 4;
                    n |= n >>> 8;
                    n |= n >>> 16;
                    n++;
                }
                return n;
            }

            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function howMuchToRead(n, state) {
                if (n <= 0 || state.length === 0 && state.ended) return 0;
                if (state.objectMode) return 1;
                if (n !== n) {
                    // Only flow one buffer at a time
                    if (state.flowing && state.length) return state.buffer.head.data.length;
                    else return state.length;
                }
                // If we're asking for more than the current hwm, then raise the hwm.
                if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
                if (n <= state.length) return n;
                // Don't have enough
                if (!state.ended) {
                    state.needReadable = true;
                    return 0;
                }
                return state.length;
            }

            // you can override either this method, or the async _read(n) below.
            Readable.prototype.read = function(n) {
                debug('read', n);
                n = parseInt(n, 10);
                var state = this._readableState;
                var nOrig = n;

                if (n !== 0) state.emittedReadable = false;

                // if we're doing read(0) to trigger a readable event, but we
                // already have a bunch of data in the buffer, then just trigger
                // the 'readable' event and move on.
                if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
                    debug('read: emitReadable', state.length, state.ended);
                    if (state.length === 0 && state.ended) endReadable(this);
                    else emitReadable(this);
                    return null;
                }

                n = howMuchToRead(n, state);

                // if we've ended, and we're now clear, then finish it up.
                if (n === 0 && state.ended) {
                    if (state.length === 0) endReadable(this);
                    return null;
                }

                // All the actual chunk generation logic needs to be
                // *below* the call to _read.  The reason is that in certain
                // synthetic stream cases, such as passthrough streams, _read
                // may be a completely synchronous operation which may change
                // the state of the read buffer, providing enough data when
                // before there was *not* enough.
                //
                // So, the steps are:
                // 1. Figure out what the state of things will be after we do
                // a read from the buffer.
                //
                // 2. If that resulting state will trigger a _read, then call _read.
                // Note that this may be asynchronous, or synchronous.  Yes, it is
                // deeply ugly to write APIs this way, but that still doesn't mean
                // that the Readable class should behave improperly, as streams are
                // designed to be sync/async agnostic.
                // Take note if the _read call is sync or async (ie, if the read call
                // has returned yet), so that we know whether or not it's safe to emit
                // 'readable' etc.
                //
                // 3. Actually pull the requested chunks out of the buffer and return.

                // if we need a readable event, then we need to do some reading.
                var doRead = state.needReadable;
                debug('need readable', doRead);

                // if we currently have less than the highWaterMark, then also read some
                if (state.length === 0 || state.length - n < state.highWaterMark) {
                    doRead = true;
                    debug('length less than watermark', doRead);
                }

                // however, if we've ended, then there's no point, and if we're already
                // reading, then it's unnecessary.
                if (state.ended || state.reading) {
                    doRead = false;
                    debug('reading or ended', doRead);
                } else if (doRead) {
                    debug('do read');
                    state.reading = true;
                    state.sync = true;
                    // if the length is currently zero, then we *need* a readable event.
                    if (state.length === 0) state.needReadable = true;
                    // call internal read method
                    this._read(state.highWaterMark);
                    state.sync = false;
                    // If _read pushed data synchronously, then `reading` will be false,
                    // and we need to re-evaluate how much data we can return to the user.
                    if (!state.reading) n = howMuchToRead(nOrig, state);
                }

                var ret;
                if (n > 0) ret = fromList(n, state);
                else ret = null;

                if (ret === null) {
                    state.needReadable = true;
                    n = 0;
                } else {
                    state.length -= n;
                }

                if (state.length === 0) {
                    // If we have nothing in the buffer, then we want to know
                    // as soon as we *do* get something into the buffer.
                    if (!state.ended) state.needReadable = true;

                    // If we tried to read() past the EOF, then emit end on the next tick.
                    if (nOrig !== n && state.ended) endReadable(this);
                }

                if (ret !== null) this.emit('data', ret);

                return ret;
            };

            function onEofChunk(stream, state) {
                if (state.ended) return;
                if (state.decoder) {
                    var chunk = state.decoder.end();
                    if (chunk && chunk.length) {
                        state.buffer.push(chunk);
                        state.length += state.objectMode ? 1 : chunk.length;
                    }
                }
                state.ended = true;

                // emit 'readable' now to make sure it gets picked up.
                emitReadable(stream);
            }

            // Don't emit readable right away in sync mode, because this can trigger
            // another read() call => stack overflow.  This way, it might trigger
            // a nextTick recursion warning, but that's not so bad.
            function emitReadable(stream) {
                var state = stream._readableState;
                state.needReadable = false;
                if (!state.emittedReadable) {
                    debug('emitReadable', state.flowing);
                    state.emittedReadable = true;
                    if (state.sync) pna.nextTick(emitReadable_, stream);
                    else emitReadable_(stream);
                }
            }

            function emitReadable_(stream) {
                debug('emit readable');
                stream.emit('readable');
                flow(stream);
            }

            // at this point, the user has presumably seen the 'readable' event,
            // and called read() to consume some data.  that may have triggered
            // in turn another _read(n) call, in which case reading = true if
            // it's in progress.
            // However, if we're not ended, or reading, and the length < hwm,
            // then go ahead and try to read some more preemptively.
            function maybeReadMore(stream, state) {
                if (!state.readingMore) {
                    state.readingMore = true;
                    pna.nextTick(maybeReadMore_, stream, state);
                }
            }

            function maybeReadMore_(stream, state) {
                var len = state.length;
                while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
                    debug('maybeReadMore read 0');
                    stream.read(0);
                    if (len === state.length)
                    // didn't get any data, stop spinning.
                        break;
                    else len = state.length;
                }
                state.readingMore = false;
            }

            // abstract method.  to be overridden in specific implementation classes.
            // call cb(er, data) where data is <= n in length.
            // for virtual (non-string, non-buffer) streams, "length" is somewhat
            // arbitrary, and perhaps not very meaningful.
            Readable.prototype._read = function(n) {
                this.emit('error', new Error('_read() is not implemented'));
            };

            Readable.prototype.pipe = function(dest, pipeOpts) {
                var src = this;
                var state = this._readableState;

                switch (state.pipesCount) {
                    case 0:
                        state.pipes = dest;
                        break;
                    case 1:
                        state.pipes = [state.pipes, dest];
                        break;
                    default:
                        state.pipes.push(dest);
                        break;
                }
                state.pipesCount += 1;
                debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

                var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

                var endFn = doEnd ? onend : unpipe;
                if (state.endEmitted) pna.nextTick(endFn);
                else src.once('end', endFn);

                dest.on('unpipe', onunpipe);

                function onunpipe(readable, unpipeInfo) {
                    debug('onunpipe');
                    if (readable === src) {
                        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
                            unpipeInfo.hasUnpiped = true;
                            cleanup();
                        }
                    }
                }

                function onend() {
                    debug('onend');
                    dest.end();
                }

                // when the dest drains, it reduces the awaitDrain counter
                // on the source.  This would be more elegant with a .once()
                // handler in flow(), but adding and removing repeatedly is
                // too slow.
                var ondrain = pipeOnDrain(src);
                dest.on('drain', ondrain);

                var cleanedUp = false;

                function cleanup() {
                    debug('cleanup');
                    // cleanup event handlers once the pipe is broken
                    dest.removeListener('close', onclose);
                    dest.removeListener('finish', onfinish);
                    dest.removeListener('drain', ondrain);
                    dest.removeListener('error', onerror);
                    dest.removeListener('unpipe', onunpipe);
                    src.removeListener('end', onend);
                    src.removeListener('end', unpipe);
                    src.removeListener('data', ondata);

                    cleanedUp = true;

                    // if the reader is waiting for a drain event from this
                    // specific writer, then it would cause it to never start
                    // flowing again.
                    // So, if this is awaiting a drain, then we just call it now.
                    // If we don't know, then assume that we are waiting for one.
                    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
                }

                // If the user pushes more data while we're writing to dest then we'll end up
                // in ondata again. However, we only want to increase awaitDrain once because
                // dest will only emit one 'drain' event for the multiple writes.
                // => Introduce a guard on increasing awaitDrain.
                var increasedAwaitDrain = false;
                src.on('data', ondata);

                function ondata(chunk) {
                    debug('ondata');
                    increasedAwaitDrain = false;
                    var ret = dest.write(chunk);
                    if (false === ret && !increasedAwaitDrain) {
                        // If the user unpiped during `dest.write()`, it is possible
                        // to get stuck in a permanently paused state if that write
                        // also returned false.
                        // => Check whether `dest` is still a piping destination.
                        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
                            debug('false write response, pause', src._readableState.awaitDrain);
                            src._readableState.awaitDrain++;
                            increasedAwaitDrain = true;
                        }
                        src.pause();
                    }
                }

                // if the dest has an error, then stop piping into it.
                // however, don't suppress the throwing behavior for this.
                function onerror(er) {
                    debug('onerror', er);
                    unpipe();
                    dest.removeListener('error', onerror);
                    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
                }

                // Make sure our error handler is attached before userland ones.
                prependListener(dest, 'error', onerror);

                // Both close and finish should trigger unpipe, but only once.
                function onclose() {
                    dest.removeListener('finish', onfinish);
                    unpipe();
                }
                dest.once('close', onclose);

                function onfinish() {
                    debug('onfinish');
                    dest.removeListener('close', onclose);
                    unpipe();
                }
                dest.once('finish', onfinish);

                function unpipe() {
                    debug('unpipe');
                    src.unpipe(dest);
                }

                // tell the dest that it's being piped to
                dest.emit('pipe', src);

                // start the flow if it hasn't been started already.
                if (!state.flowing) {
                    debug('pipe resume');
                    src.resume();
                }

                return dest;
            };

            function pipeOnDrain(src) {
                return function() {
                    var state = src._readableState;
                    debug('pipeOnDrain', state.awaitDrain);
                    if (state.awaitDrain) state.awaitDrain--;
                    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
                        state.flowing = true;
                        flow(src);
                    }
                };
            }

            Readable.prototype.unpipe = function(dest) {
                var state = this._readableState;
                var unpipeInfo = { hasUnpiped: false };

                // if we're not piping anywhere, then do nothing.
                if (state.pipesCount === 0) return this;

                // just one destination.  most common case.
                if (state.pipesCount === 1) {
                    // passed in one, but it's not the right one.
                    if (dest && dest !== state.pipes) return this;

                    if (!dest) dest = state.pipes;

                    // got a match.
                    state.pipes = null;
                    state.pipesCount = 0;
                    state.flowing = false;
                    if (dest) dest.emit('unpipe', this, unpipeInfo);
                    return this;
                }

                // slow case. multiple pipe destinations.

                if (!dest) {
                    // remove all.
                    var dests = state.pipes;
                    var len = state.pipesCount;
                    state.pipes = null;
                    state.pipesCount = 0;
                    state.flowing = false;

                    for (var i = 0; i < len; i++) {
                        dests[i].emit('unpipe', this, unpipeInfo);
                    }
                    return this;
                }

                // try to find the right one.
                var index = indexOf(state.pipes, dest);
                if (index === -1) return this;

                state.pipes.splice(index, 1);
                state.pipesCount -= 1;
                if (state.pipesCount === 1) state.pipes = state.pipes[0];

                dest.emit('unpipe', this, unpipeInfo);

                return this;
            };

            // set up data events if they are asked for
            // Ensure readable listeners eventually get something
            Readable.prototype.on = function(ev, fn) {
                var res = Stream.prototype.on.call(this, ev, fn);

                if (ev === 'data') {
                    // Start flowing on next tick if stream isn't explicitly paused
                    if (this._readableState.flowing !== false) this.resume();
                } else if (ev === 'readable') {
                    var state = this._readableState;
                    if (!state.endEmitted && !state.readableListening) {
                        state.readableListening = state.needReadable = true;
                        state.emittedReadable = false;
                        if (!state.reading) {
                            pna.nextTick(nReadingNextTick, this);
                        } else if (state.length) {
                            emitReadable(this);
                        }
                    }
                }

                return res;
            };
            Readable.prototype.addListener = Readable.prototype.on;

            function nReadingNextTick(self) {
                debug('readable nexttick read 0');
                self.read(0);
            }

            // pause() and resume() are remnants of the legacy readable stream API
            // If the user uses them, then switch into old mode.
            Readable.prototype.resume = function() {
                var state = this._readableState;
                if (!state.flowing) {
                    debug('resume');
                    state.flowing = true;
                    resume(this, state);
                }
                return this;
            };

            function resume(stream, state) {
                if (!state.resumeScheduled) {
                    state.resumeScheduled = true;
                    pna.nextTick(resume_, stream, state);
                }
            }

            function resume_(stream, state) {
                if (!state.reading) {
                    debug('resume read 0');
                    stream.read(0);
                }

                state.resumeScheduled = false;
                state.awaitDrain = 0;
                stream.emit('resume');
                flow(stream);
                if (state.flowing && !state.reading) stream.read(0);
            }

            Readable.prototype.pause = function() {
                debug('call pause flowing=%j', this._readableState.flowing);
                if (false !== this._readableState.flowing) {
                    debug('pause');
                    this._readableState.flowing = false;
                    this.emit('pause');
                }
                return this;
            };

            function flow(stream) {
                var state = stream._readableState;
                debug('flow', state.flowing);
                while (state.flowing && stream.read() !== null) {}
            }

            // wrap an old-style stream as the async data source.
            // This is *not* part of the readable stream interface.
            // It is an ugly unfortunate mess of history.
            Readable.prototype.wrap = function(stream) {
                var _this = this;

                var state = this._readableState;
                var paused = false;

                stream.on('end', function() {
                    debug('wrapped end');
                    if (state.decoder && !state.ended) {
                        var chunk = state.decoder.end();
                        if (chunk && chunk.length) _this.push(chunk);
                    }

                    _this.push(null);
                });

                stream.on('data', function(chunk) {
                    debug('wrapped data');
                    if (state.decoder) chunk = state.decoder.write(chunk);

                    // don't skip over falsy values in objectMode
                    if (state.objectMode && (chunk === null || chunk === undefined)) return;
                    else if (!state.objectMode && (!chunk || !chunk.length)) return;

                    var ret = _this.push(chunk);
                    if (!ret) {
                        paused = true;
                        stream.pause();
                    }
                });

                // proxy all the other methods.
                // important when wrapping filters and duplexes.
                for (var i in stream) {
                    if (this[i] === undefined && typeof stream[i] === 'function') {
                        this[i] = function(method) {
                            return function() {
                                return stream[method].apply(stream, arguments);
                            };
                        }(i);
                    }
                }

                // proxy certain important events.
                for (var n = 0; n < kProxyEvents.length; n++) {
                    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
                }

                // when we try to consume some more bytes, simply unpause the
                // underlying stream.
                this._read = function(n) {
                    debug('wrapped _read', n);
                    if (paused) {
                        paused = false;
                        stream.resume();
                    }
                };

                return this;
            };

            Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: false,
                get: function() {
                    return this._readableState.highWaterMark;
                }
            });

            // exposed for testing purposes only.
            Readable._fromList = fromList;

            // Pluck off n bytes from an array of buffers.
            // Length is the combined lengths of all the buffers in the list.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function fromList(n, state) {
                // nothing buffered
                if (state.length === 0) return null;

                var ret;
                if (state.objectMode) ret = state.buffer.shift();
                else if (!n || n >= state.length) {
                    // read it all, truncate the list
                    if (state.decoder) ret = state.buffer.join('');
                    else if (state.buffer.length === 1) ret = state.buffer.head.data;
                    else ret = state.buffer.concat(state.length);
                    state.buffer.clear();
                } else {
                    // read part of list
                    ret = fromListPartial(n, state.buffer, state.decoder);
                }

                return ret;
            }

            // Extracts only enough buffered data to satisfy the amount requested.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function fromListPartial(n, list, hasStrings) {
                var ret;
                if (n < list.head.data.length) {
                    // slice is the same for buffers and strings
                    ret = list.head.data.slice(0, n);
                    list.head.data = list.head.data.slice(n);
                } else if (n === list.head.data.length) {
                    // first chunk is a perfect match
                    ret = list.shift();
                } else {
                    // result spans more than one buffer
                    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
                }
                return ret;
            }

            // Copies a specified amount of characters from the list of buffered data
            // chunks.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function copyFromBufferString(n, list) {
                var p = list.head;
                var c = 1;
                var ret = p.data;
                n -= ret.length;
                while (p = p.next) {
                    var str = p.data;
                    var nb = n > str.length ? str.length : n;
                    if (nb === str.length) ret += str;
                    else ret += str.slice(0, n);
                    n -= nb;
                    if (n === 0) {
                        if (nb === str.length) {
                            ++c;
                            if (p.next) list.head = p.next;
                            else list.head = list.tail = null;
                        } else {
                            list.head = p;
                            p.data = str.slice(nb);
                        }
                        break;
                    }
                    ++c;
                }
                list.length -= c;
                return ret;
            }

            // Copies a specified amount of bytes from the list of buffered data chunks.
            // This function is designed to be inlinable, so please take care when making
            // changes to the function body.
            function copyFromBuffer(n, list) {
                var ret = Buffer.allocUnsafe(n);
                var p = list.head;
                var c = 1;
                p.data.copy(ret);
                n -= p.data.length;
                while (p = p.next) {
                    var buf = p.data;
                    var nb = n > buf.length ? buf.length : n;
                    buf.copy(ret, ret.length - n, 0, nb);
                    n -= nb;
                    if (n === 0) {
                        if (nb === buf.length) {
                            ++c;
                            if (p.next) list.head = p.next;
                            else list.head = list.tail = null;
                        } else {
                            list.head = p;
                            p.data = buf.slice(nb);
                        }
                        break;
                    }
                    ++c;
                }
                list.length -= c;
                return ret;
            }

            function endReadable(stream) {
                var state = stream._readableState;

                // If we get here before consuming all the bytes, then that is a
                // bug in node.  Should never happen.
                if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

                if (!state.endEmitted) {
                    state.ended = true;
                    pna.nextTick(endReadableNT, state, stream);
                }
            }

            function endReadableNT(state, stream) {
                // Check that we didn't get one last unshift.
                if (!state.endEmitted && state.length === 0) {
                    state.endEmitted = true;
                    stream.readable = false;
                    stream.emit('end');
                }
            }

            function indexOf(xs, x) {
                for (var i = 0, l = xs.length; i < l; i++) {
                    if (xs[i] === x) return i;
                }
                return -1;
            }
        }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, { "./_stream_duplex": 83, "./internal/streams/BufferList": 88, "./internal/streams/destroy": 89, "./internal/streams/stream": 90, "_process": 81, "core-util-is": 62, "events": 63, "inherits": 65, "isarray": 67, "process-nextick-args": 80, "safe-buffer": 95, "string_decoder/": 97, "util": 58 }],
    86: [function(require, module, exports) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        // a transform stream is a readable/writable stream where you do
        // something with the data.  Sometimes it's called a "filter",
        // but that's not a great name for it, since that implies a thing where
        // some bits pass through, and others are simply ignored.  (That would
        // be a valid example of a transform, of course.)
        //
        // While the output is causally related to the input, it's not a
        // necessarily symmetric or synchronous transformation.  For example,
        // a zlib stream might take multiple plain-text writes(), and then
        // emit a single compressed chunk some time in the future.
        //
        // Here's how this works:
        //
        // The Transform stream has all the aspects of the readable and writable
        // stream classes.  When you write(chunk), that calls _write(chunk,cb)
        // internally, and returns false if there's a lot of pending writes
        // buffered up.  When you call read(), that calls _read(n) until
        // there's enough pending readable data buffered up.
        //
        // In a transform stream, the written data is placed in a buffer.  When
        // _read(n) is called, it transforms the queued up data, calling the
        // buffered _write cb's as it consumes chunks.  If consuming a single
        // written chunk would result in multiple output chunks, then the first
        // outputted bit calls the readcb, and subsequent chunks just go into
        // the read buffer, and will cause it to emit 'readable' if necessary.
        //
        // This way, back-pressure is actually determined by the reading side,
        // since _read has to be called to start processing a new chunk.  However,
        // a pathological inflate type of transform can cause excessive buffering
        // here.  For example, imagine a stream where every byte of input is
        // interpreted as an integer from 0-255, and then results in that many
        // bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
        // 1kb of data being output.  In this case, you could write a very small
        // amount of input, and end up with a very large amount of output.  In
        // such a pathological inflating mechanism, there'd be no way to tell
        // the system to stop doing the transform.  A single 4MB write could
        // cause the system to run out of memory.
        //
        // However, even in such a pathological case, only a single written chunk
        // would be consumed, and then the rest would wait (un-transformed) until
        // the results of the previous transformed chunk were consumed.

        'use strict';

        module.exports = Transform;

        var Duplex = require('./_stream_duplex');

        /*<replacement>*/
        var util = require('core-util-is');
        util.inherits = require('inherits');
        /*</replacement>*/

        util.inherits(Transform, Duplex);

        function afterTransform(er, data) {
            var ts = this._transformState;
            ts.transforming = false;

            var cb = ts.writecb;

            if (!cb) {
                return this.emit('error', new Error('write callback called multiple times'));
            }

            ts.writechunk = null;
            ts.writecb = null;

            if (data != null) // single equals check for both `null` and `undefined`
                this.push(data);

            cb(er);

            var rs = this._readableState;
            rs.reading = false;
            if (rs.needReadable || rs.length < rs.highWaterMark) {
                this._read(rs.highWaterMark);
            }
        }

        function Transform(options) {
            if (!(this instanceof Transform)) return new Transform(options);

            Duplex.call(this, options);

            this._transformState = {
                afterTransform: afterTransform.bind(this),
                needTransform: false,
                transforming: false,
                writecb: null,
                writechunk: null,
                writeencoding: null
            };

            // start out asking for a readable event once data is transformed.
            this._readableState.needReadable = true;

            // we have implemented the _read method, and done the other things
            // that Readable wants before the first _read call, so unset the
            // sync guard flag.
            this._readableState.sync = false;

            if (options) {
                if (typeof options.transform === 'function') this._transform = options.transform;

                if (typeof options.flush === 'function') this._flush = options.flush;
            }

            // When the writable side finishes, then flush out anything remaining.
            this.on('prefinish', prefinish);
        }

        function prefinish() {
            var _this = this;

            if (typeof this._flush === 'function') {
                this._flush(function(er, data) {
                    done(_this, er, data);
                });
            } else {
                done(this, null, null);
            }
        }

        Transform.prototype.push = function(chunk, encoding) {
            this._transformState.needTransform = false;
            return Duplex.prototype.push.call(this, chunk, encoding);
        };

        // This is the part where you do stuff!
        // override this function in implementation classes.
        // 'chunk' is an input chunk.
        //
        // Call `push(newChunk)` to pass along transformed output
        // to the readable side.  You may call 'push' zero or more times.
        //
        // Call `cb(err)` when you are done with this chunk.  If you pass
        // an error, then that'll put the hurt on the whole operation.  If you
        // never call cb(), then you'll never get another chunk.
        Transform.prototype._transform = function(chunk, encoding, cb) {
            throw new Error('_transform() is not implemented');
        };

        Transform.prototype._write = function(chunk, encoding, cb) {
            var ts = this._transformState;
            ts.writecb = cb;
            ts.writechunk = chunk;
            ts.writeencoding = encoding;
            if (!ts.transforming) {
                var rs = this._readableState;
                if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
            }
        };

        // Doesn't matter what the args are here.
        // _transform does all the work.
        // That we got here means that the readable side wants more data.
        Transform.prototype._read = function(n) {
            var ts = this._transformState;

            if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
                ts.transforming = true;
                this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
            } else {
                // mark that we need a transform, so that any data that comes in
                // will get processed, now that we've asked for it.
                ts.needTransform = true;
            }
        };

        Transform.prototype._destroy = function(err, cb) {
            var _this2 = this;

            Duplex.prototype._destroy.call(this, err, function(err2) {
                cb(err2);
                _this2.emit('close');
            });
        };

        function done(stream, er, data) {
            if (er) return stream.emit('error', er);

            if (data != null) // single equals check for both `null` and `undefined`
                stream.push(data);

            // if there's nothing in the write buffer, then that means
            // that nothing more will ever be provided
            if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

            if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

            return stream.push(null);
        }
    }, { "./_stream_duplex": 83, "core-util-is": 62, "inherits": 65 }],
    87: [function(require, module, exports) {
        (function(process, global, setImmediate) {
            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.

            // A bit simpler than readable streams.
            // Implement an async ._write(chunk, encoding, cb), and it'll handle all
            // the drain event emission and buffering.

            'use strict';

            /*<replacement>*/

            var pna = require('process-nextick-args');
            /*</replacement>*/

            module.exports = Writable;

            /* <replacement> */
            function WriteReq(chunk, encoding, cb) {
                this.chunk = chunk;
                this.encoding = encoding;
                this.callback = cb;
                this.next = null;
            }

            // It seems a linked list but it is not
            // there will be only 2 of these for each stream
            function CorkedRequest(state) {
                var _this = this;

                this.next = null;
                this.entry = null;
                this.finish = function() {
                    onCorkedFinish(_this, state);
                };
            }
            /* </replacement> */

            /*<replacement>*/
            var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
            /*</replacement>*/

            /*<replacement>*/
            var Duplex;
            /*</replacement>*/

            Writable.WritableState = WritableState;

            /*<replacement>*/
            var util = require('core-util-is');
            util.inherits = require('inherits');
            /*</replacement>*/

            /*<replacement>*/
            var internalUtil = {
                deprecate: require('util-deprecate')
            };
            /*</replacement>*/

            /*<replacement>*/
            var Stream = require('./internal/streams/stream');
            /*</replacement>*/

            /*<replacement>*/

            var Buffer = require('safe-buffer').Buffer;
            var OurUint8Array = global.Uint8Array || function() {};

            function _uint8ArrayToBuffer(chunk) {
                return Buffer.from(chunk);
            }

            function _isUint8Array(obj) {
                return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
            }

            /*</replacement>*/

            var destroyImpl = require('./internal/streams/destroy');

            util.inherits(Writable, Stream);

            function nop() {}

            function WritableState(options, stream) {
                Duplex = Duplex || require('./_stream_duplex');

                options = options || {};

                // Duplex streams are both readable and writable, but share
                // the same options object.
                // However, some cases require setting options to different
                // values for the readable and the writable sides of the duplex stream.
                // These options can be provided separately as readableXXX and writableXXX.
                var isDuplex = stream instanceof Duplex;

                // object stream flag to indicate whether or not this stream
                // contains buffers or objects.
                this.objectMode = !!options.objectMode;

                if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

                // the point at which write() starts returning false
                // Note: 0 is a valid value, means that we always return false if
                // the entire buffer is not flushed immediately on write()
                var hwm = options.highWaterMark;
                var writableHwm = options.writableHighWaterMark;
                var defaultHwm = this.objectMode ? 16 : 16 * 1024;

                if (hwm || hwm === 0) this.highWaterMark = hwm;
                else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;
                else this.highWaterMark = defaultHwm;

                // cast to ints.
                this.highWaterMark = Math.floor(this.highWaterMark);

                // if _final has been called
                this.finalCalled = false;

                // drain event flag.
                this.needDrain = false;
                // at the start of calling end()
                this.ending = false;
                // when end() has been called, and returned
                this.ended = false;
                // when 'finish' is emitted
                this.finished = false;

                // has it been destroyed
                this.destroyed = false;

                // should we decode strings into buffers before passing to _write?
                // this is here so that some node-core streams can optimize string
                // handling at a lower level.
                var noDecode = options.decodeStrings === false;
                this.decodeStrings = !noDecode;

                // Crypto is kind of old and crusty.  Historically, its default string
                // encoding is 'binary' so we have to make this configurable.
                // Everything else in the universe uses 'utf8', though.
                this.defaultEncoding = options.defaultEncoding || 'utf8';

                // not an actual buffer we keep track of, but a measurement
                // of how much we're waiting to get pushed to some underlying
                // socket or file.
                this.length = 0;

                // a flag to see when we're in the middle of a write.
                this.writing = false;

                // when true all writes will be buffered until .uncork() call
                this.corked = 0;

                // a flag to be able to tell if the onwrite cb is called immediately,
                // or on a later tick.  We set this to true at first, because any
                // actions that shouldn't happen until "later" should generally also
                // not happen before the first write call.
                this.sync = true;

                // a flag to know if we're processing previously buffered items, which
                // may call the _write() callback in the same tick, so that we don't
                // end up in an overlapped onwrite situation.
                this.bufferProcessing = false;

                // the callback that's passed to _write(chunk,cb)
                this.onwrite = function(er) {
                    onwrite(stream, er);
                };

                // the callback that the user supplies to write(chunk,encoding,cb)
                this.writecb = null;

                // the amount that is being written when _write is called.
                this.writelen = 0;

                this.bufferedRequest = null;
                this.lastBufferedRequest = null;

                // number of pending user-supplied write callbacks
                // this must be 0 before 'finish' can be emitted
                this.pendingcb = 0;

                // emit prefinish if the only thing we're waiting for is _write cbs
                // This is relevant for synchronous Transform streams
                this.prefinished = false;

                // True if the error was already emitted and should not be thrown again
                this.errorEmitted = false;

                // count buffered requests
                this.bufferedRequestCount = 0;

                // allocate the first CorkedRequest, there is always
                // one allocated and free to use, and we maintain at most two
                this.corkedRequestsFree = new CorkedRequest(this);
            }

            WritableState.prototype.getBuffer = function getBuffer() {
                var current = this.bufferedRequest;
                var out = [];
                while (current) {
                    out.push(current);
                    current = current.next;
                }
                return out;
            };

            (function() {
                try {
                    Object.defineProperty(WritableState.prototype, 'buffer', {
                        get: internalUtil.deprecate(function() {
                            return this.getBuffer();
                        }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
                    });
                } catch (_) {}
            })();

            // Test _writableState for inheritance to account for Duplex streams,
            // whose prototype chain only points to Readable.
            var realHasInstance;
            if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
                realHasInstance = Function.prototype[Symbol.hasInstance];
                Object.defineProperty(Writable, Symbol.hasInstance, {
                    value: function(object) {
                        if (realHasInstance.call(this, object)) return true;
                        if (this !== Writable) return false;

                        return object && object._writableState instanceof WritableState;
                    }
                });
            } else {
                realHasInstance = function(object) {
                    return object instanceof this;
                };
            }

            function Writable(options) {
                Duplex = Duplex || require('./_stream_duplex');

                // Writable ctor is applied to Duplexes, too.
                // `realHasInstance` is necessary because using plain `instanceof`
                // would return false, as no `_writableState` property is attached.

                // Trying to use the custom `instanceof` for Writable here will also break the
                // Node.js LazyTransform implementation, which has a non-trivial getter for
                // `_writableState` that would lead to infinite recursion.
                if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
                    return new Writable(options);
                }

                this._writableState = new WritableState(options, this);

                // legacy.
                this.writable = true;

                if (options) {
                    if (typeof options.write === 'function') this._write = options.write;

                    if (typeof options.writev === 'function') this._writev = options.writev;

                    if (typeof options.destroy === 'function') this._destroy = options.destroy;

                    if (typeof options.final === 'function') this._final = options.final;
                }

                Stream.call(this);
            }

            // Otherwise people can pipe Writable streams, which is just wrong.
            Writable.prototype.pipe = function() {
                this.emit('error', new Error('Cannot pipe, not readable'));
            };

            function writeAfterEnd(stream, cb) {
                var er = new Error('write after end');
                // TODO: defer error events consistently everywhere, not just the cb
                stream.emit('error', er);
                pna.nextTick(cb, er);
            }

            // Checks that a user-supplied chunk is valid, especially for the particular
            // mode the stream is in. Currently this means that `null` is never accepted
            // and undefined/non-string values are only allowed in object mode.
            function validChunk(stream, state, chunk, cb) {
                var valid = true;
                var er = false;

                if (chunk === null) {
                    er = new TypeError('May not write null values to stream');
                } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
                    er = new TypeError('Invalid non-string/buffer chunk');
                }
                if (er) {
                    stream.emit('error', er);
                    pna.nextTick(cb, er);
                    valid = false;
                }
                return valid;
            }

            Writable.prototype.write = function(chunk, encoding, cb) {
                var state = this._writableState;
                var ret = false;
                var isBuf = !state.objectMode && _isUint8Array(chunk);

                if (isBuf && !Buffer.isBuffer(chunk)) {
                    chunk = _uint8ArrayToBuffer(chunk);
                }

                if (typeof encoding === 'function') {
                    cb = encoding;
                    encoding = null;
                }

                if (isBuf) encoding = 'buffer';
                else if (!encoding) encoding = state.defaultEncoding;

                if (typeof cb !== 'function') cb = nop;

                if (state.ended) writeAfterEnd(this, cb);
                else if (isBuf || validChunk(this, state, chunk, cb)) {
                    state.pendingcb++;
                    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
                }

                return ret;
            };

            Writable.prototype.cork = function() {
                var state = this._writableState;

                state.corked++;
            };

            Writable.prototype.uncork = function() {
                var state = this._writableState;

                if (state.corked) {
                    state.corked--;

                    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
                }
            };

            Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
                // node::ParseEncoding() requires lower case.
                if (typeof encoding === 'string') encoding = encoding.toLowerCase();
                if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
                this._writableState.defaultEncoding = encoding;
                return this;
            };

            function decodeChunk(state, chunk, encoding) {
                if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
                    chunk = Buffer.from(chunk, encoding);
                }
                return chunk;
            }

            Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
                // making it explicit this property is not enumerable
                // because otherwise some prototype manipulation in
                // userland will fail
                enumerable: false,
                get: function() {
                    return this._writableState.highWaterMark;
                }
            });

            // if we're already writing something, then just put this
            // in the queue, and wait our turn.  Otherwise, call _write
            // If we return false, then we need a drain event, so set that flag.
            function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
                if (!isBuf) {
                    var newChunk = decodeChunk(state, chunk, encoding);
                    if (chunk !== newChunk) {
                        isBuf = true;
                        encoding = 'buffer';
                        chunk = newChunk;
                    }
                }
                var len = state.objectMode ? 1 : chunk.length;

                state.length += len;

                var ret = state.length < state.highWaterMark;
                // we must ensure that previous needDrain will not be reset to false.
                if (!ret) state.needDrain = true;

                if (state.writing || state.corked) {
                    var last = state.lastBufferedRequest;
                    state.lastBufferedRequest = {
                        chunk: chunk,
                        encoding: encoding,
                        isBuf: isBuf,
                        callback: cb,
                        next: null
                    };
                    if (last) {
                        last.next = state.lastBufferedRequest;
                    } else {
                        state.bufferedRequest = state.lastBufferedRequest;
                    }
                    state.bufferedRequestCount += 1;
                } else {
                    doWrite(stream, state, false, len, chunk, encoding, cb);
                }

                return ret;
            }

            function doWrite(stream, state, writev, len, chunk, encoding, cb) {
                state.writelen = len;
                state.writecb = cb;
                state.writing = true;
                state.sync = true;
                if (writev) stream._writev(chunk, state.onwrite);
                else stream._write(chunk, encoding, state.onwrite);
                state.sync = false;
            }

            function onwriteError(stream, state, sync, er, cb) {
                --state.pendingcb;

                if (sync) {
                    // defer the callback if we are being called synchronously
                    // to avoid piling up things on the stack
                    pna.nextTick(cb, er);
                    // this can emit finish, and it will always happen
                    // after error
                    pna.nextTick(finishMaybe, stream, state);
                    stream._writableState.errorEmitted = true;
                    stream.emit('error', er);
                } else {
                    // the caller expect this to happen before if
                    // it is async
                    cb(er);
                    stream._writableState.errorEmitted = true;
                    stream.emit('error', er);
                    // this can emit finish, but finish must
                    // always follow error
                    finishMaybe(stream, state);
                }
            }

            function onwriteStateUpdate(state) {
                state.writing = false;
                state.writecb = null;
                state.length -= state.writelen;
                state.writelen = 0;
            }

            function onwrite(stream, er) {
                var state = stream._writableState;
                var sync = state.sync;
                var cb = state.writecb;

                onwriteStateUpdate(state);

                if (er) onwriteError(stream, state, sync, er, cb);
                else {
                    // Check if we're actually ready to finish, but don't emit yet
                    var finished = needFinish(state);

                    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
                        clearBuffer(stream, state);
                    }

                    if (sync) {
                        /*<replacement>*/
                        asyncWrite(afterWrite, stream, state, finished, cb);
                        /*</replacement>*/
                    } else {
                        afterWrite(stream, state, finished, cb);
                    }
                }
            }

            function afterWrite(stream, state, finished, cb) {
                if (!finished) onwriteDrain(stream, state);
                state.pendingcb--;
                cb();
                finishMaybe(stream, state);
            }

            // Must force callback to be called on nextTick, so that we don't
            // emit 'drain' before the write() consumer gets the 'false' return
            // value, and has a chance to attach a 'drain' listener.
            function onwriteDrain(stream, state) {
                if (state.length === 0 && state.needDrain) {
                    state.needDrain = false;
                    stream.emit('drain');
                }
            }

            // if there's something in the buffer waiting, then process it
            function clearBuffer(stream, state) {
                state.bufferProcessing = true;
                var entry = state.bufferedRequest;

                if (stream._writev && entry && entry.next) {
                    // Fast case, write everything using _writev()
                    var l = state.bufferedRequestCount;
                    var buffer = new Array(l);
                    var holder = state.corkedRequestsFree;
                    holder.entry = entry;

                    var count = 0;
                    var allBuffers = true;
                    while (entry) {
                        buffer[count] = entry;
                        if (!entry.isBuf) allBuffers = false;
                        entry = entry.next;
                        count += 1;
                    }
                    buffer.allBuffers = allBuffers;

                    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

                    // doWrite is almost always async, defer these to save a bit of time
                    // as the hot path ends with doWrite
                    state.pendingcb++;
                    state.lastBufferedRequest = null;
                    if (holder.next) {
                        state.corkedRequestsFree = holder.next;
                        holder.next = null;
                    } else {
                        state.corkedRequestsFree = new CorkedRequest(state);
                    }
                    state.bufferedRequestCount = 0;
                } else {
                    // Slow case, write chunks one-by-one
                    while (entry) {
                        var chunk = entry.chunk;
                        var encoding = entry.encoding;
                        var cb = entry.callback;
                        var len = state.objectMode ? 1 : chunk.length;

                        doWrite(stream, state, false, len, chunk, encoding, cb);
                        entry = entry.next;
                        state.bufferedRequestCount--;
                        // if we didn't call the onwrite immediately, then
                        // it means that we need to wait until it does.
                        // also, that means that the chunk and cb are currently
                        // being processed, so move the buffer counter past them.
                        if (state.writing) {
                            break;
                        }
                    }

                    if (entry === null) state.lastBufferedRequest = null;
                }

                state.bufferedRequest = entry;
                state.bufferProcessing = false;
            }

            Writable.prototype._write = function(chunk, encoding, cb) {
                cb(new Error('_write() is not implemented'));
            };

            Writable.prototype._writev = null;

            Writable.prototype.end = function(chunk, encoding, cb) {
                var state = this._writableState;

                if (typeof chunk === 'function') {
                    cb = chunk;
                    chunk = null;
                    encoding = null;
                } else if (typeof encoding === 'function') {
                    cb = encoding;
                    encoding = null;
                }

                if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

                // .end() fully uncorks
                if (state.corked) {
                    state.corked = 1;
                    this.uncork();
                }

                // ignore unnecessary end() calls.
                if (!state.ending && !state.finished) endWritable(this, state, cb);
            };

            function needFinish(state) {
                return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
            }

            function callFinal(stream, state) {
                stream._final(function(err) {
                    state.pendingcb--;
                    if (err) {
                        stream.emit('error', err);
                    }
                    state.prefinished = true;
                    stream.emit('prefinish');
                    finishMaybe(stream, state);
                });
            }

            function prefinish(stream, state) {
                if (!state.prefinished && !state.finalCalled) {
                    if (typeof stream._final === 'function') {
                        state.pendingcb++;
                        state.finalCalled = true;
                        pna.nextTick(callFinal, stream, state);
                    } else {
                        state.prefinished = true;
                        stream.emit('prefinish');
                    }
                }
            }

            function finishMaybe(stream, state) {
                var need = needFinish(state);
                if (need) {
                    prefinish(stream, state);
                    if (state.pendingcb === 0) {
                        state.finished = true;
                        stream.emit('finish');
                    }
                }
                return need;
            }

            function endWritable(stream, state, cb) {
                state.ending = true;
                finishMaybe(stream, state);
                if (cb) {
                    if (state.finished) pna.nextTick(cb);
                    else stream.once('finish', cb);
                }
                state.ended = true;
                stream.writable = false;
            }

            function onCorkedFinish(corkReq, state, err) {
                var entry = corkReq.entry;
                corkReq.entry = null;
                while (entry) {
                    var cb = entry.callback;
                    state.pendingcb--;
                    cb(err);
                    entry = entry.next;
                }
                if (state.corkedRequestsFree) {
                    state.corkedRequestsFree.next = corkReq;
                } else {
                    state.corkedRequestsFree = corkReq;
                }
            }

            Object.defineProperty(Writable.prototype, 'destroyed', {
                get: function() {
                    if (this._writableState === undefined) {
                        return false;
                    }
                    return this._writableState.destroyed;
                },
                set: function(value) {
                    // we ignore the value if the stream
                    // has not been initialized yet
                    if (!this._writableState) {
                        return;
                    }

                    // backward compatibility, the user is explicitly
                    // managing destroyed
                    this._writableState.destroyed = value;
                }
            });

            Writable.prototype.destroy = destroyImpl.destroy;
            Writable.prototype._undestroy = destroyImpl.undestroy;
            Writable.prototype._destroy = function(err, cb) {
                this.end();
                cb(err);
            };
        }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("timers").setImmediate)
    }, { "./_stream_duplex": 83, "./internal/streams/destroy": 89, "./internal/streams/stream": 90, "_process": 81, "core-util-is": 62, "inherits": 65, "process-nextick-args": 80, "safe-buffer": 95, "timers": 98, "util-deprecate": 100 }],
    88: [function(require, module, exports) {
        'use strict';

        function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

        var Buffer = require('safe-buffer').Buffer;
        var util = require('util');

        function copyBuffer(src, target, offset) {
            src.copy(target, offset);
        }

        module.exports = function() {
            function BufferList() {
                _classCallCheck(this, BufferList);

                this.head = null;
                this.tail = null;
                this.length = 0;
            }

            BufferList.prototype.push = function push(v) {
                var entry = { data: v, next: null };
                if (this.length > 0) this.tail.next = entry;
                else this.head = entry;
                this.tail = entry;
                ++this.length;
            };

            BufferList.prototype.unshift = function unshift(v) {
                var entry = { data: v, next: this.head };
                if (this.length === 0) this.tail = entry;
                this.head = entry;
                ++this.length;
            };

            BufferList.prototype.shift = function shift() {
                if (this.length === 0) return;
                var ret = this.head.data;
                if (this.length === 1) this.head = this.tail = null;
                else this.head = this.head.next;
                --this.length;
                return ret;
            };

            BufferList.prototype.clear = function clear() {
                this.head = this.tail = null;
                this.length = 0;
            };

            BufferList.prototype.join = function join(s) {
                if (this.length === 0) return '';
                var p = this.head;
                var ret = '' + p.data;
                while (p = p.next) {
                    ret += s + p.data;
                }
                return ret;
            };

            BufferList.prototype.concat = function concat(n) {
                if (this.length === 0) return Buffer.alloc(0);
                if (this.length === 1) return this.head.data;
                var ret = Buffer.allocUnsafe(n >>> 0);
                var p = this.head;
                var i = 0;
                while (p) {
                    copyBuffer(p.data, ret, i);
                    i += p.data.length;
                    p = p.next;
                }
                return ret;
            };

            return BufferList;
        }();

        if (util && util.inspect && util.inspect.custom) {
            module.exports.prototype[util.inspect.custom] = function() {
                var obj = util.inspect({ length: this.length });
                return this.constructor.name + ' ' + obj;
            };
        }
    }, { "safe-buffer": 95, "util": 58 }],
    89: [function(require, module, exports) {
        'use strict';

        /*<replacement>*/

        var pna = require('process-nextick-args');
        /*</replacement>*/

        // undocumented cb() API, needed for core, not for public API
        function destroy(err, cb) {
            var _this = this;

            var readableDestroyed = this._readableState && this._readableState.destroyed;
            var writableDestroyed = this._writableState && this._writableState.destroyed;

            if (readableDestroyed || writableDestroyed) {
                if (cb) {
                    cb(err);
                } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
                    pna.nextTick(emitErrorNT, this, err);
                }
                return this;
            }

            // we set destroyed to true before firing error callbacks in order
            // to make it re-entrance safe in case destroy() is called within callbacks

            if (this._readableState) {
                this._readableState.destroyed = true;
            }

            // if this is a duplex stream mark the writable part as destroyed as well
            if (this._writableState) {
                this._writableState.destroyed = true;
            }

            this._destroy(err || null, function(err) {
                if (!cb && err) {
                    pna.nextTick(emitErrorNT, _this, err);
                    if (_this._writableState) {
                        _this._writableState.errorEmitted = true;
                    }
                } else if (cb) {
                    cb(err);
                }
            });

            return this;
        }

        function undestroy() {
            if (this._readableState) {
                this._readableState.destroyed = false;
                this._readableState.reading = false;
                this._readableState.ended = false;
                this._readableState.endEmitted = false;
            }

            if (this._writableState) {
                this._writableState.destroyed = false;
                this._writableState.ended = false;
                this._writableState.ending = false;
                this._writableState.finished = false;
                this._writableState.errorEmitted = false;
            }
        }

        function emitErrorNT(self, err) {
            self.emit('error', err);
        }

        module.exports = {
            destroy: destroy,
            undestroy: undestroy
        };
    }, { "process-nextick-args": 80 }],
    90: [function(require, module, exports) {
        module.exports = require('events').EventEmitter;

    }, { "events": 63 }],
    91: [function(require, module, exports) {
        module.exports = require('./readable').PassThrough

    }, { "./readable": 92 }],
    92: [function(require, module, exports) {
        exports = module.exports = require('./lib/_stream_readable.js');
        exports.Stream = exports;
        exports.Readable = exports;
        exports.Writable = require('./lib/_stream_writable.js');
        exports.Duplex = require('./lib/_stream_duplex.js');
        exports.Transform = require('./lib/_stream_transform.js');
        exports.PassThrough = require('./lib/_stream_passthrough.js');

    }, { "./lib/_stream_duplex.js": 83, "./lib/_stream_passthrough.js": 84, "./lib/_stream_readable.js": 85, "./lib/_stream_transform.js": 86, "./lib/_stream_writable.js": 87 }],
    93: [function(require, module, exports) {
        module.exports = require('./readable').Transform

    }, { "./readable": 92 }],
    94: [function(require, module, exports) {
        module.exports = require('./lib/_stream_writable.js');

    }, { "./lib/_stream_writable.js": 87 }],
    95: [function(require, module, exports) {
        /* eslint-disable node/no-deprecated-api */
        var buffer = require('buffer')
        var Buffer = buffer.Buffer

        // alternative to using Object.keys for old browsers
        function copyProps(src, dst) {
            for (var key in src) {
                dst[key] = src[key]
            }
        }
        if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
            module.exports = buffer
        } else {
            // Copy properties from require('buffer')
            copyProps(buffer, exports)
            exports.Buffer = SafeBuffer
        }

        function SafeBuffer(arg, encodingOrOffset, length) {
            return Buffer(arg, encodingOrOffset, length)
        }

        // Copy static methods from Buffer
        copyProps(Buffer, SafeBuffer)

        SafeBuffer.from = function(arg, encodingOrOffset, length) {
            if (typeof arg === 'number') {
                throw new TypeError('Argument must not be a number')
            }
            return Buffer(arg, encodingOrOffset, length)
        }

        SafeBuffer.alloc = function(size, fill, encoding) {
            if (typeof size !== 'number') {
                throw new TypeError('Argument must be a number')
            }
            var buf = Buffer(size)
            if (fill !== undefined) {
                if (typeof encoding === 'string') {
                    buf.fill(fill, encoding)
                } else {
                    buf.fill(fill)
                }
            } else {
                buf.fill(0)
            }
            return buf
        }

        SafeBuffer.allocUnsafe = function(size) {
            if (typeof size !== 'number') {
                throw new TypeError('Argument must be a number')
            }
            return Buffer(size)
        }

        SafeBuffer.allocUnsafeSlow = function(size) {
            if (typeof size !== 'number') {
                throw new TypeError('Argument must be a number')
            }
            return buffer.SlowBuffer(size)
        }

    }, { "buffer": 61 }],
    96: [function(require, module, exports) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        module.exports = Stream;

        var EE = require('events').EventEmitter;
        var inherits = require('inherits');

        inherits(Stream, EE);
        Stream.Readable = require('readable-stream/readable.js');
        Stream.Writable = require('readable-stream/writable.js');
        Stream.Duplex = require('readable-stream/duplex.js');
        Stream.Transform = require('readable-stream/transform.js');
        Stream.PassThrough = require('readable-stream/passthrough.js');

        // Backwards-compat with node 0.4.x
        Stream.Stream = Stream;



        // old-style streams.  Note that the pipe method (the only relevant
        // part of this class) is overridden in the Readable class.

        function Stream() {
            EE.call(this);
        }

        Stream.prototype.pipe = function(dest, options) {
            var source = this;

            function ondata(chunk) {
                if (dest.writable) {
                    if (false === dest.write(chunk) && source.pause) {
                        source.pause();
                    }
                }
            }

            source.on('data', ondata);

            function ondrain() {
                if (source.readable && source.resume) {
                    source.resume();
                }
            }

            dest.on('drain', ondrain);

            // If the 'end' option is not supplied, dest.end() will be called when
            // source gets the 'end' or 'close' events.  Only dest.end() once.
            if (!dest._isStdio && (!options || options.end !== false)) {
                source.on('end', onend);
                source.on('close', onclose);
            }

            var didOnEnd = false;

            function onend() {
                if (didOnEnd) return;
                didOnEnd = true;

                dest.end();
            }


            function onclose() {
                if (didOnEnd) return;
                didOnEnd = true;

                if (typeof dest.destroy === 'function') dest.destroy();
            }

            // don't leave dangling pipes when there are errors.
            function onerror(er) {
                cleanup();
                if (EE.listenerCount(this, 'error') === 0) {
                    throw er; // Unhandled stream error in pipe.
                }
            }

            source.on('error', onerror);
            dest.on('error', onerror);

            // remove all the event listeners that were added.
            function cleanup() {
                source.removeListener('data', ondata);
                dest.removeListener('drain', ondrain);

                source.removeListener('end', onend);
                source.removeListener('close', onclose);

                source.removeListener('error', onerror);
                dest.removeListener('error', onerror);

                source.removeListener('end', cleanup);
                source.removeListener('close', cleanup);

                dest.removeListener('close', cleanup);
            }

            source.on('end', cleanup);
            source.on('close', cleanup);

            dest.on('close', cleanup);

            dest.emit('pipe', source);

            // Allow for unix-like usage: A.pipe(B).pipe(C)
            return dest;
        };

    }, { "events": 63, "inherits": 65, "readable-stream/duplex.js": 82, "readable-stream/passthrough.js": 91, "readable-stream/readable.js": 92, "readable-stream/transform.js": 93, "readable-stream/writable.js": 94 }],
    97: [function(require, module, exports) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        'use strict';

        /*<replacement>*/

        var Buffer = require('safe-buffer').Buffer;
        /*</replacement>*/

        var isEncoding = Buffer.isEncoding || function(encoding) {
            encoding = '' + encoding;
            switch (encoding && encoding.toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'binary':
                case 'base64':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                case 'raw':
                    return true;
                default:
                    return false;
            }
        };

        function _normalizeEncoding(enc) {
            if (!enc) return 'utf8';
            var retried;
            while (true) {
                switch (enc) {
                    case 'utf8':
                    case 'utf-8':
                        return 'utf8';
                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        return 'utf16le';
                    case 'latin1':
                    case 'binary':
                        return 'latin1';
                    case 'base64':
                    case 'ascii':
                    case 'hex':
                        return enc;
                    default:
                        if (retried) return; // undefined
                        enc = ('' + enc).toLowerCase();
                        retried = true;
                }
            }
        };

        // Do not cache `Buffer.isEncoding` when checking encoding names as some
        // modules monkey-patch it to support additional encodings
        function normalizeEncoding(enc) {
            var nenc = _normalizeEncoding(enc);
            if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
            return nenc || enc;
        }

        // StringDecoder provides an interface for efficiently splitting a series of
        // buffers into a series of JS strings without breaking apart multi-byte
        // characters.
        exports.StringDecoder = StringDecoder;

        function StringDecoder(encoding) {
            this.encoding = normalizeEncoding(encoding);
            var nb;
            switch (this.encoding) {
                case 'utf16le':
                    this.text = utf16Text;
                    this.end = utf16End;
                    nb = 4;
                    break;
                case 'utf8':
                    this.fillLast = utf8FillLast;
                    nb = 4;
                    break;
                case 'base64':
                    this.text = base64Text;
                    this.end = base64End;
                    nb = 3;
                    break;
                default:
                    this.write = simpleWrite;
                    this.end = simpleEnd;
                    return;
            }
            this.lastNeed = 0;
            this.lastTotal = 0;
            this.lastChar = Buffer.allocUnsafe(nb);
        }

        StringDecoder.prototype.write = function(buf) {
            if (buf.length === 0) return '';
            var r;
            var i;
            if (this.lastNeed) {
                r = this.fillLast(buf);
                if (r === undefined) return '';
                i = this.lastNeed;
                this.lastNeed = 0;
            } else {
                i = 0;
            }
            if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
            return r || '';
        };

        StringDecoder.prototype.end = utf8End;

        // Returns only complete characters in a Buffer
        StringDecoder.prototype.text = utf8Text;

        // Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
        StringDecoder.prototype.fillLast = function(buf) {
            if (this.lastNeed <= buf.length) {
                buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
                return this.lastChar.toString(this.encoding, 0, this.lastTotal);
            }
            buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
            this.lastNeed -= buf.length;
        };

        // Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
        // continuation byte. If an invalid byte is detected, -2 is returned.
        function utf8CheckByte(byte) {
            if (byte <= 0x7F) return 0;
            else if (byte >> 5 === 0x06) return 2;
            else if (byte >> 4 === 0x0E) return 3;
            else if (byte >> 3 === 0x1E) return 4;
            return byte >> 6 === 0x02 ? -1 : -2;
        }

        // Checks at most 3 bytes at the end of a Buffer in order to detect an
        // incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
        // needed to complete the UTF-8 character (if applicable) are returned.
        function utf8CheckIncomplete(self, buf, i) {
            var j = buf.length - 1;
            if (j < i) return 0;
            var nb = utf8CheckByte(buf[j]);
            if (nb >= 0) {
                if (nb > 0) self.lastNeed = nb - 1;
                return nb;
            }
            if (--j < i || nb === -2) return 0;
            nb = utf8CheckByte(buf[j]);
            if (nb >= 0) {
                if (nb > 0) self.lastNeed = nb - 2;
                return nb;
            }
            if (--j < i || nb === -2) return 0;
            nb = utf8CheckByte(buf[j]);
            if (nb >= 0) {
                if (nb > 0) {
                    if (nb === 2) nb = 0;
                    else self.lastNeed = nb - 3;
                }
                return nb;
            }
            return 0;
        }

        // Validates as many continuation bytes for a multi-byte UTF-8 character as
        // needed or are available. If we see a non-continuation byte where we expect
        // one, we "replace" the validated continuation bytes we've seen so far with
        // a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
        // behavior. The continuation byte check is included three times in the case
        // where all of the continuation bytes for a character exist in the same buffer.
        // It is also done this way as a slight performance increase instead of using a
        // loop.
        function utf8CheckExtraBytes(self, buf, p) {
            if ((buf[0] & 0xC0) !== 0x80) {
                self.lastNeed = 0;
                return '\ufffd';
            }
            if (self.lastNeed > 1 && buf.length > 1) {
                if ((buf[1] & 0xC0) !== 0x80) {
                    self.lastNeed = 1;
                    return '\ufffd';
                }
                if (self.lastNeed > 2 && buf.length > 2) {
                    if ((buf[2] & 0xC0) !== 0x80) {
                        self.lastNeed = 2;
                        return '\ufffd';
                    }
                }
            }
        }

        // Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
        function utf8FillLast(buf) {
            var p = this.lastTotal - this.lastNeed;
            var r = utf8CheckExtraBytes(this, buf, p);
            if (r !== undefined) return r;
            if (this.lastNeed <= buf.length) {
                buf.copy(this.lastChar, p, 0, this.lastNeed);
                return this.lastChar.toString(this.encoding, 0, this.lastTotal);
            }
            buf.copy(this.lastChar, p, 0, buf.length);
            this.lastNeed -= buf.length;
        }

        // Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
        // partial character, the character's bytes are buffered until the required
        // number of bytes are available.
        function utf8Text(buf, i) {
            var total = utf8CheckIncomplete(this, buf, i);
            if (!this.lastNeed) return buf.toString('utf8', i);
            this.lastTotal = total;
            var end = buf.length - (total - this.lastNeed);
            buf.copy(this.lastChar, 0, end);
            return buf.toString('utf8', i, end);
        }

        // For UTF-8, a replacement character is added when ending on a partial
        // character.
        function utf8End(buf) {
            var r = buf && buf.length ? this.write(buf) : '';
            if (this.lastNeed) return r + '\ufffd';
            return r;
        }

        // UTF-16LE typically needs two bytes per character, but even if we have an even
        // number of bytes available, we need to check if we end on a leading/high
        // surrogate. In that case, we need to wait for the next two bytes in order to
        // decode the last character properly.
        function utf16Text(buf, i) {
            if ((buf.length - i) % 2 === 0) {
                var r = buf.toString('utf16le', i);
                if (r) {
                    var c = r.charCodeAt(r.length - 1);
                    if (c >= 0xD800 && c <= 0xDBFF) {
                        this.lastNeed = 2;
                        this.lastTotal = 4;
                        this.lastChar[0] = buf[buf.length - 2];
                        this.lastChar[1] = buf[buf.length - 1];
                        return r.slice(0, -1);
                    }
                }
                return r;
            }
            this.lastNeed = 1;
            this.lastTotal = 2;
            this.lastChar[0] = buf[buf.length - 1];
            return buf.toString('utf16le', i, buf.length - 1);
        }

        // For UTF-16LE we do not explicitly append special replacement characters if we
        // end on a partial character, we simply let v8 handle that.
        function utf16End(buf) {
            var r = buf && buf.length ? this.write(buf) : '';
            if (this.lastNeed) {
                var end = this.lastTotal - this.lastNeed;
                return r + this.lastChar.toString('utf16le', 0, end);
            }
            return r;
        }

        function base64Text(buf, i) {
            var n = (buf.length - i) % 3;
            if (n === 0) return buf.toString('base64', i);
            this.lastNeed = 3 - n;
            this.lastTotal = 3;
            if (n === 1) {
                this.lastChar[0] = buf[buf.length - 1];
            } else {
                this.lastChar[0] = buf[buf.length - 2];
                this.lastChar[1] = buf[buf.length - 1];
            }
            return buf.toString('base64', i, buf.length - n);
        }

        function base64End(buf) {
            var r = buf && buf.length ? this.write(buf) : '';
            if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
            return r;
        }

        // Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
        function simpleWrite(buf) {
            return buf.toString(this.encoding);
        }

        function simpleEnd(buf) {
            return buf && buf.length ? this.write(buf) : '';
        }
    }, { "safe-buffer": 95 }],
    98: [function(require, module, exports) {
        (function(setImmediate, clearImmediate) {
            var nextTick = require('process/browser.js').nextTick;
            var apply = Function.prototype.apply;
            var slice = Array.prototype.slice;
            var immediateIds = {};
            var nextImmediateId = 0;

            // DOM APIs, for completeness

            exports.setTimeout = function() {
                return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
            };
            exports.setInterval = function() {
                return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
            };
            exports.clearTimeout =
                exports.clearInterval = function(timeout) { timeout.close(); };

            function Timeout(id, clearFn) {
                this._id = id;
                this._clearFn = clearFn;
            }
            Timeout.prototype.unref = Timeout.prototype.ref = function() {};
            Timeout.prototype.close = function() {
                this._clearFn.call(window, this._id);
            };

            // Does not start the time, just sets up the members needed.
            exports.enroll = function(item, msecs) {
                clearTimeout(item._idleTimeoutId);
                item._idleTimeout = msecs;
            };

            exports.unenroll = function(item) {
                clearTimeout(item._idleTimeoutId);
                item._idleTimeout = -1;
            };

            exports._unrefActive = exports.active = function(item) {
                clearTimeout(item._idleTimeoutId);

                var msecs = item._idleTimeout;
                if (msecs >= 0) {
                    item._idleTimeoutId = setTimeout(function onTimeout() {
                        if (item._onTimeout)
                            item._onTimeout();
                    }, msecs);
                }
            };

            // That's not how node.js implements it but the exposed api is the same.
            exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
                var id = nextImmediateId++;
                var args = arguments.length < 2 ? false : slice.call(arguments, 1);

                immediateIds[id] = true;

                nextTick(function onNextTick() {
                    if (immediateIds[id]) {
                        // fn.call() is faster so we optimize for the common use-case
                        // @see http://jsperf.com/call-apply-segu
                        if (args) {
                            fn.apply(null, args);
                        } else {
                            fn.call(null);
                        }
                        // Prevent ids from leaking
                        exports.clearImmediate(id);
                    }
                });

                return id;
            };

            exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
                delete immediateIds[id];
            };
        }).call(this, require("timers").setImmediate, require("timers").clearImmediate)
    }, { "process/browser.js": 81, "timers": 98 }],
    99: [function(require, module, exports) {
        exports.isatty = function() { return false; };

        function ReadStream() {
            throw new Error('tty.ReadStream is not implemented');
        }
        exports.ReadStream = ReadStream;

        function WriteStream() {
            throw new Error('tty.WriteStream is not implemented');
        }
        exports.WriteStream = WriteStream;

    }, {}],
    100: [function(require, module, exports) {
        (function(global) {

            /**
             * Module exports.
             */

            module.exports = deprecate;

            /**
             * Mark that a method should not be used.
             * Returns a modified function which warns once by default.
             *
             * If `localStorage.noDeprecation = true` is set, then it is a no-op.
             *
             * If `localStorage.throwDeprecation = true` is set, then deprecated functions
             * will throw an Error when invoked.
             *
             * If `localStorage.traceDeprecation = true` is set, then deprecated functions
             * will invoke `console.trace()` instead of `console.error()`.
             *
             * @param {Function} fn - the function to deprecate
             * @param {String} msg - the string to print to the console when `fn` is invoked
             * @returns {Function} a new "deprecated" version of `fn`
             * @api public
             */

            function deprecate(fn, msg) {
                if (config('noDeprecation')) {
                    return fn;
                }

                var warned = false;

                function deprecated() {
                    if (!warned) {
                        if (config('throwDeprecation')) {
                            throw new Error(msg);
                        } else if (config('traceDeprecation')) {
                            console.trace(msg);
                        } else {
                            console.warn(msg);
                        }
                        warned = true;
                    }
                    return fn.apply(this, arguments);
                }

                return deprecated;
            }

            /**
             * Checks `localStorage` for boolean values for the given `name`.
             *
             * @param {String} name
             * @returns {Boolean}
             * @api private
             */

            function config(name) {
                // accessing global.localStorage can trigger a DOMException in sandboxed iframes
                try {
                    if (!global.localStorage) return false;
                } catch (_) {
                    return false;
                }
                var val = global.localStorage[name];
                if (null == val) return false;
                return String(val).toLowerCase() === 'true';
            }

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}],
    101: [function(require, module, exports) {
        arguments[4][55][0].apply(exports, arguments)
    }, { "dup": 55 }],
    102: [function(require, module, exports) {
        arguments[4][56][0].apply(exports, arguments)
    }, { "./support/isBuffer": 101, "_process": 81, "dup": 56, "inherits": 65 }]
}, {}, [51]);