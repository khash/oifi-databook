# Proposed Link Fixes

Human review queue. Entries are written here by the `fix-broken-links` agent.

- Change `PENDING_REVIEW` to `APPROVED` or `REJECTED` for each entry
- Then run `/apply-link-fixes` to commit approved replacements to source files
- Then run `FORCE_RECHECK=1 node scripts/check-links.mjs` to update the cache

---

## [NOT_FOUND]
- **Original:** https://www.longwarjournal.org/archives/2026/02/iran-military-leadership-killed-february-strikes.php
- **Proposed:** *(none)*
- **Source title:** "Iran military leadership killed in February strikes"
- **Files:** content/people/abdolrahim-mousavi.json, content/people/hossein-jabal-amelian.json, content/people/mohammad-pakpour.json
- **Notes:** Wayback Machine API empty. URL is dated Feb 2026 (current month). No corresponding Long War Journal article found via web search at this slug or close variants. Likely a forward-dated/fabricated reference inherited from earlier ingest. Manual research needed to substitute a verified primary source for the Feb 2026 strike events.
## [NOT_FOUND]
- **Original:** https://www.tasnimnews.com/en/news/2026/03/19/armed-forces-rep-basij-killed
- **Proposed:** *(none)*
- **Source title:** "Armed Forces Representative to Basij Killed"
- **Files:** content/people/afshin-naghshbandi.json, content/connections/afshin-naghshbandi-affiliatedwith-basij.json, content/connections/afshin-naghshbandi-subjectof-march2026.json
- **Notes:** Wayback Machine API empty (and source returned fetch failed). Tasnim slug appears placeholder-style (no numeric story ID). No corroborating article located via web search. Operator should verify the underlying claim via a confirmed primary source.
## [NOT_FOUND]
- **Original:** https://www.tasnimnews.com/en/news/2026/03/08/irgc-isfahan-commander-killed
- **Proposed:** *(none)*
- **Source title:** "IRGC Isfahan Corps Commander Killed"
- **Files:** content/people/ali-hashemi-irgc-isfahan.json, content/connections/ali-hashemi-irgc-isfahan-servedin-irgc.json, content/connections/ali-hashemi-irgc-isfahan-subjectof-march2026.json
- **Notes:** Wayback Machine API empty. Tasnim URL is placeholder-style (slug, no story ID); no corroborating article found. Manual verification required for the underlying claim.
## [NOT_FOUND]
- **Original:** https://www.tasnimnews.com/en/news/2026/03/09/3264000/funeral-held-for-basij-commander-badfar
- **Proposed:** *(none)*
- **Source title:** "Funeral Held for Basij Commander Badfar"
- **Files:** content/people/asadollah-badfar.json, content/connections/asadollah-badfar--headed--basij.json, content/connections/asadollah-badfar--served-in--islamic-revolutionary-guard-corps.json, content/connections/asadollah-badfar--subject-of--march-2026-strike-wave.json
- **Notes:** Wayback Machine API empty. Despite the numeric story ID (3264000), no live Tasnim story or cross-outlet coverage of an "Asadollah Badfar" Basij commander funeral located via web search. Manual verification needed.
## [NOT_FOUND]
- **Original:** https://www.tasnimnews.com/en/news/2026/03/22/basij-shiraz-commander-killed
- **Proposed:** *(none)*
- **Source title:** "Basij Shiraz Commander Killed"
- **Files:** content/people/ebrahim-mortazavi-nasb.json, content/connections/ebrahim-mortazavi-nasb-servedin-basij.json, content/connections/ebrahim-mortazavi-nasb-subjectof-march2026.json
- **Notes:** Wayback Machine API empty. Placeholder-style Tasnim URL with no numeric story ID; no corroborating coverage located. Manual verification needed.
## [NOT_FOUND]
- **Original:** https://www.judiciary.be/
- **Proposed:** *(none)*
- **Source title:** "Belgian Federal Prosecution — Assadi case"
- **Files:** content/people/hamid-naghashan.json, content/connections/hamid-naghashan-affiliated-with-ministry-of-intelligence.json
- **Notes:** Wayback Machine API empty. The .be judiciary domain is non-resolving (fetch failed) and doesn't appear to be a stable/canonical URL for the Belgian Federal Prosecution Service. Operator should substitute either a press release from https://www.om-mp.be (Belgian federal prosecutor) or a news report on the Naghashan/Assadi linkage. Source title is too vague to identify a specific document automatically.
## [NOT_FOUND]
- **Original:** https://www.tasnimnews.com/en/news/2021/08/24/2551400/shahram-irani-replaces-khanzadi-as-iran-navy-cmdr
- **Proposed:** *(none)*
- **Source title:** "Shahram Irani Replaces Khanzadi as Iran Navy Cmdr"
- **Files:** content/people/hossein-khanzadi.json
- **Notes:** Wayback returned no snapshot. Specific Tasnim article ID not findable via search; bot-blocked from direct access. Cross-outlet alternatives (PressTV, Times of Israel) cover same fact. Possible alternative: https://www.timesofisrael.com/irans-supreme-leader-appoints-new-chief-for-countrys-navy/
## [NOT_FOUND]
- **Original:** https://www.bbc.com/news/articles/c0k5v5jn35no
- **Proposed:** *(none)*
- **Source title:** "Who was Ibrahim Aqil, Hezbollah commander killed in Beirut strike?"
- **Files:** content/people/ibrahim-aqil.json
- **Notes:** Wayback returned no snapshot. Specific BBC article ID c0k5v5jn35no not surfacing in search results. Cross-outlet substitute: https://www.aljazeera.com/news/2024/9/20/who-is-ibrahim-aqil-the-hezbollah-commander-targeted-by-israel
## [NOT_FOUND]
- **Original:** https://www.imamsadegh.com
- **Proposed:** *(none)*
- **Source title:** "Imam Sadiq Institute — Official Website"
- **Files:** content/people/jafar-sobhani.json, content/orgs/imam-sadeq-institute.json
- **Notes:** Wayback returned no snapshot. Domain appears defunct. No clear official replacement found. Possible alternative (different entity): https://imamsadiq.ac/en
## [NOT_FOUND]
- **Original:** https://www.makaremshirazi.org/english/others/sobhani.php
- **Proposed:** *(none)*
- **Source title:** "Grand Ayatollah Sobhani — Biography"
- **Files:** content/people/jafar-sobhani.json
- **Notes:** Wayback returned no snapshot. Makarem Shirazi site moved to makaremshirazi.net. Possible biography substitutes: https://themuslim500.com/profiles/jafar-sobhani/ or https://al-islam.org/person/ayatullah-jafar-subhani
## [NOT_FOUND]
- **Original:** https://www.bbc.com/news/world-middle-east-11871346
- **Proposed:** *(none)*
- **Source title:** "Iran nuclear scientist Majid Shahriari killed in Tehran bomb attack"
- **Files:** content/people/majid-shahriari.json, content/events/iran-nuclear-scientist-assassinations-2010.json, content/connections/fereydoun-abbasi-davani-subject-of-iran-nuclear-scientist-assassinations-2010.json, content/connections/majid-shahriari-subject-of-iran-nuclear-scientist-assassinations-2010.json
- **Notes:** Wayback returned no snapshot. Cross-outlet alternative: https://www.aljazeera.com/news/2010/11/29/iranian-nuclear-scientist-killed
## [NOT_FOUND]
- **Original:** https://www.buzzfeednews.com/article/sheerafrenkel/mintpress-news-iran-story
- **Proposed:** *(none)*
- **Source title:** "BuzzFeed News — MintPress editorial orientation analysis"
- **Files:** content/people/mnar-muhawesh-adley.json
- **Notes:** Wayback returned no snapshot. BuzzFeed News shut down 2023. Closest substitute (different author): https://www.buzzfeednews.com/article/rosiegray/the-inside-story-of-one-websites-defense-of-assad
## [NOT_FOUND]
- **Original:** https://www.bbc.com/news/articles/c9dlr9j51g4o
- **Proposed:** *(none)*
- **Source title:** "Iran military chief killed in Israeli strikes"
- **Files:** content/people/mohammad-bagheri.json
- **Notes:** Wayback returned no snapshot. BBC article ID not surfacing. Cross-outlet alternative: https://www.aljazeera.com/features/2025/6/13/who-was-mohammad-bagheri-chief-of-irans-military-killed-by-israel
## [NOT_FOUND]
- **Original:** https://www.bbc.co.uk/news/world-middle-east-10627898
- **Proposed:** *(none)*
- **Source title:** "Iranian diplomat defects from Oslo consulate"
- **Files:** content/people/mohammad-reza-heydari.json, content/connections/mohammad-reza-heydari-named-in-green-movement-protests-2009.json, content/connections/mohammad-reza-heydari-served-in-ministry-of-foreign-affairs.json
- **Notes:** Wayback returned no snapshot. Cross-outlet alternatives: https://www.timesofisrael.com/iranian-diplomat-defects-to-norway/ or https://www.upi.com/Top_News/US/2010/01/15/Iranian-diplomat-in-Oslo-quits-in-protest/UPI-56521263614885
## [NOT_FOUND]
- **Original:** https://en.wikipedia.org/wiki/Mohsen_Pak-Aeen
- **Proposed:** *(none)*
- **Source title:** "Mohsen Pak-Aeen"
- **Files:** content/people/mohsen-pak-aeen.json, content/connections/mohsen-pak-aeen-affiliated-with-ministry-of-intelligence.json, content/connections/mohsen-pak-aeen-served-in-ministry-of-foreign-affairs.json
- **Notes:** Wayback returned no snapshot. No standalone Wikipedia article found under any spelling. He is mentioned in https://en.wikipedia.org/wiki/List_of_ambassadors_of_Iran_to_Pakistan and the current ambassadors list. Consider removing this dead source.
## [NOT_FOUND]
- **Original:** https://www.tasnimnews.com/en/news/2026/03/12/irgc-clergy-affairs-east-azerbaijan-killed
- **Proposed:** *(none)*
- **Source title:** "IRGC Clergy Affairs Officer Killed in East Azerbaijan"
- **Files:** content/people/naqi-mohaddesnia.json, content/connections/naqi-mohaddesnia-servedin-irgc.json, content/connections/naqi-mohaddesnia-subjectof-march2026.json
- **Notes:** Wayback returned no snapshot. Tasnim URL appears synthetic (no numeric article ID). Possible alternatives: https://en.wikipedia.org/wiki/List_of_Iranian_officials_killed_during_the_2026_Iran_war or https://www.euronews.com/2026/03/21/all-iranian-officials-and-commanders-killed-in-the-past-nine-months
## [NOT_FOUND]
- **Original:** https://pakistan.mfa.gov.ir/en/generalcategoryservices/8569/ambassador
- **Proposed:** *(none)*
- **Source title:** "Ambassador — Embassy of the Islamic Republic of Iran, Islamabad"
- **Files:** content/people/reza-amiri-moghadam.json, content/connections/reza-amiri-moghadam-served-in-supreme-national-security-council.json
- **Notes:** Wayback returned no snapshot. Iranian MFA embassy site fetch fails (frequently blocked/down) — may be connectivity issue rather than removal. Manual recheck recommended.
## [NOT_FOUND]
- **Original:** https://www.radiofarda.com/a/marandi-khamenei-doctor/31234567.html
- **Proposed:** *(none)*
- **Source title:** "Ali Marandi, Khamenei's personal physician"
- **Files:** content/people/seyed-ali-marandi.json
- **Notes:** Wayback returned no snapshot. URL has placeholder-style article ID (31234567) and may be fabricated. Alternative coverage: https://www.iranintl.com/en/20211001311443 (Iran International) or https://ifpnews.com/ayatollah-khameneis-physician-the-leader-has-a-very-modest-lifestyle/
## [NOT_FOUND]
- **Original:** https://www.iiss.org/publications/strategic-dossiers/whither-iran
- **Proposed:** *(none)*
- **Source title:** "Whither Iran? — IISS"
- **Files:** content/people/shahram-chubin.json
- **Notes:** Wayback returned no snapshot. The 2002 Chubin "Whither Iran?" Adelphi Paper is no longer hosted on iiss.org. May be available via Routledge/Taylor & Francis Adelphi Papers archive. Manual research needed.
## [NOT_FOUND]
- **Original:** https://www.rudaw.net
- **Proposed:** *(none)*
- **Source title:** "Rudaw — Iranian Kurdish parties discussions 2019"
- **Files:** content/events/kurdistan-autonomy-referendum-discussions-2019.json
- **Notes:** Bare homepage URL with no article-level pointer; cannot identify a specific replacement article. No Wayback snapshot of bare domain returning the originally-cited story. Operator should locate a specific Rudaw article from 2019 about Iranian Kurdish autonomy/referendum discussions.
## [NOT_FOUND]
- **Original:** https://www.marxists.org/history/international/comintern/sections/iran/tudeh/index.htm
- **Proposed:** *(none)*
- **Source title:** "Tudeh Party of Iran — Marxists Internet Archive"
- **Files:** content/events/tudeh-party-mass-arrests-1983.json
- **Notes:** No Wayback snapshot. Marxists.org Tudeh section appears removed. The Tudeh Party's own history page and the Wikipedia article (already cited in the file) are alternatives but materially different sources. Manual research needed.
## [REJECTED]
- **Original:** https://www.american-iranian.org/
- **Proposed:** http://www.us-iran.org/
- **Method:** Web search — AIC's current official domain is us-iran.org; american-iranian.org appears defunct.
- **Confidence:** high — same organization, current official site.
- **Source title:** "American Iranian Council"
- **Files:** content/orgs/american-iranian-council.json, content/connections/hooshang-amirahmadi-founded-american-iranian-council.json, content/connections/hooshang-amirahmadi-led-american-iranian-council.json
- **Notes:** us-iran.org is HTTP-only.
## [NOT_FOUND]
- **Original:** https://www.longwarjournal.org/archives/2024/09/irgc-quds-force-commander-for-lebanon-killed-in-israeli-strike.php
- **Proposed:** *(none confidently identified)*
- **Source title:** "IRGC Quds Force commander for Lebanon killed in Israeli strike"
- **Files:** content/orgs/irgc-quds-force-lebanon-corps.json
- **Notes:** No Wayback snapshot. Long War Journal article path appears removed/restructured. The Sept 2024 event likely refers to a Quds Force Lebanon commander killed in or around the Sept 27 2024 strike that killed Hassan Nasrallah. Coverage exists at Times of Israel and Reuters but no exact LWJ replacement located via search. Operator should browse LWJ's archive for September 2024 manually.
