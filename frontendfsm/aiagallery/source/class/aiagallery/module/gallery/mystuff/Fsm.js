/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Gallery "my stuff" page finite state machine
 */
qx.Class.define("aiagallery.module.gallery.mystuff.Fsm",
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
            var gui = aiagallery.module.gallery.mystuff.Gui.getInstance();
            gui.handleResponse(module, rpcRequest);

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
/*
          "execute" :
          {
            // When the Delete User button is pressed
            "deleteUser" : "Transition_Idle_to_AwaitRpcResult_via_deleteUser",

            // When the Add User button is pressed
            "addUser" : "Transition_Idle_to_AddOrEditUser_via_addUser"
          },
*/

          "changeFileName" :
          {
            // When a file is selected for upload.
            "uploadButton" : 
              "Transition_Idle_to_ReadyingUpload_via_changeFileName"
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
       * Cause: "changeFileName" on uploadButton
       *
       * Action:
       *  Issue the upload request
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_ReadyingUpload_via_changeFileName",
      {
        "nextState" : "State_ReadyingUpload",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             uploadButton;
          var             uploadReader;
          var             uploadElement;
          var             selection;

          // Obtain a file reader object
          uploadReader = new qx.bom.FileReader();
          fsm.addObject("uploadReader", uploadReader);
          
          // Arrange to be told when the file is fully loaded
          uploadReader.addListener("load", fsm.eventListener, fsm);
          uploadReader.addListener("error", fsm.eventListener, fsm);
          
          // Obtain the uploadButton so we can retrieve its selection
          uploadButton = fsm.getObject("uploadButton");

          // Get the selected File object
          uploadElement = uploadButton.getInputElement().getDomElement();
          selection = uploadElement.files[0];

          // Begin reading the file. The data is the File object
          uploadReader.readAsBinaryString(selection);
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
          // Issue the remote procedure call to get the visitor list.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getMyApplicationList");

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getMyApplicationList");
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
              "Transition_ReadyingUpload_to_AwaitRpcResult_via_load"
          },

          "error" :
          {
            // When an error occurred retrieving upload file content
            "uploadReader" : 
              "Transition_ReadyingUpload_to_Idle_via_error"
          },
          
          // When we received a "completed" event on RPC
          "completed" : "Transition_ReadyingUpload_to_Idle_via_completed"
        },
        
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
              var gui = aiagallery.module.gallery.mystuff.Gui.getInstance();
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
        }
      });

      fsm.addState(state);

      /*
       * Transition: ReadyingUpload to AwaitRpcResult
       *
       * Cause: "load" on UploadReader
       *
       * Action:
       *  Issue the remote procedure call to upload an application
       */

      trans = new qx.util.fsm.Transition(
        "Transition_ReadyingUpload_to_AwaitRpcResult_via_load",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the UploadReader object
          var uploadReader = fsm.getObject("uploadReader");

          // Issue the remote procedure call to get the visitor list.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "uploadApplication",
                         [ event.getData().content ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "uploadApplication");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: ReadyingUpload to Idle
       *
       * Cause: "error" on UploadReader
       *
       * Action:
       *  Display the error
       */

      trans = new qx.util.fsm.Transition(
        "Transition_ReadyingUpload_to_Idle_via_error",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the UploadReader object
          var uploadReader = fsm.getObject("uploadReader");

          // FIXME: Find a better mechanism for displaying the error
          alert("ERROR: " + event.progress +
                " (" + event.progress.getMessage() + ")");
        }
      });

      state.addTransition(trans);

      /*
       * Transition: ReadyingUpload to Idle
       *
       * Cause: "completed" on RPC
       *
       * Action:
       *  None
       */

      trans = new qx.util.fsm.Transition(
        "Transition_ReadyingUpload_to_Idle_via_completed",
      {
        "nextState" : "State_Idle"
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
