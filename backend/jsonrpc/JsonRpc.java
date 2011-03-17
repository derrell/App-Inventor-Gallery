/*
 * A simple JSON-RPC Server
 * 
 * Copyright (c) 2010-2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package jsonrpc;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.ListIterator;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.InvocationTargetException;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.json.simple.*;

import java.io.IOException;

public class JsonRpc
{
    /**
     * Get a logger object. With the logger object (log), one can call
     * log.info(), log.warning(), log.severe().
     */
    private static final Logger log                   = Logger.getLogger(JsonRpc.class
                                                              .getName());

    /*************************************************************
     * Method Accessibility values (not yet used)
     *************************************************************/

    /*
     * public accessibility - The method may be called from any session, and
     * without any checking of who the Referer is.
     */
    public static int           Accessibility_Public  = 1;

    /**
     * domain accessibility - The method may only be called by a script obtained
     * via a web page loaded from this server. The Referer must match the
     * request URI, through the domain part.
     */
    public static int           Accessibility_Domain  = 2;

    /**
     * "session" - The Referer must match the Referer of the very first RPC
     * request issued during the session.
     */
    public static int           Accessibility_Session = 3;

    /**
     * "fail" - Access is denied
     */
    public static int           Accessibility_Fail    = 4;

    /**
     * Handle a JSON-RPC request. The target request string is parsed and
     * validated, the requested method is located and called, and the result
     * produced.
     * 
     * @param requestString
     *        The JSON-RPC request, in its string form as sent by the client
     * 
     * @return A result string. Assuming a valid request, the result will be
     *         JSON. If an error occurs early in the parsing process, e.g. we
     *         parse a JSON request but it does not contain the requisite
     *         fields, the assumption is made that a request was issued from
     *         other than a JSON-RPC client, so an error is sent back as text.
     */
    @SuppressWarnings("unchecked")
    public static String handleRequest(String requestString,
            HttpServletRequest request, HttpSession session,
            Application application) throws IOException
    {
        String className;
        String serviceName;
        String methodName;
        Object result;
        Object[] parameters;
        Pattern p;
        Matcher m;
        @SuppressWarnings("rawtypes")
        Class clazz;
        @SuppressWarnings("rawtypes")
        Class[] paramTypes;
        Method method;
        @SuppressWarnings("rawtypes")
        Constructor constructor;
        AbstractRpcClass obj;

        log.logp(Level.INFO, "JsonRpc", "handleRequest", "Entering");

        // Create a new JsonRpcError object and initialize it to origin:
        // Server
        JsonRpcError error = new JsonRpcError();
        error.setOrigin(JsonRpcError.Origin_Server);

        // The input string is supposed to be JSON. Parse it. Allow errors
        // to be thrown (i.e. don't catch errors here)
        JSONObject jsonInput = (JSONObject) JSONValue.parse(requestString);

        // Ensure we parsed properly
        if (jsonInput == null)
        {
            error.setError(JsonRpcError.Error_Unknown,
                    "Could not understand request: " + requestString);
            return error.toString();
        }

        // Ensure that the object has the three required parts:
        // service, method, and params
        if (jsonInput.get("service") == null || jsonInput.get("method") == null
                || jsonInput.get("params") == null
                || jsonInput.get("id") == null)
        {
            // This request was not issued with JSON-RPC so echo the error
            // rather than issuing a JsonRpcError response.
            return "JSON-RPC request expected; "
                    + "service, method or params missing<br>";
        }

        // Add the id of the current request
        error.setId((Long) jsonInput.get("id"));

        // Retrieve the information about the method being called
        serviceName = (String) jsonInput.get("service");
        methodName = (String) jsonInput.get("method");

        // Retrieve the parameters into an object array
        JSONArray params = (JSONArray) jsonInput.get("params");
        @SuppressWarnings("rawtypes")
        ListIterator iterator = params.listIterator();
        parameters = new Object[params.size()];
        for (int i = 0; iterator.hasNext(); i++)
        {
            parameters[i] = iterator.next();
        }

        //
        // Ensure the requested service name is kosher. A service name
        // should be:
        //
        // - a dot-separated sequences of strings; no adjacent dots
        // - first character of each string is in [a-zA-Z]
        // - other characters are in [_a-zA-Z0-9]
        //

        // First check for legal characters
        p = Pattern.compile("^[a-zA-Z][_.a-zA-Z0-9]*$");
        m = p.matcher(serviceName);
        if (!m.find())
        {
            // There's some illegal character in the service name
            error.setError(JsonRpcError.Error_IllegalService,
                    "Illegal character found in service name.");
            return error.toString();
        }

        // Now ensure there are no double dots
        if (serviceName.indexOf("..") > 0)
        {
            error.setError(JsonRpcError.Error_IllegalService,
                    "Illegal use of two consecutive dots " + "in service name");
            return error.toString();
        }

        // Split the service name into its dot-separated parts
        String[] serviceComponents = serviceName.split("[.]");

        // Ensure that each component begins with a letter. While we're at
        // it, Join the components back together to form the class name to
        // be instantiated. Prepend a constant prefix to prevent malicious
        // actions.
        className = "services";
        p = Pattern.compile("^[a-zA-Z]");
        for (int i = 0; i < serviceComponents.length; i++)
        {
            m = p.matcher(serviceComponents[i]);
            if (!m.find())
            {
                error.setError(JsonRpcError.Error_IllegalService,
                        "Service name component '" + serviceComponents[i]
                                + "' does not begin with a letter");
                return error.toString();
            }

            // Append this component to our class name
            className += "." + serviceComponents[i];
        }

        // Find the class by name
        try
        {
            // Attempt to locate the class
            clazz = Class.forName(className);
        }
        catch (ClassNotFoundException e)
        {
            // The class was not found
            error.setError(JsonRpcError.Error_ClassNotFound, "Service class "
                    + className + " not found.");
            return error.toString();
        }

        try
        {
            // Find a constructor. There are no parameters to the
            // constructor.
            paramTypes = new Class[0];
            constructor = clazz.getConstructor(paramTypes);

            // Instantiate an object of this service class
            obj = (AbstractRpcClass) constructor.newInstance();

            // Save the request, session, and application objects for
            // access by the invoked method
            obj._setRequest(request);
            obj._setSession(session);
            obj._setApplication(application);
        }
        catch (Exception e)
        {
            // We couldn't get the constructor or instantiate the service
            // class
            return new JsonRpcError(JsonRpcError.Error_ClassNotFound,
                    "Could not access service class " + className + " ("
                            + e.toString() + ").", e).toString();
        }

        // Build up an array of parameter types.
        paramTypes = new Class[parameters.length];
        for (int i = 0; i < parameters.length; i++)
        {
            if (parameters[i] == null)
            {
                paramTypes[i] = Object.class;
            }
            else
            {
                paramTypes[i] = parameters[i].getClass();
            }
        }

        // Find the method by name
        try
        {
            // Attempt to locate the method
            method = clazz.getMethod(methodName, paramTypes);
        }
        catch (NoSuchMethodException e)
        {
            String types = "";
            String comma = "";
            for (int i = 0; i < paramTypes.length; i++)
            {
                types += comma + paramTypes[i].toString();
                comma = ", ";
            }
            // The method was not found
            error.setError(JsonRpcError.Error_MethodNotFound, "Method '"
                    + methodName + "(" + types + ")"
                    + "' not found in service class '" + className + "'.");
            return error.toString();
        }

        // Call the requested method, passing it the provided params
        try
        {
            result = method.invoke(obj, parameters);
        }
        catch (InvocationTargetException eWrapper)
        {
            // Some error was thrown. Retrieve it.
            Throwable e = eWrapper.getTargetException();

            if (e instanceof JsonRpcError)
            {
                // Set its id and send it home.
                ((JsonRpcError) e).setId((Long) jsonInput.get("id"));
                return e.toString();
            }

            // Some unknown error. Wrap its text in our own error
            JsonRpcError eJson = new JsonRpcError(JsonRpcError.Error_Unknown,
                    "Method invocation: " + e.toString(), e);
            eJson.setOrigin(JsonRpcError.Origin_Server);
            return eJson.toString();
        }
        catch (Exception e)
        {
            // Some unknown error. Wrap its text in our own error
            JsonRpcError eJson = new JsonRpcError(JsonRpcError.Error_Unknown,
                    "Method invocation: " + e.toString(), e);
            eJson.setOrigin(JsonRpcError.Origin_Server);
            return eJson.toString();
        }

        // Give 'em what they came for! Create a top-level return JSONObject
        JSONObject ret = new JSONObject();
        ret.put("result", result);
        ret.put("id", jsonInput.get("id"));

        // Encode this object and return the string
        return ret.toString();
    }
}
