
this.mysql = require('mysql');
var conData = require('../input/connectionData.json');

var DBhost = conData.host;
var DBuser = conData.user;
var DBpassword = conData.password;
var DBdatabase = conData.database;
var id = -1;
var nextUser, nextRestaurant;
var getFirstRawResult;
var syncronizeStep;

exports.conData = conData;


exports.connect = function() 
	{
		return this.mysql.createConnection(
			{
				host : DBhost,
				user : DBuser,
				password : DBpassword,
				database : DBdatabase
			});
	};

exports.startDB = function() 
	{
		var connection = this.connect();	
		
		connection.query("CREATE DATABASE IF NOT EXISTS ripadvisor", function(err, result) 
			{
				if (err) throw err;
				console.log("Database: ");
				console.log(result);
			});
		connection.query("CREATE TABLE restaurant (r_ID INT NOT NULL AUTO_INCREMENT, r_name VARCHAR (100) NOT NULL, r_adress VARCHAR (100) NOT NULL, r_ratingCount INT DEFAULT 0, r_foodType VARCHAR(100), r_averageRating DOUBLE DEFAULT -1, r_occasionType VARCHAR(100), r_foodRating INT DEFAULT -1, r_serviceRating INT DEFAULT -1, r_valueRating INT DEFAULT -1, r_atmosphereRating INT DEFAULT -1, r_excellentRatingCount INT DEFAULT 0, r_verygoodRatingCount INT DEFAULT 0, r_averageRatingCount INT DEFAULT 0, r_poorRatingCount INT DEFAULT 0, r_terribleRatingCount INT DEFAULT 0, r_gpsLatitude VARCHAR(20) DEFAULT null, r_gpsLongitude VARCHAR(20) DEFAULT null,  PRIMARY KEY (r_ID, r_adress))", function(err, result)
			{
				if(err) throw err;
				console.log("restaurant: ");
				console.log(result);
			});
		connection.query("CREATE TABLE user (u_ID INT NOT NULL AUTO_INCREMENT, u_user VARCHAR(30) NOT NULL, u_ratingCount INT DEFAULT 0, u_excellentRatingCount INT DEFAULT 0, u_verygoodRatingCount INT DEFAULT 0, u_averageRatingCount iNT DEFAULT 0, u_poorRatingCount INT DEFAULT 0, u_helpfullRatingCount INT DEFAULT 0, PRIMARY KEY(u_ID, u_user))", function(err, result)
			{
				if(err) throw err;
				console.log("user: ");
				console.log(result);
			});
		connection.query("CREATE TABLE rating (rt_ID INT NOT NULL AUTO_INCREMENT, rt_r_ID INT NOT NULL REFERENCES restaurant(r_ID) ON DELETE CASCADE, rt_user VARCHAR(30) NOT NULL REFERENCES user(u_user) ON DELETE CASCADE, rt_title VARCHAR(100) NOT NULL, rt_text VARCHAR(1000) NOT NULL, rt_averageRating INT DEFAULT -1, rt_pricingRating INT DEFAULT -1, rt_ambienteRating INT DEFAULT -1, rt_serviceRating INT DEFAULT -1, rt_foodRating INT DEFAULT -1, rt_date VARCHAR(30) NOT NULL, PRIMARY KEY(rt_ID))", function(err, result)
			{
				if(err) throw err;
				console.log("rating: ");
				console.log(result);
			});
		connection.query("CREATE TABLE location (l_ID INT NOT NULL AUTO_INCREMENT, l_locationString VARCHAR(50), PRIMARY KEY(l_ID) )", function(err, result)
			{
				if(err) throw err;
				console.log("location: ");
				console.log(result);
			});
		connection.query("CREATE TABLE rawResults (res_ID INT NOT NULL AUTO_INCREMENT, res_adress VARCHAR(300) NOT NULL, PRIMARY KEY(res_ID))", function(err, result)
			{
				if(err) throw err;
				console.log("rawResults: ");
				console.log(result);
			});
		connection.end();
	};

exports.destroyDB = function(connection) 
	{
		connection.connect();
		
		connection.query("DROP DATABASE ripadvisor", function(err)
			{
				if(err) throw err;
			});
		connection.end();
	};
	
