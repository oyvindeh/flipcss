/* jshint: */
/*global module buster flipcss:true public_functions:true*/

var flipcss = {
    /**
     * Pattern matching rules to ignore (marked with "//!direction-ignore").
     *
     * This pattern is to be added to other patterns that matches a word inside
     * a rule (not a full rule).
     *
     * (?!y) -> not followed by y.
     * @private
     */
    _wordMatchIgnorePattern: "(?![^\n;]*;\\s*/\\*\\s*!direction-ignore\\s*\\*/)",


    /**
     * Pattern matching rules to ignore (marked with "//!direction-ignore")
     *
     * This pattern is to be added to other patterns that matches a full CSS
     * rule.
     *
     * (?!y) -> not followed by y.
     * @private
     */
    _ruleMatchIgnorePattern: "(?!\\s*/\\*\\s*!direction-ignore\\s*\\*/)",


    /**
     * Swap two words in a string
     *
     * @private
     * @param {String} string String to process
     * @param {String} word1 Word to swap with word2
     * @param {String} word2 Word to swap with word1
     * @returns Processed string.
     *
     * NOTE: This function is stupid; word1 and word2 are expected to be
     * alphanumeric characters, but no checking is performed, so it may
     * break on other strings.
     */
    _swapWords: function(string, word1, word2) {
        // Matches one of the given words, nothing else (i.e. the rest of the
        // rule is ignored), except ignore pattern.
        // Captures the found word.
        var pattern = new RegExp(
              "(" + word1 + "|" + word2 + ")"
            + this._wordMatchIgnorePattern, "g");

        return string.replace(pattern, function(_, word) {
            return word === word1 ? word2 : word1;
        });
    },


    /**
     * Swap left/right values in four-value rules.
     * Example:
     *    margin: 1px 2px 3px 4px   --->   margin: 1px 4px 3px 2px
     *
     * @private
     * @param {String} string String to process
     * @returns Processed string
     */
    _swapValues: function(string) {
        // Matches pattern and margin rules, including semicolon and ignore
        // pattern.
        // Captures all parts, except whitespace and semicolon.
        var pattern = new RegExp(
              "(padding|margin):\\s*"
            // Optional number and dot, then number and units (0-3 letters),
            // followed by whitespace.
            + "((?:\\d*\\.)?\\d+[a-z%]{0,3})\\s+"
            + "((?:\\d*\\.)?\\d+[a-z%]{0,3})\\s+"
            + "((?:\\d*\\.)?\\d+[a-z%]{0,3})\\s+"
            + "((?:\\d*\\.)?\\d+[a-z%]{0,3})\\s*;"
            + this._ruleMatchIgnorePattern, "g");

        return string.replace(pattern, function(_, prop, d1, d2, d3, d4) {
            return prop + ": " + d1 + " " + d4 + " " + d3 + " " + d2 + ";";
        });
    },


    /**
     * Swap left/right values for background position.
     * Example:
     *     background:url("@{image-url}/foo.bar") 0% 0 no-repeat;  --->
     *     background:url("@{image-url}/foo.bar") 100% 0 no-repeat;  --->
     *
     * Note: positions given as strings ("left"/"right") are handled
     * by _swapWords().
     *
     * @private
     * @param {String} string String to process
     * @returns Processed string
     */
    _swapBackgroundPosition: function(string) {
        // Matches background and background-position rules.
        // Captures everything, except semi-colon
        var pattern = new RegExp(
              "(background(?:-position)?):(.*);"
            + this._ruleMatchIgnorePattern, "g");

        return string.replace(pattern, function(_, prop, d1) {
            var parts = d1.trim().split(/\s+/);

            // Only first of x,y value pair should be inverted, and only if
            // given as %. So if if something contains unit (which is not %),
            // or "center", break.
            for (var i=0; i<parts.length; i++) {
                var p = parts[i];

                // center, or unit
                // Unit can be two or three characters long; x or y values with
                // no unit should not be matched here.
                pattern = /^(?:(?:\d*\.)?\d+[a-z]{2,3}|center|left|right)$/;

                if (p.match(pattern) !== null) {
                    break;
                } else if (-1 < p.indexOf("%") || "0" === p) {
                    parts[i] = (100 - parseFloat(p)) + "%";
                    break;
                }
            }

            return prop + ": " + parts.join(" ") + ";";
        });
    },

    /**
     * Add a CSS rule inside a given CSS group. If the group does not exist,
     * it is created.
     *
     * Note: This function is not very smart. It looks for the first occurence
     * of the group, then inserts. The group param is inserted to a regex, but
     * only the "*" character is escaped.
     *
     * @private
     * @param {String} string String to process.
     * @param {String} group CSS group to insert into
     * @param {String} rule CSS rule to insert
     * @returns Processed string
     */

    _addRule: function(string, group, rule) {
        // Abort if group and/or rule is empty
        if (0 === group.length || 0 === rule.length) return string;

        // escape star char from group name
        var esc_group = group.replace("*", "\\*");

        var newString = ""
        ,   regex = new RegExp("(?:^|\\})\\s*" + esc_group + "\\s*\\{", "g")
        ,   result = null;
        result = regex.exec(string);

        if (result && 0 <= result.index) {
            var pos = result.index + result[0].length;
            newString = [string.substring(0, pos),
                         rule + ";",
                         string.substring(pos)
                        ].join("");
        } else {
            newString = group + "{" + rule + ";}"  + string;
        }
        // Find end position, keep count of opening/closing tags

        return newString;
    },

    /*
     * Delete rule based on trailing comment
     *
     * @param {String} string CSS string
     * @param {String} tail Trailing comment
     * @returns Processed string
     */
    _deleteRule: function(string, tail) {
        var regexp = new RegExp("[^;:\\s]+\\s*:\\s*[^;:]+;\\s*/\\*\\s*"
                                + tail + "\\s*\\*/", "g");

        return string.replace(regexp, "");
    },

    /**
     * Find all inline elements
     *
     * @private
     * @param {String} string String to process
     * @returns Array containing index of matches
     */
    _findInline: function(string) {
        var matches = []
        ,   result = null;

        var regex = /display\s*:\s*inline\s*;/g;
        while((result = regex.exec(string))) {
            matches.push(result.index);
        }

        return matches;
    }
};

