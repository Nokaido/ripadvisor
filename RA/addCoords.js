var DB = require('./modules/DataBase');
var phantom = require('node-phantom');
var restaurantCount = require("./input/restaurantCount.json")
var fs = require("fs");

var outputFile = "./input/restaurantCount.json";

var addCoords, nextCoords, coordStep, saveCoords, log, phantomInit;
var Data = new Object();
Data.restaurantCount = restaurantCount["restaurantCount"];
log = function(message)
{
	console.log(message);
	return;
};

log("Start!");

addCoords = function(callbacInfo, callbackEnd)
{
	phantomInit = function()
	{
		phantom.create(function(err, ph)
				{
					Data.status = "success";

					DB.getNextRestaurants(ph, Data, function(ph, Data)
							{
								
								log(Data);
								
								Data.restaurantCount = (Data.restaurant[Data.restaurant.length-1].r_ID !== undefined) ? Data.restaurant[Data.restaurant.length-1].r_ID : Data.restaurantCount;
								fs.writeFile(outputFile, JSON.stringify({restaurantCount: Data.restaurantCount}, null, 2), function(err)
									{
										if(err)throw err;
										log("restaurantCount " + Data.restaurantCount + " saved");
									});
								
								return nextCoords(ph, Data);
							});

				},{parameters:{'load-images':'no'}});
	};
	
	saveCoords = function(ph, Data)
	{
		log('Beginn saving');
		var success = true;
		for(var i = 0; i< Data.restaurant.length; i++)
		{
			if(Data.restaurant[i].longitude === '' || Data.restaurant[i].latitude === '')
			{
				success = false;
			}
		}
		if(success)
		{
			DB.setCoords(Data, function(Data)
				{
				DB.getNextRestaurants(ph, Data, function(ph, Data)
					{
						
						log(Data);
						
						Data.restaurantCount = Data.restaurant[Data.restaurant.length-1].r_ID;
						fs.writeFile(outputFile, JSON.stringify({restaurantCount: Data.restaurantCount}, null, 2), function(err)
							{
								if(err)throw err;
								log("restaurantCount " + Data.restaurantCount + " saved");

							});
						
							log('success');
							return nextCoords(ph, Data);
					});
				});
		}
		else
		{
			log('Error');
			log(Data);
			return nextCoords(ph, Data);
		}
	};


	nextCoords = function(ph, Data)
	{
		if(Data.restaurant.length > 0)
		{
			return ph.createPage(function(err, page)
				{
				return page.open("http://stevemorse.org/jcal/latlonbatch.html", function(err, status)
							{
								log("opened site " + status);
								page.onLoadFinished = function()
									{
										log("loading...");
									};
						page.injectJs('./jquery-1.10.2.js', function()
								{
									setTimeout(function()
										{
											page.evaluate(function(Data)
												{
													var tempString = "";
													tempString = tempString + Data.restaurant[0].r_adress;
													for(var i = 1; i < Data.restaurant.length; i++)
													{
														tempString = tempString + "\n" + Data.restaurant[i].r_adress;
													}
													$('textarea:eq(0)')[0].value = tempString;
													$('input:eq(12)').trigger('click');
													
												}, function(err, result)
												{
													page.render('0res.png', function()
														{
															log("render 0res done");
														});
												}, Data);
										}, 1000);
									});
						
						
									setTimeout(function()
										{
										page.injectJs('./jquery-1.10.2.js', function()
											{
											page.evaluate(function(Data)
												{
													var tempOutput = $('textarea:eq(1)')[0].value;
													var posA = 0;
													var posB;
													for(var i = 0; i < Data.restaurant.length; i++)
													{
														var tempObject = new Object();
														posB = tempOutput.indexOf(",", posA);
														Data.restaurant[i].latitude = tempOutput.slice(posA, posB);
														posA = posB +2;
														posB = tempOutput.indexOf("\n", posA);
														Data.restaurant[i].longitude = tempOutput.slice(posA, posB);
														posA = posB +1;
													}
													
													return Data;
													/* */
												}, function(err, result)
												{
													page.render('1res.png', function()
														{
															log("render 1res done");
															
														});
													//log('pre');
													page.close();
													//log(result);
													log('page closed');
													return saveCoords(ph, result);
												}, Data);
											});
										}, 60000);
							});
				});
		}
		else
		{
			return callbackEnd(ph);
		}
		
	};
	
	log("init Phantom");
	return phantomInit();
};

addCoords((function(Data)
	{
	
	}), (function(ph)
	{
		log("Exit Phantom");
		return ph.exit();
	}));