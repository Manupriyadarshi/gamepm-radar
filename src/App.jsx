import { useState, useEffect, useMemo, useCallback, useRef } from "react";

const COMPANIES = [
{"company":"Riot Games","career_page":"https://www.riotgames.com/en/work-with-us/jobs","country":"USA"},
{"company":"Supercell","career_page":"https://supercell.com/en/careers/","country":"Finland"},
{"company":"Electronic Arts","career_page":"https://www.ea.com/careers","country":"USA"},
{"company":"Ubisoft","career_page":"https://www.ubisoft.com/en-us/company/careers","country":"France"},
{"company":"Epic Games","career_page":"https://www.epicgames.com/site/en-US/careers","country":"USA"},
{"company":"Roblox","career_page":"https://corp.roblox.com/careers/","country":"USA"},
{"company":"Valve","career_page":"https://www.valvesoftware.com/en/jobs","country":"USA"},
{"company":"Nintendo","career_page":"https://www.nintendo.co.jp/jobs/","country":"Japan"},
{"company":"Sony Interactive Entertainment","career_page":"https://www.playstation.com/en-us/corporate/playstation-careers/","country":"Japan"},
{"company":"Microsoft Gaming","career_page":"https://careers.microsoft.com/","country":"USA"},
{"company":"Take-Two Interactive","career_page":"https://www.take2games.com/careers/","country":"USA"},
{"company":"Rockstar Games","career_page":"https://www.rockstargames.com/careers","country":"USA"},
{"company":"CD Projekt Red","career_page":"https://en.cdprojektred.com/jobs/","country":"Poland"},
{"company":"Bungie","career_page":"https://careers.bungie.com/","country":"USA"},
{"company":"Bethesda","career_page":"https://jobs.zenimax.com/","country":"USA"},
{"company":"Capcom","career_page":"https://www.capcom.co.jp/ir/english/recruit/","country":"Japan"},
{"company":"Square Enix","career_page":"https://square-enix-games.com/en_US/careers","country":"Japan"},
{"company":"Bandai Namco","career_page":"https://www.bandainamcoent.com/careers","country":"Japan"},
{"company":"Konami","career_page":"https://www.konami.com/jobs/","country":"Japan"},
{"company":"Sega","career_page":"https://www.sega.co.jp/en/recruit/","country":"Japan"},
{"company":"Nexon","career_page":"https://career.nexon.com/","country":"South Korea"},
{"company":"NCSoft","career_page":"https://about.ncsoft.com/en/careers/","country":"South Korea"},
{"company":"Netmarble","career_page":"https://company.netmarble.com/en/careers","country":"South Korea"},
{"company":"Krafton","career_page":"https://www.krafton.com/en/careers/","country":"South Korea"},
{"company":"Garena","career_page":"https://career.seagroup.com/","country":"Singapore"},
{"company":"Scopely","career_page":"https://www.scopely.com/careers","country":"USA"},
{"company":"Playtika","career_page":"https://www.playtika.com/careers/","country":"Israel"},
{"company":"Playrix","career_page":"https://playrix.com/en/careers","country":"Ireland"},
{"company":"Moon Active","career_page":"https://moonactive.com/careers/","country":"Israel"},
{"company":"King","career_page":"https://careers.king.com/","country":"UK"},
{"company":"Zynga","career_page":"https://www.zynga.com/jobs/","country":"USA"},
{"company":"Niantic","career_page":"https://nianticlabs.com/careers","country":"USA"},
{"company":"Miniclip","career_page":"https://www.miniclip.com/careers","country":"Switzerland"},
{"company":"Gameloft","career_page":"https://www.gameloft.com/en/jobs","country":"France"},
{"company":"Dream11","career_page":"https://careers.dreamsports.group/","country":"India"},
{"company":"Nazara Technologies","career_page":"https://nazara.com/careers/","country":"India"},
{"company":"Moonfrog Labs","career_page":"https://moonfroglabs.com/careers/","country":"India"},
{"company":"SuperGaming","career_page":"https://supergaming.com/careers/","country":"India"},
{"company":"99Games","career_page":"https://99games.in/careers/","country":"India"},
{"company":"JetSynthesys","career_page":"https://jetsynthesys.com/careers/","country":"India"},
{"company":"Larian Studios","career_page":"https://larian.com/careers","country":"Belgium"},
{"company":"Remedy Entertainment","career_page":"https://www.remedygames.com/careers/","country":"Finland"},
{"company":"IO Interactive","career_page":"https://ioi.dk/careers","country":"Denmark"},
{"company":"Techland","career_page":"https://techland.net/job-offers","country":"Poland"},
{"company":"Behaviour Interactive","career_page":"https://www.bhvr.com/careers/","country":"Canada"},
{"company":"Digital Extremes","career_page":"https://www.digitalextremes.com/careers","country":"Canada"},
{"company":"Grinding Gear Games","career_page":"https://www.grindinggear.com/?page=careers","country":"New Zealand"},
{"company":"People Can Fly","career_page":"https://peoplecanfly.com/careers","country":"Poland"},
{"company":"11 bit studios","career_page":"https://11bitstudios.com/careers/","country":"Poland"},
{"company":"Tencent Games","career_page":"https://careers.tencent.com/","country":"China"},
{"company":"NetEase Games","career_page":"https://careers.netease.com/","country":"China"},
{"company":"Wargaming","career_page":"https://wargaming.com/en/careers/","country":"Cyprus"},
{"company":"Crytek","career_page":"https://www.crytek.com/career","country":"Germany"},
{"company":"Frontier Developments","career_page":"https://www.frontier.co.uk/careers","country":"UK"},
{"company":"Creative Assembly","career_page":"https://www.creative-assembly.com/careers","country":"UK"},
{"company":"Respawn Entertainment","career_page":"https://www.respawn.com/careers","country":"USA"},
{"company":"Insomniac Games","career_page":"https://insomniac.games/careers/","country":"USA"},
{"company":"Naughty Dog","career_page":"https://www.naughtydog.com/careers","country":"USA"},
{"company":"Guerrilla Games","career_page":"https://www.guerrilla-games.com/join","country":"Netherlands"},
{"company":"Obsidian Entertainment","career_page":"https://www.obsidian.net/careers","country":"USA"},
{"company":"Playground Games","career_page":"https://playground-games.com/careers/","country":"UK"},
{"company":"Rare","career_page":"https://rare.co.uk/careers/","country":"UK"},
{"company":"Mojang Studios","career_page":"https://careers.microsoft.com/","country":"Sweden"},
];

