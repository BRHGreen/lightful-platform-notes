In order to get the awareness day and the calendar events created by users it's more efficient to use `UNION` to join the queries so we can get all of the data we need with only one query. This is done by creating a new `TYPE` and returning datatypes within this `TYPE` for each query in the `UNION`.

-- Deploy delightfulapi:calendarEventsFunctionsS28v2 to pg

BEGIN;

CREATE TYPE public.calendar_event_item AS
(
  id UUID,
  name varchar(250),
  description text,
  event_type text,
  start_date timestamp with time zone,
  end_date timestamp with time zone
);

CREATE FUNCTION public.search_calendar_events (
  date_from timestamp with time zone,
  date_to timestamp with time zone
) returns setof public.calendar_event_item as $$
  SELECT
    awareness_days.id,
    awareness_days.name AS name,
    awareness_days.name AS description,
    'AWARENESS'::text AS event_type,
    to_timestamp(
      to_char(awareness_years.year, '9999') || to_char(awareness_days.month,'00') || to_char(awareness_days.day,'00'),
      'YYYYMMDD'
    ) AS start_date,
    to_timestamp(
      to_char(awareness_years.year, '9999') || to_char(awareness_days.month,'00') || to_char(awareness_days.day,'00'),
      'YYYYMMDD'
    ) AS end_date
  FROM awareness_days, awareness_years
  WHERE (
    to_timestamp(
      to_char(awareness_years.year, '9999') || to_char(awareness_days.month,'00') || to_char(awareness_days.day,'00'),
      'YYYYMMDD')
    ) <= date_to
  AND (
    to_timestamp(
      to_char(awareness_years.year, '9999') || to_char(awareness_days.month,'00') || to_char(awareness_days.day,'00'),
      'YYYYMMDD')
    ) >= date_from

    UNION

  SELECT
    calendar_events.id,
    calendar_events.name AS name,
    calendar_events.description AS description,
    'EVENT'::text AS event_type,
    calendar_events.starts_at AS start_date,
    calendar_events.ends_at AS start_date
  FROM calendar_events
  WHERE
    calendar_events.starts_at >= date_from
  AND
    calendar_events.starts_at <= date_to;

$$ language sql stable;

grant execute on function public.search_awareness_days
(
  date_from timestamp with time zone,
  date_to timestamp with time zone
) to customer;

comment on function public.search_awareness_days
(date_from timestamp with time zone, date_to timestamp with time zone) is 'Returns a set of awareness days for a given date range.';


COMMIT;
