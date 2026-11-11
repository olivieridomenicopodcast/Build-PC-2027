# Build PC 2027

Web app statica (HTML/CSS/JS, nessuna build). Avvio: `python3 -m http.server`.

## Regole di lavoro
- Dopo ogni modifica richiesta dall'utente: **incrementare il numero di build** in `version.js` (`APP_BUILD`, `APP_BUILD_DATE`) e lo stesso `?v=N` nei tag `<script>`/`<link>` di `index.html`, poi **fare commit e push** sul branch di lavoro senza aspettare che l'utente lo chieda.
- Il numero di build è mostrato in basso a sinistra, con il tasto "Cerca aggiornamenti".
- Dati e catalogo: `data.js`; punteggi e pareri: `engine.js`; grafici: `charts.js`; UI: `app.js`.
- Sync GitHub (Pull/Push dello stato del builder, token solo nel browser): `sync.js`. Il token non va mai scritto nel repo.

# Regole per ogni web app di Niky (valgono per OGNI nuova app, senza che lo chieda)

## Git
- Fai commit e push da solo a ogni modifica, sul branch di lavoro. Le pull request solo se richieste.

## 1. Sync GITS
- Sync tramite token, con funzioni **Pull** e **Push**, pulsanti ben visibili e feedback di successo/errore.
- Il token lo inserisce l'utente in un campo nelle impostazioni dell'app, salvato in `localStorage`. Mai nel codice né nel repo.
- Implementazione di riferimento: `sync.js` (API GitHub "contents": file JSON nel repo). TODO: confermare con l'utente endpoint/formato dati "GITS/JITS", se diversi.

## 2. Numero di build
- In basso a sinistra, sempre visibile: "Build N" (con data).
- Accanto, il tasto "Cerca aggiornamenti": se c'è una build più recente ricarica la versione nuova (annulla service worker e cache se presenti).
- Il numero di build cambia a ogni modifica (`version.js` + `?v=N` in `index.html`).
