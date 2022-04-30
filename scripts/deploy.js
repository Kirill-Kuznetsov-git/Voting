// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const ethers = hre.ethers

async function main() {
  await hre.run('compile');

  const [signer] = await ethers.getSigners();

  const VotingEngine = await hre.ethers.getContractFactory("VotingEngine", signer);
  const votEngine = await VotingEngine.deploy();

  await votEngine.deployed();

  console.log("Voting deployed to:", votEngine.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
