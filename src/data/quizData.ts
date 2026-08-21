import { QuizQuestion, UserBadge } from "../types";

export const CURATED_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Which ancient Indian treatise by Sushruta contains the first historical descriptions of rhinoplasty (nasal reconstruction) and over 120 surgical tools?",
    options: ["Charaka Samhita", "Sushruta Samhita", "Aryabhatiya", "Brihat Samhita"],
    correctIndex: 1,
    explanation: "Sushruta Samhita, composed in ancient Kashi, is celebrated globally as the foundational cornerstone of plastic and ophthalmic surgery.",
    category: "Ancient Sciences",
    curiousFact: "Sushruta trained his pupils to practice incisions on watermelons, gourds, and lotus stems to master delicate precision."
  },
  {
    id: "q2",
    question: "The Brihadeeswarar Temple in Thanjavur (1010 CE), built by Chola Emperor Raja Raja I, is crowned by a monolithic granite Shikhara (dome) weighing approximately:",
    options: ["20 Tons", "45 Tons", "80 Tons", "160 Tons"],
    correctIndex: 2,
    explanation: "The single-stone Kumbam atop the 216-foot high Vimana weighs about 80 tons and was hauled via an inclined earthen ramp extending 6 kilometers.",
    category: "Architecture",
    curiousFact: "The entire colossal temple was built using interlocking granite blocks with zero mortar."
  },
  {
    id: "q3",
    question: "In the Baudhayana Sulba Sutra (c. 800 BCE), which fundamental mathematical concept was codified centuries before its Greek attribution?",
    options: ["Pythagorean Theorem", "Binomial Expansion", "Calculus Integration", "Logarithmic Scale"],
    correctIndex: 0,
    explanation: "Baudhayana formulated the exact geometric relationship between the diagonal and sides of a rectangle in the context of sacred Vedic fire altars.",
    category: "Ancient Sciences",
    curiousFact: "Sulba Sutras also accurately calculated the square root of 2 up to five decimal places!"
  },
  {
    id: "q4",
    question: "Which Indian classical dance form from Kerala is famous for its elaborate facial makeup (Chutti), towering headgear (Kireetam), and dramatic Kathakali mudras?",
    options: ["Kathak", "Kathakali", "Mohiniyattam", "Odissi"],
    correctIndex: 1,
    explanation: "Kathakali translates to 'Story-Play' and integrates rigorous martial techniques (Kalaripayattu) with expressive eye movements depicting Navarasas.",
    category: "Classical Arts",
    curiousFact: "Green face makeup (Pacha) signifies noble divine heroes like Rama and Arjuna, while red beard (Chuvanna Thadi) signifies fierce villains."
  },
  {
    id: "q5",
    question: "The ancient international university of Nalanda in Bihar housed an immense 9-story library named Dharmaganja with three main towers called:",
    options: [
      "Ratnasagara, Ratnodadhi, and Ratnaranjaka",
      "Veda, Vedanta, and Samhita",
      "Ganga, Yamuna, and Saraswati",
      "Sutra, Bhashya, and Vartika"
    ],
    correctIndex: 0,
    explanation: "Ratnasagara (Ocean of Jewels), Ratnodadhi (Sea of Jewels), and Ratnaranjaka (Jewel Adorned) preserved hundreds of thousands of palm-leaf manuscripts.",
    category: "Literature & History",
    curiousFact: "When invaders burned Nalanda in 1193 CE, the massive manuscript collection burned for over three months."
  },
  {
    id: "q6",
    question: "The legendary rust-resistant Iron Pillar of Delhi (c. 4th Century CE) has resisted corrosion for over 1600 years due to the presence of which element in its metallurgy?",
    options: ["High Titanium", "High Phosphorus forming a protective passive film", "Coating of Mercury", "Alloy of Chromium"],
    correctIndex: 1,
    explanation: "High phosphorus content combined with traditional charcoal crucible forging created a micro-thin protective iron hydrogen phosphate layer called misawite.",
    category: "Ancient Sciences",
    curiousFact: "The pillar bears an inscription in ancient Brahmi script commemorating King Chandra (Chandragupta II Vikramaditya)."
  },
  {
    id: "q7",
    question: "Which Chola King built a magnificent artificial lake (Cholagangam / Ponneri) spanning over 16 miles and established the new capital Gangaikonda Cholapuram?",
    options: ["Rajendra Chola I", "Raja Raja Chola I", "Karikala Chola", "Kulottunga I"],
    correctIndex: 0,
    explanation: "Rajendra Chola I led naval expeditions across the Bay of Bengal to Sumatra, Malaya, and Srivijaya, bringing sacred Ganga water to consecrate the lake.",
    category: "History & Dynasties",
    curiousFact: "The Chola Navy was one of the world's most powerful blue-water navies in the 11th century."
  },
  {
    id: "q8",
    question: "Which ancient Indian sage and philosopher formulated the Vaisheshika atomic theory (Anu / Paramanu) proposing that all matter is composed of indivisible atoms?",
    options: ["Maharishi Kanad", "Sage Kapila", "Sage Patanjali", "Sage Gautama"],
    correctIndex: 0,
    explanation: "Maharishi Kanad (c. 6th century BCE) authored the Vaisheshika Sutras, explaining chemical combinations, heat transfer, and atomic interactions.",
    category: "Ancient Sciences",
    curiousFact: "His name 'Kanad' was derived from 'Kana' (grain/particle), because he studied the tiniest particles of reality."
  }
];

export const INITIAL_USER_BADGES: UserBadge[] = [
  {
    id: "vidya-jigyasu",
    name: "Vidya Jigyasu",
    indicName: "विद्या जिज्ञासु",
    icon: "📜",
    description: "Begun the journey of Indic wisdom & heritage exploration.",
    unlocked: true,
    unlockedAt: "First Step",
  },
  {
    id: "itihaas-marmagya",
    name: "Itihaas Marmagya",
    indicName: "इतिहास मर्मज्ञ",
    icon: "🏛️",
    description: "Score 100% on any heritage or dynasty challenge.",
    unlocked: false,
  },
  {
    id: "katha-shilpi",
    name: "Katha Shilpi",
    indicName: "कथा शिल्पी",
    icon: "🎭",
    description: "Complete an interactive multi-scene Katha story.",
    unlocked: false,
  },
  {
    id: "gita-sadhak",
    name: "Gita Sadhak",
    indicName: "गीता साधक",
    icon: "🕉️",
    description: "Explore and reflect on 3 or more sacred Sanskrit shlokas.",
    unlocked: false,
  },
  {
    id: "bhasha-sangam",
    name: "Bhasha Ratna",
    indicName: "भाषा रत्न",
    icon: "🗣️",
    description: "Translate or converse across 3 distinct Indic languages.",
    unlocked: false,
  },
  {
    id: "bharat-acharya",
    name: "Bharat Acharya",
    indicName: "भारत आचार्य",
    icon: "👑",
    description: "Master of all five heritage disciplines.",
    unlocked: false,
  }
];
