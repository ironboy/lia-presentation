# lia-presentation
Lia-presentation byggd med MARP + Mrs Marper

## Viktigt! Installera Ghossctscript
För att skapande/komprimering av PDF:er ska fungera:

GhostScript måste vara installerat på datorn och tillgängligt som en global path via kommandot 'gs' i terminalen/shell. Se installationsinställningar:

#### Windows (samt Linux Snap)
https://ghostscript.com/releases/gsdnld.html 

*Notera:* Välj rätt OS + AGPL License

#### Mac     
```
brew install ghostscript
```

*Notera:* Installera HomeBrew först om ej tidigare installerat: https://brew.sh

#### Debian/Ubuntu
```
sudo apt-get -y install ghostscript
```

## Installera
1. Se till att Node.js är installerat!
2. Använd VSC (Visual Studio Code) som din kodeditor. Ställ in enligt bloggen.
3. I Visual Studio Code installerar du följande extension/tillägg: Marp for VS Code.
4. I terminalen (inne i VSC) kör  du kommandot **npm install**.

## Titta på markdown och preview som Marp i VSC
Förutsätter att du installerat Marp för VS Code:
1. Öppna index.md
2. Klicka på preview-symbolen uppe i högre hörnet (sidor med förstoringsglas).
3. Notera: Utseendet styrs av filen *theme.css* - men du måste ställa in detta en gång i VSC: Klicka på Marp-symbolen och välj "Open extension settings", sedan på *Add item* längst ner i listan och skriv in "./theme.css"


## Generera färdig HTML och PDF från markdown
1. I terminalen i VSC, skriver du  **npm run make**.
2. En mapp med namnet **dist** skapas med en html-version och en PDF-version av presentationen.

(Obs! Använd *inte* Marp-extensionens "Export slide deck" - den ger inte lika bra resultat som **npm run make**.)

### Skapa ett eget repo från detta.
1. Vi rekommenderar inte att forka detta repo, kopiera istället över koden i ert eget repo.
2. Glömt inte att få med **.gitignore** - det är viktigt att *node_modules* och *dist*-mapparna ignoreras i Git, vilket redan är inställt korrekt.
3. Vill ni börja med Python-kod (eller Java-kod) i repot, justera  **.gitignore** för detta så att onödiga filer ej tas med! Just nu är **.gitgnore** optimerad för Node.js-baserade projekt.