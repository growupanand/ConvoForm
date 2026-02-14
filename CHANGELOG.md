

## [0.19.0](https://github.com/growupanand/ConvoForm/compare/0.18.0...0.19.0) (2026-02-14)


### Features

* 🚀 add AI provider: Groq ([8e22d93](https://github.com/growupanand/ConvoForm/commit/8e22d9378d8d73d6c4c8d95de3f903e6ee165202)), closes [#463](https://github.com/growupanand/ConvoForm/issues/463)
* 🚀 add AI-powered form response insights in conversation details ([67949f3](https://github.com/growupanand/ConvoForm/commit/67949f35549644442378ccf65c818438b3b7a0df)), closes [#444](https://github.com/growupanand/ConvoForm/issues/444)
* 🚀 add docker support for self hosting ([9cb2fd2](https://github.com/growupanand/ConvoForm/commit/9cb2fd2e64cb2845e58f1f09915254d0e54c9bfd)), closes [#325](https://github.com/growupanand/ConvoForm/issues/325)
* 🚀 add email package and send form response email on finished ([4d0fa7c](https://github.com/growupanand/ConvoForm/commit/4d0fa7c1439ae4617b3e539a79890158adee7599)), closes [#468](https://github.com/growupanand/ConvoForm/issues/468)
* 🚀 add ollama provider support ([c657ee2](https://github.com/growupanand/ConvoForm/commit/c657ee2fc46aa84c4a02009cd940e23a63b779f7))
* 🚀 add OpenTelemetry tracing ([5e3829f](https://github.com/growupanand/ConvoForm/commit/5e3829f670846260a35348119ed1b73d8d5c9b9f)), closes [#466](https://github.com/growupanand/ConvoForm/issues/466)
* 🚀 collect form respondent metadata (location, device, browser etc) ([355382c](https://github.com/growupanand/ConvoForm/commit/355382c88524b7cd48d4dfffe8c534aeb998db20)), closes [#439](https://github.com/growupanand/ConvoForm/issues/439) [#439](https://github.com/growupanand/ConvoForm/issues/439)
* 🚀 File upload field support in form submission ([#455](https://github.com/growupanand/ConvoForm/issues/455)) ([ab2411b](https://github.com/growupanand/ConvoForm/commit/ab2411bcc4f58c1444399e877d77964823c333c4)), closes [#454](https://github.com/growupanand/ConvoForm/issues/454) [#454](https://github.com/growupanand/ConvoForm/issues/454)
* 🚀 sending form response email to user ([76bd6c0](https://github.com/growupanand/ConvoForm/commit/76bd6c0c76a210d236a7ae67bc31f95bc07fe823)), closes [#468](https://github.com/growupanand/ConvoForm/issues/468)


### Bug Fixes

* 🐛 conversation name is not generated ([f266637](https://github.com/growupanand/ConvoForm/commit/f266637bdc91b8947655ff982fbab7e9580f025c)), closes [#459](https://github.com/growupanand/ConvoForm/issues/459)
* 🐛 fix React Server Components CVE vulnerabilities ([2642940](https://github.com/growupanand/ConvoForm/commit/264294038ab8abb685a48658edf8613ca300bbf5))
* 🐛 invalid value showing in CSV file ([b2fb107](https://github.com/growupanand/ConvoForm/commit/b2fb1076fbd5634219ad0839c7f806f2ec74d57e)), closes [#447](https://github.com/growupanand/ConvoForm/issues/447)
* 🐛 label text overflow in mcq option ([aa4fd98](https://github.com/growupanand/ConvoForm/commit/aa4fd98516144ad478b6807242f634ea58233121)), closes [#434](https://github.com/growupanand/ConvoForm/issues/434)
* 🐛 unable to upload file in form submission page (user not found) ([eb69e62](https://github.com/growupanand/ConvoForm/commit/eb69e621ae127ca47ef187e9f204450233c9fdcc))


### Improvements

* ⚡️ 456 revamp conversation service for ai sdk v5 ([#457](https://github.com/growupanand/ConvoForm/issues/457)) ([b97f2de](https://github.com/growupanand/ConvoForm/commit/b97f2dedcc753ac2fc6ffcd130ae9bfb91e3f232)), closes [#456](https://github.com/growupanand/ConvoForm/issues/456) [#456](https://github.com/growupanand/ConvoForm/issues/456) [#456](https://github.com/growupanand/ConvoForm/issues/456) [#456](https://github.com/growupanand/ConvoForm/issues/456) [#456](https://github.com/growupanand/ConvoForm/issues/456) [#456](https://github.com/growupanand/ConvoForm/issues/456) [#456](https://github.com/growupanand/ConvoForm/issues/456)
* 💄 migrated to new shadcn sidebar ([5dbda35](https://github.com/growupanand/ConvoForm/commit/5dbda35b24f491b147574a7e93dac1ffd839409f)), closes [#451](https://github.com/growupanand/ConvoForm/issues/451)
* 💄 UX improvements ([c111aa6](https://github.com/growupanand/ConvoForm/commit/c111aa6bb47fcbc5d678d76e405f49de611342ac))
* 💡 pricing config is more readable and usable ([e8b7e51](https://github.com/growupanand/ConvoForm/commit/e8b7e518660bd7166aea52c42617f3812b06bcec))
* 💡 rate limit package is more readable and easy to use ([6535ed5](https://github.com/growupanand/ConvoForm/commit/6535ed58e12906a0e2c6393e22f113446457ea37))
* tier 1 critical security and stability fixes ([16a59b0](https://github.com/growupanand/ConvoForm/commit/16a59b0997513a198a68ec4c275d1fbcbb64bb20))

## [0.18.0](https://github.com/growupanand/ConvoForm/compare/0.17.0...0.18.0) (2025-04-25)


### Features

* 🚀 add allowMultiple and other option in multi choice config sheet ([804ab26](https://github.com/growupanand/ConvoForm/commit/804ab267f5adf4f0e769fe0f9061ca41a3284500)), closes [#431](https://github.com/growupanand/ConvoForm/issues/431)
* 🚀 add ChoiceQuestion support for importing google form ([125a467](https://github.com/growupanand/ConvoForm/commit/125a4678b3096c46fae34ad12d234cc5b4aabfb5)), closes [#431](https://github.com/growupanand/ConvoForm/issues/431)
* 🚀 add full support for Google Forms rating and scale question ([719d971](https://github.com/growupanand/ConvoForm/commit/719d971796fa7fc304629dda2dbb73151a18f963))
* 🚀 add new answer field type "Rating" ([2e167a1](https://github.com/growupanand/ConvoForm/commit/2e167a18c3f24d1a6578aad702186d59a776ce96))
* 🚀 add Paragraph mode in text type answer Input for long answers ([ce34db5](https://github.com/growupanand/ConvoForm/commit/ce34db51da93bd6db423db8a63b0dd3f7d62f7d2))
* 🚀 add support for importing "Scale Question" from google form ([9e095bf](https://github.com/growupanand/ConvoForm/commit/9e095bf6329288fdc688c0eaac1b56cd9c2a704f))
* 🚀 date picker support for natural language date typing ([2b53e7d](https://github.com/growupanand/ConvoForm/commit/2b53e7dd0341dc100e0725ca3d78f94b59bd7349))
* 🚀 date type answer input now support timepicker ([cc4c8e6](https://github.com/growupanand/ConvoForm/commit/cc4c8e61ccc23162c5adea3fac9874ecd7bcf6da))
* 🚀 multi select support added for multichoice answer input ([167db2b](https://github.com/growupanand/ConvoForm/commit/167db2be10a01a32e90ada4aa1269dc82b3c0ce9)), closes [#431](https://github.com/growupanand/ConvoForm/issues/431)
* 🚀 user can import google form, supported fields: text, date ([#430](https://github.com/growupanand/ConvoForm/issues/430)) ([4715a89](https://github.com/growupanand/ConvoForm/commit/4715a898566786171e492f751276793bc8d5c509)), closes [#429](https://github.com/growupanand/ConvoForm/issues/429) [#429](https://github.com/growupanand/ConvoForm/issues/429) [#429](https://github.com/growupanand/ConvoForm/issues/429) [#429](https://github.com/growupanand/ConvoForm/issues/429)


### Bug Fixes

* 🐛 fix shadcn calendar UI ([54e391b](https://github.com/growupanand/ConvoForm/commit/54e391b6f42f4705ac8b718df42073f64e0db97a))
* 🐛 table cell rendering and data handling with SafeCellRenderer ([ecfda80](https://github.com/growupanand/ConvoForm/commit/ecfda804a6a5caeb509be7e3a025116e7a62a76c))


### Improvements

* ⚡️ replaced sentry error tracking with posthog error tracking ([e0fc6ab](https://github.com/growupanand/ConvoForm/commit/e0fc6ab53fe586eae176a8017876e711c7600a81))

## [0.17.0](https://github.com/growupanand/ConvoForm/compare/0.16.0...0.17.0) (2025-04-17)


### Features

* 🚀 add Bounce Rate in response analytics ([1ad6bce](https://github.com/growupanand/ConvoForm/commit/1ad6bce80bb8ffa62517035c44a2f33acdc20d82)), closes [#426](https://github.com/growupanand/ConvoForm/issues/426)
* 🚀 added average completion time in response analytics ([022ef90](https://github.com/growupanand/ConvoForm/commit/022ef906c55f673228e16ec549a25679d0c6dd34)), closes [#424](https://github.com/growupanand/ConvoForm/issues/424)
* 🚀 enhanced ConversationsStatsPage with MultiChoiceStats ([db4a4a5](https://github.com/growupanand/ConvoForm/commit/db4a4a51f4831b4195374778060d4dab60f257c4)), closes [#422](https://github.com/growupanand/ConvoForm/issues/422)


### Improvements

* ⚡️ migrated from socket.io to bun websocket server ([4861631](https://github.com/growupanand/ConvoForm/commit/4861631ec1c952fc650dc6874e5b60aa17d1250a))
* ⚡️ upgraded nextjs from 14 to 15 ([291e9f5](https://github.com/growupanand/ConvoForm/commit/291e9f515e22ff90c41a7ac892cdbb2fbae75b3b)), closes [#417](https://github.com/growupanand/ConvoForm/issues/417)
* 💄 formviewer is more responsive for different screen ([a7e97e6](https://github.com/growupanand/ConvoForm/commit/a7e97e67c75b8d30354903ab2e8cafc527584051)), closes [#419](https://github.com/growupanand/ConvoForm/issues/419)
* 💡 move ai logic into @convoform/ai, optimized tsconfig ([bf49a31](https://github.com/growupanand/ConvoForm/commit/bf49a317adae8e614ca610c211c42254b7da722f))
* 💡 refactore useconvoform react hook ([1f46ddb](https://github.com/growupanand/ConvoForm/commit/1f46ddb03b241e1fae433814f513902857b65648))

## [0.16.0](https://github.com/growupanand/ConvoForm/compare/0.15.0...0.16.0) (2024-12-27)


### Features

* 🚀 add start over button in form submit page ([1379738](https://github.com/growupanand/ConvoForm/commit/137973897491cb50131bb8c8acbc012b392aa965)), closes [#403](https://github.com/growupanand/ConvoForm/issues/403)
* 🚀 add stats page for form responses ([4c57c22](https://github.com/growupanand/ConvoForm/commit/4c57c22b34b608f695844f6dbef244d081d88aed)), closes [#375](https://github.com/growupanand/ConvoForm/issues/375)


### Bug Fixes

* 🐛 public tRPC routes is not working if not provided in middle ([ba92c33](https://github.com/growupanand/ConvoForm/commit/ba92c334cef89253c7e4abf907efeabc9ae09a48))


### Improvements

* ⚡️Improved platform analytics event tracking ([#406](https://github.com/growupanand/ConvoForm/issues/406)) ([b3359b7](https://github.com/growupanand/ConvoForm/commit/b3359b77d7bf1d3ba797b69c95e428ab8a1c1b68))
* 💄 added demo section in landing page ([44deea2](https://github.com/growupanand/ConvoForm/commit/44deea22f889b9ddd25f8d97f04ca0f31f0ac01c))
* 💄 added response card in landing page for demo form ([de69e75](https://github.com/growupanand/ConvoForm/commit/de69e7570c9e43acfb94c32f7e6246710e8c04ff))
* 💄 improve responses table ([2033b24](https://github.com/growupanand/ConvoForm/commit/2033b24ce6e0ec68301666f12b47324fdd612cd6))
* 💡 added FormContextProvider for handling FormViewer flow easy ([abb8422](https://github.com/growupanand/ConvoForm/commit/abb8422a23e755a3c13b45f2f2097269cb01f1b4))

## [0.15.0](https://github.com/growupanand/ConvoForm/compare/0.14.0...0.15.0) (2024-10-14)


### Features

* 🚀 fill text from templates for generate form by AI ([dbbec90](https://github.com/growupanand/ConvoForm/commit/dbbec90549b717cb6a58a74d21a48ad503c49686))


### Bug Fixes

* 🐛 form design changes not showing in incognito mode ([12980a5](https://github.com/growupanand/ConvoForm/commit/12980a5b002dfe08743aabafab238dba7bc52b10))


### Improvements

* ⚡️improved form submission API request ([#378](https://github.com/growupanand/ConvoForm/issues/378)) ([3f268a1](https://github.com/growupanand/ConvoForm/commit/3f268a1283dcbae0c5119549dd58d4680ff2cc70))
* 💄 improve typing effect while showing question ([c087904](https://github.com/growupanand/ConvoForm/commit/c08790434ba71052beec02101684e76e533dc67a))
* 💄 UI improvements and added some animations ([#380](https://github.com/growupanand/ConvoForm/issues/380)) ([9950773](https://github.com/growupanand/ConvoForm/commit/9950773b47f30fa498cc637dc2a4d64040dc3242))
* 💡 minor refactor for making home page SSG ([1731dfa](https://github.com/growupanand/ConvoForm/commit/1731dfa9335e57a8e2cc4839420661e8ab27b927))
* 💡 upgraded clerk, trpc versions and refactored as per latest usage ([6100809](https://github.com/growupanand/ConvoForm/commit/610080917345e1b88e49beac58bdff3f0b490c03))

## [0.14.0](https://github.com/growupanand/ConvoForm/compare/0.13.0...0.14.0) (2024-09-25)


### Features

* 🚀 Added form design editor ([#370](https://github.com/growupanand/ConvoForm/issues/370)) ([511d281](https://github.com/growupanand/ConvoForm/commit/511d28135fd4a8c60e64477d0fd69dff589052ba))


### Improvements

* 💄 changelog page have new UI ([9540f86](https://github.com/growupanand/ConvoForm/commit/9540f86f7a3c2233ee5596539e8ab9e06dfc9ef2))
* 💄 Each form's Responses count will be shown in workspace ([c3f411f](https://github.com/growupanand/ConvoForm/commit/c3f411f0457bfc23524f821110df2ccfe3038b26))
* 💄 New form editor layout ([7cdba99](https://github.com/growupanand/ConvoForm/commit/7cdba9979eaccc211be1e0e8982d9449122c62a4))

## [0.13.0](https://github.com/growupanand/ConvoForm/compare/0.12.0...0.13.0) (2024-09-15)


### Features

* 🚀 Added report bug floating button ([f8f7a02](https://github.com/growupanand/ConvoForm/commit/f8f7a0255bca84c3b010d5388a7801d84a7935d6))
* 🚀add custom link option on final form submission screen ([#361](https://github.com/growupanand/ConvoForm/issues/361)) ([eb22113](https://github.com/growupanand/ConvoForm/commit/eb2211340d04292239c9c5b5e83621f6783766bf))


### Bug Fixes

* 🐛 In workspace page new form not showing without reload ([f71c458](https://github.com/growupanand/ConvoForm/commit/f71c4585835a759c904354a743099200797ce5dd))
* 🐛 Internal error after open old conversation page ([bdd5e5c](https://github.com/growupanand/ConvoForm/commit/bdd5e5cbfd1d0b5e313c4d742ae488a04eba497b))


### Improvements

* 💄 Restricted App UI for desktop screen only ([72a5890](https://github.com/growupanand/ConvoForm/commit/72a5890cdba86f8d12df297305e700c67ca9eb18))
* 💡 Changes related to issue templates and workflows ([40cf360](https://github.com/growupanand/ConvoForm/commit/40cf360819bfd9e669a2994bf9122e3c8575f6ba))
* 💡 fixed discord link ([b890b8f](https://github.com/growupanand/ConvoForm/commit/b890b8f3587880aa3cf4b111377580d5b629e1e4))
* 💡 Git action for lableing PR bases on changes ([c21546a](https://github.com/growupanand/ConvoForm/commit/c21546aa58bfd6d62ca05d6b185647a17236af4c))
* 💡 Removed mobile only components ([bef0c47](https://github.com/growupanand/ConvoForm/commit/bef0c47a44f8278b64733deecd7509af9aba7d46))

## [0.12.0](https://github.com/growupanand/ConvoForm/compare/0.11.0...0.12.0) (2024-07-25)


### Features

* 🚀 added Answer Input - datepicker ([#339](https://github.com/growupanand/ConvoForm/issues/339)) ([8b71fb6](https://github.com/growupanand/ConvoForm/commit/8b71fb6842e4807ea60107a61aa863a07d88b78b)), closes [#335](https://github.com/growupanand/ConvoForm/issues/335) [#338](https://github.com/growupanand/ConvoForm/issues/338)


### Improvements

* ⚡️ Multi choice answer will save exact value WO validation ([27af2f1](https://github.com/growupanand/ConvoForm/commit/27af2f1a24610559809fe6da5c1f5309103815ed))

## [0.11.0](https://github.com/growupanand/ConvoForm/compare/0.10.0...0.11.0) (2024-07-14)


### Features

* 🚀 Added submission progress bar ([2afd2f9](https://github.com/growupanand/ConvoForm/commit/2afd2f9bba9dbc01e20ca92e8515cf7d6af372e7))
* 🚀 Current field will be shown in form submission page ([fdacaaf](https://github.com/growupanand/ConvoForm/commit/fdacaafe4654eb61809032902913afb000829fca))


### Improvements

* ⚡️ Replaced eslint and prettier with the Biomejs ([#327](https://github.com/growupanand/ConvoForm/issues/327)) ([f3ee459](https://github.com/growupanand/ConvoForm/commit/f3ee45931ef72a54c6778fdbc04bf70046b2be8c))
* ⚡️ Upgraded Next.js version@14.2.5 ([fa351a0](https://github.com/growupanand/ConvoForm/commit/fa351a05b433ab7db38343e6a6dbcc50225e5912))
* ⚡️ Upgraded Turborepo version@2 ([8b47847](https://github.com/growupanand/ConvoForm/commit/8b478477f2ff84fa9f784b83e6dbff6e2fd9c456))

## [0.10.0](https://github.com/growupanand/ConvoForm/compare/0.9.2...0.10.0) (2024-07-13)

### Features

- 🚀 Added Input Configuration editor in Edit Field Sheet
  ([a1a3b77](https://github.com/growupanand/ConvoForm/commit/a1a3b7767a1a9ad76e27e419d0c1b3a42265649c))
- 🚀 Added Multi Choice Answer Input in Form submission page
  ([895a181](https://github.com/growupanand/ConvoForm/commit/895a181ce3378eb669b4e3df047fae09dadaa9a7))
- 🚀 Added Multi choices Input type editor
  ([9ff4d15](https://github.com/growupanand/ConvoForm/commit/9ff4d1573d52175d12eca108c1a05e9150b63459))
- 🚀 Form fields order can now be changed by dragging
  ([#319](https://github.com/growupanand/ConvoForm/issues/319))
  ([dd81520](https://github.com/growupanand/ConvoForm/commit/dd815200980fff4f75b2ccb36c34f50ab4e35547))

### Bug Fixes

- 🐛 Added URL support from NEXT_PUBLIC_APP_URL in useconvofo
  ([8ca371d](https://github.com/growupanand/ConvoForm/commit/8ca371da6d422654e53c90c5f8dd75d1ecc14ce9))
- 🐛 Added vercel deployment support for useConvoForm
  ([3edac48](https://github.com/growupanand/ConvoForm/commit/3edac48cd07191a028c2891d5dcee8100d62ae2c))
- 🐛 Error in generating form by AI
  ([b136923](https://github.com/growupanand/ConvoForm/commit/b136923ab72a683095144d345751e7446f976127))
- 🐛 Unable to save changes in form editor
  ([240cded](https://github.com/growupanand/ConvoForm/commit/240cded179f1d233390388c83964079ba0d5c78b))
- 🐛Related to label workflows, added Infrastructure issue template
  ([#304](https://github.com/growupanand/ConvoForm/issues/304))
  ([0bcb527](https://github.com/growupanand/ConvoForm/commit/0bcb527dd1888605f8808903960fa81448f83abc))

### Improvements

- 💄 Dragging of Fields are now restricted to VerticalAxis
  ([b684e65](https://github.com/growupanand/ConvoForm/commit/b684e6511c72836b12b6112e418ddafabe0e89d7))
- 💄 UI-UX Improvements
  ([77f1bc6](https://github.com/growupanand/ConvoForm/commit/77f1bc605ab607762024c8a4871c155a653186a6))
- 💡 296 as a creator i can edit form fields name description and input type
  ([#300](https://github.com/growupanand/ConvoForm/issues/300))
  ([fe072d8](https://github.com/growupanand/ConvoForm/commit/fe072d84e565b8d62a42a0aa74bce9b05d065ef3))
- 💡 Added delete form field button
  ([c3272f7](https://github.com/growupanand/ConvoForm/commit/c3272f73b23a45078e8ca21bad0ebece6d52d6d9))
- 💡 moved all form validation schema into one file
  ([54347e8](https://github.com/growupanand/ConvoForm/commit/54347e83b52ead0d4d0cbde99bc5ccdf00f03a85))
- 💡 moved converstaion and workspace validation in file
  ([4936144](https://github.com/growupanand/ConvoForm/commit/49361445a271a865be84d986838dbc7745bdf581))
- 💡 moved db shcemas into seperate files
  ([90324a9](https://github.com/growupanand/ConvoForm/commit/90324a95581be4433d64a310147c7f615034d91b))
- 💡 upgraded drizzle-orm, moved rest schema validation
  ([38b117f](https://github.com/growupanand/ConvoForm/commit/38b117f88adabe030cb4074e3921688b65bcb948))

## [0.9.2](https://github.com/growupanand/ConvoForm/compare/0.9.1...0.9.2) (2024-06-10)

### Improvements

- 💄 In form editor, After remove a form field I can undo this remove
  ([#263](https://github.com/growupanand/ConvoForm/issues/263))
  ([c8edb9e](https://github.com/growupanand/ConvoForm/commit/c8edb9edf2ea9127366aa53b71f220d447dcd13e))

## [0.9.1](https://github.com/growupanand/ConvoForm/compare/0.9.0...0.9.1) (2024-06-02)

### Improvements

- 💄Added empty states
  ([#259](https://github.com/growupanand/ConvoForm/issues/259))
  ([b0d18b1](https://github.com/growupanand/ConvoForm/commit/b0d18b1dcb12043a3f80caf56e128876598bf58f))

## [0.9.0](https://github.com/growupanand/ConvoForm/compare/0.8.0...0.9.0) (2024-05-18)

### Features

- 🚀 Published React package
  ([#245](https://github.com/growupanand/ConvoForm/issues/245))
  ([c5a353b](https://github.com/growupanand/ConvoForm/commit/c5a353b14d9698edb6efecf1326e715d08f93f90))

## [0.8.0](https://github.com/growupanand/ConvoForm/compare/0.7.0...0.8.0) (2024-05-05)

### Features

- 🚀 Implement live form submission progress for creators using
  ([#241](https://github.com/growupanand/ConvoForm/issues/241))
  ([6d01015](https://github.com/growupanand/ConvoForm/commit/6d010155e81068b664773c2d4a406f24e009b477))

### Improvements

- 💄 Updated homepage UI, screenshots, text
  ([6370026](https://github.com/growupanand/ConvoForm/commit/6370026f96330a95a12cd311f5f66fbcb3320713))

## [0.7.0](https://github.com/growupanand/ConvoForm/compare/0.6.1...0.7.0) (2024-05-01)

### Features

- 🚀 51 Revamped conversation flow
  ([#238](https://github.com/growupanand/ConvoForm/issues/238))
  ([bc4994f](https://github.com/growupanand/ConvoForm/commit/bc4994fc745c9a89ad65a76acebe71e60c5505d8)),
  closes [#51](https://github.com/growupanand/ConvoForm/issues/51)

### Improvements

- 💄 Minor UI changes
  ([957fbec](https://github.com/growupanand/ConvoForm/commit/957fbecf2b8cc3885a031876e83415b392ee0793))

## [0.6.1](https://github.com/growupanand/ConvoForm/compare/0.6.0...0.6.1) (2024-04-07)

### Improvements

- ⚡️ Added empty string validation in answer input form
  ([ad3acec](https://github.com/growupanand/ConvoForm/commit/ad3acec7e27b6d61f550a651cb6e97efcfd745fb))
- 💄 Added illustration for endscreen in Form Submission pa
  ([50ae285](https://github.com/growupanand/ConvoForm/commit/50ae285d1b7704ed7ebcf6c95fc380bfdcf1625b))
- 💄 UI improvement in Form submission page
  ([d3b0332](https://github.com/growupanand/ConvoForm/commit/d3b033251f374170b044c3f159547284db8e7a91))

## [0.6.0](https://github.com/growupanand/ConvoForm/compare/0.5.0...0.6.0) (2024-04-03)

### Features

- 🚀 Added custom end screen message setting
  ([aa84182](https://github.com/growupanand/ConvoForm/commit/aa841829a19a3af2380f0dd5269cfae28774d816))
- 🚀 As form creator, I can add my company logo to the form
  ([#219](https://github.com/growupanand/ConvoForm/issues/219))
  ([9781e48](https://github.com/growupanand/ConvoForm/commit/9781e485be1f0805503060f909b7fabe817fd9be))
- 🚀 As form creator, I can add my company name to the form
  ([#216](https://github.com/growupanand/ConvoForm/issues/216))
  ([9b0cbf6](https://github.com/growupanand/ConvoForm/commit/9b0cbf6e0079de7872f51700925d86a4eea71212))

### Bug Fixes

- 🐛 Sometimes form editor page not loading
  ([c46eab4](https://github.com/growupanand/ConvoForm/commit/c46eab40a7283d25764078785f857ec2fa6f9be6)),
  closes [#206](https://github.com/growupanand/ConvoForm/issues/206)
- 🐛 tanstack mutate query raise false uncaught error
  ([7828ac4](https://github.com/growupanand/ConvoForm/commit/7828ac49b86724516eb0c2ab8f8b684312a01444)),
  closes [#208](https://github.com/growupanand/ConvoForm/issues/208)

### Improvements

- ⚡️ added ratelimit - create workspaces, forms
  ([aa70d75](https://github.com/growupanand/ConvoForm/commit/aa70d75ef06cd5ce637fd512a08a7dcb870e806b)),
  closes [#199](https://github.com/growupanand/ConvoForm/issues/199)
- ⚡️ added ratelimit - edit workspace, form
  ([6ac8f8d](https://github.com/growupanand/ConvoForm/commit/6ac8f8d48f39f703f5ec20d6efec79c00fa02d50)),
  closes [#200](https://github.com/growupanand/ConvoForm/issues/200)
- ⚡️ added ratelimit for OpenAI calls
  ([8376550](https://github.com/growupanand/ConvoForm/commit/8376550caae63620f5db51f7cf71e2e92e68c91d)),
  closes [#201](https://github.com/growupanand/ConvoForm/issues/201)
- 💄 Added request feature card in landing page
  ([c72e516](https://github.com/growupanand/ConvoForm/commit/c72e51680e3f7e399f08ad5490b1b7c2d9b5c0b0))
- 💄 added stagger animation for list items
  ([1961d0f](https://github.com/growupanand/ConvoForm/commit/1961d0f6256399573887575a1aee8d3b6d9ce37c)),
  closes [#210](https://github.com/growupanand/ConvoForm/issues/210)
- 💄 UI improvements in landing page
  ([6df1fcb](https://github.com/growupanand/ConvoForm/commit/6df1fcbaaff49660b408daa7dd4598a4a65c4756))
- 💡 changes related to form submission page
  ([f658846](https://github.com/growupanand/ConvoForm/commit/f6588465ab4155393b83253074d183a179d411b1))
- 💡 custom end screen message related changes
  ([f6a3ce4](https://github.com/growupanand/ConvoForm/commit/f6a3ce4c014fe036db034c9cd4e3e0d87149644a))
- 💡 fixed ratelimit error message toast
  ([e887a1b](https://github.com/growupanand/ConvoForm/commit/e887a1b57d10a0338308a46b9dfa8a6351735e8f))

## [0.5.0](https://github.com/growupanand/ConvoForm/compare/0.4.0...0.5.0) (2024-02-27)

### Features

- 🚀 added recent responses and usage card in dashboard page
  ([0adb281](https://github.com/growupanand/ConvoForm/commit/0adb28109b3255dbadec52b74638b1ef6227a5b4))
- 🚀 As a User, I Can Generate a New Form with AI
  ([70182c7](https://github.com/growupanand/ConvoForm/commit/70182c7241ad46b825785ee84d26d5bb4e1d15c2)),
  closes [#192](https://github.com/growupanand/ConvoForm/issues/192)

### Bug Fixes

- 🐛 Anyone can edit any form using the form link even it is
  ([37f4203](https://github.com/growupanand/ConvoForm/commit/37f42033e35269bcc6137a88e71c9e4def43561d)),
  closes [#194](https://github.com/growupanand/ConvoForm/issues/194)
- 🐛 edge case where collected data value is not string
  ([7989c2b](https://github.com/growupanand/ConvoForm/commit/7989c2bfca42ee72f36f9f29776a37ad7a370a3e))
- 🐛 form editor page break sometime
  ([bf718b7](https://github.com/growupanand/ConvoForm/commit/bf718b7a2a20cd6c1009064486d7d2f01b64992a))
- 🐛 handled uncaught error while chaning form name
  ([386b28a](https://github.com/growupanand/ConvoForm/commit/386b28ac3a6afbb41ab332de13e5ec30c206fdd1))
- 🐛 progress circle label position fixed while scroll window
  ([faafcbf](https://github.com/growupanand/ConvoForm/commit/faafcbf18dc6341071f6e14e819f6ebc7d8ca13f))
- 🐛 tremor chart library styling was not working with shadcn
  ([2b21f28](https://github.com/growupanand/ConvoForm/commit/2b21f280a0a5a19853571a5a6518955227424809))

### Improvements

- ⚡️ While using Auto form generate using AI, we will genera
  ([24e899c](https://github.com/growupanand/ConvoForm/commit/24e899c0bc66518605e35108c984d10c5cf1dde1))
- 💄 fixed percentage in response usage progress circle
  ([129477a](https://github.com/growupanand/ConvoForm/commit/129477a004b74165e5429cbb097899d37a27cd02))
- 💄 make generate AI form dialog responsive
  ([db04ffc](https://github.com/growupanand/ConvoForm/commit/db04ffcefdc9729e7b01ea7080aef38518b8a8b2))
- 💄 minor UI changes and removed harcoded value
  ([c183e64](https://github.com/growupanand/ConvoForm/commit/c183e64ad11dbec679d1a1f5ada3bc87aee2aad1))
- 💄 UI changes in landing page for new feature lanuch
  ([4c4e066](https://github.com/growupanand/ConvoForm/commit/4c4e066267cc0f613d794df7ab59fe81abc35024))
- 💄 UI improvements in auto generate form
  ([f03894e](https://github.com/growupanand/ConvoForm/commit/f03894e7c0ea5901fd2f55ee651f47d18e9d28b7))
- 💡 clerk webhook db calls from nextjs app to api
  ([0c3a265](https://github.com/growupanand/ConvoForm/commit/0c3a265ea7ee6bc92131f58a545c2245a560d1ad))

## [0.4.0](https://github.com/growupanand/ConvoForm/compare/0.3.0...0.4.0) (2024-02-13)

### Features

- 🚀 added form responses overview page
  ([fade9a1](https://github.com/growupanand/ConvoForm/commit/fade9a1539031afc9ed879be7c2c9c045c1d9da6)),
  closes [#162](https://github.com/growupanand/ConvoForm/issues/162)
- 🚀 now you can export and download responses table data
  ([105e241](https://github.com/growupanand/ConvoForm/commit/105e24103017b52339bba2894cbf93cdb0590e49)),
  closes [#186](https://github.com/growupanand/ConvoForm/issues/186)

### Bug Fixes

- 🐛 meta images not showing
  ([b19cfa1](https://github.com/growupanand/ConvoForm/commit/b19cfa19e70d8cd10d01462ec3e4cda7e482da8e))

### Improvements

- ⚡️ added drizzle and used it in whole project
  ([b50d53e](https://github.com/growupanand/ConvoForm/commit/b50d53ed080300652dd086353ab2aec415a72dfe))
- ⚡️ converted tRPC api route into edge runtime
  ([b41bc5d](https://github.com/growupanand/ConvoForm/commit/b41bc5d23d012681108de17aa172c4e58ef38886)),
  closes [#182](https://github.com/growupanand/ConvoForm/issues/182)
- ⚡️ removed prisma
  ([8e99984](https://github.com/growupanand/ConvoForm/commit/8e9998450faeb745b713d707e16327c24e13f14c))
- ⚡️ upgraded version of tRPC and @tanstack/react-query
  ([131c0a7](https://github.com/growupanand/ConvoForm/commit/131c0a7d7c9448da06906c7560488d47317a549d))
- 💄 added screenshots Carousel in landing page hero secito
  ([f8b5e1e](https://github.com/growupanand/ConvoForm/commit/f8b5e1ee6431644cd9c9bcf7430a4563ab67fbb8))
- 💄 Display confirm box before deleting workspace or form
  ([60c1dda](https://github.com/growupanand/ConvoForm/commit/60c1dda58a26d084ff7de7c8e811495e6a809e6f)),
  closes [#116](https://github.com/growupanand/ConvoForm/issues/116)
- 💡 fixed default value for updatedAt field in database
  ([97fd638](https://github.com/growupanand/ConvoForm/commit/97fd638d58a0b8f7abb46e6c5b388ae3460c7c73))

## 0.3.0 (2024-02-02)

### Features

- [#153](https://github.com/growupanand/ConvoForm/issues/153) while going to
  previous question, previous answer should also auto-filled in input
  ([f8c2b15](https://github.com/growupanand/ConvoForm/commit/f8c2b15bb54867c890e45658dec1f76b8cbea04e))
- 🚀 Added changelog page
  ([5677e81](https://github.com/growupanand/ConvoForm/commit/5677e81398afe79da99384e08c2ce8f378e47e6d)),
  closes [#143](https://github.com/growupanand/ConvoForm/issues/143)
- 🚀 Added charts in dashbard page
  ([c61739c](https://github.com/growupanand/ConvoForm/commit/c61739c30bab0d660fa60759bf74294a946480e0)),
  closes [#147](https://github.com/growupanand/ConvoForm/issues/147)

### Bug Fixes

- 🐛 auth pages were not working
  ([59688a3](https://github.com/growupanand/ConvoForm/commit/59688a3e2b8ea0e4b03acf453937519293e1f2bf))
- 🐛 Prisma client not working on production
  ([59fb06a](https://github.com/growupanand/ConvoForm/commit/59fb06a98b43cf908adaf6e242142404a7ec140b)),
  closes [#173](https://github.com/growupanand/ConvoForm/issues/173)
- 🐛 Unauthorized getOrganizationId(src/lib/getOrganizationId
  ([f7f404d](https://github.com/growupanand/ConvoForm/commit/f7f404d00ee0211c17c6c2959850193d8b77ac40)),
  closes [#166](https://github.com/growupanand/ConvoForm/issues/166)
- 🐛 wrong domain name on production doployment
  ([f738b62](https://github.com/growupanand/ConvoForm/commit/f738b6220b36f775a7a187322d75cb84305b9fa0)),
  closes [#159](https://github.com/growupanand/ConvoForm/issues/159)

### Improvements

- ⚡️ added meta image
  ([3ad6a63](https://github.com/growupanand/ConvoForm/commit/3ad6a63bfb0fddc050081a7e43320c02b6393ef8))
- ⚡️ added sperate organization selection page
  ([40941cb](https://github.com/growupanand/ConvoForm/commit/40941cb99281e39b4e150b9ca9e4cec3c05bdd53)),
  closes [#169](https://github.com/growupanand/ConvoForm/issues/169)
- ⚡️ Added trpc
  ([ef2dd15](https://github.com/growupanand/ConvoForm/commit/ef2dd156c37407a106e6b44c578c6b9856eec864)),
  closes [#145](https://github.com/growupanand/ConvoForm/issues/145)
- ⚡️ made root page static
  ([61ebf26](https://github.com/growupanand/ConvoForm/commit/61ebf265cc4ce791c79862214a95ca99eb1be009))
- 💄 Addded Progress Indicator while navigating pages
  ([4876b35](https://github.com/growupanand/ConvoForm/commit/4876b35914f4839039de36c36f908b13863ad3c8)),
  closes [#163](https://github.com/growupanand/ConvoForm/issues/163)

## [0.2.1](https://github.com/growupanand/ConvoForm/compare/0.2.0...0.2.1) (2024-01-23)

### Bug Fixes

- 🐛 wrong domain name on production doployment
  ([d5dcbd6](https://github.com/growupanand/ConvoForm/commit/d5dcbd687b0a242d9ece628b00ba5de7952f7c0a)),
  closes [#159](https://github.com/growupanand/ConvoForm/issues/159)

## 0.2.0 (2024-01-22)

### Features

- [#153](https://github.com/growupanand/ConvoForm/issues/153) while going to
  previous question, previous answer should also auto-filled in input
  ([2ac600d](https://github.com/growupanand/ConvoForm/commit/2ac600d7cab948b2a59050f5ffdb752e271f8d82))
- 🚀 Added changelog page
  ([8ff20ea](https://github.com/growupanand/ConvoForm/commit/8ff20ea58bf1b829553244d1b5fb2298e4d9fb55)),
  closes [#143](https://github.com/growupanand/ConvoForm/issues/143)

## 0.1.1 (2024-01-21)

### Reverts

- Revert "Added DIRECT_URL in db schema to make prisma work with pool
  connection"
  ([c8a60f5](https://github.com/growupanand/ConvoForm/commit/c8a60f5e57e3ff4767c4dee8ede2fa77f0b7837e))
- Revert "Added email provider to login using magic links"
  ([4306a0e](https://github.com/growupanand/ConvoForm/commit/4306a0ed3df74c8188343e2ce6db9c44445d44cd))
- Revert "Added custom email template for login magic link"
  ([0a97289](https://github.com/growupanand/ConvoForm/commit/0a972892716f47982356d4d07df71228c73bc654))
