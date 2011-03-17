/* 
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery.objdb;

import javax.jdo.annotations.PersistenceCapable;

/**
 * Tags are a set of choices defined by an administrator to which a user may
 * associate his application. This allows an organization at the GUI that is
 * manageable. (The user may also associate keywords with an application, and
 * visitors may search by keyword.)
 */
@PersistenceCapable
public class Tag extends NameAndDescription
{
	public Tag(String name, String description)
	{
		super(name, description);
	};
}
