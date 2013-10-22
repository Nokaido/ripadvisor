/**
 * This part of the ripadvisor dataextractor extracts the userinformation including the Rating texts, user rating behavior.
 * Bevor this part the rawresults must be created by the start.js
 */
 

 var DB = require('./modules/DataBase');
 var phantom = require('node-phantom');
 var ratingFarmer, ratingStep, nextRating, phantomInit, site, dataGetter, clickMore, log, saveRating, nextUser;
 var first = true;
 var Data = new Object();
 var next = false;
 var restaurantID;
 var failCounter = 0;


 
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
														var temp = 'second click';
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
													
													var toa = new Array();
													
													
 													var temp = new Array();
													
 													$('.paging.taLnk').each(function(){temp.push($(this).text());});
 													
 													if(temp.length > 0)
 													{
 														cc.count = (cc.site > parseInt(temp[temp.length -1])) ? (cc.site) : parseInt(temp[temp.length -1]);
 														cc.count = (temp[temp.length -1] === undefined) ? (cc.site) : cc.count;

 													}
 													else
 													{
 														cc.count = 1;
 													}
													if(cc.count === undefined || cc.count === "undefined" || cc.count === null)
 													{
 														cc.count = cc.site;
 													}
 													temp = new Array();
 													
 													$('.paging.taLnk').each(function(){temp.push($(this).attr('href'));});
 													
 													if( cc.count == cc.site || cc.site == 0)
 													{
 														cc.newUrl = "next";
 													}
 													else if(temp.length > 3)
 													{
 														cc.newUrl = (temp[2] === undefined) ? (null) : ("http://www.tripadvisor.com" + temp[2]);
 													}
 													else if(cc.site != 0 && (cc.site + 1) == cc.count && cc.count != 3)
 													{
 														cc.newUrl =  (temp[2] === undefined) ? (null) : ("http://www.tripadvisor.com" + temp[2]);
 													}
 													else if(cc.count == 3)
 													{
 														cc.newUrl =  (temp[1] === undefined) ? (null) : ("http://www.tripadvisor.com" + temp[1]);
 													}
 													
 													if(cc.site == 1)
 													{
 														cc.newUrl =  (temp[0] === undefined) ? (null) : ("http://www.tripadvisor.com" + temp[0]);
 														
 														cc.restaurant.push(($('#HEADING').text()).slice(2, ($('#HEADING').text()).length-1));//Name
 														cc.restaurant.push($('.street-address').text() + ", " + $('.locality').text());//Adress
 														cc.restaurant.push(($('.more').text()).slice(0, ($('.more').text()).length - 8));//RatingCount
 														cc.restaurant.push(($('.detail:first').text()).slice(1, ($('.detail:first').text()).length - 1));//FoodType
 														cc.restaurant.push(($('.sprite-ratings').attr('alt')).slice(0, ($('.sprite-ratings').attr('alt')).length - 11));//AverageRating
 														cc.restaurant.push(($('.detail:eq(1)').text()).slice(1, ($('.detail:eq(1)').text()).length - 1));//OccationType
 														if($('.fill:eq(5)').attr('style') != undefined) {cc.restaurant.push(($('.fill:eq(5)').attr('style')).slice(6, ($('.fill:eq(5)').attr('style')).length - 3));}//FoodRating
 														else{cc.restaurant.push("-1");}
 														if($('.fill:eq(6)').attr('style') != undefined) {cc.restaurant.push(($('.fill:eq(6)').attr('style')).slice(6, ($('.fill:eq(6)').attr('style')).length - 3));}//ServiceRating
 														else{cc.restaurant.push("-1");}	
 														if($('.fill:eq(7)').attr('style') != undefined) {cc.restaurant.push(($('.fill:eq(7)').attr('style')).slice(6, ($('.fill:eq(7)').attr('style')).length - 3));}//ValueRating
 														else{cc.restaurant.push("-1");}	
 														if($('.fill:eq(8)').attr('style') != undefined) {cc.restaurant.push(($('.fill:eq(8)').attr('style')).slice(6, ($('.fill:eq(8)').attr('style')).length - 3));}//AtmosphereRating
 														else{cc.restaurant.push("-1");}
 														if($('.compositeCount:eq(0)').text() != ""){cc.restaurant.push($('.compositeCount:eq(0)').text());}//ExcelentRatingCount
 														else{cc.restaurant.push("-1");}
 														if($('.compositeCount:eq(1)').text() != ""){cc.restaurant.push($('.compositeCount:eq(1)').text());}//VeryGoodRatingCount
 														else{cc.restaurant.push("-1");}
 														if($('.compositeCount:eq(2)').text() != ""){cc.restaurant.push($('.compositeCount:eq(2)').text());}//AverageRatingCount
 														else{cc.restaurant.push("-1");}
 														if($('.compositeCount:eq(3)').text() != ""){cc.restaurant.push($('.compositeCount:eq(3)').text());}//PoorRatingCount
 														else{cc.restaurant.push("-1");}
 														if($('.compositeCount:eq(4)').text() != ""){cc.restaurant.push($('.compositeCount:eq(4)').text());}//TerribleRatingCount
 														else{cc.restaurant.push("-1");}
 														cc.restaurant.push("null");//GPS Longitude
 														cc.restaurant.push("null");//GPS Latitude/* */
 														//length 17
 													}
 													else if(cc.site == 2 && cc.count != 2)
 													{
 														cc.newUrl = "http://www.tripadvisor.com" + temp[1];
 													}
 													else if(cc.site == 0)
 													{
 														cc.restaurant.push(($('#HEADING').text()).slice(2, ($('#HEADING').text()).length-1));//Name
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
 													if( cc.count == cc.site || cc.site == 0)
 													{
 														cc.newUrl = "next";
 													}
 													 
 													$('.reviewSelector').each(function(){cc.idArray.push($(this).attr('id'));});
 													
 													var temp;
 													
 													for(var i = 0; i < cc.idArray.length; i++)
 													{
 														temp = '#'+ cc.idArray[i];
 														var tempObject = new Object();
 														var to = new Object();
 														// Username


 														if($(temp).find('.sprite-ratings').length > 2)
 														{
 															tempObject.id = cc.idArray[i].slice(7, cc.idArray[i].length);
 															
 															tempObject.facebook = false;
 															//name
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
 															tempObject.facebook = true;
 															
 															tempObject.id = cc.idArray[i].slice(7, cc.idArray[i].length);
 															
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
 														//cc.user[tempObject.id] = tempObject;
 														cc.user.push(tempObject);
 													}
 													
 													if(cc.site == 1 || cc.site == 0)
 													{
 														result.push(cc.restaurant);
 														
 													}
 													
 													//return toa;
 													return cc;
 												}, function(err, result)
 												{
 													page.render('2pic.png', function()
 														{
 															return log('render 2 done');
 														});
 													log("***************");
 													log(result.user);
 													log("+++++++++++++++");
 														return nextUser(result, 0, new Array(), page, function(res){
// 															log("res:###################################");	
// 															log(res);
 														for(var a = 0; a < res.length; a++)
 														{
 															for(var b=0; b<result.user.length; b++)
 															{
 																if(result.user[a].id == res[b].id)
 																{
 																	result.user[a].user = res[b];
 																	log("#################");
 																	log(res[b]);
 																}
 															}
 														}
 														log("result:#####################################");
 														log(result);
 													/*log(err);*/
// 													log('result');
 													//log(result);
// 													log('result');
 													page.close();
 													if(result === null || res === null)
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
 														failCounter++;
 														if(failCounter == 5)
 														{
 															return ph.exit();
 														}
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
 												});
 										}, 5000);
 								});
							}, 9000);
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

