/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery;

import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.Query;
import javax.jdo.Transaction;
import javax.jdo.PersistenceManager;
import javax.jdo.PersistenceManagerFactory;

import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import aiagallery.objdb.ApkData;
import aiagallery.objdb.Permission;
import aiagallery.objdb.Tag;
import aiagallery.objdb.UniquePersistenceManagerFactory;
import aiagallery.objdb.Visitor;

/**
 * Implementation of visitor-related features required by RPCs
 */
public class Features
{
    /**
     * Get a logger object. With the logger object (log), one can call
     * log.info(), log.warning(), log.severe().
     */
    private static final Logger log = Logger
                                            .getLogger(Features.class.getName());

    /** Keep track of a visitor's user id */
    String                      userId;

    /** True if the visitor is an administrator */
    private boolean             bAdministrator;

    /** The persistence manager for this temporary feature session */
    private PersistenceManager  pm;

    /**
     * Constructor
     */
    public Features()
    {
        // Get a persistence manager
        PersistenceManagerFactory pmf = UniquePersistenceManagerFactory
                .getInstance();
        this.pm = pmf.getPersistenceManager();

        // Determine our user id
        log.logp(Level.WARNING, "Features", "constructor",
                "Determining user id...");

        UserService userService = UserServiceFactory.getUserService();
        User currentUser = userService.getCurrentUser();

        // Save the user id (his email address)
        this.userId = currentUser.getEmail().toLowerCase();

        // If the user is logged in, also find out if he's a pre-configured
        // administrator.
        this.bAdministrator = (this.userId != null && userService.isUserAdmin());

        log.logp(Level.WARNING, "Features", "constructor", "userId="
                + this.userId);
    }

    /**
     * Be sure that all data gets flushed.
     */
    public void flush()
    {
        log.logp(Level.WARNING, "Features", "flush",
                "Closing persistence manager");

        // Close the persistence manager, to flush all persistent data.
        this.pm.close();
    }

    /**
     * Add a new visitor, if a visitor with the specified userId does not exist.
     * 
     * @param userId
     *        The userId address that uniquely identifies this visitor
     * 
     * @return true if the visitor was added, false if visitor already existed.
     * 
     * @throws PermissionDeniedError
     *         if the current user does not have permission to add visitors.
     */
    @SuppressWarnings("unchecked")
    public boolean addVisitor(String userId, String name)
            throws PermissionDeniedError
    {
        boolean ret;
        Visitor visitor;
        List<Visitor> results;
        log.logp(Level.WARNING, "Features", "addVisitor", "Entering");

        // Ensure that this user has appropriate permission
        this.checkPermissions("VISITOR ADD");

        // Get a handle to the transaction
        Transaction tx = this.pm.currentTransaction();

        try
        {
            // Begin a transaction
            tx.begin();

            //
            // See if the visitor name already exists...
            //
            Object parameters[] = { userId.toLowerCase() };
            results = (List<Visitor>) this.query(Visitor.class,
                    "userId == _userId", "String _userId", parameters);

            // Did we get any results?
            if (results.iterator().hasNext())
            {
                log.logp(Level.WARNING, "Features", "addVisitor",
                        "Found Visitor " + userId);

                // Yup. Get the first (and only) visitor object with this name
                visitor = (Visitor) results.get(0);

                // The visitor already existed.
                ret = false;
            }
            else
            {
                log.logp(Level.WARNING, "Features", "addVisitor",
                        "Creating new Visitor: " + userId);

                // This is a new visitor. Create him.
                visitor = new Visitor(userId, name);

                // Save the new visitor
                log.logp(Level.WARNING, "Features", "addVisitor",
                        "Making visitor persistent");
                this.pm.makePersistent(visitor);

                // Unless there's a commit failure, we successfully added the
                // visitor.
                ret = true;
            }

            // Complete the transaction
            log.logp(Level.WARNING, "Features", "addVisitor",
                    "Commiting transaction 2");
            tx.commit();
        }
        finally
        {
            // If the transaction wasn't committed...
            if (tx.isActive())
            {
                // ... then roll it back.
                tx.rollback();
                ret = false;
            }
        }

        // Let 'em know the result
        return ret;
    }

