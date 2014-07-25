/* jshint: */
/*global public_functions assert require flipcss fs:true sinon:true */

fs = require("fs");
sinon = require("sinon");

if (typeof require !== "undefined") {
    var buster = require("buster");
    var lib = require("../lib/flipcss");
}


buster.assertions.add("pathFlipsTo", {
    assert: function (inputPath, expectedOutputPath) {
        var input = fs.readFileSync(inputPath).toString();
        var expectedOutput = fs.readFileSync(expectedOutputPath).toString();

        this.output = lib.flip(input);
        return this.output === expectedOutput;
    },
    assertMessage: "Expected ${0} to flip to ${1}, got \"${output}\".",
    refuteMessage: "Expected ${0} to not flip to ${1}, got \"${output}\"."
});


buster.assertions.add("flipsTo", {
    assert: function (input, expectedOutput) {
        this.output = lib.flip(input);
        return this.output === expectedOutput;
    },
    assertMessage: "Expected \"${0}\" to flip to \"${1}\", got \"${output}\".",
    refuteMessage: "Expected \"${0}\" to not flip to \"${1}\","
        + " got \"${output}\"."
});


buster.assertions.add("flipsToPseudo", {
    assert: function (input, expectedOutput) {
        this.output = lib.flip(input, false, true);
        return this.output === expectedOutput;
    },
    assertMessage: "Expected \"${0}\" to flip to \"${1}\", got \"${output}\".",
    refuteMessage: "Expected \"${0}\" to not flip to \"${1}\","
        + " got \"${output}\"."
});


buster.testCase("Functional tests: Flip stylesheet w/ pre-processing", {
    setUp: function () {
        sinon.spy(console, "log");
    },

    tearDown: function () {
        console.log.restore();
    },

    "flip without warnings": function() {
        var input = fs.readFileSync("fixtures/input_all.css").toString();
        var output = fs.readFileSync("fixtures/output_all.css").toString();

        input = lib.clean(input, "rtl");
        assert.flipsTo(input, output);
    },

    "flip with warnings": function() {
        var input = fs.readFileSync("fixtures/input_all.css").toString();
        var output = fs.readFileSync("fixtures/output_all.css").toString();

        input = lib.clean(input, "rtl");
        assert.equals(lib.flip(input, true), output);

        // Check that warnings are given
        assert(console.log.calledTwice);
        var spyCall = console.log.getCall(0);
        assert(-1 < spyCall.args[0].indexOf("Warning: Inline"));
    }
});


buster.testCase("CSS word swapper", {
    "swaps floats": function() {
        // Basic case: Swap right with left
        assert.flipsTo(".foo { float: right; }",
                       ".foo { float: left; }");
        // Basic case: Swap left with right
        assert.flipsTo(".foo { clear: left; }",
                       ".foo { clear: right; }");
        // Extra keyword: Swap left with right
        assert.flipsTo(".foo { float: right !important; }",
                       ".foo { float: left !important; }");
        // No whitespace: Swap left with right
        assert.flipsTo(".foo{float:right !important;}",
                       ".foo{float:left !important;}");
        // Extra whitespace: Swap left with right
        assert.flipsTo("  .foo  {  float:right  !important  ;  }  ",
                       "  .foo  {  float:left  !important  ;  }  ");
    },
    "swaps text-align": function() {
        // Basic case: Swap left with right
        assert.flipsTo(".foo { text-align: left; }",
                       ".foo { text-align: right; }");
    },
    "swaps margins and paddings": function() {
        // Basic case: Swap margin-left with margin-right
        assert.flipsTo(".foo { margin-left: 2em; }",
                       ".foo { margin-right: 2em; }");
        // Basic case: Swap padding-left with padding-right
        assert.flipsTo(".foo { padding-left: 2em; }",
                       ".foo { padding-right: 2em; }");
        // Extra keyword: Swap padding-left with padding-right
        assert.flipsTo(".foo { padding-left: 2em !important; }",
                       ".foo { padding-right: 2em !important; }");
    },
    "swaps left and right positioning": function() {
        // Basic case: Swap left with right
        assert.flipsTo(".foo { left: 10px; }",
                       ".foo { right: 10px; }");
    },
    "understands the difference between words and subwords": function() {
        // "Copyright" should be unchanged (full word), but float should be changed.
        assert.flipsTo(".copyright { float: right; }",
                       ".copyright { float: left; }");
        // "rights.png" Should not be changed (subword)
        assert.flipsTo("background: url('rights.png')",
                       "background: url('rights.png')");
        // "arrow-left.png" Should be changed (subword)
        assert.flipsTo("background: url('arrow-left.png')",
                       "background: url('arrow-right.png')");
        // "pull-right" should be changed (subword), and float should be changed
        assert.flipsTo(".pull-right { float: right; }",
                       ".pull-left { float: left; }");
    },
    "leaves ignored rules alone": function() {
        // Basic case: Nothing should change.
        assert.flipsTo(".foo { clear: left; /* !direction-ignore */ }",
                       ".foo { clear: left; /* !direction-ignore */ }");
        // Extra keywords: Nothing should change.
        assert.flipsTo(".foo { clear: left !important; /* !direction-ignore */ }",
                       ".foo { clear: left !important; /* !direction-ignore */ }");
        // Without whitespace: Nothing should change.
        assert.flipsTo(".foo{clear:left;/*!direction-ignore*/}",
                       ".foo{clear:left;/*!direction-ignore*/}");
        // Extra whitespace: Nothing should change.
        assert.flipsTo("  .foo {  clear:  left  !important;  /*  !direction-ignore  */  }  ",
                       "  .foo {  clear:  left  !important;  /*  !direction-ignore  */  }  ");
        // Newline before comment: Nothing should change, except newline should be removed.
        assert.flipsTo(".foo { clear: left !important;\n /* !direction-ignore */ }",
                       ".foo { clear: left !important; /* !direction-ignore */ }");
    }
});