const ROLES = ["Product Manager","Senior Product Manager","Product Lead","Growth Product Manager","LiveOps Product Manager","Associate Product Manager","Principal Product Manager","Product Manager, Monetization","Product Manager, Player Experience","Product Manager, Platform","Senior Product Manager, LiveOps","Product Manager, Game Economy"];
const LOCS = ["San Francisco, CA","Los Angeles, CA","Seattle, WA","Austin, TX","New York, NY","Remote (US)","London, UK","Helsinki, Finland","Tokyo, Japan","Singapore","Montreal, Canada","Berlin, Germany","Warsaw, Poland","Seoul, South Korea","Shanghai, China","Bangalore, India","Stockholm, Sweden","Remote (Global)","Paris, France","Irvine, CA","Bellevue, WA","Dublin, Ireland","Copenhagen, Denmark","Toronto, Canada"];
const SKILLS_ALL = ["A/B Testing","Agile/Scrum","Analytics & Data","Competitive Analysis","Cross-functional Leadership","Customer Research","Data-Driven Decisions","Feature Prioritization","F2P Monetization","Game Design","Game Economy Design","Go-to-Market","Growth Hacking","KPI Definition","LiveOps","Market Research","Metrics & Analytics","Mobile Gaming","Monetization Strategy","PC/Console Gaming","Player Engagement","Player Retention","Product Roadmapping","Product Strategy","Revenue Optimization","SQL","Stakeholder Management","Technical PM","UX Research","User Acquisition","User Segmentation"];

