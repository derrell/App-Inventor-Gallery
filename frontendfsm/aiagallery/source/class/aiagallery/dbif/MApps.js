/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MApps",
{
  construct : function()
  {
    this.registerService("addOrEditApp", this.addOrEditApp);
    this.registerService("deleteApp",    this.deleteApp);
    this.registerService("getAppList", this.getAppList);
    this.registerService("appQuery", this.appQuery);
    this.registerService("getAppInfo", this.getAppInfo);
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
      var             tagObj;
      var             tagData;
      var             oldTags;
      var             uploadTime;
      var             status;
      var             statusIndex;
      var             appData;
      var             appObj;
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
          "owner",
          "title",
          "description",
          "tags",
          "source"
        ];
      
      // Don't let the caller override the owner
      delete attributes["owner"];

      // Determine who the logged-in user is
      whoami = this.getUserData("whoami");

      // Get an AppData object. If uid is non-null, retrieve the prior data.
      appObj = new aiagallery.dbif.ObjAppData(uid);

      // Retrieve the data
      appData = appObj.getData();

      // If we were given a record identifier...
      if (uid !== null)
      {
        // ... it must have already existed or it's an error
        if (appObj.getBrandNew())
        {
          // It didn't!
          error.setCode(1);
          error.setMessage("Unrecognized UID");
          return error;
        }

        // Ensure that the logged-in user owns this application.
        if (appData.owner != whoami)
        {
          // He doesn't. Someone's doing something nasty!
          error.setCode(2);
          error.setMessage("Not owner");
          return error;
        }
      }
      else
      {
        // Initialize the owner field
        appData.owner = whoami;
      }

      // Save the existing tags list
      oldTags = appData.tags;

      // Copy fields from the attributes parameter into this db record
      allowableFields.forEach(
        function(field)
        {
          // Was this field provided in the parameter attributes?
          if (attributes[field])
          {
            // Yup. Replace what's in the db entry
            appData[field] = attributes[field];
          }

          // If this field is required and not available...
          if (qx.lang.Array.contains(requiredFields, field) && ! appData[field])
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
        appData.uploadTime = String((new Date()).getTime());
      }

      // Add new tags to the database, and update counts of formerly-existing
      // tags. Remove "normal" tags with a count of 0.
      appData.tags.forEach(
        function(tag)
        {
          // If the tag existed previously, ignore it.
          if (qx.lang.Array.contains(oldTags, tag))
          {
            // Remove it from oldTags
            qx.lang.Array.remove(oldTags, tag);
            return;
          }
          
          // It didn't exist. Create or retrieve existing tag.
          tagObj = new aiagallery.dbif.ObjTags(tag);
          tagData = tagObj.getData();
          
          // If we created it, data is initialized. Otherwise...
          if (! tagObj.getBrandNew())
          {
            // ... it existed, so we need to increment its count
            ++tagData.count;
          }
          
          // Save the tag object
          tagObj.put();
        });
      
      // Anything left in oldTags are those which were removed.
      oldTags.forEach(
        function(tag)
        {
          tagObj = new aiagallery.dbif.ObjTags(tag);
          tagData = tagObj.getData();

          // The record has to exist already. Decrement this tag's count.
          --tagData.count;

          // Ensure it's a "normal" tag
          if (tagData.type != "normal")
          {
            // It's not, so we have nothing more we need to do.
            return;
          }
          
          // If the count is less than 1...
          if (tagData.count < 1)
          {
            // ... then we can remove the tag
            tagObj.removeSelf();
          }
        });

      // Save this record in the database
      appObj.put();
      
      return appObj.getData();  // This includes newly-created key (if adding)
    },
    
    deleteApp : function(uid, error)
    {
      var             appObj;
      var             appData;
      var             tagObj;
      var             tagData;
      var             whoami;

      // Retrieve an instance of this application entity
      appObj = new aiagallery.dbif.ObjAppData(uid);
      
      // Does this application exist?
      if (appObj.getBrandNew())
      {
        // It doesn't. Let 'em know.
        return false;
      }

      // Get the object data
      appData = appObj.getData();
      
      // Determine who the logged-in user is
      whoami = this.getUserData("whoami");

      // Ensure that the logged-in user owns this application
      if (appData.owner != whoami)
      {
        // He doesn't. Someone's doing something nasty!
        error.setCode(1);
        error.setMessage("Not owner");
        return error;
      }

      // Decrement counts for tags used by this application.
      appData.tags.forEach(
        function(tag)
        {
          // Get this tag object
          tagObj = new aiagallery.dbif.ObjTags(tag);
          tagData = tagObj.getData();

          // The record has to exist already. Decrement this tag's count.
          --tagData.count;

          // Ensure it's a "normal" tag
          if (tagData.type != "normal")
          {
            // It's not, so we have nothing more we need to do.
            return;
          }
          
          // If the count is less than 1...
          if (tagData.count < 1)
          {
            // ... then we can remove the tag
            tagObj.removeSelf();
          }
        });

      // Delete the app
      appObj.removeSelf();
      
      // We were successful
      return true;
    },
    
/**
 * Get a portion of the application list.
 *
 * @param bStringize {Boolean}
 *   Whether the tags, previousAuthors, and status values should be reformed
 *   into a string representation rather than being returned in their native
 *   representation.
 *
 * @param bAll {Boolean}
 *   Whether to return all applications (if permissions allow it) rather than
 *   only those applications owned by the logged-in user.
 *
 * @param sortCriteria {Array}
 *   An array of maps. Each map contains a single key and value, with the key
 *   being a field name on which to sort, and the value being one of the two
 *   strings, "asc" to request an ascending sort on that field, or "desc" to
 *   request a descending sort on that field. The order of maps in the array
 *   determines the priority of that field in the sort. The first map in the
 *   array indicates the primary sort key; the second map in the array
 *   indicates the next-highest-priority sort key, etc.
 *
 * @param offset {Integer}
 *   An integer value >= 0 indicating the number of records to skip, in the
 *   specified sort order, prior to the first one returned in the result set.
 *
 * @param limit {Integer}
 *   An integer value > 0 indicating the maximum number of records to return
 *   in the result set.
 */
    getAppList : function(bStringize, bAll, sortCriteria, offset, limit)
    {
      var             categories;
      var             categoryNames;
      var             appList;
      var             whoami;
      var             criteria;
      var             resultCriteria = [];
      
      // Get the current user
      whoami = this.getUserData("whoami");

      // Create the criteria for a search of apps of the current user
      if (! bAll)
      {
        criteria =
          {
            type  : "element",
            field : "owner",
            value : whoami
          };
      }
      else
      {
        // We want all objects
        criteria = null;
      }
      
      // If an offset is requested...
      if (typeof(offset) != "undefined" && offset !== null)
      {
        // ... then specify it in the result criteria.
        resultCriteria.push({ "offset" : offset });
      }
      
      // If a limit is requested...
      if (typeof(limit) !== "undefined" && limit !== null)
      {
        // ... then specify it in the result criteria
        resultCriteria.push({ "limit" : limit });
      }
      
      // If sort criteria are given...
      if (typeof(sortCriteria) !== "undefined" && sortCriteria !== null)
      {
        // ... then add them too.
        resultCriteria.push({ type : "sort", value : sortCriteria });
      }

      // Issue a query for all apps 
      appList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjAppData", 
                                        criteria,
                                        resultCriteria);

      // If we were asked to stringize the values...
      if (bStringize)
      {
        // ... then for each app that matched the criteria...
        appList.forEach(
          function(app)
          {
            [
              "tags",
              "previousAuthors"
            ].forEach(function(field)
              {
                // ... stringize this field.
                app[field] = app[field].join(", ");
              });

            // Convert from numeric to string status
            app.status = [ "Banned", "Pending", "Active" ][app.status];
          });
      }
      
      // Create the criteria for a search of tags of type "category"
      criteria =
        {
          type  : "element",
          field : "type",
          value : "category"
        };
      
      // Issue a query for category tags
      categories = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjTags", 
                                           criteria,
                                           [
                                             { 
                                               type : "sort",
                                               value :
                                               {
                                                 "value" : "asc"
                                               }
                                             }
                                           ]);
      
      // They want only the tag value to be returned
      categoryNames = categories.map(function() { return arguments[0].value; });

      // We've built the whole list. Return it.
      return { apps : appList, categories : categoryNames };
    },
    
    appQuery : function(criteria, requestedFields)
    {
      var             appList;
      var             categories;
      var             categoryNames;

      appList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjAppData", criteria);

      // Remove those members which are not requested, and rename as requested
      appList.forEach(
        function(app)
        {
          var requested;

          for (var field in app)
          {
            requested = requestedFields[field];
            if (! requested)
            {
              delete app[field];
            }
            else
            {
              // If the field name is to be remapped...
              if (requested != field)
              {
                // then copy and delete to effect the remapping.
                app[requested] = app[field];
                delete app[field];
              }
            }
          }
        });

      // Create the criteria for a search of tags of type "category"
      criteria =
        {
          type  : "element",
          field : "type",
          value : "category"
        };
      
      // Issue a query for all categories
      categories = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjTags", 
                                           criteria,
                                           [
                                             { 
                                               type : "sort",
                                               value :
                                               {
                                                 "value" : "asc"
                                               }
                                             }
                                           ]);
      
      // They want only the tag value to be returned
      categoryNames = categories.map(function() 
                                     { 
                                       return arguments[0].value;
                                     });

      return { apps : appList, categories : categoryNames };
    },
    
    getAppInfo : function(uid, bStringize, error)
    {
      var             app;
      var             appList;
      var             tagTable;
      var             whoami;
      var             criteria;
      var             owner;

      whoami = this.getUserData("whoami");

      // Create the criteria for the specified application
      criteria =
        {
          type  : "element",
          field : "uid",
          value : uid
        };
      
      // Issue a query for all apps 
      appList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjAppData", criteria);

      // See if this app exists. 
      if (appList.length == 0)
      {
        // It doesn't. Let 'em know that the application has just been removed
        // (or there's a programmer error)
        error.setCode(1);
        error.setMessage("Application is not available. " +
                         "It may have been removed recently.");
        return error;
      }

      // Get the (one and only) application that was returned.
      app = appList[0];

      // If the application status is not Active, only the owner can view it.
      if (app.owner != whoami && app.status != 2)
      {
        // It doesn't. Let 'em know that the application has just been removed
        // (or there's a programmer error)
        error.setCode(1);
        error.setMessage("Application is not available. " +
                         "It may have been removed recently.");
        return error;
      }

      // Delete the owner field. User doesn't get to see that.
      delete app.owner;
      
      // Delete the apk and source fields. Not needed here, and could be large.
      delete app.apk;
      delete app.source;

      // Instead, add a display name field. Retrieve it
      criteria =
        {
          type  : "element",
          field : "id",
          value : whoami
        };
      
      // Issue a query for this visitor
      owner = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors", criteria);

      // Assign the display name as the application's owner name
      app.ownerName = owner.displayName;

      // If we were asked to stringize the values...
      if (bStringize)
      {
        // ... then do so
        [
          "tags",
          "previousAuthors"
        ].forEach(function(field)
          {
            app[field] = app[field].join(", ");
          });

        // Convert from numeric to string status
        app.status =
          [ "Banned", "Pending", "Active" ][app.status];
      }

      // Give 'em what they came for
      return app;
    }    
  }
});
