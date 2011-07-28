/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.PermissionsNoneTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __db : {
      
      visitors:
      {
        "jarjar@binks.org" :
        {
          displayName  : "mynewdisplayname",
          id           : "jarjar@binks.org",
          permissions  : [],
          status       : 2
        }
        
      
      },
      tags:     {},
      search:   {},
      likes:    {},
      flags:    {},
      downloads:{},
      comments: {},
      apps:     {}
     
    },

    // Instantiate this to aiagalelry.dbif.DbifSim.getInstance()
    dbifSim : null,
    
    // This string is to be appended to assertions, to be specific about test conditions
    permissionLevel : "no permissions",
    
    setUp: function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.      
      this.dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      this.dbifSim.setWhoAmI(
        {
          email : "jarjar@binks.org",
          isAdmin: false,
          logoutUrl: "undefined",
          permissions: [],
          userId :  "nameSetWhoAmI"
        });
      
      // Use a personalized database
      rpcjs.sim.Dbif.setDb(this.__db);
      
      this.currentPermissionsStr = "no permissions";
    },

    tearDown: function() 
    {
      // Reset the db for other tests
      rpcjs.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);
    },
    
    "test: attempt to getAppList" : function()
    {
      // Must be logged in
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.getAppList"), "getAppList with " + this.permissionLevel);
    },
    
    "test: attempt to addOrEditApp" : function()
    {
      // Must be logged in
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.addOrEditApp"), "addOrEditApp with " + this.permissionLevel);
    },
    
    "test: attempt to deleteApp" : function()
    {
      // Check Permissions
      this.assertFalse(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.deleteApp"), "deleteApp with " + this.permissionLevel);
    },
    
    "test: attempt to getAppListAll" : function()
    {
      // FIXME: TEMPORARILY ANON, SHOULD BE CHECK PERMISSIONS
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.getAppListAll"), "getAppListAll with " + this.permissionLevel);
    },
    
    "test: attempt to appQuery" : function()
    {
      // Anonymous
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.appQuery"), "appQuery with " + this.permissionLevel);
    },

    "test: attempt to getAppInfo" : function()
    {
      // Anonymous
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.getAppInfo"), "getAppInfo with " + this.permissionLevel);
    },    
    
    "test: attempt to addComment" : function()
    {
      // Must be logged in
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.addComment"), "addComment with " + this.permissionLevel);
    },
    
    "test: attempt to deleteComment" : function()
    {
      // Check Permissions
      this.assertFalse(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.deleteComment"), "deleteComment with " + this.permissionLevel);
    },    

    "test: attempt to getComments" : function()
    {
      // Anonymous
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.getComments"), "getComments with " + this.permissionLevel);
    },

    "test: attempt to mobileRequest" : function()
    {
      // Anonymous
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.mobileRequest"), "mobileRequest with " + this.permissionLevel);
    },

    "test: attempt to getCategoryTags" : function()
    {
      // Anonymous
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.getCategoryTags"), "getCategoryTags with " + this.permissionLevel);
    },

    "test: attempt to addOrEditVisitor" : function()
    {
      // Check Permissions
      this.assertFalse(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.addOrEditVisitor"), "addOrEditVisitor with " + this.permissionLevel);
    },

    "test: attempt to deleteVisitor" : function()
    {
      // Check permissions
      this.assertFalse(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.deleteVisitor"), "deleteVisitor with " + this.permissionLevel);
    },
    
    "test: attempt to getVisitorList" : function()
    {
      // Check permissions
      this.assertFalse(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.getVisitorList"), "getVisitorList with " + this.permissionLevel);
    },

    "test: attempt to editProfile" : function()
    {
      // Must be logged in
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.editProfile"), "editProfile with " + this.permissionLevel);
    },

    "test: attempt to whoAmI" : function()
    {
      // Anonymous
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.whoAmI"), "whoAmI with " + this.permissionLevel);
    } 
    
  }
});
