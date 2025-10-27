(function (w) {
  if (!w.InfiniteAjaxScroll) {
    function IASStub() {}
    IASStub.prototype.on = function(){};
    IASStub.prototype.destroy = function(){};
    IASStub.prototype.next = function(){};
    w.InfiniteAjaxScroll = IASStub;
  }
})(window);
