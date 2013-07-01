(($) ->

  sortr =
    name: 'sortr'
    initial_sort:
      alpha: 'asc'
      numeric: 'desc'
    applyClass: ($th, dir) ->
      $th
        .removeClass("#{@name}-asc")
        .removeClass("#{@name}-desc")
        .addClass("#{@name}-#{dir}")
    sortByColumn: ($th) ->
      idx = $th.index()
      $table = $th.closest('table')
      method = $th.data('sortr-method')
      if !method then return
      if $th.is(".#{@name}-asc, .#{@name}-desc")
        sorted = $table.find('tbody tr').detach().toArray().reverse()
        @applyClass($th, if $th.hasClass("#{@name}-asc") then 'desc' else 'asc')
      else
        empty_rows = @stripEmptyRows($table, idx)
        sorted = row_sorter.process(method, $table.find('tbody tr').detach().toArray(), idx)
        if @initial_sort[method] is 'desc' then sorted.reverse()
        @applyClass($th, @initial_sort[method])
        if empty_rows.length then sorted.push.apply(sorted, empty_rows)
      $table.find('tbody').append($(sorted))
    stripEmptyRows: ($table, idx) ->
      $rows = $table.find('tr').filter ->
        $(@).children().eq(idx).data('sortr-value') == ''
      $rows.detach().toArray()
    init: ->
      table_parser.parse(@$el)
      @$el.on("click", "th", (e) => @sortByColumn($(e.target)))

  table_parser =
    parse: ($table) ->
      $rows = $table.find('tbody tr')
      tp = @
      $table.find('thead th').each ->
        $th = $(@)
        prev_value = false
        types = {}
        $rows.each (i, v) ->
          $td = $(v).children().eq($th.index())
          value = $td.text().toLowerCase()
          if !prev_value then prev_value = value
          $td.data('sortr-value', value)
          if types.numeric != false then types.numeric = tp.isNumeric(value)
          if types.identical != false then types.identical = (value == prev_value)
          prev_value = value
          true
        method = 'alpha'
        if types.numeric != false then method = 'numeric'
        if types.identical != false then method = 'identical'
        if method is 'numeric' then tp.sanitizeAllNumbers($rows, $th.index())
        $th.data('sortr-method', if method != 'identical' then method)
    sanitizeNumber: (val) ->
      val.replace(/[$%º¤¥£¢\,]/, '')
    sanitizeAllNumbers: ($rows, idx) ->
      tp = @
      $rows.each ->
        $td = $(@).children().eq(idx)
        $td.data('sortr-value', tp.sanitizeNumber($td.text()))
    isNumeric: (val) ->
      v = @sanitizeNumber(val)
      !isNaN(parseFloat(v)) && isFinite(v)

  row_sorter =
    process: (method, rows, idx) ->
      @idx = idx
      rows.sort(@[method])
    output: (positive, negative, neutral) ->
      return 0 if neutral
      return -1 if negative
      return 1 if positive
    alpha: (a, b) ->
      i = $(a).children().eq(row_sorter.idx).data('sortr-value')
      j = $(b).children().eq(row_sorter.idx).data('sortr-value')
      row_sorter.output(i > j, i < j, i == j)
    numeric: (a, b) ->
      i = parseFloat($(a).children().eq(row_sorter.idx).data('sortr-value'))
      j = parseFloat($(b).children().eq(row_sorter.idx).data('sortr-value'))
      row_sorter.output(i > j, i < j, i == j)

  $.fn[sortr.name] = (opts) ->
    $els = @
    method = if $.isPlainObject(opts) or !opts then '' else opts
    if method and sortr[method]
      sortr[method].apply($els, Array.prototype.slice.call(arguments, 1))
    else if !method
      $els.each ->
        plugin_instance = $.extend(
          true,
          $el: $(@),
          sortr,
          opts
        )
        $(@).data(sortr.name, plugin_instance)
        plugin_instance.init()
    else
      $.error('Method #{method} does not exist on jQuery. #{sortr.name}');
    return $els;

)(jQuery)