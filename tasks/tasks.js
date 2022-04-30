// const { ethers } = require("ethers");
//
// let provider = ethers.getDefaultProvider();
// const { abi } = require("../artifacts/contracts/VotingEngine.sol/VotingEngine.json");
// const CONTRACT_ADDRESS = "0x38EB180A5b367b128f164B0Ef72c784B6E06A4cA";
// let wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);
// let contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
//
// task("withdraw", "Transfer commission to sender")
//     .setAction(async () =>
//         console.log(await contract['getFeeAmount()']())
//     );
//
// task("create_voting", "Create new voting")
//     .addOptionalParam("title", "Title of voting", "test")
//     .addOptionalParam("startdelay", "Pause after which voting will start", 24 * 60 * 60, types.int)
//     .addOptionalParam("duration", "Duration of the voting", 3 * 24 * 60 * 60, types.int)
//     .setAction(async ({ title, startdelay, duration }) =>
//       await contract['createVoting(string,uint256,uint256)'](title, startdelay, duration));
//
