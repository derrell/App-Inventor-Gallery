/*
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
* This is the HTTP Servlet for remote procedure calls.
*/

// Load each of the JavaScript classes
new Packages.main.Loader();

/**
 * Process a POST request. These are the standard GUI-initiated remote
 * procedure calls.
 *
 * @param request {Packages.javax.servlet.http.HttpServletRequest}
 *   The object containing the request parameters.
 *
 * @param response {Packages.javax.servlet.http.HttpServletResponse}
 *   The object to be used for returning the response.
 */
function doPost(request, response)
{
  var             dbif;
  var             rpcResult;
  var             out;
  var             reader;
  var             line;
  var             input = [];
  var             jsonInput;

  // Retrieve the JSON input from the POST data
  try
  {
    // Get the input stream (the POST data)
    reader = request.getReader();
    
    // Read the request data, line by line.
    for (line = reader.readLine(); line != null; line = reader.readLine())
    {
      input.push(String(line));
    }
    
    // Convert the input lines to a single string
    jsonInput = String(input.join("\n"));

    // Process this request
    rpcResult = 
      aiagallery.dbif.DbifAppEngine.getInstance().processRequest(jsonInput);
    
    // Ignore null results, which occur if the request is a notification.
    if (rpcResult !== null)
    {
      // Generate the response.
      response.setContentType("application/json");
      out = response.getWriter();
      out.println(rpcResult);
    }
  }
  catch (e)
  {
      // Some otherwise uncaught exception occurred.
      throw new Error("Cannot execute remote method", e);
  }
};

/**
 * Process a GET request. These are used for ancillary requests.
 *
 * @param request {Packages.javax.servlet.http.HttpServletRequest}
 *   The object containing the request parameters.
 *
 * @param response {Packages.javax.servlet.http.HttpServletResponse}
 *   The object to be used for returning the response.
 */
function doGet(request, response)
{
  var             entry;
  var             entity;
  var             queryString = request.getQueryString();
  var             querySplit;
  var             argSplit;
  var             jsonInput;
  var             rpcResult;
  var             decoder;
  var             decodeResult;
  var             out;
  var             Db;
  
  // We likely received something like:
  //   tag=by_developer%3AJoe%20Blow%3A0%3A10%3AuploadTime
  // which decodes to this:
  //   tag=by_developer:Joe Blow:0:10:uploadTime
  //
  // Decode it and split the command (tag, in this case) from the
  // parameter. We'll ignore any commands other than the first, i.e. anything
  // including and following an ampersand.
  querySplit = decodeURIComponent(queryString).split(/[=&]/);

  // See what was requested.
  switch(querySplit[0])
  {
  case "addSimData":            // regenerate all simulation data (derrell only)
    //
    // Add the simulation data to the App Engine database
    //

    qx.Class.include(aiagallery.dbif.DbifAppEngine, aiagallery.dbif.MSimData);
    Db = aiagallery.dbif.MSimData.Db;

    for (entry in Db.visitors)
    {
      entity = new aiagallery.dbif.ObjVisitors(entry);
      entity.setData(Db.visitors[entry]);
      entity.put();
    }

    for (entry in Db.tags)
    {
      entity = new aiagallery.dbif.ObjTags(entry);
      entity.setData(Db.tags[entry]);
      entity.put();
    }

    for (entry in Db.apps)
    {
      entity = new aiagallery.dbif.ObjAppData(entry);
      
      // UID is encoded as a string, but should be a number in this environment.
      Db.apps[entry].uid = parseInt(Db.apps[entry].uid);
      
      entity.setData(Db.apps[entry]);
      entity.put();
    }

    for (entry in Db.downloads)
    {
      entity = new aiagallery.dbif.ObjDownloads(entry);
      entity.setData(Db.downloads[entry]);
      entity.put();
    }

    for (entry in Db.comments)
    {
      entity = new aiagallery.dbif.ObjComments(entry);
      entity.setData(Db.comments[entry]);
      entity.put();
    }

    for (entry in Db.likes)
    {
      entity = new aiagallery.dbif.ObjLikes(entry);
      entity.setData(Db.likes[entry]);
      entity.put();
    }

    for (entry in Db.flags)
    {
      entity = new aiagallery.dbif.ObjFlags(entry);
      entity.setData(Db.flags[entry]);
      entity.put();
    }
    break;

  case "clearSimData":            // destroy all simulation data(derrell only)
    //
    // Remove ALL data sitting in simulation database.
    //

    qx.Class.include(aiagallery.dbif.DbifAppEngine, aiagallery.dbif.MSimData);
    Db = aiagallery.dbif.MSimData.Db;
    var dbField;
                

    for (entry in Db.visitors)
    {
      entity = new aiagallery.dbif.ObjVisitors(Db.visitors[entry].id);
      entity.removeSelf();
    }

    for (entry in Db.tags)
    {
      entity = new aiagallery.dbif.ObjTags(Db.tags[entry].value);
      entity.removeSelf();
    }

    for (entry in Db.apps)
    {
      entity = new aiagallery.dbif.ObjAppData(Db.apps[entry].uid);
      entity.removeSelf();
    }
    for (entry in Db.downloads)
    {
      entity = new aiagallery.dbif.ObjDownloads(Db.downloads[entry].apps);
      entity.removeSelf();
    }

    for (entry in Db.comments)
    {
      entity = new aiagallery.dbif.ObjComments(Db.comments[entry].app);
      entity.removeSelf();
    }

    for (entry in Db.likes)
    {
      entity = new aiagallery.dbif.ObjLikes(Db.likes[entry].app);
      entity.removeSelf();
    }

    for (entry in Db.flags)
    {
      entity = new aiagallery.dbif.ObjFlags(Db.flags[entry].app);
      entity.removeSelf();
    }

    break;

  case "tag":              // mobile client request
    // Simulate a real RPC request
    jsonInput = 
      '{\n' +
      '  "service" : "aiagallery.features",\n' +
      '  "method"  : "mobileRequest",\n' +
      '  "params"  : [ "' + querySplit[1] + '" ]\n' +
      '}';

    // Process this request
    rpcResult = 
      aiagallery.dbif.DbifAppEngine.getInstance().processRequest(jsonInput);
    
    // Generate the response.
    response.setContentType("application/json");
    out = response.getWriter();
    out.println(rpcResult);
    break;
 
  
  case "getdata":            // Request for a base 64 encoded URL
    
    /* 
     * The call here looked like this to begin with:
     * 
     * getdata=appId:urlField
     * 
     * Above, we split this by the equal sign to determine which call was made,
     * and now we split the second part of that by colons, to get our
     * parameters. 
     */
    argSplit = querySplit[1].split(":");
    
    // Call the (static) decoder method, which takes an appId and a field
    decodeResult = 
      aiagallery.dbif.Decoder64.getDecodedURL(argSplit[0], argSplit[1]);
    
    // decodeResult is a map containing a "mime" member and a "content" member.
    // Just pass them where they're needed and we're done.
    response.setContentType(decodeResult.mime);
    out = response.getWriter();
    out.println(decodeResult.content);
    break;
  }
};
