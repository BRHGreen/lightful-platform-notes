This queries a phantom table for defaults so we don't have to create a real table. We then only need to create a table for overrides.
```
select DISTINCT on (channel, notification_type_id)

user_id, channel, notification_type_id, enabled from (

SELECT null as user_id, unnest(enum_range(NULL::notification_channels)) as channel, id as notification_type_id, true as enabled, 0 as importance
from notification_types

union all


select user_id, channel, notification_type_id, enabled, 1 as importance from users_notification_settings

) as settings
ORDER by channel, notification_type_id, importance desc
```
