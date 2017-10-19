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
