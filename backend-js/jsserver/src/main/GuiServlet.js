/*
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Servlet for a Graphical User Interface running on App Engine
 */
function doGet(request, response)
{
  var             UserServiceFactory;
  var             userService;
  var             scriptToLoad;
  var             out;
  
  // Get a user service instance, to determine signed-in user data
  UserServiceFactory =
    Packages.com.google.appengine.api.users.UserServiceFactory;
  userService = UserServiceFactory.getUserService();

  // Gain access to the writer for output
  out = response.getWriter();

  // If the user is logged in, get the requested page.
  if (request.getUserPrincipal() != null)
  {
    // Determine if the console is being requested.
    if (request.getQueryString() != null)
    {
      scriptToLoad = "    <title>RpcConsole</title>"
        + "    <script type=\"text/javascript\" "
        + "            src=\"script/rpcconsole.demo.js\">"
        + "    </script>";
    }
    else
    {
      scriptToLoad =
        "    <link type=\"image/ico\" href=\"/favicon.ico\" rel=\"icon\">"
        + "    <title>App Inventor Gallery</title>"
        + "    <script type=\"text/javascript\" "
        + "              src=\"script/aiagallery.js\">"
        + "    </script>";
    }

    out.println(
      "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" "
        + "        \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">"
        + "<html xmlns=\"http://www.w3.org/1999/xhtml\" "
        + "      xml:lang=\"en\">"
        + "  <head>"
        + "    <meta http-equiv=\"Content-Type\" "
        + "          content=\"text/html; charset=utf-8\" />"
        + scriptToLoad
        + "  </head>" + "  <body>"
        + "  </body>" + "</html>");
  }
  else
  {
    if (false)             // the old way
    {
      // Make 'em sign in.
      // Pass our URL so they're redirected back to here.
      out.println(
        "<p>Please <a href=\""
          + userService.createLoginURL(request.getRequestURI()) 
          + "\">sign in</a>.</p>");
    }
    else
    {
      response.sendRedirect(
        userService.createLoginURL(request.getRequestURI()));
    }
  }
}
