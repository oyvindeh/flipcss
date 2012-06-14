## 2012.06.14, Version v0.1.3

*   Change swapping of the words "left" and "right" to be more conservative:
    Instead of swapping all instances, the ones that are part of other words
    (e.g. "copyright") are now left alone. When separated by other characters
    than letters and digits, they will be swapped.

## 2012.06.14, Version 0.1.2

*   Fix bug where negative horizonal values in background positions where not
    recognized, causing vertical values to be flipped instead. Also, skip
    negative values.

## 2012.06.07, Version 0.1.1

*   Fix bug where e.g. values in linear gradients were mistaken for background
    position values.
