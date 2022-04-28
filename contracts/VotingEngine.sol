// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract VotingEngine {
    address private owner;
    uint constant DURATION = 3 days;
    uint constant INITIAL_PAY = 1;
    uint constant FEE = 10;
    Voting[] votings;

    struct Voting {
        string title;
        mapping(address => uint) candidates;
        address[] allCandidates;
        mapping(address => address) participants;
        uint totalAmount;
        address winner;
        uint startAt;
        uint endAt;
        bool started;
        bool ended;
    }

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not owner");
        _;
    }

    function createVoting(string memory _title) external onlyOwner {
        Voting storage newVoting = votings.push();
        newVoting.title = _title;
    }

    function startVoting(uint voting_index) external onlyOwner {
        Voting storage cVoting = votings[voting_index];
        require(!cVoting.started, "already started");
        require(!cVoting.ended, "already ended");
        cVoting.started = true;
        cVoting.startAt = block.timestamp;
        cVoting.endAt = cVoting.startAt + DURATION;
    }

    function addCandidate(uint voting_index) external {
        Voting storage cVoting = votings[voting_index];
        require(!cVoting.started, "already started");
        require(!cVoting.ended || block.timestamp < cVoting.endAt, "already ended");
        cVoting.allCandidates.push(msg.sender);
    }

    function vote(uint voting_index, address candidate) external payable {
        require(msg.value == INITIAL_PAY, "incorrect pay");
        Voting storage cVoting = votings[voting_index];
        require(cVoting.started, "have not started yet");
        require(!cVoting.ended || block.timestamp <= cVoting.endAt, "already ended");

        bool is_candidate = false;
        for (uint i = 0; i < cVoting.allCandidates.length; i++){
            if (cVoting.allCandidates[i] == candidate){
                is_candidate = true;
            }
        }
        require(is_candidate, "not candidate");

        require(!(cVoting.participants[msg.sender] == address(0) ? false : true), "you are already voted");
        cVoting.totalAmount += msg.value;
        cVoting.candidates[candidate]++;
        cVoting.participants[msg.sender] = candidate;
        if (cVoting.candidates[candidate] > cVoting.candidates[cVoting.winner]) {
            cVoting.winner = candidate;
        }
    }

    function endVoting(uint voting_index) external {
        Voting storage cVoting = votings[voting_index];
        require(!cVoting.ended, "already ended");
        require(block.timestamp >= cVoting.startAt + DURATION, "can't end yet");
        cVoting.ended = true;
        address payable _to = payable(cVoting.winner);
        _to.transfer(cVoting.totalAmount - (cVoting.totalAmount * FEE) / 100);
    }
}