exports.insert = function(table, values)
	{
		var connection = this.connect();
		var id;
		
		for(var item in values)
		{
			if(values[item] === null || values[item] === undefined)
			{	
					values[item] = "DEFAULT";
			}
		}	
		
		
		connection.connect();
		
		switch(table)
		{
			case "restaurant":
				connection.query("INSERT INTO restaurant SET r_name = '" + values[0] + "', r_adress = '" + values[1] + "', r_ratingCount = '" + values[2] + "', r_foodType = '" + values[3] + "', r_averageRating = '" + values[4] + "', r_occasionType = '" + values[5] + "', r_foodRating = '" + values[6] + "', r_serviceRating = '" + values[7] + "', r_valueRating = '" + values[8] + "', r_atmosphereRating = '" + values[9] + "', r_excellentRatingCount = '" + values[10] + "', r_verygoodRatingCount = '" + values[11] + "', r_averageRatingCount = '" + values[12] + "', r_poorRatingCount = '" + values[13] + "', r_poorRatingCount = '" + values[14] + "', r_gpsLatitude = '" + values[15] + "', r_gpsLongitude = '" + values[16] + "'", function(err, result)
				{
					if(err) throw err;
					id = result.insertId;
				});
				break;
				
			case "user":
				connection.query("INSERT INTO user SET u_user = '" + values[0] + "', SET u_ratingCount = '" + values[1] + "', SET u_excellentRatingCount = '" + values[2] + "', SET u_verygoodRatingCount = '" + values[3] + "', SET u_verygoodRatingCount = '" + values[4] + "', SET u_averageRatingCount = '" + values[5] + "', SET u_poorRatingCount = '" + values[6] + "', SET u_helpfullRatingCount = '" + values[7] + "'", function(err, result)
				{
					if(err) throw err;
					id = result.insertId;
				});
				break;
				
			case "rating":
				connection.query("INSERT INTO rating SET rt_r_ID = '" + values[0] + "', SET rt_user = '" + values[1] + "', SET rt_title = '" + values[2] + "', SET rt_text = '" + values[3] + "', SET rt_averageRating = '" + values[4] + "', SET rt_pricingRating = '" + values[5] + "', SET rt_ambienteRating = '" + values[6] + "', SET rt_serviceRating = '" + values[7] + "', SET rt_foodRating rt_date = '" + values[8] + "'", function(err, result)
				{
					if(err) throw err;
					id = result.insertId;
				});
				break;
				
			case "location":
			connection.query("INSERT INTO location SET l_locationString = '" + values[0] + "'", function(err, result)
				{
					if(err) throw err;
					id = result.insertId;
				});
				break;
				
			case "rawResults":
				for(var xitem in values)
				{
					connection.query("INSERT INTO rawresults SET res_adress = '" + values[xitem] + "'", function(err, result)
							{
								if(err) throw err;
								id = result.insertId;
							});
				}
				break;
				
			default: 
				throw new Error();
		}
		
		connection.end();
		return id;
	};
	
exports.getFirstRawResult = function(ph, Data, res)
{
	var connection = this.connect();
	var query = connection.query("SELECT res_adress FROM rawresults WHERE res_ID = (SELECT MIN(res_ID) FROM rawresults)", function(err, row)
			{
				Data.url = row[0].res_adress;
				connection.end();
				return res(ph, Data);
			});/* */
};


exports.deleteFirstRawResult = function(res)
{
	var connection = this.connect();
	connection.query("DELETE FROM rawresults ORDER BY res_ID ASC LIMIT 1", function(err, result)
		{
			if(err) throw err;
			connection.end();
			return res(result);
		});
};

exports.getNextRestaurants = function(ph, Data, res)
{
	var connection = this.connect();
	connection.query("SELECT r_ID, r_adress FROM restaurant WHERE r_ID > " + connection.escape(Data.restaurantCount) + " LIMIT 25", function(err, result)
		{
			if(err) throw err;
			connection.end();
			Data.restaurant = result;
			return res(ph, Data);
		});
};

exports.setCoords = function(Data, res)
{
	var connection = this.connect();
	return nextRestaurant(Data, 0, connection, res);
};

nextRestaurant = function(Data, counter, connection, res)
{
	if(counter !== Data.restaurant.length)
	{
		return connection.query("UPDATE restaurant SET r_gpsLatitude = " + connection.escape(Data.restaurant[counter].latitude) + ", r_gpsLongitude = " + connection.escape(Data.restaurant[counter].longitude) + " WHERE r_ID = " + connection.escape(Data.restaurant[counter].r_ID), function(err, result)
			{
				if(err) throw err;
				counter++;
				return nextRestaurant(Data, counter, connection, res);
			});
	}
	else
	{
		connection.end();
		return res(Data);
	}
}
	

exports.startSave = function(Data, res)
{
	var connection = this.connect();
	var allResults = new Array();
	var idc = new Object();
	idc.rid = (res === undefined) ? undefined : Data.restaurantID;
	idc.uid;
	idc.rtid;
	var Data = Data;
	if(Data.site == 1 || Data.site == 0)
	{

		Data.restaurant[0] = connection.escape(Data.restaurant[0]);
		//Data.restaurant[2] = connection.escape(Data.restaurant[2]);
		Data.restaurant[5] = connection.escape(Data.restaurant[5]);
		return connection.query("INSERT INTO restaurant SET r_name = " + Data.restaurant[0] + ", r_adress = " + connection.escape(Data.restaurant[1]) + ", r_ratingCount = " + connection.escape(Data.restaurant[2]) + ", r_foodType = " + connection.escape(Data.restaurant[3]) + ", r_averageRating = " + connection.escape(Data.restaurant[4]) + ", r_occasionType = " + connection.escape(Data.restaurant[5]) + ", r_foodRating = " + connection.escape(Data.restaurant[6]) + ", r_serviceRating = " + connection.escape(Data.restaurant[7]) + ", r_valueRating = " + connection.escape(Data.restaurant[8]) + ", r_atmosphereRating = " + connection.escape(Data.restaurant[9]) + ", r_excellentRatingCount = " + connection.escape(Data.restaurant[10]) + ", r_verygoodRatingCount = " + connection.escape(Data.restaurant[11]) + ", r_averageRatingCount = " + connection.escape(Data.restaurant[12]) + ", r_poorRatingCount = " + connection.escape(Data.restaurant[13]) + ", r_terribleRatingCount = " + connection.escape(Data.restaurant[14]) + ", r_gpsLatitude = " + connection.escape(Data.restaurant[15]) + ", r_gpsLongitude = " + connection.escape(Data.restaurant[16]), function(err, result)
		{
			if(err) throw err;
			idc.rid = result.insertId;
			nextUser(Data, 0, idc, res, connection);
		});
	}else
	{
		return nextUser(Data, 0, idc, res, connection);
	}
};


