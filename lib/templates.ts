export type BookType = "fiction" | "memoir" | "nonfiction" | "children" | "other";

export interface ChapterTemplate {
  number: number;
  title: string;
  instructions: string;
  checklist: string[];
}

export interface IntroQuestion {
  id: string;
  question: string;
}

export interface GenreTemplate {
  mode: BookType;
  chapters: ChapterTemplate[];
  introQuestions: IntroQuestion[];
}

const memoirChapters: ChapterTemplate[] = [
  {
    number: 1,
    title: "Before",
    instructions:
      "Show us your life before everything changed. Help readers understand your normal world so they can appreciate your transformation.",
    checklist: [
      "Where were you living?",
      "What was a typical day?",
      "Who were important people?",
      "What were you hoping for?",
    ],
  },
  {
    number: 2,
    title: "The Moment",
    instructions:
      "What happened that changed everything? Make readers feel the moment.",
    checklist: [
      "What was the exact moment or event?",
      "Where were you?",
      "What were you thinking or feeling?",
      "Who was there, if anyone?",
    ],
  },
  {
    number: 3,
    title: "Rock Bottom",
    instructions:
      "Show us your lowest point. Don't hold back—readers connect with vulnerability.",
    checklist: [
      "What was your darkest moment?",
      "What did you lose or fear losing?",
      "How did you cope (or not cope)?",
      "What kept you going?",
    ],
  },
  {
    number: 4,
    title: "The Shelter",
    instructions:
      "Describe the place or people that helped you survive. Who or what became your anchor?",
    checklist: [
      "Where did you find refuge or support?",
      "Who showed you kindness?",
      "What small comforts mattered most?",
      "How did this change your perspective?",
    ],
  },
  {
    number: 5,
    title: "First Break",
    instructions:
      "Describe the first real break—the moment things began to turn around.",
    checklist: [
      "What opportunity appeared?",
      "How did you respond?",
      "What was different this time?",
      "Who believed in you?",
    ],
  },
  {
    number: 6,
    title: "Building Back",
    instructions:
      "Walk readers through the steps you took to rebuild your life.",
    checklist: [
      "What were your first concrete steps?",
      "What obstacles did you face?",
      "What habits or decisions made a difference?",
      "How long did it take?",
    ],
  },
  {
    number: 7,
    title: "Success",
    instructions:
      "Describe where you are now. Let readers celebrate with you.",
    checklist: [
      "What have you achieved?",
      "How is your life different?",
      "What are you most proud of?",
      "Who shares this with you?",
    ],
  },
  {
    number: 8,
    title: "Lessons Learned",
    instructions:
      "Share the wisdom you gained. What would you tell your past self?",
    checklist: [
      "What did you learn about yourself?",
      "What would you do differently?",
      "What advice would you give others?",
      "What do you believe now that you didn't before?",
    ],
  },
];

const memoirIntroQuestions: IntroQuestion[] = [
  { id: "q1", question: "When did your life change?" },
  { id: "q2", question: "Where were you at your lowest point?" },
  { id: "q3", question: "Who helped you along the way?" },
  { id: "q4", question: "What was the turning point?" },
  { id: "q5", question: "Where are you now?" },
];

const thrillerChapters: ChapterTemplate[] = [
  { number: 1, title: "Hook", instructions: "Open with tension. Drop the reader into the inciting incident.", checklist: ["What grabs the reader's attention?", "Who is the protagonist?", "What is at stake?"] },
  { number: 2, title: "Setup", instructions: "Establish the world and the protagonist's normal life before it shatters.", checklist: ["Where does the story take place?", "What does the protagonist want?", "Who are the key characters?"] },
  { number: 3, title: "First Complication", instructions: "Introduce the main conflict or threat.", checklist: ["What disrupts the status quo?", "How does the protagonist react?", "What new information emerges?"] },
  { number: 4, title: "Rising Action", instructions: "Escalate the stakes. The protagonist takes action.", checklist: ["What does the protagonist try?", "What goes wrong?", "Who is the antagonist or obstacle?"] },
  { number: 5, title: "Midpoint", instructions: "A major revelation or twist that changes everything.", checklist: ["What secret is revealed?", "How does the protagonist's goal shift?", "What is the real enemy?"] },
  { number: 6, title: "Dark Night", instructions: "The protagonist's lowest point. All seems lost.", checklist: ["What is lost or threatened?", "Who can the protagonist trust?", "What seems impossible?"] },
  { number: 7, title: "Climax", instructions: "The final confrontation. Maximum tension.", checklist: ["Where does the showdown happen?", "What does the protagonist risk?", "How do they face the antagonist?"] },
  { number: 8, title: "Resolution", instructions: "Tie up the main threads. New equilibrium.", checklist: ["How is the conflict resolved?", "What changed for the protagonist?", "What loose ends remain?"] },
  { number: 9, title: "Denouement", instructions: "A brief look at life after. Closure.", checklist: ["Where are the characters now?", "What lasting impact did the events have?", "Any hint of sequel or future?"] },
];

