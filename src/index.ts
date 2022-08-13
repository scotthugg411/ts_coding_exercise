import * as fs from "fs";
import * as path from "path";

/**
 * get array/list of all the logs file names
 * @returns array/list of file names
 */
const getFileNamesList = async () => {
  return fs
    .readdirSync("./logs")
    .filter((file) => path.extname(file) === ".json");
};

/**
 * get emails array/list for single logs file
 * @param fileName
 * @returns emails from single logs file
 */
const getEmailsListFromLogsFile = async (fileName: any) => {
  const emailsInFile: string[] = [];

  const fileData = fs.readFileSync(path.join("./logs", fileName), "utf8");
  const parsedFileData = JSON.parse(fileData);
  const logsList = parsedFileData.logs;

  await logsList.forEach((logObject: { email: string }, index: number) => {
    const currentEmail: string = logObject.email;
    //console.log("current email -->", currentEmail);
    emailsInFile[index] = currentEmail;
  });
  return emailsInFile;
};

/**
 * generates a final emails list/array
 * combines the separated email lists into one
 * @param separatedEmailList
 * @returns
 */
const generateFinalEmailList = async (separatedEmailList: string[]) => {
  const allEmailsFinalList: any = [];
  let count = 0;

  separatedEmailList.forEach(async (emailList: any) => {
    //console.log(emailList);
    await emailList.forEach((email: string) => {
      //console.log(email);
      allEmailsFinalList[count] = email;
      count++;
    });
  });

  //console.log("Total of all emails-->", count);
  return allEmailsFinalList;
};

/**
 * global email tally totals
 * @param finalEmailsList
 * @returns total tally for unique emails
 */
const tallyGlobalEmailTotals = async (finalEmailsList: string[]) => {
  const counts: any = {};
  finalEmailsList.forEach((el) => (counts[el] = 1 + (counts[el] || 0)));
  return counts;
};

/**
 * Main Orchestrator
 */
const main = async () => {
  console.log("Program starting...");
  // tracking program timing
  console.time("Program Time");
  try {
    // get file names list
    const fileNamesList = await getFileNamesList();
    //console.log(fileNamesList);

    // load promiseArray for getEmailsFromLogsFile
    const promiseArray: any[] = [];
    fileNamesList.forEach((logFileName, index) => {
      const currentEmailList: any = getEmailsListFromLogsFile(logFileName);
      promiseArray[index] = currentEmailList;
    });
    // console.log(promiseArray);

    // asynchronously load separated email lists from promiseArray
    const separatedEmailLists = await Promise.all(promiseArray);
    // console.log(separatedEmailLists);

    // combine the array of arrays separated emails lists into one
    const finalEmailsList = await generateFinalEmailList(separatedEmailLists);
    //console.log(finalEmailsList);

    // calculate global final emails tally
    const finalEmailsTally = await tallyGlobalEmailTotals(finalEmailsList);

    // program time output
    console.timeEnd("Program Time");

    // final emails tally output
    console.log(finalEmailsTally);
  } catch (error) {
    console.error("an error occurred-->", error);
  } finally {
    console.log("Program ended");
  }
};

main();
