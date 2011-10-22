/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MLiking",
{
  construct : function()
  {

    this.registerService("likesPlusOne",
                         this.likesPlusOne,
                         [ "appId" ]);
  },

  statics :
  {

  },

  members :
  {
    /**
     *  Add one to the number of times this app has been liked
     * 
     * @param appId {Integer}
     *   This is either a string or number which is the uid of the app which is
     *   being liked.
     * 
     * @return {Integer || Error}
     *   This is the number of times this app has been liked, or an error if
     *   the app was not found 
     * 
     */
    likesPlusOne : function(appId, error)
    {
      var            appObj;
      var            appDataObj;
      var            visitorAppUnique;

      visitorAppUnique = true;
      var whoami = this.getWhoAmI();
      
      appObj = new aiagallery.dbif.ObjAppData(appId);
      
      appDataObj = appObj.getData();
      
      if (appObj.getBrandNew())
      {
        error.setCode(1);
        error.setMessage("App with that ID not found. Unable to like.");
        return error;
      }
      
      //Query database to figure out
      //1. Has this appId been liked by this visitor before?
      //if NOT then:
      //  a:allow code to run (numlikes++)
      //  b:add new objlikes data into database (visitor/app) pair
      //ELSE then:
      //  a:set to false...(don't increment)
      

      //query
      var crit = {
	  type: "op",
	  method: "and",
	  children : [
      {
	  type: "element",
	  field: "app",
	  value: appId
      },
      {
	  type: "element",
	  field: "visitor",
	  value: whoami.email

      }]};


var data = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjLikes",crit);



if (data.length == 0 ) {


    var likes = new aiagallery.dbif.ObjLikes();
    
    likes.setData({
	    visitor:whoami.email,
	    app:appId});

    likes.put();
    


} else {
    visitorAppUnique = false;

}


this.info("DATAFROMDB: [" + data + "]");



      if (visitorAppUnique == true) {


      appDataObj.numLikes++;
      
      appObj.put();

      }

      return appDataObj.numLikes;
    }
  }
});
