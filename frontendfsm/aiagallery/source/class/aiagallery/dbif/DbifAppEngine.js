/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.DbifAppEngine",
{
  extend  : rpcjs.appengine.Dbif,
  type    : "singleton",

  include : 
  [
    aiagallery.dbif.MDbifCommon
  ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments, "aiagallery", "/rpc");
  },
  
  members :
  {
    identify : function()
    {
      var             UserServiceFactory;
      var             userService;
      var             user;
      var             whoami;
      var             userId;
      var             visitor;

      // Find out who is logged in
      UserServiceFactory =
        Packages.com.google.appengine.api.users.UserServiceFactory;
      userService = UserServiceFactory.getUserService();
      user = userService.getCurrentUser();
      
      // If no one is logged in...
      if (! user)
      {
        this.setWhoAmI(
          {
            email       : "anonymous",
            userId      : "",
            isAdmin     : false,
            logoutUrl   : "",
            permissions : []
          });
        return;
      }

      whoami = String(user.getEmail());

      // Try to get this user's display name. Does the visitor exist?
      visitor = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors", whoami);
      if (visitor.length > 0)
      {
        // Yup, he exists.
        userId = visitor[0].displayName || String(user.getUserId());
      }
      else
      {
        // He doesn't exist. Just use the unique number.
        userId = String(user.getUserId());
      }

      // Save the logged-in user. The whoAmI property is in MDbifCommon.
      this.setWhoAmI(
        {
          email     : whoami,
          userId    : userId,
          isAdmin   : userService.isUserAdmin(),
          logoutUrl : userService.createLogoutURL("/")
        });
    }
  },

  defer : function()
  {
    // Register our put & query functions
    rpcjs.dbif.Entity.registerDatabaseProvider(
      rpcjs.appengine.Dbif.query,
      rpcjs.appengine.Dbif.put,
      rpcjs.appengine.Dbif.remove);
  }
});
