First up this is what the mutation looked like in Graphiql:
```
mutation {
  updateUserOnboardingState(input: {
    onboardingState: CONFIRM
  }) {
    user {
      id
      onboardingState
    }
  }
}
```
this is what it would return:
```
{
  "data": {
    "updateUserOnboardingState": {
      "user": {
        "id": "57e4276a-7d12-11e7-a4a9-53be60d6331a",
        "onboardingState": "CONFIRM"
      }
    }
  }
}
```

`onboardingState` on line 5 updates line 21. (obviously)

For more examples on mutations take a look at `posts.js` in the graphiql directory.

Anyways, the updateUserOnboardingState is in `graphql/user.js` and you're calling it in Onboarding Wizard. The mutation is being mapped to the props of the AppContainer and is therefore available in App.js. Here is is defined and passed down to OnboardingWizard where you are calling it like so:
```
this.props.updateUserOnboardingState({
  variables: {
    input: {
      onboardingState: 'SOCIAL'
    }
  }
})
```

It's worth remembering that all of the query and mutations are available for you to look at within Graphiql. [like so](./graphql-screenshot-1.png) You'll see that all of the queries and mutations are available for you to look at in here so you can have a look at the schemas and see what kind of information they are expecting. Click on the mutation or query you want to call and have a look at what arguments it's expecting. Because this mutation is only expecting one argument we have to wrap everything up in an bject which we have called `variables`, then created another object called input with the key value pair `input` which has the data which we want in it. (see above).

Also when Gio wrote the mutation originally it looked like this:
```
export const updateUserOnboardingState = gql`
  mutation($onboardingState: AccountOnboardingStates) {
    updateUserOnboardingState(onboardingState: $onboardingState) {
      ...UserDetails
    }
  }
  ${UserDetails}
`
```

Erika changed it to look like this:

```
export const updateUserOnboardingState = gql`
  mutation($input: UpdateUserOnboardingStateInput!) {
    updateUserOnboardingState(input: $input) {
      user {
        ...UserDetails
      }
    }
  }
  ${UserDetails}
`
```

...not really clear on why to be honest. Probably a good idea to update these notes if you ever figure it out.


********INTERESTS********

this is the query to get the list of interests in the onboarding wizard. Each user is only able to add two interests and this needs to be limited in the front end.
```
query {
  allListenInterests {
    nodes {
      id
      interest
    }
  }
}
```

This is the mutation. The selected interests should be added to a form and onSubmit should run this:

```
There should be an array of the interests which the user has selected in front end. You can then call the mutation passing in the id's of the interests which they have selected.
// interests selected:
# const interests = ["586c2064-829b-11e7-96e9-3f73e8a10fa0"]

// mutation with the id's of these interests passed in:
mutation {
  addUserListenInterests(input: { interestIds: ["586c2064-829b-11e7-96e9-3f73e8a10fa0"] }) {
    result
  }
}
```
