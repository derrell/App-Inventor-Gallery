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
      var             text;
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
      var homeImage = new qx.ui.basic.Image("aiagallery/homepage2.png");
      welcomeRow.add(homeImage);

      // Create a welcome message      
      var message = new qx.ui.basic.Label();
      text = 
        [
          "<h2>Welcome to the App Inventor Community Gallery!</h2>",

	  "You can:",
	  "<ul>",
	  "<p><li>Browse and download App Inventor projects",

	  "<p><li>Contribute your App Inventor project to share it with others",

	  "<p><li>Discuss projects you like and encourage new ideas!",

	  "</ul>",

	  "<p>Get started by clicking on <b>Find Apps</b>, and go ahead ",
	  "and add your own projects by clicking on <b>My Stuff</b>.",

	  "<p>Also, you can browse and download projects directly to your ",
	  "Android phone by using our companion ",
	  '<a href="http://www.appinventor.org/mobile-gallery" target="new">',
          "Mobile Community Gallery</a> ",
	  "app!",


	  "<p>&nbsp;</p>",

	  "<p><em>App Inventor Community Gallery is a resource provided ",
	  "to the App Inventor community.  We are supported by a ",
	  "grant from Google Inc.  Our site is presently in a beta launch. ",
	  'Please be nice!  Email us at ',
	  '<a href="mailto:aigallery@weblab.cs.uml.edu">',
	  'aigallery@weblab.cs.uml.edu</a> if you ',
	  "have any questions or comments.</em>"
        ].join("");
      message.set(
        {
          value         : text,
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
      text =
        [
	  "Use <b>Find Apps</b> to browse apps by tag, or search for them ",
          "using a variety of parameters."
        ].join("");
      var findApps = new aiagallery.module.dgallery.home.LinkBox(
        "<b>Find Apps</b><br>" + text,
        "aiagallery/findApps.png");
      findApps.addListener("click", fsm.eventListener, fsm);
      linkRow.add(findApps);
      fsm.addObject("Find Apps", findApps);
      
      // Add spacer
      linkRow.add(new qx.ui.core.Widget(), { flex : 1 });
            
      // Add "Learn" box to link row
      text =
        [
	 "The <b>Learn</b> page will have for information about ",
	 "the Community Gallery's features.  Nothing here yet."
        ].join("");
      var learn = new aiagallery.module.dgallery.home.LinkBox(
        "<b>Learn</b><br>" + text,
        "aiagallery/learn.png");
      learn.addListener("click", fsm.eventListener, fsm);
      linkRow.add(learn);
      fsm.addObject("Learn", learn);
      
      // Add spacer
      linkRow.add(new qx.ui.core.Widget(), { flex : 1 });
      
      // Add "My Stuff" box to link row
      text =
        [
	 "Go to <b>My Stuff</b> to review and change your uploaded projects."
        ].join("");
      var myStuff = new aiagallery.module.dgallery.home.LinkBox(
        "<b>My Stuff</b><br>" + text,
        "aiagallery/myStuff.png");
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
          value      : "<h3>Featured Apps</h3>",
          rich       : true
        });
      featuredApps.add(featuredAppsHeader);
      
      // slide bar of Featured Apps
      var featuredAppsSlideBar = new qx.ui.container.SlideBar();
      featuredAppsSlideBar.set(
        {
          height : 180
        });
      
      fsm.addObject("Featured Apps", featuredAppsSlideBar);
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
        // Get the gallery object
        var featuredApps = fsm.getObject("Featured Apps");
        
        // Retrieve the app list
        var apps = response.data.result.apps;

        // FIXME: KLUDGE: should be able to update without remove/add!!!
        var parent = featuredApps.getLayoutParent();
        parent.remove(featuredApps);
        featuredApps = new qx.ui.container.SlideBar();
        featuredApps.set(
          {
            height : 180
          });
        fsm.addObject("Featured Apps", featuredApps);
        parent.add(featuredApps);
        
        for (var i = 0; i < apps.length; i++)
        {
          var app = apps[i];
          
          // FIXME: Need to fetch visitor's displayName to show instead of id
          var appThumb = 
            new aiagallery.widget.AppThumb(app.label, app.owner, app.icon);
          featuredApps.add(appThumb);
          
          // Associate the app data with the UI widget so it can be passed
          // in the click event callback
          appThumb.setUserData("App Data", app);
          
          // Fire an event specific to this application, sans a friendly name.
          appThumb.addListener(
            "click", 
            function(e)
            {
              fsm.fireImmediateEvent("featuredAppClick", this, 
                e.getCurrentTarget().getUserData("App Data"));
            });
        }       
        break;
        
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
