/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.rpcsim.MVisitors",
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
      var             ret;
      
      displayName = attributes.displayName;
      permissions = attributes.permissions;
      
      // Get the status value. If the status string isn't found, we'll use
      // "Active" when we set the database.
      status = this.statusOrder.indexOf(status);
      
      // Get the old visitor entry
      visitor = this._db.visitors[userId];
      
      // Did it already exist?
      if (! visitor)
      {
        // Nope. We're creating it new.
        ret = true;
        
        // Create an empty map
        visitor = {};
      }
      else
      {
        // It already existed
        ret = false;
      }
      
      this._db.visitors[userId] =
        {
          userId      : userId,
          displayName : displayName || visitor.displayName || "<not specified>",
          permissions : permissions || visitor.permissions || [],
          status      : status != -1 ? status : (visitor.status || 2)
        };
      
      return ret;
    },
    
    deleteVisitor : function(userId)
    {
      // See if this visitor exists.
      if (! this._db.visitors[userId])
      {
        // He doesn't. Let 'em know.
        return false;
      }
      
      // Delete the visitor
      delete this._db.visitors[userId];
      
      // We were successful
      return true;
    },
    
    getVisitorList : function(bStringize)
    {
      var             clonedVisitor;
      var             visitorList = [];
      
      // For each visitor...
      for (var visitor in this._db.visitors)
      {
        // Clone the visitor entry for this visitor
        clonedVisitor = qx.lang.Object.clone(this._db.visitors[visitor]);
        
        // If we were asked to stringize the values...
        if (bStringize)
        {
          // ... then do so
          clonedVisitor.permissions = clonedVisitor.permissions.join(", ");
          clonedVisitor.status =
            [ "Banned", "Pending", "Active" ][clonedVisitor.status];
        }
        
        // Push this visitor onto the visitor list
        visitorList.push(clonedVisitor);
      }
      
      // We've built the whole list. Return it.
      return visitorList;
    }
  }
});
