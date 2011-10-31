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
  extend : qx.core.Object,

  construct : function()
  {
    // The following non-primitive instance variables must be initialized
    // in the constructor so that different instances don't
    // point to the same object.
    // Before this was done, when multiple app modules were open,
    // commenting and liking in one app changed the corresponding
    // fields in another!
    // See the "Primitive Types vs. Reference Types" section of
    // http://manual.qooxdoo.org/1.5.x/pages/core/classes.html

    // Label to display number of views and likes.
    this.__viewsLikesLabel = new qx.ui.basic.Label();

    // FIXME: Clean up the GUI elements related to comments.  The
    // relationship between such elements as this.__allCommentsBox,
    // this.__vbox, scrollContainer, etc. is obscure, possibly redundant,
    //  and may contain errors.

    // Vbox container for comments, inside scrollContainer, outside
    // this.__allCommentsBox
    this.__vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());

    // Yet another container that holds comments
    this.__allCommentsBox = new qx.ui.container.Composite(
      new qx.ui.layout.VBox());

    // Text field for entering a comment
    this.__commentInputField = new qx.ui.form.TextField();
  },

  members :
  {
    // Private instance variables.
    __views : null,
    __likes : null,
    __viewsLikesLabel : null,
    __vbox : null,
    __allCommentsBox : null,
    __commentInputField : null,

    // Helper methods

    /*
     * Update views and likes label to reflect current values
     * of views and likes
     */
    __updateViewsLikesLabel : function()
    {
      this.__viewsLikesLabel.setValue('<b>' + this.__views +
                                       ' views, ' +
                                       this.__likes + ' likes</b>');
    },

    /**
     * Create a panel containing a single comment to the GUI
     *
     * Comment will be shown as a 2-element vbox:
     * Top line: visitor: comment text
     * 2nd line: time stamp (grey, small)
     *
     * @param comment {String}
     *   The comment to be displayed
     *
     * @return {qx.ui.container.Composite}
     *   A container with a vertical box layout, containing the information
     *   about this comment.
     */
    __createCommentPanel : function(comment)
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
    },


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
      var             comment;
      var             comments;
      var             vboxLeft;
      var             vboxRight;
      var             hbox;
      var             appId;
      var             hboxLayout;
      var             title;
      var             appIcon;
      var             createdBy;
      var             likeItButton;
      var             flagItButton;
      var             emptyObject;
      var             commentWrapper;
      var             submitCommentButton;
      var             scrollContainer;
      var             downloadLabel;
      var             download;
      var             spacer;
      var             descriptionHeader;
      var             description;
      var             tagsHeader;
      var             tags;
      var             guiInfo;
      var             ty;
      var             vbox2;
      var             label2;
      var             label;
      var             newBox;
      var             len;
      var             i;

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
        // Get the result data. It's an object with all of the application info.
        result = response.data.result;

        // Get some app data
        appId = result.uid;
        this.__likes = result.numLikes;
        this.__views = result.numViewed;

        // Create a horizontal box layout to store two vboxes in.
        hboxLayout = new qx.ui.layout.HBox();

        // Add a nice little seperation between the two.
        hboxLayout.setSpacing(4);

        // Apply the layout to a container then set some properties on it.
        hbox = new qx.ui.container.Composite(hboxLayout);
        hbox.setDecorator(new qx.ui.decoration.Single(3,'solid','#afafaf'));
        hbox.set(
          {
            maxWidth : 1024,
            width : 1024
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
        title = new qx.ui.basic.Label('<b style="font-size:25px">' +
                                      result.title + '</b>');

        // Set it to use rich formatting and center it in the vbox.
        title.set(
          {
            rich : true,
            alignX : "center"
          });

        // Add it to the left display.
        vboxLeft.add(title);

        // Create an image widget with the image1 image stored for the app.
        appIcon = new qx.ui.basic.Image(result.image1);

        // Center it.
        appIcon.setAlignX("center");

        // Add it to the left display.
        vboxLeft.add(appIcon);

        // Create a label describing who created the app.
        createdBy = new qx.ui.basic.Label('Created by <b>' +
                                              result.owner + '</b>');

        // Make it purty with rich formatting.
        createdBy.set(
          {
            rich : true
          });

        // Center it.
        createdBy.setAlignX("center");

        // Add it to the left vbox.
        vboxLeft.add(createdBy);

        // Initialize it
        this.__updateViewsLikesLabel();

        // Set the views and likes label to use rich formatting,
        // and center it.
        this.__viewsLikesLabel.set(
          {
            rich : true,
            AlignX : "center"
          });

        // Add it to the left vbox.
        vboxLeft.add(this.__viewsLikesLabel);

        // Create a button to allow users to "like" things.
        likeItButton = new qx.ui.form.Button("Like it!");
        fsm.addObject("likeItButton", likeItButton);
        likeItButton.addListener("execute", fsm.eventListener, fsm);

        // Add it to the left vbox.
        vboxLeft.add(likeItButton);

        // Create a button to allow users to "flag" things.
        // FIXME: Implement this
        flagItButton = new qx.ui.form.Button("Flag it!");

        // Add it to the left vbox.
        vboxLeft.add(flagItButton);

        // Creates an object on which to call the getComments event, in order
        // to add them to the GUI
        emptyObject = new qx.core.Object();
        emptyObject.setUserData("filler", new qx.core.Object());
        fsm.addObject("ignoreMe", emptyObject);
        fsm.fireImmediateEvent("appearComments", emptyObject, null);

        // Placeholder text
        this.__commentInputField.setPlaceholder("Type your comment here:");

        // Wrapping everything relevant to a comment in one object,
        // to be passed to the FSM
        commentWrapper = new qx.core.Object();
        commentWrapper.setUserData("appId", appId);
        commentWrapper.setUserData("commentInputField", this.__commentInputField);
        fsm.addObject("commentWrapper", commentWrapper);

        // Adds the button for submitting a comment to the FSM
        submitCommentButton = new qx.ui.form.Button("Submit Comment");
        fsm.addObject("submitCommentButton", submitCommentButton);

        submitCommentButton.addListener(
          "execute",
          function(e)
          {
            var commentInputText = this.__commentInputField.getValue();

            // Is the submitted comment null or whitespace?
            if ((commentInputText != null)
              && ((commentInputText.replace(/\s/g, '')) != ""))
            // No: submit it
            {
              fsm.eventListener(e);
            }
            //Yes: clear input box and do nothing.
            else
            {
              this.__commentInputField.setValue(null);
            }
          },
          // Following was fsm, erroneously and incorrectly.
          // This caused problems when the comment input field
          // was turned into an instance variable.
          this);

        // Lets the user call "execute" by pressing the enter key rather
        // than by pressing the submitCommentButton
        this.__commentInputField.addListener(
          "keypress",
          function(e)
          {
            if (e.getKeyIdentifier() === "Enter")
            {
              submitCommentButton.execute();
            }
          });

        // The textfield, all the existing comments, and the submit button
        // get added to the UI.
        vboxLeft.add(this.__commentInputField);
        vboxLeft.add(submitCommentButton);
        vboxLeft.add(this.__allCommentsBox);

        // We'll put all of the collapsable panels in a scroll container
        scrollContainer = new qx.ui.container.Scroll();
        vboxLeft.add(scrollContainer);

        // Put the vbox container in the scroll container
        scrollContainer.add(this.__vbox);

        // Create a label to represent a link to download the app.
        // FIXME: Add a link here
        downloadLabel =
          new qx.ui.basic.Label('<b>Download ' + result.title + '!</b>');

        // Set it to use rich formatting
        downloadLabel.set(
          {
            rich : true
          });

        // Add it to the right vbox.
        vboxRight.add(downloadLabel);

        // Create a label to store the number of downloads
        download = new qx.ui.basic.Label(result.title +
                                             ' has been downloaded ' +
                                             result.numDownloads +
                                             ' times.');

        // Set it to use rich formatting and to wrap text.
        download.set(
          {
            rich : true,
            wrap : true
          });
        vboxRight.add(download);

        // Create a label just to space things out a bit.
        spacer = new qx.ui.basic.Label('');

        // Add it to the right vbox.
        vboxRight.add(spacer);

        // Create a label to store the header "Description".
        descriptionHeader = new qx.ui.basic.Label('<b>Description</b>');

        // Set it to use rich formatting.
        descriptionHeader.set(
          {
            rich : true
          });

        // Add it to the right vbox.
        vboxRight.add(descriptionHeader);

        // Create a label to store the actual description of the app.
        description = new qx.ui.basic.Label(result.description);

        // Set the label to use rich formatting and automatically wrap text.
        description.set(
          {
            rich : true,
            wrap : true
          });

        // Add it to the right vbox.
        vboxRight.add(description);

        // Create a label to use as a spacer.
        spacer = new qx.ui.basic.Label('');

        // Add it to the right vbox.
        vboxRight.add(spacer);

        // Create a label to store the "Tags" header
        tagsHeader = new qx.ui.basic.Label('<b>Tags</b>');

        // Set it to use rich formatting.
        tagsHeader.set(
          {
            rich : true
          });

        // Add it to the right vbox.
        vboxRight.add(tagsHeader);

        // Create a label with the actual tags.
        tags = new qx.ui.basic.Label(result.tags);

        // Set it to use rich formatting.
        tags.set(
          {
            rich : true
          });

        // Add it to the right vbox.
        vboxRight.add(tags);

        canvas.setLayout(new qx.ui.layout.HBox());

        canvas.add(new qx.ui.core.Widget(), { flex : 1 });
        canvas.add(hbox);
        canvas.add(new qx.ui.core.Widget(), { flex : 1 });
        break;

      case "addComment":
        // Get result data--in this case, the comment that was added.
        comment = response.data.result;

        // Adds the new comment to the GUI
        if (comment["text"] != null)
        {
          newBox = this.__createCommentPanel(comment);

          // Insert the new comment at the top of the list
          this.__allCommentsBox.addAt(newBox, 0, null);

          // Following line confirmed to be needed--but why??
          this.__vbox.add(this.__allCommentsBox);
        }

        this.__commentInputField.setValue(null);
        break;

      case "getComments":
        // Get the result data--here, the list of comments for this app.
        comments = response.data.result;

        // Add comments retrieved from the database to the GUI
        ty = qx.lang.Type.getClass(comments);
        if (ty == "Array")
        {
          len = comments.length;
          if (len != 0)
          {
            for (i = 0; i < len; ++i)
            {
              comment = comments[i];
              if (comment["text"] != null)
              {
                newBox = this.__createCommentPanel(comment);

                // Insert the new comment at the top of the list
                this.__allCommentsBox.addAt(newBox, 0, null);

                // Following line confirmed to be needed--but why??
                this.__vbox.add(this.__allCommentsBox);
              }
            }
          }
        }
        break;

      case "likesPlusOne":
        // Update like count from RPC (don't just increment it; that
        // might be wrong)
        this.__likes = response.data.result;

        // Update views and likes label
        this.__updateViewsLikesLabel();

        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
