PostgresQL link tutorials from the Sqitch site: https://metacpan.org/pod/sqitchtutorial

##TABLES
The following is my own naive attempt at starting the BE part of ticket 2040 As a user, `I need to be able to insert static milestones into my calendar`, pre Gio's (or anyone else's input). I've used relevant examples from the above tutorial.

###create a new table called `user_events`

> sqitch add <name of table> --requires appschema -n 'Creates table to track our users.'
Created deploy/users.sql
Created revert/users.sql
Created verify/users.sql
Added "users [appschema]" to sqitch.plan
