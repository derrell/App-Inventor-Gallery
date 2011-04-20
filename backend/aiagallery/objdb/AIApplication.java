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
    private Key       key;

    /** Which visitor owns this application */
    @Persistent
    private Visitor   owner;

    /** Title of this application */
    @Persistent
    private String    title;

    /** Description of this application */
    @Persistent
    private String    description;
    
    /** Image 1 of this application */
    @Persistent
    private String    image1;

    /** Image 2 of this application */
    @Persistent
    private String    image2;

    /** Image 3 of this application */
    @Persistent
    private String    image3;

    /** List of previous authors (display names, since they're public) */
    @Persistent
    private List<String> previousAuthors;
    
    /** The uploaded source .zip file */
    @Persistent
    private String   source;
    
    /** The uploaded .apk file */
    @Persistent
    private String   apk;
    
    /** Time of last APK upload */
    @Persistent
    private String   uploadTime;
    
    /** Number of "Likes" */
    @Persistent
    private int      numLikes;
    
    /** Number of downloads */
    @Persistent
    private int      numDownloads;
    
    /** Number of times viewed */
    @Persistent
    private int      numViewed;
    
    /** Number of comments */
    @Persistent
    private int      numComments;
    
    /** List of tags associated with this application */
    @Persistent
    private List<Tag> tags;

    /** Status of this application */
    @Persistent
    private Status    status;

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
     * Set the first image for this application.
     * 
     * @param image1
     */
    public void setImage1(String image1)
    {
        this.image1 = image1;
    }

    /**
     * Retrieve the first image for this application
     * 
     * @return the image1
     */
    public String getImage1()
    {
        return image1;
    }

    /**
     * Set the second image for this application
     * 
     * @param image2
     */
    public void setImage2(String image2)
    {
        this.image2 = image2;
    }

    /**
     * Retrieve the second image for this applicaiton
     * 
     * @return the image2
     */
    public String getImage2()
    {
        return image2;
    }

    /**
     * Set the third image for this application
     * 
     * @param image3
     */
    public void setImage3(String image3)
    {
        this.image3 = image3;
    }

    /**
     * Retrieve the third image for this application
     * 
     * @return the image3
     */
    public String getImage3()
    {
        return image3;
    }

    /**
     * Set the list of previous authors
     * 
     * @param previousAuthors
     */
    public void setPreviousAuthors(List<String> previousAuthors)
    {
        this.previousAuthors = previousAuthors;
    }

    /**
     * Retrieve the list of previous authors
     * 
     * @return the previousAuthors
     */
    public List<String> getPreviousAuthors()
    {
        return previousAuthors;
    }

    /**
     * Save the source file data, encoded as Base64
     * 
     * @param source
     */
    public void setSource(String source)
    {
        this.source = source;
    }

    /**
     * Retrieve the Base64-encoded source file data
     * 
     * @return the source
     */
    public String getSource()
    {
        return source;
    }

    /**
     * Save the executable APK file data, encoded as Base64
     * 
     * @param apk
     */
    public void setApk(String apk)
    {
        this.apk = apk;
    }

    /**
     * Retrieve the Base64-encoded APK file data
     * 
     * @return the apk
     */
    public String getApk()
    {
        return apk;
    }

    /**
     * Set the time the current source file was uploaded
     * 
     * @param uploadTime
     */
    public void setUploadTime(String uploadTime)
    {
        this.uploadTime = uploadTime;
    }

    /**
     * Retrieve the time the current source file was uploaded
     * 
     * @return the uploadTime
     */
    public String getUploadTime()
    {
        return uploadTime;
    }

    /**
     * Increment the number of likes
     */
    public void incrLikes()
    {
        ++this.numLikes;
    }

    /**
     * Decrement the number of likes
     */
    public void decrLikes()
    {
        --this.numLikes;
    }

    /**
     * Retrieve the number of likes
     * @return the numLikes
     */
    public int getNumLikes()
    {
        return numLikes;
    }

    /**
     * Increment the number of downloads
     */
    public void incrDownloads()
    {
        ++this.numDownloads;
    }

    /**
     * Decrement the number of downloads
     */
    public void decrDownloads()
    {
        --this.numDownloads;
    }

    /**
     * @return the numDownloads
     */
    public int getNumDownloads()
    {
        return numDownloads;
    }

    /**
     * Increment the number of views
     */
    public void incrViewed()
    {
        ++this.numViewed;
    }

    /**
     * Decrement the number of views
     */
    public void decrViewed()
    {
        --this.numViewed;
    }

    /**
     * @return the numViewed
     */
    public int getNumViewed()
    {
        return numViewed;
    }

    /**
     * Increment the number of comments
     */
    public void incrComments()
    {
        ++this.numViewed;
    }

    /**
     * Decrement the number of comments
     */
    public void decrComments()
    {
        --this.numComments;
    }

    /**
     * @return the numComments
     */
    public int getNumComments()
    {
        return numComments;
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
            // FIXME -- doesn't Tag need to be made persistent?
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
}
