// ===== FILM « LA VAGUE GÉANTE » (grand spectacle, 2 min) =====
(function(){
const MAYA=outline(["...hhhh....","..hhhhhh...","..hsssshh..","..sksksh.h.","..ssssss.h.","...ssss....","..rrrrrr...",".rrWWWWrr..",".s.rrrr.s..",".s.rrrr.s..","...rrrr....","...rr.rr...","...rr.rr...","...rr.rr...","...ss.ss..."]);
const MAYAC=outline(["...hhhh....","..hhhhhh.h.","..hsssshhh.","..sksksh...","..ssssss...","s..ssss...s",".srrrrrrrs.","..rWWWWr...","..rrrrrr...",".rrr..rrr..",".rr....rr..",".ss....ss.."]);
const MP={k:'#1a1420',h:'#1a1420',s:'#c98f62',r:'#e0533d',W:'#ffffff'};
const THEO=outline(["..yyyyy....",".yyyyyyy...",".ysssssy...","..sksks....","..sssss....","...sss.....","..ccccc....",".ccccccc...",".s.ccc.s...",".s.ccc.s...","...nnn.....","...n.n.....","...s.s.....","..ss.ss...."]);
const TP={k:'#1a1420',y:'#ffd166',s:'#f1c7a3',c:'#3f8fd0',n:'#2a3a5a'};
const BOARD=outline(["..bbbbbbbbbbbbbbbbbb..","bbbbWWWWWWWWWWWWWWbbbb","..bbbbbbbbbbbbbbbbbb.."]),BP={k:'#5a1a10',b:'#e0533d',W:'#ffffff'};
const DOL=outline(["......dd......",".....ddd......","dddddddddddd..",".dddDDDDDdddd.","..ddddddddd..d","...........dd."]),DP={k:'#1a3040',d:'#6a8aa8',D:'#c8d8e8'};
const GULL=[["w.....w",".w...w.","..www.."],["..www..",".w...w.","w.....w"]];
function sea(t,y0,col1,col2,foam){for(let y=y0;y<FH;y++){X.fillStyle=y%4<2?col1:col2;X.fillRect(0,y,FW,1)}for(let i=0;i<40;i++){const x=((i*47-t*14)%FW+FW)%FW,y=y0+4+(i*13)%(FH-y0-4);rect(x,y,5+(i%3)*3,1,foam)}}
function gulls(t,n,y){for(let i=0;i<n;i++){const x=((i*90+t*25)%380)-30,yy=y+Math.sin(t*2+i)*6+i*6;spr(GULL[Math.floor(t*4+i)%2],x,yy,{w:'#ffffff'},false,2)}}
function palm(x,y){for(let i=0;i<40;i++)rect(x+Math.sin(i*.08)*6,y-i,4,1,'#8a5a3a');[[-1,0],[1,0],[-.7,-.5],[.7,-.5],[0,-1]].forEach(([dx,dy])=>{for(let i=0;i<22;i++)rect(x+6+dx*i,y-40+dy*i+i*i*.03,3,2,'#3f9a4a')})}
function S1(t){// plage le matin
 const tt=t-6;sky(['#ffb080','#ffd8a8','#bfe6fa'],0,100);disc(250,80,14,'#fff3c0');sea(t,96,'#2f8fc0','#3a9ad0','#d8f2fc');for(let x=0;x<FW;x++){const y=120+Math.sin(x*.05+t)*2;rect(x,y,1,3,'#e8f8ff')}
 rect(0,124,FW,56,'#f2d8a0');for(let i=0;i<60;i++)px((i*53)%FW,126+(i*7)%50,'#e0c080');palm(30,170);gulls(t,3,30);
 spr(BOARD,120,150,BP,false,2);const rub=Math.floor(tt*4)%2;spr(MAYA,150,150-30-10,MP,false,2);rect(158+rub*6,134,4,2,'#ffffff');
 if(tt>4){const k=ease((tt-4)/3);spr(THEO,lerp(-20,90,k),150-28-10,TP,false,2)}}
function S2(t){// à la rame, les dauphins
 const tt=t-26;sky(['#7fc8f0','#bfe6fa'],0,80);sea(t,78,'#1f7fb8','#2a8ac8','#cfeefa');const bob=Math.sin(t*2)*3;
 spr(BOARD,130,120+bob,BP,false,2);const a=Math.floor(t*3)%2;rect(150,112+bob,26,6,'#e0533d');disc(176,112+bob,5,'#c98f62');rect(172,106+bob,10,4,'#1a1420');rect(a?150:166,118+bob,4,6,'#c98f62');
 for(let i=0;i<20;i++)rect(((i*37-t*30)%FW+FW)%FW,126+bob+(i%3)*2,6,1,'#ffffff');
 if(tt>7&&tt<16){for(let d=0;d<2;d++){const ph=((tt-7)*.45+d*.4)%1,x=40+d*170+ph*60,y=110-Math.sin(ph*Math.PI)*30;if(ph<.95)spr(DOL,x,y,DP,false,2);if(ph>.85){for(let i=0;i<6;i++)rect(x+20+i*3-9,112-(1-ph)*30-i%2*3,2,2,'#ffffff')}}}}
function wave(t,h,x0){// mur d'eau avec crête d'écume
 for(let x=0;x<FW;x++){const d=(x-x0)/70,hh=h*Math.exp(-d*d*.6)*(x<x0+40?1:Math.max(0,1-(x-x0-40)/120));const top=150-hh;
  for(let y=Math.round(top);y<160;y++){const k=(y-top)/Math.max(1,hh);X.fillStyle=k<.08?'#e8f8ff':k<.3?'#3aa0d8':k<.7?'#1a6aa8':'#0e4a80';X.fillRect(x,y,1,1)}if(hh>6&&(x+Math.floor(t*20))%5==0)rect(x,top-2,2,2,'#ffffff')}}
function S3(t){// la vague géante se lève
 const tt=t-44,k=ease(tt/14);sky([mix('#7fc8f0','#3a4a6a',k),mix('#bfe6fa','#6a7a9a',k)],0,90);sea(t,88,mix('#1f7fb8','#0e3a6a',k),mix('#2a8ac8','#1a4a7a',k),'#cfeefa');
 wave(t,20+k*110,250-k*40);const stand=tt>8;const bob=Math.sin(t*2)*2;spr(BOARD,110,140+bob,BP,false,2);if(stand)spr(MAYAC,128,140-24+bob,MP,false,2);else{rect(130,132+bob,26,6,'#e0533d');disc(156,132+bob,5,'#c98f62')}
 if(tt>11&&tt<15){rect(8,24,64,44,'#ffffff');rect(10,26,60,40,'#f2d8a0');rect(10,26,60,14,'#2f8fc0');spr(THEO,30,30,TP,false,2)}}
function S4(t){// la chevauchée : un tube géant qui s'enroule au-dessus de Maya
 const tt=t-64,cx=240-clamp(tt/22)*40,cy=168,R=150,r=70+Math.sin(t*2)*3;sky(['#3a4a6a','#6a7a9a','#8a9aba'],0,150);
 // face de la vague (tout l'écran) : dégradé du creux vers la crête
 for(let x=0;x<FW;x++){const top=Math.max(20,cy-Math.sqrt(Math.max(0,R*R-(x-cx)*(x-cx)))*0.9);for(let y=Math.round(top);y<FH;y++){const k=(y-top)/(FH-top);X.fillStyle=k<.04?'#ffffff':k<.18?'#5ab8e8':k<.5?'#2a88c8':k<.8?'#1a6aa8':'#0e4a80';X.fillRect(x,y,1,1)}if((x+Math.floor(t*30))%4==0)rect(x,top-2,2,2,'#e8f8ff')}
 // intérieur du tube (sombre) et lèvre qui retombe
 for(let y=-Math.round(r);y<=0;y++){const w=Math.sqrt(Math.max(0,r*r-y*y))*1.2;for(let x=Math.round(cx-w);x<cx+w;x++){if(x<0||x>=FW)continue;const d=Math.hypot((x-cx)/1.2,y)/r;X.fillStyle=d>.92?'#cfeefa':d>.75?'#1a5a98':'#0a3a68';X.fillRect(x,cy-10+y,1,1)}}
 for(let i=0;i<60;i++){const a=Math.PI*(1.05+i/60*.9),x=cx+Math.cos(a)*r*1.2,y=cy-10+Math.sin(a)*r;rect(x,y+((i+Math.floor(t*20))%3),2,3+((i*7)%5),'#e8f8ff')}
 for(let y=150;y<FH;y++){X.fillStyle=y%4<2?'#0e4a80':'#14558c';X.fillRect(0,y,FW,1)}for(let i=0;i<40;i++){const x=((i*31-tt*140)%FW+FW)%FW;rect(x,150+(i*11)%28,8,1,'#cfeefa')}
 const mx2=lerp(20,cx-10,clamp(tt/14)),my=118+Math.sin(tt*2.2)*10,wipe=tt>14.5&&tt<17;if(!wipe||tt>16.6){spr(BOARD,mx2-10,my+22,BP,false,2);spr(MAYAC,mx2,my,MP,false,2)}
 for(let i=0;i<22;i++){const a=Math.random()*Math.PI,d=Math.random()*22;rect(mx2-6-Math.cos(a)*d,my+24-Math.sin(a)*d,2,2,'#ffffff')}
 if(wipe){for(let i=0;i<140;i++){const a=Math.random()*6.28,d=Math.random()*46*(tt-14.4);rect(mx2+Math.cos(a)*d,my+10+Math.sin(a)*d*.6,3,3,i%2?'#ffffff':'#cfeefa')}}
 if(tt>17.5){const k=ease((tt-17.5)/4);X.globalAlpha=k*.5;rect(0,0,FW,FH,'#ffe8c0');X.globalAlpha=1}}
function S5(t){// triomphe sur la plage
 const tt=t-88;sky(['#ffb070','#ffd8a8'],0,100);sea(t,96,'#2f8fc0','#3a9ad0','#d8f2fc');rect(0,124,FW,56,'#f2d8a0');
 const R=rnd(41);for(let i=0;i<16;i++){const x=20+i*18+R()*6,j=Math.abs(Math.sin(t*6+i))*(tt<8?6:2);rect(x,150-18-j,8,18,['#e0533d','#3f8fd0','#6cc04a','#ffe14f','#8a5fd0'][i%5]);disc(x+4,150-22-j,4,['#c98f62','#f1c7a3','#8d5a3b'][i%3]);if(tt<8&&i%3==0)rect(x-2,150-30-j,2,8,'#f1c7a3')}
 spr(BOARD,150,166,BP,false,2);spr(MAYA,190,170-30-10,MP,false,2);spr(THEO,130,170-28-10-(tt<6?Math.abs(Math.sin(t*8))*8:0),TP,false,2)}
function S6(t){// feu de camp au coucher du soleil
 const tt=t-104;sky(['#3a1a4a','#c04a5a','#ff9a4a'],0,110);disc(160,108,22,'#ffb050');sea(t,104,'#5a2a4a','#6a3a5a','#ff9a6a');rect(0,130,FW,50,'#3a2a2a');
 for(let i=0;i<14;i++){const h=8+Math.random()*10;rect(156+(i%5)*2-4,152-h,3,h,i%2?'#ffb347':'#ffe14f')}rect(146,152,28,3,'#5a3a2a');
 [[110,'M'],[200,'T'],[80,''],[230,'']].forEach(([x],i)=>{rect(x,128,10,24,'#1a1020');disc(x+5,124,5,'#1a1020')});X.globalAlpha=.25+.1*Math.sin(t*9);disc(160,145,40,'#ff9a4a');X.globalAlpha=1}
const SC=[[0,6,t=>titleCard(t,'LA VAGUE GÉANTE','UN FILM À GRAND SPECTACLE','#2fb3a0')],[6,26,S1],[26,44,S2],[44,64,S3],[64,88,S4],[88,104,S5],[104,112,S6],[112,120,t=>credits(t-112,8,'LA VAGUE GÉANTE',['ANIMATION ET MUSIQUE : STUDIO LITTLE LIFE','MAYA · THÉO'],'#2fb3a0')]];
function draw(t){rect(0,0,FW,FH,'#000');const s=SC.find(s=>t>=s[0]&&t<s[1])||SC[SC.length-1];s[2](t);if(s[0]>0&&s[0]<112){vignette();letterbox(1)}const a=Math.min(1,(t-s[0])/.5,(s[1]-t)/.5);if(s[0]>0)fade(1-clamp(a))}
const subs=[{a:13,b:16.5,who:'theo',txt:'Tu as entendu ? Une vague géante arrive aujourd’hui !'},{a:17,b:20.5,who:'maya',txt:'Alors je serai là pour la surfer.'},{a:21,b:24,who:'theo',txt:'Tu es folle… mais fais attention !'},
 {a:36,b:38.5,who:'maya',txt:'Bonjour, les dauphins !'},{a:55,b:57.5,who:'theo',txt:'Elle y va !'},{a:81.5,b:84,who:'maya',txt:'Je suis là !'},
 {a:92,b:95,who:'theo',txt:'Incroyable ! Tu l’as fait !'},{a:96,b:100,who:'maya',txt:'La mer était avec moi aujourd’hui.'}];
function sound(){// générique, plage, rame, montée de la vague, chevauchée, triomphe, feu de camp
 [69,73,76,81,76,73].forEach((m,i)=>bell(m,.3+i*.45,.05));pad([57,61,64,68],0,6,.03,1300);
 ambience(6,44,600,'lowpass',.35,{lfo:.15,fi:1,fo:1});for(let i=0;i<10;i++)osc(2400,8+i*3.1,.15,.03,'triangle',AU.sfx,{slide:.7});
 const B=60/104;for(let b=0;b<64;b++){const t=6+b*B*.5,bar=Math.floor(b/8)%4,ch=[[57,61,64],[54,57,61],[50,54,57],[52,56,59]][bar];if(b%2==0)bassN(ch[0]-12,t,B*.4,.09);if(b%8==0)pad(ch,t,B*4,.02,1500);if(b%2==0)pluck([69,73,76,73,71,73,69,64][b%8],t,.04,.35)}
 for(let i=0;i<10;i++)osc(1500+i*80,33+i*.6,.1,.03,'sine',AU.sfx,{slide:1.6});for(let i=0;i<4;i++)noise(34+i*2.3,.4,.15,1800,'bandpass',AU.sfx);
 ambience(44,64,250,'lowpass',.5,{fi:4,fo:1});[[50,53,57],[48,52,55],[46,50,53],[45,49,52]].forEach((ch,i)=>{pad(ch,44+i*5,5.2,.035,600+i*200);bassN(ch[0]-12,44+i*5,5,.1)});for(let i=0;i<10;i++)kick(52+i*1.2,.15+i*.02);
 ambience(64,88,900,'bandpass',.35,{fi:.5,fo:1,lfoF:.5});const B2=60/140;for(let b=0;b<100;b++){const t=64+b*B2*.5,bar=Math.floor(b/8)%4,ch=[[57,60,64],[53,57,60],[55,59,62],[52,55,59]][bar];if(b%2==0)kick(t,.4);if(b%4==2)snare(t,.1);hat(t,.04);if(b%2==1)bassN(ch[0]-12,t,B2*.4,.12);if(b%8==0)pad(ch,t,B2*4,.03,2200);
  lead([76,79,81,79,76,74,72,74][b%8]+(bar==2?-2:0),t,B2*.45,.03,'sawtooth')}
 noise(78.6,2,.5,800,'lowpass',AU.sfx,{a:.05});noise(81.4,.6,.3,3000,'bandpass',AU.sfx);
 ambience(88,104,2000,'bandpass',.25,{fi:.3,fo:6});[[57,61,64,69],[59,62,66,71],[61,64,68,73],[57,61,64,69]].forEach((ch,i)=>pad(ch,88+i*4,4.2,.035,1600));[[81,1],[80,1],[78,2],[76,1],[78,1],[81,2],[85,4]].reduce((t,[m,d])=>{lead(m,t,d*.95,.045);return t+d},90);
 ambience(104,112,1200,'highpass',.06);for(let i=0;i<30;i++)noise(104+i*.27,.04,.08,3000,'bandpass',AU.sfx);[69,73,76,81,80,76].forEach((m,i)=>pluck(m,104.5+i*1.1,.04,.9));
 [69,73,76,81].forEach((m,i)=>bell(m,112.2+i*.5,.04));pad([57,61,64,68],112,7.8,.03,1000)}
FILMS_STUDIO['vague-geante']={dur:120,title:'LA VAGUE GÉANTE',draw,sound,subs,voices:{maya:{pitch:340,type:'sawtooth',rate:.075,vol:.22},theo:{pitch:230,type:'sawtooth',rate:.08,vol:.22}},poster:58,
 reactions:[{t:22,k:'rire'},{t:34.5,k:'emotion'},{t:52,k:'surprise'},{t:70,k:'surprise'},{t:78.6,k:'peur'},{t:81.6,k:'rire'},{t:97,k:'emotion'}]};
})();
