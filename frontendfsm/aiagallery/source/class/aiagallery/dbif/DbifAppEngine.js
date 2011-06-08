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
    aiagallery.dbif.MVisitors,
    aiagallery.dbif.MApps,
    aiagallery.dbif.MTags,
    aiagallery.dbif.MMobile
  ],
  
  construct : function()
  {
    var             UserServiceFactory;
    var             userService;
    var             whoami;

    // Call the superclass constructor
    this.base(arguments, "aiagallery", "/rpc");

    // Find out who is logged in
    UserServiceFactory =
      Packages.com.google.appengine.api.users.UserServiceFactory;
    userService = UserServiceFactory.getUserService();
    whoami = userService.getCurrentUser();

    // Save the logged-in user
    this.setUserData("whoami", String(whoami));
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
