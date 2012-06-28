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
    "understands valid keyword arguments (no direction)": function() {
        var expected = {
            direction: "none",
            warnings: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["-w", "style.css", "style-rtl.css"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "understands valid keyword arguments (no direction, no warnings)": function() {
        var expected = {
            direction: "none",
            warnings: false,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["style.css", "style-rtl.css"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "gives error when too few arguments": function() {
        var expected = false;

        var argv, result;

        // Missing input/output file
        argv = ["-r", "-w", "style.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidOptionError");

        // Missing input and output file
        argv = ["-r", "-w"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidOptionError");
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
        assert.equals(null, result);
    }
});


buster.testCase("Css transformer", {
    setUp: function () {
        sinon.spy(console, "log");
    },

    tearDown: function () {
        console.log.restore();
    },
    "can flip css without direction specified": function() {
        var data = ".foo{float:left;}";
        var expected = ".foo{float:right;}";
        var result = lib.transform(data, "none", true);
        assert.equals(result, expected);
    },
    "can output warnings": function() {
        var expected, result;

        var data = ".foo{float:left;}";

        expected = "body{direction:ltr;}.foo{float:right;}";
        result = lib.transform(data, "ltr", true);
        assert.equals(result, expected);

        expected = "body{direction:rtl;}.foo{float:right;}";
        result = lib.transform(data, "rtl", true);
        assert.equals(result, expected);
    },
    "can flip css with direction specified": function() {
        var data = ".foo{float:right;display:inline;}";

        lib.transform(data, "ltr", true);

        // Check that warnings are given
        assert(console.log.calledOnce);
        var spyCall = console.log.getCall(0);
        assert(-1 < spyCall.args[0].indexOf("Warning: Inline"));
    }
});