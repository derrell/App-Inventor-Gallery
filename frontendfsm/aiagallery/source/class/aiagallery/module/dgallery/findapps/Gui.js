/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery "find apps"" page
 */
qx.Class.define("aiagallery.module.dgallery.findapps.Gui",
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
      var             o;
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             splitpane;
      var             hBox;
      var             vBox;
      var             groupbox;
      var             list;
      var             browse;
      var             gallery;
      var             searchCriteriaArr = [];

      // Create a splitpane. Top: browse and search; bottom: results
      splitpane = new qx.ui.splitpane.Pane("vertical");
      canvas.add(splitpane, { flex : 1 });

      // Create a horizontal box layout for the top pane
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      splitpane.add(hBox, 1);
      
      // Provide a bit of space at the left
      hBox.add(new qx.ui.core.Spacer(10));

      // Create a set of finder-style multi-level browsing lists
      groupbox = new qx.ui.groupbox.GroupBox("Browse");
      groupbox.setLayout(new qx.ui.layout.HBox());
      groupbox.setContentPadding(0);
      hBox.add(groupbox);

      // create and add the lists. Store them in an array.
      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse0", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse1", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse2", list);
      // Finished with the finder-style browser
       
      // Begin creating the search gui
      // groupbox contains the whole rest of the shabang
      groupbox = new qx.ui.groupbox.GroupBox("Search") ;
      groupbox.setLayout( new qx.ui.layout.VBox()) ;

      // criteria will house all of the "lines of refinement"
      var criteria = new qx.ui.groupbox.GroupBox();
      criteria.setLayout( new qx.ui.layout.VBox());
  
      // criteria VBox gets wrapped by Scroll for functionality
      var criteriascroll = new qx.ui.container.Scroll().set(
        {
          height : 330,
          width : 1000
        });
      criteriascroll.add(criteria);
       
      // Start with a single line of refinement
      var myRefineLine = this.buildSearchRefineLine(fsm);
      
      // Store the criteria object in the criteria container
      searchCriteriaArr.push(myRefineLine.criteria);
     
      // Wrapping all stuff relevant to search in one object
      var searchWrapper = new qx.core.Object();
      searchWrapper.setUserData("array", searchCriteriaArr);
      searchWrapper.setUserData("widget",criteria);
      searchWrapper.setUserData("buildRefineFunc", this.buildSearchRefineLine);
      
      // Going to need access in reset function to this object by the criteria
      criteria.setUserData("searchObject", searchWrapper);
      
      // Store the search object in the FSM so everyone has access to the data
      fsm.addObject("searchCriteria", searchWrapper);
      
      // And install the container widget
      criteria.add(myRefineLine.widget);
      
      
      
      // buttonbar is where the search, reset, and possibly more buttons go
      var buttonbar = new qx.ui.groupbox.GroupBox();
      buttonbar.set(
        {
          layout         : new qx.ui.layout.HBox(),
          contentPadding : 3
        });
      
      
      
      var searchbtn = new qx.ui.form.Button("Search On This");
      fsm.addObject("searchBtn", searchbtn);
      searchbtn.addListener("execute", fsm.eventListener, fsm);
      
      var resetbtn = new qx.ui.form.Button("Reset All Fields");
      resetbtn.addListener("execute", function() {
        
        var searchObj = this.getUserData("searchObject");
        var newLine   = searchObj.getUserData("buildRefineFunc")();
        
        // Set the Search Criteria Array to an empty array and clean the widget
        searchObj.setUserData("array", [] );
        this.removeAll();
        
        // Add a brand new first line
        this.add(newLine.widget);
        searchObj.getUserData("array").push(newLine.criteria);
        
      // Pass criteria widget as context so we can access (and clean) it.  
      }, criteria);
      
      var addcriteriabtn = new qx.ui.form.Button("Add Search Criteria");
      
      // When the button is hit, create a new refinement line
      addcriteriabtn.addListener("execute", function() {
        
        // Gather everything we'll need, mostly unpacking the searchObject
        var         searchObject   = this.getObject("searchCriteria");
        var         criteriaWidget = searchObject.getUserData("widget");
        var         array          = searchObject.getUserData("array");
        var         newRefineLine  = 
          searchObject.getUserData("buildRefineFunc")();
        
        // Add the widget to the GUI, and the data to the data array
        criteriaWidget.add(newRefineLine.widget);
        array.push(newRefineLine.criteria);
        
      // Pass the listener the FSM, no other way to get it in there!
      }, fsm);
      
      // Add buttons onto button bar, with a little space
      buttonbar.add(resetbtn);
      buttonbar.add(new qx.ui.core.Spacer(5));
      buttonbar.add(searchbtn);
      buttonbar.add(new qx.ui.core.Spacer(5));
      buttonbar.add(addcriteriabtn);
      
      // Finally, add the Scroll-wrapped criteria on top of the buttonbar
      groupbox.add(criteriascroll, { flex : 1 });
      groupbox.add(buttonbar);

      groupbox.getChildControl("frame").setBackgroundColor("white");

      // End search gui by adding it to hBox
      hBox.add(groupbox, {flex : 1});

      // Provide a bit of space at the right
      hBox.add(new qx.ui.core.Spacer(10));

      // Create a vertical box layout for the bottom pane
      vBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      splitpane.add(vBox, 2);
      
      // Display 
      gallery = new aiagallery.widget.virtual.Gallery();
      gallery.addListener("changeSelection", fsm.eventListener, fsm);
      fsm.addObject("gallery", gallery);
      vBox.add(gallery, { flex : 1 });
    },

    /**
     * Construct and return a search refining line
     * 
     * @param FSM object
     * 
     * @return new container with the empty search refining form
     */
    
    buildSearchRefineLine : function() {
      
      var       lineHBox;
      var       attrSelect;
      var       qualSelect;
      var       valueField;
      var       deletebtn;
      var       criteriaObject;
      
      // This HBox will contain an entire line of refinement
      lineHBox = new qx.ui.groupbox.GroupBox();
      lineHBox.set(
        {
          layout          : new qx.ui.layout.HBox(),
          padding         : 0
        });
      
      // Create the Attribute Select Box
      attrSelect = new qx.ui.form.SelectBox();
      
      // Store some attributes in it, using the model for a switch in the FSM
      attrSelect.add(new qx.ui.form.ListItem("has Tag", null, "tags"));
      attrSelect.add(new qx.ui.form.ListItem("Title contains", null, "title"));
      attrSelect.add(new qx.ui.form.ListItem("Description contains", null,
                                             "description"));
      attrSelect.add(new qx.ui.form.ListItem("Liked more than", null,
                                             "likesGT"));
      attrSelect.add(new qx.ui.form.ListItem("Liked less than", null,
                                             "likesLT"));
      attrSelect.add(new qx.ui.form.ListItem("Liked exactly", null,
                                             "likesEQ"));
      attrSelect.add(new qx.ui.form.ListItem("Downloaded more than", null,
                                             "downloadsGT"));
      attrSelect.add(new qx.ui.form.ListItem("Downloaded less than", null,
                                             "downloadsLT"));
      attrSelect.add(new qx.ui.form.ListItem("Downloaded exactly", null,
                                             "downloadsEQ"));
      
      //attrSelect.add(new qx.ui.form.ListItem("Date Created", null,
      //"creationTime"));
      
/*      
      // Change qualifier choices when attribute is selected
      attrSelect.addListener("changeSelection",
        function()
        {
          var qualMap = {};
          var qualifier;
          
          // Remove all existing qualifiers first                      
          qualSelect.removeAll();

          // Supply appropriate qualifiers, depending on the attribute selected
          // Mapping qualifier label to model, for clarity
          switch (attrSelect.getSelection()[0].getModel())
          {
          case "tags":
          case "title":
          case "description":
            qualMap = 
              {
                "contains"   : "~",
                "is exactly" : "="
              };
            break;

          case "numLikes":
          case "numDownloads":
            qualMap = 
              {
                "greater than" : ">",
                "less than"    : "<",
                "is exactly"   : "="
              };
            break;

          }
         
          // Add the qualifiers as described in the map
          for (qualifier in qualMap)
          {
            qualSelect.add(new qx.ui.form.ListItem(qualifier,
                                                   null,
                                                  qualMap[qualifier]));
          }
          
        });
*/
      
      // Create the Qualifier Select Box
      qualSelect = new qx.ui.form.SelectBox();
      
      // Store some qualifiers in it
      // NOTE: Attempting to use the model as a switch for which OP to use
      qualSelect.add(new qx.ui.form.ListItem("is exactly", null, "="));
      qualSelect.add(new qx.ui.form.ListItem("contains", null, "~"));
      
      // Create the field for the value to compare against
      valueField = new qx.ui.form.TextField();
      
      // Create a button to delete this line
      deletebtn = new qx.ui.form.Button("-");
      deletebtn.addListener("execute", function() {
        
        // Hit the "deleted" switch, to make sure this isn't part of the query
        this.getUserData("myCriteria").deleted = true;
        // Remove this from the GUI
        this.destroy();
        
      // Add lineHBox as the context, so we can manipulate it.
      }, lineHBox);
      
      // Add boxes in the correct order, with a little space separating them.
      lineHBox.add(attrSelect);
      lineHBox.add(new qx.ui.core.Spacer(5));
//      lineHBox.add(qualSelect);
//      lineHBox.add(new qx.ui.core.Spacer(5));
      lineHBox.add(valueField);
      lineHBox.add(new qx.ui.core.Spacer(10));
      lineHBox.add(deletebtn);
      
      // Create an object to easily access all of the selections
      criteriaObject = 
      {
        attributeBox  : attrSelect,
        qualifierBox  : qualSelect,
        valueBox      : valueField,
        deleted       : false
      };
     
      // Give a reference to the groupbox so that it can deal with a delete.
      lineHBox.setUserData("myCriteria", criteriaObject);
     
      // Finally give'm what they came for.
      return {
        "widget"   : lineHBox,
        "criteria" : criteriaObject
      };
      
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
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             gallery;
      var             apps;
      var             categories;
      var             tagMap;
      var             tagList;
      var             excludeTags;
      var             browse0 = fsm.getObject("browse0");
      var             browse1 = fsm.getObject("browse1");
      var             browse2 = fsm.getObject("browse2");
      var             querySource = rpcRequest.getUserData("querySource");
      var             nextList;
      var             selection;

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "getCategoryTags":
        response.data.result.forEach(
          function(tag)
          {
            // Add this tag to the list.
            browse0.add(new qx.ui.form.ListItem(tag));
          });
        break;
      
      case "intersectKeywordAndQuery":
        gallery = fsm.getObject("gallery");
        
        apps = response.data.result;
        
        // FIXME: KLUDGE: should be able to update without remove/add!!!
        var parent = gallery.getLayoutParent();
        parent.remove(gallery);
        gallery = new aiagallery.widget.virtual.Gallery(apps);
        gallery.addListener("changeSelection", fsm.eventListener, fsm);
        fsm.addObject("gallery", gallery);
        parent.add(gallery);
        break;
        
        
      case "appQuery":
        // Get the gallery object
        gallery = fsm.getObject("gallery");
        
        // Retrieve the app list and list of categories
        apps = response.data.result.apps;
        categories = response.data.result.categories;

        // FIXME: KLUDGE: should be able to update without remove/add!!!
        var parent = gallery.getLayoutParent();
        parent.remove(gallery);
        gallery = new aiagallery.widget.virtual.Gallery(apps);
        gallery.addListener("changeSelection", fsm.eventListener, fsm);
        fsm.addObject("gallery", gallery);
        parent.add(gallery);

        
        if (querySource != "searchBtn"){
          
          // Create a list of tags to exclude from this next level
          excludeTags = [];

          // Get the previous selections
  
          switch(querySource)
          {          
          case "browse1":
            selection = browse1.getSelection();
            if (selection.length > 0)
            {
              excludeTags.push(selection[0].getLabel());
            }
            // fall through

          case "browse0":
            selection = browse0.getSelection();
            if (selection.length > 0)
            {
              excludeTags.push(selection[0].getLabel());
            }
            // fall through
            
          case "browse2":
            // nothing to do
            break;
          }
          
          // Set up tags to be inserted in the list one to the right
          switch(querySource)
          {
          case "browse0":
            nextList = browse1;
            break;
            
          case "browse1":
            nextList = browse2;
            break;
          
          case "browse2":
            // nothing to do
            break;
          }
          // Create a single list of all of the resulting tags
          tagMap = {};
          for (var app = 0; app < apps.length; app++)
          {
            apps[app].tags.forEach(
              function(tag)
              {
                // If this tag is not a category
                tagMap[tag] = true;
              });
          }
          
          // Remove any items from the tag list that are already selected
          excludeTags.forEach(
            function(tag)
            {
              delete tagMap[tag];
            });

          // Convert the map into a tag list, and sort it.
          tagList = qx.lang.Object.getKeys(tagMap).sort();
          
          if (nextList)
          {
            // Add each tag to the next list
            tagList.forEach(
              function(tag)
              {
                nextList.add(new qx.ui.form.ListItem(tag));
              });
          }
        }
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
