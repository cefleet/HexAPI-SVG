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
