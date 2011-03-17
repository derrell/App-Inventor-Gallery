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
#asset(aiagallery/*)

#require(aiagallery.mgmt.Users)
#require(aiagallery.mgmt.Apks)
#require(aiagallery.mgmt.Tags)
#require(aiagallery.mgmt.Permissions)
*/

qx.Class.define("aiagallery.Application",
{
  extend : qx.application.Standalone,

  properties :
  {
    /** Test mode generates large amounts of auto-generated data */
    testMode :
    {
      check : "Boolean",
      init  : true
    }
  },

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      var             o;
      var             page;
      var             pageContent;
        
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // We only need to cause the appenders to get loaded, not do anytyhing
        // with them. A simple assignment of the class name will cause the
        // loader to include them.
        var appender;

        // support native logging capabilities, e.g. Firebug for Firefox
        appender = qx.log.appender.Native;

        // support additional cross-browser console. Press F7 to toggle
        // visibility
        appender = qx.log.appender.Console;
      }


      // Create the basic organization of the page:
      //  - a header bar for a logo and site name
      //  - under the header bar, content area
      
      // Create a vertical box layout
      var mainVBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      
      // Create a horizontal box layout for the logo and site name
      var header = new qx.ui.container.Composite(new qx.ui.layout.HBox());
      
      // Add the logo to the header
      o = new qx.ui.basic.Image("aiagallery/test.png");
      header.add(o);
      
      // Create a small spacer after the logo
      o = new qx.ui.core.Widget();
      o.setWidth(20);
      header.add(o);

      // Add a label to the header
      o = new qx.ui.basic.Label(this.tr("App Inventor Gallery: Management"));
      o.setFont(new qx.bom.Font(18, [ "sans-serif" ]));
      header.add(o);
      
      // Add a spacer to right-justify the language and theme selection
      o = new qx.ui.core.Widget();
      header.add(o, { flex : 1 });
      
      // Add a label for language selection
      o = new qx.ui.basic.Label(this.tr("Language:"));
      header.add(o);

      // Add the language selector
      var language = new qx.ui.form.SelectBox();
      language.setMaxHeight(20);

      // Language would typically be selected automatically based on browser
      // settings. For now, we add the available languages in a list for user
      // selection.

      [
        { abbrev: "en", name: this.tr("English") },
        { abbrev: "es", name: this.tr("Spanish") }
      ].forEach(function(lang) 
                {
                  var item = new qx.ui.form.ListItem(lang.name);
                  item.setUserData("abbrev", lang.abbrev);
                  language.add(item);
                });
      
      // Add a listener to change the language upon selection from the list
      language.addListener("changeSelection", function(evt) 
      {
        var selected = evt.getData()[0];
        var localeManager = qx.locale.Manager.getInstance();
        localeManager.setLocale(selected.getUserData("abbrev"));
      });

      language.set(
      {
        paddingTop : 0,
        paddingBottom : 0,
        width : 140
      });

      header.add(language);

      // Add a label for theme selection
      o = new qx.ui.basic.Label(this.tr("Theme:"));
      header.add(o);
      
      // Add the theme selector
      var theme = new qx.ui.form.SelectBox();
      theme.setMaxHeight(20);
      
      // Select a default theme if none is specified via query string
      var defaultTheme = "Dark"; // gets overwritten with the list item

      [
        "Classic",
        "Modern",
        "Simple",
//        "Aristo",
//        "SilverBlue",
        "RetroBlue",
        "RetroRed",
        "RetroDark",
        "Dark"
      ].forEach(function(name) 
                {
                  var item = new qx.ui.form.ListItem(name + " Theme");
                  if (name == defaultTheme)
                  {
                    defaultTheme = item;
                  }
                  item.setUserData("value", name);
                  theme.add(item);
                });
      
      var currentThemeItem = null;
      
      // If there's a query string...
      if (window.location.search)
      {
        // ... then find the appropriate theme element in the list
        currentThemeItem = theme.getSelectables().filter(
        function(item) 
        {
          return window.location.search.match(item.getUserData("value"));
        })[0];
      }

      // Set current theme
      currentThemeItem = currentThemeItem || defaultTheme;
      theme.setSelection([currentThemeItem]);

      theme.set(
      {
        paddingTop : 0,
        paddingBottom : 0,
        width : 140
      });

      theme.addListener("changeSelection", function(evt) 
      {
        var selected = evt.getData()[0];
        var url = "index.html?qx.theme=" + selected.getUserData("value");
        window.location = url;
      });

      header.add(theme);
      
      // Add the header to the main vertical box
      mainVBox.add(header);
      
      // Create a small spacer below the header
      o = new qx.ui.core.Widget();
      o.setHeight(10);
      mainVBox.add(o);

      // Create a tab view for the main page content
      var tabView = new qx.ui.tabview.TabView();
      
      // Allow turning test mode on or off
      var testMode = new qx.ui.form.CheckBox(this.tr("Test Mode"));
      testMode.setValue(true);
      testMode.addListener("changeValue",
                           function(e)
                           {
                             this.setTestMode(e.getData());
                             this.populateTabView(tabView);
                           },
                           this);
      mainVBox.add(testMode);

      // Populate the tab view now
      this.populateTabView(tabView);
      
      // Add the tabVew to the main vertical box
      mainVBox.add(tabView, { flex : 1 });
      
      // Add the main VBox to the application root
      this.getRoot().add(mainVBox, { edge : 10 });
    },
    
    populateTabView : function(tabView)
    {
      var             i;
      var             page;

      // Remove anything already in the tabView (e.g., toggling testMode)
      var pages = tabView.getChildren();
      for (i = pages.length - 1; i >= 0; i--)
      {
        tabView.remove(pages[i]);
      }


      //
      // Create and populate each of the pages. Add them to the tabView.
      //
      
      [
        "Users",
        "Apks",
        "Tags",
        "Permissions"
      ].forEach(
        function(pageName)
        {
          tabView.add(new aiagallery.mgmt[pageName](this));
        },
        this);
    }
  }
});
