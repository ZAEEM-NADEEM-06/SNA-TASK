
const USERS = {
  user1: "pass123",
  user2: "pass456",
  user3: "pass789",
  user4: "pass000"
};

const PAGE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Green Flag Download</title>
</head>
<body style="font-family:Arial;text-align:center;margin-top:100px">
  <h2>Green Flag Download</h2>
  <p>You are logged in successfully.</p>
  <a href="/green-flag.png" download>Download Green Flag</a>
</body>
</html>`;

function unauthorized() {
  return new Response("Invalid or missing credentials", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Green Flag Download"'
    }
  });
}

export default {
  async fetch(request, env) {
    const auth = request.headers.get("Authorization") || "";

    if (!auth.startsWith("Basic ")) return unauthorized();

    let decoded;
    try {
      decoded = atob(auth.slice(6));
    } catch {
      return unauthorized();
    }

    const i = decoded.indexOf(":");
    if (i < 0) return unauthorized();

    const username = decoded.slice(0, i);
    const password = decoded.slice(i + 1);

    if (
      !Object.prototype.hasOwnProperty.call(USERS, username) ||
      USERS[username] !== password
    ) {
      return unauthorized();
    }

    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(PAGE, {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "Cache-Control": "no-store"
        }
      });
    }

    if (url.pathname === "/green-flag.png") {
      const response = await env.ASSETS.fetch(
        new Request(new URL("/green-flag.png", url.origin), request)
      );

      if (!response.ok) {
        return new Response(
          "Image missing. Upload public/green-flag.png",
          { status: 404 }
        );
      }

      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "private, no-store");
      headers.set(
        "Content-Disposition",
        'attachment; filename="green-flag.png"'
      );

      return new Response(
        request.method === "HEAD" ? null : response.body,
        { status: response.status, headers }
      );
    }

    return new Response("Not found", { status: 404 });
  }
};
