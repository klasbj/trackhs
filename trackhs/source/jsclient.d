module jsclient;

import vibe.http.server;
import vibe.web.rest;
import vibe.web.internal.rest.common;

import std.stdio;

HTTPServerRequestDelegate serveJSClient(I)(RestInterfaceSettings settings) {
  import std.array: appender;

  auto app = appender!string();
  generateJSClient!I(app, null, settings);

  void serve(HTTPServerRequest req, HTTPServerResponse res) {
    res.writeBody(app.data, "application/javascript; charset=UTF-8");
  }

  return &serve;
}

template EnumPair(T, string N) if (is(T == enum)) {
  alias type = T;
  alias name = N;
}

template AllEnums(T) {
  import std.typetuple: TypeTuple;
  import std.traits: Identity;
  enum memberNames = [__traits(allMembers, T)];
  template Impl(size_t i) {
    static if (i < memberNames.length) {
      alias Identity!(__traits(getMember, T, memberNames[i])) mem;
      static if (is(mem == enum)) {
        alias Impl = TypeTuple!(EnumPair!(mem,memberNames[i]), Impl!(i+1));
      } else {
        alias Impl = Impl!(i+1);
      }
    } else {
      alias Impl = TypeTuple!();
    }
  }
  alias AllEnums = Impl!0;
}

void generateJSClient(TImpl, R)(ref R output, string name, RestInterfaceSettings settings) {
  import std.format: formattedWrite;
  import std.traits;
  import std.conv: to;
  import std.string: toUpper;
  import vibe.data.json: serializeToJson, Json;

  auto intf = RestInterface!TImpl(settings, true);

  output.formattedWrite("var %s = new function() {\n", name.length > 0 ? name : intf.I.stringof);

  // Output enum types defined in TImpl
  foreach (e; AllEnums!TImpl) {
    output.formattedWrite("  this.%s = Object.freeze({\n", e.name); //__traits(identifier, e));
    foreach (m; EnumMembers!(e.type)) {
      output.formattedWrite("    %s : %s,\n", m, m.to!(OriginalType!(e.type)));
    }
    output.put("    string : {\n");
    foreach (m; EnumMembers!(e.type)) {
      output.formattedWrite("      %s : %s,\n", m.to!(OriginalType!(e.type)), Json(m.to!string));
    }
    output.put("    },\n");
    output.put("  });\n");
  }

  // output route functions
  foreach (i, F; intf.RouteFunctions) {
    auto route = intf.routes[i];

    output.formattedWrite("  this.%s = function(", route.functionName);
    foreach (param; route.parameters) {
      if (param.kind != ParameterKind.attributed) {
        output.put(param.name);
        output.put(", ");
      }
    }
    output.put("on_success, on_error) {\n");

    // Build URL
    output.put("    var url = ");
    output.serializeToJson(intf.baseURL);
    foreach (p; route.pathParts) {
      output.put(" + ");
      if (p.isParameter) {
        output.formattedWrite("encodeURIComponent(%s)", p.text);
      } else {
        output.serializeToJson(p.text);
      }
    }
    output.put(";\n");

    // Add query parameters
    if (route.queryParameters.length) {
      output.put("    url = url");
      foreach (j, p; route.queryParameters) {
        output.formattedWrite(" + \"%s%s=\" + encodeURIComponent(%s)",
            j == 0 ? "?" : "&", p.fieldName, p.name);
      }
      output.put(";\n");
    }

    // Add body parameters
    if (route.bodyParameters.length) {
      output.put("    var reqbody = {\n");
      foreach (j, p; route.bodyParameters) {
        output.formattedWrite("      %s : %s,\n", Json(p.fieldName), p.name);
      }
      output.put("    };\n");
    }

    // create the request
    output.put("    var xhr = new XMLHttpRequest();\n");

    static if (is(ReturnType!F == void)) {
      output.put("    xhr.onload = function() { if (this.status >= 400) { if (on_error) { on_error(); } } else { if (on_success) { on_success(); } } };\n");
    } else {
      output.put("    xhr.onload = function() { if (this.status >= 400) { if (on_error) { on_error(); } } else { on_success(JSON.parse(this.responseText)); } };\n");
    }

    output.formattedWrite("    xhr.open('%s', url, true);\n", route.method.to!string.toUpper);

    if (!route.bodyParameters.length) {
      output.put("    xhr.send();\n");
    } else {
      output.put("    xhr.setRequestHeader('Content-Type', 'application/json');\n");
      output.put("    xhr.send(JSON.stringify(reqbody));\n");
    }

    output.put("  };\n");
  }

  foreach (i, SI; intf.SubInterfaceTypes) {
    output.generateJSClient!SI(intf.subInterfaces[i].name, intf.subInterfaces[i].settings);
  }

  output.put("}();\n");
}
