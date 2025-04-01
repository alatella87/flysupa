drop view if exists "public"."profiles_table";

alter table "public"."lessons" drop column "description";

alter table "public"."lessons" drop column "title";

alter table "public"."profiles" drop column "cognome_utente";

alter table "public"."profiles" drop column "full_name";

alter table "public"."profiles" add column "license_url" text;

alter table "public"."profiles" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$BEGIN
  INSERT INTO public.profiles (id, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;$function$
;


