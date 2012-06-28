/* jshint: */
/*global public_functions assert require flipcss fs:true sinon:true */

fs = require("fs");
sinon = require("sinon");

if (typeof require !== "undefined") {
    var buster = require("buster");
    var lib = require("../bin/flipcss.bin.js");
}


buster.testCase("Command line arguments parser", {
    "understands valid short form arguments (warnings)": function() {
        var expected = {
            direction: "rtl",
            warnings: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["-r", "-w", "style.css", "style-rtl.css"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "understands valid short form arguments (no warnings)": function() {
        var expected = {
            direction: "ltr",
            warnings: false,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["-l", "style.css", "style-rtl.css"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "understands valid keyword arguments": function() {
        var expected = {
            direction: "rtl",
            warnings: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["--rtl", "--warnings", "style.css", "style-rtl.css"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "gives error when too few arguments": function() {
        var expected = false;

        var argv, result;

        // Missing direction
        argv = ["-w", "style.css", "style-rtl.css"];
        result = lib.handleArgv(argv);
        assert(typeof result === "string");

        // Missing direction
        argv = ["--warnings", "style.css", "style-rtl.css"];
        result = lib.handleArgv(argv);
        assert(typeof result === "string");

        // Missing input/output file
        argv = ["-r", "-w", "style.css"];
        result = lib.handleArgv(argv);
        assert(typeof result === "string");

        // Missing input and output file
        argv = ["-r", "-w"];
        result = lib.handleArgv(argv);
        assert(typeof result === "string");
    },
    "gives error when too many arguments": function() {
        var expected = false;

        var argv, result;

        // Extra option
        argv = ["-w", "-r", "-a", "style.css", "style-rtl.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidOptionError");

        // Extra trailing options
        argv = ["-w", "-r", "style.css", "style-rtl.css", "foo", "bar"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidOptionError");
    },
    "gives typeof on invalid arguments": function() {
        var expected = false;

        var argv, result;

        // Invalid argument
        argv = ["-r", "-a", "style.css", "style-rtl.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidOptionError");

        // Invalid argument
        argv = ["-a", "-r", "style.css", "style-rtl.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidOptionError");

        // Several invalid arguments
        argv = ["-a", "-r", "-b", "style.css", "style-rtl.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidOptionError");
    },
    "understands request for usage info": function() {
        var argv, result;

        argv = ["-h"];
        result = lib.handleArgv(argv);
        assert.equals(null, result);

        argv = ["--help"];
        result = lib.handleArgv(argv);
        assert(typeof result === "string");
    }
});