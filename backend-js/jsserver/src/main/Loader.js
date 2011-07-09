var             classname;

function $debugLoad(name)
{
  classname = name;
//  print("Loading " + name);
}

try
{
  $debugLoad("qx.Bootstrap");
  new Packages.qx.Bootstrap();

  $debugLoad("qx.bom.client.OperatingSystem");
  new Packages.qx.bom.client.OperatingSystem();

  $debugLoad("qx.bom.client.Locale");
  new Packages.qx.bom.client.Locale();

  $debugLoad("qx.bom.client.Html");
  new Packages.qx.bom.client.Html();

  $debugLoad("qx.bom.client.Transport");
  new Packages.qx.bom.client.Transport();

  $debugLoad("qx.bom.client.Plugin");
  new Packages.qx.bom.client.Plugin();

  $debugLoad("qx.bom.client.Engine");
  new Packages.qx.bom.client.Engine();

  $debugLoad("qx.bom.client.Browser");
  new Packages.qx.bom.client.Browser();

  $debugLoad("qx.bom.client.Css");
  new Packages.qx.bom.client.Css();

  $debugLoad("qx.bom.client.PhoneGap");
  new Packages.qx.bom.client.PhoneGap();

  $debugLoad("qx.bom.client.Flash");
  new Packages.qx.bom.client.Flash();

  $debugLoad("qx.bom.client.EcmaScript");
  new Packages.qx.bom.client.EcmaScript();

  $debugLoad("qx.bom.client.Device");
  new Packages.qx.bom.client.Device();

  $debugLoad("qx.bom.client.Event");
  new Packages.qx.bom.client.Event();
  
  $debugLoad("qx.bom.client.Runtime");
  new Packages.qx.bom.client.Runtime();

  $debugLoad("qx.core.Environment");
  new Packages.qx.core.Environment();

  $debugLoad("qx.Mixin");
  new Packages.qx.Mixin();

  $debugLoad("qx.Interface");
  new Packages.qx.Interface();

  $debugLoad("qx.lang.Core");
  new Packages.qx.lang.Core();

  $debugLoad("qx.core.Property");
  new Packages.qx.core.Property();

  $debugLoad("qx.Class");
  new Packages.qx.Class();

  $debugLoad("qx.dev.StackTrace");
  new Packages.qx.dev.StackTrace();

  $debugLoad("qx.lang.Array");
  new Packages.qx.lang.Array();

  $debugLoad("qx.core.Aspect");
  new Packages.qx.core.Aspect();

  $debugLoad("qx.data.MBinding");
  new Packages.qx.data.MBinding();

  $debugLoad("qx.core.ObjectRegistry");
  new Packages.qx.core.ObjectRegistry();

  $debugLoad("qx.dom.Node");
  new Packages.qx.dom.Node();

  $debugLoad("qx.lang.Function");
  new Packages.qx.lang.Function();

  $debugLoad("qx.bom.Event");
  new Packages.qx.bom.Event();

  $debugLoad("qx.event.Manager");
  new Packages.qx.event.Manager();

  $debugLoad("qx.event.Registration");
  new Packages.qx.event.Registration();

  $debugLoad("qx.lang.String");
  new Packages.qx.lang.String();

  $debugLoad("qx.lang.RingBuffer");
  new Packages.qx.lang.RingBuffer();

  $debugLoad("qx.log.appender.RingBuffer");
  new Packages.qx.log.appender.RingBuffer();

  $debugLoad("qx.log.Logger");
  new Packages.qx.log.Logger();

  $debugLoad("qx.core.Assert");
  new Packages.qx.core.Assert();

  $debugLoad("qx.core.MAssert");
  new Packages.qx.core.MAssert();

  $debugLoad("qx.core.Object");
  new Packages.qx.core.Object();

  $debugLoad("qx.event.type.Event");
  new Packages.qx.event.type.Event();

  $debugLoad("qx.event.type.Data");
  new Packages.qx.event.type.Data();

  $debugLoad("qx.data.SingleValueBinding");
  new Packages.qx.data.SingleValueBinding();

  $debugLoad("qx.data.IListData");
  new Packages.qx.data.IListData();

  $debugLoad("qx.type.BaseError");
  new Packages.qx.type.BaseError();

  $debugLoad("qx.core.AssertionError");
  new Packages.qx.core.AssertionError();

  $debugLoad("qx.core.ValidationError");
  new Packages.qx.core.ValidationError();

  $debugLoad("qx.lang.Type");
  new Packages.qx.lang.Type();

  $debugLoad("qx.event.IEventHandler");
  new Packages.qx.event.IEventHandler();

  $debugLoad("qx.util.ObjectPool");
  new Packages.qx.util.ObjectPool();

  $debugLoad("qx.event.Pool");
  new Packages.qx.event.Pool();

  $debugLoad("qx.util.DisposeUtil");
  new Packages.qx.util.DisposeUtil();

  $debugLoad("qx.event.IEventDispatcher");
  new Packages.qx.event.IEventDispatcher();

  $debugLoad("qx.event.dispatch.Direct");
  new Packages.qx.event.dispatch.Direct();

  $debugLoad("qx.event.handler.Object");
  new Packages.qx.event.handler.Object();

  $debugLoad("qx.lang.Date");
  new Packages.qx.lang.Date();

  $debugLoad("qx.lang.Generics");
  new Packages.qx.lang.Generics();

  $debugLoad("qx.lang.JsonImpl");
  new Packages.qx.lang.JsonImpl();

  $debugLoad("qx.lang.Json");
  new Packages.qx.lang.Json();

  $debugLoad("qx.lang.Object");
  new Packages.qx.lang.Object();

  $debugLoad("qx.io.remote.RpcError");
  new Packages.qx.io.remote.RpcError();
  
  $debugLoad("qx.util.Base64");
  new Packages.qx.util.Base64();
  
  $debugLoad("aiagallery.dbif.MApps");
  new Packages.aiagallery.dbif.MApps();
  
  $debugLoad("rpcjs.dbif.Entity");
  new Packages.rpcjs.dbif.Entity();

  $debugLoad("aiagallery.dbif.Entity");
  new Packages.aiagallery.dbif.Entity();
  
  $debugLoad("aiagallery.dbif.MVisitors");
  new Packages.aiagallery.dbif.MVisitors();
  
  $debugLoad("aiagallery.dbif.MTags");
  new Packages.aiagallery.dbif.MTags();
  
  $debugLoad("aiagallery.dbif.MMobile");
  new Packages.aiagallery.dbif.MMobile();
  
  $debugLoad("aiagallery.dbif.MComments");
  new Packages.aiagallery.dbif.MComments();
  
  $debugLoad("aiagallery.dbif.MDbifCommon");
  new Packages.aiagallery.dbif.MDbifCommon();
  
  $debugLoad("aiagallery.dbif.ObjAppData");
  new Packages.aiagallery.dbif.ObjAppData();
  
  $debugLoad("aiagallery.dbif.ObjComments");
  new Packages.aiagallery.dbif.ObjComments();
  
  $debugLoad("aiagallery.dbif.ObjDownloads");
  new Packages.aiagallery.dbif.ObjDownloads();
  
  $debugLoad("aiagallery.dbif.ObjFlags");
  new Packages.aiagallery.dbif.ObjFlags();
  
  $debugLoad("aiagallery.dbif.ObjLikes");
  new Packages.aiagallery.dbif.ObjLikes();
  
  $debugLoad("aiagallery.dbif.ObjTags");
  new Packages.aiagallery.dbif.ObjTags();
  
  $debugLoad("aiagallery.dbif.ObjVisitors");
  new Packages.aiagallery.dbif.ObjVisitors();
  
  $debugLoad("aiagallery.dbif.ObjPermissionGroup");
  new Packages.aiagallery.dbif.ObjPermissionGroup();
  
  $debugLoad("aiagallery.dbif.Constants");
  new Packages.aiagallery.dbif.Constants();

  $debugLoad("rpcjs.sim.Dbif");
  new Packages.rpcjs.sim.Dbif();

  $debugLoad("rpcjs.appengine.Dbif");
  new Packages.rpcjs.appengine.Dbif();
  
  $debugLoad("aiagallery.dbif.MDbifCommon");
  new Packages.aiagallery.dbif.MDbifCommon();
  
  $debugLoad("aiagallery.dbif.DbifAppEngine");
  new Packages.aiagallery.dbif.DbifAppEngine();
  
  $debugLoad("aiagallery.dbif.Decoder64");
  new Packages.aiagallery.dbif.Decoder64();
  
  $debugLoad("aiagallery.dbif.MSimData");
  new Packages.aiagallery.dbif.MSimData();
  
  $debugLoad("rpcjs.AbstractRpcHandler");
  new Packages.rpcjs.AbstractRpcHandler();
  
  $debugLoad("rpcjs.appengine.Rpc");
  new Packages.rpcjs.appengine.Rpc();
  
  $debugLoad("rpcjs.rpc.Server");
  new Packages.rpcjs.rpc.Server();
  
  $debugLoad("rpcjs.rpc.error.Error");
  new Packages.rpcjs.rpc.error.Error();
}
catch(e)
{
  print("Exception instantiating " + classname + ": " + e);
  throw new Error("Exiting due to exception.");
}
finally
{
  print("Finished loading classes.");
}

