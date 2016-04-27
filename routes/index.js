var express = require('express');
var router = express.Router();
var path = require('path');
var models = require('../models/');
var https = require('https');
var async = require('async');
var mail = require('nodemailer');
var itIds = [24304, 24305, 24309, 24310, 24314, 24315, 24319, 24320, 24324, 24325, 24329, 24330, 24334, 24335, 24339, 24340, 68942, 70842, 24358, 24341, 24351, 24350, 24356, 24357, 24288, 24289, 24299, 24300, 24282, 24283, 24294, 24295, 46738, 46736, 46741, 46739];
router.get('/', function(req, res, next) {
    res.sendFile('index.html', { root: './views' })
});

router.get('/other', function(req, res, next) {
    res.sendFile('another.html', { root: './views' })
});
router.get('/rfr', function(req, res, next) {
    //refresh price list.	
    var parsedPrice, num = 0,itemsToChange = [];
    var theUrl = 'https://api.guildwars2.com/v2/commerce/prices?ids=' + itIds.join(',');
    https.get(
        theUrl,
        function(response) {
            // Continuously update stream with data
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                //got prices
                parsedPrice = JSON.parse(body);
                var itUrl = 'https://api.guildwars2.com/v2/items?ids=' + itIds.join(',')
                https.get(
                    itUrl,
                    function(nResponse) {
                        // Continuously update stream with data
                        var nbody = '';
                        nResponse.on('data', function(nd) {
                            nbody += nd;
                        });
                        nResponse.on('end', function() {
                            //got names
                            parsedName = JSON.parse(nbody);
                            for (var i = 0; i < parsedName.length; i++) {
                                for (var j = 0; j < parsedPrice.length; j++) {
                                    if (parsedName[i].id == parsedPrice[j].id) {
                                        //same item, add name to price
                                        var desc = parsedName[i].desc || parsedName[i].details ? parsedName[i].details.description : parsedName[i].type;
                                        parsedPrice[j].name = parsedName[i].name;
                                        parsedPrice[j].desc = desc;
                                    }
                                }
                            }
                            console.log('Prices:', parsedPrice);
                            //got all item names and prices, so now let's upsert them. ermahgerd, upsert.
                            checkItem(parsedPrice[num]);
                        });
                        nResponse.on('error', function(e) {
                            console.log('Error occured! ', e)
                        })
                    });
            });
            response.on('error', function(e) {
                console.log('Error occured! ', e)
            })
        });
    var checkItem = function(el) {
    	if(typeof el != 'object'){
    		el = JSON.parse(el);
    	}
        var query = { 'item_id': el.id };
        models.Item.findOne(query, function(err, resp) {
            // console.log('Old Item:', resp);
            //this is the item, so check to see if its status has changed
            var stat;
            var avgInc = (parseInt(el.buys.unit_price) + parseInt(el.sells.unit_price)) / 2;
            var avgStr = (parseInt(resp.min) + parseInt(resp.max)) / 2;
            if (avgInc > avgStr && ((avgInc - avgStr) / avgStr) > 0.5) {
                stat - 'sell';
                //price is HIGHER: sell!
            } else if (avgStr > avgInc && ((avgStr - avgInc) / avgInc) > 0.5) {
                //price is LOWER: buy!
                stat = 'buy';
            } else {
                stat = 'none';
            }
            itemsToChange.push({ 'name': el.name, 'stat': stat })
            // console.log('User action for item', el.name, 'is:', stat, 'Old price: ', avgStr, 'New Price:', avgInc);
            // console.log('Incoming:', el, 'Old:', resp);
            resp.stat = stat;
            models.Item.findOneAndUpdate(query, resp, { upsert: true }, function(err, doc) {
                // console.log('Item saved', doc, err)
                num++;
                if (num < itIds.length) {
                	//still items left!
                	console.log('Now gonna do:',resp);
                	checkItem(parsedPrice[num]);
                }else{
                    console.log('Sending off data!')
                    res.send(itemsToChange);
                }
            })
        })
    }
});
// console.log('MAIL',mail.createTransport)
// var transport = mail.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');
// transport.verify(function(err,suc){
// 	console.log(err,suc)
// })

module.exports = router;
