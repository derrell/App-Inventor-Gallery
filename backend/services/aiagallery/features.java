/*
 * Copyright: 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL:
 * http://www.eclipse.org/org/documents/epl-v10.php See the LICENSE file in the
 * project's top-level directory for details.
 */
package services.aiagallery;

import java.util.*;
import jsonrpc.*;
import org.json.simple.*;

import aiagallery.PermissionDeniedError;
import aiagallery.Features;
import aiagallery.WouldCorruptError;
import aiagallery.objdb.Tag;
import aiagallery.objdb.Visitor;

public class features extends AbstractRpcClass
{
    /**
     * Add a new visitor
     * 
     * @param userId
     *        The user id of the visitor to be added
     * 
     * @return true upon success
     * 
     * @throws JsonRpcError
     *         with code = Error_PermissionDenied if the current user does not
     *         have permission to add a new visitor.
     */
    public boolean addVisitor(String userId, String name) throws JsonRpcError
    {
        try
        {
            // Get a features object
            Features features = new Features();

            // Try to add the visitor. Returns true or throws an error.
            boolean ret = features.addVisitor(userId, name);

            // Flush visitor to persistent storage
            features.flush();

            // Let 'em know it worked.
            return ret;
        }
        catch (PermissionDeniedError e)
        {
            // They didn't have permission to add a visitor.
            throw new JsonRpcError(JsonRpcError.Error_PermissionDenied,
                    "Permission denied.");
        }
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
     * @throws JsonRpcError
     *         with code = Error_PermissionDenied if the current user does not
     *         have permission to delete visitors, or if the user tries to
     *         delete himself.
     */
    public boolean deleteVisitor(String userId) throws JsonRpcError
    {
        try
        {
            // Get a features object
            Features features = new Features();

            // Try to delete the visitor. Returns true or throws an error.
            boolean ret = features.deleteVisitor(userId);

            // Flush visitor to persistent storage
            features.flush();

            // Let 'em know it worked.
            return ret;
        }
        catch (PermissionDeniedError e)
        {
            // They didn't have permission to delete a visitor.
            throw new JsonRpcError(JsonRpcError.Error_PermissionDenied,
                    "Permission denied.");
        }
    }

    /**
     * Get the list of visitors
     * 
     * @return List of all Visitor, including their name, permission list, and
     *         current status.
     * 
     * @throws PermissionDeniedError
     *         if the user does not have permission to retrieve the visitor
     *         list.
     */
    @SuppressWarnings("unchecked")
    public JSONArray getVisitorList() throws JsonRpcError
    {
        List<Visitor>   visitors;
        JSONObject      o;
        
        try
        {
            // Get a features object
            Features features = new Features();

            // Try to retrieve the visitor list. Returns a list, or throws an
            // error.
            visitors = features.getVisitorList();

            // Instantiate a JSON array for the return value
            JSONArray retval = new JSONArray();

            // For each visitor...
            for (Visitor visitor : visitors)
            {
                // Instantiate a JSON object for this visitor
                o = new JSONObject();
                
                // Add this visitor's attributes
                o.put("userId", visitor.getUserId());
                o.put("name", visitor.getName());
                o.put("permissions", visitor.getPermissions());
                o.put("status", visitor.getStatus());
                
                // Add this visitor to the return array
                retval.add(o);
            }

            // Give 'em the visitor list
            return retval;
        }
        catch (PermissionDeniedError e)
        {
            // They didn't have permission to add a visitor.
            throw new JsonRpcError(JsonRpcError.Error_PermissionDenied,
                    "Permission denied.");
        }
    }

    /**
     * Add a new tag
     * 
     * @param tagName
     *        The name of the tag to be added
     *        
     * @param description
     *        A description of this tag
     * 
     * @return true upon success
     * 
     * @throws JsonRpcError
     *         with code = Error_PermissionDenied if the current user does not
     *         have permission to add a new tag.
     */
    public boolean addTag(String tagName, String description) throws JsonRpcError
    {
        try
        {
            // Get a features object
            Features features = new Features();

            // Try to add the tag. Returns true or throws an error.
            boolean ret = features.addTag(tagName, description);

            // Flush tag to persistent storage
            features.flush();

            // Let 'em know it worked.
            return ret;
        }
        catch (PermissionDeniedError e)
        {
            // They didn't have permission to add a tag.
            throw new JsonRpcError(JsonRpcError.Error_PermissionDenied,
                    "Permission denied.");
        }
    }

    /**
     * Delete a tag.
     * 
     * @param tagName
     *        The name of the tag to be removed
     * 
     * @return true if the tag was deleted; false if the tag was not
     *         found
     * 
     * @throws JsonRpcError
     *         with code = Error_PermissionDenied if the current user does not
     *         have permission to delete tags.
     */
    public boolean deleteTag(String tagName) throws JsonRpcError
    {
        try
        {
            // Get a features object
            Features features = new Features();

            // Try to delete the tag. Returns true or throws an error.
            boolean ret = features.deleteTag(tagName);

            // Flush visitor to persistent storage
            features.flush();

            // Let 'em know it worked.
            return ret;
        }
        catch (PermissionDeniedError e)
        {
            // They didn't have permission to delete a tag.
            throw new JsonRpcError(JsonRpcError.Error_PermissionDenied,
                    "Permission denied.");
        }
        catch (WouldCorruptError e)
        {
            // The operation would have disrupted referential integrity
            throw new JsonRpcError(JsonRpcError.Error_PermissionDenied,
                    "Tag is in use; can not be deleted.");
        }
    }

    /**
     * Get the list of tags
     * 
     * @return List of all tags.
     * 
     * @throws PermissionDeniedError
     *         if the user does not have permission to retrieve the tag list.
     */
    @SuppressWarnings("unchecked")
    public JSONArray getTagList() throws JsonRpcError
    {
        List<Tag>       tags;
        
        try
        {
            // Get a features object
            Features features = new Features();

            // Try to retrieve the tag list. Returns a list, or throws an
            // error.
            tags = features.getTagList();

            // Instantiate a JSON array for the return value
            JSONArray retval = new JSONArray();

            // For each tag...
            for (Tag tag : tags)
            {
                // Add this tag to the return array
                retval.add(tag);
            }

            // Give 'em the tag list
            return retval;
        }
        catch (PermissionDeniedError e)
        {
            // They didn't have permission to add a tag.
            throw new JsonRpcError(JsonRpcError.Error_PermissionDenied,
                    "Permission denied.");
        }
    }
}