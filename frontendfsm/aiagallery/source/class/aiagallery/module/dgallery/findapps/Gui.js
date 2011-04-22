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
      var             list;
      var             browse;
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

      // create and add the lists. Store them in an array.
      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse0", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse1", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse2", list);

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
      fsm.addObject("gallery", gallery);
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
      var             browse0;
      var             gallery;

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
        browse0 = fsm.getObject("browse0");
        response.data.result.forEach(
          function(tag)
          {
            // Add this tag to the list.
            browse0.add(new qx.ui.form.ListItem(tag));
          });
        break;
        
      case "appQuery":
        gallery = fsm.getObject("gallery");
        var parent = gallery.getLayoutParent();
        parent.remove(gallery);
        gallery =
          new aiagallery.widget.virtual.Gallery(response.data.result.apps);
        parent.add(gallery);
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
