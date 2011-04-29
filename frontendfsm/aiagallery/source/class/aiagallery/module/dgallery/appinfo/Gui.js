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
      var             o;
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      
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
        var             appInfoContainer;
        var             commentContainer;
        var             splitter;

        // Get the result data. It's an object with all of the application info.
        result = response.data.result;
        
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
        
        // Do we have any comments?
        if (result.numComments > 0)
        {
          // Yes. We'll create a splitter, with the application info on the
          // left, and comment viewing on the right.
        }
        else
        {
          // No comments, so put the application info directly into the canvas.
          canvas.setLayout(new qx.ui.layout.Canvas());
          canvas.add(appInfoContainer, { edge : 10 });
        }

        o = new qx.ui.basic.Label(result.title);
        o.setWrap(true);
        appInfoContainer.add(o,
                   { row : 0, column : 1 });
        
        appInfoContainer.add(new qx.ui.basic.Image(result.image1),
                             { row : 1, column : 1 });
        appInfoContainer.add(new qx.ui.basic.Image(result.image2),
                             { row : 1, column : 0 });
        appInfoContainer.add(new qx.ui.basic.Image(result.image3),
                             { row : 1, column : 2 });
        
        appInfoContainer.add(new qx.ui.basic.Label("Description: "),
                             { row : 2, column : 0 });
        o = new qx.ui.basic.Label(result.description);
        o.setWrap(true);
        appInfoContainer.add(o,
                             { row : 2, column : 1, colSpan : 3 });
        
        [
          { label : "Uploaded",  data : result.uploadTime,   row : 3 },
          { label : "Tags",      data : result.tags,         row : 4 },
          { label : "Status",    data : result.status,       row : 5 },
          { label : "Likes",     data : result.numLikes,     row : 6 },
          { label : "Downloads", data : result.numDownloads, row : 7 },
          { label : "Views",     data : result.numViewed,    row : 8 },
          { label : "Comments",  data : result.numComments,  row : 9 }
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
