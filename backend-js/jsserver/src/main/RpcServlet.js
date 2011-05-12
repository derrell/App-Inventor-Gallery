/*
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
* This is the HTTP Servlet for remote procedure calls.
*/

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
    
    // Generate the response.
    response.setContentType("application/json");
    out = response.getWriter();
    out.println(rpcResult);
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
  var PDatastore = Packages.com.google.appengine.api.datastore;
  var datastore = PDatastore.DatastoreServiceFactory.getDatastoreService();
  var employee;
  var key;
  var entry;
  var entity;

  print("Query string: " + request.getQueryString());

  if (request.getQueryString() == "addSimData")
  {
    //
    // Add the simulation data to the App Engine database
    //

    qx.Class.include(aiagallery.dbif.DbifAppEngine, aiagallery.dbif.MSimData);
    var Db = aiagallery.dbif.MSimData.Db;

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
  }
};
