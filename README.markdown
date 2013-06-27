# JQuery Sortr

A smart, minimal, clean jQuery table sorter. Fully unit tested with QUnit. Pagination not supported. Sortr automatically detects alphabetical, numeric, date (via Javascript date parsing), and boolean column types.

## Usage

    $("#my_table").sortr();

## Options

### Column Detection & Default Direction

Sortr detects the content type of a column automatically as either alphabetical, date, numeric, or boolean. You can specify descending or ascending defaults for each sort type. The following are auto-detected as boolean: checkboxes, strings of 'yes', 'no', 'true', and 'false', and a column where all the values are either identical or nonexistent (i.e. a column with 'X' or ''). These are configurable separately in the options hash as `bool`, `checkbox` and `blanks`, respectively:

    default_sort: {
      alpha: 'asc',
      date: 'desc',
      numeric: 'desc',
      bool: 'desc',
      checkbox: 'desc',
      blanks: 'desc'
    }

### Sorting by Custom Values

If you'd like to sort by a custom value rather than the contents of a table cell (e.g. the column is a relative date but you'd like to sort by the UTC date), just add the value that you'd prefer to sort by as a `date-sortr-sortby` attribute. For example:

    <td data-sortr-sortby='849398400000'>5 minutes ago</td>

### Ignoring Columns

You can ignore any columns:

    ignore: {
      '.some_selector'
      // or any selector chain that matches the `<th>` element of the column(s) to ignore
    }

### Specifying Initial Sorting

You can specify the initial sort of the table either through the options hash ...

    by: {
      '#name'
      // or any selector that matches the <th> element that you want to automatically sort by
    }

... or by just giving the appropriate `<th>` element a class of `sortr-default`.

### Custom Booleans

You can set custom boolean values. Right now these are just preset arrays so if you redefine either it'll obviously overwrite the defaults; I need to change this.

    bool_true: [
      'yes',
      'true'
    ],
    bool_false: [
      'no',
      'false'
    ]

### Etc.

For your styling pleasure, Sortr automatically applies `sortr-asc` or `sortr-desc` to the currently sorted `th` element.

There are `onStart()` and `onComplete()` callbacks - for example, perhaps you want to sort the 

The `move_classes` option is a boolean specifying whether `<tr>` classes move with the row or not; turn this to `true` if you have custom colors on particular rows (e.g. statuses) and leave it `false` if your table has rows of alternating color or some such.