buster.testCase("CSS value swapper", {
    "swaps four value rules": function() {
        // Second and fourth should swap (ints)
        assert.flipsTo(".foo { padding: 1em 2em 3em 4em; }",
                       ".foo { padding: 1em 4em 3em 2em; }");
        // Check that the basic test also works for margin
        assert.flipsTo(".foo { margin: 1em 2em 3em 4em; }",
                       ".foo { margin: 1em 4em 3em 2em; }");
        // Second and fourth should swap (as percents)
        assert.flipsTo(".foo { padding: 1% 2% 3% 4%; }",
                       ".foo { padding: 1% 4% 3% 2%; }");
        // Second and fourth should swap (floats)
        assert.flipsTo(".foo { padding: 1.1px 2.2px 3.3px 4.4px; }",
                       ".foo { padding: 1.1px 4.4px 3.3px 2.2px; }");
        // Second and fourth should swap (with zeros)
        assert.flipsTo(".foo { padding: 0 0 0 4.4em; }",
                       ".foo { padding: 0 4.4em 0 0; }");
        // Extra keywords, second and fourth should swap (with zeros)
        assert.flipsTo(".foo { padding: 0 0 0 4.4em !important; }",
                       ".foo { padding: 0 4.4em 0 0 !important; }");
        // No whitespace, second and fourth should swap
        assert.flipsTo(".foo{padding: 1.1em 2.2em 3.3em 4.4em !important;}",
                       ".foo{padding: 1.1em 4.4em 3.3em 2.2em !important;}");
        // Whitespace, second and fourth should swap
        assert.flipsTo("  .foo  {  padding:  1.1em  2.2em  3.3em  4.4em  !important;  }  ",
                       "  .foo  {  padding: 1.1em 4.4em 3.3em 2.2em !important;  }  ");
    },
    "ignores two value rules": function() {
        // Two values, nothing should change
        assert.flipsTo(".foo { padding: 1.2em 3em; }",
                       ".foo { padding: 1.2em 3em; }");
        // Two values, nothing should change
        assert.flipsTo(".foo { padding: 0 3em; }",
                       ".foo { padding: 0 3em; }");
    },

    "leaves ignored rules alone": function() {
        // Basic case: Nothing should change.
        assert.flipsTo(".foo { padding: 1em 2em 3em 4em; /* !direction-ignore */ }",
                       ".foo { padding: 1em 2em 3em 4em; /* !direction-ignore */ }");
        // Extra keywords: Nothing should change.
        assert.flipsTo(".foo { padding: 1em 2em 3em 4em !important; /* !direction-ignore */ }",
                       ".foo { padding: 1em 2em 3em 4em !important; /* !direction-ignore */ }");
        // Without whitespace: Nothing should change.
        assert.flipsTo(".foo{padding:1em 2em 3em 4em;/*!direction-ignore*/}",
                       ".foo{padding:1em 2em 3em 4em;/*!direction-ignore*/}");
        // Extra whitespace: Nothing should change.
        assert.flipsTo("  .foo {  padding:  1em  2em  3em  4em  !important;  /*  !direction-ignore  */  }  ",
                       "  .foo {  padding:  1em  2em  3em  4em  !important;  /*  !direction-ignore  */  }  ");
        // Newline before comment: Nothing should change, except newline should be removed.
        assert.flipsTo(".foo { padding:1em 2em 3em 4em !important;\n /* !direction-ignore */ }",
                       ".foo { padding:1em 2em 3em 4em !important; /* !direction-ignore */ }");
    }
});


