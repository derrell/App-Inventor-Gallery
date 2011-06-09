/**
 * Copyright (c) 2011 Derrell Lipman
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
    mobileRequest : function(command)
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
    },
    
    __getBySearch : function(keywordString, offset, count, sortOrder)
    {
    },
    
    __getByTag : function(tagName, offset, count, sortOrder)
    {
    },
    
    __getByFeatured : function(offset, count, sortOrder)
    {
    },
    
    __getByOwner : function(displayName, offset, count, sortOrder)
    {
    },
    
    __getAppInfo : function(appId)
    {
    },
    
    __getComments : function(appId)
    {
    },
    
    __getCategories : function()
    {
      // Use the method included by mixin MTags
      return this.getCategoryTags();
    }
  }
});
