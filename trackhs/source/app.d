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

shared static this()
{
  auto router = new URLRouter;
  auto api = new Api;
  router.registerRestInterface(api, "/api");
  router.registerWebInterface(new Frontend(api));

	auto settings = new HTTPServerSettings;
	settings.port = 8080;
	settings.bindAddresses = ["::1", "0.0.0.0"];
  settings.sessionStore = new MemorySessionStore;
	listenHTTP(settings, router);

	logInfo("Please open http://127.0.0.1:8080/ in your browser.");
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

  enum Class {
    Priest, Mage, Warrior, Druid, Paladin,
    Warlock, Shaman, Rogue, Hunter
  }

  enum GameResult {
    Win, Loss
  }

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

  BasicGameInfo[] getGames(UserInfo user = UserInfo.init) {
    enforceHTTP(user.authenticated,
        HTTPStatus.forbidden, "Authentication failure");

    return findGames(user.userId);
  }
}

class Frontend {
  private {
    SessionVar!(UserInfo, "userinfo") user;

    Api provider;
  }

  this(Api api) {
    provider = api;
  }

  // GET /
  void get() {
    auto authenticated = user.authenticated;
    auto userId = user.userId;
    render!("index.dt", authenticated, userId);
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
