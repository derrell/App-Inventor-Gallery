/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MDbifCommon",
{
  include : 
  [
    aiagallery.dbif.MVisitors,
    aiagallery.dbif.MApps,
    aiagallery.dbif.MTags,
    aiagallery.dbif.MMobile,
    aiagallery.dbif.MComments
  ],
  
  construct : function()
  {
    // Use our authentication function
    rpcjs.AbstractRpcHandler.authenticationFunction =
      aiagallery.dbif.MDbifCommon.authenticate;
  },

  properties :
  {
    /**
     * Information about the currently-logged-in user. The value is a map
     * containing the fields: email, userId, and isAdmin.
     */
    whoAmI :
    {
      check : "Object",
      apply : "_applyWhoAmI"
    }
  },

  members :
  {
    _applyWhoAmI : function(value, old)
    {
      aiagallery.dbif.MDbifCommon.__whoami = value;
    }
  },

  statics :
  {
    __whoami : null,
    __isAdmin : null,
    __initialized : false,

    /**
     * Function to be called for authentication to run a service
     * method. 
     * 
     * @param fqMethod {String}
     *   The fully-qualified name of the method to be called
     * 
     * @return {Boolean}
     *   true to allow the function to be called, or false to indicates
     *   permission denied.
     */
    authenticate : function(fqMethod)
    {
      var             methodComponents;
      var             methodName;
      var             serviceName;
      var             me;
      var             meData;
      var             bAnonymous;

      // Have we yet initialized the user object?
      if (aiagallery.dbif.MDbifCommon.__whoami &&
          ! aiagallery.dbif.MDbifCommon.__initialized)
      {
        // Nope. Retrieve our visitor object
        me = new aiagallery.dbif.ObjVisitors(
          aiagallery.dbif.MDbifCommon.__whoami.email);
        
        // Does it contain a display name yet?
        meData = me.getData();
        if (meData.displayName === null)
        {
          // Nope. Add one.
          meData.displayName = aiagallery.dbif.MDbifCommon.__whoami.userId;
          me.put();
        }
        
        // We're now initialized
        aiagallery.dbif.MDbifCommon.__initialized = true;
      }

      // Split the fully-qualified method name into its constituent parts
      methodComponents = fqMethod.split(".");
      
      // The final component is the actual method name
      methodName = methodComponents.pop();
      
      // The remainder is the service path. Join it back together.
      serviceName = methodComponents.join(".");
      
      // Ensure that the service name is what's expected. (This should never
      // occur, since the RPC server has already validated that the method
      // exists.)
      if (serviceName != "aiagallery.features")
      {
        // It's not. Do not allow access.
        return false;
      }
      
      // If the user is an adminstrator, ...
      if (aiagallery.dbif.MDbifCommon.__whoami &&
          aiagallery.dbif.MDbifCommon.__whoami.isAdmin)
      {
        // ... they implicitly have access.
        return true;
      }

      // Do per-method authentication.
      //
      // NOTE: We have access to the logged-in user's email in
      // aiagallery.dbif.MDbifCommon.__whoami.email, which can be used in the
      // determination of whether to grant access.
      //
      
      // Are they logged in, or anonymous?
      bAnonymous = (aiagallery.dbif.MDbifCommon.__whoami === null);
      
      switch(methodName)
      {
      //
      // MApps
      //
      case "addOrEditApp":
        return false;           // FIXME

      case "deleteApp":
        return false;           // FIXME

      case "getAppListAll":     // FIXME
        return false;

      case "getAppList":
      case "appQuery":
      case "getAppInfo":
        return true;            // Anonymous access
      
      //
      // MComments
      //
      case "addComment":
        return ! bAnonymous;    // Access is allowed if they're logged in

      case "deleteComment":
        return false;           // FIXME

      case "getComments":
        return true;            // Anonymous access

      //
      // MTags
      //
      
      case "getCategoryTags":
        return true;            // Anonymous access

      //
      // MVisitors
      //
      case "addOrEditVisitor":
        return false;           // FIXME

      case "deleteVisitor":
        return false;           // FIXME

      case "getVisitorList":
        return false;           // FIXME

      case "getCategoryTags":
        // Allowable access.
        return true;

      default:
        // Do not allow access to unrecognized method names
        return false;
      }
    }
  }
});
