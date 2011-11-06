/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Gallery home page finite state machine
 */
qx.Class.define("aiagallery.module.dgallery.home.Fsm",
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
            var gui = aiagallery.module.dgallery.home.Gui.getInstance();
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

          // Request to navigate to another page via one of the link boxes
          "click" : "Transition_Idle_to_Idle_via_linkBoxClick",

          // Click on a featured app
          "featuredAppClick" : "Transition_Idle_to_Idle_via_featuredAppClick",
          
          // When we get an appear event, retrieve featured apps
          "appear" :
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
       * Transition: Idle to Idle
       *
       * Cause: A link box is clicked
       *
       * Action:
       *  Switch to appropriate tab
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_linkBoxClick",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Determine on which link box we received the event
          var friendly = fsm.getFriendlyName(event.getTarget());
          
          // Get the subtabs
          var subTabs = qx.core.Init.getApplication().getUserData("subTabs");

          subTabs.getChildren().forEach(
            function(thisPage)
            {
              if (thisPage.getLabel() == friendly)
              {          
                // Select the existing application page
                subTabs.setSelection([ thisPage ]);
              }
            });
        }
      });

      state.addTransition(trans);
            
      /*
       * Transition: Idle to Idle
       *
       * Cause: A featured item is selected
       *
       * Action:
       *  Create (if necessary) and switch to an application-specific tab
       */
      
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_featuredAppClick",
      {
        "nextState" : "State_Idle",
      
        "context" : this,
      
        "ontransition" : function(fsm, event)
        {
          // Get the event data
          var             item = event.getData();

          // Add a module for the specified app
          aiagallery.module.dgallery.appinfo.AppInfo.addAppView(item.uid, 
                                                                item.label);
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
            
          // Issue the remote procedure call to execute the query get the front page ribbons
          var request =
              this.callRpc(fsm,
                         "aiagallery.features",
                         "getHomeRibbonData", [null]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getHomeRibbonData");
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
      // State: <some other state>
      // ------------------------------------------------------------ //

      // put state and transitions here




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