buster.testCase("CSS background position inverter", {
    "understands background rules": function() {
        // Basic case, horizontal position should be inverted
        assert.flipsTo(".foo { background: 0% 100%; }",
                       ".foo { background: 100% 100%; }");
        // Only horizontal position given, and it should be inverted
        assert.flipsTo("background: url('@{image-url}/foo.bar') 30%;",
                       "background: url('@{image-url}/foo.bar') 70%;");
        // Color given, horizontal position should be inverted
        assert.flipsTo(".foo { background: #fff 0% 100%; }",
                       ".foo { background: #fff 100% 100%; }");
        // Image url given, horizontal position should be inverted
        assert.flipsTo(".foo { background: url('/star-12px.png') 0% 100%; }",
                       ".foo { background: url('/star-12px.png') 100% 100%; }");
        // Extra keyword no-repeat given, horizontal position should be inverted
        assert.flipsTo(".foo { background: url('@{image-url}/foo.bar') no-repeat 10% 80%; }",
                       ".foo { background: url('@{image-url}/foo.bar') no-repeat 90% 80%; }");
        // Vertical position is keyword, horizontal position should be inverted
        assert.flipsTo("background: url('@{image-url}/up_arrow.png') no-repeat 95% center;",
                       "background: url('@{image-url}/up_arrow.png') no-repeat 5% center;");
        // Horizontal position is center, should be kept unchanged
        assert.flipsTo("background: url('@{image-url}/up_arrow.png') no-repeat center 95%;",
                       "background: url('@{image-url}/up_arrow.png') no-repeat center 95%;");
        // Horizontal position is left, should be inverted to right
        assert.flipsTo("background: url(/static/desktop/images/btn_edit_comment.png) no-repeat left 0%;",
                       "background: url(/static/desktop/images/btn_edit_comment.png) no-repeat right 0%;");
        // Rule is important, horizontal position should be inverted
        assert.flipsTo("background: url(/static/desktop/images/btn_edit_comment.png) no-repeat 10% 0% !important;",
                       "background: url(/static/desktop/images/btn_edit_comment.png) no-repeat 90% 0% !important;");
        // Linear gradient given, should be kept unchanged
        assert.flipsTo("background: linear-gradient(top, #29b8e0 0%, #0669bb 100%);",
                       "background: linear-gradient(top, #29b8e0 0%, #0669bb 100%);");
        // Horizontal position is 50%, should be kept unchanged
        assert.flipsTo("background: url('@{image-url}/foo.bar') no-repeat 50% 0;",
                       "background: url('@{image-url}/foo.bar') no-repeat 50% 0;");
        // Horizontal position is given as a px value (int), should be kept unchanged
        assert.flipsTo("background: #333 url('@{image-url}/foo.bar') no-repeat 50px 0;",
                       "background: #333 url('@{image-url}/foo.bar') no-repeat 50px 0;");
        // Horizontal position is given as a px value (float), should be kept unchanged
        assert.flipsTo("background: url('@{image-url}/foo.bar') no-repeat 1.3px 0;",
                       "background: url('@{image-url}/foo.bar') no-repeat 1.3px 0;");
        // Horizontal position is given only as 0, should be inverted to 100%
        assert.flipsTo("background: url('@{image-url}/foo.bar') no-repeat 0 50px;",
                       "background: url('@{image-url}/foo.bar') no-repeat 100% 50px;");
        // Horizontal position is given only as 0, should be inverted to 100% (keyword no-repeat moved last)
        assert.flipsTo("background: url('@{image-url}/foo.bar') 0 50% no-repeat;",
                       "background: url('@{image-url}/foo.bar') 100% 50% no-repeat;");
        // No horizontal position is given, should be kept unchanged
        assert.flipsTo("background: url('@{image-url}/foo.bar') no-repeat;",
                       "background: url('@{image-url}/foo.bar') no-repeat;");
        // No horizontal position is given, should be kept unchanged
        assert.flipsTo("background: url('@{image-url}/foo.bar');",
                       "background: url('@{image-url}/foo.bar');");
        // No horizontal position is given, should be kept unchanged
        assert.flipsTo("background: url('@{image-url}/foo.bar') 1.5% 50px no-repeat;",
                       "background: url('@{image-url}/foo.bar') 98.5% 50px no-repeat;");
        // Horizontal position given as center keyword, should be kept unchanged
        assert.flipsTo("background: url('@{image-url}/foo.bar') center center no-repeat;",
                       "background: url('@{image-url}/foo.bar') center center no-repeat;");
        // No whitespace, should be inverted
        assert.flipsTo(".foo{background:url('@{image-url}/foo.bar') no-repeat 10% 80%;}",
                       ".foo{background: url('@{image-url}/foo.bar') no-repeat 90% 80%;}");
        // Extra whitespace, should be inverted
        assert.flipsTo("  .foo  {  background:  url('@{image-url}/foo.bar')  no-repeat  10%  80%;  }  ",
                       "  .foo  {  background: url('@{image-url}/foo.bar') no-repeat 90% 80%;  }  ");
    },
    "understands background-position rules": function() {
        // Basic case, horizontal position should be inverted
        assert.flipsTo("background-position: 40% 10%;",
                       "background-position: 60% 10%;");
        // Only horizontal position given, and it should be inverted
        assert.flipsTo("background-position: 70%;",
                       "background-position: 30%;");
        // Horizontal position given as 0, and it should be inverted
        assert.flipsTo("background-position: 0;",
                       "background-position: 100%;");
        // Extra keyword no-repeat given, horizontal position should be inverted
        assert.flipsTo("background-position: no-repeat 20% 10%;",
                       "background-position: no-repeat 80% 10%;");
        // Extra keyword no-repeat moved last, horizontal position should be inverted
        assert.flipsTo("background-position: 30% 10% no-repeat;",
                       "background-position: 70% 10% no-repeat;");
        // Horizontal position is 50%, should be kept unchanged
        assert.flipsTo("background-position: 50% 10%;",
                       "background-position: 50% 10%;");
        // Horizontal position is negative (in px), should be kept unchanged
        assert.flipsTo("background-position: -50px 0%;",
                       "background-position: -50px 0%;");
        // Horizontal position is negative (in %), should be kept unchanged
        assert.flipsTo("background-position: -30% 0%;",
                       "background-position: -30% 0%;");
        // No whitespace, horizontal position should be inverted
        assert.flipsTo("background-position: 10%;",
                       "background-position: 90%;");
        // Extra whitespace, horizontal position should be inverted
        assert.flipsTo("  background-position:  0  ;  ",
                       "  background-position: 100%;  ");
    },
    "leaves ignored rules alone": function() {
        // Basic case: Nothing should change.
        assert.flipsTo(".foo { background: #333 100% 0%; /*!direction-ignore */}",
                       ".foo { background: #333 100% 0%; /*!direction-ignore */}");
        assert.flipsTo(".foo { background-position: 100% 0%; /*!direction-ignore */}",
                       ".foo { background-position: 100% 0%; /*!direction-ignore */}");
        // Complex rule: Nothing should change.
        assert.flipsTo(".foo { background: url('@{image-url}/foo.bar') no-repeat 100% 0%; /*!direction-ignore */}",
                       ".foo { background: url('@{image-url}/foo.bar') no-repeat 100% 0%; /*!direction-ignore */}");
        // No whitespace: Nothing should change
        assert.flipsTo(".foo{background:url('@{image-url}/foo.bar') no-repeat 100% 0%;/*!direction-ignore*/}",
                       ".foo{background:url('@{image-url}/foo.bar') no-repeat 100% 0%;/*!direction-ignore*/}");
        // Extra whitespace: Nothing should change
        assert.flipsTo("  .foo  {  background:  url('@{image-url}/foo.bar')  no-repeat  100%  0%  ;  /*  !direction-ignore  */  }  ",
                       "  .foo  {  background:  url('@{image-url}/foo.bar')  no-repeat  100%  0%  ;  /*  !direction-ignore  */  }  ");
        // Newline before comment: Nothing should change, except newline should be removed.
        assert.flipsTo(".foo { background: url('@{image-url}/foo.bar') no-repeat 100% 0%;\n /*!direction-ignore */}",
                       ".foo { background: url('@{image-url}/foo.bar') no-repeat 100% 0%; /*!direction-ignore */}");
        assert.flipsTo("background-position: 50% 10%;\n /* !direction-ignore*/",
                       "background-position: 50% 10%; /* !direction-ignore*/");

        // Extra comment in meta comment.
        assert.flipsTo(".foo { background: #333 100% 0%; /*!direction-ignore comment */}",
                       ".foo { background: #333 100% 0%; /*!direction-ignore comment */}");
    }
});


