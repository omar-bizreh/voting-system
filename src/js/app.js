App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  init: async function () {
    return await App.initWeb3();
  },
  initWeb3: async function () {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },
  initContract: function () {
    $.getJSON("Election.json", function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = new TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },
  listenForEvents: function () {
    App.contracts.Election.deployed().then(function (instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("Event triggered", event);
        App.render();
        if (error) {
          console.warn(error);
        }
      });
    });
  },
  render: function () {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html(`Your Account: ${account}`);
      } else {
        console.error(err);
      }
    });

    App.contracts.Election.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function (candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
      var candidatesSelect = $("#candidatesSelect");
      candidatesSelect.empty();
      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function (candidate) {
          var candidateTemplate = `<tr><th>${candidate[0]}</th><td>${candidate[1]}</td><td>${candidate[2]}</td></tr>`;
          candidatesResults.append(candidateTemplate);

          var candidateOption = `<option value="${candidate[0]}">${candidate[1]}</option>`;
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function (hasVoted) {
      if (hasVoted) {
        $("form").hide();
      }
      loader.hide();
      content.show();
    }).catch(function (error) {
      console.warn(error);
    });
  },
  castVote: function () {
    var candidateId = $("#candidatesSelect").val();
    App.contracts.Election.deployed().then(function (instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function (result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
