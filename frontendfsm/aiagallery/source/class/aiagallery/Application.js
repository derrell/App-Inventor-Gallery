/**
 * Main application class of the App Inventor for Android Gallery
 *
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#require(aiagallery.dbif.DbifSim)
#use(aiagallery.main.AbstractModule)
*/

/**
 * Main menu
 */
qx.Class.define("aiagallery.Application",
{
  extend : qx.application.Standalone,

  statics :
  {
    /**
     * Set the global cursor to indicate an action is in progress
     *
     * @param b {Boolean}
     *   <i>true</i> to turn on the progress cursor;
     *   <i>false</i> to turn it off
     */
    progressCursor : function(b)
    {
      var             cursor;
      var             root = qx.core.Init.getApplication().getRoot();

      if (b)
      {
        cursor = qx.core.Init.getApplication().PROGRESS_CURSOR;
        root.setGlobalCursor(cursor);
      }
      else
      {
        root.resetGlobalCursor();
      }
    },
    
    addModules : function(moduleList)
    {
      var             menuItem;
      var             moduleName;
      var             module;
      var             iconList;
      var             functionList;
      
      // For each module...
      for (menuItem in moduleList)
      {
        // ... there can be multiple available items in top-level menu item
        for (moduleName in moduleList[menuItem])
        {
          // ... call the module's buildInitialFsm() function
          if (moduleList[menuItem][moduleName].bNewInstance)
          {
            // We must instantiate a new instance of this module
            module = new moduleList[menuItem][moduleName]["clazz"]();
          }
          else
          {
            // The module is a singleton, so get its one and only instance
            module = moduleList[menuItem][moduleName]["clazz"].getInstance();
          }
          module.buildInitialFsm(moduleList[menuItem][moduleName]);
        }
      }

      // Initialize the gui for the main menu
      iconList = aiagallery.main.Module.getIconList();
      functionList = aiagallery.main.Module.getFunctionList();
      aiagallery.main.Gui.getInstance().buildGui(moduleList,
                                                 iconList,
                                                 functionList);

      // Similarly, now that we have a canvas for each module, ...
      for (menuItem in moduleList)
      {
        for (moduleName in moduleList[menuItem])
        {
          // ... call the module's buildInitialGui() function
          if (moduleList[menuItem][moduleName].bNewInstance)
          {
            // Type is "new" so create a new instance of this module
            module = new moduleList[menuItem][moduleName]["clazz"]();
          }
          else
          {
            // Type is "singleton""
            module = moduleList[menuItem][moduleName]["clazz"].getInstance();
          }
          module.buildInitialGui(moduleList[menuItem][moduleName]);
        }
      }
    }
  },

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      var             menuItem;
      var             moduleName;

      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        var appender;

        // support native logging capabilities, e.g. Firebug for Firefox
        appender = qx.log.appender.Native;

        // support additional cross-browser console. Press F7 to
        // toggle visibility
        appender = qx.log.appender.Console;
      }

      // Determine the path to our progress cursor
      qx.core.Init.getApplication().PROGRESS_CURSOR = "progress";

      // Use the progress cursor now, until we're fully initialized
      qx.core.Init.getApplication().constructor.progressCursor(true);

      // Start the RPC simulator by getting its singleton instance
      this.dbif = aiagallery.dbif.DbifSim.getInstance();

      // Get the module list
      var moduleList = aiagallery.main.Module.getList();

      // Add the modules in the module list
      aiagallery.Application.addModules(moduleList);
    }
  }
});


/*
 * Register our supported modules.  The order listed here is the order they
 * will appear in the Modules menu. Additionally, for a two-level menu, the
 * first parameter to the aiagallery.main.Module constructor may be the same
 * as a previous one.
 */

/*  The main Gallery */
if (false)
{
  new aiagallery.main.Module(
    "Gallery",
    "aiagallery/module/go-home.png",
    "Home",
    aiagallery.module.dgallery.home.Home);

  new aiagallery.main.Module(
    "Gallery",
    "aiagallery/module/system-search.png",
    "Find Apps",
    aiagallery.module.dgallery.findapps.FindApps);

  new aiagallery.main.Module(
    "Gallery",
    "aiagallery/module/emblem-favorite.png",
    "My Stuff",
    aiagallery.module.dgallery.mystuff.MyStuff);

  new aiagallery.main.Module(
    "Gallery",
    null,
    "Learn",
    aiagallery.module.dgallery.learn.Learn);
}
else
{
  new aiagallery.main.Module(
    "Home",
    "aiagallery/module/go-home.png",
    "Home",
    aiagallery.module.dgallery.home.Home);

  new aiagallery.main.Module(
    "Find Apps",
    "aiagallery/module/system-search.png",
    "Find Apps",
    aiagallery.module.dgallery.findapps.FindApps);

  new aiagallery.main.Module(
    "My Stuff",
    "aiagallery/module/emblem-favorite.png",
    "My Stuff",
    aiagallery.module.dgallery.mystuff.MyStuff);
}

if (qx.core.Environment.get("qx.debug"))
{
  new aiagallery.main.Module(
    "Testing",
    "aiagallery/test.png",
    "Mobile",
    aiagallery.module.testing.mobile.Mobile);

  new aiagallery.main.Module(
    "Testing",
    null,
    "Temporary",
    aiagallery.module.testing.temp.Temp);
}
