/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.MCommentsTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testAddAndDeleteComment : function()
    {
      // FIXME: NEEDS LOTS OF WORK
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      var myCommentData = dbifSim.addComment(105,
                                             "Hellooo",
                                             null);
      
      var myCommentData = dbifSim.addComment(105,
                                             "Hiiii",
                                             myCommentData.uid);
      
      var myCommentData = dbifSim.addComment(105,
                                             "What's uuuuup",
                                             myCommentData.uid);
      
      

      console.log(new aiagallery.dbif.ObjComments(0));
      console.log(dbifSim.getComments(105));
      console.log(myCommentData.uid);
    }
  }
});
