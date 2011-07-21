/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.CommentsTest",
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
      
      
      this.assert(myCommentData.treeId.length >= 12, "threading working");
      
      var retrievedComment = new aiagallery.dbif.ObjComments(0);
      
      this.assertObject(retrievedComment, "Comment instantiated");
      this.assertFalse(retrievedComment.getBrandNew(), "comment retrieved from db");
      
      var commentsArrLength = dbifSim.getComments(105).length ;
      
      this.assert(commentsArrLength >= 3, "getComments() good input");
      this.assert(dbifSim.getComments(-1).length == 0, "getComments() bad input");

      this.assert(dbifSim.deleteComment(myCommentData.uid), "last comment deleted, supposedly");
      this.assert(dbifSim.getComments(105).length == commentsArrLength - 1, "last comment deleted successfully");
      
      var firstRandomDeletion = dbifSim.deleteComment(1); // May or may not have deleted something, don't care
      var secondDeletionSame = dbifSim.deleteComment(1); // Def. shouldn't delete anything
      
      this.assertFalse(secondDeletionSame, "bad deleteComment() input, hopefully no deletion");
      
    }
  }
});
