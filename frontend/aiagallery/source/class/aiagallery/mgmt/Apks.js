/**
 * Application Management
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

qx.Class.define("aiagallery.mgmt.Apks",
{
  extend : qx.ui.tabview.Page,
  
  construct : function(app)
  {
    var rowData;

    // Call the superclass constructor
    this.base(arguments, this.tr("Applications"));

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
               (r < 0.1 
                ? qx.locale.Manager.tr("Banned") 
                : (r < 0.3 
                   ? qx.locale.Manager.tr("Pending") 
                   : qx.locale.Manager.tr("Active")));

             data.push(
               {
                 key         : "key" + row,
                 title       : "title " + row,
                 status      : status,
                 owner       : "user" + row + "@gmail.com",
                 tags        : "",
                 keywords    : "",
                 thumbnail   : "aiagallery/test.png"
               });
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

    // Now right-justify the Delete button
    hBox.add(new qx.ui.core.Widget(), { flex : 1 });

    // Create a Delete button
    var deleteApk = new qx.ui.form.Button(this.tr("Delete"));
    deleteApk.set(
      {
        maxHeight : 24,
        width     : 100,
        enabled   : false
      });
    hBox.add(deleteApk);

    // Add the button row to the page
    this.add(hBox);

    // Generate a simple table model
    var model = new qx.ui.table.model.Simple();

    // Define the table columns
    model.setColumns(
      [ 
        this.tr("Thumbnail"),
        this.tr("Title"),
        this.tr("Status"),
        this.tr("Owner"),
        this.tr("Tags"),
        this.tr("Keywords") 
      ],
      [ 
        "thumbnail",
        "title",
        "status",
        "owner",
        "tags",
        "keywords"
      ]);

    // Initialize the table data
    model.setDataAsMapArray(rowData, false, true);

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
    resizeBehavior.set(0, { width:80                 }); // Thumbnail
    resizeBehavior.set(1, { width:"1*", minWidth:200 }); // Title
    resizeBehavior.set(2, { width:60                 }); // Status
    resizeBehavior.set(3, { width:"1*", minWidth:200 }); // Owner
    resizeBehavior.set(4, { width:"1*", minWidth:140 }); // Tags
    resizeBehavior.set(5, { width:"1*", minWidth:140 }); // Keywords

    // We'll have thumbnail images which require more height than the default.
    table.setRowHeight(60);

    // The first column contains images
    tcm.setDataCellRenderer(0, new qx.ui.table.cellrenderer.Image(56, 56));

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
        deleteApk.setEnabled(bHasSelection);
      });

    // Add a confirmation for deletions
    deleteApk.addListener(
      "execute",
      function(e)
      {
        // Determine what application is selected for deletion. We're in
        // single-selection mode, so we can easily reference into the
        // selection array.
        var selection = selectionModel.getSelectedRanges()[0].minIndex;
        var data = model.getData()[selection];

        dialog.Dialog.confirm(
          this.tr("Really delete application ") + data[1] + "?",
          function(result)
          {
            dialog.Dialog.alert(this.tr("Your answer was: ") + result );
          });
      });
    // Add the table to the page
    this.add(table, { flex : 1 });
  }
});
