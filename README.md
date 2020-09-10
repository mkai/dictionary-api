# Dictionary GraphQL API

Dictionary GraphQL API.

## How to query

```graphql
{
  lookup(input: { query: "yell", inputLanguage: "en" }) {
    query
    results {
      en
      de
    }
  }
}
```

Result:

```json
{
  "data": {
    "lookup": {
      "query": "yell",
      "results": [
        {
          "en": "yell",
          "de": "schreien"
        },
        {
          "en": "yellow",
          "de": "gelb"
        }
      ]
    }
  }
}
```

## Contributing

1. Install the dependencies:

   ```shell
   npm install
   ```

2. Set up the configuration:

   This project uses environment variables for configuration. Copy the example `.env` file to set up the defaults.

   ```shell
   cp .env.example .env
   ```

   Then, take a look at the file and add or edit the values according to your local environment.

3. Run the development server:

   ```shell
   npm run dev
   ```
