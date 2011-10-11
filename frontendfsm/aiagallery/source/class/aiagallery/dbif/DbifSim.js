/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.DbifSim",
{
  extend  : rpcjs.sim.Dbif,
  type    : "singleton",

  include : 
  [
    aiagallery.dbif.MDbifCommon,
    aiagallery.dbif.MSimData
  ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments, "aiagallery", "/rpc");
        
    if (true)
    {
      // Save the logged-in user. The whoAmI property is in MDbifCommon.
      this.setWhoAmI(
        {
          email     : "jarjar@binks.org",
          userId    : "obnoxious",
          isAdmin   : true,
          logoutUrl : "javascript:aiagallery.dbif.DbifSim.changeWhoAmI();"
        });
    }
    else
    {
      // Save the logged-in user. The whoAmI property is in MDbifCommon.
      this.setWhoAmI(
        {
          email     : "joe@blow.com",
          userId    : "Joe Blow",
          isAdmin   : false,
          logoutUrl : "javascript:alert(\"logout\")"
        });
    }
  },
  
  statics :
  {
    __userNumber : 0,

    changeWhoAmI : function(context)
    {
      var formData =  
      {
        'username'   : 
        {
          'type'  : "ComboBox", 
          'label' : "Login",
          'value' : null,
          'options' : [ ]
        },
        'isAdmin'   : 
        {
          'type'  : "SelectBox", 
          'label' : "User type",
          'value' : null,
          'options' : 
          [
            { 'label' : "Normal",        'value' : false }, 
            { 'label' : "Administrator", 'value' : true  }
          ]
        }
      };
      
      // Retrieve all of the visitor records
      rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors").forEach(
        function(visitor, i)
        {
          // Add this visitor to the list
          formData.username.options.push(
            {
              label : visitor.id,
              value : visitor.id
            });
        });

      dialog.Dialog.form(
        "You have been logged out. Please log in.",
        formData,
        function( result )
        {
          var             visitor;
          var             displayName;
          var             guiWhoAmI;

          // Try to get this user's display name. Does the visitor exist?
          visitor = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                            result.username);
          if (visitor.length > 0)
          {
            // Yup, he exists.
            displayName =
              visitor[0].displayName ||
              "User #" + aiagallery.dbif.DbifSim.__userNumber++;
          }
          else
          {
            // He doesn't exist. Just use the unique number.
            displayName = "User #" + aiagallery.dbif.DbifSim.__userNumber++;
          }

          // Save the backend whoAmI information
          aiagallery.dbif.DbifSim.getInstance().setWhoAmI(
          {
            email     : result.username,
            userId    : displayName,
            isAdmin   : true,
            logoutUrl : "javascript:aiagallery.dbif.DbifSim.changeWhoAmI();"
          });
          
          // Update the gui too
          guiWhoAmI = aiagallery.main.Gui.getInstance().whoAmI;
          guiWhoAmI.setIsAdmin(result.isAdmin);
          guiWhoAmI.setEmail(result.username);
          guiWhoAmI.setDisplayName(displayName);
          guiWhoAmI.setPermissions("");
          guiWhoAmI.setLogoutUrl(
            "javascript:aiagallery.dbif.DbifSim.changeWhoAmI();");
        }
      );
    }
  },

  defer : function()
  {
    // Retrieve the database from Web Storage, if such exists.
    if (typeof window.localStorage !== "undefined")
    {
      if (typeof localStorage.simDB == "string")
      {
        qx.Bootstrap.debug("Reading DB from Web Storage");
        rpcjs.sim.Dbif.setDb(qx.lang.Json.parse(localStorage.simDB));
      }
      else
      {
        // No database yet stored. Retrieve the database from the MSimData mixin
        qx.Bootstrap.debug("No database yet. Using new SIM database.");
        rpcjs.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);
      }
    }
    else
    {
      // Retrieve the database from the MSimData mixin
      qx.Bootstrap.debug("No Web Storage available. Using new SIM database.");

      // Convert string appId keys to numbers
      qx.Bootstrap.debug("Beginning appId conversion...");
      var apps = aiagallery.dbif.MSimData.Db["apps"];
      qx.lang.Object.getKeys(apps).forEach(
        function(appId)
        {
          qx.Bootstrap.debug("Converting " + appId);
          apps[parseInt(appId, 10)] = apps[appId];
          delete apps[appId];
        });

      rpcjs.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);
    }
    
    // Register our put & query functions
    rpcjs.dbif.Entity.registerDatabaseProvider(
      rpcjs.sim.Dbif.query,
      rpcjs.sim.Dbif.put,
      rpcjs.sim.Dbif.remove,
      rpcjs.sim.Dbif.getBlob,
      rpcjs.sim.Dbif.putBlob,
      rpcjs.sim.Dbif.removeBlob);
  }
});
