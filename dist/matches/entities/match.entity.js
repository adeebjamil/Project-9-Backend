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
exports.Match = exports.AdminStatus = exports.MatchStatus = void 0;
const typeorm_1 = require("typeorm");
const market_entity_1 = require("./market.entity");
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["SCHEDULED"] = "scheduled";
    MatchStatus["LIVE"] = "live";
    MatchStatus["COMPLETED"] = "completed";
    MatchStatus["ABANDONED"] = "abandoned";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
var AdminStatus;
(function (AdminStatus) {
    AdminStatus["PENDING"] = "pending";
    AdminStatus["APPROVED"] = "approved";
    AdminStatus["REJECTED"] = "rejected";
    AdminStatus["SUSPENDED"] = "suspended";
})(AdminStatus || (exports.AdminStatus = AdminStatus = {}));
let Match = class Match {
    id;
    externalId;
    competitionId;
    teams;
    format;
    startTime;
    venue;
    status;
    liveScore;
    adminStatus;
    adminNote;
    reviewedBy;
    source;
    markets;
    createdAt;
    updatedAt;
};
exports.Match = Match;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Match.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Match.prototype, "externalId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Match.prototype, "competitionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], Match.prototype, "teams", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Match.prototype, "format", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp'),
    __metadata("design:type", Date)
], Match.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Match.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MatchStatus,
        default: MatchStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "liveScore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AdminStatus,
        default: AdminStatus.PENDING,
    }),
    __metadata("design:type", String)
], Match.prototype, "adminStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "adminNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => market_entity_1.Market, (market) => market.match),
    __metadata("design:type", Array)
], Match.prototype, "markets", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Match.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Match.prototype, "updatedAt", void 0);
exports.Match = Match = __decorate([
    (0, typeorm_1.Entity)('matches')
], Match);
//# sourceMappingURL=match.entity.js.map