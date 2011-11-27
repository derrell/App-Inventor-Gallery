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
      var           name = null;
      var           ret;
      
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
        
        // Also specify the file name
        name = myObj.getData()[base64field + "FileName"];
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

      if (base64field == "apk")
      {
        // Disregard the MIME type of the uploaded APK file and use one that
        // the phone knows how to translate into a request ot open the Install
        // Application app.
        mimeType = "application/vnd.android.package-archive";
      }
      else
      {
        // Parse out the mimeType. This always starts at index 5 and ends with
        // a semicolon
        mimeType = fieldContent.substring(5, fieldContent.indexOf(";"));
      }
      
      // Parse out the actual url
      contents = fieldContent.substring(fieldContent.indexOf(",") + 1);
      
      // Send the url to the decoder function
      decodedContents = aiagallery.dbif.Decoder64.__decode(contents);
      
      // Give 'em what they want
      ret =
        {
          mime    : mimeType,
          content : decodedContents
        };
      
      // If there's a file name...
      if (name)
      {
        // ... then add it too
        ret.name = name;
      }
      
      // Give 'em what they came for
      return ret;
    },

    /**
     * Copyright: Dr Alexander J Turner - all rights reserved.
     * Please feel free to use this any way you want as long as you
     * mention I wrote it!
     * 
     * Modification history:
     *   - Sept. 2011, Derrell Lipman
     *     Converted to static method in qooxdoo class
     */
    __decode : function(encStr)
    {
      var             i;
      var             l;
      var             c;
      var             el;
      var             ar2;
      var             bits24;
      var             decStr;
      var             linelen;
      var             decArray;
      var             base64chars;
      var             base64charToInt;
      
      base64chars = 
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      base64charToInt = {};
      for (var i = 0; i < 64; i++)
      {
        base64charToInt[base64chars.substr(i,1)] = i;
      }

      encStr = encStr.replace(/\s+/g, "");
      decStr = "";
      decArray = [];
      linelen = 0;
      el = encStr.length;
      
      for (i = 0; i < el; i += 4) 
      {
        bits24  = ( base64charToInt[encStr.charAt(i)] & 0xFF  ) <<  18;
        bits24 |= ( base64charToInt[encStr.charAt(i+1)] & 0xFF  ) <<  12;
        bits24 |= ( base64charToInt[encStr.charAt(i+2)] & 0xFF  ) <<   6;
        bits24 |= ( base64charToInt[encStr.charAt(i+3)] & 0xFF  ) <<   0;
        decStr += String.fromCharCode((bits24 & 0xFF0000) >> 16);

        if (encStr.charAt(i + 2) != '=')  // check for padding character =
        {
          decStr += String.fromCharCode((bits24 &   0xFF00) >>  8);
        }

        if (encStr.charAt(i + 3) != '=')  // check for padding character =
        {
          decStr += String.fromCharCode((bits24 &     0xFF) >>  0);
        }

        if (decStr.length>1024)
        {
          decArray.push(decStr);
          decStr='';
        }
      }

      if (decStr.length>0)
      {
        decArray.push(decStr);
      }

      ar2 = [];

      while (decArray.length > 1)
      {
        l=decArray.length;
        for(c = 0; c < l; c += 2)
        {
          if (c + 1 == l)
          {
            ar2.push(decArray[c]);
          }
          else
          {
            ar2.push('' +decArray[c] + decArray[c+1]);
          }
        }
        decArray = ar2;
        ar2 = [];
      }
      
      return decArray[0];
    }
  }
});
