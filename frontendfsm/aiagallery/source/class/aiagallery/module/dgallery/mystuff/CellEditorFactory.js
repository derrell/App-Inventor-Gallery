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
      var             imageButton;
      var             imageButtons = [];
      var             imageData;
      var             categoryList;
      var             uploadReader;

      // Retrieve the finite state machine
      fsm = cellInfo.table.getUserData("fsm");

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
      
      var layout = new qx.ui.layout.Grid(10, 2);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnWidth(0, 220);
      layout.setColumnWidth(1, 230);
      layout.setSpacing(5);

      // Create the cell editor window, since we need to return it immediately
      cellEditor = new qx.ui.window.Window(title);
      cellEditor.setLayout(layout);
      cellEditor.set(
        {
          width: 800,
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

      // Add the form field labels with red asterisk if
      // field is mandatory

      // Make a map for each label with the label-text and
      // a boolean mandatory value 
      row = 0;
      [
        {str : this.tr("Title"), mandatory : true},
        {str : this.tr("Description"), mandatory : true},
        {str : this.tr("Image 1"), mandatory : true},
        {str : this.tr("Image 2"), mandatory : false},
        {str : this.tr("Image 3"), mandatory : false},
        {str : this.tr("Previous Authors"), mandatory : false},
        {str : this.tr("Categories"), mandatory : true},
        {str : this.tr("Uploads"), mandatory : true}
      ].forEach(function(str)
        {
          // if field not required, just add label
          if(!str.mandatory)
          {
            o = new qx.ui.basic.Label(str.str);
            o.set(
              {
                allowShrinkX: false,
                paddingTop: 3
              });
            cellEditor.add(o, {row: row++, column : 0});
          }
          
          // if field required, add label and red asterisk using html
          if(str.mandatory)
          {
            o = new qx.ui.basic.Label('<font color=red>' + "*" + 
                                      '</font>' + str.str);
            o.set(
              {
                rich : true,
                allowShrinkX: false,
                paddingTop: 3
              });
            cellEditor.add(o, {row: row++, column : 0});
          }
        });

      // remove from list to put Categories and tags side by side
      this.tr("Tags");

      // Reset the row number
      row = 0;
      
      // Create the editor field for the title
      var appTitle = new qx.ui.form.TextField("");
      appTitle.setValue(rowData.title);
      cellEditor.add(appTitle, { row : row++, column : 1, colSpan : 2 });
      
      // Create the editor field for the description
      var description = new qx.ui.form.TextField("");
      description.setValue(rowData.description);
      cellEditor.add(description, { row : row++, column : 1, colSpan : 2 });
      
      // Add upload buttons for each of the three images
      for (i = 1; i <= 3; i++)
      {
        // Create the image placeholder
        image = new qx.ui.basic.Image();
        image.set(
          {
            minHeight : 50,
            minWidth  : 50,
            maxHeight : 50,
            maxWidth  : 50,
            scale     : true
          });
        cellEditor.add(image, { row : row, column : 1 });

        // Is there already an image specified?
        imageData = rowData["image" + i];
        if (imageData)
        {
          // Yup.
          image.setSource(rowData["image" + i]);
        }

        // Create an Upload button
        imageButton =
          new uploadwidget.UploadButton("image" + i, this.tr("Add image"));
        fsm.addObject("image" + i, imageButton);
        imageButton.setWidth(50);
        
        // Save the image object with this upload button so we can update it
        // when new image data is loaded.
        imageButton.setUserData("image", image);

        // When the file name changes, begin retrieving the file data
        imageButton.addListener("changeFileName", fsm.eventListener, fsm);

        // Add upload button in rows 3, 4, and 5
        cellEditor.add(imageButton, { row : row++, column : 2 });

        // Save a reference to this image upload button
        imageButtons.push(imageButton);
      }

      // Create the editor field for previous authors
      var prevAuthors = new qx.ui.form.TextField("");
      prevAuthors.setValue(rowData.prevAuthors || "");
      cellEditor.add(prevAuthors, { row : row++, column : 1, colSpan : 2 });

      // FIXME: temporary
      prevAuthors.set(
        {
          enabled : false,
          value   : "<not yet implemented>"
        });
      
      // Create the editor field for "category" (required) tags which have
      // been stored in the table's user data.
      
      // Get the list of currently-selected tags
      var currentTags = rowData.tags.split(new RegExp(", *"));
      
      // Get the list of possible tags, at least one of which must be selected.
      categoryList =
        qx.core.Init.getApplication().getRoot().getUserData("categories");

      // Create a multi-selection list and add the categories to it.
      var categories = new qx.ui.form.List();
      categories.setHeight(100);
      categories.setSelectionMode("multi"); // allow multiple selections
      categoryList.forEach(function(tagName) 
        {
          var item = new qx.ui.form.ListItem(tagName);
          categories.add(item);
          
          // Is this a current tag of the app being edited?
          if (qx.lang.Array.contains(currentTags, tagName))
          {
            // Yup. Select it.
            categories.addToSelection(item);
          }
        });
      
      cellEditor.add(categories, { row :row++, column : 1, colSpan : 1 });

      //
      // Add a list for editing additional tags
      //
     

      // Create a grid layout for it
      layout = new qx.ui.layout.Grid(4, 4);
      layout.setColumnWidth(0, 60);
      layout.setColumnWidth(1, 55);
      layout.setColumnWidth(2, 50);
      layout.setColumnWidth(3, 65);
      var grid = new qx.ui.container.Composite(layout);
      cellEditor.add(grid, { row : 6, column : 2, colSpan : 1 });

      // We'll want a list of tags
      var additionalTags = new qx.ui.form.List();
      additionalTags.setHeight(75);
      grid.add(additionalTags, { row : 0, column : 0, colSpan : 4});

      
      // Add those tags that are not also categories
      currentTags.forEach(function(tag)
        {
          if (tag != "" && ! qx.lang.Array.contains(categoryList, tag))
          {
            additionalTags.add(new qx.ui.form.ListItem(tag));
          }
        });

      // Create the button to delete the selected tag
      var tagDelete = new qx.ui.form.Button(this.tr("Delete"));
      grid.add(tagDelete, { row : 1, column : 3 });
      
      // Create an input field and button to add a new tag
      var newTag = new qx.ui.form.TextField();
      newTag.setFilter(/[- a-zA-Z0-9]/); // only allow these characters in tags
      
      // Text placeholder for tags field
      newTag.setPlaceholder("add tags");

      grid.add(newTag, { row : 1, column : 1, colSpan : 2});
      var tagAdd = new qx.ui.form.Button(this.tr("Add tag"));
      tagAdd.setEnabled(false);
      grid.add(tagAdd, { row : 1, column : 0 });

      // When the selection changes, determine whether to enable the delete.
      additionalTags.addListener("changeSelection",
        function(e)
        {
          tagDelete.setEnabled(additionalTags.getSelection().length !== 0);
        });

      // Enable the Add button whenever there's data in the text field
      newTag.addListener("input",
        function(e)
        {
          tagAdd.setEnabled(e.getData().length !== 0);
        });

      // When the Add button is pressed, add the item to the list
      tagAdd.addListener("execute",
        function(e)
        {
          additionalTags.add(new qx.ui.form.ListItem(newTag.getValue()));
          newTag.setValue(""); // clear the entered text
        });

      // When the delete button is pressed, delete selection from the list
      tagDelete.addListener("execute",
        function(e)
        {
          additionalTags.remove(additionalTags.getSelection()[0]);
        });
      

      // Create a box where we'll put the two upload buttons
      var hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      cellEditor.add(hBox, { row : row++, column : 1, colSpan : 2 });
      
      //
      // Create the Source upload button. 
      //
      // BUG ALERT: We wrap it in its own container because not doing so
      // causes the 'apk' UploadButton to receive the changeFileName events
      // which actually occur on 'source'.
      //
      var bugWrapper = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      var source = 
        new uploadwidget.UploadButton("source", this.tr("Source .zip File"));
      fsm.addObject("source", source);
      bugWrapper.add(source);
      hBox.add(bugWrapper);
        
      // When the file name changes, begin retrieving the file data
      source.addListener("changeFileName", fsm.eventListener, fsm);

      //
      // Create the Apk upload button.
      // See BUG ALERT, above.
      bugWrapper = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      var apk = 
        new uploadwidget.UploadButton("apk", this.tr("Application .apk File"));
      fsm.addObject("apk", apk);
      bugWrapper.add(apk);
      hBox.add(bugWrapper);
        
      // When the file name changes, begin retrieving the file data
      apk.addListener("changeFileName", fsm.eventListener, fsm);


      // Save the input fields for access by getCellEditorValue() and the FSM
      cellEditor.setUserData("appTitle", appTitle);
      cellEditor.setUserData("description", description);
      cellEditor.setUserData("images", imageButtons);
      cellEditor.setUserData("prevAuthors", prevAuthors);
      cellEditor.setUserData("categories", categories);
      cellEditor.setUserData("additionalTags", additionalTags);
      cellEditor.setUserData("source", source);
      cellEditor.setUserData("apk", apk);
      
      // Save the uid
      cellEditor.setUserData("uid", rowData.uid);

      // buttons
      var paneLayout = new qx.ui.layout.HBox();
      paneLayout.set(
        {
          spacing: 10,
          alignX : "right"
        });
      var buttonPane = new qx.ui.container.Composite(paneLayout);
      buttonPane.set(
        {
          paddingTop: 10
        });
      cellEditor.add(buttonPane, {row: row++, column: 0, colSpan: 3});

      // Retrieve the finite state machine
      fsm = cellInfo.table.getUserData("fsm");

      //
      // FIXME: Validate data prior to submission
      //

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
      
      // Create lable for required field
      var requiredField = new qx.ui.basic.Label('* = required field');
      
      // Makes lable red
      requiredField.set(
        {
          rich : true,
          TextColor : "#FF0000"
        });
      
      // Adds lable in bottom right corner
      cellEditor.add(requiredField, {row : 9, column : 3});

      // We'll need the table object in getCellEditorValue()
      cellEditor.setUserData("table", cellInfo.table);

      return cellEditor;
    },

    // overridden
    getCellEditorValue : function(cellEditor)
    {
      // The new row data was saved by the FSM. Retrieve it.
      var newData = cellEditor.getUserData("newData");
      
      // Retrieve the table object and the data model
      var table = cellEditor.getUserData("table");
      var model = table.getTableModel();

      // Determine the column id associated with the edited column
      var id = model.getColumnId(cellEditor.getUserData("cellInfo").col);
      
      // Return the appropriate column data.
      return newData[id];
    }
  }
});
