# Postman Test Script Documentation — Quiz Management REST API

## Environment

Create an environment with:

- `url` = `http://localhost:3000`
- `token` = _(leave empty; will be set by Login tests)_
- `quizId` = _(will be set by Create Quiz tests)_
- `questionId` = _(will be set by Create Question tests)_

## Common headers

For protected routes (admin-only):

- `Authorization: Bearer {{token}}`

In Postman, you can set this per-request in the **Authorization** tab, or in **Headers**.

## 1) Register Admin

**Request**

- `POST {{url}}/users/register`
- Body (JSON):

```json
{ "username": "admin", "password": "admin123", "isAdmin": true }
```

**Tests**

```js
pm.test("Status 201 or 400 if exists", () => {
  pm.expect([201, 400]).to.include(pm.response.code);
});

if (pm.response.code === 201) {
  const body = pm.response.json();
  pm.expect(body).to.have.property("user");
  pm.expect(body.user).to.have.property("role", "admin");
}
```

## 2) Register User

**Request**

- `POST {{url}}/users/register`
- Body (JSON):

```json
{ "username": "user1", "password": "user12345", "isAdmin": false }
```

**Tests**

```js
pm.test("Status 201 or 400 if exists", () => {
  pm.expect([201, 400]).to.include(pm.response.code);
});
```

## 3) Login Admin (sets {{token}})

**Request**

- `POST {{url}}/users/login`
- Body (JSON):

```json
{ "username": "admin", "password": "admin123" }
```

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));

const body = pm.response.json();
pm.expect(body).to.have.property("token");
pm.expect(body).to.have.property("user");
pm.expect(body.user).to.have.property("role", "admin");

pm.environment.set("token", body.token);
```

## 4) List Users (admin-only)

**Request**

- `GET {{url}}/users`
- Header: `Authorization: Bearer {{token}}`

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.expect(body).to.be.an("array");
```

## 5) Create Quiz (admin-only) (sets {{quizId}})

**Request**

- `POST {{url}}/quizzes`
- Header: `Authorization: Bearer {{token}}`
- Body (JSON):

```json
{ "title": "History Quiz", "description": "Test concepts" }
```

**Tests**

```js
pm.test("201 Created", () => pm.response.to.have.status(201));
const body = pm.response.json();
pm.expect(body).to.have.property("_id");
pm.expect(body).to.have.property("title", "History Quiz");

pm.environment.set("quizId", body._id);
```

## 6) Get All Quizzes

**Request**

- `GET {{url}}/quizzes`

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.expect(body).to.be.an("array");
```

## 7) Update Quiz (admin-only)

**Request**

- `PUT {{url}}/quizzes/{{quizId}}`
- Header: `Authorization: Bearer {{token}}`
- Body (JSON):

```json
{ "title": "History Quiz 2026", "description": "Updated" }
```

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.expect(body).to.have.property("_id", pm.environment.get("quizId"));
pm.expect(body).to.have.property("title", "History Quiz 2026");
```

## 8) Create Standalone Question (public) (sets {{questionId}})

This matches the spec-style payload (no `quizId`).

**Request**

- `POST {{url}}/questions`
- Body (JSON):

```json
{
  "text": "Which year did World War II end?",
  "options": ["1945", "1939", "1918", "1965"],
  "correctAnswerIndex": 0
}
```

**Tests**

```js
pm.test("201 Created", () => pm.response.to.have.status(201));
const body = pm.response.json();
pm.expect(body).to.have.property("_id");
pm.expect(body).to.have.property("text");
pm.expect(body).to.have.property("options");
pm.expect(body).to.have.property("correctAnswerIndex");

pm.environment.set("questionId", body._id);
```

## 9) Get All Questions

**Request**

- `GET {{url}}/questions`

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.expect(body).to.be.an("array");
```

## 10) Update Question (admin-only)

**Request**

- `PUT {{url}}/questions/{{questionId}}`
- Header: `Authorization: Bearer {{token}}`
- Body (JSON):

```json
{
  "text": "Which year did World War II end (updated)?",
  "options": ["1945", "1940", "1918", "1965"],
  "correctAnswerIndex": 0
}
```

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.expect(body).to.have.property("_id", pm.environment.get("questionId"));
pm.expect(body).to.have.property("text");
```

## 11) Delete Question (admin-only)

**Request**

- `DELETE {{url}}/questions/{{questionId}}`
- Header: `Authorization: Bearer {{token}}`

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.expect(body).to.have.property("message");
```

## 12) Add Single Question To Quiz (admin-only)

**Request**

- `POST {{url}}/quizzes/{{quizId}}/question`
- Header: `Authorization: Bearer {{token}}`
- Body (JSON):

```json
{
  "text": "Who was the first President of the USA?",
  "options": ["George Washington", "Thomas Jefferson", "Abraham Lincoln"],
  "correctAnswerIndex": 0
}
```

**Tests**

```js
pm.test("201 Created", () => pm.response.to.have.status(201));
const body = pm.response.json();
pm.expect(body).to.have.property("_id", pm.environment.get("quizId"));
pm.expect(body).to.have.property("questions");
pm.expect(body.questions).to.be.an("array");
pm.expect(body.questions.length).to.be.greaterThan(0);
```

## 13) Add Multiple Questions To Quiz (admin-only)

**Request**

- `POST {{url}}/quizzes/{{quizId}}/questions`
- Header: `Authorization: Bearer {{token}}`
- Body (JSON):

```json
[
  {
    "text": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin"],
    "correctAnswerIndex": 0
  },
  {
    "text": "What is 2 + 2?",
    "options": ["3", "4", "5"],
    "correctAnswerIndex": 1
  }
]
```

**Tests**

```js
pm.test("201 Created", () => pm.response.to.have.status(201));
const body = pm.response.json();
pm.expect(body).to.have.property("_id", pm.environment.get("quizId"));
pm.expect(body.questions).to.be.an("array");
```

## 14) Get Quiz With Populated Questions (public)

**Request**

- `GET {{url}}/quizzes/{{quizId}}/populate`

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.expect(body).to.have.property("_id", pm.environment.get("quizId"));
pm.expect(body).to.have.property("questions");
pm.expect(body.questions).to.be.an("array");

if (body.questions.length > 0) {
  pm.expect(body.questions[0]).to.have.property("text");
  pm.expect(body.questions[0]).to.have.property("options");
  pm.expect(body.questions[0]).to.have.property("correctAnswerIndex");
}
```

## 15) Cascade Delete Verification (admin-only)

This step deletes the quiz, then verifies questions linked to that quiz are gone.

### 15a) Delete Quiz

**Request**

- `DELETE {{url}}/quizzes/{{quizId}}`
- Header: `Authorization: Bearer {{token}}`

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.expect(body).to.have.property("message");
```

### 15b) Verify Linked Questions Are Deleted

**Request**

- `GET {{url}}/questions`

**Tests**

```js
pm.test("200 OK", () => pm.response.to.have.status(200));
const all = pm.response.json();
const quizId = pm.environment.get("quizId");

const stillThere = all.filter((q) => String(q.quizId) === String(quizId));
pm.test("No questions remain for deleted quiz", () => {
  pm.expect(stillThere.length).to.equal(0);
});
```

---

## Notes

- Admin-only endpoints require a token from **Login Admin**.
- If you re-run the collection multiple times, the Register requests may return `400` (user already exists); the tests accept that.
- UI routes (server-rendered) are now under `{{url}}/ui/*` to avoid conflicts with the REST API paths.
