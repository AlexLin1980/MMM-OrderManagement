/* global Module */

/* Magic Mirror
 * Module: MMM-OrderManagement
 *
 * By Alexander Lindhorst (c) 2021 
 * MIT Licensed.
 *
 */


Module.register("MMM-OrderManagement", {
	defaults: {
		magentoEndpoint: "https://m3.pizza-web.de/api/rest/orderxml/",
		singleOrderAccess: "orderdelivery/",
		apiMethodNewOrders: "getneworders",
		login: "inchAcc422",
		password: "Nfu48Dwww",				
		updateInterval: 15 * 1000,
		retryDelay: 5000,
		 // The minimum width for all the buttons.
      minWidth: "0px",
        // The minimum height for all the buttons.
      minHeight: "0px",
      preferencesIconUrl: "modules/MMM-OrderManagement/img/preferences.png",
       
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

    start: function() {

        console.log(this.name + " has started...");
		  
		  this.isShopDisabled = false;
		  this.newOrderList = {};
		  this.retrievedOrderList = {};
		  this.newOrderDetail = null;
		  this.isImmediate = false;
		  this.isPolling = false;
		  this.orderList = [];
		  this.selectedOrderId = null;
		  this.selectedOrder = {};
		  //Bestellungen fertig geladen
		  this.loaded = false;		  
		  //Details zur ersten Bestellung fertig geladen
		  this.orderDetailLoaded = false;
		  //Shop Status setzen noch nicht zurückgemeldet;
        this.sendSocketNotification("CONFIG", this.config);
        //this.state= "instantOrderPopup";
        this.state= "overview";
        //Das brauchen wir, um uns den Inhalt des gewählten Buttons zu
        //merken, z.B. bei Lieferzeit ändern
        this.buttonText = null;
        this.updateInterval = 15*1000;
        this.detailUpdateInterval = 5 * 1000;
        if(!this.isShopDisabled){
				  this.sendSocketNotification("GET_NEW_ORDERS", "");     
        } else {
				this.state = "preferences";        
        }
    },

    getStyles: function () {
        return [this.file('css/MMM-OrderManagement.css'),'font-awesome.css'];
    },
    
    getScripts: function () {
        return ['moment.js'];
    },

    // Override dom generator.
    getDom: function() {
    	
			var wrapper = document.createElement("div");    			
			switch(this.state) {
			case "instantOrderPopup":				
					wrapper.appendChild(this.getInstantOrderView());								
				break;
			case "changeDeliveryTimePopup" :
					wrapper.appendChild(this.getLieferzeitAendernPopup());
				break;				
			case "overview":
				wrapper.appendChild(this.getOrderOverview());
				break;			
			case "orderController":
				wrapper.appendChild(this.getBestellungBearbeitenDialog());
				break;
			case "preferences":
				wrapper.appendChild(this.getPreferencesDialog());
				break;				
			default:
				wrapper.appendChild(this.getOrderOverview());				
				break;
				}
        return wrapper;
    },

	
	getBestellungBearbeitenDialog : function () {
		  var self = this;
		  var menu = document.createElement("div");
		  menu.className="modulebar-menu";
			  
			var headline = document.createElement("span");
			headline.className = "modulebar-header";
			headline.innerHTML = "Bestellung " + self.selectedOrder.OrderNumber + " ändern";	 	  
			menu.appendChild(headline);		  
		  var div = document.createElement("div");
		  div.className="button-row";			
        menu.id = this.identifier + "_menu";             
        div.appendChild(this.createButton(this, "1", "Bestellung ausdrucken", "100", "PRINT_ORDER"));
        menu.appendChild(div);
        var div2 = document.createElement("div");
        div2.className="button-row";
        div2.appendChild(this.createButton(this, "2", "Lieferzeit ändern", "100", "CHANGE_DELIVERY_TIME"));
        menu.appendChild(div2);
        var div3 = document.createElement("div");
		  div3.className="button-row"; 	
        div3.appendChild(this.createButton(this, "3", "Küche", "50", "UPDATE_ORDER"));
        div3.appendChild(this.createButton(this, "4", "Wird geliefert", "50", "UPDATE_ORDER"));
		  menu.appendChild(div3);
		  var div4 = document.createElement("div");
		  div4.className="button-row";                  
        div4.appendChild(this.createButton(this, "5", "Zugestellt", "100", "UPDATE_ORDER"));
        menu.appendChild(div4);       
        var div5 = document.createElement("div");
        div5.className="button-row";
        div5.appendChild(this.createButton(this, "6", "Stornieren", "50", "UPDATE_ORDER"));        
        div5.appendChild(this.createButton(this, "7", "Zurück", "50", "BACK_TO_ORDERLIST"));
        menu.appendChild(div5);
        return menu;			
	},
	
	getLieferzeitAendernPopup : function () {
		  var self = this;
		  var menu = document.createElement("div");

		   menu.className="modulebar-menu "//-popup";
			var headline = document.createElement("span");
			headline.className = "modulebar-header";
			headline.innerHTML = "Lieferzeit ändern";	  
		   menu.appendChild(headline);
		   var div = document.createElement("div");
		   div.className="button-row";
		   var div2 = document.createElement("div");
		   div2.className="button-row";
		   var div3 = document.createElement("div");
		   div3.className="button-row";
		   var div4 = document.createElement("div");
		   div4.className="button-row";
	      menu.id = this.identifier + "_menu";	      
         div.appendChild(this.createButton(this, "1", "30", "50", "UPDATE_ORDER_TIME"));
         div.appendChild(this.createButton(this, "2", "45", "50", "UPDATE_ORDER_TIME"));
         menu.appendChild(div);
         div2.appendChild(this.createButton(this, "3", "60", "50", "UPDATE_ORDER_TIME"));
         div2.appendChild(this.createButton(this, "3", "75", "50", "UPDATE_ORDER_TIME"));
		   menu.appendChild(div2);
         div3.appendChild(this.createButton(this, "4", "90", "50", "UPDATE_ORDER_TIME"));
         div3.appendChild(this.createButton(this, "5", "120", "50", "UPDATE_ORDER_TIME"));
			menu.appendChild(div3);
			//Wenn wir aus dem Bearbeiten-Menü kommen, wollen wir auch wieder zurück
			//Bei Sofort-Bestellungen muss der Button entfallen
			if (!self.isImmediate){
				div4.appendChild(this.createButton(this, "6", "Zurück", "100", "BACK_TO_CONTROLLER"));
				menu.appendChild(div4);
			}
       return menu;			
	},
	// TODO: Auslagern
	translateDeliveryStatusToApi : function(pText){
		switch(""+pText) {
			case "Küche" :
				return "kitchen";				
			break;
			case "Wird geliefert" : 
				return "in_delivery";
			break;
			case "Erhalten" : 
				return "received";
			break;
			case "Fehler" :
				return "error";
			break;
			case "Stornieren" :
				return "canceled";
			break;
			case "Zugestellt" :
				return "delivered";
			break;
			case "Neu":
				return "new";
			break;
			default: 
				return null;
			break;							
			}
	},
	//TODO: Auslagern
	translateDeliveryStatusFromApi : function(pText){
		switch(""+pText) {
			case "kitchen" :
				return "Küche";				
			break;
			case "in_delivery" : 
				return "Wird geliefert";
			break;
			case "received" : 
				return "Erhalten";
			break;
			case "error" :
				return "Fehler";
			break;
			case "canceled" :
				return "Storniert";
			break;
			case "delivered" :
				return "Zugestellt";
			break;
			case "new" :
				return "Neu";
			break;
			default: 
				return null;
			break;							
			}	
	},
	

	getInstantOrderView : function () {
		 var self = this;
		 var menu = document.createElement("div");
		menu.className = "modulebar-menu";  
		if (self.loaded && self.orderDetailLoaded){
				//Erstes Element nehmen
				var pOrder = self.newOrderDetail;
				pOrder.OrderNumber = self.newOrderList.Order[0]["OrderNumber"];
				//console.log("Rendere: " +JSON.stringify(pOrder));
				var headline = document.createElement("span");
				headline.className = "modulebar-header";
				headline.innerHTML = "Neue Bestellung (" + pOrder.OrderNumber + ")";	  
				menu.appendChild(headline);				
				var div = document.createElement("div");
				div.className="newOrder";				
				var subheadline 	= document.createElement("span");
				subheadline.className = "modulebar-text";
				subheadline.innerHTML = "Gewünschte Lieferzeit:";
				div.appendChild(subheadline);
				menu.appendChild(div);	
				var deliveryTimeText 	= document.createElement("span");
				deliveryTimeText.className= "modulebar-text";										
				
				if (pOrder.DeliveryTime[0].indexOf("Sofort") === -1){
					var hourMinute = pOrder.DeliveryTime[0].split(":");
					let d = moment().set({"hour": hourMinute[0], "minute": hourMinute[1]}).toDate();  
					deliveryTimeText.innerHTML = (d.getHours() <10 ? "0"+d.getHours() : d.getHours())+ ":" + 
						(d.getMinutes() <10? "0"+d.getMinutes(): d.getMinutes());
					
				} else {
					self.isImmediate = true;
					deliveryTimeText.innerHTML ="Sofortlieferung";
				}					
				menu.appendChild(deliveryTimeText);
				 
		     	 var footer = document.createElement("span");
				 footer.innerHTML = "Annehmen >";	  
				 footer.className= "modulebar-button50";
				 footer.addEventListener("mouseover", ()  => footer.style ="background-color: #fff;color: #000;");
				 footer.addEventListener("mouseout",   ()  =>	footer.style ="background-color: #000;color: #fff;");		
				
				 footer.addEventListener("click", function () {
				 
				 	let pdfbase64 = self.sendSocketNotification("PRINT_ORDER", JSON.stringify(
				 								 	self.newOrderList.Order[0]["OrderPDF"]));
				 	pOrder.DeliveryStatus = "received";		
				 	//pOrder.OrderNumber = self.newOrderList.Order[0]["OrderNumber"];					 	
				 	self.orderList.push(pOrder);
				 	self.selectedOrder = pOrder;				 		
				 	self.newOrderList.Order.splice(0, 1);				 		
				 	self.newOrderDetail = null;	
				 	
				 	if (self.isImmediate){
							self.state="changeDeliveryTimePopup";									
							self.updateDom();		 	
				 		} else {
				 		self.state="overview";
						self.sendSocketNotification("UPDATE_ORDER", JSON.stringify(pOrder));								 		
						self.updateDom();										 		
				 	}				 	
				 });		
				 menu.appendChild(footer);
		} else {
			var wait = document.createElement("span");
			wait.innerHTML ="Bestellungen werden ermittelt...";
			menu.appendChild(wait);		
		}
		return menu;
	},	
	
	getOrderOverview : function () {
		var self = this;
		var div = document.createElement("div");
		div.className = "modulebar-menu";
								
		var span = null;
		var orderId = null;
		var orderStatus = null;		
		var orderNumber = null;			
		var divTable = document.createElement("div");
		divTable.className = "divTable";
		let divRow = document.createElement("div");
		divRow.className = "divRow";				

		let divCellLeft = document.createElement("div");
		let divCellMiddle = document.createElement("div");
		let divCellRight = document.createElement("div");

		divCellLeft.className= "divCell";
		divCellRight.className= "divCell25";
		divCellMiddle.className= "divCell25";

		var spanLeft = document.createElement("span");
		spanLeft.innerHTML = "Bestellnummer";
		var spanRight = document.createElement("span");
		spanRight.innerHTML = "Status";

		divCellLeft.appendChild(spanLeft);
		divCellMiddle.appendChild(spanRight);
								
		let img = document.createElement("img");
		img.id = "preferences";
		img.src = self.config.preferencesIconUrl;
		img.style = "width:32px;height:32px;"		
		img.addEventListener("click", function () {
			//item.style ="background-color: #fff;color: #000;";
			//alert("Test: " + item.id);
				self.state = "preferences";
				self.updateDom();
		  		//self.sendSocketNotification("GET_NEW_ORDERS", {});
		});				
		divCellRight.appendChild(img);
		divRow.appendChild(divCellLeft);
		divRow.appendChild(divCellMiddle);
		divRow.appendChild(divCellRight);		
		divTable.appendChild(divRow);
		//Sortieren nach Neuester zuerst (= höchste Order-ID)
		self.orderList.sort(function (a, b){
			return b.OrderID - a.OrderID;
		});
		
		for (var i = 0; i<self.orderList.length;i++){
				
				let divRow = document.createElement("div");
				divRow.className = "divRow";				
				divRow.id = "divRow_" +i; 
				let order = self.orderList[i];
				orderId = order.OrderID;				
				orderNumber = order.OrderNumber;
				orderStatus = order.DeliveryStatus;
				
				let divCellLeft = document.createElement("div");				
				let divCellRight = document.createElement("div");
				divCellLeft.className= "divCell";				
				divCellRight.className= "divCell";
				//li = document.createElement("li");
				let spanLeft = document.createElement("span");				
				let spanRight = document.createElement("span");
				
				spanLeft.innerHTML = orderNumber;
				spanRight.innerHTML = this.translateDeliveryStatusFromApi(orderStatus);
				divCellLeft.appendChild(spanLeft);
				divCellRight.appendChild(spanRight);							

				divRow.appendChild(divCellLeft);
				divRow.appendChild(divCellRight);
				// When a button is clicked, the module either gets hidden or shown depending on current module status.
				divRow.addEventListener("click", function () {
					self.selectedOrderId = orderId;
					self.selectedOrder = order;
					self.state = "orderController";
					self.updateDom();
				});		
				divRow.addEventListener("mouseover", ()  => divRow.style ="background-color: #fff;color: #000;");
				divRow.addEventListener("mouseout",   ()  =>	divRow.style ="background-color: #000;color: #fff;");		
				divTable.appendChild(divRow); 		
		} 
		div.appendChild(divTable);
		return div;		
	},
		
	getPreferencesDialog: function(){
		var self = this;
		var div = document.createElement("div");
		div.className = "modulebar-menu";
		var headline = document.createElement("span");
		headline.className = "modulebar-header";
		headline.innerHTML = "Einstellungen";
		div.appendChild(headline);
		
		var divShopMain = document.createElement("div");
		var divShopLeft = document.createElement("div");
		var divShopRight = document.createElement("div");
		divShopLeft.className="modulebar-left50";
		divShopRight.className="modulebar-right50";
		var text = document.createElement("span");
		text.className="modulebar-textleft";
		text.innerHTML = "Shop schließen";
		divShopLeft.appendChild(text);
		divShopMain.appendChild(divShopLeft);
		
		//Cooler Button	
		var onOffSwitch = document.createElement("div");
		onOffSwitch.className="switch";
		var input = document.createElement("input");
		input.id = "switch1";
		input.type = "checkbox";
		input.checked = (self.isShopDisabled ===false ? "checked" : "");
		//Setzen, wenn der Shop geschlossen ist
		input.addEventListener("change", function () {
			self.isShopDisabled = !self.isShopDisabled;
			self.sendSocketNotification("CLOSE_OR_OPEN_SHOP", JSON.stringify(self.isShopDisabled));	
		});		
		
		onOffSwitch.appendChild(input);	
		var outerspan = document.createElement("span");
		outerspan.className = "buttonbackground";
		var innerspan = document.createElement("span");
		innerspan.className = "buttonslider";
		
		var newlabel = document.createElement("Label");		
		newlabel.setAttribute("for","switch1");
		newlabel.appendChild(outerspan);
		outerspan.appendChild(innerspan);
		onOffSwitch.appendChild(newlabel);
			
		divShopRight.appendChild(onOffSwitch);
		divShopMain.appendChild(divShopRight);		
		
		var divTable = document.createElement("div");
		divTable.className = "divTable";
		let divRow = document.createElement("div");
		divRow.className = "divRow";
		let divRow2 = document.createElement("div");
		divRow2.className = "divRow";				

		let divCellLeft = document.createElement("div");
		let divCellLeft2 = document.createElement("div");
		let divCellRight = document.createElement("div");
		let divCellRight2 = document.createElement("div");		
		divCellLeft.className= "divCell";
		divCellLeft2.className= "divCell";
		divCellRight.className= "divCell";
		divCellRight2.className= "divCell";
	
		var spanLeft = document.createElement("span");
		spanLeft.innerHTML = "Herunterfahren";
		divCellLeft.appendChild(spanLeft);	
				
		var spanLeft2 = document.createElement("span");
		spanLeft2.innerHTML = "Neu starten";
		divCellLeft2.appendChild(spanLeft2);		
		
		var imgLogOff = document.createElement("img");
	   imgLogOff.src= "modules/MMM-OrderManagement/img/shutdown.png";
	   //imgLogOff.style ="width:32px;height:32px";

		imgLogOff.addEventListener("click", function(){
			self.sendSocketNotification("SHUTDOWN", "");					
		});	   
		divCellRight.appendChild(imgLogOff);	   	   
		divRow.appendChild(divCellLeft);
		divRow.appendChild(divCellRight);
	   divTable.appendChild(divRow);
	   
		var imgRestart = document.createElement("img");
	   imgRestart.src= "modules/MMM-OrderManagement/img/restart.png";
	   //imgRestart.style ="width:32px;height:32px";
	   
		imgRestart.addEventListener("click", function(){
			self.sendSocketNotification("RESTART", "");					
		});
		divCellRight2.appendChild(imgRestart);
		divRow2.appendChild(divCellLeft2);
		divRow2.appendChild(divCellRight2);	   	   
	   divTable.appendChild(divRow2);
		divShopMain.appendChild(divTable);
		div.appendChild(divShopMain);
		//Zurück-Button
		var divBack = document.createElement("div");
		divBack.className="divFloatRight";
		divBack.appendChild(this.createButton(this, "1", "Zurück", "50", "BACK_TO_ORDERLIST"));
		div.appendChild(divBack);
		return div;		
	},
		// Creates the buttons.
    createButton: function (self, id, text, width, notification) {
		// Creates the span element to contain all the buttons.
		var item = document.createElement("span");
        // Builds a unique identity / button.
		item.id = self.identifier + "_button_" + id;
        // Sets a class to all buttons.
		item.className = "modulebar-button"+width;
        // Makes sure the width and height is at least the defined minimum.
		item.style.minWidth = self.config.minWidth;
      item.style.minHeight = self.config.minHeight;
        
		if (text) {
            var buttonText = document.createElement("span");
            buttonText.className = "modulebar-text";
            buttonText.innerHTML = text;	
			// Adds the text to the item.
            item.appendChild(buttonText);
      }	
		item.addEventListener("mouseover", ()  => item.style ="background-color: #fff;color: #000;");
		//item.addEventListener("mouseout",   ()  =>	item.style ="background-color: #000;color: #fff;");
		item.addEventListener("mouseout",  function () {
			if (!this.clicked){
				this.style ="background-color: #000;color: #fff;";
			}
		}); 						
		item.addEventListener("click", function () {			
			 item.style ="background-color: #fff;color: #000;";
			 
			// Ereignisse zu den Buttons steuern und Werte setzen			  
		 	  if (notification){		 	  	
		 	  		if (notification === "UPDATE_ORDER"){
		 	  			// Bei Statusänderungen reagieren wir hier speziell
						self.selectedOrder.DeliveryStatus = self.translateDeliveryStatusToApi(text);
						self.sendSocketNotification(notification, JSON.stringify(self.selectedOrder));
						//Testen
						self.state="overview";
						self.updateDom();		 	  		
		 	  		} 
		 	  		else if (notification === "UPDATE_ORDER_TIME"){
		 	  			
						//Die Lieferzeit wird geändert, indem zur aktuellen Zeit die gewählte gedrückt wird.
						let mom  = moment().add(text, 'minutes');												
						self.selectedOrder.DeliveryTime = mom.format("YYYY-MM-DD LT");								
						self.sendSocketNotification("UPDATE_ORDER", JSON.stringify(self.selectedOrder));
						//TODO2: testen
						self.state="overview";
						self.updateDom();								 		
		 	  		} 
		 	  		else if (notification === "PRINT_ORDER"){
		 	  			//TODO: Ich muss schon die richtige erwischen
							//let pdfbase64 = self.sendSocketNotification("PRINT_ORDER", JSON.stringify(
				 			//self.newOrderList.Order[0]["OrderPDF"]));
				 			let pdfbase64 = self.sendSocketNotification("PRINT_ORDER", JSON.stringify(
				 			self.selectedOrder.OrderPdf));
							self.state="overview";				 					 					 	  		
		 	  				self.updateDom();
		 	  		}
		 	  		//Noch ein Sonderfall ohne Kommunikation zum Backend
		 	  		else if (notification === "BACK_TO_ORDERLIST"){
						self.state = "overview";
						self.updateDom();			  
				  } else if (notification === "BACK_TO_CONTROLLER"){
				  		self.state = "orderController";
						self.updateDom();
				  	} 				  
				  else {
				  	 self.sendSocketNotification(notification, JSON.stringify(self.selectedOrder));
				  }			  		
			  } 	
			  //Hier die Buttons, die keine notification auslösen
			  //Ist gedacht für Lieferzeit ändern
			  else {
					self.buttonText = text;			  
			  }
		});
        return item;
    },

		//Falls man das mal braucht
    notificationReceived: function(notification, payload, sender) {        
        if (notification === "Recieved") {
            //this.doMenuAction(payload);
            console.log("Hi")
        }
    },

    //Recieve notification from sockets via nodehelper.js
    socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "NEW_ORDERS_RECEIVED":
          
        console.log("Habe neue Bestellungen ermittelt.");
        //this.state = "instantOrderPopup";
        this.state = "overview";
        this.retrievedOrderList = JSON.parse(payload);
        
        //HACK: Die Liste sollte beim Abarbeiten nicht durch die identische überschrieben werden
        //Wir holen dann zeitversetzt die neuen ab. Das geht wohl auch eleganter...
        if (!this.newOrderList.Order && !Array.isArray(this.newOrderList.Order)){
        		this.newOrderList = this.retrievedOrderList;		
     	  }
        //console.log ("und hier sind sie: " + this.newOrderList);                
        this.sendSocketNotification("GET_ORDER_DETAIL", JSON.stringify(this.newOrderList.Order[0]));                	
		        	
        	/*if (!this.loaded) {
				this.scheduleUpdateInterval();
			}*/
			this.loaded = true;        
			//Wenn Bestellungen initial geladen, erstmal mit pollen aufhören
			this.unSchedulePolling();
			this.isPolling = false;
			this.updateDom();
      break;

		case "ORDER_DETAIL_RECEIVED": 
			//Wenn die Bestelldetails ermittelt sind, können Sie in der Anwendung
			//bearbeitet werden, wenn noch nicht, dann wiederholen
			this.unSchedulePolling();
			this.isPolling = false;
   		this.timer = null;
			this.state = "instantOrderPopup";
			this.newOrderDetail = JSON.parse(payload);			
			/*if (!this.orderDetailLoaded){
				this.scheduleUpdateInterval();
			}*/
			this.orderDetailLoaded = true;
			//TODO
			this.updateDom();			
			
		break;      
   
      case "ORDERS_EMPTY": 
   		//Wenn keine Bestellungen da sind, weiter pollen und
   		//in die Übersicht wechseln bzw. in den Shop-Einstellungen bleiben   		   	
      	if (!this.state === "preferences"){
      		 this.state = "overview";
      	}
			console.log("Keine neuen Bestellungen vorhanden.");
			if (!this.isPolling){
				this.schedulePolling();				
			} 
			this.isPolling = true;
			this.updateDom();
      break;
      
      case "ORDER_UPDATE_SUCCESSFUL":
      	this.isImmediate = false;
			//Wir haben eine Bestellung nachträglich geändert. Es ist keine Queue
			//von weiteren Bestellungen da.      	
      	if (!this.newOrderList.Order && !Array.isArray(this.newOrderList.Order)){
				   this.state = "overview";    				
					this.updateDom();   		
      	} else {
	      	//Falls noch eine neue Bestellung abzuarbeiten ist, dann jetzt!
	      	if (this.newOrderList.Order.length> 0){
					 this.state = "instantOrderPopup";
					 console.log("Jetzt wird die nächste Bestellung ermittelt. ");
					 this.sendSocketNotification("GET_ORDER_DETAIL", JSON.stringify(this.newOrderList.Order[0]));
	      	} else {
	      		//Alle Bestellungen abgearbeitet? Dann zur Bestellübersicht.
	      		//Polling wieder aktivieren
	      		this.newOrderList = {};
	      		if (!this.isPolling){
						this.schedulePolling();				
					} 
					this.isPolling = true;
					this.state = "overview";    				
					this.updateDom();  	
	      	}
      	}
      break;
      
      case "DELIVERY_TIME_DIALOG":
      	this.state = "changeDeliveryTimePopup";
      	this.selectedOrder = JSON.parse(payload);      	
      	console.log("Rufe nun Eingabe der neuen Lieferzeit auf.");
      	this.updateDom();
      break;      
      
      case "SHOP_OPEN_CLOSE_SUCCESSFUL":
   		//Wir gehen davon aus, dass der Status gesetzt wurde,
   		//sonst muss man wieder eine asynchrone Ergebniserwartung aufsetzen
   		//this.isShopDisabled = (JSON.parse(payload));   		
   		if (!this.isShopDisabled){
   			//Neustart nach Wiedereröffnung
				this.state="overview";						
				this.sendSocketNotification("GET_NEW_ORDERS", "");   						
   		} else {
   			//Hört auf nach neuen Bestellungen zu suchen
   			this.isPolling=false;
   			clearTimeout(this.timer);
   			this.timer = null;
				this.state="preferences";
				this.updateDom();			
			}
		break;
		default:
			 if (notification.indexOf("ERROR") >-1){
				 console.log(notification + " Versuche zur Bestellübersicht zu kommen.");			 
			 } else {
				//Jetzt bin ich ratlos			 
			 } 			
		break;	 
 		}
},

/**
	 * Schedule visual update.
	 */
	scheduleUpdateInterval: function () {
		var self = this;
			this.timer = setInterval(function () {
			self.updateDom();

		}, this.config.updateInterval);
	},

	/**
	 * Schedule poll for new Orders.
	 */
	schedulePolling: function () {
		var self = this;
			this.timer = setInterval(function () {		
			self.sendSocketNotification("GET_NEW_ORDERS", "");

		}, this.config.updateInterval);
	},
	
	/**
	 * Schedule poll for new Orders.
	 */
	unSchedulePolling: function () {
		var self = this;
		clearTimeout(this.timer);
		this.timer = null;		
	},
	
	
	
});