Notes:
- Order: within deploy/calendar_events: Create table, add trigger, enable policies.
To do:
- put `title` and `description` on users_events table.
- Change name of table to 'events'
- Create new field on table for org id
- Make CRUD operations
- ROW ACCESS POLICY
- Tests

Questions:
- When using a uuid as a foreign key (such as org id or user id in this case), it is possible within Postico to specify it as such but when looking at the SQL preview I don't see how this could information is passed.
This is the SQL preview when you make alterations to a table. So it's set once looks like this is the answer to the above?:
```
ALTER TABLE "public"."events" RENAME TO "calendar_events";
ALTER TABLE "public"."calendar_events" RENAME CONSTRAINT "users_events_user_id_fkey" TO "events_user_id_fkey";
ALTER TABLE "public"."calendar_events"
  ADD COLUMN "organisation_id" uuid DEFAULT ,
  ADD COLUMN "when_last_updated" ,
  ADD COLUMN "event_states" calendar_event_states DEFAULT '',
  ADD CONSTRAINT "events_organisations_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id");
```

- Does `calendar_event_states` need a default. I would assume that as you (presumably) cannot create an event without making it active that we do not. -- answer the `default` _is_ what is assigned to that key when you create the table.


Creating calendar events:

type for events: `CREATE TYPE public.event_recurrence as enum('none', 'daily', 'weekly', 'monthly', 'annually')`
Sql for creating the table:
```
CREATE TABLE "public"."users_events" (
    "id" uuid DEFAULT lightful_private.uuid_generate_v1mc(),
    "user_id" uuid,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "recurrence" event_recurrence DEFAULT 'none',
    "name" varchar(250),
    "description" text,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
);
```

Function which generates sequence
```
CREATE OR REPLACE FUNCTION  generate_recurrences(
    recurs event_recurrence,
    start_date DATE,
    end_date DATE
)
    RETURNS setof DATE
    LANGUAGE plpgsql IMMUTABLE
    AS $BODY$
DECLARE
    next_date DATE := start_date;
    duration  INTERVAL;
    day       INTERVAL;
    date_check     TEXT;
BEGIN
    IF recurs = 'none' THEN
        -- Only one date ever.
        RETURN next next_date;
    ELSIF recurs = 'weekly' THEN
        duration := '7 days'::interval;
        WHILE next_date <= end_date LOOP
            RETURN NEXT next_date;
            next_date := next_date + duration;
        END LOOP;
    ELSIF recurs = 'daily' THEN
        duration := '1 day'::interval;
        WHILE next_date <= end_date LOOP
            RETURN NEXT next_date;
            next_date := next_date + duration;
        END LOOP;
    ELSIF recurs = 'monthly' THEN
        duration := '27 days'::interval;
        day      := '1 day'::interval;
        date_check    := to_char(start_date, 'DD');
        WHILE next_date <= end_date LOOP
            RETURN NEXT next_date;
            next_date := next_date + duration;
            WHILE  to_char(next_date, 'DD') <> date_check LOOP
                next_date := next_date + day;
            END LOOP;
        END LOOP;
    ELSE
        -- Someone needs to update this function, methinks.
        RAISE EXCEPTION 'Recurrence % not supported by generate_recurrences()', recurs;
    END IF;
END;
$BODY$;
```
******************************************************
##All the SQL from this ticket:
```
CREATE TYPE public.event_recurrence as enum('none', 'daily', 'weekly', 'monthly', 'annually')
DROP TYPE public.event_recurrence
DROP FUNCTION generate_recurrences(
    recurs event_recurrence,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
);
CREATE OR REPLACE FUNCTION  generate_recurrences(
    recurs event_recurrence,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
    RETURNS setof TIMESTAMP WITH TIME ZONE
    LANGUAGE plpgsql IMMUTABLE
    AS $BODY$
DECLARE
    next_date TIMESTAMP WITH TIME ZONE := start_date;
    duration  INTERVAL;
    day       INTERVAL;
    date_check     TEXT;
BEGIN
    IF recurs = 'none' THEN
        -- Only one date ever.
        RETURN next next_date;
    ELSIF recurs = 'weekly' THEN
        duration := '7 days'::interval;
        WHILE next_date <= end_date LOOP
            RETURN NEXT next_date;
            next_date := next_date + duration;
        END LOOP;
    ELSIF recurs = 'daily' THEN
        duration := '1 day'::interval;
        WHILE next_date <= end_date LOOP
            RETURN NEXT next_date;
            next_date := next_date + duration;
        END LOOP;
    ELSIF recurs = 'monthly' THEN
        duration := '27 days'::interval;
        day      := '1 day'::interval;
        date_check    := to_char(start_date, 'DD');
        WHILE next_date <= end_date LOOP
            RETURN NEXT next_date;
            next_date := next_date + duration;
            WHILE  to_char(next_date, 'DD') <> date_check LOOP
                next_date := next_date + day;
            END LOOP;
        END LOOP;
    ELSE
        -- Someone needs to update this function, methinks.
        RAISE EXCEPTION 'Recurrence % not supported by generate_recurrences()', recurs;
    END IF;
END;
$BODY$;

select * from  generate_recurrences('monthly', '2008-01-29 11:00', '2018-02-05');

DROP FUNCTION recurring_events_for(
   for_user_id UUID,
   range_start TIMESTAMP WITH TIME ZONE,
   range_end   TIMESTAMP WITH TIME ZONE
);

	CREATE OR REPLACE FUNCTION recurring_events_for(
	   for_user_id UUID,
	   range_start TIMESTAMP WITH TIME ZONE,
	   range_end   TIMESTAMP WITH TIME ZONE
	)
	   RETURNS SETOF users_events
	   LANGUAGE plpgsql STABLE
	   AS $BODY$
	DECLARE
	   event users_events;
	   start_date TIMESTAMP WITH TIME ZONE;
	   ends_at    TIMESTAMP WITH TIME ZONE;
	   next_date  DATE;
	   recurs_at  TIMESTAMP WITH TIME ZONE;
	BEGIN
	   FOR event IN
	       SELECT *
	         FROM users_events
	        WHERE user_id = for_user_id
	          AND (
	                  recurrence <> 'none'
	              OR  (
	                     recurrence = 'none'
	                 AND starts_at BETWEEN range_start AND range_end
	              )
	          )
	    LOOP
	       IF event.recurrence = 'none' THEN
	         RETURN NEXT event;
	         CONTINUE;
	       END IF;

	       start_date := event.starts_at;
	       ends_at    := event.ends_at;

	       FOR next_date IN
	           SELECT *
	             FROM generate_recurrences(
	                      event.recurrence,
	                      start_date,
	                      range_end
	             )
	       LOOP
	           recurs_at := next_date;
	           EXIT WHEN recurs_at > range_end;
	           CONTINUE WHEN recurs_at < range_start AND ends_at < range_start;
	           event.starts_at := recurs_at;
	           event.ends_at   := ends_at;
	           RETURN NEXT event;
	       END LOOP;
	   END LOOP;
	   RETURN;
	END;
	$BODY$;


select * from recurring_events_for('9578b512-17e2-11e8-84b5-e75821265700', '2018-12-19', '2022-12-26');
select * from users;
```
