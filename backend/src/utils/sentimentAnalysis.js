
// Helper: Check for negation before a word
function hasNegation(text, wordIndex) {
    const negationWords = ["not", "no", "never", "can't", "cannot", "couldn't", "didn't", "don't", "doesn't", "won't", "wouldn't", "shouldn't", "aint", "ain't", "none", "neither"];

    // Look back up to 2 words before
    const beforeWord = text.substring(Math.max(0, wordIndex - 30), wordIndex);
    const lastWords = beforeWord.split(/\s+/).reverse();

    for (let i = 0; i < Math.min(2, lastWords.length); i++) {
        const word = lastWords[i].toLowerCase().replace(/[^\w]/g, "");
        if (negationWords.includes(word)) {
            return true;
        }
    }
    return false;
}

// Helper: Count sentiment words with negation handling
function countSentimentWords(text, words) {
    let count = 0;
    let positions = [];

    words.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        let match;
        while ((match = regex.exec(text)) !== null) {
            positions.push({
                word,
                index: match.index,
                isNegated: hasNegation(text, match.index)
            });
        }
    });

    return positions;
}

// Simple keyword-based sentiment analysis with negation handling
export const analyzeSentiment = (text) => {
    if (!text || typeof text !== "string") {
        return {
            sentiment: "neutral",
            score: 0,
            confidence: 0.5,
        };
    }

    const lowerText = text.toLowerCase();

    // Positive indicators
    const positiveWords = [
        "good",
        "great",
        "excellent",
        "improve",
        "better",
        "positive",
        "happy",
        "satisfied",
        "resolved",
        "thanks",
        "appreciate",
        "well-maintained",
        "nice",
        "wonderful",
        "amazing",
        "brilliant",
    ];

    // Negative indicators - Enhanced with teaching/academic context
    const negativeWords = [
        "bad",
        "terrible",
        "poor",
        "worst",
        "horrible",
        "dirty",
        "broken",
        "damaged",
        "issue",
        "problem",
        "complaint",
        "unhappy",
        "disgusting",
        "filthy",
        "unsafe",
        "hazardous",
        "urgent",
        "critical",
        "emergency",
        "fail",
        "malfunction",
        "ineffective",
        "incompetent",
        "unskilled",
        "weak",
        "inadequate",
        "insufficient",
        "lack",
        "lacking",
        "poor teaching",
        "not teaching",
        "don't teach",
        "can't teach",
        "unable",
        "incapable",
    ];

    // Count positive words with negation handling
    const positivePositions = countSentimentWords(lowerText, positiveWords);
    let positiveCount = positivePositions.filter(p => !p.isNegated).length;
    let negatedPositiveCount = positivePositions.filter(p => p.isNegated).length;

    // Count negative words with negation handling
    const negativePositions = countSentimentWords(lowerText, negativeWords);
    let negativeCount = negativePositions.filter(p => !p.isNegated).length;
    let negatedNegativeCount = negativePositions.filter(p => p.isNegated).length;

    // Adjust counts: negated positive words become negative, negated negative words become positive
    const finalPositiveCount = positiveCount + negatedNegativeCount;
    const finalNegativeCount = negativeCount + negatedPositiveCount;

    const totalSentimentWords = finalPositiveCount + finalNegativeCount;
    let sentiment = "neutral";
    let score = 0;
    let confidence = 0.6;

    if (totalSentimentWords > 0) {
        const positiveRatio = finalPositiveCount / totalSentimentWords;

        if (positiveRatio > 0.65) {
            sentiment = "positive";
            score = Math.min(1, positiveRatio);
            confidence = Math.min(0.95, 0.5 + positiveRatio * 0.4);
        } else if (positiveRatio < 0.35) {
            sentiment = "negative";
            score = Math.max(-1, -(1 - positiveRatio));
            confidence = Math.min(0.95, 0.5 + (1 - positiveRatio) * 0.4);
        } else {
            sentiment = "neutral";
            score = 0;
            confidence = Math.min(0.85, 0.5 + 0.2);
        }
    }

    return {
        sentiment,
        score: Math.round(score * 100) / 100, // -1 to 1
        confidence: Math.round(confidence * 100) / 100, // 0 to 1
    };
};

