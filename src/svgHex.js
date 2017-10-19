var svgHex = (function(){
  var grids = {};
  //sets up the grid needed for the whole thing to work
  var grid = null;

  var groups = {}
      //These are the default options
  var gOptions = {
      stroke: {
        width:2,
        color:"#3E3E3E"
      },
      fill:{
        color:"#E3E3E3"
      },
      highlight:{
        color:"#F06"
      }
  };

  function newGrid(container,options){
    if(container){
      var id = Math.random();
      grids[id] = {
        id:id
      };
      var g = _setupGrid(container,options);
      grids[id]['groups'] = g[1];
      grids[id]['grid'] = g[0];
      return grids[id];
    } else {
      console.warn('You must specify a container for the SVG.');
      return false;
    }
  };

  function getGrid(id){
    return grids[id];
  };

  function getAllGrids(){
    return grids;
  };

  /*Sets Up the grid for this instance of svgHex.
    I may consider making this instanceable
  */
  function _setupGrid(container,options){
    var grid = HexAPI.setup(options);
      //draw = SVG(container);
      if(options.hexList){
        console.log(grid);
        for(var h in grid.map){
          if(options.hexList.indexOf(h)<0){
            delete grid.map[h];
          }
        }
      }
    var groups = {
      default : SVG(container)
    }

    groups['highlight'] = groups.default.nested();

    return [grid, groups];
      //console.log(grid);

  };

  /*
  Hex needs to be a valid hexAPI hex and options is an object:
    stroke : object that validates against svg.js
    fill : object that validats against svg.js
    animate: false / null Or object
      animate object:
        length : number milliseconds how long to run the animation
        ease: string ('<',">","<>","-")
        delay: number milliseconds to delay
    events : object of events and functions.
      events objects:
        "eventType": function
  */
  function drawHex(grid,hex,options){
    options = options || gOptions;
    options.parent = options.parent || "default";

    if(!grid.groups.hasOwnProperty(options.parent)){
      grid.groups[options.parent] = grid.groups.default.nested();
    }

    var parent = grid.groups[options.parent];

    var points = [];
    var pHex;

    for(var i = 0; i < hex.corners.length; i++){
      points.push([hex.corners[i].x,hex.corners[i].y])
    }

    if(options.animate){
      pHex = parent
          .polygon([hex.centerPoint.x,hex.centerPoint.y])
          .fill(options.fill)
          .stroke(options.stroke);

          var e = options.animate.ease || '-';
          var d = options.animate.delay || 0;
          var t = options.animate.time || 300;

          pHex.animate(t,e,d).plot(points);
    } else {
      pHex = parent
          .polygon(points)
          .fill(options.fill)
          .stroke(options.stroke);
    }
    //this top one may not be needed
    //hex.svgElement = pHex;
    pHex.hex = hex;
    pHex.grid = grid;
    if(options.events){
      for(e in options.events){
        pHex.on(e, options.events[e]);
      }
    }
    return pHex;
  };



  function highlightArea(grid,hexElem,range,options,ignoreList){
    options = options || {};
    var hexList = _idsToHex(grid,hexElem.hex.getHexesWithinDistance(range));
    //oneAtATime,ringOut,ringIn
    if(options.sequence) {
      options.range = range;
      sequences[options.sequence.type](grid,hexElem,options.sequence.delay,options,this)
    } else {
      highlightList(grid,hexList,options);
    }
    return hexList;
  };

  function _idsToHex(grid,list){
    //_this = _this || this;
    var hexList = {}
    for(var i = 0; i <list.length; i++){
      var id = list[i].q+'.'+list[i].r+'.'+list[i].s;
      if(grid.grid.map.hasOwnProperty(id)){
        hexList[id] = grid.grid.map[id];
      }
    }
    return hexList;
  };

/*
  var _idsTosvgElem = function(list,_this){
    _this = _this || this;
    var elemList = {}
    for(var i = 0; i <list.length; i++){
      var id = list[i].q+'.'+list[i].r+'.'+list[i].s;
      if(_grid.map.hasOwnProperty(id)){
        if(_grid.map[id].hasOwnProperty("svgElement")){
          elemList[id] = _grid.map[id].svgElement
        }
      }
    }
    return elemList;
  };
*/

  function highlightList(grid,list,options){

    options = options || {};

    options.parent = options.parent || "highlight";
    //makes the item if it's not there
    if(!grid.groups.hasOwnProperty(options.parent)){
      grid.groups[options.parent] = grid.groups.default.nested();
    }
    console.log(options);
    if(options.reset){
      resetHexes(grid,options.reset);
    }else if(!options.noReset){
      resetHexes(grid,options.parent);
    }

    for(h in list){
      highlightHex(grid,list[h],options);
    }
  };

  function resetHexes(grid,resetList){

  //  console.log(highlighted)
  //If resetList is not defined, then we need to reset all of the hexes
    if(!resetList){
      for(var p in grid.groups){
        if(p != "default"){
          grid.groups[p].clear()
        }
      }
    } else {
      if(!Array.isArray(resetList)){
        resetList = [resetList]
      }
      for(var i = 0; i < resetList.length; i++){
        if(grid.groups.hasOwnProperty(resetList[i])){
          grid.groups[resetList[i]].clear();
        }
      }
    }
  };

  function highlightHex(grid,hex,options){
    options = options || {};
    hexElem = hex;
    options.parent = options.parent || "highlight"
    if(!grid.groups.hasOwnProperty(options.parent)){
      grid.groups[options.parent] = grid.groups.default.nested();
    }

    if(options.parent != 'default'){
      grid.groups[options.parent].front();
    }

    if(hex instanceof HexAPI.Hex){
      var hexElem = drawHex(grid,hex,options)
    }
    options.fill = options.fill || {color:gOptions.highlight.color, opacity:1};

    //fade should be a time and easing
    if(options.fade){
      //do the fade in thing here
      var t = options.fade.time || 200;
      var e = options.fade.ease || '-';
      hexElem.animate(t,e,0).fill(options.fill);
    } else {
      hexElem.fill(options.fill);
    }

    if(options.animate){
      if(typeof options.animate == 'string'){
        animateHex(hexElem,options.animate);
      }
    }
  };

  //The options list is the default list
  function drawHexes(grid,list,options){
    options = options || gOptions;
    list = list || grid.grid.map;
    for(h in list){
      drawHex(grid,list[h],options)
    }
  };

  function _createAnimString(anim){
    eString = "";
    for(var i = 0; i<anim.length; i++){
      var aSec = anim[i];
      eString += ".animate("+aSec.time+","+'"'+aSec.ease+'",'+aSec.delay+")";
      for(var e = 0; e< aSec.effects.length; e++){
        if(typeof aSec.effects[e].value == 'object'){
          eString += "."+aSec.effects[e].type+"({";
            for(v in aSec.effects[e].value){
              eString += v+":"+aSec.effects[e].value[v]
            }
          eString += "})";
        } else {
          eString += "."+aSec.effects[e].type+"("+aSec.effects[e].value+")";
        }
      }
    }
    return eString;
  };

  function animateHex(hexElem, animName, front){
    if(typeof front == "undefined"){
      front = true;
    }
    if(front){
      hexElem.front();
    }
    var anim = anims[animName];
    var eString = 'hexElem';
    eString += _createAnimString(anim);
    eval(eString);
  };
