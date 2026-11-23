// Génère rue/films_data.js (durée réelle, sous-titres, réactions) à partir des films fabriqués : node films/studio/donnees.js
const fs=require('fs'),path=require('path'),D=__dirname,out={};
for(const f of fs.readdirSync(D).filter(f=>f.endsWith('.meta.json'))){const m=JSON.parse(fs.readFileSync(path.join(D,f)));out[m.id]={dur:m.dur,subs:m.subs.map(s=>({a:s.a,b:s.b,who:s.who,txt:s.txt})),reactions:m.reactions}}
fs.writeFileSync(path.resolve(D,'../../rue/films_data.js'),'// Données des films de Little Life (générées par films/studio/donnees.js) : durée, sous-titres, moments de réaction\nconst FILMS_DATA='+JSON.stringify(out)+';\n');console.log(Object.keys(out));
