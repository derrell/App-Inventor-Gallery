/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Each individual application page's finite state machine
 */
qx.Class.define("aiagallery.module.dgallery.appinfo.Fsm",
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

            // Otherwise, call the standard result handler
            var gui = aiagallery.module.dgallery.appinfo.Gui.getInstance();
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
          // When we get an appear event, retrieve the application info. We
          // only want to do it the first time, though, so we use a predicate
          // to determine if it's necessary.
          "appear"    :
          {
            "main.canvas" : 
              qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
          },

          "execute" :
          {
            "likeItButton" :
              "Transistion_Idle_to_AwaitRpcResult_via_likeIt_button",

            "submitCommentBtn" : 
              "Transition_Idle_to_AwaitRpcResult_via_submit_comment"
          },
          "appearComments" :
          {
            "ignoreMe" : 
              "Transition_Idle_to_AwaitRpcResult_via_getComments"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);


      /*
       * Transition: Idle to AwaitRpcResult
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

        "predicate" : function(fsm, event)
        {
          // Have we already been here before?
          if (fsm.getUserData("noUpdate"))
          {
            // Yup. Don't accept this transition and no need to check further.
            return null;
          }
          
          // Prevent this transition from being taken next time.
          fsm.setUserData("noUpdate", true);
          
          // Accept this transition
          return true;
        },

        "ontransition" : function(fsm, event)
        {
          // Issue the remote procedure call to get the application
          // data. Request that the tags, previous authors, and status be
          // converted to strings for us.
          // 
          // By issuing this call you will update the number of views and
          // the last viewed date.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getAppInfo",
                         [ module.getUserData("app_uid"), true, null]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getAppInfo");
  
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

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: likeItButton has been pressed
       *
       * Action:
       *  Increment likeIt count for an app on database and gui
       */

	trans = new qx.util.fsm.Transition(
	    "Transistion_Idle_to_AwaitRpcResult_via_likeIt_button",
	    {
		"nextState" : "State_AwaitRpcResult",

		"context" : this,

		"ontransition" : function(fsm, event)
		{
                    //Get the event data
                    var         guiWrapper
		    var         likeItWrapper
                    var         appId;
                    var         request;
                    
		    likeItWrapper = fsm.getObject("commentWrapper");  
                    appId = likeItWrapper.getUserData("appId");
                    guiWrapper = fsm.getObject("guiWrapper");

		    request =
			this.callRpc(fsm,
				     "aiagallery.features",
				     "likesPlusOne",
				     [ 
					 //Application ID
					 appId,
					 //The parent thread's UID
					 null
				     ]);

		    // When we get the result, we'll need to know what type of request
		    // we made and update the GUI
		    request.setUserData("requestType", "likeItButton");
                    request.setUserData("guiInfo", guiWrapper);

		}
	    });

      state.addTransition(trans);

      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: submitCommentBtn has been pressed
       *
       * Action:
       *  Add a comment to the database and to the GUI
       */
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_submit_comment",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the event data
          var             commentWrapper;
          var             appId;
          var             commentInput;
          var             guiWrapper;
          var             request;

          commentWrapper = fsm.getObject("commentWrapper");
          appId = commentWrapper.getUserData("appId");
          commentInput = commentWrapper.getUserData("commentInput");
          guiWrapper = fsm.getObject("guiWrapper");

          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "addComment",
                         [ 
                         //Application ID
                         appId,
                         //The text of the comment 
                         commentInput.getValue(), 
                         //The parent thread's UID
                         null
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "addComment");
          request.setUserData("commentString", commentInput);
          request.setUserData("guiInfo", guiWrapper);

        }
      });

      state.addTransition(trans);


      /*
       * Transition: Idle to AwaitRpcResult
       *
       * Cause: 
       *
       * Action:
       *  Gets comments from the database and adds them to the GUI
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_getComments",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the event data
          var             commentWrapper;
          var             appId;
          var             guiWrapper;
          var             request;

          commentWrapper = fsm.getObject("commentWrapper");
          appId = commentWrapper.getUserData("appId");
          guiWrapper = fsm.getObject("guiWrapper");
         
          // Issue the remote procedure call to execute the query
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getComments",
                         [ 
                           appId,
                           null,
                           null
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getComments");
          request.setUserData("guiInfo", guiWrapper);
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
