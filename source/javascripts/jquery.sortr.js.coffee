# jQuery Sortr Plugin
# http://github.com/camerond/jquery-sortr
# version 0.5.4
#
# Copyright (c) 2012 Cameron Daigle, http://camerondaigle.com
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(($) ->

  sortr =
    name: 'sortr'
    initial_dir:
      alpha: 'asc'
      bool: 'desc'
      numeric: 'desc'
    move_classes: false
    beforeSort: $.noop
    afterSort: $.noop
    class_cache: []
    numeric_filter: /[$%º¤¥£¢\,]/
    prepend_empty: false
    bool_true: ["true", "yes"]
    bool_false: ["false", "no"]
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
        dir = dir or $th.data('sortr-initial-dir') or @initial_dir[method]
        if dir is 'desc' then sorted.reverse()
        @applyClass($th, dir)
        if empty_rows.length
          if @prepend_empty || $th.attr('data-sortr-prepend-empty')
            sorted.unshift.apply(sorted, empty_rows)
          else
            sorted.push.apply(sorted, empty_rows)
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
      if @$el.attr('data-sortr-prepend-empty')
        @prepend_empty = @$el.attr('data-sortr-prepend-empty')
      table_parser.parse(@)
      @sortInitialColumn()
      @$el.on("click.sortr", "th", (e) => @sortByColumn($(e.target)))

  table_parser =
    parse: (sortr_instance) ->
      @numeric_filter = sortr_instance.numeric_filter
      @$rows = sortr_instance.$el.find('tbody tr')
      @bools = sortr_instance.bool_true.concat sortr_instance.bool_false
      sortr_instance.$el.find('thead th').each(@parseColumn, [@])
    parseColumn: (tp) ->
      $th = $(@)
      prev_value = false
      tp.types = {}
      tp.$rows.each (i, v) ->
        $td = $(v).children().eq($th.index())
        sortby = $td.data('sortr-sortby')
        value = if sortby? then "#{sortby}".toLowerCase() else $td.text().toLowerCase()
        value = $.trim(value)
        if !value
          if $td.find(":checkbox").length
            value = $td.find(":checkbox").prop("checked")
          else if $td.find("input").length
            value = $td.find("input").val().toLowerCase()
        if !prev_value then prev_value = value
        $td.data('sortr-value', value)
        tp.check('numeric', value)
        tp.check('identical', value, prev_value)
        tp.check('bool', value)
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
        when 'bool'
          typeof val == "boolean" || $.inArray(val, @bools) != -1

    detectMethod: ->
      method = 'alpha'
      if @types.numeric != false then method = 'numeric'
      if @types.identical != false then method = 'identical'
      if @types.bool != false then method = 'bool'
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
    bool: (a, b) ->
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
      $.error('Method #{method} does not exist on jQuery. #{sortr.name}')
    return $els

)(jQuery)
