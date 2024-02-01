

export const changelog = [ 
{
"title": "0.3.0",
"tag": "",
"isoDate": "2024-02-01",
"commits": {
"features": [

{
"message": "feat: 🚀 Added charts in dashbard page\n\nAdded charts in dashboard total count page, to show forms created and\nform response collected count of daily basis on bar graph\n\n✅ Closes: #147",
"shorthash": "630da22",
"href": "https://github.com/growupanand/ConvoForm/commit/630da228ec083d936268517378ea5b54ca438373"
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
"shorthash": "19607c8",
"href": "https://github.com/growupanand/ConvoForm/commit/19607c814186d15739f4c79cc92693d3e18e062e"
},

{
"message": "perf: ⚡️ added sperate organization selection page\n\nCreated seperate page for selecting and creating organiation, this will\nallow us to prevent any  page break  where no organiization is cretated\n\n✅ Closes: #169",
"shorthash": "77333cb",
"href": "https://github.com/growupanand/ConvoForm/commit/77333cb63c1fc57454dc603b46b20b56ffba62fd"
},

{
"message": "style: 💄 Addded Progress Indicator while navigating pages\n\nProgress Indicator will show on top of page, when navigate to between\npages\n\n✅ Closes: #163",
"shorthash": "a671075",
"href": "https://github.com/growupanand/ConvoForm/commit/a671075c2a5447c62331ee338ffc44f61bf30a50"
},

{
"message": "perf: ⚡️ made root page static\n\nMade root page static generated in nextjs to load faster",
"shorthash": "5cc0e5f",
"href": "https://github.com/growupanand/ConvoForm/commit/5cc0e5f6c804eebefc516e1dbdcd974c0577b69a"
},

{
"message": "perf: ⚡️ added meta image",
"shorthash": "0096ea3",
"href": "https://github.com/growupanand/ConvoForm/commit/0096ea3090c1f4e42c2dd32a995be71f7163221c"
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
"shorthash": "e6d6df6",
"href": "https://github.com/growupanand/ConvoForm/commit/e6d6df6c491dd18339f4859f2ccf7e449697e09f"
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