    /**
     * Delete a visitor.
     * 
     * @param userId
     *        The visitor to be removed
     * 
     * @return true if the visitor was deleted; false if the visitor was not
     *         found
     * 
     * @throws PermissionDeniedError
     *         if the user does not have permission to delete visitors, or if
     *         the user tries to delete himself.
     */
    public boolean deleteVisitor(String userId) throws PermissionDeniedError
    {
        boolean ret;
        Visitor visitor;

        log.logp(Level.WARNING, "Features", "deleteVisitor", "Entering");

        // Ensure that this user has appropriate permission
        this.checkPermissions("VISITOR DELETE");

        // It's not permissible for a user to delete himself
        if (this.userId.equals(userId))
        {
            throw new PermissionDeniedError();
        }

        // Get a handle to the transaction
        Transaction tx = this.pm.currentTransaction();
        try
        {
            // Begin a transaction
            // tx.begin();

            // Now delete the visitor
            visitor = this.getVisitor(userId);
            ret = (visitor != null);
            if (ret)
            {
                this.pm.deletePersistent(visitor);
            }

            // Commit it all!
            // tx.commit();
        }
        finally
        {
            // If the transaction wasn't committed...
            if (tx.isActive())
            {
                // ... then roll it back.
                tx.rollback();
            }
        }

        return ret;
    }

    /**
     * Get the list of visitors
     * 
     * @return List of all Visitor objects.
     * 
     * @throws PermissionDeniedError
     *         if the user does not have permission to retrieve the visitor
     *         list.
     */
    @SuppressWarnings("unchecked")
    public List<Visitor> getVisitorList() throws PermissionDeniedError
    {
        // Ensure that this user has appropriate permission
        this.checkPermissions("VISITOR VIEW");

        return (List<Visitor>) this.query(Visitor.class, null, null, null);
    }

    /**
     * Get the Visitor object associated with a visitor.
     * 
     * @param userId
     *        The user id of the visitor to be looked up
     * 
     * @return The Visitor object associated with the specified visitor, if the
     *         specified visitor is registered; null otherwise.
     */
    @SuppressWarnings("unchecked")
    private Visitor getVisitor(String userId)
    {
        Object parameters[] = { userId.toLowerCase() };
        List<Visitor> results = (List<Visitor>) this.query(Visitor.class,
                "userId == _userId", "String _userId", parameters);

        // Did we get any results?
        if (results.iterator().hasNext())
        {
            // Yup. Get the first (and only) returned visitor object
            return (Visitor) results.get(0);
        }
        else
        {
            // visitor not found.
            return null;
        }
    }

    /**
     * Add a new tag, if a tag with the specified name does not exist.
     * 
     * @param tagName
     *        The tag name to be added
     * 
     * @param description
     *        A description of the purpose of this tag
     * 
     * @return true if the tag was added, false if tag already existed.
     * 
     * @throws PermissionDeniedError
     *         if the current user does not have permission to add tags.
     */
    @SuppressWarnings("unchecked")
    public boolean addTag(String tagName, String description)
            throws PermissionDeniedError
    {
        boolean ret;
        Tag tag;
        List<Tag> results;

        log.logp(Level.WARNING, "Features", "addTag", "Entering");

        // Ensure that this user has appropriate permission
        this.checkPermissions("TAG ADD");

        // Get a handle to the transaction
        Transaction tx = this.pm.currentTransaction();

        try
        {
            // Begin a transaction
            tx.begin();

            //
            // See if the tag name already exists...
            //
            Object parameters[] = { tagName.toLowerCase() };
            results = (List<Tag>) this.query(Tag.class, "name == _name",
                    "String _name", parameters);

            // Did we get any results?
            if (results.iterator().hasNext())
            {
                log.logp(Level.WARNING, "Features", "addTag", "Found Tag "
                        + tagName);

                // Yup. Get the first (and only) tag object with this name
                tag = (Tag) results.get(0);

                // The tag already existed.
                ret = false;
            }
            else
            {
                log.logp(Level.WARNING, "Features", "addTag",
                        "Creating new Tag: " + tagName);

                // This is a new tag. Create it.
                tag = new Tag(tagName, description);

                // Save the new tag
                log.logp(Level.WARNING, "Features", "addTag",
                        "Making tag persistent");
                this.pm.makePersistent(tag);

                // Unless there's a commit failure, we successfully added the
                // tag.
                ret = true;
            }

            // Complete the transaction
            log.logp(Level.WARNING, "Features", "addTag",
                    "Commiting transaction");
            tx.commit();
        }
        finally
        {
            // If the transaction wasn't committed...
            if (tx.isActive())
            {
                // ... then roll it back.
                tx.rollback();
                ret = false;
            }
        }

        // Let 'em know the result
        return ret;
    }

