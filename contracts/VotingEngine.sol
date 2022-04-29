// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract VotingEngine {
    address private owner;
    uint constant DURATION = 3 days;
    uint constant INITIAL_PAY = 10 ** 16; // wei
    uint constant FEE = 10;
    Voting[] votings;
    uint private feeAmount = 0;

    struct Voting {
        string title;
        mapping(address => uint) candidates;
        address[] allCandidates;
        mapping(address => address) participants;
        uint totalAmount;
        address winner;
        uint startAt;
        uint endAt;
        bool ended;
    }

    constructor() {
        owner = msg.sender;
    }

    event VotingCreated(uint votingIndex, string votingName);
    event VotingStarted(uint votingIndex, string votingName, uint startDate, uint duration);
    event VotingEnded(uint votingIndex, uint numberPatricipants, uint winnerParticipants, address winner);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not owner");
        _;
    }

    function createVoting(string memory _title) external onlyOwner {
        Voting storage newVoting = votings.push();
        newVoting.title = _title;
        emit VotingCreated(votings.length - 1, _title);
    }

    function startVoting(uint votingIndex) external onlyOwner {
        Voting storage cVoting = votings[votingIndex];
        require(cVoting.startAt == 0, "already started");
        cVoting.startAt = block.timestamp;
        cVoting.endAt = cVoting.startAt + DURATION;
        emit VotingStarted(votingIndex, cVoting.title, cVoting.startAt, DURATION);
    }

    function addCandidate(uint votingIndex) external {
        Voting storage cVoting = votings[votingIndex];
        require(cVoting.startAt == 0, "already started");
        require(block.timestamp <= cVoting.endAt, "already ended");
        cVoting.allCandidates.push(msg.sender);
    }

    function vote(uint votingIndex, address candidate) external payable {
        require(msg.value >= INITIAL_PAY, "not enough funds");
        Voting storage cVoting = votings[votingIndex];
        require(cVoting.startAt != 0, "have not started yet");
        require(block.timestamp <= cVoting.endAt, "already ended");

        bool is_candidate = false;
        for (uint i = 0; i < cVoting.allCandidates.length; i++){
            if (cVoting.allCandidates[i] == candidate){
                is_candidate = true;
            }
        }
        require(is_candidate, "not candidate");

        require(!(cVoting.participants[msg.sender] == address(0) ? false : true), "you are already voted");
        uint refund = msg.value - INITIAL_PAY;
        if (refund > 0){
            payable(msg.sender).transfer(refund);
        }
        cVoting.totalAmount += INITIAL_PAY;
        feeAmount += (INITIAL_PAY * FEE) / 100;
        cVoting.candidates[candidate]++;
        cVoting.participants[msg.sender] = candidate;
        if (cVoting.candidates[candidate] > cVoting.candidates[cVoting.winner]) {
            cVoting.winner = candidate;
        }
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(feeAmount);
        feeAmount = 0;
    }

    function endVoting(uint votingIndex) external {
        Voting storage cVoting = votings[votingIndex];
        require(!cVoting.ended, "already ended");
        require(block.timestamp >= cVoting.startAt + DURATION, "can't end yet");
        cVoting.ended = true;
        address payable _to = payable(cVoting.winner);
        _to.transfer(cVoting.totalAmount - (cVoting.totalAmount * FEE) / 100);
        emit VotingEnded(votingIndex, cVoting.totalAmount / INITIAL_PAY, cVoting.candidates[cVoting.winner], cVoting.winner);
    }
}
