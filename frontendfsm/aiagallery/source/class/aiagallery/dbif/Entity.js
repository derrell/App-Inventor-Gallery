/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#use(aiagallery.dbif.ObjAppData)
#use(aiagallery.dbif.ObjComments)
#use(aiagallery.dbif.ObjDownloads)
#use(aiagallery.dbif.ObjFlags)
#use(aiagallery.dbif.ObjLikes)
#use(aiagallery.dbif.ObjTags)
#use(aiagallery.dbif.ObjVisitors)
#use(aiagallery.dbif.ObjSearch)

#use(aiagallery.dbif.ObjTest)
 */

qx.Class.define("aiagallery.dbif.Entity",
{
  extend : rpcjs.dbif.Entity,
  
  construct : function(entityType, entityKey)
  {
    // Call the superclass constructor
    this.base(arguments, entityType, entityKey);
  },

  statics :
  {
    registerEntityType    : null,
    registerPropertyTypes : null,
    query                 : null
  },
  
  defer : function()
  {
    // Point our own statics at our superclass' statics
    aiagallery.dbif.Entity.registerEntityType =
      rpcjs.dbif.Entity.registerEntityType;
    aiagallery.dbif.Entity.registerPropertyTypes = 
      rpcjs.dbif.Entity.registerPropertyTypes;
  }
});
