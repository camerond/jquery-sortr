$(function() {

  test("it is chainable", function() {
    var $t = getTable();
    same($t.sortr().hide().show(), $("#sortr-test"));
  });

  test("it defaults to sorting a row alphabetically when th is clicked", function() {
    var $t = getTable();
    var names = ['bob smith', 'jim smith', 'fred bob', 'marky mark', 'tom thompson', 'alvenue fredrique'];
    var sorted_names = ['alvenue fredrique', 'bob smith', 'fred bob', 'jim smith', 'marky mark', 'tom thompson'];
    var $th = addColumn('name', names);
    $t.sortr();
    checkColumnType($th, 'alpha');
    $th.click();
    same(getColumnContents('name'), sorted_names, 'sorts names properly');
    equals($th.attr('class'), 'sortr-asc', 'applies sortr-asc class');
  });

  test("it detects & sorts numerical rows when th is clicked", function() {
    var $t = getTable();
    var numbers = ['17','95.25','25%','$15','0.1','14'];
    var sorted_numbers = ["95.25", "17", "$15", "14", "25%", "0.1"];
    var $th = addColumn('number', numbers);
    $t.sortr();
    checkColumnType($th, 'numeric');
    $th.click();
    same(getColumnContents('number'), sorted_numbers, 'sorts numbers properly');
    equals($th.attr('class'), 'sortr-desc', 'applies sortr-desc class');
  });

  test("it detects & sorts date rows when th is clicked, falling back to alphabetical, and reversing active row if clicked", function() {
    var $t = getTable();
    var dates = ['July 14, 2001', 'December 15, 2001', 'August 8, 1983', 'January 14, 2000'];
    var sorted_dates = ['December 15, 2001', 'July 14, 2001', 'January 14, 2000', 'August 8, 1983'];
    var invalid_dates = ['foo', 'July 2001', '3523', 'bar'];
    var $th_dates = addColumn('date', dates);
    var $th_invalid = addColumn('invalid dates', invalid_dates);
    $t.sortr();
    checkColumnType($th_dates, 'date');
    checkColumnType($th_invalid, 'alpha');
    $th_dates.click();
    same(getColumnContents('date'), sorted_dates, 'sorts dates properly');
    equals($th_dates.attr('class'), 'sortr-desc', 'applies sortr-desc class');
    $th_invalid.click();
    $th_dates.click();
    $th_dates.click();
    equals($th_invalid.attr('class'), '', 'removes sortr class from inactive column');
    same(getColumnContents('date'), sorted_dates.reverse(), 'reverses sort properly');
    equals($th_dates.attr('class'), 'sortr-asc', 'applies sortr-asc class');
  });
  
  test("it detects & sorts boolean rows when th is clicked", function() {
    var $t = getTable();
    var yesno = ['yes', 'yes', 'no', 'yes', 'no'];
    var sorted_yesno = ['yes', 'yes', 'yes', 'no', 'no'];
    var truefalse = ['false', 'true', 'false', 'true', 'true'];
    var sorted_truefalse = ['true', 'true', 'true', 'false', 'false'];
    var checkboxes = ['<input type="checkbox">','<input type="checkbox" checked="checked">','<input type="checkbox" checked="checked">','<input type="checkbox">','<input type="checkbox" checked="checked">'];
    var sorted_checkboxes = ['<input type="checkbox" checked="checked">','<input type="checkbox" checked="checked">','<input type="checkbox" checked="checked">','<input type="checkbox">','<input type="checkbox">'];
    var blanks = ['X', '', 'X', '', 'X'];
    var sorted_blanks = ['X', 'X', 'X', '', ''];
    var $th_yesno = addColumn('yesno', yesno);
    var $th_truefalse = addColumn('truefalse', truefalse);
    var $th_checkboxes = addColumn('checkboxes', checkboxes);
    var $th_blanks = addColumn('blanks', blanks);
    $t.sortr();
    checkColumnType($th_yesno, 'bool');
    checkColumnType($th_truefalse, 'bool');
    checkColumnType($th_checkboxes, 'checkbox');
    checkColumnType($th_blanks, 'blanks');
    $th_yesno.click();
    same(getColumnContents('yesno'), sorted_yesno, 'sorts "yes" and "no" properly');
    equals($th_yesno.attr('class'), 'sortr-desc', 'applies sortr-desc class');
    $th_truefalse.click();
    same(getColumnContents('truefalse'), sorted_truefalse, 'sorts "true" and "false" properly');
    $th_checkboxes.click();
    same(getColumnContents('checkboxes'), sorted_checkboxes, 'sorts checkboxes properly');
    $th_blanks.click();
    same(getColumnContents('blanks'), sorted_blanks, 'sorts blanks properly');
  });

  test("it ignores elements when sorting", function() {
    var $t = getTable();
    var links = ['<a href="#">yes</a>', '<a href="#">no</a>'];
    var $th = addColumn('links', links);
    $t.sortr();
    checkColumnType($th, 'bool');
  });

  test("it ignores columns with all of the same value", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom'];
    var identical = ['x', 'x', 'x', 'x', 'x'];
    var $th_names = addColumn('name', names);
    var $th_identical = addColumn('identical', identical);
    $th_identical.click();
    checkColumnType($th_identical, null);
    same(getColumnContents('name'), names, 'names column remains unchanged');
  });

  test("it avoids columns specified in options", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['al', 'bob', 'fred', 'jim', 'mark', 'tom'];
    var $th_names = addColumn('name', names);
    var $th_ignore = addColumn('ignore', names);
    var $th_class_ignore = addColumn('class_ignore', names);
    $th_class_ignore.addClass('ignore');
    $t.sortr({
        ignore: '.ignore, #ignore'
    });
    $th_ignore.click();
    same(getColumnContents('ignore'), names, 'ignores column disabled by id');
    $th_class_ignore.click();
    same(getColumnContents('class_ignore'), names, 'ignores column disabled by class');
    $th_names.click();
    same(getColumnContents('name'), sorted_names, 'sorts enabled column properly');
  });

  test("it allows overrides to default sorting direction", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['tom', 'mark', 'jim', 'fred', 'bob', 'al'];
    var $th = addColumn('name', names);
    $t.sortr({
      default_sort: {
        alpha: 'desc'
      }
    });
    $th.click();
    same(getColumnContents('name'), sorted_names, 'sorts reversed alpha column properly');
  });

  test("it allows manual initial sorting by parameter", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['al', 'bob', 'fred', 'jim', 'mark', 'tom'];
    addColumn('name', names);
    $t.sortr({
      by: '#name'
    });
    same(getColumnContents('name'), sorted_names, 'sorts initial alpha column properly');
  });

  test("it allows new definitions of boolean values", function() {
    var $t = getTable();
    var values = ['yup', 'nope', 'yup', 'nope', 'nope'];
    var sorted_values = ['yup', 'yup', 'nope', 'nope', 'nope'];
    var yesno = ['yes', 'yes', 'no', 'yes', 'no'];
    var sorted_yesno = ['yes', 'yes', 'yes', 'no', 'no'];
    var $th_values = addColumn('values', values);
    var $th_yesno = addColumn('yesno', yesno);
    $t.sortr({
      bool_true: ['yup'],
      bool_false: ['nope']
    });
    checkColumnType($th_values, 'bool');
    $th_values.click();
    same(getColumnContents('values'), sorted_values, 'sorts custom boolean column properly');
    equals($t.find('thead th#yesno').data('sortr-method'), 'bool', 'remembers default boolean specifications');
  });

  test("it properly maintains initial row classes", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['al', 'bob', 'fred', 'jim', 'mark', 'tom'];
    var $th = addColumn('name', names);
    $t.find('tbody tr:even').addClass('alt');
    $t.sortr();
    $th.click();
    equals($t.find('tbody tr:eq(0)').attr('class'), 'alt', '1st row has class of "alt"');
    equals($t.find('tbody tr:eq(1)').attr('class'), '', '2nd row has no class');
  });

  test("it properly handles callback function", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['bob', 'al', 'fred', 'jim', 'mark', 'tom'];
    var $th = addColumn('name', names);
    var $tr;
    $t.sortr({
      onStart: function() {
        $tr = this.parents('table').find('tbody tr:first').detach();
      },
      onComplete: function() {
        this.parents('table').find('tbody').prepend($tr);
      }
    });
    $th.click();
    same(getColumnContents('name'), sorted_names, 'sorts names with locked first row properly');
  });

  function addColumn(name, values) {
    var $t = getTable();
    var $th = $('<th />').text(name);
    $th.appendTo($t.find('thead')).attr('id', name);
    $.each(values, function(i, v) {
      var $td = $('<td />').html(v);
      var $tr = $t.find('tbody tr')[i];
      if (!$tr) {
        $tr = $('<tr />');
        $tr.appendTo($t.find('tbody'));
      }
      $td.appendTo($tr);
    });
    same(getColumnContents(name), values, 'appends columns properly');
    return $th;
  }

  function getColumnContents(id) {
    var $t = getTable();
    var i = $t.find('thead th#' + id).index();
    var $rows = $t.find('tbody tr');
    var contents = [];
    $rows.each(function() {
      contents.push($(this).find('td').eq(i).html());
    });
    return contents;
  }

  function checkColumnType($th, type) {
    equals($th.data('sortr-method'), type, 'detects column as ' + type);
  }

  function getTable() {
    return $('#sortr-test');
  }

});
