/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MVisitors",
{
  construct : function()
  {
    this.registerService("addOrEditVisitor",
                         this.addOrEditVisitor,
                         [ "userId", "attributes" ]);

    this.registerService("deleteVisitor",
                         this.deleteVisitor,
                         [ "userId" ]);

    this.registerService("getVisitorList",
                         this.getVisitorList,
                         [ "bStringize" ]);
  },
  
  statics :
  {
    /**
     * Exchange userId for user's displayName
     * 
     *@param userId {String}
     * Visitor's userId
     * 
     *@return {String}
     * Visitor's display name 
     */
    _getDisplayName : function(userId)
    {
      
      var visitor = new aiagallery.dbif.ObjVisitors(userId);
     
      if (!visitor.getBrandNew())
      {
        return visitor.getData().displayName;    
      }
    },
    
    /**
     * Exchange user's displayName for userId
     * 
     *@param displayName {String}
     * Visitor's display name
     * 
     *@return {String} 
     * Visitor's userId
     */
    _getVisitorId : function(displayName)
    {
      
      var owners = rpcjs.dbif.Entity.query(
        "aiagallery.dbif.ObjVisitors",
        {
          type  : "element",
          field : "displayName",
          value : displayName
          
        },
        // No resultCriteria. Only need a single result
        null);
      
      if (typeof owners[0] !== "undefined")
      {
        return owners[0].id;
      }
      // FIXME: There should be more error handling here
    }
            
  },
  
  members :
  {
    addOrEditVisitor : function(userId, attributes)
    {
      var             displayName;
      var             permissions;
      var             status;
      var             statusIndex;
      var             visitor;
      var             visitorData;
      var             ret;
      
      displayName = attributes.displayName;
      permissions = attributes.permissions;
      
      // Get the status value. If the status string isn't found, we'll use
      // "Active" when we set the database.
      status = aiagallery.dbif.Constants.StatusToName.indexOf(status);
      
      // Get the old visitor entry
      visitor = new aiagallery.dbif.ObjVisitors(userId);
      visitorData = visitor.getData();
      
      // Remember whether it already existed.
      ret = visitor.getBrandNew();
      
      // Provide the new data
      visitor.setData(
        {
          id          : userId,
          displayName : displayName || visitorData.displayName || "<>",
          permissions : permissions || visitorData.permissions || [],
          status      : status != -1 ? status : (visitorData.status || 2)
        });
      
      // Write the new data
      visitor.put();

      return ret;
    },
    
    deleteVisitor : function(userId)
    {
      var             visitor;

      // Retrieve this visitor
      visitor = new aiagallery.dbif.ObjVisitors(userId);

      // See if this visitor exists.
      if (visitor.getBrandNew())
      {
        // He doesn't. Let 'em know.
        return false;
      }
      
      // Delete the visitor
      visitor.removeSelf();
      
      // We were successful
      return true;
    },
    
    getVisitorList : function(bStringize)
    {
      var             visitor;
      var             visitorList;
      
      // For each visitor...
      visitorList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors");

      // If we were asked to stringize the values...
      if (bStringize)
      {
        // ... then do so
        for (visitor in visitorList)
        {
          var             thisGuy = visitorList[visitor];
          thisGuy.permissions = 
            thisGuy.permissions ? thisGuy.permissions.join(", ") : "";
          thisGuy.status =
            [ "Banned", "Pending", "Active" ][thisGuy.status];
        }
      }
      
      // We've built the whole list. Return it.
      return visitorList;
    }
  }
});
