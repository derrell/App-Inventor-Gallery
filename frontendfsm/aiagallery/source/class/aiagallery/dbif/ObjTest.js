/**
 *
 * This is explicitly to test the SAME EXACT CODE of ObjSearch
 * but without a composite key.
 * 
 * 
 * 
 */

qx.Class.define("aiagallery.dbif.ObjTest",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function( key )
  {
    // Need all data for the key regardless, so might as well store it
    this.setData(
      {
        "appId" : key
      });

    // Use the composite of "word" and "appId" properties as the entity key
    this.setEntityKeyProperty("appId");
    
    // Call the superclass constructor
    this.base(arguments, "test", key);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "test");

    var databaseProperties =
      {
        /** The App in which this word appears */
        "appId"  : "Key"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("test",
                                                 databaseProperties,
                                                 "appId");
  }
});
