
$(document).ready(function () {
    var showStage = function (stage, stageOld) {
        $.each(stage, function (name, value) {
            $(".info .value." + name).html(value);
        });
    };
    showStage($.stage(), null);
    $(window).stage(function (ev, stage, stageOld) {
        showStage(stage, stageOld);
    });
});

