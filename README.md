# Hakim Livs AB

Detta projekt är en webbaserad e-handelsapplikation där användare kan bläddra bland produkter, lägga till i kundvagn, och slutföra köp. Administratörer har tillgång till en adminpanel där de kan hantera produkter, kategorier, beställningar och kunder.

##  Kodstruktur och arkitektur

Projektet är strukturerat med ett tydligt fokus på separation av ansvar:
frontend/ – huvudmapp för hela användargränssnittet.
auth/ – hanterar registrering och inloggning.
dashboard/ – adminpanel med sidor och funktioner för att hantera e-handelns innehåll.
img/ – bilder för gränssnittet.
src/ – kärnan för frontendlogik och stil:
css/ – två separata CSS-filer för layout och shop.
icons/ – ikoner och grafiska element.
scripts/ – all JavaScript 
utils/ – innehåller api.js med återanvändbara funktioner för API-anrop.
Startsidan och checkout-sidan ligger direkt i roten av frontend/.

##  Setup och installation

Projektet kräver inga speciella beroenden eller installationer för att komma igång.
För att köra projektet:
- Klona projektet.
Backend nås via:
https://hakim-livs-g05-be.vercel.app/ – REST API med olika endpoints för produkter, beställningar, kategorier m.m.
Ingen lokal databas behöver installeras – projektet använder ett externt hostat backend-API.

##  Kodbibliotek & teknologier 

Använda teknologier:
Vanilla JavaScript – för all logik på klientsidan.
Bootstrap och CSS – för styling och komponenter.
REST API – för kommunikation mellan frontend och backend.

##  Hjälp-funktioner (t.ex för API-anrop)

För att hantera API-anrop används en centraliserad fil:
utils/api.js – innehåller återanvändbara funktioner för att hämta och skicka data till backend. Dessa används konsekvent genom projektet.

Andra hjälpverktyg inkluderar:
Session- och lagringshantering via localStorage och sessionStorage.

##  Förbättringspunkter

Det finns flera förbättringsområden som identifierats:
Bättre felhantering vid API-anrop och användarinteraktion.
Mer strukturerad koduppdelning i t.ex. komponenter eller vyer.
Utökad responsivitet och mobilanpassning.