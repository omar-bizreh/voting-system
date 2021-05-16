// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract Election {
    // Model a candidate
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Store a candidate
    // Fetch candidate
    mapping(uint256 => Candidate) public candidates;

    // Store candidates count
    uint256 public candidatesCount;

    event votedEvent(uint256 indexed _candidateId);

    constructor() {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        addCandidate("Candidate 3");
    }

    /**
        Allow only voters that did not vote
     */
    modifier haventVoted() {
        require(!voters[msg.sender]);
        _;
    }

    /**
        Allow only candidates with correct voter Id
        @param _candidateId voter Id
     */
    modifier onlyValidCandidates(uint256 _candidateId) {
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        _;
    }

    /**
        Add a candidate to the list
        @param  _name candidate name
    */
    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    /**
        Records a new vote
        @param _candidateId voter Id
     */
    function vote(uint256 _candidateId)
        public
        haventVoted
        onlyValidCandidates(_candidateId)
    {
        voters[msg.sender] = true;

        candidates[_candidateId].voteCount++;

        emit votedEvent(_candidateId);
    }
}
