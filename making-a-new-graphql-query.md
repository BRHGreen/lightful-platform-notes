First up you need to build your query in graphiql to see if you're getting the data you want. In order to set this up you'll need to specify your graphql endpoint which can be found in if you select anything labeled `graphql` in the Network tab on dev tools in Chrome.
You'll also need an auth token which changes from time to time so if your query ain't working then you may need to update this in graphql. Have at the graphql request headers. Some of them have this auth token in it.

Once you have your query working in graphiql you can copy the query over to a new file in the graphql directory. You'll have to make a few changes to it though. Remember to import graphql at the top and export the query itself. You'll also have to set it to a const and give it a name which is how you will be referencing it in the places where you're using it. You also have to put ticks around the query itself. It'll look something like this:
```
import { gql } from 'react-apollo'

export const allThresholdDefaults = gql`
  query {
    allThresholdDefaults {
      nodes {
        threshold
        defaultValue
        thresholdOverridesByThresholdDefaultId {
          nodes {
            overriddenValue
          }
        }
      }
    }
  }
`
```

Next you'll have to import the query in the place in which you want to use it. If you are likely to use it in more than one place then you should import it at the highest level component possible as you are then able to pass it down as a prop.
In this case we want it to be available everywhere so we are importing it into AppContainer.
At this point you'll have to invoke the graphql function which takes two arguments, the first being the name of the query which you have imported the second being an object with various bits in. For this query we are just going to give it a key value pair which names the query. This is the name which you will use when you are using this query in the rest of the app and it looks something like this:
```
(
  graphql(allThresholdDefaults, {
    name: 'thresholdDefaults'
  })(Component)
)
```

As AppContainer is the parent element of App we are able to access this query using `this.props.name-of-query` in this case it would be `this.props.thresholdDefaults`

Defining it here then means it is available to us in an immediate decendant of the App.js. In our case we want to use it in Organisations.js so we can reference it in here with this.props.thresholdDefaults as well.
