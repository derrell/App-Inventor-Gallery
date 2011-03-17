/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery;

/**
 * Error thrown when a request is made that would leave the object database in
 * an inconsistent state, such as dangling references.
 */
public class WouldCorruptError extends Exception
{
    private static final long serialVersionUID = 359723052200181982L;
}
