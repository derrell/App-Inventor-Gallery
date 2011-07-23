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
    
    // Give the entity its name, and a simple description
    this.setData(
      {
        "name"        : name,
        "description" : name
      });

    // Use the group's name as the DB key
    this.setEntityKeyProperty(name);
    
    // Call the superclass constructor
    this.base(arguments, "permissiongroup", name);
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
        
        /** A simple description of the group, i.e. "The all powerful Admin" */
        "description" : "String",

        /** The name of this group, i.e. Administrator, guest, moderator etc */
        "name"  : "Key"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("permissiongroup",
                                                 databaseProperties,
                                                 "name");
  }
});
