#!/usr/bin/env node
/* jshint: */
/*global module console process assert require fs:true sinon:true */

var flipcss = require('../flipcss');
var fs = require('fs');

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
        throw { name: "InvalidOptionError",
                message: "Invalid option(s).\n" + usage.toString() };
    }

    return {direction: direction,
            warnings: warnings,
            input: argv[0],
            output: argv[1]
           };
}

res = handleArgv(process.argv.slice(2));

if (typeof res === "string") {
    console.log(res.toString());
//    process.exit(2);
} else {
    console.log("o hai!")
}


// TODO: Fix this...?
module.exports = {handleArgv: handleArgv};


return;



fs.readFile('ding.css', "utf-8", function (err, data) {
    if (err) {
        console.log(err.message);
//        throw err;
        process.exit(1); // Error
    }

    var o = fs.openSync("dong.css", "w");
    fs.write(o, flipcss.flip(data));
    fs.close(o);
});

process.exit(0); // Success
