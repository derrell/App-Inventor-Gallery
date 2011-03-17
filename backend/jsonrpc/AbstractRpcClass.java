/*
 * Abstract class extended by RPC methods
 * 
 * Copyright (c) 2010-2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package jsonrpc;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * The implementation of classes of RPC methods should all extend this class.
 * All variables and methods in this class begin with an underscore to prevent
 * them from being called remotely. (The generic server validates remote method
 * names and ensure that they begin with a letter.)
 */
public class AbstractRpcClass
{
    protected HttpServletRequest _request     = null;
    protected HttpSession        _session     = null;
    protected Application        _application = null;

    /**
     * Save the request object.
     * 
     * @param request
     *        The request object
     */
    protected void _setRequest(HttpServletRequest request)
    {
        this._request = request;
    }

    /**
     * Retrieve the request object.
     */
    protected HttpServletRequest _getRequest()
    {
        return this._request;
    }

    /**
     * Save the session object.
     * 
     * @param session
     *        The session object
     */
    protected void _setSession(HttpSession session)
    {
        this._session = session;
    }

    /**
     * Retrieve the session object.
     */
    protected HttpSession _getSession()
    {
        return this._session;
    }

    /**
     * Save the application object.
     * 
     * @param application
     *        The application object
     */
    protected void _setApplication(Application application)
    {
        this._application = application;
    }

    /**
     * Retrieve the application object.
     */
    protected Application _getApplication()
    {
        return this._application;
    }
}
