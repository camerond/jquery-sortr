(($) ->

  table =
    addColumn: (name, values) ->
      $t = @$el
      $th = $('<th>').text(name)
      $th.appendTo($t.find('thead')).attr('id', name)
      $.each values, (i, v) ->
        $td = $('<td />').html(v)
        $tr = $t.find('tbody tr')[i]
        if (!$tr)
          $tr = $('<tr />')
          $tr.appendTo($t.find('tbody'))
          $td.appendTo($tr)
      same(table.getColumnContents(name), values, 'appends columns properly')
      $th
    getColumnContents: (selector) ->
      idx = @$el.find("thead #{selector}").index()
      $rows = @$el.find('tbody tr')
      contents = []
      $rows.each ->
        contents.push($(this).find('td').eq(idx).html())
      contents
    checkColumnType: ($th, type) ->
      equals($th.data('sortr-method'), type, 'detects column as "' + type + '"')
    init: ->
      @$el = $("#sortr-test")

  test "it is chainable", ->
    same(table.init().sortr().hide().show(), $("#sortr-test"))

  test "it defaults to sorting a row alphabetically & ascending when th is clicked", ->
    $t = table.init()
    alpha = ['lorem', 'IPSUM', 'dolor', 'sic amet', 'am I right?']
    sorted_alpha = ['am I right?', 'dolor', 'IPSUM', 'lorem', 'sic amet']
    $th = table.addColumn('latin', alpha)
    $t.sortr()
    table.checkColumnType($th, 'alpha')
    $th.click()
    same(table.getColumnContents('latin'), sorted_alpha, 'sorts names properly')
    equals($th.attr('class'), 'sortr-asc', 'applies sortr-asc class')

  test "it detects & sorts numerical rows when th is clicked", ->
    $t = table.init()
    numbers = ['$50.00', '5', '-0.11', '0', '100,000', '$34']
    sorted_numbers = ['-0.11', '0', '5', '$34', '$50.00', '100,000']
    $numbers = table.addColumn('number', numbers)
    $t.sortr()
    table.checkColumnType($numbers, 'numeric')
    $numbers.click()
    same(table.getColumnContents('number'), sorted_numbers, 'sorts numbers properly')

  test "it reverses rows when actively sorted row is clicked", ->
    ok(false)

  test "it gracefully sorts empty cells", ->
    ok(false)

  test "it does no sorting if row is all identical values", ->
    ok(false)

  test "it detects & sorts by checkbox value", ->
    ok(false)

  test "it detects & sorts by value on input", ->
    ok(false)

  test "it allows for sorting by data attributes instead of content", ->
    ok(false)

  test "it properly maintains initial row classes", ->
    ok(false)

  module "Options"

  test "ignore specific elements in table cells", ->
    ok(false)

  test "it allows an initial sorting direction by the 'sortr-default' data attribute", ->
    ok(false)

  test "it allows overrides to default sorting direction", ->
    ok(false)

  test "it moves classes with the rows if move_classes is set to true", ->
    ok(false)

  module "Methods"

  test "refresh", ->
    ok(false)

  test "beforeSort", ->
    ok(false)

  test "afterSort", ->
    ok(false)

)(jQuery)