const thrillerIntroQuestions: IntroQuestion[] = [
  { id: "q1", question: "Who is your main character?" },
  { id: "q2", question: "What is the central mystery or threat?" },
  { id: "q3", question: "What is at stake if they fail?" },
  { id: "q4", question: "Where does the story take place?" },
  { id: "q5", question: "What is the protagonist's flaw or weakness?" },
];

const fantasyChapters: ChapterTemplate[] = [
  { number: 1, title: "Ordinary World", instructions: "Establish the protagonist's normal life and world.", checklist: ["Where do they live?", "What is their daily life?", "What do they want or lack?"] },
  { number: 2, title: "Call to Adventure", instructions: "Something disrupts the ordinary. The journey begins.", checklist: ["What invitation or threat appears?", "Who or what calls them?", "Why can't they refuse?"] },
  { number: 3, title: "Crossing the Threshold", instructions: "The protagonist leaves the known world behind.", checklist: ["What boundary do they cross?", "What do they leave behind?", "What new world awaits?"] },
  { number: 4, title: "Tests and Allies", instructions: "Early challenges and the people who help.", checklist: ["What obstacles do they face?", "Who joins them?", "What skills do they learn?"] },
  { number: 5, title: "Approach the Cave", instructions: "Preparation for the central ordeal.", checklist: ["What must they do to prepare?", "What fears surface?", "What is the looming challenge?"] },
  { number: 6, title: "Ordeal", instructions: "The central crisis. Death and rebirth.", checklist: ["What is the central trial?", "What do they lose or sacrifice?", "How are they transformed?"] },
  { number: 7, title: "Reward", instructions: "The protagonist emerges with a gift or insight.", checklist: ["What do they gain?", "What do they understand now?", "What power or knowledge do they have?"] },
  { number: 8, title: "The Road Back", instructions: "Return to the ordinary world, but changed.", checklist: ["What pulls them back?", "What final obstacles remain?", "Who or what pursues them?"] },
  { number: 9, title: "Resurrection", instructions: "Final test. The old self dies; the new self rises.", checklist: ["What final battle or choice remains?", "How do they prove they've changed?", "What old way is left behind?"] },
  { number: 10, title: "Return with the Elixir", instructions: "Back home with the gift. New equilibrium.", checklist: ["What do they bring back?", "How has their world changed?", "What lasting impact do they have?"] },
];

const fantasyIntroQuestions: IntroQuestion[] = [
  { id: "q1", question: "What is the magical or fantastical element?" },
  { id: "q2", question: "Who is your protagonist and what do they want?" },
  { id: "q3", question: "What world or realm does the story inhabit?" },
  { id: "q4", question: "What is the main threat or antagonist?" },
  { id: "q5", question: "What must the protagonist learn or overcome?" },
];

const nonfictionChapters: ChapterTemplate[] = [
  { number: 1, title: "The Problem", instructions: "Introduce the core problem your book solves.", checklist: ["What is the main problem?", "Who has this problem?", "Why does it matter?"] },
  { number: 2, title: "Why It Matters", instructions: "Make the case for why solving this problem is urgent.", checklist: ["What are the consequences of not solving it?", "What statistics or stories illustrate it?", "Who is affected?"] },
  { number: 3, title: "Common Mistakes", instructions: "Address what people typically get wrong.", checklist: ["What do people usually do wrong?", "Why do those approaches fail?", "What myths need debunking?"] },
  { number: 4, title: "The Framework", instructions: "Present your core framework or approach.", checklist: ["What is your main framework?", "What are the key steps or principles?", "How does it work?"] },
  { number: 5, title: "Step-by-Step", instructions: "Walk through the solution in detail.", checklist: ["What is step one?", "What are the sub-steps?", "What tools or resources are needed?"] },
  { number: 6, title: "Case Studies", instructions: "Show real examples of the approach in action.", checklist: ["Who succeeded using this?", "What were their results?", "What challenges did they face?"] },
  { number: 7, title: "Troubleshooting", instructions: "Address common obstacles and how to overcome them.", checklist: ["What typically goes wrong?", "How do you get back on track?", "When should you ask for help?"] },
  { number: 8, title: "Action Plan", instructions: "Give readers a clear next-step roadmap.", checklist: ["What should they do first?", "What's the 30/60/90 day plan?", "How do they stay accountable?"] },
];

const nonfictionIntroQuestions: IntroQuestion[] = [
  { id: "q1", question: "What specific problem does your book solve?" },
  { id: "q2", question: "Who is your ideal reader?" },
  { id: "q3", question: "What makes your approach different?" },
  { id: "q4", question: "What experience do you have with this topic?" },
  { id: "q5", question: "What is the one thing readers must take away?" },
];

