# Ory POC - Frontend

This is a basic HTML and JS frontend to showcase Ory based Authentication and Authorisation.

To get started locally:

1. Create an account on Ory and follow the steps given in "Setup on Ory Cloud" section.
2. Install and setup Ory CLI.
3. Install npm dependencies.
4. Run the Ory tunnel using the following command:

```
npx @ory/cli tunnel --dev http://localhost:1234
```

5. Run the development server using `npm start`. This will serve the Frontend on localhost:1234.

## Setup on Ory Cloud

1. Create a project on Ory cloud.
2. Inside the project edit the Identity schema to have an additional trait for role. The schema should look like following:

```
{
  "$id": "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Person",
  "type": "object",
  "properties": {
    "traits": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "title": "E-Mail",
          "ory.sh/kratos": {
            "credentials": {
              "password": {
                "identifier": true
              },
              "webauthn": {
                "identifier": true
              },
              "totp": {
                "account_name": true
              },
              "code": {
                "identifier": true,
                "via": "email"
              }
            },
            "recovery": {
              "via": "email"
            },
            "verification": {
              "via": "email"
            }
          },
          "maxLength": 320
        },
        "role": {
          "type": "string",
          "enum": [
            "user",
            "admin"
          ],
          "default": "user"
        }
      },
      "required": [
        "email"
      ],
      "additionalProperties": false
    }
  }
}
```

3. Setup the project in Ory CLI using `ory use project <PROJECT_ID>` command. The project id can be fetched from Ory website.

### List of TODOs remaining:

- Create Logout flow. If the user is logged in show the log out button.
- On Succesful login change the text of heading.
- Handle user and admin signup.
- Implement authorisation for user and admin on backend.
