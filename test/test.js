/* jshint: */
/*global public_functions assert require flipcss fs:true sinon:true */

fs = require("fs");
sinon = require("sinon");

if (typeof require !== "undefined") {
    var buster = require("buster");
    var lib = require("../flipcss");
}

buster.testCase("Functional tests: Test flipping a stylesheet, with pre-processing", {
    setUp: function () {
        sinon.spy(console, "log");
    },

    tearDown: function () {
        console.log.restore();
    },

    "test flip without warnings": function() {
        var pre_func = lib.clean;
        var func = lib.flip;

        var input = fs.readFileSync("fixtures/input_all.css").toString();
        var output = fs.readFileSync("fixtures/output_all.css").toString();

        input = pre_func(input, "rtl");
        assert.equals(func(input), output);
    },

    "test flipping with warnings": function() {
        var func = lib.flip;
        var pre_func = lib.clean;

        var input = fs.readFileSync("fixtures/input_all.css").toString();
        var output = fs.readFileSync("fixtures/output_all.css").toString();

        input = pre_func(input, "rtl");
        assert.equals(func(input, true), output);

        // Check that warnings are given
        assert(console.log.calledTwice);
        var spyCall = console.log.getCall(0);
        assert(-1 < spyCall.args[0].indexOf("Warning: Inline"));
    }
});

buster.testCase("Test swapping of two words", {
    "test swapping": function() {
        var func = buster.bind(lib.internals, lib.internals._swapWords);

        var input = fs.readFileSync("fixtures/input_swap_words.css").toString();
        var output = fs.readFileSync("fixtures/output_swap_words.css").toString();

        assert.equals(func(input, "left", "right"), output);
    }
});

buster.testCase("Test replacing word", {
    "test replacing": function() {
        var func = buster.bind(lib.internals, lib.internals._replaceWord);

        var input = fs.readFileSync("fixtures/input_replace_word.css").toString();
        var output = fs.readFileSync("fixtures/output_replace_word.css").toString();

        assert.equals(func(input, "italic", "normal"), output);
    }
});

buster.testCase("Test swapping of values for margin/padding", {
    "test swapping": function() {
        var func = buster.bind(lib.internals, lib.internals._swapValues);

        var input = fs.readFileSync("fixtures/input_swap_values.css").toString();
        var output = fs.readFileSync("fixtures/output_swap_values.css").toString();

        assert.equals(func(input), output);
    }
});

buster.testCase("Test swapping of values for background position", {
    "test swapping": function() {
        var func = buster.bind(lib.internals, lib.internals._swapBackgroundPosition);

        var input = fs.readFileSync("fixtures/input_background_position.css").toString();
        var output = fs.readFileSync("fixtures/output_background_position.css").toString();

        assert.equals(func(input), output);
    }
});

buster.testCase("Warnings", {
    "test warnings for inline elements": function() {
        var func = lib.internals._findInline;

        var input = ".foo { display: inline; margin-right: 3em; } #bar { display:inline-block;display:inline  ; } .baz { display: inline }";

        assert.equals(func(input), [7, 73]);
    }
});

buster.testCase("Add rules", {
    "test adding CSS rules": function() {
        var func = lib.internals._addRule;
        var input, output;

        input = "body { display: inline-block; }";
        output = "body {direction:rtl; display: inline-block; }";
        assert.equals(func(input, "body", "direction:rtl"), output);

        input = "foo {} body { display: inline-block; }";
        output = "foo {} body {direction:rtl; display: inline-block; }";
        assert.equals(func(input, "body", "direction:rtl"), output);

        input = "foo {} body { display: inline-block; }";
        output = "*{foo:bar;}foo {} body { display: inline-block; }";
        assert.equals(func(input, "*", "foo:bar"), output);

        input = "* {foo:bar;} body { display: inline-block; }";
        output = "* {baz:qux;foo:bar;} body { display: inline-block; }";
        assert.equals(func(input, "*", "baz:qux"), output);

        // Test empty string arguments
        input = "body { display: inline-block; }";
        output = "body { display: inline-block; }";
        assert.equals(func(input, "", "foo:bar"), output);

        input = "body { display: inline-block; }";
        output = "body { display: inline-block; }";
        assert.equals(func(input, "foo", ""), output);
    },

    "test adding rule to non-existing block": function() {
        var func = lib.internals._addRule;

        var input = "div { display: inline-block; }";
        var output = "body{direction:rtl;}div { display: inline-block; }";
        assert.equals(func(input, "body", "direction:rtl"), output);
    }
});

buster.testCase("Delete rule", {
    "test deleting a rtl-only CSS rule": function() {
        var func = lib.internals._deleteRule;

        var input = fs.readFileSync("fixtures/input_delete_rule.css").toString();
        var output = fs.readFileSync("fixtures/output_delete_rule.css").toString();
        assert.equals(func(input, "!rtl-only"), output);
    },

    "test deleting a rtl-only CSS rule using public function": function() {
        var func = lib.clean;

        var input = fs.readFileSync("fixtures/input_delete_rule.css").toString();
        var output = fs.readFileSync("fixtures/output_delete_rule.css").toString();
        assert.equals(func(input, "ltr"), output);
    }
});
