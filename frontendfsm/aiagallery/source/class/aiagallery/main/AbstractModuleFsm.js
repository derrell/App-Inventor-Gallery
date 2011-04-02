/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */


/**
 * Common facilities for modules' finite state machines.  Each module's FSM
 * should extend this class.
 */
qx.Class.define("aiagallery.main.AbstractModuleFsm",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    // Initialize an instance-specific array for pushing request objects
    this._requests = [];
  },

  members :
  {
    /** An instance-specific array for pushing request objects */
    _requests : null,

    /**
     * Build the finite state machine for this module.
     *
     * @param module {Map}
     *   A map containing information about the module being built. Of key
     *   importance here is that this method must set the 'fsm' field of the
     *   module map to contain the instantiated finite state machine for this
     *   module.
     */
    buildFsm : function(module)
    {
      throw new Error("Module must overload buildFsm() " +
                      "to build its custom finite state machine.");
    },

    /**
     * Add the states and transitions required for the common activities
     * involved in issuing remote procedure calls.
     *
     * @param module {Map}
     *   A map containing at a minimum an 'fsm' field which contains the
     *   finite state machine for the current module.
     *
     * @param blockedEvents {Map}
     *   A map containing member names which are the names of events, and
     *   member values which are themselves maps containing tuples of object
     *   friendly names and actions. The only action that makes sense is the
     *   constant qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED.
     */
    addAwaitRpcResultState : function(module, blockedEvents)
    {
      var fsm = module.fsm;
      var stateInfo;
      var state;
      var trans;

      /*
       * State: AwaitRpcResult
       *
       * Actions upon entry:
       *  - enable any objects in group:
       *    "main.fsmUtils.enable_during_rpc"
       *  - disable any objects in group:
       *    "main.fsmUtils.disable_during_rpc"
       *
       * Actions upon exit:
       *   - disable any objects in group:
       *    "main.fsmUtils.enable_during_rpc"
       *   - enable any objects in group:
       *    "main.fsmUtils.disable_during_rpc"
       *
       * Transition on:
       *  "completed" (on RPC)
       *  "failed" (on RPC)
       *  "execute" on main.fsmUtils.abort_rpc
       */

      stateInfo =
      {
        "context" : this,

        "autoActionsBeforeOnentry" :
        {
          // The name of a function.
          "setEnabled" :
          [
            {
              // We want to enable objects in the group
              // main.fsmUtils.enable_during_rpc
              "parameters" : [ true ],

              // Call this.getObject(<object>).setEnabled(true) on
              // state entry, for each <object> in the group called
              // "main.fsmUtils.enable_during_rpc".
              "groups"     : [ "main.fsmUtils.enable_during_rpc" ]
            },

            {
              // We want to disable objects in the group
              // main.fsmUtils.disable_during_rpc
              "parameters" : [ false ],

              // Call this.getObject(<object>).setEnabled(false) on
              // state entry, for each <object> in the group called
              // "main.fsmUtils.disable_during_rpc".
              "groups"     : [ "main.fsmUtils.disable_during_rpc" ]
            }
          ]
        },

        "autoActionsBeforeOnexit" :
        {
          // The name of a function.
          "setEnabled" :
          [
            {
              // We want to re-disable objects we had enabled, in the group
              // main.fsmUtils.enable_during_rpc
              "parameters" : [ false ],

              // Call this.getObject(<object>).setEnabled(false) on
              // state entry, for each <object> in the group called
              // "main.fsmUtils.enable_during_rpc".
              "groups"     : [ "main.fsmUtils.enable_during_rpc" ]
            },

            {
              // We want to re-enable objects we had disabled, in the group
              // main.fsmUtils.disable_during_rpc
              "parameters" : [ true ],

              // Call this.getObject(<object>).setEnabled(true) on
              // state entry, for each <object> in the group called
              // "main.fsmUtils.disable_during_rpc".
              "groups"     : [ "main.fsmUtils.disable_during_rpc" ]
            }
          ]
        },


        "onentry" : function(fsm, event)
        {
/*
          var bAuthCompleted = false;
*/

          // Change the cursor to indicate RPC in progress
          qx.core.Init.getApplication().constructor.progressCursor(true);

/*
          // See if we just completed an authentication
          if (fsm.getPreviousState() == "State_Authenticate" &&
              event.getType() == "complete") {
            bAuthCompleted = true;
          }
*/

          // If we didn't just complete an authentication and we're coming
          // from some other state...
          if (
/*
            !bAuthCompleted &&
*/
            fsm.getPreviousState() != "State_AwaitRpcResult")
          {
            // ... then push the designated state, or if no designated state,
            // the previous state onto the state stack
            var nextState =
              this.getCurrentRpcRequest().getUserData("nextState");
            fsm.pushState(nextState || false);
          }
        },


        "onexit" : function(fsm, event)
        {
          // If we're returning to the calling state (not going to the
          // Authenticate state)...
          var nextState = fsm.getNextState();

          if (
/*
            nextState != "State_Authenticate" &&
*/
            nextState != "State_AwaitRpcResult")
          {
            // ... then set the cursor back to normal
            qx.core.Init.getApplication().constructor.progressCursor(false);
          }
        },

        "events" :
        {
/*
          "execute"   :
          {
            "main.fsmUtils.abort_rpc" :
              "Transition_AwaitRpcResult_to_AwaitRpcResult_via_button_abort"
          },
*/

          "completed" :
            "Transition_AwaitRpcResult_to_PopStack_via_complete",

          "failed"    :
            qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
        }
      };

      // If there are blocked events specified...
      if (blockedEvents)
      {
        // ... then add them to the state info events object
        for (var blockedEvent in blockedEvents)
        {
          // Ensure it's not already there.  Avoid programmer headaches.
          if (stateInfo["events"][blockedEvent]) {
            throw new Error("Attempt to add blocked event " +
                            blockedEvent +
                            " but it is already handled");
          }

          // Add the event.
          stateInfo["events"][blockedEvent] = blockedEvents[blockedEvent];
        }
      }

      state = new qx.util.fsm.State("State_AwaitRpcResult", stateInfo);
      fsm.addState(state);

      /*** Transitions that use a PREDICATE appear first ***/
      /*
       * Transition: AwaitRpcResult to GetAuthInfo
       *
       * Cause: "failed" (on RPC) where reason is PermissionDenied
       */

/*
      trans = new qx.util.fsm.Transition(
        "Transition_AwaitRpcResult_to_Authenticate",
        {
          "context" : this,

          "nextState" : "State_Authenticate",

          "predicate" : function(fsm, event)
          {
            // Get the request object
            var rpcRequest = this.getCurrentRpcRequest();

            // This isn't the correct transition for response to authenticate.
            if (rpcRequest.service == "util.authenticate")
            {
              return false;
            }

            var error = event.getData(); // retrieve the JSON-RPC error

            // Did we get get origin=Server, and either
            // code=NotLoggedIn or code=SessionExpired ?
            var origins = aiagallery.main.AbstractModuleFsm.JsonRpc_Origin;
            var serverErrors =
              aiagallery.main.AbstractModuleFsm.JsonRpc_ServerError;

            if (error.origin == origins.Server &&
                error.code == serverErrors.PermissionDenied)
            {
              return true;
            }

            // fall through to next transition, also for "failed"
            return false;
          },

          "ontransition" : function(fsm, event)
          {
            var caption;

            var error = event.getData(); // retrieve the JSON-RPC error
            var serverErrors =
              aiagallery.main.AbstractModuleFsm.JsonRpc_ServerError;

            // Retrieve the modal authentication window.
            var loginWin = aiagallery.main.Authenticate.getInstance();

            // Ensure that it's saved in the current finite state machine
            loginWin.addToFsm(fsm);

            // Set the caption
            loginWin.setCaption("Please log in");

            // Open the authentication window
            loginWin.open();
          }
        });

      state.addTransition(trans);
*/


      /*
       * Transition: AwaitRpcResult to PopStack
       *
       * Cause: "failed" (on RPC)
       */
      trans = new qx.util.fsm.Transition(
        "Transition_AwaitRpcResult_to_PopStack_via_failed",
        {
          "context" : this,

          "nextState" :
            qx.util.fsm.FiniteStateMachine.StateChange.POP_STATE_STACK,

          "ontransition" : function(fsm, event)
          {
            // Get the request object
            var rpcRequest = this.getCurrentRpcRequest();

            // Generate the result for a completed request
            rpcRequest.setUserData("rpc_response",
                                   {
                                     type : "failed",
                                     data : event.getData()
                                   });
          }
        });

      state.addTransition(trans);

      /*** Remaining transitions are accessed via the jump table ***/


      /*
       * Transition: AwaitRpcResult to AwaitRpcResult
       *
       * Cause: "execute" on main.fsmUtils.abort_rpc
       */
/*
      trans = new qx.util.fsm.Transition(
        "Transition_AwaitRpcResult_to_AwaitRpcResult_via_button_abort",
        {
          "context" : this,

          "nextState" : "State_AwaitRpcResult",

          "ontransition" : function(fsm, event)
          {
            // Get the request object
            var rpcRequest = this.getCurrentRpcRequest();

            // Issue an abort for the pending request
            rpcRequest.request.abort();
          }
        });

      state.addTransition(trans);
*/


      /*
       * Transition: AwaitRpcResult to PopStack
       *
       * Cause: "complete" (on RPC)
       */

      trans = new qx.util.fsm.Transition(
        "Transition_AwaitRpcResult_to_PopStack_via_complete",
        {
          "context" : this,

          "nextState" :
            qx.util.fsm.FiniteStateMachine.StateChange.POP_STATE_STACK,

          "ontransition" : function(fsm, event)
          {
            // Get the request object
            var rpcRequest = this.getCurrentRpcRequest();

            // Generate the result for a completed request
            rpcRequest.setUserData("rpc_response",
                                   {
                                     type : "complete",
                                     data : event.getData()
                                   });
          }
        });

      state.addTransition(trans);


      /*
       * State: Authenticate
       *
       * Transition on:
       *  "execute" on login_button
       */
/*
      state = new qx.util.fsm.State("State_Authenticate",
      {
        "context" : this,

        "onentry" : function(fsm, event)
        {
          // Retrieve the login window object
          var win = fsm.getObject("login_window");

          // Clear the password field
          win.getUserData("password").setValue("");

          // Retrieve the current RPC request
          var rpcRequest = this.getCurrentRpcRequest();

          // Did we just return from an RPC request and was it a login request?
          if (fsm.getPreviousState() == "State_AwaitRpcResult" &&
              rpcRequest.service == "util.authenticate" &&
              rpcRequest.params.length > 1 &&
              rpcRequest.params[1] == "login")
          {
            // Yup.  Display the result.  Pop the old request off the stack
            var loginRequest = this.popRpcRequest();

            // Retrieve the result
            var rpc_response = loginRequest.getUserData("rpc_response");

            // Did we succeed?
            if (rpc_response.type == "failed")
            {
              // Nope.  Just reset the caption, and remain in this state.
              win.setCaption("Login Failed.  Try again.");
            }
            else
            {
              // Login was successful.  Generate an event that will transition
              // us back to the AwaitRpcResult state to again await the result
              // of the original RPC request.
              win.fireEvent("complete");

              // Reissue the original request.  (We already popped the login
              // request off the stack, so the current request is the original
              // one.)
              var origRequest = this.getCurrentRpcRequest();

              // Retrieve the RPC object
              var rpc = fsm.getObject("main.rpc");

              // Set the service name
              rpc.setServiceName(origRequest.service);

              // Reissue the request
              var f = qx.io.remote.Rpc.prototype.callAsyncListeners;
              origRequest.request = f.apply(rpc, origRequest.params);

              // Clear the password field. This window will be reused.
              win.getUserData("password").setValue("");

              // Close the login window
              win.close();
            }

            // Dispose of the login request
            loginRequest.request.dispose();
            loginRequest.request = null;
          }
        },

        "events" :
        {
          "execute"  :
          {
            "login_button" :
              "Transition_Authenticate_to_AwaitRpcResult_via_button_login"
          },

          "complete" :
          {
            "login_window" :
              "Transition_Authenticate_to_AwaitRpcResult_via_complete"
          }
        }
      });

      fsm.addState(state);
*/


      /*
       * Transition: Authenticate to AwaitRpcResult
       *
       * Cause: "execute" on login_button
       */
/*
      trans = new qx.util.fsm.Transition(
        "Transition_Authenticate_to_AwaitRpcResult_via_button_login",
        {
          "context" : this,

          "nextState" : "State_AwaitRpcResult",

          "ontransition" : function(fsm, event)
          {
            // Retrieve the login window object
            var win = fsm.getObject("login_window");

            // Issue a Login call
            this.callRpc(fsm,
                          "util.authenticate",
                          "login",
                          [
                            win.getUserData("userName").getValue(),
                            win.getUserData("password").getValue()
                          ]);
          }
        });

      state.addTransition(trans);
*/


      /*
       * Transition: Authenticate to AwaitRpcResult
       *
       * Cause: "complete" on login_window
       *
       * We've already re-issued the original request, so we have nothing to
       * do here but transition back to the AwaitRpcResult state to again
       * await the result of the original request.
       */
/*
      trans = new qx.util.fsm.Transition(
        "Transition_Authenticate_to_AwaitRpcResult_via_complete",
        {
          "context" : this,

          "nextState" : "State_AwaitRpcResult"
        });

      state.addTransition(trans);
*/
    },


    /**
     * Issue a remote procedure call.
     *
     * @param fsm {qx.util.fsm.FiniteStateMachine}
     *   The finite state machine issuing this remote procedure call.
     *
     * @param service {String}
     *   The name of the remote service which provides the specified method.
     *
     * @param method {String}
     *   The name of the method within the specified service.
     *
     * @param params {Array}
     *   The parameters to be passed to the specified method.
     *
     * @param userData {Object || null}
     *   Data provided by the caller of the remote procedure call, which is
     *   attached as user data to the Request object and can be retrieved
     *   upon completion of the call (i.e. while processing the result)
     *
     * @return {Object}
     *   The request object for the just-issued RPC request.
     */
    callRpc : function(fsm, service, method, params, userData)
    {
      // Create an object to hold a copy of the parameters.  (We need a
      // qx.core.Object() to be able to store this in the finite state
      // machine.)
      var rpcRequest = new qx.core.Object();

      // Save the service name
      rpcRequest.service = service;

      // Copy the parameters; we'll prefix our copy with additional params
      rpcRequest.params = params.slice(0);

      // Prepend the method
      rpcRequest.params.unshift(method);

      // Prepend the flag indicating to coalesce failure events
      rpcRequest.params.unshift(true);

      // Add the user data to the request
      rpcRequest.setUserData("userData", userData);

      // Retrieve the RPC object */
      var rpc = fsm.getObject("main.rpc");

      // Set the service name
      rpc.setServiceName(rpcRequest.service);

      // The default timeout is only 5 seconds.  That may not be long enough
      // for some longish requests
      rpc.setTimeout(30000);

      // Issue the request
      rpcRequest.request =
        qx.io.remote.Rpc.prototype.callAsyncListeners.apply(rpc,
                                                            rpcRequest.params);

      // Make the rpc request object available to the AwaitRpcResult state
      this.pushRpcRequest(rpcRequest);

      // Give 'em what they came for
      return rpcRequest;
    },


    /**
     * Push an RPC request onto the request stack.
     *
     * @param rpcRequest {var}
     *   The RPC request to be pushed onto the request stack
     *
     * @return {void}
     */
    pushRpcRequest : function(rpcRequest)
    {
      this._requests.push(rpcRequest);
    },


    /**
     * Retrieve the most recent RPC request from the request stack and pop the
     * stack.
     *
     * @return {Object}
     *   The rpc request object from the top of the request stack
     *
     * @throws
     *   Error if the RPC request stack is empty
     */
    popRpcRequest : function()
    {
      if (this._requests.length == 0)
      {
        throw new Error("Attempt to pop an RPC request when list is empty.");
      }

      var rpcRequest = this._requests.pop();
      return rpcRequest;
    },




    /**
     * Retrieve the most recent RPC request.
     *
     * @return {Object}
     *   The rpc request object at the top of the request stack
     *
     * @throws
     *   Error if the RPC request stack is empty
     */
    getCurrentRpcRequest : function()
    {
      if (this._requests.length == 0)
      {
        throw new Error("Attempt to retrieve an RPC " +
                        "request when list is empty.");
      }

      return this._requests[this._requests.length - 1];
    }
  }
});
