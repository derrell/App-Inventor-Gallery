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
  
    dbifSim : null,
      
    setUp : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.      
      this.dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
    },
    
    "test: Addition, retrieval, and deletion of comment" : function()
    {
      // FIXME: NEEDS LOTS OF WORK
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");
      
      var myCommentData = this.dbifSim.addComment(105,
                                                  "Hellooo",
                                                  null,
                                                  error);
      
      var myCommentData = this.dbifSim.addComment(105,
                                                  "Hiiii",
                                                  myCommentData.treeId,
                                                  error);
      
      var myCommentData = this.dbifSim.addComment(105,
                                                  "What's uuuuup",
                                                  myCommentData.treeId,
                                                  error);
      
                                                     
      this.assert(myCommentData.treeId.length >= 12, "threading working");
      
      var retrievedComment = new aiagallery.dbif.ObjComments([105, "0000"]);
      
      this.assertObject(retrievedComment, "Comment instantiated");
      this.assertFalse(retrievedComment.getBrandNew(), "comment retrieved from db");
      
      var commentsArrLength = this.dbifSim.getComments(105).length ;
      
      this.assert(commentsArrLength >= 3, "getComments() good input");
      this.assert(this.dbifSim.getComments(-1).length == 0, "getComments() bad input");

      this.assert(this.dbifSim.deleteComment(105, myCommentData.treeId), "last comment deleted, supposedly");
      this.assert(this.dbifSim.getComments(105).length == commentsArrLength - 1, "last comment deleted successfully");
      
      var firstRandomDeletion = this.dbifSim.deleteComment(1); // May or may not have deleted something, don't care
      var secondDeletionSame = this.dbifSim.deleteComment(1); // Def. shouldn't delete anything
      
      this.assertFalse(secondDeletionSame, "bad deleteComment() input, hopefully no deletion");
      
    }
  }
});