    /**
     * Delete a tag.
     * 
     * @param tagName
     *        The tag to be removed
     * 
     * @return true if the tag was deleted; false if the tag was not found
     * 
     * @throws PermissionDeniedError
     *         if the user does not have permission to delete tags
     * 
     * @throws WouldCorruptError
     *         if there is an ApkData object with only this tagName in its tags
     *         list.
     */
    @SuppressWarnings("unchecked")
    public boolean deleteTag(String tagName) throws PermissionDeniedError,
            WouldCorruptError
    {
        boolean ret;
        Tag tag;
        Iterator<ApkData> iterator;
        ApkData apkData;

        log.logp(Level.WARNING, "Features", "deleteTag", "Entering");

        // Ensure that this user has appropriate permission
        this.checkPermissions("TAG DELETE");

        // Get a handle to the transaction
        Transaction tx = this.pm.currentTransaction();
        try
        {
            // Begin a transaction
            tx.begin();

            // Maintain referential integrity. Find all ApkData objects that
            // reference this tag and remove this tag from
            // their tags list. If this was that ApkData's only tag, roll
            // back the transaction, do not allow the deletion of this tag,
            // and throw a WouldCorruptError.
            Object parameters[] = { tagName.toLowerCase() };
            List<ApkData> results = (List<ApkData>) this.query(ApkData.class,
                    "_tagName IN tags", "String _tagName", parameters);

            // Did we get any results?
            iterator = results.iterator();
            while (iterator.hasNext())
            {
                // Yup. Retrieve the ApkData object
                apkData = iterator.next();

                // Remove this tag from its tags list
                apkData.getTags().remove(tagName);

                // Was this the last tag in the list?
                if (apkData.getTags().isEmpty())
                {
                    // Yup. Throw an error. That Apk would no longer be
                    // accessible.
                    throw new WouldCorruptError();
                }
            }

            // Delete the tag
            tag = this.getTag(tagName);
            ret = (tag != null);
            if (ret)
            {
                // Remove the tag from persistent storage
                this.pm.deletePersistent(tag);
            }

            // Commit it all!
            tx.commit();
        }
        finally
        {
            // If the transaction wasn't committed...
            if (tx.isActive())
            {
                // ... then roll it back.
                tx.rollback();
            }
        }

        return ret;
    }

    /**
     * Get the list of tags
     * 
     * @return List of all Tag objects
     * 
     * @throws PermissionDeniedError
     *         if the user does not have permission to retrieve the tag list.
     */
    @SuppressWarnings("unchecked")
    public List<Tag> getTagList() throws PermissionDeniedError
    {
        // Ensure that this user has appropriate permission
        this.checkPermissions("TAG VIEW");

        return (List<Tag>) this.query(Tag.class, null, null, null);
    }

    /**
     * Get the Tag object associated with a name.
     * 
     * @param tagName
     *        The tag name to be looked up
     * 
     * @return The Tag object associated with the specified tag name, if the
     *         specified name exists; null otherwise.
     */
    @SuppressWarnings("unchecked")
    private Tag getTag(String tagName)
    {
        Object parameters[] = { tagName.toLowerCase() };
        List<Tag> results = (List<Tag>) this.query(Tag.class,
                "name == _tagName", "String _tagName", parameters);

        // Did we get any results?
        if (results.iterator().hasNext())
        {
            // Yup. Get the first (and only) returned tag object
            return (Tag) results.get(0);
        }
        else
        {
            // tag not found.
            return null;
        }
    }

