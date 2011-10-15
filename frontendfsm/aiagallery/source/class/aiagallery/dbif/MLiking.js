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
      var            ObjLikes;
      var            queryCriteria;
      var            queryAndRespond;
      var            data;
      appObj = new aiagallery.dbif.ObjAppData(appId);
      
      appDataObj = appObj.getData();
      
      if (appObj.getBrandNew())
      {
        error.setCode(1);
        error.setMessage("App with that ID not found. Unable to like. :(");
        return error;
      }
           queryCriteria = {

    type : "op",

    method : "and", 

                children : [

      {

                              type: "element",

                              field: "app",

                              value: appId

                  }, 

                        {

                              type: "element",

                             field: "visitor",

                              value: this.whoAmI().email  

                      }
                     ]
                    }; 



      //query and respond

      queryAndRespond = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjLikes", queryCriteria);



      //query and see if it has an element


      if (queryAndRespond.length == 1){


            return appDataObj.numLikes;

      }



      //create and add an ObjLikes object to the database

      ObjLikes = new aiagallery.dbif.ObjLikes();


      data = {

            "app"     :    appId,

            "visitor" :    this.whoAmI().email

      }; 


      appDataObj.numLikes++;
      ObjLikes.setData(data); 
      ObjLikes.put(); 
      appObj.put();

      return appDataObj.numLikes;
    }
  }
}
);
