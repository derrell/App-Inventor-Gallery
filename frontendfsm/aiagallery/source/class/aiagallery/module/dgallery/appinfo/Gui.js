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

// vvvvvvv COMMENTS vvvvvvv
      // Add panel containing a single comment to the GUI
      // comment: the comment object to be added
      //
      // Comment will be shown as a 2-element vbox:
      // Top line: visitor: comment text
      // 2nd line: time stamp (grey, small)

      function addCommentPanel(comment)
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

        // Insert the new comment at the top of the list
        allCommentsBox.addAt(commentBox, 0, null);
        // Following line confirmed to be needed--but why??
        vbox.add(allCommentsBox);
      }
// ^^^^^^^ COMMENTS ^^^^^^^


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

// vvvvvvv COMMENTS vvvvvvv
        // Create a group for the comment collapsable panel
        var radiogroup = new qx.ui.form.RadioGroup();
        radiogroup.setAllowEmptySelection(true);
// ^^^^^^^ COMMENTS ^^^^^^^

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

/*
        // Make it take up between 200 and 400 pixels of space.
        vboxRight.set(
          {
            width:400,
            maxWidth:400
          });
*/
          
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

	// Save the numbers of views and likes
	this.numViewed = result.numViewed;
	this.numLikes = result.numLikes;
  

        // Create a label to display number of views and likes.
	this.viewsLikes = new qx.ui.basic.Label();
	this.__updateViewsAndLikes();
	
        // Set the viewsLikes label to use rich formatting.
        this.viewsLikes.set(
          {
            rich:true 
          });

        // Center the viewLikes label. 
        this.viewsLikes.setAlignX("center");

        // Add it to the left vbox.
        vboxLeft.add(this.viewsLikes);

        // Create a button to allow users to "like" things.
        // FIXME: Implement this
        var likeItButton = new qx.ui.form.Button("Like it!");
	  fsm.addObject("likeItButton", likeItButton);
	  likeItButton.addListener("execute", fsm.eventListener, fsm);

        // Add it to the left vbox.
        vboxLeft.add(likeItButton);

        // Create a button to allow users to "flag" things.
        // FIXME: Implement this
        var flagItButton = new qx.ui.form.Button("Flag it!");

        // Add it to the left vbox.
        vboxLeft.add(flagItButton);

// vvvvvvv COMMENTS vvvvvvv
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
// ^^^^^^^ COMMENTS ^^^^^^^

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

// vvvvvvv COMMENTS vvvvvvv
        // Creates an object containing the parts of the GUI which will need 
        // to be changed after the fsm call. This object is passed to the FSM.

        var guiWrapper = new qx.core.Object();
        guiWrapper.setUserData("vbox", vbox);
        guiWrapper.setUserData("commentBox", commentBox);
        guiWrapper.setUserData("radiogroup", radiogroup);
        guiWrapper.setUserData("allCommentsBox", allCommentsBox);
        guiWrapper.setUserData("commentInput", commentInput);
        fsm.addObject("guiWrapper", guiWrapper);
// ^^^^^^^ COMMENTS ^^^^^^^

        canvas.setLayout(new qx.ui.layout.HBox());
        
        canvas.add(new qx.ui.core.Widget(), { flex : 1 });
        canvas.add(hbox);
        canvas.add(new qx.ui.core.Widget(), { flex : 1 });

