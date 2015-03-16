// jQuery Sortr Plugin
// http://github.com/camerond/jquery-sortr
// version 0.5.6
//
// Copyright (c) 2015 Cameron Daigle, http://camerondaigle.com
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function() {
  var row_sorter, sortr, table_parser;

  sortr = {
    class_name: 'sortr',
    initial_dir: {
      alpha: 'asc',
      bool: 'desc',
      numeric: 'desc'
    },
    move_classes: false,
    class_cache: [],
    numeric_filter: /[$%ÂºÂ¤Â¥Â£Â¢\,]/,
    prepend_empty: false,
    bool_true: ["true", "yes"],
    bool_false: ["false", "no"],
    beforeSort: $.noop,
    afterSort: $.noop,
    external: {
      refresh: function() {
        var $th, dir, s;

        s = $(this).data('sortr');
        $th = s.$el.find("." + s.class_name + "-asc, ." + s.class_name + "-desc");
        dir = $th.hasClass("" + s.class_name + "-asc") ? 'asc' : 'desc';
        table_parser.parse(s);
        return s.sortByColumn($th, dir);
      }
    },
    fireCallback: function(name) {
      if (!this[name]) {
        return;
      }
      this[name].apply(this.$el);
      return this.$el.trigger("" + name + ".sortr");
    },
    applyClass: function($th, dir) {
      $th.parent().children().removeClass("" + this.class_name + "-asc " + this.class_name + "-desc");
      return $th.addClass("" + this.class_name + "-" + dir);
    },
    reverseClass: function($th) {
      return this.applyClass($th, $th.hasClass("" + this.class_name + "-asc") ? 'desc' : 'asc');
    },
    cacheClasses: function() {
      var s;

      if (this.move_classes) {
        return;
      }
      s = this;
      s.class_cache = [];
      return s.$el.find('tbody tr').each(function() {
        s.class_cache.push($(this).attr('class'));
        return $(this).removeClass();
      });
    },
    restoreClasses: function() {
      var s;

      if (this.move_classes) {
        return;
      }
      s = this;
      if (s.class_cache.length) {
        return s.$el.find('tbody tr').each(function(idx) {
          return $(this).addClass(s.class_cache[idx]);
        });
      }
    },
    refreshSingleColumn: function(e) {
      var $target, $th, idx;

      $target = $(e.target);
      idx = $target.closest('td').index();
      $th = this.$el.find('th').eq(idx);
      $th.removeClass("" + this.class_name + "-asc " + this.class_name + "-desc");
      return table_parser.parseColumn($th);
    },
    sortByColumn: function($th, dir) {
      var empty_rows, idx, method, rowArray, sorted;

      this.fireCallback('beforeSort');
      method = $th.data('sortr-method');
      if (!method) {
        return;
      }
      this.cacheClasses();
      idx = $th.index();
      empty_rows = this.stripEmptyRows(this.$el, idx);
      rowArray = this.$el.find('tbody tr').detach().toArray();
      if (!dir && $th.is("." + this.class_name + "-asc, ." + this.class_name + "-desc")) {
        sorted = rowArray.reverse();
        this.reverseClass($th);
      } else {
        sorted = row_sorter.process(method, rowArray, idx);
        dir = dir || $th.data('sortr-initial-dir') || this.initial_dir[method];
        if (dir === 'desc') {
          sorted.reverse();
        }
        this.applyClass($th, dir);
        if (empty_rows.length) {
          if (this.prepend_empty || $th.attr('data-sortr-prepend-empty')) {
            sorted.unshift.apply(sorted, empty_rows);
          } else {
            sorted.push.apply(sorted, empty_rows);
          }
        }
      }
      this.$el.find('tbody').append($(sorted));
      this.restoreClasses();
      this.fireCallback('afterSort');
      return true;
    },
    sortInitialColumn: function() {
      var $initial;

      $initial = this.$el.find('[data-sortr-default]');
      if (!$initial.data('sortr-method') || !$initial.length) {
        $initial = this.$el.find('[data-sortr-fallback]');
      }
      if (!$initial.length) {
        return;
      }
      return this.sortByColumn($initial.first());
    },
    stripEmptyRows: function($table, idx) {
      var $rows;

      $rows = $table.find('tr').filter(function() {
        return $(this).children().eq(idx).data('sortr-value') === '';
      });
      return $rows.detach().toArray();
    },
    init: function() {
      var s,
        _this = this;

      s = this;
      if (this.$el.attr('data-sortr-prepend-empty')) {
        this.prepend_empty = this.$el.attr('data-sortr-prepend-empty');
      }
      table_parser.parse(s);
      this.sortInitialColumn();
      this.$el.on("click.sortr", "th", function(e) {
        return _this.sortByColumn($(e.target));
      });
      this.$el.on("change.sortr", "tbody :checkbox", $.proxy(this.refreshSingleColumn, this));
      return this.$el.on("refresh.sortr", this.external.refresh);
    }
  };

  table_parser = {
    parse: function(sortr_instance) {
      var tp;

      tp = this;
      this.numeric_filter = sortr_instance.numeric_filter;
      this.bools = sortr_instance.bool_true.concat(sortr_instance.bool_false);
      return sortr_instance.$el.find('thead th').each(function() {
        return tp.parseColumn($(this));
      });
    },
    parseColumn: function($th) {
      var $rows, method, prev_value, tp;

      tp = this;
      prev_value = false;
      tp.types = {};
      $rows = $th.closest('table').find('tbody tr');
      $rows.each(function(i, v) {
        var $td, sortby, value;

        $td = $(v).children().eq($th.index());
        sortby = $td.data('sortr-sortby');
        value = sortby != null ? ("" + sortby).toLowerCase() : $td.text().toLowerCase();
        value = $.trim(value);
        if (!value) {
          if ($td.find(":checkbox").length) {
            value = $td.find(":checkbox").prop("checked");
          } else if ($td.find("input").length) {
            value = $td.find("input").val().toLowerCase();
          }
        }
        if (!prev_value) {
          prev_value = value;
        }
        $td.data('sortr-value', value);
        tp.check('numeric', value);
        tp.check('identical', value, prev_value);
        tp.check('bool', value);
        prev_value = value;
        return true;
      });
      method = tp.detectMethod();
      if (method === 'numeric') {
        tp.sanitizeAllNumbers($rows, $th.index());
      }
      return $th.data('sortr-method', method !== 'identical' ? method : void 0);
    },
    check: function(type, val, prev_val) {
      if (this.types[type] === false) {
        return;
      }
      return this.types[type] = (function() {
        switch (type) {
          case 'numeric':
            return this.isNumeric(val);
          case 'identical':
            return val === prev_val;
          case 'bool':
            return typeof val === "boolean" || $.inArray(val, this.bools) !== -1;
        }
      }).call(this);
    },
    detectMethod: function() {
      var method;

      method = 'alpha';
      if (this.types.numeric !== false) {
        method = 'numeric';
      }
      if (this.types.identical !== false) {
        method = 'identical';
      }
      if (this.types.bool !== false) {
        method = 'bool';
      }
      return method;
    },
    sanitizeNumber: function(val) {
      if (typeof val !== "boolean") {
        return val.replace(this.numeric_filter, '');
      }
    },
    sanitizeAllNumbers: function($rows, idx) {
      var tp;

      tp = this;
      return $rows.each(function() {
        var $td;

        $td = $(this).children().eq(idx);
        return $td.data('sortr-value', tp.sanitizeNumber($td.data('sortr-value')));
      });
    },
    isNumeric: function(val) {
      var v;

      v = this.sanitizeNumber(val);
      return !isNaN(parseFloat(v)) && isFinite(v);
    }
  };

  row_sorter = {
    process: function(method, rows, idx) {
      this.idx = idx;
      return rows.sort(this[method]);
    },
    output: function(positive, negative, neutral) {
      if (neutral) {
        return 0;
      }
      if (negative) {
        return -1;
      }
      if (positive) {
        return 1;
      }
    },
    alpha: function(a, b) {
      var i, j;

      i = $(a).children().eq(row_sorter.idx).data('sortr-value');
      j = $(b).children().eq(row_sorter.idx).data('sortr-value');
      return i.localeCompare(j);
    },
    bool: function(a, b) {
      var i, j;

      i = $(a).children().eq(row_sorter.idx).data('sortr-value');
      j = $(b).children().eq(row_sorter.idx).data('sortr-value');
      return row_sorter.output(i > j, i < j, i === j);
    },
    numeric: function(a, b) {
      var i, j;

      i = parseFloat($(a).children().eq(row_sorter.idx).data('sortr-value'));
      j = parseFloat($(b).children().eq(row_sorter.idx).data('sortr-value'));
      return row_sorter.output(i > j, i < j, i === j);
    }
  };

  $.fn.sortr = function(opts) {
    var $els, method;

    $els = this;
    method = $.isPlainObject(opts) || !opts ? '' : opts;
    if (method && sortr.external[method]) {
      $els.each(function() {
        var $el;

        $el = $(this);
        return sortr.external[method].apply($el, Array.prototype.slice.call(arguments, 1));
      });
    } else if (!method) {
      $els.each(function() {
        var plugin_instance;

        plugin_instance = $.extend(true, {
          $el: $(this)
        }, sortr, opts);
        $(this).data("sortr", plugin_instance);
        return plugin_instance.init();
      });
    } else {
      $.error("Method " + method + " does not exist in Sortr.");
    }
    return $els;
  };

}).call(this);
