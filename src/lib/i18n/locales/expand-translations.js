// Script to expand translation files - run with: node src/lib/i18n/locales/expand-translations.js
const fs = require('fs');
const path = require('path');

const template = {
	"common": {
		"buttons": {
			"save": "Save", "cancel": "Cancel", "delete": "Delete", "edit": "Edit",
			"submit": "Submit", "close": "Close", "back": "Back", "next": "Next",
			"logout": "Logout", "login": "Login", "register": "Register", "create": "Create",
			"update": "Update", "search": "Search", "filter": "Filter", "clear": "Clear",
			"accept": "Accept", "reject": "Reject", "view": "View", "add": "Add", "remove": "Remove",
			"assign": "Assign", "assignCompany": "Assign Company", "setPrice": "Set Price",
			"assignTeam": "Assign Team", "viewDetails": "View Details", "acceptOffer": "Accept Offer",
			"rejectOffer": "Reject Offer", "createFirstOrder": "Create First Order", "newOrder": "New Order",
			"sendOffer": "Send Offer", "updateOffer": "Update Offer", "modifyOffer": "Modify Offer",
			"markAllRead": "Mark all read"
		},
		"labels": {
			"email": "Email", "password": "Password", "name": "Name", "role": "Role",
			"status": "Status", "date": "Date", "time": "Time", "address": "Address",
			"phone": "Phone", "notes": "Notes", "description": "Description",
			"loading": "Loading...", "signingIn": "Signing in...", "signIn": "Sign In"
		},
		"messages": {
			"loading": "Loading...", "error": "Error", "success": "Success",
			"noData": "No data available", "confirm": "Confirm", "areYouSure": "Are you sure?",
			"required": "Required", "noOrdersFound": "No orders found", "noOrdersYet": "No orders yet",
			"allCaughtUp": "All caught up",
			"allCaughtUpMessage": "No new notifications at the moment. We'll let you know when something important happens."
		}
	},
	"login": {
		"title": "Angebots Profi",
		"signInToAccount": "Sign in to your account",
		"emailAddress": "Email Address",
		"enterEmail": "Enter your email",
		"enterPassword": "Enter your password",
		"rememberMe": "Remember me",
		"forgotPassword": "Forgot password?",
		"dontHaveAccount": "Don't have an account?",
		"contactAdministrator": "Contact administrator"
	},
	"sidebar": {
		"dashboard": "Dashboard", "orders": "Orders", "finance": "Finance",
		"employees": "Employees", "users": "Users", "companies": "Companies",
		"settings": "Settings", "transportOrders": "Transport Orders",
		"staffManagement": "Staff Management", "userManagement": "User Management",
		"companySettings": "Company Settings", "myOrders": "My Orders",
		"support": "Support", "myJobs": "My Jobs"
	},
	"orders": {
		"title": "Orders", "newOrder": "New Order", "allOrders": "All Orders",
		"assignedOrders": "Assigned Orders", "myOrders": "My Orders",
		"manageAndAssign": "Manage and assign orders to companies",
		"managePricing": "Manage pricing and team assignments for your orders",
		"searchOrders": "Search orders by client, ID, or location...",
		"searchByOrderId": "Search by order ID or address...",
		"noOrdersFound": "No orders found", "noOrdersYet": "No orders yet",
		"whenCustomersCreate": "When customers create orders, they will appear here for you to assign to companies.",
		"whenYouHaveOrders": "When you have orders, they'll appear here. You can create, manage, and track all your transportation orders from this dashboard.",
		"noOrdersWithStatus": "No orders with {{status}} status found. Try selecting a different filter or create a new order.",
		"connectToLiveData": "Connect to your live data source to see real orders, or switch to demo mode to explore the interface.",
		"whenAssignedOrders": "When you have assigned orders, they'll appear here.",
		"tryAdjustingSearch": "Try adjusting your search or filters",
		"createFirstOrder": "Create your first order to get started",
		"status": {
			"pending": "Pending", "assigned": "Assigned to Company", "offerSent": "Offer Sent",
			"offerAccepted": "Offer Accepted", "offerRejected": "Offer Rejected",
			"scheduled": "Scheduled", "inProgress": "In Progress", "partiallyDone": "Partially Done",
			"completed": "Completed", "cancelled": "Cancelled"
		}
	},
	"stats": {
		"totalOrders": "Total Orders", "pendingOrders": "Pending Orders",
		"pendingOffers": "Pending Offers", "activeOrders": "Active Orders",
		"inProgress": "In Progress", "completed": "Completed"
	},
	"dashboards": {
		"customer": {
			"title": "My Orders",
			"subtitle": "Track and manage your furniture moving orders"
		},
		"siteAdmin": {
			"title": "Site Admin Dashboard",
			"subtitle": "Manage all transportation orders and oversee business operations"
		},
		"companyAdmin": {
			"title": "Company Dashboard",
			"subtitle": "Manage your assigned orders and team operations"
		},
		"superAdmin": {
			"title": "Super Admin Dashboard",
			"subtitle": "Manage all platform users, companies, and orders",
			"users": "Users", "orders": "Orders", "companies": "Companies",
			"settings": "Settings", "settingsComingSoon": "Settings management coming soon..."
		},
		"driver": {
			"title": "My Orders",
			"subtitle": "Manage your assigned orders and transportation tasks"
		},
		"worker": {
			"title": "Worker Dashboard",
			"subtitle": "Manage your job assignments and tasks",
			"rating": "Rating",
			"furnitureAssembly": "Furniture Assembly",
			"packing": "Packing"
		}
	},
	"notifications": {
		"title": "Notifications",
		"allCaughtUp": "All caught up",
		"unreadMessages": "{{count}} unread message",
		"unreadMessagesPlural": "{{count}} unread messages",
		"markAllRead": "Mark all read",
		"allCaughtUpTitle": "All caught up!",
		"allCaughtUpMessage": "No new notifications at the moment. We'll let you know when something important happens.",
		"justNow": "Just now",
		"minutesAgo": "{{count}}m ago",
		"hoursAgo": "{{count}}h ago",
		"daysAgo": "{{count}}d ago"
	},
	"orderSteps": {
		"selectServices": "Select Services",
		"addressesDetails": "Addresses & Details",
		"roomConfiguration": "Room Configuration",
		"scheduleNotes": "Schedule & Notes",
		"createNewOrder": "Create New Order",
		"stepOf": "Step {{current}} of {{total}}: {{title}}",
		"selectServicesYouNeed": "Select the services you need",
		"selectOneOrMore": "You can select one or more services for your order",
		"servicesSelected": "✓ {{count}} service(s) selected"
	},
	"pricingModal": {
		"modifyOffer": "Modify Offer",
		"sendOffer": "Send Offer",
		"order": "Order {{id}}",
		"modifyingVersion": "(Modifying v{{version}})",
		"estimatedHours": "Estimated Hours",
		"hours": "hours",
		"hourlyRate": "Hourly Rate (CHF)",
		"perHour": "per hour",
		"scheduledDateOptional": "Scheduled Date (Optional)",
		"additionalNotesOptional": "Additional Notes (Optional)",
		"specialInstructions": "Any special instructions or details...",
		"totalPrice": "Total Price",
		"hoursCalculation": "{{hours}} hours × CHF {{rate}}/hour",
		"cancel": "Cancel",
		"updateOffer": "Update Offer",
		"sendOfferButton": "Send Offer"
	},
	"services": {
		"furnitureMoving": "Furniture Moving",
		"furnitureMovingDesc": "Professional furniture moving and transportation services",
		"cleaningService": "Cleaning Service",
		"cleaningServiceDesc": "Deep cleaning and maintenance services",
		"painting": "Painting",
		"paintingDesc": "Interior and exterior painting services",
		"packingService": "Packing Service",
		"packingServiceDesc": "Professional packing and unpacking services"
	},
	"locationTypes": {
		"apartment": "Apartment",
		"house": "House",
		"office": "Office",
		"warehouse": "Warehouse",
		"building": "Building"
	}
};

