/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.AbstractRpcTestCase",
{
  extend : qx.dev.unit.TestCase,
  
  members :
  {
    setUp: function() 
    {
      // Start the RPC simulator by getting its singleton instance
      this.dbif = aiagallery.dbif.DbifSim.getInstance();

      this.rpc = new qx.io.remote.Rpc();
      this.rpc.setUrl(aiagallery.main.Constant.SERVICES_URL);
      this.rpc.setTimeout(10000);
      this.rpc.setCrossDomain(false);
    },

    tearDown: function() 
    {
      this.rpc.dispose();
    },
    
    callRpc : function(fsm, service, method, params, userData)
    {
      var rpcRequest = new qx.core.Object();

      // Save the service name
      rpcRequest.service = service;

      // Copy the parameters; we'll prefix our copy with additional params
      rpcRequest.params = params ? params.slice(0) : [];

      // Prepend the method
      rpcRequest.params.unshift(method);

      // Prepend the flag indicating to coalesce failure events
      rpcRequest.params.unshift(true);

      // Add the user data to the request
      rpcRequest.setUserData("userData", userData);

      // Retrieve the RPC object */
      var rpc = this.rpc;

      // Use standard JSON-RPC Version 2
//      rpc.setProtocol("2.0");

      // Set the service name
      rpc.setServiceName(rpcRequest.service);

      // The default timeout is only 5 seconds.  That may not be long enough
      // for some longish requests
      rpc.setTimeout(30000);

      // Let them add listeners
      rpcRequest.addListener = function(type, func, context)
      {
        rpc.addListener(type, func, context || rpc);
      };

      // Issue the request
      rpcRequest.initiateTest = function()
      {
        qx.io.remote.Rpc.prototype.callAsyncListeners.apply(rpc,
                                                            rpcRequest.params);
      };

      // Give 'em what they came for
      return rpcRequest;
    },
    
    setupErrorHandling : function()
    {
      var rpc = this.rpc;
      var f = qx.lang.Function.bind(
        function(e) 
        {
          throw new Error("Got '" + e.getType() + "' event");
        },
        this);

      rpc.addListener("failed",    f, this);
      rpc.addListener("timeout",   f, this);
      rpc.addListener("aborted",   f, this);
    }
  }
});
