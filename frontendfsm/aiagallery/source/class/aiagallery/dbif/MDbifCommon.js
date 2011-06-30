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
      var             meObjVisitor;
      var             mePermissionGroups;
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
      
      // Are they logged in, or anonymous?
      bAnonymous = (aiagallery.dbif.MDbifCommon.__whoami === null);
      
      switch(methodName)
      {
        
        
      //
      // MApps
      //
      case "addOrEditApp":
        return true;
//FIXME:return aiagallery.dbif.MDbifCommon.__deepPermissionCheck(methodName);

      case "deleteApp":
        return aiagallery.dbif.MDbifCommon.__deepPermissionCheck(methodName);

      case "getAppListAll":
        return aiagallery.dbif.MDbifCommon.__deepPermissionCheck(methodName);

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
        return aiagallery.dbif.MDbifCommon.__deepPermissionCheck(methodName);

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
        return aiagallery.dbif.MDbifCommon.__deepPermissionCheck(methodName);

      case "deleteVisitor":
        return aiagallery.dbif.MDbifCommon.__deepPermissionCheck(methodName);

      case "getVisitorList":
        return aiagallery.dbif.MDbifCommon.__deepPermissionCheck(methodName);
        
      case "getCategoryTags":
        // Anonymous access.
        return true;

      default:
        // Do not allow access to unrecognized method names
        return false;
      }
    },
    __deepPermissionCheck : function(methodName)
    {
      var email = aiagallery.dbif.MDbifCommon.__whoami.email;
      var myObjData = new aiagallery.dbif.ObjVisitor(email).getData();
      var permissionArr = myObjData["permissions"];
      var permissionGroupArr = myObjData["permissionGroups"];
      var permission;
      var group;
      var i, j;
      
      if (permissionArr != null)
      {
        for (i = 0 ; i < permissionArr.length; i++)
        {
          permission = permissionArr[i];
          
          if (permission === methodName)
          {
            return true; 
          }
        }
      }
      
      if (permissionGroupArr != null)
      {
        for (i = 0 ; i < permissionGroupArr.length; i++)
        {
          group = new aiagallery.dbif.ObjPermissionGroup(permissionGroupArr[i]);
          
          permissionArr = group.getData()["permissions"];
          
          for (j = 0 ; j < permissionArr.length; j++)
          {
            permission = permissionArr[j];
            
            if (permission === methodName)
            {
              return true; 
            }
            
          }
        }
      }
      return true;
      
    }
  }
});