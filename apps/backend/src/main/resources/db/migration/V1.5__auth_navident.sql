DELETE
FROM AUTH;

ALTER TABLE AUTH
    ADD COLUMN NAV_IDENT TEXT;

ALTER TABLE AUTH
    ALTER COLUMN NAV_IDENT SET NOT NULL;
