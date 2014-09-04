// jQuery Sortr Plugin
// http://github.com/camerond/jquery-sortr
// version 0.5.4
//
// Copyright (c) 2012 Cameron Daigle, http://camerondaigle.com
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
  (function($) {
    var row_sorter, sortr, table_parser;

    sortr = {
      name: 'sortr',
      initial_dir: {
        alpha: 'asc',
        bool: 'desc',
        numeric: 'desc'
      },
      move_classes: false,
      beforeSort: $.noop,
      afterSort: $.noop,
      class_cache: [],
      numeric_filter: /[$%ÂºÂ¤Â¥Â£Â¢\,]/,
      prepend_empty: false,
      bool_true: ["true", "yes"],
      bool_false: ["false", "no"],
      applyClass: function($th, dir) {
        $th.parent().children().removeClass("" + this.name + "-asc " + this.name + "-desc");
        return $th.addClass("" + this.name + "-" + dir);
      },
      cacheClasses: function() {
        var s;

        s = this;
        s.class_cache = [];
        if (!this.move_classes) {
          return s.$el.find('tbody tr').each(function() {
            s.class_cache.push($(this).attr('class'));
            return $(this).removeClass();
          });
        }
      },
      restoreClasses: function() {
        var s;

        s = this;
        if (s.class_cache.length) {
          return s.$el.find('tbody tr').each(function(idx) {
            return $(this).addClass(s.class_cache[idx]);
          });
        }
      },
      refresh: function() {
        var $th, dir, s;

        s = $(this).data('sortr');
        $th = s.$el.find("." + sortr.name + "-asc, ." + sortr.name + "-desc");
        dir = $th.hasClass("" + sortr.name + "-asc") ? 'asc' : 'desc';
        table_parser.parse(s);
        return s.sortByColumn($th, dir);
      },
      sortByColumn: function($th, dir) {
        var $table, empty_rows, idx, method, sorted;

        this.beforeSort.apply(this.$el);
        this.cacheClasses();
        idx = $th.index();
        $table = $th.closest('table');
        method = $th.data('sortr-method');
        if (!method) {
          return;
        }
        if (!dir && $th.is("." + this.name + "-asc, ." + this.name + "-desc")) {
          sorted = $table.find('tbody tr').detach().toArray().reverse();
          this.applyClass($th, $th.hasClass("" + this.name + "-asc") ? 'desc' : 'asc');
        } else {
          empty_rows = this.stripEmptyRows($table, idx);
          sorted = row_sorter.process(method, $table.find('tbody tr').detach().toArray(), idx);
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
        $table.find('tbody').append($(sorted));
        this.restoreClasses();
        this.afterSort.apply(this.$el);
        return $table;
      },
      sortInitialColumn: function() {
        var $initial;

        $initial = this.$el.find('[data-sortr-default]');
        if ($initial.length) {
          return this.sortByColumn($initial.first());
        }
      },
      stripEmptyRows: function($table, idx) {
        var $rows;

        $rows = $table.find('tr').filter(function() {
          return $(this).children().eq(idx).data('sortr-value') === '';
        });
        return $rows.detach().toArray();
      },
      init: function() {
        var _this = this;

        if (this.$el.attr('data-sortr-prepend-empty')) {
          this.prepend_empty = this.$el.attr('data-sortr-prepend-empty');
        }
        table_parser.parse(this);
        this.sortInitialColumn();
        return this.$el.on("click.sortr", "th", function(e) {
          return _this.sortByColumn($(e.target));
        });
      }
    };
    table_parser = {
      parse: function(sortr_instance) {
        this.numeric_filter = sortr_instance.numeric_filter;
        this.$rows = sortr_instance.$el.find('tbody tr');
        this.bools = sortr_instance.bool_true.concat(sortr_instance.bool_false);
        return sortr_instance.$el.find('thead th').each(this.parseColumn, [this]);
      },
      parseColumn: function(tp) {
        var $th, method, prev_value;

        $th = $(this);
        prev_value = false;
        tp.types = {};
        tp.$rows.each(function(i, v) {
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
          tp.sanitizeAllNumbers(tp.$rows, $th.index());
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
    return $.fn[sortr.name] = function(opts) {
      var $els, method;

      $els = this;
      method = $.isPlainObject(opts) || !opts ? '' : opts;
      if (method && sortr[method]) {
        sortr[method].apply($els, Array.prototype.slice.call(arguments, 1));
      } else if (!method) {
        $els.each(function() {
          var plugin_instance;

          plugin_instance = $.extend(true, {
            $el: $(this)
          }, sortr, opts);
          $(this).data(sortr.name, plugin_instance);
          return plugin_instance.init();
        });
      } else {
        $.error('Method #{method} does not exist on jQuery. #{sortr.name}');
      }
      return $els;
    };
  })(jQuery);

}).call(this);
