/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */
package aiagallery.objdb;

import javax.jdo.JDOHelper;
import javax.jdo.PersistenceManagerFactory;

/**
 * Singleton class for instantiating one and only one persistence manager
 * factory instance.
 */
public final class UniquePersistenceManagerFactory
{
    // Instantiate our one and only persistence manager factory
    // FIXME! Why are transactions optional?
    private static final PersistenceManagerFactory pmf = JDOHelper
                                                               .getPersistenceManagerFactory("transactions-optional");

    // No one should instantiate this class. This is a singleton.
    private UniquePersistenceManagerFactory()
    {
    }

    /**
     * Static method to get the one and only persistence manager factory
     * instance.
     * 
     * @return The single persistence manager factory instance
     */
    public static PersistenceManagerFactory getInstance()
    {
        // Give 'em what they came for
        return pmf;
    }
}
