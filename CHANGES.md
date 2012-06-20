## 2012.06.20, Version v0.2.1

*   Fix bug where value swapping fails for rules with extra keywords (like "!important").
*   Refactor tests: Get rid of most fixtures.

## 2012.06.20, Version v0.2.0

*   Add support for rtl to ltr. Adding of CSS direction rule is moved from
    flip() to clean(). If both functions are used together, this should be
    backwards compatible. If you only use flip(), be aware that
    "direction:ltr;" will no longer be added to the output of this function.

## 2012.06.18, Version v0.1.4

*   Fix bug: Direction specific rules where swapped, but they are now left
    unchanged.
*   Refactor tests.

## 2012.06.15, Version v0.1.3

*   Change swapping of the words "left" and "right" to be more conservative:
    Instead of swapping all instances, the ones that are part of other words
    (e.g. "copyright") are now left alone. When separated by other characters
    than letters and digits, they will be swapped.
*   Make lib remove newlines before meta comments (e.g. "/*!direction-ignore*/"),
    which may have been added by e.g. CSS compilers.

## 2012.06.14, Version 0.1.2

*   Fix bug where negative horizonal values in background positions where not
    recognized, causing vertical values to be flipped instead. Also, skip
    negative values.

## 2012.06.07, Version 0.1.1

*   Fix bug where e.g. values in linear gradients were mistaken for background
    position values.
