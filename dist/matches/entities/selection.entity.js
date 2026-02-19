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
exports.Selection = exports.SelectionStatus = void 0;
const typeorm_1 = require("typeorm");
const market_entity_1 = require("./market.entity");
var SelectionStatus;
(function (SelectionStatus) {
    SelectionStatus["ACTIVE"] = "active";
    SelectionStatus["SUSPENDED"] = "suspended";
    SelectionStatus["WIN"] = "win";
    SelectionStatus["LOSS"] = "loss";
    SelectionStatus["VOID"] = "void";
})(SelectionStatus || (exports.SelectionStatus = SelectionStatus = {}));
let Selection = class Selection {
    id;
    name;
    odds;
    probability;
    status;
    market;
    createdAt;
    updatedAt;
};
exports.Selection = Selection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Selection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Selection.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Selection.prototype, "odds", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], Selection.prototype, "probability", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SelectionStatus,
        default: SelectionStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Selection.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => market_entity_1.Market, (market) => market.selections),
    __metadata("design:type", market_entity_1.Market)
], Selection.prototype, "market", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Selection.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Selection.prototype, "updatedAt", void 0);
exports.Selection = Selection = __decorate([
    (0, typeorm_1.Entity)('selections')
], Selection);
//# sourceMappingURL=selection.entity.js.map