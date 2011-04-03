/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery.objdb;

import java.util.ArrayList;
import java.util.List;

import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

/**
 * A visitor is a unique individual, authenticated by the Google authentication
 * system, and identified by the Google user id.
 */
@PersistenceCapable
public class Visitor
{
    /** The user id identifying this user; also his primary key */
    @PrimaryKey
    @Persistent
    private String       userId;

    /** User's name */
    @Persistent
    private String       name;

    /** A list of permissions this user has been issued */
    @Persistent
    private List<String> permissions;

    /** Status of this visitor */
    @Persistent
    private Status       status;

    /**
     * Constructor
     * 
     * @param userId
     *        The user id identifying this user
     * 
     * @param name
     *        The free-text name of this user
     */
    public Visitor(String userId, String name)
    {
        // Save the primary key (user id)
        this.userId = userId.toLowerCase();

        // Save the user's name
        this.name = name;

        // Instantiate a new list for permissions
        this.permissions = new ArrayList<String>();
    }

    /**
     * Get the user id associated with this user
     * 
     * @return The Google user account id associated with this user
     */
    public String getUserId()
    {
        return this.userId;
    }

    /**
     * Add a permission to this user
     * 
     * @param permissionName
     *        The name of the permission to be added
     */
    public void addPermission(String permissionName)
    {
        // FIXME: Verify that the permission name is one of the known permissions
        // (or do it in services.aiagallery.features, to validate user input)
        
        // We want only one copy of each permission. If the list doesn't
        // already contain this permission...
        if (this.permissions.indexOf(permissionName) == -1)
        {
            // ... then add this permission to the list.
            this.permissions.add(new String(permissionName));
        }
    }

    /**
     * Determine if a user has a particular permission
     * 
     * @param permissionName
     *        The name of the permission to be tested
     * 
     * @return true if the user has the said permission; false otherwise
     */
    public Boolean hasPermission(String permissionName)
    {
        return this.permissions.indexOf(permissionName) >= 0;
    }

    /**
     * Get the permission list for this user
     * 
     * @return permissionName The list of currently-assigned permissions
     */
    public List<String> getPermissions()
    {
        return this.permissions;
    }

    /**
     * Set this visitor's name
     * 
     * @param name
     *        The visitor's name
     */
    public void setName(String name)
    {
        this.name = name;
    }

    /**
     * Get this visitor's name
     * 
     * @return The visitor's name
     */
    public String getName()
    {
        return this.name;
    }

    /**
     * Set this visitor's status
     * 
     * @param status
     *        The new status for this visitor
     */
    public void setStatus(Status status)
    {
        this.status = status;
    }

    /**
     * Get this visitor's status
     * 
     * @return The visitor's current status
     */
    public Status getStatus()
    {
        return this.status;
    }
}
