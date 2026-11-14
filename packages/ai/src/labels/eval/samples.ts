import type {
  LeadTemperature,
  Transcript,
  UserSentiment,
  UserTone,
} from "@convoform/db/src/schema";

export type LabelEvalSample = {
  id: string;
  transcript: Transcript[];
  expected: {
    tone: UserTone;
    sentiment: UserSentiment;
    temperature: LeadTemperature;
  };
};

const turn = (role: Transcript["role"], content: string): Transcript => ({
  role,
  content,
});

export const labelEvalSamples: LabelEvalSample[] = [
  {
    id: "uk-mba-fees",
    transcript: [
      turn("assistant", "Which course are you planning to study?"),
      turn(
        "user",
        "B.Com graduate hoon, UK ke liye MBA karna hai. Fees kitni hai?",
      ),
      turn("assistant", "Tuition is usually £18,000–£30,000 per year."),
      turn(
        "user",
        "Okay. Aur living cost? Main September intake ke liye apply karna chahta hoon.",
      ),
    ],
    expected: {
      tone: "casual",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
  {
    id: "canada-pr-ielts",
    transcript: [
      turn("assistant", "What is your goal for studying abroad?"),
      turn("user", "Mera IELTS 7 hai. Canada ke liye PR ka rasta batao."),
      turn(
        "assistant",
        "A study permit can lead to post-graduation work and PR.",
      ),
      turn("user", "Theek hai, detailed plan bhej dijiye."),
    ],
    expected: {
      tone: "casual",
      sentiment: "neutral",
      temperature: "Warm",
    },
  },
  {
    id: "australia-budget-25l",
    transcript: [
      turn("assistant", "What is your budget for tuition and living costs?"),
      turn(
        "user",
        "Bhai Australia ka visa mil jayega? Mera budget 25 lakh hai.",
      ),
      turn("assistant", "That budget can work for several universities."),
      turn("user", "Great, mujhe call karo. Number share kar deta hoon."),
    ],
    expected: {
      tone: "casual",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
  {
    id: "confused-what-to-do",
    transcript: [
      turn("assistant", "Which intake are you targeting?"),
      turn("user", "Kuch samajh nahi aa raha, aap batao kya karna hai."),
      turn("assistant", "Start by sharing your degree and preferred country."),
      turn("user", "Done."),
    ],
    expected: {
      tone: "casual",
      sentiment: "neutral",
      temperature: "Cold",
    },
  },
  {
    id: "germany-ms-gre",
    transcript: [
      turn("assistant", "Which country and course are you considering?"),
      turn("user", "I am considering an MS in Germany. Is the GRE required?"),
      turn("assistant", "Many German universities do not require the GRE."),
      turn(
        "user",
        "Thank you. Please send the list of universities and deadlines.",
      ),
    ],
    expected: {
      tone: "formal",
      sentiment: "positive",
      temperature: "Warm",
    },
  },
  {
    id: "slow-process-annoyed",
    transcript: [
      turn("assistant", "Your application is under review."),
      turn("user", "Yaar ye process bahut slow hai. Kitna time lagega?"),
      turn("assistant", "Reviews usually take five working days."),
      turn("user", "Five days? I have been waiting for two weeks already."),
    ],
    expected: {
      tone: "frustrated",
      sentiment: "negative",
      temperature: "Warm",
    },
  },
  {
    id: "scholarship-mixed",
    transcript: [
      turn("assistant", "The tuition for this programme is £24,000."),
      turn("user", "Fees zyada hai. Scholarship milegi?"),
      turn("assistant", "There are merit scholarships up to 30%."),
      turn(
        "user",
        "Okay that helps, but I still need to check with my parents.",
      ),
    ],
    expected: {
      tone: "casual",
      sentiment: "mixed",
      temperature: "Warm",
    },
  },
  {
    id: "just-browsing",
    transcript: [
      turn("assistant", "Would you like to book a counselling call?"),
      turn("user", "Nahi, main abhi sirf dekh raha hoon."),
      turn(
        "assistant",
        "No problem. Is there a specific country you are exploring?",
      ),
      turn("user", "Not really."),
    ],
    expected: {
      tone: "casual",
      sentiment: "neutral",
      temperature: "Cold",
    },
  },
  {
    id: "thank-you-ready",
    transcript: [
      turn("assistant", "I have shared the shortlist and fee breakdown."),
      turn(
        "user",
        "Thank you ji, bahut helpful tha. Main apply karna chahta hoon.",
      ),
      turn("assistant", "Great. I can start your application today."),
      turn("user", "Yes please, batao kya documents chahiye."),
    ],
    expected: {
      tone: "enthusiastic",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
  {
    id: "one-word-answers",
    transcript: [
      turn("assistant", "Which country are you interested in?"),
      turn("user", "UK"),
      turn("assistant", "Which course?"),
      turn("user", "MBA"),
      turn("assistant", "When would you like to start?"),
      turn("user", "idk"),
    ],
    expected: {
      tone: "neutral",
      sentiment: "neutral",
      temperature: "Cold",
    },
  },
  {
    id: "us-f1-visa-anxious",
    transcript: [
      turn("assistant", "Have you received your I-20?"),
      turn(
        "user",
        "Yes, I got it yesterday. But I am really worried about the F-1 visa interview.",
      ),
      turn("assistant", "We can run a mock interview session."),
      turn(
        "user",
        "That would be great. Can we do it this week? I am scared I will mess it up.",
      ),
    ],
    expected: {
      tone: "formal",
      sentiment: "mixed",
      temperature: "Hot",
    },
  },
  {
    id: "budget-too-low",
    transcript: [
      turn(
        "assistant",
        "For the UK, you should budget around ₹35 lakh including living costs.",
      ),
      turn("user", "Itna budget nahi hai. Mera maximum 15 lakh hai."),
      turn("assistant", "We can look at some cheaper European options."),
      turn("user", "Okay, but I don't want to take a big loan."),
    ],
    expected: {
      tone: "casual",
      sentiment: "negative",
      temperature: "Warm",
    },
  },
  {
    id: "father-calling",
    transcript: [
      turn("assistant", "Would you like to discuss this with a counsellor?"),
      turn("user", "Haan, papa se baat karwao. Unka number 98XXXXXX21 hai."),
      turn("assistant", "I will arrange a call this evening."),
      turn("user", "Perfect, 6 baje call karna."),
    ],
    expected: {
      tone: "casual",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
  {
    id: "visa-rejected-formal",
    transcript: [
      turn("assistant", "How can we help you today?"),
      turn(
        "user",
        "My student visa was rejected last month. I would like to understand my options for reapplying.",
      ),
      turn(
        "assistant",
        "We can review the refusal letter and prepare a stronger application.",
      ),
      turn(
        "user",
        "I have the refusal letter. Please let me know which documents you need.",
      ),
    ],
    expected: {
      tone: "formal",
      sentiment: "neutral",
      temperature: "Hot",
    },
  },
  {
    id: "hinglish-ok-haan",
    transcript: [
      turn("assistant", "Do you want the ₹20–40L budget options?"),
      turn("user", "Haan"),
      turn("assistant", "Should I share the Canada list?"),
      turn("user", "Ok"),
    ],
    expected: {
      tone: "casual",
      sentiment: "neutral",
      temperature: "Cold",
    },
  },
  {
    id: "enthusiastic-campus",
    transcript: [
      turn("assistant", "Here are photos of the campus and accommodation."),
      turn(
        "user",
        "Wow, this looks amazing! I love the campus. When can I visit?",
      ),
      turn("assistant", "Open days run every Friday."),
      turn("user", "Count me in for this Friday!"),
    ],
    expected: {
      tone: "enthusiastic",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
  {
    id: "frustrated-hidden-fees",
    transcript: [
      turn("assistant", "The quoted fee covers tuition only."),
      turn(
        "user",
        "Why didn't you say that earlier? Every time there is a hidden fee.",
      ),
      turn(
        "assistant",
        "I am sorry for the confusion. I can send a full breakdown.",
      ),
      turn("user", "Send it, but this is very disappointing."),
    ],
    expected: {
      tone: "frustrated",
      sentiment: "negative",
      temperature: "Warm",
    },
  },
  {
    id: "polite-window-shopping",
    transcript: [
      turn("assistant", "Would you like to apply for the January intake?"),
      turn(
        "user",
        "I am still comparing a few countries. I will get back to you later.",
      ),
      turn("assistant", "Sure. Should I email you the comparison sheet?"),
      turn("user", "That would be helpful, thank you."),
    ],
    expected: {
      tone: "formal",
      sentiment: "neutral",
      temperature: "Warm",
    },
  },
  {
    id: "hinglish-deadline-panic",
    transcript: [
      turn("assistant", "The application deadline is 15 December."),
      turn(
        "user",
        "Arre yaar, sirf 4 din bache hain! Kya main abhi apply kar sakta hoon?",
      ),
      turn("assistant", "Yes, if we receive your documents today."),
      turn("user", "Main abhi bhej raha hoon. Please check karke batao."),
    ],
    expected: {
      tone: "casual",
      sentiment: "mixed",
      temperature: "Hot",
    },
  },
  {
    id: "medical-mbbs",
    transcript: [
      turn("assistant", "Which programme are you interested in?"),
      turn("user", "MBBS in Russia. My NEET score is 450."),
      turn("assistant", "That score is eligible for several universities."),
      turn("user", "Please share the fee structure and hostel details."),
    ],
    expected: {
      tone: "formal",
      sentiment: "neutral",
      temperature: "Warm",
    },
  },
  {
    id: "silent-after-quote",
    transcript: [
      turn("assistant", "Here is the total cost for the Australia programme."),
      turn("user", "Okay"),
      turn("assistant", "Would you like to proceed?"),
      turn("user", "Let me think."),
    ],
    expected: {
      tone: "neutral",
      sentiment: "neutral",
      temperature: "Cold",
    },
  },
  {
    id: "parent-pressure",
    transcript: [
      turn("assistant", "Have you discussed this with your parents?"),
      turn(
        "user",
        "Papa chahte hain Canada, mummy chahti hai UK. Main confused hoon.",
      ),
      turn(
        "assistant",
        "We can compare both options and share the differences.",
      ),
      turn(
        "user",
        "Please send something I can show them. Bahut pressure hai.",
      ),
    ],
    expected: {
      tone: "casual",
      sentiment: "mixed",
      temperature: "Warm",
    },
  },
  {
    id: "already-have-admit",
    transcript: [
      turn("assistant", "Do you already have an offer letter?"),
      turn(
        "user",
        "Yes, from the University of Manchester. I need help with the deposit and visa.",
      ),
      turn("assistant", "Congratulations. We can help with both."),
      turn(
        "user",
        "Great, I want to pay the deposit this week. What are the next steps?",
      ),
    ],
    expected: {
      tone: "formal",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
  {
    id: "abusive-frustrated",
    transcript: [
      turn("assistant", "Your call is scheduled for 4 PM."),
      turn("user", "Nobody called me last time. This is ridiculous."),
      turn("assistant", "I apologise. I will confirm the counsellor now."),
      turn("user", "Just make sure it happens. I am tired of chasing you."),
    ],
    expected: {
      tone: "frustrated",
      sentiment: "negative",
      temperature: "Warm",
    },
  },
  {
    id: "hinglish-thank-you",
    transcript: [
      turn("assistant", "Your application has been submitted."),
      turn("user", "Thank you so much ji. Aapne bahut help kiya."),
      turn("assistant", "You are welcome. We will update you on the decision."),
      turn("user", "Bilkul, main wait karunga."),
    ],
    expected: {
      tone: "casual",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
  {
    id: "random-query",
    transcript: [
      turn("assistant", "Which course are you looking for?"),
      turn("user", "Do you know a good biryani place near the office?"),
      turn("assistant", "I can only help with study abroad applications."),
      turn("user", "Ok bye"),
    ],
    expected: {
      tone: "casual",
      sentiment: "neutral",
      temperature: "Cold",
    },
  },
  {
    id: "finance-planning",
    transcript: [
      turn("assistant", "How do you plan to fund your studies?"),
      turn(
        "user",
        "We are planning an education loan. My father's CIBIL is 780.",
      ),
      turn("assistant", "That should help with approval."),
      turn(
        "user",
        "Can you connect me with the bank partner? I want to start the process.",
      ),
    ],
    expected: {
      tone: "formal",
      sentiment: "neutral",
      temperature: "Hot",
    },
  },
  {
    id: "hesitant-low-budget",
    transcript: [
      turn("assistant", "These universities are within your ₹20–40L range."),
      turn("user", "Hmm, fees thodi zyada lag rahi hai."),
      turn("assistant", "Some offer scholarships after admission."),
      turn("user", "Achha. Main sochkar batata hoon."),
    ],
    expected: {
      tone: "casual",
      sentiment: "mixed",
      temperature: "Warm",
    },
  },
  {
    id: "excited-fellowship",
    transcript: [
      turn(
        "assistant",
        "You have been selected for the 20% merit scholarship.",
      ),
      turn(
        "user",
        "Are you serious? That is fantastic news! Thank you so much!",
      ),
      turn(
        "assistant",
        "Yes. The amount will be adjusted in your first fee installment.",
      ),
      turn(
        "user",
        "Amazing. I am definitely joining. Please send the acceptance form.",
      ),
    ],
    expected: {
      tone: "enthusiastic",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
  {
    id: "short-vague",
    transcript: [
      turn("assistant", "Which country?"),
      turn("user", "Any"),
      turn("assistant", "Which course?"),
      turn("user", "Anything"),
    ],
    expected: {
      tone: "neutral",
      sentiment: "neutral",
      temperature: "Cold",
    },
  },
  {
    id: "hinglish-nri-background",
    transcript: [
      turn("assistant", "What is your current education background?"),
      turn(
        "user",
        "Main Dubai mein rehta hoon, Indian passport hai. UAE se apply kar sakta hoon?",
      ),
      turn("assistant", "Yes, applications are accepted from the UAE."),
      turn(
        "user",
        "Great. Mera target UK hai, September intake. Documents kya chahiye?",
      ),
    ],
    expected: {
      tone: "casual",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
  {
    id: "complaint-then-resolved",
    transcript: [
      turn("user", "I emailed three times and nobody replied."),
      turn("assistant", "I found your email. I am sorry for the delay."),
      turn(
        "user",
        "Okay, at least you found it. Please answer my questions now.",
      ),
      turn(
        "assistant",
        "I have answered all three and attached the fee sheet.",
      ),
      turn("user", "Thanks, that is much better."),
    ],
    expected: {
      tone: "frustrated",
      sentiment: "mixed",
      temperature: "Warm",
    },
  },
  {
    id: "polite-not-interested",
    transcript: [
      turn("assistant", "Would you like to speak with a counsellor?"),
      turn(
        "user",
        "No, thank you. I have already finalised another consultant.",
      ),
      turn("assistant", "Understood. All the best with your application."),
      turn("user", "Thank you for your time."),
    ],
    expected: {
      tone: "formal",
      sentiment: "neutral",
      temperature: "Cold",
    },
  },
  {
    id: "hinglish-urgent-intake",
    transcript: [
      turn("assistant", "The May intake closes next week."),
      turn("user", "Mujhe isi intake mein jaana hai. Kya ho sakta hai?"),
      turn("assistant", "We can try if your documents are ready today."),
      turn(
        "user",
        "Sab ready hai. Mera number le lo, aaj hi apply karte hain.",
      ),
    ],
    expected: {
      tone: "casual",
      sentiment: "positive",
      temperature: "Hot",
    },
  },
];
