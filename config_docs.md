# Escape Room Configuration Documentation

This document describes the structure, options, and validation rules for the `config.json` file used by the Escape Room Education platform.

The configuration file defines the narrative flow, clues, and puzzles that players navigate. The web frontend dynamically parses this file to customize the game experience (e.g., lobby screens, question inputs, keys, and leaderboard metrics).

---

## 1. Top-Level Structure

The configuration root is a JSON object with the following fields:

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `game_name` | String | Yes | The title of the game. Displayed on the lobby screen and in the dashboard header. |
| `lobby_img` | String | Yes | Filename of the background image for the login lobby (e.g. `"entry.png"`). |
| `rooms` | Array of Objects | Yes | List of chambers in the escape room, ordered by progression. |

---

## 2. Room Configuration Fields

Each object in the `rooms` array represents a level (floor) and can contain the following properties:

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Short identifier or title of the room (e.g. `"Dungeon"`, `"Server Room"`). |
| `img` | String | Yes | Filename of the background illustration for the chamber (e.g. `"floor_1.png"`). |
| `flavor_text` | String | Yes | Atmospheric narrative text setting the stage for the puzzle. Supports simple formatting. |
| `question_type` | String | Yes | The mechanics of the puzzle. Must be one of: `"passcode"`, `"emoji_code"`, `"ab"`, or `"connections"`. |
| `question` | String | Yes | The puzzle instructions, riddle, or cipher presented to the player. |
| `answer` | String | Conditional | The expected correct answer. Required for `"passcode"`, `"emoji_code"`, and `"ab"`. Omit for `"connections"`. |
| `options` | Array of Strings | No | Used only for `"ab"` question types. Must contain exactly two strings for Option A and Option B button labels. |
| `groups` | Array of Objects | Conditional | Required only for `"connections"` type. Must contain exactly 4 group objects. |

---

## 3. Question Types & Validation Rules

### A. Passcode (`"question_type": "passcode"`)
* **Behavior**: Renders a series of individual numeric input boxes. A virtual numerical keypad is provided below the input box.
* **Dynamic Sizing**: The frontend automatically checks the length of the `answer` string and generates that number of boxes (e.g., if `answer` is `"1234"`, 4 inputs are rendered).
* **Constraints**: 
  - The `answer` field must contain **only** numbers (`0-9`).
  - Checking is an exact, trimmed match.

### B. Emoji Code (`"question_type": "emoji_code"`)
* **Behavior**: Renders a sequence of visual emoji clues in a large, glowing row with a text field below.
* **Constraints**:
  - The `question` field contains the emojis (e.g., `"💬 ➡️ 🔪 ➡️ 🔢"`).
  - The `answer` is a text string. Validation is case-insensitive and trims surrounding spaces.

### C. A/B Choice (`"question_type": "ab"`)
* **Behavior**: Renders two large option cards labeled "A" and "B" side-by-side. 
* **Branching Penalty**: If the player selects the incorrect option, they trigger a narrative penalty that resets their progress back to **Floor 1** (as described in the default room 3 flavor text).
* **Button Labels**: If the `options` array is provided, e.g. `["Option A Text", "Option B Text"]`, these override the default button labels. If omitted, the buttons default to `"Option A"` and `"Option B"`.
* **Constraints**:
  - The `answer` field must be either `"A"` or `"B"` (case-insensitive).

### D. Connections Grid (`"question_type": "connections"`)
* **Behavior**: Renders a 4x4 grid of 16 shuffled word buttons. The player must select exactly 4 words and submit. Correct groups merge and color-code at the top of the grid; incorrect groups flash red and shake.
* **Groups Array Structure**:
  - Contains exactly 4 category objects.
  - Each object has a `label` (the title of the category shown when solved) and a `words` array of exactly 4 strings.
* **Constraints**:
  - Do **not** supply a top-level `answer` field for this room type.
  - The 16 words must be unique across the groups to prevent multi-category matching conflicts.

---

## 4. Complete Configuration Example

```json
{
  "game_name": "AI Dungeon Escape",
  "lobby_img": "entry.png",
  "rooms": [
    {
      "name": "dungeon",
      "img": "floor_1.png",
      "flavor_text": "You awake in a dank dungeon. There is a door in front of you. It's guarded by a code. Next to it is a mysterious clue.",
      "question_type": "passcode",
      "question": "An AI tokenizer translates text into number IDs using a secret dictionary. If 'AI' = 12, 'is' = 34, and 'cool' = 56, the sentence 'AI is cool' tokenizes into the code 123456. Use this same logic to tokenize the sentence: 'cool is AI'. What is the resulting passcode?",
      "answer": "563412"
    },
    {
      "name": "heiroglyphs",
      "img": "floor_2.png",
      "flavor_text": "You find yourself in a room with hieroglyphs covering the walls. A door in front of you is locked by a single word. You can make out some of the characters next to it, it appears to be similar to the Emoji system.",
      "question_type": "emoji_code",
      "question": "💬 ➡️ 🔪 ➡️ 🔢",
      "answer": "Tokenization"
    },
    {
      "name": "meeting_room",
      "img": "floor_3.png",
      "flavor_text": "There are two doors ahead of you. One will assist in your escape. One will send you all the way back to the first floor.",
      "question_type": "ab",
      "question": "An AI is asked to write a historical biography. Because it functions like a super-powered autocomplete predicting the next most likely word rather than looking up a factual database, it flawlessly invents a fake university degree and a fictional award for the person. What is this phenomenon called? A) Hallucination or B) Optimization?",
      "answer": "A",
      "options": [
        "Hallucination",
        "Optimization"
      ]
    },
    {
      "name": "helicopter_pad",
      "img": "floor_4.png",
      "flavor_text": "You find yourself on the roof of a building. There is a helicopter waiting for you. To get out you have to make random categorizations.",
      "question_type": "connections",
      "question": "Group the concepts correctly.",
      "groups": [
        {
          "label": "Tokenization Concepts",
          "words": [
            "Chunks",
            "IDs",
            "Bytes",
            "Vocabulary"
          ]
        },
        {
          "label": "GPU Components & Features",
          "words": [
            "Cores",
            "Parallel",
            "VRAM",
            "Tensor"
          ]
        },
        {
          "label": "Prompt Engineering Elements",
          "words": [
            "Persona",
            "Constraints",
            "Context",
            "Instructions"
          ]
        },
        {
          "label": "Signs of Hallucination",
          "words": [
            "Autocomplete",
            "Fabrication",
            "Plausible",
            "Misinformation"
          ]
        }
      ]
    }
  ]
}
```
