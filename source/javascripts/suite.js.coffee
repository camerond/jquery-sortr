(($) ->

  table =
    addColumn: (name, values, bypass_check) ->
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
      if !bypass_check
        deepEqual(table.getColumnContents("#{name}"), values, 'appends columns properly')
      $th
    generateAlphaColumn: (name) ->
      alpha = ['lorem', 'IPSUM', 'dolor', 'sic amet', 'am I right?']
      sorted_alpha = ['am I right?', 'dolor', 'IPSUM', 'lorem', 'sic amet']
      $th = @addColumn(name || 'latin', alpha)
      dataset =
        $th: $th
        unsorted: alpha
        sorted: sorted_alpha
      dataset
    getColumnContents: (selector) ->
      idx = @$el.find("thead ##{selector}").index()
      $rows = @$el.find('tbody tr')
      contents = []
      $rows.each ->
        contents.push($(this).find('td').eq(idx).html())
      contents
    checkColumnType: ($th, type) ->
      equal($th.data('sortr-method'), type, 'detects column as "' + type + '"')
    init: ->
      @$el = $("#sortr-test")

  test "it is chainable", ->
    deepEqual(table.init().sortr().hide().show(), $("#sortr-test"))

  test "it defaults to sorting a row alphabetically & ascending when th is clicked", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    $t.sortr()
    table.checkColumnType(dataset.$th, 'alpha')
    dataset.$th.click()
    deepEqual(table.getColumnContents('latin'), dataset.sorted, 'sorts names properly')
    equal(dataset.$th.attr('class'), 'sortr-asc', 'applies sortr-asc class')

  test "it detects & sorts numerical rows when th is clicked", ->
    $t = table.init()
    numbers = ['$50.00', '5', '-0.11', '0', '100,000', '$34']
    sorted_numbers = ['100,000', '$50.00', '$34', '5', '0', '-0.11']
    $th = table.addColumn('number', numbers)
    $t.sortr()
    table.checkColumnType($th, 'numeric')
    $th.click()
    deepEqual(table.getColumnContents('number'), sorted_numbers, 'sorts numbers descending by default')
    equal($th.attr('class'), 'sortr-desc', 'applies sortr-desc class')

  test "it reverses rows when actively sorted row is clicked", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    $t.sortr()
    dataset.$th.click()
    dataset.$th.click()
    deepEqual(table.getColumnContents('latin'), dataset.sorted.reverse(), 'reverses columns properly')

  test "it properly clears existing sort class when new column is sorted", ->
    $t = table.init()
    dataset1 = table.generateAlphaColumn('latin1')
    dataset2 = table.generateAlphaColumn('latin2')
    $t.sortr()
    dataset1.$th.click()
    dataset2.$th.click()
    equal($t.find("[class^=sortr]").length, 1, 'only proper th has sorting class')

  test "it sorts empty cells to bottom by default", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    $empty_row = $("<tr />").append($("<td />"))
    $t.find("tr").eq(0).after($empty_row)
    $t.sortr()
    dataset.$th.click()
    dataset.sorted.push("")
    deepEqual(table.getColumnContents('latin'), dataset.sorted, 'puts empty cell at end')

  test "it bypasses column if column is all identical values", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    $th = table.addColumn('same', "blah blah blah blah blah".split(" "))
    $t.sortr()
    table.checkColumnType($th, undefined)
    $th.click()
    deepEqual(table.getColumnContents('latin'), dataset.unsorted, 'does not sort on identical column')
    $th.click()
    deepEqual(table.getColumnContents('latin'), dataset.unsorted, 'does not reverse sort on identical column')

  test "it detects & sorts boolean values", ->
    unsorted = ["true", "true", "false", "true", "false"]
    sorted = ["true", "true", "true", "false", "false"]
    $t = table.init()
    $th = table.addColumn('booleans', unsorted, true)
    $t.sortr()
    table.checkColumnType($th, "bool")
    $th.click()
    deepEqual(table.getColumnContents('booleans'), sorted, 'sorts booleans with true at top by default')

  test "it detects & sorts custom boolean values", ->
    unsorted = ["yep", "yep", "nope", "yep", "nope"]
    sorted = ["yep", "yep", "yep", "nope", "nope"]
    $t = table.init()
    $th = table.addColumn('booleans', unsorted, true)
    $t.sortr({ bool_true: ["yep"], bool_false: ["nope"]})
    table.checkColumnType($th, "bool")
    $th.click()
    deepEqual(table.getColumnContents('booleans'), sorted, 'sorts booleans with true at top by default')

  test "it detects & sorts by checkbox value", ->
    checkboxBuilder = (vals) ->
      checks = []
      checks.push("<input type='checkbox' #{if check then 'checked' else ''} />") for check in vals
      checks
    $t = table.init()
    unsorted = checkboxBuilder([true, false, false, true, false])
    sorted = [true, true, false, false, false]
    $th = table.addColumn('checkboxes', unsorted, true)
    $t.sortr()
    table.checkColumnType($th, "bool")
    $th.click()
    cell_values = []
    $t.find('td').each ->
      cell_values.push(!!$(this).find(":checkbox").prop("checked"))
    deepEqual(cell_values, sorted, 'sorts checkboxes with checked at top by default')
    $t.find('tbody :checkbox').eq(0).prop('checked', false).change()
    $t.find('tbody :checkbox').eq(4).prop('checked', true).change()
    $th.click()
    cell_values = []
    $t.find('td').each ->
      cell_values.push(!!$(this).find(":checkbox").prop("checked"))
    deepEqual(cell_values, sorted, 'sorts checkboxes after values of checkboxes change')

  test "it detects & sorts by value on input", ->
    inputBuilder = (vals) ->
      inputs = []
      inputs.push('<input type="text" value="' + val + '">') for val in vals
      inputs
    $t = table.init()
    unsorted = inputBuilder(['lorem', 'IPSUM', 'dolor', 'sic amet', 'am I right?'])
    sorted = ['am I right?', 'dolor', 'IPSUM', 'lorem', 'sic amet']
    $th = table.addColumn('inputs', unsorted, true)
    $t.sortr()
    table.checkColumnType($th, "alpha")
    $th.click()
    cell_values = []
    $t.find('td').each ->
      cell_values.push($(this).find("input").val())
    deepEqual(cell_values, sorted, 'sorts inputs by value')

  test "it allows for sorting by data attributes instead of content", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    arbitrary_values = ["3", "2", "5", "1", "4"]
    sorted_by_data = ['dolor', 'am I right?', 'lorem', 'IPSUM', 'sic amet']
    table.$el.find("td").each (idx) ->
      $(@).attr('data-sortr-sortby', arbitrary_values[idx])
    $t.sortr()
    table.checkColumnType(dataset.$th, "numeric")
    dataset.$th.click()
    deepEqual(table.getColumnContents('latin'), sorted_by_data, 'sorts cells by data attribute instead of contents')

  test "it properly maintains initial row classes", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    classes = [true, false, true, false, true]
    new_classes = []
    $t.find('tr').each (idx) ->
      if classes[idx] then $(this).addClass('alt')
    $t.sortr()
    dataset.$th.click()
    $t.find('tr').each (idx) ->
      new_classes.push($(this).hasClass('alt'))
    deepEqual(new_classes, classes, 'classes stay in same position')

  module "Options"

  test "it allows an initial sorting direction by the 'sortr-default' data attribute", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    $t.find('th').attr('data-sortr-default', true)
    $t.sortr()
    deepEqual(table.getColumnContents('latin'), dataset.sorted, 'sorts data-sortr-default column by default')

  test "it allows overrides to default sorting direction through option", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    $t.sortr(
      initial_dir:
        alpha: 'desc'
    )
    table.checkColumnType(dataset.$th, 'alpha')
    dataset.$th.click()
    deepEqual(table.getColumnContents('latin'), dataset.sorted.reverse(), 'sorts alpha descending')
    equal(dataset.$th.attr('class'), 'sortr-desc', 'applies sortr-desc class')

  test "it allows overrides to default sorting direction through data attribute", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    dataset.$th.attr('data-sortr-initial-dir', 'desc')
    $t.sortr()
    table.checkColumnType(dataset.$th, 'alpha')
    dataset.$th.click()
    deepEqual(table.getColumnContents('latin'), dataset.sorted.reverse(), 'sorts alpha descending')
    equal(dataset.$th.attr('class'), 'sortr-desc', 'applies sortr-desc class')

  test "it sorts empty rows to the top if 'prepend_empty' is set to true", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    $empty_row = $("<tr />").append($("<td />"))
    $t.find("tr").eq(1).after($empty_row)
    $t.sortr({ 'prepend_empty': true })
    dataset.$th.click()
    dataset.sorted.unshift("")
    deepEqual(table.getColumnContents('latin'), dataset.sorted, 'puts empty cell at beginning')

  test "it sorts empty rows to the top for all columns if 'data-sortr-prepend-empty' is set to true on the table", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    $empty_row = $("<tr />").append($("<td />"))
    $t.find("tr").eq(1).after($empty_row)
    $t.attr('data-sortr-prepend-empty', 'true')
    $t.sortr()
    dataset.$th.click()
    dataset.sorted.unshift("")
    deepEqual(table.getColumnContents('latin'), dataset.sorted, 'puts empty cell at beginning')

  test "it sorts empty rows to the top for a column if 'data-sortr-prepend-empty' is set to true on that <th>", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    dataset_2 = table.generateAlphaColumn()
    $empty_row = $("<tr />").append($("<td />")).append($("<td />"))
    $t.find("tr").eq(1).after($empty_row)
    dataset.$th.attr('data-sortr-prepend-empty', 'true')
    $t.sortr()
    dataset.$th.click()
    dataset.sorted.unshift("")
    deepEqual(table.getColumnContents('latin'), dataset.sorted, 'puts empty cell at beginning for first column')
    dataset_2.$th.click()
    dataset_2.sorted.push("")
    deepEqual(table.getColumnContents('latin'), dataset_2.sorted, 'puts empty cell at end for second column')

  test "it moves classes with the rows if move_classes is set to true", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    classes = [true, false, true, false, true]
    moved_classes = [true, true, false, true, false]
    new_classes = []
    $t.find('tr').each (idx) ->
      if classes[idx] then $(this).addClass('alt')
    $t.sortr(
      move_classes: true
    )
    dataset.$th.click()
    $t.find('tr').each (idx) ->
      new_classes.push($(this).hasClass('alt'))
    deepEqual(new_classes, moved_classes, 'classes move with rows')

  test "it allows overrides to the non-numeric character filter", ->
    $t = table.init()
    numbers = ['43','@23', '12', '84']
    sorted_numbers = ['84', '43', '@23', '12']
    $th = table.addColumn('number', numbers)
    $t.sortr(
      numeric_filter: /@/
    )
    table.checkColumnType($th, 'numeric')
    $th.click()
    deepEqual(table.getColumnContents('number'), sorted_numbers, 'sorts numbers ignoring `F`')

  module "Methods"

  test "refresh", ->
    $t = table.init()
    dataset1 = table.generateAlphaColumn()
    dataset2 = table.generateAlphaColumn('latin2')
    $t.sortr()
    dataset1.$th.click()
    sorted_col_index = dataset1.$th.index()
    $t.find('tbody tr').last().after($("<tr />").html("<td>extra</td><td>cells</td>"))
    $t.sortr('refresh')
    sorted1 = ['am I right?', 'dolor', 'extra', 'IPSUM', 'lorem', 'sic amet']
    sorted2 = ['am I right?', 'cells', 'dolor', 'IPSUM', 'lorem', 'sic amet']
    equal(sorted_col_index, $t.find('.sortr-asc').index(), "refresh maintains sorted column header")
    deepEqual(table.getColumnContents('latin'), sorted1, 'refresh maintains sorted column state')
    dataset2.$th.click()
    deepEqual(table.getColumnContents('latin2'), sorted2, 'sorts properly after item has been added and refresh called')

  test "beforeSort and afterSort", ->
    $t = table.init()
    dataset = table.generateAlphaColumn()
    $first_row = false
    $t.sortr(
      beforeSort: ->
        $first_row = $(this).find("tr:first").detach()
      afterSort: ->
        $(this).find("tr:first").before($first_row)
    )
    dataset.$th.click()
    sorted = ['lorem', 'am I right?', 'dolor', 'IPSUM', 'sic amet']
    deepEqual(table.getColumnContents('latin'), sorted, 'detaches before sort and re-attaches after sort')

)(jQuery)
