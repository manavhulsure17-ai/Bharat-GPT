import { WordBreakdown } from "../types";

export interface VedicVerseItem {
  id: string;
  source: string;
  vedicCategory: "Rigveda" | "Yajurveda" | "Samaveda" | "Atharvaveda" | "Upanishads" | "Bhagavad Gita" | "Subhashitani";
  theme: string;
  sanskrit: string;
  transliteration: string;
  wordBreakdown: WordBreakdown[];
  englishTranslation: string;
  philosophicalEssence: string;
  vedicSeer?: string;
  chhandas?: string;
  dailyContemplation: string;
}

export const VEDIC_WISDOM_COLLECTION: VedicVerseItem[] = [
  {
    id: "rigveda-10-191-2",
    source: "Rigveda, Mandala 10, Sukta 191, Verse 2",
    vedicCategory: "Rigveda",
    theme: "Universal Unity & Harmonious Action",
    sanskrit: "सङ्गच्छध्वं संवदध्वं सं वो मनांसि जानताम्।\nदेवा भागं यथा पूर्वे सञ्जानाना उपासते॥",
    transliteration: "saṅgacchadhvaṁ saṁvadadhvaṁ saṁ vo manāṁsi jānatām |\ndevā bhāgaṁ yathā pūrve sañjānānā upāsate ||",
    wordBreakdown: [
      { word: "सङ्गच्छध्वम् (saṅgacchadhvam)", meaning: "walk together in harmony" },
      { word: "संवदध्वम् (saṁvadadhvam)", meaning: "speak with one accord and mutual respect" },
      { word: "सं वः मनांसि (saṁ vaḥ manāṁsi)", meaning: "let your minds be united in understanding" },
      { word: "जानताम् (jānatām)", meaning: "comprehending shared truth" },
      { word: "देवाः (devāḥ)", meaning: "the radiant cosmic deities" },
      { word: "भागम् (bhāgam)", meaning: "their rightful portion / duties" },
      { word: "यथा पूर्वे (yathā pūrve)", meaning: "just as the ancient sages did" },
      { word: "सञ्जानानाः (sañjānānāḥ)", meaning: "in harmonious consensus" },
      { word: "उपासते (upāsate)", meaning: "receive their sacred offerings" }
    ],
    englishTranslation: "Walk together in harmony, speak with one collective voice, and let your minds be united in shared understanding; just as the radiant ancients in harmony shared their sacred duties.",
    philosophicalEssence: "The concluding hymn of the entire Rigveda (the Samghatana Sukta) delivers humanity's ultimate charter for unity, mutual empathy, and collaborative civilizational advancement.",
    vedicSeer: "Rishi Samvanana",
    chhandas: "Trishtubh Chhandas",
    dailyContemplation: "Today, replace confrontation with empathetic dialogue. Look for common ground in your conversations rather than division."
  },
  {
    id: "upanishad-isha-1",
    source: "Isha Upanishad, Verse 1",
    vedicCategory: "Upanishads",
    theme: "Divine Immanence & Non-Possessiveness",
    sanskrit: "ईशा वास्यमिदँ सर्वं यत्किञ्च जगत्यां जगत्।\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥",
    transliteration: "īśā vāsyam idaṁ sarvaṁ yat kiñca jagatyāṁ jagat |\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam ||",
    wordBreakdown: [
      { word: "ईशा (īśā)", meaning: "by the Supreme Consciousness / Divine Spirit" },
      { word: "वास्यम् (vāsyam)", meaning: "is enveloped, permeated, and indwelt" },
      { word: "इदम् सर्वम् (idam sarvam)", meaning: "all of this entire cosmos" },
      { word: "यत्किञ्च (yat kiñca)", meaning: "whatever transient existence" },
      { word: "जगत्याम् जगत् (jagatyāṁ jagat)", meaning: "moves in this moving universe" },
      { word: "तेन त्यक्तेन (tena tyaktena)", meaning: "through renunciation of greed and attachment" },
      { word: "भुञ्जीथाः (bhuñjīthāḥ)", meaning: "enjoy and sustain life" },
      { word: "मा गृधः (mā gṛdhaḥ)", meaning: "do not covet" },
      { word: "कस्यस्वित् धनम् (kasyasvid dhanam)", meaning: "the wealth of anyone" }
    ],
    englishTranslation: "All this whatever is changing in this fleeting world is enveloped and permeated by the Divine Consciousness. Therefore, enjoy life through detached contemplation; do not covet the wealth of anyone.",
    philosophicalEssence: "True abundance is found not in accumulating possession, but in recognizing that the sacred permeates everything around us. Joy comes from gratitude, not greed.",
    vedicSeer: "Sage Yajnavalkya",
    chhandas: "Anushtubh Chhandas",
    dailyContemplation: "Practice detached gratitude today: enjoy whatever blessings come without clinging, and celebrate the success of others without envy."
  },
  {
    id: "upanishad-mundaka-3-1-6",
    source: "Mundaka Upanishad, Chapter 3, Khanda 1, Verse 6",
    vedicCategory: "Upanishads",
    theme: "Triumph of Ultimate Truth (National Motto of Bharat)",
    sanskrit: "सत्यमेव जयते नानृतं सत्येन पन्था विततो देवयानः।\nयेनाक्रमन्त्यृषयो ह्याप्तकामा यत्र तत् सत्यस्य परमं निधानम्॥",
    transliteration: "satyameva jayate nānṛtaṁ satyena panthā vitato devayānaḥ |\nyenākramanty ṛṣayo hy āptakāmā yatra tat satyasya paramaṁ nidhānam ||",
    wordBreakdown: [
      { word: "सत्यम् एव (satyam eva)", meaning: "Truth alone" },
      { word: "जयते (jayate)", meaning: "triumphs / is victorious" },
      { word: "न अनृतम् (na anṛtam)", meaning: "never falsehood or deceit" },
      { word: "सत्येन (satyena)", meaning: "by truth" },
      { word: "पन्थाः विततः (panthāḥ vitataḥ)", meaning: "the luminous divine path is laid out" },
      { word: "देवयानः (devayānaḥ)", meaning: "the path leading to supreme consciousness" },
      { word: "ऋषयः (ṛṣayaḥ)", meaning: "the liberated seers" },
      { word: "परमं निधानम् (paramaṁ nidhānam)", meaning: "the supreme treasure of existence" }
    ],
    englishTranslation: "Truth alone triumphs, not untruth. By truth is paved the divine journey of consciousness, traversed by sages who have transcended all selfish desire to reach the supreme abode of Truth.",
    philosophicalEssence: "The bedrock of Bharat's ethos: falsehood may enjoy fleeting temporary dominance, but only alignment with Satya (Truth and Cosmic Order) endures forever.",
    vedicSeer: "Sage Angiras & Sage Shaunaka",
    chhandas: "Trishtubh Chhandas",
    dailyContemplation: "Stand firm in your honesty today, even when a shortcut seems tempting. Authenticity yields long-term peace of mind."
  },
  {
    id: "yajurveda-shanti-36-17",
    source: "Yajurveda, Adhyaya 36, Mantra 17",
    vedicCategory: "Yajurveda",
    theme: "Cosmic Peace & Ecological Harmony",
    sanskrit: "द्यौः शान्तिरन्तरिक्षँ शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः।\nवनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वँ शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥",
    transliteration: "dyauḥ śāntir antarikṣaṁ śāntiḥ pṛthivī śāntir āpaḥ śāntir oṣadhayaḥ śāntiḥ |\nvanaspatayaḥ śāntir viśvedevāḥ śāntir brahma śāntiḥ sarvaṁ śāntiḥ śāntir eva śāntiḥ sā mā śāntir edhi ||",
    wordBreakdown: [
      { word: "द्यौः शान्तिः (dyauḥ śāntiḥ)", meaning: "may peace reign in the celestial realms" },
      { word: "न्तरिक्षम् शान्तिः (antarikṣam śāntiḥ)", meaning: "may peace prevail in the atmosphere" },
      { word: "पृथिवी शान्तिः (pṛthivī śāntiḥ)", meaning: "may peace nourish mother earth" },
      { word: "आपः शान्तिः (āpaḥ śāntiḥ)", meaning: "may peace flow through all waters" },
      { word: "ओषधयः शान्तिः (oṣadhayaḥ śāntiḥ)", meaning: "may peace heal all medicinal herbs" },
      { word: "वनस्पतयः शान्तिः (vanaspatayaḥ śāntiḥ)", meaning: "may peace abide in all majestic trees and forests" },
      { word: "सर्वम् शान्तिः (sarvam śāntiḥ)", meaning: "may universal peace permeate all of creation" },
      { word: "सा मा शान्तिरेधि (sā mā śāntir edhi)", meaning: "may that very peace dwell within my heart" }
    ],
    englishTranslation: "May peace radiate in the celestial skies, in the atmosphere, on Mother Earth, in the waters, in all medicinal flora, and in the majestic forest trees. May peace illuminate the cosmos and rest within my soul.",
    philosophicalEssence: "The Shanti Mantra is the world's most ancient environmental anthem, recognizing that inner human peace and outer planetary balance are indivisible.",
    vedicSeer: "Vedic Ritis of Shukla Yajurveda",
    chhandas: "Brihati Chhandas",
    dailyContemplation: "Honor the natural world around you today: walk mindfully, conserve water, and radiate calm to those you encounter."
  },
  {
    id: "upanishad-taittiriya-1-11",
    source: "Taittiriya Upanishad, Shiksha Valli, Anuvaka 11",
    vedicCategory: "Upanishads",
    theme: "The Ancient Convocation Charter for Life",
    sanskrit: "सत्यं वद। धर्मं चर। स्वाध्यायान्मा प्रमदः।\nमातृदेवो भव। पितृदेवो भव। आचार्यदेवो भव। अतिथिदेवो भव॥",
    transliteration: "satyaṁ vada | dharmaṁ cara | svādhyāyān mā pramadaḥ |\nmātṛdevo bhava | pitṛdevo bhava | ācāryadevo bhava | atithidevo bhava ||",
    wordBreakdown: [
      { word: "सत्यं वद (satyaṁ vada)", meaning: "speak the truth always" },
      { word: "धर्मं चर (dharmaṁ cara)", meaning: "walk the path of righteousness" },
      { word: "स्वाध्यायात् मा प्रमदः (svādhyāyāt mā pramadaḥ)", meaning: "never neglect daily self-study and learning" },
      { word: "मातृदेवो भव (mātṛdevo bhava)", meaning: "revere your mother as divine" },
      { word: "पितृदेवो भव (pitṛdevo bhava)", meaning: "revere your father as divine" },
      { word: "आचार्यदेवो भव (ācāryadevo bhava)", meaning: "revere your mentor / teacher as divine" },
      { word: "अतिथिदेवो भव (atithidevo bhava)", meaning: "revere your guest with boundless hospitality" }
    ],
    englishTranslation: "Speak the truth. Practice righteousness. Never neglect lifelong self-study and learning. Revere your mother as divine, revere your father as divine, revere your teacher as divine, and welcome your guest with sacred hospitality.",
    philosophicalEssence: "The timeless graduation address of the ancient Gurukulas — guiding seekers into the world with integrity, humility, ongoing scholarship, and filial gratitude.",
    vedicSeer: "Sage Varuna & Sage Bhrigu",
    chhandas: "Sutra / Anushtubh",
    dailyContemplation: "Spend at least 15 minutes in Svadhyaaya (studying uplifting literature) and express genuine gratitude to a parent, mentor, or friend."
  },
  {
    id: "atharvaveda-12-1-12",
    source: "Atharvaveda, Kanda 12, Sukta 1 (Bhumi Sukta), Verse 12",
    vedicCategory: "Atharvaveda",
    theme: "Reverence for Mother Earth (Prithvi Sukta)",
    sanskrit: "माता भूमिः पुत्रो अहं पृथिव्याः।\nपर्जन्यः पिता स उ नः पिपर्तु॥",
    transliteration: "mātā bhūmiḥ putro ahaṁ pṛthivyāḥ |\nparjanyaḥ pitā sa u naḥ pipartu ||",
    wordBreakdown: [
      { word: "माता भूमिः (mātā bhūmiḥ)", meaning: "The Earth is my sacred Mother" },
      { word: "पुत्रः अहम् (putraḥ aham)", meaning: "I am her devoted child" },
      { word: "पृथिव्याः (pṛthivyāḥ)", meaning: "of this boundless Earth" },
      { word: "पर्जन्यः पिता (parjanyaḥ pitā)", meaning: "the life-giving rain cloud is my father" },
      { word: "सः उ नः पिपर्तु (saḥ u naḥ pipartu)", meaning: "may he nourish and sustain our lives" }
    ],
    englishTranslation: "The Earth is my mother and I am the child of the Earth; the rain-bearing heavens are our father, who nourishes and sustains our lives.",
    philosophicalEssence: "Atharvaveda's Bhumi Sukta is humanity's earliest ecological declaration, affirming kinship between human consciousness and planetary ecology.",
    vedicSeer: "Sage Atharvan",
    chhandas: "Trishtubh",
    dailyContemplation: "Acknowledge the food, water, and air provided by nature today with intentional mindfulness and care."
  },
  {
    id: "gita-4-38",
    source: "Bhagavad Gita, Chapter 4, Verse 38",
    vedicCategory: "Bhagavad Gita",
    theme: "The Sanctifying Power of Knowledge (Jnana)",
    sanskrit: "न हि ज्ञानेन सदृशं पवित्रमिह विद्यते।\nतत्स्वयं योगसंसिद्धः कालेनात्मनि विन्दति॥",
    transliteration: "na hi jñānena sadṛśaṁ pavitram iha vidyate |\ntat svayaṁ yoga-saṁsiddhaḥ kālenātmani vindati ||",
    wordBreakdown: [
      { word: "न हि (na hi)", meaning: "certainly there is nothing" },
      { word: "ज्ञानेन सदृशम् (jñānena sadṛśam)", meaning: "comparable to spiritual wisdom and self-knowledge" },
      { word: "पवित्रम् (pavitram)", meaning: "so purifying and uplifting" },
      { word: "इह विद्यते (iha vidyate)", meaning: "in this earthly existence" },
      { word: "तत् स्वयम् (tat svayam)", meaning: "that very realization" },
      { word: "योगसंसिद्धः (yoga-saṁsiddhaḥ)", meaning: "one who is perfected through disciplined action" },
      { word: "कालेन (kālena)", meaning: "in due course of time" },
      { word: "आत्मनि विन्दति (ātmani vindati)", meaning: "discovers naturally within one's own heart" }
    ],
    englishTranslation: "In this world, there is nothing as purifying and liberating as sacred knowledge. One who is perfected in spiritual practice finds that wisdom within oneself in due course of time.",
    philosophicalEssence: "External rituals fade, but the light of self-realization burns away ignorance, confusion, and fear permanently.",
    vedicSeer: "Lord Sri Krishna to Arjuna",
    chhandas: "Anushtubh Chhandas",
    dailyContemplation: "Seek understanding over mere opinion today. In every challenge, ask: 'What deeper lesson is this offering me?'"
  },
  {
    id: "upanishad-brihadaranyaka-1-3-28",
    source: "Brihadaranyaka Upanishad, Chapter 1, Brahmana 3, Mantra 28",
    vedicCategory: "Upanishads",
    theme: "The Pavamana Abhyaroha (Prayer for Illumination)",
    sanskrit: "असतो मा सद्गमय।\nतमसो मा ज्योतिर्गमय।\nमृत्योर्माऽमृतं गमय॥\nॐ शान्तिः शान्तिः शान्तिः॥",
    transliteration: "asato mā sad gamaya |\ntamaso mā jyotir gamaya |\nmṛtyor mā amṛtaṁ gamaya ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||",
    wordBreakdown: [
      { word: "असतः (asataḥ)", meaning: "from the unreality of illusions and untruth" },
      { word: "मा (mā)", meaning: "lead me" },
      { word: "सत् (sat)", meaning: "unto eternal Truth and Reality" },
      { word: "तमसः (tamasaḥ)", meaning: "from the darkness of ignorance and despair" },
      { word: "ज्योतिः (jyotiḥ)", meaning: "unto the radiant light of wisdom" },
      { word: "मृत्योः (mṛtyoḥ)", meaning: "from the fear of mortality and transience" },
      { word: "अमृतम् (amṛtam)", meaning: "unto the nectar of immortality and oneness" }
    ],
    englishTranslation: "Lead me from the unreal to the Real. Lead me from darkness to Light. Lead me from mortality to Immortality. Om Peace, Peace, Peace.",
    philosophicalEssence: "The quintessential Vedic invocation for clarity, calling on humanity to awaken from superficial distractions to inner awareness.",
    vedicSeer: "Sage Yajnavalkya",
    chhandas: "Gayatri / Mantra",
    dailyContemplation: "Notice when you are reacting from fear or confusion, and pause to align with clarity, patience, and compassion."
  },
  {
    id: "subhashita-vasudhaiva",
    source: "Maha Upanishad, Chapter 6, Verse 72",
    vedicCategory: "Subhashitani",
    theme: "The Universal Family (वसुधैव कुटुम्बकम्)",
    sanskrit: "अयं निजः परो वेति गणना लघुचेतसाम्।\nउदारचरितानां तु वसुधैव कुटुम्बकम्॥",
    transliteration: "ayaṁ nijaḥ paro veti gaṇanā laghucetasām |\nudāracaritānāṁ tu vasudhaiva kuṭumbakam ||",
    wordBreakdown: [
      { word: "अयम् निजः (ayam nijaḥ)", meaning: "this one is my own kin" },
      { word: "परः वा इति (paraḥ vā iti)", meaning: "or that one is a stranger" },
      { word: "गणना (gaṇanā)", meaning: "such narrow calculations" },
      { word: "लघुचेतसाम् (laghucetasām)", meaning: "belong to the small-minded" },
      { word: "उदारचरितानाम् (udāracaritānām)", meaning: "for those of noble character and broad hearts" },
      { word: "तु (tu)", meaning: "indeed" },
      { word: "वसुधा एव (vasudhā eva)", meaning: "the entire Earth itself" },
      { word: "कुटुम्बकम् (kuṭumbakam)", meaning: "is one single beloved family" }
    ],
    englishTranslation: "'This person is mine, that person is a stranger' is the reckoning of narrow minds. For the noble-hearted, the entire cosmos is one single family.",
    philosophicalEssence: "India's greatest civilizational gift to global diplomacy and human consciousness: dissolving artificial borders through universal empathy.",
    vedicSeer: "Ancient Subhashita Tradition",
    chhandas: "Anushtubh Chhandas",
    dailyContemplation: "Treat a stranger, colleague, or service provider with the warmth and kindness you would show a dear family member."
  },
  {
    id: "katha-upanishad-1-3-14",
    source: "Katha Upanishad, Chapter 1, Valli 3, Verse 14",
    vedicCategory: "Upanishads",
    theme: "The Clarion Call of Awakening",
    sanskrit: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।\nक्षुरस्य धारा निशिता दुरत्यया दुर्गं पथस्तत्कवयो वदन्ति॥",
    transliteration: "uttiṣṭhata jāgrata prāpya varān nibodhata |\nkṣurasya dhārā niśitā duratyayā durgaṁ pathas tat kavayo vadanti ||",
    wordBreakdown: [
      { word: "उत्तिष्ठत (uttiṣṭhata)", meaning: "arise" },
      { word: "जाग्रत (jāgrata)", meaning: "awake from slumber" },
      { word: "प्राप्य वरान् (prāpya varān)", meaning: "approaching wise teachers" },
      { word: "निबोधत (nibodhata)", meaning: "realize the highest wisdom" },
      { word: "क्षुरस्य धारा (kṣurasya dhārā)", meaning: "like the sharp edge of a razor" },
      { word: "निशिता (niśitā)", meaning: "keen and subtle" },
      { word: "दुर्गम् पथः (durgam pathaḥ)", meaning: "a difficult path to traverse" },
      { word: "कवयः वदन्ति (kavayaḥ vadanti)", meaning: "so declare the illumined seers" }
    ],
    englishTranslation: "Arise! Awake! Approach the wise and realize the supreme Truth! Sharp as the edge of a razor and difficult to cross is this path, so say the illumined sages.",
    philosophicalEssence: "Popularized globally by Swami Vivekananda, this hymn urges seekers to shake off lethargy, master distractions, and pursue their highest calling.",
    vedicSeer: "Yama to Nachiketa",
    chhandas: "Trishtubh Chhandas",
    dailyContemplation: "Wake up with intentional purpose. Dedicate yourself to one challenging endeavor without procrastination."
  },
  {
    id: "hitopadesha-vidya-dadati",
    source: "Hitopadesha, Prastavika, Verse 6",
    vedicCategory: "Subhashitani",
    theme: "The Ladder of True Education",
    sanskrit: "विद्या ददाति विनयं विनयाद्याति पात्रताम्।\nपात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम्॥",
    transliteration: "vidyā dadāti vinayaṁ vinayād yāti pātratām |\npātratvād dhanam āpnoti dhanād dharmaṁ tataḥ sukham ||",
    wordBreakdown: [
      { word: "विद्या (vidyā)", meaning: "true learning and knowledge" },
      { word: "ददाति विनयं (dadāti vinayam)", meaning: "bestows humility" },
      { word: "विनयात् (vinayāt)", meaning: "from humility" },
      { word: "याति पात्रताम् (yāti pātratām)", meaning: "comes worthy competence" },
      { word: "पात्रत्वात् (pātratvāt)", meaning: "from competence" },
      { word: "धनम् आप्नोति (dhanam āpnoti)", meaning: "one attains honest wealth" },
      { word: "धनात् धर्मम् (dhanāt dharmam)", meaning: "with wealth one performs righteous actions" },
      { word: "ततः सुखम् (tataḥ sukham)", meaning: "and therefrom arises enduring joy" }
    ],
    englishTranslation: "True education bestows humility; from humility comes capability; from capability one earns honest wealth; with wealth one performs noble actions; and from righteousness arises enduring happiness.",
    philosophicalEssence: "Learning that inflates ego is incomplete; true learning produces humility, which generates mastery, wealth, and societal service.",
    vedicSeer: "Narayan Pandita",
    chhandas: "Anushtubh Chhandas",
    dailyContemplation: "Stay humble in your expertise. Listen attentively before sharing advice, and let your work speak for itself."
  },
  {
    id: "subhashita-paropakaraya",
    source: "Ancient Sanskrit Subhashita",
    vedicCategory: "Subhashitani",
    theme: "Selfless Service as the Law of Nature",
    sanskrit: "परोपकाराय फलन्ति वृक्षाः परोपकाराय वहन्ति नद्यः।\nपरोपकाराय दुहन्ति गावः परोपकारार्थमिदं शरीरम्॥",
    transliteration: "paropakārāya phalanti vṛkṣāḥ paropakārāya vahanti nadyaḥ |\nparopakārāya duhanti gāvaḥ paropakārārtham idaṁ śarīram ||",
    wordBreakdown: [
      { word: "परोपकाराय (paropakārāya)", meaning: "for the benefit of others" },
      { word: "फलन्ति वृक्षाः (phalanti vṛkṣāḥ)", meaning: "trees bear delicious fruit" },
      { word: "वहन्ति नद्यः (vahanti nadyaḥ)", meaning: "rivers flow endlessly" },
      { word: "दुहन्ति गावः (duhanti gāvaḥ)", meaning: "gentle cows give nourishing milk" },
      { word: "इदम् शरीरम् (idam śarīram)", meaning: "this human body and life" },
      { word: "परोपकारार्थम् (paropakārārtham)", meaning: "is meant for selfless service and kindness" }
    ],
    englishTranslation: "Trees bear fruit for the benefit of others; rivers flow for the thirst of others; cows give milk to nourish others. Likewise, this human body was created for selfless service to the world.",
    philosophicalEssence: "Nature lives in continuous synergy. When humans align with this law of Paropakara (benevolence), inner fulfillment naturally blossoms.",
    vedicSeer: "Classical Subhashita",
    chhandas: "Indravajra / Anushtubh",
    dailyContemplation: "Do one selfless act of kindness today without expecting any acknowledgment or reward."
  }
];

/**
 * Deterministically retrieves the Vedic Verse of the Day based on the current date
 */
export function getDailyVedicVerse(targetDate: Date = new Date()): VedicVerseItem {
  // Compute day of year to cycle deterministically through the collection
  const startOfYear = new Date(targetDate.getFullYear(), 0, 0);
  const diff = targetDate.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = Math.abs(dayOfYear) % VEDIC_WISDOM_COLLECTION.length;
  return VEDIC_WISDOM_COLLECTION[index];
}
