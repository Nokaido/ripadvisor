
 var DB = require('./modules/DataBase');
 var phantom = require('node-phantom');
 var ratingFarmer, ratingStep, nextRating, phantomInit, site, dataGetter, clickMore, log;
 var first = true;
 var Data = new Object();
 var next = false;

 
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

	ratingStep = function(ph, result)
			{
				//TODO set next when site == count
		
				
				if(result[0] === "success" && result[2] === "next")
				{
					/* Database */
					DB.deleteFirstRawResult();
					result[1] = DB.getFirstRawResult();
					log("Next page: ");
					log(result[1]);
				}
				else
				{
					log("site Error!");
				}

				callbackInfo(result, DB);

				return nextRating(ph, result);
			};

	nextRating = function(ph, Data)
	{
		if(first || !next)
		{
			first = false;
			return ph.createPage(function(err, page)
					{
					return page.open(Data.url, function(err, status)
							{
							log("opened site : " + Data.url + " " + status);
							page.onLoadFinished = function()
									{
										log('ready!');
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
														return;
														}, function(err, result)
														{

														});
													},1000);

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
													cc.site =  $('.paging.pageDisplay').text();
													cc.count = 0;

 													var temp = new Array();
													//var result =  /* 0:status 1:url 2:siteCount/control(end) 3:activSite */
													//var newUrl = new Array();
													//var restaurant = new Array();
													//var user = new Array();
													//var idArray = new Array();
													//var site = $('.paging.pageDisplay').text();
													//var count = new Array();

													
 													$('.paging.taLnk').each(function(){temp.push($(this).text());});
 													if(temp.length > 0)
 													{
 														cc.count = temp[temp.length -1];
 													}
 													else
 													{
 														cc.count = 1;
 													}
 													temp = new Array();
 													
 													$('.paging.taLnk').each(function(){temp.push($(this).attr('href'));});
 													
 													if( cc.count === cc.site)
 													{
 														cc.newUrl = "next";
 													}
 													else if(temp.length > 3)
 													{
 														cc.newUrl = "http://www.tripadvisor.com" + temp[2];
 													}
 													else if($('.paging.pageDisplay').text() === '1')
 													{
 														cc.count  = $('.paging.taLnk:last').text();
 														cc.newUrl = "http://www.tripadvisor.com" + temp[0];
 														
 														cc.restaurant.push(($('#HEADING').text()).slice(2, ($('#HEADING').text()).length-1));//Name
 														cc.restaurant.push($('.street-address').text() + ", " + $('.locality').text());//Adress
 														cc.restaurant.push(($('.more').text()).slice(0, ($('.more').text()).length - 8));
 														cc.restaurant.push(($('.detail:first').text()).slice(11, ($('.detail:first').text()).length - 1));
 														cc.restaurant.push(($('.sprite-ratings').attr('alt')).slice(0, ($('.sprite-ratings').attr('alt')).length - 11));
 														cc.restaurant.push(($('.detail:eq(1)').text()).slice(17, ($('.detail:eq(1)').text()).length - 2));
 														cc.restaurant.push(($('.fill:eq(5)').attr('style')).slice(6, ($('.fill:eq(5)').attr('style')).length - 3));
 														cc.restaurant.push(($('.fill:eq(6)').attr('style')).slice(6, ($('.fill:eq(6)').attr('style')).length - 3));
 														cc.restaurant.push(($('.fill:eq(7)').attr('style')).slice(6, ($('.fill:eq(7)').attr('style')).length - 3));
 														cc.restaurant.push(($('.fill:eq(8)').attr('style')).slice(6, ($('.fill:eq(8)').attr('style')).length - 3));
 														cc.restaurant.push($('.compositeCount:eq(0)').text());
 														cc.restaurant.push($('.compositeCount:eq(1)').text());
 														cc.restaurant.push($('.compositeCount:eq(2)').text());
 														cc.restaurant.push($('.compositeCount:eq(3)').text());
 														cc.restaurant.push($('.compositeCount:eq(4)').text());
 														cc.restaurant.push("null");//GPS Longitude
 														cc.restaurant.push("null");//GPS Latitude

 													}
 													else if($('.paging.pageDisplay').text() === '2')
 													{
 														cc.newUrl = "http://www.tripadvisor.com" + temp[1];
 													}
 													else if($('.paging.pageDisplay').text() === '')
 													{
 														cc.restaurant.push(($('#HEADING').text()).slice(2, ($('#HEADING').text()).length-2));
 														cc.restaurant.push($('.street-address').text() + ", " + $('.locality').text());
 													}
 													 
 													$('.reviewSelector').each(function(){cc.idArray.push($(this).attr('id'));});
 													/* */
 													var temp;
 													
 													for(var i = 0; i < cc.idArray.length; i++)
 													{
 														temp = '#'+ cc.idArray[i];
 														tempObject = new Object();
 														// Username
 														tempObject.name = (($(temp).find('.mo span:eq(1)').text()));
 														// Title
 														tempObject.title = (($(temp).find('.quote>a:eq(1)').text()).slice(1, ($(temp).find('.quote>a:eq(1)').text()).length - 1));
 														// Text
 														tempObject.text = (($(temp).find('.entry>p:eq(1)').text()).slice(1, ($(temp).find('.entry>p:eq(1)').text()).length - 1));
 														// Ratings
 														
 														if(($(temp).find('.sprite-ratings')).length > 1)
 														{
 															var tempArray = new Array();
 															$(temp).find('.sprite-ratings').each(function(){tempArray.push($(this).attr('alt'));});
 															
 															tempObject.average = tempArray[1].slice(0, 1);
 															tempObject.price = tempArray[2].slice(0, 1);
 															tempObject.ambience = tempArray[3].slice(0, 1);
 															tempObject.service = tempArray[4].slice(0, 1);
 															tempObject.food = tempArray[5].slice(0, 1);
 															
 															cc.user.push(tempObject);
 															/*for(var a = 1; a < tempArray.length; a++)
 															{
 																cc.user.push(tempArray[a].slice(0, 1));//average preis ambi serv essen
 															}*/
 														}
 													}
 													
 													//cc.result.push(status);
 													result.push(cc.newUrl);
 													result.push(cc.count);
 													result.push(cc.site);
 													result.push(cc.restaurant);
 													result.push(cc.user);

 												
 													
 													return result;
 												}, function(err, result)
 												{

 													page.render('2pic.png', function()
 														{
 															log('render 2 done')
 														});
 													log(err);
 													page.close();
 													
 													log('Site scraped!');

 													return ratingStep(ph, result);
 												});
 										}, 4000);
 								});
							}, 8000);
 						});
 				});
 		}
 		else if(Data.Url === 'end')
 		{
 			return callbackEnd(ph);
 		}else
 		{
 			Data.Url = 'next';
 		}
 	};
 	
 	log("Init Phantom");
 	return phantomInit();
 };

 ratingFarmer((function(Data, db)
 		{
 			if (Data.status !== "success")
 			{
 				return log("Unable to connect to '" + Data.url + "' at page: " + Data.activeSite);
 			} else 
 			{
 				return log("Page " + Data.siteCount + " loadet and scraped: '" + Data.url + " DB: " + db);
 			}
 		}), (function(ph)
 		{
 			log('Exit Phantom');
 			return ph.exit();
 		}));
