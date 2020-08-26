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

    for await (const line of readInterface) {
      let shouldJoinNextLine = false;

      let lineWithoutBreakline = line.replace(/(\r\n|\n|\r)/gm,"");

      fullLine += lineWithoutBreakline;

      let numberOfDoubleQuotes = (fullLine.match(/"/g)||[]).length;

      if (numberOfDoubleQuotes % 2 === 1) {
        shouldJoinNextLine = true;
      }

      if (!shouldJoinNextLine) {
        let splittedFullLine = fullLine.split(';');
        data.push(splittedFullLine);
        fullLine = '';
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
  console.log('Linhas para adicionar obito separadas por espaço: ');
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

  for (let i = 0; i < linesToRemoveDeath.length; i++) {
    let value = parseInt(linesToRemoveDeath[i]);

    if (result[value - 1][deathColumnNumber - 1] === "RECUPERADO") {
      console.error('Linha com status RECUPERADO não deve ser substituída');
    }

    result[value - 1][deathColumnNumber - 1] = "";
  }

  for (let i = 0; i < linesToAddDeath.length; i++) {
    let value = parseInt(linesToAddDeath[i]);

    if (result[value - 1][deathColumnNumber - 1] === "RECUPERADO") {
      console.error('Linha com status RECUPERADO não deve ser substituída');
    }

    result[value - 1][deathColumnNumber - 1] = "OBITO";
  }

  result.map(function (line) {
    fileResult += line.join(';') + "\n";
  });

  await fsPromises.writeFile("fixed_microdados.csv", fileResult);

  console.log("File was created successfully.");

  rlBash.close();

  process.exit(0);
};

main();