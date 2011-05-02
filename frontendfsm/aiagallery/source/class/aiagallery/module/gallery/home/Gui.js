/**
 * Copyright (c) 2011 Derrell Lipman and Helen Tompkins
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery home page
 */
qx.Class.define("aiagallery.module.gallery.home.Gui",
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
      var             outerCanvas = module.canvas;
      
      outerCanvas.setLayout(new qx.ui.layout.VBox());
      var scrollContainer = new qx.ui.container.Scroll();
      outerCanvas.add(scrollContainer, { flex : 1 });
      
      // Specify overall page layout
      var layout = new qx.ui.layout.VBox(30);
      var canvas = new qx.ui.container.Composite(layout);
      canvas.setPadding(20);
      scrollContainer.add(canvas, { flex : 1 });
      
      // Create the top row (welcome and general info about AIA/Gallery)
      var welcomeLayout = new qx.ui.layout.HBox();
      welcomeLayout.setSpacing(20);
      var welcomeRow = new qx.ui.container.Composite(welcomeLayout);
      
      // Create an image (temporary one for now)
      var homeImage = new qx.ui.basic.Image("aiagallery/homepage.png");
      welcomeRow.add(homeImage);

      // Create a welcome message      
      var message = new qx.ui.basic.Label();
      message.set(
        {
          value         : this.tr("<h2>Welcome to the App Inventor for Android Community Gallery!</h2>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis arcu ut velit ullamcorper mattis in quis metus. Phasellus leo mi, dignissim non consectetur sed, eleifend ut lacus. Vestibulum ac ante sed diam blandit tempus commodo eu erat. Vestibulum malesuada molestie sodales. Vivamus gravida congue ultricies. Vivamus imperdiet dignissim viverra. Praesent eget leo vitae quam suscipit imperdiet quis eget turpis. Curabitur lorem quam, dapibus at vestibulum at, malesuada eu justo. Proin mi quam, sagittis sit amet ornare ac, tempus quis erat. Vestibulum non orci at orci ultricies consectetur. Cras est augue, ornare quis condimentum eu, fringilla elementum tortor. Nulla pharetra faucibus luctus."),
          rich          : true,
          minWidth      : 150,
          allowStretchX : true
        });
      welcomeRow.add(message, { flex : 1 });
      
      // Add the welcome row to the page
      canvas.add(welcomeRow);
      
      // Create a row of links to the other main tabs
      var linkRowLayout = new qx.ui.layout.HBox();
      linkRowLayout.setSpacing(20);
      var linkRow = new qx.ui.container.Composite(linkRowLayout);
      
      // Add "Find Apps" box to link row
      var findApps = new aiagallery.module.gallery.home.LinkBox(
        "<b>Find Apps</b><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis arcu ut velit ullamcorper mattis in quis metus.",
        "aiagallery/test.png");
      findApps.addListener("click", fsm.eventListener, fsm);
      linkRow.add(findApps);
      fsm.addObject("Find Apps", findApps);

      // Add spacer
      linkRow.add(new qx.ui.core.Widget(), { flex : 1 });
            
      // Add "Learn" box to link row
      var learn = new aiagallery.module.gallery.home.LinkBox(
        "<b>Learn</b><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis arcu ut velit ullamcorper mattis in quis metus.",
        "aiagallery/test.png");
      learn.addListener("click", fsm.eventListener, fsm);
      linkRow.add(learn);
      fsm.addObject("Learn", learn);
      
      // Add spacer
      linkRow.add(new qx.ui.core.Widget(), { flex : 1 });
      
      // Add "My Stuff" box to link row
      var myStuff = new aiagallery.module.gallery.home.LinkBox(
        "<b>My Stuff</b><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis arcu ut velit ullamcorper mattis in quis metus.",
        "aiagallery/test.png");
      myStuff.addListener("click", fsm.eventListener, fsm);
      linkRow.add(myStuff);
      fsm.addObject("My Stuff", myStuff);

      // Add the link row to the page
      canvas.add(linkRow);
      
      // Featured Apps section
      var featuredAppsLayout = new qx.ui.layout.VBox();
      var featuredApps = new qx.ui.container.Composite(featuredAppsLayout);

      // Featured Apps heading
      var featuredAppsHeader = new qx.ui.basic.Label();
      featuredAppsHeader.set(
        {
          value      : this.tr("<h3>Featured Apps</h3>"),
          rich       : true
        });
      featuredApps.add(featuredAppsHeader);
      
      // slide bar of Featured Apps
      var featuredAppsSlideBar = new qx.ui.container.SlideBar();
      featuredAppsSlideBar.set(
        {
          height : 150
        });
        
      // fill it with junk for now just to get an idea of the look
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "It's a Bird", "Sue Permann", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "On the Fence", "Barb Dwyer", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "Breakfast Time", "Hammond Aigs", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "Be Prepared", "Justin Case", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "What's Your Sign?", "Horace Cope", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "Salute", "Stan Dupp", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "At Ease", "Sid Down", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "Great Books", "Warren Piece", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "Criminal Minds", "Robin Banks", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "Don't Cross Me", "Yul Besari", "aiagallery/test.png"));
      featuredAppsSlideBar.add(new aiagallery.widget.AppThumb(
        "Tired of This", "Hadda Nuff", "aiagallery/test.png"));
      
      featuredApps.add(featuredAppsSlideBar);
      
      // add Featured Apps section to the page
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
        // FIXME: Handle the failure somehow
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "appQuery":
        // TODO: Display the returned apps in the Featured Apps feed
        break;
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
