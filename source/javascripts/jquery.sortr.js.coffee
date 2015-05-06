# jQuery Sortr Plugin
# http://github.com/camerond/jquery-sortr
# version 0.5.7
#
# Copyright (c) 2015 Cameron Daigle, http://camerondaigle.com
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

sortr =
  class_name: 'sortr'
  initial_dir:
    alpha: 'asc'
    bool: 'desc'
    numeric: 'desc'
  move_classes: false
  numeric_filter: /[$%º¤¥£¢\,]/
  prepend_empty: false
  bool_true: ["true", "yes"]
  bool_false: ["false", "no"]
  ignore: ""
  beforeSort: $.noop
  afterSort: $.noop

  external:
    refresh: ->
      s = $(@).data('sortr')
      $th = s.$el.find(".#{s.class_name}-asc, .#{s.class_name}-desc")
      dir = if $th.hasClass("#{s.class_name}-asc") then 'asc' else 'desc'
      table_parser.parse(s)
      s.sortByColumn($th, dir)

  fireCallback: (name) ->
    if !@[name] then return
    @[name].apply(@$el)
    @$el.trigger("#{name}.sortr")

  applyClass: ($th, dir) ->
    $th.parent().children().removeClass("#{@class_name}-asc #{@class_name}-desc")
    $th.addClass("#{@class_name}-#{dir}")

  reverseClass: ($th) ->
    @applyClass($th, if $th.hasClass("#{@class_name}-asc") then 'desc' else 'asc')

  cacheClasses: ->
    return if @move_classes
    s = @
    s.class_cache = []
    s.$el.find('tbody tr').each ->
      s.class_cache.push($(this).attr('class'))
      $(this).removeClass()

  restoreClasses: ->
    return if @move_classes
    s = @
    if s.class_cache.length
      s.$el.find('tbody tr').each (idx) ->
        $(this).addClass(s.class_cache[idx])

  refreshSingleColumn: (e) ->
    $target = $(e.target)
    idx = $target.closest('td').index()
    $th = @$el.find('th').eq(idx)
    $th.removeClass("#{@class_name}-asc #{@class_name}-desc")
    table_parser.parseColumn($th)

  sortByColumn: ($th, dir) ->
    @fireCallback('beforeSort')

    method = $th.data('sortr-method')
    if !method then return

    @cacheClasses()
    idx = $th.index()
    empty_rows = @stripEmptyRows(@$el, idx)
    rowArray = @$el.find('tbody tr').detach().toArray()
    if !dir and $th.is(".#{@class_name}-asc, .#{@class_name}-desc")
      sorted = rowArray.reverse()
      @reverseClass($th)
    else
      sorted = row_sorter.process(method, rowArray, idx)
      dir = dir or $th.data('sortr-initial-dir') or @initial_dir[method]
      if dir is 'desc' then sorted.reverse()
      @applyClass($th, dir)
      if empty_rows.length
        if @prepend_empty || $th.attr('data-sortr-prepend-empty')
          sorted.unshift.apply(sorted, empty_rows)
        else
          sorted.push.apply(sorted, empty_rows)
    @$el.find('tbody').append($(sorted))
    @restoreClasses()

    @fireCallback('afterSort')
    true

  sortInitialColumn: ->
    $initial = @$el.find('[data-sortr-default]')
    if !$initial.data('sortr-method') or !$initial.length
      $initial = @$el.find('[data-sortr-fallback]')
    return unless $initial.length
    @sortByColumn($initial.first())

  stripEmptyRows: ($table, idx) ->
    $rows = $table.find('tr').filter ->
      $(@).children().eq(idx).data('sortr-value') == ''
    $rows.detach().toArray()

  init: ->
    s = @
    if @$el.attr('data-sortr-prepend-empty')
      @prepend_empty = @$el.attr('data-sortr-prepend-empty')
    table_parser.parse(s)
    @sortInitialColumn()
    @$el.on("click.sortr", "th", (e) => @sortByColumn($(e.target)))
    @$el.on("change.sortr", "tbody :checkbox", $.proxy(@refreshSingleColumn, @))
    @$el.on("refresh.sortr", @external.refresh)

table_parser =
  parse: (sortr_instance) ->
    tp = @
    @numeric_filter = sortr_instance.numeric_filter
    @bools = sortr_instance.bool_true.concat sortr_instance.bool_false
    sortr_instance.$el.find('thead th')
      .not(sortr_instance.ignore)
      .not('[data-sortr-ignore]')
      .each ->
        tp.parseColumn($(@))
  parseColumn: ($th) ->
    tp = @
    prev_value = false
    tp.types = {}
    $rows = $th.closest('table').find('tbody tr')
    $rows.each (i, v) ->
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
    if method is 'numeric' then tp.sanitizeAllNumbers($rows, $th.index())
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

$.fn.sortr = (opts) ->
  $els = @
  method = if $.isPlainObject(opts) or !opts then '' else opts
  if method and sortr.external[method]
    $els.each ->
      $el = $(@)
      sortr.external[method].apply($el, Array.prototype.slice.call(arguments, 1))
  else if !method
    $els.each ->
      plugin_instance = $.extend(
        true,
        $el: $(@),
        sortr,
        opts
      )
      $(@).data("sortr", plugin_instance)
      plugin_instance.init()
  else
    $.error("Method #{method} does not exist in Sortr.")
  return $els
