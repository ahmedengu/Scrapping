var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '192.168.99.100',
    port: '32788',
    user: 'root',
    database: 'x',
    charset: 'utf8mb4'
});
connection.connect();
// require('./olx')('https://olx.com.eg/properties/properties-for-rent/apartments-for-rent/smoha/',connection);
// require('./aqarmap')('https://egypt.aqarmap.com/ar/for-rent/furnished-apartment/alexandria/smouha/?photos=0', connection);

require('./bezaat')('https://www.bezaat.com/egypt/alexandria/properties-for-rent/furnished-apartments/1', connection);