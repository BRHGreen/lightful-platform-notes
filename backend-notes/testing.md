If you run `yarn test` you'll run the all of the tests (and they'll probably fail. you need to do it on buildkite if you're running the whole thing) so you're going to want to do something like: 
`node --max-old-space-size=4072 ./node_modules/.bin/jest /Users/gvnn/Projects/lightful/delightfulapi/__tests__/integration --verbose false --no-cache --runInBand --watch`
or
`NODE_ENV=test node --max-old-space-size=4072 ./node_modules/.bin/jest --bail --forceExit --runInBand <path to suite>`

Have a look at `delightfulapi/__tests__/unit/database/thresholdsResources.spec.js` for the test you (read Gio) added: "differernt stories created by two different users within the same organisation"

The important stuff is that there is a folder called `fixtures` where you can import functions which create users/orgs/posts...whatever

Also depending on what you are testing you may need to create/update some SQL query. This is the one that we changed in that same file:

```
const getThresholdCountValue = async (threshold, organisationId) => {
    const countValues = await getInstance().query(
      `SELECT count_value
      FROM lightful_private.thresholds_resources
      WHERE threshold = $1
      AND ${organisationId ? 'organisation_id = $2' : 'user_id = $2'}`,
      [threshold, organisationId || user.id]
    );
    return countValues.rowCount;
  };
```