// Extract keywords from complaint text
export const extractKeywords = (text) => {
    if (!text || typeof text !== "string") return [];

    const commonWords = new Set([
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "from",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "can",
        "this",
        "that",
        "these",
        "those",
        "i",
        "you",
        "he",
        "she",
        "it",
        "we",
        "they",
    ]);

    // Extract words (remove special characters)
    const words = text
        .toLowerCase()
        .split(/[\s\.\,\!\?\;]+/)
        .filter((word) => word.length > 3 && !commonWords.has(word));

    // Count word frequency
    const frequency = {};
    words.forEach((word) => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    // Get top keywords (appearing 2+ times or high relevance)
    const keywords = Object.entries(frequency)
        .filter(([_, count]) => count >= 2 || relevanceScore(words, _) > 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);

    return keywords.length > 0 ? keywords : words.slice(0, 5);
};

// Helper function to calculate keyword relevance
function relevanceScore(words, keyword) {
    const relevantTerms = {
        hostel: 5,
        room: 4,
        infrastructure: 5,
        facility: 4,
        maintenance: 4,
        safety: 6,
        academic: 5,
        harassment: 6,
        transportation: 4,
        library: 3,
    };

    return relevantTerms[keyword] || 1;
}

// Analyze priority level based on sentiment and keywords
export const analyzePriority = (text, sentiment) => {
    const lowerText = text.toLowerCase();

    const criticalKeywords = [
        "urgent",
        "emergency",
        "critical",
        "dangerous",
        "hazard",
        "life-threatening",
        "fire",
        "electrical",
        "assault",
        "harassment",
    ];

    const highKeywords = [
        "broken",
        "damaged",
        "not working",
        "malfunction",
        "severe",
        "serious",
        "unsafe",
        "unhealthy",
        "poor teaching",
        "bad teaching",
        "incompetent teacher",
        "ineffective teaching",
        "not teaching",
        "teacher unable",
        "teacher incapable",
        "inadequate teaching",
        "no teaching",
        "teacher doesn't",
        "teacher can't",
    ];

    // Check for critical indicators
    for (const keyword of criticalKeywords) {
        if (lowerText.includes(keyword)) {
            return "critical";
        }
    }

    // Check for high priority indicators
    for (const keyword of highKeywords) {
        if (lowerText.includes(keyword)) {
            return "high";
        }
    }

    // Use sentiment as secondary indicator
    if (sentiment === "negative") {
        return "high";
    }

    if (sentiment === "neutral" && lowerText.length > 200) {
        return "medium";
    }

    return "medium";
};

// Detect safety-related flags
export const detectFlags = (text, category) => {
    const lowerText = text.toLowerCase();

    const safetyKeywords = [
        "safety",
        "dangerous",
        "hazard",
        "unsafe",
        "injury",
        "accident",
        "emergency",
        "attack",
        "assault",
        "harassment",
        "threat",
        "violence",
        "fire",
        "electrical",
    ];

    const urgentKeywords = [
        "urgent",
        "emergency",
        "critical",
        "immediately",
        "asap",
        "quickly",
    ];

    const duplicateIndicators = [
        "duplicate",
        "same",
        "already",
        "previous",
        "similar",
    ];

    return {
        safety:
            safetyKeywords.some((keyword) => lowerText.includes(keyword)) ||
            category === "safety",
        urgent: urgentKeywords.some((keyword) => lowerText.includes(keyword)),
        duplicate: duplicateIndicators.some((keyword) => lowerText.includes(keyword)),
    };
};

// Categorize complaint based on text content
export const categorizeComplaint = (text, providedCategory) => {
    // If category is explicitly provided and valid, use it
    if (providedCategory) {
        return providedCategory;
    }

    const lowerText = text.toLowerCase();

    const categoryKeywords = {
        academic: [
            "class",
            "lecture",
            "exam",
            "course",
            "teacher",
            "professor",
            "assignment",
            "curriculum",
            "study",
        ],
        hostel: [
            "hostel",
            "room",
            "accommodation",
            "dorm",
            "dormitory",
            "residence",
            "bed",
        ],
        infrastructure: [
            "building",
            "facility",
            "maintenance",
            "repair",
            "broken",
            "roof",
            "wall",
            "plumbing",
        ],
        safety: [
            "safety",
            "danger",
            "hazard",
            "unsafe",
            "emergency",
            "security",
        ],
        harassment: [
            "harassment",
            "bullying",
            "abuse",
            "disrespect",
            "assault",
            "threat",
        ],
        financial: [
            "fee",
            "payment",
            "money",
            "charge",
            "refund",
            "billing",
            "scholarship",
        ],
        transport: [
            "transport",
            "bus",
            "vehicle",
            "shuttle",
            "travel",
            "commute",
            "traffic",
        ],
        library: [
            "library",
            "book",
            "resource",
            "reading",
            "study",
            "access",
            "opening",
        ],
        administrative: [
            "office",
            "document",
            "certificate",
            "admission",
            "administration",
            "form",
            "process",
        ],
    };

    let bestCategory = "other";
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const score = keywords.filter((keyword) =>
            lowerText.includes(keyword)
        ).length;

        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    }

    return bestCategory;
};

// Main comprehensive analysis function
export const performCompleteAnalysis = (complaintText, category = null) => {
    if (!complaintText || complaintText.trim().length === 0) {
        return {
            priority: "low",
            sentiment: "neutral",
            keywords: [],
            category: category || "other",
            flags: {
                safety: false,
                urgent: false,
                duplicate: false,
            },
            confidence: 0,
        };
    }

    const sentiment = analyzeSentiment(complaintText);
    const detectedCategory = categorizeComplaint(complaintText, category);
    const priority = analyzePriority(complaintText, sentiment.sentiment);
    const keywords = extractKeywords(complaintText);
    const flags = detectFlags(complaintText, detectedCategory);

    return {
        priority,
        sentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
        keywords,
        category: detectedCategory,
        flags,
        confidence: sentiment.confidence,
    };
};
