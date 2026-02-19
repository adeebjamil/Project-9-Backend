"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Market = exports.MarketStatus = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("./match.entity");
const selection_entity_1 = require("./selection.entity");
var MarketStatus;
(function (MarketStatus) {
    MarketStatus["OPEN"] = "open";
    MarketStatus["SUSPENDED"] = "suspended";
    MarketStatus["CLOSED"] = "closed";
    MarketStatus["SETTLED"] = "settled";
})(MarketStatus || (exports.MarketStatus = MarketStatus = {}));
let Market = class Market {
    id;
    marketType;
    name;
    status;
    isSgpEligible;
    match;
    selections;
    createdAt;
    updatedAt;
};
exports.Market = Market;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Market.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Market.prototype, "marketType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Market.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MarketStatus,
        default: MarketStatus.OPEN,
    }),
    __metadata("design:type", String)
], Market.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Market.prototype, "isSgpEligible", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, (match) => match.markets),
    __metadata("design:type", match_entity_1.Match)
], Market.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => selection_entity_1.Selection, (selection) => selection.market, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Market.prototype, "selections", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Market.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Market.prototype, "updatedAt", void 0);
exports.Market = Market = __decorate([
    (0, typeorm_1.Entity)('markets')
], Market);
//# sourceMappingURL=market.entity.js.map