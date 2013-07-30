# JQuery Sortr

A smart, minimal, clean jQuery table sorter that autodetects most content.

## Usage

    $("#my_table").sortr();

## Options

### Column Detection & Default Direction

Sortr detects the content type of a column automatically as either alphabetical, numeric, or boolean. These columns are detected a s boolean:

  - Columns that contain cells with only checkboxes
  - Columns that contain only either empty cells or the same value (e.g. "yes", "yes", "")

If a column contains only identical values, clicking on it's `<th>` won't do anything.

You can set the initial sort direction of a column either by the options hash (for all columns of that type) or by adding a `data-sortr-initial-sort` value of `asc` or `desc` to a specific column's `<th>` element.

    default_sort:
      alpha: 'asc',
      numeric: 'desc',
      bool: 'desc'

### Specifying Initial Sorting

Just give the appropriate `<th>` an attribute of `data-sortr-default` and Sortr will sort by that column on initialization.

### Sorting by Custom Values

If you'd like to sort by a custom value rather than the contents of a table cell (e.g. the column is a relative date but you'd like to sort by the UTC date), just add the value that you'd prefer to sort by as a `date-sortr-sortby` attribute. For example:

    <td data-sortr-sortby='849398400000'>5 minutes ago</td>

### Sorting by input values

If a table cell contains only an `<input>` element, Sortr will detect & sort by the value of that element.

### Ignoring Columns

You can ignore any columns:

    ignore: {
      '.some_selector'
      // or any selector chain that matches the `<th>` element of the column(s) to ignore
    }

### Refresh

If you modify the table contents client-side, call `$your_table.sortr('refresh')` to re-parse.

### Custom Booleans

You can set custom boolean values. Be aware that now these are just preset arrays so if you redefine either it'll obviously overwrite the defaults.

    bool_true: [
      'yes',
      'true'
    ],
    bool_false: [
      'no',
      'false'
    ]

### Custom Non-numeric Character Filters

If you want to ignore specific characters in numeric columns (for example, currency or temperature symbols), give the `numeric_filter` property a literal regex. Sortr currently defaults to `/[$%º¤¥£¢\,]/`

### Etc.

For your styling pleasure, Sortr automatically applies `sortr-asc` or `sortr-desc` to the currently sorted `th` element.

There are `onStart()` and `onComplete()` callbacks - for example, perhaps you want to keep a row pinned to the top of a table, in which case you'd detach it onStart, and prepend it onComplete.

The `move_classes` option is a boolean specifying whether `<tr>` classes move with the row or not; turn this to `true` if you have custom colors on particular rows (e.g. statuses) and leave it `false` if your table has rows of alternating color or some such.