buster.testCase("CSS cleaner", {
    "can add direction rule to body": function() {
        var input, output;

        input = "body { display: inline-block; }";
        output = "body {direction:rtl; display: inline-block; }";
        assert.equals(lib.clean(input, "rtl"), output);

        input = "foo {} body { display: inline-block; } bar {}";
        output = "foo {} body {direction:rtl; display: inline-block; } bar {}";
        assert.equals(lib.clean(input, "rtl"), output);
    },
    "can add body group with direction rule": function() {
        var input = "div { display: inline-block; }";
        var output = "body{direction:rtl;}div { display: inline-block; }";
        assert.equals(lib.clean(input, "rtl"), output);
    },
    "leaves direction-specific rules unchanged on flip": function() {
        var input, output;

        // Left/right swapping:
        input = "margin: left; /* !rtl-only */";
        output = "margin: left; /* !rtl-only */";
        assert.flipsTo(input, output);

        input = "margin: left; /* !ltr-only */"; // would normally be cleaned
        output = "margin: left; /* !ltr-only */";
        assert.flipsTo(input, output);

        // Background position swapping
        input = "background: url('@{image-url}/foo.bar') 60% 0 no-repeat; /* !rtl-only */";
        output = "background: url('@{image-url}/foo.bar') 60% 0 no-repeat; /* !rtl-only */";

        // Margin/padding value swapping
        input = "padding: 0.5em 1em 0.5em 3.2em; /* !rtl-only */";
        output = "padding: 0.5em 1em 0.5em 3.2em; "
               + "/* !rtl-only */";
        assert.flipsTo(input, output);

        // Allowing extra text in meta comment:
        input = "margin: left; /* !rtl-only comment */";
        output = "margin: left; /* !rtl-only comment */";
        assert.flipsTo(input, output);
    },
    "deletes rtl-only CSS rules": function() {
        var func = lib.clean;

        var input = fs.readFileSync("fixtures/input_clean.css").toString();
        var output = fs.readFileSync("fixtures/output_clean.css").toString();
        assert.equals(func(input, "ltr"), output);
    }
});


