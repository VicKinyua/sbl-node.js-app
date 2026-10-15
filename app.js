// cPanel / Passenger entry point for the Silver & Bosnia server.
// Set this as the "Application Startup File" in cPanel → Setup Node.js App.
// (Plain `npm start` runs server/index.js directly — both are equivalent.)
// NOTE: this project is ES modules ("type": "module"), so we use import.
import './server/index.js'
