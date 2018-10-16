#This is the stuff which I copied out of Postico after Gio tinkered with it.
I just copied it right in here so there are some type declarations, queries and functions all mixed up. I know, it's not pretty.
It's also worth noting that the tests for the calendarService tear down the DB so when you run them you won't have any users, orgs etc in the DB.

GQL Stuff:
input for creating/updating calendar events:
`{"startsAt": "2018-03-08T16:36:33.939Z", "recurrence": "WEEKLY", "endsAt": "2019-03-08T16:36:33.939Z", "name": "test event two", "description": "test description two"}`

##IMPORTANT! this...
`GRANT EXECUTE ON FUNCTION public.recurring_events_for(
   range_start TIMESTAMP WITH TIME ZONE,
   range_end   TIMESTAMP WITH TIME ZONE
) to customer;`
...is needed in order to give us access to this function in Graphiql...and probably the front end as a whole??
##IMPORTANT! this...
```
(
	(
		user_id = NULLIF(current_setting('jwt.claims.user_id'), '')::uuid
		AND organisation_id IS NULL
	)
	OR
	organisation_id = NULLIF(current_setting('jwt.claims.org'), '')::uuid

)
```
...is the condition which determines whether the event created is associated with a user or with an org. Also note the `jwt.claims.user_id` bit. This is means that we are identifying the users or org using the JWT associated with their ID (so as not to expose their ID, I think.) The `::` is SQL syntax for reassigning a variable another value.

CREATE TYPE public.event_recurrence as enum('none', 'daily', 'weekly', 'monthly', 'annually')
CREATE TYPE public.calendar_event_states AS ENUM('active', 'deleted');
DROP TYPE public.event_recurrence
DROP FUNCTION generate_recurrences(
    recurs event_recurrence,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
);
CREATE OR REPLACE FUNCTION lightful_private.generate_recurrences(
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

DROP FUNCTION public.recurring_events_for(
   range_start TIMESTAMP WITH TIME ZONE,
   range_end   TIMESTAMP WITH TIME ZONE
);

	CREATE OR REPLACE FUNCTION public.recurring_events_for(
	   range_start TIMESTAMP WITH TIME ZONE,
	   range_end   TIMESTAMP WITH TIME ZONE
	)
	   RETURNS SETOF calendar_events
	   LANGUAGE plpgsql STABLE
	   AS $$
	DECLARE
	   event calendar_events;
	   start_date TIMESTAMP WITH TIME ZONE;
	   ends_at    TIMESTAMP WITH TIME ZONE;
	   next_date  DATE;
	   recurs_at  TIMESTAMP WITH TIME ZONE;
	BEGIN
	   FOR event IN
	       SELECT *
	         FROM calendar_events
	        WHERE

	        	(
	        		(
	        			user_id = NULLIF(current_setting('jwt.claims.user_id'), '')::uuid
		        		AND organisation_id IS NULL
	        		)
		        	OR
		        	organisation_id = NULLIF(current_setting('jwt.claims.org'), '')::uuid

	        	)

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
	             FROM lightful_private.generate_recurrences(
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
$$ security definer;

GRANT EXECUTE ON FUNCTION public.recurring_events_for(
   range_start TIMESTAMP WITH TIME ZONE,
   range_end   TIMESTAMP WITH TIME ZONE
) to customer;

select * from recurring_events_for('2018-03-07', '2019-03-07')
union
select * from calendar_events where user_id = '85dd0f26-221f-11e8-a3af-bbbc02b1cabf';
