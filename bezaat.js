module.exports = function (start, connection, moment, limit) {
    var Xray = require('x-ray'), cheerio = require('cheerio');

    var x = Xray({
        filters: {
            trim: function (value) {
                return typeof value === 'string' ? value.trim() : value
            },
            area: function (value) {
                $ = cheerio.load(value);
                return $('li:contains("المساحة") > span:last-child').text();
            }, rooms: function (value) {
                $ = cheerio.load(value);
                return $('li:contains("عدد الغرف") > span:last-child').text();
            },
            location: function (value) {
                $ = cheerio.load(value);
                return $('li:contains("المنطقة/الحي") > span:last-child').text();
            }, date: function (value) {
                $ = cheerio.load(value);
                var replace =   $('li:contains("تاريخ الانتهاء") > span:last-child').text();
                return moment(replace, "DD/MM/YYYY").toDate();
            },
            arToEn: function (value) {
                return value == "نعم";
            }, intReg: function (value) {
                return value.replace(/\D/g, '');
            },
            furnished: function (value) {
                return true;
            }
        }
    });


    function extracted(r, i) {
        p = r[i];
        try {
            x(p, '#big-tit', {
                title: '.title-top h1|trim',
                details: '#image-gallery  #desc p|trim',
                pics: ['.rsContainer img@src'],
                price: '.tab-l .price[itemprop=price] |intReg|trim',
                area: '#desc-tab@html |area|trim|intReg',
                rooms: '#desc-tab@html |rooms|trim|intReg',
                location: '#desc-tab@html |location|trim',
                date: '#desc-tab@html |date',
                furnished: '|furnished'
            })(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    result.url = p;
                    result.pics = "{" + result.pics.join(",") + "}";
                    // console.log(result);
                    var query = connection.query("INSERT INTO apartments SET ?", result, function (err, result) {
                        if (err)
                            console.log(err.code);

                    });
                    // console.log(query);

                }
            });
        } catch (e) {
            console.log(e);
        }


        i++;
        if (i < r.length)
            setTimeout(function () {
                extracted(r, i);
            }, 100 * i);
        else
            console.log("Bezaat: done all");

    }

    x(start, [".adv_item .adv_content_details a@href"])
        .paginate('.pagination li:last-child > a:first-child@href')
        .limit(limit)(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                extracted(result, 0);
                console.log("Bezaat: done links");
            }
        });
}
