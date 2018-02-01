var exports = module.exports = {};
var prInfo;
var github = require('octonode');
// debugger
var fs = require('fs');
var PDFDocument = require('pdfkit');
// Create a document
var doc = new PDFDocument;
doc.pipe(fs.createWriteStream('pdf/' + Math.random().toString().split('.')[1] + '.pdf'));
var setPageBorder = function() {
  doc.lineCap('butt')
    .moveTo(15, 15)
    .lineTo(596, 15)
    .stroke();
  doc.lineCap('butt')
    .moveTo(15, 15)
    .lineTo(15, 770)
    .stroke();
  doc.lineCap('butt')
    .moveTo(15, 770)
    .lineTo(596, 770)
    .stroke();
  doc.lineCap('butt')
    .moveTo(596, 15)
    .lineTo(596, 770)
    .stroke();
};

var setResultStructure = function(result, x) {
  doc.lineCap('butt')
      .moveTo(40, 310 + x)
      .lineTo(530, 310 + x)
      .stroke();
    doc.lineCap('butt')
      .moveTo(40, 330 + x)
      .lineTo(530, 330 + x)
      .stroke();

    doc.lineCap('butt')
      .moveTo(40, 370 + x)
      .lineTo(530, 370 + x)
      .stroke();
    
    doc.fontSize(14).text('TODO:HDC', 50, 315 + x);
    doc.fontSize(14).text('TODO:CMS', 150, 315 + x);
    doc.fontSize(14).text('TODO:NMC', 250, 315 + x);
    doc.fontSize(14).text('TODO:TCF', 350, 315 + x);
    doc.fontSize(14).text('TODO:DCR', 450, 315 + x);
    doc.fontSize(18).text('Total TODOs: ', 50, 390 + x);

    doc.fontSize(14).text(result.HDC, 50, 345 + x);
    doc.fontSize(14).text(result.CMS, 150, 345 + x);
    doc.fontSize(14).text(result.NMC, 250, 345 + x);
    doc.fontSize(14).text(result.TCF, 350, 345 + x);
    doc.fontSize(14).text(result.DCR, 450, 345 + x);
    doc.fontSize(18).text(result.TODO, 200, 390 + x);

};
var fillDataInPDF = function(searchDetails, prInfo, s) {
  debugger
  var totalHDC = 0;
  var totalCMS = 0;
  var totalNMC = 0;
  var totalTCF = 0;
  var totalDCR = 0;
  var totalTODO = 0;
  for (var i in searchDetails) {
    totalHDC += searchDetails[i].result.HDC;
    totalCMS += searchDetails[i].result.CMS;
    totalNMC += searchDetails[i].result.NMC;
    totalTCF += searchDetails[i].result.TCF;
    totalDCR += searchDetails[i].result.DCR;
    totalTODO += searchDetails[i].result.TODO;
  }
  var result = {
    HDC: totalHDC,
    CMS: totalCMS,
    NMC: totalNMC,
    TCF: totalTCF,
    DCR: totalDCR,
    TODO: totalTODO
  };
  setPageBorder();
  doc.fontSize(25)
    .text(prInfo.repo, 100, 50, {
      align: 'center',
      underline: true
    });
  setResultStructure(result, 0);
  doc.fontSize(14).text('Date:', 100, 110);
  doc.fontSize(12).text(Date(), 250, 111);
  doc.fontSize(14).text('Pull Request:', 100, 140);
  doc.fontSize(12).text(prInfo.repo + ' #' + prInfo.number, 250, 141);
  doc.fontSize(14).text('Generated By:', 100, 170);
  doc.fontSize(12).text(prInfo.client.token.username, 250, 171);

  doc.fontSize(18).text('Quick Summary', 100, 270, {
    underline: true,
    align: 'center'
  });
  doc.addPage();
  setPageBorder();
  doc.fontSize(25).text('File View of Code Review Report', 100, 80, {
    align: 'center'
  });
  doc.fontSize(18).text('Total Files scanned:', 100, 150);
  doc.fontSize(18).text(searchDetails[0].totalFiles, 300, 150);
  doc.fontSize(18).text('Total Files with TODOs:', 100, 180);
  doc.fontSize(18).text(s, 300, 180);
  doc.fontSize(25).text('File View of Code Review Report', 100, 80, {
    align: 'center'
  });
  var x = 0;
  for (var i in searchDetails) {
    setResultStructure(searchDetails[i].result, x);
    doc.fontSize(14).text('File Name: ' + searchDetails[i].fileName, 50, 235 + x);
    x = x + 300;
  }
  doc.save();

  doc.end();
  debugger
}

var client = github.client({
  username: 'varung-optimus',
  password: 'optimus*1234'
});

var ghpr = client.pr('optimusinfo/Paretologic', 42);
var gitDetails = {
  gitPrInfo: ghpr,
  searchResult: []
};

// debugger
var traverseFiles = function(files) {
  debugger
  var todoCounter = 0;
  var hdcCounter = 0;
  var s = 0;
  for (var fileIndex in files) {
    // debugger
    if (files[fileIndex].patch) {
      var items = files[fileIndex].patch || {};
      var itemFound = items.match(/TODO/g);
      var currentFileInfo = {};
      if (itemFound !== null) {
        s++;
        var HDC = items.match(/TODO:HDC/g) !== null ? items.match(/TODO:HDC/g).length : 0;
        var CMS = items.match(/TODO:CMS/g) !== null ? items.match(/TODO:CMS/g).length : 0;
        var NMC = items.match(/TODO:NMC/g) !== null ? items.match(/TODO:NMC/g).length : 0;
        var TCF = items.match(/TODO:TCF/g) !== null ? items.match(/TODO:TCF/g).length : 0;
        var DCR = items.match(/TODO:DCR/g) !== null ? items.match(/TODO:DCR/g).length : 0;
        var TODO = items.match(/TODO/g) !== null ? items.match(/TODO/g).length : 0;
        currentFileInfo = {
          fileName: files[fileIndex].filename,
          totalFiles: files.length,
          result: {
            HDC: HDC,
            NMC: NMC,
            CMS: CMS,
            TCF: TCF,
            DCR: DCR,
            TODO: TODO
          }
        };
        // debugger
        gitDetails.searchResult.push(currentFileInfo);
        // debugger
      }
    }
  }
  // currentFileInfo.filesWithTodo = s;
  // debugger
  fillDataInPDF(gitDetails.searchResult, gitDetails.gitPrInfo, s);
  // fillDataInGoogleDriveSpreadSheet();
}

// Get Pull Request Committed files
var getPullRequestFilesCallback = function(err, data, headers) {
  // debugger
  if (err) {
    return err;
  }
  else {
    traverseFiles(data);
  }
};
ghpr.files(getPullRequestFilesCallback);
