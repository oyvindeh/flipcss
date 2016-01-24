/*global assert:true */

var sinon = require("sinon");

if (typeof require !== "undefined") {
    var buster = require("buster");
    var lib = require("../bin/flipcss.bin.js");
}

var assert = buster.referee.assert;
var refute = buster.referee.refute;


buster.testCase("Command line arguments parser", {
    "works with no arguments": function() {
        var expected = {
            direction: "none",
            warnings: false,
            cleanOnly: false,
            swapPseudo: false,
            flipUrls: true,
            flipSelectors: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["style.css", "style-rtl.css"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "understands request to show warnings": function() {
        var expected = {
            direction: "none",
            warnings: true,
            cleanOnly: false,
            swapPseudo: false,
            flipUrls: true,
            flipSelectors: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["-w", "style.css", "style-rtl.css"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);

        argv = ["--warnings", "style.css", "style-rtl.css"];
        result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "understands request to do RTL>LTR": function() {
        var expected = {
            direction: "ltr",
            warnings: false,
            cleanOnly: false,
            swapPseudo: false,
            flipUrls: true,
            flipSelectors: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["-l", "style.css", "style-rtl.css"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);

        argv = ["--ltr", "style.css", "style-rtl.css"];
        result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "understands request to do LTR>RTL": function() {
        var expected = {
            direction: "rtl",
            warnings: false,
            cleanOnly: false,
            swapPseudo: false,
            flipUrls: true,
            flipSelectors: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["-r", "style.css", "style-rtl.css"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);

        argv = ["--rtl", "style.css", "style-rtl.css"];
        result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "understands request to do clean only": function() {
        var expected = {
            direction: "ltr",
            warnings: false,
            cleanOnly: true,
            swapPseudo: false,
            flipUrls: true,
            flipSelectors: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        // Missing direction
        var argv = ["style.css", "style-rtl.css", "--clean-only"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidArgumentsError");

        // With direction, long form
        argv = ["style.css", "style-rtl.css", "--clean-only", "--ltr"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);

        // With direction, short form
        argv = ["style.css", "style-rtl.css", "-c", "--ltr"];
        result = lib.handleArgv(argv);
        assert.equals(expected, result);

    },
    "understands request to swap pseudo elements": function() {
        var expected = {
            direction: "none",
            warnings: false,
            cleanOnly: false,
            swapPseudo: true,
            flipUrls: true,
            flipSelectors: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        // long form
        var argv = ["style.css", "style-rtl.css", "-p"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);

        // short form
        argv = ["style.css", "style-rtl.css", "--swap-pseudo"];
        result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "understands request to ignore URLs": function() {
        var expected = {
            direction: "none",
            warnings: false,
            cleanOnly: false,
            swapPseudo: false,
            flipUrls: false,
            flipSelectors: true,
            input: "style.css",
            output: "style-rtl.css"
        };

        // long form
        var argv = ["style.css", "style-rtl.css", "--ignore-urls"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);

        // short form
        argv = ["style.css", "style-rtl.css", "-u"];
        result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "understands request to ignore selectors": function() {
        var expected = {
            direction: "none",
            warnings: false,
            cleanOnly: false,
            swapPseudo: false,
            flipUrls: true,
            flipSelectors: false,
            input: "style.css",
            output: "style-rtl.css"
        };

        var argv = ["style.css", "style-rtl.css", "--ignore-selectors"];
        var result = lib.handleArgv(argv);
        assert.equals(expected, result);

        argv = ["style.css", "style-rtl.css", "-s"];
        result = lib.handleArgv(argv);
        assert.equals(expected, result);
    },
    "gives error when too few arguments": function() {
        var argv;

        // Missing input/output file
        argv = ["-r", "-w", "style.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidArgumentsError");

        // Missing input and output file
        argv = ["-r", "-w"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidArgumentsError");
    },
    "gives error when too many arguments": function() {
        var argv;

        // Extra option
        argv = ["-w", "-r", "-a", "style.css", "style-rtl.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidArgumentsError");

        // Extra trailing options
        argv = ["-w", "-r", "style.css", "style-rtl.css", "foo", "bar"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidArgumentsError");
    },
    "gives typeof on invalid arguments": function() {
        var argv;

        // Invalid argument
        argv = ["-r", "-a", "style.css", "style-rtl.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidArgumentsError");

        // Invalid argument
        argv = ["-a", "-r", "style.css", "style-rtl.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidArgumentsError");

        // Several invalid arguments
        argv = ["-a", "-r", "-b", "style.css", "style-rtl.css"];
        assert.exception(function() { lib.handleArgv(argv); },
                         "InvalidArgumentsError");
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
