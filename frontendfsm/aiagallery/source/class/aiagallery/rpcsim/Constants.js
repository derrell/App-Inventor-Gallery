/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.rpcsim.Constants",
{
  extend  : qx.core.Object,

  statics :
  {
    Status      : 
    {
      Banned  : 0,
      Pending : 1,
      Active  : 2
    }
  }
});
