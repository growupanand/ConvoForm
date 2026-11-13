// Badge variants for response labels. Kept outside the conversations route so
// shared components can use them without a route-relative import.
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

export const getTemperatureVariant = (temperature: string) => {
  switch (temperature) {
    case "Hot":
      return "customDanger";
    case "Warm":
      return "customWarning";
    case "Cold":
      return "customInfo";
    default:
      return "outline";
  }
};
