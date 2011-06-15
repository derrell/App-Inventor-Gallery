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
    this.registerService("mobileRequest", this.mobileRequest);
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
      switch(field)
      {
      case "all":
        // Retrieve a list of applications. Parameters are offset, count, and
        // sort order.
        return this.__getAll.apply(this, fields);
        
      case "search":
        // Search for applications based on some criteria. Parameters are
        // keywordString, offset, count, and sort order.
        return this.__getBySearch.apply(this, fields);
        
      case "tag":
        // Search by tag name. Parameters are the tag name, offset, count, and
        // sort order.
        return this.__getByTag.apply(this, fields);
        
      case "featured":
        // Get featured apps. Parameters are the offset, count, and sort order.
        return this.__getByFeatured.apply(this, fields);
        
      case "by_developer":
        // Get apps by their owner. Parameters are the owner's display name,
        // offset, count, and sort order.
        return this.__getByOwner.apply(this, fields);
        
      case "uploads":
        // I don't understand what this one is supposed to do. Parameters are
        // described as userid, offset, count, and sort order. I suspect that
        // userid is display name, but what should be returned?
        return null;
        
      case "getinfo":
        // Get information about an application
        fields.push(error);
        return this.__getAppInfo.apply(this, fields);
        
      case "comments":
        // Get comments made about an application
        return this.__getComments.apply(this, fields);
        
      case "get_categories":
        // Get the category list (top-level tags). There are no parameters to
        // this request.
        return this.__getCategories();
        
      default:
        break;
      }
    },
    
    __getAll : function(offset, count, sortOrder)
    {
      return rpcjs.dbif.Entity.query(
        "aiagallery.dbif.ObjAppData",
        // We want everything, so null search criteria
        null,
        // This is where resultCriteria goes
        this.__buildResultCriteria( offset,
                                    count,
                                    sortOrder));
    },
    
    __getBySearch : function(keywordString, offset, count, sortOrder)
    {
    },
    
    __getByTag : function(tagName, offset, count, sortOrder)
    {
      return rpcjs.dbif.Entity.query(
        "aiagallery.dbif.ObjAppData",
        {
          type  : "element",
          field : "tags",
          value : tagName 
        },
        // This is where resultCriteria goes
        this.__buildResultCriteria( offset, count, sortOrder));
    },
    
    __getByFeatured : function(offset, count, sortOrder)
    {
      // If the only quality of a Featured App is that it has a Featured tag
      //   then this works.
      return this.__getByTag( "Featured", offset, count, sortOrder);
    },
    
    __getByOwner : function(displayName, offset, count, sortOrder)
    {
      
      // First I'm going to trade the displayName for the real owner Id
      var owner = rpcjs.dbif.Entity.query(
        "aiagallery.dbif.ObjVisitors",
        {
          type  : "element",
          field : "displayName", 
          value : displayName
        },
        // No resultCriteria, just need 1
        null);
      var ownerId = owner[0].id;
      
      // Then use the ownerId to query for all Apps
      var results = rpcjs.dbif.Entity.query(
        "aiagallery.dbif.ObjAppData",
        {
          type  : "element",
          field : "owner",
          value : ownerId
        },
        // This is where resultCriteria goes
        this.__buildResultCriteria( offset, count, sortOrder));
      return results;
                
                                            
    },
    
    __getAppInfo : function(appId, error)
    {
      // Using the method included by mixin MApps
      
      // The final parameter to each RPC when called by the RPC Server, is an
      // error object which we can manipulate if there's an error. In this
      // case, we're pretending to be the server when we call a different RPC,
      // so pass its error object.
      return this.getAppInfo(appId, false, error);
    },
    
    __getComments : function(appId)
    {
      // FIXME: UNTESTED. At time of dev, no comments available to query on
      return rpcjs.dbif.Entity.query(
        "aiagallery.dbif.ObjComments",
        {
          type  : "element",
          field : "app",
          value : appId
        },
        // No resultCriteria here
        null);
    },
    
    __getCategories : function()
    {
      // Use the method included by mixin MTags
      return this.getCategoryTags();
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
     * @param sortOrder {String}
     *   Either "desc" or "asc" to specify the order in which results should be
     *   returned.
     * 
     * @return {Array}
     *   Array contains objects specifying the result criteria
     * 
     */
    __buildResultCriteria : function(offset, count, sortOrder)
    {
      // Building the Result Criteria object based on what's given
      var ret = [];
      
      // Is sortOrder ("asc" or "desc") specified? then add sort order criteria
      if (sortOrder)
      {
        ret.push({ type  : "sort", value : { "value" : sortOrder  } });
      }
      
      // Did they request a certain number of results? add a limit criteria
      if (count)
      {
        ret.push( { type  : "limit", value : count}); 
      }
      
      // Did they want to skip a number of results? add offset criteria object
      if (offset)
      {
        ret.push( {  type  : "offset", value : offset });
      }
      
      // return the whole finished Result Criteria object
      return ret;
    }
  }
});
