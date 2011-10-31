/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MApps",
{
  construct : function()
  {
    this.registerService("addOrEditApp",
                         this.addOrEditApp,
                         [ "uid", "attributes" ]);

    this.registerService("deleteApp",
                         this.deleteApp,
                         [ "uid" ]);

    this.registerService("getAppList",
                         this.getAppList,
                         [ "bStringize", "sortCriteria", "offset", "limit" ]);

    this.registerService("getAppListAll",
                         this.getAppListAll,
                         [ "bStringize", "sortCriteria", "offset", "limit" ]);

    this.registerService("appQuery",
                         this.appQuery,
                         [ "criteria", "requestedFields" ]);
    
    this.registerService("intersectKeywordAndQuery",
                         this.intersectKeywordAndQuery,
                         [ "queryArgs" ]);


    this.registerService("getAppListByList",
                         this.getAppListByList,
                         [ "uidArr", "requestedFields" ]);

    
    this.registerService("getAppInfo",
                         this.getAppInfo,
                         [ "uid", "bStringize", "requestedFields" ]);
  },

  statics :
  {
    /** The next AppId value to use */
    nextAppId : 100,
    
    /**
     * Stringize the array fields of an App
     * 
     * @param app {Object}
     *   a reference to the App whose array fields are to be stringized.
     */
    __stringizeAppInfo : function(app)
    {
            [
              // FIXME: When previous Author chain is implemented, uncomment
              //"previousAuthors",
              "tags"
              
            ].forEach(function(field)
              {
                // ... stringize this field.
                app[field] = app[field].join(", ");
              });

            // Convert from numeric to string status
            app.status = [ "Banned", "Pending", "Active" ][app.status];
            
      
    },
    
    /**
     * Strip an App object of all but the requested fields. Also renames
     * fields per request
     * 
     * @param app {Object}
     *   a reference to the App whose fields are to be deleted or renamed.
     * 
     * @param requestedFields {Map?}
     *   If provided, this is a map containing, as the member names, the
     *   fields which should remain in the resultant Object. The value of each
     *   entry in the map indicates what to name that field, in the
     *   result. (This produces a mapping of the field names.) An example is
     *   requestedFields map might look like this:
     *
     *     {
     *       uid    : "uid",   // No change in name. 
     *       title  : "label", // remap the title field to be called "label"
     *       image1 : "icon",  // remap the image1 field to be called "icon"
     *       tags   : "tags"
     *     }
     * 
     *   Any field which is not in this map is deleted from app
     */
    _requestedFields : function(app, requestedFields)
    {
      // Remove those members which are not requested, and rename as requested
      var requested;
      
      for (var field in app)
      {
        // Is this field a requested field?
        requested = requestedFields[field];
        if (! requested)
        {
          // No, remove it
          delete app[field];
        }
        
        // If the field name is to be remapped...
        if (requested != field)
        {
          // then copy and delete to effect the remapping.
          app[requested] = app[field];
          delete app[field];
        }
      }
    },
    
    /**
     * Add or confirm existence of each word in each field of given App Data
     * 
     *@param dataObj {Object}
     *  The result of getData() on the app object. Contains all the info in the
     *  database recorded for this App
     * 
     */
    _populateSearch : function(dataObj)
    {
      var appDataField;
      var wordsToAdd;
      var searchObj;
      var appId = dataObj["uid"];
      
      for (appDataField in dataObj)
      {
        // Go through each field in the App Data Object
        switch (appDataField)
        {
        // If it's one of the text fields...
        case "title":
        case "description":
          // Split up the words and...
          wordsToAdd = dataObj[appDataField].split(" ");
          wordsToAdd.forEach(function(word)
              {
                // Make sure to only add lower case words to the search
                // database
                var wordLC = word.toLowerCase();
                
                // If the word is a stop word, discard it
                if (qx.lang.Array.contains(aiagallery.dbif.MSearch.stopWordArr,
                                           word))
                {
                  return;
                }

                // Add each one to the db                
                searchObj = new aiagallery.dbif.ObjSearch([wordLC,
                                                          appId,
                                                         appDataField]);
                // Save the record in the DB.
                searchObj.put();
              });
          break;

        case "tags":
          wordsToAdd = dataObj[appDataField];
          wordsToAdd.forEach(function(word)
              {
                
                // Make sure to only add lower case words to the search database
                var wordLC = word.toLowerCase();
                
                // Add each one to the db                
                searchObj = new aiagallery.dbif.ObjSearch([wordLC,
                                                          appId,
                                                         appDataField]);
                // Save the record in the DB.
                searchObj.put();
              });
          break;
          
        }
      }
    },
    
    /**
     * Ensure that there are no Search records from App with this uid
     * 
     *@param uid {Integer}
     * This is the app's uid whose Search records are to be wiped
     */
    _removeAppFromSearch : function(uid)
    {
      var results;
      var resultObj;
      var searchObj;
      
      // Get all Search Objects with this uid then...
      results = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjSearch",
                                        {
                                          type : "element",
                                          field: "appId",
                                          value: uid
                                        },
                                       null);
      // Remove every record found
      results.forEach(function(obj)
                      {
                        searchObj = new aiagallery.dbif.ObjSearch([obj["word"],
                                                      obj["appId"],
                                                      obj["appField"]]);
                        searchObj.removeSelf();
                      });
    }
  },
  
  members :
  {
    addOrEditApp : function(uid, attributes, error)
    {
      var             i;
      var             title;
      var             description;
      var             image;
      var             previousAuthors;
      var             source;
      var             apk;
      var             tags;
      var             tagObj;
      var             tagData;
      var             oldTags;
      var             bHasCategory;
      var             categories;
      var             uploadTime;
      var             status;
      var             statusIndex;
      var             appData;
      var             appObj;
      var             bNew;
      var             whoami;
      var             missing = [];
      var             sourceData;
      var             apkData;
      var             key;
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
          "source",
          "image1"
        ];
      
      // Don't let the caller override the owner
      delete attributes["owner"];

      // Determine who the logged-in user is
      whoami = this.getWhoAmI();

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
        if (appData.owner != whoami.email)
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
        appData.owner = whoami.email;
      }

      // Save the existing tags list
      oldTags = appData.tags;

      // If there's no image1 value...
      if (! attributes.image1)
      {
        // ... then move image3 or image2 to image1
        if (attributes.image3)
        {
          attributes.image1 = attributes.image3;
          attributes.image3 = null;
        }
        else
        {
          // image2 may not exist either, which will be caught in the
          // code that detects missing fields.
          attributes.image1 = attributes.image2;
          attributes.image2 = null;
        }
      }
      
      // Similarly, if there's no image2 value...
      if (! attributes.image2)
      {
        // ... then move image3 to image2. (Again, it may not exist.)
        attributes.image2 = attributes.image3;
        attributes.image3 = null;
      }

      // Copy fields from the attributes parameter into this db record
      allowableFields.forEach(
        function(field)
        {
          // Was this field provided in the parameter attributes?
          if (attributes[field])
          {
            // Handle source and apk fields specially
            switch(field)
            {
            case "source":
              // Save the field data
              sourceData = attributes.source;

              // Ensure that we have an array of keys. The most recent key is
              // kept at the top of the stack.
              if (! appData.source)
              {
                appData.source = [];
              }
              break;
              
            case "apk":
              // Save the field data
              apkData = attributes.apk;

              // Ensure that we have an array of keys. The most recent key is
              // kept at the top of the stack.
              if (! appData.apk)
              {
                appData.apk = [];
              }
              break;

            default:
              // Replace what's in the db entry
              appData[field] = attributes[field];
              break;
            }
          }

          // If this field is required and not available...
          if (qx.lang.Array.contains(requiredFields, field) && ! appData[field])
          {
            // then mark it as missing
            missing.push(field);
          }
        });

      // Issue a query for all category tags
      categories = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjTags", 
                                           {
                                             type  : "element",
                                             field : "type",
                                             value : "category"
                                           },
                                           null);
      
      // We want to look at only the value field of each category
      categories = categories.map(
        function(o)
        {
          return o.value;
        });

      // Ensure that at least one of the specified tags is a category
      bHasCategory = false;
      tags = appData.tags;
      for (i = 0; i < tags.length; i++)
      {
        // Is this tag a category?
        if (qx.lang.Array.contains(categories, tags[i]))
        {
          // Yup. Mark it.
          bHasCategory = true;
          
          // No need to look further.
          break;
        }
      }
      
      // Did we find at least one category tag?
      if (! bHasCategory)
      {
        // Nope. Let 'em know.
        error.setCode(3);
        error.setMessage("At least one category is required");
        return error;
      }

      // Were there any missing, required fields?
      if (missing.length > 0)
      {
        // Yup. Let 'em know.
        error.setCode(4);
        error.setMessage("Missing required attributes: " + missing.join(", "));
        return error;
      }
      
      // If a new source file was uploaded...
      if (sourceData)
      {
        // ... then update the upload time to now
        appData.uploadTime = String((new Date()).getTime());
      }

      // FIXME: Begin a transaction here

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

      try
      {
        // Save the new source data (if there is any)
        if (sourceData)
        {
          // Save the data and prepend the blob id to the key list
          key = rpcjs.dbif.Entity.putBlob(sourceData);
          appData.source.unshift(key);
        }
        
        // Similarly for apk data
        if (apkData)
        {
          // Save the data and prepend the blob id to the key list
          key = rpcjs.dbif.Entity.putBlob(apkData);
          appData.apk.unshift(key);
        }
      }
      catch(e)
      {
        error.setCode(5);
        error.setMessage(e.toString());
        // FIXME: roll back transaction here
        return error;
      }

      // Save this record in the database
      appObj.put();
      
      // Add all words in text fields to word Search record
      aiagallery.dbif.MApps._populateSearch(appObj.getData());
      
      // FIXME: Commit the transaction here

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
      whoami = this.getWhoAmI();

      // Ensure that the logged-in user owns this application
      if (! whoami || appData.owner != whoami.email)
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

      // Remove any apk blobs associated with this app
      if (appData.apk)
      {
        appData.apk.forEach(
          function(apkBlobId)
          {
            rpcjs.dbif.Entity.removeBlob(apkBlobId);
          });
      }

      // Similarly for any source blobs
      if (appData.source)
      {
        appData.source.forEach(
          function(sourceBlobId)
          {
            rpcjs.dbif.Entity.removeBlob(sourceBlobId);
          });
      }

      // Delete the app
      appObj.removeSelf();
      
      aiagallery.dbif.MApps._removeAppFromSearch(uid);
      
      // We were successful
      return true;
    },
    
    /**
     * Get a portion of the application list.
     *
     * @param bStringize {Boolean}
     *   Whether the tags, previousAuthors, and status values should be
     *   reformed into a string representation rather than being returned in
     *   their native representation.
     *
     * @param sortCriteria {Array}
     *   An array of maps. Each map contains a single key and value, with the
     *   key being a field name on which to sort, and the value being one of
     *   the two strings, "asc" to request an ascending sort on that field, or
     *   "desc" to request a descending sort on that field. The order of maps
     *   in the array determines the priority of that field in the sort. The
     *   first map in the array indicates the primary sort key; the second map
     *   in the array indicates the next-highest-priority sort key, etc.
     *
     * @param offset {Integer}
     *   An integer value >= 0 indicating the number of records to skip, in
     *   the specified sort order, prior to the first one returned in the
     *   result set.
     *
     * @param limit {Integer}
     *   An integer value > 0 indicating the maximum number of records to return
     *   in the result set.
     *
     * @param bAll {Boolean}
     *   Whether to return all applications (if permissions allow it) rather
     *   than only those applications owned by the logged-in user.
     */
    _getAppList : function(bStringize, sortCriteria, offset, limit, bAll)
    {
      var             categories;
      var             categoryNames;
      var             appList;
      var             whoami;
      var             criteria;
      var             resultCriteria = [];
      var             owners;
  
      // Get the current user
      whoami = this.getWhoAmI();

      // Create the criteria for a search of apps of the current user
      if (! bAll)
      {
        criteria =
          {
            type  : "element",
            field : "owner",
            value : whoami.email
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
        for (var sortField in sortCriteria)
        {
          resultCriteria.push(
          { 
            type : "sort", 
            field: sortField, 
            order: sortCriteria[sortField]
          });
        }
      }

      // Issue a query for all apps 
      appList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjAppData", 
                                        criteria,
                                        resultCriteria);

      // Manipulate each App individually, before returning
      appList.forEach(
          function(app)
          {
            // Replace the owner name with the owner's display name
            owners = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                            app["owner"]);

            // Replace his visitor id with his display name
            app["owner"] = owners[0].displayName;
           
            // If we were asked to stringize the values...
            if (bStringize)
            {
              // ... then send each App to the Stringizer
              aiagallery.dbif.MApps.__stringizeAppInfo(app);
            }
            
          });
        
  
      
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
                                               type  : "sort",
                                               field : "value",
                                               order : "asc"
                                             }
                                           ]);
      
      // They want only the tag value to be returned
      categoryNames = categories.map(function() { return arguments[0].value; });

      // We've built the whole list. Return it.
      return { apps : appList, categories : categoryNames };
    },
    
    /**
     * Get a the application list of the logged-in user.
     *
     * @param bStringize {Boolean}
     *   Whether the tags, previousAuthors, and status values should be
     *   reformed into a string representation rather than being returned in
     *   their native representation.
     *
     * @param sortCriteria {Array}
     *   An array of maps. Each map contains a single key and value, with the
     *   key being a field name on which to sort, and the value being one of
     *   the two strings, "asc" to request an ascending sort on that field, or
     *   "desc" to request a descending sort on that field. The order of maps
     *   in the array determines the priority of that field in the sort. The
     *   first map in the array indicates the primary sort key; the second map
     *   in the array indicates the next-highest-priority sort key, etc.
     *
     * @param offset {Integer}
     *   An integer value >= 0 indicating the number of records to skip, in
     *   the specified sort order, prior to the first one returned in the
     *   result set.
     *
     * @param limit {Integer}
     *   An integer value > 0 indicating the maximum number of records to return
     *   in the result set.
     */
    getAppList : function(bStringize, sortCriteria, offset, limit)
    {
      return this._getAppList(bStringize, sortCriteria, offset, limit, false);
    },

    /**
     * Get a the entire application list.
     *
     * @param bStringize {Boolean}
     *   Whether the tags, previousAuthors, and status values should be
     *   reformed into a string representation rather than being returned in
     *   their native representation.
     *
     * @param sortCriteria {Array}
     *   An array of maps. Each map contains a single key and value, with the
     *   key being a field name on which to sort, and the value being one of
     *   the two strings, "asc" to request an ascending sort on that field, or
     *   "desc" to request a descending sort on that field. The order of maps
     *   in the array determines the priority of that field in the sort. The
     *   first map in the array indicates the primary sort key; the second map
     *   in the array indicates the next-highest-priority sort key, etc.
     *
     * @param offset {Integer}
     *   An integer value >= 0 indicating the number of records to skip, in
     *   the specified sort order, prior to the first one returned in the
     *   result set.
     *
     * @param limit {Integer}
     *   An integer value > 0 indicating the maximum number of records to return
     *   in the result set.
     */
    getAppListAll : function(bStringize, sortCriteria, offset, limit)
    {
      return this._getAppList(bStringize, sortCriteria, offset, limit, true);
    },

    /**
     * Issue a query for a set of applicaitons. Limit the response to
     * particular fields.
     *
     * @param criteria {Map|Key}
     *   Criteria for selection of which applications to return. This
     *   parameter is in the format described in the 'searchCriteria'
     *   parameter of rpcjs.dbif.Entity.query().
     *
     * @param requestedFields {Map?}
     *   If provided, this is a map containing, as the member names, the
     *   fields which should be returned in the results. The value of each
     *   entry in the map indicates what to name that field, in the
     *   result. (This produces a mapping of the field names.) An example is
     *   requestedFields map might look like this:
     *
     *     {
     *       uid    : "uid",
     *       title  : "label", // remap the title field to be called "label"
     *       image1 : "icon",  // remap the image1 field to be called "icon"
     *       tags   : "tags"
     *     }
     *
     *         return { apps : appList, categories : categoryNames };
     * @return {Map}
     *   The return value is a map with two members: "apps" and
     *   "categories". The former is an array of maps, each providing
     *   information about one application. The latter is an array of the tags
     *   which are identified as top-level categories.
     */
    appQuery : function(criteria, requestedFields)
    {
      var             appList;
      var             categories;
      var             categoryNames;
      var             owners;

      appList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjAppData", criteria);

      // Manipulate each App individually
      appList.forEach(
        function(app)
        {
          // Issue a query for this visitor
          owners = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors", 
                                       app.owner);

          // Replace the (private) owner id with his display name
          app.owner = owners[0].displayName;
          
          // If there were requested fields specified...
          if (requestedFields)
          {
            // Send to the requestedFields function for removal and remapping
            aiagallery.dbif.MApps._requestedFields(app, requestedFields);
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
                                               type  : "sort",
                                               field : "value",
                                               order : "asc"
                                             }
                                           ]);
      
      // Tag objects contain the tag value, type, and count of uses. For this
      // procedure, we want to return only the tag value.
      categoryNames = categories.map(function() 
                                     { 
                                       return arguments[0].value;
                                     });

      return { apps : appList, categories : categoryNames };
    },

    /**
     * Perform a keyword search on the given string, as well as an appQuery on
     * the given criteria, and return the intersection of the results.
     * 
     * @param queryArgs {Map}
     *   This is a map containing member names that are the 4 unique parameters
     *   to MApps.appQuery(criteria, requestedFields) and 
     *   keywordSearch(keywordString, queryFields, requestedFields)
     *  
     *   The value of each of those members is the argument to be passed upon
     *   calling that RPC
     *  
     *   For example:
     *  
     *     {
     *       criteria         : {....(see MApps.appQuery() docu....},
     *       requestedFields  : {....(see MApps.appQuery() docu....},
     *       keywordString    : "Some words to search on",
     *       queryFields      : null // not implemented yet,
     *                               // pass null for safety
     *     }
     * 
     * @return {Map}
     *   The return value is an array of maps, each providing information
     *   about one application.
     *
     */
    intersectKeywordAndQuery : function(queryArgs, error)
    {      

      var               keywordString;
      var               appQueryResults;
      var               appQueryResultArr = [];
      var               bQueryUsed = true;
      var               keywordSearchResultArr = [];
      var               bKeywordUsed = true;
      var               intersectionArr = [];
      
      // Going to perform keyword search first
      keywordString = queryArgs["keywordString"];
      
      // If there was no keyword string provided
      if (keywordString === null || typeof keywordString === "undefined" ||
          keywordString === "")
      {
        // Then just use the results of appQuery
        bKeywordUsed = false;
      }
      else
      {
        // Perform keyword search
        keywordSearchResultArr = this.keywordSearch(keywordString,
                                                queryArgs["queryFields"],
                                                queryArgs["requestedFields"],
                                                error);
        // If there was a problem
        if (keywordSearchResultArr === error)
        {
          // Propegate the failure
          return error;
        }
      }
      
      // Was there any criteria given to perform appQuery on?
      if (queryArgs["criteria"]["method"] === "and" &&
          queryArgs["criteria"]["children"].length === 0)
      {
        // No, just use the keyword results
        bQueryUsed = false;
      }
      else
      {
        // Yes, use it to perform appQuery
        appQueryResults = this.appQuery(queryArgs["criteria"],
                                      queryArgs["requestedFields"],
                                      error);
      
        // If there was a problem
        if (appQueryResults === error)
        {
          // Propegate the failure
          return error; 
        }

        // Unwrap the appQuery results
        appQueryResultArr = appQueryResults["apps"];
      }
      
      // Was nothing given to search on?
      if (!bKeywordUsed && !bQueryUsed)
      {
        // This is an error
        error.setCode(1);
        error.setMessage("No keyword or search criteria given");
        return error;
      }
      
      // Was just appQuery used?
      if (!bKeywordUsed)
      {
        // Then just return its results
        return appQueryResultArr;
      }
      
      // Was just keyword search used?
      if (!bQueryUsed)
      {
        // Then just return its results
        return keywordSearchResultArr;
      }
      
      // If we got here, then both keyword search and app query ran so...
      
      // Perform intersection operation            
      keywordSearchResultArr.forEach(function(keywordAppObj)
        {
          appQueryResultArr.forEach(function(appQueryAppObj)
            {
              if (keywordAppObj["uid"] === appQueryAppObj["uid"])
              {
                intersectionArr.push(appQueryAppObj);
              }              
            });
        });
                                     
      // Return the intersection between the two result sets
      return intersectionArr;    
      
    },
      
    /**
     * Get a list of Apps from a discrete list of App UIDs
     * 
     * @param uidArr {Array}
     * An Array containing App UIDs which are to be exhanged for actual App Data
     * 
     * @param requestedFields {Map?}
     *   If provided, this is a map containing, as the member names, the
     *   fields which should be returned in the results. The value of each
     *   entry in the map indicates what to name that field, in the
     *   result. (This produces a mapping of the field names.) An example is
     *   requestedFields map might look like this:
     *
     *     {
     *       uid    : "uid",
     *       title  : "label", // remap the title field to be called "label"
     *       image1 : "icon",  // remap the image1 field to be called "icon"
     *       tags   : "tags"
     *     }
     * 
     * @return {Array}
     *  An array of maps. Each map contains data about one of the Apps whose
     *  UIDs were specified.
     * 
     */
    getAppListByList : function( uidArr, requestedFields)
    {
      var             appList = [];
      var             owners;
      
      uidArr.forEach(function(uid)
          {
            appList.push(rpcjs.dbif.Entity.query("aiagallery.dbif.ObjAppData",
                                                 uid)[0]);
          });
      
      // Manipulate each App individually
      appList.forEach(
        function(app)
        {
          // Issue a query for this visitor
          owners = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors", 
                                       app.owner);

          // Replace the (private) owner id with his display name
          app.owner = owners[0].displayName;
          
          // If there were requested fields specified...
          if (requestedFields)
          {
            // Send to the requestedFields function for removal and remapping
            aiagallery.dbif.MApps._requestedFields(app, requestedFields);
          }
          
        });

      return appList;
    },
    
    /**
     * Get the details about a particular application.
     *
     * This function will also increment the number of views of the 
     * requested app by 1. 
     *
     * @param uid {Key}
     *   The unique identifier of an application.
     *
     * @param bStringize {Boolean}
     *   Whether some non-string parameters should be converted to a string
     *   representation. For example, the "tags" and "previousAuthors" fields
     *   are arrays, and are returned as an array if this parameter is false,
     *   but are returned as a comma-separated string of the array values if
     *   this parameter value is true. The status value, an integer, is
     *   returned as a number when this parameter is false, and as the string
     *   representing the status value when it is true.
     *
     * @param requestedFields {Map?}
     *   If provided, this is a map containing, as the member names, the
     *   fields which should be returned in the results. The value of each
     *   entry in the map indicates what to name that field, in the
     *   result. (This produces a mapping of the field names.) An example is
     *   requestedFields map might look like this:
     *
     *     {
     *       uid    : "uid",
     *       title  : "label", // remap the title field to be called "label"
     *       image1 : "icon",  // remap the image1 field to be called "icon"
     *       tags   : "tags"
     *     }
     * 
     * @param error {rpcjs.rpc.error.Error}
     *   All RPCs are passed, as their final argument, an error object. Most
     *   don't use it, but this one does. If the application being requested
     *   is not found (which, since the uid of the specific application is
     *   provided as a parameter, likely means that it was just deleted), an
     *   error is generated back to the client by setting the code and message
     *   in this object.
     *
     * @return {Map}
     *   All of the information about the application, with the exception that
     *   the owner has been converted to the owner's display name.
     */
    getAppInfo : function(uid, bStringize, requestedFields, error)
    {
      var             app;
      var             appObj;
      var             tagTable;
      var             whoami;
      var             criteria;
      var             owners;

      whoami = this.getWhoAmI();

      //Update the views and last viewed date

      //Get the actual object
      appObj = new aiagallery.dbif.ObjAppData(uid);    

      // See if this app exists.  
      if (appObj.getBrandNew())
      {
        // It doesn't. Let 'em know that the application has just been removed
        // (or there's a programmer error)
        error.setCode(1);
        error.setMessage("Application is not available. " +
                         "It may have been removed recently.");
        return error;
      }
  
      app = appObj.getData();

      //Increment the number of views by 1. 
      app.numViewed++; 

      //Set the "lastViewedDate" to the time this function was called
      app.lastViewedTime = (new Date()).toString(); 

      //Put back on the database
      appObj.put();
 
      // If the application status is not Active, only the owner can view it.
      if (app.status != aiagallery.dbif.Constants.Status.Active &&
          (! whoami || app.owner != whoami.email))
      {
        // It doesn't. Let 'em know that the application has just been removed
        // (or there's a programmer error)
        error.setCode(2);
        error.setMessage("Application is not available. " +
                         "It may have been removed recently.");
        return error;
      }
 
      // Issue a query for this visitor
      owners = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors", 
                                       app.owner);

      // Replace the (private) owner id with his display name
      app.owner = owners[0].displayName;

      // If we were asked to stringize the values...
      if (bStringize)
      { 
        aiagallery.dbif.MApps.__stringizeAppInfo(app);
      }
      
      // If there were requested fields specified...
      if (requestedFields)
      {
        // If the "comments" field was requested
        if (requestedFields["comments"])
        {
          
          // Use function from Mixin MComments to add comments to app info
          // object
          app.comments = this.getComments(uid, null, null, error);
        }
        
        // Send it to the requestedFields function for stripping and remapping
        aiagallery.dbif.MApps._requestedFields(app, requestedFields);
      }
      
      // Give 'em what they came for
      return app;
    }    
  }
});
