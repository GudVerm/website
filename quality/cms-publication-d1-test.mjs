import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import worker from "../cloudflare/src/index.js";

const sqlite=new DatabaseSync(":memory:");
const mediaDeleted=[];
let failAtBatchStatement=0;

function wrap(sql,params=[]){
  return {
    sql,params,
    bind(...values){return wrap(sql,values)},
    async run(){
      const info=sqlite.prepare(sql).run(...params);
      return {success:true,meta:{changes:info.changes,last_row_id:Number(info.lastInsertRowid||0)}};
    },
    async all(){return {results:sqlite.prepare(sql).all(...params)}},
    async first(){return sqlite.prepare(sql).get(...params)||null}
  };
}
const env={
  DB:{
    prepare(sql){return wrap(sql)},
    async batch(statements){
      sqlite.exec("BEGIN IMMEDIATE");
      try{
        const results=[];
        for(let i=0;i<statements.length;i++){
          if(failAtBatchStatement===i+1)throw new Error("Simulierter Datenbankfehler");
          results.push(await statements[i].run());
        }
        sqlite.exec("COMMIT");
        return results;
      }catch(error){
        sqlite.exec("ROLLBACK");
        throw error;
      }finally{failAtBatchStatement=0}
    }
  },
  MEDIA:{async delete(key){mediaDeleted.push(key)}},
  ADMIN_ALLOWED_EMAILS:"gudeliusvermessung@web.de",
  ADMIN_TOKEN_FALLBACK_ENABLED:"false",
  ALLOWED_ORIGIN:"https://gudverm.github.io",
  PUBLIC_MEDIA_ENABLED:"true"
};
const ctx={access:{getIdentity:async()=>({email:"gudeliusvermessung@web.de"})}};
const origin="https://gudelius-cms.gudeliusvermessung.workers.dev";
async function api(path,method="GET",payload,authorized=true){
  const options={method};
  if(payload!==undefined){
    options.headers={"content-type":"application/json"};
    options.body=JSON.stringify(payload);
  }
  const res=await worker.fetch(new Request(origin+path,options),env,authorized?ctx:{});
  const data=await res.json();
  return {status:res.status,...data};
}
const contentRow=key=>sqlite.prepare("SELECT value FROM content WHERE key=?").get(key)?.value;
const draftRow=key=>sqlite.prepare("SELECT value FROM content_drafts WHERE key=?").get(key)?.value;
const seed=(table,key,value)=>{
  sqlite.prepare("INSERT OR REPLACE INTO "+table+" (key,value) VALUES (?,?)").run(key,JSON.stringify(value));
};
const assertCount=(n)=>assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM content_drafts").get().n,n);
const draft=(key,value)=>api("/api/admin/drafts/"+key,"PUT",value);
const revision=async()=>{const d=await api("/api/admin/drafts");assert.equal(d.status,200);assert.match(d.revision,/^[a-f0-9]{64}$/);return d.revision};
const publish=async(keys,expected_revision)=>api("/api/admin/drafts/publish","POST",{keys,expected_revision});

assert.equal((await api("/api/admin/drafts","GET",undefined,false)).status,403,"Admin muss geschützt sein");
assert.equal((await draft("kontakt/email","keine-email")).status,422,"Ungültige E-Mail darf nicht gespeichert werden");
assert.equal((await api("/api/admin/content/kontakt/email","PUT",123)).status,422,"Falscher Typ darf nicht live gespeichert werden");
assert.equal((await draft("projekte/index",[{slug:"duplikat"},{slug:"duplikat"}])).status,422);
assert.equal((await draft("media-layout/startseite/hero",{x:120,zoom:100})).status,422);
assert.equal((await draft("leistungsseiten/gis-bauvermessung/lists/tasks",["gültig",2])).status,422);
assertCount(0);

seed("content","kontakt/email","alt@example.de");
assert.equal((await draft("kontakt/email","neu@example.de")).status,200);
assert.equal((await draft("startseite/hero-title","Neuer Titel")).status,200);
assert.equal((await publish([],await revision())).status,400,"Leere Auswahl ist kein Publish-all");
assert.equal((await api("/api/admin/drafts/publish","POST",{})).status,428,"Veröffentlichen ohne Snapshot verboten");
const stale=await revision();
await draft("startseite/hero-title","Neuerer Titel");
assert.equal((await publish(["kontakt/email","startseite/hero-title"],stale)).status,409,"Alter Entwurfsstand muss scheitern");
assert.equal(JSON.parse(contentRow("kontakt/email")),"alt@example.de");
assertCount(2);

// Simuliere einen Abbruch mitten im atomaren SQL-Batch.
failAtBatchStatement=4;
const failed=await publish(["kontakt/email","startseite/hero-title"],await revision());
assert.equal(failed.status,500,"Ein Datenbankfehler muss den Publish abbrechen");
assert.equal(JSON.parse(contentRow("kontakt/email")),"alt@example.de","Transaktions-Rollback muss den Live-Wert schützen");
assert.equal(contentRow("startseite/hero-title"),undefined);
assertCount(2);
assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM content_history").get().n,0);
assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='entwurf_veroeffentlicht'").get().n,0);

const done=await publish(["kontakt/email","startseite/hero-title"],await revision());
assert.equal(done.status,200,JSON.stringify(done));
assert.equal(done.count,2);
assert.equal(JSON.parse(contentRow("kontakt/email")),"neu@example.de");
assert.equal(JSON.parse(contentRow("startseite/hero-title")),"Neuerer Titel");
assertCount(0);
assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM content_history WHERE key='kontakt/email'").get().n,1);

// Entfernte Projekt-Kinddaten müssen atomar aus Live verschwinden.
seed("content","projekte/index",[{slug:"alt",visible:true}]);
seed("content","projekte/alt/title","Altes Projekt");
seed("content","projekte/alt/description","Beschreibung");
seed("content","media-layout/projects/alt",{x:50,y:50,zoom:100,rotation:0});
assert.equal((await draft("projekte/alt/title","Zwischenstand")).status,200);
assert.equal((await draft("projekte/index",[])).status,200);
const gone=await publish(undefined,await revision());
assert.equal(gone.status,200,JSON.stringify(gone));
for(const key of ["projekte/alt/title","projekte/alt/description","media-layout/projects/alt"]){
  assert.equal(contentRow(key),undefined,key+" darf nicht live bleiben");
}
assert.equal(draftRow("projekte/alt/title"),undefined);
assert(mediaDeleted.includes("projects/alt"));
assert(sqlite.prepare("SELECT COUNT(*) AS n FROM content_history WHERE operation='draft_publish_delete'").get().n>=3);

// R2 ist separat: ein Fehler darf den bereits erfolgten D1-Publish nicht als Rollback darstellen.
seed("content","technik/index",[{slug:"alt",group:"Außendienst"}]);
seed("content","technik/alt/name","Alter Eintrag");
await draft("technik/index",[]);
env.MEDIA.delete=async()=>{throw new Error("R2 nicht erreichbar")};
const warning=await publish(undefined,await revision());
assert.equal(warning.status,200);
assert.deepEqual(warning.media_cleanup_failed,["equipment/alt"]);
assert.equal(contentRow("technik/alt/name"),undefined);

console.log("CMS-Veröffentlichung: Authentifizierung, Feldvalidierung, Konflikte, Rollback, Versionen, Projekt-/Technik-Löschung und R2-Warnung bestanden.");
