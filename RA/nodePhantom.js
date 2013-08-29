
 var DB = require('./modules/DataBase');
 var phantom = require('node-phantom');
 var ratingFarmer, ratingStep, nextRating, phantomInit, site, dataGetter, clickMore, log, saveRating;
 var first = true;
 var Data = new Object();
 var next = false;
 var restaurantID;


 
log = function(message, color)
{
	if(color !== null)
	{
		//console.log("%c" + message, "color:" + color + ";front-weight:bold;");
		console.info(message);
	}
	else
	{
		console.log(message);
	}
	color = null;
	return;
};

log("Start");

ratingFarmer = function(callbackInfo, callbackEnd)
{
	phantomInit = function()
	{
		phantom.create(function(err, ph)
				{
					Data.status = "success";
					Data.url = "next";
					Data.siteCount = null;
					Data.activeSite = null;

					DB.getFirstRawResult(ph, Data, function(ph, Data)
							{
								return nextRating(ph, Data);
							});

				},{parameters:{'load-images':'no'}});

	};

	saveRating = function(ph, result)
	{
		//log(result);
		//log(result.user[0].title);
		if(result.status === 'success')
		{

			return DB.startSave(result, function(id)
			{
				log("Restaurant ID: " + id);
				log('DB callback');
				restaurantID = id;
				result.restaurantID = id;
				return ratingStep(ph, result);
			});
		}
		else
		{
			return nextRating(ph, result);
		}

	};

	ratingStep = function(ph, result)
			{
				callbackInfo(result);
				
				if(result.status === 'success' && !result.err)
				{
					log("next Step");
					return setTimeout(function()
						{
						if(result.url === 'next')
							{
							Data = result;
							return DB.deleteFirstRawResult(function(res)
									{
									if(res.affectedRows == 0)
									{
										result.url = 'end';
										return nextRating(ph, result);
									}
									else
									{
										DB.getFirstRawResult(ph, Data, function(ph, Data)
												{
													return nextRating(ph, Data);
												});
									}
								});
							}
							else
							{
								return nextRating(ph, result);
							}
						},2000);
				}
				else
				{
					log("site Error!");
					return nextRating(ph, result);
				}
			};

	nextRating = function(ph, Data)
	{
		if(first || Data.url !== 'end')
		{
			first = false;
			return ph.createPage(function(err, page)
					{
					return page.open(Data.url, function(err, status)
							{
							log("opened site : " + Data.url + " " + status);
							page.onLoadFinished = function()
									{
										log('loading...');
									};

							page.injectJs('./jquery-1.10.2.js', function()
									{

									setTimeout(function()
										{
										page.evaluate(function()
												{
												$('.content>a').trigger('click');
												var temp = 'click triggered';
												return temp;
												}, function(err, result)
												{
												log(result);
												return page.render('0pic.png', function()
														{
														log('render 0 done');
														});
												});
										},1000);
									});

							setTimeout(function()
									{
									page.injectJs('./jquery-1.10.2.js', function()
											{
											setTimeout(function()
													{
												page.evaluate(function()
														{
														$('.moreLink:first').click();
														var temp = 'second click'
														return temp;
														}, function(err, result)
														{
															log(result);
														});
													},2000);

											setTimeout(function()
											{
											page.render('1pic.png', function()
														{
														log('render 1 done');
														});

											page.evaluate(function()
													{
													var cc = new Object();
													var result = new Array();
													cc.restaurant = new Array();
													cc.user = new Array();
													cc.idArray = new Array();
												 	cc.site = ($('.paging.pageDisplay').text() === '') ? (0) : parseInt($('.paging.pageDisplay').text());
													cc.count = 0;
													cc.newUrl = 'empty';
													
													
 													var temp = new Array();
													
 													$('.paging.taLnk').each(function(){temp.push($(this).text());});
 													
 													if(temp.length > 0)
 													{
 														cc.count = (cc.site > parseInt(temp[temp.length -1])) ? (cc.site) : parseInt(temp[temp.length -1]);
 													}
 													else
 													{
 														cc.count = 1;
 													}
 													temp = new Array();
 													
 													$('.paging.taLnk').each(function(){temp.push($(this).attr('href'));});
 													
 													if( cc.count == cc.site || cc.site == 0)
 													{
 														cc.newUrl = "next";
 													}
 													else if(temp.length > 3)
 													{
 														cc.newUrl = "http://www.tripadvisor.com" + temp[2];
 													}
 													else if(cc.site != 0 && (cc.site + 1) == cc.count && cc.count != 3)
 													{
 														cc.newUrl = "http://www.tripadvisor.com" + temp[2];
 													}
 													else if(cc.count == 3)
 													{
 														cc.newUrl = "http://www.tripadvisor.com" + temp[1];
 													}
 													
 													if(cc.site == 1)
 													{
 														cc.count  = parseInt($('.paging.taLnk:last').text());
 														cc.newUrl = "http://www.tripadvisor.com" + temp[0];
 														
 														cc.restaurant.push(($('#HEADING').text()).slice(2, ($('#HEADING').text()).length-1));//Name
 														cc.restaurant.push($('.street-address').text() + ", " + $('.locality').text());//Adress
 														cc.restaurant.push(($('.more').text()).slice(0, ($('.more').text()).length - 8));//RatingCount
 														cc.restaurant.push(($('.detail:first').text()).slice(11, ($('.detail:first').text()).length - 1));//FoodType
 														cc.restaurant.push(($('.sprite-ratings').attr('alt')).slice(0, ($('.sprite-ratings').attr('alt')).length - 11));//AverageRating
 														cc.restaurant.push(($('.detail:eq(1)').text()).slice(17, ($('.detail:eq(1)').text()).length - 1));//OccationType
 														cc.restaurant.push(($('.fill:eq(5)').attr('style')).slice(6, ($('.fill:eq(5)').attr('style')).length - 3));//FoodRating
 														cc.restaurant.push(($('.fill:eq(6)').attr('style')).slice(6, ($('.fill:eq(6)').attr('style')).length - 3));//ServiceRating
 														cc.restaurant.push(($('.fill:eq(7)').attr('style')).slice(6, ($('.fill:eq(7)').attr('style')).length - 3));//ValueRating
 														cc.restaurant.push(($('.fill:eq(8)').attr('style')).slice(6, ($('.fill:eq(8)').attr('style')).length - 3));//AtmosphereRating
 														cc.restaurant.push($('.compositeCount:eq(0)').text());//ExcelentRatingCount
 														cc.restaurant.push($('.compositeCount:eq(1)').text());//VeryGoodRatingCount
 														cc.restaurant.push($('.compositeCount:eq(2)').text());//AverageRatingCount
 														cc.restaurant.push($('.compositeCount:eq(3)').text());//PoorRatingCount
 														cc.restaurant.push($('.compositeCount:eq(4)').text());//TerribleRatingCount
 														cc.restaurant.push("null");//GPS Longitude
 														cc.restaurant.push("null");//GPS Latitude
 														//length 17
 													}
 													else if(cc.site == 2 && cc.count != 2)
 													{
 														cc.newUrl = "http://www.tripadvisor.com" + temp[1];
 													}
 													else if(cc.site == 0)
 													{
 														cc.restaurant.push(($('#HEADING').text()).slice(2, ($('#HEADING').text()).length-2));//Name
 														cc.restaurant.push($('.street-address').text() + ", " + $('.locality').text());//Adresse
 														cc.restaurant.push(0);
 														cc.restaurant.push("");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push("-1");
 														cc.restaurant.push(0);
 														cc.restaurant.push(0);
 														
 													}
 													 
 													$('.reviewSelector').each(function(){cc.idArray.push($(this).attr('id'));});
 													
 													var temp;
 													
 													for(var i = 0; i < cc.idArray.length; i++)
 													{
 														temp = '#'+ cc.idArray[i];
 														var tempObject = new Object();
 														// Username

 														// Ratings
 														
 														if($(temp).find('.sprite-ratings').length > 2)
 														{
 															tempObject.name = (($(temp).find('.mo span:eq(1)').text()) === '' ) ?  ('Facebook_User_Bastelschrank') : ($(temp).find('.mo span:eq(1)').text());
 															// Title
 															tempObject.title = (($(temp).find('.quote>a:eq(1)').text()).slice(1, ($(temp).find('.quote>a:eq(1)').text()).length - 1));
 															// Text
 															tempObject.text = (($(temp).find('.entry>p:eq(1)').text()).slice(1, ($(temp).find('.entry>p:eq(1)').text()).length - 1));
 															
 															tempObject.date = ($(temp).find('.ratingDate>span').text() === "NEW") ? (($(temp).find('.ratingDate').text()).slice(9, ($(temp).find('.ratingDate').text()).length - 5)) : (($(temp).find('.ratingDate:first').text()).slice(9, ($(temp).find('.ratingDate:first').text()).length - 1));
 															var tempArray = new Array();
 															$(temp).find('.sprite-ratings').each(function(){tempArray.push($(this).attr('alt'));});
 															
 															var price = new Object();
 															var ambience = new Object();
 															var service = new Object();
 															var food = new Object();
 															var possition = 0;

 															
 															$(temp).find('.recommend-answer').each(function()
 																{
 																	switch($(this).text().slice(4))
 																	{
 																	case 'Value': price.b = true; price.c = possition + 2; possition++;
 																	break;
 																	case 'Atmosphere': ambience.b = true; ambience.c = possition + 2; possition++;
 																	break;
 																	case 'Service': service.b = true; service.c = possition + 2; possition++;
 																	break;
 																	case 'Food': food.b = true; food.c = possition + 2; possition++;
 																	break;
 																	}
 																});
 															
 															
 															tempObject.price = (!price.b) ? '-1' : tempArray[price.c].slice(0, 1);
 															tempObject.ambience = (!ambience.b) ? '-1' : tempArray[ambience.c].slice(0, 1);
 															tempObject.service = (!service.b) ? '-1' : tempArray[service.c].slice(0, 1);
 															tempObject.food = (!food.b) ? '-1' : tempArray[food.c].slice(0, 1);

 															
 															tempObject.average = tempArray[1].slice(0, 1);
 															
 															
 															
 															
 														}else
 														{
 															
 															tempObject.name = (($(temp).find('.mo span:eq(0)').text()) === '' ) ?  ('Facebook_User_Bastelschrank') : ($(temp).find('.mo span:eq(0)').text());
 															// Title
 															tempObject.title = (($(temp).find('.quote>a:eq(0)').text()).slice(1, ($(temp).find('.quote>a:eq(0)').text()).length - 1));
 															// Text
 															tempObject.text = (($(temp).find('.entry>p:eq(0)').text()).slice(1, ($(temp).find('.entry>p:eq(0)').text()).length - 1));
 															
 															tempObject.date = ($(temp).find('.ratingDate>span').text() === "NEW") ? (($(temp).find('.ratingDate').text()).slice(9, ($(temp).find('.ratingDate').text()).length - 5)) : (($(temp).find('.ratingDate:first').text()).slice(9, ($(temp).find('.ratingDate:first').text()).length - 1));

 															var tempArray = new Array();
 															$(temp).find('.sprite-ratings').each(function(){tempArray.push($(this).attr('alt'));});
 															tempObject.average = tempArray[0].slice(0, 1);
 															tempObject.price = "-1";
 															tempObject.ambience = "-1";
 															tempObject.service = "-1";
 															tempObject.food = "-1";
 														}
 														
 														cc.user.push(tempObject);
 													}
 													
 													result.push(cc.newUrl);
 													result.push(cc.count);
 													result.push(cc.site);
 													if(cc.site == 1 || cc.site == 0)
 													{
 														result.push(cc.restaurant);
 														
 													}
 													
 													result.push(cc.user);/* */

 													return cc;
 												}, function(err, result)
 												{
 													page.render('2pic.png', function()
 														{
 															return log('render 2 done')
 														});
 													
 													log(err);
// 													log('result');
// 													log(result);
// 													log('result');
 													page.close();
 													if(result === null)
 													{
 														log('scraping failed!');
 														//TODO save url;
 														return ph.exit();
 													}
 													

 													if(status === 'success' && !err)
 													{
 														log('Site ' + result.site + ' of ' + result.count + ' of this page scraped!');
 													}
 													else
 													{
 														log('Scraping failed try again...');
 													}
 													Data = new Object();
 													
 													Data.status = status;
 													Data.err = err;
 													Data.restaurantID = restaurantID;
 													Data.url = result.newUrl;
 													Data.count = result.count;
 													Data.site = result.site;
 													if(result.site === 0 || result.site == 1)
 													{
 														Data.restaurant = result.restaurant;
 													}
 													Data.user = result.user;
 													//log(Data);
 													
 													return saveRating(ph, Data);
 												});
 										}, 6000);
 								});
							}, 10000);
 						});
 				});
 		}
 		else if(Data.Url === 'end')
 		{
 			return callbackEnd(ph);
 		}
 	};
 	
 	log("Init Phantom");
 	return phantomInit();
 };

 ratingFarmer((function(Data, db)
 		{
 			if (Data.status !== "success")
 			{
 				log(Data);
 				return log("Unable to connect to '" + Data.url + "' at page: " + Data.site);
 			} else 
 			{
 				log(Data);
 				return log("Page " + Data.site + " of " + Data.count + " loadet, scraped and put into Database. Next Page: '" + Data.url);
 			}
 			
 		}), (function(ph)
 		{
 			log('Exit Phantom');
 			return ph.exit();
 		}));
