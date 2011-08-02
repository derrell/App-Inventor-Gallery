/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MMobile",
{
  construct : function()
  {
    this.registerService("mobileRequest",
                         this.mobileRequest,
                         [ "command" ]);
  },

  members :
  {
    mobileRequest : function(command, error)
    {
      var             fields;
      var             field;
      var             params;

      // The command is supposed to be a series of colon-separated
      // fields. Let's split it up and see what we got.
      fields = command.split(":");
      
      // The first field is the command name
      field = fields.shift();
      
      // Add error as the last parameter to all commands
      fields.push(error);
      
      switch(field)
      {
      case "all":
        // Retrieve a list of applications. Parameters are offset, count, and
        // sort order.
        return this.__getAll(fields, error);
        
      case "search":
        // Search for applications based on some criteria. Parameters are
        // keywordString, offset, count, and sort order.
        return this.__getBySearch(fields, error);
        
      case "tag":
        // Search by tag name. Parameters are the tag name, offset, count, and
        // sort order.
        return this.__getByTag(fields, error);
        
      case "featured":
        // Get featured apps. Parameters are the offset, count, and sort order.
        return this.__getByFeatured(fields, error);
        
      case "by_developer":
        // Get apps by their owner. Parameters are the owner's display name,
        // offset, count, and sort order.
        return this.__getByOwner(fields, error);
        
      case "uploads":
        // I don't understand what this one is supposed to do. Parameters are
        // described as userid, offset, count, and sort order. I suspect that
        // userid is display name, but what should be returned?
        return null;
        
      case "getinfo":
        // Get information about an application
        return this.__getAppInfo(fields, error);
        
      case "comments":
        // Get comments made about an application
        return this.__getComments(fields, error);
        
      case "get_categories":
        // Get the category list (top-level tags). There are no parameters to
        // this request.
        return this.__getCategories(fields, error);
        
      default:
        error.setCode(1);
        error.setMessage("Unrecognized request: " + field);
        return error;
      }
    },
    
    
    __getAll : function(fields, error)
    {
      var requiredParams = 4;
      for (var i = requiredParams - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var offset = fields.shift();
      var count = fields.shift();
      var order = fields.shift();
      var field = fields.shift();

      var results = rpcjs.dbif.Entity.query(
        "aiagallery.dbif.ObjAppData",
        // We want everything, so null search criteria
        null,
        // This is where resultCriteria goes
        this.__buildResultCriteria( offset, count, order, field));

      try
      {
        results.forEach(function(obj)
        {
          // Replace this owner with his display name
          obj["owner"] =
            aiagallery.dbif.MVisitors._getDisplayName(obj["owner"], error);

          // Did we fail to find this owner?
          if (obj["owner"] === error)
          {
            // Yup. Abort the request.
            throw error;
          }
        });
      }
      catch(error)
      {
        return error;
      }
      
      return results;
    },
    
    __getBySearch : function(fields, error)
    {
      var requiredParams = 5;
      for (var i = requiredParams - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var keywordString = fields.shift();
      var offset = fields.shift();
      var count = fields.shift();
      var order = fields.shift();
      var field = fields.shift();

      //FIXME: Waiting for back-end implementation
      return [];
    
    },
    
    __getByTag : function(fields, error)
    {
      var requiredParams = 5;
      for (var i = requiredParams - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var tagName = fields.shift();
      var offset = fields.shift();
      var count = fields.shift();
      var order = fields.shift();
      var field = fields.shift();

      var results = rpcjs.dbif.Entity.query(
        "aiagallery.dbif.ObjAppData",
        {
          type  : "element",
          field : "tags",
          value : tagName 
        },
        // This is where resultCriteria goes
        this.__buildResultCriteria(offset, count, order, field));

      try
      {
        results.forEach(function(obj)
        {
          obj["owner"] = aiagallery.dbif.MVisitors._getDisplayName(obj["owner"],
                                                                  error);
          if (obj["owner"] === error)
          {
            throw error;
          }
        });
      }
      catch(error)
      {
        return error;
      }
      
      return results;
    },
    
    __getByFeatured : function(fields, error)
    {
      // This is the same as __getByTag so just prepend the tag name
      fields.unshift("*Featured*");

      // If the only quality of a Featured App is that it has a *Featured* tag
      //   then this works.
      return this.__getByTag(fields, error);
    },
    
    __getByOwner : function(fields, error)
    {
      var requiredParams = 5;
      for (var i = requiredParams - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var displayName = fields.shift();
      var offset = fields.shift();
      var count = fields.shift();
      var order = fields.shift();
      var field = fields.shift();
      
      // First I'm going to trade the displayName for the real owner Id
      var ownerId =
        aiagallery.dbif.MVisitors._getVisitorId(displayName, error);
      
      // Was an error erturned?
      if (ownerId === error)
      {
        // Yup. We need to return it.
        return error;
      }
      
      // Then use the ownerId to query for all Apps
      var results = rpcjs.dbif.Entity.query(
        "aiagallery.dbif.ObjAppData",
        {
          type  : "element",
          field : "owner",
          value : ownerId
        },
        // This is where resultCriteria goes
        this.__buildResultCriteria( offset, count, order, field));
      
      results.forEach(function(obj)
      {
        obj["owner"] = displayName;
      });
      
      return results;
    },
    
    __getAppInfo : function(fields, error)
    {
      var requiredParams = 1;
      for (var i = requiredParams - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var appId = fields.shift();

      // Using the method included by mixin MApps
      
      // Requesting all fields except data URLs (source, apk, image1-3)
      var requestedFields = 
      {
        owner              : "owner",
        title              : "title",
        description        : "description",
        //FIXME: Uncomment next line when previous authors are implemented
        //previousAuthors    : "previousAuthors",
        tags               : "tags",
        uploadTime         : "uploadTime",
        creationTime       : "creationTime",
        numLikes           : "numLikes",
        numDownloads       : "numDownloads",
        numViewed          : "numViewed",
        numRootComments    : "numRootComments",
        numComments        : "numComments",
        status             : "status"
      };
      
      // The final parameter to each RPC when called by the RPC Server, is an
      // error object which we can manipulate if there's an error. In this
      // case, we're pretending to be the server when we call a different RPC,
      // so pass its error object.
      
      // The appId is passed in here as a string, but is a number in reality.
      return this.getAppInfo(parseInt(appId,10), false, requestedFields, error);
    },
    
    __getComments : function(fields, error)
    {
      var requiredParams = 1;
      for (var i = requiredParams - fields.length; i > 0; i--)
      {
        qx.lang.Array.insertBefore(fields, null, error);
      }

      var appId = fields.shift();

      // FIXME: UNTESTED. At time of dev, no comments available to query on
      
      // The appId is passed in here as a string, but is a number in reality.
      return this.getComments(parseInt(appId,10));
    },
    
    __getCategories : function(fields, error)
    {
      // fields is expected to be empty

      // Use the method included by mixin MTags
      return this.getCategoryTags(error);
    },
   
    /**
     * Build a correctly formatted Result Criteria array for rpc queries
     * 
     * @param offset {Number}
     *   Specify how many results to skip
     * 
     * @param count {Number}
     *   Limit how many matching results are returned
     * 
     * @param sortField {String}
     *   The field on which to sort
     * 
     * @param sortOrder {String}
     *   Either "desc" or "asc" to specify the order in which results should be
     *   returned.
     * 
     * @return {Array}
     *   Array contains objects specifying the result criteria
     * 
     */
    __buildResultCriteria : function(offset, count, sortOrder, sortField)
    {
      // Building the Result Criteria object based on what's given
      var ret = [];
      
      // Are the field on which to sort and sort order specified? Then add sort
      //   criteria.
      if (sortField && sortOrder)
      {
        ret.push({ type  : "sort", field : sortField, order : sortOrder});
      }
      
      // Did they request a certain number of results? add a limit criteria
      if (count)
      {
        ret.push({ type  : "limit", value : parseInt(count,10)}); 
      }
      
      // Did they want to skip a number of results? add offset criteria object
      if (offset)
      {
        ret.push({  type  : "offset", value : parseInt(offset,10)});
      }
      
      // return the whole finished Result Criteria array, or an empty array
      return ret;
    }
  }
});
