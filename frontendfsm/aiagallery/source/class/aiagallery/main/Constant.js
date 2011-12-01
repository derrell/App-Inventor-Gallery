/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Constants needed by the application
 */
qx.Class.define("aiagallery.main.Constant",
{
  statics :
  {
    SERVICES_URL : "/rpc",
    MAX_IMAGE_FILE_SIZE : 2097152, //2 megabytes
    VALID_IMAGE_ARRAY : ["image/gif", "image/jpeg", "image/png"] //valid image uploads
  }
});
