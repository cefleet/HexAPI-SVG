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
        for(var h in grid.map){
          if(options.hexList.indexOf(h)<0){
            delete grid.map[h];
          }
        }
      }
    //if it is a string then just let it be a string

    if(typeof container == "string"){
      container = SVG(container);
    }

    var groups = {
      default : container
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

var HexAPI=function(){var a=function(a){return a=a||{},a.engine=b,new c(a)},b=function(){var a=function(a,b,c){return{q:a,r:b,s:c}},b=function(a,b){return{x:a,y:b}},c=function(b,c){return a(b.q+c.q,b.r+c.r,b.s+c.s)},d=function(b,c){return a(b.q*c,b.r*c,b.s*c)},e=function(a){return v[a]},f=function(a){return w[a]},g=function(a,b,c,d,e,f,g,h,i){return{f0:a,f1:b,f2:c,f3:d,b0:e,b1:f,b2:g,b3:h,start_angle:i}},h=function(b){var c=Math.trunc(Math.round(b.q)),d=Math.trunc(Math.round(b.r)),e=Math.trunc(Math.round(b.s)),f=Math.abs(c-b.q),g=Math.abs(d-b.r),h=Math.abs(e-b.s);return f>g&&f>h?c=-d-e:g>h?d=-c-e:e=-c-d,a(c,d,e)},i=function(a,c){var d=a.orientation,e=a.hexSize,f=2*Math.PI*(c+d.start_angle)/6;return b(e.x*Math.cos(f),e.y*Math.sin(f))},j=function(a,b){return(Math.abs(a.q-b.q)+Math.abs(a.q+a.r-b.q-b.r)+Math.abs(a.r-b.r))/2},k=function(a,b){return c(a,e(b))},m=function(a,b){var d=f(b);return c(a,d)},n=function(a,b,c){return c="pointy"==c?u.POINTY:u.FLAT,{orientation:c,hexSize:a,origin:b}},o=function(a,c){var d=a.orientation,e=a.hexSize,f=a.origin,g=(d.f0*c.q+d.f1*c.r)*e.x,h=(d.f2*c.q+d.f3*c.r)*e.y;return b(g+f.x,h+f.y)},p=function(a,c){for(var d=[],e=o(a,c),f=1;6>=f;f++){l=f,6===l&&(l=0);var g=i(a,f);d.push(b(e.x+g.x,e.y+g.y))}return d},q=function(c,d){var e=c.orientation,f=c.hexSize,g=c.origin,i=b((d.x-g.x)/f.x,(d.y-g.y)/f.y),j=e.b0*i.x+e.b1*i.y,k=e.b2*i.x+e.b3*i.y,l=a(j,k,-j-k);return h(l)},r=function(a,b){for(var c=[{q:a.q,r:a.r,s:a.s}],d=1;b>=d;d++)for(var e=s(a,d),f=0;f<e.length;f++)c.push(e[f]);return c},s=function(a,b){for(var f=[],g=c(a,d(e(4),b)),h=0;6>h;h++)for(var i=0;b>i;i++)f.push(g),g=k(g,h);return f},t=function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p=!1;return c=a[0].x,d=a[0].y,e=a[1].x,f=a[1].y,g=b[0].x,h=b[0].y,i=b[1].x,j=b[1].y,k=(j-h)*(e-c)-(i-g)*(f-d),0===k?p:(l=d-h,m=c-g,n=(i-g)*l-(j-h)*m,o=(e-c)*l-(f-d)*m,l=n/k,m=o/k,l>0&&1>l&&m>0&&1>m&&(p=!0),p)},u={POINTY:g(Math.sqrt(3),Math.sqrt(3)/2,0,1.5,Math.sqrt(3)/3,-1/3,0,2/3,.5),FLAT:g(1.5,0,Math.sqrt(3)/2,Math.sqrt(3),2/3,0,-1/3,Math.sqrt(3)/3,0)},v=[a(1,0,-1),a(1,-1,0),a(0,-1,1,!0),a(-1,0,1),a(-1,1,0),a(0,1,-1)],w=[a(2,-1,-1),a(1,-2,1),a(-1,-1,2),a(-2,1,1),a(-1,2,-1),a(1,1,-2)],x={distanceBetween:j,neighborAtDirection:k,neighborsAtDiagonal:m,createLayout:n,centerOfHex:o,cornersOfHex:p,hexAtPoint:q,getHexesWithinDistance:r,getHexesAtDistance:s,checkIfLinesIntersect:t};return x}(),c=function(a){this._init(a)};c.prototype={_init:function(a){this.engine=a.engine,a=a||{},this.hexSize=a.hexSize||{x:30,y:30},this.origion=a.origion||{x:0,y:0},this.orientation=a.orientation||"pointy",this.layout=this.engine.createLayout(this.hexSize,this.origion,this.orientation),this.rows=a.rows||30,this.cols=a.cols||20,this._createMap()},getHexList:function(){return Object.keys(this.map)},getHexAtPoint:function(a){return this.engine.hexAtPoint(this.layout,a)},_createMap:function(){this.map={};"pointy"==this.orientation?this._makePointyMap():this._makeFlatMap()},_makePointyMap:function(){for(r=0;r<this.rows;r++){var a=Math.floor(r/2);for(q=-a;q<this.cols-a;q++){var b=new HexAPI.Hex({q:q,r:r,s:-q-r,grid:this});this.map[b.id]=b}}},_makeFlatMap:function(){for(q=0;q<this.cols;q++){var a=Math.floor(q/2);for(r=-a;r<this.rows-a;r++){var b=new HexAPI.Hex({q:q,r:r,s:-q-r,grid:this});this.map[b.id]=b}}}};var d=function(a){this._init(a)};return d.prototype={_init:function(a){this.grid=a.grid,this.engine=this.grid.engine,a=a||{},this.q=a.q||0,this.r=a.r||0,this.s=a.s||0,this.id=this.q+"."+this.r+"."+this.s,this._setCenter(),this._setCorners(),this._setEdges(),this._setNeighbors(),this._setDiagonalNeighbors()},getNeighborAt:function(a){return this.neighbors[a]},getDistanceTo:function(a){return this.engine.distanceBetween(this,a)},getHexesWithinDistance:function(a){return this.engine.getHexesWithinDistance(this,a)},getHexesAtDistance:function(a){return this.engine.getHexesAtDistance(this,a)},makeHexLineTo:function(a){return this.engine._defineLineBetweenHexes(this,a)},makeStraightLineTo:function(a){return a?[this.centerPoint,a.centerPoint]:!1},getPathTo:function(a,b,c){for(var d=this._aStarGetPathTo(a,b,c),e=[],f=0;f<d.length;f++)e.push(this.grid.map[d[f].id]);return e},_aStarGetPathTo:function(a,b,c){var d;this._astarGridSetup(b,a);var e=this._aStarGrid;for(d=0;d<e.length;d++)e[d].id===this.id&&(start=e[d]),e[d].id===a.id&&(end=e[d]);var f=[];f.push(start);for(this._astarHeuristic;f.length>0;){var g=0;for(d=0;d<f.length;d++)f[d].f<f[g].f&&(g=d);var h=f[g];if(h==end){for(var i=h,j=[];i.parent;)j.push(i),i=i.parent;return j.reverse()}for(f.splice(g,1),h.closed=!0,d=0;d<h.neighbors.length;d++){var k=this._getAstarGridItemFromId(h.neighbors[d]);if(k&&!k.closed&&!k.isObstacle){var l=h.g+1,m=!1;k.visited?l<k.g&&(m=!0):(m=!0,k.h=this._astarHeuristic(k,end),k.visited=!0,f.push(k)),m&&(k.parent=h,k.g=l,k.f=k.g+k.h,k.debug="F: "+k.f+"<br />G: "+k.g+"<br />H: "+k.h)}}}return[]},_getAstarGridItemFromId:function(a){for(var b=0;b<this._aStarGrid.length;b++)if(this._aStarGrid[b].id===a)return this._aStarGrid[b]},_astarGridSetup:function(a,b){var c=[];for(var d in this.grid.map){var e=this._astartGridifyFromId(d);if(a)for(var f=0;f<a.length;f++){var g=a[f].q+"."+a[f].r+"."+a[f].s;g===e.id&&b.id!==e.id&&(e.isObstacle=!0)}c.push(e)}this._aStarGrid=c},_astartGridifyFromId:function(a){var b={};return b.id=a,b.neighbors=this.grid.map[a].neighbors,b.q=this.grid.map[a].q,b.r=this.grid.map[a].r,b.s=this.grid.map[a].s,b.f=0,b.g=0,b.h=0,b.debug="",b.parent=null,b.isObstacle=!1,b},_astarHeuristic:function(a,b){return this.engine.distanceBetween(a,b)},_setCorners:function(){this.corners=this.engine.cornersOfHex(this.grid.layout,this)},_setEdges:function(){this.edges=[],this.edges.push([this.corners[5],this.corners[0]]);for(var a=4;a>=0;a--){var b=a+1;this.edges.push([this.corners[b],this.corners[a]])}},_setCenter:function(){this.centerPoint=this.engine.centerOfHex(this.grid.layout,this)},_setNeighbors:function(){this.neighbors=[];for(var a=0;6>a;a++){var b=this.engine.neighborAtDirection(this,a);this.neighbors.push(b.q+"."+b.r+"."+b.s)}},_setDiagonalNeighbors:function(){this.diagonalNeighbors=[];for(var a=0;6>a;a++){var b=this.engine.neighborsAtDiagonal(this,a);this.diagonalNeighbors.push(b.q+"."+b.r+"."+b.s)}},_checkIfLineCrosses:function(a){for(var b=!1,c=0;c<this.edges.length;c++)if(this.edges[c]&&this.engine.checkIfLinesIntersect(a,this.edges[c])){b=!0;break}return b}},{setup:a,Engine:b,Grid:c,Hex:d}}();
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
  ringOut : function(grid,hexElem, delay, options){
    options = options || {};
    if(options.parent && grid.groups.hasOwnProperty(options.parent)){
      resetHexes(options.parent);
    }
    var i = 0;
    function myCallback(){
        var list = hexElem.hex.getHexesAtDistance(i);
        var elemList = _idsToHex(grid,list);
        options.noReset = true;
        options.reset = null;
        highlightList(grid,elemList,options);
        i++;
        if(i > options.range){
          clearInterval(intervalID);
        }
    }

    highlightList(grid,[hexElem.hex],options);
    var intervalID = window.setInterval(myCallback, delay);
  }
};

  return {

  //  setupGrid:setupGrid,
  //  getGrid:getGrid,
    newGrid: newGrid,
    getGrid:getGrid,
    getAllGrids:getAllGrids,
    drawHex:drawHex,
    drawHexes:drawHexes,
    animateHex:animateHex,
    highlightHex:highlightHex,
    highlightList:highlightList,
    highlightArea:highlightArea,
  }
//sequences:sequences,
//  resetHexes:resetHexes,

})();

//This is for the plugin system
if(classes){
  classes['svgHex'] = svgHex;
}

//# sourceMappingURL=plugin.svgHex.js.map