# PostHog person is the Clerk user id

Product analytics must attribute client and server events to one person per signed-up user. We use Clerk `user.id` as the PostHog `distinct_id` everywhere. Email, name, and image are person properties, not the id. We do not alias the database user row id or email onto a separate distinct id.

Before this decision, the client identified by email (or reset on every Clerk user object change), the server often captured with email or Clerk id inconsistently, and signup aliased email to the database cuid—so one human appeared as many PostHog persons and funnel counts could not be trusted.