module.exports = {
    /**
     * Turn a rtl stylesheet to a ltr one, and vice versa.
     *
     * This means making the visuals change direction, like in mirroring
     * the content; floats will be floated the other way, etc.
     *
     * @param {String} string CSS string to flip.
     * @param {Boolean} warnings Output warnings.
     * @returns Flipped CSS.
     */
    flip: function(string, warnings) {
        if (!warnings) warnings = false;

        // Output warnings:
        if (warnings) {
            var matches = flipcss._findInline(string);
            for (var i=0; i<matches.length; i++) {
                console.log("Warning: Inline element found at char "
                            + matches[i]
                           );
            }
        }

        // Do processing
        string = flipcss._swapWords(string, "left", "right");
        string = flipcss._swapValues(string);
        string = flipcss._addRule(string, "body", "direction:rtl");
        string = flipcss._swapBackgroundPosition(string);

        return string;
    },

    /**
     * Clean out CSS rules not intended for a specific direction.
     *
     * Some CSS rules should only be for left-to-right (ltr) stylesheets,
     * and some only for right-to-left (rtl) ones. These can be cleaned out.
     * Example:
     *
     *   clean("font-style: italic; \/\* !ltr-only \*\/", "rtl");
     *       --> Rule will be removed from output
     *
     *   clean("font-style: italic; \/\* !ltr-only \*\/", "ltr");
     *       --> Rule will be kept in output
     *
     * (Note: Comment should be regular CSS comment.)
     *
     * Given that you have both ltr and rtl specific rules, and your original
     * CSS is ltr, you will have to run clean on both the original and on the
     * generated rtl output.
     *
     * @param {String} string CSS string to clean.
     * @param {String} dir Direction of the output ("rtl" or "ltr").
     * @returns Cleaned CSS.
     */
    clean: function(string, dir) {
        if ("rtl" === dir || "ltr" === dir) {
            // If preprocess rtl, remove ltr-only rules and vice versa.
            var str = (dir === "rtl") ? "ltr" : "rtl";
            string = flipcss._deleteRule(string, "!" + str + "-only");
        }
        return string;
    }
};
