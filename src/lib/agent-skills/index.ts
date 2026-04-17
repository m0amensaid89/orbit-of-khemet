// src/lib/agent-skills/index.ts

import { agent_41 } from "./thoren/agent_41";
import { agent_46 } from "./thoren/agent_46";
import { agent_52 } from "./thoren/agent_52";
import { agent_55 } from "./thoren/agent_55";
import { agent_59 } from "./thoren/agent_59";
import { agent_62 } from "./thoren/agent_62";
import { agent_67 } from "./thoren/agent_67";
import { agent_70 } from "./thoren/agent_70";
import { agent_73 } from "./thoren/agent_73";
import { agent_79 } from "./thoren/agent_79";
import { agent_80 } from "./thoren/agent_80";
import { agent_81 } from "./thoren/agent_81";
import { agent86 } from "./thoren/agent-86";
import { agent87 } from "./thoren/agent-87";
import { agent88 } from "./thoren/agent-88";
import { agent_39 } from "./ramet/agent_39";
import { agent_45 } from "./ramet/agent_45";
import { agent_47 } from "./ramet/agent_47";
import { agent_53 } from "./ramet/agent_53";
import { agent_57 } from "./ramet/agent_57";
import { agent_61 } from "./ramet/agent_61";
import { agent_63 } from "./ramet/agent_63";
import { agent_64 } from "./ramet/agent_64";
import { agent_65 } from "./ramet/agent_65";
import { agent_77 } from "./ramet/agent_77";
import { agent_83 } from "./ramet/agent_83";
import { agent_85 } from "./ramet/agent_85";
import { agent89 } from "./ramet/agent-89";
import { agent90 } from "./ramet/agent-90";
import { agent91 } from "./ramet/agent-91";
import { agent_34 } from "./nexar/agent_34";
import { agent_42 } from "./nexar/agent_42";
import { agent_43 } from "./nexar/agent_43";
import { agent_54 } from "./nexar/agent_54";
import { agent_56 } from "./nexar/agent_56";
import { agent_60 } from "./nexar/agent_60";
import { agent_66 } from "./nexar/agent_66";
import { agent_69 } from "./nexar/agent_69";
import { agent_75 } from "./nexar/agent_75";
import { agent_76 } from "./nexar/agent_76";
import { agent_82 } from "./nexar/agent_82";
import { agent_84 } from "./nexar/agent_84";
import { agent92 } from "./nexar/agent-92";
import { agent93 } from "./nexar/agent-93";
import { agent94 } from "./nexar/agent-94";
import { agent_1 } from "./lyra/agent_1";
import { agent_4 } from "./lyra/agent_4";
import { agent_5 } from "./lyra/agent_5";
import { agent_6 } from "./lyra/agent_6";
import { agent_8 } from "./lyra/agent_8";
import { agent_10 } from "./lyra/agent_10";
import { agent_11 } from "./lyra/agent_11";
import { agent_12 } from "./lyra/agent_12";
import { agent_13 } from "./lyra/agent_13";
import { agent_15 } from "./lyra/agent_15";
import { agent_16 } from "./lyra/agent_16";
import { agent_17 } from "./lyra/agent_17";
import { agent_33 } from "./lyra/agent_33";
import { agent95 } from "./lyra/agent-95";
import { agent96 } from "./lyra/agent-96";
import { agent97 } from "./lyra/agent-97";
import { agent_2 } from "./kairo/agent_2";
import { agent_3 } from "./kairo/agent_3";
import { agent_9 } from "./kairo/agent_9";
import { agent_14 } from "./kairo/agent_14";
import { agent_18 } from "./kairo/agent_18";
import { agent_22 } from "./kairo/agent_22";
import { agent_24 } from "./kairo/agent_24";
import { agent_25 } from "./kairo/agent_25";
import { agent_26 } from "./kairo/agent_26";
import { agent_29 } from "./kairo/agent_29";
import { agent_30 } from "./kairo/agent_30";
import { agent_31 } from "./kairo/agent_31";
import { agent98 } from "./kairo/agent-98";
import { agent99 } from "./kairo/agent-99";
import { agent_28 } from "./nefra/agent_28";
import { agent_32 } from "./nefra/agent_32";
import { agent_35 } from "./nefra/agent_35";
import { agent_40 } from "./nefra/agent_40";
import { agent_48 } from "./nefra/agent_48";
import { agent_49 } from "./nefra/agent_49";
import { agent_50 } from "./nefra/agent_50";
import { agent_51 } from "./nefra/agent_51";
import { agent_58 } from "./nefra/agent_58";
import { agent_68 } from "./nefra/agent_68";
import { agent_71 } from "./nefra/agent_71";
import { agent_72 } from "./nefra/agent_72";
import { agent100 } from "./nefra/agent-100";
import { agent101 } from "./nefra/agent-101";
import { agent_7 } from "./horusen/agent_7";
import { agent_19 } from "./horusen/agent_19";
import { agent_20 } from "./horusen/agent_20";
import { agent_21 } from "./horusen/agent_21";
import { agent_23 } from "./horusen/agent_23";
import { agent_27 } from "./horusen/agent_27";
import { agent_36 } from "./horusen/agent_36";
import { agent_37 } from "./horusen/agent_37";
import { agent_38 } from "./horusen/agent_38";
import { agent_44 } from "./horusen/agent_44";
import { agent_74 } from "./horusen/agent_74";
import { agent_78 } from "./horusen/agent_78";
import { agent102 } from "./horusen/agent-102";
import { agent103 } from "./horusen/agent-103";

