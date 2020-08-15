const readline = require("readline");
const fs = require("fs");

function readCsvFile() {
  return new Promise((res, rej) => {
    try {
      var data = [];
      var readInterface = readline.createInterface({
        input: fs.createReadStream('./microdados.csv'),
        terminal: false,
      });

      readInterface
        .on("line", function (line) {
          lineTrim = line.trim();
          lineResult = lineTrim.split(';');
          data.push(lineResult);
        })
        .on("close", function () {
          res(data);
        });
    } catch (err) {
      rej(err);
    }
  });
}

readCsvFile().then(function (result) {
  var fileResult = '';

  result.map(function (line) {
    line.map(function (column) {
      column.replace(/(\r\n|\n|\r)/gm,"");
    });

    fileResult += line.join(';') + '\n';
  });

  fs.writeFile('fixed_microdados.csv', fileResult, function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
});

