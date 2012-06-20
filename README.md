## FlipCSS library
Create right-to-left (RTL) CSS from left-to-right (LTR) CSS, and vice versa.

The library is written for Node (http://www.nodejs.org/). However, it should be easy to use it in other contexts as well.

### Installation

`npm install flipcss`

### Usage
FlipCSS has two public functions:

* `flip(String css, Boolean warnings)`
* `clean(String css, String direction)`

flip() does the RTL flipping. It takes two arguments: The CSS to flip, and a boolean telling it whether it should output warnings or not.

clean() removes direction specific CSS rules. It also takes two arguments: The CSS to clean, and the direction ("rtl" or "ltr"). If you have direction-specific rules in your CSS, you would want to run this both for your RTL CSS and your LTR CSS. This function will also add a CSS direction rule (e.g. "direction:ltr;") to the CSS, based on the direction given as the second parameter.

If your web page supports both LTR and RTL, you will need to have two stylesheets, one for each direction.

Please see the example below.

### What is done when flipping?
A number of operations are done when you call flip():

* All instances of the words "left" and "right" are swapped, except when part of other words (e.g. "copyright"). When separated by other characters than letters and digits (e.g. hypens), they will be swapped: This means you can have image files which are direction specific by adding "left" or "right" in the file names (e.g. "arrow-right.png", which will be changed to "arrow-left.png").
* Swap horizontal values in margin and padding rules.
* Swapping horizontal background position (but only for values given as percentages, or given as the keywords "left" and "right").

CSS rules marked as direction specific are not touched by flip(). See below for more info on direction specific rules.

### What is done when cleaning
* All direction specific rules not relevant for the direction given are removed.
* "direction: rtl" is added to the body group in the CSS. If there is no body group, it is added.

### Direction-specific CSS rules
If you want some rules to only be applied for LTR, you can add a comment after the rule saying `/* !ltr-only */`. For RTL, you can use `/* !rtl-only */`. This is useful for e.g. italic text, which is seldom used in Arabic (some fonts even doesn't support it, making things look very bad). So, you could do something like:

```body { font-style: normal !important; /* !rtl-only */ }
.foo { font-style: italic; /* !ltr-only */}```

If you want larger groups of CSS rules to be direction specific, you should keep them in separate CSS files.

### Keep rules as is
If you want a certain CSS rule not to be flipped by the FlipCSS processing (e.g. a div that always should be floated right), add a comment saying `/* !direction-ignore */` after the rule.

If you want larger groups of CSS rules to be ignored, you should keep them in separate CSS files.

### Some tips
Here are some things to keep in mind when automatically generating RTL CSS:

* Be careful when explicitly setting elements to be inline; the flow of elements may then be a bit different than expected in RTL mode. Converting these to inline-block should solve most problems. FlipCSS can warn about inline elements.
* Remember to set "dir=rtl" on the html element (and to actually load the RTL stylesheet) when a RTL language is used.
* The following languages are written right-to-left: Arabic (ar), Farsi/Persian (fa), Urdu (ur), Hebrew (he), and Yiddish (yi).

### Example
If you have a ltr stylesheet (with direction specific rules both for ltr and rtl), and you want to create a rtl stylesheet:

```
body {
  font-style: normal !important; /* !rtl-only */
}
.foo {
  float: left;
  font-style: italic; /* !ltr-only */
}
```

Running the following code...

```
> css = "..."
>
> cssLtr = cssflip.clean(css, "ltr");
>
> cssRtl = cssflip.clean(css, "rtl");
> cssRtl = cssflip.flip(cssRtl);
```

...will result in this LTR CSS...

```
body {
  direction:ltr;
}
.foo {
  float: left;
  font-style: italic; /* !ltr-only */
}
```

...and this RTL CSS:

```
body {
  direction:rtl;
  font-style: normal !important; /* !rtl-only */
}
.foo {
  float: right;
}
```
