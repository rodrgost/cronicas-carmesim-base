/**
 * Dados completos das Disciplinas de Vampire: The Masquerade V5
 */

export const DISCIPLINES = {
  // FÍSICAS
  potence: {
    name: "Potência",
    nameEn: "Potence",
    type: "physical",
    description: "Força sobre-humana",
    descriptionEn: "Supernatural strength",
    powers: {
      1: {
        name: "Força Letal",
        nameEn: "Lethal Body",
        cost: 1,
        type: "active",
        description: "Adicione nível de Potência ao dano corpo a corpo",
        descriptionEn: "Add Potence level to melee damage"
      },
      2: {
        name: "Pulo Prodigioso",
        nameEn: "Soaring Leap",
        cost: 1,
        type: "active",
        description: "Saltos sobre-humanos",
        descriptionEn: "Superhuman jumps"
      },
      3: {
        name: "Arremesso Brutal",
        nameEn: "Brutal Feed",
        cost: 1,
        type: "active",
        description: "Arremessar objetos ou pessoas com força devastadora",
        descriptionEn: "Throw objects or people with devastating force"
      },
      4: {
        name: "Punho de Caim",
        nameEn: "Fist of Caine",
        cost: 2,
        type: "active",
        description: "Golpes causam dano agravado",
        descriptionEn: "Strikes deal aggravated damage"
      },
      5: {
        name: "Façanha de Força",
        nameEn: "Earthshock",
        cost: 2,
        type: "active",
        description: "Feitos impossíveis de força bruta",
        descriptionEn: "Impossible feats of raw strength"
      }
    }
  },
  celerity: {
    name: "Rapidez",
    nameEn: "Celerity",
    type: "physical",
    description: "Velocidade e reflexos sobre-humanos",
    descriptionEn: "Supernatural speed and reflexes",
    powers: {
      1: {
        name: "Movimentação Veloz",
        nameEn: "Rapid Reflexes",
        cost: 1,
        type: "active",
        description: "Movimento extremamente rápido",
        descriptionEn: "Extremely fast movement"
      },
      2: {
        name: "Reflexos Felinos",
        nameEn: "Fleetness",
        cost: 0,
        type: "passive",
        description: "+nível de Rapidez na Iniciativa",
        descriptionEn: "+Celerity level to Initiative"
      },
      3: {
        name: "Esquiva Sobrenatural",
        nameEn: "Blink",
        cost: 1,
        type: "active",
        description: "Esquivar de ataques impossíveis",
        descriptionEn: "Dodge impossible attacks"
      },
      4: {
        name: "Atravessar Muros",
        nameEn: "Traversal",
        cost: 2,
        type: "active",
        description: "Mover-se tão rápido que atravessa obstáculos",
        descriptionEn: "Move so fast you run up walls/water"
      },
      5: {
        name: "Borrão",
        nameEn: "Split Second",
        cost: 2,
        type: "active",
        description: "Múltiplas ações em um turno",
        descriptionEn: "Multiple actions in a turn"
      }
    }
  },
  fortitude: {
    name: "Fortitude",
    nameEn: "Fortitude",
    type: "physical",
    description: "Resistência sobrenatural",
    descriptionEn: "Supernatural resilience",
    powers: {
      1: {
        name: "Resiliência",
        nameEn: "Resilience",
        cost: 0,
        type: "passive",
        description: "+nível de Fortitude em Vitalidade",
        descriptionEn: "+Fortitude level to Health"
      },
      2: {
        name: "Resistência a Dor",
        nameEn: "Unswayable Mind",
        cost: 1,
        type: "active",
        description: "Ignorar penalidades de ferimentos",
        descriptionEn: "Ignore wound penalties"
      },
      3: {
        name: "Pele de Aço",
        nameEn: "Toughness",
        cost: 1,
        type: "active",
        description: "Reduzir dano superficial pela metade",
        descriptionEn: "Reduce superficial damage by half"
      },
      4: {
        name: "Cura Acelerada",
        nameEn: "Defy Bane",
        cost: 2,
        type: "active",
        description: "Curar ferimentos rapidamente",
        descriptionEn: "Heal wounds rapidly"
      },
      5: {
        name: "Indestrutível",
        nameEn: "Flesh of Marble",
        cost: 2,
        type: "active",
        description: "Resistir a dano agravado",
        descriptionEn: "Ignore first source of damage each turn"
      }
    }
  },

  // MENTAIS/SOCIAIS
  presence: {
    name: "Presença",
    nameEn: "Presence",
    type: "social",
    description: "Controle emocional carismático",
    descriptionEn: "Charismatic emotional control",
    powers: {
      1: {
        name: "Fascínio",
        nameEn: "Awe",
        cost: 0,
        type: "passive",
        description: "Atrair atenção naturalmente",
        descriptionEn: "Attract attention naturally"
      },
      2: {
        name: "Despertar",
        nameEn: "Daunt",
        cost: 1,
        type: "active",
        description: "Manipular emoções de uma pessoa",
        descriptionEn: "Manipulate emotions of a person"
      },
      3: {
        name: "Majestade",
        nameEn: "Entrancement",
        cost: 1,
        type: "active",
        description: "Aura de autoridade intimidadora",
        descriptionEn: "Aura of intimidating authority"
      },
      4: {
        name: "Arrebatar",
        nameEn: "Summon",
        cost: 1,
        type: "active",
        description: "Afetar emoções de um grupo",
        descriptionEn: "Affect emotions of a group"
      },
      5: {
        name: "Estrela",
        nameEn: "Majesty",
        cost: 2,
        type: "active",
        description: "Adoração de massas",
        descriptionEn: "Mass adoration"
      }
    }
  },
  auspex: {
    name: "Auspícios",
    nameEn: "Auspex",
    type: "mental",
    description: "Sentidos ampliados e clarividência",
    descriptionEn: "Heightened senses and clairvoyance",
    powers: {
      1: {
        name: "Sentidos Aguçados",
        nameEn: "Heightened Senses",
        cost: 0,
        type: "passive",
        description: "Percepção sobrenatural",
        descriptionEn: "Supernatural perception"
      },
      2: {
        name: "Sentir o Invisível",
        nameEn: "Sense the Unseen",
        cost: 1,
        type: "active",
        description: "Detectar presença oculta",
        descriptionEn: "Detect hidden presence"
      },
      3: {
        name: "Premonição",
        nameEn: "Premonition",
        cost: 1,
        type: "active",
        description: "Sentir perigo iminente",
        descriptionEn: "Sense imminent danger"
      },
      4: {
        name: "Telepatia",
        nameEn: "Spirit's Touch",
        cost: 1,
        type: "active",
        description: "Ler pensamentos superficiais",
        descriptionEn: "Read object's psychic impressions"
      },
      5: {
        name: "Clarividência",
        nameEn: "Clairvoyance",
        cost: 2,
        type: "active",
        description: "Ver locais distantes",
        descriptionEn: "See distant locations"
      }
    }
  },
  dominate: {
    name: "Dominação",
    nameEn: "Dominate",
    type: "mental",
    description: "Controle mental direto",
    descriptionEn: "Direct mind control",
    powers: {
      1: {
        name: "Comando",
        nameEn: "Cloud Memory",
        cost: 0,
        type: "active",
        description: "Ordem verbal simples",
        descriptionEn: "Simple verbal command"
      },
      2: {
        name: "Hipnotizar",
        nameEn: "Mesmerize",
        cost: 1,
        type: "active",
        description: "Implantar sugestão complexa",
        descriptionEn: "Implant complex suggestion"
      },
      3: {
        name: "O Esquecimento",
        nameEn: "The Forgetful Mind",
        cost: 1,
        type: "active",
        description: "Apagar memórias",
        descriptionEn: "Erase memories"
      },
      4: {
        name: "Subjugar",
        nameEn: "Compel",
        cost: 1,
        type: "active",
        description: "Controlar ações de alguém",
        descriptionEn: "Control someone's actions"
      },
      5: {
        name: "Posse",
        nameEn: "Mass Manipulation",
        cost: 2,
        type: "active",
        description: "Possuir corpo de outra pessoa",
        descriptionEn: "Possess another person's body"
      }
    }
  },
  obfuscate: {
    name: "Ofuscação",
    nameEn: "Obfuscate",
    type: "mental",
    description: "Ocultação e ilusão",
    descriptionEn: "Concealment and illusion",
    powers: {
      1: {
        name: "Manto de Sombras",
        nameEn: "Cloak of Shadows",
        cost: 0,
        type: "active",
        description: "Ficar invisível parado",
        descriptionEn: "Remain invisible while still"
      },
      2: {
        name: "Invisibilidade",
        nameEn: "Unseen Passage",
        cost: 1,
        type: "active",
        description: "Ficar invisível em movimento",
        descriptionEn: "Remain invisible while moving"
      },
      3: {
        name: "Máscara de Mil Faces",
        nameEn: "Mask of a Thousand Faces",
        cost: 1,
        type: "active",
        description: "Mudar aparência",
        descriptionEn: "Change appearance"
      },
      4: {
        name: "Desaparecer",
        nameEn: "Vanish",
        cost: 1,
        type: "active",
        description: "Sumir da visão instantaneamente",
        descriptionEn: "Vanish from sight instantly"
      },
      5: {
        name: "Manto da Congregação",
        nameEn: "Cloak the Gathering",
        cost: 2,
        type: "active",
        description: "Ocultar grupo de pessoas",
        descriptionEn: "Conceal a group of people"
      }
    }
  },

  // MÍSTICAS
  blood_sorcery: {
    name: "Feitiçaria do Sangue",
    nameEn: "Blood Sorcery",
    type: "mystical",
    description: "Magia do sangue",
    descriptionEn: "Blood magic",
    powers: {
      1: {
        name: "Provar o Sangue",
        nameEn: "Taste for Blood",
        cost: 0,
        type: "active",
        description: "Ler informações no sangue",
        descriptionEn: "Read information in blood"
      },
      2: {
        name: "Proteção Contra Ghouls",
        nameEn: "Extinguish Vitae",
        cost: 1,
        type: "ritual",
        description: "Tornar sangue tóxico para não-vampiros",
        descriptionEn: "Make blood toxic to non-vampires"
      },
      3: {
        name: "Lança de Sangue",
        nameEn: "Blood of Potency",
        cost: 1,
        type: "active",
        description: "Transformar sangue em arma",
        descriptionEn: "Turn blood into weapon"
      },
      4: {
        name: "Roubar Vitalidade",
        nameEn: "Theft of Vitae",
        cost: 1,
        type: "active",
        description: "Drenar vida à distância",
        descriptionEn: "Drain life from distance"
      },
      5: {
        name: "Caldeirão de Sangue",
        nameEn: "Cauldron of Blood",
        cost: 2,
        type: "active",
        description: "Ferver sangue da vítima",
        descriptionEn: "Boil victim's blood"
      }
    }
  },
  oblivion: {
    name: "Oblívio",
    nameEn: "Oblivion",
    type: "mystical",
    description: "Poderes das sombras e dos mortos",
    descriptionEn: "Powers of shadows and the dead",
    powers: {
      1: {
        name: "Toque da Sombra",
        nameEn: "Shadow Cloak",
        cost: 0,
        type: "active",
        description: "Enfraquecer com toque gélido",
        descriptionEn: "Weaken with cold touch"
      },
      2: {
        name: "Enxergar os Espíritos",
        nameEn: "Shadow Cast",
        cost: 1,
        type: "active",
        description: "Ver e falar com fantasmas",
        descriptionEn: "See and talk to ghosts"
      },
      3: {
        name: "Mortalha de Trevas",
        nameEn: "Arms of Ahriman",
        cost: 1,
        type: "active",
        description: "Criar escuridão absoluta",
        descriptionEn: "Create absolute darkness"
      },
      4: {
        name: "Invocar Espírito",
        nameEn: "Stygian Shroud",
        cost: 1,
        type: "active",
        description: "Trazer fantasmas para mundo físico",
        descriptionEn: "Bring ghosts to physical world"
      },
      5: {
        name: "Portal das Sombras",
        nameEn: "Tenebrous Avatar",
        cost: 2,
        type: "active",
        description: "Viajar através das sombras",
        descriptionEn: "Travel through shadows"
      }
    }
  },

  // ESPECÍFICAS
  protean: {
    name: "Metamorfose",
    nameEn: "Protean",
    type: "physical",
    description: "Transformações corporais",
    descriptionEn: "Shape-shifting",
    powers: {
      1: {
        name: "Olhos da Besta",
        nameEn: "Eyes of the Beast",
        cost: 0,
        type: "active",
        description: "Enxergar no escuro total",
        descriptionEn: "See in total darkness"
      },
      2: {
        name: "Garras da Besta",
        nameEn: "Feral Claws",
        cost: 1,
        type: "active",
        description: "Garras que causam dano agravado",
        descriptionEn: "Claws that deal aggravated damage"
      },
      3: {
        name: "Fundir-se com a Terra",
        nameEn: "Earth Meld",
        cost: 1,
        type: "active",
        description: "Afundar no solo para descanso",
        descriptionEn: "Sink into the ground to rest"
      },
      4: {
        name: "Forma de Lobo",
        nameEn: "Shapechange",
        cost: 1,
        type: "active",
        description: "Transformar-se em lobo",
        descriptionEn: "Transform into wolf"
      },
      5: {
        name: "Forma de Névoa",
        nameEn: "Mist Form",
        cost: 1,
        type: "active",
        description: "Transformar-se em névoa",
        descriptionEn: "Transform into mist"
      }
    }
  },
  animalism: {
    name: "Animalismo",
    nameEn: "Animalism",
    type: "social",
    description: "Comunicação e controle de animais",
    descriptionEn: "Animal communication and control",
    powers: {
      1: {
        name: "Comunhão com Bestas",
        nameEn: "Bond Famulus",
        cost: 0,
        type: "active",
        description: "Falar com animais",
        descriptionEn: "Speak with animals"
      },
      2: {
        name: "Sentidos da Besta",
        nameEn: "Sense the Beast",
        cost: 1,
        type: "active",
        description: "Ver através dos sentidos de um animal",
        descriptionEn: "See through animal's senses"
      },
      3: {
        name: "Subjugar Espírito",
        nameEn: "Quell the Beast",
        cost: 1,
        type: "active",
        description: "Controlar animal",
        descriptionEn: "Control animal"
      },
      4: {
        name: "Convocar Familiares",
        nameEn: "Subsume the Spirit",
        cost: 1,
        type: "active",
        description: "Chamar animais para ajudar",
        descriptionEn: "Call animals for help"
      },
      5: {
        name: "Extrair a Besta",
        nameEn: "Animal Succulence",
        cost: 2,
        type: "active",
        description: "Transferir frenesi para outra criatura",
        descriptionEn: "Transfer frenzy to another creature"
      }
    }
  }
};

