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

  statics :
  {
    /** The next AppId value to use */
    nextAppId : 100
  },

  members :
  {
    addOrEditApp : function(uid, attributes, error)
    {
      var             uid;
      var             title;
      var             description;
      var             image1;
      var             image2;
      var             image3;
      var             previousAuthors;
      var             source;
      var             executable;
      var             tags;
      var             uploadTime;
      var             status;
      var             statusIndex;
      var             app;
      var             bNew;
      var             whoami;
      var             missing = [];
      var             allowableFields =
        [
          "uid",
          "owner",
          "title",
          "description",
          "image1",
          "image2",
          "image3",
          "previousAuthors",
          "source",
          "executable",
          "tags",
          "uploadTime",
          "numLikes",
          "numDownloads",
          "numViewed",
          "numComments",
          "status"
        ];
      var             requiredFields =
        [
          "uid",
          "owner",
          "title",
          "description",
          "tags",
          "source"
        ];
      
      // Don't let the caller override the owner
      delete attributes["owner"];

      // Get the old app entry
      app = this._db.apps[uid];

      // Determine who the logged-in user is
      whoami = qx.core.Init.getApplication().getRoot().getUserData("whoami");

      // Did it already exist?
      if (! app)
      {
        // Nope. We're creating it new.
        bNew = true;
        
        // Initialize field names for this new record
        app =
          {
            uid             : MApps.nextAppId,
            owner           : whoami,
            title           : null,
            description     : null,
            image1          : null,
            image2          : null,
            image3          : null,
            previousAuthors : [],
            source          : null,
            executable      : null,
            tags            : null,
            uploadTime      : null,
            numLikes        : 0,
            numDownloads    : 0,
            numViewed       : 0,
            numComments     : 0,
            status          : aiagallery.rpcsim.RpcSim.Status.Active
          };
      }
      else
      {
        // It already existed
        bNew = false;
        
        // Ensure that the logged-in user owns this application
        if (app.owner != whoami)
        {
          // He doesn't. Someone's doing something nasty!
          error.setCode(1);
          error.setMessage("Not owner");
        }
      }
      
      // Copy fields from the attributes parameter into this db record
      allowableFields.forEach(
        function(field)
        {
          // Was this field provided in the parameter attributes?
          if (attributes[field])
          {
            // Yup. Replace what's in the db entry
            app[field] = attributes[field];
          }

          // If this field is required and not available...
          if (qx.lang.Array.contains(requiredFields, field) && ! app[field])
          {
            // then mark it as missing
            missing.push(field);
          }
        });

      // Were there any missing, required fields?
      if (missing.length > 0)
      {
        // Yup. Let 'em know.
        error.setCode(2);
        error.setMessage("Missing required attributes: " + missing.join(", "));
        return error;
      }
      
      // If a new source file was uploaded...
      if (attributes.source)
      {
        // ... then update the upload time to now
        app.uploadTime = new Date();
      }

      // Save this record in the database
      this._db.apps[uid] = app;
      
      // Did we generate a new uid?
      if (bNew)
      {
        // Yup. Update to the next uid.
        ++MApps.nextAppId;
      }
      return app;
    },
    
    deleteApp : function(uid, error)
    {
      var             app;
      var             whoami;

      // See if this app exists.
      app = this._db.apps[uid];
      if (! app)
      {
        // It doesn't. Let 'em know.
        return false;
      }
      
      // Determine who the logged-in user is
      whoami = qx.core.Init.getApplication().getRoot().getUserData("whoami");

      // Ensure that the logged-in user owns this application
      if (app.owner != whoami)
      {
        // He doesn't. Someone's doing something nasty!
        error.setCode(1);
        error.setMessage("Not owner");
        return error;
      }

      // Delete the app
      delete this._db.apps[uid];
      
      // We were successful
      return true;
    },
    
    getAppList : function(bStringize)
    {
      var             clonedApp;
      var             categories;
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
          [
            "tags",
            "previousAuthors"
          ].forEach(function(field)
            {
              clonedApp[field] = clonedApp[field].join(", ");
            });
          
          // Convert from numeric to string status
          clonedApp.status =
            [ "Banned", "Pending", "Active" ][clonedApp.status];
        }
        
        // Push this app onto the app list
        appList.push(clonedApp);
      }
      
      // Retrieve the list of "category" tags
      categories = [];
      for (var tag in this._db.tags)
      {
        if (this._db.tags[tag].type == "category")
        {
          categories.push(tag);
        }
      }
      
      // We've built the whole list. Return it.
      return { apps : appList, categories : categories };
    }
  }
});
