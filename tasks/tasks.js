const { ethers } = require("ethers");
const { abi } = require("../artifacts/contracts/VotingEngine.sol/VotingEngine.json");

let provider = ethers.getDefaultProvider();
const CONTRACT_ADDRESS_RINKEBY = "0xfEeF22a8f923A42C187a279F5Ae7fC6d88D44A7F";
let wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);

let provider_localhost = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
const CONTRACT_ADDRESS_LOCALHOST = `${process.env.CONTRACT_ADDRESS_LOCALHOST}`;
let wallet_localhost = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider_localhost);

let network = "rinkeby"

if (network === "localhost"){
    contract = new ethers.Contract(CONTRACT_ADDRESS_LOCALHOST, abi, wallet_localhost);
} else if (network === "rinkeby"){
    contract = new ethers.Contract(CONTRACT_ADDRESS_RINKEBY, abi, wallet);
}

task("create_voting", "Create new voting")
    .addOptionalParam("title", "Title of voting", "test")
    .addOptionalParam("startdelay", "Pause after which voting will start", 24 * 60 * 60, types.int)
    .addOptionalParam("duration", "Duration of the voting", 3 * 24 * 60 * 60, types.int)
    .setAction(async ({ title, startdelay, duration }) => {
        console.log(startdelay, duration)
        await contract['createVoting(string,uint256,uint256)'](title, startdelay, duration)
    }   )


task("withdraw", "Transfer commission to sender")
    .setAction(async () =>
        console.log(await contract.withdraw())
    );

task("add_candidate", "Add candidate to vote")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract["addCandidate(uint256)"](votingIndex)));

task("vote", "Vote to candidate")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .addOptionalParam("candidate", "Address of candidate", ethers.constants.AddressZero, types.address)
    .setAction(async ({votingIndex, candidate}) =>
        console.log(await contract["vote(uint256,address)"](votingIndex, candidate)));

task("end_voting", "End voting")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        await contract["endVoting(uint256)"](votingIndex));

task("get_fee_amount", "Get fee which now owner can withdraw")
    .setAction(async ({}) =>
        console.log(await contract.getFeeAmount()));

task("get_winner", "Get winner of voting at this moment")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract.getWinner(votingIndex)));

task("get_all_candidates", "Get list of all candidates on the voting")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract["getAllCandidates(uint256)"](votingIndex)));

task("get_number_votes", "Get number of votes in voting for candidate")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .addOptionalParam("candidate", "Address of candidate", ethers.constants.AddressZero, types.address)
    .setAction(async ({votingIndex,candidate}) =>
        console.log(await contract.getNumberVotes(votingIndex,candidate)));

task("get_vote_of_participant", "Get address of candidate for who participant voted")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .addOptionalParam("participant", "Address of participant", ethers.constants.AddressZero, types.address)
    .setAction(async ({votingIndex,participant}) =>
        console.log(await contract.getVoteOfParticipant(votingIndex,participant)));

task("get_ended", "Get number of fee which now owner can withdraw")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract.votingEnded(votingIndex)));

task("get_total_amount", "Get bool value about end of voting")
    .addOptionalParam("votingIndex", "Index of voting", 0, types.int)
    .setAction(async ({votingIndex}) =>
        console.log(await contract.getTotalAmount(votingIndex)));


contract.on("VotingCreated(uint256,string,uint256,uint256)", (votingIndex, votingName, startDate, duration) => {
    console.log(`
    Event of create voting:
    Index voting: ${ethers.utils.formatUnits(votingIndex, 0)}
    Voting title: ${votingName}
    Date of voting start: ${ethers.utils.formatUnits(startDate, 0)}
    Duration of voting: ${ethers.utils.formatUnits(duration, 0)}\n`)
});
filter = {
    address: CONTRACT_ADDRESS_LOCALHOST,
    topics: [
        ethers.utils.id("VotingEnded(uint256,uint256,uint256,address)")
    ]
}
contract.on(filter, (votingIndex, numberParticipants, winnerParticipants, winner) => {
    console.log(`
    Event of end voting:
    Index voting: ${ethers.utils.formatUnits(votingIndex, 0)}
    Number of participants: ${ethers.utils.formatUnits(numberParticipants, 0)}
    Number of Participants who voted to winner: ${ethers.utils.formatUnits(numberParticipants, 0)}
    Winner address: ${winner}
    `)
})