// Translations for each language
const translations = {
	en: template,
	de: {
		common: {
			buttons: {
				save: "Speichern", cancel: "Abbrechen", delete: "Löschen", edit: "Bearbeiten",
				submit: "Absenden", close: "Schließen", back: "Zurück", next: "Weiter",
				logout: "Abmelden", login: "Anmelden", register: "Registrieren", create: "Erstellen",
				update: "Aktualisieren", search: "Suchen", filter: "Filtern", clear: "Löschen",
				accept: "Akzeptieren", reject: "Ablehnen", view: "Anzeigen", add: "Hinzufügen", remove: "Entfernen",
				assign: "Zuweisen", assignCompany: "Firma zuweisen", setPrice: "Preis festlegen",
				assignTeam: "Team zuweisen", viewDetails: "Details anzeigen", acceptOffer: "Angebot annehmen",
				rejectOffer: "Angebot ablehnen", createFirstOrder: "Ersten Auftrag erstellen", newOrder: "Neuer Auftrag",
				sendOffer: "Angebot senden", updateOffer: "Angebot aktualisieren", modifyOffer: "Angebot ändern",
				markAllRead: "Alle als gelesen markieren"
			},
			labels: {
				email: "E-Mail", password: "Passwort", name: "Name", role: "Rolle",
				status: "Status", date: "Datum", time: "Zeit", address: "Adresse",
				phone: "Telefon", notes: "Notizen", description: "Beschreibung",
				loading: "Lädt...", signingIn: "Anmeldung läuft...", signIn: "Anmelden"
			},
			messages: {
				loading: "Lädt...", error: "Fehler", success: "Erfolgreich",
				noData: "Keine Daten verfügbar", confirm: "Bestätigen", areYouSure: "Sind Sie sicher?",
				required: "Erforderlich", noOrdersFound: "Keine Aufträge gefunden", noOrdersYet: "Noch keine Aufträge",
				allCaughtUp: "Alles erledigt",
				allCaughtUpMessage: "Derzeit keine neuen Benachrichtigungen. Wir informieren Sie, wenn etwas Wichtiges passiert."
			}
		},
		login: {
			title: "Angebots Profi",
			signInToAccount: "Melden Sie sich in Ihrem Konto an",
			emailAddress: "E-Mail-Adresse",
			enterEmail: "Geben Sie Ihre E-Mail ein",
			enterPassword: "Geben Sie Ihr Passwort ein",
			rememberMe: "Angemeldet bleiben",
			forgotPassword: "Passwort vergessen?",
			dontHaveAccount: "Haben Sie kein Konto?",
			contactAdministrator: "Administrator kontaktieren"
		},
		sidebar: {
			dashboard: "Dashboard", orders: "Aufträge", finance: "Finanzen",
			employees: "Mitarbeiter", users: "Benutzer", companies: "Unternehmen",
			settings: "Einstellungen", transportOrders: "Transportaufträge",
			staffManagement: "Personalverwaltung", userManagement: "Benutzerverwaltung",
			companySettings: "Firmeneinstellungen", myOrders: "Meine Aufträge",
			support: "Support", myJobs: "Meine Jobs"
		},
		orders: {
			title: "Aufträge", newOrder: "Neuer Auftrag", allOrders: "Alle Aufträge",
			assignedOrders: "Zugewiesene Aufträge", myOrders: "Meine Aufträge",
			manageAndAssign: "Verwalten und zuweisen Sie Aufträge an Unternehmen",
			managePricing: "Verwalten Sie Preise und Teamzuweisungen für Ihre Aufträge",
			searchOrders: "Aufträge nach Kunde, ID oder Standort suchen...",
			searchByOrderId: "Nach Auftrags-ID oder Adresse suchen...",
			noOrdersFound: "Keine Aufträge gefunden", noOrdersYet: "Noch keine Aufträge",
			whenCustomersCreate: "Wenn Kunden Aufträge erstellen, erscheinen sie hier, damit Sie sie Unternehmen zuweisen können.",
			whenYouHaveOrders: "Wenn Sie Aufträge haben, erscheinen sie hier. Sie können alle Ihre Transportaufträge von diesem Dashboard aus erstellen, verwalten und verfolgen.",
			noOrdersWithStatus: "Keine Aufträge mit Status {{status}} gefunden. Versuchen Sie, einen anderen Filter auszuwählen oder erstellen Sie einen neuen Auftrag.",
			connectToLiveData: "Verbinden Sie sich mit Ihrer Live-Datenquelle, um echte Aufträge zu sehen, oder wechseln Sie in den Demo-Modus, um die Oberfläche zu erkunden.",
			whenAssignedOrders: "Wenn Sie zugewiesene Aufträge haben, erscheinen sie hier.",
			tryAdjustingSearch: "Versuchen Sie, Ihre Suche oder Filter anzupassen",
			createFirstOrder: "Erstellen Sie Ihren ersten Auftrag, um zu beginnen",
			status: {
				pending: "Ausstehend", assigned: "Firma zugewiesen", offerSent: "Angebot gesendet",
				offerAccepted: "Angebot angenommen", offerRejected: "Angebot abgelehnt",
				scheduled: "Geplant", inProgress: "In Bearbeitung", partiallyDone: "Teilweise erledigt",
				completed: "Abgeschlossen", cancelled: "Storniert"
			}
		},
		stats: {
			totalOrders: "Gesamt Aufträge", pendingOrders: "Ausstehende Aufträge",
			pendingOffers: "Ausstehende Angebote", activeOrders: "Aktive Aufträge",
			inProgress: "In Bearbeitung", completed: "Abgeschlossen"
		},
		dashboards: {
			customer: {
				title: "Meine Aufträge",
				subtitle: "Verfolgen und verwalten Sie Ihre Möbeltransportaufträge"
			},
			siteAdmin: {
				title: "Site Admin Dashboard",
				subtitle: "Verwalten Sie alle Transportaufträge und überwachen Sie Geschäftsabläufe"
			},
			companyAdmin: {
				title: "Firmen-Dashboard",
				subtitle: "Verwalten Sie Ihre zugewiesenen Aufträge und Teamoperationen"
			},
			superAdmin: {
				title: "Super Admin Dashboard",
				subtitle: "Verwalten Sie alle Plattformbenutzer, Unternehmen und Aufträge",
				users: "Benutzer", orders: "Aufträge", companies: "Unternehmen",
				settings: "Einstellungen", settingsComingSoon: "Einstellungsverwaltung kommt bald..."
			},
			driver: {
				title: "Meine Aufträge",
				subtitle: "Verwalten Sie Ihre zugewiesenen Aufträge und Transportaufgaben"
			},
			worker: {
				title: "Arbeiter-Dashboard",
				subtitle: "Verwalten Sie Ihre Arbeitsaufträge und Aufgaben",
				rating: "Bewertung",
				furnitureAssembly: "Möbelmontage",
				packing: "Verpackung"
			}
		},
		notifications: {
			title: "Benachrichtigungen",
			allCaughtUp: "Alles erledigt",
			unreadMessages: "{{count}} ungelesene Nachricht",
			unreadMessagesPlural: "{{count}} ungelesene Nachrichten",
			markAllRead: "Alle als gelesen markieren",
			allCaughtUpTitle: "Alles erledigt!",
			allCaughtUpMessage: "Derzeit keine neuen Benachrichtigungen. Wir informieren Sie, wenn etwas Wichtiges passiert.",
			justNow: "Gerade eben",
			minutesAgo: "vor {{count}} Min.",
			hoursAgo: "vor {{count}} Std.",
			daysAgo: "vor {{count}} Tagen"
		},
		orderSteps: {
			selectServices: "Dienste auswählen",
			addressesDetails: "Adressen & Details",
			roomConfiguration: "Zimmerkonfiguration",
			scheduleNotes: "Zeitplan & Notizen",
			createNewOrder: "Neuen Auftrag erstellen",
			stepOf: "Schritt {{current}} von {{total}}: {{title}}",
			selectServicesYouNeed: "Wählen Sie die benötigten Dienste aus",
			selectOneOrMore: "Sie können einen oder mehrere Dienste für Ihren Auftrag auswählen",
			servicesSelected: "✓ {{count}} Dienst(e) ausgewählt"
		},
		pricingModal: {
			modifyOffer: "Angebot ändern",
			sendOffer: "Angebot senden",
			order: "Auftrag {{id}}",
			modifyingVersion: "(Ändern v{{version}})",
			estimatedHours: "Geschätzte Stunden",
			hours: "Stunden",
			hourlyRate: "Stundensatz (CHF)",
			perHour: "pro Stunde",
			scheduledDateOptional: "Geplantes Datum (Optional)",
			additionalNotesOptional: "Zusätzliche Notizen (Optional)",
			specialInstructions: "Besondere Anweisungen oder Details...",
			totalPrice: "Gesamtpreis",
			hoursCalculation: "{{hours}} Stunden × CHF {{rate}}/Stunde",
			cancel: "Abbrechen",
			updateOffer: "Angebot aktualisieren",
			sendOfferButton: "Angebot senden"
		},
		services: {
			furnitureMoving: "Möbeltransport",
			furnitureMovingDesc: "Professionelle Möbeltransport- und Transportdienstleistungen",
			cleaningService: "Reinigungsdienst",
			cleaningServiceDesc: "Tiefenreinigung und Wartungsdienstleistungen",
			painting: "Malen",
			paintingDesc: "Innen- und Außenmalerdienstleistungen",
			packingService: "Verpackungsservice",
			packingServiceDesc: "Professionelle Verpackungs- und Auspackdienstleistungen"
		},
		locationTypes: {
			apartment: "Wohnung",
			house: "Haus",
			office: "Büro",
			warehouse: "Lager",
			building: "Gebäude"
		}
	}
};

// Write expanded files
Object.keys(translations).forEach(lang => {
	const filePath = path.join(__dirname, `${lang}.json`);
	fs.writeFileSync(filePath, JSON.stringify(translations[lang], null, "\t"), 'utf8');
});


