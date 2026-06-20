# Escape Room Education HTTP API

This documentation describes the HTTP API exposed by [server.js](file:///c:/Users/jeffe/Documents/EscapeRoomEducation/server.js). The server runs on port `3000` by default or the port specified in the `PORT` environment variable.

All endpoints support CORS (`Access-Control-Allow-Origin: *`) and return JSON responses by default (except for static assets served via the static endpoint).

---

## Endpoints

### 1. Retrieve Game Configuration
* **Endpoint:** `/config`
* **Method:** `GET`
* **Description:** Retrieves the escape room game configurations, including metadata, room descriptions, images, question types, and validation structures.
* **Query Parameters:** None
* **Success Response (200 OK):**
  * **Content-Type:** `application/json`
  * **Payload:** A JSON object representing the game config schema.
  * **Example:**
    ```json
    {
      "game_name": "AI Dungeon Escape",
      "lobby_img": "entry.png",
      "rooms": [
        {
          "name": "dungeon",
          "img": "floor_1.png",
          "flavor_text": "...",
          "question_type": "passcode",
          "question": "...",
          "answer": "563412"
        }
      ]
    }
    ```

---

### 2. Update Team Progress
* **Endpoint:** `/update_progress`
* **Method:** `GET`
* **Description:** Updates the current floor progress for a specified team.
* **Query Parameters:**
  * `team_name` (string, required): The name of the team.
  * `floor` (number, required): The zero-indexed or floor number representation of progress.
* **Success Response (200 OK):**
  * **Content-Type:** `application/json`
  * **Payload:**
    ```json
    {
      "success": true,
      "message": "Progress updated for team 'Alpha' to floor 2",
      "progress": {
        "Alpha": 2
      }
    }
    ```
* **Error Responses:**
  * **400 Bad Request:** Missing or invalid query parameters.
    * Example: `{ "error": "Missing required query parameter: team_name" }`
    * Example: `{ "error": "Parameter floor must be a valid number" }`

---

### 3. Retrieve All Teams' Progress
* **Endpoint:** `/progress`
* **Method:** `GET`
* **Description:** Retrieves the current floor progress of all teams stored in the in-memory database.
* **Query Parameters:** None
* **Success Response (200 OK):**
  * **Content-Type:** `application/json`
  * **Payload:** A JSON map of team names to their current floor numbers.
  * **Example:**
    ```json
    {
      "Alpha": 2,
      "Beta": 4
    }
    ```

---

### 4. Serve Static Files
* **Endpoint:** `/*` (e.g. `/`, `/index.html`, `/entry.png`, `/floor_1.png`)
* **Method:** `GET`
* **Description:** Serves static assets directly from the repository workspace directory. If the request is for the root path `/`, it defaults to serving `index.html`.
* **Path Traversal Security:** The server validates that all requested paths resolve inside the workspace directory, preventing directory traversal attacks.
* **MIME Types Supported:**
  * `.html` (`text/html`)
  * `.css` (`text/css`)
  * `.js` (`application/javascript`)
  * `.json` (`application/json`)
  * `.png` (`image/png`)
  * `.jpg`, `.jpeg` (`image/jpeg`)
  * `.gif` (`image/gif`)
  * `.svg` (`image/svg+xml`)
  * `.ico` (`image/x-icon`)
* **Responses:**
  * **200 OK:** Returns the file with the corresponding `Content-Type`.
  * **403 Forbidden:** If the resolved path lies outside the allowed directory.
  * **404 Not Found:** If the file does not exist or is not a regular file.

---

### 5. Generate Escape Room Configuration and Assets (with Optional PDF)
* **Endpoint:** `/generate`
* **Method:** `POST`
* **Description:** Initiates visual generation and AI text expansion to populate a full escape room package. The returned response is a raw binary tarball containing the completed `config.json`, `entry.png` lobby art, and room floor graphics (e.g. `floor_1.png`, `floor_2.png`). Optionally accepts a base64-encoded PDF to guide generation. If no PDF is provided, the server runs standard text-only generation.
* **Headers:**
  * `X-API-Key` or `Authorization: Bearer <key>` (optional override of the server's default Gen AI API key)
* **Payload:**
  * **Content-Type:** `application/json`
  * **Fields:**
    * `topic` (string, required): Core educational topic (e.g. "Photosynthesis").
    * `vibe` (string, required): Visual design vibe (e.g. "Ancient Greenhouse").
    * `difficulty` (string, required): Difficulty selection ("easy", "medium", "hard").
    * `pdfData` (string, optional): Base64-encoded binary data of a PDF document (without the data URL scheme). If present, Gemini uses this document's text to formulate narratives and puzzle content.
    * `rooms` (array, required): Array of room configurations. Empty fields are auto-filled by the AI.
* **Success Response (200 OK):**
  * **Content-Type:** `application/x-tar`
  * **Payload:** The generated `.tar` file containing all game files.
