/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery "my stuff" page
 */
qx.Class.define("aiagallery.module.gallery.mystuff.Gui",
{
  type : "singleton",
  extend : qx.ui.core.Widget,

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
      var             uploadButton;
      
      // Create a layout for this page
      canvas.setLayout(new qx.ui.layout.VBox());

      // Create a button row
      var layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);
      var hBox = new qx.ui.container.Composite(layout);

      // Right-justify the Upload button
      hBox.add(new qx.ui.core.Widget(), { flex : 1 });

      // Create an Upload button
      uploadButton = new uploadwidget.UploadButton("uploadButton", 
                                                   this.tr("Upload"),
                                                   "aiagallery/test.png");
      uploadButton.set(
        {
          maxHeight : 24,
          width     : 100
        });
      hBox.add(uploadButton);
      fsm.addObject("uploadButton", uploadButton);
      uploadButton.addListener("changeFileName", fsm.eventListener, fsm);

      // Add the button row to the page
      canvas.add(hBox);
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
      case "getMyApplicationList":
        break;
        
      case "uploadApplication":
        break;
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
