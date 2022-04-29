const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let owner
  let firstCandidate
  let secondCandidate
  let firstParticipant
  let secondParticipant

  beforeEach(async function (){
    [owner, firstParticipant, secondParticipant, firstCandidate, secondCandidate] = await ethers.getSigners()

    const VotingEngine = await ethers.getContractFactory("VotingEngine", owner)
    votingEngine = await VotingEngine.deploy()
    await votingEngine.deployed()
  })

  async function getTimestamp(bn) {
    return (
        await ethers.provider.getBlock(bn)
    ).timestamp
  }

  it("create Voting correctly without start time and duration", async function(){
    const tx = await votingEngine['createVoting(string)']("test Voting")

    const cVoting = await votingEngine.votings(0)
    console.log(cVoting)
    const ts = await getTimestamp(tx.blockNumber)

    expect(cVoting.title).to.eq("test Voting")
    expect(cVoting.startAt).to.eq(ts + 24 * 60 * 60)
    expect(cVoting.endAt).to.eq(ts + 4 * 24 * 60 * 60)
  })

  it("create Voting correctly with start time and without duration", async function(){
    const tx = await votingEngine['createVoting(string,uint256)']("test Voting 1", ethers.BigNumber.from("24"))

    const cVoting = await votingEngine.votings(0)
    console.log(cVoting)
    const ts = await getTimestamp(tx.blockNumber)

    expect(cVoting.title).to.eq("test Voting 1")
    expect(cVoting.startAt).to.eq(ts + 24)
    expect(cVoting.endAt).to.eq(ts + 24 + 3 * 24 * 60 * 60)
  })

  it("create Voting correctly with start time and duration", async function(){
    const tx = await votingEngine['createVoting(string,uint256,uint256)']("test Voting 2", 24, 24)

    const cVoting = await votingEngine.votings(0)
    console.log(cVoting)
    const ts = await getTimestamp(tx.blockNumber)

    expect(cVoting.title).to.eq("test Voting 2")
    expect(cVoting.startAt).to.eq(ts + 24)
    expect(cVoting.endAt).to.eq(ts + 24 * 2)
  })
})
