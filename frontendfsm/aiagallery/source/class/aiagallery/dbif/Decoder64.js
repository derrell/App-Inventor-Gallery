/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.Decoder64",
{
  extend  : qx.core.Object,
  type    : "singleton",

  construct : function()
  {    
      
  },
  
  defer : function()
  {
  },

  members :
  {
    getDecodedURL : function(appId, base64field)
    {
      // NEEDS DOCUMENTING
      var myObj = new aiagallery.dbif.ObjAppData(parseInt(appId,10));
      var fieldContent = myObj.getData()[base64field];
      var mimeType = fieldContent.substring(5, fieldContent.indexOf(";"));
      var contents = fieldContent.substring(fieldContent.indexOf(",") + 1);
      var decodedContents = qx.util.Base64.decode(contents);
      return {mime: mimeType, content: decodedContents};
        
    }
  }

});
