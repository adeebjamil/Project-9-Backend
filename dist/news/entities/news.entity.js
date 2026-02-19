"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsStatus = exports.NewsType = void 0;
var NewsType;
(function (NewsType) {
    NewsType["NEWS"] = "news";
    NewsType["ANNOUNCEMENT"] = "announcement";
})(NewsType || (exports.NewsType = NewsType = {}));
var NewsStatus;
(function (NewsStatus) {
    NewsStatus["DRAFT"] = "draft";
    NewsStatus["PUBLISHED"] = "published";
    NewsStatus["ARCHIVED"] = "archived";
})(NewsStatus || (exports.NewsStatus = NewsStatus = {}));
//# sourceMappingURL=news.entity.js.map