/*:
@target MV MZ
@plugindesc スキルツリー 職業拡張 v1.0.0
@author うなぎおおとろ
@url https://raw.githubusercontent.com/unagiootoro/RPGMZ/master/SkillTree.js

@help
スキルツリーを職業単位で持たせることができるようになります。
これによって、職業によって異なるスキルツリーが構築できます。

[使用方法]
職業単位でのスキルツリーの構築はタイプ設定にclassIdを記載することで行います。
例えば、次のようなタイプ設定があったとします。
{
    actorId: 1,
    types: [
        ["剣技", "剣技", "剣技を取得します。"],
        ["格闘技", "格闘技", "格闘技を取得します。"],
    ]
}

職業拡張プラグインを用いて、この設定をアクターID1ではなく職業ID2に適用する場合、次のように設定します。
{
    classId: 2,
    types: [
        ["剣技", "剣技", "剣技を取得します。"],
        ["格闘技", "格闘技", "格闘技を取得します。"],
    ]
}

[仕様]
・転職すると、前の職業で習得したスキルは習得したままとなります。
・共通のタイプ種別を用いることで、複数の職業間で共有のスキルツリータイプを作成することができます。
・スキルリセットを行った場合、現在のアクターがついている職業のスキルツリーのみリセットされます。

[注意点]
「SkillTree_IconEx.js」と併用する場合、このプラグインは「SkillTree_IconEx.js」よりも下に入れてください。

[ライセンス]
このプラグインは、MITライセンスの条件の下で利用可能です。
*/

(() => {
    "use strict";

    const SkillDataType = SkillTreeClassAlias.SkillDataType;
    const SkillTreeConfigLoader = SkillTreeClassAlias.SkillTreeConfigLoader;
    const SkillTreeData = SkillTreeClassAlias.SkillTreeData;

    SkillDataType.prototype.classId = function() {
        return this._classId;
    };

    SkillDataType.prototype.addClassId = function(classId) {
        if (this._classId) {
            this._classId.push(classId);
        } else {
            this._classId = [classId];
        }
    };

    SkillTreeData.prototype.enableTypes = function(actorId) {
        const actor = $gameActors.actor(actorId);
        const classId = actor.currentClass().id;
        return this.types(actorId).filter((type) => type.enabled() && type.classId().indexOf(classId) >= 0);
    };

    SkillTreeConfigLoader.prototype.loadTypes = function(actorId) {
        let cfgTypes = null;
        let typesArray = [];
        for (const cfg of this._configData.skillTreeTypes) {
            cfgTypes = cfg.types;
            for (const cfgType of cfgTypes) {
                const findType = typesArray.find(t => t.skillTreeName() === cfgType[0]);
                if (findType) {
                    findType.addClassId(cfg.classId);
                } else {
                    const enabled = (cfgType.length === 3 ? true : cfgType[3]);
                    const type = new SkillDataType(cfgType[0], actorId, cfgType[1], cfgType[2], enabled);
                    if (cfgType[4]) type.setIconIndex(cfgType[4] ? cfgType[4] : null);
                    type.addClassId(cfg.classId);
                    typesArray.push(type);
                }
            }
        }
        return typesArray;
    };
})();
