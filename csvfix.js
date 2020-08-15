const readline = require("readline");
const fs = require("fs");

var deathColumnNumber;
var linesToRemoveDeath = [];
var linesToAddDeath = [];

function readCsvFile() {
  return new Promise((res, rej) => {
    try {
      var data = [];
      var readInterface = readline.createInterface({
        input: fs.createReadStream("./microdados.csv"),
        terminal: false,
      });

      readInterface
        .on("line", function (line) {
          lineTrim = line.trim();
          lineResult = lineTrim.split(";");
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Index da coluna DETALHAMENTO_STATUS: \n", (answer) => {
  deathColumnNumber = answer ? parseInt(answer) : 11;

  rl.question("Linhas a remover separado por espaços: \n", (answer) => {
    linesToRemoveDeath = answer.split(" ");
    if (linesToRemoveDeath.length === 1 && linesToRemoveDeath[0] === "") {
      linesToRemoveDeath.pop();
    }

    rl.question("Linhas a adicionar separado por espaços: \n", (answer) => {
      linesToAddDeath = answer.split(" ");
      if (linesToAddDeath.length === 1 && linesToAddDeath[0] === "") {
        linesToAddDeath.pop();
      }

      readCsvFile().then(function (result) {
        var fileResult = "";

        result = result.map(function (line) {
          return line.map(function (column) {
            return column.replace(/\r\n|\n|\r/gm, "");
          });
        });

        linesToRemoveDeath.map(function (value) {
          value = parseInt(value);
          console.log("linha remover obito: ", value);
          console.log(result[value]);
          if (result[value][deathColumnNumber] === "RECUPERADO") {
            throw "[ERROR] recovered line";
          } else if (result[value][deathColumnNumber] === "RECUPERADO") {
          }

          result[value][deathColumnNumber] = "";
        });

        linesToAddDeath.map(function (value) {
          value = parseInt(value);
          console.log("linha add obito: ", value);
          console.log(result[value]);
          if (result[value][deathColumnNumber] === "RECUPERADO") {
            throw "[ERROR] recovered line";
          }

          result[value][deathColumnNumber] = "OBITO";
        });

        result.map(function (line) {
          fileResult += line.join(";") + "\n";
        });

        fs.writeFile("fixed_microdados.csv", fileResult, function (err) {
          if (err) throw err;
          console.log("File was created successfully.");
          rl.close();
        });
      });
    });
  });
});
