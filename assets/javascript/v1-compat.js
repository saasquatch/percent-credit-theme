var debug = false,
  _log = function () {
    debug && window.console && console.log.apply(console, arguments);
  };

(function ($) {})(jQuery);

window.KeenAnalytics = window.KeenAnalytics || {};

window.onload = function () {
  if (
    squatch.mode.widgetMode == "HOSTED" ||
    squatch.mode.widgetMode == "MOBILE"
  ) {
    // Track MOBILE/HOSTED widget loads
    KeenAnalytics.trackLoadEvent(
      squatch.analytics.attributes.tenant,
      squatch.analytics.attributes.accountId,
      squatch.analytics.attributes.userId,
      squatch.mode.widgetMode
    );
  }
};

// gracefully handle mailto between chrome/outlook type systems/no mail client
// (i.e. - don't leave the page on blank tab)
var mailTo = function (url) {
  // I have often experienced Firefox errors with protocol handlers
  // so better be on the safe side.
  try {
    var mailer = window.open(url, "Mailer");
  } catch (e) {
    console.warn("There was an error opening a mail composer.", e);
  }
  setTimeout(function () {
    // This needs to be in a try/catch block because a Security
    // error is thrown if the protocols doesn't match
    try {
      // At least in Firefox the location is changed to about:blank
      if (
        mailer.location.href === url ||
        mailer.location.href.substr(0, 6) === "about:"
      ) {
        mailer.close();
      }
    } catch (e) {
      console.warn("There was an error opening a mail composer.", e);
    }
  }, 500);
};

