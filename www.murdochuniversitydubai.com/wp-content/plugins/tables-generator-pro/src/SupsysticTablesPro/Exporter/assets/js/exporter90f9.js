(function ($, app, undefined) {
  $(document).ready(function () {
    // saving selected value of selects in the table cells for printing and exporting table
    $('.supsystic-tables-wrap .supsystic-table th select, .supsystic-table td select')
      .on('change', function () {
        var select = $(this),
          value = select.val(),
          options = select.find('option');

        options.removeAttr('selected');
        options.filter('[value="' + value + '"]').attr('selected', 'selected');
      })
      .trigger('change');
    app.initExportTable();
  });

  app.initExportTable = function () {
    $('.supsystic-tables-export .export-pdf').on('click', function (event) {
      event.preventDefault();
      var $this = $(this),
        params = {
          type: 'pdf',
          element: $this,
          href: $this.attr('href'),
          only_visible: $this.data('only-visible'),
          paper_size: $this.data('paper-size'),
          orientation: $this.data('orientation'),
          export_fonts: $this.data('export-fonts'),
          full_width: $this.data('full-width'),
        };
      stbExportTable(params, app);
      return false;
    });
    $('.supsystic-tables-export .export-email').on('click', function (event) {
      event.preventDefault();

      var $this = $(this),
        params = {
          type: 'email',
          only_visible: $this.data('only-visible'),
          element: $this,
        };
      stbExportTable(params, app);
    });
    $('.supsystic-tables-export .export-print').on('click', function (event) {
      event.preventDefault();

      var $this = $(this),
        params = {
          type: 'print',
          only_visible: $this.data('only-visible'),
          element: $this,
        };
      stbExportTable(params, app);
    });
    $('.supsystic-tables-export')
      .find('.export-xls, .export-xlsx, .export-csv, .export-json')
      .on('click', function (event) {
        var $this = $(this),
          onlyVisible = $this.data('only-visible') == 'on',
          sqlValues = $this.closest('div.supsystic-tables-wrap').find('table.supsystic-table').attr('data-sql-values'),
          isSql = typeof sqlValues != 'undefined',
          form;

        if (onlyVisible) {
          event.preventDefault();

          var tableWrapper = $this.closest('.supsystic-tables-wrap'),
            tableId = tableWrapper.find('.supsystic-table:first').data('id'),
            tableViewId = jQuery('#supsystic-table-' + tableId).data('view-id'),
            tableInstance = app.getTableInstanceByViewId(tableViewId),
            dTable = $('#supsystic-table-' + tableId + '[data-view-id="' + tableViewId + '"]'),
            visibleRows = [];
          //console.log(dTable.DataTable().$('td[data-x="0"]', {"filter":"applied", page: 'current'}));
          dTable.find('thead th[data-x="0"]').each(function () {
            var row = parseInt($(this).attr('data-y'));
            if (!isNaN(row)) {
              visibleRows.push(parseInt($(this).attr('data-y')));
            }
          });
          tableInstance
            .api()
            .$('td[data-x="0"]', { filter: 'applied', page: 'current' })
            .each(function () {
              var row = parseInt($(this).attr('data-y'));
              if (!isNaN(row)) {
                visibleRows.push(parseInt($(this).attr('data-y')));
              }
            });
          dTable.find('tfoot th[data-x="0"]').each(function () {
            var row = parseInt($(this).attr('data-y'));
            if (!isNaN(row)) {
              visibleRows.push(parseInt($(this).attr('data-y')));
            }
          });
        }
        if (onlyVisible || isSql) {
          form = $('<form method="post" action="' + $this.attr('href') + '"> ' + (onlyVisible ? '<input type="text" name="rows" value="' + JSON.stringify(visibleRows) + '">' : '') + (isSql ? '<input type="text" name="sql" value="">' : '') + '</form>');
          if (isSql) {
            form.find('input[name="sql"]').val(sqlValues);
          }
          form.hide().prependTo('body');
          form.submit();
          form.remove();
          return false;
        }
      });
  };
})(window.jQuery, window.supsystic.Tables);

