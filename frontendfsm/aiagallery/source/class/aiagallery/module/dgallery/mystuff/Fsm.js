/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * My Stuff finite state machine
 */
qx.Class.define("aiagallery.module.dgallery.mystuff.Fsm",
{
  type : "singleton",
  extend : aiagallery.main.AbstractModuleFsm,

  members :
  {
    buildFsm : function(module)
    {
      var fsm = module.fsm;
      var state;
      var trans;

      // ------------------------------------------------------------ //
      // State: Idle
      // ------------------------------------------------------------ //

      /*
       * State: Idle
       *
       * Actions upon entry
       *   - if returning from RPC, display the result
       */

      state = new qx.util.fsm.State("State_Idle",
      {
        "context" : this,

        "onentry" : function(fsm, event)
        {
          // Did we just return from an RPC request?
          if (fsm.getPreviousState() == "State_AwaitRpcResult")
          {
            // Yup.  Display the result.  We need to get the request object
            var rpcRequest = this.popRpcRequest();

            // Otherewise, call the standard result handler
            var gui = aiagallery.module.dgallery.mystuff.Gui.getInstance();
            gui.handleResponse(module, rpcRequest);

            // Dispose of the request
            if (rpcRequest.request)
            {
              rpcRequest.request.dispose();
              rpcRequest.request = null;
            }
          }
          
          // Be sure that edit and delete buttons enable status is correct
          var selectionModel = fsm.getObject("table").getSelectionModel();
          var bHasSelection = ! selectionModel.isSelectionEmpty();
          fsm.getObject("edit").setEnabled(bHasSelection);
          fsm.getObject("deleteApp").setEnabled(bHasSelection);
        },

        "events" :
        {
          "execute" :
          {
            // When the Delete App button is pressed
            "deleteApp" : "Transition_Idle_to_AwaitRpcResult_via_deleteApp",

            // When the Add App button is pressed
            "addApp" : "Transition_Idle_to_AddOrEditApp_via_addApp"
          },

          "cellEditorOpening" :
          {
            // When a cell is double-clicked, or the Edit button is pressed,
            // either of which open a cell editor for the row data
            "table" : "Transition_Idle_to_AddOrEditApp_via_cellEditorOpening"
          },

          // Request to call some remote procedure call which is specified by
          // the event data.
          "callRpc" : "Transition_Idle_to_AwaitRpcResult_via_generic_rpc_call",

          // When we get an appear event, retrieve the app list
          "appear"    :
          {
            "main.canvas" : "Transition_Idle_to_AwaitRpcResult_via_appear"
          },

          // When we get a disappear event, stop our timer
          "disappear" :
          {
            "main.canvas" : "Transition_Idle_to_Idle_via_disappear"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "execute" on "Delete App" button
       *
       * Action:
       *  Issue a remote procedure call to delete the selected app
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_deleteApp",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Determine what app is selected for deletion. We're in
          // single-selection mode, so we can easily reference into the
          // selection array.
          var table = fsm.getObject("table");
          var selectionModel = table.getSelectionModel();
          var selection = selectionModel.getSelectedRanges()[0].minIndex;
          var data = table.getTableModel().getDataAsMapArray()[selection];

          // Issue a Delete App call
          var request =
            this.callRpc(fsm,
                          "aiagallery.features",
                          "deleteApp",
                          [
                            data.uid
                          ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "deleteApp");
          
          // We also need to know what row got deleted
          request.setUserData("deletedRow", selection);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AddOrEditApp
       *
       * Cause: "execute" on "Add App" button
       *
       * Action:
       *  Open an empty editor to add a new app
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AddOrEditApp_via_addApp",
      {
        "nextState" : "State_AddOrEditApp",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var cellEditor;

          // Retrieve the table object
          var table = fsm.getObject("table");

          // Get the cell editor factory for all columns of the table
          var cellEditorFactory =
            table.getTableColumnModel().getCellEditorFactory(0);
          
          // Generate a simple cellInfo object
          var cellInfo = { table : table };

          // Get a cell editor
          cellEditor = cellEditorFactory.createCellEditor(cellInfo);
          
          // Make it modal
          cellEditor.setModal(true);
          
          // Disallow the window's close button
          cellEditor.setShowClose(false);
          
          // Open the cell editor
          cellEditor.open();
          
          // Save the cell editor and cell info
          this.setUserData("cellEditor", cellEditor);
          this.setUserData("cellInfo", cellInfo);
        }
      });
        
      state.addTransition(trans);

      /*
       * Transition: Idle to AddOrEditApp
       *
       * Cause: "cellEditorOpening" on the Table. This can occur as a result
       * of either a press of the "Edit" button, or by double-clicking on the
       * row to be edited.
       *
       * Action:
       *  Save the cell editor, to later access its contents
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AddOrEditApp_via_cellEditorOpening",
      {
        "nextState" : "State_AddOrEditApp",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var data = event.getData();
          var cellEditor = data.cellEditor;
          var cellInfo = data.cellInfo;
          
          // Save the cell editor and information of which row we're editing
          this.setUserData("cellEditor", cellEditor);
          this.setUserData("cellInfo", cellInfo);
        }
      });
        
      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "genericRpcCall"
       *
       * Action:
       *  Issue the RPC call specified by the event data
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_generic_rpc_call",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the user data, which includes the parameters to callRpc()
          var userData = event.getData();

          // Issue the specified remote procedure call
          this.callRpc(userData.fsm,
                        userData.service,
                        userData.method,
                        userData.params,
                        userData);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: "appear" on canvas
       *
       * Action:
       *  Start our timer
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_appear",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Issue the remote procedure call to get the list of this visitor's
          // applications. Request to convert lists into stringts, and
          // retrieve only the logged-in user's own apps, not all apps.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getAppList",
                         [ true, null, null, null ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getAppList");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: "disappear" on canvas
       *
       * Action:
       *  Stop our timer
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_disappear",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
//          aiagallery.module.dagllery.mystuff.Fsm._stopTimer(fsm);
        }
      });

      state.addTransition(trans);



      // ------------------------------------------------------------ //
      // State: AddOrEditApp
      // ------------------------------------------------------------ //

      /*
       * State: AddOrEditApp
       *
       * Actions upon entry
       *  - If the event that got us here was "completed", update the GUI
       *
       * Cause:
       *  - "execute" on Ok button from cell editor
       *  - "execute" on Cancel button from cell editor
       *  - "completed" event passed through in onentry from the
       *    AwaitRpcResult state
       */

      state = new qx.util.fsm.State("State_AddOrEditApp",
      {
        "context" : this,

        "onentry" : function(fsm, event)
        {
          var             rpcRequest;
          var             response;
          var             userData;

          // Did we just return from an RPC request?
          if (fsm.getPreviousState() == "State_AwaitRpcResult")
          {
            // Yup.  Determine whether it succeeded. Get the request and
            // response objects.
            rpcRequest = this.popRpcRequest();
            response = rpcRequest.getUserData("rpc_response");
            
            // Did it fail?
            if (response.type == "failed")
            {
              // Yup. Update the GUI
              var gui = aiagallery.module.dgallery.mystuff.Gui.getInstance();
              gui.handleResponse(module, rpcRequest);
            }
            else
            {
              // It succeeded. Resubmit the event to move us back to Idle
              fsm.eventListener(event);
              
              // Push the RPC request back on the stack so it's available for
              // the next transition.
              this.pushRpcRequest(rpcRequest);
            }
          }
        },

        "events" :
        {
          // When an image is selected for upload.
          "changeFileName" : 
            qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE,

          "execute" :
          {
            // When the Ok button is pressed in the cell editor
            "ok" : "Transition_AddOrEditApp_to_AwaitRpcResult_via_ok",
            
            // When the Cancel button is pressed in the cell editor
            "cancel" : "Transition_AddOrEditApp_to_Idle_via_cancel"
          },
          
          // When we received a "completed" event on RPC
          "completed" : "Transition_AddOrEditApp_to_Idle_via_completed"
        }
      });

      // Replace the initial Idle state with this one
      fsm.addState(state);



      // The following transitions have a predicate, so must be listed first


      /*
       * Transition: Idle to ReadyingUpload
       *
       * Cause: "changeFileName" on one of the upload buttons
       *
       * Action:
       *  Begin retrieval of the file contents
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_ReadyingUpload_via_changeFileName",
      {
        "nextState" : "State_ReadyingUpload",

        "context" : this,

        "predicate" : function(fsm, event)
        {
          // Determine if an upload reader is available
          try
          {
            var uploadReader = new qx.bom.FileReader();
            uploadReader.dispose();
            uploadReader = null;
            
            // It is. Accept this transition.
            return true;
          }
          catch(e)
          {
            // There's no upload reader. Tell 'em they're screwed.
            alert("Your browser does not support the required functionality. " +
                  "Please use a recent version of Chrome, Firefox, or Safari.");
            return null;
          }
        },

        "ontransition" : function(fsm, event)
        {
          var             uploadButton;
          var             uploadReader;
          var             uploadElement;
          var             selection;

          // Obtain and save a file reader object
          uploadReader = new qx.bom.FileReader();
          fsm.addObject("uploadReader", uploadReader);

          // Arrange to be told when the file is fully loaded
          uploadReader.addListener("load", fsm.eventListener, fsm);
          uploadReader.addListener("error", fsm.eventListener, fsm);

          // Obtain the uploadButton so we can retrieve its selection
          uploadButton = event.getTarget();

          // Save the upload in progress, for use upon "load" or "error"
          fsm.addObject("uploadButton", uploadButton);

          // Get the selected File object
          uploadElement = uploadButton.getInputElement().getDomElement();
          selection = uploadElement.files[0];

          // Begin reading the file. Request that it be data-URL-encoded.
          uploadReader.readAsDataURL(selection);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "execute" on "Ok" button in cell editor
       *
       * Action:
       *  Issue a remote procedure call to save the App data
       */

      trans = new qx.util.fsm.Transition(
        "Transition_AddOrEditApp_to_AwaitRpcResult_via_ok",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             i;
          var             cellEditor;
          var             cellInfo;
          var             uid;
          var             appTitle;
          var             description;
          var             images;
          var             imageData;
          var             prevAuthors;
          var             categories;
          var             additionalTags;
          var             tags;
          var             source;
          var             sourceFileName;
          var             apk;
          var             apkFileName;
          var             selection;
          var             request;

          // Retrieve the cell editor and cell info
          cellEditor = this.getUserData("cellEditor");
          cellInfo = this.getUserData("cellInfo");

          // Retrieve the values from the cell editor
          uid            = cellEditor.getUserData("uid");
          appTitle       = cellEditor.getUserData("appTitle").getValue();
          description    = cellEditor.getUserData("description").getValue();

          images = cellEditor.getUserData("images");
          imageData = [];
          for (i = 0; i < 3; i++)
          {
            // Retrieve this upload button's file data
            imageData[i] = images[i].getUserData("fileData");
          }

          prevAuthors    = cellEditor.getUserData("prevAuthors").getValue();
          categories     = cellEditor.getUserData("categories");
          additionalTags = cellEditor.getUserData("additionalTags");

          // Retrieve any source and apk upload file data
          source = cellEditor.getUserData("source").getUserData("fileData");
          sourceFileName = cellEditor.getUserData("source").getFileName();
          apk    = cellEditor.getUserData("apk").getUserData("fileData");
          apkFileName = cellEditor.getUserData("apk").getFileName();

          // Create the tags list out of a combination of the categories and
          // additionalTags lists.
          tags = [];

          // Add the selected categories
          selection = categories.getSelection();
          selection.forEach(
            function(item)
            {
              // Add this selection to the tags list
              tags.push(item.getLabel());
            });

          // Add the selected additional tags
          selection = additionalTags.getSelectables();
          selection.forEach(
            function(item)
            {
              // Add this selection to the tags list
              tags.push(item.getLabel());
            });

          
          // Save the request data
          var requestData = 
            {
              title           : appTitle,
              description     : description,
              image1          : imageData[0],
              image2          : imageData[1],
              image3          : imageData[2],
              previousAuthors : prevAuthors,
              source          : source,
              sourceFileName  : sourceFileName,
              apk             : apk,
              apkFileName     : apkFileName,
              tags            : tags
            };

          // Issue a Add Or Edit App call.
          request = this.callRpc(fsm,
                     "aiagallery.features",
                     "addOrEditApp",
                     [ uid, requestData ]);

          // Save the app id in the request data too
          requestData.uid = uid;

          // Save the request data
          request.setUserData("requestData", requestData);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "AddOrEditApp");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: AddOrEditApp to Idle
       *
       * Cause: "execute" on the Cancel button in the cell editor
       *
       * Action:
       *  Cancel editing and close the cell editor
       */

      trans = new qx.util.fsm.Transition(
        "Transition_AddOrEditApp_to_Idle_via_cancel",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             cellEditor;
          var             cellInfo;

          // Retrieve the cell editor and cell info
          cellEditor = this.getUserData("cellEditor");
          cellInfo = this.getUserData("cellInfo");
          
          // Retrieve the table object
          var table = fsm.getObject("table");
          
          // Tell the table we're no longer editing
          table.cancelEditing();

          // close the cell editor
          cellEditor.close();
          
          // If we created this cell editor (cellInfo has only 'table')...
          if (typeof(cellInfo.row) == "undefined")
          {
            // ... then clean it up. (If editing, Table will clean it up.)
            cellEditor.destroy();
            cellEditor = null;
          }

          // We can remove the cell editor and cell info from our own user
          // data now.
          this.setUserData("cellEditor", null);
          this.setUserData("cellInfo", null);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: AddOrEditApp to Idle
       *
       * Cause: "completed" event from RPC
       *
       * Action:
       *  Write the edited or added App data to the table
       */

      trans = new qx.util.fsm.Transition(
        "Transition_AddOrEditApp_to_Idle_via_completed",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             cellEditor;
          var             cellInfo;
          var             rpcRequest;
          var             requestData;
          var             response;
          var             result;
          var             i8n;
          var             table;
          var             dataModel;
          var             permissions;
          var             rowData = {};
          var             statusCodes = [ "Banned", "Pending", "Active" ];

          // Retrieve the RPC request
          rpcRequest = this.popRpcRequest();
          
          // Get the cell editor and the request data from the RPC request
          cellEditor = this.getUserData("cellEditor");
          cellInfo = this.getUserData("cellInfo");
          requestData = rpcRequest.getUserData("requestData");
          response = rpcRequest.getUserData("rpc_response");
          result = response.data.result;
          
          // We'll also need the Table object, from the FSM
          table = fsm.getObject("table");
          
          // Get the table's data model
          dataModel = table.getTableModel();
          
          // Create the row data for the table
          rowData.uid          = result.uid;
          rowData.title        = result.title;
          rowData.description  = result.description;
          rowData.image1       = result.image1;
          rowData.image2       = result.image2;
          rowData.image3       = result.image3;
          rowData.prevAuthors  = result.prevAuthors;
          rowData.tags         = result.tags.join(", ");
          rowData.sourceFileName = result.sourceFileName;
          rowData.apkFileName = result.apkFileName;
          rowData.uploadTime   = result.uploadTime;
          rowData.numLikes     = result.numLikes;
          rowData.numDownloads = result.numDownloads;
          rowData.numViewed    = result.numViewed;
          rowData.status       = statusCodes[result.status];

          // If there's cell info available (they're editing), ...
          if (cellInfo && cellInfo.row !== undefined)
          {
            // ... then save the data in the row being edited.
            dataModel.setRowsAsMapArray([ rowData ], cellInfo.row, true, false);
            
            // Save the data so that the cell editor's getCellEditorValue()
            // method can retrieve it.
            cellEditor.setUserData("newData", rowData);
          }
          else
          {
            // Otherwise, add a new row. Remember map data. Don't clear sorting.
            dataModel.addRowsAsMapArray([ rowData ], null, true, false);
          }
          
          // close the cell editor
          cellEditor.close();
          
          // We can remove the cell editor and cell info from our own user
          // data now.
          this.setUserData("cellEditor", null);
          this.setUserData("cellInfo", null);

          // Dispose of the request
          if (rpcRequest.request)
          {
            rpcRequest.request.dispose();
            rpcRequest.request = null;
          }
        }
      });

      state.addTransition(trans);


      // ------------------------------------------------------------ //
      // State: State_ReadyingUpload
      // ------------------------------------------------------------ //

      state = new qx.util.fsm.State("State_ReadyingUpload",
      {
        "context" : this,

        "events" :
        {
          "load" :
          {
            // When a file to be upload is available to retrieve its content
            "uploadReader" :
              "Transition_ReadyingUpload_to_AddOrEditApp_via_load"
          },

          "error" :
          {
            // When an error occurred retrieving upload file content
            "uploadReader" : 
              "Transition_ReadyingUpload_to_AddOrEditApp_via_error"
          },
          
          // Block (enqueue) other file retrieval while this one is in progress
          "changeFileName" : 
            qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED,

          // Block (enqueue) clicks on Ok or Cancel while in this state
          "execute" :
            qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED
        }
      });

      fsm.addState(state);

      /*
       * Transition: ReadyingUpload to AddOrEditApp
       *
       * Cause: "load" on UploadReader
       *
       * Action:
       *  Save the file contents as user data of the UploadButton object
       */

      trans = new qx.util.fsm.Transition(
        "Transition_ReadyingUpload_to_AddOrEditApp_via_load",
      {
        "nextState" : "State_AddOrEditApp",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the UploadReader object
          var uploadReader = fsm.getObject("uploadReader");

          // Get the currently-in-use upload button
          var uploadButton = fsm.getObject("uploadButton");

          // Retrieve the data URL from the upload button, and save it.
          var content = event.getData().content;
          uploadButton.setUserData("fileData", content);
          
          // Update the image too (if this was an image upload)
          var image = uploadButton.getUserData("image");
          if (image) 
          {
            image.setSource(content);
          }
          
          // We no longer have a currently-in-use upload button or reader
          fsm.removeObject("uploadButton");
          fsm.removeObject("uploadReader");

          // Clean up
          uploadReader.dispose();
          uploadReader = null;
        }
      });

      state.addTransition(trans);

      /*
       * Transition: ReadyingUpload to AddOrEditApp
       *
       * Cause: "error" on UploadReader
       *
       * Action:
       *  Display the error
       */

      trans = new qx.util.fsm.Transition(
        "Transition_ReadyingUpload_to_AddOrEditApp_via_error",
      {
        "nextState" : "State_AddOrEditApp",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the UploadReader object
          var uploadReader = fsm.getObject("uploadReader");

          // FIXME: Find a better mechanism for displaying the error
          alert("ERROR: " + event.progress +
                " (" + event.progress.getMessage() + ")");

          
          // We no longer have a currently-in-use upload button or reader
          fsm.removeObject("uploadButton");
          fsm.removeObject("uploadReader");
        }
      });

      state.addTransition(trans);



      // ------------------------------------------------------------ //
      // State: AwaitRpcResult
      // ------------------------------------------------------------ //

      // Add the AwaitRpcResult state and all of its transitions
      this.addAwaitRpcResultState(module);


      // ------------------------------------------------------------ //
      // Epilog
      // ------------------------------------------------------------ //

      // Listen for our generic remote procedure call event
      fsm.addListener("callRpc", fsm.eventListener, fsm);
    }
  }
});
