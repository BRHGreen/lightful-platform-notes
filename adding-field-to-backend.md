First up install squitch this using homebrew. Follow the instrustions here:
http://sqitch.org/

and you'll need these commands in order to run regressions and deploy. Create aliases in your .zshrc:
```
alias sqitch_revert='sqitch --engine pg revert --to @HEAD^ -y db:pg://postgres@localhost/lightful'
alias sqitch_deploy='sqitch --engine pg deploy --verify db:pg://postgres@localhost/lightful'
```

cd into the database directory within the api: `cd database`

once there run the following command to create a new a field. The first arg is specifying which table you are adding to along with the name of the sprint for future reference. The second arg is just a commit note:
`sqitch add invitesTableS24 -n 'add name field to invites table'`

Once you have run this then you will see something like this printed out in the terminal:
```
Created deploy/invitesTableS24.sql
Created revert/invitesTableS24.sql
Created verify/invitesTableS24.sql
Added "invitesTableS24" to sqitch.plan
```

These are the files in which you will need to write your SQL queries. You can write it manually or you can go into Postico, go into the table you're modifying, name the field and hit SQL preview. That'll give you the code which you need to copy into the deploy file. It should look something like this:
```
BEGIN;

ALTER TABLE "public"."invites" ADD COLUMN "invite_name" character varying(255);

COMMIT;
```
The code in the revert directory should look something like this (not sure that it is possible to grab this from Postico)
```
BEGIN;

ALTER TABLE "public"."invites" DROP COLUMN "invite_name";

COMMIT;
```
Finally the code for the revert:
```
BEGIN;

SELECT invite_name from invites where false;

ROLLBACK;
```

now if you run `sqitch_deploy` (assuming you created the aforementioned aliases) then you should see it do it's thing. It is better, however, to do this: `sqitch_revert && sqitch_deploy` to check they both work.

Next you'll need to add the functions for this new field. Run this:
`sqitch add inviteFucntionS24 -n 'invite name feild function'`

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
within `src/organisations/createInvite.mutation.js` we add `inviteName` just below wherever it says `sendTo` (as we know that it will me a field which is filled out in the same form as `sendTo`)

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
