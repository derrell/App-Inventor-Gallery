/*
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery;

import java.io.IOException;
import javax.servlet.ServletException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

/**
 * Servlet for a Graphical User Interface running on App Engine
 */
public class GuiServlet extends HttpServlet
{
    /**
	 * 
	 */
    private static final long serialVersionUID = 6490709666399087422L;

    /**
     * Override the doGet method to serve up the graphical user interface
     */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        String scriptToLoad;

        // Get a user service instance, to determine signed-in user data
        UserService userService = UserServiceFactory.getUserService();

        // If the user is logged in, get the requested page.
        if (request.getUserPrincipal() != null)
        {
            // Determine if the console is being requested.
            if (request.getQueryString() != null)
            {
                scriptToLoad = "    <title>RpcConsole</title>"
                        + "    <script type=\"text/javascript\" "
                        + "            src=\"script/rpcconsole.demo.js\">";
            }
            else
            {
                scriptToLoad = "    <title>aiagallery</title>"
                        + "    <script type=\"text/javascript\" "
                        + "            src=\"script/helper.js\">";

            }

            response.getWriter()
                    .println(
                            "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" "
                                    + "        \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">"
                                    + "<html xmlns=\"http://www.w3.org/1999/xhtml\" "
                                    + "      xml:lang=\"en\">"
                                    + "  <head>"
                                    + "    <meta http-equiv=\"Content-Type\" "
                                    + "          content=\"text/html; charset=utf-8\" />"
                                    +

                                    scriptToLoad +

                                    "    </script>" + "  </head>" + "  <body>"
                                    + "  </body>" + "</html>");
        }
        else
        {
            // Make 'em sign in.
            // Pass our URL so they're redirected back to here.
            response.getWriter().println(
                    "<p>Please <a href=\""
                            + userService.createLoginURL(request
                                    .getRequestURI()) + "\">sign in</a>.</p>");
        }
    }
}
