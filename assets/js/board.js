// For the layout
var MINLENGTH = 200;  // this controls the minimum length of any swimlane
var MINBREADTH = 100;  // this controls the minimum breadth of any non-collapsed swimlane
var POOLWIDTH = 1310;
var wCols = 6;

// some shared functions

// this is called after nodes have been moved
function relayoutDiagram() {
  myDiagram.selection.each(function(n) { n.invalidateLayout(); });
  myDiagram.layoutDiagram();
}

// compute the minimum size of the whole diagram needed to hold all of the Lane Groups
function computeMinPoolSize() {
  var len = MINLENGTH;
  myDiagram.findTopLevelGroups().each(function(lane) {
    var holder = lane.placeholder;
    if (holder !== null) {
      var sz = holder.actualBounds;
      len = Math.max(len, sz.height);
    }
    var box = lane.selectionObject;
    // naturalBounds instead of actualBounds to disregard the shape's stroke width
    len = Math.max(len, box.naturalBounds.height);
  });
  return new go.Size(NaN, len);
}

// compute the minimum size for a particular Lane Group
function computeLaneSize(lane) {
  // assert(lane instanceof go.Group);
  var sz = computeMinLaneSize(lane);
  if (lane.isSubGraphExpanded) {
    var holder = lane.placeholder;
    if (holder !== null) {
      var hsz = holder.actualBounds;
      sz.width = Math.max(sz.width, hsz.width);
    }
  }
  // minimum breadth needs to be big enough to hold the header
  var hdr = lane.findObject("HEADER");
  if (hdr !== null) sz.width = Math.max(sz.width, hdr.actualBounds.width);
  return sz;
}

// determine the minimum size of a Lane Group, even if collapsed
function computeMinLaneSize(lane) {
  if (!lane.isSubGraphExpanded) return new go.Size(1, MINLENGTH);
  return new go.Size(MINBREADTH, MINLENGTH);
}


function setWCols(type = dgType){
  if(type == "week"){
    return 6;
  }
  if(type == "project"){
    return 7;
  }
}

// define a custom grid layout that makes sure the length of each lane is the same
// and that each lane is broad enough to hold its subgraph
function PoolLayout() {
  go.GridLayout.call(this);
  this.cellSize = new go.Size(1, 1);
  this.wrappingColumn = 7;
  this.wrappingWidth = 1500;
  this.spacing = new go.Size(0, 0);
  this.alignment = go.GridLayout.Position;
}
go.Diagram.inherit(PoolLayout, go.GridLayout);

PoolLayout.prototype.doLayout = function(coll) {
  var diagram = this.diagram;
  if (diagram === null) return;
  diagram.startTransaction("PoolLayout");
    // make sure all of the Group Shapes are big enough
    var minsize = computeMinPoolSize();
    diagram.findTopLevelGroups().each(function(lane) {
      if (!(lane instanceof go.Group)) return;
      if (lane.category !== "Pool") {
      var shape = lane.selectionObject;
        if (shape !== null) {  // change the desiredSize to be big enough in both directions
          var sz = computeLaneSize(lane);
          shape.width = (!isNaN(shape.width)) ? Math.max(shape.width, sz.width) : sz.width;
          shape.height = (isNaN(shape.height) ? minsize.height : Math.max(shape.height, minsize.height));
          var cell = lane.resizeCellSize;
          if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0) shape.width = Math.ceil(shape.width / cell.width) * cell.width;
          if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0) shape.height = Math.ceil(shape.height / cell.height) * cell.height;
        }
      }
    });
  // now do all of the usual stuff, according to whatever properties have been set on this GridLayout
  go.GridLayout.prototype.doLayout.call(this, coll);
  diagram.commitTransaction("PoolLayout");
};
// end PoolLayout class