function seeded(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function genJobs(n=140){const r=seeded(42),j=[];const td=new Date();for(let i=0;i<n;i++){const c=COMPANIES[~~(r()*COMPANIES.length)],role=ROLES[~~(r()*ROLES.length)],loc=LOCS[~~(r()*LOCS.length)],da=~~(r()*30),d=new Date(td);d.setDate(d.getDate()-da);const sk=[];const sh=[...SKILLS_ALL].sort(()=>r()-.5);for(let j=0;j<4+~~(r()*4);j++)sk.push(sh[j]);j.push({id:`j${i}`,title:role,co:c.company,loc,country:c.country,url:c.career_page,date:d.toISOString().split("T")[0],src:r()>.4?"Career Page":r()>.5?"LinkedIn":"Indeed",remote:loc.includes("Remote"),skills:sk,isNew:da===0})}return j.sort((a,b)=>b.date.localeCompare(a.date))}

const IQ=[
{co:"Riot Games",q:"How would you prioritize features for a new champion release in League of Legends?",cat:"Prioritization",src:"Glassdoor",diff:"Medium",votes:47},
{co:"Riot Games",q:"Describe how you'd measure success of a LiveOps event. What metrics matter?",cat:"Metrics",src:"Exponent",diff:"Medium",votes:35},
{co:"Riot Games",q:"A popular game mode's DAU is declining 5% WoW. Walk through your investigation.",cat:"Case Study",src:"Reddit r/PMinterviews",diff:"Hard",votes:62},
{co:"Riot Games",q:"How do you balance player satisfaction with monetization in a free-to-play game?",cat:"Strategy",src:"Blind",diff:"Hard",votes:54},
{co:"Riot Games",q:"Tell me about a time you used data to overrule a stakeholder's opinion.",cat:"Behavioral",src:"Glassdoor",diff:"Medium",votes:28},
{co:"Riot Games",q:"Design a battle pass system for Valorant from scratch. What progression curves would you use?",cat:"Product Design",src:"RocketBlocks",diff:"Hard",votes:71},
{co:"Riot Games",q:"How would you improve new player onboarding for League of Legends?",cat:"Player Psychology",src:"Indeed",diff:"Medium",votes:39},
{co:"Riot Games",q:"What framework would you use to decide between investing in anti-cheat vs new content?",cat:"Prioritization",src:"Product Manager HQ",diff:"Hard",votes:43},
{co:"Riot Games",q:"Design the social system for a new competitive team-based game at Riot.",cat:"Product Design",src:"Medium",diff:"Hard",votes:33},
{co:"Supercell",q:"How would you decide whether to kill a game in soft launch?",cat:"Strategy",src:"Glassdoor",diff:"Hard",votes:88},
{co:"Supercell",q:"Design a retention loop for a mobile game's first 7-day experience.",cat:"Product Design",src:"Exponent",diff:"Hard",votes:65},
{co:"Supercell",q:"How do you measure the health of a live game's virtual economy?",cat:"Game Economy",src:"RocketBlocks",diff:"Hard",votes:57},
{co:"Supercell",q:"Walk me through A/B testing a major UI change in a live mobile game.",cat:"Metrics",src:"Reddit r/ProductManagement",diff:"Medium",votes:42},
{co:"Supercell",q:"How would you improve Clash Royale's matchmaking without hurting queue times?",cat:"Case Study",src:"Blind",diff:"Hard",votes:51},
{co:"Supercell",q:"Estimate the revenue impact of adding a new rarity tier to Brawl Stars.",cat:"Case Study",src:"Interview Query",diff:"Hard",votes:38},
{co:"Supercell",q:"What is your philosophy on pay-to-win vs pay-to-progress in mobile games?",cat:"Strategy",src:"Medium",diff:"Medium",votes:44},
{co:"Electronic Arts",q:"How would you approach launching a new mode in EA Sports FC Ultimate Team?",cat:"Product Design",src:"Glassdoor",diff:"Hard",votes:52},
{co:"Electronic Arts",q:"Describe your framework for evaluating whether a feature is worth building.",cat:"Strategy",src:"Exponent",diff:"Medium",votes:36},
{co:"Electronic Arts",q:"How do you handle conflicting priorities between game design and business metrics?",cat:"Behavioral",src:"Indeed",diff:"Medium",votes:31},
{co:"Electronic Arts",q:"Design a player engagement system that increases D30 retention for a sports game.",cat:"Product Design",src:"RocketBlocks",diff:"Hard",votes:48},
{co:"Electronic Arts",q:"How would you analyze and reduce churn in a subscription-based game service?",cat:"Case Study",src:"Reddit r/PMinterviews",diff:"Hard",votes:55},
{co:"Epic Games",q:"How would you approach the product strategy for the Unreal Marketplace?",cat:"Strategy",src:"Glassdoor",diff:"Hard",votes:61},
{co:"Epic Games",q:"Describe how you'd measure success of a Fortnite brand collaboration event.",cat:"Metrics",src:"Exponent",diff:"Medium",votes:44},
{co:"Epic Games",q:"The Epic Games Store needs to compete with Steam. What's your 1-year product roadmap?",cat:"Case Study",src:"Blind",diff:"Hard",votes:73},
{co:"Epic Games",q:"Design a creator monetization system for Fortnite user-generated content.",cat:"Product Design",src:"RocketBlocks",diff:"Hard",votes:56},
{co:"Epic Games",q:"How would you decide which Unreal Engine features to prioritize for indie devs?",cat:"Prioritization",src:"Game Developer",diff:"Medium",votes:31},
{co:"Roblox",q:"How would you improve game discovery on the Roblox platform?",cat:"Product Design",src:"Glassdoor",diff:"Hard",votes:58},
{co:"Roblox",q:"Design a safety feature for young players that doesn't hurt engagement.",cat:"Product Design",src:"Exponent",diff:"Hard",votes:67},
{co:"Roblox",q:"How would you measure health of the Roblox developer ecosystem?",cat:"Metrics",src:"Levels.fyi",diff:"Medium",votes:41},
{co:"Roblox",q:"Roblox wants to expand to older demographics. What's your product strategy?",cat:"Case Study",src:"Reddit r/ProductManagement",diff:"Hard",votes:49},
{co:"Ubisoft",q:"How would you design a post-launch content roadmap for an open-world game?",cat:"Strategy",src:"Glassdoor",diff:"Hard",votes:43},
{co:"Ubisoft",q:"Prioritize a backlog of 50+ feature requests from players. Walk me through it.",cat:"Prioritization",src:"AmbitionBox",diff:"Medium",votes:37},
{co:"Ubisoft",q:"How do you incorporate player feedback into the roadmap without bias?",cat:"Behavioral",src:"Indeed",diff:"Medium",votes:29},
{co:"Ubisoft",q:"How would you evaluate whether a game should go free-to-play vs premium?",cat:"Strategy",src:"Medium",diff:"Hard",votes:52},
{co:"CD Projekt Red",q:"How would you plan the DLC roadmap for a single-player RPG?",cat:"Strategy",src:"Glassdoor",diff:"Hard",votes:55},
{co:"CD Projekt Red",q:"Cyberpunk 2077 had a rocky launch. As PM, what's your recovery plan?",cat:"Case Study",src:"Blind",diff:"Hard",votes:78},
{co:"CD Projekt Red",q:"How do you balance fan expectations with the need to innovate?",cat:"Strategy",src:"Game Developer",diff:"Hard",votes:63},
{co:"Bungie",q:"Design a seasonal content model for a live-service shooter.",cat:"Product Design",src:"Glassdoor",diff:"Hard",votes:47},
{co:"Bungie",q:"How do you balance player engagement without causing burnout in a live game?",cat:"Player Psychology",src:"Exponent",diff:"Hard",votes:59},
{co:"Bungie",q:"The player economy has inflation. How do you fix it without angering the community?",cat:"Game Economy",src:"Blind",diff:"Hard",votes:66},
{co:"Tencent Games",q:"How would you localize a Western game for the Chinese market?",cat:"Strategy",src:"Glassdoor",diff:"Hard",votes:42},
{co:"Tencent Games",q:"How do regulatory restrictions in China affect your product roadmap?",cat:"Strategy",src:"LinkedIn",diff:"Hard",votes:51},
{co:"Nexon",q:"Design a gacha system that feels fair to players.",cat:"Game Economy",src:"Glassdoor",diff:"Hard",votes:54},
{co:"Nexon",q:"What metrics would you track for a Korean MMORPG's live operations?",cat:"LiveOps",src:"AmbitionBox",diff:"Medium",votes:31},
{co:"Krafton",q:"PUBG Mobile engagement is declining in India. What's your turnaround strategy?",cat:"Case Study",src:"AmbitionBox",diff:"Hard",votes:47},
{co:"King",q:"Design a new social feature for Candy Crush to improve D7 retention.",cat:"Product Design",src:"Glassdoor",diff:"Medium",votes:43},
{co:"King",q:"How do you decide when a casual game needs new content vs mechanic improvements?",cat:"Prioritization",src:"Indeed",diff:"Medium",votes:29},
{co:"Niantic",q:"How would you increase outdoor play sessions in Pokémon GO during winter?",cat:"Case Study",src:"Glassdoor",diff:"Hard",votes:61},
{co:"Niantic",q:"Design an AR feature that bridges digital and physical gaming experience.",cat:"Product Design",src:"Medium",diff:"Hard",votes:48},
{co:"Playtika",q:"How would you optimize the FTUE funnel for a social casino game?",cat:"Player Psychology",src:"Glassdoor",diff:"Medium",votes:34},
{co:"Dream11",q:"Design a fantasy sports feature that increases engagement during IPL season.",cat:"Product Design",src:"AmbitionBox",diff:"Medium",votes:52},
{co:"Dream11",q:"What metrics define success for a fantasy sports platform?",cat:"Metrics",src:"Glassdoor",diff:"Medium",votes:38},
{co:"Dream11",q:"How would you reduce CAC while maintaining user quality?",cat:"Strategy",src:"LinkedIn",diff:"Hard",votes:44},
{co:"Nazara Technologies",q:"How would you approach the gaming market in Tier 2/3 Indian cities?",cat:"Strategy",src:"AmbitionBox",diff:"Medium",votes:31},
{co:"SuperGaming",q:"How would you grow a battle royale game in the Indian market?",cat:"Strategy",src:"AmbitionBox",diff:"Medium",votes:27},
{co:"Larian Studios",q:"How did BG3's Early Access model affect product decisions? What would you change?",cat:"Strategy",src:"Reddit r/gamedev",diff:"Hard",votes:72},
{co:"Larian Studios",q:"Measure player satisfaction in a complex RPG with branching narratives.",cat:"Metrics",src:"Game Developer",diff:"Hard",votes:49},
{co:"Insomniac Games",q:"Plan post-launch content strategy for a AAA single-player game.",cat:"Strategy",src:"Glassdoor",diff:"Hard",votes:45},
{co:"General",q:"Game's ARPU is increasing but DAU decreasing. Is this good or bad? What do you do?",cat:"Case Study",src:"Case Study Collection",diff:"Hard",votes:91},
{co:"General",q:"Design a loot box economy for a new hero shooter. How do you make it ethical?",cat:"Game Economy",src:"Case Study Collection",diff:"Hard",votes:84},
{co:"General",q:"Walk me through planning a 12-month LiveOps calendar for a mobile game.",cat:"LiveOps",src:"Case Study Collection",diff:"Hard",votes:69},
{co:"General",q:"Framework for deciding between building new features vs fixing technical debt?",cat:"Prioritization",src:"Case Study Collection",diff:"Medium",votes:73},
{co:"General",q:"Structure an experiment to test a new monetization model.",cat:"Metrics",src:"Case Study Collection",diff:"Hard",votes:58},
{co:"General",q:"The game has a toxic community problem. What's your product-led solution?",cat:"Player Psychology",src:"Case Study Collection",diff:"Hard",votes:77},
{co:"General",q:"How do you build a product culture inside a game studio that's historically design-led?",cat:"Behavioral",src:"Case Study Collection",diff:"Hard",votes:63},
{co:"General",q:"Design an in-game event system that non-engineers can configure.",cat:"Technical",src:"Case Study Collection",diff:"Hard",votes:47},
{co:"General",q:"How would you approach building a companion app for a live-service game?",cat:"Product Design",src:"Case Study Collection",diff:"Medium",votes:56},
{co:"General",q:"Estimate how many gaming PMs are hired globally each year.",cat:"Case Study",src:"Case Study Collection",diff:"Medium",votes:42},
];

const SRC_META={
"Glassdoor":{c:"#0caa41",r:"High"},"AmbitionBox":{c:"#ff6f20",r:"High"},"Indeed":{c:"#2164f3",r:"High"},"Levels.fyi":{c:"#38b2ac",r:"High"},"Blind":{c:"#00b4d8",r:"Medium"},"Reddit r/PMinterviews":{c:"#ff4500",r:"Medium"},"Reddit r/ProductManagement":{c:"#ff4500",r:"Medium"},"Reddit r/gamedev":{c:"#ff4500",r:"Medium"},"Exponent":{c:"#6c5ce7",r:"Very High"},"RocketBlocks":{c:"#e84393",r:"Very High"},"Product Manager HQ":{c:"#fdcb6e",r:"High"},"Interview Query":{c:"#00cec9",r:"High"},"Game Developer":{c:"#d63031",r:"High"},"LinkedIn":{c:"#0077b5",r:"Medium"},"Medium":{c:"#888",r:"Medium"},"Case Study Collection":{c:"#22c55e",r:"Curated"},
};
const CAT_C={"Product Design":"#f97316","Metrics":"#3b82f6","Strategy":"#22c55e","Behavioral":"#a855f7","Case Study":"#eab308","Technical":"#06b6d4","Game Economy":"#ef4444","LiveOps":"#14b8a6","Player Psychology":"#ec4899","Prioritization":"#f43f5e","General":"#6b7280"};
const DIFF_C={"Easy":"#22c55e","Medium":"#eab308","Hard":"#ef4444"};
const STATUSES=["Not Applied","Applied","Interview","Offer","Rejected"];
const ST_C={"Not Applied":"#6b7280","Applied":"#3b82f6","Interview":"#eab308","Offer":"#22c55e","Rejected":"#ef4444"};

export default function App(){
const [tab,setTab]=useState("dashboard");
const [jobs]=useState(()=>genJobs(140));
const [apps,setApps]=useState({});
const [bmarks,setBmarks]=useState({});
const [sq,setSq]=useState("");
const [fc,setFc]=useState("");
const [fl,setFl]=useState("");
const [fr,setFr]=useState(false);
const [fs,setFs]=useState("");
const today=new Date().toISOString().split("T")[0];
const newToday=jobs.filter(j=>j.date===today);
const filtered=useMemo(()=>jobs.filter(j=>{
if(sq&&!j.title.toLowerCase().includes(sq.toLowerCase())&&!j.co.toLowerCase().includes(sq.toLowerCase()))return false;
if(fc&&j.co!==fc)return false;if(fl&&!j.loc.toLowerCase().includes(fl.toLowerCase()))return false;
if(fr&&!j.remote)return false;if(fs&&j.src!==fs)return false;return true;
}),[jobs,sq,fc,fl,fr,fs]);
const uCos=useMemo(()=>[...new Set(jobs.map(j=>j.co))].sort(),[jobs]);
const toggleBm=useCallback(id=>setBmarks(p=>{const n={...p};n[id]?delete n[id]:n[id]=true;return n}),[]);
const setAppStatus=useCallback((id,s)=>setApps(p=>({...p,[id]:s})),[]);

const S={bg:"#08080d",bg2:"#0f0f18",bg3:"#161622",accent:"#22c55e",accent2:"#16a34a",txt:"#e2e2ea",txt2:"#9898a8",txt3:"#55556a",bdr:"rgba(255,255,255,0.06)"};
const tabs=[
{id:"dashboard",label:"Dashboard",ico:"M3 3v18h18M7 16l4-8 4 4 4-10"},
{id:"jobs",label:"Jobs",ico:"M2 7h20v14H2zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"},
{id:"companies",label:"Companies",ico:"M4 2h16v20H4zM9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"},
{id:"tracker",label:"Tracker",ico:"M8 2h8v4H8zM16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"},
{id:"interviews",label:"Interview Prep",ico:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z"},
{id:"insights",label:"AI Insights",ico:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18ZM12 5v13"},
{id:"alerts",label:"Alerts",ico:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"},
];
const Ico=({d,sz=16})=><svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;

return(<div style={{fontFamily:"'SF Mono','Fira Code','JetBrains Mono',ui-monospace,monospace",background:S.bg,color:S.txt,minHeight:"100vh",position:"relative"}}>
<div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(34,197,94,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
<div style={{position:"fixed",top:-300,right:-200,width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,197,94,0.06),transparent 70%)",zIndex:0,pointerEvents:"none"}}/>
<div style={{position:"relative",zIndex:1,display:"flex",minHeight:"100vh"}}>

{/* Sidebar */}
<nav style={{width:210,flexShrink:0,background:"rgba(12,12,20,0.97)",borderRight:`1px solid ${S.bdr}`,padding:"16px 0",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",backdropFilter:"blur(20px)"}}>
<div style={{padding:"0 16px 20px",borderBottom:`1px solid ${S.bdr}`}}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${S.accent},${S.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 20px rgba(34,197,94,0.3)`}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>
</div>
<div><div style={{fontSize:13,fontWeight:700,color:S.accent,letterSpacing:2}}>GAMEPM</div><div style={{fontSize:9,color:S.txt3,letterSpacing:3}}>RADAR</div></div>
</div></div>
<div style={{flex:1,padding:"8px 6px",display:"flex",flexDirection:"column",gap:1}}>
{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:6,border:"none",background:tab===t.id?"rgba(34,197,94,0.08)":"transparent",color:tab===t.id?S.accent:S.txt2,cursor:"pointer",fontSize:11,fontFamily:"inherit",textAlign:"left",width:"100%",borderLeft:tab===t.id?`2px solid ${S.accent}`:"2px solid transparent",transition:"all 0.15s"}}><Ico d={t.ico}/>{t.label}</button>)}
</div>
<div style={{padding:"12px 16px",borderTop:`1px solid ${S.bdr}`,fontSize:9,color:S.txt3}}>
<div>v1.0 — {COMPANIES.length} companies</div><div>Last scan: {today}</div>
</div></nav>

{/* Main */}
<main style={{flex:1,minWidth:0,padding:"20px 24px",maxWidth:1050}}>
{tab==="dashboard"&&<Dashboard jobs={jobs} newToday={newToday} apps={apps} S={S} setTab={setTab}/>}
{tab==="jobs"&&<Jobs jobs={filtered} allJobs={jobs} sq={sq} setSq={setSq} fc={fc} setFc={setFc} fl={fl} setFl={setFl} fr={fr} setFr={setFr} fs={fs} setFs={setFs} uCos={uCos} bmarks={bmarks} toggleBm={toggleBm} apps={apps} setAppStatus={setAppStatus} S={S}/>}
{tab==="companies"&&<Cos companies={COMPANIES} jobs={jobs} S={S}/>}
{tab==="tracker"&&<Tracker jobs={jobs} apps={apps} setAppStatus={setAppStatus} bmarks={bmarks} S={S}/>}
{tab==="interviews"&&<Interviews S={S}/>}
{tab==="insights"&&<Insights jobs={jobs} S={S}/>}
{tab==="alerts"&&<Alerts jobs={jobs} newToday={newToday} S={S} today={today}/>}
</main></div></div>)}

const Inp=({v,set,ph,S})=><input value={v} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",padding:"9px 12px",background:S.bg2,border:`1px solid ${S.bdr}`,borderRadius:6,color:S.txt,fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>;
const Sel=({v,set,children,S})=><select value={v} onChange={e=>set(e.target.value)} style={{padding:"9px 12px",background:S.bg2,border:`1px solid ${S.bdr}`,borderRadius:6,color:S.txt,fontSize:11,fontFamily:"inherit",outline:"none",cursor:"pointer",minWidth:120}}>{children}</select>;
const Card=({children,S,style={}})=><div style={{background:S.bg2,border:`1px solid ${S.bdr}`,borderRadius:10,padding:16,...style}}>{children}</div>;
const Badge=({text,color,sm})=><span style={{fontSize:sm?8:9,padding:sm?"1px 5px":"2px 7px",borderRadius:3,fontWeight:600,background:color+"18",color}}>{text}</span>;
const StatCard=({label,value,color,S})=><Card S={S}><div style={{fontSize:10,color:S.txt3,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{label}</div><div style={{fontSize:28,fontWeight:700,color,lineHeight:1}}>{value}</div></Card>;

function Dashboard({jobs,newToday,apps,S,setTab}){
const topCos=useMemo(()=>{const c={};jobs.forEach(j=>c[j.co]=(c[j.co]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8)},[jobs]);
const topLocs=useMemo(()=>{const c={};jobs.forEach(j=>c[j.loc]=(c[j.loc]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,6)},[jobs]);
const mx=topCos[0]?topCos[0][1]:1;
const applied=Object.values(apps).filter(s=>s&&s!=="Not Applied").length;
return(<div>
<h1 style={{fontSize:24,fontWeight:700,color:"#fff",margin:"0 0 4px",letterSpacing:-.5}}>Command center</h1>
<p style={{color:S.txt3,margin:"0 0 20px",fontSize:12}}>Gaming PM job market intelligence</p>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:24}}>
<StatCard label="Total jobs" value={jobs.length} color={S.accent} S={S}/>
<StatCard label="New today" value={newToday.length} color="#ef4444" S={S}/>
<StatCard label="Companies" value={COMPANIES.length} color="#3b82f6" S={S}/>
<StatCard label="Applied" value={applied} color="#eab308" S={S}/>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
<Card S={S}><div style={{fontSize:11,color:S.txt3,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Top hiring companies</div>
{topCos.map(([n,c],i)=><div key={n} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
<span style={{fontSize:10,color:S.txt3,width:14,textAlign:"right"}}>{i+1}</span>
<div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
<span style={{fontSize:11,color:"#ccc"}}>{n}</span><span style={{fontSize:10,color:S.accent}}>{c}</span></div>
<div style={{height:3,background:"rgba(255,255,255,0.04)",borderRadius:2,overflow:"hidden"}}>
<div style={{height:"100%",width:`${(c/mx)*100}%`,background:`linear-gradient(90deg,${S.accent},${S.accent2})`,borderRadius:2}}/></div></div></div>)}
</Card>
<Card S={S}><div style={{fontSize:11,color:S.txt3,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Hot locations</div>
{topLocs.map(([l,c])=><div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",marginBottom:4,background:"rgba(255,255,255,0.02)",borderRadius:6,border:`1px solid ${S.bdr}`}}>
<span style={{fontSize:11}}>{l}</span><span style={{fontSize:10,color:"#3b82f6",fontWeight:600}}>{c}</span></div>)}
</Card></div>
<Card S={S}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
<span style={{fontSize:11,color:S.txt3,textTransform:"uppercase",letterSpacing:1}}>Latest discoveries</span>
<button onClick={()=>setTab("jobs")} style={{background:"none",border:`1px solid rgba(34,197,94,0.2)`,color:S.accent,padding:"3px 10px",borderRadius:5,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>View all</button>
</div>
{jobs.slice(0,8).map(j=><div key={j.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",marginBottom:4,background:"rgba(255,255,255,0.015)",borderRadius:6,border:j.isNew?`1px solid rgba(34,197,94,0.15)`:`1px solid transparent`}}>
<div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
{j.isNew&&<Badge text="NEW" color={S.accent}/>}
<span style={{fontSize:11,color:"#fff",fontWeight:500}}>{j.title}</span>
<span style={{fontSize:10,color:S.txt3}}>at {j.co}</span>
</div><div style={{fontSize:10,color:S.txt3,flexShrink:0}}>{j.loc}</div></div>)}</Card>
</div>)}

function Jobs({jobs,allJobs,sq,setSq,fc,setFc,fl,setFl,fr,setFr,fs,setFs,uCos,bmarks,toggleBm,apps,setAppStatus,S}){
const [pg,setPg]=useState(0);const pp=18;const tp=Math.ceil(jobs.length/pp);const pj=jobs.slice(pg*pp,(pg+1)*pp);
useEffect(()=>setPg(0),[sq,fc,fl,fr,fs]);
return(<div>
<h1 style={{fontSize:24,fontWeight:700,color:"#fff",margin:"0 0 4px"}}>Job discovery</h1>
<p style={{color:S.txt3,margin:"0 0 16px",fontSize:12}}>{jobs.length} PM roles across {new Set(jobs.map(j=>j.co)).size} companies</p>
<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
<div style={{flex:"1 1 200px"}}><Inp v={sq} set={setSq} ph="Search roles or companies..." S={S}/></div>
<Sel v={fc} set={setFc} S={S}><option value="">All companies</option>{uCos.map(c=><option key={c}>{c}</option>)}</Sel>
<Sel v={fs} set={setFs} S={S}><option value="">All sources</option><option>Career Page</option><option>LinkedIn</option><option>Indeed</option></Sel>
<label style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:S.txt2,cursor:"pointer",padding:"0 10px",background:fr?"rgba(34,197,94,0.08)":S.bg2,border:fr?`1px solid rgba(34,197,94,0.25)`:`1px solid ${S.bdr}`,borderRadius:6}}>
<input type="checkbox" checked={fr} onChange={e=>setFr(e.target.checked)} style={{accentColor:S.accent}}/>Remote</label>
</div>
{pj.map(j=><Card key={j.id} S={S} style={{marginBottom:8,borderLeft:j.isNew?`2px solid ${S.accent}`:"2px solid transparent"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
<div style={{minWidth:0}}>
<div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
{j.isNew&&<Badge text="NEW" color={S.accent}/>}
<span style={{fontSize:13,fontWeight:600,color:"#fff"}}>{j.title}</span></div>
<div style={{fontSize:11,color:S.txt2,marginTop:3,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
<span style={{color:"#3b82f6"}}>{j.co}</span><span>{j.loc}</span><span style={{color:S.txt3}}>{j.date}</span>
<Badge text={j.src} color={S.txt3} sm/></div></div>
<div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
<button onClick={()=>toggleBm(j.id)} style={{background:"none",border:"none",cursor:"pointer",color:bmarks[j.id]?"#eab308":S.txt3,padding:2,fontSize:14}}>{bmarks[j.id]?"★":"☆"}</button>
<a href={j.url} target="_blank" rel="noopener noreferrer" style={{color:S.accent,fontSize:11,textDecoration:"none"}}>Apply →</a></div></div>
<div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:8}}>
{j.skills.slice(0,5).map(s=><Badge key={s} text={s} color={S.accent} sm/>)}</div>
<div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
{STATUSES.map(s=><button key={s} onClick={()=>setAppStatus(j.id,s)} style={{fontSize:9,padding:"2px 8px",borderRadius:3,cursor:"pointer",fontFamily:"inherit",background:apps[j.id]===s?ST_C[s]+"18":"transparent",border:apps[j.id]===s?`1px solid ${ST_C[s]}`:`1px solid ${S.bdr}`,color:apps[j.id]===s?ST_C[s]:S.txt3}}>{s}</button>)}</div>
</Card>)}
{tp>1&&<div style={{display:"flex",justifyContent:"center",gap:8,marginTop:16}}>
<button onClick={()=>setPg(Math.max(0,pg-1))} disabled={pg===0} style={pbtn(pg===0,S)}>Prev</button>
<span style={{fontSize:11,color:S.txt3,padding:"6px 10px"}}>Page {pg+1} of {tp}</span>
<button onClick={()=>setPg(Math.min(tp-1,pg+1))} disabled={pg>=tp-1} style={pbtn(pg>=tp-1,S)}>Next</button></div>}
</div>)}

function Cos({companies,jobs,S}){
const [s,setS]=useState("");const [cf,setCf]=useState("");
const countries=useMemo(()=>[...new Set(companies.map(c=>c.country))].sort(),[companies]);
const jc=useMemo(()=>{const c={};jobs.forEach(j=>c[j.co]=(c[j.co]||0)+1);return c},[jobs]);
const f=companies.filter(c=>{if(s&&!c.company.toLowerCase().includes(s.toLowerCase()))return false;if(cf&&c.country!==cf)return false;return true});
return(<div>
<h1 style={{fontSize:24,fontWeight:700,color:"#fff",margin:"0 0 4px"}}>Company database</h1>
<p style={{color:S.txt3,margin:"0 0 16px",fontSize:12}}>{companies.length} gaming companies tracked worldwide</p>
<div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
<div style={{flex:"1 1 200px"}}><Inp v={s} set={setS} ph="Search companies..." S={S}/></div>
<Sel v={cf} set={setCf} S={S}><option value="">All countries</option>{countries.map(c=><option key={c}>{c}</option>)}</Sel>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:10}}>
{f.map(c=><Card key={c.company} S={S}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
<div><div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:3}}>{c.company}</div>
<div style={{fontSize:10,color:S.txt3}}>{c.country}</div></div>
{jc[c.company]&&<Badge text={`${jc[c.company]} PM roles`} color={S.accent}/>}</div>
<a href={c.career_page} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:10,fontSize:10,color:"#3b82f6",textDecoration:"none"}}>Career page →</a>
</Card>)}</div></div>)}

function Tracker({jobs,apps,setAppStatus,bmarks,S}){
const [vs,setVs]=useState("Applied");
const tracked=jobs.filter(j=>apps[j.id]&&apps[j.id]!=="Not Applied");
const sj=tracked.filter(j=>apps[j.id]===vs);
return(<div>
<h1 style={{fontSize:24,fontWeight:700,color:"#fff",margin:"0 0 4px"}}>Application tracker</h1>
<p style={{color:S.txt3,margin:"0 0 16px",fontSize:12}}>Track your gaming PM applications</p>
<div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
{STATUSES.filter(s=>s!=="Not Applied").map(s=>{const cnt=tracked.filter(j=>apps[j.id]===s).length;
return <button key={s} onClick={()=>setVs(s)} style={{flex:"1 1 100px",padding:12,borderRadius:8,cursor:"pointer",fontFamily:"inherit",textAlign:"center",background:vs===s?ST_C[s]+"12":S.bg2,border:vs===s?`1px solid ${ST_C[s]}30`:`1px solid ${S.bdr}`}}>
<div style={{fontSize:22,fontWeight:700,color:ST_C[s]}}>{cnt}</div>
<div style={{fontSize:10,color:S.txt2,marginTop:2}}>{s}</div></button>})}</div>
<Card S={S}><div style={{fontSize:11,color:ST_C[vs],marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>{vs} ({sj.length})</div>
{sj.length===0?<div style={{textAlign:"center",padding:30,color:S.txt3,fontSize:12}}>No jobs here yet. Mark jobs from the Jobs tab.</div>:
sj.map(j=><div key={j.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",marginBottom:4,background:"rgba(255,255,255,0.015)",borderRadius:6}}>
<div><div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{j.title}</div><div style={{fontSize:10,color:S.txt3,marginTop:1}}>{j.co} — {j.loc}</div></div>
<div style={{display:"flex",gap:3}}>
{STATUSES.filter(s=>s!=="Not Applied").map(s=><button key={s} onClick={()=>setAppStatus(j.id,s)} title={s} style={{width:22,height:22,borderRadius:3,border:"none",cursor:"pointer",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",background:apps[j.id]===s?ST_C[s]:"rgba(255,255,255,0.04)",color:apps[j.id]===s?"#000":S.txt3}}>{s[0]}</button>)}</div></div>)}</Card></div>)}

function Interviews({S}){
const [co,setCo]=useState("All");
const [cat,setCat]=useState("All");
const [src,setSrc]=useState("All");
const [diff,setDiff]=useState("All");
const [sq,setSq]=useState("");
const [sort,setSort]=useState("votes");
const [exp,setExp]=useState(null);
const [practice,setPractice]=useState(false);
const [pi,setPi]=useState(0);
const [showSrc,setShowSrc]=useState(false);

const cos=useMemo(()=>["All",...new Set(IQ.map(q=>q.co))].sort((a,b)=>a==="All"?-1:b==="All"?1:a.localeCompare(b)),[]);
const cats=useMemo(()=>["All",...new Set(IQ.map(q=>q.cat))]
,[]);
const srcs=useMemo(()=>["All",...new Set(IQ.map(q=>q.src))]
,[]);

const filtered=useMemo(()=>{
let qs=IQ.filter(q=>{
if(co!=="All"&&q.co!==co)return false;if(cat!=="All"&&q.cat!==cat)return false;
if(src!=="All"&&q.src!==src)return false;if(diff!=="All"&&q.diff!==diff)return false;
if(sq&&!q.q.toLowerCase().includes(sq.toLowerCase()))return false;return true;
});
if(sort==="votes")qs.sort((a,b)=>b.votes-a.votes);
else qs.sort((a,b)=>(a.diff==="Hard"?0:a.diff==="Medium"?1:2)-(b.diff==="Hard"?0:b.diff==="Medium"?1:2));
return qs;
},[co,cat,src,diff,sq,sort]);

const pqs=useMemo(()=>[...filtered].sort(()=>Math.random()-.5),[filtered]);

const tips={"Product Design":"Use CIRCLES: Comprehend → Identify user → List use cases → Rank → Create solutions → List tradeoffs → Evaluate.",
"Metrics":"Structure with HEART: Happiness → Engagement → Adoption → Retention → Task success. Tie metrics to business.",
"Strategy":"Define goal → Analyze constraints → Generate options → Evaluate tradeoffs → Recommend with data.",
"Behavioral":"Use STAR: Situation → Task → Action → Result. Quantify impact.",
"Case Study":"Clarify → Segment → Hypothesize → Prioritize → Propose → Measure.",
"Game Economy":"Think: Currency sinks/faucets → Inflation controls → Player segments → Fairness → Sustainability.",
"LiveOps":"Content cadence → Player segmentation → Event design → Data loops → Resource allocation.",
"Player Psychology":"Intrinsic/extrinsic motivation → Flow state → Variable rewards → Social proof → Loss aversion.",
"Prioritization":"Use RICE (Reach × Impact × Confidence / Effort). Always justify with data.",
"Technical":"System constraints → Architecture choices → Scalability → Tradeoffs → Cross-team collaboration.",
"General":"Structure your answer. State approach, walk through thinking, conclude with recommendation."};

if(practice){
const pq=pqs[pi%pqs.length];
if(!pq){setPractice(false);return null;}
return(<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
<h1 style={{fontSize:24,fontWeight:700,color:"#fff",margin:0}}>Practice mode</h1>
<button onClick={()=>setPractice(false)} style={obtn(S)}>Exit practice</button></div>
<Card S={S} style={{textAlign:"center",padding:32}}>
<div style={{fontSize:10,color:S.txt3,marginBottom:12,letterSpacing:2}}>QUESTION {pi+1} OF {pqs.length}</div>
<div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:20}}>
<Badge text={pq.cat} color={CAT_C[pq.cat]||"#666"}/><Badge text={pq.diff} color={DIFF_C[pq.diff]||"#666"}/></div>
<div style={{fontSize:17,color:"#fff",lineHeight:1.6,maxWidth:600,margin:"0 auto 20px",fontWeight:500}}>{pq.q}</div>
<div style={{fontSize:11,color:S.txt3,marginBottom:8}}>{pq.co} via {pq.src}</div>
<div style={{fontSize:12,color:S.txt2,maxWidth:500,margin:"0 auto 24px",lineHeight:1.5,padding:"12px 16px",background:"rgba(255,255,255,0.02)",borderRadius:8,border:`1px solid ${S.bdr}`,textAlign:"left"}}>
<span style={{fontWeight:600,color:S.accent}}>Tip:</span> {tips[pq.cat]||tips.General}</div>
<div style={{display:"flex",justifyContent:"center",gap:10}}>
<button onClick={()=>setPi(p=>Math.max(0,p-1))} style={obtn(S)}>← Previous</button>
<button onClick={()=>setPi(p=>p+1)} style={{...obtn(S),background:"rgba(34,197,94,0.08)",borderColor:"rgba(34,197,94,0.25)",color:S.accent}}>Next →</button>
</div></Card></div>)}

return(<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
<div><h1 style={{fontSize:24,fontWeight:700,color:"#fff",margin:"0 0 4px"}}>Interview prep</h1>
<p style={{color:S.txt3,margin:0,fontSize:12}}>{IQ.length} questions from {new Set(IQ.map(q=>q.src)).size} sources across {new Set(IQ.map(q=>q.co)).size} companies</p></div>
<div style={{display:"flex",gap:6}}>
<button onClick={()=>setShowSrc(!showSrc)} style={obtn(S)}>{showSrc?"Hide":"Show"} sources</button>
<button onClick={()=>{setPractice(true);setPi(0)}} style={{...obtn(S),background:"rgba(34,197,94,0.08)",borderColor:"rgba(34,197,94,0.25)",color:S.accent}}>Practice mode</button>
</div></div>

{showSrc&&<Card S={S} style={{marginBottom:16}}>
<div style={{fontSize:11,color:S.txt3,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Data sources ({new Set(IQ.map(q=>q.src)).size} active)</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6}}>
{Object.entries(SRC_META).map(([name,info])=>{const cnt=IQ.filter(q=>q.src===name).length;if(!cnt)return null;
return <div key={name} onClick={()=>setSrc(src===name?"All":name)} style={{padding:"8px 10px",borderRadius:6,background:src===name?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.015)",border:src===name?`1px solid ${info.c}30`:`1px solid ${S.bdr}`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div><div style={{fontSize:10,color:"#ccc"}}>{name}</div><div style={{fontSize:8,color:S.txt3}}>{info.r} reliability</div></div>
<span style={{fontSize:11,color:info.c,fontWeight:600}}>{cnt}</span></div>})}</div></Card>}

<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8,marginBottom:16}}>
{[{l:"Total",v:IQ.length,c:S.accent},{l:"Companies",v:new Set(IQ.map(q=>q.co)).size,c:"#3b82f6"},{l:"Sources",v:new Set(IQ.map(q=>q.src)).size,c:"#f97316"},{l:"Case studies",v:IQ.filter(q=>q.cat==="Case Study").length,c:"#eab308"},{l:"Hard",v:IQ.filter(q=>q.diff==="Hard").length,c:"#ef4444"}].map((s,i)=>
<Card key={i} S={S} style={{textAlign:"center",padding:10}}><div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:S.txt3,marginTop:1}}>{s.l}</div></Card>)}</div>

<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
<div style={{flex:"1 1 180px"}}><Inp v={sq} set={setSq} ph="Search questions..." S={S}/></div>
<Sel v={co} set={setCo} S={S}>{cos.map(c=><option key={c}>{c==="All"?"All companies":c}</option>)}</Sel>
<Sel v={cat} set={setCat} S={S}>{cats.map(c=><option key={c}>{c==="All"?"All categories":c}</option>)}</Sel>
<Sel v={diff} set={setDiff} S={S}><option value="All">All difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option></Sel>
<Sel v={sort} set={setSort} S={S}><option value="votes">Most popular</option><option value="diff">Hardest first</option></Sel>
</div>

<div style={{fontSize:11,color:S.txt3,marginBottom:8}}>Showing {filtered.length} questions</div>

{filtered.map((q,i)=>{const si=SRC_META[q.src]||{c:"#666",r:"?"};const isExp=exp===i;
return <div key={i} onClick={()=>setExp(isExp?null:i)} style={{background:S.bg2,border:`1px solid ${S.bdr}`,borderRadius:8,padding:14,marginBottom:6,cursor:"pointer",borderLeft:`3px solid ${CAT_C[q.cat]||"#555"}`}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
<div style={{flex:1}}>
<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
<Badge text={q.cat} color={CAT_C[q.cat]||"#555"}/><Badge text={q.diff} color={DIFF_C[q.diff]||"#555"}/>
{q.co!=="General"&&<Badge text={q.co} color="#3b82f6"/>}</div>
<div style={{fontSize:12,color:S.txt,lineHeight:1.5}}>{q.q}</div></div>
<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,flexShrink:0}}>
<span style={{fontSize:13,fontWeight:700,color:q.votes>50?S.accent:S.txt3}}>{q.votes}</span>
<span style={{fontSize:7,color:S.txt3}}>votes</span></div></div>
<div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
<span style={{fontSize:10,color:si.c}}>{q.src}</span>
<span style={{fontSize:8,color:S.txt3}}>{si.r} reliability</span></div>
{isExp&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${S.bdr}`}}>
<div style={{fontSize:11,color:S.txt2,lineHeight:1.5,padding:"8px 12px",background:"rgba(255,255,255,0.02)",borderRadius:6}}>
<span style={{fontWeight:600,color:S.accent}}>Answer framework:</span> {tips[q.cat]||tips.General}</div></div>}
</div>})}</div>)}

function Insights({jobs,S}){
const skillCts=useMemo(()=>{const c={};jobs.forEach(j=>j.skills.forEach(s=>c[s]=(c[s]||0)+1));return Object.entries(c).sort((a,b)=>b[1]-a[1])},[jobs]);
const roleCts=useMemo(()=>{const c={};jobs.forEach(j=>c[j.title]=(c[j.title]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,10)},[jobs]);
const countryCts=useMemo(()=>{const c={};jobs.forEach(j=>c[j.country]=(c[j.country]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1])},[jobs]);
const remotePct=Math.round((jobs.filter(j=>j.remote).length/jobs.length)*100);
const mx=skillCts[0]?skillCts[0][1]:1;const mrole=roleCts[0]?roleCts[0][1]:1;
return(<div>
<h1 style={{fontSize:24,fontWeight:700,color:"#fff",margin:"0 0 4px"}}>AI job insights</h1>
<p style={{color:S.txt3,margin:"0 0 16px",fontSize:12}}>Trends from {jobs.length} gaming PM job descriptions</p>
<Card S={S} style={{marginBottom:20,background:"linear-gradient(135deg,rgba(34,197,94,0.06),rgba(59,130,246,0.06))",border:"1px solid rgba(34,197,94,0.12)"}}>
<div style={{fontSize:10,color:S.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Key insight</div>
<div style={{fontSize:13,color:S.txt,lineHeight:1.6}}>
<strong style={{color:"#fff"}}>F2P Monetization</strong> and <strong style={{color:"#fff"}}>LiveOps</strong> are the most demanded skills. {remotePct}% of roles offer remote work. USA and Japan lead in PM hiring volume, with senior-level roles dominating at major studios and growth/LiveOps PM roles trending at mobile-first companies.</div></Card>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
<Card S={S}><div style={{fontSize:11,color:S.txt3,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Most demanded skills</div>
{skillCts.slice(0,12).map(([s,c],i)=><div key={s} style={{marginBottom:6}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
<span style={{fontSize:10,color:"#ccc"}}>{s}</span><span style={{fontSize:9,color:S.txt3}}>{c}</span></div>
<div style={{height:4,background:"rgba(255,255,255,0.03)",borderRadius:2,overflow:"hidden"}}>
<div style={{height:"100%",width:`${(c/mx)*100}%`,background:`hsl(${150-i*8},70%,45%)`,borderRadius:2}}/></div></div>)}</Card>
<Card S={S}><div style={{fontSize:11,color:S.txt3,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Trending roles</div>
{roleCts.map(([r,c])=><div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",marginBottom:4,background:"rgba(255,255,255,0.015)",borderRadius:6}}>
<span style={{fontSize:10,color:"#ccc"}}>{r}</span>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<div style={{width:`${(c/mrole)*50}px`,height:3,background:"#3b82f6",borderRadius:2}}/>
<span style={{fontSize:10,color:"#3b82f6",fontWeight:600,minWidth:16,textAlign:"right"}}>{c}</span></div></div>)}</Card></div>
<Card S={S}><div style={{fontSize:11,color:S.txt3,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Hiring by country</div>
<div style={{display:"flex",flexWrap:"wrap",gap:6}}>
{countryCts.map(([c,n])=><div key={c} style={{padding:"8px 14px",borderRadius:6,background:"rgba(255,255,255,0.02)",border:`1px solid ${S.bdr}`,textAlign:"center"}}>
<div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{n}</div><div style={{fontSize:9,color:S.txt3,marginTop:1}}>{c}</div></div>)}</div></Card></div>)}

function Alerts({jobs,newToday,S,today}){
const recent=jobs.filter(j=>{const d=new Date(j.date);return(new Date()-d)/(864e5)<=3});
const careerOnly=jobs.filter(j=>j.src==="Career Page");
return(<div>
<h1 style={{fontSize:24,fontWeight:700,color:"#fff",margin:"0 0 4px"}}>Daily alerts</h1>
<p style={{color:S.txt3,margin:"0 0 16px",fontSize:12}}>Job notifications and hidden job detection</p>
<Card S={S} style={{marginBottom:16,background:"linear-gradient(135deg,rgba(34,197,94,0.05),rgba(34,197,94,0.01))",border:"1px solid rgba(34,197,94,0.12)"}}>
<div style={{fontSize:10,color:S.accent,textTransform:"uppercase",letterSpacing:2,marginBottom:2}}>Daily gaming PM jobs</div>
<div style={{fontSize:11,color:S.txt3,marginBottom:12}}>{today}</div>
{newToday.length===0?<div style={{color:S.txt3,fontSize:12}}>No new roles discovered today. Check back tomorrow!</div>:
newToday.map(j=><div key={j.id} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,marginBottom:4}}>
<span style={{color:S.accent}}>▸</span><span style={{color:"#fff",fontWeight:500}}>{j.title}</span>
<span style={{color:S.txt3}}>—</span><span style={{color:"#3b82f6"}}>{j.co}</span>
<span style={{color:S.txt3}}>—</span><span style={{color:S.txt2}}>{j.loc}</span></div>)}</Card>

<Card S={S} style={{marginBottom:16}}>
<div style={{fontSize:11,color:"#f97316",marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>Hidden job detector</div>
<p style={{fontSize:11,color:S.txt3,margin:"0 0 12px"}}>Roles found on career pages before they hit job boards</p>
{careerOnly.slice(0,6).map(j=><div key={j.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",marginBottom:4,background:"rgba(249,115,22,0.03)",borderRadius:6,border:"1px solid rgba(249,115,22,0.08)"}}>
<div><span style={{fontSize:11,color:"#fff",fontWeight:500}}>{j.title}</span>
<span style={{fontSize:10,color:S.txt3,marginLeft:8}}>{j.co}</span></div>
<Badge text="EARLY DETECT" color="#f97316"/></div>)}</Card>

<Card S={S}>
<div style={{fontSize:11,color:S.txt3,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Last 3 days ({recent.length} roles)</div>
{recent.slice(0,15).map(j=><div key={j.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",marginBottom:3,background:"rgba(255,255,255,0.015)",borderRadius:4}}>
<div style={{fontSize:11}}><span style={{color:"#fff"}}>{j.title}</span><span style={{color:S.txt3,marginLeft:8}}>{j.co}</span></div>
<span style={{fontSize:9,color:S.txt3}}>{j.date}</span></div>)}</Card></div>)}

const obtn=(S)=>({background:"none",border:`1px solid ${S.bdr}`,color:S.txt2,padding:"6px 12px",borderRadius:6,fontSize:11,cursor:"pointer",fontFamily:"inherit"});
const pbtn=(dis,S)=>({padding:"6px 14px",borderRadius:5,border:`1px solid ${S.bdr}`,background:dis?"transparent":"rgba(34,197,94,0.06)",color:dis?S.txt3:S.accent,cursor:dis?"default":"pointer",fontSize:11,fontFamily:"inherit"});
