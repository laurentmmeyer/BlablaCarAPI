var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var cheerio = require('cheerio');

var driverSelector = 'div.RegularSearch > ul > li > a > article > div.ProfileCard.ProfileCard--condensed.span2 > div.ProfileCard-head > div.ProfileCard-infosBlock > h2';
var ageSelector = 'div.RegularSearch > ul > li > a > article > div.ProfileCard.ProfileCard--condensed.span2 > div.ProfileCard-head > div.ProfileCard-infosBlock > div:not(.u-truncate)';
var startTimeSelector = 'div.RegularSearch > ul > li > a > article > div.description.span5 > h3.time.light-gray';
var priceSelector = 'div.RegularSearch > ul > li > a > article > div.offer.span2.align-right > div > strong > span';
var startPointSelector = 'div.RegularSearch > ul > li > a > article > div.description.span5 > dl.geo-from > dd';
var endPointSelector = 'div.RegularSearch > ul > li > a > article > div.description.span5 > dl.geo-to > dd';
var numberOfFreePlacesSelector = 'div.RegularSearch > ul > li > a > article > div.offer.span2.align-right > div.availability > strong';
// TODO Manage optional attr.
var carSelector = 'div.RegularSearch > ul > li > a > article > div.description.span5 > dl.car-type > dt > strong';
var reviewSelector = 'div.RegularSearch > ul > li> a > article > div.ProfileCard.ProfileCard--condensed.span2 > div:nth-child(2) > p > span.u-textBold.u-darkGray';

var allSelectors = {
    age: ageSelector,
    start: startTimeSelector,
    price: priceSelector,
    startPoint: startPointSelector,
    endPoint: endPointSelector,
    numberOfFreePlaces: numberOfFreePlacesSelector
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/:src/:dest', function (req, res, next) {
    var options = {
        baseUrl: 'https://www.blablacar.de/',
        uri: '/search_xhr',
        qs: {
            fn: req.params.src.toLowerCase(),
            tn: req.params.dest.toLowerCase(),
            db: '21.09.2016'
        },
        transform: function (body) {
            return JSON.parse(body);
        }
    };
    rp(options).then(function (blabla) {
        var trips = [];
        var $ = cheerio.load(blabla.html.results);
        var drivers = $(driverSelector).each(function (i, driver) {
            trips[i] = {driverName: trim($(this).text())}
        });
        for (selector in allSelectors) {
            $(allSelectors[selector]).each(function (i, lol) {
                trips[i][selector] = trim($(this).text());
            });
        }
        res.send(trips);
    })
});

function trim(s) {
    return ( s || '' ).replace(/^\s+|\s+$/g, '');
}

module.exports = router;


//https://www.blablacar.de/search_xhr?fn=M%C3%BCnchen&tn=Memmingen&db=21.09.2016&sort=trip_date&order=asc&limit=10&page=1&_=1473627977577' -H 'pragma: no-cache' -H 'accept-language: de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4,fr;q=0.2' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36' -H 'accept: */*' -H 'cache-control: no-cache' -H 'authority: www.blablacar.de' -H 'referer: https://www.blablacar.de/mitfahren/muenchen/memmingen/' --compressed