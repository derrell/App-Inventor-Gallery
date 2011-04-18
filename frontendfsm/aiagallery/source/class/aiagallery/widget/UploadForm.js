/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.UploadForm",
{
  properties :
  {
    
    /**
     * Function to call when form.send() is called. If it returns false, the
     * form will not be sent.
     */
    onsend:
    {
      check    : "Function",
      init     : null,
      nullable : true
    }
  },
  
  members :
  {
    // overridden
    send : function()
    {
      // If there's an onsend function available, then call it. If it returns
      // false, do not submit the form.
      var onsend = this.getOnsend();
      if (onsend && qx.lang.Function.bind(onsend, this)() === false)
      {
        return;
      }

      // The onsend function didn't tell us not to submit, so send normally.
      this.base(arguments);
    }
  }
});
