(($) ->

  sortr =
    name: 'sortr'
    initial_sort:
      alpha: 'asc'
      boolean: 'desc'
      numeric: 'desc'
    move_classes: false
    beforeSort: $.noop
    afterSort: $.noop
    class_cache: []
    numeric_filter: /[$%º¤¥£¢\,]/
    applyClass: ($th, dir) ->
      $th.parent().children().removeClass("#{@name}-asc #{@name}-desc")
      $th.addClass("#{@name}-#{dir}")
    cacheClasses: ->
      s = @
      s.class_cache = []
      if !@move_classes
        s.$el.find('tbody tr').each ->
          s.class_cache.push($(this).attr('class'))
          $(this).removeClass()
    restoreClasses: ->
      s = @
      if s.class_cache.length
        s.$el.find('tbody tr').each (idx) ->
          $(this).addClass(s.class_cache[idx])
    refresh: ->
      s = $(@).data('sortr')
      $th = s.$el.find(".#{sortr.name}-asc, .#{sortr.name}-desc")
      dir = if $th.hasClass("#{sortr.name}-asc") then 'asc' else 'desc'
      table_parser.parse(s)
      s.sortByColumn($th, dir)
    sortByColumn: ($th, dir) ->
      @beforeSort.apply(@$el)
      @cacheClasses()
      idx = $th.index()
      $table = $th.closest('table')
      method = $th.data('sortr-method')
      if !method then return
      if !dir and $th.is(".#{@name}-asc, .#{@name}-desc")
        sorted = $table.find('tbody tr').detach().toArray().reverse()
        @applyClass($th, if $th.hasClass("#{@name}-asc") then 'desc' else 'asc')
      else
        empty_rows = @stripEmptyRows($table, idx)
        sorted = row_sorter.process(method, $table.find('tbody tr').detach().toArray(), idx)
        dir = dir or $th.data('sortr-initial-sort') or @initial_sort[method]
        if dir is 'desc' then sorted.reverse()
        @applyClass($th, dir)
        if empty_rows.length then sorted.push.apply(sorted, empty_rows)
      $table.find('tbody').append($(sorted))
      @restoreClasses()
      @afterSort.apply(@$el)
      $table
    sortInitialColumn: ->
      $initial = @$el.find('[data-sortr-default]')
      if $initial.length
        @sortByColumn($initial.first())
    stripEmptyRows: ($table, idx) ->
      $rows = $table.find('tr').filter ->
        $(@).children().eq(idx).data('sortr-value') == ''
      $rows.detach().toArray()
    init: ->
      table_parser.parse(@)
      @sortInitialColumn()
      @$el.on("click.sortr", "th", (e) => @sortByColumn($(e.target)))

  table_parser =
    parse: (sortr_instance) ->
      @numeric_filter = sortr_instance.numeric_filter
      @$rows = sortr_instance.$el.find('tbody tr')
      sortr_instance.$el.find('thead th').each(@parseColumn, [@])
    parseColumn: (tp) ->
      $th = $(@)
      prev_value = false
      tp.types = {}
      tp.$rows.each (i, v) ->
        $td = $(v).children().eq($th.index())
        sortby = $td.data('sortr-sortby')
        value = if sortby then "#{sortby}".toLowerCase() else $td.text().toLowerCase()
        if !value
          if $td.find(":checkbox").length
            value = $td.find(":checkbox").prop("checked")
          else if $td.find("input").length
            value = $td.find("input").val().toLowerCase()
        if !prev_value then prev_value = value
        $td.data('sortr-value', value)
        tp.check('numeric', value)
        tp.check('identical', value, prev_value)
        tp.check('boolean', value)
        prev_value = value
        true
      method = tp.detectMethod()
      if method is 'numeric' then tp.sanitizeAllNumbers(tp.$rows, $th.index())
      $th.data('sortr-method', if method != 'identical' then method)
    check: (type, val, prev_val) ->
      if @types[type] is false then return
      @types[type] = switch type
        when 'numeric'
          @isNumeric(val)
        when 'identical'
          val == prev_val
        when 'boolean'
          typeof val == "boolean"
    detectMethod: ->
      method = 'alpha'
      if @types.numeric != false then method = 'numeric'
      if @types.identical != false then method = 'identical'
      if @types.boolean != false then method = 'boolean'
      method
    sanitizeNumber: (val) ->
      if typeof val != "boolean"
        val.replace(@numeric_filter, '')
    sanitizeAllNumbers: ($rows, idx) ->
      tp = @
      $rows.each ->
        $td = $(@).children().eq(idx)
        $td.data('sortr-value', tp.sanitizeNumber($td.data('sortr-value')))
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
      i.localeCompare(j)
    boolean: (a, b) ->
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