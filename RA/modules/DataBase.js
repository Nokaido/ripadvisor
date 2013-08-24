
this.mysql = require('mysql');
var conData = require('../input/connectionData.json');

var DBhost = conData.host;
var DBuser = conData.user;
var DBpassword = conData.password;
var DBdatabase = conData.database;
var id = -1;

var getFirstRawResult;

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
	}

exports.startDB = function() 
	{
		var connection = this.connect();
		
		
		connection.query("CREATE DATABASE IF NOT EXISTS ripadvisor", function(err, result) 
			{
				if (err) throw err;
				console.log("Database: ");
				console.log(result);
			});
		connection.query("CREATE TABLE restaurant (r_ID INT NOT NULL AUTO_INCREMENT, r_name VARCHAR (100) NOT NULL, r_adress VARCHAR (100) NOT NULL, r_ratingCount INT DEFAULT 0, r_foodType VARCHAR(100), r_averageRating DOUBLE DEFAULT -1, r_occasionType VARCHAR(100), r_foodRating INT DEFAULT -1, r_serviceRating INT DEFAULT -1, r_valueRating INT DEFAULT -1, r_atmosphereRating INT DEFAULT -1, r_excellentRatingCount INT DEFAULT 0, r_verygoodRatingCount INT DEFAULT 0, r_averageRatingCount INT DEFAULT 0, r_poorRatingCount INT DEFAULT 0, r_trribleRatingCount INT DEFAULT 0, r_gpsLatitude VARCHAR(20) DEFAULT null, r_gpsLongitude VARCHAR(20) DEFAULT null,  PRIMARY KEY (r_ID, r_adress))", function(err, result)
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
	
exports.saveRating = function(Data, res)
{
	var connection = this.connect();
	var allResults = new Array();
	var rid = (res === null) ? null : Data.restaurantID;
	var uid;
	var rtid;
	
	

	if(Data.count === "1")
	{
		var query = connection.query("INSERT INTO restaurant SET r_name = '" + Data.restaurant[0] + "', r_adress = '" + Data.restaurant[1] + "', r_ratingCount = '" + Data.restaurant[2] + "', r_foodType = '" + Data.restaurant[3] + "', r_averageRating = '" + Data.restaurant[4] + "', r_occasionType = '" + Data.restaurant[5] + "', r_foodRating = '" + Data.restaurant[6] + "', r_serviceRating = '" + Data.restaurant[7] + "', r_valueRating = '" + Data.restaurant[8] + "', r_atmosphereRating = '" + Data.restaurant[9] + "', r_excellentRatingCount = '" + Data.restaurant[10] + "', r_verygoodRatingCount = '" + Data.restaurant[11] + "', r_averageRatingCount = '" + Data.restaurant[12] + "', r_poorRatingCount = '" + Data.restaurant[13] + "', r_poorRatingCount = '" + Data.restaurant[14] + "', r_gpsLatitude = '" + Data.restaurant[15] + "', r_gpsLongitude = '" + Data.restaurant[16] + "'", function(err, result)
		{
			if(err) throw err;
			rid = result.insertId;
			allResults.push(result);
		});
	}
	
	for(var i = 0 ; i < Data.user.length; i++)
	{
		connection.query("SELECT u_user FROM user WHERE u_user = '" + Data.user[i].name + "'", function(err, result)
			{
				if(err) throw err;
				if(result.length < 1)
				{
					return connection.query("INSERT INTO user SET u_user = '" + Data.user.name + "'", function(err, result)
					{
						if(err) throw err;
						uid = Data.user.name;
						allResults.push(result);
					});
				}
				else
				{
					uid = result[0].u_user;
					allResults.push(result);
					return;
				}
			});
		

		
		connection.query("INSERT INTO rating SET rt_r_ID = '" + rid + "', SET rt_user = '" + uid + "', SET rt_title = '" + Data.user[i].title + "', SET rt_text = '" + Data.user[i].text + "', SET rt_averageRating = '" + Data.user[i].average + "', SET rt_pricingRating = '" + Data.user[i].price + "', SET rt_ambienteRating = '" + Data.user[i].ambience + "', SET rt_serviceRating = '" + Data.user[i].service + "', SET rt_foodRating rt_date = '" + Data.user[i].food + "'", function(err, result)
		{
			if(err) throw err;
			allResults.push(result);
		});
		
	}

	connection.end();
return res(rid);
};

exports.test = function(input, res)
{
	var connection = this.connect();
//	connection.query("SELECT u_ID FROM user WHERE u_user = '" + input.name + "'", function(err, result)
//		{
//			if(err) throw err;
//			connection.end();
//			return res(result);
//		});
	connection.query("DELETE FROM rawresults ORDER BY res_ID ASC LIMIT 1", function(err, result)
		{
			if(err) throw err;
			connection.end();
			return res(result);
		});
};

/*
connection.query("", function(err)
	{
		if(err) throw err;
	});
*/