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
