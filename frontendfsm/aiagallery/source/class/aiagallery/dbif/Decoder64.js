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
      var           blobIds;
      
      // Get an instance of the object whose field is requested
      myObj = new aiagallery.dbif.ObjAppData(parseInt(appId,10));
      
      switch(base64field)
      {
      case "source":
      case "apk":
        // Get the contents of that field, which, if it exists, is a blob id
        blobIds = myObj.getData()[base64field];

        // Was there any data in the field?
        if (! blobIds)
        {
          // No, return null and let the caller decide how to handle that.
          return null;
        }

        // Retrieve the blob data, which is the base64-encoded data. We want
        // the most recent entry, so use index 0.
        fieldContent = rpcjs.dbif.Entity.getBlob(blobIds[0]);
        break;
        
      default:
        // Retrieve the field data, which is the base64-encoded data
        fieldContent = myObj.getData()[base64field];
        break;
      }
      
      // Was there any blob data?
      if (! fieldContent)
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
