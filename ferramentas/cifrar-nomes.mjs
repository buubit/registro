// Recifra a lista de alunos dentro do index.html.
// Uso (na pasta registro-app): node ferramentas/cifrar-nomes.mjs
// Lê backups/alunos.json (lista em claro, nunca vai pro GitHub) e a senha de SENHA-dos-nomes.txt.
// Quem já destravou no celular continua com a lista antiga: para pegar a nova,
// apagar a chave "nomes" do banco ou reinstalar e restaurar o backup.
import fs from "fs";
const idx = fs.readFileSync("index.html", "utf8");
const lista = JSON.stringify(JSON.parse(fs.readFileSync("backups/alunos.json", "utf8")));
const senha = fs.readFileSync("SENHA-dos-nomes.txt", "utf8").split(/\r?\n/)[2].trim();
const enc = new TextEncoder(), b64 = u => Buffer.from(u).toString("base64");
const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
const k0 = await crypto.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey({name:"PBKDF2", salt, iterations:600000, hash:"SHA-256"}, k0, {name:"AES-GCM", length:256}, false, ["encrypt"]);
const ct = new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, enc.encode(lista)));
const linha = `const NOMES_CIFRADOS = ${JSON.stringify({salt:b64(salt), iv:b64(iv), dados:b64(ct)})};`;
fs.writeFileSync("index.html", idx.replace(/const NOMES_CIFRADOS = \{.*?\};/, linha));
console.log("Nomes recifrados.");
