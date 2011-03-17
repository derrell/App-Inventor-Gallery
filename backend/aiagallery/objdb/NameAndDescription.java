/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery.objdb;

import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

/**
 * A number of other classes require a name and a description. They may extend
 * this abstract class.
 */
public abstract class NameAndDescription
{
    /** Name of this item */
    @PrimaryKey
    @Persistent
    private String name;

    /** Description of this item */
    @Persistent
    private String description;

    public NameAndDescription(String name, String description)
    {
        this.setName(new String(name));
        this.setDescription(new String(description));
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getName()
    {
        return name;
    }

    public void setDescription(String description)
    {
        this.description = description;
    }

    public String getDescription()
    {
        return description;
    }
}
