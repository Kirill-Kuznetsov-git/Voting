const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
const account0 = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
const account9 = new ethers.Wallet("0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6", provider);
const { abi } = require("../artifacts/contracts/VotingEngine.sol/VotingEngine.json");
const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

task("withdraw", "Transfer commission to sender", async (taskArgs, hre) => {
  await contract.connect(account0).withdraw();
})

task("create_voting", "Create new voting")
    .addOptionalParam("title", "Title of voting", "test")
    .addOptionalParam("startdelay", "Pause after which voting will start", 24 * 60 * 60, types.int)
    .addOptionalParam("duration", "Duration of the voting", 3 * 24 * 60 * 60, types.int)
    .setAction(async ({ title, startdelay, duration }) =>
      await contract.connect(account)['createVoting(string,uint256,uint256)'](title, startdelay, duration));

