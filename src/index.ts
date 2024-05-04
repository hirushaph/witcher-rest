import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { GetAllCharacters } from "endpoints/getAllCharacters";
import { checkDbConnection } from "middleware/checkDbConnection";
import { AddCharacter } from "endpoints/addCharacter";
import { GetCharacter } from "endpoints/getCharacter";
import { errorResponse } from "utils/response";
import { UpdateCharacter } from "endpoints/UpdateCharacter";
import { Login } from "endpoints/Login";
import { Register } from "endpoints/Register";

const router = OpenAPIRouter({
  docs_url: "/docs",
  redoc_url: "/redocs",
  schema: {
    info: {
      title: "The Witcher Characters API (Tv Series)",
      description:
        "Simple api for get details about, the witcher characters AUTHENTICATION NOT NEEDED",
      version: "1.0",
    },
    tags: [
      { name: "Characters", description: "Get details about charaters" },
      {
        name: "Character",
        description: "Get single character",
      },
      {
        name: "Auth",
        description: "ONLY for add and edit characters",
      },
    ],
  },
});

// Handle Middleware
router.all("/api/*", checkDbConnection);

// The witcher routes
router.get("/api/v1/characters/", GetAllCharacters);
router.get("/api/v1/character/:chId/", GetCharacter);
router.post("/api/v1/characters/add/", AddCharacter);
router.put("/api/v1/characters/update/", UpdateCharacter);

// Auth routes
router.post("/api/v1/auth/login/", Login);
router.post("/api/v1/auth/register/", Register);

// 404 for everything else
router.all("*", () => errorResponse(404, { error: "Route not found" }));

export default {
  fetch: async (
    request: Request,
    env: any,
    context: any,
    data: Record<string, any>
  ) => {
    const response: Response = await router.handle(request, env, [
      context,
      data,
    ]);

    // Change document title if the current URL is /docs
    if (request.url.includes("/docs")) {
      const body = await response.text();

      console.log(body);
      const modifiedBody =
        body +
        `
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            document.title = "Witcher API Docs";
          });
        </script>
      `;

      // Create a new Response object with modified body
      return new Response(modifiedBody, {
        headers: response.headers,
        status: response.status,
      });
    }

    return response;
  },
};
