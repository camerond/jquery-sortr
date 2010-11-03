# JQuery Sortr

A smart, minimal, clean jQuery table sorter. Fully unit tested with QUnit. Pagination not supported. Sortr automatically detects alphabetical, numeric, date (via Javascript date parsing), and boolean column types.

## Usage

    $("#my_table").sortr();

## Options

Check the plugin. You can specify descending or ascending defaults for each sort type, and customize the definition of what constitutes a 'boolean' value. The following are auto-detected as boolean: checkboxes, strings of 'yes', 'no', 'true', and 'false', and a column where all the values are either identical or nonexistent (i.e. a column with 'X' or '').

    $t.sortr({
      ignore: {
        '.ignore_me'
        // or any selector chain that matches the <th> element of the column(s) to ignore
      },
      by: {
        '#name'
        // or any selector that matches the <th> element that you want to automatically sort by
      }
    }

For your styling pleasure, Sortr automatically applies `sortr-asc` or `sortr-desc` to the currently sorted `th` element.

## To Do

- allow a custom sorting function

