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
      var             dataModel;
      var             rowData;
      var             selectedUser;
      var             fsm;

      // If there's a cellInfo object provided, we're editing an existing
      // user. Get the row data. Otherwise, we're adding a new user.
      if (cellInfo && cellInfo.row)
      {
        dataModel = cellInfo.table.getTableModel();
        rowData = dataModel.getRowData(cellInfo.row);
        selectedUser = rowData[0];
      }
      
      var layout = new qx.ui.layout.Grid(9, 2);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnWidth(0, 80);
      layout.setColumnWidth(1, 400);
      layout.setSpacing(10);

      // Create the cell editor window, since we need to return it immediately
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
      rowData && name.setValue(rowData[0]);
      cellEditor.add(name, { row : 0, column : 1 });
      
      // Create the editor field for the email address
      var email = new qx.ui.form.TextField(this.tr("Email"));
      rowData && email.setValue(rowData[1]);
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
          if (rowData && stat.internal == rowData[3])
          {
            status.setSelection( [ item ] );
          }
        });
      
      cellEditor.add(status, { row : 3, column : 1 });
      
      // Save the input fields for access by getCellEditorValue() and the FSM
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

      // Retrieve the finite state machine
      fsm = cellInfo.table.getUserData("fsm");

      var okButton =
        new qx.ui.form.Button("Ok", "icon/22/actions/dialog-apply.png");
      okButton.addState("default");
      fsm.addObject("ok", okButton);
      okButton.addListener("execute", fsm.eventListener, fsm);
      buttonPane.add(okButton);

      var cancelButton =
        new qx.ui.form.Button("Cancel", "icon/22/actions/dialog-cancel.png");
      fsm.addObject("cancel", cancelButton);
      cancelButton.addListener("execute", fsm.eventListener, fsm);
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
