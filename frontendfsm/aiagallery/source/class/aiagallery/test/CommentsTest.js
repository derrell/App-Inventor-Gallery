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
      var             test;
      var             myCommentData;
      var             appId = 105;
      var             appObj = new aiagallery.dbif.ObjAppData(appId);
      var             appNumComments = appObj.getData().numComments;
      var             appNumRootComments = appObj.getData().numRootComments;
      var             secondCommentData;
      var             query = rpcjs.dbif.Entity.query;
      
      var getApp = qx.lang.Function.bind(function(appId)
      {
        var o = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjAppData", appId);
        this.assertArray(o, "getApp(" + appId + ")");
        this.assert(o.length === 1, "getApp(" + appId + ") length=" + o.length);
        return o[0];
      },
      this);

      var getComment = qx.lang.Function.bind(function(appId, treeId)
      {
        var o = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjComments",
                                        [ appId, treeId ]);
        this.assertArray(o, "getComment(" + appId + ", " + treeId + ")");
        this.assert(o.length === 1,
                    "getComment(" + appId + ", " + treeId + ") " +
                    "length=" + o.length);
        return o[0];
      },
      this);

      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");

      // Add the first comment
      myCommentData = this.dbifSim.addComment(appId, "Hellooo", null, error);
      
      // Save this top-level comment's tree id for later retrieval.
      var topLevelCommentTreeId = myCommentData.treeId;
      
      // Did the parent app's numComments get incremented correctly?
      this.assertEquals(
        appNumComments + 1,
        getApp(appId).numComments,
        "numComments being incremented");
      
      secondCommentData = this.dbifSim.addComment(appId,
                                                  "Hiiii",
                                                  myCommentData.treeId,
                                                  error);
      
      // Did the parent app's numComments get incremented correctly?
      this.assertEquals(appNumComments + 2,
                        getApp(appId).numComments, 
                        "numComments being incremented");
      
      myCommentData = this.dbifSim.addComment(appId,
                                              "What's uuuuup",
                                              secondCommentData.treeId,
                                              error);
      
      // Did the parent app's numComments get incremented correctly?
      this.assertEquals(appNumComments + 3,
                        getApp(appId).numComments, 
                        "numComments being incremented");
      
      // Did the parent's numRootComments increment correctly?
      this.assertEquals(appNumRootComments + 1,
                        getApp(appId).numRootComments,
                        "numRootComments being incremented");
      
      // Did the second comment's numChildren get incremented by the third?
      secondCommentData = getComment(appId, secondCommentData.treeId);
      this.assertEquals(1,
                        secondCommentData.numChildren,
                        "comment's numChildren incremented correctly");
      
      // Did treeId with three levels of threading get to the right length?
      this.assert(myCommentData.treeId.length >= 12, "threading working");
      
      // Retrieve the top-level comment
      var retrievedComment =
        new aiagallery.dbif.ObjComments([ appId, topLevelCommentTreeId ]);
      
      // Ensure we got an object
      this.assertObject(retrievedComment, "Comment instantiated");
      
      // Ensure that it is not brand new
      this.assertFalse(retrievedComment.getBrandNew(),
                       "first comment retrieved from db");
      
      // Did this top level comment get its numChildren properly incremented?
      this.assertEquals(1,
                        retrievedComment.getData().numChildren,
                        "comment numChildren incremented");
      
      // Call the getComments() RPC and save the length of the result.
      var commentsArrLength = this.dbifSim.getComments(appId).length ;
      
      // We added 3, so there should be at least 3
      this.assert(commentsArrLength >= 3, "getComments() good input");
      
      // With an invalid appId, we should get no results
      this.assert(this.dbifSim.getComments(-1).length == 0,
                  "getComments() bad input");

      // Retrieve the third comment
      var third = new aiagallery.dbif.ObjComments([appId,
                                                   myCommentData.treeId]);
      
      // Ensure that it is not brand new
      this.assertFalse(third.getBrandNew(),
                       "third comment retrieved from db");
      
      // Delete the third comment
      test = this.dbifSim.deleteComment(appId, myCommentData.treeId);
      this.assertTrue(test, "last comment deleted, supposedly");
      
      // Ensure that there is now one fewer comment
      test = this.dbifSim.getComments(appId);
      this.assert(test.length == commentsArrLength - 1,
                  "last comment deleted successfully");
      
      // Ensure that the App numRootComments and numComments are decremented
      this.assert(getApp(appId).numComments == appNumComments + 2,
                  "numComments decremented on deletion");
      
      this.assert(getApp(appId).numRootComments == appNumRootComments + 1,
                 "numRootComments not affected on deletion");

      // May or may not have deleted something, don't care
      var firstRandomDeletion = this.dbifSim.deleteComment(appId + 50, "0000");

      // Def. shouldn't delete anything
      var secondDeletionSame = this.dbifSim.deleteComment(appId + 50, "0000");
                                 
      this.assertFalse(secondDeletionSame,
                       "bad deleteComment() input, hopefully no deletion");
    },
    
    "test: Retrieve comment with invalid appId" : function()
    {
      var             test;
      var             validAppId = 101;
      var             invalidAppId = "1";
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");

      // Add a comment
      this.dbifSim.addComment(validAppId, "Hello world", null, error);
      
      test = this.dbifSim.getComments(validAppId);
      this.assertEquals(1, 
                        test.length,
                        "Results received because appId was valid");

      test = this.dbifSim.getComments(invalidAppId);
      this.assertEquals(0,
                        test.length,
                        "No results because appId was invalid");
    }    
  }
});
