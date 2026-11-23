// ===== FILM « MISSION ÉTOILE » (aventure spatiale, 2 min) =====
(function(){
const LOU=outline(["...wwwwwww...","..wvvvvvvvw..",".wvsssssssvw.",".wvsksssksvw.",".wvsssssssvw.",".wvvsmmmsvvw.","..wwwwwwwww..","...ooooooo...",".ooOOOOOOOoo.","oooOOyOOOOooo","oo.OOOOOOO.oo","oo.OOOOOOO.oo","ww.ooooooo.ww","...ooo.ooo...","...ooo.ooo...","...ooo.ooo...","..ddd...ddd.."]);
const LOUW=outline(["...wwwwwww..w","..wvvvvvvvwoo",".wvsssssssvoo",".wvsksssksvo.",".wvsssssssvw.",".wvvsmmmsvvw.","..wwwwwwwww..","...ooooooo...",".ooOOOOOOOo..","oooOOyOOOOo..","oo.OOOOOOO...","oo.OOOOOOO...","ww.ooooooo...","...ooo.ooo...","...ooo.ooo...","...ooo.ooo...","..ddd...ddd.."]);
const LP={k:'#1a1420',w:'#e8eef2',v:'#7fc8f0',s:'#f1c7a3',m:'#d98466',o:'#ff8a3d',O:'#ffb070',y:'#ffe14f',d:'#5a3a2a'};
const ZIG=outline(["....a.a....","....b.b....","...ggggg...","..gGGGGGg..",".gGGwwwGGg.",".gGwwkwwGg.",".gGGwwwGGg.",".gGGGGGGGg.",".gGGmmmGGg.","..gGGGGGg..","..gg...gg..",".ggg...ggg."]);
const ZP={k:'#10301a',a:'#3f9a4a',b:'#ff6fae',g:'#3fb860',G:'#7ce08a',w:'#ffffff',m:'#1a5a2a'};
const ROCK=outline(["......r......",".....rrr.....","....rrrrr....","...wwwwwww...","...wwwwwww...","..wwwbbbwww..","..wwbcccbww..","..wwbcccbww..","..wwwbbbwww..","..wwwwwwwww..","..wwwwwwwww..","..wwwrrrwww..","..wwwwwwwww..","..wwwwwwwww..",".rwwwwwwwwwr.","rrwwwwwwwwwrr","rr.wwwwwww.rr","r...ddddd...r","....d...d...."]);
const RP={k:'#1a1420',r:'#e0533d',w:'#e8eef2',b:'#8a96a6',c:'#5fd0f0',d:'#5a6070'};
const rot=rows=>rows[0].split('').map((_,i)=>rows.map(r=>r[i]).reverse().join(''));const ROCKH=rot(ROCK);
function flame(x,y,t,s,horiz){for(let i=0;i<10;i++){const l=(6+Math.random()*6)*s,c=i%3?'#ffb347':'#ffe14f';if(horiz)rect(x-l,y+(i%5)*s-2*s,l,s,c);else rect(x+(i%5)*s-2*s,y,s,l,c)}}
function smoke(cx,cy,t,k,n=14){const r=rnd(5);for(let i=0;i<n;i++){const a=r()*Math.PI*2,d=r()*40*k,s=4+r()*10*k;disc(cx+Math.cos(a)*d,cy-Math.abs(Math.sin(a))*d*.4,s,i%2?'#d8dde3':'#b9c1c9')}}
function S1(t){// pas de tir au crépuscule, compte à rebours, décollage
 const lift=clamp((t-18.5)/5.5),sh=t>17&&t<23?Math.round((Math.random()-.5)*3):0;X.save();X.translate(sh,0);
 sky(['#1a1440','#5a2a6a','#c05a5a','#ffa060'],0,150);stars(40,3,t,70);disc(60,120,10,'#ffd08a');rect(0,140,FW,40,'#2a2030');rect(0,140,FW,2,'#3a2a3a');
 for(let x=100;x<130;x+=4)line(x,140,x+4,40,'#5a5a6a');rect(110,40,4,100,'#6a6a7a');for(let y=50;y<140;y+=10)line(110,y,130,y+10,'#5a5a6a');rect(110,70,40,3,'#8a8a9a');
 const ry=140-57-lift*lift*200;spr(ROCK,140,ry,RP,false,3);if(t>17)smoke(160,140,t,clamp((t-17)/2),18);if(t>18.3)flame(158,ry+57,t,3);
 if(t<11){const k=ease((t-6)/4);spr(LOU,lerp(40,145,k),140-34,LP,false,2)}if(t>=15.5&&t<18.5){const n=3-Math.floor((t-15.5));text(String(Math.max(1,n)),150,20,'#ffe14f',4,'#000')}X.restore()}
function earth(x,y,r,t){disc(x,y,r+2,'#5fa8ff');disc(x,y,r,'#2a6ad8');const R=rnd(9);for(let i=0;i<7;i++){const a=R()*6.28+t*.05,d=R()*r*.7;disc(x+Math.cos(a)*d,y+Math.sin(a)*d*.6,r*.18,'#4fd16b')}for(let i=0;i<4;i++){const a=i*1.7+t*.1;disc(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.4,r*.12,'#ffffff')}}
function asteroid(x,y,s,c){disc(x,y,s,c);disc(x-s*.3,y-s*.3,s*.35,mix(c,'#ffffff',.2));disc(x+s*.3,y+s*.2,s*.25,mix(c,'#000000',.3))}
function S2(t){// voyage dans l'espace, champ d'astéroïdes
 const tt=t-24;rect(0,0,FW,FH,'#05030f');for(let l=0;l<3;l++){const R=rnd(l+3);for(let i=0;i<50;i++){const x=((R()*FW-tt*(10+l*30))%FW+FW)%FW,y=R()*FH;rect(x,y,1+l*(tt>2?2:0),1,l==2?'#ffffff':'#8f97c0')}}
 earth(60-tt*2,150+tt*2,Math.max(8,60-tt*3),t);const ry=80+Math.sin(tt*1.3)*8+(tt>9&&tt<16?Math.sin(tt*5)*16:0);flame(70,ry+19,t,2,true);spr(ROCKH,70,ry,RP,false,2);
 if(tt>9&&tt<17){const R=rnd(4);for(let i=0;i<9;i++){const x=FW+40-((tt-9)*70+R()*400)%460,y=R()*FH,s=4+R()*12;asteroid(x,y,s,['#7a6a5a','#8a8a8a','#6a5a5a'][i%3])}}
 if(tt>13.5&&tt<14.3){X.globalAlpha=.6;rect(0,0,FW,FH,'#ffffff');X.globalAlpha=1;for(let i=0;i<20;i++){const a=i/20*6.28,d=(tt-13.5)*60;rect(110+Math.cos(a)*d,ry+10+Math.sin(a)*d,2,2,'#ffb347')}}}
function alienGround(t,dust){sky(['#1a0a3a','#4a2a7a','#8a5ab0'],0,150);stars(50,13,t,90);disc(250,40,16,'#e8c8ff');disc(250,40,13,'#c8a0f0');disc(70,30,6,'#9fe8e0');
 for(let x=0;x<FW;x++){const h=128+Math.sin(x*.04)*6+Math.sin(x*.11)*3;rect(x,h,1,FH-h,'#2fb3a0');rect(x,h,1,2,'#7fe0d0')}rect(0,150,FW,30,'#1f8a7a');
 const R=rnd(21);for(let i=0;i<9;i++){const x=R()*FW,h=10+R()*20;line(x,140,x,140-h,'#1a6a5a',2);const g=.6+.4*Math.sin(t*2+i);X.globalAlpha=g;disc(x,140-h,3,'#ff6fae');X.globalAlpha=g*.3;disc(x,140-h,7,'#ff6fae');X.globalAlpha=1}
 if(dust>0){X.globalAlpha=clamp(dust);smoke(160,146,t,dust,16);X.globalAlpha=1}}
function S3(t){// arrivée sur la planète
 const tt=t-44;if(tt<6){rect(0,0,FW,FH,'#05030f');stars(80,17,t);const r=40+tt*25;disc(160,200,r+6,'#c890ff');disc(160,200,r,'#8a5fd0');for(let i=-r*1.6;i<r*1.6;i++)px(160+i,200-r*.15+(i*i)/(r*20),'#ffe08a');spr(ROCK,150,30+tt*8,RP,false,2);flame(160,30+tt*8+38,t,2);return}
 const k=clamp((tt-6)/4);alienGround(t,clamp(1-(tt-10)/4)*k);const ry=lerp(20,140-57,ease(k));spr(ROCK,140,ry,RP,false,3);if(k<1)flame(158,ry+57,t,3);
 if(tt>11){const w=ease((tt-11)/3);spr(LOU,lerp(170,200,w),140-34,LP,false,2)}}
function S4(t){// rencontre avec Zigo
 const tt=t-64;alienGround(t,0);spr(ROCK,60,140-57,RP,false,3);rect(220,120,40,22,'#5a4a7a');rect(224,116,32,6,'#6a5a8a');
 const zy=tt<1.2?140-24+ease(1-tt/1.2)*20:140-24-(tt>10&&tt<16?Math.abs(Math.sin(tt*6))*6:0);const lj=tt>1.2&&tt<2?-8:0;
 spr(tt>10&&tt<16&&Math.floor(tt*3)%2?LOUW:LOU,150,140-34+lj-(tt>10&&tt<16?Math.abs(Math.sin(tt*6+1))*6:0),LP,false,2);spr(ZIG,206,zy,ZP,false,2);
 if(tt>1.2&&tt<2.5)text('!',158,90,'#ffe14f',2,'#000');if(tt>10&&tt<16){for(let i=0;i<6;i++){const a=tt*3+i;px(185+Math.cos(a)*30,90+Math.sin(a)*10,['#ff6fae','#ffe14f','#5fd0f0'][i%3])}}
 if(tt>16){const k=ease((tt-16)/3);spr(outline(["..y..",".yyy.","yyyyy",".y.y."]),lerp(170,198,k),110,{y:'#ffe14f',k:'#7a5a10'},false,2);if(tt>18.5){const g=.6+.4*Math.sin(t*5);X.globalAlpha=g;spr(outline([".c.","ccc","cCc","ccc",".c."]),lerp(200,168,ease((tt-18.5)/2)),112,{c:'#5fd0f0',C:'#ffffff',k:'#1a4a6a'},false,2);X.globalAlpha=g*.3;disc(lerp(203,171,ease((tt-18.5)/2)),117,10,'#5fd0f0');X.globalAlpha=1}}}
function S5(t){// départ, cristal dans le cockpit
 const tt=t-86;if(tt<8){alienGround(t,clamp(1-tt/3));const ry=140-57-ease(tt/7)*200;spr(ROCK,140,ry,RP,false,3);flame(158,ry+57,t,3);const w=Math.floor(t*4)%2;spr(ZIG,206,140-24,ZP,false,2);rect(206+(w?22:20),104,3,8,'#3fb860');return}
 rect(0,0,FW,FH,'#05030f');stars(90,19,t);rect(0,110,FW,70,'#2a2440');rect(0,108,FW,3,'#5a5470');for(let i=0;i<5;i++){rect(20+i*60,130,40,20,'#1a1630');rect(24+i*60,134,8,4,['#ff4f6a','#6cc04a','#ffe14f','#5fd0f0','#ff9a1f'][(i+Math.floor(t*2))%5])}
 const g=.6+.4*Math.sin(t*3);X.globalAlpha=g*.35;disc(160,96,26,'#5fd0f0');X.globalAlpha=1;spr(outline([".c.","ccc","cCc","ccc",".c."]),154,88,{c:'#5fd0f0',C:'#ffffff',k:'#1a4a6a'},false,3);
 spr(LOU.slice(0,8),100,82,LP,false,3)}
function S6(t){// lever de soleil sur la Terre
 const tt=t-104;rect(0,0,FW,FH,'#05030f');stars(80,23,t,120);const r=220;disc(160,FH+r-50,r+3,'#7fc8ff');disc(160,FH+r-50,r,'#2a5ab8');const R=rnd(31),cy=FH+r-50;for(let i=0;i<14;i++){const x=R()*FW,y=FH-40+R()*40,rr=6+R()*10;if(Math.hypot(x-160,y-cy)<r-rr)disc(x,y,rr,'#3f9a5a')}
 const k=ease(tt/6);X.globalAlpha=k;disc(250,FH-48,6+k*4,'#ffffff');X.globalAlpha=k*.35;disc(250,FH-48,30,'#ffe8a0');X.globalAlpha=1;spr(ROCKH,lerp(40,120,tt/8),70,RP,false,2);flame(lerp(40,120,tt/8),89,t,2,true)}
const SC=[[0,6,t=>titleCard(t,'MISSION ÉTOILE','UNE AVENTURE SPATIALE','#b48cff')],[6,24,S1],[24,44,S2],[44,64,S3],[64,86,S4],[86,104,S5],[104,112,S6],[112,120,t=>credits(t-112,8,'MISSION ÉTOILE',['ANIMATION ET MUSIQUE : STUDIO LITTLE LIFE','CAPITAINE LOU · ZIGO'],'#b48cff')]];
function draw(t){rect(0,0,FW,FH,'#000');const s=SC.find(s=>t>=s[0]&&t<s[1])||SC[SC.length-1];s[2](t);if(s[0]>0&&s[0]<112){vignette();letterbox(1)}const a=Math.min(1,(t-s[0])/.5,(s[1]-t)/.5);if(s[0]>0)fade(1-clamp(a))}
const subs=[{a:12.5,b:15.3,who:'ctrl',txt:'Contrôle : dix secondes avant le décollage.'},{a:15.5,b:18.3,who:'ctrl',txt:'Trois… deux… un…'},{a:18.5,b:20.5,who:'ctrl',txt:'Décollage !'},
 {a:28,b:31,who:'lou',txt:'Direction l’étoile bleue !'},{a:39,b:42,who:'lou',txt:'Ouf ! Tout va bien à bord.'},{a:58,b:61.5,who:'lou',txt:'Quel endroit magnifique…'},
 {a:66.5,b:68.5,who:'zigo',txt:'Glorp ?'},{a:69,b:72,who:'lou',txt:'Euh… bonjour ! Je viens en amie.'},{a:72.5,b:75,who:'zigo',txt:'Bon-jour ! Glorp glorp !'},
 {a:83,b:85.8,who:'zigo',txt:'Pour toi. Souvenir.'},{a:96,b:100.5,who:'lou',txt:'Mission accomplie. J’ai une amie dans les étoiles.'}];
function sound(){// générique, tension du compte à rebours, voyage, planète, rencontre (danse), départ, lever de soleil
 [67,71,74,79,78,74].forEach((m,i)=>bell(m,.3+i*.4,.05));pad([55,59,62,66],0,6,.03,1300);
 pad([50,57,62],6,6.5,.03,700);pad([48,55,60],12.5,6,.035,900);for(let i=0;i<12;i++)osc(i>=9?880:440,12.6+i*.5,.12,.04,'square',AU.sfx);
 ambience(17,26,300,'lowpass',.5,{fi:1.5,fo:3});ambience(18.5,25,1200,'bandpass',.18,{fi:.5,fo:3});noise(18.5,5,.3,80,'lowpass',AU.sfx,{a:.3});
 const B=60/118;for(let b=0;b<40;b++){const t=24+b*B*.5,bar=Math.floor(b/8)%4,ch=[[55,59,62],[52,55,59],[48,52,55],[50,54,57]][bar];if(b%2==0)bassN(ch[0]-12,t,B*.45,.1);if(b%8==0)pad(ch,t,B*4,.025,1800);
  if(b%2==0)pluck(ch[(b/2)%3]+24,t,.035,.25,'square');if(b%4==0)kick(t,.3);if(b%4==2)snare(t,.07);hat(t,.03)}
 [37.5].forEach(t=>{noise(t,.4,.6,1500,'bandpass',AU.sfx);noise(t,1.2,.4,150,'lowpass',AU.sfx);osc(120,t,.6,.2,'sawtooth',AU.sfx,{slide:.3})});
 [[52,55,59,64],[48,52,55,60],[53,57,60,65],[50,54,57,62]].forEach((ch,i)=>pad(ch,44+i*5,5.2,.03,900));for(let i=0;i<14;i++)bell(76+[0,4,7,11][i%4],50+i*1,.025);ambience(50,56,200,'lowpass',.3,{fi:.5,fo:2});
 for(let b=0;b<44;b++){const t=64+b*.5,bar=Math.floor(b/8)%2;if(t<74){if(b%4==0)pad([50,53,57],t,2,.02,600)}else{const ch=[[57,61,64],[55,59,62]][bar];if(b%2==0){kick(t,.35);bassN(ch[0]-12,t,.22,.12)}if(b%2==1){snare(t,.08);pluck(ch[b%3]+12,t,.05,.2,'square')}hat(t+.25,.04)}}
 noise(65.1,.3,.25,2000,'bandpass',AU.sfx);[[72,79,84,88]].forEach(c=>c.forEach((m,i)=>bell(m,80+i*.3,.04)));for(let i=0;i<8;i++)bell(88+[0,2,4,7][i%4],83+i*.25,.025);
 ambience(86,93,300,'lowpass',.45,{fi:.5,fo:3});[[55,59,62,66],[52,55,59,64],[48,52,55,59],[50,54,57,62]].forEach((ch,i)=>pad(ch,93+i*4.5,4.7,.035,1400));
 [[74,1.5],[76,.75],[78,.75],[79,3],[78,1.5],[74,1.5],[76,3]].reduce((t,[m,d])=>{lead(m,t,d*.95,.045);return t+d},95);pad([55,62,67,71],104,8,.035,1600);[79,83,86,91].forEach((m,i)=>bell(m,105+i*.6,.04));
 [67,71,74,79].forEach((m,i)=>bell(m,112.2+i*.5,.04));pad([55,59,62,66],112,7.8,.03,1000)}
FILMS_STUDIO['mission-etoile']={dur:120,title:'MISSION ÉTOILE',draw,sound,subs,voices:{ctrl:{pitch:140,type:'square',rate:.08,vol:.14},lou:{pitch:300,type:'sawtooth',rate:.075,vol:.22},zigo:{pitch:180,type:'square',rate:.11,vol:.18}},poster:40,
 reactions:[{t:18.7,k:'surprise'},{t:37.6,k:'peur'},{t:65.2,k:'surprise'},{t:73,k:'rire'},{t:76,k:'rire'},{t:97,k:'emotion'},{t:106,k:'emotion'}]};
})();
