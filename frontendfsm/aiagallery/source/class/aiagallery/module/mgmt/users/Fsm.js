/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * User management
 */
qx.Class.define("aiagallery.module.mgmt.users.Fsm",
{
  type : "singleton",
  extend : aiagallery.main.AbstractModuleFsm,

  statics :
  {
    /**
     * Start the timer to check for needed page updates.
     *
     * @param fsm {qx.util.fsm.FiniteStateMachine}
     *   The finite state machine in use by this module
     *
     * @param msInterval {Integer}
     *   The number of milliseconds before the timer should expire
     */
    _startTimer : function(fsm, msInterval)
    {
      // First, for good house keeping, ensure no timer exists
      this._stopTimer(fsm);

      // Create a timer instance to expire in the specified amount of time
      var timer = new qx.event.Timer(msInterval);
      timer.addListener("interval", fsm.eventListener, fsm);
      fsm.addObject("timer", timer);
      timer.start();
    },


    /**
     * Stop the update timer.
     *
     * @param fsm {qx.util.fsm.FiniteStateMachine}
     *   The finite state machine in use by this module
     */
    _stopTimer : function(fsm)
    {
      // ... then stop the timer.  Get the timer object.
      var timer = fsm.getObject("timer");

      // If it still exists...
      if (timer)
      {
        // ... then dispose of it.
        timer.dispose();
        fsm.removeObject("timer");
      }
    }
  },


  members :
  {
    buildFsm : function(module)
    {
      var fsm = module.fsm;
      var _module = module;
      var state;
      var trans;

      /*
       * State: Idle
       *
       * Actions upon entry
       *   - if returning from RPC, display the result
       *   - start an interval timer to request updates again in a while
       *
       * Transition on:
       *  "interval" on interval_timer
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

            // Display the result
            var userData = rpcRequest.getUserData("userData");

            // If the caller requested a custom result handler...
            if (userData && userData.resultFunction && userData.resultObject)
            {
              // ... then call it.
              userData.resultFunction.call(userData.resultObject,
                                           module,
                                           rpcRequest,
                                           userData);
            }
            else
            {
              // Otherewise, call the standard result handler
              var gui = aiagallery.module.mgmt.users.Gui.getInstance();
              gui.displayData(module, rpcRequest, userData);
            }

            // Dispose of the request
            rpcRequest.request.dispose();
            rpcRequest.request = null;

            // Restart the timer.
            if (_module.visible)
            {
              // Give it a reasonable interval before we check for updates
              this.constructor._startTimer(fsm, 15000);
            }
          }
        },

        "onexit" : function(fsm, event)
        {
          // If we're not coming right back into this state...
          if (fsm.getNextState() != "State_Idle")
          {
            // ... then stop the timer.
            aiagallery.module.mgmt.users.Fsm._stopTimer(fsm);
          }
        },

        "events" :
        {
/*
          // If the timer expires, send a new request for updates
          "interval"  :
          {
            "timer" :
              "Transition_Idle_to_AwaitRpcResult_via_request_updates"
          },

          "execute" :
          {
            // When user data is saved, via Edit or Add New User
            "save" :
              "Transition_Idle_to_AwaitRpcResult_via_save",

            // When a user is deleted
            "delete" :
              "Transition_Idle_to_AwaitRpcResult_via_delete"
          },
*/

          // Request to call some remote procedure call which is specified by
          // the event data.
          "callRpc" : "Transition_Idle_to_AwaitRpcResult_via_generic_rpc_call",

          // When we get an appear event, start our timer
          "appear"    :
          {
            "main.canvas" :
              "Transition_Idle_to_Idle_via_appear"
          },

          // When we get a disappear event, stop our timer
          "disappear" :
          {
            "main.canvas" :
              "Transition_Idle_to_Idle_via_disappear"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: "execute" on Backup Options "Save" button
       *
       * Action:
       *  Save the options
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_save",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // The event data is a map containing row id and the cellEditor.
          // If this is a new item, the row id will be -1.
          var data = event.getData();
          var rowId = data.rowId;
          var cellEditor = data.cellEditor;

          // ... do stuff here ...

          // Issue a Set Backup Options call
          var request =
            this.callRpc(fsm,
                          "aiagallery",
                          "editTag",
                          [
                            rowId,
                            cellEditor.getUserData("name")
                          ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "editTag");

          // Save the cell editor so it can be closed upon success
          request.setUserData("cellEditor", cellEditor);
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
        "Transition_Idle_to_Idle_via_appear",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          _module.visible = true;

          // Redisplay immediately
          aiagallery.module.mgmt.users.Fsm._startTimer(fsm, 0);
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
          _module.visible = false;
          aiagallery.module.mgmt.users.Fsm._stopTimer(fsm);
        }
      });

      state.addTransition(trans);

      // Add the AwaitRpcResult state and all of its transitions
      this.addAwaitRpcResultState(module);

      // Listen for our generic remote procedure call event
      fsm.addListener("callRpc", fsm.eventListener, fsm);
    }
  }
});
