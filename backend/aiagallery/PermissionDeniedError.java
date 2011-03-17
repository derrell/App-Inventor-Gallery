/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery;

/**
 * Error thrown when a request is made for which the visitor does not have
 * appropriate permissions.
 */
public class PermissionDeniedError extends Exception
{
    private static final long serialVersionUID = -1887630591354911741L;
}
