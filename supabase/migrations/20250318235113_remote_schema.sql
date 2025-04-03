create type "public"."completion_status" as enum ('Trained', 'Mastered');

create table "public"."lesson_item_associations" (
    "lesson_id" bigint not null,
    "lesson_item_id" bigint not null,
    "completion_degree" completion_status
);


create table "public"."lessons" (
    "id" bigint generated always as identity not null,
    "profile_id" uuid,
    "title" text not null,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "amount_hours" integer not null default 0,
    "date" date,
    "time" time without time zone
);


create table "public"."lessons_items" (
    "id" bigint generated always as identity not null,
    "title" text not null,
    "description" text
);

pg_dump --schema-only --no-owner --no-privileges --no-comments --file=current_schema.sql postgresql://postgres:qp10wo2397h@db.lctywkbjskclilxtfiux.supabase.co:5432/postgres

postgresql://postgres.lctywkbjskclilxtfiux:qp10wo2397h@aws-0-eu-central-2.pooler.supabase.com:5432postgres


alter table "public"."lessons_items" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "updated_at" timestamp with time zone,
    "nome_utente" text,
    "avatar_url" text,
    "admin" boolean default false,
    "email" text,
    "phone" text default '+41 (0) '::text,
    "date_of_birth" date,
    "cognome_utente" text,
    "nip" text,
    "address" text,
    "sensibilizzazione" boolean,
    "licenza_date" date,
    "full_name" text,
    "soccorritori" boolean
);


CREATE UNIQUE INDEX lesson_item_associations_pkey ON public.lesson_item_associations USING btree (lesson_id, lesson_item_id);

CREATE UNIQUE INDEX lessons_items_pkey ON public.lessons_items USING btree (id);

CREATE UNIQUE INDEX lessons_pkey ON public.lessons USING btree (id);

