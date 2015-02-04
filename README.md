## FlipCSS
Create right-to-left (RTL) CSS from left-to-right (LTR) CSS, and vice versa.
This is useful for making websites work visually for both LTR languages (like English) and RTL languages (like Arabic). 

FlipCSS takes a stylesheet as input, and outputs one that flows in the opposite direction. When somebody browse your web page, you can use your backend to serve the stylesheet that fits the requested language.

Wonder how it looks like? Check http://addons.opera.com/en vs. http://addons.opera.com/ar

The library is written for [Node](http://www.nodejs.org/). However, it should be easy to use it in other contexts as well. FlipCSS can be used from the command line.

PLEASE NOTE: This library will be obsoleted by [CSS3 Writing Modes](http://dev.w3.org/csswg/css3-writing-modes/) and [CSS Images Level 4](http://dev.w3.org/csswg/css4-images/#bidi-images).

### Installation

`npm install flipcss`

Using [Grunt](http://gruntjs.com/)? Check out [grunt-flipcss](https://github.com/behrang/grunt-flipcss).

### Usage (command line)

```
$ flipcss -h
Usage: node flipcss [OPTION] ... INFILE OUTFILE
  -r, --rtl              Flip CSS LTR>RTL
  -l, --ltr              Flip CSS RTL>LTR
  -w, --warnings         Output warnings
  -h, --help             Usage information
  -c, --clean-only       Clean only (requires a direction, -r or -l)
  -p, --swap-pseudo      Swap :before and :after
  -u, --ignore-urls      Do not swap the words left and right inside url()
  -s, --ignore-selectors Do not swap the words left and right in selectors

If no direction is given, the CSS is just flipped (with no cleaning of direction specific rules).
```

### Usage (as library)
FlipCSS has two public functions:

* `flip(String css, [Boolean warnings=false], [Boolean flipPseudo=false], [Boolean flipUrls=true], [Boolean flipSelectors=true])`
* `clean(String css, String direction)`

flip() does the RTL flipping. It takes five arguments. The first is mandatory, and is the CSS to flip. The rest are optional. If "warnings" is true, warnings will be printed to console (deaults to false). If "flipPseudo" is true, :before and :after will be swapped (defaults to false). If "flipUrls" is true, the words "left" and "right" will be swapped inside URLs (i.e., inside "url()" - defaults to true). If flipSelectors is true, the words "left" and "right" will be swapped inside selectors (i.e. ".pull-left {}" will become ".pull-right" - defaults to true).

clean() removes direction specific CSS rules. It takes two arguments: The CSS to clean, and the direction ("rtl" or "ltr"). If you have direction-specific rules in your CSS, you would want to run this both for your RTL CSS and your LTR CSS. This function will also add a CSS direction rule (e.g. "direction:ltr;") to the CSS, based on the direction given as the second parameter.

If your web page supports both LTR and RTL, you will need to have two stylesheets, one for each direction.

Please see the example below.

### What is done when flipping?
A number of operations are done when you call flip():

* All instances of the words "left" and "right" are swapped. See more details below.
* Horizontal values in margin and padding rules are swapped.
* Horizontal background position are swapped, if given as percentages, or as the keywords "left" and "right".

The pseudo elements :before and :after can also be swapped, but this is not done by default.

CSS rules marked as direction specific are not touched by flip(). See below for more info on direction specific rules.

#### The words "left" and "right"
The code for swapping the words "left" and "right" is naive, and just swaps every instance it can find, disregarding context. The basic exception is when these words are part of other words (e.g. "copyright"). When separated by other characters than letters and digits (e.g. hypens), they will be swapped. This means that you can have things like direction specific image files, and get those handled automatically: Just add "left" or "right" in the file names. For example, "arrow-right.png" will be changed to "arrow-left.png".

If you want a slightly less eager behaviour, you can specify URLs and selectors to be left untouched by using the "-u" and "-s" commandline flags respectively (or use the appropriate arguments for API use). But beware that the implementation will still be pretty naive, and will change these words in other contexts (e.g. in comments). Please file bugs if it changes something that should probably not be changed.

### What is done when cleaning
* All direction specific rules not relevant for the direction given are removed.
* "direction: rtl" is added to the body group in the CSS. If there is no body group, it is added.

### Direction-specific CSS rules
If you want some rules to only be applied for LTR, you can add a comment after the rule saying `/* !ltr-only */`. For RTL, you can use `/* !rtl-only */`. This is useful for e.g. italic text, which is seldom used in Arabic (some fonts even doesn't support it, making things look very bad). So, you could do something like:

```body { font-style: normal !important; /* !rtl-only */ }
.foo { font-style: italic; /* !ltr-only */}```

If you want larger groups of CSS rules to be direction specific, you should keep them in separate CSS files.

### :before and :after
The :before and :after pseudo elements can also be swapped, although they are kept as-is by default. To swap all of them, you can use the command-line flag "-p" or "--swap-pseudo". If you want to swap just a few instances, add /* !swap */ after the brace, like this:

```
.foo:before { /* !swap */
    content: "Foo";
}
```
Please note that the comment must be after the brace.

If you use the command line flag to swap all instances of :before and :after, you may use `/* !direction-ignore */` to ignore certain instances. However, `/* !rtl-only */` and `/* !ltr-only */` does not work for pseudo elements.

### Keep rules as is
If you want a certain CSS rule not to be flipped by the FlipCSS processing (e.g. a div that always should be floated right), add a comment saying `/* !direction-ignore */` after the rule.

If you want larger groups of CSS rules to be ignored, you should keep them in separate CSS files.

### Tips, tricks and limitations
Below are some things to keep in mind when automatically generating RTL CSS:

#### Semicolons
Although [the CSS spec allows you to omit the semicolon in cases where you have only one declaration](http://www.w3.org/TR/CSS2/syndata.html#declaration), FlipCSS has trouble with this. Thus, it is recommended that you always include the semicolon after a declaration.

#### Your HTML
Remember to set "dir=rtl" on the html element (and to actually load the RTL stylesheet) when a RTL language is used.

If you have blobs of content on your RTL page that is LTR, you can set "dir=ltr" on the containers of that content.

#### Inline elements
Be careful when explicitly setting elements to be inline; the flow of elements may then be a bit different than expected in RTL mode. Converting these to inline-block should solve most problems. FlipCSS can warn about inline elements.

#### Pre-processors
You may be using a pre-processor, like LESS or SASS. Since these will concatenate files for you, you may want to run them before running FlipCSS. But beware that things may happen to comments, and thus meta information for FlipCSS. One example is that minification will remove all comments.

Another example is that LESS removes duplicate comments. So, if you have several rules that are RTL only in the same code block, only one of these comments will get through the LESS compilation. Because of this, a lot of your RTL only rules will be applied to your LTR page.

To get around this, the meta information comments inside a block must be unique, so that LESS does not strip them away. FlipCSS allows you to add text after a meta information, so you could do something like this:

```
img.overlay {
    -webkit-transform: scaleX(-1); /* !rtl-only 1 */
    -moz-transform: scaleX(-1); /* !rtl-only 2 */
    -ie-transform: scaleX(-1); /* !rtl-only 3 */
    -o-transform: scaleX(-1); /* !rtl-only 4 */
    transform: scaleX(-1); /* !rtl-only 5 */
}
```

#### What languages are RTL?
The following languages are written right-to-left: Arabic (ar), Farsi/Persian (fa), Urdu (ur), Hebrew (he), and Yiddish (yi).

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
> cssLtr = flipcss.clean(css, "ltr");
>
> cssRtl = flipcss.clean(css, "rtl");
> cssRtl = flipcss.flip(cssRtl);
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