function init() {

  var $ = go.GraphObject.make;

  myDiagram =
    $(go.Diagram, "myBoard",
      {
        // start everything in the middle of the viewport
        contentAlignment: go.Spot.TopCenter,
        // use a simple layout to stack the top-level Groups next to each other
        layout: $(PoolLayout),
        // disallow nodes to be dragged to the diagram's background
        mouseDrop: function(e) {
          e.diagram.currentTool.doCancel();
        },
        // a clipboard copied node is pasted into the original node's group (i.e. lane).
        "commandHandler.copiesGroupKey": true,
        // automatically re-layout the swim lanes after dragging the selection
        "SelectionMoved": relayoutDiagram,  // this DiagramEvent listener is
        "SelectionCopied": relayoutDiagram, // defined above
        "animationManager.isEnabled": false,
        "undoManager.isEnabled": true,
        // allow TextEditingTool to start without selecting first
        "textEditingTool.starting": go.TextEditingTool.DoubleClick
      });

  // Customize the dragging tool:
  // When dragging a Node set its opacity to 0.7 and move it to the foreground layer
  myDiagram.toolManager.draggingTool.doActivate = function() {
    go.DraggingTool.prototype.doActivate.call(this);
    this.currentPart.opacity = 0.7;
    this.currentPart.layerName = "Foreground";
  }
  myDiagram.toolManager.draggingTool.doDeactivate = function() {
    this.currentPart.opacity = 1;
    this.currentPart.layerName = "";
    go.DraggingTool.prototype.doDeactivate.call(this);
  }

  // There are only three note colors by default, blue, red, and yellow but you could add more here:
  var noteColors = ['#009CCC', '#FFD700', '#34E022', '#CC293D'];
  function getNoteColor(num) {
    //console.log(isNaN(num));
    if(isNaN(num)){
      return String(num);
    }
    return noteColors[Math.min(num, noteColors.length - 1)];
  }

  myDiagram.nodeTemplate =


    $(go.Node, "Horizontal",
      new go.Binding("fill", "fill"),
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "Rectangle", {
          fill: '#009CCC', strokeWidth: 1, stroke: '#009CCC',
          width: 8, stretch: go.GraphObject.Vertical, alignment: go.Spot.Left,
          cursor: "pointer",
          // if a user clicks the colored portion of a node, cycle through colors
          click: function(e, obj) {
              myDiagram.startTransaction("Update node color");
              var newColor = parseInt(obj.part.data.color) + 1;
              if (newColor > noteColors.length - 1) newColor = 0;
              myDiagram.model.setDataProperty(obj.part.data, "color", newColor);
              myDiagram.commitTransaction("Update node color");
          }
        },
        new go.Binding("width", "fwidth"),
        new go.Binding("click", "click"),
        new go.Binding("fill", "color", getNoteColor),
        new go.Binding("stroke", "color", getNoteColor)
      ),
      $(go.Panel, "Auto",
        $(go.Shape, "Rectangle", { fill: "white", stroke: '#CCCCCC' }),
        $(go.Panel, "Table",
          { width: 168, minSize: new go.Size(NaN, 50) },
            $(go.Picture,
            {
              name: "Picture",
              desiredSize: new go.Size(40, 42),
              margin: new go.Margin(6, 2, 6, 10),
              alignment: go.Spot.TopLeft,
              column:1
            },
            new go.Binding("source", "memberkey", findHeadShot)),
            $(go.TextBlock,
            {
              name: 'TEXT',
              margin: 6, font: '11px Lato, sans-serif', editable: true,
              stroke: "#000", maxSize: new go.Size(168, NaN),
              alignment: go.Spot.TopLeft
            },
            new go.Binding("editable", "editable"),
            new go.Binding("column", "column"),
            new go.Binding("text", "text").makeTwoWay())
        )
      )

    );

  // hide links between lanes when either lane is collapsed
  // function updateCrossLaneLinks(group) {
  //   group.findExternalLinksConnected().each(function(l) {
  //     l.visible = (l.fromNode.isVisible() && l.toNode.isVisible());
  //   });
  // }
  function groupStyle() {  // common settings for both Lane and Pool Groups
    return [
      {
        layerName: "Background",  // all pools and lanes are always behind all nodes and links
        background: "transparent",  // can grab anywhere in bounds
        movable: true, // allows users to re-order by dragging
        copyable: false,  // can't copy lanes or pools
        avoidable: false,  // don't impede AvoidsNodes routed Links
        minLocation: new go.Point(NaN, -Infinity),  // only allow vertical movement
        maxLocation: new go.Point(NaN, Infinity)
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
    ];
  }

  // Pool generate Templates
  myDiagram.groupTemplateMap.add("Pool",
  $(go.Group, "Auto", groupStyle(),
    { // use a simple layout that ignores links to stack the "lane" Groups on top of each other
      layout: $(PoolLayout, { spacing: new go.Size(0, 0) })  // no space between lanes
    },
    $(go.Shape,
      { fill: "white" },
      // new go.Binding("fill", "fill"),
      new go.Binding("fill", "isSubGraphExpanded", function(e) { 
          if(e){ 
            return "white";
          }
          if (!e){
            return "#def";    
          }
        }).ofObject()
      ),
      // new go.Binding("fill", "color")),
    $(go.Panel, "Table",
      { defaultColumnSeparatorStroke: "black", width: POOLWIDTH },
      $(go.Panel, "Horizontal",
        { column: 0, height: 40, angle: 270, alignment: go.Spot.Center, margin: new go.Margin(15, 5, 5, 5) },
        $("SubGraphExpanderButton", { margin: 10 }),
        $(go.TextBlock,
          { font: "bold 16pt sans-serif", editable: true },
          new go.Binding("visible", "isSubGraphExpanded").ofObject(),
          new go.Binding("text").makeTwoWay())
        ),
      $(go.Placeholder,
        {  column: 1, minSize: new go.Size(POOLWIDTH, 20), alignment: go.Spot.TopLeft, margin: new go.Margin(10, 10, 10, 10), width: POOLWIDTH })
    ),
    $(go.TextBlock,  // this TextBlock is only seen when the swimlane is collapsed
      {
        name: "LABEL",
        font: "bold 15pt sans-serif", editable: true,
        angle: 0, alignment: go.Spot.TopCenter, margin: new go.Margin(20, 0, 0, 4)
      },
      new go.Binding("visible", "isSubGraphExpanded", function(e) { return !e; }).ofObject(),
      new go.Binding("text", "text").makeTwoWay())
  ));

  // unmovable node that acts as a button
  myDiagram.nodeTemplateMap.add('newbutton',
    $(go.Node, "Horizontal",
      {
        selectable: false,
        cursor: "pointer",
        click: function(e, node) {
          myDiagram.startTransaction('add node');
          var newdata = { group: node.containingGroup.key , loc:"0 50", text: "Tarea " + node.containingGroup.memberParts.count, color: 0, column : 1 };
          myDiagram.model.addNodeData(newdata);
          myDiagram.commitTransaction('add node');
          var node = myDiagram.findNodeForData(newdata);
          myDiagram.select(node);
          myDiagram.commandHandler.editTextBlock();
        },
        background: 'white'
      },
      $(go.Panel, "Auto",
        $(go.Shape, "Rectangle", { strokeWidth: 0, stroke: null, fill: '#6FB583' }),
        $(go.Shape, "PlusLine", { margin: 6, strokeWidth: 2, width: 12, height: 12, stroke: 'white', background: '#6FB583' })
      ),
      $(go.TextBlock, "Nueva Tarea", { font: '10px Lato, sans-serif', margin: 6,  })
    )
  );

    var projCell = ['Cliente','Trabajo', 'FechaEntrega', 'ResponsableCtas', 'ResponsableCrea', 'ResponsableEstr', 'ResponsableProd' ];

    // unmovable node that acts as a button
    myDiagram.nodeTemplateMap.add('newjob',
    $(go.Node, "Horizontal",
      {
        selectable: false,
        cursor: "pointer",
        click: function(e, node) {
          var index = node.data.index;
          // console.log(projCell[i] + node.data);
          myDiagram.startTransaction('add node');
          for(let i=0; i< projCell.length ;i++){
            // console.log(projCell[i] + index);
            var newdata = null;
            var wCell = 120;
            if(projCell[i] == "Cliente"){
              newdata = { group: projCell[i] + index , loc:"0 50", category: "project", text: "", color: 0, column : 1 };
            }else{
              if(projCell[i] == "Trabajo"){ wCell = 190 }
                newdata = { group: projCell[i] + index , loc:"0 50", category: "cell", text: "", color: 0, column : 1, width : wCell };
            }
            myDiagram.model.addNodeData(newdata);
            myDiagram.commitTransaction('add node');
            // var node = myDiagram.findNodeForData(newdata);
            // myDiagram.select(node);
            // myDiagram.commandHandler.editTextBlock();
          }
        },
        background: 'white'
      },
      $(go.Panel, "Auto",
        $(go.Shape, "Rectangle", { strokeWidth: 0, stroke: null, fill: '#6FB583' }),
        $(go.Shape, "PlusLine", { margin: 6, strokeWidth: 2, width: 12, height: 12, stroke: 'white', background: '#6FB583' })
      )
    )
  );

  
  var tTeam = null;
  var teamPart = [];
  var newdataTeam = null;

  jQ('#members').on('hide.bs.modal', function (e) {

    teamPart = jQ("#membersSelect").val();
    //console.log(tTeam);
    //console.log(teamPart);
    //teamPart = teamPart.replace(",", "\n");
    if(teamPart != null){
      for(let i = 0; i <= teamPart.length - 1 ; i++){
        
        let m = teamPart[i].split("|");
        
        myDiagram.startTransaction('add member');
        newdataTeam = { group: tTeam , loc:"0 50", text: m[1] + '\n' + m[2], color: "#676767", memberkey: m[0], column : 2, fwidth: 6, click : null, editable : false };
        myDiagram.model.addNodeData(newdataTeam);
        myDiagram.commitTransaction('add member');
      }
    }
    teamPart = null;
    var node = myDiagram.findNodeForData(newdataTeam);
    myDiagram.select(node);
    myDiagram.commandHandler.editTextBlock();
    return 0;
  });

  // unmovable node that acts as a button
  myDiagram.nodeTemplateMap.add('newteam',
  $(go.Node, "Horizontal",
  {
    selectable: false,
      cursor: "pointer",
      click: function(e, node) {

        tTeam = node.containingGroup.key;
        
        jQ("#membersSelect").val("");          
        jQ('#members').modal('show');
        
      },
      background: 'white'
    },
    $(go.Panel, "Auto",
    $(go.Shape, "Rectangle", { strokeWidth: 0, stroke: null, fill: '#6FB583' }),
    $(go.Shape, "PlusLine", { margin: 6, strokeWidth: 2, width: 12, height: 12, stroke: 'white', background: '#6FB583' })
  ),
  $(go.TextBlock, "Integrante", { font: '10px Lato, sans-serif', margin: 6,  })
)
);

  myDiagram.nodeTemplateMap.add('cell',
        $(go.Node, "Horizontal",
        {
          selectable: true,
          movable:false,
          background: '#fefefe',
          height: 35
        },
        new go.Binding("width", "width"),
        $(go.Panel, "Auto",
        $(go.Panel, "Table",
          { width: 190, minSize: new go.Size(NaN, 30) },
            $(go.TextBlock,
            {
              name: 'TEXT',
              margin: 3, font: '11px Lato, sans-serif', editable: true,
              stroke: "#000", maxSize: new go.Size(180, NaN),
              height: 30,
              width: 180,
              alignment: go.Spot.TopLeft
            },
            new go.Binding("width", "width"),
            new go.Binding("column", "column"),
            new go.Binding("text", "text").makeTwoWay())
        )
      )
      )
    );

    myDiagram.nodeTemplateMap.add('project',
    $(go.Node, "Horizontal",
    {
      selectable: true,
      movable:false,
      background: '#fefefe',
      height: 35
    },
    $(go.Panel, "Auto",
    $(go.Panel, "Table",
      $(go.Shape, "Rectangle", {
        fill: '#009CCC', strokeWidth: 1, stroke: '#009CCC',
        width: 8, stretch: go.GraphObject.Vertical, alignment: go.Spot.Left,
        cursor: "pointer",
        // if a user clicks the colored portion of a node, cycle through colors
        click: function(e, obj) {
            myDiagram.startTransaction("Update node color");
            var newColor = parseInt(obj.part.data.color) + 1;
            if (newColor > noteColors.length - 1) newColor = 0;
            myDiagram.model.setDataProperty(obj.part.data, "color", newColor);
            myDiagram.commitTransaction("Update node color");
        }
      }
    ),
      { width: 168, minSize: new go.Size(NaN, 30) },
        $(go.TextBlock,
        {
          name: 'TEXT',
          margin: 4, font: '11px Lato, sans-serif', editable: true,
          stroke: "#000", maxSize: new go.Size(155, NaN),
          height: 30,
          width: 145,
          alignment: go.Spot.TopLeft
        },
        new go.Binding("column", "column"),
        new go.Binding("text", "text").makeTwoWay())
    )
  )
  )
);

  // While dragging, highlight the dragged-over group
  function highlightGroup(grp, show) {
    if (show) {
      var part = myDiagram.toolManager.draggingTool.currentPart;
      if (part.containingGroup !== grp) {
        grp.isHighlighted = true;
        return;
      }
    }
    grp.isHighlighted = false;
  }

  myDiagram.groupTemplate =
    $(go.Group, "Vertical",
      {
        selectable: false,
        selectionObjectName: "SHAPE", // even though its not selectable, this is used in the layout
        layerName: "Background",  // all lanes are always behind all nodes and links
        layout: $(go.GridLayout,  // automatically lay out the lane's subgraph
                  {
                    wrappingColumn: 1,
                    cellSize: new go.Size(1, 1),
                    spacing: new go.Size(5, 5),
                    alignment: go.GridLayout.Position,
                    // comparer: function(a, b) {  // can re-order tasks within a lane
                    //   var ay = a.location.y;
                    //   var by = b.location.y;
                    //   if (isNaN(ay) || isNaN(by)) return 0;
                    //   if (ay < by) return -1;
                    //   if (ay > by) return 1;
                    //   return 0;
                    // }
                  }),
        click: function(e, grp) {  // allow simple click on group to clear selection
          if (!e.shift && !e.control && !e.meta) e.diagram.clearSelection();
        },
        computesBoundsAfterDrag: true,  // needed to prevent recomputing Group.placeholder bounds too soon
        handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
        mouseDragEnter: function(e, grp, prev) { highlightGroup(grp, true); },
        mouseDragLeave: function(e, grp, next) { highlightGroup(grp, false); },
        mouseDrop: function(e, grp) {  // dropping a copy of some Nodes and Links onto this Group adds them to this Group
          // don't allow drag-and-dropping a mix of regular Nodes and Groups
          if (e.diagram.selection.all(function(n) { return !(n instanceof go.Group); })) {
            var ok = grp.addMembers(grp.diagram.selection, true);
            if (!ok) grp.diagram.currentTool.doCancel();
          }
        },
        subGraphExpandedChanged: function(grp) {
          var shp = grp.selectionObject;
          if (grp.diagram.undoManager.isUndoingRedoing) return;
          if (grp.isSubGraphExpanded) {
            shp.width = grp._savedBreadth;
          } else {
            grp._savedBreadth = shp.width;
            shp.width = NaN;
          }
        }
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),
      // the lane header consisting of a TextBlock and an expander button
      $(go.Panel, "Horizontal",
        { 
          name: "HEADER",
          angle: 0,  // maybe rotate the header to read sideways going up
          alignment: go.Spot.Left 
        },
        //$("SubGraphExpanderButton", { margin: 5 }),  // this remains always visible
        $(go.Panel, "Horizontal",  // this is hidden when the swimlane is collapsed
          new go.Binding("visible", "isSubGraphExpanded").ofObject(),
          $(go.TextBlock,  // the lane label
            { font: "15px Lato, sans-serif", editable: true, margin: new go.Margin(10, 0, 2, 15) },
            new go.Binding("text", "text").makeTwoWay())
        )
      ),  // end Horizontal Panel
      $(go.Panel, "Auto",  // the lane consisting of a background Shape and a Placeholder representing the subgraph
        $(go.Shape, "Rectangle",  // this is the resized object
          { name: "SHAPE", fill: "#F1F1F1", stroke: null, strokeWidth: 4 },
          new go.Binding("fill", "isHighlighted", function(h) { return h ? "#D6D6D6" : "#F1F1F1"; }),
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
        $(go.Placeholder,
          { padding: 12, alignment: go.Spot.TopLeft }),
        $(go.TextBlock,  // this TextBlock is only seen when the swimlane is collapsed
          { 
            name: "LABEL",
            font: "15px Lato, sans-serif", editable: true,
            angle: 90, alignment: go.Spot.TopLeft, margin: new go.Margin(4, 0, 0, 2) 
          },
          new go.Binding("visible", "isSubGraphExpanded", function(e) { return !e; }).ofObject(),
          new go.Binding("text", "text").makeTwoWay())
      )  // end Auto Panel
    );  // end Group

    function fileExists(url) {
      if(url){
          var req = new XMLHttpRequest();
          req.open('GET', url, false);
          req.send();
          return req.status==200;
      } else {
          return false;
      }
  }
    
  // This converter is used by the Picture.
  function findHeadShot(key) {
    var url = appRoute + "/images/employee/HS" + key + ".png";
    if (fileExists(url)){
      return url;
    }else{
      return "images/HSnopic.png";
    }
  }

  loadDiagram();


  // myDiagram.add(

  // )
    //   $(go.Part, "Table",
    // Set up a Part as a legend, and place it directly on the diagram
  // myDiagram.add(
  //   $(go.Part, "Table",
  //     { position: new go.Point(300, 10), selectable: false },
  //     $(go.TextBlock, "Key",
  //       { row: 0, font: "700 14px Droid Serif, sans-serif" }),  // end row 0
  //     $(go.Panel, "Horizontal",
  //       { row: 1, alignment: go.Spot.Left },
  //       $(go.Shape, "Rectangle",
  //         { desiredSize: new go.Size(10, 10), fill: '#009CCC', margin: 5 }),
  //       $(go.TextBlock, "Nuevo",
  //         { font: "700 13px Droid Serif, sans-serif" })
  //     ),  // end row 1
  //     $(go.Panel, "Horizontal",
  //       { row: 2, alignment: go.Spot.Left },
  //       $(go.Shape, "Rectangle",
  //         { desiredSize: new go.Size(10, 10), fill: '#FFD700', margin: 5 }),
  //       $(go.TextBlock, "En Progreso",
  //         { font: "700 13px Droid Serif, sans-serif" })
  //     ),  // end row 2
  //     $(go.Panel, "Horizontal",
  //       { row: 3, alignment: go.Spot.Left },
  //       $(go.Shape, "Rectangle",
  //         { desiredSize: new go.Size(10, 10), fill: '#34E022', margin: 5 }),
  //       $(go.TextBlock, "Completado",
  //         { font: "700 13px Droid Serif, sans-serif" })
  //     ),  // end row 3
  //     $(go.Panel, "Horizontal",
  //       { row: 4, alignment: go.Spot.Left },
  //       $(go.Shape, "Rectangle",
  //         { desiredSize: new go.Size(10, 10), fill: '#CC293D', margin: 5 }),
  //       $(go.TextBlock, "Detenido",
  //         { font: "700 13px Droid Serif, sans-serif" })
  //     )  // end row 4
  //   ));

}  // end init

// Reload Main Variables for Pools create rows
function reloadLayout(){
  fnodes = myDiagram.findNodesByExample({category: "Pool"});
  nPool = fnodes.count;
}

function loadDiagram() {
  myDiagram.model = go.Model.fromJson(document.getElementById("templateBoard").value);
  myDiagram.delayInitialization(relayoutDiagram);
  reloadLayout();
}

function findDiagram() {
  jQ.ajax({
    method:"GET",
    url: appRoute + "/app/System/AppFactory.php",
    data: {
      fn: "loadData",
      type: dgType
    },
    complete: function(rs){
        // console.log(rs.responseText);
        var layout = rs.responseText;
        myDiagram.model = go.Model.fromJson( layout );
        myDiagram.delayInitialization(relayoutDiagram);
        reloadLayout();
    }
  });
}

// Load new (blank) diagram from main layout
function loadNewDiagram(){

  jQ.ajax({
    method:"GET",
    url: appRoute + "/app/System/AppFactory.php",
    data: {
      fn: "newDiagram",
      type: dgType
    },
    complete: function(rs){
        console.log(rs.responseText);
        var layout = rs.responseText;
        myDiagram.model = go.Model.fromJson( layout );
        myDiagram.delayInitialization(relayoutDiagram);
        reloadLayout();
    }
  });
}

init();