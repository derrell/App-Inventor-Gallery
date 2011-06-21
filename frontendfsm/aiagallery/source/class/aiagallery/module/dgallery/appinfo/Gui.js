/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the individual application pages
 */
qx.Class.define("aiagallery.module.dgallery.appinfo.Gui",
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
      var             canvas = module.canvas;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;

      if (response.type == "failed")
      {
        // FIXME: Add the failure to someplace reasonable, instead of alert()
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "getAppInfo":
        var             o;
        var             groupbox;
        var             appInfoContainer;
        var             commentContainer;
        var             scrollContainer;
        var             vbox;
        var             splitpane;
        var             radiogroup;
        var             cpanel;
        var             text;
        var             label;

        // Get the result data. It's an object with all of the application info.
        result = response.data.result;

        // Add a groupbox with the application title
        groupbox = new qx.ui.groupbox.GroupBox(result.title);
        groupbox.setLayout(new qx.ui.layout.Canvas());
        canvas.setLayout(new qx.ui.layout.Canvas());
        canvas.add(groupbox, { edge : 10 });

        // Create a grid layout for the application info
        var layout = new qx.ui.layout.Grid(10, 10);
        layout.setColumnAlign(0, "right", "middle");
        layout.setColumnAlign(1, "left", "middle");
        layout.setColumnAlign(2, "left", "middle");

        layout.setColumnWidth(0, 200);
        layout.setColumnWidth(1, 200);
        layout.setColumnWidth(2, 200);

        layout.setSpacing(10);

        // Create a container for the application info, and use the grid layout.
        appInfoContainer = new qx.ui.container.Composite(layout);
        
        // Yes. We'll create a splitpane, with the application info on the
        // left, and comment viewing on the right.
        splitpane = new qx.ui.splitpane.Pane("horizontal");
        groupbox.add(splitpane, { edge : 10 });

        // Add the application info container to the splitter
        splitpane.add(appInfoContainer, 1);

        // Create a group for the comment collapsable pannel
        radiogroup = new qx.ui.form.RadioGroup();
        radiogroup.setAllowEmptySelection(true);

        // We'll put all of the collapsable panels in a scroll container
        scrollContainer = new qx.ui.container.Scroll();
        splitpane.add(scrollContainer, 1);

        // Put a vbox container in the scroll container
        vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        scrollContainer.add(vbox);

        //Newly added code that implements basic comments in the UI. 
        //The comments are currently unconnected to the database. All 
        //changes made are only in the UI, and are not saved.
        var commentInput = new qx.ui.form.TextField();
        commentInput.setPlaceholder("Type your comment here:");
        var allComments = new qx.ui.container.Composite(
          new qx.ui.layout.VBox());
        var submitComment = new qx.ui.form.Button("Submit Comment");
        submitComment.addListener(
          "execute", 
          function(e) 
          {
            var newComment = commentInput.getValue();
            if (newComment != null) 
            {
              cpanel = new collapsablepanel.Panel(newComment);
              cpanel.setGroup(radiogroup);
              label = new qx.ui.basic.Label(newComment);
              label.set(
                {
                  rich : true,
                  wrap : true
                });
              cpanel.add(label);
              allComments.add(cpanel);
            }
          commentInput.setValue(null);
          }, 
          this);

        // The textfield, all the existing comments, and the submit button
        // get added to the UI.
        vbox.add(allComments);
        vbox.add(commentInput);
        vbox.add(submitComment);

        appInfoContainer.add(new qx.ui.basic.Image(result.image1),
                             { row : 1, column : 1 });
        appInfoContainer.add(new qx.ui.basic.Image(result.image2),
                             { row : 1, column : 0 });
        appInfoContainer.add(new qx.ui.basic.Image(result.image3),
                             { row : 1, column : 2 });
        
        appInfoContainer.add(new qx.ui.basic.Label("Description: "),
                             { row : 2, column : 0 });
        o = new qx.ui.basic.Label(result.description);
        o.set(
          {
            rich : true,
            wrap : true
          });
        appInfoContainer.add(o,
                             { row : 2, column : 1, colSpan : 3 });
        
        [
          { label : "Owner",     data : result.owner,        row : 3 },
          { label : "Uploaded",  data : result.uploadTime,   row : 4 },
          { label : "Tags",      data : result.tags,         row : 5 },
          { label : "Status",    data : result.status,       row : 6 },
          { label : "Likes",     data : result.numLikes,     row : 7 },
          { label : "Downloads", data : result.numDownloads, row : 8 },
          { label : "Views",     data : result.numViewed,    row : 9 },
          { label : "Comments",  data : result.numComments,  row : 10 }
        ].forEach(
          function(field)
          {
            appInfoContainer.add(new qx.ui.basic.Label(field.label + ": "),
                                 { row : field.row, column : 0 });
            appInfoContainer.add(new qx.ui.basic.Label(field.data + ""),
                                 { row : field.row, column : 1, colSpan : 2 });
          });
        
        break;
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