nextUser = function(input, counter, idc, res, connection)
{	
	if(counter !== input.user.length)
	{
		return connection.query("SELECT u_user FROM user WHERE BINARY u_user = BINARY " + connection.escape(input.user[counter].name), function(err, result)
			{
				if(err) throw err;
				if(result.length < 1)
				{

					return connection.query("INSERT INTO user SET u_user = " + connection.escape(input.user[counter].user.name) + ", u_ratingCount = " + connection.escape(input.user[counter].user.ratingCount) + ", u_contributionsCount = " + connection.escape(input.user[counter].user.contributionsCount) + ", u_adress = " + connection.escape(input.user[counter].user.adress) + ", u_helpfullRatingCount = " + connection.escape(input.user[counter].user.helpfullCount) + ", u_excellentRatingCount = " + connection.escape(input.user[counter].user.excellentCount) + ", u_poorRatingCount = " + connection.escape(input.user[counter].user.poorCount) + ", u_terribleRatingCount = " + connection.escape(input.user[counter].user.terribleCount) + ", u_verygoodRatingCount = " + connection.escape(input.user[counter].user.verygoodCount) + ", u_citiesCount = " + connection.escape(input.user[counter].user.citiesCount) + ", u_averageRatingCount = " + connection.escape(input.user[counter].user.averageCount) + ", u_origin = " + connection.escape(input.user[counter].user.origin), function(err, result)
					{
						if(err) throw err;
						idc.uid = input.user[counter].name;
						var tempstring3 = input.user[counter].date.replace(/\nNEW/g, "");
						var tempstring0 = connection.escape(input.user[counter].text);
						var tempstring1 = connection.escape(input.user[counter].title);
						var tempstring2 = connection.escape(idc.uid);
						return connection.query("INSERT INTO rating SET rt_r_ID = '" + idc.rid + "', rt_user = " + tempstring2 + ", rt_title = " + tempstring1 + ", rt_text = " + tempstring0 + ", rt_averageRating = '" + input.user[counter].average + "', rt_pricingRating = '" + input.user[counter].price + "', rt_ambienteRating = '" + input.user[counter].ambience + "', rt_serviceRating = '" + input.user[counter].service + "', rt_foodRating = '" + input.user[counter].food + "', rt_date = '" + tempstring3 + "'", function(err, result)
							{
								if(err) throw err;
								counter++;
								return nextUser(input, counter, idc, res, connection);
							});
					});
				}
				else
				{
					idc.uid = result[0].u_user;
					var tempstring0 = connection.escape(input.user[counter].text);
					var tempstring1 = connection.escape(input.user[counter].title);
					var tempstring2 = connection.escape(idc.uid);
					var tempstring3 = input.user[counter].date.replace(/\nNEW/g, "");
					
					return connection.query("INSERT INTO rating SET rt_r_ID = '" + idc.rid + "', rt_user = " + tempstring2 + ", rt_title = " + tempstring1 + ", rt_text = " + tempstring0 + ", rt_averageRating = '" + input.user[counter].average + "', rt_pricingRating = '" + input.user[counter].price + "', rt_ambienteRating = '" + input.user[counter].ambience + "', rt_serviceRating = '" + input.user[counter].service + "', rt_foodRating = '" + input.user[counter].food + "', rt_date = '" + tempstring3 + "'", function(err, result)
						{
							if(err) throw err;
							counter++;
							return nextUser(input, counter, idc, res, connection);
						});
				}
			});
	}
	else
	{
		connection.end();
		return res(idc.rid);
	}
};

exports.syncronize = function(res)
{
	var connection = this.connect();
	return syncronizeStep(connection, res)

}
	
syncronizeStep = function(connection, res)
{
	return connection.query("INSERT INTO sync SET s_ID = " + connection.escape(conData["pcId"]), function(err, result)
		{
			if(err)throw err;
			
			return connection.query("SELECT res_adress FROM rawresults WHERE res_ID = " + connection.escape(result.insertId), function(error, rawResult)
					{
						if(error)throw error;
						if(rawResult.length == 0)
						{
							syncronizeStep(connection, res)
						}
						else
						{
							connection.end();
							return res(rawResult[0].res_adress)
						}
		


					});
		});
}
	
/*
connection.query("", function(err)
	{
		if(err) throw err;
	});
*/