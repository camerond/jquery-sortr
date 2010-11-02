$(function() {

  test("it is chainable", function() {
    var $t = getTable();
    same($t.sortr().hide().show(), $("#sortr-test"));
  });

  test("it defaults to sorting a row alphabetically when th is clicked", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['al', 'bob', 'fred', 'jim', 'mark', 'tom'];
    addColumn('name', names);
    $t.sortr();
    $t.find('thead th:first').click();
    same(getColumnContents('name'), sorted_names, 'sorts names properly');
  });

  test("it detects & sorts numerical rows when th is clicked", function() {
    var $t = getTable();
    var ages = ['17','95','25','15','1','14'];
    var sorted_ages = ['1','14','15','17','25','95'];
    addColumn('age', ages);
    $t.sortr();
    $t.find('thead th:first').click();
    same(getColumnContents('age'), sorted_ages, 'sorts ages properly');
  });

  test("it detects & sorts date rows when th is clicked", function() {
    var $t = getTable();
    var dates = ['July 14, 2001', 'December 15, 2001', 'August 8, 1983', 'January 14, 2000'];
    var sortedDates = ['December 15, 2001', 'July 14, 2001', 'January 14, 2000', 'August 8, 1983'];
    var invalidDates = ['foo', 'July 2001', '3523', 'bar'];
    var sortedInvalidDates = ['3523', 'bar', 'foo', 'July 2001'];
    addColumn('date', dates);
    addColumn('invalid dates', invalidDates);
    $t.sortr();
    $t.find('thead th:first').click();
    same(getColumnContents('date'), sortedDates, 'sorts dates properly');
    $t.find('thead th:last').click();
    same(getColumnContents('invalid dates'), sortedInvalidDates, 'sorts invalid dates properly');
  });

  test("it reverses sort when the actively sorted th is clicked", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['al', 'bob', 'fred', 'jim', 'mark', 'tom'];
    addColumn('name', names);
    var ages = ['17','95','25','15','1','14'];
    var sorted_ages = ['1','14','15','17','25','95'];
    addColumn('age', ages);
    $t.sortr();
    $t.find('thead th:first').click();
    same(getColumnContents('name'), sorted_names, 'sorts names properly');
    equals($t.find('thead th:first').attr('class'), 'sortr-asc', 'has proper class of "sortr-asc"');
    $t.find('thead th:first').click();
    same(getColumnContents('name').reverse(), sorted_names, 'reverses name sort properly');
    equals($t.find('thead th:first').attr('class'), 'sortr-desc', 'has proper class of "sortr-desc"');
    $t.find('thead th:last').click();
    same(getColumnContents('age'), sorted_ages, 'sorts ages properly');
    equals($t.find('thead th:last').attr('class'), 'sortr-desc', 'has proper class of "sortr-asc"');
    $t.find('thead th:last').click();
    same(getColumnContents('age').reverse(), sorted_ages, 'reverses age sort properly');
    equals($t.find('thead th:last').attr('class'), 'sortr-asc', 'has proper class of "sortr-desc"');
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
    addColumn('yesno', yesno);
    addColumn('truefalse', truefalse);
    addColumn('checkboxes', checkboxes);
    addColumn('blanks', blanks);
    $t.sortr();
    $t.find('thead th#yesno').click();
    same(getColumnContents('yesno'), sorted_yesno, 'sorts "yes" and "no" properly');
    $t.find('thead th#truefalse').click();
    same(getColumnContents('truefalse'), sorted_truefalse, 'sorts "true" and "false" properly');
    $t.find('thead th#checkboxes').click();
    same(getColumnContents('checkboxes'), sorted_checkboxes, 'sorts checkboxes properly');
    $t.find('thead th#blanks').click();
    same(getColumnContents('blanks'), sorted_blanks, 'sorts blanks properly');
  });

  test("it avoids columns specified in options", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['al', 'bob', 'fred', 'jim', 'mark', 'tom'];
    addColumn('name', names);
    addColumn('ignore', names);
    addColumn('class_ignore', names);
    $t.find("thead th#class_ignore").addClass('ignore');
    $t.sortr({
        ignore: '.ignore, #ignore'
    });
    $t.find('thead th#ignore').click();
    same(getColumnContents('ignore'), names, 'ignores column disabled by class');
    $t.find('thead th.ignore').click();
    same(getColumnContents('class_ignore'), names, 'ignores column disabled by class');
    same(getColumnContents('param_ignore_2'), names, 'ignores column disabled by class');
    $t.find('thead th#name').click();
    same(getColumnContents('name'), sorted_names, 'sorts enabled column properly');
  });

  test("it allows overrides to default sorting direction", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['tom', 'mark', 'jim', 'fred', 'bob', 'al'];
    addColumn('name', names);
    $t.sortr({
      default_sort: {
        alpha: 'desc'
      }
    });
    $t.find('thead th#name').click();
    same(getColumnContents('name'), sorted_names, 'sorts reversed alpha column properly');
  });

  test("it allows manual initial sorting", function() {
    var $t = getTable();
    var names = ['bob', 'jim', 'fred', 'mark', 'tom', 'al'];
    var sorted_names = ['al', 'bob', 'fred', 'jim', 'mark', 'tom'];
    addColumn('name', names);
    $t.sortr({
      by: '#name'
    });
    same(getColumnContents('name'), sorted_names, 'sorts initial alpha column properly');
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

  function getTable() {
    return $('#sortr-test');
  }

});
