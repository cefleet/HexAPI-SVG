var svgHex = (function(){
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

  /*Sets Up the grid for this instance of svgHex.
    I may consider making this instanceable
  */
  function setupGrid(container,options){
    if(container){
      grid = HexAPI.setup(options);
      //draw = SVG(container);
      groups = {
        default : SVG(container)
      }

      groups['highlight'] = groups.default.nested();
      //console.log(grid);
    } else {
      console.log('You must specify a container for the SVG.');
    }
  };

  /*
    simply retrns the grid
  */
  function getGrid(){
    return grid;
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
  function drawHex(hex, options){
    options = options || gOptions;
    options.parent = options.parent || "default";

    if(!groups.hasOwnProperty(options.parent)){
      groups[options.parent] = groups.default.nested();
    }

    var parent = groups[options.parent];

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

    if(options.events){
      for(e in options.events){
        pHex.on(e, options.events[e]);
      }
    }
    return pHex;
  };



  function highlightArea(hexElem,range,options,ignoreList){
    options = options || {};
    var hexList = _idsToHex(hexElem.hex.getHexesWithinDistance(range),this);
    //oneAtATime,ringOut,ringIn
    if(options.sequence) {
      options.range = range;
      sequences[options.sequence.type](hexElem,options.sequence.delay,options,this)
    } else {
      highlightList(hexList,options);
    }
    return hexList;
  };

  function _idsToHex(list){
    //_this = _this || this;
    var hexList = {}
    for(var i = 0; i <list.length; i++){
      var id = list[i].q+'.'+list[i].r+'.'+list[i].s;
      if(grid.map.hasOwnProperty(id)){
        hexList[id] = grid.map[id];
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

  function highlightList(list,options){

    options = options || {};

    options.parent = options.parent || "highlight";
    //makes the item if it's not there
    if(!groups.hasOwnProperty(options.parent)){
      groups[options.parent] = groups.default.nested();
    }
    if(options.reset){
      resetHexes(options.reset);
    }else if(!options.noReset){
      resetHexes(options.parent);
    }

    for(h in list){
      highlightHex(list[h],options);
    }
  };

  function resetHexes(resetList){

  //  console.log(highlighted)
  //If resetList is not defined, then we need to reset all of the hexes
    if(!resetList){
      for(var p in groups){
        if(p != "default"){
          groups[p].clear()
        }
      }
    } else {
      if(!Array.isArray(resetList)){
        resetList = [resetList]
      }
      for(var i = 0; i < resetList.length; i++){
        if(groups.hasOwnProperty(resetList[i])){
          groups[resetList[i]].clear();
        }
      }
    }
  };

  function highlightHex(hex,options){
    options = options || {};
    hexElem = hex;
    options.parent = options.parent || "highlight"
    if(!groups.hasOwnProperty(options.parent)){
      groups[options.parent] = groups.default.nested();
    }

    if(options.parent != 'default'){
      groups[options.parent].front();
    }

    if(hex instanceof HexAPI.Hex){
      var hexElem = drawHex(hex,options)
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
  function drawHexes(list,options){
    options = options || gOptions;
    list = list || grid.map;
    for(h in list){
      drawHex(list[h],options)
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

//These need to be thier own classe
var anims = {
  "bounce":[
    {
      time:75,
      ease:'>',
      delay:0,
      effects:[
        {
          type:"transform",
          value:{scale:1.6}
        }
      ]
    },
    {
      time:200,
      ease:'<',
      delay:0,
      effects:[
        {
          type:"transform",
          value:{scale:0.8}
        }
      ]
    },
    {
      time:100,
      ease:'<',
      delay:0,
      effects:[
        {
          type:"transform",
          value:{scale:1}
        }
      ]
    }
  ],
  "spin":[
    {
      time:400,
      ease:'-',
      delay:0,
      effects:[{
        type:"rotate",
        value:180
        },
        {
          type:"transform",
          value:{scale:1.2}
        }
      ]
    },{
      time:400,
      ease:'-',
      delay:0,
      effects:[{
        type:"rotate",
        value:0
        },
        {
          type:"transform",
          value:{scale:1}
        }
      ]
    }
  ]
};

var sequences = {
  ringOut : function(hexElem, delay, options){
    options = options || {};
    if(options.parent && groups.hasOwnProperty(options.parent)){
      resetHexes(options.parent);
    }
    var i = 0;
    function myCallback(){
        var list = hexElem.hex.getHexesAtDistance(i);
        var elemList = _idsToHex(list,this);
        options.noReset = true;
        options.reset = null;
        highlightList(elemList,options);
        i++;
        if(i > options.range){
          clearInterval(intervalID);
        }
    }

    highlightList([hexElem.hex],options);
    var intervalID = window.setInterval(myCallback, delay);
  }
};

  return {

    setupGrid:setupGrid,
    getGrid:getGrid,
    drawHex:drawHex,
    drawHexes:drawHexes,
    animateHex:animateHex,
    highlightHex:highlightHex,
    highlightList:highlightList,
    highlightArea:highlightArea
  }
//sequences:sequences,
//  resetHexes:resetHexes,

})();

//# sourceMappingURL=svgHex.js.map