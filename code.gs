/* YOU CAN EDIT THESE ZONE BEGINS */
  
  const WR_SHEET_NAME = "Records" // Name of the sheet with all the records
  
  // STARTING_ROW and STARTING_COLUMN are NOT Zero-Indexed
  // Enter the actual row and col you see on the spreadsheet
  
  const STARTING_COLUMN = 'C'; // the column of basic tank FFA's score (or whatever the leftmost score column is)
                               // MAKE SURE TO SURROUND THE LETTER WITH '', like 'C'
  
  const STARTING_ROW = 16; // the row number of basic tank
   
  const MIN_RECORDS_TO_CALCULATE_RATIO = 5; // players with less than this many wr's will not have their ratio calculated
  
  const TANK_NAMES_COLUMN = 'B'; // column that the tanknames are in



  const PLAYER_SHEET_TO_DISPLAY_RESULTS_ON = "New_Calculations"; // sheet on which the results of PLAYER_STATS() are printed

  // cell where the results will begin being printed in
  // this value is the top left, so the results will be printed to the right and below it
  // make sure nothing is immediately to the right or bottom of this cell or it will be overwritten
  const PLAYER_COLUMN_OF_TOP_LEFT_CELL = 'F';
  const PLAYER_ROW_OF_TOP_LEFT_CELL = 3;



  const TANK_SHEET_TO_DISPLAY_RESULTS_ON = "New_Calculations"; // sheet on which the results of TANK_STATS() are printed

  // cell where the results will begin being printed in
  // this value is the top left, so the results will be printed to the right and below it
  // make sure nothing is immediately to the right or bottom of this cell or it will be overwritten
  const TANK_COLUMN_OF_TOP_LEFT_CELL = 'M';
  const TANK_ROW_OF_TOP_LEFT_CELL = 3;
  

  /* YOU CAN EDIT THESE ZONE ENDS */
  /* DO NOT EDIT ANYTHING OUTSIDE OF THIS ZONE !!! */






/* ------------------------------------------------------------------------------------------- 
   DO NOT EDIT ANYTHING UNDER THIS LINE UNLESS YOU ACTUALLY KNOW HOW TO CODE
                                                                      ~ Road
------------------------------------------------------------------------------------------- */




function GET_PLAYER_STATS(values) {
  
  const startingRowZeroIndex = STARTING_ROW - 1;
  const startingColZeroIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  
  const numRows = values.length;
  const numCols = values[startingRowZeroIndex].length;
    
  let playerObj = {};
  
  // iterate through every record, and adjust each player's numRecords and combinedRecordScore
  for (let row = startingRowZeroIndex; row < numRows; ++row) {  
    for (let col = startingColZeroIndex; col < numCols; col += 3) { // yes, its += 3
      
      // if the proof link cell is empty, then you're currently not looking at a record and should skip ahead
      // for example, the blank row between tier 1,2,3,4 tank records or the gamemode name rows
      const proofLink = values[row][col + 2];
      if (proofLink === "") {
        continue;
      }
      
      const score = values[row][col]
      const name = values[row][col + 1];
      
      // if player already exists in object, then adjust their properties accordingly
      // else, then it is the first record of that player that we have come across
      // so give make their numRecords = 1, and combinedRecordsScore = score
      if (playerObj.hasOwnProperty(name)) {
        playerObj[name].numRecords += 1;
        playerObj[name].combinedRecordScore += score;
      }
      else {
        playerObj[name] = {numRecords: 1, combinedRecordScore: score};
      }
      
    }
  }
  
  
  let playerArray = [];
  
  // second loop to calculate wr ratios for all players with at least MIN_RECORDS_TO_CALCULATE_RATIO wr's, alongside the name format used alongside the ratio
  // and also to convert the playerObj into a 2d array that can be used in google sheets
  // this is in a second loop so that the ratios & ratio player name format are only calculated once overall, and not for every record a player has    
  for (let playerName in playerObj) {
    
    if (playerObj[playerName].numRecords >= MIN_RECORDS_TO_CALCULATE_RATIO) {
      playerObj[playerName].ratio = (playerObj[playerName].combinedRecordScore / playerObj[playerName].numRecords); 
    }
    else {
      // this is so that the ratio for players with less than MIN_RECORDS_TO_CALCULATE_RATIO
      // will automatically fall to the bottom of the rankings
      playerObj[playerName].ratio = -1;
    }
    
    // make the ratio player name format
    playerObj[playerName].ratioPlayerNameFormat = playerName + " (" + playerObj[playerName].numRecords + " WR)";
    
    
    // convert playerObj into a 2d array usable by google sheets
    const playerArrayRow = [playerName, playerObj[playerName].numRecords, playerObj[playerName].combinedRecordScore, playerObj[playerName].ratio, playerObj[playerName].ratioPlayerNameFormat];
    playerArray.push(playerArrayRow);
  }
  
  
  return playerArray;
}



