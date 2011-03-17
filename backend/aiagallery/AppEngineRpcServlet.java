/*
 * Copyright (c) 2010-2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery;

// import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.IOException;
import java.io.Reader;

import jsonrpc.*;

/**
 * Servlet for an RPC Server running on App Engine
 */
@SuppressWarnings("serial")
public class AppEngineRpcServlet extends HttpServlet
{
    /**
     * Get a logger object. With the logger object (log), one can call
     * log.info(), log.warning(), log.severe().
     */
    // private static final Logger log =
    // Logger.getLogger(App_Inventor_GalleryServlet.class.getName());

    /*************************************************************
     * Method Accessibility values (not yet used)
     *************************************************************/

    /*
     * public accessibility - The method may be called from any session, and
     * without any checking of who the Referer is.
     */
    public static int Accessibility_Public  = 1;

    /**
     * domain accessibility - The method may only be called by a script obtained
     * via a web page loaded from this server. The Referer must match the
     * request URI, through the domain part.
     */
    public static int Accessibility_Domain  = 2;

    /**
     * "session" - The Referer must match the Referer of the very first RPC
     * request issued during the session.
     */
    public static int Accessibility_Session = 3;

    /**
     * "fail" - Access is denied
     */
    public static int Accessibility_Fail    = 4;

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        PrintWriter out = response.getWriter();
        out.write("hello world");
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        PrintWriter out = response.getWriter();

        // Determine the request method. We currently support only POST.
        if (!request.getMethod().equals("POST"))
        {
            out.println("JSON-RPC request expected; "
                    + "unexpected data received (not POST)");
            return;
        }

        // The size of the read buffer
        final int BUFFER_SIZE = 8192;

        // Confirm that the requester is signed in
        if (request.getUserPrincipal() == null)
        {
            // The user is not signed in. Let 'em know.
            JsonRpcError eJson = new JsonRpcError(
                    JsonRpcError.Error_PermissionDenied, "Not logged in");
            eJson.setOrigin(JsonRpcError.Origin_Server);
            out.println(eJson.toString());
            return;
        }

        // Retrieve the JSON input from the POST data
        try
        {
            int length;
            char[] readBuffer = new char[BUFFER_SIZE];
            String result;
            String requestString;
            StringBuffer requestBuffer = new StringBuffer();
            InputStream inputStream = null;
            Reader reader = null;
            AppEngineApplication application;

            // Get the input stream (the POST data)
            inputStream = request.getInputStream();

            // Create a stream reader
            reader = new InputStreamReader(inputStream, "UTF-8");

            // While there's data available...
            while ((length = reader.read(readBuffer)) != -1)
            {
                // ... append the new data to the request buffer
                requestBuffer.append(readBuffer, 0, length);
            }

            // Generate a single string from the request buffer
            requestString = requestBuffer.toString();

            // Get an application object
            // application = new AppEngineApplication(this.getServletContext());
            application = null;

            // Handle the JSON-RPC request and retrieve the result
            result = JsonRpc.handleRequest(requestString, request,
                    request.getSession(), application);

            // Output the result
            out.println(result.trim());
        }
        catch (Exception e)
        {
            // Some otherwise uncaught exception occurred.
            throw new ServletException("Cannot execute remote method", e);
        }
    }
}
