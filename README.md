# Belangrijk!
Als je deze als server wilt runnen, moet je een mysql db hebben runnen. je kan hiervoor de mysql workbench bestand gebruiken voor de db layout, en dan moet je een `secrets.json` bestand maken in deze directory en het volgende in zetten:

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