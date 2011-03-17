/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery.objdb;

/**
 * Values available for the status field of other objects
 */
public enum Status
{
    //
    // generally applicable to ApkData, Visitor, etc. objects
    //

    /** Removed from use, but not deleted */
    Banned,

    /** Awaiting moderator approval */
    PendingApproval,

    /** Available for use */
    Active,

    //
    // specific to ApkData objects
    //

    /** Application or thumbnail is uploading; not yet fully available */
    Uploading
}
