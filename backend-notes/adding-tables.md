PostgresQL link tutorials from the Sqitch site: https://metacpan.org/pod/sqitchtutorial
Questions:
- where are our equivalents of `sqitch.plan` and `sqitch.conf`?
- what is this `$$` ??

##TABLES
The following is my own naive attempt at starting the B/E part of ticket 2040 As a user, `I need to be able to insert static milestones into my calendar`, pre Gio's (or anyone else's input). I've used relevant examples from the above tutorial.

###create a new table called `user_events`
// `appschema` this is what this tutorial has specified as their schema name. The only deploy script which I could find for our schema was for `lightful_private`.
```
> sqitch add <name of table> --requires appschema -n 'Creates table to track our users.'
Created deploy/users.sql
Created revert/users.sql
Created verify/users.sql
Added "users [appschema]" to sqitch.plan
```

Below is the code inside the `deploy` directory for the file we've created with the above command. This is the first time in the tutorial where we have seen the fields `nickname`, `password` etc so I assume that this is where we add them in and at that point they're added to the schema. In the tutorial examples are from `psql CLI`. I am assuming that this can all be Postico/pgAdmin.
```
-- Deploy flipr:users to pg
-- requires: appschema

BEGIN;

SET client_min_messages = 'warning';

CREATE TABLE flipr.users (
    nickname  TEXT        PRIMARY KEY,
    password  TEXT        NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
```

The following are the `create` and `update` function of the required CRUD operations we need:
```
> sqitch add insert_user --requires users --requires appschema \
  -n 'Creates a function to insert a user.'
Created deploy/insert_user.sql
Created revert/insert_user.sql
Created verify/insert_user.sql
Added "insert_user [users appschema]" to sqitch.plan

> sqitch add change_pass --requires users --requires appschema \
  -n 'Creates a function to change a user password.'
Created deploy/change_pass.sql
Created revert/change_pass.sql
Created verify/change_pass.sql
Added "change_pass [users appschema]" to sqitch.plan
```


This is where we add a new table with reference to fields in the new table (in this case `nickname`). It this how you create relationships?
```
-- Deploy flipr:flips to pg
-- requires: appschema
-- requires: users

BEGIN;

SET client_min_messages = 'warning';

CREATE TABLE flipr.flips (
    id        BIGSERIAL   PRIMARY KEY,
    nickname  TEXT        NOT NULL REFERENCES flipr.users(nickname),
    body      TEXT        NOT NULL DEFAULT '' CHECK ( length(body) <= 180 ),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

COMMIT;
```

And the `Create` operation for the above:
```
-- Deploy flipr:insert_flip to pg
-- requires: flips
-- requires: appschema
-- requires: users

BEGIN;

CREATE OR REPLACE FUNCTION flipr.insert_flip(
   nickname TEXT,
   body     TEXT
) RETURNS BIGINT LANGUAGE sql SECURITY DEFINER AS $$
    INSERT INTO flipr.flips (nickname, body)
    VALUES ($1, $2)
    RETURNING id;
$$;

COMMIT;
```




Gio's stuff:
There is a function which pulls in the `awareness days` for the calendar already. We ideally want this same function to also fetch the `events` as it can then be fetched with the same query in the FE.
