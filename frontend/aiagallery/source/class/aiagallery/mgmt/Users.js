/**
 * User Management
 *
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#asset(aiagallery/*)
*/

qx.Class.define("aiagallery.mgmt.Users",
{
  extend : qx.ui.tabview.Page,
  
  construct : function(app)
  {
    var rowData;

    // Call the superclass constructor
    this.base(arguments, this.tr("Users"));

    // Are we in test mode?
    if (app.getTestMode())
    {
      // Yup Randomly generate a whole bunch of rows
      rowData =
        (function(rowCount) 
         {
           var data = [];
           for (var row = 1; row <= rowCount; row++) 
           {
             var r = Math.random();
             var status =
               (r < 0.1 ? 
                qx.locale.Manager.tr("Banned") :
                (r < 0.3 
                 ? qx.locale.Manager.tr("Pending") 
                 : qx.locale.Manager.tr("Active")));

             data.push(
               [
                 qx.locale.Manager.tr("User #") + row,
                 "user" + row + "@gmail.com",
                 "",
                 status
               ]);
           }

           return data;
         })(500);
    }
    else
    {
      // Live mode. Retrieve data from the backend.
      rowData = [];
    }

    // Create a layout for this page
    this.setLayout(new qx.ui.layout.VBox());

    // We'll left-justify some buttons in a button row
    var layout = new qx.ui.layout.HBox();
    layout.setSpacing(10);
    var hBox = new qx.ui.container.Composite(layout);

    // Create an Edit button
    var edit = new qx.ui.form.Button(this.tr("Edit"));
    edit.set(
      {
        maxHeight : 24,
        width     : 100,
        enabled   : false
      });
    hBox.add(edit);

    // Create an Add User button
    var addUser = new qx.ui.form.Button(this.tr("Add New User"));
    addUser.set(
      {
        maxHeight : 24,
        width     : 100
      });
    hBox.add(addUser);

    // Now right-justify the Delete button
    hBox.add(new qx.ui.core.Widget(), { flex : 1 });

    // Create a Delete button
    var deleteUser = new qx.ui.form.Button(this.tr("Delete"));
    deleteUser.set(
      {
        maxHeight : 24,
        width     : 100,
        enabled   : false
      });
    hBox.add(deleteUser);

    // Add the button row to the page
    this.add(hBox);

    // Generate a simple table model
    var model = new qx.ui.table.model.Simple();

    // Define the table columns
    model.setColumns([ 
                       this.tr("Name"),
                       this.tr("Email"),
                       this.tr("Permissions"),
                       this.tr("Status")
                     ]);
    
    // Set all columns editable
    model.setEditable(true);
    
    // Initialize the table data
    model.setData(rowData);

    // Customize the table column model.  We want one that automatically
    // resizes columns.
    var custom =
    {
      tableColumnModel : function(obj) 
      {
        return new qx.ui.table.columnmodel.Resize(obj);
      }
    };

    // Now that we have a model, we can use it to create our table.
    var table = new qx.ui.table.Table(model, custom);

    // Get the table column model in order to set cell editer factories
    var tcm = table.getTableColumnModel();
    
    //
    // Specify the resize behavior. Obtain the behavior object to manipulate
    var resizeBehavior = tcm.getBehavior();

    // Set the Permissions and Status fields to nearly fixed widths, and then
    // let the Name and Email fields take up the remaining space.
    resizeBehavior.set(0, { width:"1*", minWidth:200 }); // Name
    resizeBehavior.set(1, { width:"1*", minWidth:200 }); // Email
    resizeBehavior.set(2, { width:200                }); // Permissions
    resizeBehavior.set(3, { width:60                 }); // Status

    var editor = new aiagallery.mgmt.UsersCellEditorFactory();
    tcm.setCellEditorFactory(0, editor);
    tcm.setCellEditorFactory(1, editor);
    tcm.setCellEditorFactory(2, editor);
    tcm.setCellEditorFactory(3, editor);

    // Listen for changeSelection events so we can enable/disable buttons
    var selectionModel = table.getSelectionModel();
    selectionModel.addListener(
      "changeSelection",
      function(e)
      {
        // The edit and delete buttons are only enabled when the table has
        // selected rows.
        var bHasSelection = ! this.isSelectionEmpty();
        edit.setEnabled(bHasSelection);
        deleteUser.setEnabled(bHasSelection);
      });

    edit.addListener(
      "execute",
      function(e)
      {
        this.startEditing();
      },
      table);

    // Listen for dataEdited events so we can write changes to the backend
    table.addListener(
      "dataEdited",
      function(e)
      {
        var data = e.getData();
/*
        alert("Cell edited:"
              " row=" + data.row +
              " col=" + data.col + 
              " old=" + data.oldValue + 
              " new=" + data.value);
*/
      },
      this);

    // Add a confirmation for deletions
    deleteUser.addListener(
      "execute",
      function(e)
      {
        // Determine what user is selected for deletion. We're in
        // single-selection mode, so we can easily reference into the
        // selection array.
        var selection = selectionModel.getSelectedRanges()[0].minIndex;
        var data = model.getData()[selection];

        dialog.Dialog.confirm(
          this.tr("Really delete user ") + data[1] + " (" + data[0] + ")" + "?",
          function(result)
          {
            dialog.Dialog.alert(this.tr("Your answer was: ") + result );
          });
      });
    // Add the table to the page
    this.add(table, { flex : 1 });
  }
});
