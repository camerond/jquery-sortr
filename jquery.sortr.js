(function($) {

  var opts;
  var settings;

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
      by: '',
      move_classes: false,
      onStart: function() {},
      onComplete: function(){}
    };
    settings = $.extend({}, defaults, true);
    opts = $.extend(settings, options, true);
    if(options) {
      $.isArray(options.bool_true) ? opts.bool_true = opts.bool_true.concat(defaults.bool_true) : false;
      $.isArray(options.bool_false) ? opts.bool_false = opts.bool_false.concat(defaults.bool_false) : false;
    }

    var get_sorted = {
      alpha: function(index, rows) {
        return rows.sort(function(a, b) {
          var i = $(a).children().eq(index).attr('data-sortr-value').toLowerCase();
          var j = $(b).children().eq(index).attr('data-sortr-value').toLowerCase();
          if(i == j) { return 0; }
          return i < j ? -1 : 1;
        });
      },
      numeric: function(index, rows) {
        return rows.sort(function(a, b) {
          var i = parseFloat($(a).children().eq(index).attr('data-sortr-value'));
          var j = parseFloat($(b).children().eq(index).attr('data-sortr-value'));
          if(i == j) { return 0; }
          return i > j ? -1 : 1;
        });
      },
      date: function(index, rows) {
        return rows.sort(function(a, b) {
          var i = Date.parse($(b).children().eq(index).attr('data-sortr-value'));
          var j = Date.parse($(a).children().eq(index).attr('data-sortr-value'));
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

    function autoSort($th) {
      var index = $th.index();
      var $table = $th.parents('table:eq(0)');
      var $rows = $table.find('tbody tr');
      var rowArray = $rows.detach().toArray();
      if(isRowActive($th)) {
        return restoreClasses(reverseRows($th, rowArray), $table);
      }
      var method = $th.attr('data-' + opts.class_prefix + 'method');
      if(method) {
        setPrimary($th, opts.default_sort[method]);
        var sorted = get_sorted[method](index, rowArray);
        (opts.default_sort[method] != defaults.default_sort[method]) ? sorted.reverse() : false;
        return restoreClasses(sorted, $table);
      }
      return $rows;
    }

    return this.each(function() {
      var $table = $(this);
      var $th = $table.find('thead th');
      var $default_sort = $th.filter('.' + opts.class_prefix + 'default');
      $table.sortr_autodetect();
      $th.not(opts.ignore).click(function() {
        var $th = $(this);
        if($th.attr('data-sortr-method')) {
          opts.onStart.apply($th);
          var $sorted_rows = autoSort($th);
          $sorted_rows.appendTo($table.find('tbody'));
          opts.onComplete.apply($th);
        }
      });
      if($default_sort.length) {
        $default_sort.first().click();
      } else if(opts.by) {
        $th.filter(opts.by).first().trigger('click');
      }
    });

  };

  $.fn.sortr_refresh = function($table) {
    return this.each(function() {
      var $table = $(this);
      $table.find('td').attr('data-sortr-value', '');
      $table.find('th').removeClass(opts.class_prefix + 'asc');;
      $table.find('th').removeClass(opts.class_prefix + 'desc');;
      $table.sortr_autodetect();
    });
  };

  $.fn.sortr_autodetect = function() {
    var $table = $(this);
    var $rows = $table.find('tbody tr');
    cacheClasses($table);
    $table.find('thead th').each(function() {
      var $th = $(this);
      var types = {};
      var $prev_td;
      $th.attr('data-sortr-method', '');
      if (!$th.is(opts.ignore)) {
        $.each($rows, function(i, v) {

          var $td = $(v).children().eq($th.index());
          var value = $td.children().is('input:text') ? $td.find('input:text').val().toLowerCase() : $td.text().toLowerCase();
          $td.attr('data-sortr-value', value);
          $prev_td = !$prev_td ? $td : $prev_td;

          types.numeric = !isNumber($td, value) ? false : types.numeric;
          types.date = isNaN(Date.parse(value)) ? false : types.date;
          types.bool = !isInArray(value, opts.bool_true) && !isInArray(value, opts.bool_false) ? false : types.bool;
          types.blanks = $.trim($td.html()) != '' && ($td.html() != $prev_td.html()) ? false : types.blanks;
          types.checkbox = !$td.children().is(':checkbox') ? false : types.checkbox;

          types.identical = $td.html() != $prev_td.html() ? false : types.identical;

        });
        var method = 'alpha';
        method = types.numeric === false ? method : 'numeric';
        method = types.date === false ? method : 'date';
        method = types.bool === false ? method : 'bool';
        method = types.blanks === false ? method : 'blanks';
        method = types.checkbox === false ? method : 'checkbox';
        ((types.identical === false) || (method === 'checkbox')) ? $th.attr('data-sortr-method', method) : false;
      }
    });
    return $table;
  };

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
    if(opts.move_classes) { return false; }
    var class_array = [];
    $table.find('tbody tr').each(function() {
      class_array.push($(this).attr('class'));
      $(this).removeClass();
    });
    return $table.data('sortr-class-array', class_array);
  }

  function restoreClasses(row_array, $table) {
    var $rows = $(row_array);
    var class_cache = $table.data('sortr-class-array');
    if(class_cache) {
      $rows.each(function(i) {
        $(this).addClass(class_cache[i]);
      });
    }
    return $rows;
  }

  function isNumber($td, n) {
    var percentage;
    if(typeof n != 'string') { return false; }
    if(n.charAt(n.length-1) === '%') {
      percentage = true;
    }
    var numeric_value = n.replace(/[$%º¤¥£¢]/, '');
    if(!isNaN(parseFloat(numeric_value)) && isFinite(numeric_value)) {
      percentage ? numeric_value = numeric_value / 100 : false;
      $td.attr('data-sortr-value', numeric_value);
      return true;
    } else {
      return false;
    }
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

})(jQuery);