export interface AgentSkill {
  name: string;
  slug: string;
  hero: string;
  systemPrompt: string;
  capabilities: string[];
  routingHints: string[];
  outputTypes: string[];
  routingOverride?: string;
  openingMessage?: (username: string) => string;
}

export const skillsRegistry: Record<string, AgentSkill> = {
  "agent_41": agent_41,
  "agent_46": agent_46,
  "agent_52": agent_52,
  "agent_55": agent_55,
  "agent_59": agent_59,
  "agent_62": agent_62,
  "agent_67": agent_67,
  "agent_70": agent_70,
  "agent_73": agent_73,
  "agent_79": agent_79,
  "agent_80": agent_80,
  "agent_81": agent_81,
  "agent-86": agent86,
  "agent-87": agent87,
  "agent-88": agent88,
  "agent_39": agent_39,
  "agent_45": agent_45,
  "agent_47": agent_47,
  "agent_53": agent_53,
  "agent_57": agent_57,
  "agent_61": agent_61,
  "agent_63": agent_63,
  "agent_64": agent_64,
  "agent_65": agent_65,
  "agent_77": agent_77,
  "agent_83": agent_83,
  "agent_85": agent_85,
  "agent-89": agent89,
  "agent-90": agent90,
  "agent-91": agent91,
  "agent_34": agent_34,
  "agent_42": agent_42,
  "agent_43": agent_43,
  "agent_54": agent_54,
  "agent_56": agent_56,
  "agent_60": agent_60,
  "agent_66": agent_66,
  "agent_69": agent_69,
  "agent_75": agent_75,
  "agent_76": agent_76,
  "agent_82": agent_82,
  "agent_84": agent_84,
  "agent-92": agent92,
  "agent-93": agent93,
  "agent-94": agent94,
  "agent_1": agent_1,
  "agent_4": agent_4,
  "agent_5": agent_5,
  "agent_6": agent_6,
  "agent_8": agent_8,
  "agent_10": agent_10,
  "agent_11": agent_11,
  "agent_12": agent_12,
  "agent_13": agent_13,
  "agent_15": agent_15,
  "agent_16": agent_16,
  "agent_17": agent_17,
  "agent_33": agent_33,
  "agent-95": agent95,
  "agent-96": agent96,
  "agent-97": agent97,
  "agent_2": agent_2,
  "agent_3": agent_3,
  "agent_9": agent_9,
  "agent_14": agent_14,
  "agent_18": agent_18,
  "agent_22": agent_22,
  "agent_24": agent_24,
  "agent_25": agent_25,
  "agent_26": agent_26,
  "agent_29": agent_29,
  "agent_30": agent_30,
  "agent_31": agent_31,
  "agent-98": agent98,
  "agent-99": agent99,
  "agent_28": agent_28,
  "agent_32": agent_32,
  "agent_35": agent_35,
  "agent_40": agent_40,
  "agent_48": agent_48,
  "agent_49": agent_49,
  "agent_50": agent_50,
  "agent_51": agent_51,
  "agent_58": agent_58,
  "agent_68": agent_68,
  "agent_71": agent_71,
  "agent_72": agent_72,
  "agent-100": agent100,
  "agent-101": agent101,
  "agent_7": agent_7,
  "agent_19": agent_19,
  "agent_20": agent_20,
  "agent_21": agent_21,
  "agent_23": agent_23,
  "agent_27": agent_27,
  "agent_36": agent_36,
  "agent_37": agent_37,
  "agent_38": agent_38,
  "agent_44": agent_44,
  "agent_74": agent_74,
  "agent_78": agent_78,
  "agent-102": agent102,
  "agent-103": agent103,
};

export function getSkillBySlug(slug: string): AgentSkill | undefined {
  return skillsRegistry[slug];
}

export function getSkillsByHero(hero: string): AgentSkill[] {
  return Object.values(skillsRegistry).filter(skill => skill.hero.toLowerCase() === hero.toLowerCase());
}

export function getSkillsByCapability(capability: string): AgentSkill[] {
  return Object.values(skillsRegistry).filter(skill =>
    skill.capabilities.some(cap => cap.toLowerCase().includes(capability.toLowerCase()))
  );
}

export const agentSkills = skillsRegistry;
