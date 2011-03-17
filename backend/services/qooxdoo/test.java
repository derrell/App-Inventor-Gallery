/*
 * qooxdoo - the new era of web development
 *
 * http://qooxdoo.org
 *
 * Copyright:
 *   2006, 2009, 2010 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *   See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *   Derrell Lipman (derrell)
 */

/*
 * This is the standard qooxdoo test class.  There are tests for each of the
 * primitive types here, along with standard named tests "echo", "sink" and
 * "sleep".
 */

package services.qooxdoo;

import java.util.*;
import jsonrpc.*;
import org.json.simple.*;

public class test extends AbstractRpcClass
{
	/**
	 * Echo the parameter.
	 * 
	 * @param param
	 *            The value to be echoed
	 * 
	 * @return The result of the method
	 */
	public String echo(String param)
	{
		return "Client said: " + param;
	}

	/**
	 * Sleep for a user-specified number of seconds
	 * 
	 * @param param
	 *            The number of seconds to sleep
	 * 
	 * @return Boolean 'true', always
	 * 
	 * @throws InterruptedException
	 * @throws NumberFormatException
	 */
	public boolean sleep(String param) throws NumberFormatException,
			InterruptedException
	{
		Thread.sleep((new Long(param)) * 1000);

		return true;
	}

	/*
	 * The remainder of the functions test each individual primitive type, and
	 * test echoing arbitrary types. Hopefully the name is self-explanatory.
	 */

	public int getInteger()
	{
		return 1;
	}

	public double getFloat()
	{
		return 1.0 / 3.0;
	}

	public String getString()
	{
		return "Hello world";
	}

	public String getBadString()
	{
		return "<!DOCTYPE HTML \"-//IETF//DTD HTML 2.0//EN\">";
	}

	@SuppressWarnings("unchecked")
	public JSONArray getArrayInteger()
	{
		JSONArray a = new JSONArray();
		a.add(1);
		a.add(2);
		a.add(3);
		a.add(4);
		return a;
	}

	@SuppressWarnings("unchecked")
	public JSONArray getArrayString()
	{
		JSONArray a = new JSONArray();
		a.add("one");
		a.add("two");
		a.add("three");
		a.add("four");
		return a;
	}

	@SuppressWarnings("unchecked")
    public Object getObject()
	{
		JSONObject		o = new JSONObject();
		o.put("use", 0);
		return o;
	}

	public boolean getTrue()
	{
		return true;
	}

	public boolean getFalse()
	{
		return false;
	}

	public Object getNull()
	{
		return null;
	}

	public boolean isInteger(Byte param)
	{
		return true;
	}

	public boolean isInteger(Short param)
	{
		return true;
	}

	public boolean isInteger(Integer param)
	{
		return true;
	}

	public boolean isInteger(Long param)
	{
		return true;
	}

	public boolean isFloat(java.lang.Float param)
	{
		return true;
	}

	public boolean isFloat(java.lang.Double param)
	{
		return true;
	}

	public boolean isString(String param)
	{
		return true;
	}

	public boolean isBoolean(Boolean param)
	{
		return true;
	}

	public boolean isArray(JSONArray param)
	{
		return true;
	}

	public boolean isObject(JSONObject param)
	{
		return true;
	}

	public boolean isNull(Object param)
	{
		return param == null;
	}

	// Sigh. No varargs in Java. Cater parameters to specific tests.
	@SuppressWarnings("unchecked")
	public JSONArray getParams(Boolean param1, Boolean param2, Long param3,
			Double param4, String param5, JSONArray param6, JSONObject param7)
	{
		JSONArray a = new JSONArray();
		a.add(param1);
		a.add(param2);
		a.add(param3);
		a.add(param4);
		a.add(param5);
		a.add(param6);
		a.add(param7);
		return a;
	}

	@SuppressWarnings("unchecked")
	public JSONArray getParams(Object param1, Boolean param2, Long param3,
			Double param4, String param5, JSONArray param6, JSONObject param7)
	{
		JSONArray a = new JSONArray();
		a.add(param1);
		a.add(param2);
		a.add(param3);
		a.add(param4);
		a.add(param5);
		a.add(param6);
		a.add(param7);
		return a;
	}

	@SuppressWarnings("unchecked")
	public JSONArray getParams(JSONObject param1, JSONObject param2)
	{
		JSONArray a = new JSONArray();
		a.add(param1);
		a.add(param2);
		return a;
	}

	@SuppressWarnings("unchecked")
	public JSONArray getParams(JSONObject param)
	{
		JSONArray a = new JSONArray();
		a.add(param);
		return a;
	}

	public Object getParam(JSONObject param)
	{
		return param;
	}

	public String getParam(String param)
	{
		return param;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public Map getCurrentTimestamp()
	{
		Map ret = new HashMap();
		ret.put("now", new Long(System.currentTimeMillis()));
		ret.put("json", new Date().toString());
		return ret;
	}

	public void getError() throws JsonRpcError
	{
		throw new JsonRpcError(42, "This is an application-provided error");
	}

	public void getError(Boolean b) throws JsonRpcError
	{
		throw new JsonRpcError(23, "This is an application-provided error");
	}
}
