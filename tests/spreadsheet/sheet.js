(function() {
    var sheet;
    var defaults = kendo.ui.Spreadsheet.prototype.options;
    var success = $.proxy(ok, null, true);
    var failure = $.proxy(ok, null, false);

    module("Sheet API", {
        setup: function() {
            sheet = new kendo.spreadsheet.Sheet(defaults.rows, defaults.columns,
            defaults.rowHeight, defaults.columnWidth);
        }
    });

    test("rowHeight sets the height of the specified row", function() {
        sheet.rowHeight(0, 100);

        equal(sheet._grid._rows.values.iterator(0, 0).at(0), 100);
    });

    test("rowHeight returns the height of the specified row", function() {
        equal(sheet.rowHeight(0), defaults.rowHeight);
    });

    test("columnWidth sets the width of the specified column", function() {
        sheet.columnWidth(0, 100);

        equal(sheet._grid._columns.values.iterator(0, 0).at(0), 100);
    });

    test("columnWidth returns the width of the specified column", function() {
        equal(sheet.columnWidth(0), defaults.columnWidth);
    });

    test("range returns a Range object by row and col index", function() {
        ok(sheet.range(0, 0) instanceof kendo.spreadsheet.Range);
    });

    test("range returns a Range object by A1 reference", function() {
        var range = sheet.range("A1:B1");
        ok(range instanceof kendo.spreadsheet.Range);
        equal(range._ref.topLeft.row, 0);
        equal(range._ref.topLeft.col, 0);
        equal(range._ref.bottomRight.col, 1);
        equal(range._ref.bottomRight.row, 0);
    });

    test("rowHeight triggers the change event", 1, function() {
       sheet.bind("change", success).rowHeight(0, 0);
    });

    test("columnWidth triggers the change event", 1, function() {
       sheet.bind("change", success).columnWidth(0, 0);
    });

    test("hideColumn triggers the change event", 1, function() {
       sheet.bind("change", success).hideColumn(0);
    });

    test("hideRow triggers the change event", 1, function() {
       sheet.bind("change", success).hideRow(0);
    });

    test("unhideColumn triggers the change event", 1, function() {
       sheet.bind("change", success).unhideColumn(0);
    });

    test("unhideRow triggers the change event", 1, function() {
       sheet.bind("change", success).unhideRow(0);
    });

    test("frozenRows triggers the change event", 1, function() {
       sheet.bind("change", success).frozenRows(2);
    });

    test("frozenColumns triggers the change event", 1, function() {
       sheet.bind("change", success).frozenColumns(2);
    });

    test("select triggers the change event", 1, function() {
       sheet.bind("change", success).range("A1:A1").select();
    });

    test("triggerChange triggers the change event", 1, function() {
       sheet.bind("change", success).triggerChange();
    });

    test("triggerChange doesn't trigger the change event if changes are suspended", 0, function() {
       sheet.bind("change", failure).suspendChanges(true).triggerChange();
    });

    test("deleteRow triggers the change event", 1, function() {
       sheet.bind("change", success).deleteRow(0);
    });

    test("deleteRow move the bottom row values to the deleted one", function() {
        sheet.range("2:2").value("foo");

        sheet.deleteRow(0);

        equal(sheet.range("1:1").value(), "foo");
        equal(sheet.range("2:2").value(), null);
    });

    test("deleteRow move the bottom row background to the deleted one", function() {
        sheet.range("2:2").background("foo");

        sheet.deleteRow(0);

        equal(sheet.range("1:1").background(), "foo");
        equal(sheet.range("2:2").background(), null);
    });

    test("deleteRow deleting frozen row makes frozen row pane smaller", function() {
        sheet.frozenRows(3);

        sheet.deleteRow(0);

        equal(sheet.frozenRows(), 2);
    });

    test("deleteRow deleting last frozen row does makes frozen row pane smaller", function() {
        sheet.frozenRows(3);

        sheet.deleteRow(2);

        equal(sheet.frozenRows(), 2);
    });

    test("deleteRow deleting first non-frozen row does not make frozen row pane smaller", function() {
        sheet.frozenRows(3);

        sheet.deleteRow(3);

        equal(sheet.frozenRows(), 3);
    });

    test("deleteRow deleting non-frozen row does not make frozen row pane smaller", function() {
        sheet.frozenRows(3);

        sheet.deleteRow(4);

        equal(sheet.frozenRows(), 3);
    });

    test("insertRow frozen row expands frozen rows pane", function() {
        sheet.frozenRows(3);

        sheet.insertRow(0);

        equal(sheet.frozenRows(), 4);
    });

    test("insertRow non-frozen row does not expand frozen rows pane", function() {
        sheet.frozenRows(3);

        sheet.insertRow(3);

        equal(sheet.frozenRows(), 3);
    });

    test("insertRow move the data bottom row", function() {
        sheet.range("1:1").value("foo");

        sheet.insertRow(0);

        equal(sheet.range("1:1").value(), null);
        equal(sheet.range("2:2").value(), "foo");
    });

    test("insertRow at the last position", function() {
        sheet.range(defaults.rows + ":" + defaults.rows).value("foo");

        sheet.insertRow(defaults.rows - 1);

        equal(sheet.range(defaults.rows + ":" + defaults.rows).value(), null);
    });

    test("insertRow triggers the change event", 1, function() {
       sheet.bind("change", success).insertRow(0);
    });

    test("deleteColumn triggers the change event", 1, function() {
       sheet.bind("change", success).deleteColumn(0);
    });

    test("deleteColumn moves the next column values to the deleted one", function() {
        sheet.range("B:B").value("foo");

        sheet.deleteColumn(0);

        equal(sheet.range("A:A").value(), "foo");
        equal(sheet.range("B:B").value(), null);
    });

    test("insertColumn triggers the change event", 1, function() {
       sheet.bind("change", success).insertColumn(0);
    });

    test("deleteColumn frozen column collapse frozen columns pane", function() {
        sheet.frozenColumns(3);

        sheet.deleteColumn(0);

        equal(sheet.frozenColumns(), 2);
    });

    test("deleteColumn non-frozen column does not collapse frozen columns pane", function() {
        sheet.frozenColumns(3);

        sheet.deleteColumn(3);

        equal(sheet.frozenColumns(), 3);
    });

    test("insertColumn frozen column expands frozen columns pane", function() {
        sheet.frozenColumns(3);

        sheet.insertColumn(0);

        equal(sheet.frozenColumns(), 4);
    });

    test("insertColumn non-frozen column does not expand frozen columns pane", function() {
        sheet.frozenColumns(3);

        sheet.insertColumn(3);

        equal(sheet.frozenColumns(), 3);
    });

    test("insertColumn clears the column and move the data to the right", function() {
        sheet.range("A:A").value(1);
        sheet.range("B:B").value(2);

        sheet.insertColumn(0);

        equal(sheet.range("A:A").value(), null);
        equal(sheet.range("B:B").value(), 1);
        equal(sheet.range("C:C").value(), 2);
    });

})();
