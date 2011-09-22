/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the individual application pages
 */
qx.Class.define("aiagallery.module.dgallery.appinfo.Gui",
{
  type : "singleton",
  extend : qx.core.Object,

  members :
  {
    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
    },


    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result; 
      var             commentData = rpcRequest.getUserData("commentData");

      // Create a panel containing a single comment to the GUI
      //
      // Comment will be shown as a 2-element vbox:
      // Top line: visitor: comment text
      // 2nd line: time stamp (grey, small)
      function createCommentPanel(comment)
      {
        // Comment info to be displayed
        // These are the 3 fields of interest to a viewer
        // (the rest is metadata -- app ID, tree ID, numChildren)
        var commentText = comment["text"];
        var commentAuthor = comment["visitor"];
        var commentTime = comment["timestamp"];
        // var treeId = comment["treeId"];

        // Top line
        var visitorAndComment =  '<b>' + commentAuthor + ': </b>' + commentText;
        var visitorAndCommentLabel = new qx.ui.basic.Label(visitorAndComment);
        visitorAndCommentLabel.set(
          {
            rich : true,
            wrap : true,
            selectable : true
          });

        // Timestamp, easier on the eye than the default.
        // (which could use some additional tweaking, perhaps)
        // FIXME: This needs to be internationalized. There are existing
        // functions to do so.
        var dateObj = new Date(commentTime);
        var dateString = dateObj.toDateString();
        var timeString = dateObj.getHours() + ":" + dateObj.getMinutes();
        var dateTimeString = dateString + " " + timeString + " ET"; 

        // 2nd line
        var postedStringStart = 
          '<span style="color:grey;font-size:75%">Posted: ';
        var postedString = postedStringStart + dateTimeString + '</span>';
        var postedStringLabel = new qx.ui.basic.Label(postedString);
        postedStringLabel.set(
          {
            rich : true,
            wrap : true,
            selectable : true
          });

        // Entire comment box
        var commentLayout = new qx.ui.layout.VBox();
        var commentBox = new qx.ui.container.Composite(commentLayout);
        // Thin grey solid border
        commentBox.setDecorator(new qx.ui.decoration.Single(1, 
                                                            'solid',
                                                            '#cccccc'));
        // Add the pieces
        commentBox.add(visitorAndCommentLabel);
        commentBox.add(postedStringLabel);
        
        // Return the box we just created.
        return commentBox;
      }


      if (response.type == "failed")
      {
        // FIXME: Add the failure to someplace reasonable, instead of alert()
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "getAppInfo":
  
        var                 vboxLeft;
        var                 vboxRight;
        var                 hbox;
        //var                 cpanel;
        var                 commentBox;

        // Get the result data. It's an object with all of the application info.
        result = response.data.result;
 
        // Sets the app's uid as a variable which can be passed to the FSM.
        var appId = result.uid;

        // Create a group for the comment collapsable panel
        var radiogroup = new qx.ui.form.RadioGroup();
        radiogroup.setAllowEmptySelection(true);

        // Create a horizontal box layout to store two vboxes in.
        var hboxLayout = new qx.ui.layout.HBox();

        // Add a nice little seperation between the two. 
        hboxLayout.setSpacing(4);

        // Apply the layout to a container then set some properties on it.
        hbox = new qx.ui.container.Composite(hboxLayout);
        hbox.setDecorator(new qx.ui.decoration.Single(3,'solid','#afafaf'));
        hbox.set( 
          {
            maxWidth:1024,
            width: 1024
          });

        // Create the left vertical box container.
        vboxLeft = new qx.ui.container.Composite(new qx.ui.layout.VBox());

        // Make it purty.
        vboxLeft.setBackgroundColor("#f3f3f3");

        // Add it to the horizontal box, with the flex property to use all
        // unused space.
        hbox.add(vboxLeft, { flex : 1 });

        // Create the right vertical box container.
        vboxRight = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      
        // Make it purty as well.
        vboxRight.setBackgroundColor("#f3f3f3");

        // Add it the horizontal box.
        hbox.add(vboxRight, { flex : 2 });
 
        // Store a nice title.
        var title = new qx.ui.basic.Label('<b style="font-size:25px">' +
                                          result.title + '</b>');

        // Set it to use rich formatting and center it in the vbox.
        title.set(
          {
            rich:true,
            alignX:"center"
          });

        // Add it to the left display.
        vboxLeft.add(title);

        // Create an image widget with the image1 image stored for the app.
        var appIcon = new qx.ui.basic.Image(result.image1);
      
        // Center it.
        appIcon.setAlignX("center");
    
        // Add it to the left display.
        vboxLeft.add(appIcon);

        // Create a label describing who created the app.
        var createdBy = new qx.ui.basic.Label('Created by <b>' +
                                              result.owner + '</b>');

        // Make it purty with rich formatting.
        createdBy.set(
          {
            rich:true 
          });

        // Center it.
        createdBy.setAlignX("center");

        // Add it to the left vbox.
        vboxLeft.add(createdBy);

        // Create a label to display number of views and likes.
        var viewsLikes = new qx.ui.basic.Label('<b>' +
                                               result.numViewed +
                                               ' views, ' +
                                               result.numLikes+
                                               ' likes</b>');

        // Set the viewsLikes label to use rich formatting.
        viewsLikes.set(
          {
            rich:true 
          });

        // Center the viewLikes label. 
        viewsLikes.setAlignX("center");

        // Add it to the left vbox.
        vboxLeft.add(viewsLikes);

        // Create a button to allow users to "like" things.
        // FIXME: Implement this
        var likeItButton = new qx.ui.form.Button("Like it!");

        // Add it to the left vbox.
        vboxLeft.add(likeItButton);

        // Create a button to allow users to "flag" things.
        // FIXME: Implement this
        var flagItButton = new qx.ui.form.Button("Flag it!");

        // Add it to the left vbox.
        vboxLeft.add(flagItButton);

       // Creates an object on which to call the getComments event, in order
       // to add them to the GUI
       var emptyObject = new qx.core.Object();
       emptyObject.setUserData("filler", new qx.core.Object());
       fsm.addObject("ignoreMe", emptyObject);
       fsm.fireImmediateEvent("appearComments", emptyObject, null);

       // Adds the textfield for entering a comment
       var commentInput = new qx.ui.form.TextField();
       commentInput.setPlaceholder("Type your comment here:");
        var allCommentsBox = 
          new qx.ui.container.Composite(new qx.ui.layout.VBox());

       // Wrapping everything relevant to a comment in one object,
       // to be passed to the FSM
       var commentWrapper = new qx.core.Object();
       commentWrapper.setUserData("appId", appId);
       commentWrapper.setUserData("commentInput", commentInput);
       fsm.addObject("commentWrapper", commentWrapper);

       // Adds the button for submitting a comment to the FSM
       var submitCommentBtn = new qx.ui.form.Button("Submit Comment");
       fsm.addObject("submitCommentBtn", submitCommentBtn);

       submitCommentBtn.addListener(
         "execute",
         function(e)
         {
           var comment = commentInput.getValue();
           // Checks that the submitted comment is not null or empty spaces
           if ((comment != null)
              && ((comment.replace(/\s/g, '')) != ""))
           // No: submit it
           {
             fsm.eventListener(e);
           }
           //Yes: clear input box and do nothing
           else
           {
             commentInput.setValue(null);
           }
         },
         fsm);
        
       // Lets the user call "execute" by pressing the enter key rather
       // than by pressing the submitCommentBtn
       commentInput.addListener(
         "keypress",
         function(e)
         {
           if (e.getKeyIdentifier() === "Enter")
           {
             submitCommentBtn.execute();
           }
         });

        // The textfield, all the existing comments, and the submit button
        // get added to the UI.
        vboxLeft.add(commentInput);
        vboxLeft.add(submitCommentBtn);
        vboxLeft.add(allCommentsBox);
 
       // We'll put all of the collapsable panels in a scroll container
        var scrollContainer = new qx.ui.container.Scroll();
        vboxLeft.add(scrollContainer);

        // Put a vbox container in the scroll container
        var vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        scrollContainer.add(vbox);

        // Create a label to represent a link to download the app.
        // FIXME: Add a link here
        var downloadLabel =
          new qx.ui.basic.Label('<b>Download ' + result.title + '!</b>');

        // Set it to use rich formatting
        downloadLabel.set(
          {
            rich:true 
          });

        // Add it to the right vbox.
        vboxRight.add(downloadLabel);

        // Create a label to store the number of downloads
        var download = new qx.ui.basic.Label(result.title +
                                             ' has been downloaded ' +
                                             result.numDownloads +
                                             ' times.');

        // Set it to use rich formatting and to wrap text.
        download.set(
          {
            rich:true,
            wrap:true
          });
        vboxRight.add(download);

        // Create a label just to space things out a bit.
        var spacer = new qx.ui.basic.Label('');

        // Add it to the right vbox.
        vboxRight.add(spacer);
        
        // Create a label to store the header "Description".
        var descriptionHeader = new qx.ui.basic.Label('<b>Description</b>');

        // Set it to use rich formatting.
        descriptionHeader.set(
          {
            rich:true 
          });

        // Add it to the right vbox.
        vboxRight.add(descriptionHeader);

        // Create a label to store the actual description of the app.
        var description = new qx.ui.basic.Label(result.description);

        // Set the label to use rich formatting and automatically wrap text.
        description.set(
          {
            rich:true,
            wrap:true
          });

        // Add it to the right vbox.
        vboxRight.add(description);

        // Create a label to use as a spacer.
        spacer = new qx.ui.basic.Label('');

        // Add it to the right vbox.
        vboxRight.add(spacer);

        // Create a label to store the "Tags" header
        var tagsHeader = new qx.ui.basic.Label('<b>Tags</b>');
        
        // Set it to use rich formatting.
        tagsHeader.set(
          {
            rich:true 
          });

        // Add it to the right vbox.
        vboxRight.add(tagsHeader);

        // Create a label with the actual tags.
        var tags = new qx.ui.basic.Label(result.tags);

        // Set it to use rich formatting.
        tags.set(
          {
            rich:true 
          });

        // Add it to the right vbox.
        vboxRight.add(tags);

        // Creates an object containing the parts of the GUI which will need 
        // to be changed after the fsm call. This object is passed to the FSM.

        var guiWrapper = new qx.core.Object();
        guiWrapper.setUserData("vbox", vbox);
        guiWrapper.setUserData("commentBox", commentBox);
        guiWrapper.setUserData("radiogroup", radiogroup);
        guiWrapper.setUserData("allCommentsBox", allCommentsBox);
        guiWrapper.setUserData("commentInput", commentInput);
        fsm.addObject("guiWrapper", guiWrapper);

        canvas.setLayout(new qx.ui.layout.HBox());
        
        canvas.add(new qx.ui.core.Widget(), { flex : 1 });
        canvas.add(hbox);
        canvas.add(new qx.ui.core.Widget(), { flex : 1 });
        break;

      case "addComment":
        // Get the result data. It's an object with all of the application info.
        result = response.data.result;

        // Gets the objects sent from the GUI to the FSM. 
        var guiInfo = rpcRequest.getUserData("guiInfo");
        vbox = guiInfo.getUserData("vbox");
        commentBox = guiInfo.getUserData("commentBox");
        radiogroup = guiInfo.getUserData("radiogroup");
        commentInput = guiInfo.getUserData("commentInput");
        allCommentsBox = guiInfo.getUserData("allCommentsBox");
        var newComment;
        var commentAuthor;
        var commentTime;
        var ty; 
        var replyBtn;
        var vbox2;
        var label2;
        var label;
        var newBox;

        // Adds the new comment to the GUI
        // Currently, the 'reply' and 'flag as inappropiate' buttons 
        // do not do anything
        newComment = result["text"];
        if (newComment != null) 
        {
          newBox = createCommentPanel(result);

          // Insert the new comment at the top of the list
          allCommentsBox.addAt(newBox, 0, null);

          // Following line confirmed to be needed--but why??
          vbox.add(newBox);
        }

        commentInput.setValue(null);
        break;

      case "getComments":
        // Get the result data. It's an object with all of the application info.
        result = response.data.result;

        // This alert shows that addComments is reusing uids 
//        alert("getComments result is: " +
//              qx.lang.Json.stringify(result));

        // Gets back the objects passed from the GUI to the FSM
        guiInfo = rpcRequest.getUserData("guiInfo");
        vbox = guiInfo.getUserData("vbox");       
        radiogroup = guiInfo.getUserData("radiogroup");
        allCommentsBox = guiInfo.getUserData("allCommentsBox");
        var len;
  
        // Adds the comments retrieved from the database to the GUI
        // Currently, the 'reply' and 'flag as inappropiate' buttons 
        // do not do anything
        ty = qx.lang.Type.getClass(result);
        if (ty == "Array") 
        {
          len = result.length;
          if (len != 0) 
          {
            for (var i = 0; i < result.length; ++i)
            {
              newComment = result[i]["text"];
              if (newComment != null)
              {
                newBox = createCommentPanel(result[i]);

                // Insert the new comment at the top of the list
                allCommentsBox.addAt(newBox, 0, null);

                // Following line confirmed to be needed--but why??
                vbox.add(newBox);
              }
            }
          }
        }   
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