function GET_TANK_STATS(values) {
  
  const startingRowZeroIndex = STARTING_ROW - 1;
  const startingColZeroIndex = STARTING_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  const tankNamesColZeroIndex = TANK_NAMES_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);
  
  const numRows = values.length;
  const numCols = values[startingRowZeroIndex].length;
    
  let tankObj = {};
  
  // for each row, make a tank property and fill it with the sum of the record scores done with that tank
  for (let row = startingRowZeroIndex; row < numRows; ++row) {
    
    // if the proof link cell is empty, then you're currently not looking at a record and should skip ahead to the next row
    // for example, the blank row between tier 1,2,3,4 tank records or the gamemode name rows
    const proofLink = values[row][startingColZeroIndex + 2];
    if (proofLink === "") {
      continue;
    }
    
    // initialize a tank's combined record score as 0
    const tankName = values[row][tankNamesColZeroIndex]; // gets the actual name of the tank in the current row
    tankObj[tankName] = 0;
    
    for (let col = startingColZeroIndex; col < numCols; col += 3) { //yes, its += 3
      
      const score = values[row][col] || 0; // if theres no existing record for a gamemode, assume that that record is 0 points
      tankObj[tankName] += score;
    }
  }
  
  
  // Convert the tankObj into a 2d array, so we can use it in Google Sheets
  let tankArray = [];
  
  for (let tankName in tankObj) {
    const tankArrayRow = [tankName, tankObj[tankName] ];
    
    tankArray.push(tankArrayRow);
  }
  
  return tankArray;
}



function PRINT_ARRAY(arrayToPrint, sheetName, cellColumn, cellRow) {
  
  const numRows = arrayToPrint.length;
  const numCols = arrayToPrint[0].length;
  
  // These are NOT zero-indexed, they start at 1
  const startingColIndex = cellColumn.charCodeAt(0) - 'A'.charCodeAt(0) + 1; // 1-indexed, not 0-indexed
  const startingRowIndex = cellRow;
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const range = sheet.getRange(startingRowIndex, startingColIndex, numRows, numCols);
  
  // Array will be printed on sheetName starting at, and extending down and to the right of, the cell at (cellColumn,cellRow)
  range.setValues(arrayToPrint);
}



function onEdit(event) {
  
  const editedSheetName = event.range.getSheet().getName();
  
  if (editedSheetName !== WR_SHEET_NAME) { // only trigger the other functions when the main wr sheet is edited
    return;  
  }
  
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WR_SHEET_NAME);
  
  // getDataRange returns the entire "Records" sheet 
  // I'm doing it like this so that I don't have to constantly update the script
  // whenever theres a new tank or gamemode
  const values = sheet.getDataRange().getValues();
  
  const playerArray = GET_PLAYER_STATS(values);
  const tankArray = GET_TANK_STATS(values);
  
  PRINT_ARRAY(playerArray, PLAYER_SHEET_TO_DISPLAY_RESULTS_ON, PLAYER_COLUMN_OF_TOP_LEFT_CELL, PLAYER_ROW_OF_TOP_LEFT_CELL);
  PRINT_ARRAY(tankArray, TANK_SHEET_TO_DISPLAY_RESULTS_ON, TANK_COLUMN_OF_TOP_LEFT_CELL, TANK_ROW_OF_TOP_LEFT_CELL);
}
