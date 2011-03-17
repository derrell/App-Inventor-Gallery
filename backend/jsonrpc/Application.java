/*
 * Interface implemented to act as the server-specific per-server-instance
 * persistent data.
 * 
 * Copyright (c) 2010-2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */

package jsonrpc;

public interface Application
{
    public void setAttribute(String name, Object value);

    public Object getAttribute(String name);
}
