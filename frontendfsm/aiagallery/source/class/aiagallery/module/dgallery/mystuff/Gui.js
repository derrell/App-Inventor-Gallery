/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery "my stuff" page
 */
qx.Class.define("aiagallery.module.dgallery.mystuff.Gui",
{
  type : "singleton",
  extend : qx.ui.core.Widget,

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
      var edit = new qx.ui.form.Button(this.tr("Edit"));
      edit.set(
        {
          maxHeight : 24,
          width     : 100,
          enabled   : false
        });
      hBox.add(edit);
      fsm.addObject("edit", edit);

      // Create an Add New Application button
      var addApp = new qx.ui.form.Button(this.tr("Add Application"));
      addApp.set(
        {
          maxHeight : 24,
          width     : 100
        });
      hBox.add(addApp);
      addApp.addListener("execute", fsm.eventListener, fsm);
      
      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("addApp", addApp, "main.fsmUtils.disable_during_rpc");

      // Now right-justify the Delete button
      hBox.add(new qx.ui.core.Widget(), { flex : 1 });

      // Create a Delete button
      var deleteApp = new qx.ui.form.Button(this.tr("Delete"));
      deleteApp.set(
        {
          maxHeight : 24,
          width     : 100,
          enabled   : false
        });
      hBox.add(deleteApp);
      fsm.addObject("deleteApp", deleteApp);

      // Add the button row to the page
      canvas.add(hBox);

      // Generate a simple table model
      var model = new qx.ui.table.model.Simple();

      // Define the table columns
      model.setColumns([ 
                         this.tr("Title"),
                         this.tr("Description"),
                         this.tr("Owner"),
                         this.tr("Image 1"),
                         this.tr("Image 2"),
                         this.tr("Image 3"),
                         this.tr("Author Chain"),
                         this.tr("Tags"),
                         this.tr("Upload Time"),
                         this.tr("Likes"),
                         this.tr("Downloads"),
                         this.tr("Viewed"),
                         this.tr("Status")
                       ],
                       [
                         "title",
                         "description",
                         "owner",
                         "image1",
                         "image2",
                         "image3",
                         "prevAuthors",
                         "tags",
                         "uploadTime",
                         "numLikes",
                         "numDownloads",
                         "numViewed",
                         "status"
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

      // Now that we have a data model, we can use it to create our table.
      var table = new aiagallery.widget.Table(model, custom);
      table.setRowHeight(64);
      table.addListener("cellEditorOpening", fsm.eventListener, fsm);
      
      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("table", table, "main.fsmUtils.disable_during_rpc");
      
      // Also save the FSM in the table, for access by cell editors
      table.setUserData("fsm", fsm);

      // Get the table column model in order to set cell renderers and cell
      // editer factories.
      var tcm = table.getTableColumnModel();
      
      // The image columns require an image cell renderer
      for (var i = 3; i <= 5; i++)
      {
        var imageCellRenderer = new qx.ui.table.cellrenderer.Image(60, 60);
        imageCellRenderer.setRepeat("scale");
        tcm.setDataCellRenderer(i, imageCellRenderer);
      }

      // Specify the resize behavior. Obtain the behavior object to manipulate
      var resizeBehavior = tcm.getBehavior();

      // Set the Permissions and Status fields to nearly fixed widths, and then
      // let the Name and Email fields take up the remaining space.
//      resizeBehavior.set(0, { width:"1*", minWidth:200 }); // Name

      resizeBehavior.set(0,  { width:100 });                // Title
      resizeBehavior.set(1,  { width:150 });                // Description
      resizeBehavior.set(2,  { width:100 });                // Owner
      resizeBehavior.set(3,  { width:70  });                // Image 1
      resizeBehavior.set(4,  { width:70  });                // Image 2
      resizeBehavior.set(5,  { width:70  });                // Image 3
      resizeBehavior.set(9,  { width:70  });                // # Likes
      resizeBehavior.set(10, { width:70  });                // # Downloads
      resizeBehavior.set(11, { width:70  });                // # Viewed

      var editor = new aiagallery.module.dgallery.mystuff.CellEditorFactory();
      for (var i = 0; i < 13; i++)
      {
        tcm.setCellEditorFactory(i, editor);
      }

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
          deleteApp.setEnabled(bHasSelection);
        });

      // Begin editing when the Edit button is pressed. This will cause a
      // "cellEditorOpening" event to be issued to the FSM
      edit.addListener(
        "execute",
        function(e)
        {
          this.startEditing();
        },
        table);

      // Add a confirmation for deletions
      deleteApp.addListener(
        "execute",
        function(e)
        {
          // Determine what user is selected for deletion. We're in
          // single-selection mode, so we can easily reference into the
          // selection array.
          var selection = selectionModel.getSelectedRanges()[0].minIndex;
          var data = model.getDataAsMapArray()[selection];
          var origEvent = e.clone();

          dialog.Dialog.confirm(
            this.tr("Really delete application") + " '" + data.title + "'?",
            function(result)
            {
              // If they confirmed the deletion...
              if (result)
              {
                // ... then pass this event to the fsm
                fsm.eventListener(origEvent);
              }
            });
        });
      
      // Add the table to the page
      canvas.add(table, { flex : 1 });
    },


    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             cellEditor;
      var             table;
      var             model;
      var             deletedRow;

      if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "getAppList":
        table = fsm.getObject("table");
        model = table.getTableModel();
        
        // Set the entire data model given the result array
        model.setDataAsMapArray(response.data.result.apps, true, false);
        
        // Save the category list in a known place, for later access
        this.getApplicationRoot().setUserData("categories",
                                              response.data.result.categories);
        break;
        
      case "addOrEditApp":
        // Nothing more to do but close the cell editor
        break;
        
      case "deleteApp":
        // Delete the row from the table
        table = fsm.getObject("table");
        model = table.getTableModel();
        deletedRow = rpcRequest.getUserData("deletedRow");
        model.removeRows(deletedRow, 1, false);
        break;
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