buster.testCase("CSS :before/:after pseudo elements", {
    "left alone by default": function() {
        assert.flipsTo(".foo:before { content: 'foo'; }",
                       ".foo:before { content: 'foo'; }");
        assert.flipsTo(".foo:after { content: 'foo'; }",
                       ".foo:after { content: 'foo'; }");
    },
    "swaps on keyword": function() {
        assert.flipsTo(".foo:before { /* !swap */ content: 'foo'; }",
                       ".foo:after { content: 'foo'; }");
        assert.flipsTo(".foo:after { /* !swap */ content: 'foo'; }",
                       ".foo:before { content: 'foo'; }");
    },
    "swaps on flag": function() {
        assert.flipsToPseudo(".foo:before { content: 'foo'; }",
                       ".foo:after { content: 'foo'; }");
        assert.flipsToPseudo(".foo:after { content: 'foo'; }",
                       ".foo:before { content: 'foo'; }");
    },
    "swaps on flag, but leaves !direction-ignore alone": function() {
        assert.flipsToPseudo(".foo:before { /* !direction-ignore */ content: 'foo'; }",
                       ".foo:before { /* !direction-ignore */ content: 'foo'; }");
        assert.flipsToPseudo(".foo:after { /* !direction-ignore */ content: 'foo'; }",
                       ".foo:after { /* !direction-ignore */ content: 'foo'; }");
    },
});
