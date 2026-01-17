# 📖 Hvordan bruke Claude Code Prompt

## 🎯 Du har nå 4 dokumenter:

1. **AUDIT_REPORT.md** - Fullstendig analyse av alle problemer
2. **IMPLEMENTATION_PLAN.md** - Detaljert Sprint 1 plan (kritiske fikser)
3. **QUICK_WINS.md** - 10 raske forbedringer (2 timer totalt)
4. **CLAUDE_CODE_PROMPT.md** - Mega-prompt for fullstendig transformasjon

---

## 🚀 Hvordan bruke i Claude Code

### Metode 1: Direkte prompt (anbefalt)

1. Åpne Claude Code
2. Kopier **hele** CLAUDE_CODE_PROMPT.md
3. Lim inn og send
4. Claude Code vil:
   - Lese alle filer i prosjektet
   - Implementere alt i riktig rekkefølge
   - Teste underveis
   - Committe endringer

**Start med:**
```
Jeg vil at du implementerer CLAUDE_CODE_PROMPT.md. 
Start med FASE 1 (Kritiske fikser) og be om godkjenning før du går videre til neste fase.
```

---

### Metode 2: Fase-for-fase (mer kontroll)

**Dag 1 - Kritiske fikser:**
```
Implementer FASE 1 fra CLAUDE_CODE_PROMPT.md:
1. Lag js/components.js og eliminer all duplikatkode
2. Fjern inline onclick handlers
3. Fiks Service Worker
4. Legg til error handling
5. Fiks data files

Test grundig etter hver oppgave.
```

**Dag 2 - Quick wins:**
```
Implementer FASE 2 fra CLAUDE_CODE_PROMPT.md:
- Debouncing
- Keyboard shortcuts
- Accessibility
- Modern APIs
```

**Dag 3-7 - Nye features:**
```
Implementer FASE 3 fra CLAUDE_CODE_PROMPT.md:
1. Collections system
2. Smart search
3. Quick add
4. Auto dark mode
5. Cloud backup
6. Chrome extension
7. Statistics
```

---

### Metode 3: Quick wins først (raskeste forbedring)

Hvis du bare vil ha raske forbedringer:

```
Implementer alle 10 quick wins fra QUICK_WINS.md.
Disse er raske og trygge å gjøre.
```

Dette tar ~2 timer og gir umiddelbare forbedringer.

---

## 🧪 Testing underveis

Etter hver fase, test:

```bash
# 1. Sjekk for errors
# Åpne DevTools > Console

# 2. Test offline mode
# DevTools > Network > Disable cache + Offline

# 3. Test alle sider
# Klikk gjennom AI, OSINT, Projects, News, Misc

# 4. Test favoritter
# Legg til, fjern, søk

# 5. Lighthouse audit
npx lighthouse http://localhost:8000 --view
```

---

## 📊 Forventet resultat

### Før (v7):
- 370+ linjer duplikatkode
- Sikkerhetsproblemer (inline handlers)
- Fungerer ikke offline
- Ingen error handling
- Lighthouse: ~78

### Etter (v8):
- ✅ Null duplikatkode
- ✅ Sikker (CSP-compatible)
- ✅ 100% offline-støtte
- ✅ Robust error handling
- ✅ Lighthouse: 95+
- ✅ Collections
- ✅ Smart search
- ✅ Quick add
- ✅ Cloud backup
- ✅ Chrome extension
- ✅ Statistikk

---

## 💡 Tips

### Start enkelt
Ikke gjør alt på en gang. Start med FASE 1 (kritiske fikser), test grundig, deretter FASE 2, osv.

### Commit ofte
```bash
git add .
git commit -m "Phase 1: Critical fixes - components and error handling"
git push
```

### Backup først
```bash
git checkout -b v8-refactor
# Gjør all endringer her
# Merge til main når alt er testet
```

### Test lokalt først
```bash
# Bruk lokal server
npx serve .
# eller
python -m http.server 8000

# Test i nettleser
open http://localhost:8000
```

### Deploy til staging først
Deploy til Netlify branch deploy før production:
```bash
git push origin v8-refactor
# Netlify lager automatisk preview URL
# Test der først
```

---

## 🆘 Hvis noe går galt

### Rollback
```bash
git checkout main
git branch -D v8-refactor
# Start på nytt
```

### Debug
1. Sjekk DevTools Console for errors
2. Sjekk DevTools > Application > Service Workers
3. Sjekk DevTools > Application > Local Storage
4. Clear cache: DevTools > Application > Clear storage

### Ask for help
Hvis Claude Code gjør noe rart:
```
Stop! Forklar hva du gjorde og hvorfor det ikke fungerte.
Kan du fikse dette spesifikke problemet?
```

---

## 🎯 Success Criteria

Du er ferdig når:

- [ ] All HTML har <div id="header-placeholder"> i stedet for lang header
- [ ] Ingen `onclick=""` i HTML
- [ ] Service Worker cacher alt i STATIC_ASSETS
- [ ] App fungerer 100% offline
- [ ] Ingen console errors
- [ ] Lighthouse score 95+ på alle metrics
- [ ] README oppdatert
- [ ] Du faktisk vil bruke dette i stedet for start.me!

---

## 🚀 Klar til å starte?

Kopier CLAUDE_CODE_PROMPT.md til Claude Code og la AI-magien skje! ✨

---

**Bonus:** Når alt er ferdig, kan du publisere på Product Hunt med:
- "start.me alternative built in 7 days with Claude Code"
- Vis før/etter Lighthouse scores
- Showcase nye features (collections, stats, etc.)

Lykke til! 🎉
