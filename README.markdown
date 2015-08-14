# JQuery Sortr

A smart, minimal client-side jQuery table sorter that autodetects most content.

## Usage

Add [jquery.sortr.js.coffee](https://github.com/camerond/jquery-sortr/blob/master/source/javascripts/jquery.sortr.js.coffee) or [jquery.sortr.plain.js](https://github.com/camerond/jquery-sortr/blob/master/source/javascripts/jquery.sortr.plain.js) and then call Sortr on your table(s):

    $("#my_table").sortr();

## Options

#### Column Detection

Sortr detects the content type of a column automatically as either alphabetical, numeric, or boolean:

  - If a column is only numbers (or currencies; see 'Custom Non-numeric Character Filters' below), it's numeric.
  - If it's any of the following, it's boolean:
    - Columns that contain cells with only checkboxes
    - Columns that contain only either empty cells or the same value (e.g. "yes", "yes", "")
    - Custom Booleans (see 'Other Options' below)
  - Otherwise, it's treated as alphabetical.

If a column contains only identical values, clicking on it's `<th>` won't do anything.

#### Default Direction

You can set the initial sort direction of a column either by the options object (to affect all columns of that type) or by adding a `data-sortr-initial-dir` value of `asc` or `desc` to a specific column's `<th>` element, or by setting a different value in the options object. The default values are:

    initial_dir:
      alpha: 'asc',
      numeric: 'desc',
      bool: 'desc'

#### Specifying Initial Sorting

Just give the appropriate `<th>` an attribute of `data-sortr-default` and Sortr will sort by that column on initialization.

You can give second `<th>` an attribute of `data-sortr-fallback` and Sortr will attempt to sort by that column if the `data-sortr-default` column isn't sortable (for example, if it's all identical values).

#### Specifying Secondary Sorting

If you'd like a column to be the sort tiebreaker for matching values, just give that `th` an attribute of `data-sortr-secondary`. For all other columns, any matching values will then be sorted according to the values in the `data-sortr-secondary` column.

#### Sorting by Custom Values

If you'd like to sort by a custom value rather than the contents of a table cell (e.g. the column is a relative date but you'd like to sort by the UTC date), just add the value that you'd prefer to sort by as a `date-sortr-sortby` attribute on your `<td>`. For example:

    <td data-sortr-sortby='849398400000'>5 minutes ago</td>

#### Sorting by Input Values

If a table cell contains only an `<input>` element, Sortr will detect & sort by the value of that element.

#### Ignoring Columns

You can ignore any columns by giving the `<th>` an attribute of `data-sortr-ignore` or passing a selector that filters against your table's `<th>` elements:

    ignore: '.some_selector'

## Styling

For your styling pleasure, Sortr automatically applies `sortr-asc` or `sortr-desc` to the currently sorted `th` element.

#### Maintaining Row Classes

By default, Sortr does __not__ move table row classes along with their content, e.g. if your first row has a class of `.first`, it'll keep that class after any sorting takes place. To move row classes along with their content, set `move_classes` to `true`.

#### Sorting Empty Cells

By default, empty cells are sorted at the end of a given column. To prepend empty cells instead, put a `sortr-prepend-empty` data attribute on the appropriate `<th>` element.

If you want the entire table to prepend empty cells on sort, either pass `prepend_empty: true` as an option to the `.sortr()` method call, or add a `data-sortr-prepend-empty`attribute on the `<table>`.

#### Refresh

If you modify the table contents client-side, call `$your_table.sortr('refresh')` or `$your_table.trigger('refresh.sortr')` to re-parse.

#### Callbacks

There are `beforeSort()` and `afterSort()` callbacks - for example, perhaps you want to keep a row pinned to the top of a table, in which case you'd detach it beforeSort, and prepend it afterSort. Any sort event also fires `beforeSort.sortr` and `afterSort.sortr` events on the table in question.

#### Custom Booleans

You can set custom boolean values. Be aware that these are just arrays, so if you redefine either, it'll overwrite the defaults, which are:

    bool_true: [
      'yes',
      'true'
    ],
    bool_false: [
      'no',
      'false'
    ]

#### Custom Non-numeric Character Filters

If you want to ignore specific characters in numeric columns (for example, currency or temperature symbols), give the `numeric_filter` property a literal regex. Sortr currently defaults to `/[$%º¤¥£¢\,]/`
