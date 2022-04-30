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
