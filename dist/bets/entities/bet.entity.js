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
exports.Bet = exports.BetStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const selection_entity_1 = require("../../matches/entities/selection.entity");
var BetStatus;
(function (BetStatus) {
    BetStatus["PENDING"] = "pending";
    BetStatus["WON"] = "won";
    BetStatus["LOST"] = "lost";
    BetStatus["VOID"] = "void";
    BetStatus["CASHED_OUT"] = "cashed_out";
})(BetStatus || (exports.BetStatus = BetStatus = {}));
let Bet = class Bet {
    id;
    stake;
    odds;
    potentialPayout;
    status;
    engineCanWin;
    engineRandom;
    user;
    selection;
    placedAt;
    updatedAt;
};
exports.Bet = Bet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Bet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Bet.prototype, "stake", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Bet.prototype, "odds", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Bet.prototype, "potentialPayout", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BetStatus,
        default: BetStatus.PENDING,
    }),
    __metadata("design:type", String)
], Bet.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Bet.prototype, "engineCanWin", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Bet.prototype, "engineRandom", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.bets),
    __metadata("design:type", user_entity_1.User)
], Bet.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => selection_entity_1.Selection),
    __metadata("design:type", selection_entity_1.Selection)
], Bet.prototype, "selection", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Bet.prototype, "placedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Bet.prototype, "updatedAt", void 0);
exports.Bet = Bet = __decorate([
    (0, typeorm_1.Entity)('bets')
], Bet);
//# sourceMappingURL=bet.entity.js.map