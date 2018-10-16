first up, if you've made changes in the DB need to a) refresh Postico and b) docker-compose restart web before the changes are picked up.

query which fetches the data for the notifications:
```
{
  currentUser {
  	usersNotificationSettingsByUserId {
      edges {
        node {
          nodeId
          id
          userId
          channels
          enabled
          notificationTypeId
          notificationTypeByNotificationTypeId {
            name
          }
        }
      }
    }
  }
}
```
