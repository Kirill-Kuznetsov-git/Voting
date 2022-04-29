const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

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

  describe("createVoting", function() {
    it("create Voting correctly without start time and duration", async function(){
      const tx = await votingEngine['createVoting(string)']("test Voting")

      const cVoting = await votingEngine.votings(0)
      const ts = await getTimestamp(tx.blockNumber)

      expect(cVoting.title).to.eq("test Voting")
      expect(cVoting.startAt).to.eq(ts + 24 * 60 * 60)
      expect(cVoting.endAt).to.eq(ts + 4 * 24 * 60 * 60)

      await expect(tx).to.emit(votingEngine, 'VotingCreated').withArgs(0, 'test Voting', ts + 24 * 60 * 60, 3 * 24 * 60 * 60)
    })

    it("create Voting correctly with start time and without duration", async function(){
      const tx = await votingEngine['createVoting(string,uint256)']("test Voting 1", 24)

      const cVoting = await votingEngine.votings(0)
      const ts = await getTimestamp(tx.blockNumber)

      expect(cVoting.title).to.eq("test Voting 1")
      expect(cVoting.startAt).to.eq(ts + 24)
      expect(cVoting.endAt).to.eq(ts + 24 + 3 * 24 * 60 * 60)

      await expect(tx).to.emit(votingEngine, 'VotingCreated').withArgs(0, 'test Voting 1', ts + 24, 3 * 24 * 60 * 60)
    })

    it("create Voting correctly with start time and duration", async function(){
      const tx = await votingEngine['createVoting(string,uint256,uint256)']("test Voting 2", 24, 24)

      const cVoting = await votingEngine.votings(0)
      const ts = await getTimestamp(tx.blockNumber)

      expect(cVoting.title).to.eq("test Voting 2")
      expect(cVoting.startAt).to.eq(ts + 24)
      expect(cVoting.endAt).to.eq(ts + 24 * 2)

      await expect(tx).to.emit(votingEngine, 'VotingCreated').withArgs(0, 'test Voting 2', ts + 24, 24)
    })

    it("not owner try to create Voting", async function(){
      expect(votingEngine.connect(firstCandidate)['createVoting(string)']("test Voting")).to.be.revertedWith("You are not owner")
      expect(votingEngine.connect(firstCandidate)['createVoting(string,uint256,uint256)']("test Voting 2", 24, 24)).to.be.revertedWith("You are not owner")
      await expect(votingEngine.connect(firstCandidate)['createVoting(string,uint256)']("test Voting 1", ethers.BigNumber.from("24"))).to.be.revertedWith("You are not owner")
    })
  })

  function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  describe("addCandidate", function(){
    it("check add candidate", async function(){
      const tx = await votingEngine['createVoting(string,uint256,uint256)']("test Voting", 2, 1)
      await votingEngine.connect(firstCandidate).addCandidate(0)
      let candidates = await votingEngine.getAllCandidates(0)
      expect(candidates[0] === firstCandidate)

      await delay(3000) // 1s
      await expect(votingEngine.connect(secondCandidate).addCandidate(0)).to.be.revertedWith("already started")
    })
  })

  describe("vote", function(){
    beforeEach(async function(){
      const tx = await votingEngine['createVoting(string,uint256,uint256)']("test Voting", 4, 3)
      await votingEngine.connect(firstCandidate).addCandidate(0)
      await votingEngine.connect(secondCandidate).addCandidate(0)
    })

    it("not enough founds", async function(){
      await expect(votingEngine.connect(firstParticipant)
          .vote(0, firstCandidate.address, {value: ethers.utils.parseEther("0.001")}))
          .to.be.revertedWith("not enough funds")
    })
    it("have not started yet", async function(){
      await expect(votingEngine.connect(firstParticipant)
          .vote(0, firstCandidate.address, {value: ethers.utils.parseEther("0.015")}))
          .to.be.revertedWith("have not started yet")
    })
    it("already ended", async function(){
      await delay(7000)
      await expect(votingEngine.connect(firstParticipant)
          .vote(0, firstCandidate.address, {value: ethers.utils.parseEther("0.015")}))
          .to.be.revertedWith("already ended")
    })
    it("not candidate", async function(){
      await delay(4000)
      await expect(votingEngine.connect(firstParticipant)
          .vote(0, secondParticipant.address, {value: ethers.utils.parseEther("0.015")}))
          .to.be.revertedWith("not candidate")
    })

    it("minimum pay", async function(){
      const initialPay = ethers.utils.parseEther("0.01")
      await delay(3000)
      const voteTx = await votingEngine.connect(firstParticipant).vote(0, firstCandidate.address, {value: ethers.utils.parseEther("0.01")})
      await expect(() => voteTx).to.changeEtherBalance(votingEngine, initialPay)
    })

    it("vote without changing winner", async function(){
      const initialPay = ethers.utils.parseEther("0.01")
      await delay(3000)
      const vote1Tx = await votingEngine.connect(firstParticipant).vote(0, firstCandidate.address, {value: ethers.utils.parseEther("0.01")})
      const vote2Tx = await votingEngine.connect(secondParticipant).vote(0, secondCandidate.address, {value: ethers.utils.parseEther("0.01")})
      await expect(() => vote1Tx).to.changeEtherBalance(votingEngine, initialPay)
      await expect(() => vote2Tx).to.changeEtherBalance(votingEngine, initialPay)
      await expect(await votingEngine.getWinner(0)).to.eq(firstCandidate.address)
    })

    it("success voted", async function(){
      await delay(3000)
      const initialPay = ethers.utils.parseEther("0.01")
      const fee = 10
      const startAmount = await votingEngine.getTotalAmount(0)
      const startFeeAmount = await votingEngine.getFeeAmount()
      const startNumberVotes = await votingEngine.getNumberVotes(0, firstCandidate.address)
      const voteTx = await votingEngine.connect(firstParticipant).vote(0, firstCandidate.address, {value: ethers.utils.parseEther("0.035")})

      expect(await votingEngine.getTotalAmount(0)).to.eq(startAmount + initialPay)
      expect(await votingEngine.getFeeAmount()).to.eq(startFeeAmount + (initialPay * fee) / 100)
      expect(await votingEngine.getNumberVotes(0, firstCandidate.address)).to.eq(startNumberVotes + 1)
      expect(await votingEngine.getVoteOfParticipant(0, firstParticipant.address)).to.eq(firstCandidate.address)

      await expect(() => voteTx).to.changeEtherBalance(votingEngine, initialPay)

      await expect(votingEngine.connect(firstParticipant).vote(0, firstCandidate.address, {value: ethers.utils.parseEther("0.015")})).to.be.revertedWith("you are already voted")
    })
  })

  describe("endVoting", function(){
    beforeEach(async function(){
      const tx = await votingEngine['createVoting(string,uint256,uint256)']("test Voting", 3, 3)
    })

    it("can't end yet", async function(){
      await expect(votingEngine.endVoting(0)).to.be.revertedWith("can't end yet")
    })

    it("success end", async function(){
      await votingEngine.connect(firstCandidate).addCandidate(0)
      await votingEngine.connect(secondCandidate).addCandidate(0)
      await delay(3000)
      await votingEngine.connect(firstParticipant).vote(0, firstCandidate.address, {value: ethers.utils.parseEther("0.015")})
      await delay(3000)
      const fee = 10
      const amount = await votingEngine.getTotalAmount(0)
      const endTx = await votingEngine.endVoting(0)
      const sum = amount - (amount * fee) / 100

      await expect(await votingEngine.votingEnded(0)).to.eq(true)
      await expect(() => endTx).to.changeEtherBalances([votingEngine, firstCandidate], [-sum, sum])
    })

    it("already ended", async function(){
      await delay(8000)
      await votingEngine.endVoting(0)
      await expect(votingEngine.endVoting(0)).to.be.revertedWith("already ended")
    })
  })

  describe("withdraw", function (){
    beforeEach(async function(){
      const tx = await votingEngine['createVoting(string,uint256,uint256)']("test Voting", 3, 3)

    })

    it("success withdraw", async function(){
      await votingEngine.connect(firstCandidate).addCandidate(0)
      await delay(3000);
      await votingEngine.connect(firstParticipant).vote(0, firstCandidate.address, {value: ethers.utils.parseEther("0.015")})
      const feeAmount = await votingEngine.getFeeAmount()
      const wdTx = await votingEngine.withdraw()
      expect(await votingEngine.getFeeAmount()).to.eq(0)
      await expect(() => wdTx).to.changeEtherBalance(owner, feeAmount)
    })

    it("not owner try", async function(){
      await expect(votingEngine.connect(firstCandidate).withdraw()).to.be.revertedWith("You are not owner")
    })
  })
})
