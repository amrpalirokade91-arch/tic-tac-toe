import Runtime "mo:core/Runtime";

actor {
  type GameResult = {
    xWins : Nat;
    oWins : Nat;
    draws : Nat;
  };

  var gameResult = {
    xWins = 0;
    oWins = 0;
    draws = 0;
  };

  public shared ({ caller }) func recordGameResult(winner : Text) : async () {
    switch (winner) {
      case ("X") { gameResult := { gameResult with xWins = gameResult.xWins + 1 } };
      case ("O") { gameResult := { gameResult with oWins = gameResult.oWins + 1 } };
      case ("Draw") { gameResult := { gameResult with draws = gameResult.draws + 1 } };
      case (_) { Runtime.trap("Invalid winner value") };
    };
  };

  public query ({ caller }) func getScores() : async GameResult {
    gameResult;
  };

  public shared ({ caller }) func resetScores() : async () {
    gameResult := {
      xWins = 0;
      oWins = 0;
      draws = 0;
    };
  };
};
