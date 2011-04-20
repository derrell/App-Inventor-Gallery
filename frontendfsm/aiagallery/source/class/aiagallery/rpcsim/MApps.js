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
      var             title;
      var             description;
      var             image1;
      var             image2;
      var             image3;
      var             previousAuthors;
      var             source;
      var             apk;
      var             tags;
      var             oldTags;
      var             tagTable;
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
          "apk",
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

      // Determine who the logged-in user is
      whoami = qx.core.Init.getApplication().getRoot().getUserData("whoami");

      // If we were given a record identifier...
      if (uid !== null)
      {
        // ... then get the old app entry
        app = this._db.apps[uid];
        
        // It must have already existed or it's an error
        if (! app)
        {
          // It didn't!
          error.setCode(1);
          error.setMessage("Unrecognized UID");
          return error;
        }

        // Ensure that the logged-in user owns this application.
        if (app.owner != whoami)
        {
          // He doesn't. Someone's doing something nasty!
          error.setCode(2);
          error.setMessage("Not owner");
          return error;
        }

        bNew = false;
      }
      else
      {
        // Otherwise we create a new record
        uid = aiagallery.rpcsim.MApps.nextAppId;
        bNew = true;

        // Initialize field names for this new record
        app =
          {
            uid             : uid,
            owner           : whoami,
            title           : null,
            description     : null,
            image1          : null,
            image2          : null,
            image3          : null,
            previousAuthors : [],
            source          : null,
            apk             : null,
            tags            : [],
            uploadTime      : null,
            numLikes        : 0,
            numDownloads    : 0,
            numViewed       : 0,
            numComments     : 0,
            status          : aiagallery.rpcsim.RpcSim.Status.Active
          };
      }

      // Save the existing tags list
      oldTags = app.tags;

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
        error.setCode(3);
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
      
      // Gain easy access to the tags "table" of the database
      tagTable = this._db.tags;

      // Add new tags to the database, and update counts of formerly-existing
      // tags. Remove "normal" tags with a count of 0.
      app.tags.forEach(
        function(tag)
        {
          // If the tag existed previously, ignore it.
          if (qx.lang.Array.contains(oldTags, tag))
          {
            // Remove it from oldTags
            qx.lang.Array.remove(oldTags, tag);
            return;
          }
          
          // It didn't exist. See if there's already such a tag
          if (! tagTable[tag])
          {
            // There isn't. Create a new tag with a count of 1
            tagTable[tag] = { type  : "normal", count : 1 };
          }
          else
          {
            // It existed. Increment its count
            ++tagTable[tag].count;
          }
        });
      
      // Anything left in oldTags are those which were removed.
      oldTags.forEach(
        function(tag)
        {
          // The record has to exist already. Decrement this tag's count.
          --tagTable[tag].count;

          // Ensure it's a "normal" tag
          if (tagTable[tag].type != "normal")
          {
            // It's not, so we have nothing more we need to do.
            return;
          }
          
          // If the count is less than 1...
          if (tagTable[tag].count < 1)
          {
            // ... then we can remove the tag
            delete tagTable[tag];
          }
        });

      // Did we generate a new uid?
      if (bNew)
      {
        // Yup. Update to the next uid.
        ++aiagallery.rpcsim.MApps.nextAppId;
      }

      return qx.lang.Object.clone(app);
    },
    
    deleteApp : function(uid, error)
    {
      var             app;
      var             whoami;
      var             tagTable;

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

      // Gain easy access to the tags "table" of the database
      tagTable = this._db.tags;

      // Decrement counts for tags used by this application.
      app.tags.forEach(
        function(tag)
        {
          // The record has to exist already. Decrement this tag's count.
          --tagTable[tag].count;

          // Ensure it's a "normal" tag
          if (tagTable[tag].type != "normal")
          {
            // It's not, so we have nothing more we need to do.
            return;
          }
          
          // If the count is less than 1...
          if (tagTable[tag].count < 1)
          {
            // ... then we can remove the tag
            delete tagTable[tag];
          }
        });

      // Delete the app
      delete this._db.apps[uid];
      
      // We were successful
      return true;
    },
    
    getAppList : function(bStringize, bAll)
    {
      var             clonedApp;
      var             categories;
      var             appList = [];
      var             whoami;
      
      whoami = qx.core.Init.getApplication().getRoot().getUserData("whoami");

      // For each app...
      for (var app in this._db.apps)
      {
        // Reject apps that don't belong to the currently-logged-in user
        if (! bAll && this._db.apps[app].owner != whoami)
        {
          // It's not his. Skip this one.
          continue;
        }

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