function stbExportTable(params, app, clb) {
  params.useClonedId = false;

  var onlyVisible = params.only_visible == 'on' || g_stbServerSideProcessing,
    tableWrapper = params.element.closest('.supsystic-tables-wrap'),
    tableId = tableWrapper.find('.supsystic-table:first').data('id'),
    tableHtmlId = '#supsystic-table-' + tableId,
    tableElem = jQuery(tableHtmlId),
    tableViewId = tableElem.data('view-id'),
    tableViewHtmlId = '#supsystic-table-' + tableViewId,
    tableInstance = app.getTableInstanceByViewId(tableViewId),
    tableStyles = jQuery(tableViewHtmlId + '-css'),
    tableStylesHtml = '',
    clonedTableWrapper,
    clonedTableElem,
    clonedTableStyles,
    clonedTableStylesHtml = '',
    preparedTable,
    tableData,
    reinit = {
      info: false,
      searching: false,
      paging: false,
      scrollX: false,
      scrollY: '',
      fixedHeader: false,
      fixedColumns: false,
      responsive: false,
    };

  if (onlyVisible) {
    clonedTableWrapper = params.element.closest('.supsystic-tables-wrap').clone();
    clonedTableWrapper = _stbPrepareTableToExport(clonedTableWrapper, tableElem, params);
    if (tableStyles.length) {
      tableStylesHtml = tableStyles.get(0).outerHTML;
    }
    var caption = clonedTableWrapper.find(tableHtmlId + ' caption:first'),
      thead = clonedTableWrapper.find('.dataTables_scrollHead').length ? clonedTableWrapper.find('.dataTables_scrollHead thead:first').clone() : clonedTableWrapper.find(tableHtmlId + ' thead:first').clone(),
      tbody = clonedTableWrapper.find(tableHtmlId + ' tbody:first').clone(),
      tfoot = clonedTableWrapper.find('.dataTables_scrollFoot').length ? clonedTableWrapper.find('.dataTables_scrollFoot tfoot:first').clone() : clonedTableWrapper.find(tableHtmlId + ' tfoot:first').clone();
    clonedTableElem = clonedTableWrapper.find(tableHtmlId);
    clonedTableWrapper.find('.dataTables_wrapper').empty().append(clonedTableElem);
    clonedTableWrapper.find(tableHtmlId).empty().append(thead).append(tbody).append(tfoot);
    if (caption.length) {
      clonedTableWrapper.find(tableHtmlId).prepend(caption);
    }
    clonedTableWrapper.find(tableHtmlId).find('.stbColumnsSearchWrapper').remove();

    if (typeof app.WooProExportPrepare == 'function') {
      clonedTableWrapper = app.WooProExportPrepare(tableElem, clonedTableWrapper, params);
    }

    clonedTableWrapper.appendTo('body');
    preparedTable = _stbCollectTableData(clonedTableWrapper, params.export_fonts);
    tableData = preparedTable.get(0).outerHTML;
    clonedTableWrapper.remove();

    // Set table data to export
    switch (params.type) {
      case 'pdf':
        stbSetTableToPDF(tableStylesHtml + tableData, tableElem, params, app);
        break;
      case 'print':
        stbSetTableToPrint(tableData, tableStylesHtml);
        break;
      case 'email':
        stbSetTableToEmail(tableData, tableElem, tableStylesHtml, app);
        break;
      default:
        break;
    }
    if (typeof clb == 'function') {
      clb();
    }
  } else {
    // Create styles for cloned table
    if (tableStyles.length) {
      clonedTableStyles = tableStyles.clone();

      var clonedTableStylesText = clonedTableStyles.text(),
        stylesRegExp = new RegExp(tableHtmlId, 'gm');

      clonedTableStyles.attr('id', clonedTableStyles.attr('id') + '_clone');
      clonedTableStyles.appendTo('head');
      clonedTableStylesText = clonedTableStylesText.replace(stylesRegExp, tableHtmlId + '_clone');
      clonedTableStyles.text(clonedTableStylesText);
      clonedTableStylesHtml = clonedTableStyles.get(0).outerHTML;
    }
    // Reinit table with params for export
    tableInstance.api().destroy();
    app.removeTableInstanceByViewId(tableViewId);

    // Clone table wrapper and hide the table
    clonedTableWrapper = params.element.closest('.supsystic-tables-wrap').clone();
    clonedTableWrapper.attr('id', clonedTableWrapper.attr('id') + '_clone');
    clonedTableWrapper.find(tableHtmlId).attr('id', clonedTableWrapper.find(tableHtmlId).attr('id') + '_clone');
    params.useClonedId = true;
    clonedTableWrapper = _stbPrepareTableToExport(clonedTableWrapper, tableElem, params);
    clonedTableWrapper.insertBefore(tableViewHtmlId);
    tableWrapper.hide();

    // We can not correctly initialized Data Table with already merged cells / columns. It will be done during table initialization.
    clonedTableWrapper.find('th, td').removeAttr('rowspan colspan');
    tableWrapper.find('th, td').removeAttr('rowspan colspan');
    // We need set origin values for formulas
    tableWrapper.find('td[data-original-value]').each(function () {
      var $this = jQuery(this);
      $this.html($this.attr('data-original-value'));
    });
    clonedTableElem = clonedTableWrapper.find(tableHtmlId + '_clone');
    if (typeof app.WooProExportPrepare == 'function') {
      clonedTableWrapper = app.WooProExportPrepare(tableElem, clonedTableWrapper, params);
    }
    app.initializeTable(
      clonedTableElem,
      app.showTable,
      function (table) {
        table.find('.stbColumnsSearchWrapper').remove();
        table.append(table.find('thead'));
        table.append(table.find('tbody'));
        table.append(table.find('tfoot'));
        // After table init complete - collect table date for export
        preparedTable = _stbCollectTableData(table.parents('.supsystic-tables-wrap:first'), params.export_fonts);
        preparedTable.show();
        preparedTable.find('.tblEditLink').remove();
        tableData = preparedTable.get(0).outerHTML;

        // Remove cloned wrapper and show table
        //table.api().destroy();
        if (clonedTableStyles && clonedTableStyles.length) {
          clonedTableStyles.remove();
        }
        clonedTableWrapper.remove();
        tableWrapper.show();

        // Reitin table again with original params
        app.initializeTable(tableElem, app.showTable, function (table) {
          table.find('tfoot').appendTo(table);
          if (typeof app.getTableInstanceById(table.data('id')).fnAdjustColumnSizing == 'function') {
            setTimeout(function () {
              app.getTableInstanceById(table.data('id')).fnAdjustColumnSizing();
            }, 350);
          }
        });
        // Set table data to export
        switch (params.type) {
          case 'pdf':
            stbSetTableToPDF(clonedTableStylesHtml + tableData, tableElem, params, app);
            break;
          case 'print':
            stbSetTableToPrint(tableData, clonedTableStylesHtml);
            break;
          case 'email':
            stbSetTableToEmail(tableData, tableElem, clonedTableStylesHtml, app);
            break;
          default:
            break;
        }
        if (typeof clb == 'function') {
          clb();
        }
      },
      reinit,
      false
    );
  }
}
function _stbPrepareTableToExport(clonedTableWrapper, tableElem, params) {
  var tableId = tableElem.data('id'),
    sufix = params.useClonedId ? '_clone' : '',
    tableHtmlId = '#supsystic-table-' + tableId + sufix;

  if (params.type == 'pdf') {
    clonedTableWrapper = stbRemoveHiddenRows(clonedTableWrapper);
  }
  if (tableElem.data('responsive-mode') == 0 && tableElem.data('auto-index') == 'new') {
    // Responsive Mode: Standart Responsive Mode
    clonedTableWrapper.find(tableHtmlId + ' th:first-child, td:first-child').css({ width: '' });
  }
  clonedTableWrapper.find(tableHtmlId).data('responsive-mode', 3);

  if (tableElem.hasClass('collapsed')) {
    clonedTableWrapper.find(tableHtmlId).removeClass('collapsed');
  }
  if (tableElem.hasClass('oneColumn')) {
    clonedTableWrapper.find(tableHtmlId).removeClass('oneColumn');
  }
  if (tableElem.hasClass('oneColumnWithLabels')) {
    clonedTableWrapper.find(tableHtmlId).removeClass('oneColumnWithLabels');
  }
  if (clonedTableWrapper.find('.supsystic-table-caption:first').length) {
    clonedTableWrapper.find('caption').remove();
  }
  clonedTableWrapper.find('.collapsibleRowMain').removeClass('collapsibleRowMain');
  clonedTableWrapper.find('.collapsibleRowHide').removeClass('collapsibleRowHide');
  return clonedTableWrapper;
}
function stbRemoveHiddenRows(tableWrapper) {
  // remove all hidden rows because of DOMPdf error during convert table to PDF
  tableWrapper.find('tr').each(function () {
    var row = jQuery(this);

    if (row.find('td').length && row.find('.invisibleCell').length && row.find('td').length === row.find('.invisibleCell').length) {
      row.remove();
    }
  });
  return tableWrapper;
}
var emailOperationInProgress = false;
function stbSetTableToEmail(tableData, tableElem, clonedTableStylesHtml, app) {
  if (!emailOperationInProgress) {
    emailOperationInProgress = true;
    tableData = jQuery(tableData);
    tableData.find('video').css('max-width', '100%');
    url = window.ajaxurl ? window.ajaxurl : ajax_obj.ajaxurl;

    var formData = new FormData();
    formData.append('route[module]', 'tables');
    formData.append('route[action]', 'sendTableToEmail');
    formData.append('action', 'supsystic-tables');

    //var tableId = tableElem.table_id.toString();
    var tableId = tableElem.data('id');
    formData.append('tableId', tableId);

    var tableHtml = tableData.get(0).outerHTML;
    // tableHtml = encodeURIComponent(window.btoa(tableHtml));
    formData.append('table', tableHtml);

    jQuery('*').css({ cursor: 'wait' });
    app
      .request(
        {
          module: 'tables',
          action: 'sendTableToEmail',
        },
        {
          tableId: tableId,
          table: tableHtml,
        }
      )
      .always(function (response) {
        if (response.success) {
          jQuery('.dtsFrontendExportNotice').fadeIn().delay(3000).fadeOut();
          jQuery('body').find('.dtsFrontendExportNotice').html(response.answer);
          jQuery('.export-email').append('<span class="email-timer-wrap">(</span><span class="email-timer">10</span><span class="email-timer-wrap">)</span>');
          let timerId = setInterval(function () {
            var timeEl = jQuery('body').find('.email-timer');
            var timeHtml = Number.parseInt(timeEl.html()) - 1;
            timeEl.html(timeHtml);
          }, 1000);
          setTimeout(function () {
            clearInterval(timerId);
            jQuery('.email-timer').remove();
            jQuery('.email-timer-wrap').remove();
            emailOperationInProgress = false;
          }, 10000);
        } else {
          jQuery('.dtsFrontendExportNotice').fadeIn().delay(3000).fadeOut();
          jQuery('.dtsFrontendExportNotice').html(response);
          emailOperationInProgress = false;
        }
      })
      .done(function () {
        jQuery('*').css({ cursor: '' });
      });
  }
}
function stbSetTableToPrint(tableData, clonedTableStylesHtml) {
  var windowUrl = 'about:blank',
    uniqueName = new Date(),
    windowName = 'Print' + uniqueName.getTime(),
    printWindow = window.open(windowUrl, windowName);
  tableData = jQuery(tableData);
  tableData.find('video').css('max-width', '100%');

  printWindow.document.write('<html><head><title></title>');
  printWindow.document.write(clonedTableStylesHtml);
  printWindow.document.write('</head><body >');
  printWindow.document.write(tableData.get(0).outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    return false;
  };
  //_nodesLoadComplete(printWindow.document);	//unneeded now because printWindow.onload is using
}
function stbSetTableToPDF(tableData, tableElem, params, app) {
  var title = tableElem.data('title'),
    columns = tableElem.find('tr:first th').length,
    tableDataArr = [],
    preparedTableData = '',
    formRowsInputs = '',
    maxLength = 200000,
    form;

  // Create form with table data and export params
  if (tableData.length > maxLength) {
    while (tableData.length > maxLength) {
      var newStr = tableData.substr(0, maxLength);

      tableDataArr.push(newStr);
      tableData = tableData.replace(newStr, '');
    }
    tableDataArr.push(tableData);
    for (var i = 0; i < tableDataArr.length; i++) {
      tableDataArr[i] = app.Base64.encode(tableDataArr[i]);
    }
    preparedTableData = tableDataArr;
  } else {
    preparedTableData = app.Base64.encode(tableData);
  }
  if (typeof preparedTableData == 'object') {
    for (var j = 0; j < preparedTableData.length; j++) {
      formRowsInputs += '<input type="text" name="pdf-table-data[' + j + ']" value="' + preparedTableData[j] + '">';
    }
  } else {
    formRowsInputs = '<input type="text" name="pdf-table-data" value="' + preparedTableData + '">';
  }
  form = jQuery(
    '<form method="post" action="' +
      params.href +
      '"> ' +
      formRowsInputs +
      '<input type="text" name="title" value="' +
      title +
      '">' +
      '<input type="text" name="columns" value="' +
      columns +
      '">' +
      '<input type="text" name="paper_size" value="' +
      params.paper_size +
      '">' +
      '<input type="text" name="orientation" value="' +
      params.orientation +
      '">' +
      '<input type="text" name="export_fonts" value="' +
      params.export_fonts +
      '">' +
      '<input type="text" name="full_width" value="' +
      params.full_width +
      '">' +
      '</form>'
  );
  // Add form in page and submit
  form.hide().prependTo('body');
  form.submit();
  form.remove();
}
function _stbCollectTableData($tableWrapper, exportFont) {
  var rules = exportFont == 'on' ? ['font-family'] : [];

  jQuery.each($tableWrapper.find('img'), function () {
    var $img = jQuery(this),
      $td = $img.closest('td'),
      tdWidth = $td.width(),
      tdHeight = $td.height(),
      imgSize = _getOriginalImgSize(this);

    if ((tdHeight && imgSize.height > tdHeight) || (tdWidth && imgSize.width > tdWidth)) {
      $img.attr('data-max-width', tdWidth);
      $img.attr('data-max-height', tdHeight);
    }
  });
  $tableWrapper.find('table, tr, td, th').each(function (index, el) {
    var $el = jQuery(el),
      style = $el.attr('style') || '';

    $el.attr('data-style', style + _getElemInlineStyles($el, rules));
  });

  var $tableClone = $tableWrapper.clone(),
    $table = $tableClone.find('.supsystic-table'),
    $styles = jQuery('link#supsystic-tables-shortcode-css-css, link#supsystic-tables-shortcode-pro-css').clone().prependTo($tableClone),
    tableCaptionStyle = _getElemInlineStyles($tableWrapper.find('.supsystic-table > caption', rules)),
    orientation = $table.find('tr:first th').length > 3 ? 'landscape' : 'portrait',
    logoData = $table.attr('data-export-logo');

  jQuery('' + '<style type="text/css">' + '@media print{@page { size: ' + orientation + '; }}' + '* {-webkit-print-color-adjust: exact;}' + 'table.supsystic-table {width: 100%}' + 'table.supsystic-table img { max-width:none; max-height:none; }' + '</style>').insertAfter($styles.last());

  jQuery('#sdbTableStyles_' + $table.data('view-id'))
    .clone()
    .insertAfter($styles.last());

  $tableClone.css('width', '100%');
  // #465
  if ($tableClone.find('table.supsystic-table').length) {
    $tableClone.find('table.supsystic-table').css('width', '100%');
  }
  $tableClone.find('.supsystic-tables-features, .inputArea, .dataTables_filter').remove();
  $tableClone.find('[data-max-width]').each(function () {
    var $img = jQuery(this);

    $img.css({
      'max-width': $img.attr('data-max-width') + 'px',
      width: $img.attr('data-max-width') + 'px',
      'max-height': $img.attr('data-max-height') + 'px',
    });
  });
  $tableClone.find('.supsystic-table > caption').attr('style', tableCaptionStyle);
  $tableClone.find('table, tr, td, th').each(function (index, el) {
    var $el = jQuery(el);

    $el.attr('style', $el.attr('data-style'));
    $el.removeAttr('data-original-value data-style data-x data-y');
  });

  var totalTr = $tableClone.find('tbody tr').length;

  $tableClone.find('tbody tr.haveMergedCell').each(function (index, el) {
    var $el = jQuery(el),
      tds = $el.find('td[rowspan]:not([data-hide])');

    tds.each(function () {
      var rowspan = parseInt(jQuery(this).attr('rowspan')),
        row = jQuery(this).get(0).parentElement.rowIndex;
      if (rowspan > totalTr - row + 1) {
        jQuery(this).attr('rowspan', totalTr - row + 1);
      }
    });
  });

  if (logoData) {
    logoData = JSON.parse(logoData);

    var $img = jQuery('<img>', { src: logoData.src })
      .css({
        'max-width': '100%',
      })
      .wrap('<div>')
      .parent()
      .css({
        width: '100%',
        'text-align': logoData.alignment,
        margin: '10px 0',
      });

    if (logoData.position == 'top') {
      $img.prependTo($tableClone);
    } else {
      $img.appendTo($tableClone);
    }
  }

  return $tableClone;
}
function _getElemInlineStyles(el, rules) {
  rules = rules || [];

  var style = [],
    rulesList = [
      'background-color',
      'border-bottom-color',
      'border-bottom-style',
      'border-bottom-width',
      'border-left-color',
      'border-left-style',
      'border-left-width',
      'border-right-color',
      'border-right-style',
      'border-right-width',
      'border-top-color',
      'border-top-style',
      'border-top-width',
      //'border-bottom',
      //'border-left',
      //'border-right',
      //'border-top',
      'color',
      'font-size',
      'font-weight',
      'font-style',
      'line-height',
      'margin-bottom',
      'margin-left',
      'margin-right',
      'margin-top',
      'max-width',
      'overflow',
      'padding-bottom',
      'padding-left',
      'padding-right',
      'padding-top',
      'text-align',
      'text-decoration',
      'text-shadow',
      'text-transform',
      'vertical-align',
      'white-space',
    ].concat(rules);

  for (var i = rulesList.length - 1; i >= 0; i--) {
    var rule = rulesList[i],
      value = el.css(rule);

    if (typeof value !== 'undefined' && value.length) {
      if (rule == 'background-color' && (value === 'rgba(0, 0, 0, 0)' || value === 'transparent')) {
        continue;
      }
      if (value === '0px' || value === 'none') {
        continue;
      }
      // exclude this example "text-decoration: none solid rgb(26, 26, 26)"
      if (typeof value === 'string' && value.trim().indexOf('none') == 0) {
        continue;
      }
      style.push(rule + ':' + value + ' !important;');
    }
  }

  return style.join('');
}
function _getOriginalImgSize(img) {
  var image = new Image();
  image.src = (img.getAttribute ? img.getAttribute('src') : false) || img.src;
  return {
    width: image.width,
    height: image.height,
  };
}
function _nodesLoadComplete(node, cb) {
  var $nodes = jQuery(node).find('style, img'),
    nodesCount = $nodes.length;

  if (nodesCount === 0) {
    cb();
  }
  $nodes.on('load', function () {
    nodesCount--;
    if (nodesCount === 0) {
      cb();
    }
  });
}
