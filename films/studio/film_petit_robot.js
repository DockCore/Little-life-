// ===== FILM « PETIT ROBOT » (animation, 2 min) =====
(function(){
const BIPa=["......r......","......a......","..ggggggggg..",".gGGGGGGGGGg.",".gGdddddddGg.",".gGdeedeedGg.",".gGdeedeedGg.",".gGdddddddGg.","..ggggggggg..",".....ddd.....",".ggggggggggg.","dgGGGGGGGGGgd","dgGGGyyGGGGgd","dgGGGyyGGGGgd","dgGGGGGGGGGgd",".ggggggggggg.","...dd...dd...","...dd...dd...","..ddd...ddd.."];
const legsB=["....dd.dd....","...dd...dd...","..ddd....ddd."],legsK=["..ddddddd....","..dddddddd...",".............."];
const mk=(legs,eyes)=>outline(BIPa.slice(0,16).map(r=>eyes?r:r.replace(/e/g,'E')).concat(legs||BIPa.slice(16)));
const BIP={s:mk(null,1),w:mk(legsB,1),off:mk(null,0),k:mk(legsK,1)};
const BP={k:'#1a1420',g:'#9aa6b2',G:'#d4dce4',d:'#5a6470',e:'#5fe0ff',E:'#2a3440',a:'#8a96a2',r:'#ff4f6a',y:'#ffd166'};
const PL1=outline(["y.......y","yy.....yy",".yyyyyyy.","..yykyyyb","...yyyy.."]),PL2=outline([".........",".yyyyyyy.","yyyyykyyb","y.yyyy..y","........."]),PLP=outline(["..yyy..",".yykyb.",".yyyy..","..y.y.."]);
const PP={k:'#3a2a10',y:'#ffd166',b:'#ff9a1f'};
const FL=outline(["..ppp..",".pPyPp.","ppyyypp",".pPyPp.","..ppp..","...s...","..ls...","...sl..","...s..."]),FP={k:'#3a1830',p:'#ff6fae',P:'#ffb0d4',y:'#ffe14f',s:'#3f9a4a',l:'#6fca5a'};
function bip(x,y,f,flip,s=2,pal){spr(BIP[f]||BIP.s,x,y,pal||BP,flip,s)}
function plume(x,y,t,perch,s=2,pal){spr(perch?PLP:(Math.floor(t*8)%2?PL1:PL2),x,y,pal||PP,false,s)}
function junk(seed,base){const r=rnd(seed);for(let i=0;i<14;i++){const x=r()*FW,w=20+r()*50,h=10+r()*40;X.fillStyle=['#2a2030','#352838','#40303a'][i%3];X.beginPath();X.moveTo(x-w/2,base);X.lineTo(x-w/4,base-h);X.lineTo(x+w/5,base-h*.8);X.lineTo(x+w/2,base);X.fill()}
 for(let i=0;i<6;i++){const x=r()*FW,y=base-r()*20;disc(x,y,6,'#1a1420');disc(x,y,3,'#352838')}}
function S1(t){// casse au lever du jour
 const k=clamp((t-6)/14);sky([mix('#0c1030','#3a4a8a',k),mix('#2a2050','#c06a8a',k),mix('#402040','#ffb070',k)],0,150);disc(250,130-k*55,12,mix('#ff8a4a','#ffe08a',k));
 junk(3,130);rect(0,128,FW,52,'#2a2030');junk(9,150);rect(0,148,FW,32,'#1e1626');for(let i=0;i<40;i++)px((i*37)%FW,150+(i*13)%30,'#3a2a3a');
 const x=140,y=152-60;if(t<14){spr(BIP.off,x,y+6,BP,false,3)}else{bip(x,y+(t<14.6?6:0),t<14.6?'k':'s',t>16&&t<19&&Math.floor(t*2)%2==0,3)}
 if(t>=10&&t<14&&Math.floor(t*12)%3){X.globalAlpha=.8;rect(x+12,y+6+18,6,6,'#5fe0ff');rect(x+21,y+6+18,6,6,'#5fe0ff');X.globalAlpha=1}
 if(t>12){const g=.5+.5*Math.sin(t*6);X.globalAlpha=g*.5;disc(x+20,y+3,5,'#ff4f6a');X.globalAlpha=1}
 if(t>=16.5&&t<20){text('?',x+46,y-8,'#ffffff',2,'#000')}}
function walkScene(t,p){// collines qui défilent
 sky(['#7fc8f0','#bfe6fa','#e8f6fc'],0,160);disc(60,40,10,'#fff3c0');[[40,30],[170,22],[260,40]].forEach(([x,y],i)=>cloud((x-p*.1+400)%400-40,y,1,'#ffffff','#d8eef8'));
 hills(110,14,.02,p*.3,'#7ab860','#9ad070');hills(130,10,.035,p*.6,'#5a9a48','#7ab860');rect(0,150,FW,30,'#4a8a3a');hills(152,3,.08,p,'#4a8a3a','#6aaa4a');
 for(let i=0;i<30;i++){const x=((i*53-p)%FW+FW)%FW;spr(["g.g","ggg"],x,156+(i*7)%20,{g:'#6aaa4a'})}}
function S2(t){const p=(t-22)*30;walkScene(t,p);if(t>34){X.globalAlpha=clamp((t-34)/1);disc(268,62,2,'#ff6fae');X.globalAlpha=1}
 for(let i=0;i<3;i++){const bx=(i*90+t*20)%FW,by=100+Math.sin(t*3+i)*8;spr([Math.floor(t*10+i)%2?"o.o":".o.","..."],bx,by,{o:['#ff9ad0','#ffe14f','#9fd0ff'][i]})}
 const sit=t>=30;bip(140,154-40,sit?'s':(Math.floor(t*4)%2?'w':'s'),false);
 if(t>=26&&t<30){const k=ease((t-26)/4);plume(lerp(330,147,k),lerp(30,98,k)+Math.sin(t*9)*3,t)}else if(t>=30)plume(147,104-8,t,true);
 if(t>36.5&&t<40)text('!',180,82,'#ffe14f',2,'#000')}
function S3(t){// la rivière
 const tt=t-40;sky(['#8fd0f0','#cfeefa'],0,130);hills(96,8,.03,tt*4,'#6aaa58');rect(0,100,FW,30,'#5a9a48');
 for(let y=128;y<165;y++){X.fillStyle=y%3?'#2f7fc0':'#3a90d0';X.fillRect(0,y,FW,1)}for(let i=0;i<30;i++){const x=(i*41+tt*20)%FW;rect(x,130+(i*7)%32,6,1,'#9fd8f8')}rect(0,165,FW,15,'#5a9a48');
 const stones=[60,110,160,210,260];stones.forEach(x=>{ellipse(x,146,12,4,'#6a6e78');ellipse(x,145,10,3,'#8a8e98')});
 let bx,by,f='s';const hop=Math.floor(tt/2),ph=(tt%2)/2;
 if(tt<10){const a=stones[Math.max(0,hop-1)]||30,b=stones[Math.min(4,hop)];bx=lerp(hop?a:30,b,ease(ph*1.4))-6;by=126-Math.sin(clamp(ph*1.4)*Math.PI)*16;f=ph<.7?'w':'s'}
 else if(tt<11.5){bx=stones[4]-6+(tt-10)*10;by=126+ease((tt-10)/.6)*22;f='s'}else{const k=ease((tt-11.5)/3);bx=stones[4]+8;by=lerp(148,126,k);f='s'}
 if(tt>10.4&&tt<12.5){for(let i=0;i<14;i++){const a=i/14*Math.PI,r=(tt-10.4)*30;px(stones[4]+10+Math.cos(a)*r,146-Math.sin(a)*r*.8+(tt-10.4)*20,'#cfeefa')}}
 bip(bx-6,by-20,f,false);if(tt>=11.5){const pb=(tt*6)%1;rect(bx,by-26-pb*10,2,2,'#cfeefa');rect(bx+14,by-22-pb*8,2,2,'#cfeefa')}
 plume(lerp(20,stones[4]+20,clamp(tt/12)),62+Math.sin(tt*4)*6,t)}
function S4(t){// l'orage
 const tt=t-60,fl=[3,9,14].some(a=>tt>a&&tt<a+.18);sky(fl?['#e8e8ff','#a0a8d0']:['#1a1c30','#3a3e58','#4a4e68'],0,145);
 for(let i=0;i<6;i++)cloud((i*70-tt*6)%380-30,20+(i%2)*14,1.6,fl?'#8a8ea8':'#2a2c40','#20222f');
 if(fl){line(200,10,190,40,'#ffffff',2);line(190,40,205,60,'#ffffff',2);line(205,60,196,95,'#ffffff',2)}
 hills(130,6,.03,0,'#2a4a2a');rect(0,135,FW,45,'#203a20');for(let i=0;i<160;i++){const x=(i*29+tt*140)%FW,y=(i*53+tt*400)%FH;line(x,y,x-3,y+7,'#8fa0c8')}
 bip(136,138-38,'k',false);plume(164,138-8,tt,true);if(fl){X.globalAlpha=.35;rect(0,0,FW,FH,'#ffffff');X.globalAlpha=1}}
function S5(t){// arc-en-ciel puis sommet au coucher du soleil
 const tt=t-80,k=clamp(tt/14);sky([mix('#7fc0e8','#ff8a6a',k),mix('#cfe8f8','#ffc080',k),mix('#e8f4fa','#ffe0a0',k)],0,160);disc(240,110-k*10+k*20,14,mix('#fff3c0','#ff9a4a',k));
 X.globalAlpha=clamp(1-k*1.4)*.6;['#ff4f6a','#ff9a1f','#ffe14f','#6cc04a','#3f8fd0','#8a5fd0'].forEach((c,i)=>{for(let a=0;a<180;a++){const an=Math.PI+a/180*Math.PI;px(160+Math.cos(an)*(90-i*3),150+Math.sin(an)*(70-i*3),c)}});X.globalAlpha=1;
 hills(150,22,.012,0,mix('#5a9a48','#4a5a3a',k),mix('#7ab860','#8a7a4a',k));
 const fx=200,fy=137-33;spr(FL,fx,fy,FP,false,3);if(tt>12){X.globalAlpha=.25+.15*Math.sin(t*3);disc(fx+10,fy+8,16,'#ffb0d4');X.globalAlpha=1}
 const walk=tt<7,bx=walk?lerp(40,150,tt/7):150,gy=walk?150-(bx-40)*.12:137;bip(bx,gy-(tt>=8?54:57),tt>=8?'k':(Math.floor(t*4)%2?'w':'s'),false,3);plume(bx+9,gy-(tt>=8?54:57)-12,t,true,2);
 if(tt>10&&tt<20){X.globalAlpha=clamp((tt-10)/2)*clamp((20-tt)/1)*.8;disc(195,80,3,'#ff9ad0');disc(188,74,2,'#ff9ad0');X.globalAlpha=1}}
function S6(t){// la nuit étoilée
 const tt=t-100;sky(['#05061a','#0e1440','#1c2458'],0,160);stars(110,21,t,130);disc(60,40,9,'#fff3c0');disc(64,37,8,'#0e1440');
 if(tt>4.5&&tt<6){const k=(tt-4.5)/1.5;line(260-k*120,20+k*40,262-k*120+6,19+k*40-3,'#ffffff');X.globalAlpha=.5;line(266-k*120,17+k*40,280-k*120,10+k*40,'#cfd8ff');X.globalAlpha=1}
 hills(150,20,.012,0,'#0c1a14','#16301e');spr(FL,200,104,Object.assign({},FP,{p:'#c04a8a',P:'#e07ab0'}),false,3);
 bip(150,137-54,'k',false,3,Object.assign({},BP,{g:'#5a6070',G:'#7a8494',d:'#3a4250'}));plume(159,137-66,t,true,2,Object.assign({},PP,{y:'#c0a050'}));
 if(Math.floor(t*1.5)%2)text('Z',176,58,'#cfd8ff',2);for(let i=0;i<8;i++){const fx=100+((i*61+t*6)%140),fy=120+Math.sin(t*2+i)*10;X.globalAlpha=.5+.5*Math.sin(t*4+i);px(fx,fy,'#ffe14f');X.globalAlpha=1}}
const SC=[[0,6,t=>titleCard(t,'PETIT ROBOT','UN CONTE D’ANIMATION','#5fe0ff')],[6,22,S1],[22,40,S2],[40,60,S3],[60,80,S4],[80,100,S5],[100,112,S6],[112,120,t=>credits(t-112,8,'PETIT ROBOT',['ANIMATION ET MUSIQUE : STUDIO LITTLE LIFE','BIP · PLUME'],'#5fe0ff')]];
function draw(t){rect(0,0,FW,FH,'#000');const s=SC.find(s=>t>=s[0]&&t<s[1])||SC[SC.length-1];s[2](t);if(s[0]>0&&s[0]<112){vignette();letterbox(1)}const a=Math.min(1,(t-s[0])/.5,(s[1]-t)/.5);if(s[0]>0)fade(1-clamp(a))}
const subs=[{a:15.5,b:18.5,who:'bip',txt:'Bip ? … Où suis-je ?'},{a:31,b:33.5,who:'plume',txt:'Salut, tas de ferraille !'},{a:34,b:36.5,who:'bip',txt:'Bip bip ! Je cherche… quelque chose de beau.'},
 {a:37,b:39.8,who:'plume',txt:'Une fleur ? Il y en a une, tout là-haut !'},{a:52,b:54.5,who:'plume',txt:'Ha ha ! Tu fais des bulles !'},{a:55,b:57.5,who:'bip',txt:'Bip… Tout mouillé.'},
 {a:66,b:68.5,who:'plume',txt:'J’ai peur…'},{a:70,b:72.5,who:'bip',txt:'Bip. Je suis là.'},{a:76,b:79,who:'plume',txt:'Tu es courageux, petit robot.'},
 {a:90,b:93,who:'bip',txt:'… Elle est belle.'},{a:94,b:97.5,who:'plume',txt:'Elle est à toi, maintenant.'}];
function sound(){const B=60/96;
 // générique, réveil, marche, rivière, orage, émotion, berceuse, générique
 [72,76,79,84,79,76].forEach((m,i)=>bell(m,.3+i*.45,.05));pad([60,64,67,71],0,6,.03,1200);
 [[57,60,64],[53,57,60],[48,52,55],[55,59,62]].forEach((ch,i)=>pad(ch,6+i*4,4.2,.03,900));for(let i=0;i<6;i++)osc(400+i*120,10+i*.25,.12,.05,'square',AU.sfx);osc(300,12.5,.6,.06,'sine',AU.sfx,{slide:3});
 for(let b=0;b<48;b++){const t=22+b*B*.5,bar=Math.floor(b/8)%4,ch=[[60,64,67],[55,59,62],[57,60,64],[53,57,60]][bar];if(b%2==0)bassN(ch[0]-12,t,B*.4,.1);if(b%8==0)pad(ch,t,B*4,.02,1600);
  const mel=[72,74,76,79,76,74,72,67][b%8];if(b%2==0||b%8==7)pluck(mel+(bar==1?-1:0),t,.05,.3);if(b%4==2)hat(t);if(b%8==4)snare(t,.06);if(b%8==0)kick(t,.25)}
 for(let i=0;i<40;i++)osc(1800+Math.random()*900,26.5+i*.09,.05,.025,'sine',AU.sfx,{slide:1.3});[31,37,52].forEach(t=>{for(let i=0;i<4;i++)osc(2200,t-.6+i*.12,.06,.03,'sine',AU.sfx,{slide:1.5})});
 for(let b=0;b<40;b++){const t=40+b*B*.5;if(b%2==0)pluck([67,72,71,72,74,72,71,67][b%8],t,.05,.2,'square');if(b%4==0)bassN(48+(b%16<8?0:5),t,B,.09);if(b%4==2)hat(t,.04)}
 for(let i=0;i<5;i++)osc(220+i*40,40.5+i*2,.12,.06,'triangle',AU.sfx,{slide:1.6});noise(50.4,.9,.35,700,'lowpass',AU.sfx,{sweep:200});for(let i=0;i<6;i++)osc(600+i*80,52+i*.3,.08,.03,'sine',AU.sfx,{slide:1.8});
 ambience(60,80,3000,'highpass',.12,{fi:1.5,fo:2});ambience(60,80,400,'lowpass',.1,{lfo:.2});[63,69,74].forEach(t=>{noise(t,.25,.5,3000,'highpass',AU.sfx);noise(t+.2,2.5,.45,180,'lowpass',AU.sfx,{a:.05,sweep:60})});
 [[50,53,57],[46,50,53],[48,51,55],[45,48,52]].forEach((ch,i)=>{pad(ch,60+i*5,5.2,.03,700);bassN(ch[0]-12,60+i*5,5,.08)});for(let i=0;i<8;i++)kick(61+i*2.4,.18);
 [[53,57,60,64],[55,59,62,67],[52,55,59,64],[57,60,64,69],[53,57,60,65],[55,59,62,67]].forEach((ch,i)=>{pad(ch,80+i*3.4,3.6,.035,1300);bassN(ch[0]-12,80+i*3.4,3.4,.09)});
 [[76,1.7],[74,.85],[72,.85],[71,1.7],[72,1.7],[74,1.7],[76,.85],[79,.85],[77,3.4],[76,1.7],[72,1.7]].reduce((t,[m,d])=>{lead(m,t,d*.95,.045);return t+d},84);
 [72,76,79,83,81,79,76,72,74,77,81,79].forEach((m,i)=>bell(m,100.3+i*.9,.035));pad([48,55,64],100,12,.02,800);for(let i=0;i<40;i++)osc(4200,100+i*.3,.03,.012,'sine',AU.sfx);[0,1,2,3].forEach(i=>bell(91+i*2,104.6+i*.1,.03));
 [60,64,67,72].forEach((m,i)=>bell(m+12,112.2+i*.5,.04));pad([60,64,67,71],112,7.8,.03,1000)}
FILMS_STUDIO['petit-robot']={dur:120,title:'PETIT ROBOT',draw,sound,subs,voices:{bip:{robot:true,type:'square',pitch:520,rate:.085,vol:.08},plume:{pitch:760,type:'triangle',rate:.07,vol:.2}},
 reactions:[{t:31.8,k:'rire'},{t:50.6,k:'rire'},{t:52.5,k:'rire'},{t:63.1,k:'surprise'},{t:74.1,k:'peur'},{t:90.5,k:'emotion'},{t:104.8,k:'emotion'}]};
})();
