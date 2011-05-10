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
    this.registerService("addOrEditVisitor", this.addOrEditVisitor);
    this.registerService("deleteVisitor",    this.deleteVisitor);
    this.registerService("getVisitorList", this.getVisitorList);
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
      status = this.statusOrder.indexOf(status);
      
      // Get the old visitor entry
      visitor = new aiagallery.dbif.ObjVisitors(userId);
      visitorData = visitor.getData();
      
      // Remember whether it already existed.
      ret = visitor.getBrandNew();
      
      // Provide the new data
      visitor.setData(
        {
          userId      : userId,
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
      var             visitorList;
      
      // For each visitor...
      visitorList =
        aiagallery.dbif.Entity.query("aiagallery.dbif.ObjVisitors");

      // If we were asked to stringize the values...
      if (bStringize)
      {
        // ... then do so
        visitorList.forEach(
          function(visitor)
          {
            visitor.permissions = visitor.permissions.join(", ");
            visitor.status =
              [ "Banned", "Pending", "Active" ][visitor.status];
          });
      }
      
      // We've built the whole list. Return it.
      return visitorList;
    }
  }
});