nextUser = function(Data, counter, toa, page, returnData)
{
	if(counter < Data.idArray.length)
	{
		

		page.injectJs('./jquery-1.10.2.js', function(){
			page.evaluate(function(Data, counter){
				var temp;
				temp = '#'+ Data.idArray[counter];
				var id   = $(temp).find('.memberOverlayLink').attr('id');
				$('#' + id).mouseover();

				return;
			},function(err, result){
//					page.render('0' + counter + 'pic.png', function()
//							{
//								return log('render '+counter+' done');
//							});
					}, Data, counter);
			setTimeout(function(){
				page.injectJs('./jquery-1.10.2.js', function(){
					page.evaluate(function(Data, counter){
						var temp;
						var to = new Object();
						var slot;
						
						temp = '#'+ Data.idArray[counter];
						to.id = Data.idArray[counter].slice(7, Data.idArray[counter].length);
						
						var username = $(temp).find('.username').text();
						username = username.slice(1, username.length-1);
						
						if($('#GENERIC_MEMBER_OVERLAY')[0] === undefined && username !== "A TripAdvisor reviewer on Facebook" && ($(temp).find('.mo span:eq(1)').text()) !== '')
						{
							to.name = $('.memberOverlay.simple.wrap.container').find('.username>a:eq(0)').text();
							to.adress = 'http://www.tripadvisor.com' + $('.memberOverlay.simple.wrap.container').find('.username>a').attr('href');
							to.counter = counter;
								
							to.origin = $('.memberOverlay.simple.wrap.container').find('.memberStats').text();
							to.origin = (to.origin !== undefined) ? (to.origin.slice(1, to.origin.length-1)) : ("");
							to.ratingCount = $('.memberOverlay.simple.wrap.container').find('.numbersText:eq(0)').text();
							to.ratingCount = (to.ratingCount !== undefined ) ? (to.ratingCount.slice(1, to.ratingCount.length-1)) : ("");
							to.excellentCount = $('.memberOverlay.simple.wrap.container').find('.numbersText:eq(1)').text();
							to.excellentCount = (to.excellentCount !== undefined) ? (to.excellentCount.slice(2, to.excellentCount.length-1)) : ("");
							to.verygoodCount = $('.memberOverlay.simple.wrap.container').find('.numbersText:eq(2)').text();
							to.verygoodCount = (to.verygoodCount !== undefined) ? (to.verygoodCount.slice(2, to.verygoodCount.length-1)) : ("");
							to.averageCount = $('.memberOverlay.simple.wrap.container').find('.numbersText:eq(3)').text();
							to.averageCount = (to.averageCount !== undefined) ? (to.averageCount.slice(2, to.averageCount.length-1)) : ("");
							to.poorCount = $('.memberOverlay.simple.wrap.container').find('.numbersText:eq(4)').text();
							to.poorCount = (to.poorCount !== undefined) ? (to.poorCount.slice(2, to.poorCount.length-1)) : ("");
							to.terribleCount = $('.memberOverlay.simple.wrap.container').find('.numbersText:eq(5)').text();
							to.terribleCount = (to.terribleCount !== undefined) ? (to.terribleCount.slice(2, to.terribleCount.length-1)) : ("");
							to.contributionsCount = $('.boxes.wrap.container').find('.numbers:eq(0)').text();
							to.helpfullCount = $('.boxes.wrap.container').find('.numbers:eq(1)').text();
							to.citiesCount = $('.boxes.wrap.container').find('.numbers:eq(2)').text();
							$('close').click();
						}else
						{
							to.name = 'Facebook_User_Bastelschrank';
							to.adress = '';
							to.counter = counter;
								
							to.origin = '';
							to.ratingCount = '';
							to.excellentCount = '';
							to.verygoodCount = '';
							to.averageCount = '';
							to.poorCount = '';
							to.terribleCount = '';
							to.contributionsCount = '';
							to.helpfullCount = '';
							to.citiesCount = '';
							$('close').click();
						}
						return to;
					},function(err, result){
						
						log(result);
						
						if(result.name !== '')
						{
							toa.push(result);
							counter++;
						}else
						{
							log("Empty User!");
						}
						
						
						return nextUser(Data, counter, toa, page, returnData);
					}, Data, counter);
				});
			}, 3000);
		});

	}else
	{
		return returnData(toa);
	}
} 

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
