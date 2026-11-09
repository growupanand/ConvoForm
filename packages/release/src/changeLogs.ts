export const releases = [
  {
    version: "0.20.0",
    isoDate: "2026-11-09",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 add google sheet integration for sync form responses\n\n✅ Closes: #482",
        href: "https://github.com/growupanand/ConvoForm/commit/2dce7f3d8fe8ba59caa77ddf192bb77e02dcae75",
      },
      {
        type: "features",
        message:
          "feat: 🚀 migrate realtime server to cloudflare workers\n\nRender websocket host was gone, so stop events and live updates\nfailed. Run the same protocol on a Worker plus Durable Object.\n\n- add RealtimeHub with WebSocket hibernation and wrangler config\n- remove Bun serve entry; update docker, docs, and client URL fallbacks\n\n✅ Closes: #506",
        href: "https://github.com/growupanand/ConvoForm/commit/21f39a930d86935c1a244c2b90a5b38524c48625",
      },
      {
        type: "features",
        message:
          "feat: 🚀 allow mobile sign-in and hand off to desktop\n\nPeople arriving from WhatsApp and Instagram were blocked before they\ncould create an account. Sign-up and sign-in now work on a phone, and\na signed-in visitor is sent a link to continue on a laptop.\n\n- keep auth and workspace setup available below 1024px\n- replace the editor gate with a continue-on-desktop handoff\n- email the signed-in user a desktop link, rate-limited to 3 a day\n\n✅ Closes: #504",
        href: "https://github.com/growupanand/ConvoForm/commit/367e9329b1c3ddd01ec249324ea3cee41b31bc8b",
      },
      {
        type: "features",
        message:
          "feat: 🚀 restyle live demo and simplify landing sections\n\nThe demo now needs its own full section, and the landing before/after block is redundant because both use-case pages carry the same animation.\n\n- restyle the demo form and live responses as matching 600px cards\n- add a mobile CTA linking to /view/demo\n- move the demo below Who is ConvoForm for?\n- remove the Why a conversation section and its tab data\n- move the Peerlist achievement into the founder note\n- update docs and smoke tests",
        href: "https://github.com/growupanand/ConvoForm/commit/07284a399888e85363b8f91cd5f5a693778dc6a9",
      },
      {
        type: "features",
        message:
          "feat: 🚀 auto-create personal workspace on first sign-in\n\nNew users with no organization stopped on Clerk's org screen and\nnever reached form creation.\n\n- create a personal workspace and continue to /forms\n- keep the org picker for people who already have an organization\n- write the OrganizationMember row once if the webhook is retried\n\n✅ Closes: #497",
        href: "https://github.com/growupanand/ConvoForm/commit/b7d5b3a4cf4cbed82f69fce7e72c651e6e50f44f",
      },
      {
        type: "features",
        message:
          "feat: 🚀 publish study-abroad use-case page\n\nConsultancies get a dedicated page with intake pain, example fields,\nlive product screenshots, and honest ships-today vs planned labels.\n\n- add /use-cases/study-abroad with single Start building CTA\n- link from homepage only; sitemap and public routes updated\n- share article path constant for #495 cross-linking\n\n✅ Closes: #494",
        href: "https://github.com/growupanand/ConvoForm/commit/4163e70905575bdea366e037663c079ab236f350",
      },
      {
        type: "features",
        message:
          "546 conversation journey timeline on the conversation detail page",
        href: "https://github.com/growupanand/ConvoForm/pull/547",
      },
      {
        type: "features",
        message: "feat: 🚀 add webhook settings ui delivery log and docs",
        href: "https://github.com/growupanand/ConvoForm/pull/545",
      },
      {
        type: "features",
        message: "feat: 🚀 add cloudflare workflow webhook delivery engine",
        href: "https://github.com/growupanand/ConvoForm/pull/544",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add outgoing webhook delivery for completed responses",
        href: "https://github.com/growupanand/ConvoForm/pull/543",
      },
      {
        type: "features",
        message: "feat: 🚀 publish job-application article and articles index",
        href: "https://github.com/growupanand/ConvoForm/pull/540",
      },
      {
        type: "features",
        message: "feat: 🚀 add geo structured data and llms.txt",
        href: "https://github.com/growupanand/ConvoForm/pull/538",
      },
      {
        type: "features",
        message: "feat: 🚀 publish study-abroad follow-ups article",
        href: "https://github.com/growupanand/ConvoForm/pull/536",
      },
      {
        type: "features",
        message: "feat: 🚀 replace old cf icon with v5 conversation mark",
        href: "https://github.com/growupanand/ConvoForm/pull/531",
      },
      {
        type: "features",
        message: "feat: 🚀 add job application use case page",
        href: "https://github.com/growupanand/ConvoForm/pull/529",
      },
      {
        type: "features",
        message: "feat: 🚀 rebuild hero and how it works with stageshow",
        href: "https://github.com/growupanand/ConvoForm/pull/528",
      },
      {
        type: "features",
        message: "feat: 🚀 add share previews and marketing perf polish",
        href: "https://github.com/growupanand/ConvoForm/pull/524",
      },
      {
        type: "features",
        message: "feat: 🚀 redesign public marketing and legal pages",
        href: "https://github.com/growupanand/ConvoForm/pull/523",
      },
      {
        type: "features",
        message: "feat: 🚀 add trust, founder note, faq, and final cta",
        href: "https://github.com/growupanand/ConvoForm/pull/522",
      },
      {
        type: "features",
        message: "feat: 🚀 add how-it-works and before-after landing sections",
        href: "https://github.com/growupanand/ConvoForm/pull/521",
      },
      {
        type: "features",
        message:
          "feat: 🚀 wire marketing shell, hero, and drop public user list",
        href: "https://github.com/growupanand/ConvoForm/pull/520",
      },
      {
        type: "features",
        message: "feat: 🚀 add telegram channel",
        href: "https://github.com/growupanand/ConvoForm/pull/485",
      },
      {
        type: "improvements",
        message: "perf: ⚡️ upgrade nextjs to latest 16.2.1",
        href: "https://github.com/growupanand/ConvoForm/commit/695ddb4239e595bd1be562de4a336fb14b0eb9e4",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 persist conversation snapshots reliably on node runtime\n\nThe conversation route ran on Edge and reused a module-level neon-serverless\nWebSocket pool, which could hang silently and drop after() saves.\n\n- run the conversation save routes on Node\n- timeout saves at 15s and retry once with a fresh pool\n- log patch timeout and success through the conversation logger\n- stop logging Axiom tokens and Clerk key prefixes\n- resolve the broadcast URL via getAPIDomainUrl and warn on non-ok responses",
        href: "https://github.com/growupanand/ConvoForm/commit/6465672f356fd08e103b1b745b7db4e3d8e2fa24",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 generate insights server-side on completion\n\nInsights were racing the websocket stop handler against patchConversation\nrunning in after(), so TLDRs often reflected a stale transcript.\n\n- generate and save insights from patchConversation when newly completed\n- limit websocket path to abandoned sessions and a 30s fallback\n- add insights observability logs and trim conversation analytics PII\n\n✅ Closes: #508",
        href: "https://github.com/growupanand/ConvoForm/commit/a727b7670bfcb54a18d9e50a264c89bac05cf034",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 make webhook fan-out reliable on completion\n\nWebhook rows were created after the LLM insights call inside Edge after(), so production completions could be terminated before fan-out ran.\n\n- create webhook deliveries before insights and isolate side-effect failures\n- add flushed structured fan-out logs and snapshot/coalesce conversation patches\n- cover insights failure and owner-preview webhook skipping in tests",
        href: "https://github.com/growupanand/ConvoForm/commit/11c0372426ad5d54d0d010165cfac576dae6ea48",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 reject rating answers outside allowed range\n\nLLM-only validation let out-of-range ratings complete the form. Enforce\n1..maxRating after extraction and add unit tests.\n\n✅ Closes: #509",
        href: "https://github.com/growupanand/ConvoForm/commit/532d7f7a77403c7ffc8c99dfba9c0455f75a0887",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 attribute respondent posthog events and trim payloads\n\nRespondent conversation analytics no longer fall back to unknown distinct_id\nor send transcript and field answers to PostHog.\n\n- use conversation id, org group, and count-only properties on create/update/complete\n- require explicit distinctId in the analytics provider and LLM tracing\n- mark owner /view submissions via org membership on page and API route\n\n✅ Closes: #501",
        href: "https://github.com/growupanand/ConvoForm/commit/3ec895f8b0d4660045dec45015db80ce21a9bf02",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 serve robots.txt and sitemap.xml and add canonical urls\n\nClerk middleware answered 404 for /robots.txt and /sitemap.xml on\nwww.convoform.com because they were not in isPublicRoute, and the docs\nsite had no robots or sitemap routes at all.\n\n- allow robots.txt and sitemap.xml through the Clerk proxy\n- rewrite www robots rules to block authenticated and app routes\n- list all public www routes in the sitemap (incl. /view/demo)\n- add absolute canonical urls on /, /changelog, /privacy and /terms\n- add robots.txt, sitemap.xml and metadataBase to the docs site\n\n✅ Closes: #488",
        href: "https://github.com/growupanand/ConvoForm/commit/5ab23bad35a3741a5cfc7b336a84dbea7148ad76",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 generate insights with the conversation model\n\nInsights called OpenAI directly and failed when only AI_API_KEY was set.\n\n- route insights through getModelConfig\n- record generateConversationInsights in llm analytics",
        href: "https://github.com/growupanand/ConvoForm/commit/585c41b987067bd5b9343ba8dc7baf2badb9dc76",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 send workflow instance params as json object\n\nCloudflare received params as a JSON string, so the Workflow payload had no\ndeliveryId. The Workflow also now identifies which config value is missing.\n\n- send params as an object while keeping instance_id for idempotency\n- assert the exact request body in the adapter test\n- name missing workflow config without printing secrets",
        href: "https://github.com/growupanand/ConvoForm/commit/555b8294c64f3699435304047573b5c702a45be6",
      },
      {
        type: "fixes",
        message: "fix: 🐛 make resend email failures observable",
        href: "https://github.com/growupanand/ConvoForm/pull/535",
      },
      {
        type: "fixes",
        message: "fix: 🐛 require internal auth on email and integration sync",
        href: "https://github.com/growupanand/ConvoForm/pull/533",
      },
    ],
  },
  {
    version: "0.19.0",
    isoDate: "2026-02-14",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 sending form response email to user\n\n✅ Closes: #468",
        href: "https://github.com/growupanand/ConvoForm/commit/76bd6c0c76a210d236a7ae67bc31f95bc07fe823",
      },
      {
        type: "features",
        message: "feat: 🚀 add OpenTelemetry tracing\n\n✅ Closes: #466",
        href: "https://github.com/growupanand/ConvoForm/commit/5e3829f670846260a35348119ed1b73d8d5c9b9f",
      },
      {
        type: "features",
        message:
          "feat: 🚀 collect form respondent metadata (location, device, browser etc)\n\n* chore: 🤖 save user metaData in conversation\n\n✅ Closes: #439\n\n* chore: 🤖 showing respondent meta information in conversation page\n\n✅ Closes: #439",
        href: "https://github.com/growupanand/ConvoForm/commit/355382c88524b7cd48d4dfffe8c534aeb998db20",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add AI-powered form response insights in conversation details\n\ncurrently we will auto generate in insights: TLDR, user tone, user sentiment and user queries\n\n✅ Closes: #444",
        href: "https://github.com/growupanand/ConvoForm/commit/67949f35549644442378ccf65c818438b3b7a0df",
      },
      {
        type: "features",
        message: "feat: 🚀 add AI provider: Groq\n\n✅ Closes: #463",
        href: "https://github.com/growupanand/ConvoForm/commit/8e22d9378d8d73d6c4c8d95de3f903e6ee165202",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add email package and send form response email on finished\n\n✅ Closes: #468",
        href: "https://github.com/growupanand/ConvoForm/commit/4d0fa7c1439ae4617b3e539a79890158adee7599",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add docker support for self hosting\n\nyou can use docker compose for easily setup convoform on your infra\n\n✅ Closes: #325",
        href: "https://github.com/growupanand/ConvoForm/commit/9cb2fd2e64cb2845e58f1f09915254d0e54c9bfd",
      },
      {
        type: "features",
        message: "feat: 🚀 add ollama provider support",
        href: "https://github.com/growupanand/ConvoForm/commit/c657ee2fc46aa84c4a02009cd940e23a63b779f7",
      },
      {
        type: "features",
        message: "feat: 🚀 File upload field support in form submission",
        href: "https://github.com/growupanand/ConvoForm/pull/455",
      },
      {
        type: "improvements",
        message:
          "refactor: tier 1 critical security and stability fixes\n- Fix CORS vulnerability in TRPC and Next.js config (PR-1.1)\n- Remove secrets from Docker build args (PR-1.2)\n- Enable React Strict Mode (PR-1.3)\n- Add runtime environment variable validation (PR-1.4)\n- Fix TypeScript build errors and enable CI checks (PR-1.5)\n- Add Global Error Boundaries (PR-1.6)\n- Add Missing Loading States (PR-1.7)\n- Update CI Node version to 22 (PR-1.8)\n\nCo-Authored-By: Claude Opus 4.6 &lt;noreply@anthropic.com&gt;",
        href: "https://github.com/growupanand/ConvoForm/commit/16a59b0997513a198a68ec4c275d1fbcbb64bb20",
      },
      {
        type: "improvements",
        message: "style: 💄 migrated to new shadcn sidebar\n\n✅ Closes: #451",
        href: "https://github.com/growupanand/ConvoForm/commit/5dbda35b24f491b147574a7e93dac1ffd839409f",
      },
      {
        type: "improvements",
        message: "style: 💄 UX improvements",
        href: "https://github.com/growupanand/ConvoForm/commit/c111aa6bb47fcbc5d678d76e405f49de611342ac",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 rate limit package is more readable and easy to use",
        href: "https://github.com/growupanand/ConvoForm/commit/6535ed58e12906a0e2c6393e22f113446457ea37",
      },
      {
        type: "improvements",
        message: "refactor: 💡 pricing config is more readable and usable",
        href: "https://github.com/growupanand/ConvoForm/commit/e8b7e518660bd7166aea52c42617f3812b06bcec",
      },
      {
        type: "improvements",
        message: "perf: ⚡️ 456 revamp conversation service for ai sdk v5",
        href: "https://github.com/growupanand/ConvoForm/pull/457",
      },
      {
        type: "fixes",
        message: "fix: 🐛 fix React Server Components CVE vulnerabilities",
        href: "https://github.com/growupanand/ConvoForm/commit/264294038ab8abb685a48658edf8613ca300bbf5",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 unable to upload file in form submission page (user not found)\n\nmake file upload trpc route to public available",
        href: "https://github.com/growupanand/ConvoForm/commit/eb69e621ae127ca47ef187e9f204450233c9fdcc",
      },
      {
        type: "fixes",
        message: "fix: 🐛 label text overflow in mcq option\n\n✅ Closes: #434",
        href: "https://github.com/growupanand/ConvoForm/commit/aa4fd98516144ad478b6807242f634ea58233121",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 invalid value showing in CSV file\n\nshowing `object` instead of actual value\n\n✅ Closes: #447",
        href: "https://github.com/growupanand/ConvoForm/commit/b2fb1076fbd5634219ad0839c7f806f2ec74d57e",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 conversation name is not generated\n\nafter conversation service revamp, AI generated conversation name functionality is broken\n\n✅ Closes: #459",
        href: "https://github.com/growupanand/ConvoForm/commit/f266637bdc91b8947655ff982fbab7e9580f025c",
      },
    ],
  },
  {
    version: "0.18.0",
    isoDate: "2025-04-26",
    commits: [
      {
        type: "features",
        message: "feat: 🚀 date type answer input now support timepicker",
        href: "https://github.com/growupanand/ConvoForm/commit/cc4c8e61ccc23162c5adea3fac9874ecd7bcf6da",
      },
      {
        type: "features",
        message:
          'feat: 🚀 add new answer field type "Rating"\n\nalso added in response table and analytics page',
        href: "https://github.com/growupanand/ConvoForm/commit/2e167a18c3f24d1a6578aad702186d59a776ce96",
      },
      {
        type: "features",
        message:
          "feat: 🚀 date picker support for natural language date typing",
        href: "https://github.com/growupanand/ConvoForm/commit/2b53e7dd0341dc100e0725ca3d78f94b59bd7349",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add full support for Google Forms rating and scale question",
        href: "https://github.com/growupanand/ConvoForm/commit/719d971796fa7fc304629dda2dbb73151a18f963",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add allowMultiple and other option in multi choice config sheet\n\n✅ Closes: #431",
        href: "https://github.com/growupanand/ConvoForm/commit/804ab267f5adf4f0e769fe0f9061ca41a3284500",
      },
      {
        type: "features",
        message:
          "feat: 🚀 multi select support added for multichoice answer input\n\n✅ Closes: #431",
        href: "https://github.com/growupanand/ConvoForm/commit/167db2be10a01a32e90ada4aa1269dc82b3c0ce9",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add Paragraph mode in text type answer Input for long answers",
        href: "https://github.com/growupanand/ConvoForm/commit/ce34db51da93bd6db423db8a63b0dd3f7d62f7d2",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add ChoiceQuestion support for importing google form\n\n✅ Closes: #431",
        href: "https://github.com/growupanand/ConvoForm/commit/125a4678b3096c46fae34ad12d234cc5b4aabfb5",
      },
      {
        type: "features",
        message:
          'feat: 🚀 add support for importing "Scale Question" from google form',
        href: "https://github.com/growupanand/ConvoForm/commit/9e095bf6329288fdc688c0eaac1b56cd9c2a704f",
      },
      {
        type: "features",
        message:
          "feat: 🚀 user can import google form, supported fields: text, date",
        href: "https://github.com/growupanand/ConvoForm/pull/430",
      },
      {
        type: "improvements",
        message:
          'perf: ⚡️ replaced sentry error tracking with posthog error tracking\n\nthis reduced the bundle size, E.g "First Load JS shared by all" 237KB &gt; 112KB',
        href: "https://github.com/growupanand/ConvoForm/commit/e0fc6ab53fe586eae176a8017876e711c7600a81",
      },
      {
        type: "fixes",
        message: "fix: 🐛 fix shadcn calendar UI",
        href: "https://github.com/growupanand/ConvoForm/commit/54e391b6f42f4705ac8b718df42073f64e0db97a",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 table cell rendering and data handling with SafeCellRenderer",
        href: "https://github.com/growupanand/ConvoForm/commit/ecfda804a6a5caeb509be7e3a025116e7a62a76c",
      },
    ],
  },
  {
    version: "0.17.0",
    isoDate: "2025-04-18",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 enhanced ConversationsStatsPage with MultiChoiceStats\n\n✅ Closes: #422",
        href: "https://github.com/growupanand/ConvoForm/commit/db4a4a51f4831b4195374778060d4dab60f257c4",
      },
      {
        type: "features",
        message:
          "feat: 🚀 added average completion time in response analytics\n\n✅ Closes: #424",
        href: "https://github.com/growupanand/ConvoForm/commit/022ef906c55f673228e16ec549a25679d0c6dd34",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add Bounce Rate in response analytics\n\nUsers who leave without answering any questions\n\n✅ Closes: #426",
        href: "https://github.com/growupanand/ConvoForm/commit/1ad6bce80bb8ffa62517035c44a2f33acdc20d82",
      },
      {
        type: "improvements",
        message: "perf: ⚡️ migrated from socket.io to bun websocket server",
        href: "https://github.com/growupanand/ConvoForm/commit/4861631ec1c952fc650dc6874e5b60aa17d1250a",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ upgraded nextjs from 14 to 15\n\nupgraded nextjs to 15 with all peer depedecies and other packages\n\n✅ Closes: #417",
        href: "https://github.com/growupanand/ConvoForm/commit/291e9f515e22ff90c41a7ac892cdbb2fbae75b3b",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 move ai logic into @convoform/ai, optimized tsconfig",
        href: "https://github.com/growupanand/ConvoForm/commit/bf49a317adae8e614ca610c211c42254b7da722f",
      },
      {
        type: "improvements",
        message:
          "style: 💄 formviewer is more responsive for different screen\n\n✅ Closes: #419",
        href: "https://github.com/growupanand/ConvoForm/commit/a7e97e67c75b8d30354903ab2e8cafc527584051",
      },
      {
        type: "improvements",
        message: "refactor: 💡 refactore useconvoform react hook",
        href: "https://github.com/growupanand/ConvoForm/commit/1f46ddb03b241e1fae433814f513902857b65648",
      },
    ],
  },
  {
    version: "0.16.0",
    isoDate: "2024-12-28",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 add stats page for form responses\n\nas form creator, i can see form responses related stats, E.g Total count, completed count, partial\ncount, live count\n\n✅ Closes: #375",
        href: "https://github.com/growupanand/ConvoForm/commit/4c57c22b34b608f695844f6dbef244d081d88aed",
      },
      {
        type: "features",
        message:
          "feat: 🚀 add start over button in form submit page\n\nrespondant can reset form and start from beginning\n\n✅ Closes: #403",
        href: "https://github.com/growupanand/ConvoForm/commit/91aee2e87df5c822ee65d5e8c8cb280c62d7b1b1",
      },
      {
        type: "improvements",
        message: "style: 💄 improve responses table",
        href: "https://github.com/growupanand/ConvoForm/commit/2033b24ce6e0ec68301666f12b47324fdd612cd6",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 added FormContextProvider for handling FormViewer flow easy\n\nMoved useConvoForm and useFormDesign into FormContextProvider",
        href: "https://github.com/growupanand/ConvoForm/commit/abb8422a23e755a3c13b45f2f2097269cb01f1b4",
      },
      {
        type: "improvements",
        message:
          "style: 💄 added response card in landing page for demo form\n\n✅ Closes: 395",
        href: "https://github.com/growupanand/ConvoForm/commit/de69e7570c9e43acfb94c32f7e6246710e8c04ff",
      },
      {
        type: "improvements",
        message:
          "style: 💄 added demo section in landing page\n\nDemo section will show an live demo form, it will render only on desktop screen\n\n✅ Closes: 363",
        href: "https://github.com/growupanand/ConvoForm/commit/44deea22f889b9ddd25f8d97f04ca0f31f0ac01c",
      },
      {
        type: "improvements",
        message: "perf: ⚡️Improved platform analytics event tracking",
        href: "https://github.com/growupanand/ConvoForm/pull/406",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 public tRPC routes is not working if not provided in middle",
        href: "https://github.com/growupanand/ConvoForm/commit/ba92c334cef89253c7e4abf907efeabc9ae09a48",
      },
    ],
  },
  {
    version: "0.15.0",
    isoDate: "2024-10-14",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 fill text from templates for generate form by AI\n\n✅ Closes: 298",
        href: "https://github.com/growupanand/ConvoForm/commit/0b312160efbf19fa3362bce9a11aff27a079c210",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 upgraded clerk, trpc versions and refactored as per latest usage",
        href: "https://github.com/growupanand/ConvoForm/commit/610080917345e1b88e49beac58bdff3f0b490c03",
      },
      {
        type: "improvements",
        message: "refactor: 💡 minor refactor for making home page SSG",
        href: "https://github.com/growupanand/ConvoForm/commit/1731dfa9335e57a8e2cc4839420661e8ab27b927",
      },
      {
        type: "improvements",
        message:
          "style: 💄 improve typing effect while showing question\n\n✅ Closes: 149",
        href: "https://github.com/growupanand/ConvoForm/commit/c08790434ba71052beec02101684e76e533dc67a",
      },
      {
        type: "improvements",
        message: "style: 💄 UI improvements and added some animations",
        href: "https://github.com/growupanand/ConvoForm/pull/380",
      },
      {
        type: "improvements",
        message: "perf: ⚡️improved form submission API request",
        href: "https://github.com/growupanand/ConvoForm/pull/378",
      },
      {
        type: "fixes",
        message: "fix: 🐛 form design changes not showing in incognito mode",
        href: "https://github.com/growupanand/ConvoForm/commit/12980a5b002dfe08743aabafab238dba7bc52b10",
      },
    ],
  },
  {
    version: "0.14.0",
    isoDate: "2024-09-25",
    commits: [
      {
        type: "features",
        message: "feat: 🚀 Added form design editor",
        href: "https://github.com/growupanand/ConvoForm/pull/370",
      },
      {
        type: "improvements",
        message: "style: 💄 changelog page have new UI",
        href: "https://github.com/growupanand/ConvoForm/commit/9540f86f7a3c2233ee5596539e8ab9e06dfc9ef2",
      },
      {
        type: "improvements",
        message:
          "style: 💄 Each form's Responses count will be shown in workspace\n\n✅ Closes: 367",
        href: "https://github.com/growupanand/ConvoForm/commit/c3f411f0457bfc23524f821110df2ccfe3038b26",
      },
      {
        type: "improvements",
        message: "style: 💄 New form editor layout\n\n✅ Closes: 364",
        href: "https://github.com/growupanand/ConvoForm/commit/7cdba9979eaccc211be1e0e8982d9449122c62a4",
      },
    ],
  },
  {
    version: "0.13.0",
    isoDate: "2024-09-15",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 Added report bug floating button\n\nuser can report any bug or suggestion while using the app\n\n✅ Closes: 345",
        href: "https://github.com/growupanand/ConvoForm/commit/f8f7a0255bca84c3b010d5388a7801d84a7935d6",
      },
      {
        type: "features",
        message:
          "feat: 🚀add custom link option on final form submission screen",
        href: "https://github.com/growupanand/ConvoForm/pull/361",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 Changes related to issue templates and workflows\n\n✅ Closes: 355",
        href: "https://github.com/growupanand/ConvoForm/commit/40cf360819bfd9e669a2994bf9122e3c8575f6ba",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 Removed mobile only components\n\nRemoved mobile only components, exect: landing page, form submission\npage components",
        href: "https://github.com/growupanand/ConvoForm/commit/bef0c47a44f8278b64733deecd7509af9aba7d46",
      },
      {
        type: "improvements",
        message:
          "style: 💄 Restricted App UI for desktop screen only\n\n✅ Closes: 353",
        href: "https://github.com/growupanand/ConvoForm/commit/72a5890cdba86f8d12df297305e700c67ca9eb18",
      },
      {
        type: "improvements",
        message: "refactor: 💡 Git action for lableing PR bases on changes",
        href: "https://github.com/growupanand/ConvoForm/commit/c21546aa58bfd6d62ca05d6b185647a17236af4c",
      },
      {
        type: "improvements",
        message: "refactor: 💡 fixed discord link",
        href: "https://github.com/growupanand/ConvoForm/commit/b890b8f3587880aa3cf4b111377580d5b629e1e4",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 Internal error after open old conversation page\n\n✅ Closes: 349",
        href: "https://github.com/growupanand/ConvoForm/commit/bdd5e5cbfd1d0b5e313c4d742ae488a04eba497b",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 In workspace page new form not showing without reload\n\n✅ Closes: 297",
        href: "https://github.com/growupanand/ConvoForm/commit/f71c4585835a759c904354a743099200797ce5dd",
      },
    ],
  },
  {
    version: "0.12.0",
    isoDate: "2024-07-26",
    commits: [
      {
        type: "features",
        message: "feat: 🚀 added Answer Input - datepicker",
        href: "https://github.com/growupanand/ConvoForm/pull/339",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ Multi choice answer will save exact value WO validation\n\nWhen user will click on choice button to answer the question, this\nanswer will not be validate by AI, instead will be saved exact value in\ndatabase\n\n✅ Closes: 331",
        href: "https://github.com/growupanand/ConvoForm/commit/27af2f1a24610559809fe6da5c1f5309103815ed",
      },
    ],
  },
  {
    version: "0.11.0",
    isoDate: "2024-07-15",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 Added submission progress bar\n\nAs a Respondent, I can see current form submission progress bar in top\nedge screen\n\n✅ Closes: 249",
        href: "https://github.com/growupanand/ConvoForm/commit/2afd2f9bba9dbc01e20ca92e8515cf7d6af372e7",
      },
      {
        type: "features",
        message: "feat: 🚀 Current field will be shown in form submission page",
        href: "https://github.com/growupanand/ConvoForm/commit/fdacaafe4654eb61809032902913afb000829fca",
      },
      {
        type: "improvements",
        message: "perf: ⚡️ Upgraded Turborepo version@2",
        href: "https://github.com/growupanand/ConvoForm/commit/8b478477f2ff84fa9f784b83e6dbff6e2fd9c456",
      },
      {
        type: "improvements",
        message: "perf: ⚡️ Upgraded Next.js version@14.2.5",
        href: "https://github.com/growupanand/ConvoForm/commit/fa351a05b433ab7db38343e6a6dbcc50225e5912",
      },
      {
        type: "improvements",
        message: "perf: ⚡️ Replaced eslint and prettier with the Biomejs",
        href: "https://github.com/growupanand/ConvoForm/pull/327",
      },
    ],
  },
  {
    version: "0.10.0",
    isoDate: "2024-07-13",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 Added Multi Choice Answer Input in Form submission page\n\nRespondent can now choose answer from given choices\n\n✅ Closes: 308",
        href: "https://github.com/growupanand/ConvoForm/commit/895a181ce3378eb669b4e3df047fae09dadaa9a7",
      },
      {
        type: "features",
        message:
          "feat: 🚀 Added Input Configuration editor in Edit Field Sheet\n\nForm creator can now customize input configuration according to the\ninput type. E.g. In text input type they can customize the input\nplaceholder text\n\n✅ Closes: 305",
        href: "https://github.com/growupanand/ConvoForm/commit/a1a3b7767a1a9ad76e27e419d0c1b3a42265649c",
      },
      {
        type: "features",
        message:
          'feat: 🚀 Added Multi choices Input type editor\n\nForm creator now select "Multiple choice" Input type and can add choices\n\n✅ Closes: 301',
        href: "https://github.com/growupanand/ConvoForm/commit/9ff4d1573d52175d12eca108c1a05e9150b63459",
      },
      {
        type: "features",
        message: "feat: 🚀 Form fields order can now be changed by dragging",
        href: "https://github.com/growupanand/ConvoForm/pull/319",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 upgraded drizzle-orm, moved rest schema validation\n\nmoved all rest schema validaiton into seperate file",
        href: "https://github.com/growupanand/ConvoForm/commit/38b117f88adabe030cb4074e3921688b65bcb948",
      },
      {
        type: "improvements",
        message: "style: 💄 UI-UX Improvements",
        href: "https://github.com/growupanand/ConvoForm/commit/77f1bc605ab607762024c8a4871c155a653186a6",
      },
      {
        type: "improvements",
        message: "refactor: 💡 moved all form validation schema into one file",
        href: "https://github.com/growupanand/ConvoForm/commit/54347e83b52ead0d4d0cbde99bc5ccdf00f03a85",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 Added delete form field button\n\n✅ Closes: 313",
        href: "https://github.com/growupanand/ConvoForm/commit/c3272f73b23a45078e8ca21bad0ebece6d52d6d9",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 moved converstaion and workspace validation in file",
        href: "https://github.com/growupanand/ConvoForm/commit/49361445a271a865be84d986838dbc7745bdf581",
      },
      {
        type: "improvements",
        message: "refactor: 💡 moved db shcemas into seperate files",
        href: "https://github.com/growupanand/ConvoForm/commit/90324a95581be4433d64a310147c7f615034d91b",
      },
      {
        type: "improvements",
        message:
          "style: 💄 Dragging of Fields are now restricted to VerticalAxis\n\nAs Fields are draggable for change there sorting order, We want to allo\nuser only dragg them vertically",
        href: "https://github.com/growupanand/ConvoForm/commit/b684e6511c72836b12b6112e418ddafabe0e89d7",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 296 as a creator i can edit form fields name description and input type",
        href: "https://github.com/growupanand/ConvoForm/pull/300",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 Unable to save changes in form editor\n\nAfter adding fieldDescription column in formField table, form editor is\nnot able to get value of fieldDescription because there is not input box\nfor that, so using field Name as field description for now.",
        href: "https://github.com/growupanand/ConvoForm/commit/240cded179f1d233390388c83964079ba0d5c78b",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 Error in generating form by AI\n\nIn AI generated form, fieldConfiguration was missing in Output JSON",
        href: "https://github.com/growupanand/ConvoForm/commit/b136923ab72a683095144d345751e7446f976127",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 Added vercel deployment support for useConvoForm\n\n✅ Closes: 310",
        href: "https://github.com/growupanand/ConvoForm/commit/3edac48cd07191a028c2891d5dcee8100d62ae2c",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 Added URL support from NEXT_PUBLIC_APP_URL in useconvofo\n\n✅ Closes: 310",
        href: "https://github.com/growupanand/ConvoForm/commit/8ca371da6d422654e53c90c5f8dd75d1ecc14ce9",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛Related to label workflows, added Infrastructure issue template",
        href: "https://github.com/growupanand/ConvoForm/pull/304",
      },
    ],
  },
  {
    version: "0.9.2",
    isoDate: "2024-06-10",
    commits: [
      {
        type: "improvements",
        message:
          "style: 💄 In form editor, After remove a form field I can undo this remove",
        href: "https://github.com/growupanand/ConvoForm/pull/263",
      },
    ],
  },
  {
    version: "0.9.1",
    isoDate: "2024-06-02",
    commits: [
      {
        type: "improvements",
        message: "style: 💄Added empty states",
        href: "https://github.com/growupanand/ConvoForm/pull/259",
      },
    ],
  },
  {
    version: "0.9.0",
    isoDate: "2024-05-18",
    commits: [
      {
        type: "features",
        message: "feat: 🚀 Published React package",
        href: "https://github.com/growupanand/ConvoForm/pull/245",
      },
    ],
  },
  {
    version: "0.8.0",
    isoDate: "2024-05-05",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 Implement live form submission progress for creators using ",
        href: "https://github.com/growupanand/ConvoForm/pull/241",
      },
      {
        type: "improvements",
        message: "style: 💄 Updated homepage UI, screenshots, text",
        href: "https://github.com/growupanand/ConvoForm/commit/6370026f96330a95a12cd311f5f66fbcb3320713",
      },
    ],
  },
  {
    version: "0.7.0",
    isoDate: "2024-05-01",
    commits: [
      {
        type: "features",
        message: "feat: 🚀 51 Revamped conversation flow",
        href: "https://github.com/growupanand/ConvoForm/pull/238",
      },
      {
        type: "features",
        message:
          "144 once form is published user should able to unpublish it andor he should make changes to form without publish this changes for testing",
        href: "https://github.com/growupanand/ConvoForm/pull/236",
      },
      {
        type: "improvements",
        message: "style: 💄 Minor UI changes",
        href: "https://github.com/growupanand/ConvoForm/commit/957fbecf2b8cc3885a031876e83415b392ee0793",
      },
    ],
  },
  {
    version: "0.6.1",
    isoDate: "2024-04-07",
    commits: [
      {
        type: "improvements",
        message: "perf: ⚡️ Added empty string validation in answer input form",
        href: "https://github.com/growupanand/ConvoForm/commit/ad3acec7e27b6d61f550a651cb6e97efcfd745fb",
      },
      {
        type: "improvements",
        message:
          "style: 💄 UI improvement in Form submission page\n\nfont size, spacing",
        href: "https://github.com/growupanand/ConvoForm/commit/d3b033251f374170b044c3f159547284db8e7a91",
      },
      {
        type: "improvements",
        message:
          "style: 💄 Added illustration for endscreen in Form Submission pa",
        href: "https://github.com/growupanand/ConvoForm/commit/50ae285d1b7704ed7ebcf6c95fc380bfdcf1625b",
      },
    ],
  },
  {
    version: "0.6.0",
    isoDate: "2024-04-03",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 Added custom end screen message setting\n\nForm creator can add a custom message to show when form is submitted\n\n✅ Closes: 61",
        href: "https://github.com/growupanand/ConvoForm/commit/aa841829a19a3af2380f0dd5269cfae28774d816",
      },
      {
        type: "features",
        message:
          "feat: 🚀 As form creator, I can add my company logo to the form",
        href: "https://github.com/growupanand/ConvoForm/pull/219",
      },
      {
        type: "features",
        message:
          "feat: 🚀 As form creator, I can add my company name to the form",
        href: "https://github.com/growupanand/ConvoForm/pull/216",
      },
      {
        type: "improvements",
        message:
          "style: 💄 added stagger animation for list items\n\n✅ Closes: #210",
        href: "https://github.com/growupanand/ConvoForm/commit/1961d0f6256399573887575a1aee8d3b6d9ce37c",
      },
      {
        type: "improvements",
        message: "perf: ⚡️ added ratelimit for OpenAI calls\n\n✅ Closes: #201",
        href: "https://github.com/growupanand/ConvoForm/commit/8376550caae63620f5db51f7cf71e2e92e68c91d",
      },
      {
        type: "improvements",
        message: "refactor: 💡 fixed ratelimit error message toast",
        href: "https://github.com/growupanand/ConvoForm/commit/e887a1b57d10a0338308a46b9dfa8a6351735e8f",
      },
      {
        type: "improvements",
        message: "refactor: 💡 changes related to form submission page",
        href: "https://github.com/growupanand/ConvoForm/commit/f6588465ab4155393b83253074d183a179d411b1",
      },
      {
        type: "improvements",
        message: "style: 💄 Added request feature card in landing page",
        href: "https://github.com/growupanand/ConvoForm/commit/c72e51680e3f7e399f08ad5490b1b7c2d9b5c0b0",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ added ratelimit - create workspaces, forms\n\n✅ Closes: #199",
        href: "https://github.com/growupanand/ConvoForm/commit/aa70d75ef06cd5ce637fd512a08a7dcb870e806b",
      },
      {
        type: "improvements",
        message: "refactor: 💡 custom end screen message related changes",
        href: "https://github.com/growupanand/ConvoForm/commit/f6a3ce4c014fe036db034c9cd4e3e0d87149644a",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ added ratelimit - edit workspace, form\n\n✅ Closes: #200",
        href: "https://github.com/growupanand/ConvoForm/commit/6ac8f8d48f39f703f5ec20d6efec79c00fa02d50",
      },
      {
        type: "improvements",
        message: "style: 💄 UI improvements in landing page",
        href: "https://github.com/growupanand/ConvoForm/commit/6df1fcbaaff49660b408daa7dd4598a4a65c4756",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 Sometimes form editor page not loading\n\nMoved clerk provider to root layout, and make root page force static\nrendered\n\n✅ Closes: #206",
        href: "https://github.com/growupanand/ConvoForm/commit/c46eab40a7283d25764078785f857ec2fa6f9be6",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 tanstack mutate query raise false uncaught error\n\n✅ Closes: #208",
        href: "https://github.com/growupanand/ConvoForm/commit/7828ac49b86724516eb0c2ab8f8b684312a01444",
      },
    ],
  },
  {
    version: "0.5.0",
    isoDate: "2024-02-27",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 As a User, I Can Generate a New Form with AI\n\nAs a User, I Can Generate a New Form using AI by Providing an Form\nOverview\n\n✅ Closes: #192",
        href: "https://github.com/growupanand/ConvoForm/commit/70182c7241ad46b825785ee84d26d5bb4e1d15c2",
      },
      {
        type: "features",
        message:
          "feat: 🚀 added recent responses and usage card in dashboard page",
        href: "https://github.com/growupanand/ConvoForm/commit/0adb28109b3255dbadec52b74638b1ef6227a5b4",
      },
      {
        type: "improvements",
        message: "style: 💄 UI changes in landing page for new feature lanuch",
        href: "https://github.com/growupanand/ConvoForm/commit/4c4e066267cc0f613d794df7ab59fe81abc35024",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 clerk webhook db calls from nextjs app to api\n\nmoved all db calls related to clerk webhook from nextjs app to api\npackage",
        href: "https://github.com/growupanand/ConvoForm/commit/0c3a265ea7ee6bc92131f58a545c2245a560d1ad",
      },
      {
        type: "improvements",
        message: "style: 💄 make generate AI form dialog responsive",
        href: "https://github.com/growupanand/ConvoForm/commit/db04ffcefdc9729e7b01ea7080aef38518b8a8b2",
      },
      {
        type: "improvements",
        message: "style: 💄 UI improvements in auto generate form",
        href: "https://github.com/growupanand/ConvoForm/commit/f03894e7c0ea5901fd2f55ee651f47d18e9d28b7",
      },
      {
        type: "improvements",
        message: "style: 💄 minor UI changes and removed harcoded value",
        href: "https://github.com/growupanand/ConvoForm/commit/c183e64ad11dbec679d1a1f5ada3bc87aee2aad1",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ While using Auto form generate using AI, we will genera\n\nWhile using Auto form generate using AI, we will generate form overview\nalso. Previously we were using provided user input as form overview",
        href: "https://github.com/growupanand/ConvoForm/commit/24e899c0bc66518605e35108c984d10c5cf1dde1",
      },
      {
        type: "improvements",
        message: "style: 💄 fixed percentage in response usage progress circle",
        href: "https://github.com/growupanand/ConvoForm/commit/129477a004b74165e5429cbb097899d37a27cd02",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 tremor chart library styling was not working with shadcn",
        href: "https://github.com/growupanand/ConvoForm/commit/2b21f280a0a5a19853571a5a6518955227424809",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 edge case where collected data value is not string\n\nIf the collected field value is not string but object, It break the page\nbecause react try to render the object as string",
        href: "https://github.com/growupanand/ConvoForm/commit/7989c2bfca42ee72f36f9f29776a37ad7a370a3e",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 Anyone can edit any form using the form link even it is\n\nAnyone can edit any form using the form link even it is not in there\norganization\n\n✅ Closes: #194",
        href: "https://github.com/growupanand/ConvoForm/commit/37f42033e35269bcc6137a88e71c9e4def43561d",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 handled uncaught error while chaning form name\n\nIf we pass empty string while chaning form name it show error toast ,\nbut also trigger an uncaught error in sentry",
        href: "https://github.com/growupanand/ConvoForm/commit/386b28ac3a6afbb41ab332de13e5ec30c206fdd1",
      },
      {
        type: "fixes",
        message: "fix: 🐛 form editor page break sometime",
        href: "https://github.com/growupanand/ConvoForm/commit/bf718b7a2a20cd6c1009064486d7d2f01b64992a",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 progress circle label position fixed while scroll window",
        href: "https://github.com/growupanand/ConvoForm/commit/faafcbf18dc6341071f6e14e819f6ebc7d8ca13f",
      },
    ],
  },
  {
    version: "0.4.0",
    isoDate: "2024-02-13",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 added form responses overview page\n\nIn this overview page we can see all the responses collected data in\ntable and also we can see data card for all responses\n\n✅ Closes: #162",
        href: "https://github.com/growupanand/ConvoForm/commit/fade9a1539031afc9ed879be7c2c9c045c1d9da6",
      },
      {
        type: "features",
        message:
          "feat: 🚀 now you can export and download responses table data\n\nyou can download the exported for responses table data in excel format\n\n✅ Closes: #186",
        href: "https://github.com/growupanand/ConvoForm/commit/105e24103017b52339bba2894cbf93cdb0590e49",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ added drizzle and used it in whole project\n\n✅ Closes: 178",
        href: "https://github.com/growupanand/ConvoForm/commit/b50d53ed080300652dd086353ab2aec415a72dfe",
      },
      {
        type: "improvements",
        message:
          "refactor: 💡 fixed default value for updatedAt field in database",
        href: "https://github.com/growupanand/ConvoForm/commit/97fd638d58a0b8f7abb46e6c5b388ae3460c7c73",
      },
      {
        type: "improvements",
        message: "perf: ⚡️ upgraded version of tRPC and @tanstack/react-query",
        href: "https://github.com/growupanand/ConvoForm/commit/131c0a7d7c9448da06906c7560488d47317a549d",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ removed prisma\n\nremoved prisma as we are now using drizzle",
        href: "https://github.com/growupanand/ConvoForm/commit/8e9998450faeb745b713d707e16327c24e13f14c",
      },
      {
        type: "improvements",
        message:
          "style: 💄 added screenshots Carousel in landing page hero secito",
        href: "https://github.com/growupanand/ConvoForm/commit/f8b5e1ee6431644cd9c9bcf7430a4563ab67fbb8",
      },
      {
        type: "improvements",
        message:
          "style: 💄 Display confirm box before deleting workspace or form\n\n✅ Closes: #116",
        href: "https://github.com/growupanand/ConvoForm/commit/60c1dda58a26d084ff7de7c8e811495e6a809e6f",
      },
      {
        type: "improvements",
        message:
          'Revert "perf: ⚡️ converted tRPC api route into edge runtime"\n\nThis reverts commit 2fe96acc8cbdc555df6e468d49e3716b3ad06922.',
        href: "https://github.com/growupanand/ConvoForm/commit/7bda4bf0e1e317c065b4b666f973cb49cd418fb6",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ converted tRPC api route into edge runtime\n\n✅ Closes: #182",
        href: "https://github.com/growupanand/ConvoForm/commit/b41bc5d23d012681108de17aa172c4e58ef38886",
      },
      {
        type: "fixes",
        message: "fix: 🐛 meta images not showing",
        href: "https://github.com/growupanand/ConvoForm/commit/b19cfa19e70d8cd10d01462ec3e4cda7e482da8e",
      },
    ],
  },
  {
    version: "0.3.0",
    isoDate: "2024-02-02",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 Added charts in dashbard page\n\nAdded charts in dashboard total count page, to show forms created and\nform response collected count of daily basis on bar graph\n\n✅ Closes: #147",
        href: "https://github.com/growupanand/ConvoForm/commit/c61739c30bab0d660fa60759bf74294a946480e0",
      },
      {
        type: "features",
        message:
          "feat: 🚀 Added changelog page\n\nAdded changelog page to show releases with there changes, these\nchangelog page will show data from generated changelog file from relase\nscript\n\n✅ Closes: #143",
        href: "https://github.com/growupanand/ConvoForm/commit/5677e81398afe79da99384e08c2ce8f378e47e6d",
      },
      {
        type: "features",
        message:
          "feat: #153 while going to previous question, previous answer should also auto-filled in input",
        href: "https://github.com/growupanand/ConvoForm/commit/f8c2b15bb54867c890e45658dec1f76b8cbea04e",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ Added trpc\n\nAdded trpc and removed all nextjs api routes\n\n✅ Closes: #145",
        href: "https://github.com/growupanand/ConvoForm/commit/ef2dd156c37407a106e6b44c578c6b9856eec864",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ added sperate organization selection page\n\nCreated seperate page for selecting and creating organiation, this will\nallow us to prevent any  page break  where no organiization is cretated\n\n✅ Closes: #169",
        href: "https://github.com/growupanand/ConvoForm/commit/40941cb99281e39b4e150b9ca9e4cec3c05bdd53",
      },
      {
        type: "improvements",
        message:
          "style: 💄 Addded Progress Indicator while navigating pages\n\nProgress Indicator will show on top of page, when navigate to between\npages\n\n✅ Closes: #163",
        href: "https://github.com/growupanand/ConvoForm/commit/4876b35914f4839039de36c36f908b13863ad3c8",
      },
      {
        type: "improvements",
        message:
          "perf: ⚡️ made root page static\n\nMade root page static generated in nextjs to load faster",
        href: "https://github.com/growupanand/ConvoForm/commit/61ebf265cc4ce791c79862214a95ca99eb1be009",
      },
      {
        type: "improvements",
        message: "perf: ⚡️ added meta image",
        href: "https://github.com/growupanand/ConvoForm/commit/3ad6a63bfb0fddc050081a7e43320c02b6393ef8",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 wrong domain name on production doployment\n\nAdded NEXT_PUBLIC_APP_URL environment to use on production deployment\n\n✅ Closes: #159",
        href: "https://github.com/growupanand/ConvoForm/commit/f738b6220b36f775a7a187322d75cb84305b9fa0",
      },
      {
        type: "fixes",
        message:
          'fix: 🐛 Prisma client not working on production\n\nAfter build success, prisma client error at runtime, Prisma Client could\nnot locate the Query Engine for runtime "debian-openssl-3.0.x".\n\n✅ Closes: #173',
        href: "https://github.com/growupanand/ConvoForm/commit/59fb06a98b43cf908adaf6e242142404a7ec140b",
      },
      {
        type: "fixes",
        message: "fix: 🐛 auth pages were not working",
        href: "https://github.com/growupanand/ConvoForm/commit/59688a3e2b8ea0e4b03acf453937519293e1f2bf",
      },
      {
        type: "fixes",
        message:
          "fix: 🐛 Unauthorized getOrganizationId(src/lib/getOrganizationId\n\nPage was crashed if no organization is created\n\n✅ Closes: #166",
        href: "https://github.com/growupanand/ConvoForm/commit/f7f404d00ee0211c17c6c2959850193d8b77ac40",
      },
    ],
  },
  {
    version: "0.2.1",
    isoDate: "2024-01-23",
    commits: [
      {
        type: "fixes",
        message:
          "fix: 🐛 wrong domain name on production doployment\n\nAdded NEXT_PUBLIC_APP_URL environment to use on production deployment\n\n✅ Closes: #159",
        href: "https://github.com/growupanand/ConvoForm/commit/d5dcbd687b0a242d9ece628b00ba5de7952f7c0a",
      },
    ],
  },
  {
    version: "0.2.0",
    isoDate: "2024-01-23",
    commits: [
      {
        type: "features",
        message:
          "feat: 🚀 Added changelog page\n\nAdded changelog page to show releases with there changes, these\nchangelog page will show data from generated changelog file from relase\nscript\n\n✅ Closes: #143",
        href: "https://github.com/growupanand/ConvoForm/commit/8ff20ea58bf1b829553244d1b5fb2298e4d9fb55",
      },
      {
        type: "features",
        message:
          "feat: #153 while going to previous question, previous answer should also auto-filled in input",
        href: "https://github.com/growupanand/ConvoForm/commit/2ac600d7cab948b2a59050f5ffdb752e271f8d82",
      },
    ],
  },
  {
    version: "0.1.1",
    isoDate: "2024-01-21",
    commits: [],
  },
];
