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
      var             result;

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
        
        // default, result didn't work
        result = "Bad Query!!!";
        
        if (response.data.result)
        {
         console.log(response.data.result);
         // Or on success, change result
         result = "Response Logged to Console"; 
          
        }
        
        fsm.getObject("resultField").setValue(result); 
        
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
