/**
 * Cell editor for all cells of the Users table
 *
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * A cell editor factory for Users (all fields)
 */
qx.Class.define("aiagallery.module.mgmt.users.CellEditorFactory",
{
  extend    : qx.core.Object,
  implement : qx.ui.table.ICellEditorFactory,
  include   : [ qx.locale.MTranslation ],

  members :
  {
    // overridden
    createCellEditor : function(cellInfo)
    {
      var             i;
      var             o;
      var             cellEditor;

      // Get the row data
      var dataModel = cellInfo.table.getTableModel();
      var rowData = dataModel.getRowData(cellInfo.row);
      
      var layout = new qx.ui.layout.Grid(9, 2);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnWidth(0, 80);
      layout.setColumnWidth(1, 400);
      layout.setSpacing(10);

      // Create the cell editor window, since we need to return it immediately
      var selectedUser = rowData[0];
      cellEditor =
        new qx.ui.window.Window(this.tr("Edit User: ") + selectedUser);
      cellEditor.setLayout(layout);
      cellEditor.set(
        {
          width: 600,
          modal: true,
          showClose: false,
          showMaximize: false,
          showMinimize: false,
          padding : 10
        });
      cellEditor.addListener(
        "resize",
        function(e)
        {
          this.center();
        });

      // Save the cell info.  We'll need it when the cell editor closes.
      cellEditor.setUserData("cellInfo", cellInfo);

      // Add the form field labels
      i = 0;

      [
        this.tr("Name"),
        this.tr("Email"),
        this.tr("Permissions"),
        this.tr("Status")
      ].forEach(function(label)
        {
          o = new qx.ui.basic.Label(label);
          o.set(
            {
              allowShrinkX: false,
              paddingTop: 3
            });
          cellEditor.add(o, {row: i++, column : 0});
        });

      // Create the editor field for the user name
      var name = new qx.ui.form.TextField(this.tr("Name"));
      name.setValue(rowData[0]);
      cellEditor.add(name, { row : 0, column : 1 });
      
      // Create the editor field for the email address
      var email = new qx.ui.form.TextField(this.tr("Email"));
      email.setValue(rowData[1]);
      cellEditor.add(email, { row : 1, column : 1 });
      
      // Create the editor field for permissions
      var permissions = new qx.ui.form.List();
      permissions.setHeight(140);
      permissions.setSelectionMode("multi");

      [
        { i8n: this.tr("VISITOR ADD"),    internal: "VISITOR ADD" },
        { i8n: this.tr("VISITOR DELETE"), internal: "VISITOR DELETE" },
        { i8n: this.tr("VISITOR VIEW"),   internal: "VISITOR VIEW" },
        { i8n: this.tr("TAG ADD"),        internal: "TAG ADD" },
        { i8n: this.tr("TAG DELETE"),     internal: "TAG DELETE" },
        { i8n: this.tr("TAG VIEW"),       internal: "TAG VIEW" }
      ].forEach(function(perm) 
        {
          var item = new qx.ui.form.ListItem(perm.i8n);
          item.setUserData("internal", perm.internal);
          permissions.add(item);
        });
      
      cellEditor.add(permissions, { row : 2, column : 1 });

      var status = new qx.ui.form.SelectBox();

      [
        { i8n: this.tr("Active"),  internal: "Active" },
        { i8n: this.tr("Pending"), internal: "Pending" },
        { i8n: this.tr("Banned"),  internal: "Banned" }
      ].forEach(function(stat) 
        {
          var item = new qx.ui.form.ListItem(stat.i8n);
          item.setUserData("internal", stat.internal);
          status.add(item);
          
          // Is this the current status?
          if (stat.internal == rowData[3])
          {
            status.setSelection( [ item ] );
          }
        });
      
      cellEditor.add(status, { row : 3, column : 1 });
      
      // Save the input field for access by getCellEditorValue()
      cellEditor.setUserData("name", name);
      cellEditor.setUserData("email", email);
      cellEditor.setUserData("permissions", permissions);
      cellEditor.setUserData("status", status);

      // buttons
      var paneLayout = new qx.ui.layout.HBox();
      paneLayout.set(
        {
          spacing: 4,
          alignX : "right"
        });
      var buttonPane = new qx.ui.container.Composite(paneLayout);
      buttonPane.set(
        {
          paddingTop: 11
        });
      cellEditor.add(buttonPane, {row:5, column: 0, colSpan: 2});

      var okButton =
        new qx.ui.form.Button("Ok", "icon/22/actions/dialog-apply.png");
      okButton.addState("default");
      okButton.addListener(
        "execute",
        function(e)
        {
          var selection;
          var columnData;

          var newData =
            [
              this.getUserData("name").getValue(),
              this.getUserData("email").getValue()
            ];

          // Add a joining of the selected permission names
          selection = this.getUserData("permissions").getSelection();
          columnData = [];
          selection.forEach(
            function(item)
            {
              columnData.push(item.getLabel());
            });
          newData.push(columnData.join(", "));

          // Add the status selection
          var statusSel = this.getUserData("status");
          newData.push(statusSel.getSelection()[0].getLabel());

          // Set this row's new data
          dataModel.setRows( [ newData ], cellInfo.row, false);
          
          // Save the data for the getCellEditorValue() method
          this.setUserData("newData", newData);

          // We can close the modal window now
          this.close();
        },
        cellEditor);
      buttonPane.add(okButton);

      var cancelButton =
        new qx.ui.form.Button("Cancel", "icon/22/actions/dialog-cancel.png");
        cancelButton.addListener(
          "execute",
          function(e)
          {
            this.getUserData("cellInfo").table.cancelEditing();
            this.close();
          },
          cellEditor);
      buttonPane.add(cancelButton);

      return cellEditor;
    },

    // overridden
    getCellEditorValue : function(cellEditor)
    {
      var newData = cellEditor.getUserData("newData");
      return newData[cellEditor.getUserData("cellInfo").col];
    }
  }
});
