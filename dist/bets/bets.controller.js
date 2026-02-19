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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetsController = void 0;
const common_1 = require("@nestjs/common");
const bets_service_1 = require("./bets.service");
const create_bet_dto_1 = require("./dto/create-bet.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_entity_1 = require("../users/entities/user.entity");
const game_engine_service_1 = require("../game-engine/game-engine.service");
let BetsController = class BetsController {
    betsService;
    gameEngine;
    constructor(betsService, gameEngine) {
        this.betsService = betsService;
        this.gameEngine = gameEngine;
    }
    settle(req, body) {
        if (req.user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can settle bets');
        }
        return this.betsService.settle(body.winningSelectionId);
    }
    getMatchBetStats(req) {
        if (req.user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can view bet stats');
        }
        return this.betsService.getMatchBetStats();
    }
    create(req, createBetDto) {
        return this.betsService.create(req.user.userId || req.user.id, createBetDto);
    }
    getEngineConfig(req) {
        if (req.user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can view engine config');
        }
        return this.gameEngine.getEngineConfig();
    }
    findMyBets(req) {
        return this.betsService.findAll(req.user.userId || req.user.id);
    }
    async getExposure(req) {
        const exposure = await this.betsService.getExposure(req.user.userId || req.user.id);
        return { exposure };
    }
    findAll(req) {
        return this.betsService.findAll(req.user.userId || req.user.id);
    }
    findOne(req, id) {
        return this.betsService.findOne(id, req.user.userId || req.user.id);
    }
};
exports.BetsController = BetsController;
__decorate([
    (0, common_1.Post)('settle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BetsController.prototype, "settle", null);
__decorate([
    (0, common_1.Get)('admin/match-stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BetsController.prototype, "getMatchBetStats", null);
__decorate([
    (0, common_1.Post)('place'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_bet_dto_1.CreateBetDto]),
    __metadata("design:returntype", void 0)
], BetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('engine/config'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BetsController.prototype, "getEngineConfig", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BetsController.prototype, "findMyBets", null);
__decorate([
    (0, common_1.Get)('exposure'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BetsController.prototype, "getExposure", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BetsController.prototype, "findOne", null);
exports.BetsController = BetsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bets'),
    __metadata("design:paramtypes", [bets_service_1.BetsService,
        game_engine_service_1.GameEngineService])
], BetsController);
//# sourceMappingURL=bets.controller.js.map