(($) ->

  sortr =
    name: 'sortr'
    default_sort:
      alpha: 'asc'
    applyClass: ($th, direction) ->
      $th
        .removeClass("#{@name}-asc")
        .removeClass("#{@name}-desc")
        .addClass("#{@name}-#{direction}")
    parseTable: ->
      $table = @$el
      $rows = $table.find('tbody tr')
      $table.find('thead th').each (i) ->
        $th = $(@).eq(i)
        $rows.each (i, v) ->
          $td = $(v).children().eq($th.index())
          value = $td.text().toLowerCase()
          $td.data('sortr-value', value)
        $th.data('sortr-method', 'alpha')
    sortByColumn: ($th) ->
      $table = $th.closest('table')
      row_array = $table.find('tbody tr').detach().toArray()
      method = $th.data('sortr-method')
      if method
        sorted = row_sorter.process(method, row_array, $th.index())
        $table.find('tbody').append($(sorted))
        @applyClass($th, 'asc')
    init: ->
      @parseTable()
      @$el.on("click", "th", (e) => @sortByColumn($(e.target)))

  row_sorter =
    process: (method, rows, idx) ->
      @row_array = rows
      @idx = idx
      @row_array.sort(@[method])
      return @row_array
    output: (positive, negative, neutral) ->
      return 0 if neutral
      return -1 if negative
      return 1 if positive
    alpha: (a, b) ->
      i = $(a).children().eq(row_sorter.idx).data('sortr-value')
      j = $(b).children().eq(row_sorter.idx).data('sortr-value')
      row_sorter.output(i > j, i < j, i == j)

  $.fn[sortr.name] = (opts) ->
    $els = @
    method = if $.isPlainObject(opts) or !opts then '' else opts
    if method and sortr[method]
      sortr[method].apply($els, Array.prototype.slice.call(arguments, 1))
    else if !method
      $els.each (i) ->
        plugin_instance = $.extend(
          true,
          $el: $($els.eq(i)),
          sortr,
          opts
        )
        $els.eq(i).data(sortr.name, plugin_instance)
        plugin_instance.init()
    else
      $.error('Method #{method} does not exist on jQuery. #{sortr.name}');
    return $els;

)(jQuery)