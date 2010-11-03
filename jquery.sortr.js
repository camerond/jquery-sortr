(function($) {
  $.fn.sortr = function(options) {

    var defaults = {
      class_prefix: 'sortr-',
      default_sort: {
        alpha: 'asc',
        date: 'desc',
        numeric: 'desc',
        bool: 'desc',
        checkbox: 'desc',
        blanks: 'desc'
      },
      bool_true: [
        'yes',
        'true'
      ],
      bool_false: [
        'no',
        'false'
      ],
      ignore : '',
      by: ''
    };
    var settings = $.extend({}, defaults, true);
    var opts = $.extend(settings, options, true);

    var get_sorted = {
      alpha: function(index, rows) {
        return rows.sort(function(a, b) {
          var i = $(a).children().eq(index).text().toLowerCase();
          var j = $(b).children().eq(index).text().toLowerCase();
          if(i == j) { return 0; }
          return i < j ? -1 : 1;
        });
      },
      numeric: function(index, rows) {
        return rows.sort(function(a, b) {
          var i = $(a).children().eq(index).text();
          var j = $(b).children().eq(index).text();
          if(i == j) { return 0; }
          return i < j ? -1 : 1;
        });
      },
      date: function(index, rows) {
        return rows.sort(function(a, b) {
          var i = Date.parse($(b).children().eq(index).text());
          var j = Date.parse($(a).children().eq(index).text());
          if(i == j) { return 0; }
          return i < j ? -1 : 1;
        });
      },
      checkbox: function(index, rows) {
        return rows.sort(function(a, b) {
          var value = 0;
          var $i = $(a).children().eq(index).children();
          var $j = $(b).children().eq(index).children();
          $i.is(':checked') && $j.not(':checked') ? value = -1 : false;
          $i.not(':checked') && $j.is(':checked') ? value = 1 : false;
          return value;
        });
      },
      blanks: function(index, rows) {
        return rows.sort(function(a, b) {
          var value = 0;
          var i = $.trim($(a).children().eq(index).text());
          var j = $.trim($(b).children().eq(index).text());
          i != '' && j == '' ? value = -1 : false;
          i == '' && j != '' ? value = 1 : false;
          return value;
        });
      },
      bool: function(index, rows) {
        return rows.sort(function(a, b) {
          var value = 0;
          var i = $(a).children().eq(index).text().toLowerCase();
          var j = $(b).children().eq(index).text().toLowerCase();
          isInArray(i, opts.bool_true) && isInArray(j, opts.bool_false) ? value = -1 : false;
          isInArray(i, opts.bool_false) && isInArray(j, opts.bool_true) ? value = 1 : false;
          return value;
        });
      }
    };

    function autoDetect($table) {
      var $rows = $table.find('tbody tr');
      $table.find('thead th').not(opts.ignore).each(function() {
        var $th = $(this);
        var numeric = true;
        var date = true;
        var bool = true;
        var blanks = true;
        var checkbox = true;
        var prev_value = null;
        var identical_values = true;
        $.each($rows, function(i, v) {
          var value = $(v).children().eq($th.index()).html();
          if(!prev_value) { prev_value = value; }
          if(!isNumber(parseFloat(value))) {
            numeric = false;
          }
          if(isNaN(Date.parse(value))) {
            date = false;
          }
          if(!isInArray(value, opts.bool_true) && !isInArray(value, opts.bool_false)) {
            bool = false;
          }
          if($.trim(value) != '' && (value != prev_value)) {
            blanks = false;
          }
          if(!$(v).children().eq($th.index()).children().is(':checkbox')) {
            checkbox = false;
          }
          if(value != prev_value) {
            identical_values = false;
          }
          prev_value = value;
        });
        var method = 'alpha';
        date ? method = 'date' : false;
        numeric ? method = 'numeric' : false;
        bool ? method = 'bool' : false;
        blanks ? method = 'blanks' : false;
        checkbox ? method = 'checkbox' : false;
        if(!identical_values) {
          $th.data(opts.class_prefix + 'method', method);
        }
      });
    }

    function autoSort($th) {
      var index = $th.index();
      var $rows = $th.parents('table:first').find('tbody tr');
      var rowArray = $rows.removeClass().detach().toArray();
      if(isRowActive($th)) {
        return reverseRows($th, rowArray);
      }
      var method = $th.data(opts.class_prefix + 'method');
      if(method) {
        setPrimary($th, opts.default_sort[method]);
        var sorted = get_sorted[method](index, rowArray);
        (opts.default_sort[method] != defaults.default_sort[method]) ? sorted.reverse() : false;
        return sorted;
      }
      return rowArray;
    }

    function isRowActive($th) {
      return ($th.hasClass(opts.class_prefix + 'asc') || $th.hasClass(opts.class_prefix + 'desc')) ? true : false;
    }

    function reverseRows($th, rows) {
      var asc = opts.class_prefix + 'asc';
      var desc = opts.class_prefix + 'desc';
      if($th.hasClass(asc)) {
        $th.removeClass(asc);
        $th.addClass(desc);
      } else {
        $th.removeClass(desc);
        $th.addClass(asc);
      }
      return rows.reverse();
    }

    function setPrimary($th, suffix) {
      $th.siblings().removeClass(opts.class_prefix + 'desc');
      $th.siblings().removeClass(opts.class_prefix + 'asc');
      $th.addClass(opts.class_prefix + suffix);
    }

    function cacheClasses($table) {
      var class_array = [];
      $table.find('tbody tr').each(function() {
        class_array.push($(this).attr('class'));
      });
      return class_array;
    }

    function restoreClasses($rows, class_cache) {
      $rows.each(function(i) {
        $(this).addClass(class_cache[i]);
      });
      return $rows;
    }

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function isInArray(v, a)
    {
      var o = {};
      for(var i=0;i<a.length;i++)
      {
        o[a[i]]='';
      }
      return v in o;
    }

    return this.each(function() {
      var $table = $(this);
      var class_cache = cacheClasses($table);
      autoDetect($table);
      $table.find('thead th').not(opts.ignore).click(function() {
        var $th = $(this);
        var sorted_row_array = autoSort($th);
        var $sorted_rows = restoreClasses($(sorted_row_array), class_cache);
        $sorted_rows.appendTo($table.find('tbody'));
      });
      if(opts.by) {
        $table.find('thead th').filter(opts.by).first().trigger('click');
      }
    });

  };

})(jQuery);
