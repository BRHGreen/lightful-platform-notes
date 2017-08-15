#graphql endpoint:
In the network dev tools, network tab, general, request url
https://f6sdclj5e6.execute-api.eu-west-1.amazonaws.com/develop/graphql

you'll also need the authorization token under `request headers` to use in graphql

this is the graphql query:

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
  # currentUser {
  #   id
  # }
  # currentUsersOrganisations {
  #   totalCount
  #   nodes {
  #     userByCreatedByUserId {
  #       id
  #     }
  #   }
  # }
}

#EJ's psudo code to figure out free users:

# const organisationThreshold = allThresholdDefaults.nodes.filter(({ threshold }) => threshold === 'ORGANISATIONS')[0]
# let howManyOrganisationsIcanCreate = organisationThreshold.thresholdOverridesByThresholdDefaultId.nodes.length ? organisationThreshold
#   .thresholdOverridesByThresholdDefaultId.nodes[0].overriddenValue ? organisationThreshold.defaultValue
# howManyOrganisationsIcanCreate = parseInt(howManyOrganisationsIcanCreate)

# currentUsersOrganisations.nodes
#   .filter(({id}) => id === currentUserId).length >= howManyOrganisationsIcanCreate
