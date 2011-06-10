/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the development testing page
 */
qx.Class.define("aiagallery.module.mgmt.development.Gui",
{
  type : "singleton",
  extend : qx.core.Object,

  members :
  {
    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             o;
      var             fsm = module.fsm;
      var             canvas = module.canvas;

      
      // Create our items, add them to the FSM and the Canvas
      
      var myTextField = new qx.ui.form.TextField();
      fsm.addObject("queryField", myTextField); 
      canvas.add(myTextField);
      
      var myQueryButton = new qx.ui.form.Button("Query");
      fsm.addObject("queryBtn", myQueryButton);
      canvas.add(myQueryButton);
      // Listening for click
      myQueryButton.addListener("execute", fsm.eventListener, fsm);
            
      var myResultField = new qx.ui.basic.Label();
      myResultField.setValue("Just Got Here");
      fsm.addObject("resultField", myResultField);
      canvas.add(myResultField);
      
      
      

    },

    
    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
  

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "mobileRequest":
        
        fsm.getObject("resultField").setValue(response.data.result.join(", "));
 
        break;

      case "getCategoryTags":
        /*
         * This stuff is not supposed to be here
         * 
        response.data.result.forEach(
          function(tag)
          {
            // Add this tag to the list.
            browse0.add(new qx.ui.form.ListItem(tag));
          });
*/
        break;
        
      case "appQuery":
        /*
         * Not Supposed to be here
         * 
        // Get the gallery object
        gallery = fsm.getObject("gallery");
        
        // Retrieve the app list and list of categories
        apps = response.data.result.apps;
        categories = response.data.result.categories;

        // FIXME: KLUDGE: should be able to update without remove/add!!!
        var parent = gallery.getLayoutParent();
        parent.remove(gallery);
        gallery = new aiagallery.widget.virtual.Gallery(apps);
        gallery.addListener("changeSelection", fsm.eventListener, fsm);
        fsm.addObject("gallery", gallery);
        parent.add(gallery);

        
        if (querySource != "searchBtn"){
          
          // Create a list of tags to exclude from this next level
          excludeTags = [];

          // Get the previous selections
  
          switch(querySource)
          {          
          case "browse1":
            selection = browse1.getSelection();
            if (selection.length > 0)
            {
              excludeTags.push(selection[0].getLabel());
            }
            // fall through

          case "browse0":
            selection = browse0.getSelection();
            if (selection.length > 0)
            {
              excludeTags.push(selection[0].getLabel());
            }
            // fall through
            
          case "browse2":
            // nothing to do
            break;
          }
          
          // Set up tags to be inserted in the list one to the right
          switch(querySource)
          {
          case "browse0":
            nextList = browse1;
            break;
            
          case "browse1":
            nextList = browse2;
            break;
          
          case "browse2":
            // nothing to do
            break;
          }
          // Create a single list of all of the resulting tags
          tagMap = {};
          for (var app = 0; app < apps.length; app++)
          {
            apps[app].tags.forEach(
              function(tag)
              {
                // If this tag is not a category
                tagMap[tag] = true;
              });
          }
          
          // Remove any items from the tag list that are already selected
          excludeTags.forEach(
            function(tag)
            {
              delete tagMap[tag];
            });

          // Convert the map into a tag list, and sort it.
          tagList = qx.lang.Object.getKeys(tagMap).sort();
          
          if (nextList)
          {
            // Add each tag to the next list
            tagList.forEach(
              function(tag)
              {
                nextList.add(new qx.ui.form.ListItem(tag));
              });
          }
        }
*/       
       break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
