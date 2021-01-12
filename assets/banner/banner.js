function Banner(options) {
    let _timer = options.timer;
    let _isActive = false;
    let _this = this;
    let _daysDelay = options.daysDelay;
    let _pagesExclude = options.pagesExclude;
    let _currentStep = 0;
    let _data = {};
    let _callback = options.callback;
    let _countries = options.countries;

    const productionTypes = ["Градирни мокрые модульные", "Строительные градирни", "Закрытые мокрые градирни",
        "Сухие градирни", "Чиллеры", "АБХМ", "Насосные группы", "Теплообменники"];

    // $(document).scroll(init)
    // $(document).mousemove(init)
    init();
    $("body").on("showDebriefing", show)
    $(".banner__button-close").click(close);
    $(".banner__button-next").click(nextStep);
    $(".banner__select").click(selectProduction);
    $("input.banner__input").focusout(inputCheck)
    $("select").change(inputCheck);
    $(document).mouseleave(function (e) {
        if (e.clientY < 10) {
            show();
        }
    });
    $(document).ready(function(){
        $("body").prepend($(".pop-up"));
    })

    this.setItem = function(currentItemIndex){
        _currentStep = 1;
        let productionId = currentItemIndex;
        _data["production"] = {"id": currentItemIndex, "value": productionTypes[currentItemIndex]}
        $("#selectProduction").val(_data["production"].value);
        nextStep();

        if (isPageExpulsionCheck()) return;
        countryCheck(function(isBlock){
            if (!isBlock){
                play();
            }
        })
    }

    function inputCheck() {
        let parent = $(this);

        if (parent.val().length > 0) {
            parent.parent().addClass("banner__input-wrapper--accept");
            parent.removeClass("banner__input--exception");

            if (parent.hasClass("paired")) {
                $(".banner__input.paired").removeClass("banner__input--exception");
            }
        } else {
            parent.parent().removeClass("banner__input-wrapper--accept")
        }
    }

    function selectProduction() {
        let productionId = parseInt($(this).attr("data-id"))
        _data["production"] = {"id": productionId, "value": productionTypes[productionId]}
        $(".banner__select").removeClass("banner__select--active")
        $(this).addClass("banner__select--active");
    }

    function countryCheck(callback) {
        let isBlock = true;
        for (let i = 0; i < _countries.length; i++) {
            if (_countries[i].toLowerCase().indexOf(ymaps.geolocation.country.toLowerCase()) != -1) {
                isBlock = false
            }
        }

        if (callback) callback(isBlock);
    }

    function init() {
        if (_isActive) return;

        setTimeout(function () {
            $("body").trigger("showDebriefing")
        }, _timer * 1000)
    }

    this.alwaysShow = function(){
        localStorage.setItem("alwaysShow", "1");
    }

    this.block = function () {
        localStorage.setItem("block", "1");
    }
    this.refrash = function(){
        localStorage.setItem("alwaysShow", "0");
        localStorage.setItem("block", "0");
    }
    this.show = function(){
        $(".pop-up").addClass("pop-up--active");
        $("body").css("overflow", "hidden");
        let lastShowDate = Date.now();
        localStorage.setItem('BannerShow', lastShowDate);
    }

    if (location.href.indexOf("show") != -1){
        _this.show();
    }

    if (location.href.indexOf("block") != -1){
        _this.block();
    }

    if (location.href.indexOf("alwaysShow") != -1){
        _this.alwaysShow();
    }

    if (location.href.indexOf("refrash") != -1){
        _this.refrash();
    }

    if (location.href.indexOf("setItem") != -1){
        $(document).ready(function(){
            ymaps.ready(function(){
                let curItemIndex = parseInt(location.href.split("=")[1])
                _this.setItem(curItemIndex);
            });
        })
    }

    function isAlwaisShow(){
        if (localStorage.getItem("alwaysShow") !== null){
            return parseInt(localStorage.getItem("alwaysShow"));
        }else{
            return false;
        }
    }

    function isBlock() {
        if (localStorage.getItem("block") !== null){
            return parseInt(localStorage.getItem("block"));
        }else{
            return false;
        }
    }

    function show() {
        if (_isActive) return;
        _isActive = true;

        if (isBlock()) return;

        if(isAlwaisShow()){
            play();
        }else{
            if (isDayDelayCheck() || isPageExpulsionCheck()) return;
            countryCheck(function(isBlock){
                if (!isBlock){
                    play();
                }
            })
        }
    }

    function play(){
        $(".pop-up").addClass("pop-up--active");
        $("body").css("overflow", "hidden");
        let lastShowDate = Date.now();
        localStorage.setItem('BannerShow', lastShowDate)
    }

    function nextStep() {
        if (_currentStep == 1 && _data["production"] == null) {
            return;
        }

        switch (_currentStep) {
            case 1:
                $(".currentProduct").text(_data.production.value + ".\n\t")
                $(`.banner__content--step` + _currentStep).removeClass("hide");
                $(".banner__row").removeClass("banner__row--visible");
                $(".banner__row.p" + _data.production.id).addClass("banner__row--visible");
                break;
            case 2:
                $("#selectProduction").val(_data["production"].value);
                if (!validate($(".banner__row.p" + _data.production.id).find(".banner__input"))) return;
                $(".banner__content--step3").find(".banner__row").addClass("banner__row--visible")
                break;
            case 3:
                if (!validate($(".banner__content--step3").find(".banner__input"))) return;


                let notEmpty = $(".banner__input").filter(function (index) {
                    if ($(this).val() == null) return false
                    return $(this).val().length > 0;
                });

                for (i = 0; i < notEmpty.length; i++){
                    let item = {};
                    notEmpty.eq(i);
                    _data[notEmpty.eq(i).attr("name")] = notEmpty.eq(i).val()
                }

                _data[$("#selectProduction").attr("name")] = _data["production"].value;
                _data["production"] = _data["production"].value;
                if (_callback) _callback(_data);
                BuildMail(_data["fio"], function(html){
                    //email
                    $.post( "/bannerMailSend.php", {Data: html, Mail: _data["email"]} );
                })
                break;
            case 4:
                close();
                return;
        }

        _currentStep += 1;

        $(".banner__content").addClass("hide");
        $(`.banner__content--step` + _currentStep).removeClass("hide");

        function validate(inputs) {
            let isException = false;
            for (let i = 0; i < inputs.length; i++) {
                let cur = inputs.eq(i);

                if (cur.val() <= 0) {

                    if (cur.hasClass("paired")) {
                        let pairedInputs = inputs.filter(".paired");
                        let notEmpty = pairedInputs.filter(function (index) {
                            return $(this).val().length > 0;
                        });

                        if (notEmpty.length > 0) {
                            continue;
                        }
                    }

                    inputs.eq(i).addClass("banner__input--exception");
                    isException = true;
                }
            }
            if (isException) return false;
            return true;
        }
    }

    function close() {
        $('.pop-up').removeClass("pop-up--active");
        $("body").removeAttr("style");
    }

    function isDayDelayCheck() {
        let lastShow;

        if (localStorage.getItem('BannerShow') !== null) {
            lastShow = localStorage.getItem('BannerShow');
        } else {
            return false;
        }

        lastShow = parseInt(lastShow);
        let dayDuration = _daysDelay * 24 * 60 * 60 * 1000;

        if (Date.now() - lastShow > dayDuration) {
            return false;
        } else {
            return true
        }
    }

    function isPageExpulsionCheck() {
        return false;
    }

    function BuildMail(name, callback){
        let parts = [
            {
                link: "/mail/head.html",
                "build": staticBuild
            },
            {
                link: "/mail/description.html",
                "build": staticBuild
            },
            {
                link: "/mail/product.html",
                "build": productsRowBuild
            },
            {
                link: "/mail/description.html",
                "build": secondDescriptionBuild
            },
            {
                link: "/mail/offset.html",
                "build": staticBuild
            },
            {
                link: "/mail/boon.html",
                "build": boonsBuild
            },
            {
                link: "/mail/end.html",
                "build": staticBuild
            }
        ]
        let indexPage;
        let boonsPage;

        $.get("/index.php", function (responce) {
            indexPage = $("<div class='root'></div>").html(responce);

            $.get("/preimushchestva-kompanii", function(responce){
                boonsPage = $("<div></div>").html(responce);

                htmlBuild(parts, function (html) {
                    html = html.replace("[Имя]",name)
                    if (callback) callback(html);
                    //$("#mail").html(html);
                });
            })
        });

        function arrayTwist(array, indexTo, indexFrom){
            let adapter = array[indexFrom];
            array[indexFrom] = array[indexTo];
            array[indexTo] = adapter;
            return array;
        }

        function htmlBuild(parts, callback) {
            let currentStep = 0;
            let html = "";

            route();

            function route() {
                if (currentStep >= parts.length) {
                    if (callback) callback(html);
                    return;
                }

                execute()
            }

            function execute() {
                $.get(parts[currentStep].link, function (responce) {
                    parts[currentStep].build(responce, function (result) {
                        html += result;
                        currentStep += 1;
                        route();
                    })
                })
            }
        }

        function staticBuild(responce, callback) {
            if (callback) callback(responce);
        }

        function productsRowBuild(responce, callback) {
            parseSiteProducts(responce, function (products) {
                let root = $("<div></div>")

                arrayTwist(products, 0, 3);
                arrayTwist(products, 1, 4);
                arrayTwist(products, 2, 5);

                for (let i = 0; i < products.length; i++) {
                    root.append(products[i]);
                }

                if (callback) callback(root.html());
            });

            function parseSiteProducts(productsRowTemplate, callback) {
                let template = $(productsRowTemplate);
                let root = $("<div class='root'></div>");
                let products = indexPage.find(".divnavsu");
                let result = [];

                for (let i = 0; i < products.length - 1; i += 2) {
                    let values = {
                        left: getParams(products.eq(i)),
                        right: getParams(products.eq(i + 1))
                    }

                    let clone = template.clone();
                    setProductsRowValues(values, clone);
                    result.push(clone);
                }

                if (callback) callback(result);

                function getParams(item) {
                    let result = {
                        title: item.find("h3").text(),
                        image: item.find("img").attr("src"),
                        link: item.find("a").attr("href")
                    }

                    let d = item.clone();
                    d.find("a").remove();
                    result["description"] = d.html();

                    return result;
                }
            }

            function setProductsRowValues(values, template) {
                let columns = template.find(".item");
                let left = columns.eq(0);
                let right = columns.eq(1);

                setValue(values.left, left);
                setValue(values.right, right);

                function setValue(values, item) {
                    item.find(".title").text(values.title);
                    item.find(".link").attr("href", values.link);
                    item.find(".image").attr("src", values.image);

                    var root = $("<div></div>");

                    let priceTextIndex = values.description.indexOf("Купить от");
                    if (priceTextIndex !== -1){
                        let subStart = values.description.substring(0,priceTextIndex);
                        let subEnd = values.description.substring(priceTextIndex);
                        values.description = subStart + "<br>" + subEnd;
                    }

                    root.append($(values.description));
                    let description = item.find(".description");
                    root.find("p").attr("style", description.attr("style"))
                    description.html(root.html());
                }
            }
        }

        function secondDescriptionBuild(responce, callback){
            let externalHtml = indexPage.find(".pomenshe");
            let internalHtml = $("<div></div>").html(responce);

            externalHtml.find("p").attr("style", internalHtml.find("p").attr("style"));
            let items = internalHtml.find("p");

            for (let i =0; i < items.length; i++){
                if (i === 0){
                    items.eq(i).html(externalHtml.html());
                }
                else{
                    items.eq(i).remove();
                }
            }

            if (callback) callback(internalHtml.html());
        }

        function boonsBuild(responce, callback){
            let template = $(responce);
            let result = $("<div></div>");

            let externalBoonsRow = boonsPage.find(".tablicapreimuschestva").find("tr");

            for (var i =0; i < externalBoonsRow.length; i++){
                let curItem = externalBoonsRow.eq(i);

                let title = curItem.find("h3").text();

                if (title.length == 0) continue

                let description = curItem.find("td").eq(1).clone();
                description.find("h3").remove();
                description = description.text();

                let image = curItem.find("img").attr("src");

                let newTemplate = template.clone();
                newTemplate.find(".title").text(title);
                newTemplate.find(".description").text(description);
                newTemplate.find(".image").attr("src", image);

                if (i > 1) {
                    newTemplate.find(".decor--bottom").remove();
                }

                result.append(newTemplate);
            }

            if (callback) callback(result.html());
        }
    }
}