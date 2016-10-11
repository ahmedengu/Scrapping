var moment = require('moment');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '209.148.94.217',
    port: '3306',
    user: 'apartment',
    password: 'V8DbWPQEQbAaq6Qv',
    database: 'x',
    charset: 'utf8'
});
connection.connect();


// require('./olx')('https://olx.com.eg/properties/properties-for-rent/apartments-for-rent/smoha/?search%5Bfilter_enum_furnished%5D%5B0%5D=1', connection, moment, 250);

// require('./aqarmap')('https://egypt.aqarmap.com/ar/for-rent/furnished-apartment/alexandria/smouha/?photos=1', connection, moment, 250);

require('./bezaat')('https://www.bezaat.com/egypt/alexandria/properties-for-rent/furnished-apartments/1', connection, moment, 250);