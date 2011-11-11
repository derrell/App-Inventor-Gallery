/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#asset(aiagallery/*)
 */

/**
 * The graphical user interface for the main menu
 */
qx.Class.define("aiagallery.main.Gui",
{
  type    : "singleton",
  extend  : qx.ui.core.Widget,

  members :
  {
    /** The currently used canvas (depends on what module is selected) */
    currentCanvas : null,

    /** Our copy of the module list */
    moduleList : null,

    buildGui : function(moduleList, iconList, functionList)
    {
      var             o;
      var             header;
      var             menuItem;
      var             moduleName;
      var             page;
      var             subTabs;
      var             subPage;
      var             canvas;
      var             numModules;
      var             whoAmI;

      // Retrieve the previously-created top-level tab view
      var mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");
      
      // Did it exist?
      if (! mainTabs)
      {
        //
        // Nope. This is the first time in, and we're creating the whole gui.
        //

        // Save a reference to the module list
        this.moduleList = moduleList;

        // Create the VBox layout for the application structure
        o = new qx.ui.layout.VBox();
        o.set(
          {
            spacing       : 10
          });
        var application = new qx.ui.container.Composite(o);
        this.getApplicationRoot().add(application, { edge : 0 });

        // Create a horizontal box layout for the title
        header = new qx.ui.container.Composite(new qx.ui.layout.HBox(6));
        header.set(
        {
          height          : 40
        });

        // Add the logo to the header
        o = new qx.ui.basic.Image("aiagallery/test.png");
        header.add(o);

        // Create a small spacer after the logo
        o = new qx.ui.core.Spacer(20);
        header.add(o);

        // Add a label to the header
        o = new qx.ui.basic.Label(this.tr("App Inventor Community Gallery"));
        o.setFont(new qx.bom.Font(22, [ "sans-serif" ]));
        header.add(o);

        // Add a flexible spacer to take up the whole middle
        o = new qx.ui.core.Widget();
        header.add(o, { flex : 1 });

        // Create a label to hold the user's login info and a logout button
        if (false)
        {
          this.whoAmI = new qx.ui.basic.Label("");
          this.whoAmI.setRich(true);
        }
        else
        {
          this.whoAmI = new aiagallery.main.WhoAmI();
        }
        header.add(this.whoAmI);

        // Add a flexible spacer to take up the whole middle
        o = new qx.ui.core.Widget();
        header.add(o, { flex : 1 });

        // Add a checkbox to enable/disable RPC simulation.
        var simulate = new qx.ui.form.CheckBox(this.tr("Simulate"));
        simulate.addListener("changeValue",
                             function(e)
                             {
                               rpcjs.sim.remote.MRpc.SIMULATE = e.getData();
                             },
                             this);

        // Enable simulation by default in the source version, disabled in the
        // build version (unless qx.debug is specifically set in the config
        // file). Set value to true then false initially, to ensure that
        // changeValue handler gets called.
        simulate.setValue(true);
        simulate.setValue(false);
        if (qx.core.Environment.get("qx.debug"))
        {
          simulate.setValue(true);
        }

        header.add(simulate);


        // Add the header to the application
        application.add(header);

        mainTabs = new qx.ui.tabview.TabView();
        application.add(mainTabs, { flex : 1 });

        // Make the tab view globally accessible
        qx.core.Init.getApplication().setUserData("mainTabs", mainTabs);

        // Issue a side-band RPC to find out who we are, and a logout URL
        var _this = this;
        qx.util.TimerManager.getInstance().start(
          function(userData, timerId)
          {
            var             rpc;

            rpc = new qx.io.remote.Rpc();
            rpc.set(
              {
                url         : aiagallery.main.Constant.SERVICES_URL,
                timeout     : 30000,
                crossDomain : false,
                serviceName : "aiagallery.features"
              });
            rpc.callAsync(
              function(e)
              {
                var             bAllowed;
                var             moduleList;
                var             module;
                
                // Create a global function accessible via <a href=
                window.editProfile = function()
                {
                  _this._editProfile();
                };

                // Set the header to display just-retrieved values
                _this.whoAmI.setIsAdmin(e.isAdmin);
                _this.whoAmI.setEmail(e.email);
                _this.whoAmI.setDisplayName(e.userId);
                _this.whoAmI.setPermissions(e.permissions.join(", "));
                _this.whoAmI.setLogoutUrl(e.logoutUrl);
                
                qx.core.Init.getApplication().setUserData(
                  "permissions", e.permissions);

                // Determine whether they have access to the user management
                // page.
                bAllowed = false;
                [ 
                  // These permissions allow access to the page
                  "addOrEditVisitor",
                  "deleteVisitor",
                  "getVisitorList"
                ].forEach(
                  function(rpcFunc)
                  {
                    if (qx.lang.Array.contains(e.permissions, rpcFunc))
                    {
                      bAllowed = true;
                    }
                  });

                // If they're allowed access to the page...
                if (e.isAdmin || bAllowed)
                {
                  // ... then create it
                  module = new aiagallery.main.Module(
                    "User Management",
                    "aiagallery/test.png",
                    "User Management",
                    aiagallery.module.mgmt.users.Users);

                  // Start up the new module
                  moduleList = {};
                  moduleList["User Management"] = {};
                  moduleList["User Management"]["User Management"] = module;
                  aiagallery.Application.addModules(moduleList);
                }
              },
              "whoAmI",
              []);
          });
      }
      
      // for each menu button...
      for (menuItem in moduleList)
      {
        // Create a page (canvas) to associate with this button
        page =
          new qx.ui.tabview.Page(menuItem, iconList[menuItem]);
        page.setLayout(new qx.ui.layout.VBox(4));
        mainTabs.add(page);

        // See how many modules there are associated with this menu item
        numModules = 0;

        for (moduleName in moduleList[menuItem])
        {

          // We found a module.  Increment our counter
          numModules++;
        }

        var DebugFlags = qx.util.fsm.FiniteStateMachine.DebugFlags;
        var bInitialDebug = false;
        if (bInitialDebug)
        {
          var initialDebugFlags =
            (DebugFlags.EVENTS |
             DebugFlags.TRANSITIONS |
             DebugFlags.FUNCTION_DETAIL |
             DebugFlags.OBJECT_NOT_FOUND);
        }
        else
        {
          var initialDebugFlags = 0;
        }

        // If there are multiple modules, we need to create a Tab View.
        if (numModules > 1)
        {
          // Yup.  Create a method to select this menu item.
          subTabs = new aiagallery.widget.radioview.RadioView();
          
          if (false)
          {
            // Use a single row if there are an odd number of submodules or two
            // submodules; two rows if there are an even number greater than 2.
            if (numModules == 2 || numModules % 2 == 1)
            {
              subTabs.setRowCount(1);
            }
            else
            {
              subTabs.setRowCount(2);
            }
          }
          else
          {
            // Use a single row for subtabs
            subTabs.setRowCount(1);
          }

          subTabs.setContentPadding(0);
          page.add(subTabs, { flex : 1 });

          // See if there are any functions to be called, e.g. to add
          // buttons to the radio view's button bar
          var thisFunctionList = functionList[menuItem];
          if (thisFunctionList)
          {
            for (var i = 0; i < thisFunctionList.length; i++)
            {
              thisFunctionList[i](menuItem, page, subTabs);
            }
          }

          // For each module associated with the just-added button...
          for (moduleName in moduleList[menuItem])
          {
            // Create a page for this module
            subPage = new aiagallery.widget.radioview.Page(moduleName);
            var layout=new qx.ui.layout.VBox(4);
            subPage.setLayout(layout);
            subTabs.add(subPage, { flex : 1 });

            // Save the canvas
            moduleList[menuItem][moduleName].canvas = canvas = subPage;

            var fsm = moduleList[menuItem][moduleName].fsm;
            fsm.setDebugFlags(initialDebugFlags);
            fsm.addObject("main.canvas", canvas);
            canvas.addListener("appear", fsm.eventListener, fsm);
            canvas.addListener("disappear", fsm.eventListener, fsm);
          }
          
          // Make the main gallery subtabs globally accessible
          if (menuItem == "Gallery") 
          {
            qx.core.Init.getApplication().setUserData("subTabs", subTabs);
          }
        }
        else
        {
          // Save the canvas
          moduleList[menuItem][moduleName].canvas = canvas = page;

          var fsm = moduleList[menuItem][moduleName].fsm;
          fsm.setDebugFlags(initialDebugFlags);
          fsm.addObject("main.canvas", canvas);
          canvas.addListener("appear", fsm.eventListener, fsm);
          canvas.addListener("disappear", fsm.eventListener, fsm);

          // See if there are any functions to be called
          var thisFunctionList = functionList[menuItem];
          if (thisFunctionList)
          {
            for (var i = 0; i < thisFunctionList.length; i++)
            {
              thisFunctionList[i](menuItem, page, null);
            }
          }

        }
      }
    },

    setFsmDebug : function(bTurnOn)
    {
      var             menuItem;
      var             moduleName;
      var             moduleList = this.moduleList;

      // for each menu button...
      for (menuItem in moduleList)
      {
        // For each module associated with the
        // just-added button...
        for (moduleName in moduleList[menuItem])
        {
          var fsm = moduleList[menuItem][moduleName].fsm;
          if (bTurnOn)
          {
            var DebugFlags = qx.util.fsm.FiniteStateMachine.DebugFlags;
            fsm.setDebugFlags(DebugFlags.EVENTS |
                              DebugFlags.TRANSITIONS |
                              DebugFlags.FUNCTION_DETAIL |
                              DebugFlags.OBJECT_NOT_FOUND);
          }
          else
          {
            fsm.setDebugFlags(0);
          }
        }
      }
    },
    
    _editProfile : function()
    {
      var             win;
      var             grid;
      var             container;
      var             displayName;
      var             hBox;
      var             ok;
      var             cancel;
      var             command;
  
      // Create a modal window for editing the profile
      if (! this._win)
      {
        win = new qx.ui.window.Window(this.tr("Edit Profile"));
        win.set(
          {
            layout : new qx.ui.layout.VBox(30),
            modal  : true
          });
        this.getApplicationRoot().add(win);

        // We'll use a grid to layout the property editor
        grid = new qx.ui.layout.Grid();
        grid.setSpacingX(5);
        grid.setSpacingY(15);
        grid.setColumnAlign(0, "right", "middle");

        // Create a container for the grid
        container = new qx.ui.container.Composite(grid);
        win.add(container);

        // Add the label
        container.add(new qx.ui.basic.Label(this.tr("Display Name")), 
                      { row : 0, column : 0 });

        // Add the text field
        win._displayName = new qx.ui.form.TextField();
        win._displayName.set(
          {
            width  : 120,
            filter : /[a-zA-Z0-9 _-]/
          });
        container.add(win._displayName, { row : 0, column : 1 });
        
        // Create a horizontal box to hold the buttons
        hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

        // Add spacer to right-align the buttons
        hBox.add(new qx.ui.core.Spacer(null, 1), { flex : 1 });

        // Add the Ok button
        ok = new qx.ui.form.Button(this.tr("Ok"));
        ok.setWidth(100);
        ok.setHeight(30);
        hBox.add(ok);
        
        // Allow 'Enter' to confirm entry
        command = new qx.ui.core.Command("Enter");
        ok.setCommand(command);
        
        // When the Ok button is pressed, issue an editProfile request
        ok.addListener(
          "execute", 
          function(e)
          {
            var             rpc;
            var             _this = this;

            // Get and configure a new RPC object
            rpc = new qx.io.remote.Rpc();
            rpc.set(
              {
                url         : aiagallery.main.Constant.SERVICES_URL,
                timeout     : 30000,
                crossDomain : false,
                serviceName : "aiagallery.features"
              });
            
            // Issue the request. When we get the result...
            rpc.callAsync(
              function(e)
              {
                // Set the display name in the application header
                _this.whoAmI.setDisplayName(win._displayName.getValue());
                
                // Close the window
                win.close();
              },
              "editProfile",
              {
                displayName : win._displayName.getValue()
              });
          },
          this);

        // Add the Cancel button
        cancel = new qx.ui.form.Button(this.tr("Cancel"));
        cancel.setWidth(100);
        cancel.setHeight(30);
        hBox.add(cancel);

        // Allow 'Escape' to cancel
        command = new qx.ui.core.Command("Esc");
        cancel.setCommand(command);

        // Close the window if the cancel button is pressed
        cancel.addListener(
          "execute",
          function(e)
          {
            win.close();
          },
          this);

        // Add the button bar to the window
        win.add(hBox);
        
        // We only want to create this window once.
        this._win = win;
      }
      
      // Clear out the display name field
      this._win._displayName.setValue("");
                
      // Set the focus to the display name field
      this._win._displayName.focus();

      // Show the window
      this._win.center();
      this._win.show();
    }
  }
});
