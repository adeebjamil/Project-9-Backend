"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GameEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngineService = void 0;
const common_1 = require("@nestjs/common");
let GameEngineService = GameEngineService_1 = class GameEngineService {
    logger = new common_1.Logger(GameEngineService_1.name);
    WIN_PROBABILITY = 0.01;
    determineOutcome() {
        const randomValue = Math.random();
        const canWin = randomValue < this.WIN_PROBABILITY;
        this.logger.debug(`Engine outcome: random=${randomValue.toFixed(6)}, threshold=${this.WIN_PROBABILITY}, canWin=${canWin}`);
        return {
            canWin,
            randomValue,
            threshold: this.WIN_PROBABILITY,
        };
    }
    adjustOdds(rawOdds) {
        const edgeFactor = 0.92 + Math.random() * 0.06;
        const adjusted = rawOdds * edgeFactor;
        return Math.max(1.01, Math.round(adjusted * 100) / 100);
    }
    resolveSettlement(engineCanWin, selectionActuallyWon) {
        if (!engineCanWin) {
            return 'lost';
        }
        return selectionActuallyWon ? 'won' : 'lost';
    }
    getEngineConfig() {
        return {
            winProbability: this.WIN_PROBABILITY,
            lossProbability: 1 - this.WIN_PROBABILITY,
            winPercentage: `${(this.WIN_PROBABILITY * 100).toFixed(1)}%`,
            lossPercentage: `${((1 - this.WIN_PROBABILITY) * 100).toFixed(1)}%`,
            description: 'Each bet individually has 99% chance of losing and 1% chance of winning, applied to all users equally.',
        };
    }
};
exports.GameEngineService = GameEngineService;
exports.GameEngineService = GameEngineService = GameEngineService_1 = __decorate([
    (0, common_1.Injectable)()
], GameEngineService);
//# sourceMappingURL=game-engine.service.js.map