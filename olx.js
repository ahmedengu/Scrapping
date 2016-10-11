module.exports = function (start, connection, moment, limit) {
    var Xray = require('x-ray'), cheerio = require('cheerio');

    var x = Xray({
        filters: {
            trim: function (value) {
                return typeof value === 'string' ? value.trim() : value
            },
            area: function (value) {
                $ = cheerio.load(value);
                return $('.item').find('th:contains("المساحة")').next().text();
            }, rooms: function (value) {
                $ = cheerio.load(value);
                return $('.item').find('th:contains("غرف نوم")').next().text();
            }, bathrooms: function (value) {
                $ = cheerio.load(value);
                return $('.item').find('th:contains("الحمامات")').next().text();
            }, floor: function (value) {
                $ = cheerio.load(value);
                return $('.item').find('th:contains("الطابق")').next().text();
            }, furnished: function (value) {
                $ = cheerio.load(value);
                return $('.item').find('th:contains("مفروش")').next().text();
            },
            price: function (value) {
                return value.replace(/\D/g, '');
            },
            arToEn: function (value) {
                return value == "نعم";
            },
            date: function (value) {
                return moment(value.split(',')[1], 'LL', 'ar-sa').toDate();
            },
            location: function (value) {
                return value.split('،')[0];
            }
        }
    });


    function extracted(r, i) {
        p = r[i];
        try {
            x(p, '.offerbody', {
                title: 'h1.brkword|trim',
                details: '#textContent|trim',
                pics: ['.img-item img@src'],
                price: '.pricelabel strong  |price|trim',
                area: '.descriptioncontent@html |area|trim',
                rooms: '.descriptioncontent@html |rooms|trim',
                bathrooms: '.descriptioncontent@html |bathrooms|trim',
                floor: '.descriptioncontent@html |floor|trim',
                furnished: '.descriptioncontent@html |furnished|trim|arToEn',
                location: '.show-map-link |trim|location',
                date: '.pdingleft10.brlefte5:first-child |date'
            })(function (err, result) {
                if (err) {
                    console.log(err);
                    i++;
                    if (i < r.length)
                        setTimeout(function () {
                            extracted(r, i);
                        }, 1000);
                    else
                        console.log("OLX: done all");
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
                            console.log("OLX: done all");

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
                console.log("OLX: done all");
        }


    }

    x(start, ["tr .link.detailsLink@href"])
        .paginate('.next>.pageNextPrev @href')
        .limit(limit)(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                extracted(result, 0);
                console.log("OLX: done links");
            }
        });
}
