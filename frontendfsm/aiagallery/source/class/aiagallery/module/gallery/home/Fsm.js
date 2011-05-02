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
qx.Class.define("aiagallery.module.gallery.home.Fsm",
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
            var gui = aiagallery.module.gallery.home.Gui.getInstance();
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
          "click" :
          {
            "Find Apps" : "Transition_Idle_to_Idle_via_linkBoxClick",
            
            "Learn" : "Transition_Idle_to_Idle_via_linkBoxClick",
            
            "My Stuff" : "Transition_Idle_to_Idle_via_linkBoxClick"
          },
          
          // When we get an appear event, retrieve the visitor list
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
          // Create criteria list for appQuery
          var criteria =
            {
              type     : "op",
              method   : "and",
              children : []
            };
            
          // Create a criterion to grab only featured apps
          var criterion = 
            {
              type  : "element",
              field : "tags",
              value : "*Featured*"
            };
            
          // Add it to the criteria list
          criteria.children.push(criterion);
          
          // Issue the remote procedure call to execute the query
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "appQuery",
                         [
                           // Root of the criteria tree
                           criteria,
                           
                           // Requested fields and the return field name
                           {
                             uid    : "uid",
                             title  : "label", // remap name for Gallery
                             image1 : "icon",  // remap name for Gallery
                             tags   : "tags"
                           }
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "appQuery");
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
