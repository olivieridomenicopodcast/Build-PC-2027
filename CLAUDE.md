# Build PC 2027

Web app statica (HTML/CSS/JS, nessuna build). Avvio: `python3 -m http.server`.

## Regole di lavoro
- Dopo ogni modifica richiesta dall'utente: **incrementare il numero di build** in `version.js` (`APP_BUILD`, `APP_BUILD_DATE`) e lo stesso `?v=N` nei tag `<script>`/`<link>` di `index.html`, poi **fare commit e push** sul branch di lavoro senza aspettare che l'utente lo chieda.
- Il numero di build è mostrato in basso a sinistra, con il tasto "Cerca aggiornamenti".
- Dati e catalogo: `data.js`; punteggi e pareri: `engine.js`; grafici: `charts.js`; UI: `app.js`.
- Sync GitHub (Pull/Push dello stato del builder, token solo nel browser): `sync.js`. Il token non va mai scritto nel repo.
