/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Individual application page
 */
qx.Class.define("aiagallery.module.dgallery.appinfo.AppInfo",
{
  extend : aiagallery.main.AbstractModule,

  statics :
  {
    /**
     * Add a new application view (module / tab)
     *
     * @param uid {Key}
     *   The UID of the app to be displayed
     *
     * @param label {String}
     *   The label to present in the tab for this app
     */
    addAppView : function(uid, label)
    {
      var             app;
      var             page;
      var             moduleList;

      // Get the main tab view
      var mainTabs = qx.core.Init.getApplication().getUserData("mainTabs");

      // See if there's already a tab for this application
      page = null;
      mainTabs.getChildren().forEach(
        function(thisPage)
        {
          var lookingAt = thisPage.getUserData("app_uid");
          if (lookingAt == uid)
          {
            page = thisPage;

            // Select the existing application page
            mainTabs.setSelection([ page ]);
          }
        });

      // If we didn't find an existing tab, create a new one.
      if (! page)
      {
        // Create a new module (tab) for this application
        app = new aiagallery.main.Module(
                label,
                null,
                label,
                aiagallery.module.dgallery.appinfo.AppInfo,
                [
                  function(menuItem, page, subTabs)
                  {
                    // Keep track of which UID this tab applies to
                    page.setUserData("app_uid", uid);

                    // Allow the user to close this tab
                    page.setShowCloseButton(true);

                    // Select the new application page
                    mainTabs.setSelection([ page ]);
                  }
                ],
                true     // Instantiate a new module for each app
        );

        // Transmit the UID of this module */
        app.setUserData("app_uid", uid);

        // Start up the new module
        moduleList = {};
        moduleList[label] = {};
        moduleList[label][label] = app;
        aiagallery.Application.addModules(moduleList);
      }
    }
  },

  members :
  {
    /**
     * Create the module's finite state machine and graphical user interface.
     *
     * This function is called the first time a module is actually selected to
     * appear.  Creation of the module's actual FSM and GUI have been deferred
     * until they were actually needed (now) so we need to create them.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    initialAppear : function(module)
    {
      // Replace existing (temporary) finite state machine with the real one.
      aiagallery.module.dgallery.appinfo.Fsm.getInstance().buildFsm(module);

      // Create the real gui.
      aiagallery.module.dgallery.appinfo.Gui.getInstance().buildGui(module);
    }
  }
});