    /**
     * Add a new permission, if a permission with the specified name does not
     * exist.
     * 
     * @param permissionName
     *        The permission name to be added
     * 
     * @param description
     *        A description of the purpose of this permission
     * 
     * @return true if the permission was added, false if permission already
     *         existed.
     * 
     * @throws PermissionDeniedError
     *         if the current user is not an administrator
     */
    @SuppressWarnings("unchecked")
    public boolean addPermission(String permissionName, String description)
            throws PermissionDeniedError
    {
        boolean ret;
        Permission permission;
        List<Permission> results;

        log.logp(Level.WARNING, "Features", "addPermission", "Entering");

        // Ensure that this user is an administrator
        this.checkPermissions(null);

        // Get a handle to the transaction
        Transaction tx = this.pm.currentTransaction();

        try
        {
            // Begin a transaction
            tx.begin();

            //
            // See if the permission name already exists...
            //
            Object parameters[] = { permissionName.toLowerCase() };
            results = (List<Permission>) this.query(Permission.class,
                    "name == _name", "String _name", parameters);

            // Did we get any results?
            if (results.iterator().hasNext())
            {
                log.logp(Level.WARNING, "Features", "addPermission",
                        "Found Permission " + permissionName);

                // Yup. Get the first (and only) permission object with this
                // name.
                permission = (Permission) results.get(0);

                // The permission already existed.
                ret = false;
            }
            else
            {
                log.logp(Level.WARNING, "Features", "addPermission",
                        "Creating new Permission: " + permissionName);

                // This is a new permission. Create it.
                permission = new Permission(permissionName, description);

                // Save the new permission
                log.logp(Level.WARNING, "Features", "addPermission",
                        "Making permission persistent");
                this.pm.makePersistent(permission);

                // Unless there's a commit failure, we successfully added the
                // tag.
                ret = true;
            }

            // Complete the transaction
            log.logp(Level.WARNING, "Features", "addPermission",
                    "Commiting transaction");
            tx.commit();
        }
        finally
        {
            // If the transaction wasn't committed...
            if (tx.isActive())
            {
                // ... then roll it back.
                tx.rollback();
                ret = false;
            }
        }

        // Let 'em know the result
        return ret;
    }

    /**
     * Delete a permission.
     * 
     * @param permissionName
     *        The permission to be removed
     * 
     * @return true if the permission was deleted; false if the permission was
     *         not found
     * 
     * @throws PermissionDeniedError
     *         if the user does not have permission to delete permissions
     */
    @SuppressWarnings("unchecked")
    public boolean deletePermission(String permissionName)
            throws PermissionDeniedError
    {
        boolean ret;
        Permission permission;
        Iterator<Visitor> iterator;
        Visitor visitor;

        log.logp(Level.WARNING, "Features", "deletePermission", "Entering");

        // Only the administrator has permission to do this.
        this.checkPermissions(null);

        // Get a handle to the transaction
        Transaction tx = this.pm.currentTransaction();
        try
        {
            // Begin a transaction
            tx.begin();

            // Maintain referential integrity. Find all Visitor objects that
            // reference this permission and remove this permission from
            // their permissions list.
            Object parameters[] = { permissionName.toLowerCase() };
            List<Visitor> results = (List<Visitor>) this.query(Visitor.class,
                    "_permissionName IN permissions", "String _permissionName",
                    parameters);

            // Did we get any results?
            iterator = results.iterator();
            while (iterator.hasNext())
            {
                // Yup. Retrieve the Visitor object
                visitor = iterator.next();

                // Remove this permission from its permissions list
                visitor.getPermissions().remove(permissionName);
            }

            // Delete the permission
            permission = this.getPermission(permissionName);
            ret = (permission != null);
            if (ret)
            {
                // Remove the permission from persistent storage
                this.pm.deletePersistent(permission);
            }

            // Commit it all!
            tx.commit();
        }
        finally
        {
            // If the transaction wasn't committed...
            if (tx.isActive())
            {
                // ... then roll it back.
                tx.rollback();
            }
        }

        return ret;
    }

