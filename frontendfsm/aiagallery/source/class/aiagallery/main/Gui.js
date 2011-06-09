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
        o = new qx.ui.basic.Label(this.tr("App Inventor Gallery"));
        o.setFont(new qx.bom.Font(22, [ "sans-serif" ]));
        header.add(o);

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
        var bInitialDebug = true;
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
    }
  }
});
