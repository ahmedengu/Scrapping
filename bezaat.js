module.exports = function (start, connection) {
    var Xray = require('x-ray'), cheerio = require('cheerio');

    var x = Xray({
        filters: {
            trim: function (value) {
                return typeof value === 'string' ? value.trim() : value
            },
            area: function (value) {
                $ = cheerio.load(value);
                return $('li:nth-child(5)').text();
            }, rooms: function (value) {
                $ = cheerio.load(value);
                return $('li:nth-child(3)').text();
            },
            location: function (value) {
                $ = cheerio.load(value);
                return $('li:nth-child(4)').text().replace("المنطقة/الحي", "").replace("»", "");
            },
            arToEn: function (value) {
                return value == "نعم";
            }, intReg: function (value) {
                return value.replace(/\D/g, '');
            }
        }
    });


    function extracted(r, i) {
        p = r[i];
        x(p, '#big-tit', {
            title: '.title-top h1|trim',
            desc: '#image-gallery  #desc p|trim',
            pics: ['.rsContainer img@src'],
            price: '.tab-l .price[itemprop=price] |intReg|trim',
            area: '#desc-tab@html |area|trim|intReg',
            rooms: '#desc-tab@html |rooms|trim|intReg',
            location: '#desc-tab@html |location|trim'
        })(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                result.url = p;
                result.pics = result.pics.join(",");
                // console.log(result);
                var query = connection.query("INSERT INTO apartments SET ?", result, function (err, result) {
                    if (err)
                        console.log(err.code);
                    i++;
                    if (i < r.length)
                        setTimeout(function () {
                            extracted(r, i);
                        }, 1000);
                    else
                        console.log("done all");
                });
                // console.log(query);

            }
        });

    }

    x(start, [".adv_item .adv_content_details a@href"])
        .paginate('.pagination li:last-child a@href')
        .limit(1)(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                extracted(result, 0);
                console.log("done links");
            }
        });
}
