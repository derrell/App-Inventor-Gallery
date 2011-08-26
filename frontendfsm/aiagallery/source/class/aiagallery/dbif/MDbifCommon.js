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
    aiagallery.dbif.MComments,
    aiagallery.dbif.MWhoAmI,
    aiagallery.dbif.MSearch,
    aiagallery.dbif.MLiking
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
      nullable : true,
      init     : null,
      check    : "Object",
      apply    : "_applyWhoAmI"
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
        
        // Is it brand new, or does not contain a display name yet?
        meData = me.getData();
        if (me.getBrandNew() || meData.displayName === null)
        {
          // True. Save it.
          if (! meData.displayName)
          {
            meData.displayName = aiagallery.dbif.MDbifCommon.__whoami.userId;
          }
          
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
      case "getAppList":
      case "addOrEditApp":
        return ! bAnonymous;    // Access is allowed if they're logged in

      case "deleteApp":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      case "getAppListAll":
          return true;          // TEMPORARY
// FIXME: return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      case "appQuery":
      case "getAppInfo":
      case "getAppListByList":
          return true;            // Anonymous access
      
      //
      // MComments
      //
      case "addComment":
        return ! bAnonymous;    // Access is allowed if they're logged in

      case "deleteComment":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      case "getComments":
        return true;            // Anonymous access

      //
      // MMobile
      //
      case "mobileRequest":
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
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      case "deleteVisitor":
        return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);

      case "getVisitorList":
        if (qx.core.Environment.get("qx.debug"))
        {
          return aiagallery.dbif.MDbifCommon._deepPermissionCheck(methodName);
        }
        else
        {
          // At present, do not allow access to visitor list on App Engine
          return false;
        }
        
      case "editProfile":
        return ! bAnonymous;    // Access is allowed if they're logged in

      //
      // MWhoAmI
      //
      case "whoAmI":
        return true;            // Anonymous access
        
      //
      // MSearch
      //
      case "keywordSearch":
        return true;          // Anonymous access
        

      //
      // MLiking
      //
      case "likesPlusOne":
          return ! bAnonymous;   // Access allowed if logged in         

      default:
        // Do not allow access to unrecognized method names
        return false;
      }

    },


    _deepPermissionCheck : function(methodName)
    {
      // Find out who we are.
      var whoami = aiagallery.dbif.MDbifCommon.__whoami;
      
      // If no one is logged in...
      if (! whoami)
      {
        // ... then they do not have permission
        return false;
      }

      var email = whoami.email;
      var myObjData = new aiagallery.dbif.ObjVisitors(email).getData();;
      var permissionArr = myObjData["permissions"];
      var permissionGroupArr = myObjData["permissionGroups"];
      var permission;
      var group;
      var data;

      // Standard check: Does my permission list contain this method?
      if (permissionArr != null &&
          qx.lang.Array.contains(permissionArr, methodName))
      {
        // Yes, allow me.
        return true;
      }

// Permission Groups Untested, disabling for now
      if(false)
      {
        // Deeper check: Do any of my permission groups give me access to this
        // method?
        if (permissionGroupArr != null)
        {
          // For every permission group of which I am a member...
          permissionGroupArr.forEach(function (group) 
            {
        
              // Retrieve the list of permissions it gives me
              data = new aiagallery.dbif.ObjPermissonGriou(group).getData();
              permissionArr = data["permissions"];
          
              // Same as standard check: does this group contain this method?
              if (permissionArr != null &&
              qx.lang.Array.contains(permissionArr, methodName))
              {
                // Yes, allow me.
                return true;
              }
            });
        }
      }
      
      // Did not find this permission, dissalow.
      return false;
    }
  }
});
