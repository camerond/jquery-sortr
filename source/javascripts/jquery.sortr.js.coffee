(($) ->

  sortr =
    name: 'sortr'
    applyClass: ($th, direction) ->
      $th
        .removeClass("#{@name}-asc")
        .removeClass("#{@name}-desc")
        .addClass("#{@name}-#{direction}")
    sortByColumn: ($th) ->
      $table = $th.closest('table')
      row_array = $table.find('tbody tr').detach().toArray()
      method = $th.data('sortr-method')
      if method
        sorted = row_sorter.process(method, row_array, $th.index())
        $table.find('tbody').append($(sorted))
        @applyClass($th, 'asc')
    init: ->
      table_parser.parse(@$el)
      @$el.on("click", "th", (e) => @sortByColumn($(e.target)))

  table_parser =
    parse: ($table) ->
      $rows = $table.find('tbody tr')
      tp = @
      types = {}
      @$table = $table
      $table.find('thead th').each ->
        $th = $(@)
        $rows.each (i, v) ->
          $td = $(v).children().eq($th.index())
          value = $td.text().toLowerCase()
          $td.data('sortr-value', value)
          if types.numeric != false then types.numeric = tp.isNumeric(value)
          true
        method = 'alpha'
        if types.numeric != false then method = 'numeric'
        if method is 'numeric' then tp.sanitizeAllNumbers($rows, $th.index())
        $th.data('sortr-method', method)
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
      @row_array = rows
      @idx = idx
      @row_array.sort(@[method])
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