/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * User management finite state machine
 */
qx.Class.define("aiagallery.module.mgmt.users.Fsm",
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
            var gui = aiagallery.module.mgmt.users.Gui.getInstance();
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
          fsm.getObject("deleteUser").setEnabled(bHasSelection);
        },

        "events" :
        {
          "execute" :
          {
            // When the Delete User button is pressed
            "deleteUser" : "Transition_Idle_to_AwaitRpcResult_via_deleteUser",

            // When the Add User button is pressed
            "addUser" : "Transition_Idle_to_AddOrEditUser_via_addUser"
          },

          "cellEditorOpening" :
          {
            // When a cell is double-clicked, or the Edit button is pressed,
            // either of which open a cell editor for the row data
            "table" : "Transition_Idle_to_AddOrEditUser_via_cellEditorOpening"
          },

          // Request to call some remote procedure call which is specified by
          // the event data.
          "callRpc" : "Transition_Idle_to_AwaitRpcResult_via_generic_rpc_call",

          // When we get an appear event, retrieve the visitor list
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
       * Cause: "execute" on "Delete User" button
       *
       * Action:
       *  Issue a remote procedure call to delete the selected user
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_delete",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Determine what user is selected for deletion. We're in
          // single-selection mode, so we can easily reference into the
          // selection array.
          var table = fsm.getObject("table");
          var selectionModel = table.getSelectionModel();
          var selection = selectionModel.getSelectedRanges()[0].minIndex;
          var data = table.getTableModel().getData()[selection];

          // Issue a Delete Visitor call
          var request =
            this.callRpc(fsm,
                          "aiagallery.features",
                          "deleteVisitor",
                          [
                            data[1] // the email address is their user id
                          ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "deleteVisitor");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to AddOrEditUser
       *
       * Cause: "execute" on "Add User" button
       *
       * Action:
       *  Open an empty editor to add a new user
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AddOrEditUser_via_addUser",
      {
        "nextState" : "State_AddOrEditUser",

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
       * Transition: Idle to AddOrEditUser
       *
       * Cause: "cellEditorOpening" on the Table. This can occur as a result
       * of either a press of the "Edit" button, or by double-clicking on the
       * row to be edited.
       *
       * Action:
       *  Save the cell editor, to later access its contents
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AddOrEditUser_via_cellEditorOpening",
      {
        "nextState" : "State_AddOrEditUser",

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
          // Issue the remote procedure call to get the visitor list. Request
          // that the permissions and status be converted to strings for us.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getVisitorList",
                         [ true ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getVisitorList");
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
//          aiagallery.module.mgmt.users.Fsm._stopTimer(fsm);
        }
      });

      state.addTransition(trans);

      // ------------------------------------------------------------ //
      // State: AddOrEditUser
      // ------------------------------------------------------------ //

      /*
       * State: AddOrEditUser
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

      state = new qx.util.fsm.State("State_AddOrEditUser",
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
              var gui = aiagallery.module.mgmt.users.Gui.getInstance();
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

            // Dispose of the request
            if (rpcRequest.request)
            {
              rpcRequest.request.dispose();
              rpcRequest.request = null;
            }
          }
        },

        "events" :
        {
          "execute" :
          {
            // When the Ok button is pressed in the cell editor
            "ok" : "Transition_AddOrEditUser_to_AwaitRpcResult_via_ok",
            
            "cancel" : "Transition_AddOrEditUser_to_Idle_via_cancel"
          },
          
          // When we received a "completed" event on RPC
          "completed" : "Transition_AddOrEditUser_to_Idle_via_completed"
        }
      });

      // Replace the initial Idle state with this one
      fsm.addState(state, true);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "execute" on "Ok" button in cell editor
       *
       * Action:
       *  Issue a remote procedure call to save the User data
       */

      trans = new qx.util.fsm.Transition(
        "Transition_AddOrEditUser_to_AwaitRpcResult_via_ok",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             cellEditor;
          var             cellInfo;
          var             name;
          var             email;
          var             selection;
          var             internal = { permissions : [], status : null };
          var             i8n = { permissions : [], status : null };
          var             request;

          // Retrieve the cell editor and cell info
          cellEditor = this.getUserData("cellEditor");
          cellInfo = this.getUserData("cellInfo");

          // Retrieve the values from the cell editor
          name = cellEditor.getUserData("name").getValue();
          email = cellEditor.getUserData("email").getValue();
          selection = cellEditor.getUserData("permissions").getSelection();
          selection.forEach(
            function(item)
            {
              // Add to our permission list the "internal" (English) permission
              internal.permissions.push(item.getUserData("internal"));
              
              // Also track the translated string
              i8n.permissions.push(item.getLabel());
            });
          selection = cellEditor.getUserData("status").getSelection()[0];
          internal.status = selection.getUserData("internal");
          i8n.status = selection.getLabel();
          
          // Save the request data
          var requestData = 
            {
              email : email,
              permissions : internal.permissions,
              status : internal.status 
            };

          // Issue a Add Or Edit Visitor call.
          request = this.callRpc(fsm,
                     "aiagallery.features",
                     "addOrEditVisitor",
                     [ name, requestData ]);

          // Save the name in the request data too
          requestData.name = name;

          // Save the request data
          request.setUserData("requestData", requestData);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "AddOrEditVisitor");

          // Save the cell editor so it can be closed upon success
          request.setUserData("cellEditor", cellEditor);
          
          // Save the translated permissions and status too
          request.setUserData("i8n", i8n);
        }
      });

      state.addTransition(trans);

      /*
       * Transition: AddOrEditUser to Idle
       *
       * Cause: "execute" on the Cancel button in the cell editor
       *
       * Action:
       *  Cancel editing and close the cell editor
       */

      trans = new qx.util.fsm.Transition(
        "Transition_AddOrEditUser_to_Idle_via_cancel",
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
       * Transition: AddOrEditUser to Idle
       *
       * Cause: "completed" event from RPC
       *
       * Action:
       *  Write the edited or added User data to the table
       */

      trans = new qx.util.fsm.Transition(
        "Transition_AddOrEditUser_to_Idle_via_completed",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             cellEditor;
          var             cellInfo;
          var             rpcRequest;
          var             requestData;
          var             i8n;
          var             table;
          var             dataModel;
          var             permissions;
          var             rowData = [];

          // Retrieve the RPC request
          rpcRequest = this.popRpcRequest();
          
          // Get the cell editor and the request data from the RPC request
          cellEditor = rpcRequest.getUserData("cellEditor");
          cellInfo = rpcRequest.getUserData("cellInfo");
          requestData = rpcRequest.getUserData("requestData");
          i8n = rpcRequest.getUserData("i8n");
          
          // We'll also need the Table object, from the FSM
          table = fsm.getObject("table");
          
          // Get the table's data model
          dataModel = table.getTableModel();
          
          // Create the row data for the table
          rowData.push(requestData.name);
          rowData.push(requestData.email);

          // Munge the permissions from an array into a comma-separated string,
          // and add it it to the row data
          permissions = i8n.permissions.join(", ");
          rowData.push(permissions);
          
          // Add the translated status to the row data
          rowData.push(i8n.status);

          // If there's cell info available (they're editing), ...
          if (cellInfo && cellInfo.row)
          {
            // ... then save the data in the row being edited.
            dataModel.setRows(rowData, cellInfo.row, false);
          }
          else
          {
            // Otherwise, add a new row. Do not clear sorting.
            dataModel.addRows(rowData, null, false);
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
      // State: AwaitRpcResult
      // ------------------------------------------------------------ //

      // Add the AwaitRpcResult state and all of its transitions
      this.addAwaitRpcResultState(module);


      // ------------------------------------------------------------ //
      // Prolog
      // ------------------------------------------------------------ //

      // Listen for our generic remote procedure call event
      fsm.addListener("callRpc", fsm.eventListener, fsm);
    }
  }
});
