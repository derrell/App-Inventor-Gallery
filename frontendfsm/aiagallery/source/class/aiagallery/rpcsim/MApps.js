/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.rpcsim.MApps",
{
  construct : function()
  {
    this.registerService("addOrEditApp", this.addOrEditApp);
    this.registerService("deleteApp",    this.deleteApp);
    this.registerService("getAppList", this.getAppList);
  },

  members :
  {
    addOrEditApp : function(uid, attributes)
    {
      var             name;
      var             permissions;
      var             status;
      var             statusIndex;
      var             app;
      var             ret;
      
      name = attributes.name;
      permissions = attributes.permissions;
      
      // Get the status value. If the status string isn't found, we'll use
      // "Active" when we set the database.
      status = this.statusOrder.indexOf(status);
      
      // Get the old app entry
      app = this._db.apps[uid];
      
      // Did it already exist?
      if (! app)
      {
        // Nope. We're creating it new.
        ret = true;
        
        // Create an empty map
        app = {};
      }
      else
      {
        // It already existed
        ret = false;
      }
      
      this._db.apps[uid] =
        {
          uid         : uid,
          name        : name || app.name || "<not specified>",
          permissions : permissions || app.permissions || [],
          status      : status != -1 ? status : (app.status || 2)
        };
      
      return ret;
    },
    
    deleteApp : function(uid)
    {
      // See if this app exists.
      if (! this._db.apps[uid])
      {
        // He doesn't. Let 'em know.
        return false;
      }
      
      // Delete the app
      delete this._db.apps[uid];
      
      // We were successful
      return true;
    },
    
    getAppList : function(bStringize)
    {
      var             clonedApp;
      var             appList = [];
      
      // For each app...
      for (var app in this._db.apps)
      {
        // Clone the app entry for this app
        clonedApp = qx.lang.Object.clone(this._db.apps[app]);
        
        // If we were asked to stringize the values...
        if (bStringize)
        {
          // ... then do so
          clonedApp.tags = clonedApp.tags.join(", ");
        }
        
        // Push this app onto the app list
        appList.push(clonedApp);
      }
      
      // We've built the whole list. Return it.
      return appList;
    }
  }
});
