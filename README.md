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

![alt Überblick](https://github.com/AlexLin1980/MMM-OrderManagement/blob/main/img/Software.png)

## Voraussetzungen
Die Anwendung erfordert MagicMirror v2.13.0.<br>
Der Quellcode basiert auf NodeJS v10.23.0.<br>
Für die genutzten Bibliotheken wird Node Package Mangager '''npm''' v6.14.8 verwendet.<br>
Für die Einrichtung von Druckern (hier Thermal-Bondrucker) ist die Installation und Einrichtung
von ```CUPS``` erforderlich (s. https://www.cups.org/).


Weiteres:

Für Autostart und automatische Updates via 
```git pull```
wird das Tool 
```pm2``` (s. https://www.npmjs.com/package/pm2) benötigt.
     

## Installation LCD (Touchdisplay 2,4"):

Kommandozeile öffnen und folgende Befehle absetzen:

```sudo rm -rf LCD-show```<br>
```git clone https://github.com/goodtft/LCD-show.git```<br>
```chmod -R 755 LCD-show```<br>
```cd LCD-show/```<br>

#### Beispiel:  2.4” RPi Display (MPI2401):
#### Treiber installieren:
sudo ./LCD24-show
#### WIKI zu dem Treiber:
CN: http://www.lcdwiki.com/zh/2.4inch_RPi_Display  <br>
EN: http://www.lcdwiki.com/2.4inch_RPi_Display

## Installation Drucker

Die Anwendung druckt PDF-basierte Quittungen / Bons auf den Drucker, der mit dem Namen 
```pos80``` eingerichtet ist. 
Dafür ist der Drucker mit den mitgelieferten Linux-Bibliotheken zu installieren
und in CUPS einzurichten.


## Installation des Moduls
Im lokalen MagicMirror-Verzeichnis folgende Befehle ausführen:

```
git clone https://github.com/AlexLin1980/MMM-OrderManagement.git
cd MMM-OrderManagement
npm install
```
ACHTUNG: Je nach Softwarestand kann ein electron-rebuild erforderlich
werden. Hier mal Google bemühen im Kontext MagicMirror und electron.

## Update für dieses Modul (Optional)
Im lokalen MagicMirror-Verzeichnis folgende Befehle ausführen:
```
git pull
npm install
```
## Automatische Updates einspielen vor jedem Start (Optional)
Über Remote-SSH-Verbindung eine Kommandozeile öffnen, bzw.
über rdesktop von Linux oder RemoteDesktop von Windows auf
den Raspberry gehen. Und dann am besten eine Shell öffnen.
Hierzu ist die mm.sh einmalig zu editieren. 
```
pm2 stop mm
sudo nano mm.sh
```
Der Inhalt sollte so aussehen: 

```
cd ./MagicMirror/modules/MMM-OrderManagement
#Update einspielen und installieren
git pull https://github.com/AlexLin1980/MMM-OrderManagement
npm install
#Modul starten
cd ~/MagicMirror/
DISPLAY=:0 npm start
```
Mit Strg+O speichern und Strg+X verlassen.

Abschließend Neustart des Systems:
```
sudo reboot now
```

## Verwendung dieses Moduls

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

## Konfiguration des Moduls

| Option           | Description
|----------------- |-----------
| `magentoEndpoint`                  | *Required* Root-URL zur Remote Magento-Shop - API <br>Default (Demo-Shop): "https://m3.pizza-web.de/api/rest/orderxml/" <br>**Type:** `String`
| `singleOrderAccess`        | *Required* URL-Part für API-Einstelzugriffe <br>Default (Demo-Shop): "orderdelivery/"<br>**Type:** `String`
| `apiMethodNewOrders`                | *Required* URL-Part für API-Sammelzugriffe <br>Default (Demo-Shop): "getneworders"<br>**Type:** `String`
| `login`                | *Required* REST-API Benutzername <br>Default (Demo-Shop): "inchAcc422"<br>**Type:** `String`
| `password`                | *Required* REST-API Passwort <br>Default (Demo-Shop): "Nfu48Dwww"<br>**Type:** `String`
