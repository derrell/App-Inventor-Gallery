/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery.objdb;

import javax.jdo.annotations.PersistenceCapable;

/**
 * Permission types. These could as well be hard-coded, because the code must
 * use them to provide (or not) permission to certain features. We keep them
 * in the database so that the code can be kept generic except for the few
 * places that must manipulate the list of permissions.
 */
@PersistenceCapable
public class Permission extends NameAndDescription
{
	public Permission(String name, String description)
	{
		super(name, description);
	};
}
