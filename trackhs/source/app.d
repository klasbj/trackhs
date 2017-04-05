/* Copyright (c) 2016, Klas Björkqvist <klas.bjorkqvist@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import vibe.d;
import jsclient;
import common;

version (unittest) {
} else {
  shared static this()
  {
    import std.process: environment;
    import std.regex;
    auto dockerHost = environment
      .get("DOCKER_HOST", "tcp://127.0.0.1:1234")
      .replaceFirst(regex(r".*://([^:/]*)([:/].*|$)"), "$1");

    auto restsettings = new RestInterfaceSettings;
    restsettings.baseURL = URL("http://" ~ dockerHost ~ ":8080/api/");

    auto router = new URLRouter;
    auto api = new Api;
    router.registerRestInterface(api, "/api");
    router.registerWebInterface(new Frontend(api));
    router.get("/api.js", serveJSClient!ITrackhs(restsettings));

    auto fssettings = new HTTPFileServerSettings;
    fssettings.serverPathPrefix = "/static";
    router.get("/static/*", serveStaticFiles("public/", fssettings));

    auto settings = new HTTPServerSettings;
    settings.port = 8080;
    settings.bindAddresses = ["::1", "0.0.0.0"];
    settings.sessionStore = new MemorySessionStore;
    listenHTTP(settings, router);

    logInfo("Please open http://" ~ dockerHost ~ ":8080/ in your browser.");
  }
}

struct UserInfo {
  bool authenticated;
  uint userId;
}

UserInfo authRest(HTTPServerRequest req, HTTPServerResponse res) {
  if ("username" in req.query && "token" in req.query) {
    if (req.query["username"] == "user" && req.query["token"] == "aaaa") {
      return UserInfo(true, 1);
    }
    // don't fall back to session if auth failed
    return UserInfo.init;
  }

  if (req.session) {
    return req.session.get!UserInfo("userinfo");
  }

  return UserInfo.init;
}

interface ITrackhs {

  alias Class = common.XClass;

  alias GameResult = common.GameResult;

  struct BasicGameInfo {
    ulong gameId;
    Class ourClass, opponentsClass;
    GameResult result;
    uint deckId;
    bool first;
  }

  // GET /games
  @before!authRest("user")
  BasicGameInfo[] getGames(UserInfo user = UserInfo.init);

  @before!authRest("user")
  void postGame(Class ownClass, Class opponentsClass, GameResult result,
      bool first, uint deckId = 0, UserInfo user = UserInfo.init);

  @before!authRest("user") @path("game/:id/deck")
  void setGameDeck(uint _id, uint deckId, UserInfo user = UserInfo.init);

}

class Api : ITrackhs {
  private {
    auto dummyGames = [
      BasicGameInfo(1, Class.Priest, Class.Warrior, GameResult.Win, 0, false),
      BasicGameInfo(2, Class.Priest, Class.Priest, GameResult.Win, 0, true),
      BasicGameInfo(3, Class.Shaman, Class.Paladin, GameResult.Loss, 0, true),
      ];
  }

  private BasicGameInfo[] findGames(uint userId) {
    return dummyGames;
  }

  private void recordGame(uint userId, BasicGameInfo gi) {
    gi.gameId = dummyGames.length + 1;
    dummyGames ~= gi;
  }

  private void setGameDeck(uint userId, ulong gameId, uint deckId) {
    if (gameId > 0 && gameId < dummyGames.length) {
      dummyGames[gameId-1].deckId = deckId;
    }
  }

override:
  BasicGameInfo[] getGames(UserInfo user = UserInfo.init) {
    enforceHTTP(user.authenticated,
        HTTPStatus.forbidden, "Authentication failure");

    return findGames(user.userId);
  }

  void postGame(Class ownClass, Class opponentsClass, GameResult result,
      bool first, uint deckId = 0, UserInfo user = UserInfo.init) {
    enforceHTTP(user.authenticated,
        HTTPStatus.forbidden, "Authentication failure");

    recordGame(user.userId, BasicGameInfo(0, ownClass, opponentsClass, result,
                                          deckId, first));
  }

  void setGameDeck(uint id, uint deckId, UserInfo user = UserInfo.init) {
    enforceHTTP(user.authenticated,
        HTTPStatus.forbidden, "Authentication failure");

    setGameDeck(user.userId, id, deckId);
  }
}

class Frontend {
  private {
    SessionVar!(UserInfo, "userinfo") user;

    ITrackhs provider;
  }

  this(ITrackhs api) {
    provider = api;
  }

  // GET /
  void get() {
    auto authenticated = user.authenticated;
    auto userId = user.userId;
    ITrackhs.BasicGameInfo[] games;
    if (authenticated) {
      games = provider.getGames(user);
    }

    render!("index.dt", authenticated, userId, games);
  }

  // GET /deck/build
  @path("/deck/build")
  void getDeckBuild() {
    enforceHTTP(user.authenticated,
        HTTPStatus.forbidden, "Authentication failure");
    render!("deckbuilder.dt");
  }

  // POST /login
  void postLogin(string username, string password) {
    enforceHTTP(username == "user",
        HTTPStatus.forbidden, "Invalid username or password");
    user = UserInfo(true, 1);
    redirect("/");
  }

  // POST /logout
  void postLogout() {
    user = UserInfo(false, 0);
    terminateSession();
    redirect("/");
  }
}