$(function () {
  // try to load the custom profile images or default to empty gravatar if error occurs
  $("img.customprofileimg").each(function () {
    var imgSrc = $(this).data("profile-src");
    if (imgSrc != window.squatch.user.fallbackImg) {
      $(this).on("error", function () {
        $(event.target).attr("src", window.squatch.user.fallbackImg);
      });
      $(this).attr("src", imgSrc);
    }
  });

  $(".emailShare").attr("href", squatch.user.email.share.mailToLink);
  $(".remind").attr("href", squatch.user.email.reminder.mailToLink);
  $("body").on("touchstart click", ".emailShare, .remind", function (e) {
    if (e.type == "touchstart") {
      // mobile click
      // window.location=$(e.target).attr('href');
    } else {
      var address = $(this).data("address");

      // if this is not a mailto then it is a deep link
      if (!$(e.target).is('a[href^="mailto"]')) {
        if (typeof address != "undefined") {
          $(e.target).attr("href", $(e.target).attr("href") + "&to=" + address);
        }
        return;
      }

      var mailurl =
        typeof address != "undefined"
          ? $(e.target)
              .attr("href")
              .replace("mailto:", "mailto:" + address)
          : $(e.target).attr("href");
      mailTo(mailurl);
    }
  });

  $("body").on("touchstart click", ".emailShare", function (e) {
    _log("clicked email share");

    if (window.frameElement && window.frameElement.squatchJsApi) {
      const res = window.frameElement.squatchJsApi._shareEvent(
        window.squatch,
        "EMAIL"
      );
    }
  });

  $(".emailMobile").attr("href", squatch.user.email.share.mailToLink);

  $("body").on("touchstart click", ".emailMobile", function (e) {
    if (e.type == "touchstart") {
      _log("clicked email share");

      if (window.frameElement && window.frameElement.squatchJsApi) {
        window.frameElement.squatchJsApi._shareEvent(window.squatch, "EMAIL");
      }
    }
  });

  $("body").on("touchend", ".fbShare", function (e) {
    e.preventDefault(); // stop potential refresh after touch ended
  });

  $("body").on("touchstart click", ".fbShare", function (e) {
    if (e.type != "touchstart") {
      e.preventDefault();
    }
    var pictureString =
      squatch.user.facebook.shareImage == "" ||
      squatch.user.facebook.shareImage === null
        ? ""
        : "&picture=" + squatch.user.facebook.shareImage;
    var width = 620,
      height = 400;
    var url;
    if (e.type == "touchstart") {
      url =
        "https://www.facebook.com/dialog/feed?app_id=" +
        squatch.user.facebook.appId +
        "&link=" +
        squatch.user.facebook.link +
        "&name=" +
        squatch.user.facebook.title +
        "&description=" +
        squatch.user.facebook.summary +
        pictureString +
        "&redirect_uri=" +
        squatch.user.facebook.redirectUrl;
    } else {
      url =
        "https://www.facebook.com/dialog/feed?app_id=" +
        squatch.user.facebook.appId +
        "&link=" +
        squatch.user.facebook.link +
        "&name=" +
        squatch.user.facebook.title +
        "&description=" +
        squatch.user.facebook.summary +
        pictureString +
        "&redirect_uri=" +
        squatch.user.facebook.redirectUrl +
        "&display=popup";
    }
    var opts =
      "status=0" +
      (e.type == "touchstart" ? "" : ",width=" + width + ",height=" + height);
    window.open(url, "fb", opts);

    _log("clicked facebook share");
    // KeenAnalytics.trackShareClickEvent(
    //   squatch.analytics.attributes.tenant,
    //   squatch.analytics.attributes.accountId,
    //   squatch.analytics.attributes.userId,
    //   squatch.mode.widgetMode,
    //   "FACEBOOK"
    // );
    if (window.frameElement && window.frameElement.squatchJsApi) {
      window.frameElement.squatchJsApi._shareEvent(window.squatch, "FACEBOOK");
    }
  });

  var pictureString =
    squatch.user.facebook.shareImage == "" ||
    squatch.user.facebook.shareImage === null
      ? ""
      : "&picture=" + squatch.user.facebook.shareImage;
  $(".fbMobile").attr(
    "href",
    "https://www.facebook.com/dialog/feed?app_id=" +
      squatch.user.facebook.appId +
      "&link=" +
      squatch.user.facebook.link +
      "&name=" +
      squatch.user.facebook.title +
      "&description=" +
      squatch.user.facebook.summary +
      pictureString +
      "&redirect_uri=" +
      squatch.user.facebook.redirectUrl
  );

  $("body").on("touchstart click", ".fbMobile", function (e) {
    if (e.type == "touchstart") {
      _log("clicked facebook share");
      if (window.frameElement && window.frameElement.squatchJsApi) {
        window.frameElement.squatchJsApi._shareEvent(
          window.squatch,
          "FACEBOOK"
        );
      }
    }
  });

  $("body").on("touchend", ".linkedinShare", function (e) {
    e.preventDefault(); // stop potential refresh after touch ended
  });

  $("body").on("touchstart click", ".linkedinShare", function (e) {
    if (e.type != "touchstart") {
      e.preventDefault();
    }
    var width = 620,
      height = 400,
      url =
        "https://www.linkedin.com/shareArticle?mini=true&url=" +
        squatch.user.facebook.link +
        "&title=" +
        squatch.user.facebook.title +
        "&summary=" +
        squatch.user.facebook.summary +
        pictureString +
        "&source=" +
        squatch.user.facebook.redirectUrl,
      opts = "status=1" + ",width=" + width + ",height=" + height;

    window.open(url, "linkedin", opts);

    _log("clicked facebook share");
    if (window.frameElement && window.frameElement.squatchJsApi) {
      window.frameElement.squatchJsApi._shareEvent(window.squatch, "LINKEDIN");
    }
  });

  $(".linkedinMobile").attr(
    "href",
    "https://www.linkedin.com/shareArticle?mini=true&url=" +
      squatch.user.facebook.link +
      "&title=" +
      squatch.user.facebook.title +
      "&summary=" +
      squatch.user.facebook.summary +
      pictureString +
      "&source=" +
      squatch.user.facebook.redirectUrl
  );

  $("body").on("touchstart click", ".linkedinMobile", function (e) {
    if (e.type == "touchstart") {
      _log("clicked facebook share");
      if (window.frameElement && window.frameElement.squatchJsApi) {
        window.frameElement.squatchJsApi._shareEvent(
          window.squatch,
          "LINKEDIN"
        );
      }
    }
  });

  $("body").on("touchstart click", ".twShare", function (e) {
    if (e.type != "touchstart") {
      e.preventDefault();
    }
    var width = 575,
      height = 400,
      url =
        "https://twitter.com/intent/tweet?source=webclient&text=" +
        squatch.user.twitter.message,
      opts = "status=1" + ",width=" + width + ",height=" + height;

    window.open(url, "twitter", opts);

    _log("clicked twitter share");
    if (window.frameElement && window.frameElement.squatchJsApi) {
      window.frameElement.squatchJsApi._shareEvent(window.squatch, "TWITTER");
    }
  });

  $(".twMobile").attr(
    "href",
    "https://twitter.com/intent/tweet?source=webclient&text=" +
      squatch.user.twitter.message
  );

  $("body").on("touchstart click", ".twMobile", function (e) {
    if (e.type == "touchstart") {
      _log("clicked twitter share");
      if (window.frameElement && window.frameElement.squatchJsApi) {
        window.frameElement.squatchJsApi._shareEvent(window.squatch, "TWITTER");
      }
    }
  });

  $(".twMobileApp").attr(
    "href",
    "https://twitter.com/intent/tweet?source=webclient&text=" +
      squatch.user.twitter.message
  );

  $("body").on("touchstart click", ".twMobileApp", function (e) {
    if (e.type == "touchstart") {
      _log("clicked twitter share");
      if (window.frameElement && window.frameElement.squatchJsApi) {
        window.frameElement.squatchJsApi._shareEvent(window.squatch, "TWITTER");
      }
    }
  });

  $("body").on("touchstart click", ".close", function (e) {
    rpc.close();
  });

  $("body").on("touchstart click", ".copy", function (e) {
    // EM if the copy clipboard was successfully added this won't be called (instead it is tracked in main.js)
    _log("clicked copy link");
    if (window.frameElement && window.frameElement.squatchJsApi) {
      window.frameElement.squatchJsApi._shareEvent(window.squatch, "DIRECT");
    }
  });

  // track Facebook messenger share click analytics
  $("body").on("touchstart click", ".messengerShare", function (e) {
    _log("clicked messenger share");
    if (window.frameElement && window.frameElement.squatchJsApi) {
      window.frameElement.squatchJsApi._shareEvent(
        window.squatch,
        "FBMESSENGER"
      );
    }
  });

  // track Whatsapp share click analytics
  $("body").on("touchstart click", ".whatsappShare", function (e) {
    _log("clicked whatsapp share");
    if (window.frameElement && window.frameElement.squatchJsApi) {
      window.frameElement.squatchJsApi._shareEvent(window.squatch, "WHATSAPP");
    }
  });

  // track SMS share click analytics
  $("body").on("touchstart click", ".smsShare", function (e) {
    _log("clicked sms share");
    if (window.frameElement && window.frameElement.squatchJsApi) {
      window.frameElement.squatchJsApi._shareEvent(window.squatch, "SMS");
    }
  });

  // track FB Messenger mobile share click analytics
  $("body").on("touchstart click", ".messengerMobile", function (e) {
    _log("clicked messenger mobile share");
    if (window.frameElement && window.frameElement.squatchJsApi) {
      window.frameElement.squatchJsApi._shareEvent(
        window.squatch,
        "FBMESSENGER"
      );
    }
  });
});
