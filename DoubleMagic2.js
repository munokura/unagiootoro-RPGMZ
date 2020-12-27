/*:
@target MV MZ
@plugindesc 連続魔法2 v1.1.0
@author うなぎおおとろ

@param MagicSkillTypeIds
@type number[]
@default ["1"]
@desc
「魔法」のスキルタイプIDを指定します。

@help
自分のターンに魔法を2回選択できるようにするプラグインです。
FFの連続魔みたいなのを作ることができます。

[使い方]
連続魔法を可能にしたいステートのメモ欄に
<DoubleMagic2>
と記述してください。

「魔法」のスキルタイプIDは複数指定することができます。
ただし同じスキルタイプIDの魔法しか連続魔法の対象とならないので注意してください。

[ライセンス]
このプラグインは、MITライセンスの条件の下で利用可能です。
*/

const DoubleMagic2PluginName = document.currentScript.src.match(/.+\/(.+)\.js/)[1];

(() => {
"use strict";

const params = PluginManager.parameters(DoubleMagic2PluginName);
const magicSkillTypeIds = JSON.parse(params["MagicSkillTypeIds"]).map(s => parseInt(s));

Game_Action.prototype.isMagicSkill = function() {
    return magicSkillTypeIds.includes(this.item().stypeId);
};

const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
Game_Actor.prototype.initMembers = function() {
    _Game_Actor_initMembers.call(this);
    this._doubleMagicEndSelectState = "none";
};

Game_Actor.prototype.isContinuousMagic2 = function() {
    for (let stateId of this._states) {
        if ($dataStates[stateId].meta.DoubleMagic2) {
            return true;
        }
    }
    return false;
};

const _Game_Actor_clearActions = Game_Actor.prototype.clearActions;
Game_Actor.prototype.clearActions = function() {
    _Game_Actor_clearActions.call(this);
    this._doubleMagicEndSelectState = "none";
};

Game_Actor.prototype.cancelDoubleMagicSelect = function() {
    this._doubleMagicEndSelectState = "none";
    this._actionInputIndex--;
    this._actions.splice(this._actions.length - 1, 1);
};

Game_Actor.prototype.addAction = function(action) {
    this._actions.push(action);
};

Game_Actor.prototype.doubleMagicEndSelectState = function() {
    return this._doubleMagicEndSelectState;
};

Game_Actor.prototype.setDoubleMagicEndSelectState = function(doubleMagicEndSelectState) {
    this._doubleMagicEndSelectState = doubleMagicEndSelectState;
};

const _BattleManager_selectNextCommand = BattleManager.selectNextCommand;
BattleManager.selectNextCommand = function(opt = null) {
    const actor = this.actor();
    if (opt && opt.doubleMagic) {
        if (actor.doubleMagicEndSelectState() === "selecting") {
            actor.setDoubleMagicEndSelectState("selected");
        } else {
            actor.addAction(new Game_Action(actor));
            actor.setDoubleMagicEndSelectState("selecting");
        }
    }
    _BattleManager_selectNextCommand.call(this);
};

const _BattleManager_selectPreviousCommand = BattleManager.selectPreviousCommand;
BattleManager.selectPreviousCommand = function() {
    _BattleManager_selectPreviousCommand.call(this);
    const actor = BattleManager.actor();
    if (actor && actor.doubleMagicEndSelectState() === "selected") actor.cancelDoubleMagicSelect();
};

const _Scene_Battle_selectNextCommand = Scene_Battle.prototype.selectNextCommand;
Scene_Battle.prototype.selectNextCommand = function() {
    const actor = BattleManager.actor();
    const action = BattleManager.inputtingAction();
    if (action && action.isMagicSkill() && actor.isContinuousMagic2()) {
        BattleManager.selectNextCommand({doubleMagic: true});
        if (actor.doubleMagicEndSelectState() === "selecting") {
            this.commandSkill();
        } else {
            this.changeInputWindow();
        }
    } else {
        _Scene_Battle_selectNextCommand.call(this);
    }
};

const _Scene_Battle_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
Scene_Battle.prototype.onSkillCancel = function() {
    const actor = BattleManager.actor();
    if (actor.doubleMagicEndSelectState() === "selecting") actor.cancelDoubleMagicSelect();
    _Scene_Battle_onSkillCancel.call(this);
};
})();
