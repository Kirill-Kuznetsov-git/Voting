const { ethers } = require("ethers");
const { abi } = require("../artifacts/contracts/VotingEngine.sol/VotingEngine.json");

let provider = ethers.getDefaultProvider();
const CONTRACT_ADDRESS_RINKEBY = "0x38EB180A5b367b128f164B0Ef72c784B6E06A4cA";
let wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);
let contract = new ethers.Contract(CONTRACT_ADDRESS_RINKEBY, abi, wallet);

let provider_localhost = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
const CONTRACT_ADDRESS_LOCALHOST = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let wallet_localhost = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider_localhost);
let contract_localhost = new ethers.Contract(CONTRACT_ADDRESS_LOCALHOST, abi, wallet_localhost);


task("create_voting", "Create new voting")
    .addOptionalParam("title", "Title of voting", "test")
    .addOptionalParam("startdelay", "Pause after which voting will start", 24 * 60 * 60, types.int)
    .addOptionalParam("duration", "Duration of the voting", 3 * 24 * 60 * 60, types.int)
    .setAction(async ({ title, startdelay, duration }) =>
        await contract_localhost['createVoting(string,uint256,uint256)'](title, startdelay, duration));


task("withdraw", "Transfer commission to sender")
    .setAction(async () =>
        console.log(await contract_localhost.withdraw())
    );

task("add_candidate", "Add candidate to vote")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract_localhost["addCandidate(uint256)"](votingIndex)));

task("vote", "Vote to candidate")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .addOptionalParam("candidate", "Address of candidate", ethers.constants.AddressZero, types.address)
    .setAction(async ({votingIndex, candidate}) =>
        console.log(await contract_localhost["vote(uint256,address)"](votingIndex, candidate)));

task("end_voting", "End voting")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract_localhost["endVoting(uint256)"](votingIndex)));

task("get_fee_amount", "Get fee which now owner can withdraw")
    .setAction(async ({}) =>
        console.log(await contract_localhost.getFeeAmount()));

task("get_winner", "Get winner of voting at this moment")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract_localhost.getWinner(votingIndex)));

task("get_all_candidates", "Get list of all candidates on the voting")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract_localhost.getAllCandidates(votingIndex)));

task("get_number_votes", "Get number of votes in voting for candidate")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .addOptionalParam("candidate", "Address of candidate", ethers.constants.AddressZero, types.address)
    .setAction(async ({votingIndex,candidate}) =>
        console.log(await contract_localhost.getNumberVotes(votingIndex,candidate)));

task("get_vote_of_participant", "Get address of candidate for who participant voted")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .addOptionalParam("participant", "Address of participant", ethers.constants.AddressZero, types.address)
    .setAction(async ({votingIndex,participant}) =>
        console.log(await contract_localhost.getVoteOfParticipant(votingIndex,participant)));

task("get_ended", "Get number of fee which now owner can withdraw")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract_localhost.votingEnded(votingIndex)));

task("get_total_amount", "Get bool value about end of voting")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract_localhost.getTotalAmount(votingIndex)));