CREATE INDEX lessons_profile_id_idx ON public.lessons USING btree (profile_id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."lesson_item_associations" add constraint "lesson_item_associations_pkey" PRIMARY KEY using index "lesson_item_associations_pkey";

alter table "public"."lessons" add constraint "lessons_pkey" PRIMARY KEY using index "lessons_pkey";

alter table "public"."lessons_items" add constraint "lessons_items_pkey" PRIMARY KEY using index "lessons_items_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."lesson_item_associations" add constraint "lesson_item_associations_lesson_id_fkey" FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE not valid;

alter table "public"."lesson_item_associations" validate constraint "lesson_item_associations_lesson_id_fkey";

alter table "public"."lesson_item_associations" add constraint "lesson_item_associations_lesson_item_id_fkey" FOREIGN KEY (lesson_item_id) REFERENCES lessons_items(id) ON DELETE CASCADE not valid;

alter table "public"."lesson_item_associations" validate constraint "lesson_item_associations_lesson_item_id_fkey";

alter table "public"."lessons" add constraint "lessons_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."lessons" validate constraint "lessons_profile_id_fkey";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;
$function$
;

create or replace view "public"."lesson_item_details_view" as  SELECT lia.lesson_id,
    lia.lesson_item_id,
    lia.completion_degree,
    li.title,
    li.description
   FROM (lesson_item_associations lia
     JOIN lessons_items li ON ((lia.lesson_item_id = li.id)));


create or replace view "public"."profiles_table" as  SELECT p.id,
    p.updated_at,
    p.nome_utente,
    p.avatar_url,
    p.admin,
    p.email,
    p.phone,
    p.date_of_birth,
    p.cognome_utente,
    p.nip,
    p.address,
    p.sensibilizzazione,
    p.licenza_date,
    p.full_name,
    p.soccorritori,
    COALESCE(( SELECT sum(l.amount_hours) AS sum
           FROM lessons l
          WHERE (l.profile_id = p.id)), (0)::bigint) AS total_hours
   FROM profiles p;


CREATE OR REPLACE FUNCTION public.update_all_days_left()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE profiles
  SET days_left = GREATEST(0, (licenza_date - CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day');
END;
$function$
;

grant delete on table "public"."lesson_item_associations" to "anon";

grant insert on table "public"."lesson_item_associations" to "anon";

grant references on table "public"."lesson_item_associations" to "anon";

grant select on table "public"."lesson_item_associations" to "anon";

grant trigger on table "public"."lesson_item_associations" to "anon";

grant truncate on table "public"."lesson_item_associations" to "anon";

grant update on table "public"."lesson_item_associations" to "anon";

grant delete on table "public"."lesson_item_associations" to "authenticated";

grant insert on table "public"."lesson_item_associations" to "authenticated";

grant references on table "public"."lesson_item_associations" to "authenticated";

grant select on table "public"."lesson_item_associations" to "authenticated";

grant trigger on table "public"."lesson_item_associations" to "authenticated";

grant truncate on table "public"."lesson_item_associations" to "authenticated";

grant update on table "public"."lesson_item_associations" to "authenticated";

grant delete on table "public"."lesson_item_associations" to "service_role";

grant insert on table "public"."lesson_item_associations" to "service_role";

grant references on table "public"."lesson_item_associations" to "service_role";

grant select on table "public"."lesson_item_associations" to "service_role";

grant trigger on table "public"."lesson_item_associations" to "service_role";

grant truncate on table "public"."lesson_item_associations" to "service_role";

grant update on table "public"."lesson_item_associations" to "service_role";

grant delete on table "public"."lessons" to "anon";

grant insert on table "public"."lessons" to "anon";

grant references on table "public"."lessons" to "anon";

grant select on table "public"."lessons" to "anon";

grant trigger on table "public"."lessons" to "anon";

grant truncate on table "public"."lessons" to "anon";

grant update on table "public"."lessons" to "anon";

grant delete on table "public"."lessons" to "authenticated";

grant insert on table "public"."lessons" to "authenticated";

grant references on table "public"."lessons" to "authenticated";

grant select on table "public"."lessons" to "authenticated";

grant trigger on table "public"."lessons" to "authenticated";

grant truncate on table "public"."lessons" to "authenticated";

grant update on table "public"."lessons" to "authenticated";

grant delete on table "public"."lessons" to "service_role";

grant insert on table "public"."lessons" to "service_role";

grant references on table "public"."lessons" to "service_role";

grant select on table "public"."lessons" to "service_role";

grant trigger on table "public"."lessons" to "service_role";

grant truncate on table "public"."lessons" to "service_role";

grant update on table "public"."lessons" to "service_role";

grant delete on table "public"."lessons_items" to "anon";

grant insert on table "public"."lessons_items" to "anon";

grant references on table "public"."lessons_items" to "anon";

grant select on table "public"."lessons_items" to "anon";

grant trigger on table "public"."lessons_items" to "anon";

grant truncate on table "public"."lessons_items" to "anon";

grant update on table "public"."lessons_items" to "anon";

grant delete on table "public"."lessons_items" to "authenticated";

grant insert on table "public"."lessons_items" to "authenticated";

grant references on table "public"."lessons_items" to "authenticated";

grant select on table "public"."lessons_items" to "authenticated";

grant trigger on table "public"."lessons_items" to "authenticated";

grant truncate on table "public"."lessons_items" to "authenticated";

grant update on table "public"."lessons_items" to "authenticated";

grant delete on table "public"."lessons_items" to "service_role";

grant insert on table "public"."lessons_items" to "service_role";

grant references on table "public"."lessons_items" to "service_role";

grant select on table "public"."lessons_items" to "service_role";

grant trigger on table "public"."lessons_items" to "service_role";

grant truncate on table "public"."lessons_items" to "service_role";

grant update on table "public"."lessons_items" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

create policy "Enable read access for all users"
on "public"."lessons_items"
as permissive
for select
to public
using (true);


create policy "Enable update for all users"
on "public"."profiles"
as permissive
for update
to public
using (true)
with check (true);


create policy "Public profiles are viewable by everyone."
on "public"."profiles"
as permissive
for select
to public
using (true);


create policy "Users can insert their own profile."
on "public"."profiles"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Users can update own profile."
on "public"."profiles"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = id));



