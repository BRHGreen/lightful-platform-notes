Testing:
Test CRUD operations. Try changing state of calendar event to deleted.



-- this `TRIGGER` fires before a user tries to select, insert or update a row on the table??

CREATE TRIGGER update_listen_rules_when_last_updated
    BEFORE UPDATE ON public.listen_rules FOR EACH ROW
    EXECUTE PROCEDURE lightful_private.update_when_last_updated_column();

alter table public.listen_rules enable row level security;
grant select, update, insert on table public.listen_rules to customer;
grant select, update, insert on table public.listen_rules to internal;
grant select, update, insert on table public.listen_rules to administrator;

create policy select_listen_rule on public.listen_rules for select to customer
    using
    (
        (
            (
                user_id = NULLIF(current_setting('jwt.claims.user_id'), '')::uuid
                AND
                organisation_id IS NULL
                AND NULLIF(current_setting('jwt.claims.org'), '')::uuid IS NULL
            )
            OR
                organisation_id = NULLIF(current_setting('jwt.claims.org'), '')::uuid
        )
        AND rule_state <> 'deleted'
    );

create policy update_listen_rule on public.listen_rules for update to customer
    using
    (
        (
            (
                user_id = NULLIF(current_setting('jwt.claims.user_id'), '')::uuid
                AND
                organisation_id IS NULL
                AND NULLIF(current_setting('jwt.claims.org'), '')::uuid IS NULL
            )
            OR
                organisation_id = NULLIF(current_setting('jwt.claims.org'), '')::uuid
        )
        AND rule_state <> 'deleted'
    )
    with check
    (
        (
            user_id = NULLIF(current_setting('jwt.claims.user_id'), '')::uuid
            AND
            organisation_id IS NULL
            AND NULLIF(current_setting('jwt.claims.org'), '')::uuid IS NULL
        )
        OR
            organisation_id = NULLIF(current_setting('jwt.claims.org'), '')::uuid
    );

create policy insert_listen_rule on public.listen_rules for insert to customer
    with check
    (
        (
            user_id = NULLIF(current_setting('jwt.claims.user_id'), '')::uuid
            AND
            organisation_id IS NULL
            AND NULLIF(current_setting('jwt.claims.org'), '')::uuid IS NULL
        )
        OR
            organisation_id = NULLIF(current_setting('jwt.claims.org'), '')::uuid
    );
