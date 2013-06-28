(($) ->

  sortr =
    name: 'sortr'
    init: ->
      @$el = $(@)

  $.fn[sortr.name] = (opts) ->
    $els = @
    method = if $.isPlainObject(opts) or !opts then "" else opts
    if method and sortr[method]
      sortr[method].apply($els, Array.prototype.slice.call(arguments, 1))
    else if !method
      $els.each (i) ->
        plugin_instance = $.extend(
          true,
          el: $els.eq(i),
          sortr,
          opts
        )
        $els.eq(i).data(sortr.name, plugin_instance)
        plugin_instance.init()
    else
      $.error("Method #{method} does not exist on jQuery. #{sortr.name}");
    return $els;
)(jQuery)