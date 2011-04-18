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
 * A cell editor factory for Apps (all fields)
 */
qx.Class.define("aiagallery.module.dgallery.mystuff.CellEditorFactory",
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
      var             row;
      var             cellEditor;
      var             model;
      var             rowData;
      var             title;
      var             fsm;
      var             bEditing;
      var             image;
      var             images = [];
      var             imageData;
      var             mandatoryTagList;

      // If there's a cellInfo object provided, we're editing an existing
      // user. Get the row data. Otherwise, we're adding a new user.
      if (cellInfo && cellInfo.row !== undefined)
      {
        // We're editing. Get the current row data.
        bEditing = true;
        model = cellInfo.table.getTableModel();
        rowData = model.getRowDataAsMap(cellInfo.row);
        title = this.tr("Edit Application: ") + rowData.title;
      }
      else
      {
        bEditing = false;
        title = this.tr("Add New Application");
        rowData =
        {
          // We'll be creating a new entry, so set the unique id to null
          uid          : null,

          // The other fields will just default to blank entries
          title        : "",
          description  : "",
          image1       : "",
          image2       : "",
          image3       : "",
          prevAuthors  : "",
          tags         : "",
          uploadTime   : "",
          numLikes     : "",
          numDownloads : "",
          numViewed    : "",
          status       : ""
        };
      }
      
      var layout = new qx.ui.layout.Grid(9, 2);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnWidth(0, 80);
      layout.setColumnWidth(1, 400);
      layout.setSpacing(10);

      // Create the cell editor window, since we need to return it immediately
      cellEditor = new qx.ui.window.Window(title);
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

      // If we're editing, save the cell info.  We'll need it when the cell
      // editor closes.
      bEditing && cellEditor.setUserData("cellInfo", cellInfo);

      // Add the form field labels
      row = 0;

      [
        this.tr("Title"),
        this.tr("Description"),
        this.tr("Image 1"),
        this.tr("Image 2"),
        this.tr("Image 3"),
        this.tr("Previous Authors"),
        this.tr("Tags"),
        this.tr("Upload Time"),
        this.tr("Likes"),
        this.tr("Downloads"),
        this.tr("Viewed"),
        this.tr("Status")
      ].forEach(function(label)
        {
          o = new qx.ui.basic.Label(label);
          o.set(
            {
              allowShrinkX: false,
              paddingTop: 3
            });
          cellEditor.add(o, {row: row++, column : 0});
        });


      // Reset the row number
      row = 0;

      // Create the editor field for the title
      var appTitle = new qx.ui.form.TextField("");
      appTitle.setValue(rowData.title);
      cellEditor.add(appTitle, { row : row++, column : 1 });
      
      // Create the editor field for the description
      var description = new qx.ui.form.TextField("");
      description.setValue(rowData.description);
      cellEditor.add(description, { row : row++, column : 1 });
      
      // Add upload buttons for each of the three images
      for (i = 1; i <= 3; i++)
      {
        // Is there already an image?
        imageData = rowData["image" + i];
        if (imageData)
        {
          cellEditor.add(new qx.ui.basic.Image(imageData),
                         { row : row, column : 1 });
        }

        // Create an Upload button
        image = new uploadwidget.UploadButton("image" + i, 
                                               this.tr("Change"),
                                               "aiagallery/test.png");
        image.set(
        {
          maxHeight : 24,
          width     : 100
        });

        // Add upload button in rows 3, 4, and 5
        cellEditor.add(image, { row : row++, column : 2 });

        // Save a reference to this image
        images[i] = image;
      }

      // Create the editor field for "category" (required) tags which have
      // been stored in the table's user data.
      
      // First, get the list of possible tags, at least one of which must be
      // selected.
      mandatoryTagList = this.getRoot().getUserData("mandatoryTagList");
      
      // Get the list of currently-selected tags
      var currentTags = rowData.tags.split(/, */);
      
      // Create a multi-selection list and add the mandatory tags to it.
      var mandatoryTags = new qx.ui.form.List();
      mandatoryTags.setMode("multi"); // allow multiple selections
      mandatoryTagList.forEach(function(tagName) 
        {
          var item = new qx.ui.form.ListItem(tagName);
          mandatoryTags.add(item);
          
          // Is this one currently selected?
          if (qx.lang.Array.contains(currentTags, tagName))
          {
            mandatoryTags.addToSelection(item);
          }
        });
      
      cellEditor.add(mandatoryTags, { row : row++, column : 1 });

      //
      // Add a list for editing additional tags
      //
      
      // Create a grid layout for it
      layout = new qx.ui.layout.Grid(11, 5);
      layout.setColumnWidth(0, 80);
      layout.setColumnWidth(1, 30);
      layout.setColumnWidth(2, 200);
      layout.setColumnWidth(3, 80);
      var grid = new qx.ui.container.Composite(layout);
      
      // We'll want a list of tags
      var additionalTags = new qx.ui.form.List();
      grid.add(list, { row : 0, column : 0, colSpan : 4 });
      
      // Create the button to delete the selected tag
      var tagDelete = new qx.ui.form.Button("Delete");
      grid.add(tagDelete, { row : 1, column : 0 });
      
      // Create an input field and button to add a new tag
      var newTag = new qx.ui.form.TextField();
      newTag.setFilter(/[a-zA-Z0-9]/); // only allow these characters in tags
      grid.add(newTag, { row : 1, column : 2 });
      var tagAdd = new qx.ui.form.Button("Add");
      grid.add(tagAdd, { row : 1, column : 3 });

      // When the selection changes, determine whether to enable the delete.
      additionalTags.addListener("changeSelection",
        function(e)
        {
          deleteButton.setEnabled(additionalTags.getSelection().length !== 0);
        });

      // Enable the Add button whenever there's data in the text field
      newTag.addListener("input",
        function(e)
        {
          addButton.setEnabled(e.getData().length !== 0);
        });

      // When the Add button is pressed, add the item to the list
      tagAdd.addListener("execute",
        function(e)
        {
          additionalTags.add(new qx.ui.form.ListItem(newItem.getValue()));
          newItem.setValue(""); // clear the entered text
        });

      // When the delete button is pressed, delete selection from the list
      tagDelete.addListener("execute",
        function(e)
        {
          additionalTags.remove(additionalTags.getSelection()[0]);
        });
      

      // Save the input fields for access by getCellEditorValue() and the FSM
      cellEditor.setUserData("appTitle", appTitle);
      cellEditor.setUserData("description", description);
      cellEditor.setUserData("images", images);
      cellEditor.setUserData("mandatoryTags", mandatoryTags);
      cellEditor.setUserData("additionalTags", additionalTags);

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
      cellEditor.add(buttonPane, {row: row++, column: 0, colSpan: 2});

      // Retrieve the finite state machine
      fsm = cellInfo.table.getUserData("fsm");

      var okButton =
        new qx.ui.form.Button("Ok", "icon/22/actions/dialog-ok.png");
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
      // The new row data was saved by the FSM. Retrieve it.
      var newData = cellEditor.getUserData("newData");
      
      // Return the appropriate column data.
      return newData[cellEditor.getUserData("cellInfo").col];
    }
  }
});