const childrenChapters: ChapterTemplate[] = [
  { number: 1, title: "The Ordinary Day", instructions: "Introduce the main character and their normal world.", checklist: ["Who is the main character?", "Where do they live?", "What is a typical day like?"] },
  { number: 2, title: "Something Changes", instructions: "Something unexpected happens.", checklist: ["What surprising thing occurs?", "How does the character react?", "What question does it raise?"] },
  { number: 3, title: "The Adventure Begins", instructions: "The character sets off or decides to act.", checklist: ["What do they decide to do?", "Who goes with them?", "What do they need?"] },
  { number: 4, title: "First Challenge", instructions: "The first obstacle appears.", checklist: ["What goes wrong?", "How do they try to fix it?", "Who or what helps?"] },
  { number: 5, title: "Meeting Friends", instructions: "New allies or helpers appear.", checklist: ["Who do they meet?", "What do they learn?", "How do they work together?"] },
  { number: 6, title: "The Big Problem", instructions: "The main challenge or villain appears.", checklist: ["What is the biggest obstacle?", "Why is it scary or hard?", "What's at stake?"] },
  { number: 7, title: "The Solution", instructions: "The character finds a way through.", checklist: ["How do they solve it?", "What do they learn?", "How do they work together?"] },
  { number: 8, title: "Home Again", instructions: "Return to normal, but changed.", checklist: ["What do they bring back?", "How have they grown?", "What's different now?"] },
];

const childrenIntroQuestions: IntroQuestion[] = [
  { id: "q1", question: "Who is the main character?" },
  { id: "q2", question: "What is the story's main challenge or adventure?" },
  { id: "q3", question: "What age group is this for?" },
  { id: "q4", question: "What lesson or message should kids take away?" },
  { id: "q5", question: "What makes the story fun or magical?" },
];

const otherChapters: ChapterTemplate[] = [
  { number: 1, title: "Introduction", instructions: "Introduce your story, topic, or idea. Set the stage.", checklist: ["What is this about?", "Why does it matter?", "Who is it for?"] },
  { number: 2, title: "Context", instructions: "Provide background. Help readers understand where this begins.", checklist: ["What background is needed?", "Where and when does this start?", "What's the starting point?"] },
  { number: 3, title: "Development", instructions: "Develop the main ideas or plot. Build momentum.", checklist: ["What happens next?", "What ideas or events unfold?", "What changes?"] },
  { number: 4, title: "Complication", instructions: "Introduce obstacles, tension, or complexity.", checklist: ["What goes wrong or gets complicated?", "What challenges arise?", "How do you or the character respond?"] },
  { number: 5, title: "Crisis", instructions: "The turning point or peak of tension.", checklist: ["What is the critical moment?", "What decision or event changes everything?", "What is at stake?"] },
  { number: 6, title: "Resolution", instructions: "Work through the crisis. Find a way forward.", checklist: ["How is it resolved?", "What is learned?", "What changes as a result?"] },
  { number: 7, title: "Reflection", instructions: "Look back. Extract meaning or lessons.", checklist: ["What does it mean?", "What would you do differently?", "What have you learned?"] },
  { number: 8, title: "Conclusion", instructions: "Bring it to a close. Leave readers with something to carry.", checklist: ["What is the takeaway?", "What's next?", "What should readers remember?"] },
];

const otherIntroQuestions: IntroQuestion[] = [
  { id: "q1", question: "What is the main idea or story?" },
  { id: "q2", question: "Who is this for?" },
  { id: "q3", question: "What do you want readers to feel or do?" },
  { id: "q4", question: "What makes it unique?" },
  { id: "q5", question: "Where does the story or idea begin?" },
];

export const GENRE_TEMPLATES: Record<BookType, GenreTemplate> = {
  fiction: { mode: "fiction", chapters: thrillerChapters, introQuestions: thrillerIntroQuestions },
  memoir: { mode: "memoir", chapters: memoirChapters, introQuestions: memoirIntroQuestions },
  nonfiction: { mode: "nonfiction", chapters: nonfictionChapters, introQuestions: nonfictionIntroQuestions },
  children: { mode: "children", chapters: childrenChapters, introQuestions: childrenIntroQuestions },
  other: { mode: "other", chapters: otherChapters, introQuestions: otherIntroQuestions },
};

export const BOOK_TYPE_LABELS: Record<BookType, string> = {
  fiction: "Fiction Novel",
  memoir: "Memoir/Autobiography",
  nonfiction: "Non-fiction/How-to",
  children: "Children's Book",
  other: "Other",
};

export const BOOK_TYPE_FROM_LABEL: Record<string, BookType> = {
  "Fiction Novel": "fiction",
  "Memoir/Autobiography": "memoir",
  "Non-fiction/How-to": "nonfiction",
  "Children's Book": "children",
  Other: "other",
};

export function getTemplate(bookType: BookType): GenreTemplate {
  return GENRE_TEMPLATES[bookType] ?? GENRE_TEMPLATES.other;
}
