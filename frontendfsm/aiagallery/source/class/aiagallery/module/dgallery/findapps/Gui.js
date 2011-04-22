/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery "find apps"" page
 */
qx.Class.define("aiagallery.module.dgallery.findapps.Gui",
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
      var             splitpane;
      var             hBox;
      var             vBox;
      var             groupbox;
      var             browse1;
      var             browse2;
      var             browse3;
      var             gallery;

      // Create a splitpane. Top: browse and search; bottom: results
      splitpane = new qx.ui.splitpane.Pane("vertical");
      canvas.add(splitpane, { flex : 1 });

      // Create a horizontal box layout for the top pane
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      splitpane.add(hBox, 1);
      
      // Provide a bit of space at the left
      hBox.add(new qx.ui.core.Spacer(10));

      // Create a set of finder-style multi-level browsing lists
      groupbox = new qx.ui.groupbox.GroupBox("Browse");
      groupbox.setLayout(new qx.ui.layout.HBox());
      groupbox.setContentPadding(0);
      hBox.add(groupbox);

      // create and add the lists
      browse1 = new qx.ui.form.List();
      browse1.setWidth(150);
      groupbox.add(browse1);
      fsm.addObject("browse1", browse1);

      browse2 = new qx.ui.form.List();
      browse2.setWidth(150);
      groupbox.add(browse2);
      fsm.addObject("browse2", browse2);

      browse3 = new qx.ui.form.List();
      browse3.setWidth(150);
      groupbox.add(browse3);
      fsm.addObject("browse3", browse3);

      // Create the search criteria
      groupbox = new qx.ui.groupbox.GroupBox("Search");
      groupbox.set(
        {
          layout         : new qx.ui.layout.HBox(),
          contentPadding : 0
        });
      groupbox.getChildControl("frame").setBackgroundColor("white");
      hBox.add(groupbox, { flex : 1 });

      groupbox.add(new qx.ui.basic.Label("Something to search for"));

      // Provide a bit of space at the right
      hBox.add(new qx.ui.core.Spacer(10));

      // Create a vertical box layout for the bottom pane
      vBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      splitpane.add(vBox, 1);
      
      // Display 
      gallery = new aiagallery.widget.virtual.Gallery();
      vBox.add(gallery, { flex : 1 });
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
      var             browse1;

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
      case "getCategoryTags":
        // Get the first list, where we'll put the list of category tags
        browse1 = fsm.getObject("browse1");
        response.data.result.forEach(
          function(tag)
          {
            // Add this tag to the list.
            browse1.add(new qx.ui.form.ListItem(tag));
          });
        break;
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
