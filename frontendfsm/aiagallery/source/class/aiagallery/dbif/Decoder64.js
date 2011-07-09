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

  statics :
  {
    getDecodedURL : function(appId, base64field)
    {
      var           myObj;
      var           fieldContent;
      var           mimeType;
      var           contents;
      var           decodedContents;
      
      // Get an instance of the object whose field is requested
      myObj = new aiagallery.dbif.ObjAppData(parseInt(appId,10));
      
      // Get the contents of that field
      fieldContent = myObj.getData()[base64field];
      
      // Was there any data in the field?
      if (!fieldContent)
      {
        // No, return null and let the caller decide how to handle that.
        return null;
      }
      // Parse out the mimeType. This always starts at index 5 and ends with a 
      // semicolon
      mimeType = fieldContent.substring(5, fieldContent.indexOf(";"));
      
      // Parse out the actual url
      contents = fieldContent.substring(fieldContent.indexOf(",") + 1);
      
      // Send the url to the decoder function
      decodedContents = qx.util.Base64.decode(contents, true);
      
      // Give 'em what they want
      return {mime: mimeType, content: decodedContents};
        
    }
  }

});
