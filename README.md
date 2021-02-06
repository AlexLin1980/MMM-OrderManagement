# MMM-OrderManagement

Dies Anwendung ist technisch ein Modul, welches Framework und Ablaufumgebung
von [MagicMirror²](https://github.com/MichMich/MagicMirror/) nutzt.

OrderManagement (kurz: OM) interagiert vollständig asynchron mit einem Magento-Shopsystem über
REST-API-Calls via XML bzw. JSON. Es holt neue Bestellungen ab und verwaltet diese
in einer einfachen Bedienoberfläche. 
Dabei werden über PUSH - Operationen der API Status bzw. Lieferzeitpunkt der Bestellung
verändert. 
Schnittstellen sind ein Thermal-Printer (80mm) für den Druck der Bestellung.
In dem Projekt wird ein 2,5" Touch-Display benutzt, kann aber auch für Desktop mit Maus-Bedienung
genutzt werden.

## Installation
Im lokalen MagicMirror-Verzeichnis folgende Befehle ausführen:

```
git clone https://github.com/AlexLin1980/MMM-OrderManagement.git
cd MMM-OrderManagement
npm install
```

## Updates
Im lokalen MagicMirror-Verzeichnis folgende Befehle ausführen
```
git pull
npm install
```
## Using the module

Um diese Modul in der MagicMirror² - Umgebung zu nutzen und einzustellen, editiere die `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-OrderManagement',
            config: {
                // See below for configurable options
            }
        }
    ]
}
```

## Configuration options

| Option           | Description
|----------------- |-----------
| `magentoEndpoint`                  | *Required* Root-URL zur Remote Magento-Shop - API <br>Default (Demo-Shop): "https://m3.pizza-web.de/api/rest/orderxml/" <br>**Type:** `String`
| `singleOrderAccess`        | *Required* URL-Part für API-Einstelzugriffe <br>Default (Demo-Shop): "orderdelivery/"<br>**Type:** `String`
| `apiMethodNewOrders`                | *Required* URL-Part für API-Sammelzugriffe <br>Default (Demo-Shop): "getneworders"<br>**Type:** `String`
| `login`                | *Required* REST-API Benutzername <br>Default (Demo-Shop): "inchAcc422"<br>**Type:** `String`
| `password`                | *Required* REST-API Passwort <br>Default (Demo-Shop): "Nfu48Dwww"<br>**Type:** `String`
