
 var DB = require('./modules/DataBase');
 var phantom = require('node-phantom');
 var ratingFarmer, ratingStep, nextRating, phantomInit, site, dataGetter, clickMore, log;
 var first = true;
 var Data = new Object();
 var check = null;

 
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
					//return nextRating(ph, tempUrl);

				},{parameters:{'load-images':'no'}});

	};

	ratingStep = function(ph, result)
			{
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
		if(first || Data.url !== "end" )
		{
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
												return;
												}, function(err, result)
												{
												log(err);
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
															log(err);
															log(result);
															return page.render('1pic.png', function()
																	{
																	log('render 1 done');
																	});
														});
													},1000);


									setTimeout(function()
											{
											log(page);
											page.render('2pic.png', function()
													{
													log('render 2 done!');
													});
											}, 15000);








									setTimeout(function()
											{
											console.log('click 1');
											page.render('step0.png');
											page.evaluate(function()
													{
													$('.content>a').trigger('click');
													},function()
													{
 													//page.sendEvent('click', koord.left + 1, koord.top + 1);
 													page.render('step1.png');
 													setTimeout(function()
 														{
 															
 															page.evaluate(function()
 															{
 																$('.moreLink:first').click();
 															}, function()
 															{
 																page.render('step2.png');
 																console.log('click 2');
 															});
 														}, 50000);
 												});
 											
 											page.render('step3.png');
 										}, 50000);
 									

 									setTimeout(function()
 										{
 											return page.evaluate(function()
 												{
 													var result = new Array(); /* 0:status 1:url 2:siteCount/control(end) 3:activSite */
 													var newUrl = new Array();
 													var restaurant = new Array();
 													var user = new Array();
 													var idArray = new Array();
 													var site = $('.paging.pageDisplay').text();
 													var count = new Array();
 													var offset;
 													
 													//$('.moreLink:first').focus();
 													//page.sendEvent('keypress', 'Enter', null, null);

 													$('.paging.taLnk').each(function(){count.push($(this).text());});
 													if(count.length > 1)
 													{
 														count = count[count.length -1];
 													}
 												
 													
 													$('.paging.taLnk').each(function(){newUrl.push($(this).attr('href'));});
 													
 													if( count === site)
 													{
 														newUrl = "next";
 													}
 													else if(newUrl.length > 3)
 													{
 														newUrl = "http://www.tripadvisor.com" + newUrl[2];
 													}
 													else if($('.paging.pageDisplay').text() === '1')
 													{
 														count  = $('.paging.taLnk:last').text();
 														newUrl = "http://www.tripadvisor.com" + newUrl[0];
 														
 														restaurant.push(($('#HEADING').text()).slice(2, ($('#HEADING').text()).length-2));
 														restaurant.push($('.street-address').text() + ", " + $('.locality').text());
 														restaurant.push(($('.more').text()).slice(0, ($('.more').text()).length - 8));
 														restaurant.push(($('.detail:first').text()).slice(11, ($('.detail:first').text()).length - 1));
 														restaurant.push(($('.sprite-ratings').attr('alt')).slice(0, ($('.sprite-ratings').attr('alt')).length - 11));
 														restaurant.push(($('.detail:eq(1)').text()).slice(17, ($('.detail:eq(1)').text()).length - 2));
 														restaurant.push(($('.fill:eq(5)').attr('style')).slice(6, ($('.fill:eq(5)').attr('style')).length - 3));
 														restaurant.push(($('.fill:eq(6)').attr('style')).slice(6, ($('.fill:eq(6)').attr('style')).length - 3));
 														restaurant.push(($('.fill:eq(7)').attr('style')).slice(6, ($('.fill:eq(7)').attr('style')).length - 3));
 														restaurant.push(($('.fill:eq(8)').attr('style')).slice(6, ($('.fill:eq(8)').attr('style')).length - 3));
 														restaurant.push($('.compositeCount:eq(0)').text());
 														restaurant.push($('.compositeCount:eq(1)').text());
 														restaurant.push($('.compositeCount:eq(2)').text());
 														restaurant.push($('.compositeCount:eq(3)').text());
 														restaurant.push($('.compositeCount:eq(4)').text());
 														restaurant.push("null");
 														restaurant.push("null");

 													}
 													else if($('.paging.pageDisplay').text() === '2')
 													{
 														newUrl = "http://www.tripadvisor.com" + newUrl[1];
 													}
 													
 													$('.reviewSelector').each(function(){idArray.push($(this).attr('id'));});
 													
 													for(var i in idArray)
 													{
 														/* Username */user.push(($('.username.mo:eq(' + i +')').text()).slice(1, ($('.username.mo:eq(' + i +')').text()).length - 1));
 														/* Title */user.push(($('.quote>a:eq(' + i +')').text()).slice(1, ($('.quote>a:eq(' + i +')').text()).length - 1));
 														/* Text */user.push(($('.entry>p:eq(' + i +')').text()).slice(1, ($('.entry>p:eq(' + i +')').text()).length - 1));
 														/* Ratings */
 														var temp = new Array();
 														//$('#' + idArray[i]).find($('.sprite-ratings')).each(function(){temp.push($(this).attr('alt'));});
 														for(var a = 1; a < temp.length; a++)
 														{
 															user.push(temp[a].slice(0, 1));//average preis ambi serv essen
 														}
 													}
 													result.push(status);
 													result.push(newUrl);
 													result.push(count);
 													result.push(site);
 													result.push(restaurant);
 													result.push(user);

 												
 													
 													return result;
 												}, function(result)
 												{
 													
 													//var offset = result[6];
 													//page.sendEvent('click', offset.left + 1, offset.top + 1);
 													
 													
 													page.render('step4.png');
 													console.log('done!');
 													page.close();
 													
 													for(var item in result)
 													{
 														console.log(item + "" + result[item]);
 													}
 													//return ratingStep(ph, result);
 												});
 										}, 200000);
 								});}, 8000);
 						});
 				});
 		}
 		else
 		{
 			return callbackEnd(ph);
 		}
 	};
 	
 	console.log("Start!");
 	return phantomInit();
 };

 ratingFarmer((function(Data, db)
 		{
 			if (Data.status !== "success")
 			{
 				return console.log("Unable to connect to '" + Data.url + "' at page: " + Data.activeSite);
 			} else 
 			{
 				return console.log("Page " + Data.siteCount + " loadet and scraped: '" + Data.url + " DB: " + db);
 			}
 		}), (function(ph)
 		{
 			return ph.exit();
 		}));
 


// 											return page.evaluate(function()
// 												{
// 												//ta.call('ta.servlet.Reviews.expandReviews',event,this,'review_172434118', '1', 4444)
// 												$('.moreLink:first').trigger('click');
// 												//$('.submitOnClick[value = "false"]:first').click();
 //
// 												}, function()
// 												{
// 													//page.sendEvent('keypress', 'Space', null, null)
// 													setTimeout(function()
// 														{
// 															page.render("test1.png");
// 															console.log("done!");
// 															page.close();
// 															return;
// 														}, 5000);
// 												});

// 									page.evaluate(function()
// 												{
// 													$('.submitOnClick[value = "false"]:first').click();
// 												}, function()
// 												{
// 													page.sendEvent('keypress', 'Enter', null, null);
// 													setTimeout(function()
// 														{
// 															page.render("test1.png");
// 															page.close();
// 														}, 5000);
// 												});
