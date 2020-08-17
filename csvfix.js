const readline = require("readline");
const fs = require("fs");
const fsPromises = fs.promises;

const rlBash = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getLine = (function () {
  const getLineGen = (async function* () {
      for await (const line of rlBash) {
          yield line;
      }
  })();
  return async () => ((await getLineGen.next()).value);
})();

const readCsvFile = async () => {
  try {
    let data = [];

    let readInterface = await readline.createInterface({
      input: fs.createReadStream("./microdados.csv"),
      terminal: false,
    });

    let fullLine = '';
    let lineCounter = 1;

    for await (const line of readInterface) {
      let shouldJoinNextLine = false;

      let lineWithoutBreakline = line.replace(/(\r\n|\n|\r)/gm,"");

      fullLine += lineWithoutBreakline;

      let splittedByDoubleQuote = fullLine.split('"');

      if (splittedByDoubleQuote.length % 2 === 0) {
        shouldJoinNextLine = true;
      }

      if (!shouldJoinNextLine) {
        data.push(fullLine);
        fullLine = '';
        //console.log(`line ${lineCounter++} success`);
      }
    }

    readInterface.close();

    return data;
  } catch (err) {
    console.error(err.message);
  }
}

const main = async () => {
  console.log('Numero da coluna DETALHAMENTO_STATUS: ');
  let deathColumnNumber = await getLine();
  console.log('Linhas para remover obito separadas por espaço: ');
  let linesToRemoveDeath = await getLine();
  console.log('Linhas adicionar obito separadas por espaço: ');
  let linesToAddDeath = await getLine();

  deathColumnNumber = deathColumnNumber ? parseInt(deathColumnNumber) : 11;
  linesToRemoveDeath = linesToRemoveDeath ? linesToRemoveDeath.split(' ') : [];
  linesToAddDeath = linesToAddDeath ? linesToAddDeath.split(' ') : [];

  if (linesToRemoveDeath.length === 1 && linesToRemoveDeath[0] === "") {
    linesToRemoveDeath.pop();
  }

  if (linesToAddDeath.length === 1 && linesToAddDeath[0] === "") {
    linesToAddDeath.pop();
  }

  let result = await readCsvFile();

  let fileResult = "";

  linesToRemoveDeath.forEach(function (value) {
    value = parseInt(value);
    if (result[value-1][deathColumnNumber] === "RECUPERADO") {
      throw "[ERROR] recovered line";
    }

    result[value-1][deathColumnNumber] = "";
    console.log('obito removido na linha ' + value + '\n', result[value-1] + '\n\n');
  });

  linesToAddDeath.forEach(function (value) {
    value = parseInt(value);
    if (result[value-1][deathColumnNumber] === "RECUPERADO") {
      throw "[ERROR] recovered line";
    }

    result[value-1][deathColumnNumber] = "OBITO";
    console.log('obito adicionado na linha ' + value + '\n', result[value-1] + '\n\n');
  });

  result.map(function (line) {
    fileResult += line + "\n";
  });

  await fsPromises.writeFile("fixed_microdados.csv", fileResult);

  console.log("File was created successfully.");

  rlBash.close();

  process.exit(0);
};

main();