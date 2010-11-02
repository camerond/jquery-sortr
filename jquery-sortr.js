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
          return $(a).children().eq(index).text().toLowerCase() > $(b).children().eq(index).text().toLowerCase();
        });
      },
      numeric: function(index, rows) {
        return rows.sort(function(a, b) {
          return $(a).children().eq(index).text() - $(b).children().eq(index).text();
        });
      },
      date: function(index, rows) {
        return rows.sort(function(a, b) {
          return Date.parse($(b).children().eq(index).text()) - Date.parse($(a).children().eq(index).text());
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
      blank: function(index, rows) {
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
          var i = $(a).children().eq(index).text();
          var j = $(b).children().eq(index).text();
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
        var blank = true;
        var checkbox = true;
        var prev_value = null;
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
            blank = false;
          }
          if(!$(value).is('input[type="checkbox"]')) {
            checkbox = false;
          }
          prev_value = value;
        });
        var method = 'alpha';
        date ? method = 'date' : false;
        numeric ? method = 'numeric' : false;
        bool ? method = 'bool' : false;
        blank ? method = 'blank' : false;
        checkbox ? method = 'checkbox' : false;
        $th.data('sortr-method', method);
      });
    }

    function autoSort($th) {
      var index = $th.index();
      var $rows = $th.parents('table:first').find('tbody tr');
      var rowArray = $rows.detach().toArray();
      if(isRowActive($th)) {
        return reverseRows($th, rowArray);
      }
      var method = $th.data('sortr-method');
      setPrimary($th, opts.default_sort[method]);
      var sorted = get_sorted[method](index, rowArray);
      (opts.default_sort[method] != defaults.default_sort[method]) ? sorted.reverse() : false;
      return $(sorted);
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
      return $(rows.reverse());
    }

    function setPrimary($th, suffix) {
      $th.siblings().removeClass(opts.class_prefix + 'desc');
      $th.siblings().removeClass(opts.class_prefix + 'asc');
      $th.addClass(opts.class_prefix + suffix);
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
      autoDetect($table);
      $table.find('thead th').not(opts.ignore).click(function() {
        var $th = $(this);
        autoSort($th).appendTo($table.find('tbody'));
      });
      if(opts.by) {
        $table.find('thead th').filter(opts.by).first().trigger('click');
      }
    });

  };

})(jQuery);
