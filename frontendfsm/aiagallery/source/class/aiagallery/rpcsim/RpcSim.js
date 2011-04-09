/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.rpcsim.RpcSim",
{
  extend : qx.core.Object,
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments);

    // Gain access to local storage
    var Storage = qx.bom.Cookie;
    
/*
    // See if there's an existing database
    var s = Storage.get("aiagallery.db");
    
    // Did we find anything there?
    if (s)
    {
      // Yup. It's a JSON representation of our database. Parse it.
      this.__db = qx.lang.Json.parse(s);
    }
    else
*/
    {
      // There's no database. Initialize a new one.
      this.__db = 
        {
          visitors : 
          {
            "joe@blow.com" :
            {
              userId      : "joe@blow.com",
              name        : "Joe Blow",
              permissions : [ "VISITOR VIEW" ],
              status      : 2
            }
          },
          tags     : {}
        };
    }
    
    // Prepare to store the database periodically
/*
    var timer = qx.util.TimerManager.getInstance();
    timer.start(function(userData, timerId)
                {
                  Storage.set("aiagallery.db",
                              qx.lang.Json.stringify(this.__db));
                },
                5000,
                this,
                null,
                5000);
*/

    // Initialize the service jump table
    this.__services =
      {
        aiagallery :
        {
          features :
          {
            addOrEditVisitor :
              qx.lang.Function.bind(this.addOrEditVisitor, this),

            deleteVisitor    :
              qx.lang.Function.bind(this.deleteVisitor, this),

            getVisitorList   :
              qx.lang.Function.bind(this.getVisitorList, this)
          }
        }
      };

    // Start up the RPC simulator
    new rpcjs.sim.Rpc(this.__services, "/rpc");
  },
  
  members :
  {

    addOrEditVisitor : function(userId, attributes)
    {
      var             name;
      var             permissions;
      var             status;
      var             statusIndex;
      var             visitor;
      var             ret;
      
      name = attributes.name;
      permissions = attributes.permissions;
      
      // Get the status value. If the status string isn't found, we'll use
      // "Active" when we set the database.
      status = [ "Banned", "Pending", "Active" ].indexOf(status);
      
      // Get the old visitor entry
      visitor = this.__db.visitors[userId];
      
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
      
      this.__db.visitors[userId] =
        {
          userId      : userId,
          name        : name || visitor.name || "<not specified>",
          permissions : permissions || visitor.permissions || [],
          status      : status != -1 ? status : (visitor.status || 2)
        };
      
      return ret;
    },
    
    deleteVisitor : function(userId)
    {
      // See if this visitor exists.
      if (! this.__db.visitors[userId])
      {
        // He doesn't. Let 'em know.
        return false;
      }
      
      // Delete the visitor
      delete this.__db.visitors[userId];
      
      // We were successful
      return true;
    },
    
    getVisitorList : function(bStringize)
    {
      var             clonedVisitor;
      var             visitorList = [];
      
      // For each visitor...
      for (var visitor in this.__db.visitors)
      {
        // Clone the visitor entry for this visitor
        clonedVisitor = qx.lang.Object.clone(this.__db.visitors[visitor]);
        
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
    },

    /** The whole database */
    __db : null,

    /** Remote procedure call services */
    __services : null
  }
});
