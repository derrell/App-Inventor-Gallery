/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
require(aiagallery.module.dgallery.appinfo.AppInfo)
 */

/**
 * Gallery "find apps" page finite state machine
 */
qx.Class.define("aiagallery.module.dgallery.findapps.Fsm",
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
            var gui = aiagallery.module.dgallery.findapps.Gui.getInstance();
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
          "changeSelection" :
          {
            // When a finder selection is made in the first list
            "browse0" : "Transition_Idle_to_AwaitRpcResult_via_browse",

            // When a finder selection is made in the second list
            "browse1" : "Transition_Idle_to_AwaitRpcResult_via_browse",

            // When a finder selection is made in the third list
            "browse2" : "Transition_Idle_to_AwaitRpcResult_via_browse",
            
            "gallery" : "Transition_Idle_to_Idle_via_gallerySelection"

          },
          
          "execute" :
          {
            
            "searchBtn" : "Transition_Idle_to_AwaitRpcResult_via_search"
            
          },
          
          // When we get an appear event, retrieve the category tags list. We
          // only want to do it the first time, though, so we use a predicate
          // to determine if it's necessary.
          "appear"    :
          {
            "main.canvas" : 
              qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
          },

          // When we get a disappear event
          "disappear" :
          {
            "main.canvas" : "Transition_Idle_to_Idle_via_disappear"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);


      // The following transitions have a predicate, so must be listed first

      /*
       * Transition: Idle to Idle
       *
       * Cause: "appear" on canvas
       *
       * Action:
       *  If this is the very first appear, retrieve the category list.
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
          // Issue the remote procedure call to get the list of category tags.
          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getCategoryTags",
                         []);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "getCategoryTags");
        }
      });

      state.addTransition(trans);


      // Remaining transitions are accessed via the jump table

      /*
       * Transition: Idle to Idle
       *
       * Cause: "changeSelection" on one of the Browse finder's lists
       *
       * Action:
       *  Initiate a request for the list of  matching applications.
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_browse",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             i;
          var             browse;
          var             browse0;
          var             browse1;
          var             browse2;
          var             criteria;
          var             criterium;
          var             and;
          var             request;
          var             selection;

          // Create an array of the lists
          browse0 = fsm.getObject("browse0");
          browse1 = fsm.getObject("browse1");
          browse2 = fsm.getObject("browse2");
          browse = [ browse0, browse1, browse2 ];

          // Determine on which browse list we received the event
          var friendly = fsm.getFriendlyName(event.getTarget());
          
          // Clear lists beyond this one
          switch(friendly)
          {
          case "browse0":
            browse1.removeAll();
            // fall through
            
          case "browse1":
            browse2.removeAll();
            // fall through
            
          case "browse2":
            // nothing to do
          }

          // We're building a series of AND criteria
          criteria =
            {
              type     : "op",
              method   : "and",
              children : []
            };
          
          // Find the selection in each list and generate a criterium
          for (i = 0; i < browse.length; i++)
          {
            // Get this list's selection
            selection = browse[i].getSelection();
            
            // If there's a selection...
            if (selection.length > 0)
            {
              // Create a criterum element
              criterium = 
                {
                  type  : "element", 
                  field : "tags", 
                  value : selection[0].getLabel()
                };
              
              // Add it to the list of criteria being ANDed
              criteria.children.push(criterium);
            }
          }

          // Issue the remote procedure call to execute the query
          request =
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
          
          // We'll also need to know where the request originated
          request.setUserData("querySource", friendly);

        }
      });

      state.addTransition(trans);


        /*
       * Transition: Idle to Awaiting RPC Result
       *
       * Cause: "Search" button pressed
       *
       * Action:
       *  Initiate a request for the list of  matching applications.
       */
        
        //FIXME: I am commenting out large blocks of code i don't think I'll need while I work.
        //FIXME: this is because I used the Transition..._via_browse as a template
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_search",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             i;
          var             browse;
          var             browse0;
          var             browse1;
          var             browse2;
          var             criteria;
          var             criterium;
          var             and;
          var             request;
          var             selection;

          // Create an array of the lists

          // Determine on which browse list we received the event
          var friendly = fsm.getFriendlyName(event.getTarget());
          
          //FIXME: Want to use this to clear all Finder lists on search event
          //FIXME: Keep browse0 populated but def. remove its selection
          fsm.getObject("browse1").removeAll();
          fsm.getObject("browse2").removeAll();
          fsm.getObject("browse0").resetSelection();
            
          // We're building a series of AND criteria
          criteria =
            {
              type     : "op",
              method   : "and",
              children : []
            };
          
          //  Aggregating all of the form information for the search.
          
          criterium = 
            {
              type  : "element", 
              field : "tags", 
              value : fsm.getObject("myTextBox").getValue()
            };
              
          // Add it to the list of criteria being ANDed
          criteria.children.push(criterium);


          // Issue the remote procedure call to execute the query
          request =
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
          
          // And where that request came from.
          request.setUserData("querySource", friendly);

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: An item is selected from the gallery
       *
       * Action:
       *  Create (if necessary) and switch to an application-specific tab
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_gallerySelection",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          // Get the event data
          var             eventData = event.getData();
          var             item = eventData.item;
          var             app;
          var             moduleList;

          // Get the main tab view
          var mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");
          
          // See if there's already a tab for this application
          var page = null;
          mainTabs.getChildren().forEach(
            function(thisPage)
            {
              var uid = thisPage.getUserData("app_uid");
              if (uid == item.uid)
              {
                page = thisPage;
          
                // Select the existing application page
                mainTabs.setSelection([ page ]);
              }
            });
          
          // If we didn't find an existing tab, create a new one.
          if (! page)
          {
            // Create a new module (tab) for this application
            app = new aiagallery.main.Module(
                    item.label,
                    null,
                    item.label,
                    aiagallery.module.dgallery.appinfo.AppInfo,
                    [
                      function(menuItem, page, subTabs)
                      {
                        // Keep track of which UID this tab applies to
                        page.setUserData("app_uid", item.uid);

                        // Allow the user to close this tab
                        page.setShowCloseButton(true);

                        // Select the new application page
                        mainTabs.setSelection([ page ]);
                      }
                    ]);
            
            // Transmit the UID of this module */
            app.setUserData("app_uid", item.uid);
            
            // Start up the new module
            moduleList = {};
            moduleList[item.label] = {};
            moduleList[item.label][item.label] = app;
            aiagallery.Application.addModules(moduleList);
          }
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
