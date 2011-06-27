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
    whoAmI :
    {
      check : "String",
      apply : "_applyWhoAmI"
    },
    
    isAdmin :
    {
      check : "Boolean",
      init  : false,
      apply : "_applyIsAdmin"
    }
  },

  members :
  {
    _applyWhoAmI : function(value, old)
    {
      aiagallery.dbif.MDbifCommon.__whoami = value;
    },

    _applyIsAdmin : function(value, old)
    {
      aiagallery.dbif.MDbifCommon.__isAdmin = value;
    }
  },

  statics :
  {
    __whoami : null,
    __isAdmin : null,

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
      if (aiagallery.dbif.MDbifCommon.__isAdmin)
      {
        // ... they implicitly have access.
        return true;
      }

      // Do per-method authentication.
      //
      // NOTE: We have access to the logged-in user name in
      // aiagallery.dbif.MDbifCommon.__whoami, which can be used in the
      // determination of whether to grant access.
      //
      switch(methodName)
      {
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
