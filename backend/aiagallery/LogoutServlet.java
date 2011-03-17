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
 * Servlet to redirect to the logout page
 */
public class LogoutServlet extends HttpServlet
{
    /**
     * 
     */
    private static final long serialVersionUID = -8334069870385201642L;

    /**
     * Override the doGet method to serve up the logout interface
     */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        // Get a user service instance, to determine signed-in user data
        UserService userService = UserServiceFactory.getUserService();

        // If the user is logged in, get the requested page.
        if (request.getUserPrincipal() != null)
        {
            // Make 'em log out.
            // Pass our URL so they're redirected back to here.
            response.getWriter().println(
                    "<p>Please <a href=\""
                            + userService.createLogoutURL(request
                                    .getRequestURI()) + "\">sign in</a>.</p>");
        }
    }
}
