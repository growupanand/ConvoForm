

export const changelog = [ 
{
"title": "0.6.0",
"tag": "",
"isoDate": "2024-04-03",
"commits": {
"features": [

{
"message": "feat: 🚀 Added custom end screen message setting\n\nForm creator can add a custom message to show when form is submitted\n\n✅ Closes: 61",
"shorthash": "aa84182",
"href": "https://github.com/growupanand/ConvoForm/commit/aa841829a19a3af2380f0dd5269cfae28774d816"
},

],
"improvements": [

{
"message": "style: 💄 added stagger animation for list items\n\n✅ Closes: #210",
"shorthash": "1961d0f",
"href": "https://github.com/growupanand/ConvoForm/commit/1961d0f6256399573887575a1aee8d3b6d9ce37c"
},

{
"message": "perf: ⚡️ added ratelimit for OpenAI calls\n\n✅ Closes: #201",
"shorthash": "8376550",
"href": "https://github.com/growupanand/ConvoForm/commit/8376550caae63620f5db51f7cf71e2e92e68c91d"
},

{
"message": "refactor: 💡 fixed ratelimit error message toast",
"shorthash": "e887a1b",
"href": "https://github.com/growupanand/ConvoForm/commit/e887a1b57d10a0338308a46b9dfa8a6351735e8f"
},

{
"message": "refactor: 💡 changes related to form submission page",
"shorthash": "f658846",
"href": "https://github.com/growupanand/ConvoForm/commit/f6588465ab4155393b83253074d183a179d411b1"
},

{
"message": "style: 💄 Added request feature card in landing page",
"shorthash": "c72e516",
"href": "https://github.com/growupanand/ConvoForm/commit/c72e51680e3f7e399f08ad5490b1b7c2d9b5c0b0"
},

{
"message": "perf: ⚡️ added ratelimit - create workspaces, forms\n\n✅ Closes: #199",
"shorthash": "aa70d75",
"href": "https://github.com/growupanand/ConvoForm/commit/aa70d75ef06cd5ce637fd512a08a7dcb870e806b"
},

{
"message": "refactor: 💡 custom end screen message related changes",
"shorthash": "f6a3ce4",
"href": "https://github.com/growupanand/ConvoForm/commit/f6a3ce4c014fe036db034c9cd4e3e0d87149644a"
},

{
"message": "perf: ⚡️ added ratelimit - edit workspace, form\n\n✅ Closes: #200",
"shorthash": "6ac8f8d",
"href": "https://github.com/growupanand/ConvoForm/commit/6ac8f8d48f39f703f5ec20d6efec79c00fa02d50"
},

{
"message": "style: 💄 UI improvements in landing page",
"shorthash": "6df1fcb",
"href": "https://github.com/growupanand/ConvoForm/commit/6df1fcbaaff49660b408daa7dd4598a4a65c4756"
},

],
"fixes": [

{
"message": "fix: 🐛 Sometimes form editor page not loading\n\nMoved clerk provider to root layout, and make root page force static\nrendered\n\n✅ Closes: #206",
"shorthash": "c46eab4",
"href": "https://github.com/growupanand/ConvoForm/commit/c46eab40a7283d25764078785f857ec2fa6f9be6"
},

{
"message": "fix: 🐛 tanstack mutate query raise false uncaught error\n\n✅ Closes: #208",
"shorthash": "7828ac4",
"href": "https://github.com/growupanand/ConvoForm/commit/7828ac49b86724516eb0c2ab8f8b684312a01444"
},

]
}
},
{
"title": "0.5.0",
"tag": "0.5.0",
"isoDate": "2024-02-27",
"commits": {
"features": [

{
"message": "feat: 🚀 As a User, I Can Generate a New Form with AI\n\nAs a User, I Can Generate a New Form using AI by Providing an Form\nOverview\n\n✅ Closes: #192",
"shorthash": "70182c7",
"href": "https://github.com/growupanand/ConvoForm/commit/70182c7241ad46b825785ee84d26d5bb4e1d15c2"
},

{
"message": "feat: 🚀 added recent responses and usage card in dashboard page",
"shorthash": "0adb281",
"href": "https://github.com/growupanand/ConvoForm/commit/0adb28109b3255dbadec52b74638b1ef6227a5b4"
},

],
"improvements": [

{
"message": "style: 💄 UI changes in landing page for new feature lanuch",
"shorthash": "4c4e066",
"href": "https://github.com/growupanand/ConvoForm/commit/4c4e066267cc0f613d794df7ab59fe81abc35024"
},

{
"message": "refactor: 💡 clerk webhook db calls from nextjs app to api\n\nmoved all db calls related to clerk webhook from nextjs app to api\npackage",
"shorthash": "0c3a265",
"href": "https://github.com/growupanand/ConvoForm/commit/0c3a265ea7ee6bc92131f58a545c2245a560d1ad"
},

{
"message": "style: 💄 make generate AI form dialog responsive",
"shorthash": "db04ffc",
"href": "https://github.com/growupanand/ConvoForm/commit/db04ffcefdc9729e7b01ea7080aef38518b8a8b2"
},

{
"message": "style: 💄 UI improvements in auto generate form",
"shorthash": "f03894e",
"href": "https://github.com/growupanand/ConvoForm/commit/f03894e7c0ea5901fd2f55ee651f47d18e9d28b7"
},

{
"message": "style: 💄 minor UI changes and removed harcoded value",
"shorthash": "c183e64",
"href": "https://github.com/growupanand/ConvoForm/commit/c183e64ad11dbec679d1a1f5ada3bc87aee2aad1"
},

{
"message": "perf: ⚡️ While using Auto form generate using AI, we will genera\n\nWhile using Auto form generate using AI, we will generate form overview\nalso. Previously we were using provided user input as form overview",
"shorthash": "24e899c",
"href": "https://github.com/growupanand/ConvoForm/commit/24e899c0bc66518605e35108c984d10c5cf1dde1"
},

{
"message": "style: 💄 fixed percentage in response usage progress circle",
"shorthash": "129477a",
"href": "https://github.com/growupanand/ConvoForm/commit/129477a004b74165e5429cbb097899d37a27cd02"
},

],
"fixes": [

{
"message": "fix: 🐛 tremor chart library styling was not working with shadcn",
"shorthash": "2b21f28",
"href": "https://github.com/growupanand/ConvoForm/commit/2b21f280a0a5a19853571a5a6518955227424809"
},

{
"message": "fix: 🐛 edge case where collected data value is not string\n\nIf the collected field value is not string but object, It break the page\nbecause react try to render the object as string",
"shorthash": "7989c2b",
"href": "https://github.com/growupanand/ConvoForm/commit/7989c2bfca42ee72f36f9f29776a37ad7a370a3e"
},

{
"message": "fix: 🐛 Anyone can edit any form using the form link even it is\n\nAnyone can edit any form using the form link even it is not in there\norganization\n\n✅ Closes: #194",
"shorthash": "37f4203",
"href": "https://github.com/growupanand/ConvoForm/commit/37f42033e35269bcc6137a88e71c9e4def43561d"
},

{
"message": "fix: 🐛 handled uncaught error while chaning form name\n\nIf we pass empty string while chaning form name it show error toast ,\nbut also trigger an uncaught error in sentry",
"shorthash": "386b28a",
"href": "https://github.com/growupanand/ConvoForm/commit/386b28ac3a6afbb41ab332de13e5ec30c206fdd1"
},

{
"message": "fix: 🐛 form editor page break sometime",
"shorthash": "bf718b7",
"href": "https://github.com/growupanand/ConvoForm/commit/bf718b7a2a20cd6c1009064486d7d2f01b64992a"
},

{
"message": "fix: 🐛 progress circle label position fixed while scroll window",
"shorthash": "faafcbf",
"href": "https://github.com/growupanand/ConvoForm/commit/faafcbf18dc6341071f6e14e819f6ebc7d8ca13f"
},

]
}
},
{
"title": "0.4.0",
"tag": "0.4.0",
"isoDate": "2024-02-13",
"commits": {
"features": [

{
"message": "feat: 🚀 added form responses overview page\n\nIn this overview page we can see all the responses collected data in\ntable and also we can see data card for all responses\n\n✅ Closes: #162",
"shorthash": "fade9a1",
"href": "https://github.com/growupanand/ConvoForm/commit/fade9a1539031afc9ed879be7c2c9c045c1d9da6"
},

{
"message": "feat: 🚀 now you can export and download responses table data\n\nyou can download the exported for responses table data in excel format\n\n✅ Closes: #186",
"shorthash": "105e241",
"href": "https://github.com/growupanand/ConvoForm/commit/105e24103017b52339bba2894cbf93cdb0590e49"
},

],
"improvements": [

{
"message": "perf: ⚡️ added drizzle and used it in whole project\n\n✅ Closes: 178",
"shorthash": "b50d53e",
"href": "https://github.com/growupanand/ConvoForm/commit/b50d53ed080300652dd086353ab2aec415a72dfe"
},

{
"message": "refactor: 💡 fixed default value for updatedAt field in database",
"shorthash": "97fd638",
"href": "https://github.com/growupanand/ConvoForm/commit/97fd638d58a0b8f7abb46e6c5b388ae3460c7c73"
},

{
"message": "perf: ⚡️ upgraded version of tRPC and @tanstack/react-query",
"shorthash": "131c0a7",
"href": "https://github.com/growupanand/ConvoForm/commit/131c0a7d7c9448da06906c7560488d47317a549d"
},

{
"message": "perf: ⚡️ removed prisma\n\nremoved prisma as we are now using drizzle",
"shorthash": "8e99984",
"href": "https://github.com/growupanand/ConvoForm/commit/8e9998450faeb745b713d707e16327c24e13f14c"
},

{
"message": "style: 💄 added screenshots Carousel in landing page hero secito",
"shorthash": "f8b5e1e",
"href": "https://github.com/growupanand/ConvoForm/commit/f8b5e1ee6431644cd9c9bcf7430a4563ab67fbb8"
},

{
"message": "style: 💄 Display confirm box before deleting workspace or form\n\n✅ Closes: #116",
"shorthash": "60c1dda",
"href": "https://github.com/growupanand/ConvoForm/commit/60c1dda58a26d084ff7de7c8e811495e6a809e6f"
},

{
"message": "Revert \"perf: ⚡️ converted tRPC api route into edge runtime\"\n\nThis reverts commit 2fe96acc8cbdc555df6e468d49e3716b3ad06922.",
"shorthash": "7bda4bf",
"href": "https://github.com/growupanand/ConvoForm/commit/7bda4bf0e1e317c065b4b666f973cb49cd418fb6"
},

{
"message": "perf: ⚡️ converted tRPC api route into edge runtime\n\n✅ Closes: #182",
"shorthash": "b41bc5d",
"href": "https://github.com/growupanand/ConvoForm/commit/b41bc5d23d012681108de17aa172c4e58ef38886"
},

],
"fixes": [

{
"message": "fix: 🐛 meta images not showing",
"shorthash": "b19cfa1",
"href": "https://github.com/growupanand/ConvoForm/commit/b19cfa19e70d8cd10d01462ec3e4cda7e482da8e"
},

]
}
},
{
"title": "0.3.0",
"tag": "0.3.0",
"isoDate": "2024-02-02",
"commits": {
"features": [

{
"message": "feat: 🚀 Added charts in dashbard page\n\nAdded charts in dashboard total count page, to show forms created and\nform response collected count of daily basis on bar graph\n\n✅ Closes: #147",
"shorthash": "c61739c",
"href": "https://github.com/growupanand/ConvoForm/commit/c61739c30bab0d660fa60759bf74294a946480e0"
},

{
"message": "feat: 🚀 Added changelog page\n\nAdded changelog page to show releases with there changes, these\nchangelog page will show data from generated changelog file from relase\nscript\n\n✅ Closes: #143",
"shorthash": "5677e81",
"href": "https://github.com/growupanand/ConvoForm/commit/5677e81398afe79da99384e08c2ce8f378e47e6d"
},

{
"message": "feat: #153 while going to previous question, previous answer should also auto-filled in input",
"shorthash": "f8c2b15",
"href": "https://github.com/growupanand/ConvoForm/commit/f8c2b15bb54867c890e45658dec1f76b8cbea04e"
},

],
"improvements": [

{
"message": "perf: ⚡️ Added trpc\n\nAdded trpc and removed all nextjs api routes\n\n✅ Closes: #145",
"shorthash": "ef2dd15",
"href": "https://github.com/growupanand/ConvoForm/commit/ef2dd156c37407a106e6b44c578c6b9856eec864"
},

{
"message": "perf: ⚡️ added sperate organization selection page\n\nCreated seperate page for selecting and creating organiation, this will\nallow us to prevent any  page break  where no organiization is cretated\n\n✅ Closes: #169",
"shorthash": "40941cb",
"href": "https://github.com/growupanand/ConvoForm/commit/40941cb99281e39b4e150b9ca9e4cec3c05bdd53"
},

{
"message": "style: 💄 Addded Progress Indicator while navigating pages\n\nProgress Indicator will show on top of page, when navigate to between\npages\n\n✅ Closes: #163",
"shorthash": "4876b35",
"href": "https://github.com/growupanand/ConvoForm/commit/4876b35914f4839039de36c36f908b13863ad3c8"
},

{
"message": "perf: ⚡️ made root page static\n\nMade root page static generated in nextjs to load faster",
"shorthash": "61ebf26",
"href": "https://github.com/growupanand/ConvoForm/commit/61ebf265cc4ce791c79862214a95ca99eb1be009"
},

{
"message": "perf: ⚡️ added meta image",
"shorthash": "3ad6a63",
"href": "https://github.com/growupanand/ConvoForm/commit/3ad6a63bfb0fddc050081a7e43320c02b6393ef8"
},

],
"fixes": [

{
"message": "fix: 🐛 wrong domain name on production doployment\n\nAdded NEXT_PUBLIC_APP_URL environment to use on production deployment\n\n✅ Closes: #159",
"shorthash": "f738b62",
"href": "https://github.com/growupanand/ConvoForm/commit/f738b6220b36f775a7a187322d75cb84305b9fa0"
},

{
"message": "fix: 🐛 Prisma client not working on production\n\nAfter build success, prisma client error at runtime, Prisma Client could\nnot locate the Query Engine for runtime \"debian-openssl-3.0.x\".\n\n✅ Closes: #173",
"shorthash": "59fb06a",
"href": "https://github.com/growupanand/ConvoForm/commit/59fb06a98b43cf908adaf6e242142404a7ec140b"
},

{
"message": "fix: 🐛 auth pages were not working",
"shorthash": "59688a3",
"href": "https://github.com/growupanand/ConvoForm/commit/59688a3e2b8ea0e4b03acf453937519293e1f2bf"
},

{
"message": "fix: 🐛 Unauthorized getOrganizationId(src/lib/getOrganizationId\n\nPage was crashed if no organization is created\n\n✅ Closes: #166",
"shorthash": "f7f404d",
"href": "https://github.com/growupanand/ConvoForm/commit/f7f404d00ee0211c17c6c2959850193d8b77ac40"
},

]
}
},
{
"title": "0.2.1",
"tag": "0.2.1",
"isoDate": "2024-01-23",
"commits": {
"features": [
],
"improvements": [
],
"fixes": [

{
"message": "fix: 🐛 wrong domain name on production doployment\n\nAdded NEXT_PUBLIC_APP_URL environment to use on production deployment\n\n✅ Closes: #159",
"shorthash": "d5dcbd6",
"href": "https://github.com/growupanand/ConvoForm/commit/d5dcbd687b0a242d9ece628b00ba5de7952f7c0a"
},

]
}
},
{
"title": "0.2.0",
"tag": "0.2.0",
"isoDate": "2024-01-23",
"commits": {
"features": [

{
"message": "feat: 🚀 Added changelog page\n\nAdded changelog page to show releases with there changes, these\nchangelog page will show data from generated changelog file from relase\nscript\n\n✅ Closes: #143",
"shorthash": "8ff20ea",
"href": "https://github.com/growupanand/ConvoForm/commit/8ff20ea58bf1b829553244d1b5fb2298e4d9fb55"
},

{
"message": "feat: #153 while going to previous question, previous answer should also auto-filled in input",
"shorthash": "2ac600d",
"href": "https://github.com/growupanand/ConvoForm/commit/2ac600d7cab948b2a59050f5ffdb752e271f8d82"
},

],
"improvements": [
],
"fixes": [
]
}
},
{
"title": "0.1.1",
"tag": "0.1.1",
"isoDate": "2024-01-21",
"commits": {
"features": [
],
"improvements": [
],
"fixes": [
]
}
}
]