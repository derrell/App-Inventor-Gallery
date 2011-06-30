
/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjPermissionGroup",
{
  extend : aiagallery.dbif.Entity,
 
  construct : function(name)
  {
    var i;
    var permissionsArr = [];
    var dataObj = { "name" : name };
    
    // Build an array of permissions with any additional arguments
    for (i = 1; i < arguments.length; i++)
    {
      permissionsArr.push(arguments[i]);
    }
    
    // Were there any permissions?
    if ( i > 1 )
    {
     // Yes, add them to this entity's data
     dataObj["permissions"] = permissionArr;
    }
    
    // Give the entity its name and permissions list
    this.setData(dataObj);

    // Use the group's name as the DB key
    this.setEntityKeyProperty(name);
    
    // Call the superclass constructor
    this.base(arguments, "permissiongroup", keyArr);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname,
                                              "permissiongroup");

    var databaseProperties =
      {
        /** A list of names of RPC calls to which members of this group have
         *  access */   
        "permissions" : "StringArray",

        /** The name of this group, i.e. Administrator, guest, moderator etc. */
        "name"  : "Key"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("permissiongroup",
                                                 databaseProperties,
                                                 "name");
  }
});
