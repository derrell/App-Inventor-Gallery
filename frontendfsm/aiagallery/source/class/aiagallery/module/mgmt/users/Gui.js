/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the user management 
 */
qx.Class.define("aiagallery.module.mgmt.users.Gui",
{
  type : "singleton",
  extend : qx.core.Object,

  members :
  {
    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             o;
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             rowData;

      // Live mode. Retrieve data from the backend.
      rowData = [];

      // Create a layout for this page
      canvas.setLayout(new qx.ui.layout.VBox());

      // We'll left-justify some buttons in a button row
      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);
      var hBox = new qx.ui.container.Composite(layout);

      // Create an Edit button
      var edit = new qx.ui.form.Button(canvas.tr("Edit"));
      edit.set(
        {
          maxHeight : 24,
          width     : 100,
          enabled   : false
        });
      hBox.add(edit);

      // Create an Add User button
      var addUser = new qx.ui.form.Button(canvas.tr("Add New User"));
      addUser.set(
        {
          maxHeight : 24,
          width     : 100
        });
      hBox.add(addUser);

      // Now right-justify the Delete button
      hBox.add(new qx.ui.core.Widget(), { flex : 1 });

      // Create a Delete button
      var deleteUser = new qx.ui.form.Button(canvas.tr("Delete"));
      deleteUser.set(
        {
          maxHeight : 24,
          width     : 100,
          enabled   : false
        });
      hBox.add(deleteUser);

      // Add the button row to the page
      canvas.add(hBox);

      // Generate a simple table model
      var model = new qx.ui.table.model.Simple();

      // Define the table columns
      model.setColumns([ 
                         canvas.tr("Name"),
                         canvas.tr("Email"),
                         canvas.tr("Permissions"),
                         canvas.tr("Status")
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

      var editor = new aiagallery.module.mgmt.users.CellEditorFactory();
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
        canvas);

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
            canvas.tr("Really delete user ") + data[1] + 
              " (" + data[0] + ")" + "?",
            function(result)
            {
              dialog.Dialog.alert(canvas.tr("Your answer was: ") + result );
            });
        });
      // Add the table to the page
      canvas.add(table, { flex : 1 });
    },


    /**
     * Populate the graphical user interface with the specified data
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    displayData : function(module, rpcRequest)
    {
      var fsm = module.fsm;
      var response = rpcRequest.getUserData("rpc_response");
      var requestType = rpcRequest.getUserData("requestType");

      if (response.type == "failed")
      {
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
        case "hideSubtree":
          // Nothing to do but close the cell editor
          var cellEditor = rpcRequest.getUserData("cellEditor");
          cellEditor.close();
          break;

        default:
          throw new Error("Unexpected request type: " + requestType);
      }
    },

    /**
     * TODOC
     *
     * @type member
     * @param module {var} TODOC
     * @param rpcRequest {var} TODOC
     * @return {void}
     */
    __displayPrepopulateResults : function(module, rpcRequest)
    {
      var             t;
      var             child;
      var             fsm = module.fsm;

      // Get the tree object
      var tree = fsm.getObject("tree");
      var dataModel = tree.getDataModel();

      // Obtain the result object
      var result = rpcRequest.getUserData("rpc_response").data.result;

      // The result of a prepopulate request is a map which looks like this:
      //
      //   now  : <time_t current timestamp>
      //   data : <array of prepopulate elements>
      //
      // A prepopulate element contains these properties:
      //
      //   fspath
      //   wgpath
      //   displayname
      //   comment
      //   type
      //   network_type
      //   accessible_p
      //   scan_time_start
      //   scan_time_end
      //   invisible_p
      //   timestamp
      //   sort_order
      //   priority
      //   backup_time
      //   username
      //   password_length
    }
  }
});