    /**
     * Get the list of permissions
     * 
     * @return List of all Permission objects
     * 
     * @throws PermissionDeniedError
     *         if the user does not have permission to retrieve the permission
     *         list.
     */
    @SuppressWarnings("unchecked")
    public List<Permission> getPermissionList() throws PermissionDeniedError
    {
        // Only the administrator has permission to access the permission list.
        this.checkPermissions(null);

        return (List<Permission>) this
                .query(Permission.class, null, null, null);
    }

    /**
     * Get the Permission object associated with a name.
     * 
     * @param permissionName
     *        The permission name to be looked up
     * 
     * @return The Permission object associated with the specified visitor, if
     *         the specified name exists; null otherwise.
     */
    @SuppressWarnings("unchecked")
    private Permission getPermission(String permissionName)
    {
        Object parameters[] = { permissionName.toLowerCase() };
        List<Permission> results = (List<Permission>) this.query(
                Permission.class, "name == _permissionName",
                "String _permissionName", parameters);

        // Did we get any results?
        if (results.iterator().hasNext())
        {
            // Yup. Get the first (and only) returned visitor object
            return (Permission) results.get(0);
        }
        else
        {
            // visitor not found.
            return null;
        }
    }

    // ////////////////////////////////////////////////////////////////////////
    // Private methods
    // ////////////////////////////////////////////////////////////////////////

    /**
     * Issue a query
     * 
     * @param clazz
     *        The Class of object to search for
     * 
     * @param filter
     *        A filter string identifying which objects are to be returned. All
     *        parameters used in this filter must be declared in the
     *        parameterDeclarations field.
     * 
     * @param parameterDeclarations
     *        A comma-separated list of declarations of query parameters
     * 
     * @param parameters
     *        The actual parameter values to be inserted into the filter
     * 
     * @return A list of matching results
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
    private List query(java.lang.Class clazz, String filter,
            String parameterDeclarations, Object[] parameters)
    {
        Query query;
        List<String> results;

        // Create a new query for the specified class of object
        query = this.pm.newQuery(clazz);

        // Establish the filter criteria
        if (filter != null)
        {
            query.setFilter(filter);

            // Declare the parameters in the query, comma-separated
            if (parameterDeclarations != null)
            {
                query.declareParameters(parameterDeclarations);
            }
        }

        if (parameters != null)
        {
            // Execute the query with the provided parameters
            results = (List<String>) query.executeWithArray(parameters);
        }
        else
        {
            // Execute the query
            results = (List<String>) query.execute();
        }

        // Give 'em the results
        return results;
    }

    /**
     * Determine if the current user has a specified permission.
     * 
     * @param requiredPermission
     *        The permission name to be tested. This may also be null to
     *        indicate that the only permitted access is if the user is an
     *        administrator.
     * 
     * @throws PermissionDeniedError
     *         if the current user does not have the requested permission.
     */
    @SuppressWarnings("unchecked")
    private void checkPermissions(String requiredPermission)
            throws PermissionDeniedError
    {
        List<Visitor> results;
        Object parameters[] = { this.userId.toLowerCase() };

        // If the user is an administrator, he has permission implicitly.
        if (this.bAdministrator)
        {
            return;
        }

        // If the only valid access is via administrator...
        if (requiredPermission == null)
        {
            // ... then permission is denied since we would have returned.
            throw new PermissionDeniedError();
        }

        // Assume no permission, in case user is not found
        boolean bHasPermission = false;

        // Try to locate this Visitor object
        results = (List<Visitor>) this.query(Visitor.class,
                "userId == _userId", "String _userId", parameters);

        // Did we get any results?
        if (results.iterator().hasNext())
        {
            log.logp(Level.WARNING, "Features", "addVisitor", "Found Visitor "
                    + userId);
            // Yup. Get the first (and only) visitor object with this name.
            // It's me. See if I have the requisite permission.
            bHasPermission = ((Visitor) results.get(0))
                    .hasPermission(requiredPermission);
        }

        log.logp(Level.WARNING, "Features", "addVisitor", "User " + userId
                + (bHasPermission ? " has " : " does not have ")
                + "permission " + requiredPermission);

        // Does this visitor have the required permission?
        if (bHasPermission)
        {
            // Yup. We can simply return.
            return;
        }

        // Visitor does not have the requisite permission. Throw an error.
        throw new PermissionDeniedError();
    }
}
