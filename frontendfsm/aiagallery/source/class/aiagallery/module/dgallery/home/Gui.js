/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery home page
 */
qx.Class.define("aiagallery.module.dgallery.home.Gui",
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
      
      // Specify overall page layout
      var layout = new qx.ui.layout.VBox();
      canvas.setLayout(layout);
      
      // Create the top row (welcome and general info about AIA/Gallery)
      var welcomeLayout = new qx.ui.layout.HBox();
      welcomeLayout.setSpacing(20);
      var welcomeRow = new qx.ui.container.Composite(welcomeLayout);
      welcomeRow.setPadding(20);
      
      // Create an image (temporary one for now)
      var homeImage = new qx.ui.basic.Image("aiagallery/homepage.png");
      welcomeRow.add(homeImage);

      // Create a welcome message      
      var message = new qx.ui.basic.Label();
      message.set(
        {
          value         : "<h2>Welcome to the App Inventor for Android Community Gallery!</h2>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis arcu ut velit ullamcorper mattis in quis metus. Phasellus leo mi, dignissim non consectetur sed, eleifend ut lacus. Vestibulum ac ante sed diam blandit tempus commodo eu erat. Vestibulum malesuada molestie sodales. Vivamus gravida congue ultricies. Vivamus imperdiet dignissim viverra. Praesent eget leo vitae quam suscipit imperdiet quis eget turpis. Curabitur lorem quam, dapibus at vestibulum at, malesuada eu justo. Proin mi quam, sagittis sit amet ornare ac, tempus quis erat. Vestibulum non orci at orci ultricies consectetur. Cras est augue, ornare quis condimentum eu, fringilla elementum tortor. Nulla pharetra faucibus luctus.",
          rich          : true,
          minWidth      : 150,
          allowStretchX : true,
        });
      welcomeRow.add(message, { flex : 1 });
      // Add the welcome row to the page
      canvas.add(welcomeRow);
      
      // Create a row of links to the other main tabs
      var linkRowLayout = new qx.ui.layout.HBox();
      linkRowLayout.setSpacing(20);
      var linkRow = new qx.ui.container.Composite(linkRowLayout);
      linkRow.setPadding(20);

      var findAppsLayout = new qx.ui.layout.HBox();
      findAppsLayout.set(
        {
          spacing : 20,
          alignY  : "middle"
        });
      var findApps = new qx.ui.container.Composite(findAppsLayout);
      
      // description of Find Apps page
      var findAppsLabel = new qx.ui.basic.Label();
      findAppsLabel.set(
        {
          value      : "<b>Find Apps</b><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis arcu ut velit ullamcorper mattis in quis metus.",
          rich       : true,
          width      : 200
        });
        
      // temporary icon for Find Apps page until we make a real one
      var findAppsImage = new qx.ui.basic.Image("aiagallery/test.png");
      
      findApps.add(findAppsLabel);
      findApps.add(findAppsImage);
      linkRow.add(findApps);

      // Add spacer
      linkRow.add(new qx.ui.core.Widget(), { flex : 1 });
            
      var learnLayout = new qx.ui.layout.HBox();
      learnLayout.set(
        {
          spacing : 20,
          alignY  : "middle"
        });
      var learn = new qx.ui.container.Composite(learnLayout);
      
      // description of Learn page
      var learnLabel = new qx.ui.basic.Label();
      learnLabel.set(
        {
          value : "<b>Learn</b><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis arcu ut velit ullamcorper mattis in quis metus.",
          rich  : true,
          width : 200
        });
        
      // temporary icon for Learn page until we make a real one
      var learnImage = new qx.ui.basic.Image("aiagallery/test.png");
      
      learn.add(learnLabel);
      learn.add(learnImage);
      linkRow.add(learn);
      
      // Add spacer
      linkRow.add(new qx.ui.core.Widget(), { flex : 1 });
      
      var myStuffLayout = new qx.ui.layout.HBox();
      myStuffLayout.set(
        {
          spacing : 20,
          alignY  : "middle"
        });
      var myStuff = new qx.ui.container.Composite(myStuffLayout);
      
      // description of myStuff page
      var myStuffLabel = new qx.ui.basic.Label();
      myStuffLabel.set(
        {
          value : "<b>My Stuff</b><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis arcu ut velit ullamcorper mattis in quis metus.",
          rich  : true,
          width : 200
        });
        
      // temporary icon for myStuff page until we make a real one
      var myStuffImage = new qx.ui.basic.Image("aiagallery/test.png");
      
      myStuff.add(myStuffLabel);
      myStuff.add(myStuffImage);
      linkRow.add(myStuff);

      // Add the link row to the page
      canvas.add(linkRow);
      
      // Featured Apps section
      var featuredAppsHeader = new qx.ui.basic.Label();
      featuredAppsHeader.set(
        {
          value      : "<h3>Featured Apps</h3>",
          rich       : true,
          marginLeft : 20
        });
      canvas.add(featuredAppsHeader);
      var featuredApps = new qx.ui.container.SlideBar();
      featuredApps.set(
        {
          marginLeft : 20,
          height : 150
        });
        
      // fill it with junk for now just to get an idea of the look
      var appThumbLayout = new qx.ui.layout.VBox();
      var appThumb = new qx.ui.container.Composite(appThumbLayout);
      appThumb.set(
        {
          backgroundColor : "#eee9e9",
          marginRight     : 20,
          padding         : 10,
        });
      var tempAppImage = new qx.ui.basic.Image("aiagallery/test.png");
      tempAppImage.set(
        {
          width  : 100,
        });
      appThumb.add(tempAppImage);
      appThumb.add(new qx.ui.basic.Label("My App"));
      appThumb.add(new qx.ui.basic.Label("by John Doe"));
      featuredApps.add(appThumb);
      
      var appThumbLayout2 = new qx.ui.layout.VBox();
      var appThumb2 = new qx.ui.container.Composite(appThumbLayout2);
      appThumb2.set(
        {
          backgroundColor : "#eee9e9",
          marginRight     : 20,
          padding         : 10
        });
      var tempAppImage2 = new qx.ui.basic.Image("aiagallery/test.png");
      tempAppImage2.set(
        {
          width  : 100,
        });
      appThumb2.add(tempAppImage2);
      appThumb2.add(new qx.ui.basic.Label("My App"));
      appThumb2.add(new qx.ui.basic.Label("by John Doe"));
      featuredApps.add(appThumb2);

      var appThumbLayout3 = new qx.ui.layout.VBox();
      var appThumb3 = new qx.ui.container.Composite(appThumbLayout3);
      appThumb3.set(
        {
          backgroundColor : "#eee9e9",
          marginRight     : 20,
          padding         : 10
        });
      var tempAppImage3 = new qx.ui.basic.Image("aiagallery/test.png");
      tempAppImage3.set(
        {
          width  : 100,
        });
      appThumb3.add(tempAppImage3);
      appThumb3.add(new qx.ui.basic.Label("My App"));
      appThumb3.add(new qx.ui.basic.Label("by John Doe"));
      featuredApps.add(appThumb3);
      
      var appThumbLayout4 = new qx.ui.layout.VBox();
      var appThumb4 = new qx.ui.container.Composite(appThumbLayout4);
      appThumb4.set(
        {
          backgroundColor : "#eee9e9",
          marginRight     : 20,
          padding         : 10
        });
      var tempAppImage4 = new qx.ui.basic.Image("aiagallery/test.png");
      tempAppImage4.set(
        {
          width  : 100,
        });
      appThumb4.add(tempAppImage4);
      appThumb4.add(new qx.ui.basic.Label("My App"));
      appThumb4.add(new qx.ui.basic.Label("by John Doe"));
      featuredApps.add(appThumb4);
      
      canvas.add(featuredApps);
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
      case "getVisitorList":
        break;
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
