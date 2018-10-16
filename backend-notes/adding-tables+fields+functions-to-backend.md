First up install squitch this using homebrew. Follow the instrustions here:
http://sqitch.org/

PostgresQL link tutorials from the Sqitch site: https://metacpan.org/pod/sqitchtutorial

##TABLES
The following is my own naive attempt at starting the BE part of ticket 2040 As a user, `I need to be able to insert static milestones into my calendar`, pre Gio's (or anyone else's input). I've used relevant examples from the above tutorial.

###create a new table called `user_events`

> sqitch add <name of table> --requires appschema -n 'Creates table to track our users.'
Created deploy/users.sql
Created revert/users.sql
Created verify/users.sql
Added "users [appschema]" to sqitch.plan

...continued in different file.


##FIELDS
You'll need these commands in order to run regressions and deploy. Create aliases in your .zshrc:
```
alias sqitch_revert='sqitch --engine pg revert --to @HEAD^ -y db:pg://postgres@localhost/lightful'
alias sqitch_deploy='sqitch --engine pg deploy --verify db:pg://postgres@localhost/lightful'
```

cd into the database directory within the api: `cd database`

once there run the following command to create a new a field. The first arg is specifying which table you are adding to along with the name of the sprint for future reference. The second arg is a commit note (but for a Sqitch commit. It'll appear as a comment at the top of the files createc):
`sqitch add invitesTableS24 -n 'add name field to invites table'` or you may see that some people have also included the date to avoid conflicts

Once you have run this then you will see something like this printed out in the terminal:
```
Created deploy/invitesTableS24.sql
Created revert/invitesTableS24.sql
//don't worry about `verify`. we don't use it much
Created verify/invitesTableS24.sql
Added "invitesTableS24" to sqitch.plan
```

These are the files in which you will need to write your SQL queries. You can write it manually or you can go into Postico, go into the table you're modifying, name the field and hit SQL preview. That'll give you the code which you need to copy into the deploy file. It should look something like this:
```
BEGIN;

// here the character verifying is our type but this may be `sting` or `int` or you can create custom types just like you may have to in GQL.
// we have pulic and lightful_private tables. Public will create
ALTER TABLE "public"."invites" ADD COLUMN "invite_name" character varying(255);

//you may have to write a function to create defaults for the column you've added. check `deploy/organisationss26` for an example of this.

//You'll be able to test your sql in navigate > go to terminal. Maybe have a look at pg admin instead of postico for all you database GUI needs. It'll show you all of the functions as well as the tables.

COMMIT;
```
The code in the revert directory should look something like this (not sure that it is possible to grab this from Postico)
```
BEGIN;

ALTER TABLE "public"."invites" DROP COLUMN "invite_name";

COMMIT;
```
Finally the code for the revert (I think that I mean verify here):
```
BEGIN;

SELECT invite_name from invites where false;

ROLLBACK;
```

now if you run `sqitch_deploy` (assuming you created the aforementioned aliases) then you should see it do it's thing. It is better, however, to do this: `sqitch_revert && sqitch_deploy` to check they both work.

Next you'll need to add the functions for this new field. Run this:
`sqitch add inviteFucntionS24 -n 'invite name field function'`

Again it will create three new files like so:
```
Created deploy/inviteFucntionS24.sql
Created revert/inviteFucntionS24.sql
Created verify/inviteFucntionS24.sql
Added "inviteFucntionS24" to sqitch.plan
```

You'll may be able to copy the code from whatever the latest release was and just add your new field to it. There is a bunch of code in here but the important stuff is in the `create` and `drop` functions at the top. Note that you are dropping the table _without_ your new field in it and then creating the table _with_ your new field:
```
DROP FUNCTION lightful_private.create_invite(
    created_by_user_id uuid,
    invite_send_method invite_send_methods,
    send_to character varying,
    invite_type invite_types,
    to_organisation_id uuid,
    to_role_id uuid);

CREATE FUNCTION lightful_private.create_invite(
    created_by_user_id uuid,
    invite_send_method invite_send_methods,
    send_to character varying,
    invite_name character varying,
    invite_type invite_types,
    to_organisation_id uuid,
    to_role_id uuid)
  RETURNS invites AS
$$
```

...the opposite is true of the revert function:
```
DROP FUNCTION lightful_private.create_invite(
    created_by_user_id uuid,
    invite_send_method invite_send_methods,
    send_to character varying,
    invite_name character varying,
    invite_type invite_types,
    to_organisation_id uuid,
    to_role_id uuid);

CREATE FUNCTION lightful_private.create_invite(
    created_by_user_id uuid,
    invite_send_method invite_send_methods,
    send_to character varying,
    invite_type invite_types,
    to_organisation_id uuid,
    to_role_id uuid)
  RETURNS invites AS
$$
```

...we don't appear to have done anything with the `verify` function.

Now we can alter the mutation to populate our new field:
within `src/organisations/createInvite.mutation.js` we add `inviteName` just below wherever it says `sendTo` (as we know that it will be a field which is filled out in the same form as `sendTo`)

Also fill in `inviteName` within `src/organisations/services/invite.js` **make sure that for these last two steps you get everything in the right order otherwise the tests may fail.**

Finally put the new field in the appropriate test. In this case we pop it in here:
`organistations/createInvite.mutation.spec.js`
and it'll look something like this:
```
const args = {
  userId: guestUser.id,
  sendTo: 'test@lightful.com',
  inviteName: faker.random.word(),
  organisationId,
  roleId
}
```
You'll need to brew install `watchman` in order to make sure the test passes.
you can run the test by running something like this:
```
node_modules/.bin/jest /Users/benedictgreen/development/lightful/delightfulapi/__tests__/unit/organistations/createInvite.mutation.spec.js --runInBand --watch
```

If you're all good at this point then you should be done with adding a new field to the backend.

##FUNCTIONS

This is the function which James talked me through. It does the following:
- adds a column called `onboarding_state` to the `organisations` table.
- for existing organisations it sets their state to `complete`. Only new organisations will be onboarded
- puts the organisation at the start of the onboarding process if they don't have social accounts connected. (Surely this would be applicable to existing organisations, therefore we must only be setting organisations' state to complete if they do have social accounts connected otherwise we'll be onboarding them?? Dunno)

// NOTE: the `--` at the start of the is the SQL syntax for comments
// Path for the following file: `delightfulapi/database/deploy/organisationsS26.sql`

```
-- Deploy delightfulapi:organisationsS26 to pg

BEGIN;

ALTER TABLE "organisations" ADD COLUMN "onboarding_state" account_onboarding_states NOT NULL DEFAULT 'confirm';

-- all organisations go to complete
UPDATE public.organisations SET onboarding_state = 'complete';

-- if they don't have social accounts then put them to the beginning of the onboarding process
UPDATE public.organisations
SET onboarding_state = 'confirm'
WHERE NOT EXISTS (
    SELECT * FROM public.social_identities
    WHERE social_identities.organisation_id = organisations.id
    AND social_identities.social_identity_state = 'active'
);

-- create a function to alter the onboarding state
CREATE OR REPLACE FUNCTION public.update_organisation_onboarding_state(
    onboarding_state account_onboarding_states
) returns public.organisations as $$

-- this is how you set a veriable in psql:
DECLARE organisations public.organisations;
BEGIN
    perform lightful_private.throw_on_no_permission('edit', 'organisation');

    UPDATE public.organisations
        -- Setting the first argument of the function. We have to reference it using dot notation and the name of the function
        SET onboarding_state = update_organisation_onboarding_state.onboarding_state
        WHERE id = NULLIF(current_setting('jwt.claims.organisation_id'), '')::uuid
    RETURNING * INTO organisations;

    RETURN organisations;

END;
$$ language plpgsql security definer;

GRANT EXECUTE ON FUNCTION public.update_organisation_onboarding_state(account_onboarding_states) TO customer;

COMMENT ON FUNCTION public.update_organisation_onboarding_state(account_onboarding_states)
IS 'Updates the organisation onboarding state';

COMMIT;
```

eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlJqWkVPVVEyUmtJd1FqTkNRVFEyTUVVNFEwTXpSakl6UVRFeFJUQTBOMEkzUWpaQk16RXhSQSJ9.eyJuaWNrbmFtZSI6ImJyaGdyZWVuIiwibmFtZSI6ImJlbmVkaWN0QGxpZ2h0ZnVsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci9kZDIzY2YwZWZhNDA1MjQ5MmRmNTU0N2U4YjMxMjJiNT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmJlLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDE4LTA0LTE4VDEwOjMyOjIyLjM3N1oiLCJlbWFpbCI6ImJlbmVkaWN0QGxpZ2h0ZnVsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2xpZ2h0ZnVsLWRldi5ldS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NThhNzE0ODdhOGM1NzE0NWYxNjgyYjEzIiwiYXVkIjoiMThPNm82WHd0clVqbEpGdzd4S3hwVHZJaEVVa2VnODIiLCJpYXQiOjE1MjQwNDc1NDIsImV4cCI6MTUyNDA4MzU0Mn0.j9ek6k40Y20Va_Tj9R-fC2tx6VdXHfBGSnbKPO1Wij2_PuWp6mbmOCV4a3uCLsvkf7kG9-7iOTkVe3DgwGjTXaaW1osL9fxfTaqjAMZRp-3HQDGJsVSWxlZ0aFeRl6Fj7Gc1gFd2kghJmtlRo4Wt1GEPNAiBGMsvKIn8nmgGFOffUKZdQDr_SfrC4k4Ioerjsx94UDd9RMfU5L0E6v-h8cjey1suGZ9KoxrJ1p5cZebWnmaTPmqfNE1hJgbetOmvL9rEEIJzO8ByteYDHkLNY4YQzSxEn1xmg791PU87cRAb8K7cji9nHxLpV5JgPSOvlkW49KzvIpKY8a0vWbrCqQ
