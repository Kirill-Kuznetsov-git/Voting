const { ethers } = require("ethers");

let provider = ethers.getDefaultProvider();
const { abi } = require("../artifacts/contracts/VotingEngine.sol/VotingEngine.json");
const CONTRACT_ADDRESS = "0xD227EFaFBeA72bFfFCc2f8C9245D1d1C5badA95B";
let privateKey = `${process.env.PRIVATE_KEY}`;
let wallet = new ethers.Wallet(privateKey, provider);
let contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

task("withdraw", "Transfer commission to sender", async (taskArgs, hre) => {
  await contract.withdraw();
})

// task("create_voting", "Create new voting")
//     .addOptionalParam("title", "Title of voting", "test")
//     .addOptionalParam("startdelay", "Pause after which voting will start", 24 * 60 * 60, types.int)
//     .addOptionalParam("duration", "Duration of the voting", 3 * 24 * 60 * 60, types.int)
//     .setAction(async ({ title, startdelay, duration }) =>
//       await contract.connect(account)['createVoting(string,uint256,uint256)'](title, startdelay, duration));
//