/**
 * Disciplinas por clã
 */
export const CLAN_DISCIPLINES = {
  Brujah: ["potence", "celerity", "presence"],
  Gangrel: ["animalism", "auspex", "protean"],
  Malkavian: ["auspex", "dominate", "obfuscate"],
  Nosferatu: ["animalism", "obfuscate", "potence"],
  Toreador: ["auspex", "celerity", "presence"],
  Tremere: ["auspex", "blood_sorcery", "dominate"],
  Ventrue: ["dominate", "fortitude", "presence"],
  Lasombra: ["oblivion", "potence", "dominate"],
  Hecata: ["oblivion", "fortitude", "auspex"],
  "Banu Haqim": ["blood_sorcery", "celerity", "obfuscate"],
  Tzimisce: ["animalism", "dominate", "protean"],
  Ministry: ["obfuscate", "presence", "protean"],
  Ravnos: ["animalism", "obfuscate", "presence"],
  Salubri: ["auspex", "dominate", "fortitude"],
  Caitiff: [] // Pode escolher quaisquer 3
};

/**
 * Get disciplines for a clan
 */
export function getClanDisciplines(clan) {
  return CLAN_DISCIPLINES[clan] || [];
}

/**
 * Get discipline data
 */
export function getDiscipline(disciplineKey) {
  return DISCIPLINES[disciplineKey];
}

/**
 * Get all disciplines
 */
export function getAllDisciplines() {
  return DISCIPLINES;
}