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
}