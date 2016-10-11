module.exports = function (start, connection, moment, limit) {
    var Xray = require('x-ray'), cheerio = require('cheerio');
    var x = Xray({
        filters: {
            trim: function (value) {
                return typeof value === 'string' ? value.trim() : value
            },
            area: function (value) {
                $ = cheerio.load(value);
                return $('tr').find('td:contains("المساحة")').next().text();
            }, rooms: function (value) {
                $ = cheerio.load(value);
                return $('tr').find('td:contains("الغرف")').next().text();
            }, bathrooms: function (value) {
                $ = cheerio.load(value);
                return $('tr').find('td:contains("الحمامات")').next().text();
            }, floor: function (value) {
                $ = cheerio.load(value);
                return $('tr').find('td:contains("الطابق")').next().text();
            }, furnished: function (value) {
                $ = cheerio.load(value);
                return $('tr').find('td:contains("النوع")').next().text();
            },
            price: function (value) {
                $ = cheerio.load(value);
                return $('tr').find('td:contains("السعر")').next().text();
            },
            date: function (value) {
                $ = cheerio.load(value);
                return moment($('tr').find('td:contains("تاريخ النشر")').next().text(), "DD/MM/YYYY").toDate();
            },
            arToEn: function (value) {
                return value == "شقق مفروشة";
            }, intReg: function (value) {
                return value.replace(/\D/g, '');
            }
        }
    });


    function extracted(r, i) {
        p = r[i];
        try {
            x(p, '.container', {
                title: '.titleAndAddress h1|trim',
                details: '.listingDesc>:nth-child(3)|trim',
                pics: ['.listingSlider img@src'],
                price: '.listingInfo@html|price|trim|intReg',
                area: '.listingInfo@html |area|trim|intReg',
                rooms: '.listingInfo@html |rooms|trim',
                bathrooms: '.listingInfo@html |bathrooms|trim',
                floor: '.listingInfo@html |floor|trim',
                furnished: '.listingInfo@html |furnished|trim|arToEn',
                location: '.titleAndAddress p|trim',
                date: '.listingInfo@html |date'
            })(function (err, result) {
                if (err) {
                    console.log(err);i++;
                    if (i < r.length)
                        setTimeout(function () {
                            extracted(r, i);
                        }, 1000);
                    else
                        console.log("Aqarmap: done all");
                } else {
                    result.url = p;
                    result.pics = "{" + result.pics.join(",") + "}";
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
                            console.log("Aqarmap: done all");
                    });
                    // console.log(query);

                }
            });
        } catch (e) {
            console.log(e);

            i++;
            if (i < r.length)
                setTimeout(function () {
                    extracted(r, i);
                }, 1000);
            else
                console.log("Aqarmap: done all");

        }

    }

    x(start, [".sectionBody .listingItem .detailsButton@href"])
        .paginate('.pagination .next a@href')
        .limit(limit)(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                extracted(result, 0);
                console.log("Aqarmap: done links");
            }
        });
}
