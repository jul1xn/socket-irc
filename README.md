# Belangrijk!
Voordat je iets doet, run het command `npm i` in je terminal om alle packages te installeren.

Als je deze als server wilt runnen, moet je een mysql db hebben draaien. je kan hiervoor de mysql workbench bestand gebruiken voor de db layout, en dan moet je een `secrets.json` bestand maken in deze directory en het volgende in zetten:
```
{
    "mysql_connection": {
        "host": "",
        "user": "",
        "password": "",
        "database": ""
    }
}
```

Je kan het server starten door `npm start` in een terminal uit te voeren of `npm run dev` uit te voeren om constant alles te reloaden als er changes zijn.
