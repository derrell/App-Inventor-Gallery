/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery.objdb;

import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.datastore.Key;

/**
 * Authenticated visitors may upload applications, each of which is identified
 * by an object of this type.
 */
@PersistenceCapable
public class AIApplication
{
    /** primary key for this application, auto-generated */
    @SuppressWarnings("unused")
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key          key;
    
    /** Title of this application */
    @Persistent
    private String       title;
    
    /** Description of this application */
    private String       description;
    
    /** Status of this application */
    @Persistent
    private Status       status;

    /** Which visitor owns this application */
    @Persistent
    private Visitor      owner;

    /** List of tags associated with this application */
    @Persistent
    private List<Tag>    tags;

    /** The uploaded source .zip file */
    @Persistent
    private BlobKey      sourceZip;
    
    /** The uploaded .apk file */
    @Persistent
    private BlobKey      apk;

    /** The uploaded thumbnail shown for this application */
    @Persistent
    private BlobKey      thumbnail;

    /**
     * Set the title of this object
     * 
     * @param title
     */
    public void setTitle(String title)
    {
        this.title = title;
    }

    /**
     * Retrieve the title of this object
     * 
     * @return the object's title
     */
    public String getTitle()
    {
        return title;
    }

    /**
     * Set the description of this object
     * 
     * @param description
     */
    public void setDescription(String description)
    {
        this.description = description;
    }

    /**
     * Retrieve the description of this object
     * 
     * @return the object's description
     */
    public String getDescription()
    {
        return description;
    }

    /**
     * Set the status value of this object
     * 
     * @param status
     */
    public void setStatus(Status status)
    {
        this.status = status;
    }

    /**
     * Retrieve the status value of this object
     * 
     * @return the object's current status
     */
    public Status getStatus()
    {
        return status;
    }

    /**
     * Set the owner of this object
     * 
     * @param owner
     */
    public void setOwner(Visitor owner)
    {
        this.owner = owner;
    }

    /**
     * Retrieve the owner of this object
     * 
     * @return the object's owner
     */
    public Visitor getOwner()
    {
        return owner;
    }

    /**
     * Add a tag to this apk object
     * 
     * @param tagName
     *        The name of the tag to be added
     */
    public void addTag(String tagName, String description)
    {
        // We want only one copy of each tag. If the list doesn't
        // already contain this tag...
        if (this.tags.indexOf(tagName) == -1)
        {
            // ... then add this tag to the list.
            this.tags.add(new Tag(tagName, description));
        }
    }

    /**
     * Determine if an apk object has a particular tag
     * 
     * @param tagName
     *        The name of the tag to be tested
     * 
     * @return true if the object has said tag; false otherwise
     */
    public Boolean hasTag(String tagName)
    {
        return this.tags.indexOf(tagName) >= 0;
    }

    /**
     * Get the tag list for this object
     * 
     * @return tagName The list of currently-assigned tags
     */
    public List<Tag> getTags()
    {
        return this.tags;
    }

    /**
     * Set the blob key of the uploaded source zip file
     * 
     * @param sourceZip
     *   The blob key of the uploaded source zip file
     */
    public void setSourceZip(BlobKey sourceZip)
    {
        this.sourceZip = sourceZip;
    }

    /**
     * Retrieve the blob key of the uploaded source zip file
     * 
     * @return the blob key of the uploaded source zip file
     */
    public BlobKey getSourceZip()
    {
        return sourceZip;
    }

    /**
     * Set the blob key of this object's apk file
     *  
     * @param apk
     *   The blob key of the uploaded binary apk file
     */
    public void setApk(BlobKey apk)
    {
        this.apk = apk;
    }

    /**
     * Retrieve the blob key of this object's apk file
     * 
     * @return this object's apk file blob key
     */
    public BlobKey getApk()
    {
        return apk;
    }

    /**
     * Set the blob key of this object's thumbnail file
     * 
     * @param thumbnail
     */
    public void setThumbnail(BlobKey thumbnail)
    {
        this.thumbnail = thumbnail;
    }

    /**
     * Retrieve the blob key of this object's thumbnail file
     * 
     * @return this object's thumbnail file blob key
     */
    public BlobKey getThumbnail()
    {
        return thumbnail;
    }
}
