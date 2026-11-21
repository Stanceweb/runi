(function (vendor, $, window) {
  var appName = 'Tables',
    elemCss = {
      display: 'none',
      position: 'absolute',
      boxSizing: 'border-box',
      border: '2px solid #ddd',
      resize: 'none',
      overflow: 'hidden',
      padding: '0',
      margin: '0',
      textIndent: '10px',
    },
    dtsCellChangeReqTimeout = {},
    dtsCellEditLock = {},
    allowedFileTypes = typeof dtb_allowedFileTypes !== 'undefined' ? dtb_allowedFileTypes : ['png', 'jpeg', 'jpg', 'pdf'];

  if (!(appName in vendor)) {
    vendor[appName] = {};
  }
  vendor[appName].setFrontendFields = function ($table) {
    var $tableWrap = $table.parents('.supsystic-tables-wrap:first'),
      editable = $tableWrap.find('.editable'),
      editfiles = $tableWrap.find('.editfile'),
      selectable = $tableWrap.find('.selectable'),
      date = $tableWrap.find('.datefield');

    if ($table.data('id')) {
      var currTableId = $table.data('id');
      dtsCellEditLock[currTableId] = 0;
      dtsCellChangeReqTimeout[currTableId] = false;
      $tableWrap.find('.dtsFrontendExport a').on('click', function (event) {
        // prevent clicking on "link"
        if (dtsCellEditLock[currTableId]) {
          event.preventDefault();
        }
      });
    }
    this.createEditableFields($table, editable);
    this.createEditableFileFields($table, editfiles);
    this.createSelectableFields($table, selectable);
    this.createDateFields($table, date);
  };

  vendor[appName].updateAfterRedraw = function (table) {
    var id = table.data('id'),
      viewId = table.data('view-id'),
      $currentTableWrapper = $('#supsystic-table-' + viewId),
      $currentTable = $currentTableWrapper.find('#supsystic-table-' + id),
      $currentEditableFields = $currentTableWrapper.find('.editable'),
      $currentEditableFileFields = $currentTableWrapper.find('.editfile'),
      $currentSelectableFields = $currentTableWrapper.find('.selectable'),
      $currentDateFields = $currentTableWrapper.find('.datefield');

    this.createEditableFields($currentTable, $currentEditableFields);
    this.createEditableFileFields($currentTable, $currentEditableFileFields);
    this.createSelectableFields($currentTable, $currentSelectableFields);
    this.createDateFields($currentTable, $currentDateFields);
    this.setTooltipCell($currentTable);
    this.setCollapsibleRow($currentTable);
    this.setImgLightbox($currentTable);
    if (g_stbServerSideProcessing) {
      this.setCollapsibleCell($currentTable);
    }
  };

  vendor[appName].createEditableFields = function ($table, $fields) {
    var self = this;

    if (this._useFrontendFields($table) && $fields.length) {
      var $tableWrapper = $table.parents('.supsystic-tables-wrap:first'),
        $elem = $tableWrapper.find('.inputArea');

      if (!$elem.length) {
        $elem = $('<textarea class="inputArea" />');
        $elem.css(
          $.extend({}, elemCss, {
            textIndent: '0',
            padding: '5px',
            overflowY: 'auto',
          })
        );
        $elem.appendTo($tableWrapper);
        $elem = $tableWrapper.find('.inputArea');
      }
      $fields.off('click.sup').on('click.sup', function (event) {
        event.preventDefault();
        self._setEditedValueToCell($(this), $elem, $table);
      });
    }
  };

  vendor[appName].setClickableDeleteBtn = function ($td, $elem, $table) {
    var self = this,
      cell = JSON.stringify({ c: $td.data('x'), r: $td.data('y') }),
      cellType = this._getCellType($td);

    $(document)
      .off('click')
      .on('click vclick tap', '.delete-upload-file', function () {
        var deleteFileBtn = $(this);
        self
          .request(
            {
              module: 'tables',
              action: 'deleteEditableFieldsFile',
              nonce: DTGS_NONCE_FRONTEND,
            },
            {
              id: $table.data('id'),
              cell: cell,
              file_src: typeof deleteFileBtn.siblings('[data-path]') !== 'undefined' ? deleteFileBtn.siblings('[data-path]').attr('data-path') : '',
            }
          )
          .done(function (response) {
            if (response.success) {
              $td.attr('data-original-value', '');
              $td.attr('data-order', '');
              $td.attr('data-editfile', '');
              $td.html('');
              if ($table.attr('data-fixed-cols') === 'on') {
                var cloneTd = $table.find('[data-x="' + $td.data('x') + '"][data-y="' + $td.data('y') + '"]');
                if (typeof cloneTd !== 'undefined') {
                  cloneTd.attr('data-original-value', '');
                  cloneTd.attr('data-order', '');
                  cloneTd.attr('data-editfile', '');
                  cloneTd.html('');
                }
              }
              setTimeout(function () {
                self._updateTableCell(cellType, $elem, $td, $table);
              }, 1000);
            } else {
              alert(response.message.message);
            }
          });

        return false;
      });
  };

  vendor[appName].createEditableFileFields = function ($table, $fields) {
    var self = this;

    if (this._useFrontendFields($table) && $fields.length) {
      var $tableWrapper = $table.parents('.supsystic-tables-wrap:first'),
        $elem = $tableWrapper.find('.inputFile');

      $fields.find('.delete-upload-file').show();

      if (!$elem.length) {
        $elem = $('<input type="file" class="inputFile" />');
        $elem.css(
          $.extend({}, elemCss, {
            textIndent: '0',
            padding: '5px',
            overflowY: 'auto',
          })
        );
        $elem.appendTo($tableWrapper);
        $elem = $tableWrapper.find('.inputFile');
      }
      $fields.off('click.sup').on('click.sup', function (event) {
        event.preventDefault();
        if (!$(this).find('a').length && !$(this).find('img').length) {
          self._setEditedValueToCell($(this), $elem, $table);
        } else {
          self.setClickableDeleteBtn($(this), $elem, $table);
        }
      });
    }
  };

  vendor[appName].createSelectableFields = function ($table, $fields) {
    var self = this;

    if (this._useFrontendFields($table) && $fields.length) {
      var $tableWrapper = $table.parents('.supsystic-tables-wrap:first'),
        $elem = $tableWrapper.find('.selectArea'),
        $isDb = $table.closest('.supsystic-tables-wrap').find('.stbDBEditData');

      if (!$elem.length) {
        $elem = $('<select class="selectArea" />');
        $elem.css(elemCss);
        $elem.appendTo($tableWrapper);
        $elem = $tableWrapper.find('.selectArea');
      }
      $fields.off('click.sup').on('click.sup', function (event) {
        event.preventDefault();
        if ($isDb.length === 0 || ($isDb.length && $(this).hasClass('editable'))) {
          self._setEditedValueToCell($(this), $elem, $table);
        }
      });
    }
  };

  vendor[appName].createDateFields = function ($table, $fields) {
    var self = this;

    if (this._useFrontendFields($table) && $fields.length) {
      var $tableWrapper = $table.parents('.supsystic-tables-wrap:first'),
        $elem = $tableWrapper.find('.datetimeArea');

      if (typeof $.datepicker == 'object') {
        if (!$elem.length) {
          $.datepicker.parseDate = function (format, value) {
            return moment(value, format).toDate();
          };
          $.datepicker.formatDate = function (format, value) {
            return moment(value).format(format);
          };

          $elem = $('<input type="text" class="datetimeArea" />');
          $elem.css(elemCss);
          $elem.appendTo($tableWrapper);
          $elem = $tableWrapper.find('.datetimeArea');
          $elem.datepicker({
            beforeShow: function (input, inst) {
              $('#ui-datepicker-div').addClass('stbDatePicker'); //add custom class to datepicker
            },
          });
        }
        $fields.off('click.sup').on('click.sup', function (event) {
          event.preventDefault();
          self._setEditedValueToCell($(this), $elem, $table);
        });
      }
    }
  };

  vendor[appName].setImgLightbox = function ($table) {
    if ($table.attr('data-lightbox-img') && $table.attr('data-lightbox-img') == 'on') {
      setTimeout(function () {
        $table
          .parents('.supsystic-tables-wrap:first')
          .find('th img, td img')
          .each(function () {
            if (!$(this).parent().is('a')) {
              var url = $(this).data('full') || $(this).attr('src');
              $(this).attr('href', url).attr('data-featherlight', 'image');
            }
          });
      }, 1000);
    }
  };

  vendor[appName].setTooltipCell = function ($table) {
    $table.find('.tooltipCell').each(function () {
      var cell = $(this),
        // content = cell.html(),
        content = cell.attr('data-original-value'),
        icon = $('<i class="fa fa-info-circle"></i>');

      cell.html(icon);
      icon.tooltipster({
        content: content,
        contentAsHTML: true,
        interactive: true,
        position: 'top-left',
        updateAnimation: true,
        animation: 'swing',
      });
    });
  };

  vendor[appName]._useFrontendFields = function ($table) {
    var useFrontendFields = false,
      tableId = $table.data('id');

    if ((window.useEdit && typeof window.useEdit != 'undefined' && typeof window.useEdit[tableId] != 'undefined') || (SDT_DATA.isAdmin && SDT_DATA.isPro)) {
      useFrontendFields = true;
    }
    return useFrontendFields;
  };

  vendor[appName]._setElemPosition = function ($elem, $td) {
    var params = [
        { selector: '.dataTables_scrollHead', scroll: true },
        { selector: '.dataTables_scrollBody', scroll: true },
        { selector: '.dataTables_scrollFoot', scroll: true },
        { selector: '.DTFC_LeftHeadWrapper' },
        { selector: '.DTFC_LeftBodyWrapper' },
        { selector: '.DTFC_LeftFootWrapper' },
        { selector: '.DTFC_RightHeadWrapper' },
        { selector: '.DTFC_RightBodyWrapper' },
        { selector: '.DTFC_RightFootWrapper' },
        { selector: 'td.child' },
        { selector: '.dataTables_wrapper' },
      ],
      scrollTop,
      scrollLeft,
      position;

    for (var i = 0; i < params.length; i++) {
      var parent = $td.parents(params[i].selector + ':first');

      if (parent.length) {
        parent.append($elem);
        scrollTop = params[i].scroll ? parent.scrollTop() : 0;
        scrollLeft = params[i].scroll ? parent.scrollLeft() : 0;
        position = $td.position();
        $elem.css({
          // top: position.top + scrollTop,
          // left: position.left + scrollLeft
          top: position.top,
          left: position.left,
        });
        break;
      }
    }
  };

  vendor[appName]._getCellType = function ($td) {
    var types = ['editable', 'selectable', 'datefield', 'editfile'],
      cellType = 'editable';

    for (var i = 0; i < types.length; i++) {
      if ($td.hasClass(types[i])) {
        cellType = types[i];
      }
    }
    return cellType;
  };

  vendor[appName]._setEditedValueToCell = function ($td, $elem, $table) {
    var self = this,
      cellType = this._getCellType($td),
      value = $td.data('formula') ? $td.data('formula') : $td.data('original-value'),
      source = $td.data('source') && $td.data('source').length ? $td.data('source') : [],
      formula = $td.data('formula'),
      useComaAsDelimiter = $table.data('use-comma-as-delimiter'),
      triggerEvent = (typeof $.browser != 'undefined' && $.browser.msie) || !!navigator.userAgent.match(/Trident\/7\./) ? 'focusout' : 'blur';

    this._setElemPosition($elem, $td);
    // Set element CSS styles
    $elem.css({
      width: $td.innerWidth() + 1, // To cover cell right border
      height: $td.innerHeight() + 1, // To cover cell bottom border
      minHeight: $td.innerHeight() + 1,
      fontSize: $td.css('font-size'),
      lineHeight: $td.css('line-height'),
    });
    // To remove unneeded zeros from end of percent values, e.g. 15.230000000001
    if (!formula && $td.data('cell-format-type') == 'percent') {
      value = this._preparePercentValue(value, $td.data('cell-format'));
    }
    switch (cellType) {
      case 'editable':
        // Show stored <br> line breaks as real newlines while editing in the textarea
        value = (value || '').toString().replace(/<br\s*\/?>/gi, '\n');
        if (useComaAsDelimiter && value.match(/^-{0,1}\d+\.{0,1}\d*$/)) {
          value = value.replace('.', ',');
        }
        break;
      case 'selectable':
        $elem.html('');
        for (var i = 0; i < source.length; i++) {
          var selected = source[i] == value ? 'selected="selected"' : '';
          $elem.append('<option ' + selected + '>' + source[i] + '</option>');
        }
        break;
      case 'datefield':
        var isDate = $td.data('cell-format-type') == 'date' && typeof $td.data('cell-format') != 'undefined',
          format = isDate ? $td.data('cell-format') : $table.data('date-format'),
          defDate = isDate && value ? value : moment().format(format);

        value = isDate && value ? value : defDate;
        $elem.datepicker('option', 'dateFormat', format);
        $elem.datepicker('option', 'defaultDate', defDate);
        break;
      case 'editfile':
        $elem.click();
        break;
      default:
        break;
    }
    if (cellType != 'selectable' && cellType != 'editfile') {
      $elem.off('keypress').on('keypress', function (event) {
        if ((event.keyCode || event.which) == 13) {
          if (cellType == 'editable' && event.ctrlKey) {
            // Ctrl+Enter inserts a line break in the cell, same as the backend cell editor
            return true;
          }
          // Enter button
          event.preventDefault();
          var $this = $(this);
          $this.trigger(triggerEvent);
          if (cellType == 'datefield') {
            $this.datepicker('hide');
          }
          return true;
        }
      });
      $elem.val(value);
    }
    $elem.off('keydown').on('keydown', function (event) {
      if (cellType == 'editable' && (event.keyCode || event.which) == 13 && event.ctrlKey) {
        // Ctrl+Enter inserts a line break, same as the backend cell editor.
        // Browsers do not insert "\n" into a textarea by themselves for Ctrl+Enter
        // (and Chromium does not even fire "keypress" for it), so do it manually.
        event.preventDefault();
        var el = this,
          start = el.selectionStart,
          end = el.selectionEnd,
          val = el.value;

        el.value = val.slice(0, start) + '\n' + val.slice(end);
        el.selectionStart = el.selectionEnd = start + 1;
        return;
      }
      if ((event.keyCode || event.which) == 9) {
        // Tab button
        event.preventDefault();
        var $this = $(this),
          $fields = $table.find('.editable, .selectable, .datefield, .editfile'),
          nextIndex = self._getNextVisibleIndex($fields, $fields.index($td) + 1);

        $this.trigger(triggerEvent);
        if (cellType == 'datefield') {
          $this.datepicker('hide');
        }
        if (nextIndex > 0) {
          $fields.eq(nextIndex).trigger('click');
        }
      }
    });
    if (cellType == 'datefield') {
      $elem.datepicker('option', 'onClose', function () {
        $('#ui-datepicker-div').removeClass('stbDatePicker');
        self._updateTableCell(cellType, $elem, $td, $table);
      });
    } else if (cellType == 'editfile') {
      $elem.off('change').on('change', function (e) {
        var file = typeof e.target.files[0] !== 'undefined' ? e.target.files[0] : { type: 'supsystic', name: '' },
          url = window.ajaxurl ? window.ajaxurl : ajax_obj.ajaxurl,
          message = '',
          file_ext = file.name.slice((Math.max(0, file.name.lastIndexOf('.')) || Infinity) + 1).toLowerCase();

        $td.attr('data-editfile', '');
        if (file.type === 'supsystic') {
          $td.attr('data-editfile', '');
          $elem.hide();
        } else if (toeInArray(file_ext, allowedFileTypes) >= 0) {
          var fileData = new FormData();
          fileData.append('action', 'supsystic-tables');
          fileData.append('route[module]', 'tables');
          fileData.append('route[action]', 'saveEditableFieldsFile');
          fileData.append('route[nonce]', DTGS_NONCE_FRONTEND);
          fileData.append('id', $table.data('id'));
          fileData.append('cellFile', file);
          fileData.append(
            'cell',
            JSON.stringify({
              c: $td.data('x'),
              r: $td.data('y'),
            })
          );

          jQuery
            .ajax({
              url: url,
              data: fileData,
              cache: false,
              contentType: false,
              processData: false,
              dataType: 'json',
              beforeSend: function () {
                jQuery('*').css({ cursor: 'wait' });
              },
              method: 'POST',
              type: 'POST',
              success: function (response) {
                $elem.hide();
                if (response.success) {
                  $td.html(response.message);
                  $td.attr('data-original-value', response.message);
                  $td.attr('data-order', response.message);
                  $td.attr('data-editfile', response.message);
                  setTimeout(function () {
                    self._updateTableCell(cellType, $elem, $td, $table);
                  }, 500);
                  $elem.val('');
                } else {
                  $td.attr('data-editfile', '');
                  alert(response.message.message);
                }
              },
            })
            .done(function () {
              jQuery('*').css({ cursor: '' });
            });
        } else {
          $td.attr('data-editfile', '');
          $elem.hide();
          // todo: create some notification?
          alert(file_ext + ' is not allowed file type!');
        }
      });
    } else {
      $elem.off(triggerEvent).on(triggerEvent, function () {
        self._updateTableCell(cellType, $elem, $td, $table);
      });
    }
    $elem.show().focus().select();
  };

  vendor[appName]._updateTableCell = function (cellType, $elem, $td, $table) {
    var self = this,
      newValue = typeof $elem !== 'undefined' ? $.trim($elem.val()) : '',
      originalValue = typeof $td.data('original-value') != 'undefined',
      oldValue = originalValue ? $td.data('original-value') : '',
      formula = typeof $td.data('formula') != 'undefined',
      editfile = typeof $td.attr('data-editfile') != 'undefined',
      tableId = $table.data('id'),
      history = $table.data('from-history'),
      period = $table.data('history-period'),
      dataTableInstance = this.getTableInstanceById(tableId),
      _ruleJS = this.getRuleJSInstance($table),
      cells = [];

    if (editfile) {
      newValue = encodeURI($td.attr('data-editfile'));
    }

    if (cellType == 'editable') {
      // Turn line breaks typed via Ctrl+Enter into real <br> tags for display and storage
      newValue = newValue.replace(/\r\n|\r|\n/g, '<br>');
    }

    if ($table.data('use-comma-as-delimiter') && newValue.toString().match(/^-{0,1}\d+\,{0,1}\d*$/)) {
      newValue = newValue.toString().replace(',', '.');
    }

    // Set formula value
    if (formula) {
      $td.data('formula', newValue);
      $td.attr('data-formula', newValue);
    }
    // Set original value for cells without formulas
    if (originalValue && !formula) {
      if (cellType == 'editable' && $td.data('cell-format-type') == 'percent') {
        newValue = this._preparePercentValue(newValue, $td.data('cell-format'), true);
      }
      // We need to update edited cell here for correct work of _ruleJS.init();
      $td.data('original-value', newValue);
      $td.attr('data-original-value', newValue);
      $td.data('order', newValue);
      $td.attr('data-order', newValue);
    }
    $elem.hide();
    if (editfile) {
      $td.html(decodeURI(newValue));
    } else {
      $td.html(newValue);
    }
    if ($table.data('mark-last-edited-cell')) {
      $table.parents('.supsystic-tables-wrap').find('th, td').removeClass('justEdited');
      $td.addClass('justEdited');
      setTimeout(function () {
        $td.removeClass('justEdited');
      }, 1500);
    }

    // Parse formulas
    _ruleJS.init();

    // Set data for edited cell
    var dbEditData = $table.closest('.supsystic-tables-wrap').find('.stbDBEditData'),
      dbTable = '',
      uniqFields = '',
      isDB = dbEditData.length;

    if (isDB) {
      if (originalValue && oldValue == newValue) {
        return;
      }
      if ($table.data('save-editable-fields') && $td.hasClass('editable')) {
        var error = dbEditData.data('error'),
          dbTable = dbEditData.data('table');
        if (error && error.length > 0) {
          alert(error);
        } else if (!dbTable || dbTable.length == 0) {
          alert('Table not found.');
        } else {
          var dbFields = dbEditData.data('fields'),
            uniqFields = dbEditData.data('unique-fields'),
            uniqData = dbEditData.data('unique-data'),
            fieldNum = $td.data('x'),
            rowNum = g_stbServerSideProcessing ? $td.data('db-index') : $td.data('y');
          if (fieldNum in dbFields && rowNum in uniqData) {
            cells.push({
              c: fieldNum,
              f: dbFields[fieldNum],
              r: rowNum,
              u: uniqData[rowNum],
              v: formula ? '=' + $td.data('formula') : newValue,
              ov: formula ? $.trim($td.html()) : newValue,
            });
          }
        }
      }
    } else {
      cells.push({
        c: $td.data('x'),
        r: $td.data('y'),
        v: formula ? '=' + $td.data('formula') : newValue,
        ov: formula ? $.trim($td.html()) : newValue,
      });
    }

    // Set original value for edited cell with formula
    // We need to set unformat value which we get after ruleJS init
    if (originalValue && formula) {
      var newOriginalValue = $.trim($td.html());

      $td.data('original-value', newOriginalValue);
      $td.attr('data-original-value', newOriginalValue);
      $td.data('order', newOriginalValue);
      $td.attr('data-order', newOriginalValue);
    }

    // Update other table cells before setting format to table
    $table.find('th, td').each(function (index, elem) {
      var $elem = $(elem);

      // Break if current cell is current edited cell
      if ($elem.data('x') == $td.data('x') && $elem.data('y') == $td.data('y')) return;

      var $elemValue = $.trim($elem.html()),
        $elemOrValue = $elem.data('original-value') || '',
        $elemFormula = $elem.data('formula') || '';

      if (!isDB && $elemFormula && $elemOrValue != $elemValue) {
        $elem.data('original-value', $elemValue);
        $elem.attr('data-original-value', $elemValue);
        $elem.data('order', $elemValue);
        $elem.attr('data-order', $elemValue);
        cells.push({
          c: $elem.data('x'),
          r: $elem.data('y'),
          v: $elemFormula ? '=' + $elemFormula : $elemValue,
          ov: $elemValue,
        });
      }
    });
    // Parse formulas again to correct calculation of formulas, which is dependent to the follow placed cells
    // TODO: find the way to check how many times we need to recalc formulas to get final result
    _ruleJS.init();

    // Set formats
    this.formatDataAtTable($table);

    //save formated values (need for export)
    $.each(cells, function (index, elem) {
      var cell = $table.find('[data-x="' + elem['c'] + '"][data-y="' + elem['r'] + '"]');
      if (cell.length == 1) {
        elem['fv'] = cell.data('editfile') ? encodeURI(cell.data('editfile')) : cell.html();
      }
    });

    // Update table sorting
    if (dataTableInstance && !g_stbServerSideProcessing) {
      $table.find('th, td').each(function () {
        dataTableInstance.api().cell($(this)).invalidate();
      });
      if (typeof dataTableInstance.fnAdjustColumnSizing == 'function') {
        dataTableInstance.fnAdjustColumnSizing(false);
      }
    }

    // Set conditional formatting
    this.setConditionalFormatting($table, true);

    if ($table.data('save-editable-fields') && cells.length > 0) {
      if (dtsCellChangeReqTimeout[tableId]) {
        clearTimeout(dtsCellChangeReqTimeout[tableId]);
      }
      dtsCellChangeReqTimeout[tableId] = setTimeout(function () {
        dtsCellEditLock[tableId]++;
        self
          .request(
            {
              module: 'tables',
              action: 'saveEditableFields',
              nonce: DTGS_NONCE_FRONTEND,
            },
            {
              id: tableId,
              isSSP: g_stbServerSideProcessing ? 1 : 0,
              isDB: isDB ? 1 : 0,
              dbTable: dbTable,
              uniqFields: JSON.stringify(uniqFields),
              cells: JSON.stringify(cells),
              history: history,
              period: period ? period : null,
            }
          )
          .always(function (responce) {
            if (isDB && responce) {
              if (responce.success) {
                var needSave = false,
                  uniqNum;

                for (var i = 0; i < cells.length; i++) {
                  uniqNum = $.inArray(cells[i].f, uniqFields);
                  if (uniqNum >= 0) {
                    uniqData[cells[i].r][uniqNum] = cells[i].v;
                    needSave = true;
                  }
                }
                if (needSave) {
                  dbEditData.data('unique-data', uniqData);
                }
              } else {
                alert(responce);
              }
            }
            dtsCellEditLock[tableId]--;
            dtsCellChangeReqTimeout[tableId] = false;
          });
      }, 400);
    }

    if (editfile) {
      $td.find('.delete-upload-file').show();
    }

    //Refresh diagrams
    if (typeof g_stbGoogleCharts != 'undefined' && g_stbGoogleCharts.length > 0) {
      for (var i = 0; i < g_stbGoogleCharts.length; i++) {
        if (g_stbGoogleCharts[i].chartData.table_id == tableId) {
          var rangeFrom = g_stbGoogleCharts[i].chartData.selection.from,
            rangeTo = g_stbGoogleCharts[i].chartData.selection.to,
            buffer;
          if (rangeFrom.row > rangeTo.row) {
            buffer = rangeFrom.row;
            rangeFrom.row = rangeTo.row;
            rangeTo.row = buffer;
          }
          if (rangeFrom.col > rangeTo.col) {
            buffer = rangeFrom.col;
            rangeFrom.col = rangeTo.col;
            rangeTo.col = buffer;
          }
          var firstCol = g_stbGoogleCharts[i].chartData.rangeData[0].length > rangeTo.col - rangeFrom.col + 1 ? 1 : 0;
          for (var c = 0; c < cells.length; c++) {
            var cell = cells[c];
            if (cell.r >= rangeFrom.row + 1 && cell.r <= rangeTo.row + 1 && cell.c >= rangeFrom.col && cell.c <= rangeTo.col) {
              var params = g_stbGoogleCharts[i].chartData.params,
                row = params.switchRowsColumns ? cell.c - rangeFrom.col : cell.r - rangeFrom.row - (params.useFirstRow ? 1 : 0), // - 1,
                col = params.switchRowsColumns ? cell.r - rangeFrom.row - (params.useFirstRow ? 1 : 0) : cell.c - rangeFrom.col + firstCol, //(params.useFirstColumn ? 0 :1),
                cellValue = cell.v.length > 0 && cell.v.substring(0, 1) == '=' ? cell.ov : cell.v,
                newVar = typeof g_stbGoogleCharts[i].chartData.rangeData[row][col] == 'string' ? cellValue : Number(cellValue) + 0;

              g_stbGoogleCharts[i].chartData.rangeData[row][col] = g_stbGoogleCharts[i].chartData.rangeData[row][col] === '' && row == 0 ? '' : newVar;
              drawCharts(g_stbGoogleCharts[i], i);
            }
          }
        }
      }
    }

    // refresh fixed columns
    if (typeof $table.data('fixed-cols') !== 'undefined') {
      var dataTableInstance = typeof $table.api == 'function' ? $table : self.getTableInstanceById($table.data('id'));
      dataTableInstance.api().fixedColumns().update();
    }
  };

  vendor[appName]._preparePercentValue = function (value, format, reverse) {
    reverse = reverse ? reverse : false;

    if (this.isNumber(value)) {
      var round = format.match(/\d+/g),
        index = round.length - 1,
        fixed = round[index] ? round[index].length : 0;

      value = reverse ? value / 100 : value * 100;

      return reverse ? value : value.toFixed(fixed);
    }
    return value;
  };

  vendor[appName]._getNextVisibleIndex = function ($elem, index) {
    if (index >= $elem.length) return -1;

    if (!$elem.eq(index).is(':visible')) {
      index++;
      index = this._getNextVisibleIndex($elem, index);
    }
    return index;
  };

  vendor[appName].initConditions = function (elem) {
    if (this.Editor && this.Editor._Conditions) {
      this.Editor.Conditions = new this.Editor._Conditions(elem, true);
    }
  };

  vendor[appName].setConditionalFormatting = function ($table, reinit) {
    // Apply conditional formatting
    reinit = reinit ? reinit : false;

    var self = this,
      tableWrapper = $table.parents('.supsystic-tables-wrap:first'),
      conditionsElem = tableWrapper.find('.stbConditionsData'),
      conditionsList = conditionsElem.data('conditions');

    if (typeof conditionsList == 'undefined' || conditionsList.length == 0) {
      return;
    }
    var cells = $table.data('responsive-mode') == 2 ? tableWrapper.find('.dataTables_scrollHead th, .dataTables_scrollFoot th, .dataTables_scrollBody td') : tableWrapper.find('th, td');

    if (!this.Editor.Conditions) {
      this.initConditions(conditionsElem);
    }
    cells.each(function () {
      self.applyConditionsToCell(this, conditionsList, tableWrapper, reinit);
    });
    if (!reinit) {
      $table.bind('column-visibility.dt draw.dt', function (e) {
        var tableWrapper = $table.parents('.supsystic-tables-wrap:first'),
          cells = $table.data('responsive-mode') == 2 ? tableWrapper.find('.dataTables_scrollHead th, .dataTables_scrollFoot th, .dataTables_scrollBody td') : tableWrapper.find('th, td');

        cells.each(function () {
          self.applyConditionsToCell(this, conditionsList, tableWrapper);
        });
      });
    }
  };

  vendor[appName].applyConditionsToCell = function (cell, conditionsList, tableWrapper, reinit) {
    cell = cell instanceof jQuery ? cell : $(cell);
    reinit = reinit ? reinit : false;

    var conditions = this.Editor.Conditions;

    if (reinit) {
      conditions.clearElemStyles(cell);
      this.setStylesToCell(cell);
    }
    conditions.setConditionToCell(cell.data('y') - 1, cell.data('x'), cell.data('original-value'), cell, conditionsList, tableWrapper);
  };

  vendor[appName].setCollapsibleCell = function ($table) {
    var self = this,
      features = $table.data('features');

    if ($table.has('.collapsibleCell').length && !$table.find('[class*="collapsibleRow_"]').length && toeInArray('paging', features) == -1) {
      var collapsibleIndex = Math.floor(Math.random() * 99999),
        collapsibleClass = 'collapsibleRow_' + collapsibleIndex,
        collapsibleGroupMain = true,
        hasFixedCols = $table.attr('data-fixed-cols') === 'on' || false,
        foundTr = hasFixedCols ? $(document).find('tr') : $table.find('tr');

      foundTr.each(function () {
        var row = $(this);

        if (row.find('.collapsibleCell').length) {
          row.addClass(collapsibleClass);
          if (collapsibleGroupMain) {
            var curCollapsibleClass = collapsibleClass;
            row.addClass('collapsibleRowMain');
            $(document).on('click', '.' + curCollapsibleClass + '.collapsibleRowMain', function () {
              var curRow = $(this);

              $(document)
                .find('.' + curCollapsibleClass + '.collapsibleRowMain')
                .toggleClass('collapsibleRowOpen');
              $(document)
                .find('.' + curCollapsibleClass + ':not(.collapsibleRowMain)')
                .toggleClass('collapsibleRowHide');

              if (curRow.hasClass('collapsibleRowOpen')) {
                curRow.trigger('collapsible.sup');
              }
            });
            collapsibleGroupMain = false;
          } else {
            row.addClass('collapsibleRowHide');
          }

          /* if merge cells by rows and it is collapsed we need hide next rows also */
          var trTds = row.find('td');
          trTds.each(function () {
            var td = $(this);
            if (parseInt(td.data('rowspan')) > 1) {
              for (var i = 1, n = parseInt(td.data('rowspan')); i < n; i++) {
                $table.find('td[data-x="' + parseInt(td.data('x')) + '"][data-y="' + (parseInt(td.data('y')) + i) + '"]').addClass('collapsibleCell');
              }
            }
          });
        } else {
          collapsibleIndex++;
          collapsibleClass = 'collapsibleRow_' + collapsibleIndex;
          collapsibleGroupMain = true;
        }
      });
      $table.on('search.dt', function (e) {
        if (g_stbServerSideProcessing) {
          g_stbServerSideProcessingIsActive = true;
        }
        var table = $(this),
          tableSelector = '#supsystic-table-' + table.data('view-id') + ' #supsystic-table-' + table.data('id');
        self.applyTableEventClb(self.searchEventPro, 50, tableSelector);
      });
    }
  };

  vendor[appName].setCollapsibleRow = function ($table) {
    var self = this,
      features = $table.data('features');

    if ($table.has('.collapsibleRow').length && !$table.find('[class*="collapsibleGroup_"]').length && toeInArray('paging', features) == -1) {
      var collapsibleIndex = Math.floor(Math.random() * 99999),
        collapsibleClass = 'collapsibleGroup_' + collapsibleIndex,
        hasFixedCols = $table.attr('data-fixed-cols') === 'on' || false,
        foundTr = hasFixedCols ? $(document).find('tr') : $table.find('tr'),
        currentGroupClass = null,
        groupState = null;

      foundTr.each(function () {
        var row = $(this),
          isCollapsibleHeader = row.find('.collapsibleRow').length,
          isClosedByDefault = row.find('.collapsibleRowClosed').length;

        if (isCollapsibleHeader) {
          row.addClass(collapsibleClass).addClass('collapsibleRowMain');
          if (!isClosedByDefault) {
            row.addClass('collapsibleRowOpen');
          }

          (function (curCollapsibleClass) {
            $(document).on('click', '.' + curCollapsibleClass + '.collapsibleRowMain', function () {
              var curRow = $(this);

              $(document)
                .find('.' + curCollapsibleClass + '.collapsibleRowMain')
                .toggleClass('collapsibleRowOpen');
              $(document)
                .find('.' + curCollapsibleClass + ':not(.collapsibleRowMain)')
                .toggleClass('collapsibleRowHide');

              if (curRow.hasClass('collapsibleRowOpen')) {
                curRow.trigger('collapsible.sup');
              }
            });
          })(collapsibleClass);

          currentGroupClass = collapsibleClass;
          groupState = isClosedByDefault ? 'closed' : 'open';
          collapsibleIndex++;
          collapsibleClass = 'collapsibleGroup_' + collapsibleIndex;
        } else if (groupState !== null && currentGroupClass !== null) {
          row.addClass(currentGroupClass);
          if (groupState === 'closed') {
            row.addClass('collapsibleRowHide');
          }
        }
      });

      $table.on('search.dt', function (e) {
        if (g_stbServerSideProcessing) {
          g_stbServerSideProcessingIsActive = true;
        }
        var table = $(this),
          tableSelector = '#supsystic-table-' + table.data('view-id') + ' #supsystic-table-' + table.data('id');
        self.applyTableEventClb(self.searchEventPro, 50, tableSelector);
      });
    }
  };

  vendor[appName].searchEventPro = function (tableSelector) {
    var table = $(tableSelector),
      searchInput = table.parents('.supsystic-tables-wrap').find('.dataTables_filter input[type="search"]');

    if (searchInput.length) {
      if (searchInput.val()) {
        table.find('.collapsibleRowMain').addClass('collapsibleRowOpen');
        table.find('.collapsibleRowHide').addClass('collapsibleSearchMode');
      } else {
        table.find('.collapsibleRowMain').removeClass('collapsibleRowOpen');
        table.find('.collapsibleRowHide').removeClass('collapsibleSearchMode');
      }
    }
  };

  vendor[appName].drawDiagramsInTable = function (tableSelector) {
    var table = $(tableSelector),
      tableWrapper = table.parents('.supsystic-tables-wrap:first'),
      $diagramsInTable = tableWrapper.find('.supsystic-table-diagram');

    // search.dt event triggers during first load of table, so drawCharts function may be not existed yet
    if ($diagramsInTable.length && typeof drawCharts == 'function') {
      drawCharts($diagramsInTable);
    }
  };

  vendor[appName].globalPageSearchClb = function (e) {
    // Tab, ArrowUp, ArrowLeft, ArrowRight, ArrowDown buttons
    if (toeInArray(e.keyCode || e.which, [9, 37, 38, 39, 40]) != -1) return false;

    var input = $(this),
      value = $.fn.dataTable.util.escapeRegex(input.val()),
      tables = vendor[appName].getAllTableInstances();

    if (tables.length) {
      for (var i = 0; i < tables.length; i++) {
        tables[i].api().search(value, false, false).draw();
      }
    }
  };

  vendor[appName]._beforeInitializeTable = function ($table) {
    this.setCollapsibleRow($table);
    // Add collapsible rows
    this.setCollapsibleCell($table);
  };

  vendor[appName]._beforeShowTable = function ($table) {
    var self = this;

    // Create tooltip cells
    this.setTooltipCell($table);
    this.setCollapsibleRow($table);
    if (g_stbServerSideProcessing) {
      // Add collapsible rows
      this.setCollapsibleCell($table);
    }

    //for empty first collapsible row
    $table.find('.collapsibleRowMain').each(function () {
      var row = $(this);
      if (row.height() < 28) {
        row.css('height', parseInt(row.find(':first-child').css('line-height')) + 16 + 'px');
      }
    });

    $table.on('column-visibility.dt page.dt search.dt collapsible.sup', function (e) {
      // Fix of displaying diagrams in the tables with next features: pagination, Automatic Column Hiding response mode, sorting.
      // Fix of displaying diagrams in the tables search results.
      if (e.namespace == 'dt' && toeInArray(e.type, ['page', 'search']) && g_stbServerSideProcessing) {
        g_stbServerSideProcessingIsActive = true;
      }
      var table = $(this),
        tableSelector = '#supsystic-table-' + table.data('view-id') + ' #supsystic-table-' + table.data('id');
      self.applyTableEventClb(self.drawDiagramsInTable, 50, tableSelector);
    });
    if (g_stbServerSideProcessing) {
      var tableSelector = '#supsystic-table-' + $table.data('view-id') + ' #supsystic-table-' + $table.data('id');
      self.applyTableEventClb(self.drawDiagramsInTable, 50, tableSelector);
    }

    // Set conditional formatting
    this.setConditionalFormatting($table);
  };

  vendor[appName].initTablesOnPage = function (id) {
    this._initTablesOnPagePro(id);
    this._initTablesOnPage(id);
  };

  vendor[appName]._initTablesOnPagePro = function (id) {
    var oneTable = typeof id != 'undefined',
      supsysticTables = $(oneTable ? '#supsystic-table-' + id + ':not(.dataTable)' : '.supsystic-table'),
      globalPageSearchInput = $('.supsystic-tables-global-page-search');

    // Set callbacks to table
    supsysticTables.each(function () {
      var $curTable = $(this),
        features = $curTable.data('features');

      $curTable.on('beforeInitializeTable', function () {
        if (globalPageSearchInput.length) {
          vendor[appName].setExtraConfig('searching', true);
        }
        vendor[appName]._beforeInitializeTable($curTable);
      });
      $curTable.on('beforeShowTable', function () {
        vendor[appName]._beforeShowTable($curTable);
        if (toeInArray('searching', features) == -1) {
          $('#supsystic-table-' + $curTable.data('id') + '_filter').remove();
        }
      });
    });
    if (oneTable) return;

    // Global Table Search
    if (globalPageSearchInput.length) {
      var focusOutEvent = (typeof $.browser != 'undefined' && $.browser.msie) || !!navigator.userAgent.match(/Trident\/7\./) ? 'focusout' : 'blur';
      globalPageSearchInput.on(focusOutEvent, function (e) {
        vendor[appName].globalPageSearchClb.call(this, e);
      });
      globalPageSearchInput.on('keydown', function (e) {
        var self = this;
        setTimeout(function () {
          vendor[appName].globalPageSearchClb.call(self, e);
        }, 10);
      });
    }
  };
})((window.supsystic = window.supsystic || {}), window.jQuery, window);
