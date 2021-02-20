const helpers: Array<[string, Array<string>, string]> = [
  ['isAdult', [], `
    AGE == "ADULT"
  `],
  ['isChild', [], `
    AGE == "CHILD"
  `],
  ['canUse', ['item'], `
    (isMagic(item) AND MAGIC_1 AND eval(item)) OR
    (isMagicArrow(item) AND isAdult() AND BOW_1 AND MAGIC_1 AND eval(item)) OR
    (isAdultItem(item) AND isAdult() AND eval(item)) OR
    (isChildItem(item) AND isChild() AND eval(item))
  `],
  ['isMagic', ['item'], `
    item == "SPELL_DIN" OR item == "SPELL_FARORE" OR item == "SPELL_LANAYRU" OR item == "LENS_OF_TRUTH"
  `],
  ['isMagicArrow', ['item'], `
    item == "ARROW_FIRE" OR item == "ARROW_ICE" OR item == "ARROW_LIGHT"
  `],
  ['isAdultItem', ['item'], `
    item == "BOW_1" OR item == "BOW_2" OR item == "BOW_3" OR item == "HAMMER" OR item == "BOOTS_IRON" OR
    item == "BOOTS_HOVER" OR item == "HOOKSHOT_1" OR item == "HOOKSHOT_2" OR item == "STRENGTH_2" OR
    item == "STRENGTH_3" OR item == "TUNIC_GORON" OR item == "TUNIC_ZORA"
  `],
  ['isChildItem', ['item'], `
    item == "SLINGSHOT_1" OR item == "SLINGSHOT_2" OR item == "SLINGSHOT_3" OR item == "BOOMERANG" OR
    item == "SWORD_KOKIRI" OR item == "DEKU_STICKS_1" OR item == "DEKU_STICKS_2" OR item == "DEKU_STICKS_3" OR item == "SHIELD_DEKU"
  `],
  ['childCanAttack', [], `
    isChild() AND (SLINGSHOT_1 OR BOOMERANG OR DEKU_STICKS_1 OR SWORD_KOKIRI OR hasExplosives() OR canUse("SPELL_DIN"))
  `],
  ['hasExplosives', [], `
    BOMB_BAG_1
  `],
  ['canUseProjectile', [], `
    hasExplosives() OR (isAdult() AND (HOOKSHOT_1 OR BOW_1)) OR (isChild() AND (BOOMERANG OR SLINGSHOT_1))
  `],
  ['canBlastOrSmash', [], `
    hasExplosives() OR canUse("HAMMER")
  `]
]

export default helpers
