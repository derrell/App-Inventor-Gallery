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
 */

qx.Class.define("aiagallery.dbif.Entity",
{
  extend : rpcjs.dbif.Entity,
  
  statics :
  {
    registerEntityType    : rpcjs.dbif.Entity.registerEntityType,
    registerPropertyTypes : rpcjs.dbif.Entity.registerPropertyTypes,
    query                 : rpcjs.dbif.Entity.query
  }
});
