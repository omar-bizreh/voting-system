var Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {
    var electionInstance;

    it("initializes with three candidates", function () {
        return Election.deployed().then((i) => {
            return i.candidatesCount();
        }).then((c) => {
            assert.equal(c, 3);
        });
    });

    it("it initializes candidates with the correct values", function () {
        return Election.deployed().then((i) => {
            electionInstance = i;
            return electionInstance.candidates(1);
        }).then((candidate) => {
            assert.equal(candidate.id, 1, "contains the correct id");
            assert.equal(candidate.name, "Candidate 1", "contains correct name");
            assert.equal(candidate.voteCount, 0, "contains correct votes count");
            return electionInstance.candidates(2);
        }).then((candidate) => {
            assert.equal(candidate.id, 2, "contains the correct id");
            assert.equal(candidate.name, "Candidate 2", "contains correct name");
            assert.equal(candidate.voteCount, 0, "contains correct votes count");
        });
    });
});