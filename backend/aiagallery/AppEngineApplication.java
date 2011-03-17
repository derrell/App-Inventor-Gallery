/*
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
*/
package aiagallery;

import jsonrpc.Application;
import javax.servlet.ServletContext;

/**
 * The Application object (per-server-instantiation persistent data)
 * for use with App Engine.
 */
public class AppEngineApplication extends Object implements Application 
{
	// A place to save the provided ServletContext object
	private ServletContext	context;
	
	/**
	 * Constructor
	 * 
	 * @param context
	 *   The ServletContext associated with this servlet
	 */
	public AppEngineApplication(ServletContext context)
	{
		this.context = context;
	}
	
	/**
	 * Set an application-wide attribute
	 * 
	 * @param name
	 *   The name of the attribute being set
	 *   
	 * @param value
	 *   The value to save in association with the provided name
	 */
	public void setAttribute(String name, Object value)
	{
		this.context.setAttribute(name, value);
	}
	
	/**
	 * Get an application-wide attribute value
	 * 
	 * @param name
	 *   The name of the attribute to be retrieved
	 *   
	 * @return
	 *   The value associated with the specified name
	 */
	public Object getAttribute(String name)
	{
		return this.context.getAttribute(name);
	}
}
