//my plugin to freeze a few columns of a table, while allowing the other columns to scroll.
(function($) {
    $.fn.DankTable = function(options) {
        var defaults = {
            frozenColumns : 1,
            columnMargin: 0,
            defaultWidth: 100,
            fixHeader: true,
            usePercentageUnits: false

        };

        if ((!!options.usePercentageUnits === true) && (!options.defaultWidth)) {
            //default Width cannot be used in case of percentage since it can be more than 100 or any arbitrary value, which might lead to funny looking tables !
            throw 'You must specify a value for "defaultWidth" if you choose to use Percentage Units';
        }

        var settings = $.extend({}, defaults, options);
        var frozenCells = null;
        settings.unit = settings.usePercentageUnits ? '%': 'px'

        var _makeScrollable = function () {
            this.filter('table').each(function() {
                var $table = $(this);
                if ($table.parent().hasClass('DANK-scroll-table-wrapper') === false) {
                    $table.wrap('<div class="DANK-scroll-table-wrapper"></div>').parent().css({
                        overflow: 'auto'
                    });
                }
                $('<style> th,td {table-layout: fixed; min-width: '+settings.defaultWidth +settings.unit+'; width: '+settings.defaultWidth +settings.unit+' ;z-index: 2; text-align: left; white-space: nowrap}  </style>').appendTo($table);
                
            })
        }

        var _generateColumnsMap = function () {
            if (frozenCells) {
                return frozenCells;
            }
            var cells = [];
            this.filter('table').each(function() {
                var $table = $(this);
                var $rows = $table.find('tr');
 
                cells  = new Array($rows.length);

                for (var i=0; i < cells.length; i++ ) {
                    cells [i] = [];
                }

                $rows.each(function(rowIndex) {
                    var $row = $(this);
                    var tds = $row.find('td');
                    //there might be <th> also as the first row...
                    if (rowIndex === 0 && tds.length === 0) {
                        tds = $row.find('th');
                    }
                    tds.each(function() {
                        cells[rowIndex].push($(this));
                    });
                });

            })
            frozenCells = cells;
            return frozenCells;
        }

        var _getCellsForColumn = function(col) {
            var cells = [];
            for(; col > 0; col--) {
                for (var i=0; i < frozenCells.length; i++) {
                    cells.push({
                        column: col,
                        cellRef: frozenCells[i][col -1]
                    });
                }
            }
            return cells;
        }

        var _getHeaderCells = function() {
            var $headerCells ;
            this.filter('table').each(function() {
                $headerCells = $(this).find('th');
            })

            return $headerCells;
        };

        var _applyFreezeStyles = function (cells) {
            var leftCoordinates ;
            

            cells.forEach(function(cell) {
                leftCoordinates = ((cell.column -1) * (settings.defaultWidth + settings.columnMargin)) + '' + settings.unit;
                $(cell.cellRef).css({
                    position: "sticky",
                    left: ((cell.column -1) * (settings.defaultWidth + settings.columnMargin)) + '' + settings.unit  ,
                    "background-color": "lightgray",
                    'z-index': cell.cellRef.get(0).tagName === 'th' ? 1000 : 500
                }).addClass('sticky-column');

            });
            
        }

        var _applyFixedHeaderStyles = function($headerCells) {
            var sticky = {
                'position': 'sticky',
                'top': 0,
                'background-color': 'darkgrey'
            };

            this.filter('table').each(function() {
                var $table = $(this);
                //make the wrapper height same as the container height
                $table.parent().css({
                    'height': $table.parent().parent().innerHeight(),
                    'max-height': $table.parent().parent().innerHeight(),
                });
            });
            $headerCells.each(function () {
                $(this).css(sticky).css('z-index', $(this).hasClass('sticky-column') ? 1000: 500);
                
            });
        }

        _makeScrollable.call(this);
        _generateColumnsMap.call(this);
        
        
        //encouraged to pass columns
        this.freeze = function(cols) {
            var cellsToFreeze = _getCellsForColumn(cols || settings.frozenColumns);
            _applyFreezeStyles(cellsToFreeze);
            if (!!settings.fixHeader) {
                var $ths = _getHeaderCells.call(this);
                _applyFixedHeaderStyles.call(this, $ths);
            }
            return this;
        };
        
        return this;
    }
})(jQuery);