
// Define badge variants based on tone and sentiment
export const getToneVariant = (tone: string) => {
    switch (tone) {
        case "formal":
            return "secondary";
        case "casual":
            return "outline";
        case "frustrated":
            return "destructive";
        case "enthusiastic":
            return "customSuccess";
        default:
            return "outline";
    }
};

export const getSentimentVariant = (sentiment: string) => {
    switch (sentiment) {
        case "positive":
            return "customSuccess";
        case "negative":
            return "destructive";
        case "mixed":
            return "secondary";
        default:
            return "outline";
    }
};