/*
        var             o;
        var             groupbox;
        var             appInfoContainer;
        var             commentContainer;
        var             scrollContainer;
        var             vbox;
        var             splitpane;
        var             radiogroup;
        var             commentBox;
        var             text;
        var             label;

        // Get the result data. It's an object with all of the application info.
        result = response.data.result;

        // Add a groupbox with the application title
        groupbox = new qx.ui.groupbox.GroupBox(result.title);
        groupbox.setLayout(new qx.ui.layout.Canvas());
        canvas.setLayout(new qx.ui.layout.Canvas());
        canvas.add(groupbox, { edge : 10 });

        // Create a grid layout for the application info
        var layout = new qx.ui.layout.Grid(10, 10);
        layout.setColumnAlign(0, "right", "middle");
        layout.setColumnAlign(1, "left", "middle");
        layout.setColumnAlign(2, "left", "middle");

        layout.setColumnWidth(0, 200);
        layout.setColumnWidth(1, 200);
        layout.setColumnWidth(2, 200);

        layout.setSpacing(10);

        // Create a container for the application info, and use the grid layout.
        appInfoContainer = new qx.ui.container.Composite(layout);
        

        // Yes. We'll create a splitpane, with the application info on the
        // left, and comment viewing on the right.
        splitpane = new qx.ui.splitpane.Pane("horizontal");
        groupbox.add(splitpane, { edge : 10 });

         
        // Add the application info container to the splitter
        splitpane.add(appInfoContainer, 1);

        // Create a group for the comment collapsable pannel
        radiogroup = new qx.ui.form.RadioGroup();
        radiogroup.setAllowEmptySelection(true);
          
        // We'll put all of the collapsable panels in a scroll container
        scrollContainer = new qx.ui.container.Scroll();
        splitpane.add(scrollContainer, 1);
          
        // Put a vbox container in the scroll container
        vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        scrollContainer.add(vbox);

       // Sets the app's uid as a variable which can be passed to the FSM
       var appId = result.uid;

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
           // Is the submitted comment null, or empty spaces?
           if ((comment != null) 
              && ((comment.replace(/\s/g, '')) != ""))
           // No: submit it
           {
             fsm.eventListener(e);
           }
           // Yes: clear input box and do nothing
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
        vbox.add(commentInput);
        vbox.add(submitCommentBtn);
        vbox.add(allCommentsBox); 

        // Creates an object containing the parts of the GUI which will need 
        // to be changed after the fsm call. This object is passed to the FSM.
        var guiWrapper = new qx.core.Object();
        guiWrapper.setUserData("vbox", vbox);
        guiWrapper.setUserData("cpanel", cpanel);
        guiWrapper.setUserData("radiogroup", radiogroup);
        guiWrapper.setUserData("commentInput", commentInput);
        guiWrapper.setUserData("allCommentsBox", allCommentsBox);
        fsm.addObject("guiWrapper", guiWrapper);


        appInfoContainer.add(new qx.ui.basic.Image(result.image1),
                             { row : 1, column : 1 });
        appInfoContainer.add(new qx.ui.basic.Image(result.image2),
                             { row : 1, column : 0 });
        appInfoContainer.add(new qx.ui.basic.Image(result.image3),
                             { row : 1, column : 2 });
        
        appInfoContainer.add(new qx.ui.basic.Label("Description: "),
                             { row : 2, column : 0 });
        o = new qx.ui.basic.Label(result.description);
        o.set(
          {
            rich : true,
            wrap : true
          });
        appInfoContainer.add(o,
                             { row : 2, column : 1, colSpan : 3 });
        
        [
          { label : "Owner",     data : result.owner,        row : 3 },
          { label : "Uploaded",  data : result.uploadTime,   row : 4 },
          { label : "Tags",      data : result.tags,         row : 5 },
          { label : "Status",    data : result.status,       row : 6 },
          { label : "Likes",     data : result.numLikes,     row : 7 },
          { label : "Downloads", data : result.numDownloads, row : 8 },
          { label : "Views",     data : result.numViewed,    row : 9 },
          { label : "Comments",  data : result.numComments,  row : 10 }
        ].forEach(
          function(field)
          {
            appInfoContainer.add(new qx.ui.basic.Label(field.label + ": "),
                                 { row : field.row, column : 0 });
            appInfoContainer.add(new qx.ui.basic.Label(field.data + ""),
                                 { row : field.row, column : 1, colSpan : 2 });
          });
*/
        break;



// vvvvvvv COMMENTS vvvvvvv
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

        // Adds the new comment to the GUI
        // Currently, the 'reply' and 'flag as inappropiate' buttons 
        // do not do anything
        newComment = result["text"];
        if (newComment != null) 
        {
          addCommentPanel(result);
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
                addCommentPanel(result[i]);
              }
            }
          }
        }   
        break;

      case "likesPlusOne":
	  // Get the result data.  It's an object with all of the application
	  // info.
	  result = response.data.result;

	  // Set the number of likes according to the return value
	  this.numLikes = result;

	  // Update the display
	  this.__updateViewsAndLikes();
	  break;

// ^^^^^^^ COMMENTS ^^^^^^^

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    },

    /*
     * Update the number of views and likes based on the current value
     * of the saved numViewed and numLikes values in this object.
     */
      __updateViewsAndLikes : function()
      {
	  this.viewsLikes.setValue('<b> + 
                                   this.numViewed + 
                                   ' views, ' +
                                   this.numLikes+
                                   ' likes</b>');
      };


  }
});
