#!/usr/bin/env node
/* jshint: */
/*global module console process assert require fs:true sinon:true */

var flipcss = require('../lib/flipcss');
var fs = require('fs');

/**
 * Handle command line arguments
 * @param {Array} argv Command line arguments (with commands stripped off)
 * @throws {InvalidArgumentsError} If invalid argument(s)
 * @returns {Object} with options, or null.
 */
function handleArgv(argv) {
    // Usage info
    var usage = ["Usage: node flipcss [OPTION] ... INFILE OUTFILE",
                 "  -r, --rtl        Flip CSS LTR>RTL",
                 "  -l, --ltr        Flip CSS RTL>LTR",
                 "  -w, --warnings   Output warnings",
                 "  -h, --help       Usage information",
                 "If no direction is given, the CSS is just flipped."
                ].join("\n");

    // Asked for help
    if (argv[0] === "-h" || argv[0] === "--help") {
        console.log(usage.toString());
        return null;
    }

    // Vars
    var direction = "none"
    ,   warnings = false
    ,   validArgs = {"-r": "rtl",
                     "--rtl": "rtl",
                     "-l": "ltr",
                     "--ltr": "ltr",
                     "-w": "warnings",
                     "--warnings": "warnings"
                    }
    ,   optCount = 0;

    // Process args
    for (var arg in validArgs) {
        if(validArgs.hasOwnProperty(arg)) {
            var i = argv.indexOf(arg);
            if (-1 < i) {
                optCount++;

                argv.splice(i,1);

                switch (validArgs[arg]) {
                case 'rtl':
                    direction = "rtl";
                    break;
                case 'ltr':
                    direction = "ltr";
                    break;
                case 'warnings':
                    warnings = true;
                    break;
                }
            }
        }
    }

    // Invalid arguments
    if (2 < optCount || argv.length !== 2) {
        throw { name: "InvalidArgumentsError",
                message: "Invalid option(s).\n" + usage.toString() };
    }

    return {direction: direction,
            warnings: warnings,
            input: argv[0],
            output: argv[1]
           };
}


/**
 * Transform CSS from LTR>RTL or vice versa.
 * @param {String} css CSS to transform
 * @param {String} direction Direction ("ltr", "rtl", or empty/"none")
 * @param {Boolean} warnings Output warnings
 * @return {String} Processed CSS
 */
function transform(css, direction, warnings) {
    if (direction === "ltr" || direction === "rtl") {
        css = flipcss.clean(css, direction);
    }

    return flipcss.flip(css, warnings);
}

/**
 * Main.
 */
function main() {
    var res;
    try {
        res = handleArgv(process.argv.slice(2));
        if (!res) {
            process.exit(0);
        }
    } catch (err) {
        console.log(err.message);
        process.exit(2);
    }

    var infileName = res.input;
    var outfileName = res.output;

    fs.readFile(infileName, "utf-8", function (err, data) {
        if (err) {
            console.log(err.message);
            process.exit(1);
        }

        var outfile = fs.openSync(outfileName, "w");

        var outdata = transform(data, res.direction, res.warnings);

        fs.write(outfile, outdata);
        fs.close(outfile);
    });
}


if (require.main === module) {
    main();
} else {
    module.exports = {handleArgv: handleArgv,
                      transform: transform};
}
